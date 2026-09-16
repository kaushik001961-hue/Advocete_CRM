
import { prisma } from "@/lib/prisma";
import DocumentUploader from "@/components/documents/DocumentUploader";

export default async function NewDocumentPage() {

  const clients = await prisma.client.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const cases = await prisma.case.findMany({
    orderBy: {
      title: "asc",
    },
  });

  return (

    <div className="space-y-6">

      <h1 className="text-3xl font-bold">

        Upload Document

      </h1>

      <DocumentUploader
        clients={clients}
        cases={cases}
      />

    </div>

  );
}
