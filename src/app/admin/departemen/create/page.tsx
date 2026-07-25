"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default function DepartemenCreatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, description }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/departemen");
      } else {
        setError(json.message || "Gagal membuat departemen");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Tambah Departemen"
        description="Isi formulir untuk menambah departemen baru."
        breadcrumb={
          <span>
            <Link href="/admin/departemen" className="hover:underline">Departemen</Link>
            {" / Tambah"}
          </span>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Form Departemen</CardTitle>
          <CardDescription>Semua field bertanda * wajib diisi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Kode Departemen *">
              <Input
                placeholder="Contoh: HR, IT, FIN"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={50}
              />
            </FormField>

            <FormField label="Nama Departemen *">
              <Input
                placeholder="Contoh: Human Resources"
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
                {isSubmitting ? "Menyimpan..." : "Simpan"}
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
