# 05_API_DESIGN_AUTHENTICATION

## Sistem Informasi Penggajian Berbasis Web

Dokumen ini mendefinisikan desain REST API untuk modul Authentication dan menjadi acuan implementasi backend.

---

## 1. Login
**Endpoint**: `/api/auth/login`
**HTTP Method**: `POST`
**Tujuan**: Mengautentikasi pengguna dan memberikan token akses (JWT) yang disimpan dalam HttpOnly Cookie.

### Authorization
- Tidak memerlukan token (Public)

### Request
**Headers**:
- `Content-Type: application/json`

**Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Validation Rule
- `email`: Required, berformat email valid, maksimal 100 karakter.
- `password`: Required, berupa string, minimal 8 karakter.

### Business Rule
- Cari user berdasarkan email pada tabel `users`.
- Verifikasi password menggunakan algoritma hash.
- Pastikan akun memiliki `is_active = true`.
- Buat JWT berisi payload `id`, `email`, dan `role`.
- Set JWT ke dalam HttpOnly Cookie pada response header.

### Cookie Specification
- `httpOnly`: true
- `secure`: true (pada environment production)
- `sameSite`: strict
- `path`: /
- `maxAge`: 86400 (24 jam)

### Success Response
**HTTP Status Code**: `200 OK`
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  }
}
```

### Error Response
**HTTP Status Code**: `401 Unauthorized`
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

**HTTP Status Code**: `403 Forbidden`
```json
{
  "success": false,
  "message": "Akun Anda tidak aktif"
}
```

---

## 2. Get Current User (Me)
**Endpoint**: `/api/auth/me`
**HTTP Method**: `GET`
**Tujuan**: Mendapatkan data profil pengguna yang sedang login.

### Authorization
- Memerlukan token JWT valid dari Cookie.

### Request
**Headers**:
- `Cookie`: (Berisi JWT)

### Validation Rule
- Token JWT wajib ada, valid, dan belum kedaluwarsa.

### Business Rule
- Dekode token dari HttpOnly Cookie untuk mendapatkan `id` user.
- Ambil data profil pengguna SELALU dari database (tabel `users`) berdasarkan `id` yang terdapat pada payload JWT.

### Success Response
**HTTP Status Code**: `200 OK`
```json
{
  "success": true,
  "message": "Berhasil mendapatkan profil",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  }
}
```

### Error Response
**HTTP Status Code**: `401 Unauthorized`
```json
{
  "success": false,
  "message": "Tidak terautentikasi"
}
```

---

## 3. Logout
**Endpoint**: `/api/auth/logout`
**HTTP Method**: `POST`
**Tujuan**: Menghapus sesi pengguna dengan membersihkan HttpOnly Cookie.

### Authorization
- Memerlukan token JWT valid dari Cookie.

### Request
**Headers**:
- `Cookie`: (Berisi JWT)

### Validation Rule
- Tidak ada payload pada body.

### Business Rule
- Akhiri sesi dengan menghapus HttpOnly Cookie JWT pada response header (mengatur nilai kosong dan kedaluwarsa).

### Cookie Specification (Penghapusan)
- `httpOnly`: true
- `secure`: true (pada environment production)
- `sameSite`: strict
- `path`: /
- `maxAge`: 0

### Success Response
**HTTP Status Code**: `200 OK`
```json
{
  "success": true,
  "message": "Logout berhasil",
  "data": {}
}
```

### Error Response
**HTTP Status Code**: `401 Unauthorized`
```json
{
  "success": false,
  "message": "Tidak terautentikasi"
}
```

---

**Status**: FINAL (Authentication Module)
