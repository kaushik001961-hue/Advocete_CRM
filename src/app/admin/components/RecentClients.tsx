
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RecentClients() {
  const clients = await prisma.client.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-xl font-bold">
          Recent Clients
        </h2>

        <Link
          href="/admin/clients"
          className="text-blue-600 text-sm"
        >
          View All
        </Link>

      </div>

      <div className="space-y-3">

        {clients.map((client) => (

          <div
            key={client.id}
            className="flex justify-between border-b pb-3"
          >

            <div>

              <p className="font-semibold">
                {client.name}
              </p>

              <p className="text-gray-500 text-sm">
                {client.phone}
              </p>

            </div>

            <Link
              href={`/admin/clients/${client.id}`}
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