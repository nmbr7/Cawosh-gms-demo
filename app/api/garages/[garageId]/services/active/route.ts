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
    const garageId = url.pathname.split("/")[3]; // /api/garages/[garageId]/services/active

    // Get the garage's active services
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/garages/${garageId}/services/active`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch active garage services");
    }

    const { data } = await response.json();
    return NextResponse.json({ services: data });
  } catch (error) {
    console.error("Error fetching active garage services:", error);
    return NextResponse.json(
      { error: "Failed to fetch active garage services" },
      { status: 500 }
    );
  }
}
