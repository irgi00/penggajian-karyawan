import { NextRequest } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return error("Tidak terautentikasi", 401);
    }

    // Akhiri sesi dengan menghapus HttpOnly Cookie
    await clearSessionCookie();

    return success({}, "Logout berhasil", 200);
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
