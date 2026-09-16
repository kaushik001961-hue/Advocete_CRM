import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications";

export async function GET() {
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

    const userId = session.user.id;

    const [notifications, unreadCount] =
      await Promise.all([
        getUserNotifications(userId),
        getUnreadNotificationCount(userId),
      ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "NOTIFICATIONS_GET_ERROR",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load notifications.",
      },
      {
        status: 500,
      }
    );
  }
}