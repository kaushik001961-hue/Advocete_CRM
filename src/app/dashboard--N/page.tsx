
import { prisma } from "@/lib/prisma";

import DashboardCard from "@/components/dashboard/DashboardCards";
import TodayHearings from "@/components/dashboard/TodayHearings";

export default async function DashboardPage() {
  const totalClients = await prisma.client.count();

  const totalCases = await prisma.case.count();

  const today = new Date();

  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const hearings = await prisma.hearing.count({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  const todayHearings = await prisma.hearing.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      case: {
        include: {
          client: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <DashboardCard
          title="Clients"
          value={totalClients}
        />

        <DashboardCard
          title="Cases"
          value={totalCases}
        />

        <DashboardCard
          title="Today's Hearings"
          value={hearings}
        />

      </div>

      <TodayHearings hearings={todayHearings} />

    </div>
  );
}