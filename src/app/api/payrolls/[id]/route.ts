import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return error("Tidak terautentikasi", 401);

    const pathname = req.nextUrl.pathname;
    const parts = pathname.split("/");
    const payrollId = parts[parts.length - 1];

    if (!payrollId || !isValidUUID(payrollId)) {
      return error("payroll id tidak valid", 400);
    }

    const payrollRes = await pool.query(
      `SELECT p.id, p.status, p.basic_salary, p.position_allowance, p.gross_salary,
              p.total_deduction, p.net_salary, p.approved_at, p.paid_at,
              e.id AS employee_id, e.user_id, e.full_name AS employee_name,
              pp.period_name
       FROM payrolls p
       JOIN employees e ON p.employee_id = e.id
       JOIN payroll_periods pp ON p.payroll_period_id = pp.id
       WHERE p.id = $1`,
      [payrollId]
    );

    if (payrollRes.rowCount === 0) {
      return error("Payroll tidak ditemukan", 404);
    }

    const payroll = payrollRes.rows[0];

    if (session.role === "EMPLOYEE" && payroll.user_id !== session.id) {
      return error("Akses ditolak", 403);
    }

    const detailsRes = await pool.query(
      `SELECT component_name, component_type, amount
       FROM payroll_details
       WHERE payroll_id = $1
       ORDER BY component_type, component_name`,
      [payrollId]
    );

    const payrollData = {
      id: payroll.id,
      employee_name: payroll.employee_name,
      period_name: payroll.period_name,
      status: payroll.status,
      basic_salary: payroll.basic_salary,
      position_allowance: payroll.position_allowance,
      gross_salary: payroll.gross_salary,
      total_deduction: payroll.total_deduction,
      net_salary: payroll.net_salary,
      details: detailsRes.rows,
    };

    return success({ payroll: payrollData }, "Berhasil mengambil rincian penggajian", 200);
  } catch (err: any) {
    console.error(err);
    return error("Internal server error", 500);
  }
}
