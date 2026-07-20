import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

// 1.1 Get All Departments
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return error("Tidak terautentikasi", 401);
    }
    if (session.role !== "ADMIN") {
      return error("Akses ditolak", 403);
    }

    const query = "SELECT id, code, name, description FROM departments ORDER BY code ASC";
    const result = await pool.query(query);

    return success(
      { departments: result.rows },
      "Berhasil mengambil data departemen",
      200
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

// 1.2 Create Department
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
    const { code, name, description } = body;

    // Validation Rules
    if (!code || typeof code !== "string") {
      return error("Code wajib diisi", 400);
    }
    if (code.length > 50) {
      return error("Code maksimal 50 karakter", 400);
    }
    if (!name || typeof name !== "string") {
      return error("Name wajib diisi", 400);
    }
    if (name.length > 100) {
      return error("Name maksimal 100 karakter", 400);
    }

    // Business Rule: Validasi duplikasi code dan name
    const dupCheck = await pool.query(
      "SELECT id FROM departments WHERE code = $1 OR name = $2",
      [code, name]
    );
    if (dupCheck.rowCount && dupCheck.rowCount > 0) {
      return error("Code atau name departemen sudah digunakan", 400);
    }

    // Insert
    const insertQuery = `
      INSERT INTO departments (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING id, code, name
    `;
    const result = await pool.query(insertQuery, [
      code,
      name,
      description || null,
    ]);

    return success(
      { department: result.rows[0] },
      "Departemen berhasil dibuat",
      201
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
