
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDocument(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;

  const clientId =
    (formData.get("clientId") as string) || null;

  const caseId =
    (formData.get("caseId") as string) || null;

  const fileUrl =
    (formData.get("fileUrl") as string) || "";

  const mimeType =
    (formData.get("mimeType") as string) || null;

  const fileSize = Number(
    formData.get("fileSize") || 0
  );

  await prisma.document.create({
    data: {
      name,
      category,
      clientId,
      caseId,
      fileUrl,
      mimeType,
      fileSize,
    },
  });

  revalidatePath("/admin/documents");
}
