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
        }
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department_id: departmentId,
          code,
          name,
          basic_salary: Number(basicSalary),
          position_allowance: Number(positionAllowance),
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/jabatan");
      } else {
        setError(json.message || "Gagal membuat jabatan");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val: string) => {
    const num = Number(val);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Tambah Jabatan"
        description="Isi formulir untuk menambah jabatan baru."
        breadcrumb={
          <span>
            <Link href="/admin/jabatan" className="hover:underline">Jabatan</Link>
            {" / Tambah"}
          </span>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Form Jabatan</CardTitle>
          <CardDescription>Semua field bertanda * wajib diisi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Departemen *">
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- Pilih Departemen --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Kode Jabatan *">
              <Input
                placeholder="Contoh: IT-PRG"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={50}
              />
            </FormField>

            <FormField label="Nama Jabatan *">
              <Input
                placeholder="Contoh: Programmer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
            </FormField>

            <FormField label="Gaji Pokok (IDR) *">
              <Input
                type="number"
                placeholder="Contoh: 8000000"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                required
                min={0}
              />
              {basicSalary && (
                <p className="text-xs text-muted-foreground mt-1">{formatRupiah(basicSalary)}</p>
              )}
            </FormField>

            <FormField label="Tunjangan Jabatan (IDR) *">
              <Input
                type="number"
                placeholder="Contoh: 500000"
                value={positionAllowance}
                onChange={(e) => setPositionAllowance(e.target.value)}
                required
                min={0}
              />
              {positionAllowance && (
                <p className="text-xs text-muted-foreground mt-1">{formatRupiah(positionAllowance)}</p>
              )}
            </FormField>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
              <Link href="/admin/jabatan">
                <Button type="button" variant="outline">Batal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
