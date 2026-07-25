import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

export default async function SlipGajiPage() {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    redirect("/login");
  }

  const result = await pool.query(
    `SELECT p.id, pp.period_name, p.status, p.generated_at, p.net_salary
     FROM payrolls p
     JOIN employees e ON p.employee_id = e.id
     JOIN payroll_periods pp ON p.payroll_period_id = pp.id
     WHERE e.user_id = $1
     ORDER BY pp.start_date DESC, p.generated_at DESC`,
    [session.id]
  );

  const payrolls = result.rows;
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);

  return (
    <div className="space-y-6">
      <PageHeader title="Slip Gaji" description="Lihat slip gaji Anda setiap bulannya." />

      {payrolls.length === 0 ? (
        <Card className="shadow-sm border-none">
          <CardContent className="p-12">
            <EmptyState
              title="Belum ada slip gaji yang diterbitkan"
              description="Slip gaji akan muncul di sini setelah payroll selesai diproses."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {payrolls.map((payroll) => (
            <Card key={payroll.id} className="shadow-sm border-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{payroll.period_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Status: {payroll.status} | Dibuat {new Date(payroll.generated_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Gaji Bersih</p>
                  <p className="text-xl font-semibold">{formatCurrency(Number(payroll.net_salary))}</p>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/karyawan/slip-gaji/${payroll.id}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Lihat detail slip
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
