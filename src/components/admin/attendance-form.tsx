"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export interface AttendanceFormValues {
  employee_id: string;
  payroll_period_id: string;
  attendance_date: string;
  status: string;
}

interface EmployeeOption {
  id: string;
  employee_code: string;
  full_name: string;
}

interface PeriodOption {
  id: string;
  start_date: string;
  end_date: string;
}

interface AttendanceFormProps {
  initialValues?: AttendanceFormValues | null;
  employees: EmployeeOption[];
  periods: PeriodOption[];
  isSubmitting: boolean;
  apiError: string;
  onSubmit: (values: AttendanceFormValues) => Promise<void>;
  onCancel: () => void;
}

const defaultValues: AttendanceFormValues = {
  employee_id: "",
  payroll_period_id: "",
  attendance_date: "",
  status: "PRESENT",
};

export function AttendanceForm({ initialValues, employees, periods, isSubmitting, apiError, onSubmit, onCancel }: AttendanceFormProps) {
  const [values, setValues] = useState<AttendanceFormValues>(initialValues ?? defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!values.employee_id) nextErrors.employee_id = "Karyawan wajib dipilih";
    if (!values.payroll_period_id) nextErrors.payroll_period_id = "Periode penggajian wajib dipilih";
    if (!values.attendance_date) nextErrors.attendance_date = "Tanggal absensi wajib diisi";
    if (!values.status || !["PRESENT", "ALPHA"].includes(values.status)) nextErrors.status = "Status kehadiran wajib dipilih";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      employee_id: values.employee_id,
      payroll_period_id: values.payroll_period_id,
      attendance_date: values.attendance_date,
      status: values.status,
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
              {new Date(period.start_date).toLocaleDateString("id-ID")} - {new Date(period.end_date).toLocaleDateString("id-ID")}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Tanggal *" error={errors.attendance_date}>
        <Input
          type="date"
          value={values.attendance_date}
          onChange={(event) => setValues((current) => ({ ...current, attendance_date: event.target.value }))}
          disabled={isSubmitting}
          required
        />
      </FormField>

      <FormField label="Status Kehadiran *" error={errors.status}>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={values.status}
          onChange={(event) => setValues((current) => ({ ...current, status: event.target.value }))}
          disabled={isSubmitting}
          required
        >
          <option value="PRESENT">Hadir</option>
          <option value="ALPHA">Alpha / Tidak Hadir</option>
        </select>
      </FormField>

      {apiError ? <p className="text-sm text-destructive">{apiError}</p> : null}

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Data"}
        </Button>
      </div>
    </form>
  );
}
