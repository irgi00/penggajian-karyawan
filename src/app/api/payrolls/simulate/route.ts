import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

// Utility to validate UUID
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

// 2.1 Simulate Payroll (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return error("Tidak terautentikasi", 401);
    if (session.role !== "ADMIN") return error("Akses ditolak", 403);

    const body = await req.json();
    const { payroll_period_id } = body;
    if (!payroll_period_id || !isValidUUID(payroll_period_id)) {
      return error("payroll_period_id wajib diisi dan harus UUID valid", 400);
    }

    // Get payroll period
    const periodRes = await pool.query(
      "SELECT start_date, end_date, working_days FROM payroll_periods WHERE id = $1",
      [payroll_period_id]
    );
    if (periodRes.rowCount === 0) return error("Periode penggajian tidak ditemukan", 404);
    const period = periodRes.rows[0];

    // Get active employees
    const empRes = await pool.query(
      "SELECT e.id, e.salary_override, p.basic_salary, p.allowance FROM employees e JOIN positions p ON e.position_id = p.id WHERE e.employment_status = 'ACTIVE'"
    );
    const simulations = [] as any[];

    for (const emp of empRes.rows) {
      // Count present days within period
      const attendRes = await pool.query(
        "SELECT COUNT(*) FROM attendance_records WHERE employee_id = $1 AND status = 'PRESENT' AND attendance_date BETWEEN $2 AND $3",
        [emp.id, period.start_date, period.end_date]
      );
      const presentDays = Number(attendRes.rows[0].count);

      const basicBase = emp.salary_override ?? emp.basic_salary ?? 0;
      const basicSalary = Math.round((basicBase * presentDays) / period.working_days);
      const allowance = emp.allowance ?? 0;

      // Overtime amount placeholder (sum hours * 0) -> 0
      const overtimeRes = await pool.query(
        "SELECT COALESCE(SUM(hours),0) AS total_hours FROM overtime_records WHERE employee_id = $1 AND overtime_date BETWEEN $2 AND $3",
        [emp.id, period.start_date, period.end_date]
      );
      const overtimeHours = Number(overtimeRes.rows[0].total_hours);
      const overtimeAmount = overtimeHours * 0; // no rate defined

      // Bonus total
      const bonusRes = await pool.query(
        "SELECT COALESCE(SUM(amount),0) AS total_bonus FROM bonus_records WHERE employee_id = $1 AND payroll_period_id = $2",
        [emp.id, payroll_period_id]
      );
      const bonusTotal = Number(bonusRes.rows[0].total_bonus);

      const grossSalary = basicSalary + allowance + overtimeAmount + bonusTotal;
      const totalDeduction = 0; // placeholder
      const netSalary = grossSalary - totalDeduction;

      simulations.push({
        employee_id: emp.id,
        basic_salary: basicSalary,
        position_allowance: allowance,
        overtime_amount: overtimeAmount,
        bonus_total: bonusTotal,
        gross_salary: grossSalary,
        total_deduction: totalDeduction,
        net_salary: netSalary,
      });
    }

    return success({ simulations }, "Simulasi berhasil", 200);
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
