
import DashboardCard from "@/components/dashboard/DashboardCards";
import { prisma } from "@/lib/prisma";

export default async function StaffDashboard() {

  const today = new Date();

  const hearings = await prisma.hearing.count({
    where: {
      date: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    },
  });

  const clients = await prisma.client.count();

  const documents = 0;

  return (

    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">

        Staff Dashboard

      </h1>

      <div className="grid md:grid-cols-3 gap-6">

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