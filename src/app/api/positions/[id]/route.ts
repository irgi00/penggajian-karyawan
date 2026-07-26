import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 2.3 Update Position
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return error("Tidak terautentikasi", 401);
    }
    if (session.role !== "ADMIN") {
      return error("Akses ditolak", 403);
    }

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return error("ID tidak valid", 400);
    }

    const body = await req.json();
    const { department_id, name, basic_salary, position_allowance } = body;

    // Validation Rules
    if (!department_id || !UUID_REGEX.test(department_id)) {
      return error("Department ID tidak valid", 400);
    }
    if (!name || typeof name !== "string" || name.length > 100) {
      return error("Name wajib diisi", 400);
    }
    if (basic_salary === undefined || typeof basic_salary !== "number" || basic_salary < 0) {
      return error("Gaji Pokok wajib diisi dan minimal 0", 400);
    }
    if (position_allowance === undefined || typeof position_allowance !== "number" || position_allowance < 0) {
      return error("Tunjangan Jabatan wajib diisi dan minimal 0", 400);
    }

    // Business Rule: Pastikan jabatan ada
    const existing = await pool.query("SELECT id FROM positions WHERE id = $1", [id]);
    if (existing.rowCount === 0) {
      return error("Jabatan tidak ditemukan", 404);
    }

    // Business Rule: Pastikan department_id valid
    const deptCheck = await pool.query("SELECT id FROM departments WHERE id = $1", [department_id]);
    if (deptCheck.rowCount === 0) {
      return error("Departemen tidak ditemukan", 404);
    }

    // Update
    const updateQuery = `
      UPDATE positions
      SET department_id = $1, name = $2, basic_salary = $3, position_allowance = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING id, name
    `;
    const result = await pool.query(updateQuery, [
      department_id,
      name,
      basic_salary,
      position_allowance,
      id,
    ]);

    return success(
      { position: result.rows[0] },
      "Jabatan berhasil diubah",
      200
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

// 2.4 Delete Position
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return error("Tidak terautentikasi", 401);
    }
    if (session.role !== "ADMIN") {
      return error("Akses ditolak", 403);
    }

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return error("ID tidak valid", 400);
    }

    // Business Rule: Pastikan jabatan ada
    const existing = await pool.query("SELECT id FROM positions WHERE id = $1", [id]);
    if (existing.rowCount === 0) {
      return error("Jabatan tidak ditemukan", 404);
    }

    // Business Rule: Cek tabel employees untuk memastikan jabatan ini TIDAK digunakan
    const empCheck = await pool.query("SELECT id FROM employees WHERE position_id = $1 LIMIT 1", [id]);
    if (empCheck.rowCount && (empCheck.rowCount ?? 0) > 0) {
      return error("Jabatan tidak dapat dihapus karena masih digunakan oleh karyawan", 400);
    }

    // Delete
    await pool.query("DELETE FROM positions WHERE id = $1", [id]);

    return success({}, "Jabatan berhasil dihapus", 200);
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
