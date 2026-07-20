# 05_API_DESIGN_OPERASIONAL

## Sistem Informasi Penggajian Berbasis Web

Dokumen ini mendefinisikan desain REST API untuk modul Operasional (Attendance, Overtime, Bonus) dan menjadi acuan mutlak implementasi backend.

---

## 1. Attendance API

### 1.1 Get All Attendance
**Endpoint**: `/api/attendance`
**HTTP Method**: `GET`
**Tujuan**: Mendapatkan daftar absensi, dapat difilter berdasarkan periode penggajian.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Query**
- `payroll_period_id` (Optional, valid UUID)

**Business Rule**
- Ambil data absensi dari tabel `attendance_records`.
- Lakukan JOIN dengan `employees` untuk mendapatkan `employee_code` dan `full_name`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil data absensi",
  "data": {
    "attendance_records": [
      {
        "id": "uuid-string",
        "employee_name": "Budi Santoso",
        "attendance_date": "2024-01-15",
        "status": "PRESENT"
      }
    ]
  }
}
```

### 1.2 Input/Record Attendance
**Endpoint**: `/api/attendance`
**HTTP Method**: `POST`
**Tujuan**: Mencatat kehadiran karyawan pada tanggal tertentu.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "employee_id": "uuid-string",
  "payroll_period_id": "uuid-string",
  "attendance_date": "2024-01-15",
  "status": "PRESENT"
}
```

**Validation Rule**
- `employee_id`: Required, valid UUID.
- `payroll_period_id`: Required, valid UUID.
- `attendance_date`: Required, format YYYY-MM-DD.
- `status`: Required, enum `PRESENT` atau `ALPHA`.

**Business Rule**
- Validasi kombinasi UNIK `employee_id` dan `attendance_date` di database. Jika sudah ada, kembalikan error.
- Pastikan `attendance_date` berada di dalam rentang `start_date` dan `end_date` dari periode penggajian (`payroll_period_id`) terkait.
- Insert ke tabel `attendance_records`.

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Absensi berhasil dicatat",
  "data": {
    "attendance": {
      "id": "uuid-string"
    }
  }
}
```

---

## 2. Overtime API

### 2.1 Get All Overtime
**Endpoint**: `/api/overtime`
**HTTP Method**: `GET`
**Tujuan**: Mendapatkan daftar lembur.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Query**
- `payroll_period_id` (Optional, valid UUID)

**Business Rule**
- Ambil data lembur dari tabel `overtime_records`.
- Lakukan JOIN dengan `employees`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil data lembur",
  "data": {
    "overtime_records": [
      {
        "id": "uuid-string",
        "employee_name": "Budi Santoso",
        "overtime_date": "2024-01-16",
        "hours": 2.5,
        "description": "Lembur akhir bulan"
      }
    ]
  }
}
```

### 2.2 Record Overtime
**Endpoint**: `/api/overtime`
**HTTP Method**: `POST`
**Tujuan**: Mencatat aktivitas lembur karyawan.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "employee_id": "uuid-string",
  "payroll_period_id": "uuid-string",
  "overtime_date": "2024-01-16",
  "hours": 2.5,
  "description": "Penyelesaian server error"
}
```

**Validation Rule**
- `employee_id`: Required, valid UUID.
- `payroll_period_id`: Required, valid UUID.
- `overtime_date`: Required, format YYYY-MM-DD.
- `hours`: Required, numeric, HARUS lebih dari 0.
- `description`: Optional, string.

**Business Rule**
- Pastikan jam lembur (`hours`) bernilai positif (> 0).
- Insert ke tabel `overtime_records`.

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Data lembur berhasil dicatat",
  "data": {
    "overtime": {
      "id": "uuid-string"
    }
  }
}
```

---

## 3. Bonus API

### 3.1 Get All Bonus
**Endpoint**: `/api/bonus`
**HTTP Method**: `GET`
**Tujuan**: Mendapatkan daftar bonus karyawan.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Query**
- `payroll_period_id` (Optional, valid UUID)

**Business Rule**
- Ambil data bonus dari tabel `bonus_records`.
- Lakukan JOIN dengan `employees`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil data bonus",
  "data": {
    "bonus_records": [
      {
        "id": "uuid-string",
        "employee_name": "Budi Santoso",
        "bonus_name": "Bonus Target Sales",
        "amount": 1000000
      }
    ]
  }
}
```

### 3.2 Record Bonus
**Endpoint**: `/api/bonus`
**HTTP Method**: `POST`
**Tujuan**: Mencatat bonus yang didapatkan karyawan.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "employee_id": "uuid-string",
  "payroll_period_id": "uuid-string",
  "bonus_name": "Bonus Target Sales",
  "amount": 1000000,
  "description": "Pencapaian Q1"
}
```

**Validation Rule**
- `employee_id`: Required, valid UUID.
- `payroll_period_id`: Required, valid UUID.
- `bonus_name`: Required, string, maksimal 100 karakter.
- `amount`: Required, numeric, HARUS lebih dari 0.
- `description`: Optional, string.

**Business Rule**
- Pastikan nominal bonus (`amount`) bernilai positif (> 0).
- Bonus bisa diberikan lebih dari satu kali dalam satu periode (tidak ada uniqueness constraint pada bonus name per karyawan per periode).
- Insert ke tabel `bonus_records`.

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Data bonus berhasil dicatat",
  "data": {
    "bonus": {
      "id": "uuid-string"
    }
  }
}
```

---
**Status**: FINAL (Operasional Module)
