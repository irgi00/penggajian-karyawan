"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface EmployeeFormState {
  employeeCode: string;
  fullName: string;
  positionId: string;
  status: string;
  gender: string;
  phone: string;
  address: string;
  joinDate: string;
  salaryOverride: string | number;
}

export default function EditKaryawanPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [employee, setEmployee] = useState<EmployeeFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
          setErrorMsg(json.message || json.error || "Karyawan tidak ditemukan");
        }
      } catch {
        setErrorMsg("Terjadi kesalahan saat memuat data karyawan");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!employee) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

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
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg("Data karyawan berhasil diperbarui.");
        window.location.href = "/admin/karyawan";
      } else {
        setErrorMsg(json.message || json.error || "Gagal memperbarui data karyawan");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton className="h-8 w-32" />;
  }

  if (!employee) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errorMsg || "Data karyawan tidak ditemukan."}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Karyawan</CardTitle>
          <CardDescription>Ubah data karyawan dengan ID {id}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errorMsg}</div>}
            {successMsg && <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{successMsg}</div>}

            <Input placeholder="NIK / Kode Karyawan" value={employee.employeeCode} disabled />
            <Input placeholder="Nama Lengkap" value={employee.fullName} onChange={(event) => setEmployee({ ...employee, fullName: event.target.value })} />
            <Input placeholder="ID Jabatan" value={employee.positionId} onChange={(event) => setEmployee({ ...employee, positionId: event.target.value })} required />
            <Input placeholder="Gender (L/P)" value={employee.gender} onChange={(event) => setEmployee({ ...employee, gender: event.target.value })} />
            <Input placeholder="Nomor Telepon" value={employee.phone} onChange={(event) => setEmployee({ ...employee, phone: event.target.value })} />
            <Input placeholder="Alamat" value={employee.address} onChange={(event) => setEmployee({ ...employee, address: event.target.value })} />
            <Input type="date" value={employee.joinDate} onChange={(event) => setEmployee({ ...employee, joinDate: event.target.value })} />
            <Input type="number" placeholder="Salary Override" value={employee.salaryOverride} onChange={(event) => setEmployee({ ...employee, salaryOverride: event.target.value })} min={0} />
            <Input placeholder="Status" value={employee.status} disabled />
            <div className="flex space-x-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
              <Link href="/admin/karyawan" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">Batal</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
