import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Create a response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the HTTP-only cookie
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to process logout request' },
      { status: 500 }
    );
  }
} 