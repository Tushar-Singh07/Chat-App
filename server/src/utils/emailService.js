import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let cachedTransporter = null;

const createTransporter = async () => {
  // Always refresh from env if not cached
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });

  if (cachedTransporter) {
    return cachedTransporter;
  }

  // 1. If explicit SMTP credentials are provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('[EmailService] Configured custom SMTP transport host:', process.env.SMTP_HOST);
    return cachedTransporter;
  }

  // 2. If Gmail credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const cleanUser = process.env.EMAIL_USER.trim();
    const cleanPass = process.env.EMAIL_PASS.replace(/\s+/g, '');
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: cleanUser,
        pass: cleanPass,
      },
    });
    console.log('[EmailService] Configured Gmail transport for:', cleanUser);
    return cachedTransporter;
  }

  return null;
};

export const sendVerificationEmail = async (toEmail, code) => {
  const recipient = toEmail.trim().toLowerCase();

  console.log(`\n=============================================================`);
  console.log(`[VERIFICATION CODE GENERATED ONLY FOR: ${recipient}]`);
  console.log(`=============================================================\n`);

  const transporter = await createTransporter();
  if (!transporter) {
    const errorMsg = 'Email service is not configured. Please add EMAIL_USER and EMAIL_PASS (Google App Password) to server/.env so codes can be sent to your real email address.';
    console.error(`[EmailService Error]: ${errorMsg}`);
    const error = new Error(errorMsg);
    error.statusCode = 503;
    throw error;
  }

  const fromAddress = process.env.EMAIL_USER || process.env.EMAIL_FROM || '"WhatsApp Web" <no-reply@whatsapp-clone.com>';
  const mailOptions = {
    from: fromAddress,
    to: recipient, // Sent strictly and ONLY to the recipient email provided
    subject: `Your Login Verification Code: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0b141a; color: #ffffff;">
        <h2 style="color: #10b981; text-align: center; margin-bottom: 20px;">WhatsApp Web Verification</h2>
        <p style="color: #cbd5e1; font-size: 14px; text-align: center; line-height: 1.6;">
          Your verification code for <strong>${recipient}</strong> is:
        </p>
        <div style="text-align: center; margin: 25px 0; padding: 18px; background-color: #111b21; border-radius: 12px; border: 2px solid #10b981;">
          <span style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #34d399; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
          This code will expire in 10 minutes. If you did not request this code, you can safely ignore this message.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Verification code successfully sent ONLY to: ${recipient} (Message ID: ${info.messageId})`);
    return { success: true };
  } catch (error) {
    console.error(`[EmailService Error sending to ${recipient}]:`, error.message);
    const deliveryError = new Error(`Failed to deliver email to ${recipient}: ${error.message}`);
    deliveryError.statusCode = 500;
    throw deliveryError;
  }
};
