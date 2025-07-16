import { auth, firestore } from "@/../firebase/server";
import { DecodedIdToken } from "firebase-admin/auth";
import { NextRequest, NextResponse } from "next/server";
import { getUserData } from "@/utils/getUsersData";

import { Liveblocks, RoomAccesses } from "@liveblocks/node";
const liveblocks = new Liveblocks({
  secret: `${process.env.LIVEBLOCKS_SECRET_KEY}`,
});

export async function POST(request: NextRequest) {
  try {
    if (!firestore)
      return new NextResponse("Internal Error", { status: 500 });

    const authToken =
      request.headers.get("authorization")?.split("Bearer ")[1] || null;

    if (!authToken) {
      return new NextResponse("Missing authorization token", { status: 401 });
    }

    let user: DecodedIdToken | null = null;
    if (auth) {
      try {
        user = await auth.verifyIdToken(authToken);
      } catch (error) {
        console.error("Firebase token verification failed:", error);
        return new NextResponse("Invalid or expired authorization token", { status: 403 });
      }
    }
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { room, userInfo, ownersUid } = await request.json();

    if (!room) {
        return new NextResponse("Bad Request: 'room' not found in body", { status: 400 });
    }

    if (!userInfo) {
        return new NextResponse("Bad Request: 'userData' not found in body", { status: 400 });
    }

    if (!ownersUid) {
        return new NextResponse("Bad Request: 'ownersUid' not found in body", { status: 400 });
    }

    console.log(`User '${user.uid}' attempting to access room '${room}'`);

    // Fetch room owners userData to check bibleRoom status
    const ownersData = await getUserData(ownersUid)

    if(!ownersData){
      return new NextResponse("Not Found: ownersData not found | BibleRoom", { status: 404 });
    }

    const ownersFriends = ownersData.friends || null;
    const isFriend = ownersFriends.includes(user.uid);

    if(!ownersFriends){
      return new NextResponse("Not Found: ownersFriends list not found | BibleRoom", { status: 404 });
    }

    const ownersBibleRoom = ownersData.data?.bibleRoom
    const invited = ownersBibleRoom.invited
    const sharing = ownersBibleRoom.sharing

    console.log(invited,sharing,isFriend)

    if(!ownersBibleRoom){
      return new NextResponse("Not Found: ownersData bibleRoom not found | BibleRoom", { status: 404 });
    }

    let accessLevel: RoomAccesses[string] | undefined = undefined;
    
    if (user.uid === ownersUid || (sharing && invited.includes(user.uid) && isFriend)){
      accessLevel = ["room:write"]
    }

    if (!accessLevel) {
      console.log(`Access denied for user '${user.uid}' to room '${room}'`);
      return new NextResponse("Forbidden: You do not have permission to access this bible room. | BibleRoom", { status: 403 });
    }

    // Start an auth session inside your endpoint
    const session = liveblocks.prepareSession(
      user.uid,
      { 
        userInfo: {
          uid: userInfo.uid,
          name: userInfo.name || "Anonymous",
          username: userInfo.username,
          avatar: userInfo.profilePictureUrl || `https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`,
        } 
      }
    );

    //session.allow(room, session.FULL_ACCESS);
    session.allow(room, accessLevel);

    // Authorize the user and return the result
    const { status, body } = await session.authorize();
    console.log(`Successfully authorized user '${user.uid}' for bible room '${room}'. Status: ${status}`);
    return new Response(body, { status });
  } catch (error) {
      return new NextResponse("Internal Error", { status: 500 });
  }
}