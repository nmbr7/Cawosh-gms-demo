import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { GarageService } from "@/app/models/garage";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract garageId from the URL
    const url = new URL(request.url);
    const garageId = url.pathname.split("/")[3]; // /api/garages/[garageId]/services

    // Get the garage's services with full details
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/garages/${garageId}/services`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch garage services");
    }

    const { data } = await response.json();
    console.log("data", data);
    return NextResponse.json({ services: data });
  } catch (error) {
    console.error("Error fetching garage services:", error);
    return NextResponse.json(
      { error: "Failed to fetch garage services" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract garageId from the URL
    const url = new URL(request.url);
    const garageId = url.pathname.split("/")[3]; // /api/garages/[garageId]/services

    const body = await request.json();
    const { services } = body as { services: GarageService[] };

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/garages/${garageId}/services`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ services }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update garage services");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating garage services:", error);
    return NextResponse.json(
      { error: "Failed to update garage services" },
      { status: 500 }
    );
  }
}
