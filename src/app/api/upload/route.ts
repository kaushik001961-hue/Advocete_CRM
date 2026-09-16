import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    const title = String(formData.get("title") || "").trim();
    const category = String(formData.get("category") || "General").trim();
    const subcategory = String(
      formData.get("subcategory") || ""
    ).trim();
    const description = String(
      formData.get("description") || ""
    ).trim();

    const caseId = String(formData.get("caseId") || "").trim();
    const clientId = String(formData.get("clientId") || "").trim();

    const documentDateValue = String(
      formData.get("documentDate") || ""
    ).trim();

    const isImportantValue = String(
      formData.get("isImportant") || "false"
    ).trim();

    if (!file) {
      return NextResponse.json(
        {
          error: "No file provided",
        },
        {
          status: 400,
        }
      );
    }

    // Basic file validation
    if (file.size <= 0) {
      return NextResponse.json(
        {
          error: "The selected file is empty.",
        },
        {
          status: 400,
        }
      );
    }

    // Optional: validate case
    if (caseId) {
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
    }

    // Optional: validate client
    if (clientId) {
      const existingClient = await prisma.client.findUnique({
        where: {
          id: clientId,
        },
        select: {
          id: true,
        },
      });

      if (!existingClient) {
        return NextResponse.json(
          {
            error: "Client not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    // Parse document date
    let documentDate: Date | null = null;

    if (documentDateValue) {
      const parsedDate = new Date(documentDateValue);

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

      documentDate = parsedDate;
    }

    // Parse important flag
    const isImportant =
      isImportantValue === "true" ||
      isImportantValue === "1" ||
      isImportantValue === "on";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadDir = path.join(
      process.cwd(),
      "public/uploads"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    // Clean filename
    const safeOriginalName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");

    const fileName = `${Date.now()}-${safeOriginalName}`;

    const filePath = path.join(
      uploadDir,
      fileName
    );

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    // Determine client association
    let finalClientId: string | null = clientId || null;

    if (!finalClientId && caseId) {
      const existingCase = await prisma.case.findUnique({
        where: {
          id: caseId,
        },
        select: {
          clientId: true,
        },
      });

      finalClientId = existingCase?.clientId || null;
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        name: title || file.name,
        category: category || "General",
        subcategory: subcategory || null,
        description: description || null,
        documentDate,
        isImportant,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type || null,
        caseId: caseId || null,
        clientId: finalClientId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        document,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Upload Error:", error);

    return NextResponse.json(
      {
        error: "File upload failed",
      },
      {
        status: 500,
      }
    );
  }
}