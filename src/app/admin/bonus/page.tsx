import { pool } from "@/lib/db";
import { BonusPageClient } from "@/components/admin/master-data/bonus-page-client";

export default async function BonusPage() {
  let records: any[] = [];
  let employees: any[] = [];
  let periods: any[] = [];
  let errorMsg = "";

  try {
    const [bonusResult, employeeResult, periodResult] = await Promise.all([
      pool.query(
        `
          SELECT
            b.id,
            e.full_name AS employee_name,
            b.bonus_name,
            CAST(b.amount AS FLOAT) AS amount
          FROM bonus_records b
          JOIN employees e ON b.employee_id = e.id
          ORDER BY b.created_at DESC, e.full_name ASC
        `,
      ),
      pool.query("SELECT id, employee_code, full_name FROM employees ORDER BY employee_code ASC"),
      pool.query("SELECT id, period_name FROM payroll_periods ORDER BY start_date DESC"),
    ]);

    records = bonusResult.rows;
    employees = employeeResult.rows;
    periods = periodResult.rows;
  } catch {
    errorMsg = "Terjadi kesalahan saat memuat data bonus.";
  }

  return <BonusPageClient records={records} employees={employees} periods={periods} errorMsg={errorMsg} />;
}
