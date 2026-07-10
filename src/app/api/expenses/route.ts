import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
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