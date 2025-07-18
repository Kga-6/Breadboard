import { auth, firestore } from "../../../../../firebase/server";
import { DecodedIdToken } from "firebase-admin/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  
  // Extract userId and isForced from the URL
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const userId = pathParts[pathParts.indexOf("users") + 1];

  // Extract isForced from query string
  const isForced = url.searchParams.get("isForced") === "true";
  
  try {
    if (!firestore)
      return new NextResponse("Internal Error", { status: 500 });

    const authToken =
      request.headers.get("authorization")?.split("Bearer ")[1] || null;

    let user: DecodedIdToken | null = null;
    if (auth && authToken)
      try {
          user = await auth.verifyIdToken(authToken);
      } catch (error: unknown) {
          // One possible error is the token being expired, return forbidden
          console.log(error);
      }

    const isAdmin = user?.role === "admin";

    const valid = isAdmin || user?.uid === userId || isForced === true;
    if (!valid) return new NextResponse("Unauthorized", { status: 401 });

    const userDocument = await firestore
        .collection("users")
        .doc(userId)
        .get();

    const userData = userDocument.data();

    return NextResponse.json(userData);
  } catch (error: unknown) {
      console.error("Error in GET /users/:userId:", error);
      return new NextResponse("Internal Error", { status: 500 });
  }
}


    // "GET" USERDATA
    // let userData = null;
    // const userInfoResponse = await fetch(
    //     `${process.env.API_URL}/api/users/${user.uid}`,
    //     {
    //         headers: {
    //             Authorization: `Bearer ${authToken}`,
    //         },
    //     }
    // );
    // if (userInfoResponse.ok) {
    //     userData = await userInfoResponse.json();
    // }

    // if (!userData) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }