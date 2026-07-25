"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";

interface EmployeeOption {
  id: string;
  employee_code: string;
  full_name: string;
}

interface PayrollPeriodOption {
  id: string;
  period_name: string;
}

export default function BonusCreatePage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [payrollPeriodId, setPayrollPeriodId] = useState("");
  const [bonusName, setBonusName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [periods, setPeriods] = useState<PayrollPeriodOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [employeeRes, periodRes] = await Promise.all([fetch("/api/employees"), fetch("/api/payroll-periods")]);
        const employeeJson = await employeeRes.json();
        const periodJson = await periodRes.json();

        if (employeeJson.success) {
          setEmployees(employeeJson.data.employees);
        }
        if (periodJson.success) {
          setPeriods(periodJson.data.payroll_periods);
        }
      } catch {
        setErrorMsg("Gagal memuat data referensi bonus.");
      }
    };

    fetchDependencies();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId, payroll_period_id: payrollPeriodId, bonus_name: bonusName, amount: Number(amount), description }),
      });
      const json = await res.json();
      if (!json.success) {
        setErrorMsg(json.message || json.error || "Gagal menyimpan bonus");
        setLoading(false);
        return;
      }

      router.push("/admin/bonus");
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan server");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Tambah Bonus" description="Catat bonus untuk karyawan pada periode payroll tertentu." />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errorMsg}</div>}
            <FormField label="Karyawan">
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} required>
                <option value="" disabled>Pilih karyawan</option>
                {employees.map((employee) => (<option key={employee.id} value={employee.id}>{employee.employee_code} - {employee.full_name}</option>))}
              </select>
            </FormField>
            <FormField label="Periode Payroll">
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={payrollPeriodId} onChange={(event) => setPayrollPeriodId(event.target.value)} required>
                <option value="" disabled>Pilih periode</option>
                {periods.map((period) => (<option key={period.id} value={period.id}>{period.period_name}</option>))}
              </select>
            </FormField>
            <FormField label="Nama Bonus"><Input value={bonusName} onChange={(event) => setBonusName(event.target.value)} maxLength={100} required /></FormField>
            <FormField label="Jumlah Bonus"><Input type="number" min={1} value={amount} onChange={(event) => setAmount(event.target.value)} required /></FormField>
            <FormField label="Deskripsi"><Input value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Link href="/admin/bonus" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">Batal</Link>
              <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan Bonus"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
