import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createAndSendNotification,
} from "@/lib/notifications";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notification = await createAndSendNotification({
      userId: session.user.id,
      type: "SYSTEM_TEST",
      title: "ACMS Email Notification Test",
      message:
        "This is a test notification from the Advocate Case Management System. Your email notification system is working correctly.",
      data: {
        test: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test notification created and email dispatch attempted.",
      notificationId: notification.id,
    });
  } catch (error) {
    console.error("TEST_EMAIL_NOTIFICATION_ERROR", error);

    return NextResponse.json(
      {
        error: "Failed to send test notification.",
      },
      { status: 500 }
    );
  }
}