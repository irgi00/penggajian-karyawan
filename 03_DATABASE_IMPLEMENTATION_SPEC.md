# 04_DATABASE_IMPLEMENTATION_SPEC

## Sistem Informasi Penggajian Berbasis Web

Status: FINAL

---

# Tujuan

Dokumen ini menjadi spesifikasi implementasi database PostgreSQL untuk proyek LSP Skema Analis Program.

Dokumen ini **bukan** berisi implementasi SQL, melainkan menjadi acuan bagi Agent atau Developer untuk menghasilkan database yang sesuai dengan seluruh keputusan desain yang telah disepakati.

Output implementasi yang dihasilkan adalah:

```
04_POSTGRESQL_DATABASE.sql
```

Seluruh implementasi harus mengikuti dokumen ini tanpa mengubah struktur database yang telah final.

---

# Source of Truth

1. 00_PROJECT_MASTER_SPEC.md
2. 01_DATABASE_BLUEPRINT.md
3. 02_DATABASE_SCHEMA_SPECIFICATION.md

ERD Final digunakan hanya sebagai referensi visual oleh pengembang apabila tersedia, namun bukan merupakan input wajib bagi Agent.

Agent wajib mengacu pada tiga dokumen di atas sebagai sumber kebenaran utama.

Tidak diperbolehkan mengubah:

- Business Rule
- Struktur tabel
- Relasi
- Nama tabel
- Nama kolom
- Naming Convention

kecuali terdapat instruksi eksplisit dari pengguna.

---

# Execution Environment

Target database:

- PostgreSQL 16+
- Neon PostgreSQL

Target execution:

- Neon SQL Editor
- psql

Seluruh SQL harus kompatibel dengan PostgreSQL standar.

---

# Target Implementasi

Agent harus menghasilkan satu file:

```
04_POSTGRESQL_DATABASE.sql
```

File tersebut harus dapat langsung dijalankan pada PostgreSQL (Neon) tanpa memerlukan perubahan manual.

Agent tidak boleh menghasilkan implementasi parsial.

Seluruh SQL harus berada dalam satu file:

04_POSTGRESQL_DATABASE.sql

File harus dapat dieksekusi dari awal hingga akhir tanpa memerlukan file SQL lain.

---

# Ruang Lingkup

Implementasi database meliputi:

- PostgreSQL Extension
- PostgreSQL ENUM
- CREATE TABLE
- PRIMARY KEY
- FOREIGN KEY
- CHECK Constraint
- UNIQUE Constraint
- DEFAULT Value
- INDEX
- Seed Data
- Transaction (BEGIN / COMMIT)

---

# Urutan Implementasi

Agent wajib mengikuti urutan berikut.

1. BEGIN TRANSACTION
2. CREATE EXTENSION
3. CREATE TYPE (ENUM)
4. CREATE TABLE
5. Constraint
6. Index
7. Seed Data
8. COMMIT

Urutan tabel harus mengikuti dependency relasi.

1. users
2. departments
3. payroll_periods
4. positions
5. employees
6. attendance_records
7. overtime_records
8. bonus_records
9. payrolls
10. payroll_details

---

# PostgreSQL Standard

Gunakan standar PostgreSQL modern.

## Primary Key

- UUID
- DEFAULT gen_random_uuid()

## Timestamp

Gunakan:

- TIMESTAMPTZ

Default:

- NOW()

## Nominal Uang

Gunakan:

NUMERIC(15,2)

Tidak diperbolehkan menggunakan:

- FLOAT
- DOUBLE

---

# Foreign Key Rules

Seluruh Foreign Key menggunakan:

ON UPDATE CASCADE

Untuk ON DELETE:

Data Master:

ON DELETE RESTRICT

Relasi Detail Payroll:

payroll_details → payrolls

menggunakan:

ON DELETE CASCADE

---

# Constraint Rules

Implementasikan seluruh constraint yang terdapat pada:

02_DATABASE_SCHEMA_SPECIFICATION.md

Minimal meliputi:

- PRIMARY KEY
- FOREIGN KEY
- UNIQUE
- CHECK
- DEFAULT

Agent tidak diperbolehkan menghilangkan constraint.

---

# ENUM

Agent wajib membuat seluruh ENUM PostgreSQL sesuai spesifikasi.

Minimal:

- user_role
- employment_status
- attendance_status
- payroll_status
- payroll_component_type

Nama ENUM tidak boleh diubah.

---

# Index

Buat INDEX sesuai Schema Specification.

Minimal:

- seluruh Foreign Key
- employee_code
- email
- code
- kolom yang digunakan untuk pencarian

Gunakan nama index yang konsisten.

---

# Seed Data

Agent wajib membuat data simulasi yang realistis.

Minimal terdiri dari:

Department

- HR
- Finance
- IT
- Marketing

Position

- HR Staff
- HR Manager
- Finance Staff
- Accountant
- Programmer
- System Analyst
- Marketing Staff

User

- 1 Administrator

Employee

Minimal 10 data.

Payroll Period

Minimal 2 periode.

Attendance

Data simulasi.

Overtime

Data simulasi.

Bonus

Data simulasi.

Payroll

Data simulasi.

Payroll Detail

Data simulasi.

Seluruh seed harus memenuhi seluruh Foreign Key.

---

# SQL Quality Standard

SQL yang dihasilkan harus:

- executable
- production-ready
- tanpa placeholder
- tanpa TODO
- tanpa contoh
- tanpa pseudocode

Seluruh SQL harus lengkap.

---

# Validation

Sebelum implementasi dianggap selesai, Agent wajib memastikan:

✓ Extension berhasil dibuat

✓ ENUM berhasil dibuat

✓ Seluruh tabel berhasil dibuat

✓ Seluruh Foreign Key valid

✓ Seluruh Constraint valid

✓ Seluruh Index berhasil dibuat

✓ Seed berhasil dijalankan

✓ Tidak ada syntax error

✓ Tidak ada dependency error

✓ SQL dapat dijalankan dari BEGIN hingga COMMIT tanpa modifikasi.

---

# Deliverable

Agent harus menghasilkan:

```
04_POSTGRESQL_DATABASE.sql
```

yang dapat langsung dijalankan pada Neon PostgreSQL.

---

# Completion Criteria

Tahap implementasi database dinyatakan selesai apabila:

- seluruh objek database berhasil dibuat;
- seluruh relasi sesuai ERD Final;
- seluruh constraint sesuai Schema Specification;
- seluruh seed berhasil dimasukkan;
- database dapat langsung digunakan oleh Backend API tanpa perubahan struktur.