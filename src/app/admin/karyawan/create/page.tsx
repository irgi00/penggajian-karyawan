"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function KaryawanCreatePage() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("L");
  const [joinDate, setJoinDate] = useState("");
  const [salaryOverride, setSalaryOverride] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        position_id: positionId,
        employee_code: employeeCode,
        full_name: fullName,
        email: email,
        password: password,
        gender: gender,
        join_date: joinDate,
        salary_override: Number(salaryOverride)
      };
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        alert("Employee created successfully!");
        window.location.href = '/admin/karyawan';
      } else {
        alert(json.message || "Failed to create employee");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Karyawan</CardTitle>
          <CardDescription>Isi formulir untuk menambah karyawan baru.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="NIK / Kode Karyawan" value={employeeCode} onChange={e => setEmployeeCode(e.target.value)} required />
            <Input placeholder="Nama Lengkap" value={fullName} onChange={e => setFullName(e.target.value)} required />
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            <select 
              value={gender} 
              onChange={e => setGender(e.target.value)} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
            <Input type="date" placeholder="Tanggal Bergabung" value={joinDate} onChange={e => setJoinDate(e.target.value)} required />
            <Input type="number" placeholder="Salary Override" value={salaryOverride} onChange={e => setSalaryOverride(Number(e.target.value))} min={0} required />
            <Input placeholder="ID Departemen" value={departmentId} onChange={e => setDepartmentId(e.target.value)} />
            <Input placeholder="ID Jabatan" value={positionId} onChange={e => setPositionId(e.target.value)} required />
            <Input placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} />
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
