
"use server";

import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function uploadDocument(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    throw new Error("No file uploaded");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName =
    `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads"
  );

  await fs.mkdir(uploadDir, { recursive: true });

  await fs.writeFile(
    path.join(uploadDir, fileName),
    buffer
  );

  await prisma.document.create({
    data: {
      name: formData.get("name") as string,
      category: formData.get("category") as string,

      clientId:
        (formData.get("clientId") as string) || null,

      caseId:
        (formData.get("caseId") as string) || null,

      fileUrl: `/uploads/${fileName}`,

      mimeType: file.type,

      fileSize: file.size,
    },
  });

  revalidatePath("/admin/documents");
}
