import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: body.invoiceNo,
        clientId: body.clientId,
        amount: Number(body.amount),
        gstAmount: Number(body.gstAmount || 0),
        totalAmount: Number(body.totalAmount),
        dueDate: new Date(body.dueDate),
        notes: body.notes,
        status: "PENDING",
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}