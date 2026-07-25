"use client";

import { useState } from "react";
import { KaryawanSidebar } from "@/components/layout/karyawan-sidebar";
import { Header } from "@/components/layout/header";

export default function KaryawanShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen flex bg-muted/20 text-foreground">
      <KaryawanSidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
