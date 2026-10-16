import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ChevronRight,
  PlusCircle,
  X
} from 'lucide-react';
import { DESA_LIST, JENIS_PRODUK_HUKUM } from '../data/legalReferences';
import { getStatusBadge, getJalurBadge, formatDateIndo } from '../utils/helpers';

export default function DocumentList({ 
  documents, 
  currentRole, 
  onSelectDocument, 
  onOpenNewDraft, 
  onOpenAiForDoc,
  onOpenPrintForDoc,
  initialFilters = {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesa, setSelectedDesa] = useState(initialFilters.desaId || 'ALL');
  const [selectedJenis, setSelectedJenis] = useState('ALL');
  const [selectedJalur, setSelectedJalur] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Filter Dokumen
  const filteredDocs = documents.filter(doc => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.judul?.toLowerCase().includes(q);
      const matchId = doc.id?.toLowerCase().includes(q);
      const matchDesa = doc.desaNama?.toLowerCase().includes(q);
      const matchReg = doc.nomorRegistrasi?.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchDesa && !matchReg) return false;
    }

    // Desa Filter
    if (selectedDesa !== 'ALL' && doc.desaId !== selectedDesa) return false;

    // Jenis Filter
    if (selectedJenis !== 'ALL' && doc.jenis !== selectedJenis) return false;

    // Jalur Filter
    if (selectedJalur !== 'ALL' && doc.jalur !== selectedJalur) return false;

    // Status Filter
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'BPD' && !(doc.status === 'PEMBAHASAN_BPD' || doc.status === 'REVISI_BPD')) return false;
      if (selectedStatus === 'KECAMATAN' && !(doc.status === 'VERIFIKASI_KECAMATAN' || doc.status === 'EVALUASI_KECAMATAN')) return false;
      if (selectedStatus === 'REVISI' && doc.status !== 'REVISI_DESA') return false;
      if (selectedStatus === 'SELESAI' && doc.status !== 'SELESAI_TEREGISTRASI') return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDesa('ALL');
    setSelectedJenis('ALL');
    setSelectedJalur('ALL');
    setSelectedStatus('ALL');
  };

  const hasActiveFilters = searchQuery !== '' || selectedDesa !== 'ALL' || selectedJenis !== 'ALL' || selectedJalur !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Daftar Produk Hukum Desa
          </h1>
          <p className="text-sm text-slate-500">
            Perdes, Permakades, Perkades, dan SK Kades se-Kecamatan Waru
          </p>
        </div>

        {currentRole.role === 'PEMDES' && (
          <button
            onClick={onOpenNewDraft}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-950/20 flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ajukan Draf Baru</span>
          </button>
        )}

        {currentRole.role === 'BPD' && (
          <button
            onClick={onOpenNewDraft}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-md shadow-amber-950/20 flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Usulkan Inisiatif BPD</span>
          </button>
        )}
      </div>

      {/* Filter & Pencarian Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul, nomor registrasi, atau nama desa..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Filter Desa */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Desa</label>
            <select
              value={selectedDesa}
              onChange={(e) => setSelectedDesa(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">Semua Desa (4 Desa)</option>
              {DESA_LIST.map(d => (
                <option key={d.id} value={d.id}>{d.nama}</option>
              ))}
            </select>
          </div>

          {/* Filter Jenis */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Jenis Produk</label>
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="PERDES">Peraturan Desa (Perdes)</option>
              <option value="PERMAKADES">Peraturan Bersama Kades</option>
              <option value="PERKADES">Peraturan Kades (Perkades)</option>
              <option value="SK_KADES">Keputusan Kades (SK)</option>
            </select>
          </div>

          {/* Filter Jalur */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Jalur Permendagri 111</label>
            <select
              value={selectedJalur}
              onChange={(e) => setSelectedJalur(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">Semua Jalur</option>
              <option value="EVALUASI">Jalur Evaluasi (Sebelum Penetapan)</option>
              <option value="KLARIFIKASI">Jalur Klarifikasi (Setelah Penetapan)</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Tahap Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">Semua Tahap</option>
              <option value="BPD">Tahap Pembahasan BPD</option>
              <option value="KECAMATAN">Tahap Evaluasi Kecamatan</option>
              <option value="REVISI">Tahap Revisi Pemdes</option>
              <option value="SELESAI">Selesai & Teregistrasi</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
            <span>Menampilkan <strong>{filteredDocs.length}</strong> dari {documents.length} dokumen</span>
            <button
              onClick={clearFilters}
              className="text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bersihkan Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* Dokumen Cards List */}
      <div className="space-y-3.5">
        {documents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Database Produk Hukum Bersih & Siap Digunakan</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Seluruh data bawaan telah dikosongkan. Sistem siap menerima pengajuan dokumen asli dari Pemerintah Desa di Kecamatan Waru (Bangun Mulya, Sesulu, Api-Api, Waru).
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {currentRole.role === 'PEMDES' && (
                <button
                  onClick={onOpenNewDraft}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md inline-flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Ajukan Draf Produk Hukum Baru</span>
                </button>
              )}
              {currentRole.role === 'BPD' && (
                <button
                  onClick={onOpenNewDraft}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md inline-flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Usulkan Raperdes Inisiatif BPD</span>
                </button>
              )}
            </div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Tidak ada produk hukum yang cocok</h3>
            <p className="text-sm text-slate-500 mb-4">
              Coba sesuaikan kata kunci pencarian atau ubah kriteria filter di atas.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          filteredDocs.map(doc => {
            const statusBadge = getStatusBadge(doc.status);
            const jalurBadge = getJalurBadge(doc.jalur);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Kolom Informasi Utama */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                      {doc.desaNama}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                      {doc.id}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${jalurBadge.badge}`}>
                      {doc.jalur === 'EVALUASI' ? 'Jalur Evaluasi Mandatori' : 'Jalur Klarifikasi'}
                    </span>
                    {doc.nomorRegistrasi && (
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {doc.nomorRegistrasi}
                      </span>
                    )}
                  </div>

                  <h3 
                    onClick={() => onSelectDocument(doc)}
                    className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer leading-snug mb-2"
                  >
                    {doc.judul}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Jenis: <strong>{doc.jenis}</strong> ({doc.kategori})</span>
                    <span>&bull;</span>
                    <span>Pengaju: <strong>{doc.pengaju?.nama}</strong></span>
                    <span>&bull;</span>
                    <span>Diajukan: {formatDateIndo(doc.tanggalPengajuan)}</span>
                    {doc.jalur === 'EVALUASI' && doc.status !== 'SELESAI_TEREGISTRASI' && (
                      <>
                        <span>&bull;</span>
                        <span className="text-purple-700 font-semibold flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>SLA Sisa {doc.slaDaysRemaining} Hari</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Kolom Status & Aksi Cepat */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  {/* Status Badge */}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.bg}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${statusBadge.dot}`}></span>
                    {statusBadge.label}
                  </span>

                  {/* Tombol Aksi */}
                  <div className="flex items-center space-x-2">
                    {/* Shortcut AI Generator khusus Kecamatan */}
                    {currentRole.role === 'KECAMATAN' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAiForDoc(doc);
                        }}
                        title="Jalankan AI Harmonisasi"
                        className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}

                    {/* Tombol Cetak Dokumen Resmi */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPrintForDoc(doc);
                      }}
                      title="Cetak Matriks / BA / SK Camat"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Tombol Detail */}
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <span>Detail & Lacak</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
