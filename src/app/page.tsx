"use client"

import Link from "next/link"
import { useAuth } from "./context/AuthContext"

export default function Home(){

    const auth = useAuth();

    return (
      <div className="flex justify-between p-4">
        <h1 className="text-2xl font-bold">Breadboard</h1>
        
        <div>
          {!auth?.currentUser && (
            <>
              <Link className="font-bold" href="/login">Login</Link>
            </>
          )}

          {auth?.currentUser && (
            <Link href="/app/home">START</Link>
          )}
        </div>
        
      </div>
    )
}