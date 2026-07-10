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
const gstAmount = (amount * Number(form.gst || 0)) / 100;
const totalAmount = amount + gstAmount;

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();


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
    gst: "18",
    dueDate: "",
    notes: "",
  });
} catch (error) {
  console.error(error);
  alert("Error creating invoice");
}


};

return ( <div className="max-w-3xl p-6"> <h1 className="text-3xl font-bold mb-6">
Create Invoice </h1>


  <form
    onSubmit={handleSubmit}
    className="bg-white rounded-xl shadow p-6 space-y-4"
  >
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

    <input
      type="number"
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

    <input
      type="number"
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

    <div className="bg-slate-100 rounded-lg p-4">
      <p>
        Amount:
        <strong> ₹{amount}</strong>
      </p>

      <p>
        GST:
        <strong> ₹{gstAmount.toFixed(2)}</strong>
      </p>

      <p className="text-lg font-bold mt-2">
        Total:
        <span className="text-green-600">
          {" "}
          ₹{totalAmount.toFixed(2)}
        </span>
      </p>
    </div>

    <button
      type="submit"
      className="bg-blue-600 text-white px-6 py-3 rounded-lg"
    >
      Create Invoice
    </button>
  </form>
</div>

);
}