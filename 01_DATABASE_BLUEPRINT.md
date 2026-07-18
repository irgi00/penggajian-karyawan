# 01_DATABASE_BLUEPRINT

## Sistem Informasi Penggajian Berbasis Web

Dokumen ini menjelaskan blueprint database yang telah disepakati dan
menjadi acuan sebelum pembuatan ERD, SQL, dan implementasi.

------------------------------------------------------------------------

# Ringkasan Database

Jumlah tabel: **10**

## Authentication

-   users

## Master Data

-   departments
-   positions
-   employees

## Data Operasional

-   attendance_records
-   overtime_records
-   bonus_records

## Penggajian

-   payroll_periods
-   payrolls
-   payroll_details

------------------------------------------------------------------------

# 1. users

## Tujuan

Menyimpan akun autentikasi dan otorisasi pengguna.

### Business Rules

-   Email unik.
-   Password disimpan dalam bentuk hash.
-   Satu akun dimiliki satu karyawan.
-   Role: ADMIN, EMPLOYEE.

### Kolom

  Kolom           Tipe           Keterangan
  --------------- -------------- ------------------
  id              UUID           PK
  email           VARCHAR(100)   UNIQUE
  password_hash   VARCHAR(255)   Password hash
  role            ENUM           ADMIN / EMPLOYEE
  is_active       BOOLEAN        Status akun
  created_at      TIMESTAMP      Audit
  updated_at      TIMESTAMP      Audit

------------------------------------------------------------------------

# 2. departments

## Tujuan

Menyimpan data departemen perusahaan.

### Business Rules

-   Nama dan kode unik.
-   Memiliki banyak jabatan.
-   Tidak boleh dihapus jika masih memiliki jabatan.

### Kolom

id, code, name, description, created_at, updated_at

------------------------------------------------------------------------

# 3. positions

## Tujuan

Menyimpan jabatan beserta standar gaji.

### Business Rules

-   Satu jabatan berada pada satu departemen.
-   Basic Salary berasal dari tabel ini.
-   Position Allowance berasal dari tabel ini.
-   Tidak boleh dihapus jika masih digunakan employee.

### Kolom

id, department_id, code, name, basic_salary, position_allowance,
created_at, updated_at

------------------------------------------------------------------------

# 4. employees

## Tujuan

Menyimpan data karyawan.

### Business Rules

-   Employee hanya menyimpan position_id.
-   Department diperoleh melalui Position.
-   Salary Override bersifat opsional.
-   Employee tidak dihapus, hanya RESIGNED.

### Kolom

id, user_id, position_id, employee_code, full_name, gender, phone,
address, join_date, resign_date, employment_status, salary_override,
created_at, updated_at

------------------------------------------------------------------------

# 5. attendance_records

## Tujuan

Menyimpan absensi harian.

### Business Rules

-   Satu record = satu karyawan pada satu hari kerja.
-   Status: PRESENT atau ALPHA.
-   UNIQUE(employee_id, attendance_date)

### Kolom

id, employee_id, payroll_period_id, attendance_date, status, created_at,
updated_at

------------------------------------------------------------------------

# 6. overtime_records

## Tujuan

Menyimpan data lembur.

### Business Rules

-   Satu record = satu aktivitas lembur.
-   hours \> 0

### Kolom

id, employee_id, payroll_period_id, overtime_date, hours, description,
created_at, updated_at

------------------------------------------------------------------------

# 7. bonus_records

## Tujuan

Menyimpan bonus.

### Business Rules

-   Bonus dapat lebih dari satu dalam satu periode.
-   amount \> 0

### Kolom

id, employee_id, payroll_period_id, bonus_name, amount, description,
created_at, updated_at

------------------------------------------------------------------------

# 8. payroll_periods

## Tujuan

Menyimpan periode penggajian.

### Business Rules

-   Working Days dihitung otomatis.
-   Nama periode unik.
-   Periode tidak boleh bertabrakan.

### Kolom

id, period_name, start_date, end_date, working_days, created_at,
updated_at

------------------------------------------------------------------------

# 9. payrolls

## Tujuan

Menyimpan header/snapshot payroll.

### Business Rules

-   Snapshot payroll.
-   UNIQUE(employee_id, payroll_period_id).
-   Status: DRAFT → APPROVED → PAID.

### Kolom

id, payroll_period_id, employee_id, basic_salary, position_allowance,
gross_salary, total_deduction, net_salary, status, generated_at,
approved_at, paid_at, created_at, updated_at

------------------------------------------------------------------------

# 10. payroll_details

## Tujuan

Menyimpan rincian komponen payroll.

### Business Rules

-   Satu payroll memiliki banyak detail.
-   Menyimpan komponen INCOME dan DEDUCTION.
-   Tidak terjadi redundansi data.

### Kolom

id, payroll_id, component_name, component_type, amount, created_at

------------------------------------------------------------------------

# Relasi Utama

-   departments (1) -\> (N) positions
-   positions (1) -\> (N) employees
-   employees (1) -\> (N) attendance_records
-   employees (1) -\> (N) overtime_records
-   employees (1) -\> (N) bonus_records
-   payroll_periods (1) -\> (N) attendance_records
-   payroll_periods (1) -\> (N) overtime_records
-   payroll_periods (1) -\> (N) bonus_records
-   payroll_periods (1) -\> (N) payrolls
-   employees (1) -\> (N) payrolls
-   payrolls (1) -\> (N) payroll_details

------------------------------------------------------------------------

# Status Dokumen

Status: FINAL

Tahap berikutnya: 1. Database Schema Specification 2. ERD Final 3. SQL
CREATE TABLE PostgreSQL
