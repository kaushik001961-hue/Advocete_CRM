"use client";

import { useState } from "react";
import AdvocateCaseSelector from "@/components/cases/AdvocateCaseSelector";
import CaseDocuments from "@/components/cases/CaseDocuments";

export default function AdvocateEvidencePage() {
  const [caseId, setCaseId] = useState("");

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Evidence
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View, upload and manage evidence documents associated with your assigned cases.
        </p>
      </div>

      {/* CASE SELECTOR */}
      <AdvocateCaseSelector
        value={caseId}
        onChange={setCaseId}
      />

      {/* CASE EVIDENCE */}
      {caseId ? (
        <CaseDocuments
          key={caseId}
          caseId={caseId}
          evidenceOnly={true}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-medium text-slate-700">
              Select a case to view evidence.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Only cases assigned to your advocate account are available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}