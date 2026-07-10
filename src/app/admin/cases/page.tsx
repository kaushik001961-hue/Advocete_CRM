import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CasesPage() {
  const cases = await prisma.case.findMany({
    include: {
      client: true,
      advocate: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cases</h1>
          <p className="text-gray-500">
            Manage all legal cases
          </p>
        </div>

        <Link
          href="/admin/cases/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + New Case
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5">
          <h4 className="text-gray-500 text-sm">Total Cases</h4>
          <p className="text-3xl font-bold">{cases.length}</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h4 className="text-gray-500 text-sm">Active</h4>
          <p className="text-3xl font-bold">
            {cases.filter(c => c.status === "ACTIVE").length}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h4 className="text-gray-500 text-sm">Closed</h4>
          <p className="text-3xl font-bold">
            {cases.filter(c => c.status === "CLOSED").length}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h4 className="text-gray-500 text-sm">Pending</h4>
          <p className="text-3xl font-bold">
            {cases.filter(c => c.status === "PENDING").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Case No.</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Advocate</th>
              <th className="px-4 py-3 text-left">Court</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {cases.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium">
                  {item.caseNumber}
                </td>

                <td className="px-4 py-3">
                  {item.title}
                </td>

                <td className="px-4 py-3">
                  {item.client.name}
                </td>

                <td className="px-4 py-3">
                  {item.advocate.name}
                </td>

                <td className="px-4 py-3">
                  {item.court}
                </td>

                <td className="px-4 py-3">
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                    {item.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/cases/${item.id}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded"
                    >
                      View
                    </Link>

                    <Link
                      href={`/admin/cases/${item.id}/edit`}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {cases.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-500"
                >
                  No cases found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}