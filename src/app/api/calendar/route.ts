import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CalendarEvent = {
  id: string;
  date: string;
  type: "HEARING" | "TASK" | "IMPORTANT_DATE";
  title: string;
  subtitle: string;
  description: string | null;
  status: string | null;
  caseId: string | null;
  caseNumber: string | null;
  caseTitle: string | null;
  court: string | null;
  courtRoom: string | null;
  hearingType: string | null;
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const role = session.user.role;

    const isAdmin = role === "ADMIN";

    const [
      hearings,
      tasks,
      importantDates,
    ] = await Promise.all([
      prisma.hearing.findMany({
        where: isAdmin
          ? {}
          : {
              case: {
                advocateId: userId,
              },
            },
        orderBy: {
          date: "asc",
        },
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
              court: true,
            },
          },
        },
      }),

      prisma.task.findMany({
        where: isAdmin
          ? {}
          : {
              OR: [
                {
                  assignedTo: userId,
                },
                {
                  assignedTo: null,
                },
              ],
            },
        orderBy: {
          dueDate: "asc",
        },
      }),

      prisma.caseImportantDate.findMany({
        where: isAdmin
          ? {}
          : {
              case: {
                advocateId: userId,
              },
            },
        orderBy: {
          date: "asc",
        },
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
              court: true,
            },
          },
        },
      }),
    ]);

    const events: CalendarEvent[] = [];

    /*
     * ============================================================
     * HEARINGS
     * ============================================================
     */

    for (const hearing of hearings) {
      events.push({
        id: `hearing-${hearing.id}`,
        date: hearing.date.toISOString(),
        type: "HEARING",
        title:
          hearing.hearingType ||
          "Court Hearing",
        subtitle:
          hearing.case?.caseNumber ||
          hearing.case?.title ||
          "Case",
        description:
          hearing.remarks ||
          null,
        status: hearing.status,
        caseId:
          hearing.case?.id ||
          hearing.caseId ||
          null,
        caseNumber:
          hearing.case?.caseNumber ||
          null,
        caseTitle:
          hearing.case?.title ||
          null,
        court:
          hearing.case?.court ||
          null,
        courtRoom:
          hearing.courtRoom ||
          null,
        hearingType:
          hearing.hearingType ||
          null,
      });

      /*
       * If the hearing has a next date, show that
       * as a separate calendar event as well.
       */
      if (hearing.nextDate) {
        events.push({
          id: `hearing-next-${hearing.id}`,
          date: hearing.nextDate.toISOString(),
          type: "HEARING",
          title: "Next Hearing",
          subtitle:
            hearing.case?.caseNumber ||
            hearing.case?.title ||
            "Case",
          description:
            hearing.remarks ||
            null,
          status: "SCHEDULED",
          caseId:
            hearing.case?.id ||
            hearing.caseId ||
            null,
          caseNumber:
            hearing.case?.caseNumber ||
            null,
          caseTitle:
            hearing.case?.title ||
            null,
          court:
            hearing.case?.court ||
            null,
          courtRoom:
            hearing.courtRoom ||
            null,
          hearingType:
            hearing.hearingType ||
            null,
        });
      }
    }

    /*
     * ============================================================
     * TASKS
     * ============================================================
     */

    for (const task of tasks) {
      if (!task.dueDate) {
        continue;
      }

      events.push({
        id: `task-${task.id}`,
        date: task.dueDate.toISOString(),
        type: "TASK",
        title: task.title,
        subtitle: "Task",
        description:
          task.description ||
          null,
        status: task.status,
        caseId: null,
        caseNumber: null,
        caseTitle: null,
        court: null,
        courtRoom: null,
        hearingType: null,
      });
    }

    /*
     * ============================================================
     * IMPORTANT CASE DATES
     * ============================================================
     */

    for (const item of importantDates) {
      events.push({
        id: `important-${item.id}`,
        date: item.date.toISOString(),
        type: "IMPORTANT_DATE",
        title: item.title,
        subtitle:
          item.case?.caseNumber ||
          item.case?.title ||
          "Case Date",
        description:
          item.description ||
          null,
        status: null,
        caseId:
          item.case?.id ||
          item.caseId ||
          null,
        caseNumber:
          item.case?.caseNumber ||
          null,
        caseTitle:
          item.case?.title ||
          null,
        court:
          item.case?.court ||
          null,
        courtRoom: null,
        hearingType: null,
      });
    }

    events.sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    return NextResponse.json({
      events,
      counts: {
        hearings: hearings.length,
        tasks: tasks.filter(
          (task) => task.dueDate
        ).length,
        importantDates:
          importantDates.length,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/calendar error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load calendar data.",
      },
      {
        status: 500,
      }
    );
  }
}