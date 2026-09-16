
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function HearingProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const hearing = await prisma.hearing.findUnique({

    where: {
      id,
    },

    include: {

      case: {

        include: {

          client: true,

          advocate: true,

        },

      },

    },

  });

  if (!hearing) {
    notFound();
  }

  return (

    <div className="max-w-5xl mx-auto">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Hearing Details
        </h1>

        <Link
          href={`/staff/hearings/${hearing.id}/edit`}
          className="bg-green-600 text-white px-5 py-3 rounded-lg"
        >
          Edit Hearing
        </Link>

      </div>

      <div className="bg-white rounded-xl shadow p-8">

        <div className="grid md:grid-cols-2 gap-8">

          <div>

            <h2 className="font-semibold mb-2">
              Hearing Date
            </h2>

            <p>
              {new Date(
                hearing.date
              ).toLocaleString()}
            </p>

          </div>

          <div>

            <h2 className="font-semibold mb-2">
              Status
            </h2>

            <span className="bg-blue-600 text-white px-3 py-1 rounded-full">

              {hearing.status}

            </span>

          </div>

          <div>

            <h2 className="font-semibold mb-2">
              Case
            </h2>

            <p>
              {hearing.case.title}
            </p>

          </div>

          <div>

            <h2 className="font-semibold mb-2">
              Court
            </h2>

            <p>
              {hearing.case.court}
            </p>

          </div>

          <div>

            <h2 className="font-semibold mb-2">
              Client
            </h2>

            <p>
              {hearing.case.client.name}
            </p>

          </div>

          <div>

            <h2 className="font-semibold mb-2">
              Advocate
            </h2>

            <p>
              {hearing.case.advocate.name}
            </p>

          </div>

          <div>

            <h2 className="font-semibold mb-2">
              Next Hearing
            </h2>

            <p>

              {hearing.nextDate
                ? new Date(
                    hearing.nextDate
                  ).toLocaleDateString()
                : "-"}

            </p>

          </div>

          <div>

            <h2 className="font-semibold mb-2">
              Remarks
            </h2>

            <p>

              {hearing.remarks || "-"}

            </p>

          </div>

        </div>

      </div>

    </div>

  );
}
