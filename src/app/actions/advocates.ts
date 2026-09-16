"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createAdvocateAccount(formData: {
  name: string;
  email: string;
  password?: string;
  barEnrollmentNo: string;
  specialisation: string;
  phone?: string;
  experienceYears?: number;
}) {
  try {
    // Generate temporary password if not provided
    const rawPassword = formData.password || "Advocate@123";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const advocateUser = await prisma.user.create({
      data: {
        name: formData.name,
        email: formData.email,
        password: hashedPassword,
        role: "ADVOCATE",
        barEnrollmentNo: formData.barEnrollmentNo,
        specialisation: formData.specialisation,
        phone: formData.phone,
        experienceYears: formData.experienceYears || 0,
        status: "Active",
      },
    });

    revalidatePath("/admin/advocates");

    return {
      success: true,
      user: advocateUser,
      temporaryPassword: rawPassword,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create advocate.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}