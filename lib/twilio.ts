import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

// "sms" or "whatsapp". Default to sms; set whatsapp while using the Twilio
// Sandbox before A2P/Toll-Free verification is approved.
const CHANNEL = (process.env.TWILIO_CHANNEL ?? "sms").toLowerCase();

const client = twilio(accountSid, authToken);

function withChannel(e164: string) {
  return CHANNEL === "whatsapp" ? `whatsapp:${e164}` : e164;
}

export async function sendSms(to: string, body: string) {
  return client.messages.create({
    to: withChannel(to),
    from: withChannel(fromNumber),
    body,
  });
}

// Twilio prefixes inbound WhatsApp `From` with `whatsapp:`. Strip it so the
// state lookup key matches what /api/trigger stored.
export function normalizeInboundFrom(from: string): string {
  return from.replace(/^whatsapp:/i, "");
}
