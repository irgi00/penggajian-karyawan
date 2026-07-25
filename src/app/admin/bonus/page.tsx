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

interface BonusRecord {
  id: string;
  employee_name: string;
  bonus_name: string;
  amount: number;
}

export default function BonusPage() {
  const [records, setRecords] = useState<BonusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/bonus");
        const json = await res.json();
        if (json.success) {
          setRecords(json.data.bonus_records);
        } else {
          setErrorMsg(json.message || json.error || "Gagal mengambil data bonus");
        }
      } catch (error: any) {
        setErrorMsg(error.message || "Terjadi kesalahan server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(amount));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Bonus" description="Kelola pencatatan bonus karyawan." />
        <Link href="/admin/bonus/create" className="inline-block">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Tambah Bonus
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton className="h-64 w-full" />
          ) : errorMsg ? (
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
    </div>
  );
}
