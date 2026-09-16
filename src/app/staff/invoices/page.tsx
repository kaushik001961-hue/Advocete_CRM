import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteInvoiceButton from "@/components/invoices/DeleteInvoiceButton";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      client: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );

  const pendingAmount = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  const paidAmount = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Invoices
        </h1>

        <Link
          href="/staff/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
        >
          Add Invoice
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Total Revenue
          </p>

          <h2 className="text-2xl font-bold mt-2">
            ₹{totalAmount.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Paid
          </p>

          <h2 className="text-2xl font-bold text-green-600 mt-2">
            ₹{paidAmount.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Pending
          </p>

          <h2 className="text-2xl font-bold text-orange-600 mt-2">
            ₹{pendingAmount.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">
                  Invoice
                </th>

                <th className="p-4 text-left">
                  Client
                </th>

                <th className="p-4 text-center">
                  Amount
                </th>

                <th className="p-4 text-center">
                  Status
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-gray-500"
                  >
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-4 font-medium">
                      {invoice.invoiceNo}
                    </td>

                    <td className="p-4">
                      {invoice.client?.name}
                    </td>

                    <td className="p-4 text-center">
                      ₹{invoice.totalAmount}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/staff/invoices/${invoice.id}/edit`}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm"
                        >
                          Edit
                        </Link>

                        <DeleteInvoiceButton
                          id={invoice.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}