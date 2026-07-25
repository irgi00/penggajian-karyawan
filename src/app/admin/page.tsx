import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Building, Briefcase, DollarSign, Calendar } from "lucide-react";
import { pool } from "@/lib/db";

export default async function AdminDashboard() {
  const [employeesRes, departmentsRes, positionsRes, payrollRes, periodRes] = await Promise.all([
    pool.query("SELECT COUNT(*) as count FROM employees"),
    pool.query("SELECT COUNT(*) as count FROM departments"),
    pool.query("SELECT COUNT(*) as count FROM positions"),
    pool.query("SELECT COALESCE(SUM(net_salary),0) as total FROM payrolls"),
    pool.query("SELECT period_name FROM payroll_periods ORDER BY start_date DESC LIMIT 1"),
  ]);

  const employeeCount = Number(employeesRes.rows[0].count);
  const deptCount = Number(departmentsRes.rows[0].count);
  const positionCount = Number(positionsRes.rows[0].count);
  const totalPayroll = Number(payrollRes.rows[0].total);
  const currentPeriod = periodRes.rowCount ? periodRes.rows[0].period_name : "-";

  const formattedPayroll = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalPayroll);

  const [recentEmpRes, recentPayrollRes] = await Promise.all([
    pool.query("SELECT e.id, e.full_name AS name, d.name AS department_name, p.name AS position_name FROM employees e JOIN positions p ON e.position_id = p.id JOIN departments d ON p.department_id = d.id ORDER BY e.created_at DESC LIMIT 5"),
    pool.query("SELECT p.id, pp.period_name, p.net_salary FROM payrolls p JOIN payroll_periods pp ON p.payroll_period_id = pp.id ORDER BY p.created_at DESC LIMIT 5"),
  ]);

  const recentEmployees = recentEmpRes.rows;
  const recentPayrolls = recentPayrollRes.rows;

  const stats = [
    { title: "Total Karyawan", value: employeeCount, icon: Users },
    { title: "Departemen", value: deptCount, icon: Building },
    { title: "Jabatan", value: positionCount, icon: Briefcase },
    { title: "Payroll (Total)", value: formattedPayroll, icon: DollarSign },
    { title: "Periode Payroll", value: currentPeriod, icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Ringkasan statistik sistem informasi penggajian.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description="Data aktual database"
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Karyawan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEmployees.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Jabatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department_name}</TableCell>
                    <TableCell>{employee.position_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Belum ada data karyawan" description="Tidak ada data karyawan yang bisa ditampilkan." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Payroll Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayrolls.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Gaji Bersih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>{payroll.id}</TableCell>
                    <TableCell>{payroll.period_name}</TableCell>
                    <TableCell>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(payroll.net_salary)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Belum ada data payroll" description="Tidak ada data payroll yang bisa ditampilkan." />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grafik Payroll</CardTitle>
          </CardHeader>
          <CardContent className="flex h-[300px] items-center justify-center rounded-md border border-dashed bg-muted/20">
            <EmptyState title="Belum ada data" description="Data grafik payroll belum tersedia." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Grafik Kehadiran</CardTitle>
          </CardHeader>
          <CardContent className="flex h-[300px] items-center justify-center rounded-md border border-dashed bg-muted/20">
            <EmptyState title="Belum ada data" description="Data grafik kehadiran belum tersedia." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
