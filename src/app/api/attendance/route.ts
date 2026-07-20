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

// 1.1 Get All Attendance
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
        ar.id, 
        e.full_name AS employee_name, 
        TO_CHAR(ar.attendance_date, 'YYYY-MM-DD') AS attendance_date, 
        ar.status
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
    `;
    const params: any[] = [];

    if (payrollPeriodId) {
      if (!isValidUUID(payrollPeriodId)) {
        return error("Format payroll_period_id tidak valid", 400);
      }
      query += ` WHERE ar.payroll_period_id = $1`;
      params.push(payrollPeriodId);
    }

    query += ` ORDER BY ar.attendance_date DESC, e.full_name ASC`;

    const result = await pool.query(query, params);

    return success(
      { attendance_records: result.rows },
      "Berhasil mengambil data absensi",
      200
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

// 1.2 Record Attendance
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
    const { employee_id, payroll_period_id, attendance_date, status } = body;

    // Validation Rule
    if (!employee_id || !isValidUUID(employee_id)) {
      return error("employee_id wajib diisi dan harus berupa UUID valid", 400);
    }
    if (!payroll_period_id || !isValidUUID(payroll_period_id)) {
      return error("payroll_period_id wajib diisi dan harus berupa UUID valid", 400);
    }
    if (!attendance_date || !isValidDate(attendance_date)) {
      return error("attendance_date wajib diisi dengan format YYYY-MM-DD", 400);
    }
    if (!status || !["PRESENT", "ALPHA"].includes(status)) {
      return error("status wajib diisi dengan PRESENT atau ALPHA", 400);
    }

    // Business Rule: Check if employee_id exists
    const employeeCheck = await pool.query(
      "SELECT id FROM employees WHERE id = $1",
      [employee_id]
    );
    if (employeeCheck.rowCount === 0) {
      return error("Karyawan tidak ditemukan", 404);
    }

    // Business Rule: Check payroll_period_id and dates
    const periodCheck = await pool.query(
      "SELECT start_date, end_date FROM payroll_periods WHERE id = $1",
      [payroll_period_id]
    );
    if (periodCheck.rowCount === 0) {
      return error("Periode penggajian tidak ditemukan", 404);
    }

    const period = periodCheck.rows[0];
    const attDate = new Date(attendance_date);
    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);

    if (attDate < startDate || attDate > endDate) {
      return error("attendance_date harus berada di dalam rentang start_date dan end_date periode penggajian", 400);
    }

    // Business Rule: Unique employee_id and attendance_date
    const dupCheck = await pool.query(
      "SELECT id FROM attendance_records WHERE employee_id = $1 AND attendance_date = $2",
      [employee_id, attendance_date]
    );
    if (dupCheck.rowCount && dupCheck.rowCount > 0) {
      return error("Data absensi karyawan pada tanggal ini sudah ada", 400);
    }

    // Insert
    const insertQuery = `
      INSERT INTO attendance_records (employee_id, payroll_period_id, attendance_date, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const result = await pool.query(insertQuery, [
      employee_id,
      payroll_period_id,
      attendance_date,
      status,
    ]);

    return success(
      { attendance: { id: result.rows[0].id } },
      "Absensi berhasil dicatat",
      201
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
