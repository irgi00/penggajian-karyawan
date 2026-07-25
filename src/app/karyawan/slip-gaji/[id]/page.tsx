import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

export default async function EmployeeSlipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    redirect("/login");
  }

  const { id } = await params;
  const payrollResult = await pool.query(
    `SELECT
        p.id,
        p.status,
        p.basic_salary,
        p.position_allowance,
        p.total_deduction,
        p.net_salary,
        p.gross_salary,
        pp.period_name,
        e.full_name AS employee_name
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      JOIN payroll_periods pp ON p.payroll_period_id = pp.id
      WHERE p.id = $1 AND e.user_id = $2`,
    [id, session.id]
  );

  if (payrollResult.rowCount === 0) {
    notFound();
  }

  const detailResult = await pool.query(
    `SELECT component_name, component_type, amount
     FROM payroll_details
     WHERE payroll_id = $1
     ORDER BY component_type ASC, component_name ASC`,
    [id]
  );

  const payroll = {
    ...payrollResult.rows[0],
    details: detailResult.rows,
  };

  const incomes = payroll.details.filter((detail: any) => detail.component_type === "INCOME");
  const deductions = payroll.details.filter((detail: any) => detail.component_type === "DEDUCTION");
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(amount));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="warning">Draft</Badge>;
      case "APPROVED":
        return <Badge>Disetujui</Badge>;
      case "PAID":
        return <Badge variant="success">Dibayar</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title={`Slip Gaji: ${payroll.employee_name}`} description={`Periode: ${payroll.period_name}`} />

      <Card>
        <CardHeader className="bg-muted/50 border-b pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Ringkasan Gaji</CardTitle>
              <CardDescription>Rincian slip gaji Anda.</CardDescription>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {incomes.map((item: any) => (
                  <TableRow key={`${item.component_type}-${item.component_name}`}>
                    <TableCell>{item.component_name}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
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
                  {deductions.map((item: any) => (
                    <TableRow key={`${item.component_type}-${item.component_name}`}>
                      <TableCell>{item.component_name}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">{formatCurrency(item.amount)}</TableCell>
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
