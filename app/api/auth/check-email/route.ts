import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Mock database check
    const mockUsers = [
      { email: 'admin@cawosh.com' },
      { email: 'user@example.com' }
    ];

    const userExists = mockUsers.some(user => user.email === email);

    if (!userExists) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 