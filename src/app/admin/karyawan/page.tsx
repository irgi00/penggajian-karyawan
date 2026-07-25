"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileDown, Filter } from "lucide-react";
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
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/employees");
        const json = await res.json();
        if (json.success) {
          setEmployees(json.data.employees);
        } else {
          setErrorMsg(json.message || json.error || "Gagal memuat data karyawan");
        }
      } catch {
        setErrorMsg("Gagal memuat data karyawan");
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    setErrorMsg("");
    try {
      const res = await fetch(`/api/employees/${id}/resign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resign_date: new Date().toISOString().split("T")[0] }),
      });
      if (res.ok) {
        setEmployees((prev) => prev.map((employee) => (employee.id === id ? { ...employee, employment_status: "RESIGNED" } : employee)));
      } else {
        setErrorMsg("Gagal memperbarui status karyawan");
      }
    } catch {
      setErrorMsg("Gagal memperbarui status karyawan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Karyawan</h1>
          <p className="mt-1 text-muted-foreground">Kelola data karyawan dan informasi personal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><FileDown className="h-4 w-4" /> Export</Button>
          <Link href="/admin/karyawan/create" className="inline-block"><Button className="gap-2"><Plus className="h-4 w-4" /> Tambah Data</Button></Link>
        </div>
      </div>

      {errorMsg && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errorMsg}</div>}

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row">
            <FilterBar
              filters={[
                <Input key="search" placeholder="Cari data..." className="flex-1" />,
                <Button key="filter" variant="outline" className="shrink-0"><Filter className="h-4 w-4" /> Filter</Button>,
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
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.employee_code}</TableCell>
                    <TableCell>{employee.full_name}</TableCell>
                    <TableCell>{employee.department_name || "-"}</TableCell>
                    <TableCell>{employee.position_name || "-"}</TableCell>
                    <TableCell><StatusBadge status={employee.employment_status} /></TableCell>
                    <TableCell className="text-right">
                      <ActionDropdown editHref={`/admin/karyawan/${employee.id}/edit`} onDelete={() => { setDeleteId(employee.id); setDeleteOpen(true); }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="p-0"><EmptyState message="Tidak ada data karyawan." /></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pagination totalItems={employees.length} pageSize={10} />

          <div className="flex items-center justify-between border-t px-4 py-4 text-sm text-muted-foreground">
            <div>Menampilkan total {employees.length} data</div>
          </div>
        </CardContent>
      </Card>

      <DeleteDialog open={isDeleteOpen} onOpenChange={setDeleteOpen} onConfirm={() => { if (deleteId !== null) handleDelete(deleteId); }} title="Nonaktifkan Karyawan" description="Apakah Anda yakin ingin menonaktifkan karyawan ini?" />
    </div>
  );
}
