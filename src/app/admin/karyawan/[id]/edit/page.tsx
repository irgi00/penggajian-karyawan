"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function EditKaryawanPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/employees/${id}`);
        const json = await res.json();
        if (json.success) {
          const emp = json.data.employee;
          setEmployee({
            employeeCode: emp.employee_code,
            fullName: emp.full_name,
            positionId: emp.position_id || "",
            status: emp.employment_status,
            gender: emp.gender || "L",
            phone: emp.phone || "",
            address: emp.address || "",
            joinDate: emp.join_date ? String(emp.join_date).slice(0, 10) : "",
            salaryOverride: emp.salary_override ?? "",
          });
        } else {
          alert(json.message || "Employee not found");
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        position_id: employee.positionId,
        full_name: employee.fullName,
        gender: employee.gender || null,
        phone: employee.phone || null,
        address: employee.address || null,
        join_date: employee.joinDate || null,
        salary_override: employee.salaryOverride === "" ? null : Number(employee.salaryOverride),
      };
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        alert("Employee updated successfully!");
        window.location.href = "/admin/karyawan";
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
            <Input placeholder="NIK / Kode Karyawan" value={employee.employeeCode} disabled />
            <Input placeholder="Nama Lengkap" value={employee.fullName} onChange={e => setEmployee({ ...employee, fullName: e.target.value })} />
            <Input placeholder="ID Jabatan" value={employee.positionId} onChange={e => setEmployee({ ...employee, positionId: e.target.value })} required />
            <Input placeholder="Gender (L/P)" value={employee.gender} onChange={e => setEmployee({ ...employee, gender: e.target.value })} />
            <Input placeholder="Nomor Telepon" value={employee.phone} onChange={e => setEmployee({ ...employee, phone: e.target.value })} />
            <Input placeholder="Alamat" value={employee.address} onChange={e => setEmployee({ ...employee, address: e.target.value })} />
            <Input type="date" value={employee.joinDate} onChange={e => setEmployee({ ...employee, joinDate: e.target.value })} />
            <Input type="number" placeholder="Salary Override" value={employee.salaryOverride} onChange={e => setEmployee({ ...employee, salaryOverride: e.target.value })} min={0} />
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
