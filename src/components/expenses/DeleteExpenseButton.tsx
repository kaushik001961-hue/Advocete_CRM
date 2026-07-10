"use client";

import { useRouter } from "next/navigation";

export default function DeleteExpenseButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this expense?")) {
      return;
    }

    const res = await fetch(
      `/api/expenses/${id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1.5 bg-red-600 text-white rounded-md"
    >
      Delete
    </button>
  );
}