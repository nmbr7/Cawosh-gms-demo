import { NextResponse } from "next/server";
import { BookingData, BookingStatus } from "@/app/models/booking";

export async function POST(request: Request) {
  try {
    const garageId = request.url.split("/").pop();
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "services",
      "customer",
      "vehicle",
      "date",
      "startTime",
      "endTime",
      "bay",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new booking
    const newBooking: BookingData & { tenant_id: string } = {
      tenant_id: garageId || "",
      services: body.services,
      customer: {
        name: body.customer.name,
        email: body.customer.email,
        phone: body.customer.phone,
      },
      vehicle: {
        make: body.vehicle.make,
        model: body.vehicle.model,
        year: body.vehicle.year,
        license: body.vehicle.registration,
        vin: body.vehicle.vin,
      },
      bookingDate: body.date,
      assignedBay: body.bay,
      status: "scheduled" as BookingStatus,
      totalDuration: body.totalDuration,
      totalPrice: body.totalPrice,
      assignedStaff: body.assignedStaff,
      garage_id: garageId || "",
      history: [],
    };

    // TODO: Save to database
    // For now, we'll just return the created booking
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch bookings
export async function GET(
  request: Request,
  { params }: { params: Promise<{ garageId: string }> }
) {
  try {
    const { garageId } = await params;
    console.log("garageId", garageId);

    // TODO: Fetch from database
    // For now, return empty array
    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
