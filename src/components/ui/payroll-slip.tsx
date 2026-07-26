import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { PrintButton } from "@/components/ui/print-button";

interface PayrollSlipProps {
  payroll: any;
  isAdmin?: boolean;
}

export function PayrollSlip({ payroll, isAdmin }: PayrollSlipProps) {
  const incomes = payroll.details.filter((detail: any) => detail.component_type === "INCOME");
  const deductions = payroll.details.filter((detail: any) => detail.component_type === "DEDUCTION");
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(amount));

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="warning">Draft</Badge>;
      case "APPROVED":
        return <Badge variant="default">Disetujui</Badge>;
      case "PAID":
        return <Badge variant="success">Dibayar</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 print:space-y-6 print:m-0 print:max-w-none">
      {/* Header and Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Slip Gaji</h1>
          <p className="text-muted-foreground mt-1">Detail penggajian karyawan.</p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider">SIPKA</h1>
        <p className="text-sm">Sistem Informasi Penggajian Karyawan</p>
        <h2 className="text-xl font-bold mt-4 uppercase underline">Slip Gaji Karyawan</h2>
      </div>

      {/* Section 1: Employee Information */}
      <Card className="shadow-sm print:shadow-none print:border-none print:p-0">
        <CardHeader className="bg-muted/30 border-b pb-4 print:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Informasi Karyawan & Penggajian</CardTitle>
            </div>
            {getStatusBadge(payroll.status)}
          </div>
        </CardHeader>
        <CardContent className="pt-6 print:pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium text-sm print:text-black">Nama</span>
                <span className="col-span-2 font-semibold text-sm print:text-black">: {payroll.employee_name}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium text-sm print:text-black">Kode Karyawan</span>
                <span className="col-span-2 font-semibold text-sm print:text-black">: {payroll.employee_code || "-"}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium text-sm print:text-black">Departemen</span>
                <span className="col-span-2 font-semibold text-sm print:text-black">: {payroll.department_name || "-"}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium text-sm print:text-black">Jabatan</span>
                <span className="col-span-2 font-semibold text-sm print:text-black">: {payroll.position_name || "-"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium text-sm print:text-black">Periode</span>
                <span className="col-span-2 font-semibold text-sm print:text-black">: {payroll.period_name}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium text-sm print:text-black">Status</span>
                <span className="col-span-2 font-semibold text-sm print:text-black">
                  : <span className="print:hidden">{getStatusBadge(payroll.status)}</span>
                    <span className="hidden print:inline font-bold uppercase">{payroll.status}</span>
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium text-sm print:text-black">Tgl Dibuat</span>
                <span className="col-span-2 font-semibold text-sm print:text-black">: {formatDate(payroll.generated_at)}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground font-medium text-sm print:text-black">Tgl Dibayar</span>
                <span className="col-span-2 font-semibold text-sm print:text-black">: {formatDate(payroll.paid_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Salary Calculation Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-8 print:avoid-break-inside">
        <Card className="shadow-sm border-t-4 border-t-success print:shadow-none print:border-t-2 print:border-black print:rounded-none">
          <CardHeader className="pb-3 border-b print:border-black">
            <CardTitle className="text-lg text-success print:text-black uppercase">Detail Pendapatan</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <Table>
              <TableBody>
                <TableRow className="border-b-0 print:border-none">
                  <TableCell className="py-2 text-muted-foreground print:text-black">Gaji Pokok</TableCell>
                  <TableCell className="py-2 text-right font-medium print:text-black">{formatCurrency(payroll.basic_salary)}</TableCell>
                </TableRow>
                <TableRow className="border-b-0 print:border-none">
                  <TableCell className="py-2 text-muted-foreground print:text-black">Tunjangan Jabatan</TableCell>
                  <TableCell className="py-2 text-right font-medium print:text-black">{formatCurrency(payroll.position_allowance)}</TableCell>
                </TableRow>
                {incomes.map((item: any) => {
                  // Normalize labels
                  let label = item.component_name;
                  if (label.toLowerCase().includes("bonus")) label = "Bonus";
                  if (label.toLowerCase().includes("overtime") || label.toLowerCase().includes("lembur")) label = "Lembur";
                  return (
                    <TableRow key={`inc-${item.component_name}`} className="border-b-0 print:border-none">
                      <TableCell className="py-2 text-muted-foreground print:text-black">{label}</TableCell>
                      <TableCell className="py-2 text-right font-medium print:text-black">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center p-4 bg-success/10 border-t print:bg-transparent print:border-black print:border-t-2">
              <span className="font-bold text-success print:text-black">TOTAL PENDAPATAN</span>
              <span className="font-bold text-success print:text-black">{formatCurrency(payroll.gross_salary)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-destructive print:shadow-none print:border-t-2 print:border-black print:rounded-none">
          <CardHeader className="pb-3 border-b print:border-black">
            <CardTitle className="text-lg text-destructive print:text-black uppercase">Detail Potongan</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            {deductions.length > 0 ? (
              <Table>
                <TableBody>
                  {deductions.map((item: any) => {
                    let label = item.component_name;
                    if (label.toLowerCase().includes("tax") || label.toLowerCase().includes("pajak")) label = "Pajak";
                    return (
                      <TableRow key={`ded-${item.component_name}`} className="border-b-0 print:border-none">
                        <TableCell className="py-2 text-muted-foreground print:text-black">{label}</TableCell>
                        <TableCell className="py-2 text-right font-medium print:text-black text-destructive">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground print:text-black">
                Tidak ada potongan.
              </div>
            )}
            {/* Filler space if deductions are less than incomes to keep cards balanced visually in UI */}
            <div className="flex-grow"></div>
            <div className="flex justify-between items-center p-4 bg-destructive/10 border-t mt-auto print:bg-transparent print:border-black print:border-t-2">
              <span className="font-bold text-destructive print:text-black">TOTAL POTONGAN</span>
              <span className="font-bold text-destructive print:text-black">{formatCurrency(payroll.total_deduction)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Net Salary Summary */}
      <Card className="shadow-md bg-primary/5 border-primary/20 print:shadow-none print:border-2 print:border-black print:rounded-none print:bg-transparent print:avoid-break-inside">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="flex justify-between items-center border-b border-primary/10 print:border-black/20 pb-2">
                <span className="text-muted-foreground print:text-black">Total Pendapatan</span>
                <span className="font-semibold print:text-black">{formatCurrency(payroll.gross_salary)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-primary/10 print:border-black/20 pb-2">
                <span className="text-muted-foreground print:text-black">(-) Total Potongan</span>
                <span className="font-semibold text-destructive print:text-black">{formatCurrency(payroll.total_deduction)}</span>
              </div>
            </div>
            
            <div className="w-full sm:w-1/2 flex flex-col items-end text-right border-t-2 sm:border-t-0 sm:border-l-2 border-primary/20 print:border-black pt-6 sm:pt-0 sm:pl-8">
              <span className="text-sm font-bold text-primary tracking-widest uppercase mb-1 print:text-black">Gaji Bersih</span>
              <span className="text-3xl sm:text-4xl font-black text-primary print:text-black">
                {formatCurrency(payroll.net_salary)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Footer */}
      <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground print:border-black print:text-black print:mt-16 print:avoid-break-inside">
        <p>Dokumen ini dibuat secara otomatis oleh</p>
        <p className="font-medium">Sistem Informasi Penggajian Karyawan (SIPKA).</p>
        <p className="mt-2">Tanggal Cetak: {currentDate}</p>
        <div className="mt-16 flex justify-around hidden print:flex">
          <div className="text-center">
            <p className="mb-16">Penerima,</p>
            <p className="font-bold underline">{payroll.employee_name}</p>
          </div>
          <div className="text-center">
            <p className="mb-16">Mengetahui,</p>
            <p className="font-bold underline">HR Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
