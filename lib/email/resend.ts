/**
 * Resend email helper. No-op with a warning if RESEND_API_KEY is missing,
 * so dev works without email before the key is set.
 *
 * Note on Resend test mode: without a verified sending domain, Resend will
 * ONLY deliver to the email that owns your Resend account. Other recipients
 * get silently dropped. Verify a domain in Resend dashboard to send to all.
 */

type SendResult =
  | { sent: true }
  | { skipped: true; reason: "no-key" }
  | { failed: true; reason: string };

let cachedClient: unknown = null;

async function getClient() {
  if (cachedClient) return cachedClient as { emails: { send: (args: unknown) => Promise<{ data: unknown; error: { name?: string; message?: string } | null }> } };
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  cachedClient = new Resend(key);
  return cachedClient as { emails: { send: (args: unknown) => Promise<{ data: unknown; error: { name?: string; message?: string } | null }> } };
}

function getFrom(): string {
  return process.env.RESEND_FROM_EMAIL ?? "AutismConnect <onboarding@resend.dev>";
}

export async function sendWaitlistWelcome(email: string, state: string): Promise<SendResult> {
  const client = await getClient();
  if (!client) {
    console.warn("[resend] RESEND_API_KEY not set — skipping waitlist email.");
    return { skipped: true, reason: "no-key" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stateLine = state && state !== "GA"
    ? ` We're starting in Georgia and tracking demand in <strong>${state}</strong> — you're helping us decide where to go next.`
    : "";

  const { error } = await client.emails.send({
    from: getFrom(),
    to: email,
    subject: "Welcome to AutismConnect 💛",
    html: welcomeEmailHtml({ appUrl, stateLine }),
    text: welcomeEmailText({ appUrl, stateLine }),
  });

  if (error) {
    console.error("[resend] send failed:", error.name, error.message);
    return { failed: true, reason: `${error.name ?? "SendError"}: ${error.message ?? "Unknown"}` };
  }

  return { sent: true };
}

function welcomeEmailHtml({ appUrl, stateLine }: { appUrl: string; stateLine: string }) {
  return `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#FFF8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#2D1B4E;">
    <div style="max-width:560px; margin:0 auto; padding:32px 24px;">
      <div style="text-align:center; margin-bottom:28px;">
        <div style="display:inline-block; background:#2D1B4E; color:#FFF8F0; padding:8px 16px; border-radius:999px; font-weight:800; font-size:14px;">
          AutismConnect
        </div>
      </div>

      <div style="background:#fff; border-radius:24px; padding:36px 32px; box-shadow:0 20px 60px -20px rgba(45,27,78,0.12);">
        <h1 style="margin:0 0 12px; font-size:32px; line-height:1.15;">
          You're in. 🎉
        </h1>
        <p style="margin:0 0 20px; font-size:16px; line-height:1.6;">
          Thanks for joining the AutismConnect waitlist.${stateLine} We'll email
          you the moment we open the doors in your state.
        </p>

        <div style="border-top:1px solid rgba(45,27,78,0.08); padding-top:24px; margin-top:24px;">
          <h2 style="margin:0 0 10px; font-size:18px;">What is AutismConnect?</h2>
          <p style="margin:0 0 14px; font-size:15px; line-height:1.65;">
            A warm, parent-led home for everything autism families need — in one
            place. We know the 100+ hours of late-night searching. We've been there.
          </p>
          <ul style="margin:0 0 14px; padding-left:20px; font-size:15px; line-height:1.75;">
            <li><strong>Verified local resources</strong> — therapists, schools, doctors, nonprofits, filtered by city, insurance, and specialty</li>
            <li><strong>A real parent community</strong> — share what worked, ask hard questions, DM another parent</li>
            <li><strong>AI guidance</strong> — quick answers on IEPs, therapies, benefits, diagnosis — linked to our own resources</li>
          </ul>
        </div>

        <div style="border-top:1px solid rgba(45,27,78,0.08); padding-top:24px; margin-top:24px;">
          <h2 style="margin:0 0 10px; font-size:18px;">Our vision</h2>
          <p style="margin:0; font-size:15px; line-height:1.65;">
            Every autism family deserves a trusted map. We're building that map —
            state by state, provider by verified provider — so parents can spend
            less time searching and more time with their kids.
          </p>
        </div>

        <div style="text-align:center; margin-top:32px;">
          <a href="${appUrl}/signup"
             style="display:inline-block; background:#FF6B5A; color:#fff; padding:14px 28px; border-radius:999px; font-weight:800; text-decoration:none; font-size:15px;">
            Create my account →
          </a>
          <p style="margin:14px 0 0; font-size:13px; color:rgba(45,27,78,0.55);">
            You can already sign up and explore what's live.
          </p>
        </div>
      </div>

      <p style="text-align:center; margin:22px 0 0; font-size:12px; line-height:1.6; color:rgba(45,27,78,0.55);">
        Made with care for autism families.<br/>
        — the AutismConnect team<br/>
        <a href="${appUrl}" style="color:rgba(45,27,78,0.55);">${appUrl.replace(/^https?:\/\//, "")}</a>
      </p>
    </div>
  </body>
</html>`;
}

function welcomeEmailText({ appUrl, stateLine }: { appUrl: string; stateLine: string }) {
  return `You're in. 🎉

Thanks for joining the AutismConnect waitlist.${stateLine.replace(/<[^>]+>/g, "")}
We'll email you the moment we open the doors in your state.

What is AutismConnect?
A warm, parent-led home for everything autism families need — in one place.
- Verified local resources: therapists, schools, doctors, nonprofits
- A real parent community: share what worked, ask hard questions, DM other parents
- AI guidance: quick answers on IEPs, therapies, benefits, diagnosis

Our vision
Every autism family deserves a trusted map. We're building that map — state by
state, provider by verified provider — so parents can spend less time searching
and more time with their kids.

Create your account: ${appUrl}/signup

— the AutismConnect team
${appUrl}`;
}
