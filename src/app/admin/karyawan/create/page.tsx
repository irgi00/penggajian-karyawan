"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";

interface PositionOption {
  id: string;
  code: string;
  name: string;
  department_name: string;
}

export default function KaryawanCreatePage() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [positionId, setPositionId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("L");
  const [joinDate, setJoinDate] = useState("");
  const [salaryOverride, setSalaryOverride] = useState("");
  const [positions, setPositions] = useState<PositionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await fetch("/api/positions");
        const json = await res.json();
        if (json.success) {
          setPositions(json.data.positions);
        } else {
          setErrorMsg(json.message || json.error || "Gagal memuat daftar jabatan");
        }
      } catch {
        setErrorMsg("Gagal memuat daftar jabatan");
      }
    };

    fetchPositions();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        position_id: positionId,
        employee_code: employeeCode,
        full_name: fullName,
        email,
        password,
        gender,
        join_date: joinDate,
        salary_override: salaryOverride === "" ? undefined : Number(salaryOverride),
      };
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) {
        setErrorMsg(json.message || json.error || "Gagal membuat karyawan");
        setLoading(false);
        return;
      }

      window.location.href = "/admin/karyawan";
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan server");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card>
        <CardContent className="pt-6">
          <PageHeader title="Tambah Karyawan" description="Isi formulir untuk menambah karyawan baru." />
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errorMsg}</div>}

            <FormField label="NIK / Kode Karyawan"><Input value={employeeCode} onChange={(event) => setEmployeeCode(event.target.value)} required /></FormField>
            <FormField label="Nama Lengkap"><Input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></FormField>
            <FormField label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></FormField>
            <FormField label="Password"><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></FormField>
            <FormField label="Jenis Kelamin">
              <select value={gender} onChange={(event) => setGender(event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </FormField>
            <FormField label="Tanggal Bergabung"><Input type="date" value={joinDate} onChange={(event) => setJoinDate(event.target.value)} required /></FormField>
            <FormField label="Salary Override"><Input type="number" min={0} value={salaryOverride} onChange={(event) => setSalaryOverride(event.target.value)} /></FormField>
            <FormField label="Jabatan">
              <select value={positionId} onChange={(event) => setPositionId(event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" required>
                <option value="" disabled>Pilih jabatan</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>{position.code} - {position.name} ({position.department_name})</option>
                ))}
              </select>
            </FormField>
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
              <Link href="/admin/karyawan" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">Batal</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
