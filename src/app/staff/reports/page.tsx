import { prisma } from "@/lib/prisma";

export default async function StaffReportsPage() {
  const [clients, cases, hearings, documents, invoices] = await Promise.all([
    prisma.client.count(),
    prisma.case.count(),
    prisma.hearing.count(),
    prisma.document.count(),
    prisma.invoice.aggregate({ _sum: { totalAmount: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Reports &amp; Analytics</h1><p className="mt-1 text-sm text-gray-500">Operational overview for the firm.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[["Clients", clients], ["Cases", cases], ["Hearings", hearings], ["Documents", documents], ["Billed", `₹${Number(invoices._sum.totalAmount || 0).toLocaleString("en-IN")}`]].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl bg-white p-5 shadow-sm border border-gray-200"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>
        ))}
      </div>
    </div>
  );
}
