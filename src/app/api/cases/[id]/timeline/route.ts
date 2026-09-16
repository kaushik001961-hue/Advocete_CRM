import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const EVENT_TYPES = [
  "CASE_CREATED",
  "CASE_UPDATED",
  "FILING",
  "HEARING",
  "DOCUMENT_ADDED",
  "IMPORTANT_DATE",
  "NOTE_ADDED",
  "STATUS_CHANGED",
  "ORDER_PASSED",
  "ARGUMENT",
  "JUDGMENT",
  "CASE_CLOSED",
  "OTHER",
] as const;

function isValidEventType(
  value: string
): boolean {
  return EVENT_TYPES.includes(
    value as (typeof EVENT_TYPES)[number]
  );
}

export async function GET(
  _request: Request,
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

    const events =
      await prisma.caseTimelineEvent.findMany({
        where: {
          caseId: id,
        },
        orderBy: {
          eventDate: "desc",
        },
      });

    return NextResponse.json({
      events,
    });
  } catch (error) {
    console.error(
      "GET /api/cases/[id]/timeline error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load case timeline.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const eventType =
      typeof body.eventType === "string"
        ? body.eventType.trim().toUpperCase()
        : "OTHER";

    const eventDate =
      typeof body.eventDate === "string"
        ? body.eventDate
        : "";

    if (!title) {
      return NextResponse.json(
        {
          error: "Event title is required.",
        },
        { status: 400 }
      );
    }

    if (!eventDate) {
      return NextResponse.json(
        {
          error: "Event date is required.",
        },
        { status: 400 }
      );
    }

    if (!isValidEventType(eventType)) {
      return NextResponse.json(
        {
          error: "Invalid timeline event type.",
        },
        { status: 400 }
      );
    }

    const parsedDate = new Date(eventDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid event date.",
        },
        { status: 400 }
      );
    }

    const caseRecord = await prisma.case.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!caseRecord) {
      return NextResponse.json(
        {
          error: "Case not found.",
        },
        { status: 404 }
      );
    }

    const event =
      await prisma.caseTimelineEvent.create({
        data: {
          caseId: id,
          eventType,
          title,
          description: description || null,
          eventDate: parsedDate,
        },
      });

    return NextResponse.json(
      {
        message: "Timeline event created successfully.",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/cases/[id]/timeline error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create timeline event.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const url = new URL(request.url);
    const eventId = url.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        {
          error: "eventId is required.",
        },
        { status: 400 }
      );
    }

    const event =
      await prisma.caseTimelineEvent.findFirst({
        where: {
          id: eventId,
          caseId: id,
        },
      });

    if (!event) {
      return NextResponse.json(
        {
          error: "Timeline event not found.",
        },
        { status: 404 }
      );
    }

    await prisma.caseTimelineEvent.delete({
      where: {
        id: eventId,
      },
    });

    return NextResponse.json({
      message:
        "Timeline event deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/cases/[id]/timeline error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to delete timeline event.",
      },
      { status: 500 }
    );
  }
}