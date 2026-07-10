
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import HearingForm from "@/components/hearings/HearingForm";

export default async function EditHearing({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const hearing =
    await prisma.hearing.findUnique({

      where: {
        id,
      },

    });

  if (!hearing) {
    notFound();
  }

  const cases =
    await prisma.case.findMany({

      orderBy: {
        title: "asc",
      },

    });

  return (

    <div className="max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Edit Hearing
      </h1>

      <div className="bg-white rounded-xl shadow p-8">

        <HearingForm

          hearing={hearing}

          cases={cases}

        />

      </div>

    </div>

  );

}
