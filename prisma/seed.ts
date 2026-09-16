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
    update: {
      barEnrollmentNo: "MAH/1042/2012",
      specialisation: "Criminal Law & Civil Litigation",
      phone: "+91 98765 43210",
      experienceYears: 14,
      status: "Active",
    },
    create: {
      name: "Rahul Sharma",
      email: "advocate1@crm.com",
      password,
      role: Role.ADVOCATE,
      barEnrollmentNo: "MAH/1042/2012",
      specialisation: "Criminal Law & Civil Litigation",
      phone: "+91 98765 43210",
      experienceYears: 14,
      status: "Active",
    },
  });

  const advocate2 = await prisma.user.upsert({
    where: { email: "advocate2@crm.com" },
    update: {
      barEnrollmentNo: "GJ/892/2017",
      specialisation: "Corporate & IPR Law",
      phone: "+91 98123 45678",
      experienceYears: 9,
      status: "Active",
    },
    create: {
      name: "Priya Patel",
      email: "advocate2@crm.com",
      password,
      role: Role.ADVOCATE,
      barEnrollmentNo: "GJ/892/2017",
      specialisation: "Corporate & IPR Law",
      phone: "+91 98123 45678",
      experienceYears: 9,
      status: "Active",
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
    const client = await prisma.client.upsert({
      where: { email: `client${i}@mail.com` },
      update: {},
      create: {
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
    const caseNumber = `CAS/2026/00${i}`;
    
    // Clean existing case if re-seeding to prevent caseNumber unique constraint collisions
    const existingCase = await prisma.case.findFirst({
      where: { caseNumber },
    });

    let c;
    if (existingCase) {
      c = existingCase;
    } else {
      c = await prisma.case.create({
        data: {
          title: `Case ${i}`,
          caseType: "CIVIL",
          caseNumber: caseNumber,
          court: `District Court ${((i - 1) % 3) + 1}`,
          status:
            i % 3 === 0
              ? "CLOSED"
              : i % 2 === 0
              ? "PENDING"
              : "ACTIVE",
          clientId: clients[(i - 1) % clients.length].id,
          advocateId: advocates[(i - 1) % advocates.length].id,
          filingDate: new Date(),
          priority: i % 2 === 0 ? "HIGH" : "NORMAL",
        },
      });
    }

    cases.push(c);
  }

  // -------------------------
  // HEARINGS & DOCUMENTS
  // -------------------------

  for (const c of cases) {
    // Only populate hearings/documents if none exist for this case
    const existingHearingsCount = await prisma.hearing.count({ where: { caseId: c.id } });
    if (existingHearingsCount === 0) {
      await prisma.hearing.create({
        data: {
          caseId: c.id,
          date: new Date(),
          remarks: "Initial Hearing",
          status: "SCHEDULED",
        },
      });

      await prisma.hearing.create({
        data: {
          caseId: c.id,
          date: new Date(Date.now() + 86400000 * 15),
          remarks: "Next Hearing",
          status: "SCHEDULED",
        },
      });
    }

    const existingDocsCount = await prisma.document.count({ where: { caseId: c.id } });
    if (existingDocsCount === 0) {
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
  console.log("=================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });