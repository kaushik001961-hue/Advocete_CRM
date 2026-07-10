
import { prisma } from "@/lib/prisma";
import HearingForm from "@/components/hearings/HearingForm";

export default async function NewHearingPage() {

  const cases = await prisma.case.findMany({

    orderBy: {
      title: "asc",
    },

  });

  return (

    <div className="max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Schedule Hearing
      </h1>

      <div className="bg-white rounded-xl shadow p-8">

        <HearingForm
          cases={cases}
        />

      </div>

    </div>

  );
}
