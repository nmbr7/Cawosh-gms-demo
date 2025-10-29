import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookies = request.cookies;
    const accessToken = cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'No access token found' },
        { status: 401 },
      );
    }

    // Fetch form options from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/users/form-options`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data || data,
    });
  } catch (error) {
    console.error('Error fetching form options:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch form options',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
