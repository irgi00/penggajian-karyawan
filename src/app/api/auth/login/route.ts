import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { signJWT, setSessionCookie } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validation Rules
    if (!email || !password) {
      return error("Email and password are required", 400);
    }

    // Business Rules
    // Cari user berdasarkan email
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    if (result.rowCount === 0) {
      return error("Email atau password salah", 401);
    }

    const user = result.rows[0];

    // Verifikasi password menggunakan algoritma hash (bcryptjs)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return error("Email atau password salah", 401);
    }

    // Pastikan akun memiliki is_active = true
    if (!user.is_active) {
      return error("Akun Anda tidak aktif", 403);
    }

    // Buat JWT berisi payload id, email, dan role
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = signJWT(payload);

    // Set JWT ke dalam HttpOnly Cookie
    await setSessionCookie(token);

    // Success Response
    return success(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      "Login berhasil",
      200
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
