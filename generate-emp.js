const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

ensureDir(path.join(__dirname, 'src/app/employee'));
fs.writeFileSync(path.join(__dirname, 'src/app/employee/layout.tsx'), `
import { Header } from "@/components/layout/header";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-muted/20 text-foreground">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl tracking-tight">ESS</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer">
              <span className="text-primary text-sm font-medium">ME</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
`);

fs.writeFileSync(path.join(__dirname, 'src/app/employee/page.tsx'), `
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, FileText, Calendar, DollarSign } from "lucide-react";

export default function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Self Service</h1>
        <p className="text-muted-foreground mt-1">Selamat datang di portal karyawan.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profil Saya</CardTitle>
            <User className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">John Doe</div>
            <p className="text-xs text-muted-foreground mt-1">IT Department</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sisa Cuti</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">12 Hari</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Slip Gaji Terakhir</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Juli 2026</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
`);
console.log('Employee pages generated.');
