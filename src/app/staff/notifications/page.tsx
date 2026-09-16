import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function StaffNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Notifications</h1><p className="mt-1 text-sm text-gray-500">Your ACMS notifications.</p></div>
      <div className="space-y-3">
        {notifications.length === 0 ? <div className="rounded-xl bg-white border border-gray-200 p-8 text-center text-gray-500">No notifications.</div> : notifications.map((item) => (
          <div key={item.id} className={`rounded-xl border p-4 bg-white ${item.readAt ? "border-gray-200" : "border-blue-200 bg-blue-50/30"}`}>
            <div className="flex justify-between gap-4"><h2 className="font-semibold text-gray-900">{item.title}</h2><span className="text-xs text-gray-500">{item.createdAt.toLocaleString("en-IN")}</span></div>
            <p className="mt-1 text-sm text-gray-600">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
