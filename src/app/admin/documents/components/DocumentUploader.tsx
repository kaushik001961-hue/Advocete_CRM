
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentUploader({
  clients,
  cases,
}: any) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  async function submit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!file) return;

    setLoading(true);

    const formData = new FormData(e.currentTarget);

    formData.append("file", file);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    router.push("/admin/documents");

    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4"
    >
      <input
        name="name"
        placeholder="Document Name"
        className="w-full border p-3 rounded-lg"
      />

      <input
        name="category"
        placeholder="Category"
        className="w-full border p-3 rounded-lg"
      />

      <select
        name="clientId"
        className="w-full border p-3 rounded-lg"
      >
        <option value="">
          Select Client
        </option>

        {clients.map((c: any) => (
          <option
            key={c.id}
            value={c.id}
          >
            {c.name}
          </option>
        ))}
      </select>

      <select
        name="caseId"
        className="w-full border p-3 rounded-lg"
      >
        <option value="">
          Select Case
        </option>

        {cases.map((c: any) => (
          <option
            key={c.id}
            value={c.id}
          >
            {c.title}
          </option>
        ))}
      </select>

      <div
        className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer"
        onDragOver={(e) =>
          e.preventDefault()
        }
        onDrop={(e) => {
          e.preventDefault();

          setFile(
            e.dataTransfer.files[0]
          );
        }}
      >
        {file ? (
          <div>

            {file.name}

          </div>
        ) : (
          <div>

            Drag & Drop File Here

          </div>
        )}
      </div>

      <input
        type="file"
        hidden
        id="upload"
        onChange={(e) =>
          setFile(
            e.target.files?.[0] || null
          )
        }
      />

      <label
        htmlFor="upload"
        className="inline-block bg-gray-200 px-4 py-2 rounded cursor-pointer"
      >
        Browse
      </label>

      <button
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        {loading
          ? "Uploading..."
          : "Upload Document"}
      </button>
    </form>
  );
}