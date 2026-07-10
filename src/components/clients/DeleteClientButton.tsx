"use client";

import { useRouter } from "next/navigation";

export default function DeleteClientButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = confirm(
      "Delete this client?"
    );

    if (!confirmed) return;

    const res = await fetch(
      `/api/clients/${id}`,
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
      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
    >
      Delete
    </button>
  );
}