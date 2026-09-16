"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
}

interface CaseItem {
  id: string;
  title: string;
}

interface DocumentUploaderProps {
  clients: Client[];
  cases: CaseItem[];
}

export default function DocumentUploader({
  clients,
  cases,
}: DocumentUploaderProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("file", file);

      await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      router.push("/admin/documents");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
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
        <option value="">Select Client</option>

        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      <select
        name="caseId"
        className="w-full border p-3 rounded-lg"
      >
        <option value="">Select Case</option>

        {cases.map((caseItem) => (
          <option key={caseItem.id} value={caseItem.id}>
            {caseItem.title}
          </option>
        ))}
      </select>

      <div
        className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();

          const droppedFile = e.dataTransfer.files[0];

          if (droppedFile) {
            setFile(droppedFile);
          }
        }}
      >
        {file ? (
          <div>{file.name}</div>
        ) : (
          <div>Drag &amp; Drop File Here</div>
        )}
      </div>

      <input
        type="file"
        hidden
        id="upload"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <label
        htmlFor="upload"
        className="inline-block bg-gray-200 px-4 py-2 rounded cursor-pointer"
      >
        Browse
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Document"}
      </button>
    </form>
  );
}