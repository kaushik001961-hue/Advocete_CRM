import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const ALLOWED_ROLES = [
  "ADMIN",
  "ADVOCATE",
  "STAFF",
] as const;

function isAdmin(role: unknown) {
  return role === "ADMIN";
}

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const data: {
      name?: string;
      email?: string;
      role?: "ADMIN" | "ADVOCATE" | "STAFF";
      status?: string;
      phone?: string | null;
      specialisation?: string | null;
      barEnrollmentNo?: string | null;
      experienceYears?: number;
      password?: string;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          { error: "Name is required." },
          { status: 400 }
        );
      }

      data.name = name;
    }

    if (body.email !== undefined) {
      const email = String(body.email)
        .trim()
        .toLowerCase();

      if (!email) {
        return NextResponse.json(
          { error: "Email is required." },
          { status: 400 }
        );
      }

      const duplicate =
        await prisma.user.findFirst({
          where: {
            email,
            NOT: { id },
          },
        });

      if (duplicate) {
        return NextResponse.json(
          {
            error:
              "Another user already uses this email.",
          },
          { status: 409 }
        );
      }

      data.email = email;
    }

    if (body.role !== undefined) {
      const role = String(body.role);

      if (
        !ALLOWED_ROLES.includes(
          role as (typeof ALLOWED_ROLES)[number]
        )
      ) {
        return NextResponse.json(
          { error: "Invalid user role." },
          { status: 400 }
        );
      }

      data.role = role as
        | "ADMIN"
        | "ADVOCATE"
        | "STAFF";
    }

    if (body.status !== undefined) {
      data.status = String(body.status);
    }

    if (body.phone !== undefined) {
      data.phone = body.phone
        ? String(body.phone).trim()
        : null;
    }

    if (body.specialisation !== undefined) {
      data.specialisation = body.specialisation
        ? String(body.specialisation).trim()
        : null;
    }

    if (body.barEnrollmentNo !== undefined) {
      const enrollment = body.barEnrollmentNo
        ? String(body.barEnrollmentNo).trim()
        : null;

      if (enrollment) {
        const duplicate =
          await prisma.user.findFirst({
            where: {
              barEnrollmentNo: enrollment,
              NOT: { id },
            },
          });

        if (duplicate) {
          return NextResponse.json(
            {
              error:
                "Another user already uses this Bar Enrollment Number.",
            },
            { status: 409 }
          );
        }
      }

      data.barEnrollmentNo = enrollment;
    }

    if (body.experienceYears !== undefined) {
      const years = Number(body.experienceYears);

      if (Number.isNaN(years) || years < 0) {
        return NextResponse.json(
          { error: "Invalid experience years." },
          { status: 400 }
        );
      }

      data.experienceYears = years;
    }

    if (body.password) {
      const password = String(body.password);

      if (password.length < 6) {
        return NextResponse.json(
          {
            error:
              "Password must be at least 6 characters.",
          },
          { status: 400 }
        );
      }

      data.password = await bcrypt.hash(
        password,
        12
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data,

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

    return NextResponse.json(user);
  } catch (error) {
    console.error(
      "PATCH /api/users/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (session.user.id === id) {
      return NextResponse.json(
        {
          error:
            "You cannot delete your own logged-in account.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/users/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete this user. The user may have related records.",
      },
      { status: 500 }
    );
  }
}