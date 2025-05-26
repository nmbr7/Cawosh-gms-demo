import { NextResponse } from "next/server";
import db from "@/app/mock-db/db.json";
import type { Garage } from "@/app/models/garage";

export async function GET() {
  try {
    // For now, always return the first garage
    const garage = db.garages[0] as Garage | undefined;
    if (!garage) {
      return NextResponse.json({ error: "Garage not found" }, { status: 404 });
    }
    return NextResponse.json(garage);
  } catch (error) {
    console.error("Error fetching garage details:", error);
    return NextResponse.json(
      { error: "Failed to fetch garage details" },
      { status: 500 }
    );
  }
}
