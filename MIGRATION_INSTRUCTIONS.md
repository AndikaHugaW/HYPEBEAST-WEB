# Discount Table Migration Instructions

## Masalah: Admin tidak bisa membuat discount

Jika admin tidak bisa membuat discount, kemungkinan besar tabel `discounts` belum dibuat di database. Ikuti langkah berikut:

## Cara Menjalankan Migration

### 1. Menggunakan Supabase Dashboard

1. Buka Supabase Dashboard Anda
2. Pilih project Anda
3. Pergi ke **SQL Editor**
4. Buka file `supabase/migrations/create_discounts_table.sql`
5. Copy seluruh isi file tersebut
6. Paste ke SQL Editor di Supabase Dashboard
7. Klik **Run** untuk menjalankan migration

### 2. Menggunakan Supabase CLI (Jika sudah setup)

```bash
# Pastikan Anda sudah login ke Supabase
supabase login

# Link project (jika belum)
supabase link --project-ref your-project-ref

# Jalankan migration
supabase db push
```

### 3. Manual SQL Execution

Jika menggunakan metode lain, jalankan SQL berikut di database Anda:

File yang perlu dijalankan: `supabase/migrations/create_discounts_table.sql`

## Setelah Migration

Setelah migration berhasil dijalankan:

1. Refresh halaman admin discount (`/admin/discount`)
2. Coba buat discount baru
3. Jika masih error, cek:
   - Apakah user sudah login sebagai admin?
   - Apakah profile user memiliki role 'admin'?
   - Cek console browser untuk error message

## Verifikasi Migration

Untuk memastikan tabel sudah dibuat, jalankan query berikut di SQL Editor:

```sql
SELECT * FROM discounts LIMIT 1;
```

Jika query berhasil tanpa error, berarti tabel sudah ada.

## Troubleshooting

### Error: "relation discounts does not exist"
- **Solusi**: Tabel belum dibuat, jalankan migration

### Error: "permission denied"
- **Solusi**: Cek RLS policies di tabel discounts

### Error: "Session expired"
- **Solusi**: Login ulang sebagai admin

### Error: "Forbidden - Admin access required"
- **Solusi**: Pastikan user memiliki role 'admin' di tabel profiles

## Menetapkan User sebagai Admin

Jika user belum memiliki role admin, jalankan SQL berikut:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

Ganti `your-admin-email@example.com` dengan email admin Anda.

