import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { chatWithTogether, hashQuestion, type ChatMessage } from "@/lib/ai/together";

const RATE_LIMIT_PER_HOUR = 50;
const CACHE_HOURS = 24;

/**
 * POST /api/ai-chat
 * Body: { messages: ChatMessage[] }  — conversation so far (user + assistant turns)
 *
 * Response: { message: string, cached: boolean, remaining: number }
 */
export async function POST(request: Request) {
  // Auth required
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Server is not configured." },
      { status: 500 },
    );
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  // Parse body
  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser || !lastUser.content?.trim()) {
    return NextResponse.json({ error: "No question provided." }, { status: 400 });
  }
  const question = lastUser.content.trim();
  if (question.length > 2000) {
    return NextResponse.json(
      { error: "Question is too long. Keep it under 2000 characters." },
      { status: 400 },
    );
  }

  // Service client for rate-limit + cache writes
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "Server AI is not configured." },
      { status: 500 },
    );
  }
  const sb = createServiceClient();

  // Rate limit check — 50 requests per rolling hour per user
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: usageCount, error: usageErr } = await sb
    .from("ai_chat_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneHourAgo);

  if (usageErr) {
    console.error("[ai-chat] rate-limit check failed:", usageErr.message);
  } else if ((usageCount ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return NextResponse.json(
      {
        error: `You've hit the hourly limit (${RATE_LIMIT_PER_HOUR}). Try again in a bit.`,
        remaining: 0,
      },
      { status: 429 },
    );
  }

  const remaining = Math.max(0, RATE_LIMIT_PER_HOUR - ((usageCount ?? 0) + 1));

  // Cache lookup — single-turn questions only (conversations with prior context
  // shouldn't be cached since the context affects the response).
  const isFreshQuestion = messages.filter((m) => m.role === "user").length === 1;
  if (isFreshQuestion) {
    try {
      const hash = await hashQuestion(question);
      const { data: cached } = await sb
        .from("ai_chat_cache")
        .select("response, expires_at")
        .eq("question_hash", hash)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (cached) {
        // Don't count cached hits against rate limit — they're free.
        return NextResponse.json({ message: cached.response, cached: true, remaining });
      }
    } catch (err) {
      console.warn("[ai-chat] cache lookup failed:", err);
    }
  }

  // Call Together
  let answer: string;
  try {
    answer = await chatWithTogether(messages);
  } catch (err) {
    console.error("[ai-chat] Together call failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI service unavailable." },
      { status: 502 },
    );
  }

  // Record usage + cache (best effort)
  try {
    await sb.from("ai_chat_usage").insert({ user_id: user.id });
  } catch (err) {
    console.warn("[ai-chat] usage log failed:", err);
  }

  if (isFreshQuestion) {
    try {
      const hash = await hashQuestion(question);
      const expires = new Date(Date.now() + CACHE_HOURS * 60 * 60 * 1000).toISOString();
      await sb
        .from("ai_chat_cache")
        .upsert(
          {
            question_hash: hash,
            question,
            response: answer,
            expires_at: expires,
          },
          { onConflict: "question_hash" },
        );
    } catch (err) {
      console.warn("[ai-chat] cache write failed:", err);
    }
  }

  return NextResponse.json({ message: answer, cached: false, remaining });
}
