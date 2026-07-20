import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

// Utility function to check if string is valid UUID
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

// Utility function to check if string is valid YYYY-MM-DD date
function isValidDate(dateString: string) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  const dateNum = date.getTime();
  if (!dateNum && dateNum !== 0) return false;
  return date.toISOString().slice(0, 10) === dateString;
}

// 2.1 Get All Overtime
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
        o.id, 
        e.full_name AS employee_name, 
        TO_CHAR(o.overtime_date, 'YYYY-MM-DD') AS overtime_date, 
        o.hours,
        o.description
      FROM overtime_records o
      JOIN employees e ON o.employee_id = e.id
    `;
    const params: any[] = [];

    if (payrollPeriodId) {
      if (!isValidUUID(payrollPeriodId)) {
        return error("Format payroll_period_id tidak valid", 400);
      }
      query += ` WHERE o.payroll_period_id = $1`;
      params.push(payrollPeriodId);
    }

    query += ` ORDER BY o.overtime_date DESC, e.full_name ASC`;

    const result = await pool.query(query, params);

    return success(
      { overtime_records: result.rows },
      "Berhasil mengambil data lembur",
      200
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

// 2.2 Record Overtime
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
    const { employee_id, payroll_period_id, overtime_date, hours, description } = body;

    // Validation Rule
    if (!employee_id || !isValidUUID(employee_id)) {
      return error("employee_id wajib diisi dan harus berupa UUID valid", 400);
    }
    if (!payroll_period_id || !isValidUUID(payroll_period_id)) {
      return error("payroll_period_id wajib diisi dan harus berupa UUID valid", 400);
    }
    if (!overtime_date || !isValidDate(overtime_date)) {
      return error("overtime_date wajib diisi dengan format YYYY-MM-DD", 400);
    }
    if (hours === undefined || hours === null || typeof hours !== "number" || hours <= 0) {
      return error("hours wajib diisi dan harus bernilai lebih dari 0", 400);
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
      INSERT INTO overtime_records (employee_id, payroll_period_id, overtime_date, hours, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const result = await pool.query(insertQuery, [
      employee_id,
      payroll_period_id,
      overtime_date,
      hours,
      description || null,
    ]);

    return success(
      { overtime: { id: result.rows[0].id } },
      "Data lembur berhasil dicatat",
      201
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
