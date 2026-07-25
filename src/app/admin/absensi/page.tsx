"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Filter, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface AttendanceRecord {
  id: string;
  employee_name: string;
  attendance_date: string;
  status: string;
}

export default function AbsensiPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/attendance");
        const json = await res.json();
        if (json.success) {
          setRecords(json.data.attendance_records);
        } else {
          setErrorMsg(json.message || json.error || "Gagal memuat data absensi.");
        }
      } catch {
        setErrorMsg("Terjadi kesalahan saat memuat data absensi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const paginated = records.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Absensi</h1>
          <p className="mt-1 text-muted-foreground">Kelola data absensi harian karyawan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" /> Export
          </Button>
          <Link href="/admin/absensi/create" className="inline-block">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Tambah Data
            </Button>
          </Link>
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

          {loading ? (
            <LoadingSkeleton className="h-64 w-full" />
          ) : records.length === 0 ? (
            <EmptyState title="Tidak ada data absensi" description="Silakan tambahkan data absensi baru." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id.slice(0, 8)}</TableCell>
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
    </div>
  );
}
