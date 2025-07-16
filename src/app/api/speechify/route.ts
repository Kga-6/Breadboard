import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const response = await fetch("https://api.sws.speechify.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": "Bearer hlUIewMXBL_u390G0IsmaGR5K8UG4wECuldc8yVfePc=",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: text, voice_id: "jeremy" }), // input, not "text"
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Speechify API error:", errorData);
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
  }

  const data = await response.json();

  console.log(data);
  return NextResponse.json(data);
}