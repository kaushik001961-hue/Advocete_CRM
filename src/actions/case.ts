"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCase(formData: FormData) {
  const caseNumber = formData.get("caseNumber") as string;
  const title = formData.get("title") as string;
  const court = formData.get("court") as string;
  const status = formData.get("status") as string;
  const clientId = formData.get("clientId") as string;
  const advocateId = formData.get("advocateId") as string;

  await prisma.case.create({
    data: {
      caseNumber,
      title,
      court,
      status,
      clientId,
      advocateId,
    },
  });

  revalidatePath("/admin/cases");
}

export async function updateCase(formData: FormData) {
  const id = formData.get("id") as string;

  const caseNumber = formData.get("caseNumber") as string;
  const title = formData.get("title") as string;
  const court = formData.get("court") as string;
  const status = formData.get("status") as string;
  const clientId = formData.get("clientId") as string;
  const advocateId = formData.get("advocateId") as string;

  await prisma.case.update({
    where: { id },
    data: {
      caseNumber,
      title,
      court,
      status,
      clientId,
      advocateId,
    },
  });

  revalidatePath("/admin/cases");
}