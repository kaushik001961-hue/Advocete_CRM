
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createHearing(formData: FormData) {

  await prisma.hearing.create({

    data: {

      date: new Date(formData.get("date") as string),

      status: formData.get("status") as string,

      remarks: formData.get("remarks") as string,

      nextDate: formData.get("nextDate")
        ? new Date(formData.get("nextDate") as string)
        : null,

      caseId: formData.get("caseId") as string,

    },

  });

  revalidatePath("/admin/hearings");

}

export async function updateHearing(formData: FormData) {

  const id = formData.get("id") as string;

  await prisma.hearing.update({

    where: { id },

    data: {

      date: new Date(formData.get("date") as string),

      status: formData.get("status") as string,

      remarks: formData.get("remarks") as string,

      nextDate: formData.get("nextDate")
        ? new Date(formData.get("nextDate") as string)
        : null,

      caseId: formData.get("caseId") as string,

    },

  });

  revalidatePath("/admin/hearings");

}
