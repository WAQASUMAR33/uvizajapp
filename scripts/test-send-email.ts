import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const to = "theitxprts@gmail.com";
  console.log("Loading SMTP configuration...");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_FROM:", process.env.SMTP_FROM);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
    port: parseInt(process.env.SMTP_PORT ?? "465"),
    secure: (process.env.SMTP_PORT ?? "465") === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log(`\nSending test email to ${to}...`);
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"Ujivaj Support" <${process.env.SMTP_USER}>`,
      to,
      subject: "Ujivaj SMTP Server Test",
      text: "This is a test email to verify that the Hostinger SMTP mail server is working correctly for the Ujivaj app.",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
          <h2 style="margin:0 0 8px;color:#1e1b4b">SMTP Connection Test</h2>
          <p style="color:#64748b;margin:0 0 24px">This is a test email verifying that your Ujivaj email server configuration is working correctly.</p>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">Sent via Hostinger SMTP for uzivaj@rapidtechpro.com.</p>
        </div>
      `,
    });
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (error: any) {
    console.error("Failed to send test email:", error.message || error);
  }
}

main();
