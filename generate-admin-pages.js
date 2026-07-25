const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// Master Data pages
const pages = [
  { name: 'departemen', title: 'Departemen', desc: 'Kelola data departemen perusahaan' },
  { name: 'jabatan', title: 'Jabatan', desc: 'Kelola data jabatan dan golongan' },
  { name: 'karyawan', title: 'Karyawan', desc: 'Kelola data karyawan dan informasi personal' },
  { name: 'absensi', title: 'Absensi', desc: 'Kelola data absensi harian karyawan' },
  { name: 'lembur', title: 'Lembur', desc: 'Kelola data lembur karyawan' },
  { name: 'payroll', title: 'Payroll', desc: 'Simulasi dan proses penggajian karyawan' },
];

for (const p of pages) {
  const dir = path.join(__dirname, 'src/app/admin', p.name);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'page.tsx'), `
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter, MoreHorizontal, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ${p.title}Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">${p.title}</h1>
          <p className="text-muted-foreground mt-1">${p.desc}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" /> Export
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Tambah Data
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4 border-b">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari data..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2 shrink-0">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">#00{i}</TableCell>
                  <TableCell>Data Sample {i}</TableCell>
                  <TableCell>
                    <Badge variant="success">Aktif</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-4 border-t text-sm text-muted-foreground">
            <div>Menampilkan 1-5 dari 100 data</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
`);
}

console.log('Admin pages generated.');
