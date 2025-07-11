import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { beforeUserCreated, beforeUserSignedIn } from 'firebase-functions/v2/identity';
import { WebhookHandler } from "@liveblocks/node";

import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();
const auth = getAuth();

// Initialize the Webhook class with your secret key
const webhookHandler = new WebhookHandler("whsec_6V/28Hyq6fp03z2Pzmf7Gn+kij2aBIzp");
const liveblocksSecretKey = "sk_dev_nJvd18ul5Mlwc9kWZeYeB-5n5RjLAp0jD7FzQc2rOFpUjA1LdNjcEn0lBEN7BCBx";

// Types for user data
interface UserProfile {
  uid: string;
  email: string;
  name: string;
  username: string;
  //displayName: string;
  usernameLower: string;
  profilePictureUrl: string | null;
  isPro: boolean;
  online: boolean;
  onboarding: {
    profilePicture: boolean;
    username: boolean;
  };
  lastSeen: FirebaseFirestore.Timestamp;
  bibleRoom: {
    invited: string[];
    sharing: boolean;
  };
  biblePersonalization:{
    // "de4e12af7f28f599-02": {    // Bible ID
    //   "REV": {                    // Book ID
    //     "REV.1": {                // Chapter ID
    //       "1": "bg-red-200",    // Verse '1' will be red
    //       "5": "bg-yellow-100",   // Verse '5' will have a yellow background
    //       "12": "bg-blue-200",   // Verse '12' will be blue
    //     }
    //   }
    // }
  }
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  isVerified: boolean;
}

// Define admin/pro emails (consider moving to environment variables)
const ADMIN_EMAILS = ["admin@example.com", "kguerrero0325@gmail.com"];
const PRO_EMAILS = ["pro2@example.com"];

console.log(ADMIN_EMAILS, PRO_EMAILS)

function extractFilePathFromUrl(url: string): string | null {
  try {
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/\/o\/(.+)\?alt=media/);
    return match ? match[1] : null;
  } catch (e) {
    console.error("Failed to parse photoURL:", e);
    return null;
  }
}

const generateUniqueUsername = async (displayName: string, database: Firestore) => {
  // Sanitize: allow only letters, numbers, and underscores
  const sanitizedBase = (displayName || "user")
    .replace(/\s+/g, "")       // Remove spaces
    .replace(/[^a-zA-Z0-9_]/g, "") // Remove invalid characters
    .toLowerCase();

  const maxBaseLength = 8; // Leave room for suffix (e.g., "123123452")
  const baseUsername = sanitizedBase.slice(0, maxBaseLength) || "user";

  let username = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const randomSuffix = Math.floor(100000000000000 + Math.random() * 900000000000000);
    username = `${baseUsername}_${randomSuffix}`; // Use underscore as separator

    // Enforce length < 15
    if (username.length > 15) {
      username = username.slice(0, 15);
    }

    const userSnapshot = await database
      .collection("users")
      .where("usernameLower", "==", username.toLowerCase())
      .get();

    if (userSnapshot.empty) {
      isUnique = true;
    }
    attempts++;
  }

  // Fallback if uniqueness failed
  if (!isUnique) {
    username = `${baseUsername}_${Date.now().toString().slice(-4)}`.slice(0, 15);
  }

  return username;
};

// Trigger when user is created (before they're saved to Firebase Auth)
export const beforeUserCreatedTrigger = beforeUserCreated(async (event) => {
  const user = event.data;
  
  if (!user) {
    throw new HttpsError('invalid-argument', 'User data is required');
  }
  
  // You can add validation here
  if (!user.email) {
    throw new HttpsError('invalid-argument', 'Email is required');
  }
  
  return {
    // You can set custom claims here if needed
    customClaims: {
      role: 'user',
      createdAt: new Date().toISOString(),
    }
  };
});

// Trigger when user signs in (you can add additional checks here)
export const beforeUserSignedInTrigger = beforeUserSignedIn(async (event) => {
  const user = event.data;
  
  if (!user) {
    return;
  }

  // Add any sign-in validation logic here
  console.log(`User ${user.uid} is signing in`);
  
  return;
});

// Trigger when a new user document is created in Firestore
export const onUserCreated = onDocumentCreated('/users/{uid}', async (event) => {
  const userData = event.data?.data();
  const uid = event.params?.uid;
  
  if (!userData || !uid) return;
  
  try {
    // Create username reservation
    await db.collection('usernames').doc(userData.username).set({
      uid: uid,
      createdAt: FirebaseFirestore.Timestamp.now(),
    });
    
    // Create user stats document
    await db.collection('userStats').doc(uid).set({
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
      likesReceived: 0,
      commentsReceived: 0,
      updatedAt: FirebaseFirestore.Timestamp.now(),
    });
    
    console.log(`User profile created successfully for ${uid}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});

// Callable function to create user profile (called from client)
export const createUserProfile = onCall(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { name } = data;

  try {
    const userDocRef = db.collection('users').doc(auth.uid);
    const existingUser = await userDocRef.get();

    // The Fix: If the user already exists, just return successfully.
    if (existingUser.exists) {
      console.log(`User profile for ${auth.uid} already exists. Skipping creation.`);
      return {
        success: true,
        message: 'Profile already exists.',
        user: existingUser.data(),
      };
    }

    const userRecord = await getAuth().getUser(auth.uid);
    if (!userRecord || !userRecord.email) {
      throw new HttpsError('not-found', 'User auth record not found');
    }

    const username = await generateUniqueUsername(userRecord.displayName || name || userRecord.email.split("@")[0], db);

    const userProfile: UserProfile = {
      uid: auth.uid,
      email: userRecord.email || '',
      name: name || userRecord.displayName || "",
      username: username,
      usernameLower: username.toLowerCase(),
      profilePictureUrl: null,
      isPro: false,
      online: true, // Set to true on creation
      onboarding: {
        profilePicture: false,
        username: false,
      },
      lastSeen: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
      bibleRoom: {
        invited: [],
        sharing: false
      },
      biblePersonalization:{
        "de4e12af7f28f599-02": {    // Bible ID
          "REV": {                    // Book ID
            "REV.1": {                // Chapter ID
              "1": "bg-red-200",    // Verse '1' will be red
              "5": "bg-yellow-100",   // Verse '5' will have a yellow background
              "12": "bg-blue-200",   // Verse '12' will be blue
            }
          }
        }
      },
      createdAt: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
      updatedAt: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
      isVerified: false,
    };

    // This will now only run once
    await userDocRef.set(userProfile);

    return {
      success: true,
      message: 'Profile created successfully.',
      user: userProfile,
    };

  } catch (error) {
    console.error('Error in createUserProfile:', error);
    if (error instanceof HttpsError) {
        throw error;
    }
    throw new HttpsError('internal', 'Failed to create user profile');
  }
});

// When user signs up OLDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD BYEEEEEEEEEEEEEEE
// export const onUserCreate = functions.auth.user().onCreate(async (user) => {
//   if (!user?.email || !user?.uid) {
//     console.error("Missing required user data:", {
//       email: user?.email,
//       uid: user?.uid,
//     });
//     return;
//   }

//   try {
//     const isAdmin = ADMIN_EMAILS.includes(user.email);
//     const isPro = isAdmin || PRO_EMAILS.includes(user.email);

//     // Generate the unique username
//     // This will now use the displayName if it's available, or "user" as a fallback.
//     const username = await generateUniqueUsername(user.displayName || user?.email.split("@")[0], db);

//     // Create user document with the new username and isPro flag
//     await db.doc(`users/${user.uid}`).set({
//       uid: user.uid,
//       email: user.email,
//       name: user.displayName || "Unknown", // Your existing fallback works perfectly
//       username: username,
//       usernameLower: username.toLowerCase(),
//       profilePictureUrl: user.photoURL || null,
//       isPro: isPro,
//       online: false,
//       completed_onboarding: false,
//       lastSeen: FieldValue.serverTimestamp(),
//       bibleRoom: {
//         invited: [], // users uid
//         sharing: false // does the user currently want anyone from invited to join in
//       }
//     });

//     console.log(`User document created for ${user.email} with username: ${username} and isPro: ${isPro}`);

//     // Set custom claims for admin and pro users
//     if (isAdmin) {
//       await auth.setCustomUserClaims(user.uid, {
//         role: "admin",
//         isPro: true,
//       });
//       console.log(`Admin custom claims set for ${user.email}`);
//     } else if (isPro) {
//       await auth.setCustomUserClaims(user.uid, {
//         isPro: true,
//       });
//       console.log(`Pro custom claims set for ${user.email}`);
//     }
//   } catch (error) {
//     console.error("Error in onUserCreate function:", error);
//   }
// });

// for my users
export const updateUserProfile = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in to update your profile.");
  }
  const userId = request.auth.uid;
  const { name, dob, newUsername, photoURL, newEmail, newGender, newLanguage } = request.data;

  const userRef = db.doc(`users/${userId}`);
  const updateData: { [key: string]: any } = {};
  let authUpdateData: { [key: string]: any } = {};

  // Get both the Firestore document and the Firebase Auth record
  const [userDoc, userRecord] = await Promise.all([
    userRef.get(),
    auth.getUser(userId)
  ]);
  
  const userData = userDoc.data();
  if (!userData) {
    throw new HttpsError("not-found", "User data not found.");
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  if (name) {
    if (typeof name !== 'string' || name.length === 0 || name.length > 50) {
      throw new HttpsError("invalid-argument", "Name must be a string between 1 and 50 characters.");
    }
    updateData.name = name;
    authUpdateData.displayName = name;
  }

  if (newEmail && newEmail !== userData.email) {
    // Check if the user signed up with email/password
    const isPasswordUser = userRecord.providerData.some(
      (provider) => provider.providerId === 'password'
    );

    if (!isPasswordUser) {
      // If not a password user, block the email change.
      throw new HttpsError(
        "failed-precondition",
        "Cannot change email for accounts created using Google. Please manage your email through your Google account."
      );
    }
    
    // ... rest of the email validation and update logic remains the same
    if (typeof newEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        throw new HttpsError("invalid-argument", "A valid email address is required.");
    }
    try {
        await auth.getUserByEmail(newEmail);
        throw new HttpsError("already-exists", "This email address is already in use.");
    } catch (error: any) {
        if (error.code !== 'auth/user-not-found') {
             if (error instanceof HttpsError) throw error;
             console.error("Error checking email uniqueness:", error);
             throw new HttpsError("internal", "An unexpected error occurred.");
        }
    }
    updateData.email = newEmail;
    updateData.isVerified = false;
    authUpdateData.email = newEmail;
  }

  if (dob) {
    const dobChangeCount = userData.dobChangeCount || 0;
    if (dobChangeCount >= 2) {
      throw new HttpsError("resource-exhausted", "You can only change your date of birth twice.");
    }
    if (typeof dob !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      throw new HttpsError("invalid-argument", "Date of birth must be in YYYY-MM-DD format.");
    }
    updateData.dob = dob;
    updateData.dobChangeCount = FieldValue.increment(1);
  }

  if (newGender) {
    if (typeof newGender !== 'string' || !['Male', 'Female'].includes(newGender)) {
      throw new HttpsError("invalid-argument", "Invalid gender.");
    }
    updateData.gender = newGender;
  }

  if(newLanguage){
    if (typeof newLanguage !== 'string' || !['English', 'Spanish', "French"].includes(newLanguage)) {
      throw new HttpsError("invalid-argument", "Invalid language.");
    }
    updateData.language = newLanguage;
  }

  if (newUsername) {
    if (typeof newUsername !== 'string' || newUsername.length < 3 || newUsername.length > 25) {
      throw new HttpsError("invalid-argument", "Username must be 3–25 characters long.");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      throw new HttpsError("invalid-argument", "Username can only contain letters, numbers, and underscores.");
    }

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentChanges = (userData.usernameChanges || []).filter((ts: number) => ts > sevenDaysAgo);

    if (recentChanges.length >= 2) {
      throw new HttpsError("resource-exhausted", "You can only change your username twice every 7 days.");
    }

    const isUnique = (await db.collection("users").where("usernameLower", "==", newUsername.toLowerCase()).get()).empty;
    if (!isUnique) {
      throw new HttpsError("already-exists", "This username is already taken.");
    }

    updateData.username = newUsername;
    updateData.usernameLower = newUsername.toLowerCase();
    updateData.usernameChanges = FieldValue.arrayUnion(Date.now());
  }

  if (photoURL) {
    if (typeof photoURL !== 'string') {
      throw new HttpsError("invalid-argument", "A valid photoURL is required.");
    }
    if (userData.profilePictureUrl && userData.profilePictureUrl !== photoURL) {
      const filePath = extractFilePathFromUrl(userData.profilePictureUrl);
      if (filePath) {
        try {
          await getStorage().bucket().file(filePath).delete();
        } catch (error) {
          console.error("Failed to delete old profile picture:", error);
        }
      }
    }
    updateData.profilePictureUrl = photoURL;
    authUpdateData.photoURL = photoURL;
  }

  // Commit all updates
  if (Object.keys(updateData).length === 0) {
    return { success: true, message: "No changes were made." };
  }
  
  // Add a timestamp for the update
  updateData.updatedAt = FieldValue.serverTimestamp();

  await userRef.update(updateData);

  if (Object.keys(authUpdateData).length > 0) {
    await auth.updateUser(userId, authUpdateData);
  }

  return { success: true, message: "Profile updated successfully." };
});

// Friend Request Functions
export const sendFriendRequest = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in to send a friend request.");
  }
  const senderId = request.auth.uid;
  const { recipientUsername } = request.data;

  const recipientQuery = await db.collection("users").where("usernameLower", "==", recipientUsername.toLowerCase()).limit(1).get();

  if (recipientQuery.empty) {
    throw new HttpsError("not-found", "Username does not exist.");
  }

  const recipientId = recipientQuery.docs[0].id;

  if (senderId === recipientId) {
    throw new HttpsError("invalid-argument", "You cannot send a friend request to yourself.");
  }

  // Validation: Check if already friends
  const friendDoc = await db.collection("users").doc(senderId).collection("friends").doc(recipientId).get();
  if (friendDoc.exists) {
    throw new HttpsError("already-exists", "You are already friends with this user.");
  }

  // Validation: Check for existing request in either direction
  const requestQuery1 = db.collection("friendRequests").where("from", "==", senderId).where("to", "==", recipientId);
  const requestQuery2 = db.collection("friendRequests").where("from", "==", recipientId).where("to", "==", senderId);
  const [snapshot1, snapshot2] = await Promise.all([requestQuery1.get(), requestQuery2.get()]);

  if (!snapshot1.empty || !snapshot2.empty) {
    throw new HttpsError("already-exists", "A friend request has already been sent.");
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

export const respondToFriendRequest = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }
  const userId = request.auth.uid;
  const { requestId, response } = request.data;

  if (!requestId || (response !== 'accepted' && response !== 'declined')) {
    throw new HttpsError('invalid-argument', 'Invalid request data.');
  }

  const requestRef = db.collection("friendRequests").doc(requestId);
  const requestDoc = await requestRef.get();

  if (!requestDoc.exists || requestDoc.data()?.to !== userId) {
    throw new HttpsError("not-found", "Friend request not found or you are not the recipient.");
  }

  if (response === "accepted") {
    const senderId = requestDoc.data()?.from;
    const batch = db.batch();

    batch.set(db.collection("users").doc(userId).collection("friends").doc(senderId), { createdAt: FieldValue.serverTimestamp() });
    batch.set(db.collection("users").doc(senderId).collection("friends").doc(userId), { createdAt: FieldValue.serverTimestamp() });
    batch.delete(requestRef);

    await batch.commit();
    return { success: true, message: "Friend request accepted." };
  } else { // 'declined'
    await requestRef.delete();
    return { success: true, message: "Friend request declined." };
  }
});

export const removeFriend = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in to remove a friend.");
  }
  const userId = request.auth.uid;
  const { friendId } = request.data;

  if (!friendId) {
    throw new HttpsError("invalid-argument", "Friend ID is required.");
  }

if (userId === friendId) {
      throw new HttpsError("invalid-argument", "You cannot remove yourself as a friend.");
  }

  const userRef = db.collection("users").doc(userId);
  const friendRef = db.collection("users").doc(friendId);
  const userFriendRef = userRef.collection("friends").doc(friendId);
  const friendUserRef = friendRef.collection("friends").doc(userId);

  const batch = db.batch();

  batch.delete(userFriendRef);
  batch.delete(friendUserRef);

  batch.update(userRef, { 
    'bibleRoom.invited': FieldValue.arrayRemove(friendId) 
  });

  batch.update(friendRef, { 
    'bibleRoom.invited': FieldValue.arrayRemove(userId) 
  });

  await batch.commit();

  return { success: true, message: "Friend removed successfully and uninvited from Bible Room." };
});

export const cancelFriendRequest = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }
  const userId = request.auth.uid;
  const { requestId } = request.data;

  if (!requestId) {
    throw new HttpsError("invalid-argument", "Request ID is required.");
  }

  const requestRef = db.collection("friendRequests").doc(requestId);
  const requestDoc = await requestRef.get();

  if (!requestDoc.exists) {
    throw new HttpsError("not-found", "Friend request not found.");
  }

  if (requestDoc.data()?.from !== userId) {
    throw new HttpsError("permission-denied", "You do not have permission to cancel this friend request.");
  }

  await requestRef.delete();
  return { success: true, message: "Friend request canceled." };
});

// JAM
export const createJam = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in to create a jam.");
  }
  const userId = request.auth.uid;

  const newJamRef = db.collection("jams").doc();
  await newJamRef.set({
    title: "Untitled",
    thumbnailURL: "",
    authorId: userId,
    createdAt: FieldValue.serverTimestamp(),
    lastModified: FieldValue.serverTimestamp(),
    content: "{}",
    isPublic: false,
    publicAccess: "viewer",
    permissions: {
      [userId]: "owner",
    },
  });

  return { success: true, jamId: newJamRef.id };
});

export const manageJamPermissions = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }
  const callerId = request.auth.uid;
  const { jamId, targetUsername, role } = request.data; // role: 'editor', 'viewer', or 'remove'

  if (!jamId || !targetUsername || !role) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  const jamRef = db.collection("jams").doc(jamId);
  const jamDoc = await jamRef.get();

  if (!jamDoc.exists) {
    throw new HttpsError("not-found", "Jam not found.");
  }

  const permissions = jamDoc.data()?.permissions || {};
  if (permissions[callerId] !== 'owner') {
    throw new HttpsError("permission-denied", "You must be the owner to manage permissions.");
  }

  const userQuery = await db.collection("users").where("usernameLower", "==", targetUsername.toLowerCase()).limit(1).get();
  if (userQuery.empty) {
    throw new HttpsError("not-found", `User '${targetUsername}' not found.`);
  }
  const targetUserId = userQuery.docs[0].id;

  if (callerId === targetUserId) {
    throw new HttpsError("invalid-argument", "You cannot change your own role.");
  }

  const fieldPath = `permissions.${targetUserId}`;
  if (role === 'remove') {
    await jamRef.update({ [fieldPath]: FieldValue.delete() });
  } else {
    await jamRef.update({ [fieldPath]: role });
  }

  return { success: true, message: `Permissions updated for ${targetUsername}.` };
});


// Bible Room
export const manageBibleRoomInvite = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }
  const callerId = request.auth.uid;
  const { friendId, action } = request.data; // action: 'invite' or 'uninvite'

  if (!friendId || !['invite', 'uninvite'].includes(action)) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  // Security Check: Verify target user is a friend
  const friendDoc = await db.collection("users").doc(callerId).collection("friends").doc(friendId).get();
  if (!friendDoc.exists) {
    throw new HttpsError("permission-denied", "You can only invite users from your friends list.");
  }

  const userRef = db.doc(`users/${callerId}`);
  const updatePayload = {
    'bibleRoom.invited': action === 'invite' ? FieldValue.arrayUnion(friendId) : FieldValue.arrayRemove(friendId)
  };

  await userRef.update(updatePayload);
  return { success: true, message: `User ${action === 'invite' ? 'invited' : 'removed'} successfully.` };
});


export const setBibleRoomSharing = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }
  const callerId = request.auth.uid;
  const { sharing } = request.data;

  if (typeof sharing !== 'boolean') {
    throw new HttpsError("invalid-argument", "The 'sharing' field must be a boolean.");
  }

  const userRef = db.doc(`users/${callerId}`);
  await userRef.update({ 'bibleRoom.sharing': sharing });

  return { success: true, message: `Bible room sharing status updated to ${sharing}.` };
});

// Liveblocks Bible Room Handler DEMO
export const liveblocksBibleRoomHandler = onRequest(async (request, response) => {
  let event;

  try {
    event = webhookHandler.verifyRequest({
      headers: request.headers,
      rawBody: JSON.stringify(request.body),
    });
  } catch (error) {
    console.error("Webhook verification failed:", error);
    response.status(400).send("Webhook verification failed.");
    return;
  }

  if (!event) {
    console.error("No event received from Liveblocks.");
    response.status(400).send("No event received from Liveblocks.");
    return;
  }

  console.log(`Received event: ${event.type}`);

  if (event.type === "userLeft") {
    const { roomId, userId } = event.data;
    const ownerId = roomId.replace("bible:", "");

    if (userId === ownerId){
      console.log(`Owner ${ownerId} has left their Bible Room. Closing the room.`);

      const deleteRoomUrl = `https://api.liveblocks.io/v2/rooms/${roomId}`;

      try {
        // 2. Create a promise to delete the Liveblocks room
        const deleteRoomPromise = fetch(deleteRoomUrl, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${liveblocksSecretKey}` },
        });

        const ownerRef = db.collection("users").doc(ownerId);
        const firestorePromise = ownerRef.update({
          "bibleRoom.sharing": false,
        });

        const [deleteResponse] = await Promise.all([deleteRoomPromise, firestorePromise]);

        if (deleteResponse.ok) {
          console.log(`Successfully deleted room ${roomId}, disconnecting all users.`);
        } else {
          // Log an error if the room deletion fails, but don't crash
          console.error(`Failed to delete room ${roomId}. Status: ${deleteResponse.status}`);
        }

        console.log(`Successfully processed leave event and reset owner's sharing status.`);

      } catch (error) {
        console.error(`Error processing owner-left event for room ${roomId}:`, error);
        response.status(200).send("Acknowledged, but internal error occurred.");
        return;
      }
    }
  }

  response.status(200).end();
});