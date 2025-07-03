"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Dashboard(){

    const auth = useAuth();
    const router = useRouter();

    const logout = () => {
      auth?.logout()
        .then(()=>{
            console.log("Logged out!")
            router.replace("/");
        })
        .catch(()=>{
            console.error("Something went wrong!")
        })
    }

    return (
      <>
        <h1>Home</h1>

        {auth?.currentUser && (
            <button onClick={logout}>Log out</button>
        )}
      </>
    )
}