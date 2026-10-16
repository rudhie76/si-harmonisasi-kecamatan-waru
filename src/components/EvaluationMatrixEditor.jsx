import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  FolderSync,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { googleSheetService } from '../services/googleSheetService';

export default function EvaluationMatrixEditor({ 
  document: doc, 
  currentRole, 
  onUpdateDocument, 
  onOpenAiGenerator, 
  onOpenPrint 
}) {
  const [matrixList, setMatrixList] = useState(doc.matriksEvaluasi || []);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');

  const isKecamatan = currentRole.role === 'KECAMATAN';

  const handleOpenAdd = () => {
    setEditingItem({
      id: `ME-${Date.now().toString().slice(-4)}`,
      bagianPasal: '',
      drafAwal: '',
      catatanHarmonisasi: '',
      rekomendasiPerbaikan: '',
      status: 'PERLU_PERBAIKAN',
      kategoriAspek: 'SUBSTANSI'
    });
    setIsEditingModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem({ ...item });
    setIsEditingModalOpen(true);
  };

  const handleDeleteItem = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus butir evaluasi ini?')) {
      const updated = matrixList.filter(m => m.id !== id);
      setMatrixList(updated);
      saveMatrixChanges(updated, 'Menghapus butir catatan matriks evaluasi.');
    }
  };

  const handleSaveModalItem = (e) => {
    e.preventDefault();
    let updated;
    const exists = matrixList.find(m => m.id === editingItem.id);
    if (exists) {
      updated = matrixList.map(m => m.id === editingItem.id ? editingItem : m);
    } else {
      updated = [...matrixList, editingItem];
    }
    setMatrixList(updated);
    setIsEditingModalOpen(false);
    saveMatrixChanges(updated, `Memperbarui catatan evaluasi: ${editingItem.bagianPasal}`);
  };

  const saveMatrixChanges = async (newMatrix, logMessage) => {
    const updatedDoc = onUpdateDocument(
      doc.id, 
      { matriksEvaluasi: newMatrix }, 
      logMessage
    );

    // Sync to Google Sheet if webhook active
    setSyncStatus('Menyimpan ke Google Sheet...');
    try {
      await googleSheetService.saveEvaluationMatrixToSheet({
        docId: doc.id,
        desaNama: doc.desaNama,
        matriks: newMatrix
      });
      setSyncStatus('Tersinkronisasi ke Google Sheet waruppusigap@gmail.com');
      setTimeout(() => setSyncStatus(''), 4000);
    } catch (e) {
      setSyncStatus('');
    }
  };

  const handleReturnToDesaForRevision = () => {
    if (confirm('Kirimkan matriks evaluasi ini ke Pemerintah Desa untuk dilakukan perbaikan (status akan berubah menjadi REVISI DESA)?')) {
      onUpdateDocument(
        doc.id,
        { 
          status: 'REVISI_DESA',
          matriksEvaluasi: matrixList 
        },
        'Kecamatan Waru mengembalikan draf ke Pemdes dengan Matriks Evaluasi yang wajib diperbaiki.'
      );
      alert('Draf berhasil dikembalikan ke Pemerintah Desa untuk perbaikan.');
    }
  };

  const getStatusItemBadge = (status) => {
    switch (status) {
      case 'SESUAI':
        return { label: 'Sesuai', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'PERLU_PERBAIKAN':
        return { label: 'Perlu Perbaikan', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'PERHATIAN_KHUSUS':
        return { label: 'Perhatian Khusus', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Matriks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Tabel Matriks Hasil Harmonisasi & Evaluasi</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {matrixList.length} Butir Analisis
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Matriks telaah hukum formal dan materiil yang disahkan oleh Tim Evaluasi Produk Hukum Kecamatan Waru.
          </p>
        </div>

        {/* Toolbar Tombol */}
        <div className="flex flex-wrap items-center gap-2">
          {isKecamatan && (
            <>
              <button
                onClick={onOpenAiGenerator}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>AI Generator Harmonisasi</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Butir</span>
              </button>

              {matrixList.some(m => m.status === 'PERLU_PERBAIKAN') && doc.status !== 'REVISI_DESA' && (
                <button
                  onClick={handleReturnToDesaForRevision}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke Desa untuk Revisi</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={onOpenPrint}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Matriks Resmi</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1.5">
          <FolderSync className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Tabel Matriks */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="p-3 w-12 text-center">No</th>
              <th className="p-3 w-48">Bagian / Pasal</th>
              <th className="p-3 min-w-[200px]">Bunyi Draf Awal</th>
              <th className="p-3 min-w-[240px]">Catatan Harmonisasi / Koreksi Kecamatan</th>
              <th className="p-3 min-w-[240px]">Rekomendasi Perbaikan</th>
              <th className="p-3 w-28 text-center">Status</th>
              {isKecamatan && <th className="p-3 w-20 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {matrixList.length === 0 ? (
              <tr>
                <td colSpan={isKecamatan ? 7 : 6} className="text-center py-12 text-slate-400">
                  <p className="text-sm font-semibold mb-1">Matriks Evaluasi Masih Kosong</p>
                  <p className="text-xs mb-3">Klik tombol "AI Generator Harmonisasi" di atas untuk menganalisis draf secara otomatis.</p>
                  {isKecamatan && (
                    <button
                      onClick={onOpenAiGenerator}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs inline-flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Jalankan AI Harmonisasi Sekarang</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              matrixList.map((item, idx) => {
                const badge = getStatusItemBadge(item.status);
                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors align-top">
                    <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{item.bagianPasal}</div>
                      {item.kategoriAspek && (
                        <span className="text-[10px] uppercase font-semibold text-slate-400 mt-1 inline-block">
                          Aspek: {item.kategoriAspek}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-700 bg-slate-50/60 rounded">
                      <div className="whitespace-pre-wrap line-clamp-6">{item.drafAwal || '-'}</div>
                    </td>
                    <td className="p-3 text-slate-800">
                      <div className="whitespace-pre-wrap leading-relaxed">{item.catatanHarmonisasi}</div>
                    </td>
                    <td className="p-3 text-slate-900 bg-blue-50/30 font-medium">
                      <div className="whitespace-pre-wrap leading-relaxed">{item.rekomendasiPerbaikan}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>
                    {isKecamatan && (
                      <td className="p-3 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Catatan"
                          className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Hapus"
                          className="p-1 rounded-md text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah / Edit Butir Matriks */}
      {isEditingModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingItem.bagianPasal ? `Edit: ${editingItem.bagianPasal}` : 'Tambah Butir Matriks Evaluasi'}
            </h3>

            <form onSubmit={handleSaveModalItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bagian / Pasal Peraturan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pasal 2 Ayat (1) atau Dasar Hukum Mengingat Angka 3"
                  value={editingItem.bagianPasal}
                  onChange={(e) => setEditingItem({ ...editingItem, bagianPasal: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bunyi Draf Awal</label>
                <textarea
                  rows={3}
                  placeholder="Kutipan teks asli dari draf..."
                  value={editingItem.drafAwal}
                  onChange={(e) => setEditingItem({ ...editingItem, drafAwal: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Harmonisasi / Koreksi Kecamatan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Analisis kelemahan yuridis, pertentangan aturan, atau kekeliruan naskah..."
                  value={editingItem.catatanHarmonisasi}
                  onChange={(e) => setEditingItem({ ...editingItem, catatanHarmonisasi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rekomendasi Rumusan Perbaikan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Rumusan kalimat perbaikan baku yang disarankan untuk diadopsi desa..."
                  value={editingItem.rekomendasiPerbaikan}
                  onChange={(e) => setEditingItem({ ...editingItem, rekomendasiPerbaikan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Penilaian</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                  >
                    <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
                    <option value="SESUAI">Sesuai / Disetujui</option>
                    <option value="PERHATIAN_KHUSUS">Perhatian Khusus</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aspek Yuridis</label>
                  <select
                    value={editingItem.kategoriAspek || 'SUBSTANSI'}
                    onChange={(e) => setEditingItem({ ...editingItem, kategoriAspek: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                  >
                    <option value="FORMAL">Formal / Tata Naskah</option>
                    <option value="YURIDIS">Yuridis / Dasar Hukum</option>
                    <option value="SUBSTANSI">Materi Muatan / Substansi</option>
                    <option value="TEKNIK_PENYUSUNAN">Teknik Legal Drafting</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Catatan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
