import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function emptyToNull(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}
export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        cases: {
          select: {
            id: true,
            title: true,
            caseNumber: true,
            status: true,
            court: true,
            caseType: true,
            caseStage: true,
            filingDate: true,
            updatedAt: true,
            advocate: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },

        _count: {
          select: {
            cases: true,
            documents: true,
            invoices: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error("Error fetching client:", error);

    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.name || String(body.name).trim() === "") {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.update({
      where: { id },

      data: {
        name: String(body.name).trim(),
        phone: emptyToNull(body.phone),
        email: emptyToNull(body.email),
        address: emptyToNull(body.address),
        city: emptyToNull(body.city),
        state: emptyToNull(body.state),
        pincode: emptyToNull(body.pincode),
        notes: emptyToNull(body.notes),
      },
    });

    return NextResponse.json(client, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating client:", error);

    const prismaError = error as { code?: string };

    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "A client with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
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

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const hasRelatedRecords =
      client._count.cases > 0 ||
      client._count.documents > 0 ||
      client._count.invoices > 0;

    if (hasRelatedRecords) {
      return NextResponse.json(
        {
          error:
            "This client cannot be deleted because related cases, documents, or invoices exist.",
        },
        { status: 409 }
      );
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting client:", error);

    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}