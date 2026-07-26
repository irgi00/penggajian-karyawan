"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { Plus } from "lucide-react";
import { MasterDataDialog } from "@/components/admin/master-data/master-data-dialog";
import { BonusForm, BonusFormValues } from "@/components/admin/master-data/bonus-form";
import { showToast } from "@/lib/toast";

interface BonusRecord {
  id: string;
  employee_name: string;
  bonus_name: string;
  amount: number;
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

interface BonusPageClientProps {
  records: BonusRecord[];
  employees: EmployeeOption[];
  periods: PeriodOption[];
  errorMsg?: string;
}

export function BonusPageClient({ records, employees, periods, errorMsg = "" }: BonusPageClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formKey, setFormKey] = useState(0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(amount));

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

  const handleCreate = async (values: BonusFormValues) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      const res = await fetch("/api/bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: values.employee_id,
          payroll_period_id: values.payroll_period_id,
          bonus_name: values.bonus_name,
          amount: Number(values.amount),
          description: values.description,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setApiError(json.message || json.error || "Gagal menyimpan bonus");
        return;
      }

      showToast({ title: "Bonus ditambahkan", description: json.message || "Data bonus berhasil disimpan" });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Bonus" description="Kelola pencatatan bonus karyawan." />
        <Button className="gap-2" onClick={openDialog}>
          <Plus className="w-4 h-4" /> Tambah Bonus
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {errorMsg ? (
            <div className="p-6 text-sm text-destructive">{errorMsg}</div>
          ) : records.length === 0 ? (
            <div className="p-12">
              <EmptyState title="Belum ada data bonus" description="Tambahkan bonus baru untuk mulai mencatat data bonus karyawan." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead>Nama Bonus</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employee_name}</TableCell>
                    <TableCell>{record.bonus_name}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(record.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MasterDataDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        mode="create"
        entityLabel="Bonus"
        description="Catat bonus untuk karyawan pada periode payroll tertentu."
        isSubmitting={isSubmitting}
      >
        <BonusForm
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
