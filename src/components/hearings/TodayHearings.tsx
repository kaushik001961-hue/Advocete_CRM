import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TodayHearings() {
  const today = new Date();

  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const hearings = await prisma.hearing.findMany({
    where: {
      date: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    include: {
      case: true,
    },
    orderBy: {
      date: "asc",
    },
    take: 5,
  });

  return (
    <div className="bg-white border rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
         Today&apos;s Hearings
        </h2>

        <Link
          href="/admin/hearings"
          className="text-blue-600 text-sm"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {hearings.length === 0 ? (
          <p className="text-gray-500">
            No hearings today
          </p>
        ) : (
          hearings.map((hearing) => (
            <div
              key={hearing.id}
              className="flex justify-between items-center border-b pb-3"
            >
              <div>
                <p className="font-semibold">
                  {hearing.case.title}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(
                    hearing.date
                  ).toLocaleTimeString()}
                </p>
              </div>

              <Link
                href={`/admin/hearings/${hearing.id}`}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
              >
                View
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}