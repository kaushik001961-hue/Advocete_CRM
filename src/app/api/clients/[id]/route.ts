import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const { id } = await params;

  const body = await req.json();

  const client =
    await prisma.client.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        notes: body.notes,
      },
    });

  return NextResponse.json(
    client
  );
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const { id } = await params;

  await prisma.client.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
  });
}