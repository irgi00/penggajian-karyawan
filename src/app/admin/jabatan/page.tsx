import { pool } from "@/lib/db";
import { JabatanPageClient } from "@/components/admin/master-data/jabatan-page-client";

export default async function JabatanPage() {
  let positions: any[] = [];
  let departments: any[] = [];
  let errorMsg = "";

  try {
    const [positionsResult, departmentsResult] = await Promise.all([
      pool.query("SELECT id, department_id, code, name, basic_salary, position_allowance FROM positions ORDER BY code ASC"),
      pool.query("SELECT id, name FROM departments ORDER BY name ASC"),
    ]);

    positions = positionsResult.rows;
    departments = departmentsResult.rows;
  } catch {
    errorMsg = "Terjadi kesalahan saat memuat data jabatan";
  }

  return <JabatanPageClient positions={positions} departments={departments} errorMsg={errorMsg} />;
}
