"use client";

import { useState } from "react";
import AdvocateCaseSelector from "@/components/cases/AdvocateCaseSelector";
import CaseImportantDates from "@/components/cases/CaseImportantDates";

export default function AdvocateImportantDatesPage() {
  const [caseId, setCaseId] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Important Dates
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage important dates and deadlines for your assigned cases.
        </p>
      </div>

      <AdvocateCaseSelector
        value={caseId}
        onChange={setCaseId}
      />

      {caseId ? (
        <CaseImportantDates caseId={caseId} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">
            Select a case to view important dates.
          </p>
        </div>
      )}
    </div>
  );
}