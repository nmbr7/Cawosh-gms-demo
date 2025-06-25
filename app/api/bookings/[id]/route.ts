import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export async function GET(request: NextRequest) {
  try {
    // Extract bookingId from the URL
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const bookingId = parts[parts.length - 1]; // /api/bookings/[id]

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get the access token from cookies
    const cookies = request.cookies;
    const accessToken = cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "No access token found" },
        { status: 401 }
      );
    }

    // Fetch detailed booking from backend
    const response = await fetchWithAuth(
      `${process.env.BACKEND_URL}/api/bookings/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch booking details" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
