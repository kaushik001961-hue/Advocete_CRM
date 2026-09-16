"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name) {
    throw new Error("Client name is required.");
  }

  const client = await prisma.client.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/advocate/clients");

  return client;
}

export async function createCaseForClient(formData: FormData) {
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
  revalidatePath("/admin/clients");
  revalidatePath("/advocate/cases");
}