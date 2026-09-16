"use client";

import { useState } from "react";
import AdvocateCaseSelector from "@/components/cases/AdvocateCaseSelector";
import CaseTimeline from "@/components/cases/CaseTimeline";

export default function AdvocateCaseTimelinePage() {
  const [caseId, setCaseId] = useState("");

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Case Timeline
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and manage the timeline of your assigned cases.
        </p>
      </div>

      <AdvocateCaseSelector
        value={caseId}
        onChange={setCaseId}
      />

      {caseId ? (
        <CaseTimeline caseId={caseId} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">
            Select a case to view its timeline.
          </p>
        </div>
      )}
    </div>
  );
}