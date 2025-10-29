import { NextResponse } from 'next/server';
import { bayBreaks } from '@/app/config/bay-breaks';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bay = parseInt(searchParams.get('bay') || '0');

  if (bay) {
    // Return break time for specific bay
    const bayBreak = bayBreaks.find((breakTime) => breakTime.bay === bay);
    return NextResponse.json(bayBreak || null);
  }

  // Return all bay breaks if no specific bay is requested
  return NextResponse.json(bayBreaks);
}
