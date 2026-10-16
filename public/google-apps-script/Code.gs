/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT: SI HARMONISASI KECAMATAN WARU
 * Akun Pengelola: waruppusigap@gmail.com
 * Sistem Informasi Harmonisasi & Evaluasi Produk Hukum Desa Kecamatan Waru
 * Kabupaten Penajam Paser Utara, Provinsi Kalimantan Timur
 * =========================================================================================
 * 
 * CARA MENGISI GOOGLE SHEET & DRIVE:
 * 1. Buka browser dan login ke akun Google: waruppusigap@gmail.com
 * 2. Kunjungi: https://script.google.com/
 * 3. Buat Project baru, beri nama: "SI_Harmonisasi_Kecamatan_Waru"
 * 4. Hapus isi editor dan tempelkan (paste) seluruh kode ini.
 * 5. Pilih fungsi "setupInitialDatabase" lalu klik "Run" (Jalankan).
 *    -> Berikan izin (Review Permissions -> Advanced -> Go to ... (unsafe) -> Allow).
 *    -> Secara otomatis FOLDER DRIVE & SPREADSHEET langsung terbuat beserta DATA AWALNYA!
 * 6. Klik "Deploy" -> "New deployment" -> type "Web app"
 *    - Execute as: "Me (waruppusigap@gmail.com)"
 *    - Who has access: "Anyone" (Siapa saja)
 * 7. Salin "Web App URL" dan tempelkan ke menu "Google Drive & Sheet" di aplikasi web!
 */

const CONFIG = {
  DRIVE_ROOT_FOLDER: "SI_HARMONISASI_KECAMATAN_WARU_UPLOADS",
  SPREADSHEET_NAME: "DATABASE_SI_HARMONISASI_KECAMATAN_WARU",
  OWNER_EMAIL: "waruppusigap@gmail.com"
};

/**
 * Fungsi Setup Awal: Otomatis Membuat Folder Drive dan Google Sheet BESERTA DATA AWALNYA
 */
function setupInitialDatabase() {
  const rootFolder = getOrCreateRootFolder();
  const spreadsheet = getOrCreateSpreadsheet(rootFolder);
  
  // Masukkan data awal jika sheet masih kosong
  populateInitialSampleData(spreadsheet);
  
  Logger.log("==================================================");
  Logger.log("SETUP DATABASE & DRIVE BERHASIL!");
  Logger.log("Folder Drive: " + rootFolder.getUrl());
  Logger.log("Google Spreadsheet: " + spreadsheet.getUrl());
  Logger.log("==================================================");
  
  return {
    success: true,
    folderUrl: rootFolder.getUrl(),
    spreadsheetUrl: spreadsheet.getUrl()
  };
}

/**
 * Dapatkan atau Buat Folder Utama di Google Drive waruppusigap@gmail.com
 */
function getOrCreateRootFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER);
  if (folders.hasNext()) {
    return folders.next();
  }
  const root = DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER);
  root.setDescription("Penyimpanan Berkas Pengajuan & Hasil Evaluasi Produk Hukum Desa se-Kecamatan Waru");
  
  // Buat subfolder per desa
  const fBangunMulya = root.createFolder("Desa_Bangun_Mulya");
  const fSesulu = root.createFolder("Desa_Sesulu");
  const fApiApi = root.createFolder("Desa_Api_Api");
  const fWaru = root.createFolder("Desa_Waru");
  const fKecamatan = root.createFolder("SK_dan_Berita_Acara_Kecamatan");
  
  // Buat file petunjuk di dalam folder
  root.createFile("PETUNJUK_PENYIMPANAN_BERKAS.txt", 
    "FOLDER PENYIMPANAN BERKAS PRODUK HUKUM DESA KECAMATAN WARU\n" +
    "Akun Resmi: waruppusigap@gmail.com\n" +
    "Kabupaten Penajam Paser Utara, Kalimantan Timur\n\n" +
    "Folder ini menyimpan draf peraturan desa (Perdes, Perkades, SK Kades), Berita Acara Musdes, Daftar Hadir, dan SK Camat Hasil Evaluasi."
  );
  
  return root;
}

/**
 * Dapatkan atau Buat Subfolder Khusus Desa
 */
function getDesaFolder(desaNama) {
  const root = getOrCreateRootFolder();
  const folderName = desaNama.replace(/\s+/g, '_');
  const subs = root.getFoldersByName(folderName);
  if (subs.hasNext()) {
    return subs.next();
  }
  return root.createFolder(folderName);
}

/**
 * Dapatkan atau Buat Spreadsheet Database
 */
function getOrCreateSpreadsheet(rootFolder) {
  const files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
  let ss;
  if (files.hasNext()) {
    const file = files.next();
    ss = SpreadsheetApp.openById(file.getId());
  } else {
    ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    const file = DriveApp.getFileById(ss.getId());
    rootFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    // Inisialisasi Sheet 1: Pengajuan Produk Hukum
    const sheetPengajuan = ss.getActiveSheet();
    sheetPengajuan.setName("Pengajuan_Produk_Hukum");
    sheetPengajuan.appendRow([
      "ID Pengajuan",
      "Tanggal Pengajuan",
      "Desa",
      "Jenis Produk Hukum",
      "Kategori",
      "Jalur Permendagri 111",
      "Judul Dokumen",
      "Status",
      "Nomor Registrasi",
      "SLA Deadline",
      "Pengaju / Kades",
      "Link Drive Draf",
      "Link Drive Lampiran BA",
      "Link Drive SK BPD",
      "Terakhir Diperbarui"
    ]);
    sheetPengajuan.getRange(1, 1, 1, 15).setBackground("#047857").setFontColor("#FFFFFF").setFontWeight("bold");
    sheetPengajuan.setFrozenRows(1);
    
    // Inisialisasi Sheet 2: Matriks Harmonisasi & Evaluasi
    const sheetMatriks = ss.insertSheet("Matriks_Harmonisasi");
    sheetMatriks.appendRow([
      "ID Pengajuan",
      "Desa",
      "Bagian / Pasal",
      "Bunyi Draf Awal",
      "Catatan Harmonisasi Kecamatan",
      "Rekomendasi Perbaikan",
      "Status Koreksi",
      "Aspek Yuridis",
      "Tanggal Evaluasi"
    ]);
    sheetMatriks.getRange(1, 1, 1, 9).setBackground("#1E3A8A").setFontColor("#FFFFFF").setFontWeight("bold");
    sheetMatriks.setFrozenRows(1);
    
    // Inisialisasi Sheet 3: Log Aktivitas
    const sheetLog = ss.insertSheet("Log_Aktivitas");
    sheetLog.appendRow([
      "Timestamp",
      "ID Pengajuan",
      "Desa",
      "Aktor",
      "Role",
      "Aksi / Aktivitas",
      "Keterangan"
    ]);
    sheetLog.getRange(1, 1, 1, 7).setBackground("#334155").setFontColor("#FFFFFF").setFontWeight("bold");
    sheetLog.setFrozenRows(1);
  }
  return ss;
}

/**
 * Mengisi Data Awal ke Spreadsheet agar Tidak Kosong saat Pertama Dibuat
 */
function populateInitialSampleData(ss) {
  const sheet = ss.getSheetByName("Pengajuan_Produk_Hukum");
  if (sheet.getLastRow() <= 1) {
    const sampleRows = [
      [
        "DOC-2026-001",
        "2026-10-12",
        "Desa Bangun Mulya",
        "PERDES",
        "APBDes / Perubahan APBDes",
        "EVALUASI",
        "Rancangan Peraturan Desa Bangun Mulya Nomor 01 Tahun 2026 tentang Anggaran Pendapatan dan Belanja Desa (APBDes) Tahun Anggaran 2026",
        "EVALUASI_KECAMATAN",
        "-",
        "2026-11-09",
        "Bambang Supriyanto (Kepala Desa)",
        "https://drive.google.com/drive/folders/waruppusigap-desa-bangun-mulya",
        "https://drive.google.com/drive/folders/waruppusigap-desa-bangun-mulya",
        "https://drive.google.com/drive/folders/waruppusigap-desa-bangun-mulya",
        new Date().toLocaleString("id-ID")
      ],
      [
        "DOC-2026-002",
        "2026-10-14",
        "Desa Sesulu",
        "PERDES",
        "Ketertiban & Lingkungan Hidup",
        "KLARIFIKASI",
        "Rancangan Peraturan Desa Sesulu Nomor 03 Tahun 2026 tentang Pengelolaan Sampah Terpadu dan Pelestarian Lingkungan Hidup Desa Sesulu",
        "PEMBAHASAN_BPD",
        "-",
        "2026-11-11",
        "H. Syamsudin (Kepala Desa)",
        "https://drive.google.com/drive/folders/waruppusigap-desa-sesulu",
        "https://drive.google.com/drive/folders/waruppusigap-desa-sesulu",
        "-",
        new Date().toLocaleString("id-ID")
      ],
      [
        "DOC-2026-003",
        "2026-09-28",
        "Desa Bangun Mulya",
        "SK_KADES",
        "Sosial & Bantuan Langsung",
        "KLARIFIKASI",
        "Keputusan Kepala Desa Bangun Mulya Nomor 188.45/08/2026 tentang Penetapan Keluarga Penerima Manfaat BLT Dana Desa 2026",
        "SELESAI_TEREGISTRASI",
        "REG.180.12/04/WARU/2026",
        "2026-10-26",
        "Bambang Supriyanto (Kepala Desa)",
        "https://drive.google.com/drive/folders/waruppusigap-desa-bangun-mulya",
        "-",
        "-",
        new Date().toLocaleString("id-ID")
      ],
      [
        "DOC-2026-004",
        "2026-10-08",
        "Desa Api-Api",
        "PERDES",
        "Pungutan Desa",
        "EVALUASI",
        "Rancangan Peraturan Desa Api-Api Nomor 02 Tahun 2026 tentang Penyertaan Modal Desa pada BUMDes Api-Api Berkah",
        "REVISI_DESA",
        "-",
        "2026-11-05",
        "M. Ali Wardhana (Kepala Desa)",
        "https://drive.google.com/drive/folders/waruppusigap-desa-api-api",
        "-",
        "-",
        new Date().toLocaleString("id-ID")
      ],
      [
        "DOC-2026-005",
        "2026-10-15",
        "Desa Waru",
        "PERKADES",
        "Pengadaan Barang & Jasa",
        "KLARIFIKASI",
        "Peraturan Kepala Desa Waru Nomor 01 Tahun 2026 tentang Tata Cara Pengadaan Barang/Jasa di Desa Waru",
        "VERIFIKASI_KECAMATAN",
        "-",
        "2026-11-12",
        "Syahril, S.E (Kepala Desa)",
        "https://drive.google.com/drive/folders/waruppusigap-desa-waru",
        "-",
        "-",
        new Date().toLocaleString("id-ID")
      ]
    ];
    
    sampleRows.forEach(row => sheet.appendRow(row));
  }

  // Isi data awal sheet matriks evaluasi
  const sheetMatriks = ss.getSheetByName("Matriks_Harmonisasi");
  if (sheetMatriks.getLastRow() <= 1) {
    const sampleMatriks = [
      [
        "DOC-2026-001",
        "Desa Bangun Mulya",
        "Dasar Hukum (Mengingat Angka 2)",
        "2. Undang-Undang Nomor 32 Tahun 2004 tentang Pemerintahan Daerah;",
        "UU Nomor 32 Tahun 2004 sudah dicabut dan dinyatakan TIDAK BERLAKU, digantikan oleh UU Nomor 23 Tahun 2014.",
        "Hapus angka 2 atau ganti dengan UU Nomor 23 Tahun 2014.",
        "PERLU_PERBAIKAN",
        "YURIDIS",
        new Date().toLocaleString("id-ID")
      ],
      [
        "DOC-2026-001",
        "Desa Bangun Mulya",
        "Dasar Hukum (Mengingat Angka 4)",
        "4. Peraturan Menteri Dalam Negeri Nomor 113 Tahun 2014 tentang Pengelolaan Keuangan Desa;",
        "Permendagri Nomor 113 Tahun 2014 sudah tidak berlaku, telah diganti oleh Permendagri Nomor 20 Tahun 2018.",
        "Ganti dengan Permendagri Nomor 20 Tahun 2018 tentang Pengelolaan Keuangan Desa.",
        "PERLU_PERBAIKAN",
        "YURIDIS",
        new Date().toLocaleString("id-ID")
      ],
      [
        "DOC-2026-001",
        "Desa Bangun Mulya",
        "Dasar Hukum (Mengingat Angka 1)",
        "1. Undang-Undang Nomor 6 Tahun 2014 tentang Desa;",
        "UU Nomor 6 Tahun 2014 telah mengalami perubahan kedua yaitu UU Nomor 3 Tahun 2024.",
        "Sempurnakan frasa menjadi: UU No. 6/2014 sebagaimana telah diubah dengan UU No. 3/2024.",
        "PERLU_PERBAIKAN",
        "YURIDIS",
        new Date().toLocaleString("id-ID")
      ]
    ];
    sampleMatriks.forEach(row => sheetMatriks.appendRow(row));
  }
}

/**
 * Endpoint Webhook HTTP POST
 */
function doPost(e) {
  try {
    const rootFolder = getOrCreateRootFolder();
    const spreadsheet = getOrCreateSpreadsheet(rootFolder);
    
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    
    // 1. Upload Berkas ke Google Drive
    if (action === "UPLOAD_FILE") {
      const desaFolder = getDesaFolder(postData.desaNama || "Umum");
      const decodedBytes = Utilities.base64Decode(postData.base64Data);
      const blob = Utilities.newBlob(decodedBytes, postData.mimeType || "application/pdf", postData.fileName);
      const uploadedFile = desaFolder.createFile(blob);
      uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      return jsonResponse({
        success: true,
        message: "Berkas berhasil disimpan di Google Drive",
        fileUrl: uploadedFile.getUrl(),
        fileId: uploadedFile.getId(),
        fileName: uploadedFile.getName()
      });
    }
    
    // 2. Simpan / Sinkronisasi 1 Pengajuan Produk Hukum ke Sheet
    if (action === "SYNC_SUBMISSION") {
      const sheet = spreadsheet.getSheetByName("Pengajuan_Produk_Hukum");
      const doc = postData.document;
      
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === doc.id) {
          rowIndex = i + 1;
          break;
        }
      }
      
      const rowValues = [
        doc.id,
        doc.tanggalPengajuan,
        doc.desaNama,
        doc.jenis,
        doc.kategori,
        doc.jalur,
        doc.judul,
        doc.status,
        doc.nomorRegistrasi || "-",
        doc.slaDeadline,
        doc.pengaju?.nama || "-",
        doc.berkas?.drafUtama?.driveLink || "-",
        doc.berkas?.lampiranMusdes?.driveLink || "-",
        doc.berkas?.skPersetujuanBpd?.driveLink || "-",
        new Date().toLocaleString("id-ID")
      ];
      
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
      
      return jsonResponse({
        success: true,
        message: "Data pengajuan berhasil dicatat di Google Sheet",
        spreadsheetUrl: spreadsheet.getUrl()
      });
    }
    
    // 3. Sinkronisasi Seluruh Dokumen Sekaligus (SYNC_ALL_BATCH)
    if (action === "SYNC_ALL_BATCH") {
      const sheet = spreadsheet.getSheetByName("Pengajuan_Produk_Hukum");
      const sheetMatriks = spreadsheet.getSheetByName("Matriks_Harmonisasi");
      const documents = postData.documents || [];
      
      documents.forEach(doc => {
        const data = sheet.getDataRange().getValues();
        let rowIndex = -1;
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] === doc.id) {
            rowIndex = i + 1;
            break;
          }
        }
        
        const rowValues = [
          doc.id,
          doc.tanggalPengajuan,
          doc.desaNama,
          doc.jenis,
          doc.kategori,
          doc.jalur,
          doc.judul,
          doc.status,
          doc.nomorRegistrasi || "-",
          doc.slaDeadline,
          doc.pengaju?.nama || "-",
          doc.berkas?.drafUtama?.driveLink || "-",
          doc.berkas?.lampiranMusdes?.driveLink || "-",
          doc.berkas?.skPersetujuanBpd?.driveLink || "-",
          new Date().toLocaleString("id-ID")
        ];
        
        if (rowIndex > 0) {
          sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
        } else {
          sheet.appendRow(rowValues);
        }
        
        // Simpan matriks evaluasinya jika ada
        if (doc.matriksEvaluasi && doc.matriksEvaluasi.length > 0) {
          doc.matriksEvaluasi.forEach(item => {
            sheetMatriks.appendRow([
              doc.id,
              doc.desaNama,
              item.bagianPasal,
              item.drafAwal,
              item.catatanHarmonisasi,
              item.rekomendasiPerbaikan,
              item.status,
              item.kategoriAspek || "SUBSTANSI",
              new Date().toLocaleString("id-ID")
            ]);
          });
        }
      });
      
      return jsonResponse({
        success: true,
        message: `Berhasil menyinkronkan ${documents.length} dokumen ke Google Sheet!`,
        spreadsheetUrl: spreadsheet.getUrl()
      });
    }

    // 4. Simpan Matriks Evaluasi ke Sheet
    if (action === "SAVE_MATRIX") {
      const sheet = spreadsheet.getSheetByName("Matriks_Harmonisasi");
      const { docId, desaNama, matriks } = postData;
      
      matriks.forEach(item => {
        sheet.appendRow([
          docId,
          desaNama,
          item.bagianPasal,
          item.drafAwal,
          item.catatanHarmonisasi,
          item.rekomendasiPerbaikan,
          item.status,
          item.kategoriAspek || "SUBSTANSI",
          new Date().toLocaleString("id-ID")
        ]);
      });
      
      return jsonResponse({
        success: true,
        message: `${matriks.length} butir matriks evaluasi tersimpan di Google Sheet`
      });
    }
    
    // 5. Test Koneksi
    if (action === "TEST_CONNECTION") {
      return jsonResponse({
        success: true,
        message: "Koneksi ke Google Drive & Sheet waruppusigap@gmail.com aktif!",
        folderUrl: rootFolder.getUrl(),
        spreadsheetUrl: spreadsheet.getUrl(),
        account: CONFIG.OWNER_EMAIL,
        timestamp: new Date().toISOString()
      });
    }
    
    return jsonResponse({ success: false, message: "Aksi tidak dikenali: " + action });
    
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * Endpoint Webhook HTTP GET
 */
function doGet(e) {
  const rootFolder = getOrCreateRootFolder();
  const spreadsheet = getOrCreateSpreadsheet(rootFolder);
  
  return jsonResponse({
    status: "ONLINE",
    app: "SI Harmonisasi & Evaluasi Produk Hukum Desa - Kecamatan Waru",
    kabupaten: "Penajam Paser Utara",
    email: CONFIG.OWNER_EMAIL,
    folderUrl: rootFolder.getUrl(),
    spreadsheetUrl: spreadsheet.getUrl()
  });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
