
"use client";

import { uploadDocument } from "@/actions/uploadDocument";
import { useRouter } from "next/navigation";

export default function DocumentUploader({
  clients,
  cases,
}: any) {

  const router = useRouter();

  async function action(formData: FormData) {

    await uploadDocument(formData);

    router.push("/admin/documents");

    router.refresh();
  }

  return (

    <form
      action={action}
      className="space-y-4"
    >

      <input
        name="name"
        placeholder="Document Name"
        required
        className="w-full border rounded-lg p-3"
      />

      <input
        name="category"
        placeholder="Category"
        className="w-full border rounded-lg p-3"
      />

      <select
        name="clientId"
        className="w-full border rounded-lg p-3"
      >
        <option value="">Select Client</option>

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
        className="w-full border rounded-lg p-3"
      >
        <option value="">Select Case</option>

        {cases.map((c: any) => (

          <option
            key={c.id}
            value={c.id}
          >
            {c.title}
          </option>

        ))}

      </select>

      <input
        type="file"
        name="file"
        required
        className="w-full border rounded-lg p-3"
      />

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Upload Document
      </button>

    </form>

  );

}
