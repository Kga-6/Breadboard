"use client"

import Link from "next/link"
import { useAuth } from "./context/AuthContext"

export default function Home(){

    const auth = useAuth();

    return (
      <>
        <h1>Welcome to Breadboard</h1>
        {!auth?.currentUser && (
          <Link href="/login">Login</Link>
        )}
        
      </>
    )
}