import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { tempToken, newPassword } = await request.json();

    // Validate required fields
    if (!tempToken || !newPassword) {
      return NextResponse.json(
        { error: "Temporary token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Forward the request to the real backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tempToken, newPassword }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to reset password" },
        { status: response.status }
      );
    }

    // Create the response
    const nextResponse = NextResponse.json({
      success: true,
      message: data.message || "Password reset successful",
      data: data.data,
    });

    // Set the access token in an HTTP-only cookie if provided
    if (data.data?.accessToken) {
      nextResponse.cookies.set("access_token", data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
