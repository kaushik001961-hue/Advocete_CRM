import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessTask, getAuthContext } from "@/lib/permissions";

const ALLOWED_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

function isAllowedStatus(value: string) {
  return ALLOWED_STATUSES.includes(
    value as (typeof ALLOWED_STATUSES)[number]
  );
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/tasks/[id]
export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const userContext = await getAuthContext();

    if (!userContext || !(await canAccessTask(id, userContext))) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id]
export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const userContext = await getAuthContext();

    if (!userContext || !(await canAccessTask(id, userContext))) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const data: {
      title?: string;
      description?: string | null;
      dueDate?: Date | null;
      status?: string;
      assignedTo?: string | null;
    } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          { error: "Task title cannot be empty" },
          { status: 400 }
        );
      }

      data.title = body.title.trim();
    }

    if (body.description !== undefined) {
      data.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    }

    if (body.assignedTo !== undefined) {
      if (userContext?.role === "ADVOCATE") {
        data.assignedTo = userContext.userId;
      } else {
        data.assignedTo =
          typeof body.assignedTo === "string"
            ? body.assignedTo.trim() || null
            : null;
      }
    }

    if (body.dueDate !== undefined) {
      if (!body.dueDate) {
        data.dueDate = null;
      } else {
        const parsedDate = new Date(body.dueDate);

        if (Number.isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid due date" },
            { status: 400 }
          );
        }

        data.dueDate = parsedDate;
      }
    }

    if (body.status !== undefined) {
      if (typeof body.status !== "string") {
        return NextResponse.json(
          { error: "Invalid task status" },
          { status: 400 }
        );
      }

      const status = body.status.trim().toUpperCase();

      if (!isAllowedStatus(status)) {
        return NextResponse.json(
          {
            error:
              "Invalid status. Allowed values: PENDING, IN_PROGRESS, COMPLETED, CANCELLED",
          },
          { status: 400 }
        );
      }

      data.status = status;
    }

    const task = await prisma.task.update({
      where: { id },
      data,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const userContext = await getAuthContext();

    if (!userContext || !(await canAccessTask(id, userContext))) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}