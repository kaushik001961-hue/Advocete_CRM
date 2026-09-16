import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "data" TEXT,
        "readAt" TIMESTAMP(3),
        "emailStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "whatsappStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "emailSentAt" TIMESTAMP(3),
        "whatsappSentAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "Notification_pkey"
          PRIMARY KEY ("id"),

        CONSTRAINT "Notification_userId_fkey"
          FOREIGN KEY ("userId")
          REFERENCES "User"("id")
          ON DELETE CASCADE
          ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Notification_userId_idx"
      ON "Notification"("userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Notification_type_idx"
      ON "Notification"("type");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx"
      ON "Notification"("createdAt");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Notification_emailStatus_idx"
      ON "Notification"("emailStatus");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Notification_whatsappStatus_idx"
      ON "Notification"("whatsappStatus");
    `);

    const result = await prisma.$queryRawUnsafe<
      { exists: boolean }[]
    >(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'Notification'
      ) AS exists;
    `);

    return NextResponse.json({
      success: true,
      message: "Notification table setup completed.",
      tableExists: result[0]?.exists === true,
    });
  } catch (error) {
    console.error("NOTIFICATION_DB_SETUP_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Database setup failed.",
      },
      { status: 500 }
    );
  }
}