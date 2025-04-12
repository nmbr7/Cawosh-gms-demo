import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // In a real application, you would:
    // 1. Generate a random OTP
    // 2. Store it in your database with an expiration time
    // 3. Send it via email/SMS service
    // For this example, we'll just return a success response

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
      success: true,
      message: 'Verification code has been sent to your email'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
} 