
import { prisma } from "@/lib/prisma";
import CaseForm from "@/components/cases/CaseForm";

export default async function EditCase({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const caseItem = await prisma.case.findUnique({

    where: {
      id,
    },

  });

  const clients = await prisma.client.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const advocates = await prisma.user.findMany({

    where: {
      role: "ADVOCATE",
    },

    orderBy: {
      name: "asc",
    },

  });

  if (!caseItem) {
    return <div>Case not found</div>;
  }

  return (

    <div className="max-w-3xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Edit Case
      </h1>

      <div className="bg-white rounded-xl shadow p-8">

        <CaseForm
          clients={clients}
          advocates={advocates}
          caseData={caseItem}
        />

      </div>

    </div>

  );

}
