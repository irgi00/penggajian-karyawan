import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { PayrollSlip } from "@/components/ui/payroll-slip";

export default async function EmployeeSlipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYEE") {
    redirect("/login");
  }

  const { id } = await params;
  const payrollResult = await pool.query(
    `SELECT
        p.id,
        p.status,
        p.basic_salary,
        p.position_allowance,
        p.total_deduction,
        p.net_salary,
        p.gross_salary,
        p.generated_at,
        p.approved_at,
        p.paid_at,
        pp.period_name,
        e.full_name AS employee_name,
        e.employee_code,
        pos.name AS position_name,
        d.name AS department_name
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN positions pos ON e.position_id = pos.id
      LEFT JOIN departments d ON pos.department_id = d.id
      JOIN payroll_periods pp ON p.payroll_period_id = pp.id
      WHERE p.id = $1 AND e.user_id = $2`,
    [id, session.id]
  );

  if (payrollResult.rowCount === 0) {
    notFound();
  }

  const detailResult = await pool.query(
    `SELECT component_name, component_type, amount
     FROM payroll_details
     WHERE payroll_id = $1
     ORDER BY component_type ASC, component_name ASC`,
    [id]
  );

  const payroll = {
    ...payrollResult.rows[0],
    details: detailResult.rows,
  };

  return <PayrollSlip payroll={payroll} isAdmin={false} />;
}

