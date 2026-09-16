import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdvocateReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const advocateId = session.user.id;
  const [clients, cases, hearings, documents, invoices] = await Promise.all([
    prisma.client.count({ where: { cases: { some: { advocateId } } } }),
    prisma.case.count({ where: { advocateId } }),
    prisma.hearing.count({ where: { case: { advocateId } } }),
    prisma.document.count({ where: { OR: [{ case: { advocateId } }, { client: { cases: { some: { advocateId } } } }] } }),
    prisma.invoice.aggregate({ where: { OR: [{ legalCase: { advocateId } }, { client: { cases: { some: { advocateId } } } }] }, _sum: { totalAmount: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports &amp; Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Your case and practice activity.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Clients", clients],
          ["Cases", cases],
          ["Hearings", hearings],
          ["Documents", documents],
          ["Billed", `₹${Number(invoices._sum.totalAmount || 0).toLocaleString("en-IN")}`],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
