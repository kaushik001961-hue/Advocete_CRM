
"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";

export default function HearingCalendar({
  hearings,
}: {
  hearings: any[];
}) {
  const router = useRouter();

  const events = hearings.map((hearing: any) => ({
    id: hearing.id,
    title: hearing.case.title,
    start: hearing.date,

    color:
      hearing.status === "COMPLETED"
        ? "#16a34a"
        : hearing.status === "ADJOURNED"
        ? "#f59e0b"
        : "#2563eb",
  }));

  return (
    <FullCalendar
      plugins={[
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
      ]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right:
          "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      events={events}
      eventClick={(info) => {
        router.push(
          `/admin/hearings/${info.event.id}`
        );
      }}
      height="80vh"
    />
  );
}