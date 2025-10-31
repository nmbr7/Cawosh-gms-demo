import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/notify
 * Forwards a POST request to the backend
 * Mimics: curl -X POST "http://localhost:8000/api/v1/notification/send-invoice-notification" -H "Content-Type: application/json" -d '{"invoice_id":"..."}'
 * Expects: { invoice_id: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Input validation
    if (!body.invoice_id || typeof body.invoice_id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid invoice_id in request body' },
        { status: 400 },
      );
    }

    const cookies = req.cookies;
    const accessToken = cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated. No access token found.' },
        { status: 401 },
      );
    }

    const backendBase = process.env.BACKEND_URL;
    if (!backendBase) {
      return NextResponse.json(
        { error: 'Backend URL is not configured in environment.' },
        { status: 500 },
      );
    }
    // Actual backend route includes /api/v1/notification/send-invoice-notification
    const backendUrl = `${backendBase}/api/v1/notification/send-invoice-notification`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ invoice_id: body.invoice_id }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || 'Failed to send invoice notification' },
        { status: response.status },
      );
    }

    // Let backend status code and content-type flow through
    return NextResponse.json(data, { status: response.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
