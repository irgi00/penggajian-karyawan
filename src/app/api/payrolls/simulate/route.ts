import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";
import { calculatePayrollForEmployee } from "@/lib/payroll";

function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

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

    const periodRes = await pool.query(
      "SELECT id, working_days FROM payroll_periods WHERE id = $1",
      [payroll_period_id]
    );
    if (periodRes.rowCount === 0) return error("Periode penggajian tidak ditemukan", 404);
    const period = periodRes.rows[0];

    const empRes = await pool.query(
      `SELECT e.id, e.salary_override, p.basic_salary, p.position_allowance
       FROM employees e
       JOIN positions p ON e.position_id = p.id
       WHERE e.employment_status = 'ACTIVE'`
    );
    const simulations = [] as any[];

    for (const emp of empRes.rows) {
      const result = await calculatePayrollForEmployee(pool, emp, period);
      simulations.push({
        employee_id: result.employeeId,
        basic_salary: result.basicSalary,
        position_allowance: result.positionAllowance,
        overtime_amount: result.overtimeAmount,
        bonus_total: result.bonusTotal,
        gross_salary: result.grossSalary,
        total_deduction: result.totalDeduction,
        net_salary: result.netSalary,
        details: result.details,
      });
    }

    return success({ simulations }, "Simulasi berhasil", 200);
  } catch {
    return error("Internal server error", 500);
  }
}
