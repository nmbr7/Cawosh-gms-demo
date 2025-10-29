import { NextRequest, NextResponse } from 'next/server';
import { vhcRepo } from '@/lib/vhc/mockRepo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Extract all possible parameters
  const status = searchParams.get('status') || undefined;
  const assignedTo = searchParams.get('assignedTo') || undefined;
  const vehicleId = searchParams.get('vehicleId') || undefined;
  const powertrain = searchParams.get('powertrain') || undefined;
  const createdBy = searchParams.get('createdBy') || undefined;
  const page = searchParams.get('page')
    ? parseInt(searchParams.get('page')!)
    : undefined;
  const limit = searchParams.get('limit')
    ? parseInt(searchParams.get('limit')!)
    : undefined;
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const result = vhcRepo.listResponses({
    status,
    assignedTo,
    vehicleId,
    powertrain,
    createdBy,
    page,
    limit,
    sortBy,
    sortOrder,
    startDate,
    endDate,
  });

  return NextResponse.json(result);
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
      createdBy: body.createdBy ? String(body.createdBy) : 'system',
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
