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
  const pageSize = 10;

  const paginated = records.slice((page - 1) * pageSize, page * pageSize);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lembur</h1>
          <p className="mt-1 text-muted-foreground">Kelola data lembur karyawan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
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
                <Input key="search" placeholder="Cari data..." className="flex-1" />,
                <Button key="filter" variant="outline" className="shrink-0">
                  <Filter className="h-4 w-4" /> Filter
                </Button>,
              ]}
            />
          </div>

          {records.length === 0 ? (
            <EmptyState title="Tidak ada data lembur" description="Silakan tambahkan data lembur baru." />
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

          {records.length > 0 && (
            <div className="flex items-center justify-between border-t px-4 py-4 text-sm text-muted-foreground">
              <div>
                Menampilkan {Math.min((page - 1) * pageSize + 1, records.length)}-
                {Math.min(page * pageSize, records.length)} dari {records.length} data
              </div>
              <Pagination totalItems={records.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

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
