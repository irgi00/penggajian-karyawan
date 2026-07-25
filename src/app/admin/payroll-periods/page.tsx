"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { Plus } from "lucide-react";

interface PayrollPeriod {
  id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  working_days: number;
}

export default function PayrollPeriodsPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/payroll-periods");
        const json = await res.json();
        if (json.success) {
          setPeriods(json.data.payroll_periods);
        } else {
          setErrorMsg(json.message || json.error || "Gagal mengambil data periode payroll");
        }
      } catch (error: any) {
        setErrorMsg(error.message || "Terjadi kesalahan server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Periode Payroll" description="Kelola periode penggajian yang tersedia." />
        <Link href="/admin/payroll-periods/create" className="inline-block">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Tambah Periode
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton className="h-64 w-full" />
          ) : errorMsg ? (
            <div className="p-6 text-sm text-destructive">{errorMsg}</div>
          ) : periods.length === 0 ? (
            <div className="p-12">
              <EmptyState title="Belum ada periode payroll" description="Tambahkan periode payroll untuk mulai memproses penggajian." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Periode</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead className="text-right">Hari Kerja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">{period.period_name}</TableCell>
                    <TableCell>{new Date(period.start_date).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>{new Date(period.end_date).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell className="text-right">{period.working_days}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
