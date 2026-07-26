type Queryable = {
  query: (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number | null }>;
};

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
  const attendanceRes = await db.query(
    `SELECT COUNT(*) AS count
     FROM attendance_records
     WHERE employee_id = $1
       AND payroll_period_id = $2
       AND status = 'PRESENT'`,
    [employee.id, period.id]
  );
  const presentDays = Number(attendanceRes.rows[0]?.count ?? 0);

  const basicBase = Number(employee.salary_override ?? employee.basic_salary ?? 0);
  const workingDays = Math.max(Number(period.working_days) || 0, 1);
  const basicSalary = roundCurrency((basicBase * presentDays) / workingDays);

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

  const bonusRes = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_bonus
     FROM bonus_records
     WHERE employee_id = $1
       AND payroll_period_id = $2`,
    [employee.id, period.id]
  );
  const bonusTotal = roundCurrency(Number(bonusRes.rows[0]?.total_bonus ?? 0));

  const positionAllowance = roundCurrency(Number(employee.position_allowance ?? 0));
  const grossSalary = roundCurrency(basicSalary + positionAllowance + overtimeAmount + bonusTotal);

  // Master spec does not define exact formulas, so we use simple deterministic defaults.
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
