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
  try {
    const senderId = context.auth?.uid;
    if (!senderId) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to send a friend request."
      );
    }

    const { recipientEmail } = data;
    if (typeof recipientEmail !== 'string' || !recipientEmail) {
        throw new functions.https.HttpsError('invalid-argument', 'A valid email is required.');
    }

    // Find the recipient user by email
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

    const recipientId = recipientQuery.docs[0].id;

    if (senderId === recipientId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You cannot send a friend request to yourself."
      );
    }

    // Check if they are already friends
    const friendshipDoc = await db.collection('users').doc(senderId).collection('friends').doc(recipientId).get();
    if(friendshipDoc.exists) {
        throw new functions.https.HttpsError('already-exists', 'You are already friends with this user.');
    }

    // Check for an existing pending request
    const existingRequestQuery = await db.collection('friendRequests')
      .where('from', '==', senderId)
      .where('to', '==', recipientId)
      .where('status', '==', 'pending').get();

    if (!existingRequestQuery.empty) {
        throw new functions.https.HttpsError('already-exists', 'You have already sent a request to this user.');
    }
    
    // Check for a pending request from the other user
    const incomingRequestQuery = await db.collection('friendRequests')
      .where('from', '==', recipientId)
      .where('to', '==', senderId)
      .where('status', '==', 'pending').get();

    if (!incomingRequestQuery.empty) {
        throw new functions.https.HttpsError('already-exists', 'This user has already sent you a friend request. Please accept or decline it.');
    }

    // Create the friend request document
    const friendRequestRef = db.collection("friendRequests").doc();
    await friendRequestRef.set({
      from: senderId,
      to: recipientId,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Friend request sent successfully." };
  } catch (error: any) {
    // Log the detailed error on the server
    console.error("Error in sendFriendRequest:", error);
    
    // If it's an error we threw intentionally, rethrow it
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // For any other unexpected errors, throw a generic 'internal' error
    throw new functions.https.HttpsError("internal", "An unexpected error occurred.");
  }
});


export const respondToFriendRequest = functions.https.onCall(
  async (data, context) => {
    const userId = context.auth?.uid;
    const { requestId, response } = data; // response can be 'accepted' or 'declined'

    if (!userId) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to respond to a friend request."
      );
    }

    const requestRef = db.collection("friendRequests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists || requestDoc.data()?.to !== userId) {
      throw new functions.https.HttpsError(
        "not-found",
        "Friend request not found."
      );
    }

    if (response === "accepted") {
      const senderId = requestDoc.data()?.from;
      const batch = db.batch();
      batch.update(requestRef, { status: "accepted" });
      batch.set(db.collection("users").doc(userId).collection("friends").doc(senderId),{});
      batch.set(db.collection("users").doc(senderId).collection("friends").doc(userId),{});
      await batch.commit();
    } else {
      await requestRef.update({ status: "declined" });
    }

    return { success: true };
  }
);