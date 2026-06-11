import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
    port: parseInt(process.env.SMTP_PORT ?? "465"),
    secure: (process.env.SMTP_PORT ?? "465") === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `"Ujivaj Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset your Ujivaj password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px">
        <img src="${process.env.NEXTAUTH_URL}/uzivaj_logo.png" alt="Ujivaj" style="height:48px;margin-bottom:24px" />
        <h2 style="margin:0 0 8px;color:#1e1b4b">Reset your password</h2>
        <p style="color:#64748b;margin:0 0 24px">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendCustomerPasswordResetEmail(to: string, resetUrl: string) {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"Ujivaj Support" <${process.env.SMTP_USER}>`,
      to,
      subject: "Reset your Ujivaj password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px">
          <img src="${process.env.NEXTAUTH_URL}/uzivaj_logo.png" alt="Ujivaj" style="height:48px;margin-bottom:24px" />
          <h2 style="margin:0 0 8px;color:#1e1b4b">Reset your customer password</h2>
          <p style="color:#64748b;margin:0 0 24px">Click the button below to set a new password for your Ujivaj customer account. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`[Mail] Password reset email sent successfully to ${to}`);
  } catch (error: any) {
    console.error(`[Mail] Failed to send password reset email via SMTP: ${error?.message || error}`);
    console.log(`[Mail] Local/fallback URL: ${resetUrl}`);
  }
}

export async function sendCustomerVerificationCodeEmail(to: string, code: string) {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"Ujivaj Support" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your Ujivaj Verification Code",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px">
          <img src="${process.env.NEXTAUTH_URL}/uzivaj_logo.png" alt="Ujivaj" style="height:48px;margin-bottom:24px" />
          <h2 style="margin:0 0 8px;color:#1e1b4b">Verification Code</h2>
          <p style="color:#64748b;margin:0 0 24px">Your 6-digit password reset verification code is:</p>
          <div style="font-size:32px;font-weight:700;color:#4f46e5;letter-spacing:4px;margin:16px 0;text-align:center">${code}</div>
          <p style="color:#64748b;margin:0 0 24px">This code will expire in <strong>15 minutes</strong>.</p>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`[Mail] Verification code email sent successfully to ${to}`);
  } catch (error: any) {
    console.error(`[Mail] Failed to send verification code email via SMTP: ${error?.message || error}`);
    console.log(`[Mail] Local/fallback Code: ${code}`);
  }
}


