import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testSMTP(host: string, port: number, secure: boolean) {
  console.log(`Testing SMTP on ${host}:${port} (secure: ${secure})...`);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: "uzivaj@rapidtechpro.com",
      pass: "DildilPakistan@786_786_waqas",
    },
    debug: true,
    logger: true,
  });

  try {
    await transporter.verify();
    console.log(`SMTP Verification on ${host}:${port} SUCCESSFUL!\n`);
    return true;
  } catch (error: any) {
    console.error(`SMTP Verification on ${host}:${port} FAILED:`, error.message || error);
    console.log();
    return false;
  }
}

async function run() {
  const hosts = ["smtp.hostinger.com", "smtp.titan.email"];
  for (const host of hosts) {
    const ok465 = await testSMTP(host, 465, true);
    if (!ok465) {
      await testSMTP(host, 587, false);
    }
  }
}

run();
