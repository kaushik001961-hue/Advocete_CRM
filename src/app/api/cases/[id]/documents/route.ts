import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;

    const existingCase = await prisma.case.findUnique({
      where: {
        id: caseId,
      },
      select: {
        id: true,
      },
    });

    if (!existingCase) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const important = searchParams.get("important");

    const where: {
      caseId: string;
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
        category?: { contains: string; mode: "insensitive" };
        subcategory?: { contains: string; mode: "insensitive" };
      }>;
      category?: string;
      isImportant?: boolean;
    } = {
      caseId,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          subcategory: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (important === "true") {
      where.isImportant = true;
    }

    if (important === "false") {
      where.isImportant = false;
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: [
        {
          isImportant: "desc",
        },
        {
          uploadedAt: "desc",
        },
      ],
    });

    return NextResponse.json(documents, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching case documents:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch case documents.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;

    const body = await request.json();

    const {
      name,
      fileUrl,
      category,
      subcategory,
      description,
      documentDate,
      isImportant,
      fileSize,
      mimeType,
      clientId,
    } = body;

    if (!name || !fileUrl) {
      return NextResponse.json(
        {
          error: "Document name and file URL are required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingCase = await prisma.case.findUnique({
      where: {
        id: caseId,
      },
      select: {
        id: true,
        clientId: true,
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

    let finalClientId: string | null =
      clientId || existingCase.clientId || null;

    if (clientId) {
      const client = await prisma.client.findUnique({
        where: {
          id: clientId,
        },
        select: {
          id: true,
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

      finalClientId = client.id;
    }

    let parsedDocumentDate: Date | null = null;

    if (documentDate) {
      const parsedDate = new Date(documentDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          {
            error: "Invalid document date.",
          },
          {
            status: 400,
          }
        );
      }

      parsedDocumentDate = parsedDate;
    }

    const important =
      isImportant === true ||
      isImportant === "true" ||
      isImportant === 1 ||
      isImportant === "1";

    let parsedFileSize: number | null = null;

    if (
      fileSize !== undefined &&
      fileSize !== null &&
      fileSize !== ""
    ) {
      const size = Number(fileSize);

      if (!Number.isNaN(size)) {
        parsedFileSize = size;
      }
    }

    const document = await prisma.document.create({
      data: {
        name: String(name).trim(),
        fileUrl: String(fileUrl).trim(),
        caseId,
        clientId: finalClientId,
        category: category
          ? String(category).trim()
          : null,
        subcategory: subcategory
          ? String(subcategory).trim()
          : null,
        description: description
          ? String(description).trim()
          : null,
        documentDate: parsedDocumentDate,
        isImportant: important,
        fileSize: parsedFileSize,
        mimeType: mimeType
          ? String(mimeType).trim()
          : null,
      },
    });

    return NextResponse.json(document, {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating case document:", error);

    return NextResponse.json(
      {
        error: "Failed to create case document.",
      },
      {
        status: 500,
      }
    );
  }
}