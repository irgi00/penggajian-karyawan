"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";

export default function PayrollPeriodCreatePage() {
  const router = useRouter();
  const [periodName, setPeriodName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/payroll-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_name: periodName,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setErrorMsg(json.message || json.error || "Gagal membuat periode payroll");
        setLoading(false);
        return;
      }

      router.push("/admin/payroll-periods");
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan server");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Tambah Periode Payroll" description="Buat periode penggajian baru sesuai data kalender kerja." />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errorMsg}</div>}

            <FormField label="Nama Periode">
              <Input value={periodName} onChange={(event) => setPeriodName(event.target.value)} maxLength={50} required />
            </FormField>

            <FormField label="Tanggal Mulai">
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
            </FormField>

            <FormField label="Tanggal Selesai">
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
            </FormField>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Link href="/admin/payroll-periods" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                Batal
              </Link>
              <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan Periode"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
