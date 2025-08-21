import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BookingStatus } from "@/app/models/booking";

interface BackendBooking {
  _id: string;
  bookingId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    license: string;
    vin: string;
  };
  services: Array<{
    serviceId: {
      _id: string;
      name: string;
      description: string;
      category: string;
    };
    name: string;
    description: string;
    duration: number;
    price: number;
    currency: string;
    currencySymbol: string;
    status: BookingStatus;
    technicianId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      role: string;
    };
    bayId: string;
    startTime: string;
    endTime: string;
    _id?: string;
    pauses: unknown[];
  }>;
  bookingDate: string;
  totalDuration: number;
  totalPrice: number;
  status: BookingStatus;
  garage_id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  notes?: string;
  history: Array<{
    status: BookingStatus;
    changedBy: string;
    changedAt: string;
    notes: string;
    _id?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface BackendResponse {
  success: boolean;
  message: string;
  data: {
    bookings: BackendBooking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBookings: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
    filters: {
      status?: string;
      garage_id?: string;
      bay?: string;
      startDate?: string;
      endDate?: string;
      serviceStatus?: string;
      minPrice?: string;
      maxPrice?: string;
    };
    sorting: {
      sortBy: string;
      sortOrder: string;
    };
    stats: {
      totalRevenue: number;
      avgBookingValue: number;
      totalDuration: number;
      statusCounts: Record<string, number>;
    };
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams }: URL = new URL(request.url);

    // Get garage ID from query params
    const garageId = searchParams.get("garageId");
    if (!garageId) {
      return NextResponse.json(
        { error: "Garage ID is required" },
        { status: 400 }
      );
    }

    // Pagination parameters
    const page: number = parseInt(searchParams.get("page") || "1");
    const limit: number = parseInt(searchParams.get("limit") || "10");

    // Filter parameters
    const bay: string | null = searchParams.get("bay") || null;
    const status: string | null = searchParams.get("status") || null;
    const serviceStatus: string | null =
      searchParams.get("serviceStatus") || null;
    const minPrice: string | null = searchParams.get("minPrice") || null;
    const maxPrice: string | null = searchParams.get("maxPrice") || null;

    // Date range parameters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Sort parameters
    const sortBy: string = searchParams.get("sortBy") || "bookingDate";
    const sortOrder: "asc" | "desc" = (searchParams.get("sortOrder") ||
      "desc") as "asc" | "desc";

    // Get auth token
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Build backend API URL with the correct endpoint structure
    const backendUrl = new URL(
      `${process.env.BACKEND_URL}/api/bookings` ||
        "http://localhost:3000/api/bookings"
    );
    backendUrl.searchParams.set("page", page.toString());
    backendUrl.searchParams.set("limit", limit.toString());
    backendUrl.searchParams.set("garage_id", garageId);
    backendUrl.searchParams.set("sortBy", sortBy);
    backendUrl.searchParams.set("sortOrder", sortOrder);

    // Add optional filters
    if (bay) backendUrl.searchParams.set("bay", bay);
    if (status) backendUrl.searchParams.set("status", status);
    if (serviceStatus)
      backendUrl.searchParams.set("serviceStatus", serviceStatus);
    if (startDate) backendUrl.searchParams.set("startDate", startDate);
    if (endDate) backendUrl.searchParams.set("endDate", endDate);
    if (minPrice) backendUrl.searchParams.set("minPrice", minPrice);
    if (maxPrice) backendUrl.searchParams.set("maxPrice", maxPrice);

    // Call backend API
    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.text}`);
    }

    const backendData: BackendResponse = await response.json();

    if (!backendData.success) {
      throw new Error(backendData.message || "Failed to fetch bookings");
    }

    // Transform the data to match our frontend expectations
    const transformedBookings =
      backendData.data.bookings?.map((booking: BackendBooking) => {
        // Create a proper Booking instance
        const bookingData = {
          _id: booking._id,
          bookingId: booking.bookingId,
          customer: booking.customer,
          vehicle: booking.vehicle,
          services: booking.services,
          bookingDate: booking.bookingDate,
          totalDuration: booking.totalDuration,
          totalPrice: booking.totalPrice,
          status: booking.status,
          garage_id: booking.garage_id,
          notes: booking.notes,
          history: booking.history,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        };

        return bookingData;
      }) || [];

    return NextResponse.json({
      bookings: transformedBookings,
      pagination: {
        currentPage: backendData.data.pagination.currentPage,
        totalPages: backendData.data.pagination.totalPages,
        totalItems: backendData.data.pagination.totalBookings,
        itemsPerPage: backendData.data.pagination.limit,
      },
      stats: backendData.data.stats,
      filters: backendData.data.filters,
      sorting: backendData.data.sorting,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    console.log("Creating booking with data:", body);

    // Get auth token
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Call backend API to create booking
    const backendUrl =
      `${process.env.BACKEND_URL}/api/bookings` ||
      "http://localhost:3000/api/bookings";

    console.log("Sending request to backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend error:", errorData);
      return NextResponse.json(
        {
          error:
            errorData.error || errorData.message || "Failed to create booking",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend success response:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
