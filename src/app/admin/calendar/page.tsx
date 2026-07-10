
import HearingCalendar from "@/components/hearings/HearingCalendar";
import { prisma } from "@/lib/prisma";

export default async function CalendarPage() {

  const hearings =
    await prisma.hearing.findMany({

      include: {

        case: true,

      },

    });

  return (

    <div>

      <h1 className="text-3xl font-bold mb-8">
        Hearing Calendar
      </h1>

      <div className="bg-white rounded-xl shadow p-6">

        <HearingCalendar
          hearings={hearings}
        />

      </div>

    </div>

  );

}
