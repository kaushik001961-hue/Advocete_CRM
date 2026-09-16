import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/permissions";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const context = await getAuthContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (context.role !== "ADMIN" && context.role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const body = await req.json();

  const expense =
    await prisma.expense.update({
      where: { id },
      data: {
        title: body.title,
        description:
          body.description,
        amount: Number(
          body.amount
        ),
        category:
          body.category,
        expenseDate: new Date(
          body.expenseDate
        ),
      },
    });

  return NextResponse.json(
    expense
  );
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const context = await getAuthContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (context.role !== "ADMIN" && context.role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  await prisma.expense.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
  });
}