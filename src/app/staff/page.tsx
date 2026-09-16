import DashboardCard from "@/components/dashboard/DashboardCard";
import { prisma } from "@/lib/prisma";

export default async function StaffDashboard() {
  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const [hearings, clients, documents] = await Promise.all([
    prisma.hearing.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),

    prisma.client.count(),

    prisma.document.count(),
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of today&apos;s activities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Today's Hearings"
          value={hearings}
        />

        <DashboardCard
          title="Clients"
          value={clients}
        />

        <DashboardCard
          title="Documents"
          value={documents}
        />
      </div>
    </div>
  );
}