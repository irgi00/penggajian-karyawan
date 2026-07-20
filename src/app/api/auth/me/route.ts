import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    // Dekode token dari HttpOnly Cookie
    const session = await getSession();

    if (!session) {
      return error("Tidak terautentikasi", 401);
    }

    // Ambil data profil pengguna dari database berdasarkan id pada payload JWT
    const query = "SELECT id, email, role FROM users WHERE id = $1";
    const result = await pool.query(query, [session.id]);

    if (result.rowCount === 0) {
      return error("Tidak terautentikasi", 401);
    }

    const user = result.rows[0];

    return success(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      "Berhasil mendapatkan profil",
      200
    );
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
