"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditClientForm({
  client,
}: any) {
  const router = useRouter();

  const [form, setForm] =
    useState({
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      address:
        client.address || "",
      city: client.city || "",
      state:
        client.state || "",
      pincode:
        client.pincode || "",
      notes:
        client.notes || "",
    });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch(
      `/api/clients/${client.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      router.push(
        `/admin/clients/${client.id}`
      );

      router.refresh();
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Edit Client
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-4"
      >
        <input
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          className="w-full border p-3 rounded"
          placeholder="Name"
        />

        <input
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value,
            })
          }
          className="w-full border p-3 rounded"
          placeholder="Phone"
        />

        <input
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          className="w-full border p-3 rounded"
          placeholder="Email"
        />

        <input
          value={form.city}
          onChange={(e) =>
            setForm({
              ...form,
              city: e.target.value,
            })
          }
          className="w-full border p-3 rounded"
          placeholder="City"
        />

        <input
          value={form.state}
          onChange={(e) =>
            setForm({
              ...form,
              state: e.target.value,
            })
          }
          className="w-full border p-3 rounded"
          placeholder="State"
        />

        <input
          value={form.pincode}
          onChange={(e) =>
            setForm({
              ...form,
              pincode:
                e.target.value,
            })
          }
          className="w-full border p-3 rounded"
          placeholder="Pincode"
        />

        <textarea
          value={form.notes}
          onChange={(e) =>
            setForm({
              ...form,
              notes: e.target.value,
            })
          }
          rows={4}
          className="w-full border p-3 rounded"
          placeholder="Notes"
        />

        <button
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Update Client
        </button>
      </form>
    </div>
  );
}