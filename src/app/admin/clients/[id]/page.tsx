import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const client =
    await prisma.client.findUnique({
      where: { id },
      include: {
        cases: true,
        invoices: true,
        documents: true,
      },
    });

  if (!client) {
    return (
      <div>Client not found</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold">
          {client.name}
        </h1>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <strong>Phone:</strong>{" "}
            {client.phone}
          </div>

          <div>
            <strong>Email:</strong>{" "}
            {client.email}
          </div>

          <div>
            <strong>City:</strong>{" "}
            {client.city}
          </div>

          <div>
            <strong>State:</strong>{" "}
            {client.state}
          </div>

          <div>
            <strong>Pincode:</strong>{" "}
            {client.pincode}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <p>Total Cases</p>

          <h2 className="text-2xl font-bold">
            {client.cases.length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p>Total Invoices</p>

          <h2 className="text-2xl font-bold">
            {client.invoices.length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p>Documents</p>

          <h2 className="text-2xl font-bold">
            {client.documents.length}
          </h2>
        </div>
      </div>

      <Link
        href={`/admin/clients/${client.id}/edit`}
        className="bg-amber-500 text-white px-4 py-2 rounded"
      >
        Edit Client
      </Link>
    </div>
  );
}