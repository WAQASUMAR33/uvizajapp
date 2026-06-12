import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const email = "theitxprts@gmail.com";
  console.log(`Updating customer ${email} to credentials login...`);
  
  const dummyPassword = await bcrypt.hash("password123", 12);
  
  const customer = await prisma.customer.update({
    where: { email },
    data: {
      logType: "email",
      password: dummyPassword,
    },
  });

  console.log(`\n🎉 Success! Customer "${customer.email}" has been updated:`);
  console.log(`  logType:  "${customer.logType}"`);
  console.log(`  Password: Hashed ("password123")`);
  console.log(`\nYou can now test triggering the forgot password API with this email address, and the server will successfully send the verification email!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
