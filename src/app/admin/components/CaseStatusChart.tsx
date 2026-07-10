
import { prisma } from "@/lib/prisma";

export default async function CaseStatusChart() {

  const active = await prisma.case.count({
    where: { status: "ACTIVE" },
  });

  const pending = await prisma.case.count({
    where: { status: "PENDING" },
  });

  const closed = await prisma.case.count({
    where: { status: "CLOSED" },
  });

  const total = active + pending + closed || 1;

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-6">
        Case Status
      </h2>

      <div className="space-y-5">

        <div>

          <div className="flex justify-between mb-1">
            <span>Active</span>
            <span>{active}</span>
          </div>

          <div className="h-3 bg-gray-200 rounded">

            <div
              className="h-3 bg-green-500 rounded"
              style={{
                width: `${(active / total) * 100}%`,
              }}
            />

          </div>

        </div>

        <div>

          <div className="flex justify-between mb-1">
            <span>Pending</span>
            <span>{pending}</span>
          </div>

          <div className="h-3 bg-gray-200 rounded">

            <div
              className="h-3 bg-yellow-500 rounded"
              style={{
                width: `${(pending / total) * 100}%`,
              }}
            />

          </div>

        </div>

        <div>

          <div className="flex justify-between mb-1">
            <span>Closed</span>
            <span>{closed}</span>
          </div>

          <div className="h-3 bg-gray-200 rounded">

            <div
              className="h-3 bg-red-500 rounded"
              style={{
                width: `${(closed / total) * 100}%`,
              }}
            />

          </div>

        </div>

      </div>

    </div>
  );
}
