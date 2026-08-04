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

export async function sendSupportReplyEmail({
  to,
  customerName,
  ticketId,
  subject,
  originalMessage,
  replyMessage,
  status,
}: {
  to: string;
  customerName: string;
  ticketId: number;
  subject: string;
  originalMessage: string;
  replyMessage: string;
  status: string;
}) {
  try {
    const transporter = createTransporter();
    const appUrl = process.env.NEXTAUTH_URL ?? "https://uzivaj.com";
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"Ujivaj Member Support" <${process.env.SMTP_USER}>`,
      to,
      subject: `Re: [Ticket #${ticketId}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="margin-bottom: 20px; text-align: center;">
            <img src="${appUrl}/uzivaj_logo.png" alt="Ujivaj" style="height: 44px; width: auto;" />
          </div>
          
          <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Hello ${customerName},</h3>
            <p style="color: #475569; font-size: 15px; line-height: 1.5; margin-bottom: 16px;">
              Our member support team has responded to your inquiry regarding <strong>"${subject}"</strong> (Ticket #${ticketId}).
            </p>

            <div style="margin: 20px 0; padding: 16px; background-color: #e0e7ff; border-left: 4px solid #4f46e5; border-radius: 4px;">
              <div style="font-size: 12px; font-weight: bold; color: #4338ca; text-transform: uppercase; margin-bottom: 6px;">Staff Response:</div>
              <div style="color: #1e1b4b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</div>
            </div>

            <div style="margin-top: 20px; padding: 12px; background-color: #f1f5f9; border-radius: 6px; font-size: 13px; color: #64748b;">
              <strong style="color: #334155;">Original Inquiry:</strong> "${originalMessage}"<br/>
              <strong style="color: #334155;">Ticket Status:</strong> ${status}
            </div>
          </div>

          <div style="margin-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">Thank you for being an active member of Ujivaj!</p>
            <p style="margin: 4px 0 0;">If you have further questions, feel free to submit a new message via the mobile app.</p>
          </div>
        </div>
      `,
    });
    console.log(`[Mail] Support reply email sent successfully to ${to} for Ticket #${ticketId}`);
  } catch (error: any) {
    console.error(`[Mail] Failed to send support reply email to ${to}: ${error?.message || error}`);
  }
}


