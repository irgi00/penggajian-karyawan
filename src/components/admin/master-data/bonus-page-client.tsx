"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Filter, Plus } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [amountFilter, setAmountFilter] = useState("ALL");

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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      record.employee_name.toLowerCase().includes(normalizedQuery) ||
      record.bonus_name.toLowerCase().includes(normalizedQuery) ||
      String(record.amount).includes(normalizedQuery);

    const matchesAmount =
      amountFilter === "ALL" ||
      (amountFilter === "LT_1M" && Number(record.amount) < 1000000) ||
      (amountFilter === "GTE_1M" && Number(record.amount) >= 1000000);

    return matchesSearch && matchesAmount;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setAmountFilter("ALL");
    setFilterDialogOpen(false);
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
          <div className="flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row">
            <FilterBar
              filters={[
                <Input
                  key="search"
                  placeholder="Cari karyawan, bonus, atau jumlah..."
                  className="flex-1"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />,
                <Button key="filter" variant="outline" className="shrink-0" onClick={() => setFilterDialogOpen(true)}>
                  <Filter className="h-4 w-4" /> Filter
                </Button>,
              ]}
            />
          </div>

          {errorMsg ? (
            <div className="p-6 text-sm text-destructive">{errorMsg}</div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12">
              <EmptyState title="Belum ada data bonus" description="Tidak ada bonus yang cocok dengan pencarian atau filter." />
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
                {filteredRecords.map((record) => (
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

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Bonus</DialogTitle>
            <DialogDescription>Pilih rentang jumlah untuk mempersempit daftar bonus.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Jumlah Bonus</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={amountFilter}
              onChange={(event) => setAmountFilter(event.target.value)}
            >
              <option value="ALL">Semua Jumlah</option>
              <option value="LT_1M">Kurang dari 1.000.000</option>
              <option value="GTE_1M">1.000.000 atau lebih</option>
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
