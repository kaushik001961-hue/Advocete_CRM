"use client";

import { useState } from "react";
import StaffSidebar from "@/components/staff/Sidebar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-100">
      {sidebarOpen && <button type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}
      <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen lg:ml-64">
        <div className="lg:hidden sticky top-0 z-30 h-14 bg-slate-950 text-white flex items-center px-4"><button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg px-3 py-2 bg-slate-800">Menu</button><span className="ml-3 font-semibold">Staff Portal</span></div>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8"><div className="mx-auto w-full max-w-[1600px]">{children}</div></main>
      </div>
    </div>
  );
}
