# SI Harmonisasi Kecamatan Waru

**Sistem Informasi Harmonisasi & Evaluasi Produk Hukum Desa**  
*Kecamatan Waru, Kabupaten Penajam Paser Utara, Provinsi Kalimantan Timur*

Aplikasi web modern berbasis Permendagri No. 111 Tahun 2014 untuk memfasilitasi penyusunan, pembahasan, telaah yuridis, harmonisasi perundang-undangan, dan penerbitan nomor registrasi produk hukum desa secara kolaboratif antara Pemerintah Desa (Pemdes), Badan Permusyawaratan Desa (BPD), dan Pemerintah Kecamatan Waru.

---

## 🌟 Fitur Utama

1. **Sistem Multi-Role & Switch Role Cepat:**
   - **Pemerintah Desa (Pemdes):** Input draf peraturan, unggah berkas musdes (BA Musdes & Daftar Hadir), pantau catatan BPD dan matriks evaluasi, serta unggah perbaikan.
   - **Badan Permusyawaratan Desa (BPD):** Pemeriksaan draf, input catatan musyawarah, unggah Berita Acara Kesepakatan Bersama & SK BPD, dan rekomendasi persetujuan/pengembalian.
   - **Pemerintah Kecamatan Waru:** Checklist verifikasi administrasi, modul AI Generator Harmonisasi, penyuntingan matriks evaluasi, penerbitan Nomor Registrasi resmi, dan cetak dokumen berkop dinas.

2. **Kategorisasi Permendagri 111/2014 & SLA Monitor:**
   - **Jalur Evaluasi (Sebelum Penetapan):** Khusus 4 Raperdes mandatori (APBDes, Pungutan, Tata Ruang, SOTK) dengan batas waktu evaluasi maksimal 20 hari kerja.
   - **Jalur Klarifikasi (Setelah Penetapan):** Untuk Perdes di luar 4 hal di atas, Perkades, dan Keputusan Kepala Desa (SK Kades).

3. **Modul AI Generator Harmonisasi Kecamatan:**
   - Analisis otomatis 8 struktur peraturan perundang-undangan (Judul, Pembukaan, Konsiderans Menimbang, Dasar Hukum Mengingat, Diktum Memutuskan, Batang Tubuh per pasal, Ketentuan Penutup & Lembaran Desa, serta Lampiran).
   - Deteksi regulasi kadaluarsa/dicabut (seperti UU 32/2004, Permendagri 113/2014) dan pemeriksaan pembaruan UU Desa (UU No. 3 Tahun 2024).
   - Terintegrasi dengan Google Gemini AI atau mesin yuridis internal yang siap offline.

4. **Integrasi Google Drive & Google Sheets (`waruppusigap@gmail.com`):**
   - Disertai skrip Google Apps Script (`google-apps-script/Code.gs`) yang otomatis membuat folder Drive (`SI_HARMONISASI_KECAMATAN_WARU_UPLOADS`) dan spreadsheet database.

5. **Cetak & Ekspor Dokumen Resmi:**
   - Kop surat dinas Pemerintah Kabupaten Penajam Paser Utara - Kecamatan Waru.
   - Format cetak PDF & ekspor Word (.doc) untuk Lembar Matriks Evaluasi, Berita Acara Rapat Evaluasi, dan SK Camat Waru.

---

## 🚀 Menjalankan Aplikasi

```bash
# Instalasi dependensi
npm install

# Menjalankan server development
npm run dev

# Membangun bundle produksi
npm run build
```

---

## 📂 Struktur Repositori

```
Harmonisasi/
├── google-apps-script/
│   └── Code.gs                  # Skrip Google Apps Script untuk Drive & Sheet waruppusigap@gmail.com
├── public/
├── src/
│   ├── components/              # Komponen UI React (Dashboard, Detail, Modals, Editor)
│   ├── data/                    # Data acuan yuridis & seed data desa
│   ├── services/                # Layanan AI Harmonizer, Google Sheet & Local Storage
│   ├── utils/                   # Helper pemformatan dan ekspor Word
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---
**Pemerintah Kecamatan Waru &bull; Kabupaten Penajam Paser Utara**
