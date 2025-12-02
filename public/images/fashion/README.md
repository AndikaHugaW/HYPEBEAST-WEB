# Fashion Category Images

Folder ini digunakan untuk menyimpan gambar-gambar yang terkait dengan kategori fashion.

## Struktur Folder

```
public/images/fashion/
```

## Penggunaan

Gambar yang disimpan di folder ini dapat diakses melalui URL:
```
/images/fashion/[nama-file]
```

## Contoh

```jsx
<Image 
  src="/images/fashion/example.jpg" 
  alt="Fashion Category"
  width={500}
  height={500}
/>
```

## Catatan

- Format gambar yang disarankan: JPG, PNG, WebP
- Ukuran maksimal disarankan: 2MB per file
- Nama file sebaiknya menggunakan format: `fashion-[deskripsi].[ext]`

