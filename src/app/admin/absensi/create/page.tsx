"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";

export default function AbsensiCreatePage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [payrollPeriodId, setPayrollPeriodId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [status, setStatus] = useState("PRESENT");

  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [empRes, periodRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/payroll-periods")
        ]);
        const empJson = await empRes.json();
        const periodJson = await periodRes.json();

        if (empJson.success) setEmployees(empJson.data.employees);
        if (periodJson.success) setPayrollPeriods(periodJson.data.payroll_periods);
      } catch (err) {
        console.error("Failed to fetch dependencies", err);
      }
    };
    fetchDependencies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          payroll_period_id: payrollPeriodId,
          attendance_date: attendanceDate,
          status,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || "Gagal mencatat absensi");
        setLoading(false);
        return;
      }
      router.push("/admin/absensi");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan server");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Tambah Absensi"
        description="Catat data kehadiran harian karyawan."
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                {errorMsg}
              </div>
            )}

            <FormField label="Karyawan">
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              >
                <option value="" disabled>Pilih Karyawan</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.employee_code} - {e.full_name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Periode Penggajian">
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={payrollPeriodId}
                onChange={(e) => setPayrollPeriodId(e.target.value)}
                required
              >
                <option value="" disabled>Pilih Periode</option>
                {payrollPeriods.map(p => (
                  <option key={p.id} value={p.id}>
                    {new Date(p.start_date).toLocaleDateString("id-ID")} - {new Date(p.end_date).toLocaleDateString("id-ID")}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Tanggal">
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Status Kehadiran">
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="PRESENT">Hadir</option>
                <option value="ALPHA">Alpha / Tidak Hadir</option>
              </select>
            </FormField>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Link href="/admin/absensi" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                Batal
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
