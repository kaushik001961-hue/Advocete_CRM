import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  markNotificationAsRead,
} from "@/lib/notifications";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    await markNotificationAsRead(
      id,
      session.user.id
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "NOTIFICATION_READ_ERROR",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to mark notification as read.",
      },
      {
        status: 500,
      }
    );
  }
}