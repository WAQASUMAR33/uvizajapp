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

function getAppUrl(): string {
  return (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://uzivajlife.online").replace(/\/$/, "");
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = createTransporter();
  const appUrl = getAppUrl();
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `"Uživaj Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset your Uživaj password",
    html: `
      <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${appUrl}/uzivaj_logo.png" alt="Uživaj" style="height: 50px; width: auto; max-width: 200px; display: inline-block;" />
        </div>
        <h2 style="margin: 0 0 12px; color: #1e1b4b; font-size: 20px; font-weight: 700; text-align: center;">Reset your password</h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px; text-align: center;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 36px; background-color: #0066ff; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">Reset Password</a>
        </div>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendCustomerPasswordResetEmail(to: string, resetUrl: string) {
  try {
    const transporter = createTransporter();
    const appUrl = getAppUrl();
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"Uživaj Support" <${process.env.SMTP_USER}>`,
      to,
      subject: "Reset your Uživaj password",
      html: `
        <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${appUrl}/uzivaj_logo.png" alt="Uživaj" style="height: 50px; width: auto; max-width: 200px; display: inline-block;" />
          </div>
          <h2 style="margin: 0 0 12px; color: #1e1b4b; font-size: 20px; font-weight: 700; text-align: center;">Reset your customer password</h2>
          <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px; text-align: center;">Click the button below to set a new password for your Uživaj customer account. This link expires in <strong>1 hour</strong>.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 36px; background-color: #0066ff; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">Reset Password</a>
          </div>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
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
    const appUrl = getAppUrl();
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"Uživaj Support" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your Uživaj Verification Code",
      html: `
        <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${appUrl}/uzivaj_logo.png" alt="Uživaj" style="height: 50px; width: auto; max-width: 200px; display: inline-block;" />
          </div>
          <h2 style="margin: 0 0 8px; color: #1e1b4b; font-size: 20px; font-weight: 700; text-align: center;">Verification Code</h2>
          <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 20px; text-align: center;">Your 6-digit password reset verification code is:</p>
          <div style="background: #f0f7ff; border: 2px dashed #0066ff; border-radius: 12px; padding: 18px 12px; margin: 20px 0; text-align: center;">
            <span style="font-size: 34px; font-weight: 800; color: #0066ff; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">${code}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0 0 20px;">This code will expire in <strong>15 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
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
    const appUrl = getAppUrl();
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"Uživaj Member Support" <${process.env.SMTP_USER}>`,
      to,
      subject: `Re: [Ticket #${ticketId}] ${subject}`,
      html: `
        <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="margin-bottom: 20px; text-align: center;">
            <img src="${appUrl}/uzivaj_logo.png" alt="Uživaj" style="height: 48px; width: auto; max-width: 200px; display: inline-block;" />
          </div>
          
          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Hello ${customerName},</h3>
            <p style="color: #475569; font-size: 15px; line-height: 1.5; margin-bottom: 16px;">
              Our member support team has responded to your inquiry regarding <strong>"${subject}"</strong> (Ticket #${ticketId}).
            </p>

            <div style="margin: 20px 0; padding: 16px; background-color: #eff6ff; border-left: 4px solid #0066ff; border-radius: 6px;">
              <div style="font-size: 12px; font-weight: bold; color: #0066ff; text-transform: uppercase; margin-bottom: 6px;">Staff Response:</div>
              <div style="color: #1e1b4b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</div>
            </div>

            <div style="margin-top: 20px; padding: 12px; background-color: #f1f5f9; border-radius: 6px; font-size: 13px; color: #64748b;">
              <strong style="color: #334155;">Original Inquiry:</strong> "${originalMessage}"<br/>
              <strong style="color: #334155;">Ticket Status:</strong> ${status}
            </div>
          </div>

          <div style="margin-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">Thank you for being an active member of Uživaj!</p>
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

export async function sendCustomerEmailVerificationLink(to: string, verifyUrl: string, fullname?: string) {
  try {
    const transporter = createTransporter();
    const displayName = fullname ? ` ${fullname}` : "";
    const appUrl = getAppUrl();
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"Uživaj Support" <${process.env.SMTP_USER}>`,
      to,
      subject: "Verify your Uživaj account email",
      html: `
        <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${appUrl}/uzivaj_logo.png" alt="Uživaj" style="height: 50px; width: auto; max-width: 200px; display: inline-block;" />
          </div>
          <div style="background-color: #ffffff; padding: 28px 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
            <h2 style="margin: 0 0 12px; color: #1e1b4b; font-size: 20px; font-weight: 700; text-align: center;">Verify your email address</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              Hello${displayName},<br/><br/>
              Thank you for registering with Uživaj! Please click the button below to verify your email address and activate your account.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${verifyUrl}" style="display: inline-block; padding: 14px 36px; background-color: #0066ff; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 16px;">
              This link is valid for <strong>24 hours</strong>. If you did not sign up for an account, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; word-break: break-all;">
              Button not working? Copy and paste this link in your browser:<br/>
              <a href="${verifyUrl}" style="color: #0066ff; text-decoration: underline;">${verifyUrl}</a>
            </p>
          </div>
          <div style="margin-top: 24px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Uživaj. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    console.log(`[Mail] Verification email sent successfully to ${to}`);
  } catch (error: any) {
    console.error(`[Mail] Failed to send verification email via SMTP: ${error?.message || error}`);
    console.log(`[Mail] Fallback verify URL: ${verifyUrl}`);
  }
}



