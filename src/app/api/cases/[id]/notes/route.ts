import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, canAccessCase } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function caseExists(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const userContext = await getAuthContext();
    if (!userContext) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!(await canAccessCase(id, userContext))) {
      return NextResponse.json({ error: "Case not found or access denied." }, { status: 404 });
    }

    const caseRecord = await caseExists(id);

    if (!caseRecord) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    const notes = await prisma.caseNote.findMany({
      where: {
        caseId: id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      notes,
    });
  } catch (error) {
    console.error("Case notes GET error:", error);

    return NextResponse.json(
      { error: "Failed to load case notes." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const userContext = await getAuthContext();
    if (!userContext) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!(await canAccessCase(id, userContext))) {
      return NextResponse.json({ error: "Case not found or access denied." }, { status: 404 });
    }

    const caseRecord = await caseExists(id);

    if (!caseRecord) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    if (!content) {
      return NextResponse.json(
        { error: "Note content is required." },
        { status: 400 }
      );
    }

    const note = await prisma.caseNote.create({
      data: {
        caseId: id,
        title: title || null,
        content,
      },
    });

    await prisma.caseTimelineEvent.create({
      data: {
        caseId: id,
        eventType: "NOTE_ADDED",
        title: title
          ? `Note added: ${title}`
          : "Case note added",
        description: content,
        eventDate: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Note created successfully.",
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Case notes POST error:", error);

    return NextResponse.json(
      { error: "Failed to create case note." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const userContext = await getAuthContext();
    if (!userContext) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!(await canAccessCase(id, userContext))) {
      return NextResponse.json({ error: "Case not found or access denied." }, { status: 404 });
    }

    const caseRecord = await caseExists(id);

    if (!caseRecord) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const noteId =
      typeof body.noteId === "string"
        ? body.noteId.trim()
        : "";

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    if (!noteId) {
      return NextResponse.json(
        { error: "noteId is required." },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Note content is required." },
        { status: 400 }
      );
    }

    const existingNote = await prisma.caseNote.findFirst({
      where: {
        id: noteId,
        caseId: id,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found." },
        { status: 404 }
      );
    }

    const note = await prisma.caseNote.update({
      where: {
        id: noteId,
      },
      data: {
        title: title || null,
        content,
      },
    });

    await prisma.caseTimelineEvent.create({
      data: {
        caseId: id,
        eventType: "NOTE_ADDED",
        title: title
          ? `Note updated: ${title}`
          : "Case note updated",
        description: content,
        eventDate: new Date(),
      },
    });

    return NextResponse.json({
      message: "Note updated successfully.",
      note,
    });
  } catch (error) {
    console.error("Case notes PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update case note." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const userContext = await getAuthContext();
    if (!userContext) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!(await canAccessCase(id, userContext))) {
      return NextResponse.json({ error: "Case not found or access denied." }, { status: 404 });
    }

    const noteId =
      request.nextUrl.searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json(
        { error: "noteId is required." },
        { status: 400 }
      );
    }

    const existingNote = await prisma.caseNote.findFirst({
      where: {
        id: noteId,
        caseId: id,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found." },
        { status: 404 }
      );
    }

    await prisma.caseNote.delete({
      where: {
        id: noteId,
      },
    });

    return NextResponse.json({
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("Case notes DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete case note." },
      { status: 500 }
    );
  }
}