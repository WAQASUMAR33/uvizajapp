import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "theitxprts@gmail.com";
  const password = "786ninja";

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashed },
    create: {
      email,
      password: hashed,
      name: "The IT Xprts",
      role: "ADMIN",
    },
  });

  console.log("Admin account ready:");
  console.log("  ID:    ", admin.id);
  console.log("  Email: ", admin.email);
  console.log("  Role:  ", admin.role);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
