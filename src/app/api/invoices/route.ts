import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all invoices with client details included
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: true, // Pulls client details via the relation
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST: Create a new invoice in the database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, amount, gstAmount, totalAmount, dueDate, notes } = body;

    // Generate a unique invoice number
    const count = await prisma.invoice.count();
    const invoiceNo = `INV-2026-${String(count + 1).padStart(3, "0")}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        clientId,
        amount: parseFloat(amount),
        gstAmount: parseFloat(gstAmount || 0),
        totalAmount: parseFloat(totalAmount),
        dueDate: new Date(dueDate), // Converts string to DateTime object
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}