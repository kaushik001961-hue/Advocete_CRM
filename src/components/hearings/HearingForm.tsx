
"use client";

import { createHearing, updateHearing } from "@/actions/hearing";
import { useRouter } from "next/navigation";

interface Props {
  cases: any[];
  hearing?: any;
}

export default function HearingForm({
  cases,
  hearing,
}: Props) {

  const router = useRouter();

  async function action(formData: FormData) {

    if (hearing) {
      formData.append("id", hearing.id);
      await updateHearing(formData);
    } else {
      await createHearing(formData);
    }

    router.push("/admin/hearings");
    router.refresh();
  }

  return (

    <form action={action} className="space-y-5">

      <input
        type="datetime-local"
        name="date"
        required
        defaultValue={
          hearing?.date
            ? new Date(hearing.date)
                .toISOString()
                .slice(0, 16)
            : ""
        }
        className="w-full border rounded-lg p-3"
      />

      <select
        name="status"
        defaultValue={hearing?.status ?? "SCHEDULED"}
        className="w-full border rounded-lg p-3"
      >
        <option value="SCHEDULED">
          Scheduled
        </option>

        <option value="COMPLETED">
          Completed
        </option>

        <option value="ADJOURNED">
          Adjourned
        </option>
      </select>

      <textarea
        name="remarks"
        placeholder="Remarks"
        defaultValue={hearing?.remarks}
        className="w-full border rounded-lg p-3"
      />

      <input
        type="datetime-local"
        name="nextDate"
        defaultValue={
          hearing?.nextDate
            ? new Date(hearing.nextDate)
                .toISOString()
                .slice(0, 16)
            : ""
        }
        className="w-full border rounded-lg p-3"
      />

      <select
        name="caseId"
        required
        defaultValue={hearing?.caseId ?? ""}
        className="w-full border rounded-lg p-3"
      >

        <option value="">
          Select Case
        </option>

        {cases.map((c) => (

          <option
            key={c.id}
            value={c.id}
          >
            {c.title}
          </option>

        ))}

      </select>

      <button
        className="bg-blue-600 text-white px-5 py-3 rounded-lg"
      >
        {hearing ? "Update Hearing" : "Create Hearing"}
      </button>

    </form>

  );
}
