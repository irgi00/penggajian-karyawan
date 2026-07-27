"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Plus, Filter, MoreHorizontal, FileDown, Trash2 } from "lucide-react";
import { MasterDataDialog } from "@/components/admin/master-data/master-data-dialog";
import { DepartmentForm, DepartmentFormValues } from "@/components/admin/master-data/department-form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";

interface DepartmentRecord {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
}

interface DepartemenPageClientProps {
  departments: DepartmentRecord[];
  errorMsg?: string;
}

export function DepartemenPageClient({ departments, errorMsg = "" }: DepartemenPageClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DepartmentRecord | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [descriptionFilter, setDescriptionFilter] = useState("ALL");

  const openCreateDialog = () => {
    setSelectedDepartment(null);
    setDialogMode("create");
    setApiError("");
    setFormKey((current) => current + 1);
    setDialogOpen(true);
  };

  const openEditDialog = (department: DepartmentRecord) => {
    setSelectedDepartment(department);
    setDialogMode("edit");
    setApiError("");
    setFormKey((current) => current + 1);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setApiError("");
    setSelectedDepartment(null);
  };

  const handleSave = async (values: DepartmentFormValues) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      const response = await fetch(dialogMode === "create" ? "/api/departments" : `/api/departments/${selectedDepartment?.id}`, {
        method: dialogMode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          dialogMode === "create"
            ? { code: values.code, name: values.name, description: values.description || null }
            : { name: values.name, description: values.description || null },
        ),
      });
      const json = await response.json();
      if (!json.success) {
        setApiError(json.message || json.error || "Gagal menyimpan departemen");
        return;
      }

      showToast({
        title: dialogMode === "create" ? "Departemen ditambahkan" : "Departemen diperbarui",
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

  const handleDelete = async (department: DepartmentRecord) => {
    try {
      const response = await fetch(`/api/departments/${department.id}`, { method: "DELETE" });
      const json = await response.json();
      if (!json.success) {
        showToast({ title: "Gagal menghapus departemen", description: json.message || json.error || "Terjadi kesalahan", variant: "destructive" });
        return;
      }

      showToast({ title: "Departemen dihapus", description: json.message || "Departemen berhasil dihapus" });
      router.refresh();
    } catch {
      showToast({ title: "Gagal menghapus departemen", description: "Terjadi kesalahan koneksi", variant: "destructive" });
    }
  };

  const selectedInitialValues: DepartmentFormValues | null = selectedDepartment
    ? {
        id: selectedDepartment.id,
        code: selectedDepartment.code ?? "",
        name: selectedDepartment.name,
        description: selectedDepartment.description ?? "",
      }
    : null;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredDepartments = departments.filter((department) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      (department.code || "").toLowerCase().includes(normalizedQuery) ||
      department.name.toLowerCase().includes(normalizedQuery) ||
      (department.description || "").toLowerCase().includes(normalizedQuery);

    const hasDescription = Boolean(department.description?.trim());
    const matchesDescription =
      descriptionFilter === "ALL" ||
      (descriptionFilter === "WITH_DESCRIPTION" && hasDescription) ||
      (descriptionFilter === "WITHOUT_DESCRIPTION" && !hasDescription);

    return matchesSearch && matchesDescription;
  });

  const handleExport = () => {
    if (filteredDepartments.length === 0) {
      showToast({
        title: "Tidak ada data untuk diexport",
        description: "Ubah pencarian atau filter terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Kode", "Nama", "Deskripsi", "Status"];
    const csvRows = [
      headers.join(","),
      ...filteredDepartments.map((department) =>
        [department.code || "-", department.name, department.description || "-", "Aktif"]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob(["\ufeff" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `departemen-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    showToast({
      title: "Export berhasil",
      description: `${filteredDepartments.length} data departemen berhasil diexport.`,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDescriptionFilter("ALL");
    setFilterDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departemen</h1>
          <p className="mt-1 text-muted-foreground">Kelola data departemen perusahaan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={filteredDepartments.length === 0}>
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
              <Input placeholder="Cari kode, nama, atau deskripsi..." className="pl-9" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
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
                  <TableHead>Nama</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium">{department.code || "-"}</TableCell>
                      <TableCell>{department.name}</TableCell>
                      <TableCell>
                        <Badge variant="success">Aktif</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(department)}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(department)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0">
                      <EmptyState title="Tidak ada data departemen" description="Tidak ada departemen yang cocok dengan pencarian atau filter." />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between border-t px-4 py-4 text-sm text-muted-foreground">
            <div>Menampilkan total {filteredDepartments.length} data</div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Departemen</DialogTitle>
            <DialogDescription>Pilih filter untuk mempersempit daftar departemen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={descriptionFilter}
              onChange={(event) => setDescriptionFilter(event.target.value)}
            >
              <option value="ALL">Semua</option>
              <option value="WITH_DESCRIPTION">Dengan Deskripsi</option>
              <option value="WITHOUT_DESCRIPTION">Tanpa Deskripsi</option>
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
        entityLabel="Departemen"
        description="Isi data departemen sesuai kebutuhan perusahaan."
        isSubmitting={isSubmitting}
      >
        <DepartmentForm
          key={formKey}
          mode={dialogMode}
          initialValues={selectedInitialValues}
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
        title="Hapus Departemen"
        description={deleteTarget ? `Apakah Anda yakin ingin menghapus departemen ${deleteTarget.name}?` : "Apakah Anda yakin ingin menghapus data ini?"}
      />
    </div>
  );
}
