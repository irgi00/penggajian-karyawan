import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

// Utility to validate UUID
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

// 2.2 Process Payroll (Draft) - ADMIN only
export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const session = await getSession();
    if (!session) return error("Tidak terautentikasi", 401);
    if (session.role !== "ADMIN") return error("Akses ditolak", 403);

    const body = await req.json();
    const { payroll_period_id } = body;
    if (!payroll_period_id || !isValidUUID(payroll_period_id)) {
      return error("payroll_period_id wajib diisi dan harus UUID valid", 400);
    }

    await client.query('BEGIN');

    // Get payroll period
    const periodRes = await client.query(
      "SELECT start_date, end_date, working_days FROM payroll_periods WHERE id = $1",
      [payroll_period_id]
    );
    if (periodRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return error("Periode penggajian tidak ditemukan", 404);
    }
    const period = periodRes.rows[0];

    // Get active employees with position and allowance
    const empRes = await client.query(
      "SELECT e.id, e.salary_override, p.basic_salary, p.allowance FROM employees e JOIN positions p ON e.position_id = p.id WHERE e.employment_status = 'ACTIVE'"
    );

    for (const emp of empRes.rows) {
      // Ensure payroll not already exists for this employee and period
      const existCheck = await client.query(
        "SELECT id FROM payrolls WHERE employee_id = $1 AND payroll_period_id = $2",
        [emp.id, payroll_period_id]
      );
      if (existCheck.rowCount && existCheck.rowCount > 0) {
        await client.query('ROLLBACK');
        return error(`Payroll already exists for employee ${emp.id} in this period`, 400);
      }

      // Attendance present days
      const attendRes = await client.query(
        "SELECT COUNT(*) FROM attendance_records WHERE employee_id = $1 AND status = 'PRESENT' AND attendance_date BETWEEN $2 AND $3",
        [emp.id, period.start_date, period.end_date]
      );
      const presentDays = Number(attendRes.rows[0].count);

      const basicBase = emp.salary_override ?? emp.basic_salary ?? 0;
      const basicSalary = Math.round((basicBase * presentDays) / period.working_days);
      const allowance = emp.allowance ?? 0;

      // Overtime total hours
      const overtimeRes = await client.query(
        "SELECT COALESCE(SUM(hours),0) AS total_hours FROM overtime_records WHERE employee_id = $1 AND overtime_date BETWEEN $2 AND $3",
        [emp.id, period.start_date, period.end_date]
      );
      const overtimeHours = Number(overtimeRes.rows[0].total_hours);
      const overtimeAmount = overtimeHours * 0; // No rate defined

      // Bonus total
      const bonusRes = await client.query(
        "SELECT COALESCE(SUM(amount),0) AS total_bonus FROM bonus_records WHERE employee_id = $1 AND payroll_period_id = $2",
        [emp.id, payroll_period_id]
      );
      const bonusTotal = Number(bonusRes.rows[0].total_bonus);

      const grossSalary = basicSalary + allowance + overtimeAmount + bonusTotal;
      const totalDeduction = 0; // Placeholder for BPJS, tax etc.
      const netSalary = grossSalary - totalDeduction;

      // Insert payroll header
      const headerRes = await client.query(
        "INSERT INTO payrolls (employee_id, payroll_period_id, status, generated_at) VALUES ($1, $2, 'DRAFT', NOW()) RETURNING id",
        [emp.id, payroll_period_id]
      );
      const payrollId = headerRes.rows[0].id;

      // Insert payroll details components
      const components = [
        { name: 'Basic Salary', type: 'INCOME', amount: basicSalary },
        { name: 'Position Allowance', type: 'INCOME', amount: allowance },
        { name: 'Overtime', type: 'INCOME', amount: overtimeAmount },
        { name: 'Bonus', type: 'INCOME', amount: bonusTotal },
        { name: 'Gross Salary', type: 'INCOME', amount: grossSalary },
        { name: 'Total Deduction', type: 'DEDUCTION', amount: totalDeduction },
        { name: 'Net Salary', type: 'INCOME', amount: netSalary },
      ];
      for (const comp of components) {
        await client.query(
          "INSERT INTO payroll_details (payroll_id, component_name, component_type, amount) VALUES ($1, $2, $3, $4)",
          [payrollId, comp.name, comp.type, comp.amount]
        );
      }
    }

    await client.query('COMMIT');
    return success({}, "Penggajian berhasil diproses (Draft)", 201);
  } catch (err: any) {
    await client.query('ROLLBACK');
    return error("Internal server error", 500);
  } finally {
    client.release();
  }
}
