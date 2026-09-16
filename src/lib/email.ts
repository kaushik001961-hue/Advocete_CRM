import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailInput = {
  to: string;
  subject: string;
  title: string;
  message: string;
};

export async function sendNotificationEmail({
  to,
  subject,
  title,
  message,
}: SendEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const from =
    process.env.EMAIL_FROM || "ACMS <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            
            <div style="background:#111827;padding:24px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">
                ACMS
              </h1>
              <p style="margin:6px 0 0;color:#d1d5db;font-size:13px;">
                Advocate Case Management System
              </p>
            </div>

            <div style="padding:30px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">
                ${escapeHtml(title)}
              </h2>

              <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;white-space:pre-line;">
                ${escapeHtml(message)}
              </p>
            </div>

            <div style="padding:20px 30px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;">
                This is an automated notification from ACMS.
              </p>
            </div>

          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}