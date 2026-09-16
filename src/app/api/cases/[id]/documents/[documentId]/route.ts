import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthContext,
  canAccessCase,
} from "@/lib/permissions";
import { unlink } from "fs/promises";
import path from "path";

type RouteContext = {
  params: Promise<{
    id: string;
    documentId: string;
  }>;
};

export async function DELETE(
  req: Request,
  context: RouteContext
) {
  try {
    void req;

    const authContext =
      await getAuthContext();

    if (!authContext) {
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
     * ONLY ADMIN CAN DELETE DOCUMENTS.
     *
     * Do not allow STAFF or ADVOCATE.
     */
    if (
      authContext.role !==
      "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Delete permission denied. Only an administrator can delete records.",
        },
        {
          status: 403,
        }
      );
    }

    const {
      id: caseId,
      documentId,
    } = await context.params;

    if (!caseId) {
      return NextResponse.json(
        {
          error:
            "Case ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!documentId) {
      return NextResponse.json(
        {
          error:
            "Document ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Verify the case exists / is accessible.
     *
     * ADMIN will normally pass this.
     */
    const allowed =
      await canAccessCase(
        caseId,
        authContext
      );

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Case not found or access denied.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * CRITICAL:
     *
     * The document MUST belong to the
     * case in the URL.
     *
     * This prevents deleting a document
     * through another case URL.
     */
    const document =
      await prisma.document.findFirst({
        where: {
          id: documentId,
          caseId,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          error:
            "Document not found for this case.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Delete database record.
     */
    await prisma.document.delete({
      where: {
        id: document.id,
      },
    });

    /*
     * Delete physical file if it is
     * stored under /public/uploads.
     *
     * Failure to remove the physical file
     * should not cause the database deletion
     * to be reported as failed.
     */
    if (
      document.fileUrl &&
      document.fileUrl.startsWith(
        "/uploads/"
      )
    ) {
      try {
        const fileName =
          document.fileUrl.replace(
            /^\/uploads\//,
            ""
          );

        const filePath =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            fileName
          );

        await unlink(
          filePath
        );
      } catch (fileError) {
        console.warn(
          "DOCUMENT_FILE_DELETE_WARNING:",
          fileError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Document deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "CASE_DOCUMENT_DELETE_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete document.",
      },
      {
        status: 500,
      }
    );
  }
}