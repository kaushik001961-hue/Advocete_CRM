import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const clients = await prisma.client.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            cases: true,
            documents: true,
            invoices: true,
          },
        },
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET /api/clients error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch clients",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json(
        {
          error: "Client name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const email =
      body.email?.toString().trim() || null;

    const existingClient = email
      ? await prisma.client.findUnique({
          where: {
            email,
          },
        })
      : null;

    if (existingClient) {
      return NextResponse.json(
        {
          error:
            "A client with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        phone:
          body.phone?.toString().trim() || null,
        email,
        address:
          body.address?.toString().trim() || null,
        city:
          body.city?.toString().trim() || null,
        state:
          body.state?.toString().trim() || null,
        pincode:
          body.pincode?.toString().trim() || null,
        notes:
          body.notes?.toString().trim() || null,
      },
    });

    return NextResponse.json(
      client,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/clients error:", error);

    return NextResponse.json(
      {
        error: "Failed to create client.",
      },
      {
        status: 500,
      }
    );
  }
}