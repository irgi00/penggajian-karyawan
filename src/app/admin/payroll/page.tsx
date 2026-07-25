"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlayCircle, CheckCircle, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import Link from "next/link";

interface PayrollRecord {
  id: string;
  employee_name: string;
  status: "DRAFT" | "APPROVED" | "PAID";
  generated_at: string;
}

interface PayrollPeriod {
  id: string;
  period_name: string;
  start_date: string;
  end_date: string;
}

export default function PayrollPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const res = await fetch("/api/payroll-periods");
        const json = await res.json();
        if (json.success && json.data.payroll_periods.length > 0) {
          setPeriods(json.data.payroll_periods);
          setSelectedPeriodId(json.data.payroll_periods[0].id);
        }
      } catch (err) {
        console.error("Gagal mengambil periode", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPeriods();
  }, []);

  const fetchPayrolls = useCallback(async (periodId: string) => {
    if (!periodId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/payrolls?payroll_period_id=${periodId}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data.payrolls);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPeriodId) {
      fetchPayrolls(selectedPeriodId);
    }
  }, [selectedPeriodId, fetchPayrolls]);

  const handleProcessPayroll = async () => {
    if (!selectedPeriodId) return;
    setProcessing(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/payrolls/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payroll_period_id: selectedPeriodId }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message || data.error || "Gagal memproses penggajian.");
      } else {
        fetchPayrolls(selectedPeriodId);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan server");
    } finally {
      setProcessing(false);
    }
  };

  const handleAction = async (id: string, action: "approve" | "pay") => {
    try {
      const res = await fetch(`/api/payrolls/${id}/${action}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || data.error || `Gagal melakukan aksi ${action}`);
      } else {
        fetchPayrolls(selectedPeriodId);
      }
    } catch (err) {
      console.error(err);
      alert(`Terjadi kesalahan saat memanggil aksi ${action}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT": return <Badge variant="warning">Draft</Badge>;
      case "APPROVED": return <Badge variant="default">Disetujui</Badge>;
      case "PAID": return <Badge variant="success">Dibayar</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const paginated = records.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground mt-1">Simulasi dan proses penggajian karyawan</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={handleProcessPayroll} disabled={processing || !selectedPeriodId}>
            <PlayCircle className="w-4 h-4" />
            {processing ? "Memproses..." : "Proses Penggajian"}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4 border-b">
            <FilterBar
              filters={[
                <select
                  key="period-select"
                  className="flex h-10 w-full sm:w-64 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  disabled={loading}
                >
                  <option value="" disabled>Pilih Periode Penggajian...</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>{p.period_name}</option>
                  ))}
                </select>,
                <Input key="search" placeholder="Cari data..." className="flex-1 w-full" />,
              ]}
            />
          </div>

          {loading ? (
            <LoadingSkeleton className="h-64 w-full" />
          ) : records.length === 0 ? (
            <EmptyState
              title="Tidak ada data penggajian"
              description="Data penggajian untuk periode ini belum diproses atau tidak ditemukan."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead>Waktu Generate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.id.slice(0, 8)}</TableCell>
                    <TableCell>{rec.employee_name}</TableCell>
                    <TableCell>{new Date(rec.generated_at).toLocaleString("id-ID")}</TableCell>
                    <TableCell>{getStatusBadge(rec.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/payroll/${rec.id}`}>
                          <Button variant="outline" size="sm">Detail</Button>
                        </Link>
                        {rec.status === "DRAFT" && (
                          <Button variant="outline" size="sm" onClick={() => handleAction(rec.id, "approve")}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        )}
                        {rec.status === "APPROVED" && (
                          <Button variant="outline" size="sm" onClick={() => handleAction(rec.id, "pay")}>
                            <CreditCard className="w-4 h-4 mr-1" /> Pay
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {records.length > 0 && (
            <div className="flex items-center justify-between px-4 py-4 border-t text-sm text-muted-foreground">
              <div>
                Menampilkan {Math.min((page - 1) * pageSize + 1, records.length)}-
                {Math.min(page * pageSize, records.length)} dari {records.length} data
              </div>
              <Pagination
                totalItems={records.length}
                pageSize={pageSize}
                currentPage={page}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
