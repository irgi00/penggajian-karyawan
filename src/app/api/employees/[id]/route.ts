import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return error(!session ? "Tidak terautentikasi" : "Akses ditolak", !session ? 401 : 403);
    }

    const { id } = await params;
    const result = await pool.query(
      `SELECT id, employee_code, full_name, position_id, gender, phone, address, join_date, salary_override, employment_status
       FROM employees
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return error("Karyawan tidak ditemukan", 404);
    }

    return success({ employee: result.rows[0] }, "Berhasil mengambil data karyawan", 200);
  } catch {
    return error("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return error(!session ? "Tidak terautentikasi" : "Akses ditolak", !session ? 401 : 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { position_id, full_name, gender, phone, address, join_date, salary_override } = body;

    if (!id || typeof id !== "string") return error("ID tidak valid", 400);
    if (!position_id || typeof position_id !== "string") return error("position_id wajib diisi", 400);
    if (!full_name || typeof full_name !== "string") return error("full_name wajib diisi", 400);
    if (salary_override !== undefined && salary_override !== null && (typeof salary_override !== "number" || salary_override < 0)) {
      return error("salary_override harus numeric >= 0", 400);
    }

    const empCheck = await pool.query("SELECT id FROM employees WHERE id = $1", [id]);
    if (empCheck.rowCount === 0) {
      return error("Karyawan tidak ditemukan", 404);
    }

    const posCheck = await pool.query("SELECT id FROM positions WHERE id = $1", [position_id]);
    if (posCheck.rowCount === 0) {
      return error("position_id tidak valid", 400);
    }

    const updateQuery = `
      UPDATE employees
      SET position_id = $1, full_name = $2, gender = $3, phone = $4, address = $5, join_date = $6, salary_override = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING id
    `;
    const result = await pool.query(updateQuery, [
      position_id,
      full_name,
      gender || null,
      phone || null,
      address || null,
      join_date || null,
      salary_override ?? null,
      id,
    ]);

    return success({ employee: result.rows[0] }, "Data karyawan berhasil diubah", 200);
  } catch {
    return error("Internal server error", 500);
  }
}
