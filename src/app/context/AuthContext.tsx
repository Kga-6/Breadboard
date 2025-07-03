"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import { auth } from "../../../firebase/client";
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

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isPro: boolean;
  loading: boolean;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null >(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin,setIsAdmin] = useState<boolean>(false);
  const [isPro,setIsPro] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if(!firebaseUser){
        setCurrentUser(null);
        setIsAdmin(false)
        setIsPro(false)
        removeAuthToken();

        console.log("Current user:", "Not found")
      }
      if(firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setCurrentUser(firebaseUser);
        setAuthToken(token);

        // Check if is admin
        const tokenValues = await firebaseUser.getIdTokenResult();
        setIsAdmin(tokenValues.claims.role === "admin");

        // Check if is pro
        const userResponse = await fetch(`/api/users/${firebaseUser.uid}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (userResponse.ok) {
            const userJson = await userResponse.json();
            if (userJson?.isPro) setIsPro(true);
        } else {
            console.error("Could not get user info");
        }


        setLoading(false);

        console.log("Current user: ", firebaseUser)
      }

    });

    return () => unsubscribe();
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

  const contextValue: AuthContextType = {
    currentUser, 
    isAdmin,
    isPro,
    loginGoogle,
    logout,
    loading
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};