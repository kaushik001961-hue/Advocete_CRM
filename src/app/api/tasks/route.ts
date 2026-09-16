import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAndSendNotification } from "@/lib/notifications";

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

// GET /api/tasks
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tasks = await prisma.task.findMany({
      orderBy: [
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);

    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const assignedTo =
      typeof body.assignedTo === "string"
        ? body.assignedTo.trim()
        : null;

    const status =
      typeof body.status === "string"
        ? body.status.trim().toUpperCase()
        : "PENDING";

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    if (!isAllowedStatus(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Allowed values: PENDING, IN_PROGRESS, COMPLETED, CANCELLED",
        },
        { status: 400 }
      );
    }

    let dueDate: Date | null = null;

    if (body.dueDate) {
      const parsedDate = new Date(body.dueDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid due date" },
          { status: 400 }
        );
      }

      dueDate = parsedDate;
    }

    /*
     * Create the task first.
     *
     * We intentionally do not make notification delivery
     * part of the database operation. A notification failure
     * must never prevent the task from being created.
     */
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate,
        status,
        assignedTo,
      },
    });

    /*
     * Notify the assigned advocate/staff member.
     *
     * assignedTo stores the User ID.
     */
    if (assignedTo) {
      try {
        const assignedUser = await prisma.user.findUnique({
          where: {
            id: assignedTo,
          },

          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            emailNotifications: true,
            whatsappNotifications: true,
          },
        });

        if (assignedUser) {
          let dueDateText = "No due date";

          if (dueDate) {
            dueDateText = dueDate.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            );
          }

          await createAndSendNotification({
            userId: assignedUser.id,

            type: "TASK_ASSIGNED",

            title: "New Task Assigned",

            message:
              `A new task has been assigned to you: ` +
              `"${title}". ` +
              `Due date: ${dueDateText}. ` +
              `Status: ${status.replace("_", " ")}.`,

            data: {
              taskId: task.id,
              title: task.title,
              description: task.description,
              dueDate: dueDate
                ? dueDate.toISOString()
                : null,
              status: task.status,
              assignedTo: assignedUser.id,
            },
          });
        } else {
          console.warn(
            `TASK_NOTIFICATION: Assigned user ${assignedTo} was not found.`
          );
        }
      } catch (notificationError) {
        /*
         * Notification failure must not break task creation.
         */
        console.error(
          "TASK_NOTIFICATION_ERROR",
          notificationError
        );
      }
    }

    return NextResponse.json(task, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/tasks error:", error);

    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}