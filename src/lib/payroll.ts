type Queryable = {
  query: (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number | null }>;
};

// Membulatkan nilai nominal agar hasil perhitungan gaji konsisten dan tidak terlalu detail.
function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export interface PayrollComputation {
  employeeId: string;
  basicSalary: number;
  positionAllowance: number;
  overtimeAmount: number;
  bonusTotal: number;
  bpjsDeduction: number;
  taxDeduction: number;
  grossSalary: number;
  totalDeduction: number;
  netSalary: number;
  details: Array<{
    name: string;
    type: "INCOME" | "DEDUCTION";
    amount: number;
  }>;
}

// Menghitung komponen penggajian karyawan untuk satu periode berdasarkan absensi, lembur, bonus, dan tunjangan.
export async function calculatePayrollForEmployee(
  db: Queryable,
  employee: {
    id: string;
    salary_override: number | null;
    basic_salary: number;
    position_allowance: number;
  },
  period: {
    id: string;
    working_days: number;
  }
): Promise<PayrollComputation> {
  // Menghitung jumlah hari hadir karyawan pada periode tertentu dari tabel absensi.
  // Nilai ini menjadi faktor pembagi untuk menyesuaikan gaji pokok sesuai kehadiran.
  const attendanceRes = await db.query(
    `SELECT COUNT(*) AS count
     FROM attendance_records
     WHERE employee_id = $1
       AND payroll_period_id = $2
       AND status = 'PRESENT'`,
    [employee.id, period.id]
  );
  const presentDays = Number(attendanceRes.rows[0]?.count ?? 0);

  // Menentukan dasar gaji yang dipakai: override gaji karyawan jika ada, jika tidak pakai gaji dasar jabatan.
  // Working days dijaga minimal 1 agar pembagian tidak menghasilkan nilai nol atau error.
  const basicBase = Number(employee.salary_override ?? employee.basic_salary ?? 0);
  const workingDays = Math.max(Number(period.working_days) || 0, 1);
  const basicSalary = roundCurrency((basicBase * presentDays) / workingDays);

  // Mengambil total jam lembur karyawan untuk periode yang sama, lalu menghitung nominal lembur.
  // Tarif lembur dihitung secara proporsional dari gaji pokok per hari kerja.
  const overtimeRes = await db.query(
    `SELECT COALESCE(SUM(hours), 0) AS total_hours
     FROM overtime_records
     WHERE employee_id = $1
       AND payroll_period_id = $2`,
    [employee.id, period.id]
  );
  const overtimeHours = Number(overtimeRes.rows[0]?.total_hours ?? 0);
  const hourlyRate = basicBase / workingDays / 8;
  const overtimeAmount = roundCurrency(overtimeHours * hourlyRate);

  // Mengambil total bonus karyawan dari periode yang sama dan menjadikannya bagian pendapatan.
  const bonusRes = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_bonus
     FROM bonus_records
     WHERE employee_id = $1
       AND payroll_period_id = $2`,
    [employee.id, period.id]
  );
  const bonusTotal = roundCurrency(Number(bonusRes.rows[0]?.total_bonus ?? 0));

  // Menjumlahkan semua komponen pendapatan sebelum dipotong.
  // Nilai ini menjadi dasar untuk menghitung bruto gaji.
  const positionAllowance = roundCurrency(Number(employee.position_allowance ?? 0));
  const grossSalary = roundCurrency(basicSalary + positionAllowance + overtimeAmount + bonusTotal);

  // Karena master spec belum menentukan formula potongan yang detail, sistem memakai aturan sederhana.
  // BPJS dihitung 1% dari gaji bruto, lalu pajak dihitung 5% dari sisa setelah BPJS.
  const bpjsDeduction = roundCurrency(grossSalary * 0.01);
  const taxDeduction = roundCurrency(Math.max(grossSalary - bpjsDeduction, 0) * 0.05);
  const totalDeduction = roundCurrency(bpjsDeduction + taxDeduction);
  const netSalary = roundCurrency(grossSalary - totalDeduction);

  return {
    employeeId: employee.id,
    basicSalary,
    positionAllowance,
    overtimeAmount,
    bonusTotal,
    bpjsDeduction,
    taxDeduction,
    grossSalary,
    totalDeduction,
    netSalary,
    details: [
      { name: "Gaji Pokok", type: "INCOME", amount: basicSalary },
      { name: "Tunjangan Jabatan", type: "INCOME", amount: positionAllowance },
      { name: "Lembur", type: "INCOME", amount: overtimeAmount },
      { name: "Bonus", type: "INCOME", amount: bonusTotal },
      { name: "BPJS", type: "DEDUCTION", amount: bpjsDeduction },
      { name: "Pajak", type: "DEDUCTION", amount: taxDeduction },
    ],
  };
}
