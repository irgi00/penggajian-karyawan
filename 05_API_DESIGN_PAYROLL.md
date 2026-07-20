# 05_API_DESIGN_PAYROLL

## Sistem Informasi Penggajian Berbasis Web

Dokumen ini mendefinisikan desain REST API untuk modul Penggajian (Payroll Period, Payroll) dan menjadi acuan mutlak implementasi backend.

---

## 1. Payroll Period API

### 1.1 Get All Payroll Periods
**Endpoint**: `/api/payroll-periods`
**HTTP Method**: `GET`
**Tujuan**: Mendapatkan daftar periode penggajian.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Business Rule**
- Ambil seluruh data dari tabel `payroll_periods` diurutkan berdasarkan `start_date` secara descending.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil data periode penggajian",
  "data": {
    "payroll_periods": [
      {
        "id": "uuid-string",
        "period_name": "Januari 2024",
        "start_date": "2024-01-01",
        "end_date": "2024-01-31",
        "working_days": 23
      }
    ]
  }
}
```

### 1.2 Create Payroll Period
**Endpoint**: `/api/payroll-periods`
**HTTP Method**: `POST`
**Tujuan**: Membuat periode penggajian baru.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "period_name": "Januari 2024",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Validation Rule**
- `period_name`: Required, string, maksimal 50 karakter, harus unik.
- `start_date`: Required, format YYYY-MM-DD.
- `end_date`: Required, format YYYY-MM-DD.

**Business Rule**
- Pastikan `start_date` <= `end_date`.
- Pastikan `period_name` belum ada di database.
- Hitung `working_days` secara otomatis di backend: Jumlah hari kerja dari `start_date` hingga `end_date` (exclude Sabtu dan Minggu, asumsikan tidak ada perhitungan hari libur nasional otomatis selain sabtu/minggu sesuai Master Spec).
- Insert ke tabel `payroll_periods`.

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Periode penggajian berhasil dibuat",
  "data": {
    "payroll_period": {
      "id": "uuid-string",
      "period_name": "Januari 2024",
      "working_days": 23
    }
  }
}
```

---

## 2. Payroll Process API

### 2.1 Simulate Payroll (Simulasi Penggajian)
**Endpoint**: `/api/payrolls/simulate`
**HTTP Method**: `POST`
**Tujuan**: Melakukan kalkulasi penggajian sementara tanpa menyimpannya ke database.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "payroll_period_id": "uuid-string"
}
```

**Validation Rule**
- `payroll_period_id`: Required, valid UUID.

**Business Rule**
- Ambil seluruh karyawan dengan `employment_status = ACTIVE`.
- Untuk setiap karyawan, hitung komponen penggajian berdasarkan algoritma:
  1. `Basic Salary` = (Basic Salary Position ATAU Salary Override Employee) * (Present Days / Working Days)
  2. `Gross Salary` = Basic Salary + Position Allowance + Total Lembur + Total Bonus
  3. `Total Deduction` = BPJS (misal persentase flat atau 0 sesuai simplifikasi) + Pajak
  4. `Net Salary` = Gross Salary - Total Deduction
- Kumpulkan hasil kalkulasi dalam satu array JSON dan kembalikan ke Frontend.
- TIDAK melakukan operasi INSERT/UPDATE ke database.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Simulasi berhasil",
  "data": {
    "simulations": [
      {
        "employee_id": "uuid-string",
        "employee_name": "Budi Santoso",
        "basic_salary": 9500000,
        "position_allowance": 2000000,
        "gross_salary": 11500000,
        "total_deduction": 500000,
        "net_salary": 11000000
      }
    ]
  }
}
```

### 2.2 Process Payroll (Draft)
**Endpoint**: `/api/payrolls/process`
**HTTP Method**: `POST`
**Tujuan**: Melakukan proses penggajian secara permanen dan menyimpannya sebagai DRAFT.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "payroll_period_id": "uuid-string"
}
```

**Business Rule**
- Mulai Database Transaction.
- Lakukan kalkulasi yang SAMA PERSIS dengan proses simulasi.
- Pastikan periode ini belum memiliki data payroll untuk karyawan tersebut (UNIQUE `employee_id`, `payroll_period_id`).
- Insert header penggajian ke tabel `payrolls` dengan status = `DRAFT` dan `generated_at` = waktu saat ini.
- Iterasi dan Insert seluruh komponen rincian (Gaji Pokok, Tunjangan, Lembur, Bonus, Potongan) ke tabel `payroll_details` yang merujuk pada `payroll_id` yang baru dibuat.
- Commit Transaction.

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Penggajian berhasil diproses (Draft)",
  "data": {}
}
```

### 2.3 Get Payrolls by Period
**Endpoint**: `/api/payrolls`
**HTTP Method**: `GET`
**Tujuan**: Mendapatkan daftar payroll pada suatu periode penggajian tertentu.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN` (Bisa juga Employee melihat miliknya sendiri, namun dibuat endpoint terpisah untuk Employee Self Service agar aman).

**Request Query**
- `payroll_period_id`: Required, valid UUID.

**Business Rule**
- Ambil daftar `payrolls` beserta nama karyawan dari tabel `employees`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil data penggajian",
  "data": {
    "payrolls": [
      {
        "id": "uuid-string",
        "employee_name": "Budi Santoso",
        "net_salary": 11000000,
        "status": "DRAFT"
      }
    ]
  }
}
```

### 2.4 Approve Payroll
**Endpoint**: `/api/payrolls/:id/approve`
**HTTP Method**: `PUT`
**Tujuan**: Menyetujui slip gaji (mengubah status DRAFT menjadi APPROVED).

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Business Rule**
- Pastikan status saat ini adalah `DRAFT`.
- Ubah `status` menjadi `APPROVED` dan catat waktu pada kolom `approved_at`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Penggajian berhasil disetujui",
  "data": {}
}
```

### 2.5 Pay Payroll
**Endpoint**: `/api/payrolls/:id/pay`
**HTTP Method**: `PUT`
**Tujuan**: Menandai slip gaji sebagai telah dibayar (mengubah status APPROVED menjadi PAID).

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Business Rule**
- Pastikan status saat ini adalah `APPROVED`.
- Ubah `status` menjadi `PAID` dan catat waktu pada kolom `paid_at`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Penggajian ditandai telah dibayar",
  "data": {}
}
```

### 2.6 Get Payroll Details (Slip Gaji)
**Endpoint**: `/api/payrolls/:id`
**HTTP Method**: `GET`
**Tujuan**: Melihat rincian lengkap komponen penggajian (Slip Gaji).

**Authorization**
- Memerlukan token JWT valid dari Cookie (Role `ADMIN`, ATAU `EMPLOYEE` namun Employee HANYA BISA melihat `id` payroll miliknya sendiri).

**Business Rule**
- Ambil header dari tabel `payrolls`.
- Lakukan JOIN atau query tambahan ke tabel `payroll_details` untuk mendapatkan seluruh komponen `INCOME` dan `DEDUCTION`.
- Jika request datang dari role `EMPLOYEE`, pastikan data `payrolls.employee_id` cocok dengan data karyawan `current user`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil rincian penggajian",
  "data": {
    "payroll": {
      "id": "uuid-string",
      "employee_name": "Budi Santoso",
      "period_name": "Januari 2024",
      "status": "PAID",
      "basic_salary": 9500000,
      "position_allowance": 2000000,
      "gross_salary": 11500000,
      "total_deduction": 500000,
      "net_salary": 11000000,
      "details": [
        {
          "component_name": "Gaji Pokok",
          "component_type": "INCOME",
          "amount": 9500000
        },
        {
          "component_name": "Tunjangan Jabatan",
          "component_type": "INCOME",
          "amount": 2000000
        },
        {
          "component_name": "Pajak",
          "component_type": "DEDUCTION",
          "amount": 500000
        }
      ]
    }
  }
}
```

---
**Status**: FINAL (Payroll Module)
