# Folder Fonts

Folder ini digunakan untuk menyimpan file font custom yang di-download dari Figma.

## Cara Menggunakan Font dari Figma:

### 1. Download Font dari Figma:
   - Buka design di Figma
   - Klik teks yang menggunakan font yang ingin Anda gunakan
   - Di panel Properties, klik ikon font (tiga garis horizontal)
   - Pilih opsi untuk download atau install font
   - Simpan file font ke folder ini

### 2. Format Font yang Didukung:
   - ✅ **.otf** (OpenType Font) - **Bisa digunakan langsung dari Figma!**
   - ✅ **.ttf** (TrueType Font) - Bisa digunakan langsung
   - ✅ **.woff** - Direkomendasikan (ukuran kecil)
   - ✅ **.woff2** - **Paling direkomendasikan** (ukuran terkecil, performa terbaik)
   
   **Catatan:** Jika Anda download font dari Figma dalam format .otf, bisa langsung digunakan tanpa perlu konversi!

### 3. Struktur File (contoh dengan .otf):
   ```
   public/fonts/
   ├── FontName-Regular.otf    ← Format .otf dari Figma
   ├── FontName-Bold.otf
   ├── FontName-Light.otf
   └── FontName-Medium.otf
   ```
   
   Atau mix format (juga bisa):
   ```
   public/fonts/
   ├── FontName-Regular.otf     ← .otf dari Figma
   ├── FontName-Bold.woff2      ← .woff2 untuk optimasi
   └── FontName-Light.ttf       ← .ttf juga bisa
   ```

### 4. Update layout.tsx:
   Uncomment bagian custom font di `app/layout.tsx` dan sesuaikan path:
   ```typescript
   const customFont = localFont({
     src: [
       {
         path: "../public/fonts/FontName-Regular.otf",  // Format .otf dari Figma
         weight: "400",
         style: "normal",
       },
       {
         path: "../public/fonts/FontName-Bold.otf",
         weight: "700",
         style: "normal",
       },
     ],
     variable: "--font-custom",
     display: "swap",
   });
   ```
   
   **Catatan:** Ganti `FontName` dengan nama font Anda dan pastikan ekstensi file sesuai (.otf, .ttf, .woff, atau .woff2)

### 5. Gunakan di Tailwind:
   Setelah di-configure, gunakan class `font-custom` di komponen Anda.

