const nodemailer = require('nodemailer');

const transporter = (() => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
})();

async function sendVerificationEmail(to, token) {
  const verifyUrl = `${process.env.APP_URL || ''}/api/auth/verify?token=${token}`;
  const subject = 'Verify your email';
  const text = `Please verify your email by clicking the link: ${verifyUrl}`;
  const html = `<p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`;

  if (!transporter) {
    console.log('SMTP not configured; verification link:', verifyUrl);
    return;
  }

  await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@example.com', to, subject, text, html });
}

module.exports = { sendVerificationEmail };
