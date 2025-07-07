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

  try {

    const response = await fetch("https://api.scripture.api.bible/v1/languages", {
      headers: { "api-key": API_KEY }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Bibles languages" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}