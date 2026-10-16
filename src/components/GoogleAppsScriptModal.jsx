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
  Mail,
  Send,
  Info,
  Trash2
} from 'lucide-react';
import { googleSheetService } from '../services/googleSheetService';

export default function GoogleAppsScriptModal({ documents = [], onClose, onClearAllData }) {
  const [webhookUrl, setWebhookUrl] = useState(googleSheetService.getWebhookUrl());
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  
  // Batch sync state
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncAllResult, setSyncAllResult] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  const accountInfo = googleSheetService.getAccountInfo();

  const handleCopyCode = async () => {
    try {
      let codeText = '';
      try {
        const response = await fetch('./google-apps-script/Code.gs');
        if (response.ok) {
          codeText = await response.text();
        }
      } catch (e) {}

      if (!codeText) {
        codeText = `// Silakan gunakan file google-apps-script/Code.gs yang terdapat di repositori aplikasi.`;
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

  const handleSyncAllToGoogle = async () => {
    if (!webhookUrl.trim()) {
      alert('Harap masukkan dan simpan URL Web App Google Apps Script terlebih dahulu di kolom di bawah.');
      return;
    }

    setIsSyncingAll(true);
    setSyncAllResult(null);

    try {
      const result = await googleSheetService.syncAllDocuments(documents);
      setSyncAllResult({
        success: true,
        message: result.message || `Berhasil menyinkronkan seluruh data ke Google Sheet!`,
        spreadsheetUrl: result.spreadsheetUrl
      });
    } catch (err) {
      setSyncAllResult({
        success: false,
        message: `Gagal sinkronisasi: ${err.message}`
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleClearBoth = async () => {
    if (!confirm('Kosongkan seluruh data di Aplikasi dan Google Sheet?\n\nSemua baris data akan dihapus agar Anda bisa mulai menginput data draf yang sebenarnya.')) {
      return;
    }

    setIsClearing(true);
    try {
      if (onClearAllData) onClearAllData();
      const res = await googleSheetService.clearAllSpreadsheetData();
      if (res && res.success) {
        setSyncAllResult({
          success: true,
          message: 'Database lokal dan Google Sheet berhasil dikosongkan (Siap input asli)!'
        });
      } else {
        setSyncAllResult({
          success: true,
          message: 'Database lokal berhasil dikosongkan! (Pastikan Webhook aktif jika ingin mengosongkan Sheet otomatis)'
        });
      }
    } catch (e) {
      setSyncAllResult({
        success: true,
        message: 'Database aplikasi berhasil dikosongkan.'
      });
    } finally {
      setIsClearing(false);
    }
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
                  waruppusigap@gmail.com
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Penyimpanan Database & Berkas Produk Hukum Desa se-Kecamatan Waru
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* PENTING: Penjelasan Kenapa Masih Kosong */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <HelpCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Kenapa Google Sheet dan Google Drive Awalnya Masih Kosong?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Google melindungi akun <strong>waruppusigap@gmail.com</strong> dengan enkripsi dan otorisasi. Sebuah aplikasi web tidak dapat membuat file di Drive Anda dari luar tanpa <strong>diberi izin sekali melalui Google Apps Script</strong>.
            </p>
            <div className="text-[11px] bg-white p-3 rounded-lg border border-amber-200 space-y-1">
              <div><strong>Solusinya sangat mudah (Hanya butuh 2 langkah):</strong></div>
              <div>1. Buka <strong>script.google.com</strong> &rarr; Buat project &rarr; Tempelkan kode &rarr; Klik <strong>Run (Jalankan)</strong> pada fungsi <code>setupInitialDatabase</code>. Folder dan Spreadsheet akan langsung otomatis terbuat!</div>
              <div>2. Klik <strong>Deploy sebagai Web App</strong> &rarr; Tempelkan URL Web App ke kolom di bawah &rarr; Klik tombol hijau <strong>"Sinkronkan Seluruh Data Sekarang"</strong>.</div>
            </div>
          </div>

          {/* Form Input Webhook URL & Tombol Sinkronisasi */}
          <div className="p-4 rounded-xl border border-slate-300 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900">
                Web App URL Google Apps Script:
              </label>
              {accountInfo.hasWebhook && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  Status: Terkonfigurasi
                </span>
              )}
            </div>

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

            {/* Tombol Push Semua Data Sekaligus & Kosongkan Data */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-[11px] text-slate-500">
                  Kirim seluruh {documents.length} dokumen pengajuan dan matriks ke Google Sheet:
                </div>
                <button
                  type="button"
                  onClick={handleSyncAllToGoogle}
                  disabled={isSyncingAll || isClearing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/20 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                  <span>{isSyncingAll ? 'Sedang Mengirim ke Google Sheet...' : 'Sinkronkan Seluruh Data Sekarang'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-[11px] text-rose-700">
                  Ingin input data asli dari nol? Kosongkan seluruh data bawaan:
                </div>
                <button
                  type="button"
                  onClick={handleClearBoth}
                  disabled={isClearing || isSyncingAll}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold text-xs flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Trash2 className={`w-3.5 h-3.5 text-rose-600 ${isClearing ? 'animate-spin' : ''}`} />
                  <span>{isClearing ? 'Mengosongkan...' : 'Kosongkan Seluruh Data (Siap Input Asli)'}</span>
                </button>
              </div>
            </div>

            {syncAllResult && (
              <div className={`p-3 rounded-lg border text-[11px] flex items-center justify-between ${
                syncAllResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <span>{syncAllResult.message}</span>
                {syncAllResult.spreadsheetUrl && (
                  <a
                    href={syncAllResult.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-emerald-700 hover:text-emerald-900 inline-flex items-center space-x-1"
                  >
                    <span>Buka Google Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 3 Langkah Panduan Instalasi Google Apps Script */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Petunjuk Langkah-demi-Langkah di Akun waruppusigap@gmail.com:</span>
            </h3>

            <div className="space-y-2.5 text-slate-700">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-slate-900">Buka script.google.com dengan email waruppusigap@gmail.com</div>
                  <p className="text-slate-500 text-[11px]">
                    Klik tautan ini: <a href="https://script.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold inline-flex items-center space-x-0.5"><span>script.google.com</span><ExternalLink className="w-3 h-3" /></a>, lalu klik <strong>New Project (+ Proyek Baru)</strong>.
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
                    Hapus kode bawaan di editor Apps Script dan tempelkan (paste) seluruh isi <strong>Code.gs</strong>. Kemudian pilih fungsi <code>setupInitialDatabase</code> di toolbar atas lalu klik <strong>Run (Jalankan)</strong> sekali. Folder Google Drive dan Spreadsheet langsung dibuat!
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
                    Klik tombol biru <strong>Deploy &rarr; New deployment</strong> &bull; Pilih tipe: <strong>Web app</strong> &bull; Execute as: <strong>Me (waruppusigap@gmail.com)</strong> &bull; Who has access: <strong>Anyone (Siapa saja)</strong>. Klik Deploy, salin <em>Web App URL</em>, dan simpan di formulir atas!
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Aplikasi tetap berjalan normal dan aman dengan memori lokal bahkan saat offline.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
