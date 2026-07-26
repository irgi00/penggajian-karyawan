"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export interface OvertimeFormValues {
  employee_id: string;
  payroll_period_id: string;
  overtime_date: string;
  hours: string;
  description: string;
}

interface EmployeeOption {
  id: string;
  employee_code: string;
  full_name: string;
}

interface PayrollPeriodOption {
  id: string;
  period_name: string;
}

interface OvertimeFormProps {
  mode: "create" | "edit";
  initialValues?: OvertimeFormValues | null;
  employees: EmployeeOption[];
  periods: PayrollPeriodOption[];
  isSubmitting: boolean;
  apiError: string;
  onSubmit: (values: OvertimeFormValues) => Promise<void>;
  onCancel: () => void;
}

export function OvertimeForm({ mode, initialValues, employees, periods, isSubmitting, apiError, onSubmit, onCancel }: OvertimeFormProps) {
  const [values, setValues] = useState<OvertimeFormValues>(
    initialValues ?? {
      employee_id: "",
      payroll_period_id: "",
      overtime_date: "",
      hours: "",
      description: "",
    },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!values.employee_id) nextErrors.employee_id = "Karyawan wajib dipilih";
    if (!values.payroll_period_id) nextErrors.payroll_period_id = "Periode penggajian wajib dipilih";
    if (!values.overtime_date) nextErrors.overtime_date = "Tanggal lembur wajib diisi";
    if (values.hours === "" || Number(values.hours) <= 0) nextErrors.hours = "Jam lembur harus lebih dari 0";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...values,
      hours: values.hours,
      description: values.description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Karyawan *" error={errors.employee_id}>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={values.employee_id}
          onChange={(event) => setValues((current) => ({ ...current, employee_id: event.target.value }))}
          disabled={isSubmitting}
          required
        >
          <option value="">-- Pilih Karyawan --</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.employee_code} - {employee.full_name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Periode Penggajian *" error={errors.payroll_period_id}>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={values.payroll_period_id}
          onChange={(event) => setValues((current) => ({ ...current, payroll_period_id: event.target.value }))}
          disabled={isSubmitting}
          required
        >
          <option value="">-- Pilih Periode --</option>
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.period_name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Tanggal Lembur *" error={errors.overtime_date}>
        <Input
          type="date"
          value={values.overtime_date}
          onChange={(event) => setValues((current) => ({ ...current, overtime_date: event.target.value }))}
          disabled={isSubmitting}
          required
        />
      </FormField>

      <FormField label="Jumlah Jam *" error={errors.hours}>
        <Input
          type="number"
          min="0.5"
          step="0.5"
          value={values.hours}
          onChange={(event) => setValues((current) => ({ ...current, hours: event.target.value }))}
          placeholder="Misal: 2.5"
          disabled={isSubmitting}
          required
        />
      </FormField>

      <FormField label="Deskripsi Pekerjaan">
        <Input
          value={values.description}
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          placeholder="Penjelasan ringkas pekerjaan lembur..."
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
