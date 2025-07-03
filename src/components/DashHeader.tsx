"use client"

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashHeader(){

  const {currentUser, logout, isPro, isAdmin} = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout()
      .then(()=>{
          console.log("Logged out!")
          router.replace("/");
      })
      .catch(()=>{
          console.error("Something went wrong!")
      })
  }

  return(
    <div className="flex justify-between items-center p-4 h-14 border-b">
      <h1 className="text-2xl font-bold">Breadboard</h1>
      
      {currentUser && (
        <div className="flex">

          {!isPro && !isAdmin && (
            <div className="bg-pink-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
              User
            </div>
          )}

          {isPro && !isAdmin && (
            <div className="bg-emerald-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
              Pro
            </div>
          )}

          {isAdmin && (
            <div className="bg-orange-400 text-white text-sm font-semibold px-2 py-1 rounded-full">
              Admin
            </div>
          )}

          <div className="ml-2">
            {currentUser.displayName}
          </div>

          <button className="ml-2 font-bold" onClick={handleLogout}>| Sign out</button>
        </div>
      )}
    </div>
  )
}
