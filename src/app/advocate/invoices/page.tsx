"use client";

import { useState } from "react";
import {
  Receipt,
  Search,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  clientName: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      id: "1",
      invoiceNo: "INV-2026-001",
      clientName: "Ramesh Sharma",
      amount: 25000,
      gstAmount: 4500,
      totalAmount: 29500,
      dueDate: "2026-09-15",
      status: "PENDING",
    },
    {
      id: "2",
      invoiceNo: "INV-2026-002",
      clientName: "TechCorp India Ltd",
      amount: 60000,
      gstAmount: 10800,
      totalAmount: 70800,
      dueDate: "2026-08-30",
      status: "PAID",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Invoice Form State
  const [clientName, setClientName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const base = parseFloat(feeAmount);
    const gst = base * 0.18;
    const total = base + gst;

    const newInv: InvoiceItem = {
      id: String(Date.now()),
      invoiceNo: `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`,
      clientName,
      amount: base,
      gstAmount: gst,
      totalAmount: total,
      dueDate,
      status: "PENDING",
    };

    setInvoices([newInv, ...invoices]);
    setIsModalOpen(false);
    setClientName("");
    setFeeAmount("");
    setDueDate("");
    setNotes("");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Receipt className="text-blue-600" size={24} /> Billing & Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track client legal retainers, billings, GST, and payment statuses.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Plus size={16} /> Create New Invoice
        </button>
      </div>

      {/* Financial Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Total Billed
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹1,00,300</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Collected Payments
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              ₹70,800
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Pending Receivables
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              ₹29,500
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search invoice number or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <th className="p-4">Invoice No.</th>
                <th className="p-4">Client</th>
                <th className="p-4">Base Fee</th>
                <th className="p-4">GST (18%)</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-bold text-blue-600">
                    {inv.invoiceNo}
                  </td>
                  <td className="p-4 font-semibold text-gray-900">
                    {inv.clientName}
                  </td>
                  <td className="p-4 font-mono">₹{inv.amount.toLocaleString()}</td>
                  <td className="p-4 font-mono text-gray-500">
                    ₹{inv.gstAmount.toLocaleString()}
                  </td>
                  <td className="p-4 font-mono font-bold text-gray-900">
                    ₹{inv.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-500">{inv.dueDate}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        inv.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Generate Invoice
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Base Professional Fee (₹)
                </label>
                <input
                  type="number"
                  required
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-xs font-semibold text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-xs font-semibold text-white rounded-xl hover:bg-blue-700"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}