"use client";

import { LayoutDashboard, Users, Building, Briefcase, Calendar, Clock, DollarSign, LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Departemen", href: "/admin/departemen", icon: Building },
    { name: "Jabatan", href: "/admin/jabatan", icon: Briefcase },
    { name: "Karyawan", href: "/admin/karyawan", icon: Users },
    { name: "Absensi", href: "/admin/absensi", icon: Calendar },
    { name: "Lembur", href: "/admin/lembur", icon: Clock },
    { name: "Payroll", href: "/admin/payroll", icon: DollarSign },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 flex-shrink-0 border-r bg-card flex flex-col transition-transform duration-200 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:flex"
      )}
    >
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight">SIPKA</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col overflow-y-auto">
        <div className="space-y-1 flex-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
