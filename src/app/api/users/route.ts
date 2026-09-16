import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const ALLOWED_ROLES = ["ADMIN", "ADVOCATE", "STAFF"] as const;

function isAdmin(role: unknown) {
  return role === "ADMIN";
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const users = await prisma.user.findMany({
      where: {
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(ALLOWED_ROLES.includes(
          role as (typeof ALLOWED_ROLES)[number]
        )
          ? {
              role: role as
                | "ADMIN"
                | "ADVOCATE"
                | "STAFF",
            }
          : {}),

        ...(status
          ? {
              status,
            }
          : {}),
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        specialisation: true,
        experienceYears: true,
        barEnrollmentNo: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      { error: "Failed to load users." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");
    const role = String(body.role || "STAFF");
    const status = String(body.status || "Active");

    const phone = body.phone
      ? String(body.phone).trim()
      : null;

    const specialisation = body.specialisation
      ? String(body.specialisation).trim()
      : null;

    const barEnrollmentNo = body.barEnrollmentNo
      ? String(body.barEnrollmentNo).trim()
      : null;

    const experienceYears =
      body.experienceYears !== undefined &&
      body.experienceYears !== ""
        ? Number(body.experienceYears)
        : 0;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.includes(
      role as (typeof ALLOWED_ROLES)[number]
    )) {
      return NextResponse.json(
        { error: "Invalid user role." },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(experienceYears) ||
      experienceYears < 0
    ) {
      return NextResponse.json(
        { error: "Invalid experience years." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    if (barEnrollmentNo) {
      const existingEnrollment =
        await prisma.user.findUnique({
          where: {
            barEnrollmentNo,
          },
        });

      if (existingEnrollment) {
        return NextResponse.json(
          {
            error:
              "This Bar Enrollment Number is already in use.",
          },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: role as "ADMIN" | "ADVOCATE" | "STAFF",
        status,
        phone,
        specialisation,
        barEnrollmentNo,
        experienceYears,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        specialisation: true,
        experienceYears: true,
        barEnrollmentNo: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/users error:", error);

    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}