import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

// Utility function to check if string is valid UUID
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

// 3.1 Get All Bonus
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return error("Tidak terautentikasi", 401);
    }
    if (session.role !== "ADMIN") {
      return error("Akses ditolak", 403);
    }

    const searchParams = req.nextUrl.searchParams;
    const payrollPeriodId = searchParams.get("payroll_period_id");

    let query = `
      SELECT 
        b.id, 
        e.full_name AS employee_name, 
        b.bonus_name, 
        CAST(b.amount AS FLOAT) AS amount
      FROM bonus_records b
      JOIN employees e ON b.employee_id = e.id
    `;
    const params: any[] = [];

    if (payrollPeriodId) {
      if (!isValidUUID(payrollPeriodId)) {
        return error("Format payroll_period_id tidak valid", 400);
      }
      query += ` WHERE b.payroll_period_id = $1`;
      params.push(payrollPeriodId);
    }

    query += ` ORDER BY b.created_at DESC, e.full_name ASC`;

    const result = await pool.query(query, params);

    return success(
      { bonus_records: result.rows },
      "Berhasil mengambil data bonus",
      200
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

// 3.2 Record Bonus
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return error("Tidak terautentikasi", 401);
    }
    if (session.role !== "ADMIN") {
      return error("Akses ditolak", 403);
    }

    const body = await req.json();
    const { employee_id, payroll_period_id, bonus_name, amount, description } = body;

    // Validation Rule
    if (!employee_id || !isValidUUID(employee_id)) {
      return error("employee_id wajib diisi dan harus berupa UUID valid", 400);
    }
    if (!payroll_period_id || !isValidUUID(payroll_period_id)) {
      return error("payroll_period_id wajib diisi dan harus berupa UUID valid", 400);
    }
    if (!bonus_name || typeof bonus_name !== "string" || bonus_name.length > 100) {
      return error("bonus_name wajib diisi, berupa string maksimal 100 karakter", 400);
    }
    if (amount === undefined || amount === null || typeof amount !== "number" || amount <= 0) {
      return error("amount wajib diisi dan harus bernilai lebih dari 0", 400);
    }

    // Business Rule: Check if employee_id exists
    const employeeCheck = await pool.query(
      "SELECT id FROM employees WHERE id = $1",
      [employee_id]
    );
    if (employeeCheck.rowCount === 0) {
      return error("Karyawan tidak ditemukan", 404);
    }

    // Check if payroll_period_id exists
    const periodCheck = await pool.query(
      "SELECT id FROM payroll_periods WHERE id = $1",
      [payroll_period_id]
    );
    if (periodCheck.rowCount === 0) {
      return error("Periode penggajian tidak ditemukan", 404);
    }

    // Insert
    const insertQuery = `
      INSERT INTO bonus_records (employee_id, payroll_period_id, bonus_name, amount, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const result = await pool.query(insertQuery, [
      employee_id,
      payroll_period_id,
      bonus_name,
      amount,
      description || null,
    ]);

    return success(
      { bonus: { id: result.rows[0].id } },
      "Data bonus berhasil dicatat",
      201
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
