/**
 * Referensi Hukum dan Standar Harmonisasi Produk Hukum Desa
 * Berdasarkan Permendagri No. 111 Tahun 2014 dan UU No. 6/2014 jo. UU No. 3/2024
 * Wilayah: Kecamatan Waru, Kabupaten Penajam Paser Utara (PPU), Provinsi Kalimantan Timur
 */

export const KECAMATAN_INFO = {
  nama: 'Kecamatan Waru',
  kabupaten: 'Kabupaten Penajam Paser Utara',
  provinsi: 'Kalimantan Timur',
  alamat: 'Jl. Propinsi Km. 25 Waru, Kode Pos 76142',
  emailResmi: 'waruppusigap@gmail.com',
  telepon: '(0542) 7210011',
  camatNama: 'Ahmad Fauzi, S.STP, M.Si',
  camatNip: '19790514 200012 1 002',
  camatPangkat: 'Pembina Tk. I (IV/b)',
  sekcamNama: 'H. Suwandi, S.Sos',
  sekcamNip: '19820320 200502 1 004',
  kasiPemerintahan: 'Muhammad Yusuf, S.AP',
  kasiPemerintahanNip: '19850711 200801 1 003'
};

export const DESA_LIST = [
  { id: 'desa-bangun-mulya', nama: 'Desa Bangun Mulya', kades: 'Bambang Supriyanto', ketuaBpd: 'Agus Triono, S.Pd', sekdes: 'Rudi Hartono' },
  { id: 'desa-sesulu', nama: 'Desa Sesulu', kades: 'H. Syamsudin', ketuaBpd: 'Drs. H. Mulyadi', sekdes: 'Heru Pratama' },
  { id: 'desa-api-api', nama: 'Desa Api-Api', kades: 'M. Ali Wardhana', ketuaBpd: 'Zainuddin Nur', sekdes: 'Fitriani, S.E' },
  { id: 'desa-waru', nama: 'Desa Waru', kades: 'Syahril, S.E', ketuaBpd: 'Ir. Hendra Gunawan', sekdes: 'Indra Gunawan' },
];

export const JENIS_PRODUK_HUKUM = {
  PERDES: {
    id: 'PERDES',
    nama: 'Peraturan Desa (Perdes)',
    singkatan: 'Perdes',
    pembentuk: 'Kepala Desa bersama Badan Permusyawaratan Desa (BPD)',
    jalurDefault: 'EVALUASI', // Evaluasi jika APBDes/Pungutan/Tata Ruang/SOTK, Klarifikasi selain itu
    deskripsi: 'Peraturan perundang-undangan yang ditetapkan oleh Kepala Desa setelah dibahas dan disepakati bersama BPD.'
  },
  PERMAKADES: {
    id: 'PERMAKADES',
    nama: 'Peraturan Bersama Kepala Desa (Permakades)',
    singkatan: 'Permakades',
    pembentuk: 'Dua atau lebih Kepala Desa',
    jalurDefault: 'KLARIFIKASI',
    deskripsi: 'Peraturan yang ditetapkan oleh dua atau lebih Kepala Desa dalam rangka kerja sama antar-Desa.'
  },
  PERKADES: {
    id: 'PERKADES',
    nama: 'Peraturan Kepala Desa (Perkades)',
    singkatan: 'Perkades',
    pembentuk: 'Kepala Desa',
    jalurDefault: 'KLARIFIKASI',
    deskripsi: 'Peraturan yang ditetapkan oleh Kepala Desa dan bersifat mengatur pelaksanaan Perdes atau peraturan perundangan yang lebih tinggi.'
  },
  SK_KADES: {
    id: 'SK_KADES',
    nama: 'Keputusan Kepala Desa (SK Kades)',
    singkatan: 'SK Kades',
    pembentuk: 'Kepala Desa',
    jalurDefault: 'KLARIFIKASI',
    deskripsi: 'Penetapan tertulis yang bersifat konkret, individual, dan final untuk menyelenggarakan urusan pemerintahan desa.'
  }
};

export const KATEGORI_EVALUASI_MANDATORI = [
  'APBDes / Perubahan APBDes',
  'Pungutan Desa',
  'Tata Ruang Desa',
  'Susunan Organisasi dan Tata Kerja (SOTK) Pemdes'
];

/**
 * Daftar regulasi acuan resmi dalam hierarki
 */
export const HIERARKI_REGULASI_ACUAN = [
  { nomor: 1, nama: 'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945' },
  { nomor: 2, nama: 'Undang-Undang Nomor 6 Tahun 2014 tentang Desa sebagaimana telah diubah terakhir dengan Undang-Undang Nomor 3 Tahun 2024 tentang Perubahan Kedua atas Undang-Undang Nomor 6 Tahun 2014 tentang Desa' },
  { nomor: 3, nama: 'Peraturan Pemerintah Nomor 43 Tahun 2014 tentang Peraturan Pelaksanaan UU No. 6 Tahun 2014 tentang Desa jo. PP No. 47 Tahun 2015 dan PP No. 11 Tahun 2019' },
  { nomor: 4, nama: 'Peraturan Pemerintah Nomor 60 Tahun 2014 tentang Dana Desa yang Bersumber dari APBN' },
  { nomor: 5, nama: 'Peraturan Menteri Dalam Negeri Nomor 111 Tahun 2014 tentang Pedoman Teknis Peraturan di Desa' },
  { nomor: 6, nama: 'Peraturan Menteri Dalam Negeri Nomor 114 Tahun 2014 tentang Pedoman Pembangunan Desa' },
  { nomor: 7, nama: 'Peraturan Menteri Dalam Negeri Nomor 20 Tahun 2018 tentang Pengelolaan Keuangan Desa' },
  { nomor: 8, nama: 'Peraturan Menteri Desa, PDTT terkait Prioritas Penggunaan Dana Desa (Tahun Berjalan)' },
  { nomor: 9, nama: 'Peraturan Daerah Kabupaten Penajam Paser Utara tentang Pembentukan, Penghapusan, Penggabungan dan Penetapan Desa' },
  { nomor: 10, nama: 'Peraturan Bupati Penajam Paser Utara tentang Pedoman Penyusunan APBDes dan Alokasi Dana Desa (ADD)' }
];

export const REGULASI_TIDAK_BERLAKU_WARNING = [
  { keyword: 'UU 32 Tahun 2004', pengganti: 'UU No. 23 Tahun 2014 tentang Pemerintahan Daerah' },
  { keyword: 'UU 22 Tahun 1999', pengganti: 'UU No. 23 Tahun 2014 tentang Pemerintahan Daerah' },
  { keyword: 'PP 72 Tahun 2005', pengganti: 'PP No. 43 Tahun 2014 tentang Peraturan Pelaksanaan UU Desa' },
  { keyword: 'Permendagri 37 Tahun 2007', pengganti: 'Permendagri No. 111 Tahun 2014 tentang Pedoman Teknis Peraturan di Desa' },
  { keyword: 'Permendagri 113 Tahun 2014', pengganti: 'Permendagri No. 20 Tahun 2018 tentang Pengelolaan Keuangan Desa' }
];
