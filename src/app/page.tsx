"use client"

import Link from "next/link"
import { useAuth } from "./context/AuthContext"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home(){

    const router = useRouter();
    const auth = useAuth();

    return (
      <div className="flex justify-between p-4">
        <h1 className="text-2xl font-bold">Breadboard</h1>
        
        <div>
          {!auth?.currentUser && (
            <Button onClick={() => router.push("/login")}>Login</Button>
          )}

          {auth?.currentUser && (
            <Button onClick={() => router.push("/app/home")}>START</Button>
          )}
        </div>
        
      </div>
    )
}