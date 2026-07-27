"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Plus, Filter, MoreHorizontal, FileDown, Trash2 } from "lucide-react";
import { MasterDataDialog } from "@/components/admin/master-data/master-data-dialog";
import { PositionForm, PositionFormValues } from "@/components/admin/master-data/position-form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";

interface PositionRecord {
  id: string;
  department_id: string;
  department_name: string;
  code: string | null;
  name: string;
  basic_salary: number;
  position_allowance: number;
}

interface DepartmentOption {
  id: string;
  name: string;
}

interface JabatanPageClientProps {
  positions: PositionRecord[];
  departments: DepartmentOption[];
  errorMsg?: string;
}

export function JabatanPageClient({ positions, departments, errorMsg = "" }: JabatanPageClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedPosition, setSelectedPosition] = useState<PositionRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PositionRecord | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  const openCreateDialog = () => {
    setSelectedPosition(null);
    setDialogMode("create");
    setApiError("");
    setFormKey((current) => current + 1);
    setDialogOpen(true);
  };

  const openEditDialog = (position: PositionRecord) => {
    setSelectedPosition(position);
    setDialogMode("edit");
    setApiError("");
    setFormKey((current) => current + 1);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setApiError("");
    setSelectedPosition(null);
  };

  const handleSave = async (values: PositionFormValues) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      const response = await fetch(dialogMode === "create" ? "/api/positions" : `/api/positions/${selectedPosition?.id}`, {
        method: dialogMode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          dialogMode === "create"
            ? {
                department_id: values.department_id,
                code: values.code,
                name: values.name,
                basic_salary: Number(values.basic_salary),
                position_allowance: Number(values.position_allowance),
              }
            : {
                department_id: values.department_id,
                name: values.name,
                basic_salary: Number(values.basic_salary),
                position_allowance: Number(values.position_allowance),
              },
        ),
      });
      const json = await response.json();
      if (!json.success) {
        setApiError(json.message || json.error || "Gagal menyimpan jabatan");
        return;
      }

      showToast({
        title: dialogMode === "create" ? "Jabatan ditambahkan" : "Jabatan diperbarui",
        description: json.message || "Perubahan berhasil disimpan",
      });
      setDialogOpen(false);
      router.refresh();
    } catch {
      setApiError("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (position: PositionRecord) => {
    try {
      const response = await fetch(`/api/positions/${position.id}`, { method: "DELETE" });
      const json = await response.json();
      if (!json.success) {
        showToast({ title: "Gagal menghapus jabatan", description: json.message || json.error || "Terjadi kesalahan", variant: "destructive" });
        return;
      }

      showToast({ title: "Jabatan dihapus", description: json.message || "Jabatan berhasil dihapus" });
      router.refresh();
    } catch {
      showToast({ title: "Gagal menghapus jabatan", description: "Terjadi kesalahan koneksi", variant: "destructive" });
    }
  };

  const selectedInitialValues: PositionFormValues | null = selectedPosition
    ? {
        id: selectedPosition.id,
        department_id: selectedPosition.department_id,
        code: selectedPosition.code ?? "",
        name: selectedPosition.name,
        basic_salary: String(selectedPosition.basic_salary ?? ""),
        position_allowance: String(selectedPosition.position_allowance ?? ""),
      }
    : null;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPositions = positions.filter((position) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      (position.code || "").toLowerCase().includes(normalizedQuery) ||
      position.name.toLowerCase().includes(normalizedQuery) ||
      position.department_name.toLowerCase().includes(normalizedQuery);

    const matchesDepartment = departmentFilter === "ALL" || position.department_id === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const handleExport = () => {
    if (filteredPositions.length === 0) {
      showToast({
        title: "Tidak ada data untuk diexport",
        description: "Ubah pencarian atau filter terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Kode", "Nama Jabatan", "Departemen", "Gaji Pokok", "Tunjangan Jabatan"];
    const csvRows = [
      headers.join(","),
      ...filteredPositions.map((position) =>
        [position.code || "-", position.name, position.department_name, position.basic_salary, position.position_allowance]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob(["\ufeff" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jabatan-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    showToast({
      title: "Export berhasil",
      description: `${filteredPositions.length} data jabatan berhasil diexport.`,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("ALL");
    setFilterDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jabatan</h1>
          <p className="mt-1 text-muted-foreground">Kelola data jabatan dan golongan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={filteredPositions.length === 0}>
            <FileDown className="h-4 w-4" /> Export
          </Button>
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> Tambah Data
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari kode, jabatan, atau departemen..." className="pl-9" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </div>
            <Button variant="outline" className="shrink-0 gap-2" onClick={() => setFilterDialogOpen(true)}>
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>

          {errorMsg ? (
            <div className="p-6 text-sm text-destructive">{errorMsg}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Jabatan</TableHead>
                  <TableHead>Gaji Pokok</TableHead>
                  <TableHead>Tunjangan Jabatan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.length > 0 ? (
                  filteredPositions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.code || "-"}</TableCell>
                      <TableCell>{position.name}</TableCell>
                      <TableCell>{formatRupiah(position.basic_salary)}</TableCell>
                      <TableCell>{formatRupiah(position.position_allowance)}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(position)}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(position)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <EmptyState title="Tidak ada data jabatan" description="Tidak ada jabatan yang cocok dengan pencarian atau filter." />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between border-t px-4 py-4 text-sm text-muted-foreground">
            <div>Menampilkan total {filteredPositions.length} data</div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Jabatan</DialogTitle>
            <DialogDescription>Pilih departemen untuk mempersempit daftar jabatan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Departemen</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
            >
              <option value="ALL">Semua Departemen</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button type="button" onClick={() => setFilterDialogOpen(false)}>
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MasterDataDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        mode={dialogMode}
        entityLabel="Jabatan"
        description="Isi data jabatan sesuai kebutuhan perusahaan."
        isSubmitting={isSubmitting}
      >
        <PositionForm
          key={formKey}
          mode={dialogMode}
          initialValues={selectedInitialValues}
          departments={departments}
          isSubmitting={isSubmitting}
          apiError={apiError}
          onSubmit={handleSave}
          onCancel={closeDialog}
        />
      </MasterDataDialog>

      <DeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            void handleDelete(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        title="Hapus Jabatan"
        description={deleteTarget ? `Apakah Anda yakin ingin menghapus jabatan ${deleteTarget.name}?` : "Apakah Anda yakin ingin menghapus data ini?"}
      />
    </div>
  );
}
