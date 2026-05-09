# Uniti Review Agent — take-home prototype

An AI agent that texts storage customers after a move-in / move-out, gauges
sentiment, and routes happy customers to a Google review link and prompts un-happy customers for internal feedback. 

- **Live demo:** https://review-nps.vercel.app
- **Repo:** https://github.com/marcellaimoisili/review-nps

## How it works

1. The landing page form simulates a PMS event (customer name, phone, location, move-in vs move-out trigger).
2. `POST /api/trigger` calls Claude with a system prompt to produce a warm SMS opener, sends it via Twilio, and stores conversation state in Upstash Redis (1 hr TTL).
3. The customer replies. Twilio hits `POST /api/webhook`, which loads state from Redis, asks Claude what to say next, and sends the reply.
4. If Claude classifies the reply as positive (8+ NPS or positive sentiment), the system appends the location's Google review URL to the message.
5. If negative, Claude asks one empathetic follow-up, then thanks them and closes the conversation.

## Stack

- Next.js 14 (App Router, TypeScript) on Vercel
- Tailwind CSS
- Anthropic Claude (`claude-sonnet-4-5`) — JSON-only output
- Twilio Programmable Messaging (SMS or WhatsApp)
- Upstash Redis (REST) for conversation state

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open http://localhost:3000.

> Local dev shares the same Upstash Redis as Vercel, so you can submit the form on `localhost` and let your reply get handled by the deployed `/api/webhook`. For full local debugging of the webhook, tunnel with `ngrok http 3000` and point the Twilio webhook at the ngrok URL.

## Environment variables

| Variable | Purpose |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio dashboard → Account Info |
| `TWILIO_AUTH_TOKEN` | Twilio dashboard → Account Info |
| `TWILIO_PHONE_NUMBER` | E.164 sender. See "SMS vs WhatsApp" below. |
| `TWILIO_CHANNEL` | `sms` or `whatsapp` (default `sms`) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `UPSTASH_REDIS_REST_URL` | console.upstash.com → DB → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | same page |

## SMS vs WhatsApp

US carriers require A2P 10DLC registration (or Toll-Free verification, 1–3 business days) before any programmatic long-code can deliver SMS to US numbers. For the purposes of this demo and getting it to work immediately, I implemented a work around so this prototype runs on the **Twilio WhatsApp Sandbox**.

### To switch back to real SMS once the twilio number is verified

In Vercel **Settings → Environment Variables** (and `.env.local` for local dev):

```
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX   # your verified Twilio number
TWILIO_CHANNEL=sms
```

Then redeploy. No code changes needed — `lib/twilio.ts` reads `TWILIO_CHANNEL` and skips the `whatsapp:` prefix when it's set to `sms`.

The Twilio number's webhook also needs to point at:
```
https://review-nps.vercel.app/api/webhook   (HTTP POST)
```

### Demoing on the WhatsApp Sandbox

The sandbox can only send to numbers that have opted in. Each tester has to do this once:

1. Open WhatsApp and start a chat with **+1 415 523 8886**
2. Send "join hide-finger" (twilio generated join code)
3. WhatsApp confirms you're in
4. Submit the form on https://review-nps.vercel.app — the agent's first message arrives via WhatsApp within a few seconds

## Project layout

```
app/
  page.tsx              # landing page (hero, form, How It Works, footer)
  layout.tsx            # Inter font, metadata
  api/
    trigger/route.ts    # POST: form submission → opening SMS
    webhook/route.ts    # POST: Twilio inbound replies
components/
  PhoneMockup.tsx       # animated iMessage demo in the hero
  DemoForm.tsx          # name / phone / location / move-in toggle form
lib/
  claude.ts             # system prompt + JSON parser
  twilio.ts             # send + channel toggle (sms / whatsapp)
  redis.ts              # Upstash client + state helpers
  locations.ts          # hardcoded CubeSmart NYC locations + Google review URLs
```

## Things I'd do next

- Twilio's A2P 10DLC registration so the demo doesn't depend on the sandbox.
- Capture negative-feedback transcripts in Redis and surface them in an internal dashboard so location managers can see issues without tripping NPS bias.
- Idempotency on `/api/trigger` (dedupe by phone + event within a window).
- Twilio webhook signature verification.
- A "send another" simulator from the success state so the recruiter can run more flows without re-typing.