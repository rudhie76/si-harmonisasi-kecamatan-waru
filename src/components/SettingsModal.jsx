import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Sparkles, 
  FolderSync, 
  RotateCcw, 
  Check, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { storageService } from '../services/storageService';

export default function SettingsModal({ onClose, onResetData }) {
  const settings = storageService.getSettings();
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [gasWebhookUrl, setGasWebhookUrl] = useState(settings.gasWebhookUrl || '');
  const [saveStatus, setSaveStatus] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    storageService.saveSettings({
      geminiApiKey: geminiApiKey.trim(),
      gasWebhookUrl: gasWebhookUrl.trim(),
      autoSyncGoogle: true,
      googleEmail: 'waruppusigap@gmail.com'
    });
    setSaveStatus('Pengaturan berhasil disimpan!');
    setTimeout(() => {
      setSaveStatus('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full my-auto shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-govnavy-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Pengaturan SI Harmonisasi
              </h2>
              <p className="text-xs text-slate-300">
                Konfigurasi Gemini AI & Google Cloud
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>Google Gemini API Key (Opsional)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline text-[11px] font-semibold flex items-center space-x-0.5"
              >
                <span>Dapatkan Kunci Gratis</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 leading-normal">
              Bila diisi, modul AI Generator akan menggunakan model <strong>Gemini 1.5 Flash</strong>. Jika dibiarkan kosong, sistem otomatis beralih ke <strong>Mesin Yuridis Permendagri 111/2014 & UU 3/2024</strong> yang bekerja 100% tanpa internet.
            </p>
          </div>

          {/* Webhook Google Apps Script */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center space-x-1.5">
              <FolderSync className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Apps Script Web App URL (waruppusigap@gmail.com)</span>
            </label>
            <input
              type="url"
              value={gasWebhookUrl}
              onChange={(e) => setGasWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500">
              Digunakan untuk menyinkronkan pengajuan produk hukum dan upload berkas ke Google Drive.
            </p>
          </div>

          {/* Reset Database */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">Muat Ulang Data Contoh (Seed Data)</div>
              <div className="text-[11px] text-slate-500">Mengembalikan berkas contoh APBDes Bangun Mulya, Sesulu, dll.</div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan seluruh data ke contoh bawaan awal?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>

          {saveStatus && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-center border border-emerald-200">
              {saveStatus}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
