import nodemailer from 'nodemailer';

const APP_NAME = process.env.APP_NAME || 'StegaGen Secure';
const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
).split(',')[0].trim();
const REPLY_TO = process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER;

function buildFromAddress() {
  const from = process.env.EMAIL_FROM;
  if (from) return from;
  if (process.env.EMAIL_USER) {
    return `"${APP_NAME}" <${process.env.EMAIL_USER}>`;
  }
  return APP_NAME;
}

export function createEmailTransporter() {
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
    // Anti-spam improvements
    pool: true,
    maxConnections: 5,
    maxMessages: 10,
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildVerificationEmail({ fullName, code, email, minutes = 10 }) {
  const safeName = escapeHtml(fullName);
  const verifyUrl = `${FRONTEND_URL}/verify-email?email=${encodeURIComponent(email)}`;
  const subject = `Verify your ${APP_NAME} account`;

  const text = [
    `Hello ${fullName},`,
    '',
    `Thank you for signing up with ${APP_NAME}.`,
    '',
    `Your verification code is: ${code}`,
    '',
    `This code will expire in ${minutes} minutes.`,
    '',
    `To verify your account, visit: ${verifyUrl}`,
    '',
    'If you did not request this verification, please ignore this email.',
    '',
    'Best regards,',
    `The ${APP_NAME} Team`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:32px 24px;text-align:center;border-radius:8px 8px 0 0;">
              <h1 style="margin:0;font-size:24px;font-weight:600;color:#ffffff;line-height:1.3;">Verify Your Email Address</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 24px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#374151;">Hello <strong style="color:#111827;">${safeName}</strong>,</p>
              <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#374151;">
                Thank you for signing up with ${APP_NAME}. To complete your registration and verify your email address, please use the verification code below:
              </p>
              
              <!-- Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding:0 0 24px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color:#f9fafb;border:2px solid #667eea;border-radius:8px;padding:20px;">
                      <tr>
                        <td align="center">
                          <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;font-weight:600;">Verification Code</p>
                          <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:6px;font-family:Consolas,Monaco,monospace;color:#111827;">${code}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#6b7280;text-align:center;">
                This code will expire in <strong>${minutes} minutes</strong>
              </p>

              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding:0 0 24px 0;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background-color:#667eea;color:#ffffff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:600;">Verify Email Address</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">
                If you did not create an account with ${APP_NAME}, please ignore this email. No further action is required.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;border-radius:0 0 8px 8px;">
              <p style="margin:0 0 8px 0;font-size:14px;color:#6b7280;">
                Best regards,<br>The ${APP_NAME} Team
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer text -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
          <tr>
            <td style="padding:16px 0 0 0;">
              <p style="margin:0;font-size:12px;color:#6b7280;text-align:center;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html, verifyUrl };
}

export function buildResendVerificationEmail({ fullName, code, email, minutes = 10 }) {
  const base = buildVerificationEmail({ fullName, code, email, minutes });
  return {
    ...base,
    subject: `Your new ${APP_NAME} verification code`,
  };
}

export async function sendVerificationEmail(transporter, { to, fullName, code, email, isResend = false }) {
  const template = buildEmailTemplate({ fullName, code, email, isResend });
  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@${process.env.EMAIL_DOMAIN || 'stegagen.app'}>`;
  const domain = process.env.EMAIL_DOMAIN || (process.env.EMAIL_USER ? process.env.EMAIL_USER.split('@')[1] : 'stegagen.app');

  await transporter.sendMail({
    from: buildFromAddress(),
    to,
    replyTo: REPLY_TO,
    subject: template.subject,
    text: template.text,
    html: template.html,
    headers: {
      'Message-ID': messageId,
      'X-Entity-Ref-ID': email,
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
      'Precedence': 'bulk',
      'X-Mailer': `${APP_NAME} Auth System`,
      'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=unsubscribe>`,
      'MIME-Version': '1.0',
      'Content-Type': 'multipart/alternative',
    },
    priority: 'high',
    envelope: {
      from: process.env.EMAIL_USER,
      to: to,
    },
  });
}

function buildEmailTemplate({ fullName, code, email, isResend = false }) {
  const expiryMs = parseInt(process.env.VERIFICATION_CODE_EXPIRY || '600000', 10);
  const minutes = Math.max(1, Math.round(expiryMs / 60000));
  return isResend
    ? buildResendVerificationEmail({ fullName, code, email, minutes })
    : buildVerificationEmail({ fullName, code, email, minutes });
}

async function sendViaResend({ to, fullName, code, email, isResend = false }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const template = buildEmailTemplate({ fullName, code, email, isResend });
  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || `${APP_NAME} <onboarding@resend.dev>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: template.subject,
      text: template.text,
      html: template.html,
      reply_to: REPLY_TO || undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }

  return true;
}

async function sendViaSmtp(payload) {
  const transporter = createEmailTransporter();
  await sendVerificationEmail(transporter, payload);
}

/** Preferred entry point for auth routes. Uses Resend on Vercel when configured. */
export async function sendVerificationEmailMessage(payload) {
  if (process.env.RESEND_API_KEY) {
    await sendViaResend(payload);
    return;
  }

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email is not configured. Set RESEND_API_KEY or SMTP credentials in Vercel.');
  }

  await sendViaSmtp(payload);
}
