import { ENV } from "./_core/env";

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character] ?? character));

const mailboxPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const formattedMailboxPattern = /^[^<>]+<([^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)>$/;

function normalizeSenderAddress(value: string) {
  const sender = value.trim();
  if (mailboxPattern.test(sender)) return `SPORTIX Partners <${sender}>`;
  if (formattedMailboxPattern.test(sender)) return sender;
  throw new Error("SPORTIX email sender is invalid. Use name@domain.com or SPORTIX <name@domain.com>");
}

export async function sendPartnerVerificationEmail({ email, fullName, code }: { email: string; fullName: string; code: string }) {
  const apiKey = ENV.resendApiKey.trim();
  const from = ENV.contactSenderEmail.trim();
  if (!apiKey || !from) throw new Error("SPORTIX verification email is not configured");
  const sender = normalizeSenderAddress(from);

  const html = `<!doctype html><html lang="en"><body style="margin:0;background:#050505;padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#0b0c0a;border:1px solid #2a2d27"><tr><td style="padding:30px 32px;border-bottom:3px solid #c6f500"><p style="margin:0;color:#c6f500;font:800 12px Arial,sans-serif;letter-spacing:2px">SPORTIX PARTNERS</p><h1 style="margin:12px 0 0;color:#f4f5f1;font:700 26px Arial,sans-serif">Verify your email</h1></td></tr><tr><td style="padding:30px 32px"><p style="margin:0 0 18px;color:#dfe3dc;font:15px/24px Arial,sans-serif">Hello ${escapeHtml(fullName)}, use this code to activate your SPORTIX Partners account.</p><p style="margin:0;padding:18px 20px;background:#121510;border-left:3px solid #c6f500;color:#f4f5f1;font:700 30px/36px Arial,sans-serif;letter-spacing:8px;text-align:center">${code}</p><p style="margin:20px 0 0;color:#8d948b;font:13px/20px Arial,sans-serif">This code expires in 10 minutes and can be used once. If you did not create this account, you can ignore this email.</p></td></tr></table></td></tr></table></body></html>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(10_000),
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "User-Agent": "sportix-partners-auth/1.0" },
    body: JSON.stringify({
      from: sender,
      to: [email],
      subject: "Verify your SPORTIX Partners email",
      text: `SPORTIX Partners verification\n\nHello ${fullName},\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes and can be used once.`,
      html,
      tags: [{ name: "message_type", value: "partner_verification" }],
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || (typeof body?.id !== "string" || !body.id.trim())) throw new Error(typeof body?.message === "string" ? body.message : "Verification email could not be sent");
  return { id: body.id };
}

export async function sendPartnerPasswordResetEmail({ email, fullName, code }: { email: string; fullName: string; code: string }) {
  const apiKey = ENV.resendApiKey.trim();
  const from = ENV.contactSenderEmail.trim();
  if (!apiKey || !from) throw new Error("SPORTIX password recovery email is not configured");
  const sender = normalizeSenderAddress(from);

  const html = `<!doctype html><html lang="en"><body style="margin:0;background:#050505;padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#0b0c0a;border:1px solid #2a2d27"><tr><td style="padding:30px 32px;border-bottom:3px solid #c6f500"><p style="margin:0;color:#c6f500;font:800 12px Arial,sans-serif;letter-spacing:2px">SPORTIX PARTNERS</p><h1 style="margin:12px 0 0;color:#f4f5f1;font:700 26px Arial,sans-serif">Reset your password</h1></td></tr><tr><td style="padding:30px 32px"><p style="margin:0 0 18px;color:#dfe3dc;font:15px/24px Arial,sans-serif">Hello ${escapeHtml(fullName)}, use this one-time code to set a new SPORTIX Partners password.</p><p style="margin:0;padding:18px 20px;background:#121510;border-left:3px solid #c6f500;color:#f4f5f1;font:700 30px/36px Arial,sans-serif;letter-spacing:8px;text-align:center">${code}</p><p style="margin:20px 0 0;color:#8d948b;font:13px/20px Arial,sans-serif">This code expires in 10 minutes and can be used once. If you did not request a password reset, you can ignore this email.</p></td></tr></table></td></tr></table></body></html>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(10_000),
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "User-Agent": "sportix-partners-auth/1.0" },
    body: JSON.stringify({
      from: sender,
      to: [email],
      subject: "Reset your SPORTIX Partners password",
      text: `SPORTIX Partners password reset\n\nHello ${fullName},\n\nYour password reset code is: ${code}\n\nThis code expires in 10 minutes and can be used once.`,
      html,
      tags: [{ name: "message_type", value: "partner_password_reset" }],
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || (typeof body?.id !== "string" || !body.id.trim())) throw new Error(typeof body?.message === "string" ? body.message : "Password recovery email could not be sent");
  return { id: body.id };
}
