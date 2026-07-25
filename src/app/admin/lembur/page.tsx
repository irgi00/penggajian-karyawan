"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Filter, FileDown } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface OvertimeRecord {
  id: string;
  employee_name: string;
  overtime_date: string;
  hours: number;
  description: string | null;
}

export default function LemburPage() {
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/overtime");
        const json = await res.json();
        if (json.success) {
          setRecords(json.data.overtime_records);
        } else {
          setErrorMsg(json.message || json.error || "Gagal memuat data lembur.");
        }
      } catch {
        setErrorMsg("Terjadi kesalahan saat memuat data lembur.");
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
          <h1 className="text-3xl font-bold tracking-tight">Lembur</h1>
          <p className="mt-1 text-muted-foreground">Kelola data lembur karyawan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" /> Export
          </Button>
          <Link href="/admin/lembur/create" className="inline-block">
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
            <EmptyState title="Tidak ada data lembur" description="Silakan tambahkan data lembur baru." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Karyawan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Deskripsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id.slice(0, 8)}</TableCell>
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
    </div>
  );
}
