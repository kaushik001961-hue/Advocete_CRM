import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function UpcomingHearings() {
  const hearings = await prisma.hearing.findMany({
    where: {
      date: {
        gt: new Date(),
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
    <div className="bg-white rounded-xl border p-6">
      <div className="flex justify-between mb-5">
        <h2 className="text-xl font-bold">
          Upcoming Hearings
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
            No upcoming hearings.
          </p>
        )}

        {hearings.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b pb-3"
          >
            <div>
              <p className="font-semibold">
                {item.case.title}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>

            <Link
              href={`/admin/hearings/${item.id}`}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}