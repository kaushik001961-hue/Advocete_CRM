import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteClientButton from "@/components/clients/DeleteClientButton";
import DataTable from "@/components/ui/DataTable";

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      cases: true,
      invoices: true,
      documents: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalClients = clients.length;

  const totalCases = clients.reduce(
    (sum, client) => sum + client.cases.length,
    0
  );

  const totalInvoices = clients.reduce(
    (sum, client) => sum + client.invoices.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Clients
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage clients and their financial information.
          </p>
        </div>

        <Link
          href="/staff/clients/new"
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 sm:w-auto"
        >
          Add Client
        </Link>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Clients */}
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Clients
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {totalClients}
          </h2>
        </div>

        {/* Total Cases */}
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Cases
          </p>

          <h2 className="mt-2 text-2xl font-bold text-blue-600">
            {totalCases}
          </h2>
        </div>

        {/* Total Invoices */}
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Invoices
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {totalInvoices}
          </h2>
        </div>
      </div>

      {/* =====================================================
          CLIENT TABLE
      ====================================================== */}
      <div className="w-full overflow-x-auto">
        <DataTable
          headers={[
            "Name",
            "Phone",
            "Email",
            "City",
            "Cases",
            "Invoices",
            "Paid Amount",
            "Pending Amount",
            "Actions",
          ]}
        >
          {clients.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="p-8 text-center text-gray-500"
              >
                No clients found
              </td>
            </tr>
          ) : (
            clients.map((client) => {
              /*
               * =================================================
               * CLIENT FINANCIAL TOTALS
               *
               * These amounts are calculated from ALL invoices
               * belonging to this client.
               *
               * Therefore, if a client has:
               *
               * Case A -> ₹10,000 paid
               * Case B -> ₹20,000 paid
               * Case C -> ₹5,000 pending
               *
               * The client will show:
               *
               * Paid    = ₹30,000
               * Pending = ₹5,000
               *
               * This is NOT limited to one case.
               *
               * Invoices without a case are also included because
               * the invoices are loaded directly through client.
               * =================================================
               */

              const paidAmount = client.invoices.reduce(
                (total, invoice) => {
                  const status = String(
                    invoice.status || ""
                  ).toUpperCase();

                  if (status === "PAID") {
                    return (
                      total +
                      Number(invoice.totalAmount || 0)
                    );
                  }

                  return total;
                },
                0
              );

              const pendingAmount = client.invoices.reduce(
                (total, invoice) => {
                  const status = String(
                    invoice.status || ""
                  ).toUpperCase();

                  if (
                    status === "PENDING" ||
                    status === "OVERDUE"
                  ) {
                    return (
                      total +
                      Number(invoice.totalAmount || 0)
                    );
                  }

                  return total;
                },
                0
              );

              return (
                <tr
                  key={client.id}
                  className="border-t transition hover:bg-slate-50"
                >
                  {/* Name */}
                  <td className="p-4 font-medium text-gray-900">
                    {client.name}
                  </td>

                  {/* Phone */}
                  <td className="p-4 text-gray-700">
                    {client.phone || "-"}
                  </td>

                  {/* Email */}
                  <td className="p-4 text-gray-700">
                    {client.email || "-"}
                  </td>

                  {/* City */}
                  <td className="p-4 text-gray-700">
                    {client.city || "-"}
                  </td>

                  {/* Cases */}
                  <td className="p-4 text-center">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      {client.cases.length}
                    </span>
                  </td>

                  {/* Invoices */}
                  <td className="p-4 text-center">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      {client.invoices.length}
                    </span>
                  </td>

                  {/* =================================================
                      PAID AMOUNT
                  ================================================== */}
                  <td className="whitespace-nowrap p-4 text-right">
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(paidAmount)}
                    </span>
                  </td>

                  {/* =================================================
                      PENDING AMOUNT
                  ================================================== */}
                  <td className="whitespace-nowrap p-4 text-right">
                    <span
                      className={
                        pendingAmount > 0
                          ? "font-semibold text-amber-600"
                          : "font-semibold text-gray-400"
                      }
                    >
                      {formatCurrency(pendingAmount)}
                    </span>
                  </td>

                  {/* =================================================
                      ACTIONS
                  ================================================== */}
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/staff/clients/${client.id}`}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition hover:bg-blue-700"
                      >
                        View
                      </Link>

                      <Link
                        href={`/staff/clients/${client.id}/edit`}
                        className="rounded bg-amber-500 px-3 py-1 text-sm text-white transition hover:bg-amber-600"
                      >
                        Edit
                      </Link>

                      <DeleteClientButton
                        id={client.id}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </DataTable>
      </div>
    </div>
  );
}