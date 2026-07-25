"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Printer } from "lucide-react";

export default function PayrollDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/payrolls/${id}`);
        const json = await res.json();
        if (json.success) {
          setPayroll(json.data.payroll);
        } else {
          setErrorMsg(json.message || json.error || "Gagal mengambil data");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Kesalahan server");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Detail Penggajian" description="Memuat rincian penggajian..." />
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    );
  }

  if (errorMsg || !payroll) {
    return (
      <div className="space-y-6">
        <PageHeader title="Detail Penggajian" description="Kesalahan saat memuat data." />
        <EmptyState title="Gagal Memuat Data" description={errorMsg || "Data tidak ditemukan."} />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT": return <Badge variant="warning">Draft</Badge>;
      case "APPROVED": return <Badge variant="default">Disetujui</Badge>;
      case "PAID": return <Badge variant="success">Dibayar</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
  };

  const incomes = payroll.details.filter((d: any) => d.component_type === "INCOME");
  const deductions = payroll.details.filter((d: any) => d.component_type === "DEDUCTION");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title={`Slip Gaji: ${payroll.employee_name}`} description={`Periode: ${payroll.period_name}`} />
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Cetak Slip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="bg-muted/50 border-b pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Ringkasan Gaji</CardTitle>
                <CardDescription>Status dan total pembayaran</CardDescription>
              </div>
              {getStatusBadge(payroll.status)}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Gaji Pokok</p>
                <p className="text-lg font-semibold">{formatCurrency(payroll.basic_salary)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tunjangan</p>
                <p className="text-lg font-semibold">{formatCurrency(payroll.position_allowance)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potongan</p>
                <p className="text-lg font-semibold text-destructive">{formatCurrency(payroll.total_deduction)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gaji Bersih</p>
                <p className="text-xl font-bold text-success">{formatCurrency(payroll.net_salary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {incomes.map((inc: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{inc.component_name}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(inc.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Potongan</CardTitle>
          </CardHeader>
          <CardContent>
            {deductions.length > 0 ? (
              <Table>
                <TableBody>
                  {deductions.map((ded: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{ded.component_name}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">{formatCurrency(ded.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada potongan.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
