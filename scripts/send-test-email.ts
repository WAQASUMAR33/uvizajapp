import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const host = process.env.SMTP_HOST || "smtp.office365.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER || "support@uzivaj.life";
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Uživaj Support" <${user}>`;
  const to = "theitxprts@gmail.com";

  console.log(`Connecting to SMTP: ${host}:${port} as ${user}...`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });

  console.log("Verifying connection credentials...");
  await transporter.verify();
  console.log("SMTP connection verified successfully!");

  console.log(`Sending test email to ${to}...`);
  const info = await transporter.sendMail({
    from,
    to,
    subject: "Uživaj System Test - Email Verification Successful",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0066ff; margin: 0;">Uživaj Email Delivery Test</h2>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">Transaction & Notification System</p>
        </div>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">
          Hello Waqas,<br/><br/>
          This is a test email sent from <strong>support@uzivaj.life</strong> to verify outbound transactional delivery.
        </p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; padding: 14px; margin: 20px 0; border-radius: 8px;">
          <strong style="color: #166534; font-size: 15px;">✓ Status: SMTP Working Perfectly</strong><br/>
          <span style="color: #15803d; font-size: 13px;">Customer registration links, password reset codes, and support ticket replies are fully functional.</span>
        </div>
        <div style="background: #f8fafc; border-radius: 8px; padding: 12px; font-size: 12px; color: #64748b; line-height: 1.6;">
          <strong>Sender:</strong> ${from}<br/>
          <strong>Host:</strong> ${host}:${port}<br/>
          <strong>Timestamp:</strong> ${new Date().toLocaleString()}
        </div>
      </div>
    `,
  });

  console.log("Email sent successfully!");
  console.log("Message ID:", info.messageId);
}

main().catch((err) => {
  console.error("Failed to send email:", err);
  process.exit(1);
});
