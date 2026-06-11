import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "testcustomer@example.com";
  const oldPassword = "password123";
  const newPassword = "newpassword456";

  console.log("1. Setting up test customer...");
  const hashedOld = await bcrypt.hash(oldPassword, 12);
  const customer = await prisma.customer.upsert({
    where: { email },
    update: {
      password: hashedOld,
      logType: "email",
    },
    create: {
      email,
      fullname: "Test Customer",
      password: hashedOld,
      logType: "email",
    },
  });
  console.log(`Test customer setup: ID ${customer.id}, Email ${customer.email}`);

  // Now, call the local dev server using fetch
  console.log("\n2. Sending forgot password request (sends 6-digit code)...");
  const forgotRes = await fetch("http://localhost:3001/api/customers/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!forgotRes.ok) {
    throw new Error(`Forgot password failed: ${forgotRes.status} ${await forgotRes.text()}`);
  }
  console.log("Forgot password API returned success!");

  // Now, query the database to find the verification token we just created
  console.log("\n3. Retrieving verification token and extracting 6-digit code...");
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: { identifier: email },
    orderBy: { expires: "desc" },
  });

  if (!tokenRecord) {
    throw new Error("No verification token found in database!");
  }
  
  // Extract code from email:code format
  const parts = tokenRecord.token.split(":");
  const code = parts[1];
  console.log(`Found token entry: ${tokenRecord.token}. Extracted Code: ${code}`);

  // Call verify-code API
  console.log("\n4. Submitting code verification request...");
  const verifyRes = await fetch("http://localhost:3001/api/customers/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  if (!verifyRes.ok) {
    throw new Error(`Code verification failed: ${verifyRes.status} ${await verifyRes.text()}`);
  }
  const verifyData = await verifyRes.json();
  console.log("Code verification API returned success! Returned token:", verifyData.token);

  // Call reset-password API using code
  console.log("\n5. Submitting password reset request using the code...");
  const resetRes = await fetch("http://localhost:3001/api/customers/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      code,
      password: newPassword,
    }),
  });

  if (!resetRes.ok) {
    throw new Error(`Reset password failed: ${resetRes.status} ${await resetRes.text()}`);
  }
  console.log("Reset password API returned success!");

  // Verify the password in the database
  console.log("\n6. Verifying updated password in database...");
  const updatedCustomer = await prisma.customer.findUnique({
    where: { email },
  });

  if (!updatedCustomer || !updatedCustomer.password) {
    throw new Error("Failed to retrieve updated customer password!");
  }

  const matches = await bcrypt.compare(newPassword, updatedCustomer.password);
  if (!matches) {
    throw new Error("Password in database does not match the new password!");
  }
  console.log("Verification successful! New password matches!");

  // Clean up
  await prisma.customer.delete({ where: { email } });
  console.log("\nTest database cleaned up successfully!");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
