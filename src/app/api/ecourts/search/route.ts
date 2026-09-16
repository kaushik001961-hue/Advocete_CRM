import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getDemoCase(cnrNumber: string) {
  return {
    cnrNumber,

    caseNumber: `CS/${cnrNumber.slice(0, 4)}/2015`,

    caseType: "Civil Suit",

    title: "ABC Industries Pvt. Ltd. vs. XYZ Enterprises",

    court: "District Court",

    caseStage: "FILED",

    status: "ACTIVE",

    priority: "NORMAL",

    bench: "Civil Bench",

    presidingJudge: "Hon'ble District Judge",

    courtRoom: "Court Room No. 3",

    opposingParty: "XYZ Enterprises",

    opposingCounsel: "Mr. Opposing Advocate",

    counselPhone: "",

    filingDate: "2015-06-15",

    registrationNumber: `REG/${cnrNumber.slice(-6)}`,

    registrationDate: "2015-07-02",

    firNumber: "",

    firDate: "",

    policeStation: "",

    sectionsActs: "Indian Contract Act, 1872",

    description:
      "Demo case imported through the ACMS eCourts integration module. This data is for testing the case preview and import workflow.",

    tags: "eCourts, Demo, Civil",

    eCourtsStatus: "FOUND",

    eCourtsLastSyncedAt: new Date().toISOString(),

    clientId: "",

    advocateId: "",
  };
}

async function searchCase(cnrNumber: string) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const normalizedCnr = cnrNumber.trim().toUpperCase();

  if (!/^[A-Z0-9]{16}$/.test(normalizedCnr)) {
    return NextResponse.json(
      {
        error:
          "Invalid CNR number. CNR must contain exactly 16 alphanumeric characters.",
      },
      { status: 400 }
    );
  }

  /*
   * ---------------------------------------------------------
   * EXISTING CNR DETECTION
   * ---------------------------------------------------------
   *
   * Before returning demo/live provider data, check whether
   * this CNR has already been imported into ACMS.
   *
   * This prevents duplicate case imports.
   */

  const existingCase = await prisma.case.findUnique({
    where: {
      cnrNumber: normalizedCnr,
    },
    include: {
      client: true,
      advocate: true,
    },
  });

  if (existingCase) {
    return NextResponse.json({
      success: true,

      configured: false,

      demoMode: true,

      existingCaseFound: true,

      message:
        "This CNR number is already imported into ACMS.",

      cnrNumber: normalizedCnr,

      existingCase: {
        id: existingCase.id,

        caseNumber: existingCase.caseNumber,

        title: existingCase.title,

        court: existingCase.court,

        status: existingCase.status,

        caseType: existingCase.caseType,

        caseStage: existingCase.caseStage,

        clientId: existingCase.clientId,

        clientName: existingCase.client?.name || "",

        advocateId: existingCase.advocateId,

        advocateName: existingCase.advocate?.name || "",

        eCourtsStatus: existingCase.eCourtsStatus,

        eCourtsLastSyncedAt:
          existingCase.eCourtsLastSyncedAt,

        createdAt: existingCase.createdAt,

        updatedAt: existingCase.updatedAt,
      },

      case: null,
    });
  }

  /*
   * ---------------------------------------------------------
   * DEMO MODE
   * ---------------------------------------------------------
   *
   * The public eCourts website is CAPTCHA protected.
   * Until an authorized API/provider is connected,
   * we return demo case data to test the complete
   * ACMS import workflow.
   */

  return NextResponse.json({
    success: true,

    configured: false,

    demoMode: true,

    existingCaseFound: false,

    message:
      "Demo eCourts case returned. Connect an authorized eCourts API/provider for live case data.",

    cnrNumber: normalizedCnr,

    existingCase: null,

    case: getDemoCase(normalizedCnr),
  });
}

/**
 * POST /api/ecourts/search
 *
 * Used by the current ACMS eCourts Integration page.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const cnrNumber =
      body?.cnrNumber ||
      body?.cnr ||
      "";

    return await searchCase(String(cnrNumber));
  } catch (error) {
    console.error(
      "POST /api/ecourts/search error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid request. Please provide a CNR number.",
      },
      { status: 400 }
    );
  }
}

/**
 * GET /api/ecourts/search?cnrNumber=XXXXXXXXXXXXXXX
 *
 * Also supported for testing directly from browser/API tools.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cnrNumber =
      searchParams.get("cnrNumber") ||
      searchParams.get("cnr") ||
      "";

    return await searchCase(cnrNumber);
  } catch (error) {
    console.error(
      "GET /api/ecourts/search error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to search eCourts.",
      },
      { status: 500 }
    );
  }
}