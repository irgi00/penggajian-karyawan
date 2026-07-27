import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

function calculateWorkingDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
  let count = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return error("Tidak terautentikasi", 401);
    if (session.role !== "ADMIN") return error("Akses ditolak", 403);

    const query = `
      SELECT id, period_name, start_date, end_date, working_days
      FROM payroll_periods
      ORDER BY start_date DESC
    `;
    const result = await pool.query(query);
    return success({ payroll_periods: result.rows }, "Berhasil mengambil data periode penggajian", 200);
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return error("Tidak terautentikasi", 401);
    if (session.role !== "ADMIN") return error("Akses ditolak", 403);

    const body = await req.json();
    const { period_name, start_date, end_date } = body;

    // Validation rules
    if (!period_name || typeof period_name !== "string" || period_name.length > 50) {
      return error("period_name wajib diisi, string maksimal 50 karakter", 400);
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!start_date || !dateRegex.test(start_date)) {
      return error("start_date wajib diisi format YYYY-MM-DD", 400);
    }
    if (!end_date || !dateRegex.test(end_date)) {
      return error("end_date wajib diisi format YYYY-MM-DD", 400);
    }
    if (new Date(start_date) > new Date(end_date)) {
      return error("start_date harus <= end_date", 400);
    }

    // Ensure unique period_name
    const existCheck = await pool.query(
      "SELECT id FROM payroll_periods WHERE period_name = $1",
      [period_name]
    );
    if (existCheck.rowCount && existCheck.rowCount > 0) {
      return error("period_name sudah ada", 400);
    }

    const working_days = calculateWorkingDays(start_date, end_date);
    const insertQuery = `
      INSERT INTO payroll_periods (period_name, start_date, end_date, working_days)
      VALUES ($1, $2, $3, $4)
      RETURNING id, period_name, working_days
    `;
    const result = await pool.query(insertQuery, [period_name, start_date, end_date, working_days]);
    return success({ payroll_period: result.rows[0] }, "Periode penggajian berhasil dibuat", 201);
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
