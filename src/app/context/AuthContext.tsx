"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
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

interface AuthContextType {
  currentUser: User | null;
  userData: UserType | null;
  isAdmin: boolean;
  isPro: boolean;
  loading: boolean;
  friends: Friend[];
  sentRequests: FriendRequest[];
  receivedRequests: FriendRequest[];
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

  const callSendFriendRequest = httpsCallable(functions, "sendFriendRequest");
  const callRespondToFriendRequest = httpsCallable(functions, "respondToFriendRequest");
  const callRemoveFriend = httpsCallable(functions, "removeFriend");
  const callCancelFriendRequest = httpsCallable(functions, "cancelFriendRequest");

  const router = useRouter();
  const pathname = usePathname(); // Get the current URL path

  // This effect handles redirecting the user if they are logged in
  useEffect(() => {
    // If we are done loading and have user data
    if (!loading && userData) {
      // And the user is on the login or register page
      if (pathname === '/login' || pathname === '/register') {
        // Redirect them to the dashboard
        router.replace('/dashboard/home');
      }
    }
  }, [userData, loading, pathname, router]);

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
        removeAuthToken();
        setLoading(false);
      } else {
        setLoading(true);
        const token = await firebaseUser.getIdToken();
        setCurrentUser(firebaseUser);
        setAuthToken(token);

        const tokenValues = await firebaseUser.getIdTokenResult();
        setIsAdmin(tokenValues.claims.role === "admin");

        const userRef = doc(firestore, "users", firebaseUser.uid);
        await updateDoc(userRef, { online: true });

        // --- Attach All Real-time Listeners ---
        // User Data Listener
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

    return () => {
      unsubscribeAuth();
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  function loginGoogle(): Promise<void> {
    return new Promise((resolve,reject) => {
      if(!auth){
        reject()
        return;
      }
      signInWithPopup(auth, new GoogleAuthProvider())
        .then((user) => {
          console.log("signed in!")
          resolve()
        })
        .catch(()=>{
          console.error("Something went wrong")
          reject()
        })
    })
  }

  const loginEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("auth/invalid-email")) msg = "Invalid email";
      if (msg.includes("auth/user-not-found")) msg = "User not found";
      return { success: false, msg };
    }
  };

  const registerEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("auth/email-already-in-use")) msg = "Email already in use";
      return { success: false, msg };
    }
  };

  function logout(): Promise<void> {
    return new Promise((resolve,reject) => {
      if(!auth){
        reject()
        return;
      }
      auth.signOut()
        .then(()=>{
          console.log("Signed out");
          resolve()
        })
        .catch(()=>{
          console.error("Something went wrong");
          reject()
        })
    })
  }

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

  const contextValue: AuthContextType = {
    currentUser,
    userData,
    isAdmin,
    isPro,
    loading,
    friends,
    sentRequests,
    receivedRequests,
    loginGoogle,
    logout,
    loginEmail,
    registerEmail,
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    cancelFriendRequest,
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