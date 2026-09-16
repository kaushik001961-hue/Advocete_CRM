
import { prisma } from "@/lib/prisma";
import CaseForm from "@/components/cases/CaseForm";

export default async function NewCasePage() {

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

  return (
    <div className="max-w-3xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Create New Case
      </h1>

      <div className="bg-white rounded-xl shadow p-8">

        <CaseForm
          clients={clients}
          advocates={advocates}
        />

      </div>

    </div>
  );
}
