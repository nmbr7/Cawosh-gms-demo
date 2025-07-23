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
    const backendUrl =
      `${process.env.BACKEND_URL}/api/bookings/${bookingId}` ||
      `http://localhost:3000/api/bookings/${bookingId}`;

    console.log("Fetching from backend URL:", backendUrl);

    const response = await fetchWithAuth(backendUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch booking details" },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log("Raw backend response structure:", {
      success: data.success,
      hasData: !!data.data,
      dataKeys: data.data ? Object.keys(data.data) : [],
      firstServiceTechnicianType: data.data?.services?.[0]?.technicianId
        ? typeof data.data.services[0].technicianId
        : "undefined",
      technicianData: data.data?.services?.[0]?.technicianId,
    });

    // Check if the response has the expected structure
    if (data.success && data.data) {
      console.log("Extracted booking data:", {
        bookingId: data.data.bookingId,
        customerName: data.data.customer?.name,
        servicesCount: data.data.services?.length,
        technicianData: data.data.services?.[0]?.technicianId,
        technicianType: typeof data.data.services?.[0]?.technicianId,
      });

      // Return the booking data in the expected format
      return NextResponse.json({
        success: true,
        data: data.data,
      });
    } else {
      // Return the original response if structure is unexpected
      console.log("Unexpected response structure, returning original");
      console.log("Full response data:", JSON.stringify(data, null, 2));
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
