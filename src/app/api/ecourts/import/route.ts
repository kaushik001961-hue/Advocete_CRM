import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function nullableString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const result = value.trim();

  return result || null;
}

function parseDate(value: unknown) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
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
     * Only Admin and Staff should import cases
     * through the Admin eCourts module.
     */
    if (
      session.user.role !== "ADMIN" &&
      session.user.role !== "STAFF"
    ) {
      return NextResponse.json(
        {
          error: "You do not have permission to import cases.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const cnrNumber = nullableString(body.cnrNumber);
    const caseNumber = nullableString(body.caseNumber);
    const caseType = nullableString(body.caseType);
    const title = nullableString(body.title);
    const court = nullableString(body.court);

    const clientId = nullableString(body.clientId);
    const advocateId = nullableString(body.advocateId);

    if (!cnrNumber) {
      return NextResponse.json(
        {
          error: "CNR number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^[A-Z0-9]{16}$/.test(cnrNumber)) {
      return NextResponse.json(
        {
          error:
            "CNR number must contain exactly 16 alphanumeric characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (!caseNumber || !caseType || !title || !court) {
      return NextResponse.json(
        {
          error:
            "Case number, case type, title, and court are required.",
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

    /*
     * Verify client
     */
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
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
     * Verify advocate
     */
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
          status: 404,
        }
      );
    }

    if (
      advocate.role !== "ADVOCATE" &&
      advocate.role !== "STAFF"
    ) {
      return NextResponse.json(
        {
          error:
            "Selected user cannot be assigned as the case advocate.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Check duplicate case number
     */
    const existingCaseNumber =
      await prisma.case.findUnique({
        where: {
          caseNumber,
        },
      });

    if (existingCaseNumber) {
      return NextResponse.json(
        {
          error:
            "A case with this case number already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Check duplicate CNR
     */
    const existingCnr =
      await prisma.case.findUnique({
        where: {
          cnrNumber,
        },
      });

    if (existingCnr) {
      return NextResponse.json(
        {
          error:
            "A case with this CNR number has already been imported.",
          caseId: existingCnr.id,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Create ACMS case
     */
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        caseType,

        caseStage:
          nullableString(body.caseStage) ||
          "FILED",

        title,
        court,

        status:
          nullableString(body.status) ||
          "ACTIVE",

        clientId,
        advocateId,

        /*
         * eCourts
         */
        cnrNumber,

        eCourtsStatus:
          nullableString(body.eCourtsStatus) ||
          "IMPORTED",

        eCourtsLastSyncedAt:
          new Date(),

        /*
         * Court
         */
        bench:
          nullableString(body.bench),

        presidingJudge:
          nullableString(body.presidingJudge),

        courtRoom:
          nullableString(body.courtRoom),

        /*
         * Parties
         */
        opposingParty:
          nullableString(body.opposingParty),

        opposingCounsel:
          nullableString(body.opposingCounsel),

        counselPhone:
          nullableString(body.counselPhone),

        /*
         * Registration
         */
        filingDate:
          parseDate(body.filingDate),

        registrationNumber:
          nullableString(body.registrationNumber),

        registrationDate:
          parseDate(body.registrationDate),

        /*
         * Criminal
         */
        firNumber:
          nullableString(body.firNumber),

        firDate:
          parseDate(body.firDate),

        policeStation:
          nullableString(body.policeStation),

        sectionsActs:
          nullableString(body.sectionsActs),

        /*
         * Case management
         */
        priority:
          nullableString(body.priority) ||
          "NORMAL",

        description:
          nullableString(body.description),

        tags:
          nullableString(body.tags),
      },
    });

    /*
     * Create timeline event
     */
    await prisma.caseTimelineEvent.create({
      data: {
        caseId: newCase.id,
        eventType: "ECOURTS_IMPORTED",
        title: "Case Imported from eCourts",
        description:
          `Case ${newCase.caseNumber} was imported into ACMS using CNR ${cnrNumber}.`,
        eventDate:
          newCase.filingDate ||
          newCase.createdAt,
      },
    });

    /*
     * Fetch final case
     */
    const finalCase =
      await prisma.case.findUnique({
        where: {
          id: newCase.id,
        },
        include: {
          client: true,
          hearings: true,
          timelineEvents: {
            orderBy: {
              eventDate: "desc",
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Case imported into ACMS successfully.",
        case: finalCase,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/ecourts/import error:",
      error
    );

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "A case with this case number or CNR already exists.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to import case into ACMS.",
      },
      {
        status: 500,
      }
    );
  }
}