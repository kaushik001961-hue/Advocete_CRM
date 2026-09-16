import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SyncECourtsButton from "@/components/ecourts/SyncECourtsButton";
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

      timelineEvents: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!caseData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                {caseData.caseNumber}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  caseData.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : caseData.status === "CLOSED"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {caseData.status}
              </span>
            </div>

            <p className="mt-1 text-gray-500">
              {caseData.title}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/staff/cases/${id}/edit`}
              className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-yellow-600"
            >
              Edit Case
            </Link>

            <Link
              href={`/staff/hearings/new?caseId=${id}`}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Add Hearing
            </Link>
          </div>
        </div>

        {/* Case Information */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-5 md:px-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Case Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Basic information about this legal case.
            </p>
          </div>

          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Case Number */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Case Number
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {caseData.caseNumber}
                </p>
              </div>

              {/* Case Type */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Case Type
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {caseData.caseType}
                </p>
              </div>

              {/* Case Stage */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Case Stage
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {caseData.caseStage}
                </p>
              </div>

              {/* Court */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Court
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {caseData.court}
                </p>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Priority
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {caseData.priority || "-"}
                </p>
              </div>

              {/* Created */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Created
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {new Date(
                    caseData.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>

              {/* Case Title */}
              <div className="md:col-span-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Case Title
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {caseData.title}
                </p>
              </div>

              {/* Description */}
              {caseData.description && (
                <div className="md:col-span-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Description
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-gray-700">
                    {caseData.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* eCourts Information */}
        <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
          {/* eCourts Header */}
          <div className="flex flex-col gap-4 border-b border-blue-200 bg-blue-50 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <span className="text-lg">⚖</span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  eCourts Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Court tracking and synchronization information.
                </p>
              </div>
            </div>

            {caseData.cnrNumber && (
              <div className="flex items-center gap-3">
  <Link
    href="/staff/ecourts"
    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
  >
    View eCourts
  </Link>

  <SyncECourtsButton
    cnrNumber={caseData.cnrNumber}
  />
</div>
            )}
          </div>

          {/* eCourts Content */}
          {caseData.cnrNumber ? (
            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* CNR Number */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    CNR Number
                  </p>

                  <p className="mt-1 break-all font-semibold text-gray-900">
                    {caseData.cnrNumber}
                  </p>
                </div>

                {/* eCourts Status */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    eCourts Status
                  </p>

                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        caseData.eCourtsStatus === "FOUND"
                          ? "bg-green-50 text-green-700"
                          : caseData.eCourtsStatus === "ERROR"
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {caseData.eCourtsStatus || "NOT SYNCED"}
                    </span>
                  </div>
                </div>

                {/* Last Synced */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Last Synced
                  </p>

                  <p className="mt-1 text-gray-900">
                    {caseData.eCourtsLastSyncedAt
                      ? new Date(
                          caseData.eCourtsLastSyncedAt
                        ).toLocaleString()
                      : "Not synced yet"}
                  </p>
                </div>
              </div>

              {/* CNR Information Notice */}
              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-sm text-blue-700">
                  This case is connected to eCourts using the
                  assigned CNR number.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 md:p-6">
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <span className="text-xl">⚖</span>
                </div>

                <h3 className="text-base font-semibold text-gray-900">
                  eCourts Information Not Available
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  This case is not currently connected to eCourts.
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  No CNR number has been assigned to this case.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Client Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Client Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Client associated with this case.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {caseData.client.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Phone
              </p>

              <p className="mt-1 text-gray-900">
                {caseData.client.phone || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Email
              </p>

              <p className="mt-1 text-gray-900">
                {caseData.client.email || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Advocate */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Assigned Advocate
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Advocate responsible for this case.
          </p>

          <div className="mt-5">
            <p className="font-medium text-gray-900">
              {caseData.advocate.name}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {caseData.advocate.email}
            </p>

            {caseData.advocate.phone && (
              <p className="mt-1 text-sm text-gray-500">
                {caseData.advocate.phone}
              </p>
            )}
          </div>
        </div>

        {/* Hearings */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Hearings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Scheduled court hearings for this case.
              </p>
            </div>

            <Link
              href={`/staff/hearings/new?caseId=${id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + Schedule Hearing
            </Link>
          </div>

          <div className="p-5 md:p-6">
            {caseData.hearings.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hearings scheduled.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Date
                      </th>

                      <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Status
                      </th>

                      <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Remarks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {caseData.hearings.map((hearing) => (
                      <tr
                        key={hearing.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-2 py-3 text-sm text-gray-900">
                          {new Date(
                            hearing.date
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-2 py-3 text-sm">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {hearing.status}
                          </span>
                        </td>

                        <td className="px-2 py-3 text-sm text-gray-600">
                          {hearing.remarks || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Case Timeline
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Activity and important events for this case.
            </p>
          </div>

          {caseData.timelineEvents.length === 0 ? (
            <p className="text-sm text-gray-500">
              No timeline events recorded.
            </p>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute bottom-2 left-[9px] top-2 w-px bg-gray-200" />

              <div className="space-y-6">
                {caseData.timelineEvents.map((event) => (
                  <div
                    key={event.id}
                    className="relative flex gap-4"
                  >
                    {/* Timeline Dot */}
                    <div className="relative z-10 mt-1 h-5 w-5 shrink-0 rounded-full border-4 border-white bg-blue-600 shadow-sm" />

                    {/* Event */}
                    <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {event.eventType.replaceAll(
                              "_",
                              " "
                            )}
                          </p>

                          {event.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <p className="shrink-0 text-sm text-gray-500">
                          {new Date(
                            event.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Documents
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Documents associated with this case.
              </p>
            </div>

            <Link
              href={`/staff/documents/upload?caseId=${id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + Upload
            </Link>
          </div>

          <div className="p-5 md:p-6">
            {caseData.documents.length === 0 ? (
              <p className="text-sm text-gray-500">
                No documents uploaded.
              </p>
            ) : (
              <div className="space-y-3">
                {caseData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {doc.name}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {doc.category || "Document"}
                      </p>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}