import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [
    totalClients,
    totalCases,
    totalInvoices,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.case.count(),
    prisma.invoice.count(),
  ]);

  const revenue = await prisma.invoice.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      status: "PAID",
    },
  });

  return {
    totalClients,
    totalCases,
    totalInvoices,
    revenue:
      revenue._sum.totalAmount || 0,
  };
}