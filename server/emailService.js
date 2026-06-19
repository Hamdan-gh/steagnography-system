import nodemailer from 'nodemailer';

const APP_NAME = process.env.APP_NAME || 'StegaGen Secure';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim();
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
    tls: {
      minVersion: 'TLSv1.2',
    },
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
  const subject = `${APP_NAME} — your verification code`;

  const text = [
    `Hello ${fullName},`,
    '',
    `Use this code to verify your ${APP_NAME} account:`,
    '',
    code,
    '',
    `This code expires in ${minutes} minutes.`,
    '',
    `Open the verification page: ${verifyUrl}`,
    '',
    'If you did not request this, you can safely ignore this email.',
    '',
    APP_NAME,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:transparent;padding:40px 20px;min-height:100vh;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:40px 40px 50px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);padding:12px 24px;border-radius:8px;margin-bottom:20px;">
                <p style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">${APP_NAME}</p>
              </div>
              <h1 style="margin:0;font-size:28px;font-weight:600;color:#ffffff;line-height:1.3;">Verify Your Email</h1>
              <p style="margin:12px 0 0 0;font-size:16px;color:rgba(255,255,255,0.9);line-height:1.5;">We're excited to have you on board!</p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:40px 40px 20px 40px;">
              <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">Hi <strong style="color:#111827;">${safeName}</strong>,</p>
              <p style="margin:20px 0 0 0;font-size:16px;line-height:1.7;color:#374151;">
                Thank you for signing up! To complete your registration, please use the verification code below:
              </p>
            </td>
          </tr>

          <!-- Verification code box -->
          <tr>
            <td align="center" style="padding:20px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);border:2px dashed #667eea;border-radius:12px;padding:24px 32px;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#667eea;font-weight:600;">Your Verification Code</p>
                    <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:8px;font-family:'Courier New',Consolas,Monaco,monospace;color:#111827;text-shadow:2px 2px 4px rgba(0,0,0,0.1);">${code}</p>
                  </td>
                </tr>
              </table>
              <div style="margin-top:16px;padding:12px 20px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:6px;">
                <p style="margin:0;font-size:14px;color:#92400e;">
                  ⏱️ This code will expire in <strong>${minutes} minutes</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding:20px 40px;">
              <a href="${verifyUrl}" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 15px rgba(102,126,234,0.4);transition:all 0.3s ease;">
                Verify Email Address
              </a>
            </td>
          </tr>

          <!-- Security notice -->
          <tr>
            <td style="padding:20px 40px 40px 40px;">
              <div style="background:#f3f4f6;border-radius:8px;padding:20px;border-left:4px solid #6b7280;">
                <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
                  🔒 <strong style="color:#1f2937;">Security Notice:</strong><br>
                  If you didn't create an account with ${APP_NAME}, please ignore this email. Your security is important to us.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:30px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;text-align:center;">
                Need help? Contact our support team
              </p>
              <p style="margin:12px 0 0 0;font-size:12px;color:#9ca3af;text-align:center;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <!-- Email client compatibility spacer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;">
          <tr>
            <td style="padding:20px 0;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);text-align:center;">
                This is an automated message, please do not reply to this email.
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
    subject: `${APP_NAME} — new verification code`,
  };
}

export async function sendVerificationEmail(transporter, { to, fullName, code, email, isResend = false }) {
  const expiryMs = parseInt(process.env.VERIFICATION_CODE_EXPIRY || '600000', 10);
  const minutes = Math.max(1, Math.round(expiryMs / 60000));
  const template = isResend
    ? buildResendVerificationEmail({ fullName, code, email, minutes })
    : buildVerificationEmail({ fullName, code, email, minutes });

  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@${process.env.EMAIL_DOMAIN || 'stegagen.local'}>`;

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
    },
  });
}
