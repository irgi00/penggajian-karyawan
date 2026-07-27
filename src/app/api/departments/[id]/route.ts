import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

// UUID v4 validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    // Validation: id harus UUID valid
    if (!UUID_REGEX.test(id)) {
      return error("ID tidak valid", 400);
    }

    const body = await req.json();
    const { name, description } = body;

    // Validation Rules
    if (!name || typeof name !== "string") {
      return error("Name wajib diisi", 400);
    }
    if (name.length > 100) {
      return error("Name maksimal 100 karakter", 400);
    }

    // Business Rule: Pastikan departemen ada
    const existing = await pool.query(
      "SELECT id FROM departments WHERE id = $1",
      [id]
    );
    if (existing.rowCount === 0) {
      return error("Departemen tidak ditemukan", 404);
    }

    // Business Rule: Validasi duplikasi name (exclude current)
    const dupCheck = await pool.query(
      "SELECT id FROM departments WHERE name = $1 AND id != $2",
      [name, id]
    );
    if (dupCheck.rowCount && dupCheck.rowCount > 0) {
      return error("Name departemen sudah digunakan", 400);
    }

    // Update (code immutable - tidak diubah)
    const updateQuery = `
      UPDATE departments
      SET name = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, code, name
    `;
    const result = await pool.query(updateQuery, [
      name,
      description !== undefined ? description : null,
      id,
    ]);

    return success(
      { department: result.rows[0] },
      "Departemen berhasil diubah",
      200
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

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

    // Validation: id harus UUID valid
    if (!UUID_REGEX.test(id)) {
      return error("ID tidak valid", 400);
    }

    // Business Rule: Pastikan departemen ada
    const existing = await pool.query(
      "SELECT id FROM departments WHERE id = $1",
      [id]
    );
    if (existing.rowCount === 0) {
      return error("Departemen tidak ditemukan", 404);
    }

    // Business Rule: Cek relasi ke positions (ON DELETE RESTRICT)
    const positionCheck = await pool.query(
      "SELECT id FROM positions WHERE department_id = $1 LIMIT 1",
      [id]
    );
    if (positionCheck.rowCount && positionCheck.rowCount > 0) {
      return error(
        "Departemen tidak dapat dihapus karena masih digunakan oleh jabatan (Position)",
        400
      );
    }

    // Delete
    await pool.query("DELETE FROM departments WHERE id = $1", [id]);

    return success({}, "Departemen berhasil dihapus", 200);
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
