import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Forward the request to the real backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/auth/request-password-reset`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to request password reset' },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        data.message || 'If your email is registered, you will receive an OTP',
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 },
    );
  }
}
