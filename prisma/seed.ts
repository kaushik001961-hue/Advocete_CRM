
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  const password = await bcrypt.hash("123456", 10);

  // -------------------------
  // USERS
  // -------------------------

  const admin = await prisma.user.upsert({
    where: { email: "admin@crm.com" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@crm.com",
      password,
      role: Role.ADMIN,
    },
  });

  const advocate1 = await prisma.user.upsert({
    where: { email: "advocate1@crm.com" },
    update: {},
    create: {
      name: "Rahul Sharma",
      email: "advocate1@crm.com",
      password,
      role: Role.ADVOCATE,
    },
  });

  const advocate2 = await prisma.user.upsert({
    where: { email: "advocate2@crm.com" },
    update: {},
    create: {
      name: "Priya Patel",
      email: "advocate2@crm.com",
      password,
      role: Role.ADVOCATE,
    },
  });

  await prisma.user.upsert({
    where: { email: "staff1@crm.com" },
    update: {},
    create: {
      name: "Office Staff 1",
      email: "staff1@crm.com",
      password,
      role: Role.STAFF,
    },
  });

  await prisma.user.upsert({
    where: { email: "staff2@crm.com" },
    update: {},
    create: {
      name: "Office Staff 2",
      email: "staff2@crm.com",
      password,
      role: Role.STAFF,
    },
  });

  // -------------------------
  // CLIENTS
  // -------------------------

  const clients = [];

  for (let i = 1; i <= 10; i++) {

    const client = await prisma.client.create({

      data: {

        name: `Client ${i}`,

        phone: `98765432${i}${i}`,

        email: `client${i}@mail.com`,

        address: `Street ${i}`,

        city: "Godhra",

        state: "Gujarat",

        pincode: "389001",

        notes: `Important client ${i}`,

      },

    });

    clients.push(client);

  }

  // -------------------------
  // CASES
  // -------------------------

  const advocates = [advocate1, advocate2];

  const cases = [];

  for (let i = 1; i <= 15; i++) {

    const c = await prisma.case.create({

      data: {

        title: `Case ${i}`,

        court: `District Court ${((i - 1) % 3) + 1}`,

        status:
          i % 3 === 0
            ? "CLOSED"
            : i % 2 === 0
            ? "PENDING"
            : "ACTIVE",

        clientId: clients[(i - 1) % clients.length].id,

        advocateId: advocates[(i - 1) % advocates.length].id,

      },

    });

    cases.push(c);

  }

  // -------------------------
  // HEARINGS
  // -------------------------

  for (const c of cases) {

    await prisma.hearing.create({

      data: {

        caseId: c.id,

        date: new Date(),

        remarks: "Initial Hearing",

      },

    });

    await prisma.hearing.create({

      data: {

        caseId: c.id,

        date: new Date(Date.now() + 86400000 * 15),

        remarks: "Next Hearing",

      },

    });

  }

  // -------------------------
  // DOCUMENTS
  // -------------------------

  for (const c of cases) {

    await prisma.document.create({

      data: {

        name: "Complaint.pdf",

        category: "Complaint",

        fileUrl: "/uploads/complaint.pdf",

        mimeType: "application/pdf",

        fileSize: 240000,

        clientId: c.clientId,

        caseId: c.id,

      },

    });

    await prisma.document.create({

      data: {

        name: "Evidence.pdf",

        category: "Evidence",

        fileUrl: "/uploads/evidence.pdf",

        mimeType: "application/pdf",

        fileSize: 180000,

        clientId: c.clientId,

        caseId: c.id,

      },

    });

  }

  console.log("=================================");
  console.log(" Advocate CRM Seed Complete");
  console.log("=================================");
  console.log("Admin     : admin@crm.com");
  console.log("Advocate1 : advocate1@crm.com");
  console.log("Advocate2 : advocate2@crm.com");
  console.log("Staff1    : staff1@crm.com");
  console.log("Staff2    : staff2@crm.com");
  console.log("Password  : 123456");
  console.log("10 Clients Created");
  console.log("15 Cases Created");
  console.log("30 Hearings Created");
  console.log("30 Documents Created");
  console.log("=================================");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
