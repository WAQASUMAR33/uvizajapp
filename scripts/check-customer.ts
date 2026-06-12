import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const email = "theitxprts@gmail.com";
  console.log(`Querying Customer table for: ${email}...`);
  
  const customer = await prisma.customer.findUnique({
    where: { email },
  });

  if (!customer) {
    console.log(`\n❌ [NOT FOUND] No customer found with email "${email}" in the database.`);
    console.log("Since the customer record does not exist, the forgot password API returned success but did not send an email to prevent email enumeration.");
  } else {
    console.log(`\n✅ [FOUND] Customer details:`);
    console.log(`  ID:        ${customer.id}`);
    console.log(`  Fullname:  ${customer.fullname}`);
    console.log(`  Email:     ${customer.email}`);
    console.log(`  logType:   "${customer.logType}"`);
    console.log(`  Password:  ${customer.password ? "Set (Hashed)" : "NULL (No password set!)"}`);
    
    if (customer.logType !== "email") {
      console.log(`\n⚠️ [LOGTYPE WARNING] The customer's logType is set to "${customer.logType}" instead of "email".`);
      console.log("Because of this, the forgot password API skipped sending the email (social login users do not need to reset their email passwords).");
    } else if (!customer.password) {
      console.log(`\n⚠️ [PASSWORD WARNING] The customer has no password set (it is NULL).`);
    } else {
      console.log(`\n✨ [READY] The customer is fully configured for credentials/email logins and should receive reset emails.`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
