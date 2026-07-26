import { pool } from "@/lib/db";
import { LemburPageClient } from "@/components/admin/master-data/lembur-page-client";

export default async function LemburPage() {
  let records: any[] = [];
  let employees: any[] = [];
  let periods: any[] = [];
  let errorMsg = "";

  try {
    const [overtimeResult, employeeResult, periodResult] = await Promise.all([
      pool.query(
        `
          SELECT
            o.id,
            e.full_name AS employee_name,
            TO_CHAR(o.overtime_date, 'YYYY-MM-DD') AS overtime_date,
            o.hours,
            o.description
          FROM overtime_records o
          JOIN employees e ON o.employee_id = e.id
          ORDER BY o.overtime_date DESC, e.full_name ASC
        `,
      ),
      pool.query("SELECT id, employee_code, full_name FROM employees ORDER BY employee_code ASC"),
      pool.query("SELECT id, period_name FROM payroll_periods ORDER BY start_date DESC"),
    ]);

    records = overtimeResult.rows;
    employees = employeeResult.rows;
    periods = periodResult.rows;
  } catch {
    errorMsg = "Terjadi kesalahan saat memuat data lembur.";
  }

  return <LemburPageClient records={records} employees={employees} periods={periods} errorMsg={errorMsg} />;
}
