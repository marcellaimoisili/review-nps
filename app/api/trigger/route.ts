import { NextResponse } from "next/server";
import { LOCATIONS } from "@/lib/locations";
import { callClaude } from "@/lib/claude";
import { sendSms } from "@/lib/twilio";
import { setConversation, type ConversationState } from "@/lib/redis";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    phoneNumber?: string;
    locationSlug?: string;
    eventType?: "move_in" | "move_out";
    customerName?: string;
  } | null;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phoneNumber = body?.phoneNumber?.trim();
  const locationSlug = body?.locationSlug;
  const eventType = body?.eventType;
  const customerName = body?.customerName?.trim();

  if (!phoneNumber || !locationSlug || !eventType || !customerName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (!/^\+\d{10,15}$/.test(phoneNumber)) {
    return NextResponse.json(
      { error: "Phone number must be E.164 format (e.g. +12125551234)" },
      { status: 400 },
    );
  }

  const location = LOCATIONS[locationSlug];
  if (!location) {
    return NextResponse.json({ error: "Unknown location" }, { status: 400 });
  }

  if (eventType !== "move_in" && eventType !== "move_out") {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  try {
    const claude = await callClaude({
      location,
      customerName,
      eventType,
      messages: [],
      bootstrap: true,
    });

    await sendSms(phoneNumber, claude.message);

    const state: ConversationState = {
      locationSlug,
      eventType,
      customerName,
      stage: "awaiting_response",
      sentiment: claude.sentiment,
      npsScore: claude.nps_score,
      messages: [{ role: "assistant", content: claude.message }],
    };

    await setConversation(phoneNumber, state);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/trigger] failed", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to send SMS: ${message}` },
      { status: 500 },
    );
  }
}
