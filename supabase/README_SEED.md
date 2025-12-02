# Seed Products Data

File ini berisi data demo untuk 20 produk yang bisa di-insert ke database Supabase.

## Cara Menggunakan

1. **Buka Supabase Dashboard**
   - Login ke [supabase.com](https://supabase.com)
   - Pilih project Anda
   - Pergi ke **SQL Editor**

2. **Jalankan Script**
   - Copy semua isi dari file `seed_products.sql`
   - Paste ke SQL Editor
   - Klik **Run** atau tekan `Ctrl+Enter`

3. **Verifikasi**
   - Script akan menampilkan summary di akhir:
     - Total products
     - Count per category
     - Count new arrivals
     - Count on sale

## Data yang Akan Di-insert

### Kategori:
- **Apparel**: 8 produk
- **Footwear**: 5 produk
- **Accessories**: 4 produk
- **Lifestyle**: 3 produk

### Brands:
- Supreme
- Stone Island
- Chrome Hearts
- Off-White
- Bape
- Stussy
- Palace
- Kith
- Nike
- Adidas
- Jordan
- New Balance
- Converse

### Fitur:
- **New Arrivals**: 4 produk (Supreme, Stone Island, Chrome Hearts, Off-White)
- **On Sale**: 12 produk dengan discount
- **Featured**: 5 produk

## Catatan

- Semua produk menggunakan placeholder images dari Unsplash
- Harga dalam USD
- Size tersedia dalam berbagai ukuran
- Stock status: 'in_stock' untuk semua produk demo

## Update Data

Jika ingin mengupdate atau menghapus data demo:

```sql
-- Hapus semua produk demo
DELETE FROM products WHERE brand IN ('Supreme', 'Stone Island', 'Chrome Hearts', 'Nike', 'Adidas', 'Off-White', 'Bape', 'Stussy', 'Palace', 'Kith', 'Jordan', 'New Balance', 'Converse');

-- Atau hapus semua produk
DELETE FROM products;
```

## Troubleshooting

Jika ada error:
1. Pastikan schema sudah dijalankan terlebih dahulu (`schema.sql`)
2. Pastikan tabel `products` sudah ada
3. Cek apakah ada constraint yang melanggar (misalnya slug sudah ada)
4. Pastikan semua field required sudah diisi

