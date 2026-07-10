import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteExpenseButton from "@/components/expenses/DeleteExpenseButton";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Expenses
        </h1>

        <Link
          href="/admin/expenses/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
        >
          Add Expense
        </Link>
      </div>

      {/* Summary Card */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Total Expenses
          </p>

          <h2 className="text-2xl font-bold text-red-600 mt-2">
            ₹{totalExpenses.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">
                  Title
                </th>

                <th className="p-4 text-left">
                  Category
                </th>

                <th className="p-4 text-center">
                  Amount
                </th>

                <th className="p-4 text-center">
                  Expense Date
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-8 text-gray-500"
                  >
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-4 font-medium">
                      {expense.title}
                    </td>

                    <td className="p-4">
                      {expense.category}
                    </td>

                    <td className="p-4 text-center">
                      ₹{expense.amount}
                    </td>

                    <td className="p-4 text-center">
                      {new Date(
                        expense.expenseDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/admin/expenses/${expense.id}/edit`}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm"
                        >
                          Edit
                        </Link>

                        <DeleteExpenseButton
                          id={expense.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}