
interface StatCardProps {
  title: string;
  value: number | string;
  color?: string;
}

export default function StatCard({
  title,
  value,
  color = "bg-blue-600",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {value}
          </h2>

        </div>

        <div
          className={`${color} w-14 h-14 rounded-xl`}
        />

      </div>

    </div>
  );
}
