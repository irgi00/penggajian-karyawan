import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return error("Tidak terautentikasi", 401);
    }
    if (session.role !== "ADMIN") {
      return error("Akses ditolak", 403);
    }

    const query = `
      SELECT 
        p.id, 
        p.department_id, 
        d.name as department_name, 
        p.code, 
        p.name, 
        p.basic_salary, 
        p.position_allowance
      FROM positions p
      JOIN departments d ON p.department_id = d.id
      ORDER BY p.code ASC
    `;
    const result = await pool.query(query);

    return success(
      { positions: result.rows },
      "Berhasil mengambil data jabatan",
      200
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

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
    const { department_id, code, name, basic_salary, position_allowance } = body;

    // UUID v4 validation regex
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Validation Rules
    if (!department_id || !UUID_REGEX.test(department_id)) {
      return error("Department ID tidak valid", 400);
    }
    if (!code || typeof code !== "string" || code.length > 50) {
      return error("Code wajib diisi dan maksimal 50 karakter", 400);
    }
    if (!name || typeof name !== "string" || name.length > 100) {
      return error("Name wajib diisi dan maksimal 100 karakter", 400);
    }
    if (basic_salary === undefined || typeof basic_salary !== "number" || basic_salary < 0) {
      return error("Gaji Pokok wajib diisi dan minimal 0", 400);
    }
    if (position_allowance === undefined || typeof position_allowance !== "number" || position_allowance < 0) {
      return error("Tunjangan Jabatan wajib diisi dan minimal 0", 400);
    }

    // Business Rule: Pastikan department_id ada di tabel departments
    const deptCheck = await pool.query("SELECT id FROM departments WHERE id = $1", [department_id]);
    if (deptCheck.rowCount === 0) {
      return error("Departemen tidak ditemukan", 404);
    }

    // Business Rule: Validasi duplikasi code
    const dupCheck = await pool.query("SELECT id FROM positions WHERE code = $1", [code]);
    if (dupCheck.rowCount && (dupCheck.rowCount ?? 0) > 0) {
      return error("Code jabatan sudah digunakan", 400);
    }

    // Insert
    const insertQuery = `
      INSERT INTO positions (department_id, code, name, basic_salary, position_allowance)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, code
    `;
    const result = await pool.query(insertQuery, [
      department_id,
      code,
      name,
      basic_salary,
      position_allowance,
    ]);

    return success(
      { position: result.rows[0] },
      "Jabatan berhasil dibuat",
      201
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
