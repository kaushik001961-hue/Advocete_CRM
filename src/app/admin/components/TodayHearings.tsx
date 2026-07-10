
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TodayHearings() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const hearings = await prisma.hearing.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      case: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return (
  <div className="bg-white rounded-xl border p-6">
    <div className="flex justify-between mb-5">
      <h2 className="text-xl font-bold">
        Today's Hearings
      </h2>

      <Link
        href="/admin/hearings"
        className="text-blue-600 text-sm"
      >
        View All
      </Link>
    </div>

    <div className="space-y-3">
      {hearings.length === 0 && (
        <p className="text-gray-500">
          No hearings today.
        </p>
      )}

      {hearings.map((hearing) => (
        <div
          key={hearing.id}
          className="flex items-center justify-between border-b pb-3"
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
      ))}
    </div>
  </div>
);
}