import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      client: true,
      advocate: true,
      hearings: {
        orderBy: {
          date: "desc",
        },
      },
      documents: true,
    },
  });

  if (!caseData) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {caseData.caseNumber}
          </h1>

          <p className="text-gray-500">
            {caseData.title}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/admin/cases/${id}/edit`}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
          >
            Edit Case
          </Link>

          <Link
            href={`/admin/hearings/new?caseId=${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Add Hearing
          </Link>
        </div>
      </div>

      {/* Case Info */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">
          Case Information
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Court</p>
            <p>{caseData.court}</p>
          </div>

          <div>
            <p className="text-gray-500">Status</p>
            <p>{caseData.status}</p>
          </div>

          <div>
            <p className="text-gray-500">Created</p>
            <p>
              {new Date(
                caseData.createdAt
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">
          Client Information
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Name</p>
            <p>{caseData.client.name}</p>
          </div>

          <div>
            <p className="text-gray-500">Phone</p>
            <p>{caseData.client.phone || "-"}</p>
          </div>

          <div>
            <p className="text-gray-500">Email</p>
            <p>{caseData.client.email || "-"}</p>
          </div>
        </div>
      </div>

      {/* Advocate */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">
          Assigned Advocate
        </h2>

        <p>{caseData.advocate.name}</p>
        <p className="text-gray-500">
          {caseData.advocate.email}
        </p>
      </div>

      {/* Hearings */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-lg">
            Hearings
          </h2>

          <Link
            href={`/admin/hearings/new?caseId=${id}`}
            className="text-blue-600"
          >
            + Schedule Hearing
          </Link>
        </div>

        {caseData.hearings.length === 0 ? (
          <p className="text-gray-500">
            No hearings scheduled.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">
                  Date
                </th>
                <th className="text-left py-2">
                  Status
                </th>
                <th className="text-left py-2">
                  Remarks
                </th>
              </tr>
            </thead>

            <tbody>
              {caseData.hearings.map((hearing) => (
                <tr
                  key={hearing.id}
                  className="border-b"
                >
                  <td className="py-2">
                    {new Date(
                      hearing.date
                    ).toLocaleDateString()}
                  </td>

                  <td>{hearing.status}</td>

                  <td>
                    {hearing.remarks || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-lg">
            Documents
          </h2>

          <Link
            href={`/admin/documents/upload?caseId=${id}`}
            className="text-blue-600"
          >
            + Upload
          </Link>
        </div>

        {caseData.documents.length === 0 ? (
          <p className="text-gray-500">
            No documents uploaded.
          </p>
        ) : (
          <div className="space-y-2">
            {caseData.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex justify-between border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">
                    {doc.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {doc.category}
                  </p>
                </div>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  className="text-blue-600"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}