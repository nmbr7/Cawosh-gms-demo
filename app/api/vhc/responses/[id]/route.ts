import { NextResponse } from "next/server";
import { vhcRepo } from "@/lib/vhc/mockRepo";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const id = segments[segments.length - 1];
  const res = vhcRepo.getResponse(id);
  if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(res);
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const id = segments[segments.length - 1];
  const body = await request.json();
  try {
    const updated = vhcRepo.updateAnswers(id, body.answers || []);
    return NextResponse.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
