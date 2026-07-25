import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Building, Briefcase, DollarSign, Calendar, Clock } from "lucide-react";
import { pool } from "@/lib/db";

export default async function AdminDashboard() {
  // ---- Aggregate statistics ----
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

  // ---- Recent data ----
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Ringkasan statistik sistem informasi penggajian.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard
            key={i}
            title={s.title}
            value={s.value}
            icon={s.icon}
            description="Data Aktual DB"
          />
        ))}
      </div>

      {/* Recent Employees */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Employees</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEmployees.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.id}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.department_name}</TableCell>
                    <TableCell>{emp.position_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No Employees" description="There are no employee records to display." />
          )}
        </CardContent>
      </Card>

      {/* Recent Payroll Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayrolls.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Net Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayrolls.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.period_name}</TableCell>
                    <TableCell>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p.net_salary)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No Payroll Data" description="No payroll records found." />
          )}
        </CardContent>
      </Card>

      {/* Placeholder for future charts – will show EmptyState if no data */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grafik Payroll</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md border-dashed border">
            <EmptyState title="No Data" description="Payroll chart data is unavailable." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kehadiran</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md border-dashed border">
            <EmptyState title="No Data" description="Attendance chart data is unavailable." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
