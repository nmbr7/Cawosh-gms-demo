import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  // Parse query params
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const department = searchParams.get("department");

  // Build backend API URL
  const backendUrl = new URL(
    `${process.env.BACKEND_URL}/api/users` || "http://localhost:3000/api/users"
  );
  backendUrl.searchParams.set("page", page);
  backendUrl.searchParams.set("limit", limit);
  backendUrl.searchParams.set("sortBy", sortBy);
  backendUrl.searchParams.set("sortOrder", sortOrder);
  if (role) backendUrl.searchParams.set("role", role);
  if (status) backendUrl.searchParams.set("status", status);
  if (search) backendUrl.searchParams.set("search", search);
  if (department) backendUrl.searchParams.set("department", department);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const backendRes = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const backendData = await backendRes.json();

    // If backend already returns the correct structure, just forward it
    if (
      backendData &&
      typeof backendData.success === "boolean" &&
      Array.isArray(backendData.data) &&
      backendData.pagination
    ) {
      return NextResponse.json(backendData, { status: backendRes.status });
    }

    // Otherwise, map the response to the expected structure
    return NextResponse.json(
      {
        success: backendRes.ok,
        data: backendData.users || [],
        pagination: backendData.pagination || {},
      },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch users from backend" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const backendUrl =
      `${process.env.BACKEND_URL}/api/users` ||
      "http://localhost:3000/api/users";

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
