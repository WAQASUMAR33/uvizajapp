import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const emails = ["ndjendkjzurnd@gmail.com", "turabali2025@gmail.com"];
  const newPasswordRaw = "Forgot/.com0786";
  const hashedPassword = await bcrypt.hash(newPasswordRaw, 10);

  for (const email of emails) {
    console.log(`\n----------------------------------------`);
    console.log(`Checking for customer email: ${email}...`);

    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`Found existing customer ID #${existing.id} (${existing.fullname}). Updating password...`);
      const updated = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          password: hashedPassword,
          logType: "email",
          isActive: true,
        },
      });
      console.log(`✅ Password reset successfully for ${updated.email}`);
    } else {
      console.log(`Customer ${email} NOT found. Creating new customer account...`);
      const nameFromEmail = email.split("@")[0];
      const created = await prisma.customer.create({
        data: {
          email,
          fullname: nameFromEmail,
          password: hashedPassword,
          logType: "email",
          isActive: true,
        },
      });
      console.log(`✅ New customer created successfully: ID #${created.id} (${created.email})`);
    }
  }
}

main()
  .catch((e) => {
    console.error("Error executing script:", e);
  })
  .finally(() => prisma.$disconnect());
