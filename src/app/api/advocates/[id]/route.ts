import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    const data: {
      email?: string;
      phone?: string | null;
      emailNotifications?: boolean;
      whatsappNotifications?: boolean;
    } = {};

    if (typeof body.email === "string") {
      const email = body.email.trim();

      if (!email) {
        return NextResponse.json(
          { error: "Email address is required." },
          { status: 400 }
        );
      }

      data.email = email;
    }

    if (
      body.phone === null ||
      typeof body.phone === "string"
    ) {
      data.phone =
        typeof body.phone === "string"
          ? body.phone.trim() || null
          : null;
    }

    if (
      typeof body.emailNotifications === "boolean"
    ) {
      data.emailNotifications =
        body.emailNotifications;
    }

    if (
      typeof body.whatsappNotifications === "boolean"
    ) {
      data.whatsappNotifications =
        body.whatsappNotifications;
    }

    const advocate = await prisma.user.update({
      where: {
        id,
      },

      data,

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailNotifications: true,
        whatsappNotifications: true,
      },
    });

    return NextResponse.json({
      success: true,
      advocate,
    });
  } catch (error) {
    console.error(
      "PATCH /api/advocates/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update advocate.",
      },
      { status: 500 }
    );
  }
}