import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, ConversationStage, Sentiment } from "./redis";
import type { StorageLocation } from "./locations";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 400;

export interface ClaudeResponse {
  message: string;
  sentiment: Sentiment;
  nps_score: number | null;
  stage: ConversationStage;
}

interface BuildSystemPromptArgs {
  location: StorageLocation;
  customerName: string;
  eventType: "move_in" | "move_out";
}

function buildSystemPrompt({
  location,
  customerName,
  eventType,
}: BuildSystemPromptArgs): string {
  const eventVerb = eventType === "move_in" ? "moved in" : "moved out";

  return `You are a friendly customer experience agent for ${location.name} at ${location.address}.
The customer (${customerName}) just ${eventVerb}.

Your conversation goals:
1. Open by thanking them and asking how the experience was on a scale of 1–10.
2. If they respond with 8+ OR positive sentiment ("great", "loved it", "awesome"), thank them warmly and tell them you're sending a Google review link. Set sentiment to "positive" and stage to "review_sent".
3. If they respond with below 8 OR negative sentiment, ask ONE empathetic follow-up question to understand what went wrong. Set sentiment to "negative" and stage to "collecting_feedback".
4. If sentiment is truly ambiguous, gently ask for clarification. Set sentiment to "unclear" and stage to "awaiting_response".
5. After collecting negative feedback (one follow-up), thank them for sharing and assure them the team will look into it. Set stage to "complete".

Rules:
- Keep every message under 160 characters (1 SMS segment).
- Be warm and human, not corporate.
- NEVER generate URLs or links — the system appends them.
- If positive sentiment without a number, treat as positive. Don't force the customer to provide a numeric rating.
- If negative sentiment without a number, go to feedback mode. Don't force a rating number.

Respond ONLY with raw JSON (no markdown, no backticks, no commentary):
{"message": "your SMS text", "sentiment": "positive" | "negative" | "unclear", "nps_score": <1-10 or null>, "stage": "awaiting_response" | "review_sent" | "collecting_feedback" | "complete"}`;
}

interface CallClaudeArgs extends BuildSystemPromptArgs {
  messages: ChatMessage[];
  bootstrap?: boolean;
}

export async function callClaude({
  location,
  customerName,
  eventType,
  messages,
  bootstrap = false,
}: CallClaudeArgs): Promise<ClaudeResponse> {
  const system = buildSystemPrompt({ location, customerName, eventType });

  // For the very first outbound, give Claude an explicit nudge to open the convo.
  const apiMessages = bootstrap
    ? [
        {
          role: "user" as const,
          content:
            "Send the opening SMS now to greet the customer and ask for their 1–10 rating.",
        },
      ]
    : messages.map((m) => ({ role: m.role, content: m.content }));

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: apiMessages,
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  return parseResponse(text);
}

function parseResponse(raw: string): ClaudeResponse {
  // Strip code fences if Claude returns markdown anyway
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      message: String(parsed.message ?? "").slice(0, 320),
      sentiment: normalizeSentiment(parsed.sentiment),
      nps_score:
        typeof parsed.nps_score === "number" ? parsed.nps_score : null,
      stage: normalizeStage(parsed.stage),
    };
  } catch {
    // Fallback so we always have something to send
    return {
      message:
        cleaned.slice(0, 160) ||
        "Thanks for the reply — we'll be in touch shortly.",
      sentiment: "unclear",
      nps_score: null,
      stage: "awaiting_response",
    };
  }
}

function normalizeSentiment(value: unknown): Sentiment {
  if (value === "positive" || value === "negative" || value === "unclear") {
    return value;
  }
  return null;
}

function normalizeStage(value: unknown): ConversationStage {
  if (
    value === "awaiting_response" ||
    value === "collecting_feedback" ||
    value === "review_sent" ||
    value === "complete"
  ) {
    return value;
  }
  return "awaiting_response";
}
