"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default function JabatanCreatePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [positionAllowance, setPositionAllowance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("/api/departments");
        const json = await res.json();
        if (json.success) {
          setDepartments(json.data.departments);
          if (json.data.departments.length > 0) {
            setDepartmentId(json.data.departments[0].id);
          }
        } else {
          setError(json.message || json.error || "Gagal memuat daftar departemen");
        }
      } catch {
        setError("Gagal memuat daftar departemen");
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_id: departmentId, code, name, basic_salary: Number(basicSalary), position_allowance: Number(positionAllowance) }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/jabatan");
      } else {
        setError(json.message || json.error || "Gagal membuat jabatan");
      }
    } catch {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return "";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Tambah Jabatan" description="Isi formulir untuk menambah jabatan baru." breadcrumb={<span><Link href="/admin/jabatan" className="hover:underline">Jabatan</Link>{" / Tambah"}</span>} />

      <Card>
        <CardHeader>
          <CardTitle>Form Jabatan</CardTitle>
          <CardDescription>Semua field bertanda * wajib diisi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Departemen *">
              <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">-- Pilih Departemen --</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Kode Jabatan *">
              <Input placeholder="Contoh: IT-PRG" value={code} onChange={(event) => setCode(event.target.value)} required maxLength={50} />
            </FormField>

            <FormField label="Nama Jabatan *">
              <Input placeholder="Contoh: Programmer" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} />
            </FormField>

            <FormField label="Gaji Pokok (IDR) *">
              <Input type="number" placeholder="Contoh: 8000000" value={basicSalary} onChange={(event) => setBasicSalary(event.target.value)} required min={0} />
              {basicSalary && <p className="mt-1 text-xs text-muted-foreground">{formatRupiah(basicSalary)}</p>}
            </FormField>

            <FormField label="Tunjangan Jabatan (IDR) *">
              <Input type="number" placeholder="Contoh: 500000" value={positionAllowance} onChange={(event) => setPositionAllowance(event.target.value)} required min={0} />
              {positionAllowance && <p className="mt-1 text-xs text-muted-foreground">{formatRupiah(positionAllowance)}</p>}
            </FormField>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
              <Link href="/admin/jabatan"><Button type="button" variant="outline">Batal</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
