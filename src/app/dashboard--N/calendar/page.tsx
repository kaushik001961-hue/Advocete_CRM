import { prisma } from "@/lib/prisma";
import HearingCalendar from "@/components/hearings/HearingCalendar";


export default async function CalendarPage() {
  const hearings = await prisma.hearing.findMany({
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
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Hearing Calendar
        </h1>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <HearingCalendar
          hearings={hearings}
        />

      </div>

    </div>
  );
}
