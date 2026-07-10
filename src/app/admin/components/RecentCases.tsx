
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RecentCases() {
  const cases = await prisma.case.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      client: true,
    },
  });

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-xl font-bold">
          Recent Cases
        </h2>

        <Link
          href="/admin/cases"
          className="text-blue-600 text-sm"
        >
          View All
        </Link>

      </div>

      <div className="space-y-3">

        {cases.map((item) => (

          <div
            key={item.id}
            className="flex justify-between border-b pb-3"
          >

            <div>

              <p className="font-semibold">
                {item.title}
              </p>

              <p className="text-gray-500 text-sm">
                {item.client.name}
              </p>

            </div>

            <Link
              href={`/admin/cases/${item.id}`}
              className="text-blue-600"
            >
              View
            </Link>

          </div>

        ))}

      </div>

    </div>
  );
}
