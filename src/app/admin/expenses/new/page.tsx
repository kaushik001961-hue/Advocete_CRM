"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewExpensePage() {
  const router = useRouter();

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      amount: "",
      category: "",
      expenseDate: "",
    });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch(
      "/api/expenses",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      router.push(
        "/admin/expenses"
      );
      router.refresh();
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Add Expense
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >
        <input
          placeholder="Title"
          className="w-full border p-3 rounded"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Category"
          className="w-full border p-3 rounded"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category:
                e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Amount"
          className="w-full border p-3 rounded"
          value={form.amount}
          onChange={(e) =>
            setForm({
              ...form,
              amount:
                e.target.value,
            })
          }
        />

        <input
          type="date"
          className="w-full border p-3 rounded"
          value={
            form.expenseDate
          }
          onChange={(e) =>
            setForm({
              ...form,
              expenseDate:
                e.target.value,
            })
          }
        />

        <textarea
          placeholder="Description"
          rows={4}
          className="w-full border p-3 rounded"
          value={
            form.description
          }
          onChange={(e) =>
            setForm({
              ...form,
              description:
                e.target.value,
            })
          }
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Save Expense
        </button>
      </form>
    </div>
  );
}