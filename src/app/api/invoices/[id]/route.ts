import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessInvoice, getAuthContext, canManageFinance } from "@/lib/permissions";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAuthContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canManageFinance(context.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!(await canAccessInvoice(id, context))) {
      return NextResponse.json({ error: "Invoice not found or access denied" }, { status: 404 });
    }

    const body = await request.json();
    const status = String(body.status || "").trim().toUpperCase();
    if (!status) return NextResponse.json({ error: "Invoice status is required" }, { status: 400 });

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: { client: true, legalCase: true },
    });

    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return NextResponse.json({ error: "Failed to update invoice status" }, { status: 500 });
  }
}
