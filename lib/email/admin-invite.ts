let cachedClient: unknown = null;

async function getClient() {
  if (cachedClient) return cachedClient as { emails: { send: (args: unknown) => Promise<{ data: unknown; error: { message?: string } | null }> } };
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  cachedClient = new Resend(key);
  return cachedClient as { emails: { send: (args: unknown) => Promise<{ data: unknown; error: { message?: string } | null }> } };
}

export async function sendAdminInvite(email: string, token: string, invitedBy?: string) {
  const client = await getClient();
  if (!client) {
    console.warn("[resend] RESEND_API_KEY not set — skipping admin invite email.");
    return { skipped: true as const };
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const from = process.env.RESEND_FROM_EMAIL ?? "AutismConnect <onboarding@resend.dev>";
  const link = `${appUrl}/admin/accept-invite/${token}`;

  const { error } = await client.emails.send({
    from,
    to: email,
    subject: "You've been invited to help run AutismConnect",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; color: #2D1B4E; background: #FFF8F0; border-radius: 24px;">
        <h1 style="font-size: 26px; margin: 0 0 12px;">You're invited.</h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          ${invitedBy ? `<strong>${invitedBy}</strong> invited you` : "You've been invited"} to help run <strong>AutismConnect</strong> as an admin.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
          Click below to set your password and finish setup. This link expires in 7 days.
        </p>
        <a href="${link}" style="display:inline-block; background:#2D1B4E; color:#fff; padding:12px 24px; border-radius:999px; font-weight:bold; text-decoration:none;">
          Accept invite →
        </a>
        <p style="font-size:12px; color:#2D1B4E88; margin:24px 0 0;">
          If you didn't expect this, ignore the email — the link will stop working.
        </p>
      </div>`,
    text: `You've been invited to help run AutismConnect as an admin.\n\nAccept the invite: ${link}\n\nThis link expires in 7 days.`,
  });

  if (error) {
    console.error("[resend] admin invite failed:", error.message);
    return { failed: true as const, reason: error.message ?? "unknown" };
  }
  return { sent: true as const };
}
