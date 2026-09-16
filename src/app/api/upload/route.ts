import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthContext,
  canAccessCase,
  canAccessClient,
} from "@/lib/permissions";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    /*
     * --------------------------------------------------------
     * AUTH
     * --------------------------------------------------------
     */

    const context =
      await getAuthContext();

    if (!context) {
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
     * --------------------------------------------------------
     * FORM DATA
     * --------------------------------------------------------
     */

    const formData =
      await req.formData();

    const file =
      formData.get(
        "file"
      ) as File | null;

    const title =
      String(
        formData.get(
          "title"
        ) || ""
      ).trim();

    const category =
      String(
        formData.get(
          "category"
        ) || "General"
      ).trim();

    const subcategory =
      String(
        formData.get(
          "subcategory"
        ) || ""
      ).trim();

    const description =
      String(
        formData.get(
          "description"
        ) || ""
      ).trim();

    /*
     * CRITICAL:
     *
     * This is the case selected by the user.
     */
    const caseId =
      String(
        formData.get(
          "caseId"
        ) || ""
      ).trim();

    const requestedClientId =
      String(
        formData.get(
          "clientId"
        ) || ""
      ).trim();

    const documentDateValue =
      String(
        formData.get(
          "documentDate"
        ) || ""
      ).trim();

    const isImportantValue =
      String(
        formData.get(
          "isImportant"
        ) || "false"
      ).trim();

    /*
     * --------------------------------------------------------
     * FILE VALIDATION
     * --------------------------------------------------------
     */

    if (!file) {
      return NextResponse.json(
        {
          error:
            "No file provided.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          error:
            "The selected file is empty.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------------------------------
     * CASE IS REQUIRED FOR EVIDENCE
     * --------------------------------------------------------
     */

    if (
      category.toLowerCase() ===
        "evidence" &&
      !caseId
    ) {
      return NextResponse.json(
        {
          error:
            "Evidence documents must be associated with a case.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------------------------------
     * CASE VALIDATION
     * --------------------------------------------------------
     */

    let existingCase:
      | {
          id: string;
          clientId: string;
          caseNumber: string;
          title: string;
          court: string;
        }
      | null = null;

    if (caseId) {
      const allowed =
        await canAccessCase(
          caseId,
          context
        );

      if (!allowed) {
        return NextResponse.json(
          {
            error:
              "Case not found or you do not have permission to access this case.",
          },
          {
            status: 403,
          }
        );
      }

      existingCase =
        await prisma.case.findUnique({
          where: {
            id: caseId,
          },
          select: {
            id: true,
            clientId: true,
            caseNumber: true,
            title: true,
            court: true,
          },
        });

      if (!existingCase) {
        return NextResponse.json(
          {
            error:
              "Case not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    /*
     * --------------------------------------------------------
     * CLIENT ASSOCIATION
     * --------------------------------------------------------
     *
     * If a case is selected, the CASE's client is
     * authoritative.
     */

    let finalClientId:
      | string
      | null = null;

    if (existingCase) {
      finalClientId =
        existingCase.clientId;

      /*
       * Prevent browser from mapping
       * selected case to another client.
       */
      if (
        requestedClientId &&
        requestedClientId !==
          existingCase.clientId
      ) {
        return NextResponse.json(
          {
            error:
              "The selected client does not belong to the selected case.",
          },
          {
            status: 400,
          }
        );
      }
    } else if (
      requestedClientId
    ) {
      const allowed =
        await canAccessClient(
          requestedClientId,
          context
        );

      if (!allowed) {
        return NextResponse.json(
          {
            error:
              "Client not found or access denied.",
          },
          {
            status: 403,
          }
        );
      }

      const existingClient =
        await prisma.client.findUnique({
          where: {
            id: requestedClientId,
          },
          select: {
            id: true,
          },
        });

      if (!existingClient) {
        return NextResponse.json(
          {
            error:
              "Client not found.",
          },
          {
            status: 404,
          }
        );
      }

      finalClientId =
        existingClient.id;
    }

    /*
     * --------------------------------------------------------
     * DATE
     * --------------------------------------------------------
     */

    let documentDate:
      | Date
      | null = null;

    if (documentDateValue) {
      const parsedDate =
        new Date(
          documentDateValue
        );

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid document date.",
          },
          {
            status: 400,
          }
        );
      }

      documentDate =
        parsedDate;
    }

    /*
     * --------------------------------------------------------
     * IMPORTANT FLAG
     * --------------------------------------------------------
     */

    const isImportant =
      isImportantValue ===
        "true" ||
      isImportantValue ===
        "1" ||
      isImportantValue ===
        "on";

    /*
     * --------------------------------------------------------
     * FILE BUFFER
     * --------------------------------------------------------
     */

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    /*
     * --------------------------------------------------------
     * UPLOAD DIRECTORY
     * --------------------------------------------------------
     */

    const uploadDir =
      path.join(
        process.cwd(),
        "public",
        "uploads"
      );

    await mkdir(
      uploadDir,
      {
        recursive: true,
      }
    );

    /*
     * --------------------------------------------------------
     * SAFE FILE NAME
     * --------------------------------------------------------
     */

    const safeOriginalName =
      file.name
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        )
        .replace(
          /_+/g,
          "_"
        );

    const fileName =
      `${Date.now()}-${safeOriginalName}`;

    const filePath =
      path.join(
        uploadDir,
        fileName
      );

    await writeFile(
      filePath,
      buffer
    );

    const fileUrl =
      `/uploads/${fileName}`;

    /*
     * --------------------------------------------------------
     * CREATE DOCUMENT
     * --------------------------------------------------------
     *
     * The selected case is saved here.
     */

    const document =
      await prisma.document.create({
        data: {
          name:
            title ||
            file.name,

          category:
            category ||
            "General",

          subcategory:
            subcategory ||
            null,

          description:
            description ||
            null,

          documentDate,

          isImportant,

          fileUrl,

          fileSize:
            file.size,

          mimeType:
            file.type ||
            null,

          /*
           * CASE MAPPING
           */
          caseId:
            existingCase?.id ||
            null,

          /*
           * REAL CASE CLIENT
           */
          clientId:
            finalClientId,
        },
      });

    return NextResponse.json(
      {
        success: true,

        document,

        case:
          existingCase
            ? {
                id:
                  existingCase.id,

                caseNumber:
                  existingCase.caseNumber,

                title:
                  existingCase.title,

                court:
                  existingCase.court,

                clientId:
                  existingCase.clientId,
              }
            : null,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "UPLOAD_DOCUMENT_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "File upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}