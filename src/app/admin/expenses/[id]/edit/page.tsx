import { prisma } from "@/lib/prisma";
import EditExpenseForm from "./EditExpenseForm";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const expense =
    await prisma.expense.findUnique(
      {
        where: { id },
      }
    );

  if (!expense) {
    return (
      <div>
        Expense not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Edit Expense
      </h1>

      <EditExpenseForm
        expense={expense}
      />
    </div>
  );
}