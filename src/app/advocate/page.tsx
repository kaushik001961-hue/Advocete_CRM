"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  CreditCard,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  totalAmount: number;
  status: string;
  dueDate: string;
  client?: {
    name: string;
  };
}

export default function AdvocateDashboard() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/invoices");

        if (!res.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data: unknown = await res.json();

        if (Array.isArray(data)) {
          setInvoices(data as InvoiceItem[]);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard invoices", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const totalCollected = invoices
    .filter((inv) => inv.status.toUpperCase() === "PAID")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingDues = invoices
    .filter(
      (inv) =>
        inv.status.toUpperCase() === "PENDING" ||
        inv.status.toUpperCase() === "OVERDUE"
    )
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const totalInvoiced = invoices.reduce(
    (acc, curr) => acc + curr.totalAmount,
    0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Greeting Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">
            Welcome back, Adv. Rahul Sharma
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Here is a summary of your active cases, upcoming court hearings,
            and financial revenue.
          </p>
        </div>

        <Link
          href="/advocate/billing"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <CreditCard size={16} />
          Manage Billing
        </Link>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Collected
            </span>
            <CheckCircle2 size={18} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            {isLoading
              ? "..."
              : `₹${totalCollected.toLocaleString("en-IN")}`}
          </h2>

          <p className="text-[11px] text-emerald-600 font-medium">
            Successfully credited from paid invoices
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pending Dues
            </span>
            <Clock size={18} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            {isLoading ? "..." : `₹${pendingDues.toLocaleString("en-IN")}`}
          </h2>

          <p className="text-[11px] text-amber-600 font-medium">
            Awaiting payment from active clients
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Billed
            </span>
            <CreditCard size={18} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            {isLoading ? "..." : `₹${totalInvoiced.toLocaleString("en-IN")}`}
          </h2>

          <p className="text-[11px] text-blue-600 font-medium">
            Lifetime value of generated invoices
          </p>
        </div>
      </div>

      {/* Recent Invoices + Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" />
              Recent Invoicing Activity
            </h3>

            <Link
              href="/advocate/billing"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              View All
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-semibold">Invoice No</th>
                  <th className="pb-2 font-semibold">Client</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-400"
                    >
                      Loading recent invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-400"
                    >
                      No recent invoice records found.
                    </td>
                  </tr>
                ) : (
                  invoices.slice(0, 5).map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50/50"
                    >
                      <td className="py-3 font-mono font-bold text-gray-900">
                        {inv.invoiceNo}
                      </td>

                      <td className="py-3 font-semibold text-gray-800">
                        {inv.client?.name || "N/A"}
                      </td>

                      <td className="py-3 font-bold text-gray-900">
                        ₹{inv.totalAmount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status.toUpperCase() === "PAID"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-3">
            Quick Navigation
          </h3>

          <div className="space-y-2.5 text-xs">
            <Link
              href="/advocate/cases"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50/50 rounded-xl transition text-gray-700 font-medium"
            >
              <span className="flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" />
                My Cases
              </span>

              <ArrowUpRight size={14} className="text-gray-400" />
            </Link>

            <Link
              href="/advocate/hearings"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50/50 rounded-xl transition text-gray-700 font-medium"
            >
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                Court Hearings
              </span>

              <ArrowUpRight size={14} className="text-gray-400" />
            </Link>

            <Link
              href="/advocate/billing"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50/50 rounded-xl transition text-gray-700 font-medium"
            >
              <span className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                Billing & Invoices
              </span>

              <ArrowUpRight size={14} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}