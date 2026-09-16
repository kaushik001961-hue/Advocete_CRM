import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

    const importantDates = await prisma.caseImportantDate.findMany({
      where: { caseId: id },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      importantDates,
    });
  } catch (error) {
    console.error("Important dates GET error:", error);

    return NextResponse.json(
      { error: "Failed to load important dates." },
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
      select: { id: true },
    });

    if (!caseRecord) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const date =
      typeof body.date === "string" ? body.date : "";

    if (!title) {
      return NextResponse.json(
        { error: "Date title is required." },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Date is required." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date." },
        { status: 400 }
      );
    }

    const importantDate = await prisma.caseImportantDate.create({
      data: {
        caseId: id,
        title,
        date: parsedDate,
        description: description || null,
      },
    });

    await prisma.caseTimelineEvent.create({
      data: {
        caseId: id,
        eventType: "IMPORTANT_DATE",
        title: `Important date added: ${title}`,
        description: description || null,
        eventDate: parsedDate,
      },
    });

    return NextResponse.json(
      {
        message: "Important date created successfully.",
        importantDate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Important dates POST error:", error);

    return NextResponse.json(
      { error: "Failed to create important date." },
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

    const eventId = request.nextUrl.searchParams.get("dateId");

    if (!eventId) {
      return NextResponse.json(
        { error: "dateId is required." },
        { status: 400 }
      );
    }

    const importantDate =
      await prisma.caseImportantDate.findFirst({
        where: {
          id: eventId,
          caseId: id,
        },
      });

    if (!importantDate) {
      return NextResponse.json(
        { error: "Important date not found." },
        { status: 404 }
      );
    }

    await prisma.caseImportantDate.delete({
      where: {
        id: eventId,
      },
    });

    return NextResponse.json({
      message: "Important date deleted successfully.",
    });
  } catch (error) {
    console.error("Important dates DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete important date." },
      { status: 500 }
    );
  }
}