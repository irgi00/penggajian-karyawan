/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter, MoreHorizontal, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/overtime");
        const json = await res.json();
        if (json.success) {
          setRecords(json.data.overtime_records);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const paginated = records.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lembur</h1>
          <p className="text-muted-foreground mt-1">Kelola data lembur karyawan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" /> Export
          </Button>
          <Link href="/admin/lembur/create" className="inline-block">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Tambah Data
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4 border-b">
            <FilterBar
              filters={[
                <Input key="search" placeholder="Cari data..." className="flex-1" />, // placeholder
                <Button key="filter" variant="outline" className="shrink-0">
                  <Filter className="w-4 h-4" /> Filter
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
                {paginated.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.id.slice(0, 8)}</TableCell>
                    <TableCell>{rec.employee_name}</TableCell>
                    <TableCell>{rec.overtime_date}</TableCell>
                    <TableCell>{rec.hours}</TableCell>
                    <TableCell>{rec.description ?? "-"}</TableCell>
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
