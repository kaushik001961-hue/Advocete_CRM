import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, invoiceWhereForUser, canManageFinance, canAccessClient } from "@/lib/permissions";

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoices = await prisma.invoice.findMany({
      where: invoiceWhereForUser(context),
      include: {
        client: true,
        legalCase: {
          select: { id: true, caseNumber: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAuthContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canManageFinance(context.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { clientId, caseId, amount, gstAmount, totalAmount, dueDate, notes } = body;

    if (!clientId || !dueDate || !Number.isFinite(Number(amount)) || !Number.isFinite(Number(totalAmount))) {
      return NextResponse.json({ error: "Client, amount and due date are required." }, { status: 400 });
    }

    if (!(await canAccessClient(String(clientId), context))) {
      return NextResponse.json({ error: "Client not found or access denied." }, { status: 404 });
    }

    if (caseId) {
      const caseAllowed = await prisma.case.findFirst({
        where: {
          id: String(caseId),
          clientId: String(clientId),
          ...(context.role === "ADVOCATE" ? { advocateId: context.userId } : {}),
        },
        select: { id: true },
      });
      if (!caseAllowed) return NextResponse.json({ error: "Case not found or access denied." }, { status: 404 });
    }

    const count = await prisma.invoice.count();
    const invoiceNo = `INV-2026-${String(count + 1).padStart(3, "0")}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        clientId: String(clientId),
        caseId: caseId ? String(caseId) : null,
        amount: Number(amount),
        gstAmount: Number(gstAmount || 0),
        totalAmount: Number(totalAmount),
        dueDate: new Date(dueDate),
        notes: notes || null,
        status: "PENDING",
      },
      include: { client: true, legalCase: true },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
