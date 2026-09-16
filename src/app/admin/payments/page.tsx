"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  X,
  AlertCircle,
} from "lucide-react";

type Client = {
  id: string;
  name: string;
};

type CaseItem = {
  id: string;
  caseNumber: string;
  title?: string;
};

type Invoice = {
  id: string;
  invoiceNo: string;
  clientId: string;
  caseId?: string | null;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  dueDate: string;
  status: string;
  notes?: string | null;
  client?: Client | null;
  case?: CaseItem | null;
};

type PaymentStatus =
  | "ALL"
  | "PAID"
  | "PENDING"
  | "OVERDUE";

function money(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getStatus(invoice: Invoice): PaymentStatus {
  const status = String(invoice.status || "").toUpperCase();

  if (status === "PAID") {
    return "PAID";
  }

  if (
    status === "OVERDUE" ||
    new Date(invoice.dueDate).getTime() <
      Date.now()
  ) {
    return "OVERDUE";
  }

  return "PENDING";
}

function statusClasses(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "OVERDUE":
      return "bg-red-50 text-red-700 border-red-200";

    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function statusIcon(status: PaymentStatus) {
  if (status === "PAID") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "OVERDUE") {
    return <AlertCircle className="h-4 w-4" />;
  }

  return <Clock3 className="h-4 w-4" />;
}

export default function AdminPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<PaymentStatus>("ALL");

  const [selectedInvoice, setSelectedInvoice] =
    useState<Invoice | null>(null);

  const [showRecordModal, setShowRecordModal] =
    useState(false);

  const [selectedPaymentInvoice, setSelectedPaymentInvoice] =
    useState<Invoice | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [transactionId, setTransactionId] =
    useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPayments = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetch(
          "/api/invoices",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Failed to load payment data."
          );
        }

        setInvoices(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.invoices)
              ? data.invoices
              : []
        );
      } catch (err) {
        console.error(
          "Payment loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load payment data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const statistics = useMemo(() => {
    const paid = invoices.filter(
      (invoice) =>
        getStatus(invoice) === "PAID"
    );

    const pending = invoices.filter(
      (invoice) =>
        getStatus(invoice) === "PENDING"
    );

    const overdue = invoices.filter(
      (invoice) =>
        getStatus(invoice) === "OVERDUE"
    );

    return {
      totalTransactions: paid.length,
      collected: paid.reduce(
        (sum, invoice) =>
          sum + Number(invoice.totalAmount || 0),
        0
      ),
      pending: pending.reduce(
        (sum, invoice) =>
          sum + Number(invoice.totalAmount || 0),
        0
      ),
      overdue: overdue.reduce(
        (sum, invoice) =>
          sum + Number(invoice.totalAmount || 0),
        0
      ),
    };
  }, [invoices]);

  const filteredPayments = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    return invoices.filter((invoice) => {
      const status =
        getStatus(invoice);

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        invoice.invoiceNo,
        invoice.client?.name,
        invoice.case?.caseNumber,
        invoice.case?.title,
        invoice.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [
    invoices,
    search,
    statusFilter,
  ]);

  function openRecordPayment(invoice: Invoice) {
    setSelectedPaymentInvoice(invoice);
    setPaymentMethod("Cash");
    setTransactionId("");
    setError("");
    setSuccess("");
    setShowRecordModal(true);
  }

  function closeRecordModal() {
    if (saving) return;

    setShowRecordModal(false);
    setSelectedPaymentInvoice(null);
    setTransactionId("");
  }

  async function recordPayment() {
    if (!selectedPaymentInvoice) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * Existing ACMS invoice API already supports
       * changing invoice status. We use PAID as the
       * confirmed payment state.
       *
       * paymentMethod and transactionId are currently
       * captured in the UI for payment tracking and can
       * later be persisted when a dedicated Payment table
       * is added.
       */

      const response = await fetch(
        `/api/invoices/${selectedPaymentInvoice.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: "PAID",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to record payment."
        );
      }

      setInvoices((current) =>
        current.map((invoice) =>
          invoice.id ===
          selectedPaymentInvoice.id
            ? {
                ...invoice,
                status: "PAID",
              }
            : invoice
        )
      );

      setShowRecordModal(false);
      setSelectedPaymentInvoice(null);

      setSuccess(
        `Payment recorded successfully for ${selectedPaymentInvoice.invoiceNo}.`
      );

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error(
        "Record payment error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to record payment."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePaymentStatus(
    invoice: Invoice
  ) {
    const currentStatus =
      getStatus(invoice);

    const newStatus =
      currentStatus === "PAID"
        ? "PENDING"
        : "PAID";

    const confirmed =
      window.confirm(
        currentStatus === "PAID"
          ? `Mark ${invoice.invoiceNo} as pending?`
          : `Mark ${invoice.invoiceNo} as paid?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/invoices/${invoice.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to update payment status."
        );
      }

      setInvoices((current) =>
        current.map((item) =>
          item.id === invoice.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      setSuccess(
        newStatus === "PAID"
          ? `${invoice.invoiceNo} marked as paid.`
          : `${invoice.invoiceNo} marked as pending.`
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Payment status error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update payment status."
      );
    }
  }

  function openDetails(invoice: Invoice) {
    setSelectedInvoice(invoice);
  }

  function closeDetails() {
    setSelectedInvoice(null);
  }

  const pendingInvoices = invoices.filter(
    (invoice) =>
      getStatus(invoice) !== "PAID"
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CreditCard className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Payments
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Track client payments, collections and outstanding amounts.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  void loadPayments(true)
                }
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw
                  className={
                    refreshing
                      ? "h-4 w-4 animate-spin"
                      : "h-4 w-4"
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={() => {
                  if (
                    pendingInvoices.length >
                    0
                  ) {
                    openRecordPayment(
                      pendingInvoices[0]
                    );
                  } else {
                    setError(
                      "There are no pending payments."
                    );
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />

                Record Payment
              </button>

            </div>

          </div>

        </section>

        {/* =====================================================
            ALERTS
        ====================================================== */}

        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        )}

        {/* =====================================================
            STATISTICS
        ====================================================== */}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <PaymentStat
            title="Total Collected"
            value={money(
              statistics.collected
            )}
            subtitle={`${statistics.totalTransactions} paid transactions`}
            icon={
              <Wallet className="h-5 w-5" />
            }
            active={
              statusFilter === "PAID"
            }
            onClick={() =>
              setStatusFilter("PAID")
            }
          />

          <PaymentStat
            title="Pending"
            value={money(
              statistics.pending
            )}
            subtitle="Outstanding payments"
            icon={
              <Clock3 className="h-5 w-5" />
            }
            active={
              statusFilter === "PENDING"
            }
            onClick={() =>
              setStatusFilter("PENDING")
            }
          />

          <PaymentStat
            title="Overdue"
            value={money(
              statistics.overdue
            )}
            subtitle="Past due payments"
            icon={
              <AlertCircle className="h-5 w-5" />
            }
            active={
              statusFilter === "OVERDUE"
            }
            onClick={() =>
              setStatusFilter("OVERDUE")
            }
          />

          <PaymentStat
            title="Transactions"
            value={String(
              invoices.length
            )}
            subtitle="All payment records"
            icon={
              <CreditCard className="h-5 w-5" />
            }
            active={
              statusFilter === "ALL"
            }
            onClick={() =>
              setStatusFilter("ALL")
            }
          />

        </section>

        {/* =====================================================
            SEARCH / FILTER
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search invoice, client or case..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div className="flex gap-2 overflow-x-auto">

              {(
                [
                  "ALL",
                  "PAID",
                  "PENDING",
                  "OVERDUE",
                ] as PaymentStatus[]
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      status
                    )
                  }
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    statusFilter ===
                    status
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status === "ALL"
                    ? "All"
                    : status}
                </button>
              ))}

            </div>

          </div>

        </section>

        {/* =====================================================
            PAYMENT TABLE
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">

            <h2 className="font-semibold text-slate-900">
              Payment Transactions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing{" "}
              {
                filteredPayments.length
              }{" "}
              of{" "}
              {invoices.length}{" "}
              payment records
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Invoice
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Client
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Case
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Due Date
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center text-sm text-slate-500"
                    >
                      Loading payment records...
                    </td>
                  </tr>
                ) : filteredPayments.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center"
                    >
                      <CreditCard className="mx-auto h-10 w-10 text-slate-300" />

                      <p className="mt-3 font-semibold text-slate-700">
                        No payment records found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your search or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(
                    (invoice) => {
                      const status =
                        getStatus(
                          invoice
                        );

                      return (
                        <tr
                          key={
                            invoice.id
                          }
                          className="border-t border-slate-100 transition hover:bg-slate-50"
                        >

                          {/* Invoice */}
                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <FileText className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="font-mono text-sm font-bold text-slate-900">
                                  {
                                    invoice.invoiceNo
                                  }
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  Payment record
                                </p>
                              </div>

                            </div>

                          </td>

                          {/* Client */}
                          <td className="px-5 py-4">

                            <p className="text-sm font-semibold text-slate-900">
                              {
                                invoice
                                  .client
                                  ?.name ||
                                "Unknown Client"
                              }
                            </p>

                          </td>

                          {/* Case */}
                          <td className="px-5 py-4">

                            {invoice.case ? (
                              <>
                                <p className="text-sm font-semibold text-blue-600">
                                  {
                                    invoice
                                      .case
                                      .caseNumber
                                  }
                                </p>

                                <p className="mt-0.5 max-w-[200px] truncate text-[11px] text-slate-400">
                                  {
                                    invoice
                                      .case
                                      .title ||
                                    "Linked Case"
                                  }
                                </p>
                              </>
                            ) : (
                              <span className="text-sm text-slate-400">
                                —
                              </span>
                            )}

                          </td>

                          {/* Amount */}
                          <td className="px-5 py-4">

                            <p className="text-sm font-bold text-slate-900">
                              {money(
                                invoice.totalAmount
                              )}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              Fee + GST
                            </p>

                          </td>

                          {/* Due date */}
                          <td className="px-5 py-4 text-sm text-slate-500">
                            {invoice.dueDate
                              ? new Date(
                                  invoice.dueDate
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${statusClasses(
                                status
                              )}`}
                            >
                              {statusIcon(
                                status
                              )}

                              {status}
                            </span>

                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  openDetails(
                                    invoice
                                  )
                                }
                                title="View Payment"
                                className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {status !==
                                "PAID" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openRecordPayment(
                                      invoice
                                    )
                                  }
                                  className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                  Record Payment
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  void togglePaymentStatus(
                                    invoice
                                  )
                                }
                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                  status ===
                                  "PAID"
                                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                }`}
                              >
                                {status ===
                                "PAID"
                                  ? "Mark Pending"
                                  : "Mark Paid"}
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

      {/* =====================================================
          PAYMENT DETAILS MODAL
      ====================================================== */}

      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div
            className="absolute inset-0"
            onClick={closeDetails}
          />

          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between border-b border-slate-200 pb-4">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Payment Details
                  </h2>

                  <p className="mt-1 font-mono text-xs text-blue-600">
                    {
                      selectedInvoice.invoiceNo
                    }
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="mt-5 space-y-4">

              <div className="grid grid-cols-2 gap-3">

                <InfoBox
                  label="Client"
                  value={
                    selectedInvoice
                      .client
                      ?.name ||
                    "Unknown"
                  }
                />

                <InfoBox
                  label="Case"
                  value={
                    selectedInvoice
                      .case
                      ?.caseNumber ||
                    "Not linked"
                  }
                />

                <InfoBox
                  label="Due Date"
                  value={
                    selectedInvoice.dueDate
                      ? new Date(
                          selectedInvoice.dueDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "—"
                  }
                />

                <InfoBox
                  label="Status"
                  value={getStatus(
                    selectedInvoice
                  )}
                />

              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex justify-between text-sm text-slate-600">
                  <span>
                    Professional Fee
                  </span>

                  <span className="font-semibold">
                    {money(
                      selectedInvoice.amount
                    )}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm text-slate-600">
                  <span>GST / Tax</span>

                  <span className="font-semibold">
                    {money(
                      selectedInvoice.gstAmount
                    )}
                  </span>
                </div>

                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">

                  <span>
                    Total Amount
                  </span>

                  <span className="text-blue-600">
                    {money(
                      selectedInvoice.totalAmount
                    )}
                  </span>

                </div>

              </div>

              {selectedInvoice.notes && (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="mb-1 text-xs font-bold uppercase text-slate-400">
                    Notes
                  </p>

                  {selectedInvoice.notes}
                </div>
              )}

            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">

              {getStatus(
                selectedInvoice
              ) !== "PAID" && (
                <button
                  type="button"
                  onClick={() => {
                    closeDetails();
                    openRecordPayment(
                      selectedInvoice
                    );
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Record Payment
                </button>
              )}

              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          RECORD PAYMENT MODAL
      ====================================================== */}

      {showRecordModal &&
        selectedPaymentInvoice && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

            <div
              className="absolute inset-0"
              onClick={closeRecordModal}
            />

            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                    <Wallet className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Record Payment
                    </h2>

                    <p className="mt-0.5 font-mono text-xs text-blue-600">
                      {
                        selectedPaymentInvoice.invoiceNo
                      }
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeRecordModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              <div className="space-y-4 p-5">

                {/* Amount */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <p className="text-xs font-medium text-blue-600">
                    Payment Amount
                  </p>

                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {money(
                      selectedPaymentInvoice.totalAmount
                    )}
                  </p>

                  <p className="mt-1 text-xs text-blue-500">
                    {
                      selectedPaymentInvoice
                        .client?.name ||
                      "Client"
                    }
                  </p>

                </div>

                {/* Payment Method */}
                <div>

                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Payment Method
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Cash">
                      Cash
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Cheque">
                      Cheque
                    </option>

                    <option value="Card">
                      Card
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>

                {/* Transaction ID */}
                <div>

                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Transaction / Reference ID
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    type="text"
                    value={transactionId}
                    onChange={(event) =>
                      setTransactionId(
                        event.target.value
                      )
                    }
                    disabled={saving}
                    placeholder="Enter transaction/reference number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
                  Confirming this form will mark the invoice as{" "}
                  <strong>PAID</strong>.
                </div>

              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">

                <button
                  type="button"
                  onClick={closeRecordModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void recordPayment()
                  }
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : "Confirm Payment"}
                </button>

              </div>

            </div>

          </div>
        )}
    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function PaymentStat({
  title,
  value,
  subtitle,
  icon,
  active,
  onClick,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-blue-500 ring-2 ring-blue-100"
          : "border-slate-200"
      }`}
    >

      <div className="flex items-center justify-between">

        <span className="text-xs font-medium text-slate-500">
          {title}
        </span>

        <span
          className={
            active
              ? "text-blue-600"
              : "text-slate-400"
          }
        >
          {icon}
        </span>

      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {subtitle}
      </p>

    </button>
  );
}

/* ============================================================
   INFO BOX
============================================================ */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}