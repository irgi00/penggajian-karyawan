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

    await client.query("BEGIN");

    const periodRes = await client.query(
      "SELECT id, working_days FROM payroll_periods WHERE id = $1",
      [payroll_period_id]
    );
    if (periodRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return error("Periode penggajian tidak ditemukan", 404);
    }
    const period = periodRes.rows[0];

    const empRes = await client.query(
      `SELECT e.id, e.salary_override, p.basic_salary, p.position_allowance
       FROM employees e
       JOIN positions p ON e.position_id = p.id
       WHERE e.employment_status = 'ACTIVE'`
    );

    for (const emp of empRes.rows) {
      const existCheck = await client.query(
        "SELECT id FROM payrolls WHERE employee_id = $1 AND payroll_period_id = $2",
        [emp.id, payroll_period_id]
      );
      if ((existCheck.rowCount ?? 0) > 0) {
        await client.query("ROLLBACK");
        return error(`Payroll already exists for employee ${emp.id} in this period`, 400);
      }

      const result = await calculatePayrollForEmployee(client, emp, period);

      const headerRes = await client.query(
        `INSERT INTO payrolls (
          employee_id,
          payroll_period_id,
          basic_salary,
          position_allowance,
          gross_salary,
          total_deduction,
          net_salary,
          status,
          generated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT', NOW()) RETURNING id`,
        [
          emp.id,
          payroll_period_id,
          result.basicSalary,
          result.positionAllowance,
          result.grossSalary,
          result.totalDeduction,
          result.netSalary,
        ]
      );
      const payrollId = headerRes.rows[0].id;

      for (const comp of result.details) {
        await client.query(
          "INSERT INTO payroll_details (payroll_id, component_name, component_type, amount) VALUES ($1, $2, $3, $4)",
          [payrollId, comp.name, comp.type, comp.amount]
        );
      }
    }

    await client.query("COMMIT");
    return success({}, "Penggajian berhasil diproses (Draft)", 201);
  } catch {
    await client.query("ROLLBACK");
    return error("Internal server error", 500);
  } finally {
    client.release();
  }
}
