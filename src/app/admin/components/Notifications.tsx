
export default function Notifications() {

  return (

    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-5">
        Notifications
      </h2>

      <div className="space-y-3">

        <div className="border-l-4 border-blue-600 pl-3">
          New client registered
        </div>

        <div className="border-l-4 border-green-600 pl-3">
          Hearing scheduled
        </div>

        <div className="border-l-4 border-yellow-500 pl-3">
          Billing reminder
        </div>

      </div>

    </div>

  );

}
