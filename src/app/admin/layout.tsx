"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* =====================================================
          MAIN APPLICATION AREA

          IMPORTANT:
          Sidebar is fixed and width = w-64.
          Therefore desktop content needs lg:ml-64.
      ====================================================== */}
      <div className="min-h-screen min-w-0 lg:ml-64">
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Page Content */}
        <main className="min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px] min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}