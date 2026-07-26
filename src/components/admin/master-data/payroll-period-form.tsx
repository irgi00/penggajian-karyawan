"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export interface PayrollPeriodFormValues {
  period_name: string;
  start_date: string;
  end_date: string;
}

interface PayrollPeriodFormProps {
  mode: "create" | "edit";
  initialValues?: PayrollPeriodFormValues | null;
  isSubmitting: boolean;
  apiError: string;
  onSubmit: (values: PayrollPeriodFormValues) => Promise<void>;
  onCancel: () => void;
}

export function PayrollPeriodForm({ mode, initialValues, isSubmitting, apiError, onSubmit, onCancel }: PayrollPeriodFormProps) {
  const [values, setValues] = useState<PayrollPeriodFormValues>(initialValues ?? { period_name: "", start_date: "", end_date: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!values.period_name.trim()) nextErrors.period_name = "Nama periode wajib diisi";
    if (values.period_name.length > 50) nextErrors.period_name = "Nama periode maksimal 50 karakter";
    if (!values.start_date) nextErrors.start_date = "Tanggal mulai wajib diisi";
    if (!values.end_date) nextErrors.end_date = "Tanggal selesai wajib diisi";
    if (values.start_date && values.end_date && new Date(values.start_date) > new Date(values.end_date)) {
      nextErrors.end_date = "Tanggal selesai harus sama dengan atau setelah tanggal mulai";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      period_name: values.period_name.trim(),
      start_date: values.start_date,
      end_date: values.end_date,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Nama Periode *" error={errors.period_name}>
        <Input
          value={values.period_name}
          onChange={(event) => setValues((current) => ({ ...current, period_name: event.target.value }))}
          maxLength={50}
          disabled={isSubmitting}
          required
        />
      </FormField>

      <FormField label="Tanggal Mulai *" error={errors.start_date}>
        <Input
          type="date"
          value={values.start_date}
          onChange={(event) => setValues((current) => ({ ...current, start_date: event.target.value }))}
          disabled={isSubmitting}
          required
        />
      </FormField>

      <FormField label="Tanggal Selesai *" error={errors.end_date}>
        <Input
          type="date"
          value={values.end_date}
          onChange={(event) => setValues((current) => ({ ...current, end_date: event.target.value }))}
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
