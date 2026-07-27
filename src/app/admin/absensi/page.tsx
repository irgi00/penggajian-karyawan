"use client";

import { useEffect, useState } from "react";
import { FileDown, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { MasterDataDialog } from "@/components/admin/master-data/master-data-dialog";
import { AttendanceForm, AttendanceFormValues } from "@/components/admin/attendance-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";

interface AttendanceRecord {
  id: string;
  employee_name: string;
  attendance_date: string;
  status: string;
}

interface EmployeeOption {
  id: string;
  employee_code: string;
  full_name: string;
}

interface PeriodOption {
  id: string;
  start_date: string;
  end_date: string;
  period_name?: string;
}

export default function AbsensiPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [periods, setPeriods] = useState<PeriodOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const pageSize = 10;

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [recordsRes, employeesRes, periodsRes] = await Promise.all([
        fetch("/api/attendance"),
        fetch("/api/employees"),
        fetch("/api/payroll-periods"),
      ]);
      const [recordsJson, employeesJson, periodsJson] = await Promise.all([
        recordsRes.json(),
        employeesRes.json(),
        periodsRes.json(),
      ]);

      let nextError = "";
      if (recordsJson.success) {
        setRecords(recordsJson.data.attendance_records);
        setPage(1);
      } else {
        setRecords([]);
        nextError = recordsJson.message || recordsJson.error || "Gagal memuat data absensi.";
      }

      if (employeesJson.success) {
        setEmployees(employeesJson.data.employees);
      } else {
        if (!nextError) nextError = employeesJson.message || employeesJson.error || "Gagal memuat data karyawan.";
        setEmployees([]);
      }

      if (periodsJson.success) {
        setPeriods(periodsJson.data.payroll_periods);
      } else {
        if (!nextError) nextError = periodsJson.message || periodsJson.error || "Gagal memuat data periode payroll.";
        setPeriods([]);
      }

      setErrorMsg(nextError);
    } catch {
      setRecords([]);
      setEmployees([]);
      setPeriods([]);
      setErrorMsg("Terjadi kesalahan saat memuat data absensi.");
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

  const openDialog = () => {
    setApiError("");
    setFormKey((current) => current + 1);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setApiError("");
  };

  const handleCreate = async (values: AttendanceFormValues) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: values.employee_id,
          payroll_period_id: values.payroll_period_id,
          attendance_date: values.attendance_date,
          status: values.status,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setApiError(json.message || json.error || "Gagal mencatat absensi");
        return;
      }

      showToast({ title: "Absensi ditambahkan", description: json.message || "Data absensi berhasil disimpan" });
      setDialogOpen(false);
      await loadData();
    } catch (error: any) {
      setApiError(error.message || "Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const monthOptions = Array.from(new Set(records.map((record) => record.attendance_date.slice(0, 7)))).sort().reverse();
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      record.employee_name.toLowerCase().includes(normalizedQuery) ||
      record.attendance_date.toLowerCase().includes(normalizedQuery) ||
      record.status.toLowerCase().includes(normalizedQuery);

    const matchesStatus = statusFilter === "ALL" || record.status === statusFilter;
    const matchesMonth = monthFilter === "ALL" || record.attendance_date.startsWith(monthFilter);

    return matchesSearch && matchesStatus && matchesMonth;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      showToast({
        title: "Tidak ada data untuk diexport",
        description: "Ubah pencarian atau filter terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Nama Karyawan", "Tanggal", "Status"];
    const csvRows = [
      headers.join(","),
      ...filteredRecords.map((record) =>
        [record.employee_name, record.attendance_date, record.status]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob(["\ufeff" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `absensi-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    showToast({
      title: "Export berhasil",
      description: `${filteredRecords.length} data absensi berhasil diexport.`,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setMonthFilter("ALL");
    setPage(1);
    setFilterDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Absensi</h1>
          <p className="mt-1 text-muted-foreground">Kelola data absensi harian karyawan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={filteredRecords.length === 0}>
            <FileDown className="h-4 w-4" /> Export
          </Button>
          <Button className="gap-2" onClick={openDialog}>
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
                  placeholder="Cari nama, tanggal, atau status..."
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
          ) : filteredRecords.length === 0 ? (
            <EmptyState title="Tidak ada data absensi" description="Tidak ada data absensi yang cocok dengan pencarian atau filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employee_name}</TableCell>
                    <TableCell>{record.attendance_date}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "PRESENT" ? "success" : "destructive"}>{record.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between border-t px-4 py-4 text-sm text-muted-foreground">
              <div>
                Menampilkan {Math.min((currentPage - 1) * pageSize + 1, filteredRecords.length)}-
                {Math.min(currentPage * pageSize, filteredRecords.length)} dari {filteredRecords.length} data
              </div>
              <Pagination totalItems={filteredRecords.length} pageSize={pageSize} currentPage={currentPage} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Filter Absensi</DialogTitle>
            <DialogDescription>Pilih filter untuk mempersempit daftar absensi.</DialogDescription>
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
                <option value="PRESENT">PRESENT</option>
                <option value="ALPHA">ALPHA</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Bulan</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={monthFilter}
                onChange={(event) => {
                  setMonthFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">Semua Bulan</option>
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}
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
        mode="create"
        entityLabel="Absensi"
        description="Catat data kehadiran harian karyawan."
        isSubmitting={isSubmitting}
      >
        <AttendanceForm
          key={formKey}
          employees={employees}
          periods={periods}
          isSubmitting={isSubmitting}
          apiError={apiError}
          onSubmit={handleCreate}
          onCancel={closeDialog}
        />
      </MasterDataDialog>
    </div>
  );
}
