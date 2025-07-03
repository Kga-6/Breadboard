import * as functions from "firebase-functions/v1";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initializeApp();

const db = getFirestore();

// Define admin/pro emails (consider moving to environment variables)
const ADMIN_EMAILS = ["admin@example.com"];
const PRO_EMAILS = ["pro@example.com"];

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  // Validate required user data
  if (!user?.email || !user?.uid) {
    console.error("Missing required user data:", { 
      email: user?.email, 
      uid: user?.uid 
    });
    return;
  }

  try {
    const isAdmin = ADMIN_EMAILS.includes(user.email);
    const isPro = isAdmin || PRO_EMAILS.includes(user.email);

    // Create user document with isPro flag
    await db.doc(`users/${user.uid}`).set({
      uid: user.uid,
      email: user.email,
      name: user.displayName || "New User",
      photoURL: user.photoURL || null,
      isPro: isPro,
      online: false,
      lastSeen: FieldValue.serverTimestamp(),
    });

    console.log(`User document created for ${user.email} with isPro: ${isPro}`);

    // Set custom claims for admin users
    if (isAdmin) {
      await getAuth().setCustomUserClaims(user.uid, { 
        role: "admin",
        isPro: true 
      });
      console.log(`Admin custom claims set for ${user.email}`);
    } else if (isPro) {
      await getAuth().setCustomUserClaims(user.uid, { 
        isPro: true 
      });
      console.log(`Pro custom claims set for ${user.email}`);
    }

  } catch (error) {
    console.error("Error in onUserCreate function:", error);
    // Optionally re-throw to trigger retries
    // throw error;
  }
});

// Friend Request Functions
export const sendFriendRequest = functions.https.onCall(async (data, context) => {
  const senderId = context.auth?.uid;
  const { recipientEmail } = data;

  if (!senderId) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to send a friend request."
    );
  }

  const recipientQuery = await db
    .collection("users")
    .where("email", "==", recipientEmail)
    .limit(1)
    .get();

  if (recipientQuery.empty) {
    throw new functions.https.HttpsError(
      "not-found",
      "User with that email does not exist."
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