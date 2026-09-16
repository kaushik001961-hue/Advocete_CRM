"use client";

import { uploadDocument } from "@/actions/uploadDocument";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

const categories = [
  "Pleading",
  "Petition",
  "Evidence",
  "Court Order",
];

export default function DocumentUploader({
  clients,
  cases,
}: DocumentUploaderProps) {
  const router = useRouter();

  const [uploading, setUploading] = useState(false);

  async function action(formData: FormData) {
    try {
      setUploading(true);

      await uploadDocument(formData);

      router.push("/admin/documents");
      router.refresh();
    } catch (error) {
      console.error("Document upload failed:", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <form
        action={action}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      >
        {/* =====================================================
            DOCUMENT NAME
        ====================================================== */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Document Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter document name"
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* =====================================================
            CATEGORY DROPDOWN
        ====================================================== */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Document Category
          </label>

          <select
            id="category"
            name="category"
            required
            defaultValue=""
            className="w-full cursor-pointer appearance-auto rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>
              Select document category
            </option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* =====================================================
            CLIENT
        ====================================================== */}
        <div>
          <label
            htmlFor="clientId"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Client
          </label>

          <select
            id="clientId"
            name="clientId"
            required
            defaultValue=""
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>
              Select client
            </option>

            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* =====================================================
            CASE
        ====================================================== */}
        <div>
          <label
            htmlFor="caseId"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Case
          </label>

          <select
            id="caseId"
            name="caseId"
            required
            defaultValue=""
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>
              Select case
            </option>

            {cases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.title}
              </option>
            ))}
          </select>
        </div>

        {/* =====================================================
            FILE
        ====================================================== */}
        <div>
          <label
            htmlFor="file"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Document File
          </label>

          <input
            id="file"
            type="file"
            name="file"
            required
            accept=".pdf,.jpg,.jpeg,.png"
            className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:cursor-pointer file:border-0 file:bg-blue-600 file:px-4 file:py-3 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
          />

          <p className="mt-2 text-xs text-gray-500">
            Accepted formats: PDF, JPG, JPEG, PNG
          </p>
        </div>

        {/* =====================================================
            SUBMIT
        ====================================================== */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </form>
    </div>
  );
}