import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const RELATION_TYPES = [
  "CONNECTED_CASE",
  "APPEAL",
  "REVISION",
  "RELATED",
  "CROSS_CASE",
  "COUNTER_CASE",
  "TRANSFERRED_CASE",
  "SAME_PARTIES",
  "SAME_SUBJECT",
  "OTHER",
];

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const caseRecord = await prisma.case.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!caseRecord) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    const [fromRelations, toRelations] =
      await Promise.all([
        prisma.caseRelation.findMany({
          where: {
            caseId: id,
          },
          include: {
            relatedCase: {
              select: {
                id: true,
                caseNumber: true,
                caseType: true,
                title: true,
                court: true,
                status: true,
                caseStage: true,
                client: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.caseRelation.findMany({
          where: {
            relatedCaseId: id,
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
                caseStage: true,
                client: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);

    const relatedCases = [
      ...fromRelations.map((relation) => ({
        id: relation.id,
        relationType: relation.relationType,
        createdAt: relation.createdAt,
        case: relation.relatedCase,
      })),

      ...toRelations.map((relation) => ({
        id: relation.id,
        relationType: relation.relationType,
        createdAt: relation.createdAt,
        case: relation.case,
      })),
    ];

    return NextResponse.json({
      relatedCases,
    });
  } catch (error) {
    console.error("Related cases GET error:", error);

    return NextResponse.json(
      { error: "Failed to load related cases." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const caseRecord = await prisma.case.findUnique({
      where: { id },
      select: {
        id: true,
        caseNumber: true,
      },
    });

    if (!caseRecord) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const relatedCaseId =
      typeof body.relatedCaseId === "string"
        ? body.relatedCaseId.trim()
        : "";

    const relationType =
      typeof body.relationType === "string"
        ? body.relationType.trim().toUpperCase()
        : "RELATED";

    if (!relatedCaseId) {
      return NextResponse.json(
        { error: "Related case is required." },
        { status: 400 }
      );
    }

    if (relatedCaseId === id) {
      return NextResponse.json(
        {
          error:
            "A case cannot be related to itself.",
        },
        { status: 400 }
      );
    }

    if (!RELATION_TYPES.includes(relationType)) {
      return NextResponse.json(
        { error: "Invalid relation type." },
        { status: 400 }
      );
    }

    const relatedCase = await prisma.case.findUnique({
      where: {
        id: relatedCaseId,
      },
      select: {
        id: true,
        caseNumber: true,
        caseType: true,
        title: true,
        court: true,
        status: true,
        caseStage: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!relatedCase) {
      return NextResponse.json(
        { error: "Related case not found." },
        { status: 404 }
      );
    }

    const existingRelation =
      await prisma.caseRelation.findFirst({
        where: {
          OR: [
            {
              caseId: id,
              relatedCaseId,
            },
            {
              caseId: relatedCaseId,
              relatedCaseId: id,
            },
          ],
        },
      });

    if (existingRelation) {
      return NextResponse.json(
        {
          error:
            "These cases are already related.",
        },
        { status: 409 }
      );
    }

    const relation = await prisma.caseRelation.create({
      data: {
        caseId: id,
        relatedCaseId,
        relationType,
      },
      include: {
        relatedCase: {
          select: {
            id: true,
            caseNumber: true,
            caseType: true,
            title: true,
            court: true,
            status: true,
            caseStage: true,
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

    await prisma.caseTimelineEvent.create({
      data: {
        caseId: id,
        eventType: "OTHER",
        title: `Related case linked: ${
          relatedCase.caseNumber ||
          relatedCase.title
        }`,
        description: `Relation type: ${relationType}`,
        eventDate: new Date(),
      },
    });

    return NextResponse.json(
      {
        message:
          "Related case added successfully.",
        relatedCase: {
          id: relation.id,
          relationType: relation.relationType,
          createdAt: relation.createdAt,
          case: relation.relatedCase,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Related cases POST error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to add related case." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const relationId =
      request.nextUrl.searchParams.get(
        "relationId"
      );

    if (!relationId) {
      return NextResponse.json(
        { error: "relationId is required." },
        { status: 400 }
      );
    }

    const relation =
      await prisma.caseRelation.findFirst({
        where: {
          id: relationId,
          OR: [
            {
              caseId: id,
            },
            {
              relatedCaseId: id,
            },
          ],
        },
      });

    if (!relation) {
      return NextResponse.json(
        {
          error:
            "Related case relationship not found.",
        },
        { status: 404 }
      );
    }

    await prisma.caseRelation.delete({
      where: {
        id: relationId,
      },
    });

    return NextResponse.json({
      message:
        "Related case removed successfully.",
    });
  } catch (error) {
    console.error(
      "Related cases DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to remove related case.",
      },
      { status: 500 }
    );
  }
}