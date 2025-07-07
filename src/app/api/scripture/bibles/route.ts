import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.BIBLE_API_KEY!;
const BASE_URL = "https://api.scripture.api.bible/v1";

export async function GET(req: NextRequest) {

  if (!API_KEY) {
    console.error("Missing environment variable: BIBLE_API_KEY");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language");
  const ids = searchParams.get("ids");

  try {
    let url = `${BASE_URL}/bibles`;
    if (language) {
      url += `?language=${language}`;
    }
    if (ids) {
      url += `?ids=${ids}`;
    }

    const response = await fetch(url, {
      headers: {
        "api-key": API_KEY,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Bibles list" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// import { NextRequest, NextResponse } from "next/server";

// const API_USERNAME = "kguerrero0325@gmail.com";
// const API_PASSWORD = "KGAlexander0325@@";
// const BASE_URL = "https://api.biblegateway.com/2";

// async function getAccessToken() {
//   const authUrl = `${BASE_URL}/request_access_token?username=${API_USERNAME}&password=${API_PASSWORD}`;

//   const res = await fetch(authUrl);
//   const data = await res.json();

//   if (data?.access_token) {
//     return data.access_token;
//   } else {
//     throw new Error(data?.error?.errmsg || "Failed to get access token");
//   }
// }

// export async function GET(req: NextRequest) {
//   if (!API_USERNAME || !API_PASSWORD) {
//     return NextResponse.json(
//       { error: "Missing Bible Gateway credentials" },
//       { status: 500 }
//     );
//   }

//   try {
//     const token = await getAccessToken();

//     const bibleRes = await fetch(`${BASE_URL}/bible?access_token=${token}`);
//     const bibleData = await bibleRes.json();

//     if (!bibleRes.ok) {
//       return NextResponse.json(
//         { error: bibleData?.error?.errmsg || "Failed to fetch Bibles" },
//         { status: bibleRes.status }
//       );
//     }

//     return NextResponse.json(bibleData);
//   } catch (err: any) {
//     console.error(err);
//     return NextResponse.json(
//       { error: err.message || "Internal server error" },
//       { status: 500 }
//     );
//   }
// }