"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

interface RoomProps {
  children: ReactNode,
  roomId: string,
}

export function BibleRoom({ children, roomId }: RoomProps ) {
  const {currentUser, userData} = useAuth();
  const router = useRouter();

  return (
    <LiveblocksProvider 
      authEndpoint={async (room) => {

        if (!currentUser) {
          throw new Error("User is not authenticated or auth state is loading.");
        }

        // Get the JWT from the authenticated user provided by your context
        const idToken = await currentUser?.getIdToken();
        if (idToken){

          // Make the POST request to your Next.js API route for Liveblocks auth
          const response = await fetch(`/api/liveblocks-auth/bibleroom/${roomId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Send the token in the Authorization header
              "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({ room, userInfo: userData , ownersUid: roomId }), 
          });


          if (!response.ok) {
            const errorText = await response.text();

            if (response.status === 404) {
              // In Next.js App Router, you can use the not-found.js file
              router.push('/app/bible/not-found'); 
            } else if (response.status === 403) {
              // Redirect to a custom unauthorized page
              router.push('/app/bible/unauthorized');
            } else {
              // Redirect to a generic error page for other server errors
              router.push('/app/bible/error');
            }
            
            throw new Error(`Authentication failed: ${errorText}`);
          }

          // Return the authorization token to Liveblocks
          return await response.json();
        }

        throw new Error("Could not get user ID token for authentication.");
      }}
      
    >
      <RoomProvider 
        id={`bible:${roomId}`} 
        initialPresence={{ cursor: { x: 0, y: 0 }, chapterId: "" }} 
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}