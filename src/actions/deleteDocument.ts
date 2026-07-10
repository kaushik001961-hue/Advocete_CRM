"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteDocument(id: string) {

  await prisma.document.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/documents");
}
