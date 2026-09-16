"use client";

import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
}

export default function NewInvoicePage() {
  const [clients, setClients] = useState<Client[]>([]);

  const [form, setForm] = useState({
    invoiceNo: "",
    clientId: "",
    amount: "",
    includeGst: false,
    gst: "18",
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetch("/api/clients");

        if (!res.ok) {
          throw new Error("Failed to load clients");
        }

        const data = await res.json();
        setClients(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadClients();
  }, []);

  const amount = Number(form.amount || 0);

  const gstAmount = form.includeGst
    ? (amount * Number(form.gst || 0)) / 100
    : 0;

  const totalAmount = amount + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.invoiceNo.trim()) {
      alert("Please enter an invoice number.");
      return;
    }

    if (!form.clientId) {
      alert("Please select a client.");
      return;
    }

    if (!form.amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!form.dueDate) {
      alert("Please select a due date.");
      return;
    }

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNo: form.invoiceNo,
          clientId: form.clientId,
          amount,
          gstAmount,
          totalAmount,
          dueDate: form.dueDate,
          notes: form.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      alert("Invoice created successfully");

      setForm({
        invoiceNo: "",
        clientId: "",
        amount: "",
        includeGst: false,
        gst: "18",
        dueDate: "",
        notes: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error creating invoice");
    }
  };

  return (
    <div className="max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-6">
        Create Invoice
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-4"
      >
        {/* Invoice Number */}
        <input
          type="text"
          placeholder="Invoice Number"
          className="w-full border p-3 rounded"
          value={form.invoiceNo}
          onChange={(e) =>
            setForm({
              ...form,
              invoiceNo: e.target.value,
            })
          }
        />

        {/* Client */}
        <select
          className="w-full border p-3 rounded"
          value={form.clientId}
          onChange={(e) =>
            setForm({
              ...form,
              clientId: e.target.value,
            })
          }
        >
          <option value="">
            Select Client
          </option>

          {clients.map((client) => (
            <option
              key={client.id}
              value={client.id}
            >
              {client.name}
            </option>
          ))}
        </select>

        {/* Amount */}
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          className="w-full border p-3 rounded"
          value={form.amount}
          onChange={(e) =>
            setForm({
              ...form,
              amount: e.target.value,
            })
          }
        />

        {/* =====================================================
            GST CHECKBOX
        ====================================================== */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <input
            id="includeGst"
            type="checkbox"
            checked={form.includeGst}
            onChange={(e) =>
              setForm({
                ...form,
                includeGst: e.target.checked,
              })
            }
            className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />

          <label
            htmlFor="includeGst"
            className="cursor-pointer select-none"
          >
            <span className="font-medium text-gray-900">
              Include GST
            </span>

            <span className="block text-sm text-gray-500">
              Add GST to this invoice
            </span>
          </label>
        </div>

        {/* =====================================================
            GST RATE
        ====================================================== */}
        {form.includeGst && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              GST Rate (%)
            </label>

            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="GST %"
              className="w-full border p-3 rounded"
              value={form.gst}
              onChange={(e) =>
                setForm({
                  ...form,
                  gst: e.target.value,
                })
              }
            />
          </div>
        )}

        {/* Due Date */}
        <input
          type="date"
          className="w-full border p-3 rounded"
          value={form.dueDate}
          onChange={(e) =>
            setForm({
              ...form,
              dueDate: e.target.value,
            })
          }
        />

        {/* Notes */}
        <textarea
          rows={4}
          placeholder="Notes"
          className="w-full border p-3 rounded"
          value={form.notes}
          onChange={(e) =>
            setForm({
              ...form,
              notes: e.target.value,
            })
          }
        />

        {/* =====================================================
            INVOICE CALCULATION
        ====================================================== */}
        <div className="bg-slate-100 rounded-lg p-4">
          <p>
            Amount:
            <strong>
              {" "}
              ₹{amount.toFixed(2)}
            </strong>
          </p>

          <p>
            GST:
            <strong>
              {" "}
              ₹{gstAmount.toFixed(2)}
            </strong>
          </p>

          <p className="text-lg font-bold mt-2">
            Total:
            <span className="text-green-600">
              {" "}
              ₹{totalAmount.toFixed(2)}
            </span>
          </p>
        </div>

        {/* Create Invoice */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
        >
          Create Invoice
        </button>
      </form>
    </div>
  );
}