import Link from "next/link";
import { prisma } from "@/lib/prisma";

function getStatusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";

    case "CLOSED":
      return "bg-slate-100 text-slate-700 border border-slate-200";

    case "PENDING":
      return "bg-amber-50 text-amber-700 border border-amber-200";

    case "ON_HOLD":
      return "bg-orange-50 text-orange-700 border border-orange-200";

    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
}

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    status?: string;
  }>;
}) {
  const params = searchParams ? await searchParams : {};
  const selectedStatus = params.status?.toUpperCase() || "ALL";

  const cases = await prisma.case.findMany({
    include: {
      client: true,
      advocate: true,

      invoices: {
        select: {
          totalAmount: true,
          status: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const totalCases = cases.length;

  const activeCases = cases.filter(
    (item) => item.status.toUpperCase() === "ACTIVE"
  ).length;

  const closedCases = cases.filter(
    (item) => item.status.toUpperCase() === "CLOSED"
  ).length;

  const pendingCases = cases.filter(
    (item) => item.status.toUpperCase() === "PENDING"
  ).length;

  const filteredCases =
    selectedStatus === "ALL"
      ? cases
      : cases.filter(
          (item) => item.status.toUpperCase() === selectedStatus
        );

  return (
    <div className="w-full min-w-0">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Cases
          </h1>

          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Manage and monitor all legal cases.
          </p>
        </div>

        <Link
          href="/staff/cases/new"
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          + New Case
        </Link>
      </div>

      {/* =====================================================
          STATISTICS
      ====================================================== */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}
        <Link
          href="/staff/cases"
          className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
            selectedStatus === "ALL"
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Cases
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalCases}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <span className="text-lg">⚖</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-blue-600">
            Showing all cases
          </p>
        </Link>

        {/* Active */}
        <Link
          href="/staff/cases?status=ACTIVE"
          className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
            selectedStatus === "ACTIVE"
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {activeCases}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Click to view active cases
          </p>
        </Link>

        {/* Closed */}
        <Link
          href="/staff/cases?status=CLOSED"
          className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
            selectedStatus === "CLOSED"
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Closed
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {closedCases}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <span className="text-lg">✓</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Click to view closed cases
          </p>
        </Link>

        {/* Pending */}
        <Link
          href="/staff/cases?status=PENDING"
          className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
            selectedStatus === "PENDING"
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {pendingCases}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <span className="text-lg">!</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Click to view pending cases
          </p>
        </Link>
      </div>

      {/* =====================================================
          CASE TABLE
      ====================================================== */}
      <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {selectedStatus === "ALL"
                ? "All Cases"
                : `${selectedStatus.charAt(0)}${selectedStatus
                    .slice(1)
                    .toLowerCase()} Cases`}
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              {filteredCases.length}{" "}
              {filteredCases.length === 1 ? "case" : "cases"} found
            </p>
          </div>

          {selectedStatus !== "ALL" && (
            <Link
              href="/staff/cases"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Show All Cases
            </Link>
          )}
        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}
        <div className="w-full max-w-full overflow-x-auto">
          <table className="min-w-[1250px] w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Case No.
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Title
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Client
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Advocate
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Court
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-700">
                  Paid Amount
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-700">
                  Pending Amount
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Status
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCases.map((item) => {
                const paidAmount = item.invoices
                  .filter(
                    (invoice) =>
                      invoice.status.toUpperCase() === "PAID"
                  )
                  .reduce(
                    (sum, invoice) =>
                      sum + Number(invoice.totalAmount || 0),
                    0
                  );

                const pendingAmount = item.invoices
                  .filter((invoice) => {
                    const status = invoice.status.toUpperCase();

                    return (
                      status === "PENDING" ||
                      status === "OVERDUE"
                    );
                  })
                  .reduce(
                    (sum, invoice) =>
                      sum + Number(invoice.totalAmount || 0),
                    0
                  );

                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    {/* Case Number */}
                    <td className="px-4 py-4 font-medium text-gray-900">
                      <div className="max-w-[150px] truncate">
                        {item.caseNumber}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-4 text-gray-700">
                      <div className="max-w-[220px] truncate font-medium">
                        {item.title}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-4 py-4 text-gray-700">
                      <div className="max-w-[180px] truncate">
                        {item.client.name}
                      </div>
                    </td>

                    {/* Advocate */}
                    <td className="px-4 py-4 text-gray-700">
                      <div className="max-w-[180px] truncate">
                        {item.advocate.name}
                      </div>
                    </td>

                    {/* Court */}
                    <td className="px-4 py-4 text-gray-700">
                      <div className="max-w-[200px] truncate">
                        {item.court}
                      </div>
                    </td>

                    {/* Paid Amount */}
                    <td className="px-4 py-4 text-right font-semibold text-emerald-600">
                      {formatAmount(paidAmount)}
                    </td>

                    {/* Pending Amount */}
                    <td className="px-4 py-4 text-right font-semibold text-gray-400">
                      {formatAmount(pendingAmount)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/staff/cases/${item.id}`}
                          className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          View
                        </Link>

                        <Link
                          href={`/staff/cases/${item.id}/edit`}
                          className="inline-flex items-center rounded-md bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCases.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                        ⚖
                      </div>

                      <h3 className="text-sm font-semibold text-gray-900">
                        No cases found
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        No cases match the selected status.
                      </p>

                      <Link
                        href="/staff/cases/new"
                        className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        + New Case
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/tablet hint */}
        {filteredCases.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500 lg:hidden">
            Swipe horizontally to view all case details.
          </div>
        )}
      </div>
    </div>
  );
}