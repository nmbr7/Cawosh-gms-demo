import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract garageId from the URL
    const url = new URL(request.url);
    const garageId = url.pathname.split("/")[3]; // /api/garages/[garageId]/tax

    const body = await request.json();
    console.log("body", body);

    // Forward the PATCH request to the backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/garages/${garageId}/tax`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating garage tax configuration:", error);
    return NextResponse.json(
      { error: "Failed to update garage tax configuration" },
      { status: 500 }
    );
  }
}
