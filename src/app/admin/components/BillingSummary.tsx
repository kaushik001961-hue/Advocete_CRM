
export default function BillingSummary() {

  return (

    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-5">
        Billing Summary
      </h2>

      <div className="space-y-3">

        <div className="flex justify-between">
          <span>Total Revenue</span>
          <span className="font-bold text-green-600">
            ₹ 0
          </span>
        </div>

        <div className="flex justify-between">
          <span>Pending</span>
          <span className="font-bold text-red-600">
            ₹ 0
          </span>
        </div>

        <div className="flex justify-between">
          <span>Paid</span>
          <span className="font-bold text-blue-600">
            ₹ 0
          </span>
        </div>

      </div>

    </div>

  );

}
