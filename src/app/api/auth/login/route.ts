import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { signJWT, setSessionCookie } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return error("Email and password are required", 400);
    }

    const query = "SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    if (result.rowCount === 0) {
      return error("Email atau password salah", 401);
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return error("Email atau password salah", 401);
    }

    if (!user.is_active) {
      return error("Akun Anda tidak aktif", 403);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = signJWT(payload);

    await setSessionCookie(token);

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
  } catch {
    return error("Internal server error", 500);
  }
}
