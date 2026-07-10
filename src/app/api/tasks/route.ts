import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        dueDate: body.dueDate
          ? new Date(body.dueDate)
          : null,
        assignedTo: body.assignedTo,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}