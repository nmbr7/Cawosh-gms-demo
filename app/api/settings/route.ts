import { NextResponse } from "next/server";
import settings from "@/app/data/mock-settings.json";

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const body = await request.json();
    // In a real application, you would save these settings to a database
    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 400 }
    );
  }
} 