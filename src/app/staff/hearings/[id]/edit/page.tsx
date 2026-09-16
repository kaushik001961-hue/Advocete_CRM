import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import HearingForm from "@/components/hearings/HearingForm";

export default async function EditHearing({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const hearing = await prisma.hearing.findUnique({
    where: {
      id,
    },
  });

  if (!hearing) {
    notFound();
  }

  const cases = await prisma.case.findMany({
    orderBy: {
      title: "asc",
    },
  });

  /*
   * Prisma returns Date objects for date fields.
   * HearingForm expects date values as strings.
   *
   * Convert the dates before passing the hearing
   * to the client component.
   */
  const hearingForForm = {
    id: hearing.id,

    createdAt: hearing.createdAt,

    status: hearing.status,

    courtRoom: hearing.courtRoom,

    caseId: hearing.caseId,

    date: hearing.date.toISOString(),

    remarks: hearing.remarks,

    nextDate: hearing.nextDate
      ? hearing.nextDate.toISOString()
      : null,

    hearingType: hearing.hearingType,

    orderPassed: hearing.orderPassed,
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Edit Hearing
      </h1>

      <div className="rounded-xl bg-white p-8 shadow dark:bg-gray-900">
        <HearingForm
          hearing={hearingForForm}
          cases={cases}
          onSaved={() => {
            // HearingForm handles the update.
            // The page will refresh/navigate after save
            // through the form's existing behavior.
          }}
          onClose={() => {
            // Closing the form is handled by the existing
            // HearingForm behavior.
          }}
        />
      </div>
    </div>
  );
}