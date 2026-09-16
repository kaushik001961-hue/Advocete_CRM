import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, caseWhereForUser, canCreateCase } from "@/lib/permissions";

/**
 * GET /api/cases
 *
 * Returns all cases with:
 * - Client
 * - Documents
 * - Hearings
 * - Timeline
 * - Important Dates
 * - Notes
 * - Related Cases
 */
export async function GET() {
  try {
    const context = await getAuthContext();

    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const cases = await prisma.case.findMany({
      where: caseWhereForUser(context),
      include: {
        client: true,
        documents: true,
        hearings: true,

        timelineEvents: {
          orderBy: {
            eventDate: "desc",
          },
        },

        importantDates: {
          orderBy: {
            date: "asc",
          },
        },

        notes: {
          orderBy: {
            createdAt: "desc",
          },
        },

        relatedFrom: {
          include: {
            relatedCase: {
              select: {
                id: true,
                caseNumber: true,
                caseType: true,
                title: true,
                status: true,
                court: true,
              },
            },
          },
        },

        relatedTo: {
          include: {
            case: {
              select: {
                id: true,
                caseNumber: true,
                caseType: true,
                title: true,
                status: true,
                court: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(cases, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching cases:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch cases",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST /api/cases
 *
 * Creates a new case.
 */
export async function POST(request: Request) {
  try {
    const context = await getAuthContext();

    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canCreateCase(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const {
      caseNumber,
      caseType,
      caseStage,
      title,
      court,
      status,
      clientId,

      // Court
      bench,
      presidingJudge,
      courtRoom,

      // Parties
      opposingParty,
      opposingCounsel,
      counselPhone,

      // Registration
      filingDate,
      registrationNumber,
      registrationDate,

      // Criminal / Police
      firNumber,
      firDate,
      policeStation,
      sectionsActs,

      // Case management
      priority,
      description,
      tags,
    } = body;

    /*
     * Required fields
     */
    if (
      !caseNumber ||
      !caseType ||
      !title ||
      !court ||
      !clientId
    ) {
      return NextResponse.json(
        {
          error:
            "Case number, case type, title, court, and client are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Verify client
     */
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        ...(context.role === "ADVOCATE"
          ? { cases: { some: { advocateId: context.userId } } }
          : {}),
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          error: "Selected client was not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Check duplicate case number
     */
    const existingCase = await prisma.case.findUnique({
      where: {
        caseNumber,
      },
    });

    if (existingCase) {
      return NextResponse.json(
        {
          error: "A case with this case number already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Find advocate
     *
     * Current application does not yet have
     * advocate selection in the UI, so we retain
     * the existing fallback behavior.
     */
    let advocate;

    if (context.role === "ADVOCATE") {
      advocate = await prisma.user.findUnique({
        where: { id: context.userId },
      });
    } else {
      advocate = await prisma.user.findFirst({
        where: { role: "ADVOCATE" },
      });

      if (!advocate) {
        advocate = await prisma.user.findFirst();
      }
    }

    if (!advocate) {
      return NextResponse.json(
        {
          error:
            "No advocate user found in database to assign case.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Create case
     */
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        caseType,
        caseStage: caseStage || "FILED",
        title,
        court,
        status: status || "ACTIVE",

        clientId,
        advocateId: advocate.id,

        // Court
        bench: bench || null,
        presidingJudge: presidingJudge || null,
        courtRoom: courtRoom || null,

        // Parties
        opposingParty: opposingParty || null,
        opposingCounsel: opposingCounsel || null,
        counselPhone: counselPhone || null,

        // Registration
        filingDate: filingDate
          ? new Date(filingDate)
          : null,

        registrationNumber:
          registrationNumber || null,

        registrationDate: registrationDate
          ? new Date(registrationDate)
          : null,

        // Criminal / Police
        firNumber: firNumber || null,

        firDate: firDate
          ? new Date(firDate)
          : null,

        policeStation:
          policeStation || null,

        sectionsActs:
          sectionsActs || null,

        // Case management
        priority: priority || "NORMAL",

        description:
          description || null,

        tags:
          tags || null,
      },

      include: {
        client: true,
        documents: true,
        hearings: true,

        timelineEvents: true,
        importantDates: true,
        notes: true,

        relatedFrom: {
          include: {
            relatedCase: true,
          },
        },

        relatedTo: {
          include: {
            case: true,
          },
        },
      },
    });

    /*
     * Automatically create the first timeline event.
     */
    await prisma.caseTimelineEvent.create({
      data: {
        caseId: newCase.id,
        eventType: "CASE_CREATED",
        title: "Case Created",
        description: `Case ${newCase.caseNumber} was created.`,
        eventDate: newCase.filingDate || newCase.createdAt,
      },
    });

    /*
     * Fetch final case including timeline
     */
    const finalCase = await prisma.case.findUnique({
      where: {
        id: newCase.id,
      },

      include: {
        client: true,
        documents: true,
        hearings: true,

        timelineEvents: {
          orderBy: {
            eventDate: "desc",
          },
        },

        importantDates: {
          orderBy: {
            date: "asc",
          },
        },

        notes: {
          orderBy: {
            createdAt: "desc",
          },
        },

        relatedFrom: {
          include: {
            relatedCase: true,
          },
        },

        relatedTo: {
          include: {
            case: true,
          },
        },
      },
    });

    return NextResponse.json(finalCase, {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating case:", error);

    /*
     * Prisma duplicate constraint protection
     */
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "A case with this case number already exists.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create case",
      },
      {
        status: 500,
      }
    );
  }
}