import { NextResponse } from "next/server";
import { MOCK_ADMIN } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Mock login validation
    if (email !== MOCK_ADMIN.email || password !== "password") {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Mock successful login response
    const mockLoginData = {
      data: {
        access_token: "mock-jwt-token",
        permissions: MOCK_ADMIN.permissions,
        system_access: MOCK_ADMIN.systemAccess,
      },
    };

    // Create the response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: MOCK_ADMIN,
        token: mockLoginData.data.access_token,
        permissions: mockLoginData.data.permissions,
        systemAccess: mockLoginData.data.system_access,
      },
    });

    // Set the access token in an HTTP-only cookie
    response.cookies.set("access_token", mockLoginData.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to process login request" },
      { status: 500 }
    );
  }
}
