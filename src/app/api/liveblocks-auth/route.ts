import { auth, firestore } from "../../../../firebase/server";
import { DecodedIdToken } from "firebase-admin/auth";
import { NextRequest, NextResponse } from "next/server";

import { Liveblocks, RoomAccesses } from "@liveblocks/node";
const liveblocks = new Liveblocks({
  secret: "sk_dev_nJvd18ul5Mlwc9kWZeYeB-5n5RjLAp0jD7FzQc2rOFpUjA1LdNjcEn0lBEN7BCBx",
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

    const { room, userInfo } = await request.json();

    if (!room) {
        return new NextResponse("Bad Request: 'room' not found in body", { status: 400 });
    }

    if (!userInfo) {
        return new NextResponse("Bad Request: 'userData' not found in body", { status: 400 });
    }

    console.log(`User '${user.uid}' attempting to access room '${room}'`);

    /// Fetch the Jam document from Firestore
    const jamRef = firestore.collection("jams").doc(room);
    const jamDoc = await jamRef.get();

    if (!jamDoc.exists) {
      console.warn(`Attempt to access non-existent jam: ${room}`);
      return new NextResponse("Not Found: Jam does not exist", { status: 404 });
    }

    const jamData = jamDoc.data()!;
    const isAuthor = jamData.authorId == user.uid
    const permissions = jamData.permissions || {};
    const userRole = permissions[user.uid];

    let accessLevel: RoomAccesses[string] | undefined = undefined;

    // 4. Determine the user's access level based on your rules
    // Rule: Specific permissions have priority over public access.
    if (isAuthor || userRole === "owner" || userRole === "editor") {
      accessLevel = ["room:write"]; // Full access
    } else if (userRole === "viewer") {
      accessLevel = ["room:read", "room:presence:write"]; // Read-only access
    } 
    // If no specific role, check for public access
    else if (jamData.isPublic === true) {
      if (jamData.publicAccess === "editor") {
        accessLevel = ["room:write"]; // Full access for public editors
      } else if (jamData.publicAccess === "viewer") {
        accessLevel = ["room:read", "room:presence:write"]; // Read-only for public viewers
      }
    }

    // 5. If no access level was determined, deny access
    if (!accessLevel) {
      console.log(`Access denied for user '${user.uid}' to room '${room}'`);
      return new NextResponse("Forbidden: You do not have permission to access this jam.", { status: 403 });
    }

    // Start an auth session inside your endpoint
    const session = liveblocks.prepareSession(
      user.uid,
      { 
        userInfo: {
          name: userInfo.name || "Anonymous",
          username: userInfo.username,
          avatar: userInfo.profilePictureUrl || `https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`,
        } 
      }
    );

    // Use a naming pattern to allow access to rooms with wildcards
    // Giving the user read access on their org, and write access on their group
    //session.allow(`${user}:*`, session.READ_ACCESS);
    session.allow(room, accessLevel);
    //session.allow(`${user.organization}:${user.group}:*`, session.FULL_ACCESS);

    // Authorize the user and return the result
    const { status, body } = await session.authorize();
    console.log(`Successfully authorized user '${user.uid}' for room '${room}' with access: ${accessLevel.join(', ')}. Status: ${status}`);
    return new Response(body, { status });
  } catch (error) {
      return new NextResponse("Internal Error", { status: 500 });
  }
}