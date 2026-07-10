
import ClientForm from "@/components/clients/ClientForm";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createClient(formData: FormData) {
  "use server";

  await prisma.client.create({
    data: {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
    },
  });

  revalidatePath("/admin/clients");
}

export default function NewClientPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Add Client</h1>

      <ClientForm action={createClient} />
    </div>
  );
}
