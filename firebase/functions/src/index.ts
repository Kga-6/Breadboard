import * as functions from "firebase-functions/v1";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Firestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initializeApp();

const db = getFirestore();

// Define admin/pro emails (consider moving to environment variables)
const ADMIN_EMAILS = ["admin@example.com","Kguerrero0325@gmail.com"];
const PRO_EMAILS = ["pro2@example.com"];

const generateUniqueUsername = async (displayName:string, database: Firestore) => {
  // Use the display name or 'user' as a base, remove spaces, and convert to lowercase
  const baseUsername = (displayName || "user").replace(/\s/g, "").toLowerCase();
  let username = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) { // Limit attempts to prevent infinite loops
    // Append a random 6-digit number
    const randomSuffix = Math.floor(10000000000000 + Math.random() * 90000000000000);
    username = `${baseUsername}${randomSuffix}`;

    // Check if the username already exists in the 'users' collection
    const userSnapshot = await database.collection("users").where("username", "==", username).get();
    if (userSnapshot.empty) {
      isUnique = true;
    }
    attempts++;
  }

  // Fallback in the rare case of 10 collisions
  if (!isUnique) {
    username = `${baseUsername}${Date.now()}`;
  }

  return username;
};

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  // **FIXED**: displayName is no longer required here.
  if (!user?.email || !user?.uid) {
    console.error("Missing required user data:", {
      email: user?.email,
      uid: user?.uid,
    });
    return;
  }

  try {
    const isAdmin = ADMIN_EMAILS.includes(user.email);
    const isPro = isAdmin || PRO_EMAILS.includes(user.email);

    // Generate the unique username
    // This will now use the displayName if it's available, or "user" as a fallback.
    const username = await generateUniqueUsername(user.displayName || "user", db);

    // Create user document with the new username and isPro flag
    await db.doc(`users/${user.uid}`).set({
      uid: user.uid,
      email: user.email,
      name: user.displayName || "Unknown", // Your existing fallback works perfectly
      username: username,
      profilePictureUrl: user.photoURL || null,
      isPro: isPro,
      online: false,
      lastSeen: FieldValue.serverTimestamp(),
    });

    console.log(`User document created for ${user.email} with username: ${username} and isPro: ${isPro}`);

    // Set custom claims for admin and pro users
    if (isAdmin) {
      await getAuth().setCustomUserClaims(user.uid, {
        role: "admin",
        isPro: true,
      });
      console.log(`Admin custom claims set for ${user.email}`);
    } else if (isPro) {
      await getAuth().setCustomUserClaims(user.uid, {
        isPro: true,
      });
      console.log(`Pro custom claims set for ${user.email}`);
    }
  } catch (error) {
    console.error("Error in onUserCreate function:", error);
  }
});

// Friend Request Functions
export const sendFriendRequest = functions.https.onCall(async (data, context) => {
  const senderId = context.auth?.uid;
  const { recipientUsername } = data;

  if (!senderId) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to send a friend request."
    );
  }

  const recipientQuery = await db
    .collection("users")
    .where("username", "==", recipientUsername)
    .limit(1)
    .get();

  if (recipientQuery.empty) {
    throw new functions.https.HttpsError(
      "not-found",
      "Username does not exist."
    );
  }

  const recipient = recipientQuery.docs[0];
  const recipientId = recipient.id;

  if (senderId === recipientId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "You cannot send a friend request to yourself."
    );
  }

  // ------------------------------------------------------------------
  // --- START: NEW VALIDATION LOGIC ---
  // ------------------------------------------------------------------

  // 1. Check if they are already friends
  const friendDoc = await db
    .collection("users")
    .doc(senderId)
    .collection("friends")
    .doc(recipientId)
    .get();

  if (friendDoc.exists) {
    throw new functions.https.HttpsError(
      "already-exists",
      "You are already friends with this user."
    );
  }

  // 2. Check for an existing request in either direction
  const requestQuery1 = db
    .collection("friendRequests")
    .where("from", "==", senderId)
    .where("to", "==", recipientId);
    
  const requestQuery2 = db
    .collection("friendRequests")
    .where("from", "==", recipientId)
    .where("to", "==", senderId);

  const [snapshot1, snapshot2] = await Promise.all([
    requestQuery1.get(),
    requestQuery2.get(),
  ]);

  if (!snapshot1.empty || !snapshot2.empty) {
    throw new functions.https.HttpsError(
      "already-exists",
      "A friend request has already been sent."
    );
  }

  // ------------------------------------------------------------------
  // --- END: NEW VALIDATION LOGIC ---
  // ------------------------------------------------------------------

  const friendRequestRef = db.collection("friendRequests").doc();
  await friendRequestRef.set({
    from: senderId,
    to: recipientId,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return { success: true };
});

export const respondToFriendRequest = functions.https.onCall(
  async (data, context) => {
    const userId = context.auth?.uid;
    if (!userId) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in."
      );
    }

    const { requestId, response } = data;
    if (!requestId || (response !== 'accepted' && response !== 'declined')) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid request data.');
    }

    const requestRef = db.collection("friendRequests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists || requestDoc.data()?.to !== userId) {
      throw new functions.https.HttpsError(
        "not-found",
        "Friend request not found or you are not the recipient."
      );
    }

    // THE FIX: The Cloud Function now handles all database writes.
    if (response === "accepted") {
      const senderId = requestDoc.data()?.from;
      const batch = db.batch();

      // Add each user to the other's friends subcollection
      batch.set(db.collection("users").doc(userId).collection("friends").doc(senderId), { createdAt: FieldValue.serverTimestamp() });
      batch.set(db.collection("users").doc(senderId).collection("friends").doc(userId), { createdAt: FieldValue.serverTimestamp() });
      
      // Delete the request document now that it's been handled
      batch.delete(requestRef);
      
      await batch.commit();
      return { success: true, message: "Friend request accepted." };
    } else { // 'declined'
      // If declined, just delete the request.
      await requestRef.delete();
      return { success: true, message: "Friend request declined." };
    }
  }
);

export const removeFriend = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  const { friendId } = data;

  if (!userId) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to remove a friend."
    );
  }

  if (!friendId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Friend ID is required."
    );
  }

  const batch = db.batch();

  // Delete the friend from both users' friends subcollections
  const userFriendRef = db.collection("users").doc(userId).collection("friends").doc(friendId);
  const friendUserRef = db.collection("users").doc(friendId).collection("friends").doc(userId);

  batch.delete(userFriendRef);
  batch.delete(friendUserRef);

  await batch.commit();

  return { success: true, message: "Friend removed successfully." };
});

export const cancelFriendRequest = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  const { requestId } = data;

  if (!userId) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in."
    );
  }

  if (!requestId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Request ID is required."
    );
  }

  const requestRef = db.collection("friendRequests").doc(requestId);
  const requestDoc = await requestRef.get();

  if (!requestDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Friend request not found.");
  }

  // Security Check: Only the sender can cancel the request.
  if (requestDoc.data()?.from !== userId) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You do not have permission to cancel this friend request."
    );
  }

  await requestRef.delete();

  return { success: true, message: "Friend request canceled." };
});

// JAM
export const createJam = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;

  if (!userId) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to create a jam."
    );
  }

  const newJamRef = await db.collection("jams").add({
    name: "Untitled Jam",
    authorId: userId,
    createdAt: FieldValue.serverTimestamp(),
    lastModified: FieldValue.serverTimestamp(),
    content: "{}", // Start with empty content
    isPublic: false,
    sharedWith: [], // Initially shared with no one
  });

  return { success: true, jamId: newJamRef.id };
});