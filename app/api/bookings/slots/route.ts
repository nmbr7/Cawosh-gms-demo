import { NextRequest, NextResponse } from 'next/server';
import { Slot } from '@/app/models/slot';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bay = Number(searchParams.get('bay'));

  if (!bay) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Return the same slots for every day requested
  const slots: Slot[] = [
    { bay, start: '09:00', end: '10:00' },
    { bay, start: '10:00', end: '11:00' },
    { bay, start: '11:00', end: '12:00' },
    { bay, start: '13:00', end: '14:00' },
    { bay, start: '14:00', end: '15:00' },
    { bay, start: '15:00', end: '16:00' },
    { bay, start: '16:00', end: '17:00' },
  ];

  return NextResponse.json({ slots });
}
