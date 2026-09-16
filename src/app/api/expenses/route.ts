import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/permissions";

export async function POST(req: Request) {
  try {
    const context = await getAuthContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (context.role !== "ADMIN" && context.role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    const expense =
      await prisma.expense.create({
        data: {
          title: body.title,
          description:
            body.description || null,
          amount: Number(body.amount),
          category: body.category,
          expenseDate: new Date(
            body.expenseDate
          ),
        },
      });

    return NextResponse.json(
      expense
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}