"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import { resolve } from "path";

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
      reject()
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if(!user){
        setCurrentUser(null);
      }
      if(user) {
        setCurrentUser(user);
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