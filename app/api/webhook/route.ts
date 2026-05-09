import { LOCATIONS } from "@/lib/locations";
import { callClaude } from "@/lib/claude";
import { sendSms } from "@/lib/twilio";
import {
  getConversation,
  setConversation,
  type ChatMessage,
} from "@/lib/redis";

export const runtime = "nodejs";

const TWIML_EMPTY = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function twimlResponse() {
  return new Response(TWIML_EMPTY, {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const from = formData.get("From");
  const bodyRaw = formData.get("Body");

  if (typeof from !== "string" || typeof bodyRaw !== "string") {
    return twimlResponse();
  }

  const body = bodyRaw.trim();
  if (!body) return twimlResponse();

  const state = await getConversation(from);
  if (!state) {
    // No active conversation — silently ignore (stale or unknown number)
    return twimlResponse();
  }

  const location = LOCATIONS[state.locationSlug];
  if (!location) {
    console.error("[/api/webhook] unknown location", state.locationSlug);
    return twimlResponse();
  }

  // Append the customer's message
  const updatedMessages: ChatMessage[] = [
    ...state.messages,
    { role: "user", content: body },
  ];

  try {
    const claude = await callClaude({
      location,
      customerName: state.customerName,
      eventType: state.eventType,
      messages: updatedMessages,
    });

    // If Claude routed to review_sent, append the Google review URL
    let outboundBody = claude.message;
    if (claude.sentiment === "positive" && claude.stage === "review_sent") {
      outboundBody = `${claude.message}\n\n${location.reviewUrl}`;
    }

    await sendSms(from, outboundBody);

    await setConversation(from, {
      ...state,
      stage: claude.stage,
      sentiment: claude.sentiment ?? state.sentiment,
      npsScore: claude.nps_score ?? state.npsScore,
      messages: [
        ...updatedMessages,
        { role: "assistant", content: claude.message },
      ],
    });
  } catch (err) {
    console.error("[/api/webhook] failed", err);
  }

  return twimlResponse();
}
