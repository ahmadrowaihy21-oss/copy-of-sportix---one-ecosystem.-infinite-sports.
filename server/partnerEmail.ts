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
  if (!response.ok || typeof body.id !== "string") throw new Error(typeof body?.message === "string" ? body.message : "Verification email could not be sent");
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
  if (!response.ok || typeof body.id !== "string") throw new Error(typeof body?.message === "string" ? body.message : "Password recovery email could not be sent");
  return { id: body.id };
}

export async function sendPartnerNdaAccessRequestEmail(input: {
  adminEmail: string;
  fullName: string;
  companyName: string | null;
  jobTitle: string | null;
  email: string;
  mobileNumber: string;
  viewNdaUrl: string;
  approveUrl: string;
}) {
  const apiKey = ENV.resendApiKey.trim();
  const from = ENV.contactSenderEmail.trim();
  if (!apiKey || !from || !input.adminEmail.trim()) throw new Error("SPORTIX access-request email is not configured");
  const sender = normalizeSenderAddress(from);
  const button = (label: string, href: string, primary = false) => `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 10px 10px 0;padding:13px 16px;border:${primary ? "1px solid #c6f500" : "1px solid #7b8078"};background:${primary ? "#c6f500" : "transparent"};color:${primary ? "#070807" : "#f4f5f1"};font:800 12px Arial,sans-serif;letter-spacing:.6px;text-decoration:none">${label}</a>`;
  const html = `<!doctype html><html lang="en"><body style="margin:0;background:#050505;padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#0b0c0a;border:1px solid #2a2d27"><tr><td style="padding:30px 32px;border-bottom:3px solid #c6f500"><p style="margin:0;color:#c6f500;font:800 12px Arial,sans-serif;letter-spacing:2px">SPORTIX / ACCESS CONTROL</p><h1 style="margin:12px 0 0;color:#f4f5f1;font:700 26px Arial,sans-serif">New SPORTIX Access Request</h1></td></tr><tr><td style="padding:30px 32px"><p style="margin:0 0 18px;color:#dfe3dc;font:15px/24px Arial,sans-serif">A verified applicant has uploaded a signed NDA and is waiting for your review.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;background:#121510;color:#dfe3dc;font:14px/22px Arial,sans-serif"><tr><td style="padding:15px 18px"><strong>Full Name</strong><br />${escapeHtml(input.fullName)}</td><td style="padding:15px 18px"><strong>Company</strong><br />${escapeHtml(input.companyName || "—")}</td></tr><tr><td style="padding:15px 18px"><strong>Job Title</strong><br />${escapeHtml(input.jobTitle || "—")}</td><td style="padding:15px 18px"><strong>Verified Company Email</strong><br />${escapeHtml(input.email)}</td></tr><tr><td style="padding:15px 18px"><strong>Mobile Number</strong><br />${escapeHtml(input.mobileNumber)}</td><td style="padding:15px 18px"><strong>NDA Status</strong><br /><span style="color:#c6f500;font-weight:700">PENDING</span></td></tr></table>${button("VIEW NDA", input.viewNdaUrl)}${button("APPROVE NDA &amp; GRANT ACCESS", input.approveUrl, true)}<p style="margin:16px 0 0;color:#8d948b;font:13px/20px Arial,sans-serif">These links are unique to this application. The approval action requires authenticated SPORTIX administrator access, can be used once, and expires after seven days.</p></td></tr></table></td></tr></table></body></html>`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "User-Agent": "sportix-partners-access/1.0" }, body: JSON.stringify({ from: sender, to: [input.adminEmail], subject: "New SPORTIX Access Request", text: `New SPORTIX Access Request\n\nFull Name: ${input.fullName}\nCompany: ${input.companyName || "—"}\nJob Title: ${input.jobTitle || "—"}\nVerified Company Email: ${input.email}\nMobile Number: ${input.mobileNumber}\nNDA Status: Pending\n\nView NDA: ${input.viewNdaUrl}\nApprove NDA & Grant Access: ${input.approveUrl}`, html, tags: [{ name: "message_type", value: "partner_nda_access_request" }] }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || typeof body.id !== "string") throw new Error(typeof body?.message === "string" ? body.message : "NDA access-request email could not be sent");
  return { id: body.id };
}

export async function sendPartnerNdaApprovalEmail({ email, fullName, loginUrl }: { email: string; fullName: string; loginUrl: string }) {
  const apiKey = ENV.resendApiKey.trim();
  const from = ENV.contactSenderEmail.trim();
  if (!apiKey || !from) throw new Error("SPORTIX access-approved email is not configured");
  const sender = normalizeSenderAddress(from);
  const html = `<!doctype html><html lang="en"><body style="margin:0;background:#050505;padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#0b0c0a;border:1px solid #2a2d27"><tr><td style="padding:30px 32px;border-bottom:3px solid #c6f500"><p style="margin:0;color:#c6f500;font:800 12px Arial,sans-serif;letter-spacing:2px">SPORTIX / YALLA HAYYIHOM</p><h1 style="margin:12px 0 0;color:#f4f5f1;font:700 26px Arial,sans-serif">Your SPORTIX access has been approved</h1></td></tr><tr><td style="padding:30px 32px"><p style="margin:0 0 22px;color:#dfe3dc;font:15px/24px Arial,sans-serif">Hello ${escapeHtml(fullName)}, your NDA and access request have been reviewed and approved. You may now log in to YALLA HAYYIHOM using your verified company email.</p><a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:13px 18px;background:#c6f500;color:#070807;font:800 12px Arial,sans-serif;letter-spacing:.6px;text-decoration:none">LOG IN</a></td></tr></table></td></tr></table></body></html>`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "User-Agent": "sportix-partners-access/1.0" }, body: JSON.stringify({ from: sender, to: [email], subject: "Your sportix Access Has Been Approved", text: `Your sportix Access Has Been Approved\n\nHello ${fullName},\n\nYour NDA and access request have been reviewed and approved. You may now log in to YALLA HAYYIHOM using your verified company email.\n\nLog in: ${loginUrl}`, html, tags: [{ name: "message_type", value: "partner_nda_approved" }] }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || typeof body.id !== "string") throw new Error(typeof body?.message === "string" ? body.message : "NDA approval email could not be sent");
  return { id: body.id };
}
