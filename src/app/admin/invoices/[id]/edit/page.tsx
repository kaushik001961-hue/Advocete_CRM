import { prisma } from "@/lib/prisma";
import EditInvoiceForm from "./EditInvoiceForm";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });

  if (!invoice) {
    return (
      <div className="p-6">
        Invoice not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Edit Invoice
      </h1>

      <EditInvoiceForm invoice={invoice} />
    </div>
  );
}