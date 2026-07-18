# PROJECT MASTER SPEC

## LSP Skema Analis Program

### Studi Kasus: Sistem Informasi Penggajian Berbasis Web

> Dokumen ini merupakan sumber kebenaran (single source of truth)
> proyek. Semua keputusan di bawah dianggap **FINAL** kecuali pengguna
> meminta perubahan secara eksplisit.

# Peran Assistant

Bertindak sebagai: - Senior System Analyst - Database Architect -
Software Architect - Full Stack Engineer

Jangan mengubah keputusan final tanpa persetujuan pengguna. Selalu
berikan alasan teknis jika mengusulkan perubahan.

# Teknologi

-   Next.js 16 (App Router)
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   PostgreSQL (Neon)
-   SQL Native (`pg`)
-   JWT + HttpOnly Cookie
-   Tanpa ORM (Prisma/Drizzle)

# Dataset

Menggunakan data simulasi (fiktif).

# Aktor

## Admin HR

-   Login
-   Kelola Departemen
-   Kelola Jabatan
-   Kelola Karyawan
-   Kelola Absensi
-   Kelola Lembur
-   Kelola Bonus
-   Kelola Periode Penggajian
-   Simulasi Penggajian
-   Proses Penggajian
-   Setujui Penggajian
-   Tandai Sudah Dibayar
-   Lihat Slip Gaji
-   Ekspor Laporan

## Karyawan

-   Login
-   Lihat Slip Gaji

# Business Rule

-   Hari kerja Senin--Jumat
-   Sabtu & Minggu libur
-   Jam kerja 08.00--17.00
-   Istirahat 12.00--13.00
-   Working Days dihitung otomatis (tanpa hari libur nasional)

# Penggajian

-   Basic Salary berasal dari Position
-   Salary Override opsional pada Employee
-   Payroll menggunakan Snapshot
-   Simulasi tidak disimpan
-   Status: Draft → Approved → Paid

# Algoritma

Basic Salary = Basic Salary Position × (Present Days / Working Days)

Gross Salary = - Basic Salary - Position Allowance - Overtime - Bonus

Total Deduction = - BPJS - Pajak

Net Salary = Gross Salary − Total Deduction

# CRUD Rule

## Department

-   Tambah
-   Edit
-   Hapus jika belum memiliki Position

## Position

-   Tambah
-   Edit
-   Hapus jika belum digunakan Employee

## Employee

-   Tambah
-   Edit
-   Resign
-   Tidak dihapus permanen

# Database Final

1.  users
2.  departments
3.  positions
4.  employees
5.  attendance_records
6.  overtime_records
7.  bonus_records
8.  payroll_periods
9.  payrolls
10. payroll_details

# Keputusan Desain

-   Department → Position → Employee
-   Employee tidak menyimpan department_id
-   Salary berada pada Position
-   Salary Override berada pada Employee
-   Payroll menyimpan ringkasan
-   Payroll Details menyimpan rincian komponen
-   Mengikuti prinsip normalisasi
-   Nama tabel & API menggunakan Bahasa Inggris
-   UI & Use Case menggunakan Bahasa Indonesia

# Roadmap

1.  Database Schema Specification
2.  ERD Final
3.  SQL CREATE TABLE
4.  Seed Data
5.  Backend API
6.  Frontend
7.  Payroll Engine
8.  Authentication
9.  Testing
10. Dokumentasi

# Catatan

Seluruh pengembangan berikutnya harus mengacu pada dokumen ini.
