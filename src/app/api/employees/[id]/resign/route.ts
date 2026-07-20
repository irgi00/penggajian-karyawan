import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await pool.connect();
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return error(!session ? "Tidak terautentikasi" : "Akses ditolak", !session ? 401 : 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { resign_date } = body;

    // Validation Rules
    if (!resign_date || typeof resign_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(resign_date)) {
      return error("resign_date wajib diisi format YYYY-MM-DD", 400);
    }

    await client.query('BEGIN');

    // Check employee
    const empCheck = await client.query("SELECT id, user_id FROM employees WHERE id = $1", [id]);
    if (empCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return error("Karyawan tidak ditemukan", 404);
    }
    const userId = empCheck.rows[0].user_id;

    // Update employee status
    const updateEmp = await client.query(
      `UPDATE employees SET employment_status = 'RESIGNED', resign_date = $1, updated_at = NOW() WHERE id = $2 RETURNING id, employment_status`,
      [resign_date, id]
    );

    // Update user active status
    await client.query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`,
      [userId]
    );

    await client.query('COMMIT');

    return success(
      { employee: updateEmp.rows[0] },
      "Karyawan berhasil ditandai sebagai resign",
      200
    );
  } catch (err: any) {
    await client.query('ROLLBACK');
    return error("Internal server error", 500);
  } finally {
    client.release();
  }
}
