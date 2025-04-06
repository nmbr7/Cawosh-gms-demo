// /app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json([
        { id: 1, name: "John Doe", email: "john@cawosh.com" },
        { id: 2, name: "Jane Admin", email: "jane@cawosh.com" },
    ]);
}
