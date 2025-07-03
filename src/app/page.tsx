"use client"

import Link from "next/link"
import { useAuth } from "./context/AuthContext"
import { useRouter } from "next/navigation";

export default function Home(){

    const auth = useAuth();
    const router = useRouter();

    const loginGoogle = () => {
      auth?.loginGoogle()
        .then(() => {
            console.log("Logged in!");
            router.replace("/home");
        })
        .catch(() => {
            console.error("Something went wrong");
        });
    };

    return (
      <>
        <h1>Welcome to Breadboard</h1>
        
        {!auth?.currentUser && (
          <Link href="/login">Login</Link>
        )}

        {!auth?.currentUser && (
          <button onClick={loginGoogle}>Use Google</button>
        )}
        
      </>
    )
}