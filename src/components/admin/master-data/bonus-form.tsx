"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export interface BonusFormValues {
  employee_id: string;
  payroll_period_id: string;
  bonus_name: string;
  amount: string;
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

interface BonusFormProps {
  mode: "create" | "edit";
  initialValues?: BonusFormValues | null;
  employees: EmployeeOption[];
  periods: PayrollPeriodOption[];
  isSubmitting: boolean;
  apiError: string;
  onSubmit: (values: BonusFormValues) => Promise<void>;
  onCancel: () => void;
}

export function BonusForm({ mode, initialValues, employees, periods, isSubmitting, apiError, onSubmit, onCancel }: BonusFormProps) {
  const [values, setValues] = useState<BonusFormValues>(
    initialValues ?? {
      employee_id: "",
      payroll_period_id: "",
      bonus_name: "",
      amount: "",
      description: "",
    },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!values.employee_id) nextErrors.employee_id = "Karyawan wajib dipilih";
    if (!values.payroll_period_id) nextErrors.payroll_period_id = "Periode payroll wajib dipilih";
    if (!values.bonus_name.trim()) nextErrors.bonus_name = "Nama bonus wajib diisi";
    if (values.bonus_name.length > 100) nextErrors.bonus_name = "Nama bonus maksimal 100 karakter";
    if (values.amount === "" || Number(values.amount) <= 0) nextErrors.amount = "Jumlah bonus harus lebih dari 0";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...values,
      bonus_name: values.bonus_name.trim(),
      amount: values.amount,
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

      <FormField label="Periode Payroll *" error={errors.payroll_period_id}>
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

      <FormField label="Nama Bonus *" error={errors.bonus_name}>
        <Input
          value={values.bonus_name}
          onChange={(event) => setValues((current) => ({ ...current, bonus_name: event.target.value }))}
          maxLength={100}
          disabled={isSubmitting}
          required
        />
      </FormField>

      <FormField label="Jumlah Bonus *" error={errors.amount}>
        <Input
          type="number"
          min={1}
          step="1"
          value={values.amount}
          onChange={(event) => setValues((current) => ({ ...current, amount: event.target.value }))}
          disabled={isSubmitting}
          required
        />
      </FormField>

      <FormField label="Deskripsi">
        <Input
          value={values.description}
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
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
