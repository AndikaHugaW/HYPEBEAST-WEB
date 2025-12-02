# Cara Upload Gambar Produk

Ada **3 cara** untuk upload gambar produk ke Supabase Storage:

## 🎯 Method 1: Via Admin Panel (Recommended)

**Paling mudah dan user-friendly**

### Langkah:
1. Buka halaman admin: `http://localhost:3000/admin/products`
2. Klik "Edit Product" pada product yang ingin di-upload gambarnya
3. Klik area upload atau drag & drop gambar
4. Tunggu upload selesai
5. Klik "Save Changes"

**Keuntungan:**
- ✅ User-friendly interface
- ✅ Preview sebelum save
- ✅ Bisa manage multiple images
- ✅ Auto-update ke database

---

## 🚀 Method 2: Via Supabase Dashboard (Quick Upload)

**Cocok untuk upload banyak gambar sekaligus**

### Langkah:
1. Buka **Supabase Dashboard** > **Storage** > **product-images**
2. Klik **"Upload file"** atau drag & drop
3. Upload gambar (bisa multiple files)
4. Copy **Public URL** dari setiap gambar
5. Update product di database:

```sql
-- Update product dengan image URL
UPDATE products
SET images = ARRAY['https://your-project.supabase.co/storage/v1/object/public/product-images/products/image1.jpg']
WHERE slug = 'product-slug';
```

**Keuntungan:**
- ✅ Bisa upload banyak file sekaligus
- ✅ Tidak perlu coding
- ✅ Langsung di Supabase

---

## 💻 Method 3: Via API/Code (Programmatic)

**Cocok untuk automation atau batch upload**

### Contoh Code:

```typescript
// Upload single image
const formData = new FormData();
formData.append('file', file);
formData.append('productId', 'product-uuid');

const response = await fetch('/api/products/upload-image', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Image URL:', result.url);

// Update product
await fetch(`/api/products/${productId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    images: [result.url]
  })
});
```

**Keuntungan:**
- ✅ Bisa di-automate
- ✅ Cocok untuk batch processing
- ✅ Bisa diintegrasikan dengan workflow lain

---

## 📋 Rekomendasi Workflow

### Untuk Development/Testing:
1. Gunakan **Method 2** (Supabase Dashboard) untuk quick upload
2. Copy URLs dan update seed data

### Untuk Production:
1. Gunakan **Method 1** (Admin Panel) untuk user-friendly upload
2. Atau **Method 3** (API) jika ada automation

### Untuk Batch Upload Banyak Images:
1. Upload semua images via **Method 2** (Supabase Dashboard)
2. Copy semua URLs
3. Update database dengan script SQL

---

## 🔄 Update Seed Data dengan Supabase URLs

Setelah upload images, update `seed_products.sql`:

```sql
-- Contoh update product dengan Supabase Storage URL
UPDATE products
SET images = ARRAY['https://your-project.supabase.co/storage/v1/object/public/product-images/products/supreme-hoodie.jpg']
WHERE slug = 'supreme-x-fox-racing-sweatshirt-white';
```

---

## 📝 Checklist Upload Images

- [ ] Storage bucket `product-images` sudah dibuat
- [ ] Bucket di-set sebagai public
- [ ] Upload images ke Supabase Storage
- [ ] Copy Public URLs
- [ ] Update products di database dengan URLs
- [ ] Test images muncul di website
- [ ] Verify images loading dengan cepat

---

## 🎨 Tips

1. **Naming Convention**: Gunakan format `{product-slug}-{number}.jpg`
   - Contoh: `supreme-hoodie-1.jpg`, `supreme-hoodie-2.jpg`

2. **Image Optimization**: 
   - Resize ke 800x800px sebelum upload
   - Gunakan WebP format untuk best compression
   - Max size: 5MB

3. **Multiple Images**: 
   - Upload primary image dulu
   - Tambahkan secondary images setelahnya
   - Update `images` array di database

4. **Organization**:
   - Simpan di folder `products/` di bucket
   - Bisa buat subfolder per category jika perlu

