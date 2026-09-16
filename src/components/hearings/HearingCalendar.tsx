"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { HearingRecord } from "./HearingForm";

type Props = { hearings: HearingRecord[]; onSelect: (hearing: HearingRecord) => void };

function keyForDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HearingCalendar({ hearings, onSelect }: Props) {
  const [month, setMonth] = useState(() => new Date());

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [month]);

  const grouped = useMemo(() => {
    const map = new Map<string, HearingRecord[]>();
    hearings.forEach((hearing) => {
      const key = keyForDate(new Date(hearing.date));
      const current = map.get(key) || [];
      current.push(hearing);
      map.set(key, current);
    });
    return map;
  }, [hearings]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={17} className="text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900">Court Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"><ChevronLeft size={14} /></button>
          <p className="min-w-36 text-center text-xs font-bold text-gray-800">{month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"><ChevronRight size={14} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-gray-200">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => (
          <div key={day} className="border-b border-r border-gray-200 bg-gray-50 p-2 text-center text-[10px] font-bold text-gray-400">{day}</div>
        ))}
        {days.map((day) => {
          const key = keyForDate(day);
          const items = grouped.get(key) || [];
          const inMonth = day.getMonth() === month.getMonth();
          return (
            <div key={key} className={`min-h-24 border-b border-r border-gray-200 p-1.5 ${inMonth ? 'bg-white' : 'bg-gray-50/70'}`}>
              <div className={`mb-1 text-[10px] font-semibold ${inMonth ? 'text-gray-700' : 'text-gray-300'}`}>{day.getDate()}</div>
              <div className="space-y-1">
                {items.slice(0, 3).map((hearing) => (
                  <button key={hearing.id} onClick={() => onSelect(hearing)} className="block w-full truncate rounded-md bg-blue-50 px-1.5 py-1 text-left text-[9px] font-semibold text-blue-700 hover:bg-blue-100">
                    {hearing.case?.caseNumber || 'Case'}
                  </button>
                ))}
                {items.length > 3 && <p className="px-1 text-[9px] text-gray-400">+{items.length - 3} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
