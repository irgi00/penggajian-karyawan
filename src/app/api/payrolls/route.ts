import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

// GET /api/payrolls?payroll_period_id=...
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return error("Tidak terautentikasi", 401);
    if (session.role !== "ADMIN") return error("Akses ditolak", 403);

    const payrollPeriodId = req.nextUrl.searchParams.get("payroll_period_id");
    if (!payrollPeriodId) {
      return error("payroll_period_id wajib diisi", 400);
    }

    const query = `
      SELECT p.id, e.full_name AS employee_name, p.status, p.generated_at
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.payroll_period_id = $1
      ORDER BY p.generated_at DESC
    `;
    const result = await pool.query(query, [payrollPeriodId]);
    return success({ payrolls: result.rows }, "Berhasil mengambil data payroll", 200);
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
