import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";

export type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
};

export async function createNotification(
  input: CreateNotificationInput
) {
  const notification =
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data
          ? JSON.stringify(input.data)
          : null,
      },
    });

  return notification;
}

export async function sendNotificationEmailById(
  notificationId: string
) {
  const notification =
    await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },

      include: {
        user: true,
      },
    });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  /*
   * Respect advocate's email preference.
   */
  if (!notification.user.emailNotifications) {
    return await prisma.notification.update({
      where: {
        id: notificationId,
      },

      data: {
        emailStatus: "DISABLED",
      },
    });
  }

  if (!notification.user.email) {
    await prisma.notification.update({
      where: {
        id: notificationId,
      },

      data: {
        emailStatus: "FAILED",
      },
    });

    throw new Error(
      "User does not have an email address."
    );
  }

  try {
    await sendNotificationEmail({
      to: notification.user.email,
      subject: notification.title,
      title: notification.title,
      message: notification.message,
    });

    return await prisma.notification.update({
      where: {
        id: notificationId,
      },

      data: {
        emailStatus: "SENT",
        emailSentAt: new Date(),
      },
    });
  } catch (error) {
    console.error(
      "NOTIFICATION_EMAIL_ERROR",
      error
    );

    await prisma.notification.update({
      where: {
        id: notificationId,
      },

      data: {
        emailStatus: "FAILED",
      },
    });

    throw error;
  }
}

export async function createAndSendNotification(
  input: CreateNotificationInput
) {
  const notification =
    await createNotification(input);

  try {
    await sendNotificationEmailById(
      notification.id
    );
  } catch (error) {
    console.error(
      "CREATE_NOTIFICATION_EMAIL_ERROR",
      error
    );
  }

  return notification;
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string
) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },

    data: {
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsAsRead(
  userId: string
) {
  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },

    data: {
      readAt: new Date(),
    },
  });
}

export async function getUserNotifications(
  userId: string,
  limit = 50
) {
  return prisma.notification.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: limit,
  });
}

export async function getUnreadNotificationCount(
  userId: string
) {
  return prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}