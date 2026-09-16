import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  {
    name: "ACMS Administrator",
    email: "admin@acms.com",
    password: "Admin@12345",
    role: "ADMIN" as const,
  },
  {
    name: "ACMS Advocate",
    email: "advocate@acms.com",
    password: "Advocate@12345",
    role: "ADVOCATE" as const,
  },
  {
    name: "ACMS Staff",
    email: "staff@acms.com",
    password: "Staff@12345",
    role: "STAFF" as const,
  },
];

async function main() {
  console.log("Creating Vercel test users...\n");

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    const result = await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        password: passwordHash,
        role: user.role,
        status: "Active",
      },
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
        status: "Active",
      },
    });

    console.log(`✓ ${result.role}: ${result.email}`);
  }

  console.log("\nAll Vercel test users are ready.");
}

main()
  .catch((error) => {
    console.error("Error creating users:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });