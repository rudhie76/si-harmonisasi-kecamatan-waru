/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT: SI HARMONISASI KECAMATAN WARU
 * Akun Pengelola: waruppusigap@gmail.com
 * Sistem Informasi Harmonisasi & Evaluasi Produk Hukum Desa Kecamatan Waru
 * Kabupaten Penajam Paser Utara, Provinsi Kalimantan Timur
 * =========================================================================================
 * 
 * PETUNJUK INSTALASI:
 * 1. Buka browser dan login ke akun Google: waruppusigap@gmail.com
 * 2. Kunjungi: https://script.google.com/
 * 3. Klik "New Project" / "Proyek Baru", beri nama: "SI_Harmonisasi_Kecamatan_Waru_API"
 * 4. Hapus semua kode default dan tempelkan (paste) seluruh isi file ini ke Code.gs
 * 5. Jalankan fungsi "setupInitialDatabase()" sekali melalui menu Run (Jalankan) untuk
 *    mengotorisasi dan otomatis membuat Folder Drive & Google Sheet.
 * 6. Klik "Deploy" (Terapkan) -> "New deployment" (Penerapan baru) -> Pilih type "Web app"
 *    - Execute as: "Me (waruppusigap@gmail.com)"
 *    - Who has access: "Anyone" (Siapa saja)
 * 7. Salin "Web App URL" yang diberikan, lalu masukkan ke menu Pengaturan di Web SI Harmonisasi!
 */

const CONFIG = {
  DRIVE_ROOT_FOLDER: "SI_HARMONISASI_KECAMATAN_WARU_UPLOADS",
  SPREADSHEET_NAME: "DATABASE_SI_HARMONISASI_KECAMATAN_WARU",
  OWNER_EMAIL: "waruppusigap@gmail.com"
};

/**
 * Fungsi Setup Awal: Otomatis Membuat Folder Drive dan Google Sheet
 */
function setupInitialDatabase() {
  const rootFolder = getOrCreateRootFolder();
  const spreadsheet = getOrCreateSpreadsheet(rootFolder);
  
  Logger.log("SETUP BERHASIL!");
  Logger.log("Folder Drive: " + rootFolder.getUrl());
  Logger.log("Google Spreadsheet: " + spreadsheet.getUrl());
  
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
  root.createFolder("Desa_Bangun_Mulya");
  root.createFolder("Desa_Sesulu");
  root.createFolder("Desa_Api_Api");
  root.createFolder("Desa_Waru");
  root.createFolder("SK_dan_Berita_Acara_Kecamatan");
  
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
      "Jalur",
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
    
    // 2. Simpan / Sinkronisasi Pengajuan Produk Hukum ke Sheet
    if (action === "SYNC_SUBMISSION") {
      const sheet = spreadsheet.getSheetByName("Pengajuan_Produk_Hukum");
      const doc = postData.document;
      
      // Cari apakah ID sudah ada
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
      
      // Catat log
      const logSheet = spreadsheet.getSheetByName("Log_Aktivitas");
      logSheet.appendRow([
        new Date().toLocaleString("id-ID"),
        doc.id,
        doc.desaNama,
        postData.aktor || "Sistem",
        postData.role || "PEMDES",
        "Penyelarasan Pengajuan Dokumen",
        `Status: ${doc.status}`
      ]);
      
      return jsonResponse({
        success: true,
        message: "Data pengajuan berhasil dicatat di Google Sheet",
        spreadsheetUrl: spreadsheet.getUrl()
      });
    }
    
    // 3. Simpan Matriks Evaluasi ke Sheet
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
    
    // 4. Test Koneksi
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
