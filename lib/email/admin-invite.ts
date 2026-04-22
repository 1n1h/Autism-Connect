let cachedClient: unknown = null;

async function getClient() {
  if (cachedClient)
    return cachedClient as {
      emails: { send: (args: unknown) => Promise<{ data: unknown; error: { message?: string } | null }> };
    };
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  cachedClient = new Resend(key);
  return cachedClient as {
    emails: { send: (args: unknown) => Promise<{ data: unknown; error: { message?: string } | null }> };
  };
}

type Mode = "promoted" | "invited";
type SendResult =
  | { sent: true }
  | { skipped: true; reason: "no-key" }
  | { failed: true; reason: string };

/**
 * Emails an admin-access notice.
 *  - mode "promoted": user already had an account; we flipped is_admin.
 *  - mode "invited": we queued an invite; they need to sign up first.
 */
export async function sendAdminInvite(
  email: string,
  mode: Mode,
  invitedBy?: string,
): Promise<SendResult> {
  const client = await getClient();
  if (!client) {
    console.warn("[resend] RESEND_API_KEY not set — skipping admin invite email.");
    return { skipped: true, reason: "no-key" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const from = process.env.RESEND_FROM_EMAIL ?? "AutismConnect <onboarding@resend.dev>";

  const cta =
    mode === "promoted"
      ? { label: "Sign in to the admin area", href: `${appUrl}/login?next=/admin` }
      : { label: "Create your account", href: `${appUrl}/signup` };

  const body =
    mode === "promoted"
      ? "Your existing AutismConnect account has been granted admin access. Sign in, then look for the Admin button on your dashboard."
      : "You've been invited to help run AutismConnect. Sign up with this email — your account will be marked as admin automatically.";

  const { error } = await client.emails.send({
    from,
    to: email,
    subject: "You've been granted admin access on AutismConnect",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#2D1B4E;background:#FFF8F0;border-radius:24px;">
        <h1 style="font-size:26px;margin:0 0 12px;">You're an admin.</h1>
        <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
          ${invitedBy ? `<strong>${invitedBy}</strong> has granted you admin access` : "You've been granted admin access"}
          on AutismConnect.
        </p>
        <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">${body}</p>
        <a href="${cta.href}" style="display:inline-block;background:#2D1B4E;color:#fff;padding:12px 24px;border-radius:999px;font-weight:bold;text-decoration:none;">${cta.label} →</a>
        <p style="font-size:12px;color:#2D1B4E88;margin:24px 0 0;">
          If you didn't expect this, reach out to the person who invited you.
        </p>
      </div>`,
    text: `${body}\n\n${cta.label}: ${cta.href}`,
  });

  if (error) {
    console.error("[resend] admin invite failed:", error.message);
    return { failed: true, reason: error.message ?? "unknown" };
  }
  return { sent: true };
}
