import React, { useState } from 'react';
import { 
  X, 
  FolderSync, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Sparkles,
  Database,
  Mail
} from 'lucide-react';
import { googleSheetService } from '../services/googleSheetService';

export default function GoogleAppsScriptModal({ onClose }) {
  const [webhookUrl, setWebhookUrl] = useState(googleSheetService.getWebhookUrl());
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  const accountInfo = googleSheetService.getAccountInfo();

  const handleCopyCode = async () => {
    try {
      let codeText = '';
      try {
        const response = await fetch('/google-apps-script/Code.gs');
        if (response.ok) {
          codeText = await response.text();
        }
      } catch (e) {}

      if (!codeText) {
        codeText = `/**
 * GOOGLE APPS SCRIPT: SI HARMONISASI KECAMATAN WARU
 * Akun Pengelola: waruppusigap@gmail.com
 */
const CONFIG = {
  DRIVE_ROOT_FOLDER: "SI_HARMONISASI_KECAMATAN_WARU_UPLOADS",
  SPREADSHEET_NAME: "DATABASE_SI_HARMONISASI_KECAMATAN_WARU",
  OWNER_EMAIL: "waruppusigap@gmail.com"
};

function setupInitialDatabase() {
  const rootFolder = getOrCreateRootFolder();
  const spreadsheet = getOrCreateSpreadsheet(rootFolder);
  Logger.log("SETUP BERHASIL! Folder: " + rootFolder.getUrl() + " | Sheet: " + spreadsheet.getUrl());
  return { success: true, folderUrl: rootFolder.getUrl(), spreadsheetUrl: spreadsheet.getUrl() };
}

function getOrCreateRootFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER);
  if (folders.hasNext()) return folders.next();
  const root = DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER);
  root.createFolder("Desa_Bangun_Mulya");
  root.createFolder("Desa_Sesulu");
  root.createFolder("Desa_Api_Api");
  root.createFolder("Desa_Waru");
  root.createFolder("SK_dan_Berita_Acara_Kecamatan");
  return root;
}

function getDesaFolder(desaNama) {
  const root = getOrCreateRootFolder();
  const folderName = desaNama.replace(/\\s+/g, '_');
  const subs = root.getFoldersByName(folderName);
  if (subs.hasNext()) return subs.next();
  return root.createFolder(folderName);
}

function getOrCreateSpreadsheet(rootFolder) {
  const files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
  let ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.openById(files.next().getId());
  } else {
    ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    const file = DriveApp.getFileById(ss.getId());
    rootFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    const sheetPengajuan = ss.getActiveSheet();
    sheetPengajuan.setName("Pengajuan_Produk_Hukum");
    sheetPengajuan.appendRow(["ID Pengajuan", "Tanggal", "Desa", "Jenis", "Kategori", "Jalur", "Judul", "Status", "No Registrasi", "SLA Deadline", "Pengaju", "Link Draf", "Link BA", "Link SK BPD", "Diperbarui"]);
    sheetPengajuan.getRange(1, 1, 1, 15).setBackground("#047857").setFontColor("#FFFFFF").setFontWeight("bold");
    const sheetMatriks = ss.insertSheet("Matriks_Harmonisasi");
    sheetMatriks.appendRow(["ID Pengajuan", "Desa", "Bagian / Pasal", "Bunyi Draf Awal", "Catatan Harmonisasi", "Rekomendasi", "Status", "Aspek", "Tanggal"]);
    sheetMatriks.getRange(1, 1, 1, 9).setBackground("#1E3A8A").setFontColor("#FFFFFF").setFontWeight("bold");
    const sheetLog = ss.insertSheet("Log_Aktivitas");
    sheetLog.appendRow(["Timestamp", "ID Pengajuan", "Desa", "Aktor", "Role", "Aksi", "Keterangan"]);
    sheetLog.getRange(1, 1, 1, 7).setBackground("#334155").setFontColor("#FFFFFF").setFontWeight("bold");
  }
  return ss;
}

function doPost(e) {
  try {
    const rootFolder = getOrCreateRootFolder();
    const spreadsheet = getOrCreateSpreadsheet(rootFolder);
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === "UPLOAD_FILE") {
      const desaFolder = getDesaFolder(postData.desaNama || "Umum");
      const decodedBytes = Utilities.base64Decode(postData.base64Data);
      const blob = Utilities.newBlob(decodedBytes, postData.mimeType || "application/pdf", postData.fileName);
      const uploadedFile = desaFolder.createFile(blob);
      uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return jsonResponse({ success: true, message: "Tersimpan di Google Drive", fileUrl: uploadedFile.getUrl(), fileId: uploadedFile.getId(), fileName: uploadedFile.getName() });
    }

    if (action === "SYNC_SUBMISSION") {
      const sheet = spreadsheet.getSheetByName("Pengajuan_Produk_Hukum");
      const doc = postData.document;
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === doc.id) { rowIndex = i + 1; break; }
      }
      const rowValues = [doc.id, doc.tanggalPengajuan, doc.desaNama, doc.jenis, doc.kategori, doc.jalur, doc.judul, doc.status, doc.nomorRegistrasi || "-", doc.slaDeadline, doc.pengaju?.nama || "-", doc.berkas?.drafUtama?.driveLink || "-", doc.berkas?.lampiranMusdes?.driveLink || "-", doc.berkas?.skPersetujuanBpd?.driveLink || "-", new Date().toLocaleString("id-ID")];
      if (rowIndex > 0) sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      else sheet.appendRow(rowValues);
      return jsonResponse({ success: true, message: "Data pengajuan tersinkronisasi ke Google Sheet", spreadsheetUrl: spreadsheet.getUrl() });
    }

    if (action === "SAVE_MATRIX") {
      const sheet = spreadsheet.getSheetByName("Matriks_Harmonisasi");
      const { docId, desaNama, matriks } = postData;
      matriks.forEach(item => {
        sheet.appendRow([docId, desaNama, item.bagianPasal, item.drafAwal, item.catatanHarmonisasi, item.rekomendasiPerbaikan, item.status, item.kategoriAspek || "SUBSTANSI", new Date().toLocaleString("id-ID")]);
      });
      return jsonResponse({ success: true, message: "Matriks tersimpan di Google Sheet" });
    }

    if (action === "TEST_CONNECTION") {
      return jsonResponse({ success: true, message: "Koneksi Google Drive & Sheet waruppusigap@gmail.com Berhasil!", folderUrl: rootFolder.getUrl(), spreadsheetUrl: spreadsheet.getUrl(), account: CONFIG.OWNER_EMAIL });
    }

    return jsonResponse({ success: false, message: "Aksi tidak dikenal" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doGet(e) {
  const rootFolder = getOrCreateRootFolder();
  const spreadsheet = getOrCreateSpreadsheet(rootFolder);
  return jsonResponse({ status: "ONLINE", app: "SI Harmonisasi Kecamatan Waru", email: CONFIG.OWNER_EMAIL, folderUrl: rootFolder.getUrl(), spreadsheetUrl: spreadsheet.getUrl() });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;
      }

      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      alert('Masukkan URL Web App Google Apps Script terlebih dahulu.');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await googleSheetService.testConnection(webhookUrl.trim());
      setTestResult({
        success: true,
        message: result.message || 'Koneksi ke Google Drive & Sheet waruppusigap@gmail.com Berhasil Terhubung!'
      });
      googleSheetService.setWebhookUrl(webhookUrl.trim());
    } catch (err) {
      setTestResult({
        success: false,
        message: `Gagal menghubungi endpoint: ${err.message}. Pastikan akses Web App disetel ke "Anyone" (Siapa saja).`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveUrl = () => {
    googleSheetService.setWebhookUrl(webhookUrl.trim());
    setSaveStatus('Konfigurasi URL Google Apps Script berhasil disimpan!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-govnavy-900 text-white p-5 flex items-center justify-between border-b border-emerald-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <FolderSync className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Integrasi Google Sheet & Drive Kecamatan Waru
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                  Ready
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Akun Terdaftar: <strong className="text-white underline">waruppusigap@gmail.com</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Status Akun & Folder Target */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-950">Target Akun Google Drive & Sheet:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono font-bold">
                  waruppusigap@gmail.com
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                {accountInfo.hasWebhook ? 'Terkoneksi Web App' : 'Mode Simulasi Lokal Aktif'}
              </span>
            </div>

            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Sistem telah dilengkapi skrip otomatis Google Apps Script yang akan langsung membuat <strong>Folder Drive</strong> (dengan subfolder untuk Desa Bangun Mulya, Desa Sesulu, Desa Api-Api, Desa Waru) dan <strong>Google Spreadsheet</strong> dengan 3 sheet terstruktur: <em>Pengajuan_Produk_Hukum</em>, <em>Matriks_Harmonisasi</em>, dan <em>Log_Aktivitas</em>.
            </p>
          </div>

          {/* 3 Langkah Mudah Pemasangan */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Petunjuk Pemasangan 3 Menit di Google Apps Script:</span>
            </h3>

            <div className="space-y-2.5 text-slate-700">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-slate-900">Buka Google Apps Script dengan akun waruppusigap@gmail.com</div>
                  <p className="text-slate-500 text-[11px]">
                    Kunjungi <a href="https://script.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold inline-flex items-center space-x-0.5"><span>script.google.com</span><ExternalLink className="w-3 h-3" /></a>, lalu klik <strong>New Project (Proyek Baru)</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Salin & Tempel Kode Script (Code.gs)</span>
                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Tersalin!' : 'Salin Code.gs'}</span>
                    </button>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Hapus kode bawaan di editor Apps Script dan tempelkan seluruh isi <strong>google-apps-script/Code.gs</strong>. Jalankan fungsi <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">setupInitialDatabase()</code> sekali untuk otomatis membuat folder dan spreadsheet.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-slate-900">Deploy (Terapkan) sebagai Web App</div>
                  <p className="text-slate-500 text-[11px]">
                    Klik <strong>Deploy &rarr; New deployment</strong> &bull; Pilih tipe <strong>Web app</strong> &bull; Execute as: <strong>Me (waruppusigap@gmail.com)</strong> &bull; Who has access: <strong>Anyone</strong>. Salin Web App URL yang dihasilkan dan masukkan ke kolom di bawah.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Input Webhook URL */}
          <div className="p-4 rounded-xl border border-slate-300 bg-white space-y-3">
            <label className="block font-bold text-slate-900">
              Web App URL Google Apps Script:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 flex-shrink-0 disabled:opacity-50"
              >
                <FolderSync className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Menguji...' : 'Tes Koneksi'}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveUrl}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex-shrink-0"
              >
                Simpan
              </button>
            </div>

            {saveStatus && (
              <div className="text-emerald-700 font-semibold text-[11px]">{saveStatus}</div>
            )}

            {testResult && (
              <div className={`p-3 rounded-lg border text-[11px] flex items-center space-x-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Aplikasi tetap berfungsi 100% dengan database lokal bahkan saat offline.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
