# 05_API_DESIGN_MASTER_DATA

## Sistem Informasi Penggajian Berbasis Web

Dokumen ini mendefinisikan desain REST API untuk modul Master Data (Department, Position, Employee) dan menjadi acuan mutlak implementasi backend.

---

## 1. Department API

### 1.1 Get All Departments
**Endpoint**: `/api/departments`
**HTTP Method**: `GET`
**Tujuan**: Mendapatkan daftar seluruh departemen.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request**
- Tidak ada body.

**Validation Rule**
- Tidak ada.

**Business Rule**
- Ambil seluruh data dari tabel `departments`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil data departemen",
  "data": {
    "departments": [
      {
        "id": "uuid-string",
        "code": "HR",
        "name": "Human Resources",
        "description": "HR Dept"
      }
    ]
  }
}
```

### 1.2 Create Department
**Endpoint**: `/api/departments`
**HTTP Method**: `POST`
**Tujuan**: Membuat departemen baru.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "code": "HR",
  "name": "Human Resources",
  "description": "Departemen SDM"
}
```

**Validation Rule**
- `code`: Required, string, maksimal 50 karakter, harus unik.
- `name`: Required, string, maksimal 100 karakter, harus unik.
- `description`: Optional, string.

**Business Rule**
- Validasi duplikasi `code` dan `name` di database.
- Simpan data baru ke tabel `departments`.

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Departemen berhasil dibuat",
  "data": {
    "department": {
      "id": "uuid-string",
      "code": "HR",
      "name": "Human Resources"
    }
  }
}
```

### 1.3 Update Department
**Endpoint**: `/api/departments/:id`
**HTTP Method**: `PUT`
**Tujuan**: Mengubah data departemen.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "name": "Human Resources & GA",
  "description": "Departemen SDM & General Affairs"
}
```

**Validation Rule**
- `id`: Valid UUID.
- `name`: Required, string, maksimal 100 karakter, harus unik.
- `description`: Optional, string.
- `code` TIDAK dapat diubah (immutable).

**Business Rule**
- Pastikan departemen dengan `id` tersebut ada.
- Validasi duplikasi `name` untuk record selain departemen ini.
- Update data pada tabel `departments`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Departemen berhasil diubah",
  "data": {
    "department": {
      "id": "uuid-string",
      "code": "HR",
      "name": "Human Resources & GA"
    }
  }
}
```

### 1.4 Delete Department
**Endpoint**: `/api/departments/:id`
**HTTP Method**: `DELETE`
**Tujuan**: Menghapus departemen.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
- Tidak ada.

**Validation Rule**
- `id`: Valid UUID.

**Business Rule**
- Pastikan departemen dengan `id` tersebut ada.
- Cek tabel `positions` untuk memastikan departemen ini TIDAK memiliki relasi ke jabatan mana pun.
- Jika ada relasi, gagalkan proses (sesuai ON DELETE RESTRICT).
- Jika tidak ada, hapus dari tabel `departments`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Departemen berhasil dihapus",
  "data": {}
}
```
**Error Response (400 Bad Request - Constraint Violation)**
```json
{
  "success": false,
  "message": "Departemen tidak dapat dihapus karena masih digunakan oleh jabatan (Position)"
}
```

---

## 2. Position API

### 2.1 Get All Positions
**Endpoint**: `/api/positions`
**HTTP Method**: `GET`
**Tujuan**: Mendapatkan daftar seluruh jabatan beserta detail departemen.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Business Rule**
- Ambil seluruh data dari tabel `positions` dan lakukan JOIN dengan `departments` untuk mendapatkan nama departemen.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil data jabatan",
  "data": {
    "positions": [
      {
        "id": "uuid-string",
        "department_id": "uuid-string",
        "department_name": "Human Resources",
        "code": "HR-MGR",
        "name": "HR Manager",
        "basic_salary": 10000000,
        "position_allowance": 2000000
      }
    ]
  }
}
```

### 2.2 Create Position
**Endpoint**: `/api/positions`
**HTTP Method**: `POST`
**Tujuan**: Membuat jabatan baru.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "department_id": "uuid-string",
  "code": "HR-MGR",
  "name": "HR Manager",
  "basic_salary": 10000000,
  "position_allowance": 2000000
}
```

**Validation Rule**
- `department_id`: Required, valid UUID.
- `code`: Required, string, maksimal 50 karakter, harus unik.
- `name`: Required, string, maksimal 100 karakter.
- `basic_salary`: Required, numeric, minimal 0.
- `position_allowance`: Required, numeric, minimal 0.

**Business Rule**
- Pastikan `department_id` ada di tabel `departments`.
- Validasi duplikasi `code` di database.
- Simpan data baru ke tabel `positions`.

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Jabatan berhasil dibuat",
  "data": {
    "position": {
      "id": "uuid-string",
      "code": "HR-MGR"
    }
  }
}
```

### 2.3 Update Position
**Endpoint**: `/api/positions/:id`
**HTTP Method**: `PUT`
**Tujuan**: Mengubah data jabatan.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Validation Rule**
- `id`: Valid UUID.
- `department_id`: Required, valid UUID.
- `name`: Required, string.
- `basic_salary`: Required, numeric, minimal 0.
- `position_allowance`: Required, numeric, minimal 0.
- `code` TIDAK dapat diubah (immutable).

**Business Rule**
- Pastikan jabatan dengan `id` tersebut ada.
- Pastikan `department_id` valid.
- Update data pada tabel `positions`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Jabatan berhasil diubah",
  "data": {
    "position": {
      "id": "uuid-string",
      "name": "HR Manager"
    }
  }
}
```

### 2.4 Delete Position
**Endpoint**: `/api/positions/:id`
**HTTP Method**: `DELETE`
**Tujuan**: Menghapus jabatan.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Business Rule**
- Pastikan jabatan dengan `id` tersebut ada.
- Cek tabel `employees` untuk memastikan jabatan ini TIDAK digunakan oleh karyawan mana pun.
- Jika ada relasi, gagalkan proses (sesuai ON DELETE RESTRICT).
- Jika aman, hapus dari tabel `positions`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Jabatan berhasil dihapus",
  "data": {}
}
```
**Error Response (400 Bad Request)**
```json
{
  "success": false,
  "message": "Jabatan tidak dapat dihapus karena masih digunakan oleh karyawan"
}
```

---

## 3. Employee API

### 3.1 Get All Employees
**Endpoint**: `/api/employees`
**HTTP Method**: `GET`
**Tujuan**: Mendapatkan daftar seluruh karyawan.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Business Rule**
- Ambil seluruh data dari tabel `employees`.
- Lakukan JOIN dengan `positions` dan `departments` untuk mendapatkan info jabatan dan departemen.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil data karyawan",
  "data": {
    "employees": [
      {
        "id": "uuid-string",
        "employee_code": "EMP-001",
        "full_name": "Budi Santoso",
        "position_name": "HR Manager",
        "department_name": "Human Resources",
        "employment_status": "ACTIVE"
      }
    ]
  }
}
```

### 3.2 Create Employee
**Endpoint**: `/api/employees`
**HTTP Method**: `POST`
**Tujuan**: Mendaftarkan karyawan baru sekaligus membuat akun user.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "position_id": "uuid-string",
  "employee_code": "EMP-001",
  "full_name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123",
  "gender": "L",
  "phone": "08123456789",
  "address": "Jl. Merdeka No.1",
  "join_date": "2024-01-01",
  "salary_override": 0
}
```

**Validation Rule**
- `position_id`: Required, valid UUID.
- `employee_code`: Required, unik, maksimal 50 karakter.
- `email`: Required, unik, valid email.
- `password`: Required, minimal 8 karakter.
- `full_name`: Required, string.
- `gender`: Required, string (L/P).
- `join_date`: Required, valid date format YYYY-MM-DD.
- `salary_override`: Required, numeric, minimal 0.

**Business Rule**
- Mulai Database Transaction (BEGIN).
- Pastikan `position_id` valid.
- Validasi duplikasi `email` pada tabel `users`.
- Validasi duplikasi `employee_code` pada tabel `employees`.
- Insert ke tabel `users` (email, password_hash, role='EMPLOYEE', is_active=true). Ambil `user_id`.
- Insert ke tabel `employees` menggunakan `user_id` yang baru dibuat. Set `employment_status = ACTIVE`.
- Commit Transaction (COMMIT).
- Jika ada kegagalan, ROLLBACK seluruh transaksi.

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Karyawan berhasil didaftarkan",
  "data": {
    "employee": {
      "id": "uuid-string",
      "employee_code": "EMP-001"
    }
  }
}
```

### 3.3 Update Employee
**Endpoint**: `/api/employees/:id`
**HTTP Method**: `PUT`
**Tujuan**: Mengubah profil atau penempatan karyawan.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Validation Rule**
- `id`: Valid UUID karyawan.
- `position_id`: Required, valid UUID.
- `full_name`: Required, string.
- `salary_override`: Required, numeric, minimal 0.
- (Dan data profil lainnya). `employee_code` TIDAK dapat diubah.

**Business Rule**
- Pastikan karyawan dengan `id` tersebut ada.
- Pastikan status karyawan tidak `RESIGNED` (opsional, tergantung kebijakan, tetapi lazimnya data profil tetap bisa diedit).
- Update data profil pada tabel `employees`.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Data karyawan berhasil diubah",
  "data": {
    "employee": {
      "id": "uuid-string"
    }
  }
}
```

### 3.4 Resign Employee
**Endpoint**: `/api/employees/:id/resign`
**HTTP Method**: `PUT`
**Tujuan**: Menandai karyawan sebagai telah keluar/resign. Karyawan tidak dihapus permanen.

**Authorization**
- Memerlukan token JWT valid dari Cookie dengan Role `ADMIN`.

**Request Body**
```json
{
  "resign_date": "2024-12-31"
}
```

**Validation Rule**
- `resign_date`: Required, valid date format YYYY-MM-DD.

**Business Rule**
- Mulai Database Transaction.
- Ubah `employment_status` menjadi `RESIGNED` pada tabel `employees`.
- Set `resign_date` sesuai request.
- Nonaktifkan akses login karyawan dengan mengubah `is_active = false` pada tabel `users` yang berelasi dengan karyawan ini.
- Commit Transaction.

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Karyawan berhasil ditandai sebagai resign",
  "data": {
    "employee": {
      "id": "uuid-string",
      "employment_status": "RESIGNED"
    }
  }
}
```

---
**Status**: FINAL (Master Data Module)
