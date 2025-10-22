import { NextResponse } from "next/server";

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

    // Get backend URL from environment variable
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is not set");
    }

    // Forward the request to the real backend
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "X-Tenant-Slug": "autocare-pro",
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8000",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error.message || data.message || "Invalid email or password",
        },
        { status: response.status }
      );
    }

    // Create the response
    const nextResponse = NextResponse.json({
      success: true,
      message: "Login successful",
      data: data.data,
    });

    // Set the access token in an HTTP-only cookie
    if (data.data.token) {
      nextResponse.cookies.set("access_token", data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific error cases
    if (error instanceof TypeError && error.message.includes("fetch failed")) {
      return NextResponse.json(
        {
          error:
            "Unable to connect to authentication service. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process login request" },
      { status: 500 }
    );
  }
}
