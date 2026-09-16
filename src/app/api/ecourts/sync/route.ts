import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, canAccessCase } from "@/lib/permissions";

export async function POST(request: Request) {
  try {
    const context = await getAuthContext();

    if (!context) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const cnrNumber = String(body?.cnrNumber || "")
      .trim()
      .toUpperCase();

    if (!/^[A-Z0-9]{16}$/.test(cnrNumber)) {
      return NextResponse.json(
        {
          error:
            "Invalid CNR number. CNR must contain exactly 16 letters/numbers.",
        },
        { status: 400 }
      );
    }

    const existingCase = await prisma.case.findUnique({
      where: {
        cnrNumber,
      },
    });

    if (!existingCase) {
      return NextResponse.json(
        {
          error: "No ACMS case found with this CNR number.",
        },
        { status: 404 }
      );
    }

    if (!(await canAccessCase(existingCase.id, context))) {
      return NextResponse.json({ error: "Case not found or access denied." }, { status: 404 });
    }

    /*
     * --------------------------------------------------------
     * DEMO / PROVIDER-READY SYNC
     * --------------------------------------------------------
     *
     * Live eCourts provider/API can be connected here later.
     * We do not bypass eCourts CAPTCHA.
     */

    const syncedAt = new Date();

    const updatedCase = await prisma.case.update({
      where: {
        id: existingCase.id,
      },
      data: {
        eCourtsStatus: "SYNCED",
        eCourtsLastSyncedAt: syncedAt,
      },
    });

   await prisma.caseTimelineEvent.create({
  data: {
    caseId: existingCase.id,
    eventType: "ECOURTS_SYNCED",
    title: "eCourts Case Synced",
    eventDate: new Date(),
  },
});

    return NextResponse.json({
      success: true,
      message: "eCourts case synchronized successfully.",
      case: {
        id: updatedCase.id,
        cnrNumber: updatedCase.cnrNumber,
        eCourtsStatus: updatedCase.eCourtsStatus,
        eCourtsLastSyncedAt:
          updatedCase.eCourtsLastSyncedAt,
      },
    });
  } catch (error) {
    console.error("POST /api/ecourts/sync error:", error);

    return NextResponse.json(
      {
        error: "Failed to synchronize eCourts case.",
      },
      { status: 500 }
    );
  }
}