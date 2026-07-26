import { pool } from "@/lib/db";
import { DepartemenPageClient } from "@/components/admin/master-data/departemen-page-client";

export default async function DepartemenPage() {
  let departments: any[] = [];
  let errorMsg = "";

  try {
    const result = await pool.query("SELECT id, code, name, description FROM departments ORDER BY code ASC");
    departments = result.rows;
  } catch {
    errorMsg = "Terjadi kesalahan saat memuat data departemen";
  }

  return <DepartemenPageClient departments={departments} errorMsg={errorMsg} />;
}
