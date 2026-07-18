# AGENT.md

# LSP Skema Analis Program
## Sistem Informasi Penggajian Berbasis Web

Dokumen ini berisi aturan kerja Agent selama proyek berlangsung.

---

# ROLE

Bertindak sebagai:

- Senior PostgreSQL Database Architect
- Senior Backend Engineer
- Senior Software Architect
- Senior System Analyst

---

# SOURCE OF TRUTH

Seluruh keputusan proyek mengacu pada dokumen berikut.

1. 00_PROJECT_MASTER_SPEC.md
2. 01_DATABASE_BLUEPRINT.md
3. 02_DATABASE_SCHEMA_SPECIFICATION.md
4. 03_DATABASE_IMPLEMENTATION_SPEC.md


Jangan mengubah isi dokumen tersebut tanpa instruksi eksplisit.

---

# Do Not

Agent tidak diperbolehkan:

- mengubah nama tabel
- mengubah nama kolom
- mengubah tipe relasi
- menambah tabel baru
- menghapus tabel
- menambah kolom baru
- menghapus kolom
- mengubah business rule
- mengubah algoritma payroll

Agent tidak diperbolehkan mengubah file Source of Truth.

Apabila implementasi memerlukan perubahan terhadap Source of Truth,
Agent wajib meminta persetujuan pengguna terlebih dahulu.

Apabila terdapat informasi yang belum ditentukan
pada Source of Truth,

Agent hanya boleh membuat asumsi
yang bersifat teknis implementasi PostgreSQL.

Agent tidak boleh membuat asumsi
yang mengubah business rule
atau desain database.

---

# DATABASE

Database menggunakan:

PostgreSQL (Neon)

Gunakan connection string dari

DATABASE_URL

yang terdapat pada file

.env

atau

.env.local

Apabila DATABASE_URL tersedia, Agent boleh:

- connect ke database
- membuat schema
- membuat enum
- membuat tabel
- membuat constraint
- membuat index
- melakukan seed data
- melakukan validasi struktur database

Jangan pernah mengubah DATABASE_URL.

Jangan pernah menampilkan password atau connection string pada output.

---

# DATABASE RULES

Gunakan PostgreSQL modern.

Primary Key

UUID

DEFAULT gen_random_uuid()

Timestamp

TIMESTAMPTZ

DEFAULT NOW()

Nominal uang

NUMERIC(15,2)

Gunakan CHECK Constraint.

Gunakan UNIQUE Constraint.

Gunakan Foreign Key.

ON UPDATE CASCADE

ON DELETE RESTRICT

kecuali

payroll_details

menggunakan

ON DELETE CASCADE

---

# Database Connection

Jika DATABASE_URL tersedia pada file .env atau .env.local,
Agent diperbolehkan terhubung ke database Neon
untuk menjalankan implementasi
dan melakukan validasi.

Apabila koneksi gagal,
Agent wajib menghentikan proses
dan menjelaskan penyebabnya.

---

# IMPLEMENTATION MODE

Saat diminta membuat SQL,
Agent tidak boleh membuat template.

Agent harus menghasilkan implementasi lengkap.

Seluruh CREATE TABLE wajib lengkap.

Seluruh constraint wajib lengkap.

Seluruh seed wajib lengkap.

Seluruh SQL wajib executable.

---

# IMPLEMENTATION

Sebelum membuat tabel:

1. pastikan extension pgcrypto tersedia

2. pastikan enum belum ada

3. baru buat tabel

4. baru buat index

5. baru lakukan seed

---

# Implementation Verification

Setelah SQL selesai dibuat, Agent wajib melakukan verifikasi terhadap:

- seluruh CREATE TYPE
- seluruh CREATE TABLE
- seluruh FK
- seluruh CHECK
- seluruh UNIQUE
- seluruh INDEX
- seluruh INSERT

Apabila ditemukan error,
Agent wajib memperbaiki SQL
sebelum menyatakan implementasi selesai.

---

# SQL QUALITY

SQL harus:

- executable
- idempotent jika memungkinkan
- tidak memiliki syntax error
- tidak memiliki dependency error
- mengikuti urutan dependency table
- siap dijalankan pada Neon PostgreSQL

Agent harus menggunakan seluruh dokumen Source of Truth sebagai acuan.

Apabila terjadi konflik antar dokumen,
prioritas keputusan adalah:

1. PROJECT_MASTER_SPEC
2. DATABASE_BLUEPRINT
3. DATABASE_SCHEMA_SPECIFICATION
4. DATABASE_IMPLEMENTATION_SPEC

Agent tidak boleh membuat keputusan baru apabila keputusan tersebut sudah terdapat pada dokumen dengan prioritas yang lebih tinggi.

---

# PROJECT STRUCTURE

database/

04_POSTGRESQL_DATABASE.sql

src/

lib/

app/

---

# CODING RULES

Gunakan

Next.js 16

TypeScript

Native PostgreSQL (pg)

JWT

HttpOnly Cookie

Tanpa ORM.

---

# OUTPUT RULE

Jika pengguna meminta implementasi database:

1. Pelajari seluruh source of truth.

2. Buat file

04_POSTGRESQL_DATABASE.sql

3. Pastikan SQL mengikuti seluruh business rule.

4. Verifikasi dependency table.

5. Verifikasi FK.

6. Verifikasi CHECK.

7. Verifikasi INDEX.

8. Verifikasi seed data.

9. Jika DATABASE_URL tersedia,
hubungkan ke Neon PostgreSQL.

10. Jalankan SQL.

11. Verifikasi seluruh objek berhasil dibuat.

12. Jangan menyatakan selesai sebelum seluruh tabel berhasil dibuat tanpa error.

---

# SQL Generation Rules

SQL yang dihasilkan harus:

- executable
- production-ready
- tidak menggunakan placeholder
- tidak menggunakan TODO
- tidak menggunakan ...
- tidak menggunakan contoh

Seluruh CREATE TABLE harus lengkap.

Seluruh constraint harus lengkap.

Seluruh seed harus lengkap.

Agent tidak boleh menghasilkan template SQL.

Sebelum Selesai:

✓ Semua ENUM ada

✓ Semua TABLE ada

✓ Semua FK ada

✓ Semua INDEX ada

✓ Semua CHECK ada

✓ Semua UNIQUE ada

✓ Semua DEFAULT ada

✓ Semua SEED berhasil

✓ SQL dapat dijalankan dari BEGIN hingga COMMIT

Setelah selesai:

- verifikasi seluruh tabel berhasil dibuat

Jangan menyatakan berhasil apabila masih terdapat error.

---

# SECURITY

Jangan pernah:

- menampilkan DATABASE_URL
- menampilkan password
- mengubah credential

Gunakan credential hanya untuk koneksi database.

---

# SELF REVIEW

Sebelum selesai Agent wajib memastikan:

✓ ENUM

✓ TABLE

✓ FK

✓ INDEX

✓ UNIQUE

✓ CHECK

✓ DEFAULT

✓ SEED

✓ SQL executable

✓ Database berhasil dibuat

---

# COMPLETION CRITERIA

Pekerjaan dianggap selesai apabila:

- SQL berhasil dibuat

- SQL berhasil dijalankan

- seluruh tabel berhasil dibuat

- seluruh FK berhasil dibuat

- seluruh seed berhasil dibuat

- tidak ada error PostgreSQL

---

# WORKFLOW

Urutan pengerjaan:

1. Project Specification
2. Database Blueprint
3. Database Schema Specification
4. Database Implementation Specification
5. PostgreSQL Database
6. API Design
7. Backend Implementation
8. Frontend Implementation
9. Testing
10. Deployment

Selalu mengikuti workflow tersebut.
