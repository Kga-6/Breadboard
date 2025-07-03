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


  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if(!user){
        setCurrentUser(null);
        setIsAdmin(false)
        setIsPro(false)
        removeAuthToken();
      }
      if(user) {
        const token = await user.getIdToken();
        setCurrentUser(user);
        setAuthToken(token);

        setLoading(false);
        console.log("Current user: ", user)
      }

    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
          currentUser, 
          isAdmin,
          isPro,
          loginGoogle,
          logout,
          loading 
        }}
      >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);