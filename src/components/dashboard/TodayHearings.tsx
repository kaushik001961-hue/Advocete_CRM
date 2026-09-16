export default function TodayHearings() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold text-lg">
        Today&apos;s Hearings
      </h2>

      <ul className="mt-5 space-y-4">
        <li>10:00 AM - Civil Court</li>
        <li>12:30 PM - Family Court</li>
        <li>03:00 PM - High Court</li>
      </ul>
    </div>
  );
}