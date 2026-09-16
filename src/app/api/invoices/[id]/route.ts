import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { status } = body;

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: { client: true },
    });

    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    console.error("Error updating invoice status:", error);

    return NextResponse.json(
      { error: "Failed to update invoice status" },
      { status: 500 }
    );
  }
}