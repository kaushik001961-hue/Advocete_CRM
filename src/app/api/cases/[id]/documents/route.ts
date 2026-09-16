import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthContext,
  canAccessCase,
} from "@/lib/permissions";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: Request,
  context: RouteContext
) {
  try {
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

    const { id: caseId } =
      await context.params;

    if (!caseId) {
      return NextResponse.json(
        {
          error: "Case ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * SECURITY:
     *
     * ADMIN:
     *   Can access every case.
     *
     * ADVOCATE:
     *   Only assigned cases.
     *
     * STAFF:
     *   Only cases permitted by permissions.ts.
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

    const url =
      new URL(req.url);

    const search =
      url.searchParams
        .get("search")
        ?.trim() || "";

    const category =
      url.searchParams
        .get("category")
        ?.trim() || "";

    const important =
      url.searchParams.get(
        "important"
      ) === "true";

    /*
     * CRITICAL:
     *
     * Documents are ALWAYS filtered
     * by the case ID from the URL.
     *
     * This prevents documents belonging to
     * Case A appearing under Case B.
     */
    const where: {
      caseId: string;
      isImportant?: boolean;
      category?: string;
      OR?: Array<{
        name?: {
          contains: string;
          mode: "insensitive";
        };
        description?: {
          contains: string;
          mode: "insensitive";
        };
        subcategory?: {
          contains: string;
          mode: "insensitive";
        };
      }>;
    } = {
      caseId,
    };

    if (category) {
      where.category =
        category;
    }

    if (important) {
      where.isImportant =
        true;
    }

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
          subcategory: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const documents =
      await prisma.document.findMany({
        where,
        orderBy: [
          {
            isImportant:
              "desc",
          },
          {
            uploadedAt:
              "desc",
          },
        ],
      });

    return NextResponse.json(
      documents,
      {
        status: 200,
        headers: {
          "Cache-Control":
            "private, no-cache, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "CASE_DOCUMENTS_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load case documents.",
      },
      {
        status: 500,
      }
    );
  }
}