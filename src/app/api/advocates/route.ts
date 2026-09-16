import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeStatus(value: string | null | undefined) {
  const status = (value || "Active").trim().toUpperCase();

  if (status === "ACTIVE") return "Active";
  if (status === "INACTIVE") return "Inactive";

  if (
    status === "ON LEAVE" ||
    status === "ON_LEAVE" ||
    status === "ON-LEAVE"
  ) {
    return "On Leave";
  }

  return "Active";
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const advocates = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADVOCATE", "STAFF"],
        },
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialisation: true,
        experienceYears: true,
        barEnrollmentNo: true,
        status: true,

        emailNotifications: true,
        whatsappNotifications: true,

        _count: {
          select: {
            cases: true,
          },
        },
      },

      orderBy: {
        name: "asc",
      },
    });

    const result = advocates.map((advocate) => ({
      id: advocate.id,
      name: advocate.name,
      email: advocate.email,
      phone: advocate.phone || "",
      specialisation:
        advocate.specialisation || "General Practice",
      experienceYears: advocate.experienceYears || 0,
      barEnrollmentNo:
        advocate.barEnrollmentNo || "",

      status: normalizeStatus(advocate.status),

      activeCases: advocate._count.cases,

      emailNotifications:
        advocate.emailNotifications ?? true,

      whatsappNotifications:
        advocate.whatsappNotifications ?? true,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "GET /api/advocates error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch advocates",
      },
      {
        status: 500,
      }
    );
  }
}