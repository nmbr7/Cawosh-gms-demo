import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log("📍 Received location:", data);

  // You can mock a DB save or forward to an external API here
  return NextResponse.json({ status: "ok" });
}
