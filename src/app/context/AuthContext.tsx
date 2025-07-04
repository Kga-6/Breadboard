"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, onIdTokenChanged } from "firebase/auth";
import { auth, firestore, functions } from "../../../firebase/client";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  query,
  where,
  writeBatch,
  deleteDoc, // Import deleteDoc
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export function getAuthToken():String | undefined {
  return Cookies.get("firebaseIdToken");
}

export function setAuthToken(token: string):string | undefined {
  return Cookies.set("firebaseIdToken", token, {secure:true});
}

export function removeAuthToken(): void {
  return Cookies.remove("firebaseIdToken");
}

type UserType = {
  uid?: string;
  name: string | null;
  email: string | null;
  username: string | null;
  isPro?: boolean;
  photoURL: string | null;
  lastSeen?: any;
  online?: boolean;
};

type Friend = {
  id: string;
  name: string;
  username: string;
  online: boolean;
  photoURL: string | null;
};

type FriendRequest = {
  id: string;
  name: string;
  username: string;
  from: string;
  photoURL: string | null;
};

type Jam = {
  id: string;
  title: string;
  authorId: string;
  authorUsername?: string; // Add this line
  lastModified: any;
};

interface AuthContextType {
  currentUser: User | null;
  userData: UserType | null;
  isAdmin: boolean;
  isPro: boolean;
  loading: boolean;
  friends: Friend[];
  sentRequests: FriendRequest[];
  receivedRequests: FriendRequest[];
  jams: Jam[];
  manageJamPermissions: (jamId: string, targetUsername: string, role: 'editor' | 'viewer' | 'remove') => Promise < any > ;
  createJam: () => Promise<string | null>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<{ success: boolean; msg?: any }>;
  registerEmail: (email: string, password: string) => Promise<{ success: boolean; msg?: any }>;
  sendFriendRequest: (recipientEmail: string) => Promise<any>;
  respondToFriendRequest: (
    requestId: string,
    response: "accepted" | "declined"
  ) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null >(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [jams, setJams] = useState<Jam[]>([]);

  const callSendFriendRequest = httpsCallable(functions, "sendFriendRequest");
  const callRespondToFriendRequest = httpsCallable(functions, "respondToFriendRequest");
  const callRemoveFriend = httpsCallable(functions, "removeFriend");
  const callCancelFriendRequest = httpsCallable(functions, "cancelFriendRequest");
  const callCreateJam = httpsCallable(functions, "createJam");
  const callManageJamPermissions = httpsCallable(functions, "manageJamPermissions");


  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && userData) {
      if (pathname === '/login' || pathname === '/register') {
        router.replace('/app/home');
      }
    }
  }, [currentUser, userData, loading, pathname, router]);

  useEffect(() => {
    setLoading(true);

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
      } else {
        const token = await firebaseUser.getIdToken();
        setAuthToken(token);
        setCurrentUser(firebaseUser);

        const tokenValues = await firebaseUser.getIdTokenResult();
        setIsAdmin(tokenValues.claims.role === "admin");

        const userRef = await doc(firestore, "users", firebaseUser.uid);
        //await updateDoc(userRef, { online: true });

        console.log("Authenticated",firebaseUser)

        const unsubUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserType;
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
        const userPermissionField = `permissions.${firebaseUser.uid}`;
        const jamsQuery = query(
          collection(firestore, "jams"),
          where(userPermissionField, "in", ["owner", "editor", "viewer"])
        );
        const unsubJams = onSnapshot(jamsQuery, async (snapshot) => { // Make callback async
          const jamsListPromises = snapshot.docs.map(async (jamDoc) => {
            const jamData = jamDoc.data();
            let authorUsername = "Unknown"; // Default username

            if (jamData.authorId) {
              const authorDocRef = doc(firestore, "users", jamData.authorId);
              const authorDocSnap = await getDoc(authorDocRef);
              if (authorDocSnap.exists()) {
                authorUsername = authorDocSnap.data().username || "Unknown";
              }
            }

            return {
              id: jamDoc.id,
              ...jamData,
              authorUsername, // Add the fetched username
            } as Jam;
          });

          const jamsList = await Promise.all(jamsListPromises);
          setJams(jamsList);

        }, (error) => {
          console.error("Jams listener error:", error);
        });
        unsubscribers.push(unsubJams);

        // Friends List Listener
        const friendsRef = collection(userRef, "friends");
        const unsubFriends = onSnapshot(friendsRef, async (snapshot) => {
          const friendsList: Friend[] = [];
          for (const friendDoc of snapshot.docs) {
            const friendUserSnap = await getDoc(
              doc(firestore, "users", friendDoc.id)
            );
            if (friendUserSnap.exists()) {
              const friendUserData = friendUserSnap.data();
              friendsList.push({
                id: friendDoc.id,
                name: friendUserData.name || "Unknown",
                username: friendUserData.username || "Unknown",
                online: friendUserData.online || false,
                photoURL: friendUserData.photoURL || null,
              });
            }
          }
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
          const requests: FriendRequest[] = [];
          for (const reqDoc of snapshot.docs) {
            const recipientSnap = await getDoc(
              doc(firestore, "users", reqDoc.data().to)
            );
            if (recipientSnap.exists()) {
              const recipientData = recipientSnap.data();
              requests.push({
                id: reqDoc.id,
                name: recipientData.name || "Unknown",
                username: recipientData.username || "Unknown",
                from: reqDoc.data().from,
                photoURL: recipientData.photoURL || null,
              });
            }
          }
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
          const requests: FriendRequest[] = [];
          for (const reqDoc of snapshot.docs) {
            const senderSnap = await getDoc(
              doc(firestore, "users", reqDoc.data().from)
            );
            if (senderSnap.exists()) {
              const senderData = senderSnap.data();
              requests.push({
                id: reqDoc.id,
                name: senderData.name || "Unknown",
                username: senderData.username || "Unknown",
                from: reqDoc.data().from,
                photoURL: senderData.photoURL || null,
              });
            }
          }
          setReceivedRequests(requests);
        });
        unsubscribers.push(unsubReceived);
      }
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (user: User | null) => {
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token);
      } else {
        removeAuthToken();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const loginGoogle = async (): Promise<void> => {
    if (!auth) throw new Error("Firebase auth not initialized");

    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      console.log("Google sign-in successful");
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
    } catch (error: any) {
      let msg = "An error occurred. Please try again.";
      switch (error.code) {
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
          msg = error.message;
      }
      return { success: false, msg };
    }
  };

  const registerEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth not initialized");
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let msg = "An error occurred. Please try again.";
      switch (error.code) {
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
          msg = error.message;
      }
      return { success: false, msg };
    }
  };

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

  async function sendFriendRequest(recipientUsername: string) {
    return callSendFriendRequest({ recipientUsername });
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

  async function manageJamPermissions(jamId: string, targetUsername: string, role: 'editor' | 'viewer' | 'remove') {
    if (!currentUser) throw new Error("Not authenticated");
    return callManageJamPermissions({
      jamId,
      targetUsername,
      role
    });
  }

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
    manageJamPermissions
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