import { NextResponse } from "next/server";

// Stubbed — real Twilio + Claude flow lands in the next pass.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.phoneNumber || !body?.locationSlug || !body?.eventType) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
