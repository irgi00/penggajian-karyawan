"use client";
import { usePathname } from "next/navigation";
import { Bell, Search, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";


export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const pathname = usePathname() || "";
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumb = paths.length > 0
    ? paths.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')).join(' / ')
    : "Dashboard";

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center">
        {/* Mobile toggle button */}
        {onToggleSidebar && (
          <button
            className="mr-4 md:hidden p-2 rounded-md hover:bg-muted"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center text-sm font-medium text-muted-foreground">
          <span>{breadcrumb}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 bg-muted/50 border-none h-9" />
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  );
}
