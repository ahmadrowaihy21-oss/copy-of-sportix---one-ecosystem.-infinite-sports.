import { ENV } from "./_core/env";

type ContactEmailPayload = {
  contactId: number;
  fullName: string;
  contactEmail: string;
  mobileNumber: string;
  companyName: string;
  jobTitle: string;
  subject: string;
  message: string;
  language: "en" | "ar";
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);

const cleanSubject = (subject: string) => subject.replace(/\s+/g, " ").trim();

const emailRow = (label: string, value: string) => `
  <tr>
    <td style="padding: 0 0 14px;">
      <p style="margin: 0 0 4px; color: #8d948b; font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; line-height: 16px; text-transform: uppercase;">${escapeHtml(label)}</p>
      <p style="margin: 0; color: #f4f5f1; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 22px; word-break: break-word;">${escapeHtml(value)}</p>
    </td>
  </tr>`;

export function buildSportixContactEmail(payload: ContactEmailPayload) {
  const normalizedSubject = cleanSubject(payload.subject);
  const text = [
    "New SPORTIX website inquiry",
    `Inquiry ID: ${payload.contactId}`,
    `Name: ${payload.fullName}`,
    `Email: ${payload.contactEmail}`,
    `Mobile: ${payload.mobileNumber}`,
    `Company: ${payload.companyName}`,
    `Job title: ${payload.jobTitle}`,
    `Language: ${payload.language}`,
    `Subject: ${normalizedSubject}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>New SPORTIX website inquiry</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #050505;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">New enquiry from ${escapeHtml(payload.fullName)} — ${escapeHtml(normalizedSubject)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background-color: #050505;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; border-collapse: collapse; background-color: #0b0c0a; border: 1px solid #2a2d27;">
            <tr>
              <td style="padding: 28px 32px 24px; border-bottom: 3px solid #c6f500;">
                <p style="margin: 0; color: #c6f500; font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 2px; line-height: 18px;">SPORTIX</p>
                <h1 style="margin: 12px 0 0; color: #f4f5f1; font-family: Arial, Helvetica, sans-serif; font-size: 26px; font-weight: 700; line-height: 34px;">New website inquiry</h1>
                <p style="margin: 8px 0 0; color: #aeb4aa; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 21px;">Inquiry #${payload.contactId} · ${payload.language === "ar" ? "Arabic" : "English"} submission</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 32px 10px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
                  ${emailRow("Full name", payload.fullName)}
                  ${emailRow("Email address", payload.contactEmail)}
                  ${emailRow("Mobile number", payload.mobileNumber)}
                  ${emailRow("Company", payload.companyName)}
                  ${emailRow("Job title", payload.jobTitle)}
                  ${emailRow("Subject", normalizedSubject)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 32px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background-color: #121510; border-left: 3px solid #c6f500;">
                  <tr>
                    <td style="padding: 18px 20px;">
                      <p style="margin: 0 0 8px; color: #8d948b; font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; line-height: 16px; text-transform: uppercase;">Message</p>
                      <p style="margin: 0; color: #f4f5f1; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 24px; white-space: pre-wrap; word-break: break-word;">${escapeHtml(payload.message)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 18px 32px 26px; border-top: 1px solid #2a2d27;">
                <p style="margin: 0; color: #8d948b; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px;">Reply directly to this message to reach the visitor at ${escapeHtml(payload.contactEmail)}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { normalizedSubject, text, html };
}

export async function sendSportixContactEmail(payload: ContactEmailPayload): Promise<{ id: string }> {
  const apiKey = ENV.resendApiKey.trim();
  const from = ENV.contactSenderEmail.trim();
  const recipient = ENV.contactRecipientEmail.trim();

  if (!apiKey || !from || !recipient) {
    throw new Error("SPORTIX contact email is not configured");
  }

  const emailContent = buildSportixContactEmail(payload);
  const body = {
    from: `SPORTIX Contact <${from}>`,
    to: [recipient],
    reply_to: payload.contactEmail,
    subject: `[SPORTIX inquiry] ${emailContent.normalizedSubject}`,
    text: emailContent.text,
    html: emailContent.html,
    tags: [{ name: "contact_id", value: String(payload.contactId) }],
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "sportix-contact-service/1.0",
      "Idempotency-Key": `sportix-contact-${payload.contactId}`,
    },
    body: JSON.stringify(body),
  });

  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok || typeof responseBody.id !== "string") {
    const message = typeof responseBody?.message === "string" ? responseBody.message : `Resend rejected the request (${response.status})`;
    throw new Error(message);
  }

  return { id: responseBody.id };
}
