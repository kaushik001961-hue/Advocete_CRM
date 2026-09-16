"use client";

import { useState } from "react";
import AdvocateCaseSelector from "@/components/cases/AdvocateCaseSelector";
import CaseNotes from "@/components/cases/CaseNotes";

export default function AdvocateCaseNotesPage() {
  const [caseId, setCaseId] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Case Notes
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Add, edit and manage notes for your assigned cases.
        </p>
      </div>

      <AdvocateCaseSelector
        value={caseId}
        onChange={setCaseId}
      />

      {caseId ? (
        <CaseNotes caseId={caseId} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">
            Select a case to view case notes.
          </p>
        </div>
      )}
    </div>
  );
}