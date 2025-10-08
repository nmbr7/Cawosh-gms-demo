import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract garageId from the URL
    const url = new URL(request.url);
    const garageId = url.pathname.split("/")[3]; // /api/garages/[garageId]/slots
    const date = url.searchParams.get("date");
    const serviceIds = url.searchParams.get("serviceIds");
    const bayId = url.searchParams.get("bayId");
    const technicianId = url.searchParams.get("technicianId");

    if (!date || !serviceIds) {
      return NextResponse.json(
        { error: "Missing date or serviceId" },
        { status: 400 }
      );
    }

    // Build backend URL with all parameters
    const backendUrl = new URL(`${process.env.BACKEND_URL}/api/slots`);
    backendUrl.searchParams.set("date", date);
    backendUrl.searchParams.set("serviceIds", serviceIds);
    backendUrl.searchParams.set("garageId", garageId);

    if (bayId) {
      backendUrl.searchParams.set("bayId", bayId);
    }
    if (technicianId) {
      backendUrl.searchParams.set("technicianId", technicianId);
    }

    // Call the backend API for slots
    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch slots");
    }

    const data = await response.json();
    console.log("slots", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}
