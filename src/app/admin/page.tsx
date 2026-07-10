
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardCards from "@/components/dashboard/DashboardCards";
import RecentClients from "./components/RecentClients";
import RecentCases from "./components/RecentCases";
import TodayHearings from "./components/TodayHearings";
import UpcomingHearings from "./components/UpcomingHearings";
import BillingSummary from "./components/BillingSummary";
import Notifications from "./components/Notifications";
import CaseStatusChart from "./components/CaseStatusChart";
import MonthlyHearingsChart from "./components/MonthlyHearingsChart";
import QuickActions from "./components/QuickActions";
import DocumentPreview from "@/components/documents/DocumentPreview";

export default async function AdminPage() {
  const totalClients = await prisma.client.count();

  const totalCases = await prisma.case.count();

  const totalHearings = await prisma.hearing.count();

  const totalAdvocates = await prisma.user.count({
    where: {
      role: "ADVOCATE",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 mt-1">
            Manage your cases, clients and hearings
          </p>
        </div>

       
      </div>

      {/* KPI Cards */}

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
  {/* Clients Box - White with black text and gray border */}
  <Link 
    href="/admin/clients" 
    className="bg-white border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 hover:scale-[1.02] transition-all p-5 rounded-2xl shadow-md text-center block cursor-pointer text-neutral-900"
  >
    <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">Clients</p>
    <p className="text-3xl font-extrabold mt-1 text-black">10</p>
  </Link>

  {/* Cases Box */}
  <Link 
    href="/admin/cases" 
    className="bg-white border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 hover:scale-[1.02] transition-all p-5 rounded-2xl shadow-md text-center block cursor-pointer text-neutral-900"
  >
    <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">Cases</p>
    <p className="text-3xl font-extrabold mt-1 text-black">1</p>
  </Link>

  {/* Hearings Box */}
  <Link 
    href="/admin/hearings" 
    className="bg-white border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 hover:scale-[1.02] transition-all p-5 rounded-2xl shadow-md text-center block cursor-pointer text-neutral-900"
  >
    <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">Hearings</p>
    <p className="text-3xl font-extrabold mt-1 text-black">1</p>
  </Link>

  {/* Advocates Box */}
  <Link 
    href="/admin/advocates" 
    className="bg-white border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 hover:scale-[1.02] transition-all p-5 rounded-2xl shadow-md text-center block cursor-pointer text-neutral-900"
  >
    <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">Advocates</p>
    <p className="text-3xl font-extrabold mt-1 text-black">2</p>
  </Link>
</div>
      {/* Quick Actions */}

      <QuickActions />

 {/* Hearings */}

      <div className="grid lg:grid-cols-2 gap-6">
        <TodayHearings />
        <UpcomingHearings />
      </div>
      
      {/* Recent Clients & Cases */}

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentClients />
        <RecentCases />
      </div>

      {/* Billing & Notifications */}

      <div className="grid lg:grid-cols-2 gap-6">
        <BillingSummary />
        <Notifications />
      </div>

      {/* Charts */}

      <div className="grid lg:grid-cols-2 gap-6">
        <CaseStatusChart />
        <MonthlyHearingsChart />
      </div>

      {/* Documents */}

      <DocumentPreview />
    </div>
  );
}
