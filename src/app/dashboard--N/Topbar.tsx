export default function Topbar() {

  return (

    <header className="bg-white h-16 px-8 flex items-center justify-between shadow">

      <h2 className="font-bold text-xl">

        Dashboard

      </h2>

      <div className="flex items-center gap-4">

        <div className="text-right">

          <p className="font-semibold">

            Welcome

          </p>

          <p className="text-sm text-gray-500">

            Administrator

          </p>

        </div>

        <div className="w-10 h-10 rounded-full bg-blue-600"></div>

      </div>

    </header>

  );

}