import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * DELETE /api/cases/[id]/documents/[documentId]
 */
export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      documentId: string;
    }>;
  }
) {
  try {
    const resolvedParams = await params;

    const caseId = resolvedParams.id;
    const documentId = resolvedParams.documentId;

    // Find document and make sure it belongs to this case
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        caseId,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          error: "Document not found for this case.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Document deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting case document:", error);

    return NextResponse.json(
      {
        error: "Failed to delete case document.",
      },
      {
        status: 500,
      }
    );
  }
}