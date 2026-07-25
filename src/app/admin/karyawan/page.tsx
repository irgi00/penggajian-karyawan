"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, FileDown, Filter } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useState, useEffect } from "react";
import { FilterBar } from "@/components/ui/filter-bar";

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/employees');
        const json = await res.json();
        if (json.success) {
          setEmployees(json.data.employees);
        } else {
          console.error(json.message);
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/employees/${id}/resign`, { method: "PUT", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resign_date: new Date().toISOString().split('T')[0] }) });
      if (res.ok) {
        setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, employment_status: 'RESIGNED' } : e));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Karyawan</h1>
          <p className="text-muted-foreground mt-1">Kelola data karyawan dan informasi personal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" /> Export
          </Button>
          <Link href="/admin/karyawan/create" className="inline-block">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Tambah Data
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4 border-b">
            <FilterBar
              filters={[
                <Input key="search" placeholder="Cari data..." className="flex-1" />, // placeholder, replace with real filters
                <Button key="filter" variant="outline" className="shrink-0">
                  <Filter className="w-4 h-4" /> Filter
                </Button>,
              ]}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIK</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.employee_code}</TableCell>
                    <TableCell>{emp.full_name}</TableCell>
                    <TableCell>{emp.department_name || "-"}</TableCell>
                    <TableCell>{emp.position_name || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={emp.employment_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ActionDropdown
                        editHref={`/admin/karyawan/${emp.id}/edit`}
                        onDelete={() => {
                          setDeleteId(emp.id);
                          setDeleteOpen(true);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState message="Tidak ada data karyawan." />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pagination totalItems={employees.length} pageSize={10} />

          <div className="flex items-center justify-between px-4 py-4 border-t text-sm text-muted-foreground">
            <div>Menampilkan total {employees.length} data</div>
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          if (deleteId !== null) handleDelete(deleteId);
        }}
        title="Hapus Karyawan"
        description="Apakah Anda yakin ingin menghapus karyawan ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
