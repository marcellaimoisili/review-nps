import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
function redis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

export type ConversationStage =
  | "awaiting_response"
  | "collecting_feedback"
  | "review_sent"
  | "complete";

export type Sentiment = "positive" | "negative" | "unclear" | null;

export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

export interface ConversationState {
  locationSlug: string;
  eventType: "move_in" | "move_out";
  customerName: string;
  stage: ConversationStage;
  sentiment: Sentiment;
  npsScore: number | null;
  messages: ChatMessage[];
}

const KEY_PREFIX = "conversation:";
const TTL_SECONDS = 3600;

export function key(phoneNumber: string) {
  return `${KEY_PREFIX}${phoneNumber}`;
}

export async function getConversation(
  phoneNumber: string,
): Promise<ConversationState | null> {
  // Upstash auto-deserializes JSON values
  return (await redis().get<ConversationState>(key(phoneNumber))) ?? null;
}

export async function setConversation(
  phoneNumber: string,
  state: ConversationState,
): Promise<void> {
  await redis().set(key(phoneNumber), state, { ex: TTL_SECONDS });
}

export async function deleteConversation(phoneNumber: string): Promise<void> {
  await redis().del(key(phoneNumber));
}
