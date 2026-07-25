"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

import { use } from "react";

export default function EditKaryawanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch('/api/employees');
        const json = await res.json();
        if (json.success) {
          const emp = json.data.employees.find((e: any) => e.id === id);
          if (emp) {
            setEmployee({
              employeeCode: emp.employee_code,
              fullName: emp.full_name,
              departmentId: emp.department_name, // Read-only display or map to ID if needed
              positionId: emp.position_id || "", // Note: GET /api/employees might not return position_id, so we fallback
              status: emp.employment_status,
              salaryOverride: 0 // Initialize to 0 as it's required for PUT
            });
          } else {
            alert("Employee not found");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        position_id: employee.positionId,
        full_name: employee.fullName,
        salary_override: Number(employee.salaryOverride)
      };
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        alert("Employee updated successfully!");
        window.location.href = '/admin/karyawan';
      } else {
        alert(json.message || "Failed to update employee");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  if (!employee) return <LoadingSkeleton className="h-8 w-32" />;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Karyawan</CardTitle>
          <CardDescription>Ubah data karyawan dengan ID {id}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="NIK / Kode Karyawan" value={employee.employeeCode} onChange={e => setEmployee({ ...employee, employeeCode: e.target.value })} />
            <Input placeholder="Nama Lengkap" value={employee.fullName} onChange={e => setEmployee({ ...employee, fullName: e.target.value })} />
            <Input placeholder="ID Departemen" value={employee.departmentId} onChange={e => setEmployee({ ...employee, departmentId: e.target.value })} />
            <Input placeholder="ID Jabatan" value={employee.positionId} onChange={e => setEmployee({ ...employee, positionId: e.target.value })} required />
            <Input type="number" placeholder="Salary Override" value={employee.salaryOverride} onChange={e => setEmployee({ ...employee, salaryOverride: e.target.value })} min={0} required />
            <Input placeholder="Status" value={employee.status} onChange={e => setEmployee({ ...employee, status: e.target.value })} disabled />
            <div className="flex space-x-2">
              <Button type="submit">Simpan</Button>
              <Link href="/admin/karyawan" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">Batal</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
