"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export interface EmployeeFormValues {
  employee_code: string;
  full_name: string;
  position_id: string;
  email: string;
  password: string;
  gender: string;
  phone: string;
  address: string;
  join_date: string;
  salary_override: string;
  employment_status?: string;
}

interface PositionOption {
  id: string;
  code: string;
  name: string;
  department_name: string;
}

interface EmployeeFormProps {
  mode: "create" | "edit";
  initialValues?: EmployeeFormValues | null;
  positions: PositionOption[];
  isSubmitting: boolean;
  apiError: string;
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  onCancel: () => void;
}

const defaultValues: EmployeeFormValues = {
  employee_code: "",
  full_name: "",
  position_id: "",
  email: "",
  password: "",
  gender: "L",
  phone: "",
  address: "",
  join_date: "",
  salary_override: "",
  employment_status: "",
};

export function EmployeeForm({ mode, initialValues, positions, isSubmitting, apiError, onSubmit, onCancel }: EmployeeFormProps) {
  const [values, setValues] = useState<EmployeeFormValues>(initialValues ?? defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (mode === "create" && !values.employee_code.trim()) nextErrors.employee_code = "NIK / kode karyawan wajib diisi";
    if (mode === "create" && values.employee_code.length > 50) nextErrors.employee_code = "NIK / kode karyawan maksimal 50 karakter";
    if (!values.full_name.trim()) nextErrors.full_name = "Nama lengkap wajib diisi";
    if (values.full_name.length > 100) nextErrors.full_name = "Nama lengkap maksimal 100 karakter";
    if (!values.position_id) nextErrors.position_id = "Jabatan wajib dipilih";
    if (mode === "create" && !values.email.trim()) nextErrors.email = "Email wajib diisi";
    if (mode === "create" && values.email && !/^\S+@\S+\.\S+$/.test(values.email)) nextErrors.email = "Email harus valid";
    if (mode === "create" && (!values.password || values.password.length < 8)) nextErrors.password = "Password wajib diisi minimal 8 karakter";
    if (!values.gender || (values.gender !== "L" && values.gender !== "P")) nextErrors.gender = "Jenis kelamin wajib dipilih";
    if (!values.join_date) nextErrors.join_date = "Tanggal bergabung wajib diisi";
    if (values.salary_override !== "" && Number(values.salary_override) < 0) nextErrors.salary_override = "Salary override minimal 0";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      ...values,
      employee_code: values.employee_code.trim(),
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      password: values.password,
      phone: values.phone.trim(),
      address: values.address.trim(),
      join_date: values.join_date,
      salary_override: values.salary_override,
      employment_status: values.employment_status,
    });
  };

  const fieldClassName = "space-y-4";
  const selectClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {mode === "create" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="NIK / Kode Karyawan *" error={errors.employee_code} className={fieldClassName}>
              <Input
                value={values.employee_code}
                onChange={(event) => setValues((current) => ({ ...current, employee_code: event.target.value }))}
                maxLength={50}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <FormField label="Nama Lengkap *" error={errors.full_name} className={fieldClassName}>
              <Input
                value={values.full_name}
                onChange={(event) => setValues((current) => ({ ...current, full_name: event.target.value }))}
                maxLength={100}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <FormField label="Jabatan *" error={errors.position_id} className={fieldClassName}>
              <select
                className={selectClassName}
                value={values.position_id}
                onChange={(event) => setValues((current) => ({ ...current, position_id: event.target.value }))}
                disabled={isSubmitting}
                required
              >
                <option value="">-- Pilih Jabatan --</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.code} - {position.name} ({position.department_name})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Email *" error={errors.email} className={fieldClassName}>
              <Input
                type="email"
                value={values.email}
                onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <FormField label="Password *" error={errors.password} className={fieldClassName}>
              <Input
                type="password"
                value={values.password}
                onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                minLength={8}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <FormField label="Jenis Kelamin *" error={errors.gender} className={fieldClassName}>
              <select
                className={selectClassName}
                value={values.gender}
                onChange={(event) => setValues((current) => ({ ...current, gender: event.target.value }))}
                disabled={isSubmitting}
                required
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </FormField>

            <FormField label="Nomor Telepon" error={errors.phone} className={fieldClassName}>
              <Input
                value={values.phone}
                onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Tanggal Bergabung *" error={errors.join_date} className={fieldClassName}>
              <Input
                type="date"
                value={values.join_date}
                onChange={(event) => setValues((current) => ({ ...current, join_date: event.target.value }))}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <FormField label="Salary Override" error={errors.salary_override} className={fieldClassName}>
              <Input
                type="number"
                min={0}
                value={values.salary_override}
                onChange={(event) => setValues((current) => ({ ...current, salary_override: event.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>

            <div className="hidden md:block" aria-hidden="true" />

            <FormField label="Alamat" error={errors.address} className="md:col-span-2 space-y-4">
              <Input
                value={values.address}
                onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label="NIK / Kode Karyawan *" error={errors.employee_code} className={fieldClassName}>
              <Input
                value={values.employee_code}
                onChange={(event) => setValues((current) => ({ ...current, employee_code: event.target.value }))}
                maxLength={50}
                disabled={true}
                required={false}
              />
            </FormField>

            <FormField label="Nama Lengkap *" error={errors.full_name} className={fieldClassName}>
              <Input
                value={values.full_name}
                onChange={(event) => setValues((current) => ({ ...current, full_name: event.target.value }))}
                maxLength={100}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <FormField label="Jabatan *" error={errors.position_id} className={fieldClassName}>
              <select
                className={selectClassName}
                value={values.position_id}
                onChange={(event) => setValues((current) => ({ ...current, position_id: event.target.value }))}
                disabled={isSubmitting}
                required
              >
                <option value="">-- Pilih Jabatan --</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.code} - {position.name} ({position.department_name})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Status" className={fieldClassName}>
              <Input value={values.employment_status || "-"} disabled />
            </FormField>

            <FormField label="Jenis Kelamin *" error={errors.gender} className={fieldClassName}>
              <select
                className={selectClassName}
                value={values.gender}
                onChange={(event) => setValues((current) => ({ ...current, gender: event.target.value }))}
                disabled={isSubmitting}
                required
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </FormField>

            <FormField label="Nomor Telepon" error={errors.phone} className={fieldClassName}>
              <Input
                value={values.phone}
                onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Alamat" error={errors.address} className={fieldClassName}>
              <Input
                value={values.address}
                onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Tanggal Bergabung *" error={errors.join_date} className={fieldClassName}>
              <Input
                type="date"
                value={values.join_date}
                onChange={(event) => setValues((current) => ({ ...current, join_date: event.target.value }))}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <FormField label="Salary Override" error={errors.salary_override} className={fieldClassName}>
              <Input
                type="number"
                min={0}
                value={values.salary_override}
                onChange={(event) => setValues((current) => ({ ...current, salary_override: event.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        )}

        {apiError ? <p className="mt-4 text-sm text-destructive">{apiError}</p> : null}
      </div>

      <div className="sticky bottom-0 shrink-0 border-t bg-background pt-4">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : mode === "create" ? "Simpan" : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </form>
  );
}

