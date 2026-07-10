import { prisma } from "@/lib/prisma";

export default async function MonthlyHearingsChart() {
  // 1. Fetch data from Prisma
  const hearings = await prisma.hearing.findMany({
    select: {
      date: true,
    },
  });

  // 2. Initialize an array for all 12 months with a count of 0
  const monthsData = [
    { name: "Jan", count: 0 },
    { name: "Feb", count: 0 },
    { name: "Mar", count: 0 },
    { name: "Apr", count: 0 },
    { name: "May", count: 0 },
    { name: "Jun", count: 0 },
    { name: "Jul", count: 0 },
    { name: "Aug", count: 0 },
    { name: "Sep", count: 0 },
    { name: "Oct", count: 0 },
    { name: "Nov", count: 0 },
    { name: "Dec", count: 0 },
  ];

  // 3. Populate counts from DB records
  hearings.forEach((hearing) => {
    if (hearing.date) {
      const monthIndex = new Date(hearing.date).getMonth();
      monthsData[monthIndex].count += 1;
    }
  });

  // Find max count to set proportional progress bar widths dynamically
  const maxCount = Math.max(...monthsData.map((m) => m.count), 1);

  return (
    /* ✨ FIXED: Changed max-w-md to w-full so it completely fills its grid column slot */
    <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm w-full">
      <h3 className="font-bold text-lg text-neutral-900 mb-4">
        Monthly Hearings
      </h3>

      {/* Internal scroll logic remains completely untouched */}
      <div className="max-h-[190px] overflow-y-auto pr-2 space-y-4 custom-scrollbar w-full">
        {monthsData.map((month) => {
          const percentage = (month.count / maxCount) * 100;

          return (
            <div key={month.name} className="space-y-1 w-full">
              <div className="flex justify-between text-sm font-medium text-neutral-700 w-full">
                <span>{month.name}</span>
                <span className="text-neutral-900">{month.count}</span>
              </div>
              
              {/* Progress Bar Track */}
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}