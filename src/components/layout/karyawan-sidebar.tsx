"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, FileText, LogOut, User } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/karyawan") return pathname === "/karyawan";
  return pathname.startsWith(href);
}

export function KaryawanSidebar({ isOpen }: { isOpen?: boolean }) {
  const pathname = usePathname();

  const karyawanLinks = [
    { name: "Dashboard", href: "/karyawan", icon: LayoutDashboard },
    { name: "Profil Saya", href: "/karyawan/profile", icon: User },
    { name: "Absensi Saya", href: "/karyawan/absensi", icon: Calendar },
    { name: "Slip Gaji", href: "/karyawan/slip-gaji", icon: FileText },
  ];

  return (
    <div className={cn(
      "w-64 flex-shrink-0 border-r bg-card flex flex-col fixed md:relative z-20 h-full transition-transform",
      !isOpen ? "-translate-x-full md:translate-x-0 hidden md:flex" : "translate-x-0 flex"
    )}>
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight">SIPKA ESS</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col overflow-y-auto">
        <div className="space-y-1 flex-1">
          {karyawanLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(pathname, link.href);
            return (
              <Link key={link.href} href={link.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}>
                  <Icon className="w-4 h-4" />
                  {link.name}
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
