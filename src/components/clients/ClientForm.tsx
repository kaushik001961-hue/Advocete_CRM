"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientForm({
  action,
  initialData,
}: {
  action: (formData: FormData) => Promise<void>;
  initialData?: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await action(formData);
    setLoading(false);
    router.push("/admin/clients");
  }

  return (
    <form action={handleSubmit} className="space-y-4">

      <input
        name="name"
        defaultValue={initialData?.name}
        placeholder="Name"
        className="border p-3 w-full rounded"
        required
      />

      <input
        name="phone"
        defaultValue={initialData?.phone}
        placeholder="Phone"
        className="border p-3 w-full rounded"
      />

      <input
        name="email"
        defaultValue={initialData?.email}
        placeholder="Email"
        className="border p-3 w-full rounded"
      />

      <textarea
        name="address"
        defaultValue={initialData?.address}
        placeholder="Address"
        className="border p-3 w-full rounded"
      />

      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Save Client"}
      </button>

    </form>
  );
}
