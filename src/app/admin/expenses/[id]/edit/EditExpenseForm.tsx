"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Expense {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  category: string;
  expenseDate: string | Date;
}

interface EditExpenseFormProps {
  expense: Expense;
}

interface ExpenseFormData {
  title: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
}

export default function EditExpenseForm({
  expense,
}: EditExpenseFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<ExpenseFormData>({
    title: expense.title,
    description: expense.description || "",
    amount: expense.amount,
    category: expense.category,
    expenseDate: new Date(expense.expenseDate)
      .toISOString()
      .split("T")[0],
  });

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const res = await fetch(
      `/api/expenses/${expense.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      router.push("/admin/expenses");
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >
      <input
        className="w-full border p-3 rounded"
        value={form.title}
        onChange={(e) =>
          setForm({
            ...form,
            title: e.target.value,
          })
        }
      />

      <input
        className="w-full border p-3 rounded"
        value={form.category}
        onChange={(e) =>
          setForm({
            ...form,
            category: e.target.value,
          })
        }
      />

      <input
        type="number"
        className="w-full border p-3 rounded"
        value={form.amount}
        onChange={(e) =>
          setForm({
            ...form,
            amount: Number(e.target.value),
          })
        }
      />

      <input
        type="date"
        className="w-full border p-3 rounded"
        value={form.expenseDate}
        onChange={(e) =>
          setForm({
            ...form,
            expenseDate: e.target.value,
          })
        }
      />

      <textarea
        rows={4}
        className="w-full border p-3 rounded"
        value={form.description}
        onChange={(e) =>
          setForm({
            ...form,
            description: e.target.value,
          })
        }
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Update Expense
      </button>
    </form>
  );
}