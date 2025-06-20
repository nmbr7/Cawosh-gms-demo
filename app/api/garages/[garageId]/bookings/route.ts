import { NextResponse } from "next/server";
import { BookingData, BookingStatus } from "@/app/models/booking";
import { generateId } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const garageId = request.url.split("/").pop();
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "serviceId",
      "serviceName",
      "customer",
      "car",
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
      id: generateId("BK"),
      tenant_id: garageId || "",
      serviceId: body.serviceId,
      serviceName: body.serviceName,
      customer: {
        name: body.customer.name,
        email: body.customer.email,
        phone: body.customer.phone,
        notes: body.customer.notes || "",
      },
      car: {
        id: generateId("CAR"),
        make: body.car.make,
        model: body.car.model,
        year: body.car.year,
        registrationNumber: body.car.registration,
        taxStatus: "taxed",
        motStatus: "valid",
        firstRegistrationDate: new Date().toISOString(),
        yearOfManufacture: body.car.year,
        engineCapacity: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      bay: body.bay,
      status: "scheduled" as BookingStatus,
      bookingType: "offline", // Default to offline booking for now
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
