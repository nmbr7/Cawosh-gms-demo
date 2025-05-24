import { NextResponse } from "next/server";
import mockBookings from "@/app/mock-db/db.json";

export async function GET(request: Request): Promise<NextResponse> {
  // Add 1 second delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { searchParams }: URL = new URL(request.url);

  // Pagination parameters
  const page: number = parseInt(searchParams.get("page") || "1");
  const limit: number = parseInt(searchParams.get("limit") || "10");

  // Filter parameters
  const bay: number | null = searchParams.get("bay")
    ? parseInt(searchParams.get("bay")!)
    : null;
  const status: string | null = searchParams.get("status") || null;
  const customerName: string | null = searchParams.get("customerName") || null;
  const description: string | null = searchParams.get("description") || null;

  // Date range parameters
  const today = new Date();
  console.log("today", today);
  const firstDayOfMonth = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  );
  const lastDayOfMonth = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)
  );

  const startDate = new Date(searchParams.get("startDate") || firstDayOfMonth);
  const endDate = new Date(searchParams.get("endDate") || lastDayOfMonth);
  // Sort parameters
  const sortBy: string = searchParams.get("sortBy") || "date";
  const sortOrder: "asc" | "desc" = (searchParams.get("sortOrder") ||
    "desc") as "asc" | "desc";

  // Apply filters
  const filteredBookings = mockBookings.bookings.filter((booking) => {
    // Date range filter
    const bookingDate = booking.date;
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];
    const isInDateRange =
      bookingDate >= startDateStr && bookingDate <= endDateStr;

    // Bay filter
    const matchesBay = bay === null || booking.bay === bay;

    // Status filter
    const matchesStatus = status === null || booking.status === status;

    // Customer name filter (case-insensitive)
    const matchesCustomer =
      customerName === null ||
      booking.customerName.toLowerCase().includes(customerName.toLowerCase());

    // Description filter (case-insensitive)
    const matchesDescription =
      description === null ||
      booking.description.toLowerCase().includes(description.toLowerCase());

    return (
      isInDateRange &&
      matchesBay &&
      matchesStatus &&
      matchesCustomer &&
      matchesDescription
    );
  });

  // Apply sorting
  filteredBookings.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime(); // Latest first by default
        break;
      case "startTime":
        comparison = b.startTime.localeCompare(a.startTime); // Latest first by default
        break;
      case "customerName":
        comparison = a.customerName.localeCompare(b.customerName);
        break;
      case "description":
        comparison = a.description.localeCompare(b.description);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime(); // Latest first by default
    }

    return sortOrder === "asc" ? -comparison : comparison; // Reverse the order if ascending is requested
  });

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredBookings.length / limit);

  const response = {
    bookings: paginatedBookings,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: filteredBookings.length,
      itemsPerPage: limit,
    },
  };

  return NextResponse.json(response);
}
