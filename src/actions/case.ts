"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCase(formData: FormData) {
  const caseNumber = String(formData.get("caseNumber") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const caseType = String(formData.get("caseType") ?? "CIVIL").trim();
  const court = String(formData.get("court") ?? "").trim();
  const status = String(formData.get("status") ?? "ACTIVE").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();
  const advocateId = String(formData.get("advocateId") ?? "").trim();

  if (!caseNumber || !title || !court || !clientId || !advocateId) {
    throw new Error("Please provide all required case fields.");
  }

  await prisma.case.create({
    data: {
      caseNumber,
      title,
      caseType,
      court,
      status,
      clientId,
      advocateId,
    },
  });

  revalidatePath("/admin/cases");
  revalidatePath("/advocate/cases");
}

export async function updateCase(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const caseNumber = String(formData.get("caseNumber") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const caseType = String(formData.get("caseType") ?? "CIVIL").trim();
  const court = String(formData.get("court") ?? "").trim();
  const status = String(formData.get("status") ?? "ACTIVE").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();
  const advocateId = String(formData.get("advocateId") ?? "").trim();

  if (
    !id ||
    !caseNumber ||
    !title ||
    !court ||
    !clientId ||
    !advocateId
  ) {
    throw new Error("Please provide all required case fields.");
  }

  await prisma.case.update({
    where: { id },
    data: {
      caseNumber,
      title,
      caseType,
      court,
      status,
      clientId,
      advocateId,
    },
  });

  revalidatePath("/admin/cases");
  revalidatePath("/advocate/cases");
}