"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ref, uploadBytes, getDownloadURL, } from "firebase/storage";
import { 
  updateProfile , 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onIdTokenChanged, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  linkWithPopup,
  linkWithRedirect,
  unlink,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth, firestore, functions, storage  } from "../../../firebase/client";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  serverTimestamp,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

// [ TYPES ] //
import { UserTypes, FriendTypes, FriendRequestTypes, JamTypes } from "@/types";

export function getAuthToken():string | undefined {
  return Cookies.get("firebaseIdToken");
}

export function setAuthToken(token: string):string | undefined {
  return Cookies.set("firebaseIdToken", token, {secure:true});
}

export function removeAuthToken(): void {
  return Cookies.remove("firebaseIdToken");
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserTypes | null;
  isAdmin: boolean;
  isPro: boolean;
  loading: boolean;
  friends: FriendTypes[];
  sentRequests: FriendRequestTypes[];
  receivedRequests: FriendRequestTypes[];
  jams: JamTypes[];
  manageJamPermissions: (jamId: string, targetUsername: string, role: 'editor' | 'viewer' | 'remove') => Promise < void > ;
  createJam: () => Promise<string | null>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<{ success: boolean; msg?: string }>;
  registerEmail: (email: string, password: string, displayName: string) => Promise<{ success: boolean; msg?: string }>;
  createUserProfile: (displayName: string | null) => Promise<void>;
  sendFriendRequest: (recipientEmail: string) => Promise<void>;
  respondToFriendRequest: (
    requestId: string,
    response: "accepted" | "declined"
  ) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
  manageBibleRoomInvite: (friendId: string, action: 'invite' | 'uninvite') => Promise<void>;
  setBibleRoomSharing: (sharing: boolean) => Promise<void>;
  updateUserProfile: (data: {
    name?: string;
    dob?: string;
    newUsername?: string;
    photoFile?: File;
    newEmail?: string;
    newGender?: string;
    newLanguage?: string;
  }) => Promise<void>;
  updateBiblePersonalization: (personalization: Record<string, any>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  updateReaderSettings: (settings: {
    fontSize: string;
    font: string;
    numbersAndTitles: boolean;
  }) => Promise<void>;
  linkGoogleAccount: () => Promise<{ success: boolean; msg?: string }>;
}

const AuthContext = createContext<AuthContextType | null >(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserTypes | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<FriendTypes[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestTypes[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestTypes[]>([]);
  const [jams, setJams] = useState<JamTypes[]>([]);

  const callSendFriendRequest = httpsCallable(functions, "sendFriendRequest");
  const callRespondToFriendRequest = httpsCallable(functions, "respondToFriendRequest");
  const callRemoveFriend = httpsCallable(functions, "removeFriend");
  const callCancelFriendRequest = httpsCallable(functions, "cancelFriendRequest");
  const callCreateJam = httpsCallable(functions, "createJam");
  const callManageJamPermissions = httpsCallable(functions, "manageJamPermissions");
  const callManageBibleRoomInvite = httpsCallable(functions, "manageBibleRoomInvite");
  const callSetBibleRoomSharing = httpsCallable(functions, "setBibleRoomSharing");
  const callUpdateUserProfile = httpsCallable(functions, "updateUserProfile");
  const callCreateUserProfile = httpsCallable(functions, "createUserProfile");
  const callCheckUsername = httpsCallable(functions, "checkUsername");

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubscribers: (() => void)[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up old listeners
      unsubscribers.forEach((unsub) => unsub());
      unsubscribers = [];

      if (!firebaseUser) {
        setCurrentUser(null);
        setUserData(null);
        setIsAdmin(false);
        setIsPro(false);
        setFriends([]);
        setSentRequests([]);
        setReceivedRequests([]);
        setJams([]);
        removeAuthToken();
        setLoading(false);
        //router.replace('/');
      } else {
        setLoading(true);
        const token = await firebaseUser.getIdToken();
        setAuthToken(token);
        setCurrentUser(firebaseUser);

        const tokenValues = await firebaseUser.getIdTokenResult();
        setIsAdmin(tokenValues.claims.role === "admin");

        const userRef = await doc(firestore, "users", firebaseUser.uid);
        //await updateDoc(userRef, { online: true });

        console.log("Authenticated",firebaseUser)

        const unsubUser = onSnapshot(userRef, (doc) => {
          console.log("User data updated")
          if (doc.exists()) {
            const data = doc.data() as UserTypes;
            setUserData(data);
            setIsPro(data.isPro || false);
          } else {
            setUserData(null);
            setIsPro(false);
          }
          setLoading(false);
        });
        unsubscribers.push(unsubUser);

        // Jams Listener
        // const userPermissionField = `permissions.${firebaseUser.uid}`;
        // const jamsQuery = query(
        //   collection(firestore, "jams"),
        //   where(userPermissionField, "in", ["owner", "editor", "viewer"])
        // );
        // const unsubJams = onSnapshot(jamsQuery, async (snapshot) => { // Make callback async
        //   const jamsListPromises = snapshot.docs.map(async (jamDoc) => {
        //     const jamData = jamDoc.data();
        //     let authorUsername = "Unknown"; // Default username

        //     if (jamData.authorId) {
        //       const authorDocRef = doc(firestore, "users", jamData.authorId);
        //       const authorDocSnap = await getDoc(authorDocRef);
        //       if (authorDocSnap.exists()) {
        //         authorUsername = authorDocSnap.data().username || "Unknown";
        //       }
        //     }

        //     return {
        //       id: jamDoc.id,
        //       ...jamData,
        //       authorUsername, // Add the fetched username
        //     } as JamTypes;
        //   });

        //   const jamsList = await Promise.all(jamsListPromises);
        //   setJams(jamsList);

        // }, (error) => {
        //   console.error("Jams listener error:", error);
        // });
        // unsubscribers.push(unsubJams);

        // Friends List Listener
        const friendsRef = collection(userRef, "friends");
        const unsubFriends = onSnapshot(friendsRef, async (snapshot) => {
          console.log("Friends list updated")
          const friendsListPromises = snapshot.docs.map(async (friendDoc) => {
            const friendUserSnap = await getDoc(doc(firestore, "users", friendDoc.id));
            if (friendUserSnap.exists()) {
              const friendUserData = friendUserSnap.data(); // -> Get data from the user snapshot
              return {
                id: friendDoc.id,
                name: friendUserData.name || "Unknown",
                username: friendUserData.username || "Unknown",
                online: friendUserData.online || false,
                photoURL: friendUserData.profilePictureUrl || null,
              };
            }
            return null;
          });
          const friendsList = (await Promise.all(friendsListPromises)).filter(f => f !== null) as FriendTypes[];
          setFriends(friendsList);
        });
        unsubscribers.push(unsubFriends);

        // Sent Friend Requests Listener
        const sentReqRef = query(
          collection(firestore, "friendRequests"),
          where("from", "==", firebaseUser.uid),
          where("status", "==", "pending")
        );
        const unsubSent = onSnapshot(sentReqRef, async (snapshot) => {
          console.log("Sent friend requests updated")
          const requestsPromises = snapshot.docs.map(async (reqDoc) => {
            // -> Get data from the friend request snapshot to find the recipient's ID
            const recipientId = reqDoc.data().to; 
            const recipientSnap = await getDoc(doc(firestore, "users", recipientId));
            if (recipientSnap.exists()) {
              const recipientData = recipientSnap.data(); // -> Get data from the recipient's user snapshot
              return {
                id: reqDoc.id,
                name: recipientData.name || "Unknown",
                username: recipientData.username || "Unknown",
                from: reqDoc.data().from,
                photoURL: recipientData.profilePictureUrl || null,
              };
            }
            return null;
          });
          const requests = (await Promise.all(requestsPromises)).filter(r => r !== null) as FriendRequestTypes[];
          setSentRequests(requests);
        });
        unsubscribers.push(unsubSent);

        // Received Friend Requests Listener
        const receivedReqRef = query(
          collection(firestore, "friendRequests"),
          where("to", "==", firebaseUser.uid),
          where("status", "==", "pending")
        );
        const unsubReceived = onSnapshot(receivedReqRef, async (snapshot) => {
          console.log("Received friend requests updated")
          const requestsPromises = snapshot.docs.map(async (reqDoc) => {
            // -> Get data from the friend request snapshot to find the sender's ID
            const senderId = reqDoc.data().from;
            const senderSnap = await getDoc(doc(firestore, "users", senderId));
            if (senderSnap.exists()) {
              const senderData = senderSnap.data(); // -> Get data from the sender's user snapshot
              return {
                id: reqDoc.id,
                name: senderData.name || "Unknown",
                username: senderData.username || "Unknown",
                from: reqDoc.data().from,
                photoURL: senderData.profilePictureUrl || null,
              };
            }
            return null;
          });
          const requests = (await Promise.all(requestsPromises)).filter(r => r !== null) as FriendRequestTypes[];
          setReceivedRequests(requests);
        });
        unsubscribers.push(unsubReceived);
      }
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (user: User | null) => {
      console.log("Token updated")
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token);
      } else {
        removeAuthToken();
      }
    });

    return () => {
      console.log("Unsubscribing")
      unsubscribeAuth();
      unsubscribeToken();
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  // useEffect(() => {
  //   if (loading) {
  //     if (pathname === '/login' || pathname === '/register') {
  //       router.replace('/app/play');
  //     }
  //   }
  //   console.log(loading)
  // }, [loading, pathname, router]);

  useEffect(() => {
    // Wait until loading is finished
    if (!loading && currentUser) {
      // If we have a user and they are on a guest-only page, redirect them
      if (pathname === '/login' || pathname === '/register') {
        router.replace('/app/play');
      }
    }
  }, [loading, currentUser, pathname, router]);

  const loginGoogle = async (): Promise<void> => {
    if (!auth) throw new Error("Firebase auth not initialized");

    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      console.log("Google sign-in successful");
      await createUserProfile(null);
    } catch (error) {
      console.error("Google sign-in failed", error);
      throw error;
    }
  };

  const loginEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth not initialized");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: unknown) {
      let msg = "An error occurred. Please try again.";

      if (typeof error === "object" && error !== null && "code" in error) {
        switch ((error as { code: string }).code) {
          case "auth/invalid-email":
            msg = "Invalid email address";
            break;
          case "auth/user-not-found":
            msg = "No user found with this email";
            break;
          case "auth/wrong-password":
            msg = "Incorrect password";
            break;
          default:
            // Check if error has a 'message' property
            msg = "message" in error ? (error as { message: string }).message : msg;
        }
      } else {
        // fallback for non-Firebase errors
        msg = String(error);
      }

      return { success: false, msg };
    }
  };

  const registerEmail = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error("Firebase auth not initialized");
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      await createUserProfile(name);
      return { success: true };
    } catch (error: unknown) {
      let msg = "An error occurred. Please try again.";
    
      if (typeof error === "object" && error !== null && "code" in error) {
        switch ((error as { code: string }).code) {
          case "auth/email-already-in-use":
            msg = "Email is already in use";
            break;
          case "auth/invalid-email":
            msg = "Invalid email address";
            break;
          case "auth/weak-password":
            msg = "Password is too weak";
            break;
          default:
            msg = "message" in error ? (error as { message: string }).message : msg;
        }
      } else {
        msg = String(error);
      }
    
      return { success: false, msg };
    }
  };

  const createUserProfile = async (name: string | null) => {
    if (!auth) throw new Error("Firebase auth not initialized");
    await callCreateUserProfile({ name });
  }

  const logout = async (): Promise<void> => {
    if (!auth) throw new Error("Firebase not initialized");

    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        await updateDoc(userRef, {
          online: false,
          lastSeen: serverTimestamp(),
        });
      }

      await auth.signOut();
      removeAuthToken();
      router.replace("/");
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
      router.replace("/");
      throw error;
    }
  };

  async function sendFriendRequest(recipientUsername: string): Promise<void> {
    if (!currentUser) throw new Error("Not authenticated");
    await callSendFriendRequest({ recipientUsername });
  }

  async function respondToFriendRequest(
    requestId: string,
    response: "accepted" | "declined"
  ): Promise<void> {
    if (!currentUser) throw new Error("Not authenticated");
    await callRespondToFriendRequest({ requestId, response });
  }

  async function cancelFriendRequest(requestId: string): Promise<void> {
    if (!currentUser) throw new Error("Not authenticated");
    await callCancelFriendRequest({ requestId });
  }

  async function removeFriend(friendId: string): Promise<void> {
    if (!currentUser) throw new Error("Not authenticated");
    // Call the cloud function instead of performing the batch write on the client
    await callRemoveFriend({ friendId });
  }

  async function createJam(): Promise < string | null > {
    if (!currentUser) {
      throw new Error("Not authenticated");
    }
    try {
      const result = (await callCreateJam()) as {
        data: {
          success: boolean,
          jamId: string
        }
      };
      if (result.data.success) {
        console.log("Jam created with ID:", result.data.jamId);
        return result.data.jamId;
      }
      return null;
    } catch (error) {
      console.error("Error creating jam:", error);
      return null;
    }
  }

  async function manageJamPermissions(jamId: string, targetUsername: string, role: 'editor' | 'viewer' | 'remove'): Promise<void> {
    await callManageJamPermissions({
      jamId,
      targetUsername,
      role
    });
  }

  async function manageBibleRoomInvite(friendId: string, action: 'invite' | 'uninvite'): Promise<void> {
    if (!currentUser) throw new Error("Not authenticated");
    await callManageBibleRoomInvite({ friendId, action });
  }

  async function setBibleRoomSharing(sharing: boolean): Promise<void> {
    if (!currentUser) throw new Error("Not authenticated");
    await callSetBibleRoomSharing({ sharing });
  }

  async function updateUserProfile(data: {
    name?: string;
    dob?: string;
    newUsername?: string;
    photoFile?: File;
    newGender?: string;
    newLanguage?: string;
    newEmail?: string;
  }): Promise<void> {
    if (!currentUser) throw new Error("Not authenticated");
  
    // Construct the payload, ensuring we don't send "undefined" fields
    const payload: { [key: string]: string | File | undefined } = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.dob !== undefined) payload.dob = data.dob;
    if (data.newUsername !== undefined) payload.newUsername = data.newUsername;
    if (data.newGender !== "Select gender") payload.newGender = data.newGender;
    if (data.newLanguage !== "Select language") payload.newLanguage = data.newLanguage;
    if (data.newEmail !== undefined) payload.newEmail = data.newEmail;

    try {
      if (data.photoFile) {
        const filePath = `profile-pictures/${currentUser.uid}/${Date.now()}_${data.photoFile.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = await uploadBytes(storageRef, data.photoFile);
        payload.photoURL = await getDownloadURL(uploadTask.ref);
      }
      
      // If the payload is empty (e.g., only a photo was updated), don't send an empty object
      if (Object.keys(payload).length === 0 && !data.photoFile) {
        return; 
      }
  
      await callUpdateUserProfile(payload);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async function updateBiblePersonalization(personalization: Record<string, any>): Promise<void> {
    if (!currentUser) throw new Error("Not authenticated");
    const userRef = doc(firestore, "users", currentUser.uid);
    await updateDoc(userRef, { biblePersonalization: personalization });
  }

  async function sendVerificationEmail(): Promise<void> {
    if (!currentUser) {
      throw new Error("Not authenticated. Cannot send verification email.");
    }
    await sendEmailVerification(currentUser);
  }
  async function sendPasswordReset(email: string): Promise<void> {
    if (!auth) throw new Error("Firebase auth not initialized");
    await sendPasswordResetEmail(auth, email);
  }
  async function checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const result = await callCheckUsername({ username }) as { data: { isAvailable: boolean } };
      return result.data.isAvailable;
    } catch (error) {
      // Log the error and re-throw it so the component can handle it
      console.error("Error checking username availability:", error);
      throw error;
    }
  }

  async function updateReaderSettings(settings: {
    fontSize: string;
    font: string;
    numbersAndTitles: boolean;
  }): Promise<void> {
    if (!currentUser) throw new Error("Not authenticated");
    const userRef = doc(firestore, "users", currentUser.uid);
    await updateDoc(userRef, { readerSettings: settings });
  }

  const linkGoogleAccount = async () => {
    if (!currentUser) {
      return { success: false, msg: 'You must be logged in to link an account.' };
    }
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(currentUser, provider);
      return { success: true, msg: 'Google account linked successfully!' };
    } catch (error: any) {
      console.error("Error linking Google account:", error);
      // Handle common error where the Google account is already linked to another user
      if (error.code === 'auth/credential-already-in-use') {
        return { success: false, msg: 'This Google account is already in use by another user.' };
      }
      return { success: false, msg: 'Failed to link Google account. Please try again.' };
    }
  };

  const contextValue: AuthContextType = {
    currentUser,
    userData,
    isAdmin,
    isPro,
    loading,
    friends,
    sentRequests,
    receivedRequests,
    jams,
    loginGoogle,
    logout,
    loginEmail,
    registerEmail,
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    cancelFriendRequest,
    createJam,
    manageJamPermissions,
    manageBibleRoomInvite,
    setBibleRoomSharing,
    updateUserProfile,
    createUserProfile,
    updateBiblePersonalization,
    sendVerificationEmail,
    sendPasswordReset,
    checkUsernameAvailability,
    updateReaderSettings,
    linkGoogleAccount,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};