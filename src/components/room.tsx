"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useAuth } from "@/app/context/AuthContext";

interface RoomProps {
  children: ReactNode,
  roomId: string,
}

export function Room({ children, roomId }: RoomProps ) {
  const {currentUser, userData} = useAuth();

  return (
    <LiveblocksProvider 
      authEndpoint={async (room) => {

        if (!currentUser) {
          throw new Error("User is not authenticated or auth state is loading.");
        }

        // Get the JWT from the authenticated user provided by your context
        const idToken = await currentUser?.getIdToken();
        if (idToken){
          console.log(idToken)

          // Make the POST request to your Next.js API route for Liveblocks auth
          const response = await fetch("/api/liveblocks-auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Send the token in the Authorization header
              "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({ room, userInfo: userData, jamId: roomId  }), 
          });

          if (!response.ok) {
              // Handle auth errors from your backend
              const errorText = await response.text();
              throw new Error(`Authentication failed: ${errorText}`);
          }

          // Return the authorization token to Liveblocks
          return await response.json();
        }
      }}
      
    >
      <RoomProvider id={`jam:${roomId}`} initialPresence={{ cursor: { x: 0, y: 0 }, chapterId: "" }}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}