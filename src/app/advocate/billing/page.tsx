"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  PlusCircle,
  Search,
  X,
  FileText,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface CaseItem {
  id: string;
  caseNumber: string;
}

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  clientId: string;
  caseId?: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  dueDate: string;
  status: string;
  client?: Client;
  notes?: string;
}

export default function AdvocateBillingPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceItem | null>(null);

  // Form states
  const [clientId, setClientId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [amount, setAmount] = useState("");
  const [gstAmount, setGstAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [invoiceRes, clientRes, caseRes] = await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/clients"),
          fetch("/api/cases"),
        ]);

        const invoiceData: unknown = await invoiceRes.json();
        const clientData: unknown = await clientRes.json();
        const caseData: unknown = await caseRes.json();

        if (invoiceRes.ok && Array.isArray(invoiceData)) {
          setInvoices(invoiceData as InvoiceItem[]);
        }

        if (clientRes.ok && Array.isArray(clientData)) {
          const typedClients = clientData as Client[];
          setClients(typedClients);

          if (typedClients.length > 0) {
            setClientId(typedClients[0].id);
          }
        }

        if (caseRes.ok && Array.isArray(caseData)) {
          setCases(caseData as CaseItem[]);
        } else {
          setCases([
            { id: "case_1", caseNumber: "CS/402/2025" },
            { id: "case_2", caseNumber: "CRL/118/2026" },
          ]);
        }
      } catch (err) {
        console.error("Failed to load billing data", err);

        setCases([
          { id: "case_1", caseNumber: "CS/402/2025" },
          { id: "case_2", caseNumber: "CRL/118/2026" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshInvoices = async () => {
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
      console.error("Failed to refresh invoices", err);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !dueDate || !clientId) return;

    const baseAmount = parseFloat(amount);
    const gst = parseFloat(gstAmount || "0");
    const total = baseAmount + gst;

    if (Number.isNaN(baseAmount) || Number.isNaN(gst)) {
      return;
    }

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          caseId: caseId || null,
          amount: baseAmount,
          gstAmount: gst,
          totalAmount: total,
          dueDate,
          notes,
        }),
      });

      if (res.ok) {
        await refreshInvoices();

        setIsCreateModalOpen(false);
        setAmount("");
        setGstAmount("");
        setDueDate("");
        setNotes("");
        setCaseId("");
      }
    } catch (err) {
      console.error("Failed to create invoice", err);
    }
  };

  const toggleInvoiceStatus = async (
    id: string,
    currentStatus: string
  ) => {
    const newStatus =
      currentStatus.toUpperCase() === "PAID" ? "PENDING" : "PAID";

    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await refreshInvoices();

        if (selectedInvoice && selectedInvoice.id === id) {
          setSelectedInvoice({
            ...selectedInvoice,
            status: newStatus,
          });
        }
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDownloadPDF = () => {
    const printContent = document.getElementById(
      "invoice-statement-modal"
    )?.innerHTML;

    const originalContent = document.body.innerHTML;

    if (printContent) {
      document.body.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2563eb; margin-bottom: 5px;">
            Legal CRM - Invoice Statement
          </h2>
          <hr style="border: 1px solid #e2e8f0; margin-bottom: 20px;" />
          ${printContent}
        </div>
      `;

      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const clientName = inv.client?.name || "";

    const matchesSearch =
      inv.invoiceNo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      clientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      inv.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard size={20} />
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Invoicing & Retainer Billing
            </h1>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Manage client fees, track case linkages, and toggle payment
            statuses.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
        >
          <PlusCircle size={16} />
          Create Invoice
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-2.5 text-gray-400"
            size={16}
          />

          <input
            type="text"
            placeholder="Search by invoice number or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["All", "PENDING", "PAID", "OVERDUE"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap uppercase ${
                statusFilter === status
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400"
                  >
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400"
                  >
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/80 transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {inv.invoiceNo}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {inv.client?.name || "Unknown Client"}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      ₹{inv.totalAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inv.status.toUpperCase() === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : inv.status.toUpperCase() === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() =>
                          toggleInvoiceStatus(inv.id, inv.status)
                        }
                        title="Toggle Status"
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          inv.status.toUpperCase() === "PAID"
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        }`}
                      >
                        {inv.status.toUpperCase() === "PAID"
                          ? "Mark Pending"
                          : "Mark Paid"}
                      </button>

                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div
            id="invoice-statement-modal"
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Invoice Statement
                  </h2>

                  <p className="text-[11px] font-mono text-blue-600">
                    {selectedInvoice.invoiceNo}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Client Name
                  </span>

                  <p className="font-bold text-gray-900 mt-0.5">
                    {selectedInvoice.client?.name || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Due Date
                  </span>

                  <p className="font-medium text-gray-800 mt-0.5">
                    {new Date(
                      selectedInvoice.dueDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Professional Legal Services</span>
                  <span className="font-semibold">
                    ₹{selectedInvoice.amount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>GST / Tax</span>
                  <span className="font-semibold">
                    ₹{selectedInvoice.gstAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-gray-900 font-bold border-t pt-2 text-sm">
                  <span>Total Payable</span>

                  <span className="text-blue-600">
                    ₹
                    {selectedInvoice.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {selectedInvoice.notes && (
                  <p className="text-gray-500 italic mt-2">
                    Notes: {selectedInvoice.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-xs cursor-pointer"
              >
                Download PDF
              </button>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                Generate New Invoice
              </h2>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreateInvoice}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Select Client
                </label>

                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Link Case (Optional)
                </label>

                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- No Case Linked --</option>

                  {cases.map((cs) => (
                    <option key={cs.id} value={cs.id}>
                      {cs.caseNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Fee Amount (₹)
                  </label>

                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    GST Amount (₹)
                  </label>

                  <input
                    type="number"
                    placeholder="e.g. 4500"
                    value={gstAmount}
                    onChange={(e) => setGstAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Payment Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Notes / Description (Optional)
                </label>

                <textarea
                  placeholder="Additional payment terms or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm"
                >
                  Save & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}