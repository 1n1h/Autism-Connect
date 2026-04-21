/**
 * Resend email helper. No-op with a warning if RESEND_API_KEY is missing,
 * so dev works without email before the key is set.
 */

let cachedClient: unknown = null;

async function getClient() {
  if (cachedClient) return cachedClient as { emails: { send: (args: unknown) => Promise<unknown> } };
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  cachedClient = new Resend(key);
  return cachedClient as { emails: { send: (args: unknown) => Promise<unknown> } };
}

export async function sendWaitlistWelcome(email: string, state: string) {
  const client = await getClient();
  if (!client) {
    console.warn("[resend] RESEND_API_KEY not set — skipping waitlist email.");
    return { skipped: true as const };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "AutismConnect <onboarding@resend.dev>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await client.emails.send({
    from,
    to: email,
    subject: "You're on the AutismConnect waitlist 💛",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; color: #2D1B4E; background: #FFF8F0; border-radius: 24px;">
        <h1 style="font-size: 28px; margin: 0 0 12px;">You're in. 🎉</h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          Thanks for joining the AutismConnect waitlist. We&rsquo;re
          launching first in <strong>Georgia</strong>${state && state !== "GA" ? ` and tracking demand in <strong>${state}</strong>` : ""} — we&rsquo;ll email
          you the moment we open the doors in your state.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
          In the meantime, you can already create an account and explore
          what&rsquo;s live:
        </p>
        <a href="${appUrl}/signup" style="display: inline-block; background: #FF6B5A; color: #fff; padding: 12px 24px; border-radius: 999px; font-weight: bold; text-decoration: none;">
          Create my account
        </a>
        <p style="font-size: 13px; line-height: 1.6; margin: 32px 0 0; color: #2D1B4E88;">
          Made with care for autism families.<br />
          — the AutismConnect team
        </p>
      </div>
    `,
  });

  return { sent: true as const };
}
