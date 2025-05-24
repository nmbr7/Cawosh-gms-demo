import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface Technician {
  id: string;
  name: string;
  specializations?: string[];
}

export async function GET() {
  try {
    // Read the mock database file
    const dbPath = path.join(process.cwd(), "app/mock-db/db.json");
    const dbContent = await fs.readFile(dbPath, "utf-8");
    const db = JSON.parse(dbContent);

    // Get technicians from the database
    const technicians = db.technicians || [];

    // Return the response
    return NextResponse.json({
      technicians: technicians.map((tech: Technician) => ({
        id: tech.id,
        name: tech.name,
      })),
    });
  } catch (error) {
    console.error("Error in technicians API:", error);
    return NextResponse.json(
      { error: "Failed to fetch technicians" },
      { status: 500 }
    );
  }
}
