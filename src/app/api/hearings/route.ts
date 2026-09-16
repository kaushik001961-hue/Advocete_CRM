/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAndSendNotification } from "@/lib/notifications";

function parseDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * GET /api/hearings
 *
 * ADMIN / STAFF:
 *   Can see all hearings.
 *
 * ADVOCATE:
 *   Can see only hearings belonging to
 *   cases assigned to that advocate.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    console.log("=== HEARINGS AUTH DEBUG ===");
    console.log({
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role,
    });
    console.log("==========================");

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const role = session.user.role;

    const { searchParams } = new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const status =
      searchParams.get("status")?.trim() || "";

    const caseId =
      searchParams.get("caseId")?.trim() || "";

    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));

    const where: any = {
      ...(role === "ADVOCATE"
        ? {
            case: {
              advocateId: userId,
            },
          }
        : {}),

      ...(status
        ? {
            status,
          }
        : {}),

      ...(caseId
        ? {
            caseId,
          }
        : {}),

      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                remarks: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                hearingType: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                orderPassed: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                courtRoom: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                case: {
                  caseNumber: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                case: {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                case: {
                  client: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                case: {
                  advocate: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const hearings = await prisma.hearing.findMany({
      where,

      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            caseType: true,
            title: true,
            court: true,
            status: true,

            client: {
              select: {
                id: true,
                name: true,
              },
            },

            advocate: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(hearings, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching hearings:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch hearings",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST /api/hearings
 *
 * ADMIN / STAFF:
 *   Can create hearings for any case.
 *
 * ADVOCATE:
 *   Can create hearings only for their own cases.
 *
 * After successful creation:
 *   - Timeline event is created.
 *   - Assigned advocate receives a notification.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const role = session.user.role;

    const body = await request.json();

    const {
      caseId,
      date,
      remarks,
      nextDate,
      status,
      courtRoom,
      hearingType,
      orderPassed,
    } = body;

    if (!caseId || !date) {
      return NextResponse.json(
        {
          error: "Case and hearing date are required.",
        },
        {
          status: 400,
        }
      );
    }

    const hearingDate = new Date(date);

    if (Number.isNaN(hearingDate.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid hearing date.",
        },
        {
          status: 400,
        }
      );
    }

    let parsedNextDate: Date | null = null;

    if (nextDate) {
      parsedNextDate = new Date(nextDate);

      if (Number.isNaN(parsedNextDate.getTime())) {
        return NextResponse.json(
          {
            error: "Invalid next hearing date.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * ADMIN / STAFF:
     * Can create a hearing for any case.
     *
     * ADVOCATE:
     * Can create a hearing only for
     * their own case.
     */
    const existingCase =
      role === "ADVOCATE"
        ? await prisma.case.findFirst({
            where: {
              id: caseId,
              advocateId: userId,
            },
          })
        : await prisma.case.findUnique({
            where: {
              id: caseId,
            },
          });

    if (!existingCase) {
      return NextResponse.json(
        {
          error: "Case not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Create hearing.
     */
    const hearing = await prisma.hearing.create({
      data: {
        caseId,
        date: hearingDate,
        remarks: remarks || null,
        nextDate: parsedNextDate,
        status: status || "SCHEDULED",
        courtRoom: courtRoom || null,
        hearingType: hearingType || null,
        orderPassed: orderPassed || null,
      },

      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            caseType: true,
            title: true,
            court: true,
            status: true,

            client: {
              select: {
                id: true,
                name: true,
              },
            },

            advocate: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    /*
     * Automatically create a timeline event.
     */
    await prisma.caseTimelineEvent.create({
      data: {
        caseId,
        eventType: "HEARING_SCHEDULED",
        title: "Hearing Scheduled",
        description: `A hearing was scheduled for ${hearingDate.toLocaleDateString(
          "en-IN"
        )}.`,
        eventDate: hearingDate,
      },
    });

    /*
     * Send notification to the assigned advocate.
     *
     * Notification errors are intentionally isolated so that
     * a failed email/provider connection does NOT make the
     * hearing creation fail.
     */
    try {
      const advocateId = existingCase.advocateId;

      if (advocateId) {
        const advocate = await prisma.user.findUnique({
          where: {
            id: advocateId,
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

        if (advocate) {
          const hearingDateText =
            hearingDate.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            );

          const hearingTimeText =
            hearingDate.toLocaleTimeString(
              "en-IN",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            );

          await createAndSendNotification({
            userId: advocate.id,

            type: "HEARING_SCHEDULED",

            title: "New Hearing Scheduled",

            message:
              `A new hearing has been scheduled for Case ` +
              `${existingCase.caseNumber || "N/A"} - ` +
              `${existingCase.title}. ` +
              `Date: ${hearingDateText} at ${hearingTimeText}. ` +
              `Court: ${existingCase.court || "N/A"}.`,

            data: {
              hearingId: hearing.id,
              caseId: existingCase.id,
              caseNumber:
                existingCase.caseNumber,
              caseTitle: existingCase.title,
              court: existingCase.court,
              hearingDate:
                hearingDate.toISOString(),
              hearingType:
                hearingType || null,
              courtRoom:
                courtRoom || null,
            },
          });
        }
      }
    } catch (notificationError) {
      console.error(
        "HEARING_NOTIFICATION_ERROR",
        notificationError
      );
    }

    return NextResponse.json(hearing, {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating hearing:", error);

    return NextResponse.json(
      {
        error: "Failed to create hearing",
      },
      {
        status: 500,
      }
    );
  }
}