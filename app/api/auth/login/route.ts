import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // First API call - Login
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      return NextResponse.json(
        { error: errorData.message || 'Login failed' },
        { status: loginResponse.status }
      );
    }

    const loginData = await loginResponse.json();

    console.log(loginData);

    // Second API call - Get user details
    const userResponse = await fetch(`${API_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${loginData.data.access_token}`,
      },
    });


    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch user details' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    // Create the response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData.data,
        token: loginData.data.access_token,
        permissions: loginData.data.permissions,
        systemAccess: loginData.data.system_access,
      },
    });

    // Set the access token in an HTTP-only cookie
    response.cookies.set('access_token', loginData.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to process login request' },
      { status: 500 }
    );
  }
} 