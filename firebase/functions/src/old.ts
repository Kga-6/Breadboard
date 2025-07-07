// import * as functions from "firebase-functions/v1";
// import { initializeApp } from "firebase-admin/app";
// import { getFirestore, FieldValue, Firestore } from "firebase-admin/firestore";
// import { getStorage } from "firebase-admin/storage";
// import { getAuth } from "firebase-admin/auth";

// initializeApp();

// const db = getFirestore();

// // Define admin/pro emails (consider moving to environment variables)
// const ADMIN_EMAILS = ["admin@example.com","kguerrero0325@gmail.com"];
// const PRO_EMAILS = ["pro2@example.com"];

// function extractFilePathFromUrl(url: string): string | null {
//   try {
//     const decodedUrl = decodeURIComponent(url);
//     const match = decodedUrl.match(/\/o\/(.+)\?alt=media/);
//     return match ? match[1] : null;
//   } catch (e) {
//     console.error("Failed to parse photoURL:", e);
//     return null;
//   }
// }

// const generateUniqueUsername = async (displayName: string, database: Firestore) => {
//   // Sanitize: allow only letters, numbers, and underscores
//   const sanitizedBase = (displayName || "user")
//     .replace(/\s+/g, "")         // Remove spaces
//     .replace(/[^a-zA-Z0-9_]/g, "") // Remove invalid characters
//     .toLowerCase();

//   const maxBaseLength = 8; // Leave room for suffix (e.g., "123123452")
//   const baseUsername = sanitizedBase.slice(0, maxBaseLength) || "user";

//   let username = "";
//   let isUnique = false;
//   let attempts = 0;

//   while (!isUnique && attempts < 10) {
//     const randomSuffix = Math.floor(100000000000000 + Math.random() * 900000000000000);
//     username = `${baseUsername}_${randomSuffix}`; // Use underscore as separator

//     // Enforce length < 15
//     if (username.length > 15) {
//       username = username.slice(0, 15);
//     }

//     const userSnapshot = await database
//       .collection("users")
//       .where("usernameLower", "==", username.toLowerCase())
//       .get();

//     if (userSnapshot.empty) {
//       isUnique = true;
//     }
//     attempts++;
//   }

//   // Fallback if uniqueness failed
//   if (!isUnique) {
//     username = `${baseUsername}_${Date.now().toString().slice(-4)}`.slice(0, 15);
//   }

//   return username;
// };

// // When user signs up
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
//       await getAuth().setCustomUserClaims(user.uid, {
//         role: "admin",
//         isPro: true,
//       });
//       console.log(`Admin custom claims set for ${user.email}`);
//     } else if (isPro) {
//       await getAuth().setCustomUserClaims(user.uid, {
//         isPro: true,
//       });
//       console.log(`Pro custom claims set for ${user.email}`);
//     }
//   } catch (error) {
//     console.error("Error in onUserCreate function:", error);
//   }
// });

// // for my users
// export const updateUserProfile = functions.https.onCall(async (data, context) => {
//     const userId = context.auth?.uid;
//     if (!userId) {
//         throw new functions.https.HttpsError("unauthenticated", "You must be logged in to update your profile.");
//     }

//     const { name, dob, newUsername, photoURL } = data;
//     const userRef = db.doc(`users/${userId}`);
//     const updateData: { [key: string]: any } = {};
//     let authUpdateData: { [key: string]: any } = {};

//     const userDoc = await userRef.get();
//     const userData = userDoc.data();
//     if (!userData) {
//         throw new functions.https.HttpsError("not-found", "User data not found.");
//     }

//     // 1. Handle Display Name Update (if provided)
//     if (name) {
//         if (typeof name !== 'string' || name.length === 0 || name.length > 50) {
//             throw new functions.https.HttpsError("invalid-argument", "Name must be a string between 1 and 50 characters.");
//         }
//         updateData.name = name;
//         authUpdateData.displayName = name;
//     }

//     // 2. Handle Date of Birth Update (if provided)
//     if (dob) {
//         const dobChangeCount = userData.dobChangeCount || 0;
//         if (dobChangeCount >= 2) {
//             throw new functions.https.HttpsError("resource-exhausted", "You can only change your date of birth twice.");
//         }
//         if (typeof dob !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
//             throw new functions.https.HttpsError("invalid-argument", "Date of birth must be in YYYY-MM-DD format.");
//         }
//         updateData.dob = dob;
//         updateData.dobChangeCount = FieldValue.increment(1);
//     }

//     // 3. Handle Username Update (if provided)
//     if (newUsername) {
//         // ... (all username validation logic remains the same)
//         if (typeof newUsername !== 'string' || newUsername.length < 3 || newUsername.length > 25) {
//             throw new functions.https.HttpsError("invalid-argument", "Username must be 3–25 characters long.");
//         }
        
//         if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
//             throw new functions.https.HttpsError("invalid-argument", "Username can only contain letters, numbers, and underscores.");
//         }

//         const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
//         const recentChanges = (userData.usernameChanges || []).filter((ts: number) => ts > sevenDaysAgo);

//         if (recentChanges.length >= 2) {
//             throw new functions.https.HttpsError("resource-exhausted", "You can only change your username twice every 7 days.");
//         }

//         const isUnique = (await db
//           .collection("users")
//           .where("usernameLower", "==", newUsername.toLowerCase())
//           .get()).empty;

//         if (!isUnique) {
//           throw new functions.https.HttpsError("already-exists", "This username is already taken.");
//         }

//         updateData.username = newUsername;
//         updateData.usernameLower = newUsername.toLowerCase();
//         updateData.usernameChanges = FieldValue.arrayUnion(Date.now());
//     }

//     // 4. Handle Profile Picture Update (if provided)
//     if (photoURL) {
//         // ... (all photoURL validation and deletion logic remains the same)
//         if (!photoURL || typeof photoURL !== 'string') {
//             throw new functions.https.HttpsError("invalid-argument", "A valid photoURL is required.");
//         }
//         if (userData.profilePictureUrl && userData.profilePictureUrl !== photoURL) {
//             const filePath = extractFilePathFromUrl(userData.profilePictureUrl);
//             if (filePath) {
//                 try {
//                     await getStorage().bucket().file(filePath).delete();
//                 } catch (error) {
//                     console.error("Failed to delete old profile picture:", error);
//                 }
//             }
//         }
//         updateData.profilePictureUrl = photoURL;
//         authUpdateData.photoURL = photoURL;
//     }

//     // 5. Commit all updates ONLY if there are any changes
//     if (Object.keys(updateData).length === 0) {
//         return { success: true, message: "No changes were made." };
//     }
    
//     await userRef.update(updateData);

//     if (Object.keys(authUpdateData).length > 0) {
//         await getAuth().updateUser(userId, authUpdateData);
//     }

//     return { success: true, message: "Profile updated successfully." };
// });

// // Friend Request Functions
// export const sendFriendRequest = functions.https.onCall(async (data, context) => {
//   const senderId = context.auth?.uid;
//   const { recipientUsername } = data;

//   if (!senderId) {
//     throw new functions.https.HttpsError(
//       "unauthenticated",
//       "You must be logged in to send a friend request."
//     );
//   }

//   const recipientQuery = await db
//     .collection("users")
//     .where("usernameLower", "==", recipientUsername.toLowerCase())
//     .limit(1)
//     .get();

//   if (recipientQuery.empty) {
//     throw new functions.https.HttpsError(
//       "not-found",
//       "Username does not exist."
//     );
//   }

//   const recipient = recipientQuery.docs[0];
//   const recipientId = recipient.id;

//   if (senderId === recipientId) {
//     throw new functions.https.HttpsError(
//       "invalid-argument",
//       "You cannot send a friend request to yourself."
//     );
//   }

//   // ------------------------------------------------------------------
//   // --- START: NEW VALIDATION LOGIC ---
//   // ------------------------------------------------------------------

//   // 1. Check if they are already friends
//   const friendDoc = await db
//     .collection("users")
//     .doc(senderId)
//     .collection("friends")
//     .doc(recipientId)
//     .get();

//   if (friendDoc.exists) {
//     throw new functions.https.HttpsError(
//       "already-exists",
//       "You are already friends with this user."
//     );
//   }

//   // 2. Check for an existing request in either direction
//   const requestQuery1 = db
//     .collection("friendRequests")
//     .where("from", "==", senderId)
//     .where("to", "==", recipientId);
    
//   const requestQuery2 = db
//     .collection("friendRequests")
//     .where("from", "==", recipientId)
//     .where("to", "==", senderId);

//   const [snapshot1, snapshot2] = await Promise.all([
//     requestQuery1.get(),
//     requestQuery2.get(),
//   ]);

//   if (!snapshot1.empty || !snapshot2.empty) {
//     throw new functions.https.HttpsError(
//       "already-exists",
//       "A friend request has already been sent."
//     );
//   }

//   // ------------------------------------------------------------------
//   // --- END: NEW VALIDATION LOGIC ---
//   // ------------------------------------------------------------------

//   const friendRequestRef = db.collection("friendRequests").doc();
//   await friendRequestRef.set({
//     from: senderId,
//     to: recipientId,
//     status: "pending",
//     createdAt: new Date().toISOString(),
//   });

//   return { success: true };
// });

// export const respondToFriendRequest = functions.https.onCall(
//   async (data, context) => {
//     const userId = context.auth?.uid;
//     if (!userId) {
//       throw new functions.https.HttpsError(
//         "unauthenticated",
//         "You must be logged in."
//       );
//     }

//     const { requestId, response } = data;
//     if (!requestId || (response !== 'accepted' && response !== 'declined')) {
//         throw new functions.https.HttpsError('invalid-argument', 'Invalid request data.');
//     }

//     const requestRef = db.collection("friendRequests").doc(requestId);
//     const requestDoc = await requestRef.get();

//     if (!requestDoc.exists || requestDoc.data()?.to !== userId) {
//       throw new functions.https.HttpsError(
//         "not-found",
//         "Friend request not found or you are not the recipient."
//       );
//     }

//     // THE FIX: The Cloud Function now handles all database writes.
//     if (response === "accepted") {
//       const senderId = requestDoc.data()?.from;
//       const batch = db.batch();

//       // Add each user to the other's friends subcollection
//       batch.set(db.collection("users").doc(userId).collection("friends").doc(senderId), { createdAt: FieldValue.serverTimestamp() });
//       batch.set(db.collection("users").doc(senderId).collection("friends").doc(userId), { createdAt: FieldValue.serverTimestamp() });
      
//       // Delete the request document now that it's been handled
//       batch.delete(requestRef);
      
//       await batch.commit();
//       return { success: true, message: "Friend request accepted." };
//     } else { // 'declined'
//       // If declined, just delete the request.
//       await requestRef.delete();
//       return { success: true, message: "Friend request declined." };
//     }
//   }
// );

// export const removeFriend = functions.https.onCall(async (data, context) => {
//   const userId = context.auth?.uid;
//   const { friendId } = data;

//   if (!userId) {
//     throw new functions.https.HttpsError(
//       "unauthenticated",
//       "You must be logged in to remove a friend."
//     );
//   }

//   if (!friendId) {
//     throw new functions.https.HttpsError(
//       "invalid-argument",
//       "Friend ID is required."
//     );
//   }

//   const batch = db.batch();

//   // Delete the friend from both users' friends subcollections
//   const userFriendRef = db.collection("users").doc(userId).collection("friends").doc(friendId);
//   const friendUserRef = db.collection("users").doc(friendId).collection("friends").doc(userId);

//   batch.delete(userFriendRef);
//   batch.delete(friendUserRef);

//   await batch.commit();

//   return { success: true, message: "Friend removed successfully." };
// });

// export const cancelFriendRequest = functions.https.onCall(async (data, context) => {
//   const userId = context.auth?.uid;
//   const { requestId } = data;

//   if (!userId) {
//     throw new functions.https.HttpsError(
//       "unauthenticated",
//       "You must be logged in."
//     );
//   }

//   if (!requestId) {
//     throw new functions.https.HttpsError(
//       "invalid-argument",
//       "Request ID is required."
//     );
//   }

//   const requestRef = db.collection("friendRequests").doc(requestId);
//   const requestDoc = await requestRef.get();

//   if (!requestDoc.exists) {
//     throw new functions.https.HttpsError("not-found", "Friend request not found.");
//   }

//   // Security Check: Only the sender can cancel the request.
//   if (requestDoc.data()?.from !== userId) {
//     throw new functions.https.HttpsError(
//       "permission-denied",
//       "You do not have permission to cancel this friend request."
//     );
//   }

//   await requestRef.delete();

//   return { success: true, message: "Friend request canceled." };
// });

// // JAM
// export const createJam = functions.https.onCall(async (data, context) => {
//   const userId = context.auth?.uid;
  
//   if (!userId) {
//     throw new functions.https.HttpsError(
//       "unauthenticated",
//       "You must be logged in to create a jam."
//     );
//   }

//   const newJamRef = db.collection("jams").doc();

//   await newJamRef.set({
//     title: "Untitled",
//     thumbnailURL: "",
//     authorId: userId, // Keep authorId for reference
//     createdAt: FieldValue.serverTimestamp(),
//     lastModified: FieldValue.serverTimestamp(),
//     content: "{}", // Start with empty content
//     isPublic: false,
//     publicAccess: "viewer", // Default public access role
//     permissions: {
//       [userId]: "owner", // Set creator as owner in the map
//     },
//   });

//   return {
//     success: true,
//     jamId: newJamRef.id
//   };
// });

// export const manageJamPermissions = functions.https.onCall(async (data, context) => {
//   const callerId = context.auth?.uid;
//   const {
//     jamId,
//     targetUsername,
//     role
//   } = data; // role can be 'editor', 'viewer', or 'remove'

//   if (!callerId) {
//     throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
//   }
//   if (!jamId || !targetUsername || !role) {
//     throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
//   }

//   const jamRef = db.collection("jams").doc(jamId);
//   const jamDoc = await jamRef.get();

//   if (!jamDoc.exists) {
//     throw new functions.https.HttpsError("not-found", "Jam not found.");
//   }

//   const permissions = jamDoc.data()?.permissions || {};
//   if (permissions[callerId] !== 'owner') {
//     throw new functions.https.HttpsError("permission-denied", "You must be the owner to manage permissions.");
//   }

//   const userQuery = await db.collection("users").where("usernameLower", "==", targetUsername.toLowerCase()).limit(1).get();
//   if (userQuery.empty) {
//     throw new functions.https.HttpsError("not-found", `User '${targetUsername}' not found.`);
//   }
//   const targetUserId = userQuery.docs[0].id;

//   if (callerId === targetUserId) {
//     throw new functions.https.HttpsError("invalid-argument", "You cannot change your own role.");
//   }

//   const fieldPath = `permissions.${targetUserId}`;

//   if (role === 'remove') {
//     await jamRef.update({
//       [fieldPath]: FieldValue.delete(),
//     });
//   } else {
//     await jamRef.update({
//       [fieldPath]: role,
//     });
//   }

//   return {
//     success: true,
//     message: `Permissions updated for ${targetUsername}.`
//   };
// });

// // Bible Room
// export const manageBibleRoomInvite = functions.https.onCall(async (data, context) => {
//   const callerId = context.auth?.uid;
//   const { friendId, action } = data; // action can be 'invite' or 'uninvite'

//   if (!callerId) {
//     throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
//   }

//   if (!friendId || !['invite', 'uninvite'].includes(action)) {
//     throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
//   }

//   // --- CRUCIAL SECURITY CHECK ---
//   // Verify that the target user is actually a friend of the caller.
//   const friendDoc = await db.collection("users").doc(callerId).collection("friends").doc(friendId).get();
//   if (!friendDoc.exists) {
//     throw new functions.https.HttpsError("permission-denied", "You can only invite users from your friends list.");
//   }

//   const userRef = db.doc(`users/${callerId}`);
//   const updatePayload = {
//     'bibleRoom.invited': action === 'invite' ? FieldValue.arrayUnion(friendId) : FieldValue.arrayRemove(friendId)
//   };

//   await userRef.update(updatePayload);

//   return { success: true, message: `User ${action === 'invite' ? 'invited' : 'removed'} successfully.` };
// });


// export const setBibleRoomSharing = functions.https.onCall(async (data, context) => {
//   const callerId = context.auth?.uid;
//   const { sharing } = data; // sharing should be a boolean

//   if (!callerId) {
//     throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
//   }

//   if (typeof sharing !== 'boolean') {
//     throw new functions.https.HttpsError("invalid-argument", "The 'sharing' field must be a boolean.");
//   }

//   const userRef = db.doc(`users/${callerId}`);
//   await userRef.update({ 'bibleRoom.sharing': sharing });

//   if (sharing === false) {
//     // Optional: If you want to clear the invited list when sharing is turned off
//     // await userRef.update({ 'bibleRoom.invited': [] });
//   }

//   return { success: true, message: `Bible room sharing status updated to ${sharing}.` };
// });

