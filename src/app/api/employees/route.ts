import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";
import bcrypt from "bcryptjs";

// 3.1 Get All Employees
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return error(!session ? "Tidak terautentikasi" : "Akses ditolak", !session ? 401 : 403);
    }

    const query = `
      SELECT 
        e.id, 
        e.employee_code, 
        e.full_name, 
        p.name AS position_name, 
        d.name AS department_name, 
        e.employment_status
      FROM employees e
      JOIN positions p ON e.position_id = p.id
      JOIN departments d ON p.department_id = d.id
      ORDER BY e.employee_code ASC
    `;
    const result = await pool.query(query);

    return success(
      { employees: result.rows },
      "Berhasil mengambil data karyawan",
      200
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

// 3.2 Create Employee
export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return error(!session ? "Tidak terautentikasi" : "Akses ditolak", !session ? 401 : 403);
    }

    const body = await req.json();
    const { position_id, employee_code, full_name, email, password, gender, phone, address, join_date, salary_override } = body;

    // Validation Rules
    if (!position_id || typeof position_id !== 'string') return error("position_id wajib diisi", 400);
    if (!employee_code || typeof employee_code !== 'string' || employee_code.length > 50) return error("employee_code wajib diisi, max 50 karakter", 400);
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) return error("email wajib diisi dengan format valid", 400);
    if (!password || typeof password !== 'string' || password.length < 8) return error("password wajib diisi, min 8 karakter", 400);
    if (!full_name || typeof full_name !== 'string') return error("full_name wajib diisi", 400);
    if (!gender || (gender !== 'L' && gender !== 'P')) return error("gender wajib diisi (L/P)", 400);
    if (!join_date || typeof join_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(join_date)) return error("join_date wajib diisi format YYYY-MM-DD", 400);
    if (salary_override === undefined || typeof salary_override !== 'number' || salary_override < 0) return error("salary_override wajib diisi, numeric >= 0", 400);

    await client.query('BEGIN');

    // Pastikan position_id valid
    const posCheck = await client.query("SELECT id FROM positions WHERE id = $1", [position_id]);
    if (posCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return error("position_id tidak valid", 400);
    }

    // Validasi duplikasi email pada tabel users
    const emailCheck = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if ((emailCheck.rowCount ?? 0) > 0) {
      await client.query('ROLLBACK');
      return error("Email sudah digunakan", 400);
    }

    // Validasi duplikasi employee_code pada tabel employees
    const codeCheck = await client.query("SELECT id FROM employees WHERE employee_code = $1", [employee_code]);
    if ((codeCheck.rowCount ?? 0) > 0) {
      await client.query('ROLLBACK');
      return error("Employee code sudah digunakan", 400);
    }

    // Insert user
    const passwordHash = await bcrypt.hash(password, 10);
    const insertUserResult = await client.query(
      `INSERT INTO users (email, password_hash, role, is_active) VALUES ($1, $2, 'EMPLOYEE', true) RETURNING id`,
      [email, passwordHash]
    );
    const userId = insertUserResult.rows[0].id;

    // Insert employee
    const insertEmployeeResult = await client.query(
      `INSERT INTO employees (user_id, position_id, employee_code, full_name, gender, phone, address, join_date, employment_status, salary_override)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', $9) RETURNING id, employee_code`,
      [userId, position_id, employee_code, full_name, gender, phone || null, address || null, join_date, salary_override]
    );

    await client.query('COMMIT');

    return success(
      { employee: insertEmployeeResult.rows[0] },
      "Karyawan berhasil didaftarkan",
      201
    );
  } catch (err: any) {
    await client.query('ROLLBACK');
    return error("Internal server error", 500);
  } finally {
    client.release();
  }
}
