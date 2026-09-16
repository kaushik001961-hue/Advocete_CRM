import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  markAllNotificationsAsRead,
} from "@/lib/notifications";

export async function PATCH() {
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

    await markAllNotificationsAsRead(
      session.user.id
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "NOTIFICATIONS_READ_ALL_ERROR",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to mark notifications as read.",
      },
      {
        status: 500,
      }
    );
  }
}