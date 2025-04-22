import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name, userType = 'customer' } = await request.json();

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock existing user check
    if (email === "admin@cawosh.com") {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Mock successful registration
    const mockUser = {
      id: Math.floor(Math.random() * 1000) + 2, // Random ID (avoiding 1 which is admin)
      name,
      email,
      role: userType,
      userType
    };

    return NextResponse.json({
      success: true,
      token: "mock-jwt-token-for-development-" + mockUser.id,
      user: mockUser
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to process registration request' },
      { status: 500 }
    );
  }
} 