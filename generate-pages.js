const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// Layout components
ensureDir(path.join(__dirname, 'src/components/layout'));
fs.writeFileSync(path.join(__dirname, 'src/components/layout/sidebar.tsx'), `
import Link from "next/link";
import { LayoutDashboard, Users, Building, Briefcase, Calendar, Clock, DollarSign, FileText } from "lucide-react";

export function Sidebar() {
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
    <div className="w-64 flex-shrink-0 border-r bg-card flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight">SIPKA</span>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Icon className="w-4 h-4" />
                  {link.name}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
`);

fs.writeFileSync(path.join(__dirname, 'src/components/layout/header.tsx'), `
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center text-sm text-muted-foreground">
        <span>Admin / Dashboard</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 bg-muted/50 border-none" />
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  )
}
`);

// App Login
ensureDir(path.join(__dirname, 'src/app/login'));
fs.writeFileSync(path.join(__dirname, 'src/app/login/page.tsx'), `
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-2 shadow-sm">
            <span className="text-primary-foreground font-bold text-2xl">S</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">SIPKA</CardTitle>
          <CardDescription>Sistem Informasi Penggajian Karyawan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="Masukkan username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="remember" className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
            <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Remember me
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full h-11 text-base shadow-sm">Login</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
`);

// Admin Layout & Dashboard
ensureDir(path.join(__dirname, 'src/app/admin'));
fs.writeFileSync(path.join(__dirname, 'src/app/admin/layout.tsx'), `
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-muted/20 text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
`);

fs.writeFileSync(path.join(__dirname, 'src/app/admin/page.tsx'), `
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, Briefcase, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Karyawan", value: "1,240", icon: Users, trend: "+12% dari bulan lalu" },
    { title: "Departemen", value: "12", icon: Building, trend: "Tidak ada perubahan" },
    { title: "Jabatan", value: "48", icon: Briefcase, trend: "+2 jabatan baru" },
    { title: "Payroll Bulan Ini", value: "Rp 1.4M", icon: DollarSign, trend: "+4% dari bulan lalu" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Ringkasan statistik sistem informasi penggajian.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart Section Placeholder */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Grafik Payroll</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md border-dashed border">
            <span className="text-muted-foreground text-sm">Payroll Chart Area</span>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Kehadiran</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md border-dashed border">
            <span className="text-muted-foreground text-sm">Attendance Chart Area</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
`);
console.log('Pages generated successfully.');
