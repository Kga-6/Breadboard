import { NextRequest, NextResponse } from "next/server";
import { getCache, setCache } from "@/utils/appcache";

const API_KEY = process.env.BIBLE_API_KEY!;
const BASE_URL = "https://api.scripture.api.bible/v1";

export async function GET(req: NextRequest) {

  if (!API_KEY) {
    console.error("Missing environment variable: BIBLE_API_KEY");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Extract bibleId and bookId from the URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const bibleId = pathParts[pathParts.indexOf("bibles") + 1];

  if (!bibleId) {
  return NextResponse.json({ error: "Missing bibleId " }, { status: 400 });
  }

  const cacheKey = `bible_${bibleId}_books`;

  try {
    // 1. Check Firestore cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // 2. Fetch from API
   const res = await fetch(`${BASE_URL}/bibles/${bibleId}/books`, {
      headers: { "api-key": API_KEY },
    });

    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`);
      return NextResponse.json(
        { error: "Failed to fetch Bible from external API" },
        { status: res.status }
      );
    }

    const data = (await res.json());

    setCache(cacheKey, data);

    return NextResponse.json(data);
  } catch (err) {
    console.error(`Error in GET /bibles/${bibleId}:`, err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
