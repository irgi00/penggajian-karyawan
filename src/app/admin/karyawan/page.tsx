"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileDown, Filter, Pencil, Plus, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { MasterDataDialog } from "@/components/admin/master-data/master-data-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmployeeForm, EmployeeFormValues } from "@/components/admin/employee-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";

interface EmployeeRecord {
  id: string;
  employee_code: string;
  full_name: string;
  position_id: string;
  position_name: string;
  department_name: string;
  employment_status: string;
  salary_override: number | null;
}

interface PositionOption {
  id: string;
  code: string;
  name: string;
  department_name: string;
}

interface EmployeeDetail {
  id: string;
  employee_code: string;
  full_name: string;
  position_id: string;
  gender: string;
  phone: string | null;
  address: string | null;
  join_date: string | null;
  salary_override: number | null;
  employment_status: string;
}

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [positions, setPositions] = useState<PositionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetail | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [statusTarget, setStatusTarget] = useState<EmployeeRecord | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const pageSize = 10;

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [employeesRes, positionsRes] = await Promise.all([fetch("/api/employees"), fetch("/api/positions")]);
      const [employeesJson, positionsJson] = await Promise.all([employeesRes.json(), positionsRes.json()]);

      let nextError = "";
      if (employeesJson.success) {
        setEmployees(employeesJson.data.employees);
        setPage(1);
      } else {
        setEmployees([]);
        nextError = employeesJson.message || employeesJson.error || "Gagal memuat data karyawan";
      }

      if (positionsJson.success) {
        setPositions(positionsJson.data.positions);
      } else {
        if (!nextError) nextError = positionsJson.message || positionsJson.error || "Gagal memuat daftar jabatan";
        setPositions([]);
      }

      setErrorMsg(nextError);
    } catch {
      setEmployees([]);
      setPositions([]);
      setErrorMsg("Gagal memuat data karyawan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);


  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedEmployee(null);
    setApiError("");
    setDialogLoading(false);
    setFormKey((current) => current + 1);
    setDialogOpen(true);
  };

  const openEditDialog = async (employee: EmployeeRecord) => {
    setDialogMode("edit");
    setApiError("");
    setSelectedEmployee(null);
    setDialogLoading(true);
    setFormKey((current) => current + 1);
    setDialogOpen(true);

    try {
      const res = await fetch(`/api/employees/${employee.id}`);
      const json = await res.json();
      if (!json.success) {
        setApiError(json.message || json.error || "Gagal memuat data karyawan");
        return;
      }

      const emp = json.data.employee as EmployeeDetail;
      setSelectedEmployee(emp);
    } catch {
      setApiError("Terjadi kesalahan saat memuat data karyawan");
    } finally {
      setDialogLoading(false);
    }
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setApiError("");
    setSelectedEmployee(null);
  };

  const handleSave = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      const isCreate = dialogMode === "create";
      const payload = isCreate
        ? {
            position_id: values.position_id,
            employee_code: values.employee_code,
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            gender: values.gender,
            phone: values.phone || null,
            address: values.address || null,
            join_date: values.join_date,
            salary_override: values.salary_override === "" ? undefined : Number(values.salary_override),
          }
        : {
            position_id: values.position_id,
            full_name: values.full_name,
            password: values.password.trim() ? values.password : undefined,
            gender: values.gender,
            phone: values.phone || null,
            address: values.address || null,
            join_date: values.join_date || null,
            salary_override: values.salary_override === "" ? null : Number(values.salary_override),
          };

      const res = await fetch(isCreate ? "/api/employees" : `/api/employees/${selectedEmployee?.id}`, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setApiError(json.message || json.error || "Gagal menyimpan data karyawan");
        return;
      }

      showToast({
        title: isCreate ? "Karyawan ditambahkan" : "Karyawan diperbarui",
        description: json.message || "Perubahan berhasil disimpan",
      });
      setDialogOpen(false);
      setSelectedEmployee(null);
      await loadData();
    } catch {
      setApiError("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (employee: EmployeeRecord) => {
    const isActive = employee.employment_status === "ACTIVE";

    try {
      const res = await fetch(isActive ? `/api/employees/${employee.id}/resign` : `/api/employees/${employee.id}/activate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: isActive ? JSON.stringify({ resign_date: new Date().toISOString().slice(0, 10) }) : undefined,
      });
      const json = await res.json();
      if (!json.success) {
        showToast({
          title: isActive ? "Gagal menonaktifkan karyawan" : "Gagal mengaktifkan karyawan",
          description: json.message || json.error || "Terjadi kesalahan",
          variant: "destructive",
        });
        return;
      }

      showToast({
        title: isActive ? "Karyawan dinonaktifkan" : "Karyawan diaktifkan",
        description: json.message || "Status karyawan berhasil diperbarui",
      });
      await loadData();
    } catch {
      showToast({
        title: isActive ? "Gagal menonaktifkan karyawan" : "Gagal mengaktifkan karyawan",
        description: "Terjadi kesalahan koneksi",
        variant: "destructive",
      });
    }
  };

  const selectedInitialValues: EmployeeFormValues | null = selectedEmployee
    ? {
        employee_code: selectedEmployee.employee_code,
        full_name: selectedEmployee.full_name,
        position_id: selectedEmployee.position_id,
        email: "",
        password: "",
        gender: selectedEmployee.gender || "L",
        phone: selectedEmployee.phone || "",
        address: selectedEmployee.address || "",
        join_date: selectedEmployee.join_date ? String(selectedEmployee.join_date).slice(0, 10) : "",
        salary_override: selectedEmployee.salary_override === null || selectedEmployee.salary_override === undefined ? "" : String(selectedEmployee.salary_override),
        employment_status: selectedEmployee.employment_status,
      }
    : null;

  const departmentOptions = Array.from(new Set(employees.map((employee) => employee.department_name).filter(Boolean))).sort();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      employee.employee_code.toLowerCase().includes(normalizedQuery) ||
      employee.full_name.toLowerCase().includes(normalizedQuery) ||
      employee.department_name.toLowerCase().includes(normalizedQuery) ||
      employee.position_name.toLowerCase().includes(normalizedQuery);

    const matchesStatus = statusFilter === "ALL" || employee.employment_status === statusFilter;
    const matchesDepartment = departmentFilter === "ALL" || employee.department_name === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startItem = filteredEmployees.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredEmployees.length);

  const handleExport = () => {
    if (filteredEmployees.length === 0) {
      showToast({
        title: "Tidak ada data untuk diexport",
        description: "Ubah pencarian atau filter terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["NIK", "Nama", "Departemen", "Jabatan", "Status"];
    const csvRows = [
      headers.join(","),
      ...filteredEmployees.map((employee) =>
        [employee.employee_code, employee.full_name, employee.department_name || "-", employee.position_name || "-", employee.employment_status]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob(["\ufeff" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `karyawan-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    showToast({
      title: "Export berhasil",
      description: `${filteredEmployees.length} data karyawan berhasil diexport.`,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setDepartmentFilter("ALL");
    setPage(1);
    setFilterDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Karyawan</h1>
          <p className="mt-1 text-muted-foreground">Kelola data karyawan dan informasi personal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={filteredEmployees.length === 0}>
            <FileDown className="h-4 w-4" /> Export
          </Button>
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> Tambah Data
          </Button>
        </div>
      </div>

      {errorMsg && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errorMsg}</div>}

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row">
            <FilterBar
              filters={[
                <Input
                  key="search"
                  placeholder="Cari data..."
                  className="flex-1"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                />,
                <Button key="filter" variant="outline" className="shrink-0" onClick={() => setFilterDialogOpen(true)}>
                  <Filter className="h-4 w-4" /> Filter
                </Button>,
              ]}
            />
          </div>

          {loading ? (
            <LoadingSkeleton className="h-64 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Karyawan</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employee_code}</TableCell>
                      <TableCell>{employee.full_name}</TableCell>
                      <TableCell>{employee.department_name || "-"}</TableCell>
                      <TableCell>{employee.position_name || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge status={employee.employment_status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => void openEditDialog(employee)}>
                            <Pencil className="mr-1 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant={employee.employment_status === "ACTIVE" ? "outline" : "default"}
                            size="sm"
                            onClick={() => setStatusTarget(employee)}
                          >
                            {employee.employment_status === "ACTIVE" ? (
                              <UserX className="mr-1 h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                            )}
                            {employee.employment_status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </div>
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
          )}

          <Pagination totalItems={filteredEmployees.length} pageSize={pageSize} currentPage={currentPage} onPageChange={setPage} />

          <div className="flex items-center justify-between border-t px-4 py-4 text-sm text-muted-foreground">
            <div>
              Menampilkan {startItem}-{endItem} dari {filteredEmployees.length} data
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Filter Karyawan</DialogTitle>
            <DialogDescription>Pilih filter untuk mempersempit daftar karyawan.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="RESIGNED">RESIGNED</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Departemen</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={departmentFilter}
                onChange={(event) => {
                  setDepartmentFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">Semua Departemen</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
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
        entityLabel="Karyawan"
        description={dialogMode === "create" ? "Isi formulir untuk menambah karyawan baru." : "Perbarui data karyawan yang sudah terdaftar."}
        isSubmitting={isSubmitting}
        contentClassName="!flex !flex-col !max-w-3xl !max-h-[90vh] !overflow-hidden"
      >
        {dialogMode === "edit" && dialogLoading ? (
          <LoadingSkeleton className="h-72 w-full" />
        ) : dialogMode === "edit" && !selectedInitialValues ? (
          <div className="space-y-4">
            <p className="text-sm text-destructive">{apiError || "Data karyawan tidak ditemukan."}</p>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <EmployeeForm
            key={formKey}
            mode={dialogMode}
            initialValues={selectedInitialValues}
            positions={positions}
            isSubmitting={isSubmitting || dialogLoading}
            apiError={apiError}
            onSubmit={handleSave}
            onCancel={closeDialog}
          />
        )}
      </MasterDataDialog>

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
        onConfirm={() => {
          if (statusTarget) {
            void handleStatusToggle(statusTarget);
            setStatusTarget(null);
          }
        }}
        title={statusTarget?.employment_status === "ACTIVE" ? "Nonaktifkan Karyawan" : "Aktifkan Karyawan"}
        description={statusTarget ? (statusTarget.employment_status === "ACTIVE" ? `Apakah Anda yakin ingin menonaktifkan karyawan ${statusTarget.full_name}?` : `Apakah Anda yakin ingin mengaktifkan kembali karyawan ${statusTarget.full_name}?`) : "Apakah Anda yakin ingin mengubah status karyawan ini?"}
        confirmText={statusTarget?.employment_status === "ACTIVE" ? "Ya, nonaktifkan" : "Ya, aktifkan"}
      />
    </div>
  );
}

