import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Mock OTP generation
    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    // In a real application, you would:
    // 1. Store the OTP in the database with an expiration time
    // 2. Send the OTP via email

    return NextResponse.json({
      message: 'OTP sent successfully',
      otp, // Remove this in production
    });
  } catch {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
