import nodemailer from 'nodemailer';

const createTransporter = async () => {
  // 1. If explicit SMTP credentials are provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // 2. If Gmail credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // 3. Fallback to Ethereal test account if internet available
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn('[EmailService] Using fallback logger transport:', err.message);
    return null;
  }
};

export const sendVerificationEmail = async (toEmail, code) => {
  console.log(`\n=============================================================`);
  console.log(`[VERIFICATION CODE GENERATED FOR: ${toEmail}] => CODE: ${code}`);
  console.log(`=============================================================\n`);

  try {
    const transporter = await createTransporter();
    if (!transporter) return { success: true, simulated: true, code };

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"WhatsApp Web" <no-reply@whatsapp-clone.com>',
      to: toEmail,
      subject: `Your Login Verification Code: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0b141a; color: #ffffff;">
          <h2 style="color: #10b981; text-align: center; margin-bottom: 20px;">WhatsApp Web Verification</h2>
          <p style="color: #cbd5e1; font-size: 14px; text-align: center; line-height: 1.6;">
            Your verification code for <strong>${toEmail}</strong> is:
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

    const info = await transporter.sendMail(mailOptions);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('[EmailService] Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, info, code };
  } catch (error) {
    console.error('[EmailService Warning]:', error.message);
    return { success: true, simulated: true, code, error: error.message };
  }
};
