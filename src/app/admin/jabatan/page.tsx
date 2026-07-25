import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter, MoreHorizontal, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { pool } from "@/lib/db";

export default async function JabatanPage() {
  const result = await pool.query('SELECT * FROM positions ORDER BY id ASC');
  const positions = result.rows;

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jabatan</h1>
          <p className="text-muted-foreground mt-1">Kelola data jabatan dan golongan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" /> Export
          </Button>
          <Link href="/admin/jabatan/create" className="inline-block">
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
                <TableHead>Nama Jabatan</TableHead>
                <TableHead>Gaji Pokok</TableHead>
                <TableHead>Tunjangan Jabatan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.length > 0 ? positions.map((pos) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-medium">{pos.id}</TableCell>
                  <TableCell>{pos.code || "-"}</TableCell>
                  <TableCell>{pos.name}</TableCell>
                  <TableCell>{formatRupiah(pos.basic_salary)}</TableCell>
                  <TableCell>{formatRupiah(pos.position_allowance)}</TableCell>
                   <TableCell className="text-right">
                    <Link href={`/admin/jabatan/${pos.id}/edit`} className="inline-block">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState title="Tidak ada data jabatan" description="Saat ini tidak ada jabatan yang terdaftar." />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-4 border-t text-sm text-muted-foreground">
            <div>Menampilkan total {positions.length} data</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
