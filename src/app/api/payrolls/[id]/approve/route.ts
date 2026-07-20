import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/response";

// Utility to validate UUID
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

// PUT /api/payrolls/:id/approve (ADMIN only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return error("Tidak terautentikasi", 401);
    if (session.role !== "ADMIN") return error("Akses ditolak", 403);

    // Removed invalid extraction of id from searchParams
    // In Next.js dynamic route, id is part of the path, accessed via req.nextUrl.pathname
    const pathname = req.nextUrl.pathname; // e.g., /api/payrolls/123/approve
    const parts = pathname.split('/');
    const payrollId = parts[parts.length - 2]; // second last segment is the id

    if (!payrollId || !isValidUUID(payrollId)) {
      return error("payroll id tidak valid", 400);
    }

    // Ensure payroll is in DRAFT status
    const existing = await pool.query(
      "SELECT status FROM payrolls WHERE id = $1",
      [payrollId]
    );
    if (existing.rowCount === 0) {
      return error("Payroll tidak ditemukan", 404);
    }
    if (existing.rows[0].status !== 'DRAFT') {
      return error("Payroll status bukan DRAFT", 400);
    }

    await pool.query(
      "UPDATE payrolls SET status = 'APPROVED', approved_at = NOW() WHERE id = $1",
      [payrollId]
    );

    return success({}, "Penggajian berhasil disetujui", 200);
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
