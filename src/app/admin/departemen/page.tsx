import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter, MoreHorizontal, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { pool } from "@/lib/db";

export default async function DepartemenPage() {
  const result = await pool.query('SELECT * FROM departments ORDER BY id ASC');
  const departments = result.rows;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departemen</h1>
          <p className="text-muted-foreground mt-1">Kelola data departemen perusahaan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" /> Export
          </Button>
          <Link href="/admin/departemen/create" className="inline-block">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Tambah Data
            </Button>
          </Link>
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
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length > 0 ? departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.id}</TableCell>
                  <TableCell>{dept.code || "-"}</TableCell>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell>
                    <Badge variant="success">Aktif</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/departemen/${dept.id}/edit`} className="inline-block">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <EmptyState title="Tidak ada data departemen" description="Saat ini tidak ada departemen yang terdaftar." />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-4 border-t text-sm text-muted-foreground">
            <div>Menampilkan total {departments.length} data</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
