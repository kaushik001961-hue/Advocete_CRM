import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseDate(value: unknown) {
  if (!value) return null;

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Find a hearing only if it belongs to a case
 * owned by the logged-in advocate.
 */
async function getOwnedHearing(
  id: string,
  userId: string
) {
  return prisma.hearing.findFirst({
    where: {
      id,

      case: {
        advocateId: userId,
      },
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
        },
      },
    },
  });
}

/**
 * GET /api/hearings/[id]
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const hearing = await getOwnedHearing(
      id,
      session.user.id
    );

    if (!hearing) {
      return NextResponse.json(
        {
          error: "Hearing not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(hearing, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching hearing:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch hearing",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * PUT /api/hearings/[id]
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const existingHearing = await getOwnedHearing(
      id,
      session.user.id
    );

    if (!existingHearing) {
      return NextResponse.json(
        {
          error: "Hearing not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    const body = await request.json();

    const {
      date,
      remarks,
      nextDate,
      status,
      courtRoom,
      hearingType,
      orderPassed,
    } = body;

    let hearingDate: Date | undefined;

    if (date !== undefined) {
      const parsed = parseDate(date);

      if (!parsed) {
        return NextResponse.json(
          {
            error: "Invalid hearing date.",
          },
          {
            status: 400,
          }
        );
      }

      hearingDate = parsed;
    }

    let parsedNextDate: Date | null | undefined;

    if (nextDate !== undefined) {
      if (!nextDate) {
        parsedNextDate = null;
      } else {
        const parsed = parseDate(nextDate);

        if (!parsed) {
          return NextResponse.json(
            {
              error: "Invalid next hearing date.",
            },
            {
              status: 400,
            }
          );
        }

        parsedNextDate = parsed;
      }
    }

    const updatedHearing =
      await prisma.hearing.update({
        where: {
          id,
        },

        data: {
          ...(hearingDate
            ? {
                date: hearingDate,
              }
            : {}),

          ...(remarks !== undefined
            ? {
                remarks: remarks || null,
              }
            : {}),

          ...(nextDate !== undefined
            ? {
                nextDate: parsedNextDate,
              }
            : {}),

          ...(status !== undefined
            ? {
                status: status || "SCHEDULED",
              }
            : {}),

          ...(courtRoom !== undefined
            ? {
                courtRoom: courtRoom || null,
              }
            : {}),

          ...(hearingType !== undefined
            ? {
                hearingType: hearingType || null,
              }
            : {}),

          ...(orderPassed !== undefined
            ? {
                orderPassed: orderPassed || null,
              }
            : {}),
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
            },
          },
        },
      });

    /*
     * If the hearing date changed, record it
     * in the case timeline.
     */
    if (hearingDate) {
      await prisma.caseTimelineEvent.create({
        data: {
          caseId: existingHearing.case.id,
          eventType: "HEARING_UPDATED",
          title: "Hearing Updated",
          description: `Hearing details were updated for ${hearingDate.toLocaleDateString(
            "en-IN"
          )}.`,
          eventDate: hearingDate,
        },
      });
    }

    return NextResponse.json(updatedHearing, {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating hearing:", error);

    return NextResponse.json(
      {
        error: "Failed to update hearing",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * DELETE /api/hearings/[id]
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const existingHearing = await getOwnedHearing(
      id,
      session.user.id
    );

    if (!existingHearing) {
      return NextResponse.json(
        {
          error: "Hearing not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.hearing.delete({
      where: {
        id,
      },
    });

    await prisma.caseTimelineEvent.create({
      data: {
        caseId: existingHearing.case.id,
        eventType: "HEARING_DELETED",
        title: "Hearing Deleted",
        description: `A hearing scheduled for ${existingHearing.date.toLocaleDateString(
          "en-IN"
        )} was deleted.`,
        eventDate: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hearing deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting hearing:", error);

    return NextResponse.json(
      {
        error: "Failed to delete hearing",
      },
      {
        status: 500,
      }
    );
  }
}