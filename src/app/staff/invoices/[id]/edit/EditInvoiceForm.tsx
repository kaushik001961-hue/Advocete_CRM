"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Invoice {
  id: string;
  invoiceNo: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
}

interface EditInvoiceFormProps {
  invoice: Invoice;
}

interface InvoiceFormData {
  invoiceNo: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
}

export default function EditInvoiceForm({
  invoice,
}: EditInvoiceFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<InvoiceFormData>({
    invoiceNo: invoice.invoiceNo,
    amount: invoice.amount,
    gstAmount: invoice.gstAmount,
    totalAmount: invoice.totalAmount,
    status: invoice.status,
  });

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const res = await fetch(
      `/api/invoices/${invoice.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      router.push("/staff/invoices");
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-6 space-y-4"
    >
      <div>
        <label className="block mb-2 font-medium">
          Invoice Number
        </label>

        <input
          value={form.invoiceNo}
          onChange={(e) =>
            setForm({
              ...form,
              invoiceNo: e.target.value,
            })
          }
          className="w-full border rounded-lg p-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Amount
        </label>

        <input
          type="number"
          value={form.amount}
          onChange={(e) =>
            setForm({
              ...form,
              amount: Number(e.target.value),
            })
          }
          className="w-full border rounded-lg p-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          GST Amount
        </label>

        <input
          type="number"
          value={form.gstAmount}
          onChange={(e) =>
            setForm({
              ...form,
              gstAmount: Number(e.target.value),
            })
          }
          className="w-full border rounded-lg p-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Total Amount
        </label>

        <input
          type="number"
          value={form.totalAmount}
          onChange={(e) =>
            setForm({
              ...form,
              totalAmount: Number(e.target.value),
            })
          }
          className="w-full border rounded-lg p-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Status
        </label>

        <select
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value,
            })
          }
          className="w-full border rounded-lg p-3"
        >
          <option value="PENDING">
            Pending
          </option>

          <option value="PAID">
            Paid
          </option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Update Invoice
      </button>
    </form>
  );
}