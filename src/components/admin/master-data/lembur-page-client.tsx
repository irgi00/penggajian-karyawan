"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Filter, FileDown } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { MasterDataDialog } from "@/components/admin/master-data/master-data-dialog";
import { OvertimeForm, OvertimeFormValues } from "@/components/admin/master-data/overtime-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";

interface OvertimeRecord {
  id: string;
  employee_name: string;
  overtime_date: string;
  hours: number;
  description: string | null;
}

interface EmployeeOption {
  id: string;
  employee_code: string;
  full_name: string;
}

interface PeriodOption {
  id: string;
  period_name: string;
}

interface LemburPageClientProps {
  records: OvertimeRecord[];
  employees: EmployeeOption[];
  periods: PeriodOption[];
  errorMsg?: string;
}

export function LemburPageClient({ records, employees, periods, errorMsg = "" }: LemburPageClientProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState("ALL");
  const pageSize = 10;

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

  const handleCreate = async (values: OvertimeFormValues) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      const res = await fetch("/api/overtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: values.employee_id,
          payroll_period_id: values.payroll_period_id,
          overtime_date: values.overtime_date,
          hours: Number(values.hours),
          description: values.description,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setApiError(json.message || json.error || "Gagal mencatat lembur");
        return;
      }

      showToast({ title: "Lembur ditambahkan", description: json.message || "Data lembur berhasil disimpan" });
      setDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      setApiError(error.message || "Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const monthOptions = Array.from(new Set(records.map((record) => record.overtime_date.slice(0, 7)))).sort().reverse();
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      record.employee_name.toLowerCase().includes(normalizedQuery) ||
      record.overtime_date.toLowerCase().includes(normalizedQuery) ||
      String(record.hours).includes(normalizedQuery) ||
      (record.description || "").toLowerCase().includes(normalizedQuery);

    const matchesMonth = monthFilter === "ALL" || record.overtime_date.startsWith(monthFilter);

    return matchesSearch && matchesMonth;
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

    const headers = ["Nama Karyawan", "Tanggal", "Jam", "Deskripsi"];
    const csvRows = [
      headers.join(","),
      ...filteredRecords.map((record) =>
        [record.employee_name, record.overtime_date, record.hours, record.description ?? "-"]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob(["\ufeff" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lembur-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    showToast({
      title: "Export berhasil",
      description: `${filteredRecords.length} data lembur berhasil diexport.`,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setMonthFilter("ALL");
    setPage(1);
    setFilterDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lembur</h1>
          <p className="mt-1 text-muted-foreground">Kelola data lembur karyawan</p>
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
                  placeholder="Cari nama, tanggal, jam, atau deskripsi..."
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

          {filteredRecords.length === 0 ? (
            <EmptyState title="Tidak ada data lembur" description="Tidak ada data lembur yang cocok dengan pencarian atau filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Deskripsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employee_name}</TableCell>
                    <TableCell>{record.overtime_date}</TableCell>
                    <TableCell>{record.hours}</TableCell>
                    <TableCell>{record.description ?? "-"}</TableCell>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Lembur</DialogTitle>
            <DialogDescription>Pilih bulan untuk mempersempit daftar lembur.</DialogDescription>
          </DialogHeader>
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
        entityLabel="Lembur"
        description="Catat data jam lembur karyawan."
        isSubmitting={isSubmitting}
      >
        <OvertimeForm
          key={formKey}
          mode="create"
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
