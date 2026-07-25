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

export default function DepartemenEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await fetch("/api/departments");
        const json = await res.json();
        if (json.success) {
          const dept = json.data.departments.find((d: any) => d.id === id);
          if (dept) {
            setCode(dept.code || "");
            setName(dept.name || "");
            setDescription(dept.description || "");
          } else {
            setError("Departemen tidak ditemukan");
          }
        } else {
          setError(json.message || "Gagal memuat data departemen");
        }
      } catch (err) {
        setError("Terjadi kesalahan koneksi");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepartment();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/departemen");
      } else {
        setError(json.message || "Gagal mengubah departemen");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <LoadingSkeleton className="h-10 w-64" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Edit Departemen"
        description="Ubah data departemen yang sudah ada."
        breadcrumb={
          <span>
            <Link href="/admin/departemen" className="hover:underline">Departemen</Link>
            {" / Edit"}
          </span>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Form Edit Departemen</CardTitle>
          <CardDescription>Kode departemen tidak dapat diubah.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Kode Departemen">
              <Input value={code} disabled className="opacity-60 cursor-not-allowed" />
            </FormField>

            <FormField label="Nama Departemen *">
              <Input
                placeholder="Nama departemen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
            </FormField>

            <FormField label="Deskripsi">
              <Input
                placeholder="Deskripsi singkat (opsional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormField>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Link href="/admin/departemen">
                <Button type="button" variant="outline">Batal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
