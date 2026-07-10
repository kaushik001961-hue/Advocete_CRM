
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const name =
      (formData.get("name") as string) || file.name;

    const category =
      (formData.get("category") as string) || "";

    const clientId =
      (formData.get("clientId") as string) || null;

    const caseId =
      (formData.get("caseId") as string) || null;

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const fileName =
      `${Date.now()}-${file.name.replace(/\s/g, "-")}`;

    const filePath = path.join(
      uploadDir,
      fileName
    );

    await fs.writeFile(filePath, buffer);

    const document = await prisma.document.create({
      data: {
        name,
        category,
        clientId,
        caseId,
        fileUrl: `/uploads/${fileName}`,
        mimeType: file.type,
        fileSize: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      {
        error: "Upload Failed",
      },
      {
        status: 500,
      }
    );
  }
}
