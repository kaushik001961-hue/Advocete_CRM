import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteClientButton from "@/components/clients/DeleteClientButton";
import DataTable from "@/components/ui/DataTable";

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Clients
        </h1>

        <Link
          href="/admin/clients/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
        >
          Add Client
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">
            Total Clients
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {totalClients}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">
            Total Cases
          </p>

          <h2 className="text-2xl font-bold text-blue-600 mt-2">
            {totalCases}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">
            Total Invoices
          </p>

          <h2 className="text-2xl font-bold text-green-600 mt-2">
            {totalInvoices}
          </h2>
        </div>
      </div>

      {/* Table */}
      <DataTable
        headers={[
          "Name",
          "Phone",
          "Email",
          "City",
          "Cases",
          "Invoices",
          "Actions",
        ]}
      >
        {clients.length === 0 ? (
          <tr>
            <td
              colSpan={7}
              className="text-center p-8 text-gray-500"
            >
              No clients found
            </td>
          </tr>
        ) : (
          clients.map((client) => (
            <tr
              key={client.id}
              className="border-t hover:bg-slate-50"
            >
              <td className="p-4 font-medium">
                {client.name}
              </td>

              <td className="p-4">
                {client.phone || "-"}
              </td>

              <td className="p-4">
                {client.email || "-"}
              </td>

              <td className="p-4">
                {client.city || "-"}
              </td>

              <td className="p-4 text-center">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {client.cases.length}
                </span>
              </td>

              <td className="p-4 text-center">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {client.invoices.length}
                </span>
              </td>

              <td className="p-4">
  <div className="flex gap-2">
    <Link
      href={`/admin/clients/${client.id}`}
      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
    >
      View
    </Link>

    <Link
      href={`/admin/clients/${client.id}/edit`}
      className="px-3 py-1 bg-amber-500 text-white rounded text-sm"
    >
      Edit
    </Link>

    <DeleteClientButton
      id={client.id}
    />
  </div>
</td>
            </tr>
          ))
        )}
      </DataTable>
    </div>
  );
}