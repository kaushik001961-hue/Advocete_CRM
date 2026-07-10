
"use client";

import { deleteDocument } from "@/actions/deleteDocument";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  id,
}: {
  id: string;
}) {

  const router = useRouter();

  async function remove() {

    const ok = confirm(
      "Delete this document?"
    );

    if (!ok) return;

    await deleteDocument(id);

    router.refresh();
  }

  return (

    <button
      onClick={remove}
      className="text-red-600"
    >
      Delete
    </button>

  );

}
