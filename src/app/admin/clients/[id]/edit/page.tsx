import { prisma } from "@/lib/prisma";
import EditClientForm from "./EditClientForm";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const client =
    await prisma.client.findUnique({
      where: { id },
    });

  if (!client) {
    return (
      <div>Client not found</div>
    );
  }

  return (
    <EditClientForm
      client={client}
    />
  );
}