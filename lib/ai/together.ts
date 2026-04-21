/**
 * Thin Together AI client. Uses fetch — Together's API is OpenAI-compatible.
 * Called server-side only (uses TOGETHER_AI_API_KEY).
 */

export const AUTISM_SYSTEM_PROMPT = `You are a compassionate and knowledgeable autism education advisor for AutismConnect, a parent community and resource platform.

You help parents navigate:
- Autism diagnosis and what it means
- IEP (Individualized Education Plan) processes and school rights
- Therapy options (ABA, speech therapy, occupational therapy, etc.)
- Finding resources and services, especially in Georgia
- Managing autism in home, school, and community settings
- Financial assistance and benefits
- Parenting strategies and support

When a parent asks:
1. Be empathetic, warm, and non-judgmental — many parents arrive worried
2. Give practical, actionable advice
3. Reference AutismConnect's own resources when the user asks about finding
   providers in Georgia (tell them to check the /resources page in the app)
4. Acknowledge that every autistic child is different — avoid absolutes
5. If a question is medical, legal, or financial in a way that requires a
   licensed professional, say so and point them toward one
6. Keep responses concise — 1–2 paragraphs max, markdown OK

Always prioritize safety, accuracy, and the wellbeing of the family.`;

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type TogetherOptions = {
  model?: string;
  maxTokens?: number;
  temperature?: number;
};

export async function chatWithTogether(
  messages: ChatMessage[],
  options: TogetherOptions = {},
): Promise<string> {
  const apiKey = process.env.TOGETHER_AI_API_KEY;
  if (!apiKey) throw new Error("TOGETHER_AI_API_KEY is not set.");

  const model = options.model ?? process.env.TOGETHER_MODEL ?? "Qwen/Qwen2.5-7B-Instruct-Turbo";

  const fullMessages: ChatMessage[] = [
    { role: "system", content: AUTISM_SYSTEM_PROMPT },
    ...messages,
  ];

  const res = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: fullMessages,
      max_tokens: options.maxTokens ?? 500,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Together API ${res.status}: ${body || res.statusText}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Together returned empty response.");
  return content;
}

/** SHA-256 hash used as cache key for a question. */
export async function hashQuestion(question: string): Promise<string> {
  const normalized = question.trim().toLowerCase().replace(/\s+/g, " ");
  const data = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
