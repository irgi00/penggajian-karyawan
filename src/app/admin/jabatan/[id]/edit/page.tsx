"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import Link from "next/link";

import { use } from "react";

export default function JabatanEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [positionAllowance, setPositionAllowance] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/positions"),
        ]);
        const deptJson = await deptRes.json();
        const posJson = await posRes.json();

        if (deptJson.success) {
          setDepartments(deptJson.data.departments);
        }
        if (posJson.success) {
          const pos = posJson.data.positions.find((p: any) => p.id === id);
          if (pos) {
            setDepartmentId(pos.department_id || "");
            setCode(pos.code || "");
            setName(pos.name || "");
            setBasicSalary(String(pos.basic_salary || 0));
            setPositionAllowance(String(pos.position_allowance || 0));
          } else {
            setError("Jabatan tidak ditemukan");
          }
        }
      } catch (err) {
        setError("Terjadi kesalahan koneksi");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department_id: departmentId,
          name,
          basic_salary: Number(basicSalary),
          position_allowance: Number(positionAllowance),
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/jabatan");
      } else {
        setError(json.message || "Gagal mengubah jabatan");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val: string) => {
    const num = Number(val);
    if (isNaN(num) || val === "") return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <LoadingSkeleton className="h-10 w-64" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Edit Jabatan"
        description="Ubah data jabatan yang sudah ada."
        breadcrumb={
          <span>
            <Link href="/admin/jabatan" className="hover:underline">Jabatan</Link>
            {" / Edit"}
          </span>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Form Edit Jabatan</CardTitle>
          <CardDescription>Kode jabatan tidak dapat diubah.</CardDescription>
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

            <FormField label="Kode Jabatan">
              <Input value={code} disabled className="opacity-60 cursor-not-allowed" />
            </FormField>

            <FormField label="Nama Jabatan *">
              <Input
                placeholder="Nama jabatan"
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
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
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
