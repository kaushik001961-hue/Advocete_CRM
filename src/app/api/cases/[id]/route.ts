import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAuthContext,
  canAccessCase,
  canDeleteCase,
  canDeleteRecords,
} from "@/lib/permissions";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(
  value: unknown
): string | null | undefined {
  if (value === undefined) return undefined;

  if (value === null) return null;

  const valueString = String(value).trim();

  return valueString === "" ? null : valueString;
}

function normalizeDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;

  if (value === null || value === "") {
    return null;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/* ============================================================
   GET SINGLE CASE
============================================================ */

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const userContext = await getAuthContext();

    if (!userContext) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Case ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Security:
     * ADMIN / STAFF can access operational cases.
     * ADVOCATE can access only cases assigned to them.
     */
    if (!(await canAccessCase(id, userContext))) {
      return NextResponse.json(
        {
          error: "Case not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    const caseData = await prisma.case.findUnique({
      where: {
        id,
      },

      include: {
        client: true,
        advocate: true,

        hearings: {
          orderBy: {
            date: "desc",
          },
        },

        documents: true,

        timelineEvents: {
          orderBy: {
            createdAt: "desc",
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

        relatedFrom: true,
        relatedTo: true,

        invoices: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json(
        {
          error: "Case not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("GET /api/cases/[id] error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load case.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================
   PUT UPDATE CASE
============================================================ */

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * FIX:
     * Build userContext before using it anywhere below.
     */
    const userContext = await getAuthContext();

    if (!userContext) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Case ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Security:
     * Verify the current user is allowed to access this case.
     */
    if (!(await canAccessCase(id, userContext))) {
      return NextResponse.json(
        {
          error: "Case not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    const body = await request.json();

    /*
     * ADVOCATE restriction:
     * An Advocate may update their own case but cannot
     * reassign that case to another advocate.
     */
    if (
      userContext.role === "ADVOCATE" &&
      body.advocateId !== undefined &&
      String(body.advocateId).trim() !== userContext.userId
    ) {
      return NextResponse.json(
        {
          error:
            "Advocates cannot reassign a case to another advocate.",
        },
        {
          status: 403,
        }
      );
    }

    /* --------------------------------------------------------
       Find existing case
    -------------------------------------------------------- */

    const existingCase = await prisma.case.findUnique({
      where: {
        id,
      },
    });

    if (!existingCase) {
      return NextResponse.json(
        {
          error: "Case not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* --------------------------------------------------------
       Basic required fields
    -------------------------------------------------------- */

    const title =
      body.title !== undefined
        ? normalizeString(body.title)
        : existingCase.title;

    const caseType =
      body.caseType !== undefined
        ? normalizeString(body.caseType)
        : existingCase.caseType;

    const court =
      body.court !== undefined
        ? normalizeString(body.court)
        : existingCase.court;

    const caseNumber =
      body.caseNumber !== undefined
        ? normalizeString(body.caseNumber)
        : existingCase.caseNumber;

    const clientId =
      body.clientId !== undefined
        ? normalizeString(body.clientId)
        : existingCase.clientId;

    const advocateId =
      body.advocateId !== undefined
        ? normalizeString(body.advocateId)
        : existingCase.advocateId;

    if (!caseNumber) {
      return NextResponse.json(
        {
          error: "Case number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          error: "Case title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!caseType) {
      return NextResponse.json(
        {
          error: "Case type is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!court) {
      return NextResponse.json(
        {
          error: "Court is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        {
          error: "Client is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!advocateId) {
      return NextResponse.json(
        {
          error: "Advocate is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* --------------------------------------------------------
       Validate client
    -------------------------------------------------------- */

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,

        /*
         * ADVOCATE can only select a client already connected
         * to one of their cases.
         */
        ...(userContext.role === "ADVOCATE"
          ? {
              cases: {
                some: {
                  advocateId: userContext.userId,
                },
              },
            }
          : {}),
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          error: "Selected client was not found.",
        },
        {
          status: 400,
        }
      );
    }

    /* --------------------------------------------------------
       Validate advocate
    -------------------------------------------------------- */

    const advocate = await prisma.user.findUnique({
      where: {
        id: advocateId,
      },
    });

    if (!advocate) {
      return NextResponse.json(
        {
          error: "Selected advocate was not found.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Only valid application roles should be assigned.
     */
    if (
      advocate.role !== "ADMIN" &&
      advocate.role !== "ADVOCATE" &&
      advocate.role !== "STAFF"
    ) {
      return NextResponse.json(
        {
          error: "Selected advocate has an invalid role.",
        },
        {
          status: 400,
        }
      );
    }

    /* --------------------------------------------------------
       Prevent duplicate case number
    -------------------------------------------------------- */

    const duplicateCaseNumber =
      await prisma.case.findFirst({
        where: {
          caseNumber,
          NOT: {
            id,
          },
        },
      });

    if (duplicateCaseNumber) {
      return NextResponse.json(
        {
          error:
            "Another case already uses this case number.",
        },
        {
          status: 400,
        }
      );
    }

    /* --------------------------------------------------------
       CNR
    -------------------------------------------------------- */

    let cnrNumber:
      | string
      | null
      | undefined = undefined;

    if (body.cnrNumber !== undefined) {
      const normalizedCnr = normalizeString(
        body.cnrNumber
      ).toUpperCase();

      if (normalizedCnr === "") {
        cnrNumber = null;
      } else {
        if (!/^[A-Z0-9]{16}$/.test(normalizedCnr)) {
          return NextResponse.json(
            {
              error:
                "CNR number must contain exactly 16 letters/numbers.",
            },
            {
              status: 400,
            }
          );
        }

        const duplicateCnr =
          await prisma.case.findFirst({
            where: {
              cnrNumber: normalizedCnr,
              NOT: {
                id,
              },
            },
          });

        if (duplicateCnr) {
          return NextResponse.json(
            {
              error:
                "This CNR number is already assigned to another case.",
            },
            {
              status: 400,
            }
          );
        }

        cnrNumber = normalizedCnr;
      }
    }

    /* --------------------------------------------------------
       Optional dates
    -------------------------------------------------------- */

    const filingDate =
      body.filingDate !== undefined
        ? normalizeDate(body.filingDate)
        : undefined;

    const registrationDate =
      body.registrationDate !== undefined
        ? normalizeDate(body.registrationDate)
        : undefined;

    const firDate =
      body.firDate !== undefined
        ? normalizeDate(body.firDate)
        : undefined;

    /* --------------------------------------------------------
       Build update object
    -------------------------------------------------------- */

    const updateData: Record<string, unknown> = {
      caseNumber,
      caseType,
      title,
      court,
      clientId,
      advocateId,

      status:
        body.status !== undefined
          ? normalizeString(body.status) ||
            existingCase.status
          : existingCase.status,

      caseStage:
        body.caseStage !== undefined
          ? normalizeString(body.caseStage) ||
            existingCase.caseStage
          : existingCase.caseStage,

      priority:
        body.priority !== undefined
          ? normalizeOptionalString(body.priority)
          : undefined,

      description:
        body.description !== undefined
          ? normalizeOptionalString(body.description)
          : undefined,

      counselPhone:
        body.counselPhone !== undefined
          ? normalizeOptionalString(body.counselPhone)
          : undefined,

      opposingCounsel:
        body.opposingCounsel !== undefined
          ? normalizeOptionalString(
              body.opposingCounsel
            )
          : undefined,

      registrationNumber:
        body.registrationNumber !== undefined
          ? normalizeOptionalString(
              body.registrationNumber
            )
          : undefined,

      opposingParty:
        body.opposingParty !== undefined
          ? normalizeOptionalString(
              body.opposingParty
            )
          : undefined,

      bench:
        body.bench !== undefined
          ? normalizeOptionalString(body.bench)
          : undefined,

      presidingJudge:
        body.presidingJudge !== undefined
          ? normalizeOptionalString(
              body.presidingJudge
            )
          : undefined,

      courtRoom:
        body.courtRoom !== undefined
          ? normalizeOptionalString(body.courtRoom)
          : undefined,

      firNumber:
        body.firNumber !== undefined
          ? normalizeOptionalString(body.firNumber)
          : undefined,

      policeStation:
        body.policeStation !== undefined
          ? normalizeOptionalString(
              body.policeStation
            )
          : undefined,

      sectionsActs:
        body.sectionsActs !== undefined
          ? normalizeOptionalString(
              body.sectionsActs
            )
          : undefined,

      tags:
        body.tags !== undefined
          ? normalizeOptionalString(body.tags)
          : undefined,
    };

    /* --------------------------------------------------------
       Dates
    -------------------------------------------------------- */

    if (filingDate !== undefined) {
      updateData.filingDate = filingDate;
    }

    if (registrationDate !== undefined) {
      updateData.registrationDate = registrationDate;
    }

    if (firDate !== undefined) {
      updateData.firDate = firDate;
    }

    /* --------------------------------------------------------
       CNR update
    -------------------------------------------------------- */

    if (cnrNumber !== undefined) {
      updateData.cnrNumber = cnrNumber;
    }

    /* --------------------------------------------------------
       eCourts status
    -------------------------------------------------------- */

    if (body.eCourtsStatus !== undefined) {
      updateData.eCourtsStatus =
        normalizeOptionalString(
          body.eCourtsStatus
        );
    }

    if (body.eCourtsLastSyncedAt !== undefined) {
      updateData.eCourtsLastSyncedAt =
        normalizeDate(
          body.eCourtsLastSyncedAt
        );
    }

    /* --------------------------------------------------------
       Update case
    -------------------------------------------------------- */

    const updatedCase = await prisma.case.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        client: true,
        advocate: true,

        hearings: {
          orderBy: {
            date: "desc",
          },
        },

        documents: true,

        timelineEvents: {
          orderBy: {
            createdAt: "desc",
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

        relatedFrom: true,
        relatedTo: true,

        invoices: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    /* --------------------------------------------------------
       Timeline
    -------------------------------------------------------- */

    await prisma.caseTimelineEvent.create({
      data: {
        caseId: id,
        eventType: "CASE_UPDATED",
        title: "Case Updated",
        eventDate: new Date(),
      },
    });

    return NextResponse.json(
      updatedCase,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PUT /api/cases/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update case.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================
   DELETE CASE
============================================================ */

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const userContext = await getAuthContext();

    if (!userContext) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Case ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Only ADMIN and STAFF may delete cases.
     */
    if (!canDeleteCase(userContext.role)) {
      return NextResponse.json(
        {
          error: "You do not have permission to delete cases.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Verify the user can access this particular case.
     */
    if (!(await canAccessCase(id, userContext))) {
      return NextResponse.json(
        {
          error: "Case not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    const existingCase =
      await prisma.case.findUnique({
        where: {
          id,
        },
      });

    if (!existingCase) {
      return NextResponse.json(
        {
          error: "Case not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.case.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Case deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/cases/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete case.",
      },
      {
        status: 500,
      }
    );
  }
}