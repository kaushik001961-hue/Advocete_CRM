"use client";

import { createCase, updateCase } from "@/actions/case";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
}

interface Advocate {
  id: string;
  name: string;
}

interface CaseData {
  id: string;
  caseNumber?: string | null;
  title?: string | null;
  court?: string | null;
  status?: string | null;
  clientId?: string | null;
  advocateId?: string | null;
}

interface CaseFormProps {
  clients: Client[];
  advocates: Advocate[];
  caseData?: CaseData;
}

export default function CaseForm({
  clients,
  advocates,
  caseData,
}: CaseFormProps) {
  const router = useRouter();

  async function action(formData: FormData) {
    if (caseData) {
      formData.append("id", caseData.id);
      await updateCase(formData);
    } else {
      await createCase(formData);
    }

    router.push("/admin/cases");
    router.refresh();
  }

  return (
    <form action={action} className="space-y-4">
      {/* Case Number */}
      <input
        name="caseNumber"
        placeholder="Case Number"
        required
        defaultValue={caseData?.caseNumber ?? ""}
        className="w-full border rounded-lg p-3"
      />

      {/* Case Title */}
      <input
        name="title"
        placeholder="Case Title"
        required
        defaultValue={caseData?.title ?? ""}
        className="w-full border rounded-lg p-3"
      />

      {/* Court Name */}
      <input
        name="court"
        placeholder="Court Name"
        required
        defaultValue={caseData?.court ?? ""}
        className="w-full border rounded-lg p-3"
      />

      {/* Status */}
      <select
        name="status"
        defaultValue={caseData?.status ?? "ACTIVE"}
        className="w-full border rounded-lg p-3"
      >
        <option value="ACTIVE">ACTIVE</option>
        <option value="PENDING">PENDING</option>
        <option value="ON_HOLD">ON HOLD</option>
        <option value="CLOSED">CLOSED</option>
      </select>

      {/* Client */}
      <select
        name="clientId"
        defaultValue={caseData?.clientId ?? ""}
        required
        className="w-full border rounded-lg p-3"
      >
        <option value="">Select Client</option>

        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      {/* Advocate */}
      <select
        name="advocateId"
        defaultValue={caseData?.advocateId ?? ""}
        required
        className="w-full border rounded-lg p-3"
      >
        <option value="">Select Advocate</option>

        {advocates.map((advocate) => (
          <option key={advocate.id} value={advocate.id}>
            {advocate.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
      >
        {caseData ? "Update Case" : "Create Case"}
      </button>
    </form>
  );
}