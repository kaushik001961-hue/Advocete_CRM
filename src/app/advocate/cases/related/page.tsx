"use client";

import { useState } from "react";
import AdvocateCaseSelector from "@/components/cases/AdvocateCaseSelector";
import RelatedCases from "@/components/cases/RelatedCases";

export default function AdvocateRelatedCasesPage() {
  const [caseId, setCaseId] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Related Cases
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage cases related to your assigned cases.
        </p>
      </div>

      <AdvocateCaseSelector
        value={caseId}
        onChange={setCaseId}
      />

      {caseId ? (
        <RelatedCases caseId={caseId} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">
            Select a case to view related cases.
          </p>
        </div>
      )}
    </div>
  );
}