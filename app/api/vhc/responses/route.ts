import { NextRequest, NextResponse } from "next/server";
import { vhcRepo } from "@/lib/vhc/mockRepo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const assignedTo = searchParams.get("assignedTo") || undefined;
  const vehicleId = searchParams.get("vehicleId") || undefined;
  const data = vhcRepo.listResponses({ status, assignedTo, vehicleId });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const created = vhcRepo.createResponse({
      templateId: String(body.templateId),
      powertrain: body.powertrain,
      vehicleId: String(body.vehicleId),
      bookingId: body.bookingId ? String(body.bookingId) : undefined,
      serviceIds: Array.isArray(body.serviceIds)
        ? body.serviceIds.map((s: unknown) => String(s))
        : undefined,
      assignedTo: body.assignedTo ? String(body.assignedTo) : undefined,
      dueAt: body.dueAt ? String(body.dueAt) : undefined,
      createdBy: body.createdBy ? String(body.createdBy) : "system",
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
