"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export interface DepartmentFormValues {
  id?: string;
  code: string;
  name: string;
  description: string;
}

interface DepartmentFormProps {
  mode: "create" | "edit";
  initialValues?: DepartmentFormValues | null;
  isSubmitting: boolean;
  apiError: string;
  onSubmit: (values: DepartmentFormValues) => Promise<void>;
  onCancel: () => void;
}

export function DepartmentForm({ mode, initialValues, isSubmitting, apiError, onSubmit, onCancel }: DepartmentFormProps) {
  const [values, setValues] = useState<DepartmentFormValues>(initialValues ?? { code: "", name: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (mode === "create" && !values.code.trim()) nextErrors.code = "Kode departemen wajib diisi";
    if (values.code.length > 50) nextErrors.code = "Kode departemen maksimal 50 karakter";
    if (!values.name.trim()) nextErrors.name = "Nama departemen wajib diisi";
    if (values.name.length > 100) nextErrors.name = "Nama departemen maksimal 100 karakter";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({ ...values, code: values.code.trim(), name: values.name.trim(), description: values.description.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Kode Departemen *" error={errors.code}>
        <Input
          value={values.code}
          onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))}
          placeholder="Contoh: HR, IT, FIN"
          maxLength={50}
          disabled={mode === "edit" || isSubmitting}
          required={mode === "create"}
        />
      </FormField>

      <FormField label="Nama Departemen *" error={errors.name}>
        <Input
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          placeholder="Contoh: Human Resources"
          maxLength={100}
          disabled={isSubmitting}
          required
        />
      </FormField>

      <FormField label="Deskripsi">
        <Input
          value={values.description}
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          placeholder="Deskripsi singkat (opsional)"
          disabled={isSubmitting}
        />
      </FormField>

      {apiError ? <p className="text-sm text-destructive">{apiError}</p> : null}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Simpan" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
