"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export interface PositionFormValues {
  id?: string;
  department_id: string;
  code: string;
  name: string;
  basic_salary: string;
  position_allowance: string;
}

interface DepartmentOption {
  id: string;
  name: string;
}

interface PositionFormProps {
  mode: "create" | "edit";
  initialValues?: PositionFormValues | null;
  departments: DepartmentOption[];
  isSubmitting: boolean;
  apiError: string;
  onSubmit: (values: PositionFormValues) => Promise<void>;
  onCancel: () => void;
}

export function PositionForm({ mode, initialValues, departments, isSubmitting, apiError, onSubmit, onCancel }: PositionFormProps) {
  const [values, setValues] = useState<PositionFormValues>(initialValues ?? { department_id: "", code: "", name: "", basic_salary: "", position_allowance: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!values.department_id) nextErrors.department_id = "Departemen wajib dipilih";
    if (mode === "create" && !values.code.trim()) nextErrors.code = "Kode jabatan wajib diisi";
    if (values.code.length > 50) nextErrors.code = "Kode jabatan maksimal 50 karakter";
    if (!values.name.trim()) nextErrors.name = "Nama jabatan wajib diisi";
    if (values.name.length > 100) nextErrors.name = "Nama jabatan maksimal 100 karakter";
    if (values.basic_salary === "" || Number(values.basic_salary) < 0) nextErrors.basic_salary = "Gaji pokok wajib diisi dan minimal 0";
    if (values.position_allowance === "" || Number(values.position_allowance) < 0) nextErrors.position_allowance = "Tunjangan jabatan wajib diisi dan minimal 0";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...values,
      code: values.code.trim(),
      name: values.name.trim(),
      basic_salary: values.basic_salary,
      position_allowance: values.position_allowance,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Departemen *" error={errors.department_id}>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={values.department_id}
          onChange={(event) => setValues((current) => ({ ...current, department_id: event.target.value }))}
          disabled={isSubmitting}
          required
        >
          <option value="">-- Pilih Departemen --</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Kode Jabatan *" error={errors.code}>
        <Input
          value={values.code}
          onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))}
          placeholder="Contoh: IT-PRG"
          maxLength={50}
          disabled={mode === "edit" || isSubmitting}
          required={mode === "create"}
        />
      </FormField>

      <FormField label="Nama Jabatan *" error={errors.name}>
        <Input
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          placeholder="Contoh: Programmer"
          maxLength={100}
          disabled={isSubmitting}
          required
        />
      </FormField>

      <FormField label="Gaji Pokok (IDR) *" error={errors.basic_salary}>
        <Input
          type="number"
          value={values.basic_salary}
          onChange={(event) => setValues((current) => ({ ...current, basic_salary: event.target.value }))}
          placeholder="Contoh: 8000000"
          min={0}
          disabled={isSubmitting}
          required
        />
      </FormField>

      <FormField label="Tunjangan Jabatan (IDR) *" error={errors.position_allowance}>
        <Input
          type="number"
          value={values.position_allowance}
          onChange={(event) => setValues((current) => ({ ...current, position_allowance: event.target.value }))}
          placeholder="Contoh: 500000"
          min={0}
          disabled={isSubmitting}
          required
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
