import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Layers, 
  BookOpen, 
  Settings, 
  Check, 
  Loader2,
  FileText,
  ArrowRight
} from 'lucide-react';
import { generateHarmonizationNotes } from '../services/aiHarmonizerService';
import { SAMPLE_DRAFT_APBDES_BANGUN_MULYA } from '../data/seedData';
import { storageService } from '../services/storageService';

const ANALYSIS_STEPS = [
  '1. Memeriksa Nomenklatur, Penomoran & Tata Naskah Judul...',
  '2. Memvalidasi Frasa Sakral Pembukaan & Jabatan Kepala Desa...',
  '3. Menganalisis Aspek Filosofis, Sosiologis & Yuridis Menimbang...',
  '4. Menguji Hierarki Dasar Hukum Mengingat & Mendeteksi Regulasi Kadaluarsa...',
  '5. Memeriksa Klausul Kesepakatan Bersama BPD & Diktum Penetapan...',
  '6. Meneliti Batang Tubuh, Batas Kewenangan Desa & Aspek Sanksi...',
  '7. Mengevaluasi Ketentuan Pengundangan oleh Sekdes di Lembaran Desa...',
  '8. Memeriksa Kelengkapan Lampiran Teknis & Anggaran...'
];

export default function AiHarmonizerModal({ 
  document: initialDoc, 
  documents, 
  onClose, 
  onApplyMatrixToDoc,
  onOpenSettings 
}) {
  const [selectedDocId, setSelectedDocId] = useState(initialDoc?.id || documents[0]?.id);
  const targetDoc = documents.find(d => d.id === selectedDocId) || initialDoc || documents[0];

  const [draftText, setDraftText] = useState(targetDoc?.teksDraf || SAMPLE_DRAFT_APBDES_BANGUN_MULYA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generatedResults, setGeneratedResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const settings = storageService.getSettings();
  const hasGeminiKey = Boolean(settings.geminiApiKey?.trim());

  const handleSelectDocChange = (docId) => {
    setSelectedDocId(docId);
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setDraftText(doc.teksDraf || '');
      setGeneratedResults(null);
    }
  };

  const handleLoadPreset = (presetKey) => {
    if (presetKey === 'apbdes') {
      setDraftText(SAMPLE_DRAFT_APBDES_BANGUN_MULYA);
    } else if (presetKey === 'sesulu') {
      const docSesulu = documents.find(d => d.desaId === 'desa-sesulu');
      setDraftText(docSesulu?.teksDraf || '');
    }
    setGeneratedResults(null);
  };

  const handleStartGeneration = async () => {
    if (!draftText || draftText.trim().length < 20) {
      setErrorMsg('Teks draf peraturan terlalu pendek untuk dianalisis.');
      return;
    }

    setErrorMsg('');
    setIsGenerating(true);
    setCurrentStepIndex(0);
    setGeneratedResults(null);

    // Animasi visual langkah evaluasi perundang-undangan
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 350);

    try {
      const result = await generateHarmonizationNotes({
        draftText,
        jenisProduk: targetDoc?.jenis || 'PERDES',
        namaDesa: targetDoc?.desaNama || 'Desa Bangun Mulya',
        apiKey: settings.geminiApiKey
      });

      clearInterval(stepInterval);
      setCurrentStepIndex(ANALYSIS_STEPS.length - 1);
      
      setTimeout(() => {
        setIsGenerating(false);
        setGeneratedResults(result);
      }, 500);

    } catch (err) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setErrorMsg(err.message || 'Gagal menghasilkan catatan harmonisasi.');
    }
  };

  const handleApplyToDocument = () => {
    if (!generatedResults || !targetDoc) return;
    onApplyMatrixToDoc(targetDoc.id, generatedResults.matriks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-govnavy-900 via-indigo-950 to-purple-950 text-white p-5 sm:px-6 flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-govnavy-950">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold tracking-tight text-white">
                  AI Generator Harmonisasi Produk Hukum
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Kecamatan Waru
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Uji 8 Bagian Struktur Peraturan Desa &bull; Permendagri 111/2014 & UU No. 3/2024
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Gemini API Key */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg bg-indigo-900/40 border border-indigo-700/50">
              <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-indigo-200">
                {hasGeminiKey ? 'Gemini 1.5 Flash Aktif' : 'Mesin Yuridis Permendagri 111 (Offline Ready)'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Target Dokumen Selector & Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Dokumen Pengajuan yang Akan Diharmonisasi:
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => handleSelectDocChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-medium"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>
                    [{d.desaNama}] {d.jenis} - {d.judul}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preset Draf Uji Coba:
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleLoadPreset('apbdes')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 text-xs font-medium flex-1 text-center truncate"
                  title="Muat draf APBDes Bangun Mulya (ada UU kadaluarsa)"
                >
                  APBDes Bangun Mulya
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('sesulu')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 text-xs font-medium flex-1 text-center truncate"
                >
                  Perdes Sampah Sesulu
                </button>
              </div>
            </div>
          </div>

          {/* Area Teks Draf Peraturan */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Naskah Draf Peraturan yang Dianalisis:</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {draftText.length} Karakter &bull; Pastikan memuat Judul, Menimbang, Mengingat, dan Pasal-pasal
              </span>
            </div>

            <textarea
              rows={8}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Tempelkan draf rancangan peraturan desa di sini..."
              className="w-full p-3.5 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>

          {/* Error Message jika ada */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tombol Utama Generate AI */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {hasGeminiKey ? (
                <span>Terhubung ke Google Gemini AI & Model Regulasi PPU</span>
              ) : (
                <span>
                  Menggunakan Mesin Yuridis Permendagri 111/2014 &bull;{' '}
                  <button onClick={onOpenSettings} className="text-indigo-600 hover:underline font-semibold">
                    Atur API Key Gemini
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleStartGeneration}
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-indigo-950/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                  <span>Menganalisis Draf Regulasi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>Generate Catatan Harmonisasi AI</span>
                </>
              )}
            </button>
          </div>

          {/* Tampilan Proses Langkah Evaluasi saat Loading */}
          {isGenerating && (
            <div className="p-5 rounded-2xl bg-indigo-950 text-white space-y-4 border border-indigo-800 animate-fade-in">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  Sedang Menjalankan 8 Tahap Penelaahan Yuridis Kecamatan Waru:
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                {ANALYSIS_STEPS.map((step, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center space-x-2 transition-all ${
                      idx < currentStepIndex
                        ? 'text-emerald-400 font-semibold'
                        : idx === currentStepIndex
                        ? 'text-amber-300 font-bold scale-[1.01]'
                        : 'text-indigo-300/50'
                    }`}
                  >
                    {idx < currentStepIndex ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    ) : idx === currentStepIndex ? (
                      <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin text-amber-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-indigo-700 flex-shrink-0"></div>
                    )}
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hasil Matriks Harmonisasi Tergenerate */}
          {generatedResults && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-extrabold text-emerald-950">
                      Analisis Harmonisasi Selesai ({generatedResults.matriks.length} Butir Dihasilkan)
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Sumber Analisis: <strong>{generatedResults.source === 'GEMINI_AI' ? 'Google Gemini 1.5' : 'Mesin Yuridis Permendagri 111/2014 & UU 3/2024'}</strong>.
                  </p>
                </div>

                <button
                  onClick={handleApplyToDocument}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center space-x-2 shadow-sm"
                >
                  <span>Terapkan ke Matriks Dokumen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Tabel Ringkasan Hasil AI */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white sticky top-0">
                    <tr>
                      <th className="p-3 w-10 text-center">No</th>
                      <th className="p-3 w-40">Bagian Struktur</th>
                      <th className="p-3">Catatan Harmonisasi Kecamatan</th>
                      <th className="p-3">Rekomendasi Rumusan Perbaikan</th>
                      <th className="p-3 w-28 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {generatedResults.matriks.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 align-top">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{item.bagianPasal}</td>
                        <td className="p-3 text-slate-800 leading-relaxed">{item.catatanHarmonisasi}</td>
                        <td className="p-3 text-slate-900 bg-blue-50/30 font-medium leading-relaxed">
                          {item.rekomendasiPerbaikan}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'SESUAI'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'PERLU_PERBAIKAN'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Seksi Pemerintahan & Tim Evaluasi Hukum Kecamatan Waru
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Tutup
            </button>
            {generatedResults && (
              <button
                onClick={handleApplyToDocument}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1.5"
              >
                <span>Terapkan Hasil ke Matriks</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
