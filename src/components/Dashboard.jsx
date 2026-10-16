import React from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Scale, 
  FileCode, 
  Bookmark, 
  PlusCircle,
  HelpCircle,
  ChevronRight,
  Send
} from 'lucide-react';
import { DESA_LIST, JENIS_PRODUK_HUKUM, KATEGORI_EVALUASI_MANDATORI } from '../data/legalReferences';
import { getStatusBadge, getJalurBadge, formatDateIndo } from '../utils/helpers';

export default function Dashboard({ 
  documents, 
  currentRole, 
  onSelectDocument, 
  onOpenNewDraft, 
  onOpenAiGenerator,
  onNavigateToDocuments
}) {
  // Hitung metrik
  const totalDocs = documents.length;
  const bpdCount = documents.filter(d => d.status === 'PEMBAHASAN_BPD' || d.status === 'REVISI_BPD').length;
  const kecamatanCount = documents.filter(d => d.status === 'VERIFIKASI_KECAMATAN' || d.status === 'EVALUASI_KECAMATAN').length;
  const revisiDesaCount = documents.filter(d => d.status === 'REVISI_DESA').length;
  const selesaiCount = documents.filter(d => d.status === 'SELESAI_TEREGISTRASI').length;

  // Dokumen dengan SLA aktif
  const urgentDocs = documents
    .filter(d => d.jalur === 'EVALUASI' && d.status !== 'SELESAI_TEREGISTRASI')
    .sort((a, b) => a.slaDaysRemaining - b.slaDaysRemaining);

  // Statistik per Desa
  const statsPerDesa = DESA_LIST.map(desa => {
    const desaDocs = documents.filter(d => d.desaId === desa.id);
    return {
      ...desa,
      total: desaDocs.length,
      selesai: desaDocs.filter(d => d.status === 'SELESAI_TEREGISTRASI').length,
      proses: desaDocs.filter(d => d.status !== 'SELESAI_TEREGISTRASI').length,
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-govnavy-900 via-slate-900 to-govnavy-800 text-white p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Kecamatan Waru &bull; Kabupaten Penajam Paser Utara</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Selamat Datang di SI Harmonisasi Produk Hukum Desa
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Platform kolaboratif antara <strong>Pemerintah Desa</strong>, <strong>BPD</strong>, dan <strong>Pemerintah Kecamatan Waru</strong> untuk percepatan pembentukan, penelaahan yuridis, evaluasi mandatori, dan penerbitan nomor registrasi peraturan desa berbasis <em>Permendagri No. 111 Tahun 2014</em>.
          </p>

          {/* Action Button Banner Sesuai Role */}
          <div className="flex flex-wrap items-center gap-3">
            {currentRole.role === 'PEMDES' && (
              <button
                onClick={onOpenNewDraft}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950/40 flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Ajukan Draf Produk Hukum ({currentRole.desaNama})</span>
              </button>
            )}

            {currentRole.role === 'BPD' && (
              <button
                onClick={onOpenNewDraft}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-950/40 flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Usulkan Raperdes Inisiatif BPD ({currentRole.desaNama})</span>
              </button>
            )}

            {currentRole.role === 'KECAMATAN' && (
              <button
                onClick={onOpenAiGenerator}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-950/40 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Buka AI Generator Harmonisasi Kecamatan</span>
              </button>
            )}

            <button
              onClick={() => onNavigateToDocuments()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-sm transition-colors border border-slate-700 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat Semua Dokumen ({totalDocs})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Statistik Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Total Dokumen</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{totalDocs}</div>
            <div className="text-xs text-slate-500 mt-1">4 Desa di Kec. Waru</div>
          </div>
        </div>

        {/* Pembahasan BPD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Meja BPD</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-600">{bpdCount}</div>
            <div className="text-xs text-slate-500 mt-1">Musyawarah & BA Kesepakatan</div>
          </div>
        </div>

        {/* Evaluasi Kecamatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Evaluasi Camat</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-indigo-600">{kecamatanCount}</div>
            <div className="text-xs text-slate-500 mt-1">Uji Yuridis & Matriks</div>
          </div>
        </div>

        {/* Revisi Desa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-orange-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Perbaikan Desa</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-orange-600">{revisiDesaCount}</div>
            <div className="text-xs text-slate-500 mt-1">Menunggu Draf Revisi</div>
          </div>
        </div>

        {/* Selesai / Teregistrasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-colors col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Teregistrasi</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-600">{selesaiCount}</div>
            <div className="text-xs text-slate-500 mt-1">Nomor Registrasi Terbit</div>
          </div>
        </div>
      </div>

      {/* Grid: SLA Monitor & Kategorisasi Permendagri 111/2014 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SLA Countdown Monitor Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Monitor Batas Waktu SLA Evaluasi Kecamatan</h2>
                <p className="text-xs text-slate-500">Maksimal 20 Hari Kerja sesuai Pasal 10 Permendagri No. 111/2014</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
              Jalur Evaluasi
            </span>
          </div>

          <div className="space-y-3.5">
            {urgentDocs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Tidak ada dokumen jalur evaluasi yang sedang berjalan saat ini.
              </div>
            ) : (
              urgentDocs.map(doc => {
                const percentLeft = Math.max(0, Math.min(100, (doc.slaDaysRemaining / 20) * 100));
                return (
                  <div 
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-purple-700 px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                            {doc.desaNama}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {doc.id}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 mt-1 line-clamp-1 group-hover:text-purple-700 transition-colors">
                          {doc.judul}
                        </h4>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Sisa {doc.slaDaysRemaining} Hari Kerja
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar SLA */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Batas Waktu: <strong>{formatDateIndo(doc.slaDeadline)}</strong></span>
                        <span>{Math.round(percentLeft)}% Waktu Tersisa</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-purple-600 rounded-full transition-all"
                          style={{ width: `${percentLeft}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Info Box: Kategorisasi Permendagri 111/2014 */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-3">
              <Scale className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Dasar Hukum & Prosedur</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Kategorisasi Permendagri No. 111/2014
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Pemisahan ketat dua alur mekanisme penelaahan peraturan desa di tingkat Kecamatan:
            </p>

            <div className="space-y-3">
              {/* Jalur Evaluasi */}
              <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/60">
                <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold mb-1">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>1. JALUR EVALUASI (Sebelum Penetapan)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Khusus <strong>4 Raperdes</strong>: APBDes, Pungutan Desa, Tata Ruang, dan SOTK. Wajib dievaluasi Camat paling lambat 20 hari kerja sebelum disahkan Kepala Desa.
                </p>
              </div>

              {/* Jalur Klarifikasi */}
              <div className="p-3.5 rounded-xl bg-sky-950/60 border border-sky-800/60">
                <div className="flex items-center space-x-2 text-sky-300 text-xs font-bold mb-1">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>2. JALUR KLARIFIKASI (Setelah Penetapan)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Untuk Perdes di luar 4 hal di atas, <strong>Perkades</strong>, dan <strong>SK Kades</strong>. Disampaikan ke Camat paling lambat 7 hari setelah ditetapkan untuk dicek kesesuaiannya.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Wilayah: Kec. Waru (PPU)</span>
            <span className="text-emerald-400 font-semibold">Tersinkronisasi</span>
          </div>
        </div>

      </div>

      {/* Grid: Statistik Per Desa & Pengajuan Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Statistik Tiap Desa di Kecamatan Waru */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Statistik Desa di Kec. Waru</h3>
            <span className="text-xs text-slate-500">4 Desa</span>
          </div>

          <div className="space-y-3">
            {statsPerDesa.map(desa => (
              <div 
                key={desa.id}
                onClick={() => onNavigateToDocuments({ desaId: desa.id })}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{desa.nama}</h4>
                  <p className="text-xs text-slate-500">Kades: {desa.kades}</p>
                </div>
                <div className="flex items-center space-x-3 text-right">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{desa.total} Draf</div>
                    <div className="text-[10px] text-emerald-600 font-medium">{desa.selesai} Selesai</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pengajuan Dokumen Terkini */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Draf Produk Hukum Terkini</h3>
              <p className="text-xs text-slate-500">Daftar pengajuan terbaru yang sedang aktif</p>
            </div>
            <button
              onClick={() => onNavigateToDocuments()}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {documents.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Database Bersih & Siap Menerima Pengajuan Asli</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Belum ada draf peraturan desa yang diajukan. Pemerintah Desa atau BPD dapat mengklik tombol di bawah untuk membuat draf peraturan desa yang sebenarnya.
                </p>
                {currentRole.role === 'PEMDES' && (
                  <button
                    onClick={onOpenNewDraft}
                    className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md inline-flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Ajukan Draf Sekarang</span>
                  </button>
                )}
                {currentRole.role === 'BPD' && (
                  <button
                    onClick={onOpenNewDraft}
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md inline-flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Usulkan Raperdes Inisiatif BPD</span>
                  </button>
                )}
              </div>
            ) : (
              documents.slice(0, 4).map(doc => {
                const statusBadge = getStatusBadge(doc.status);
                const jalurBadge = getJalurBadge(doc.jalur);

                return (
                  <div 
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{doc.desaNama}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-xs text-slate-500 font-mono">{doc.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${jalurBadge.badge}`}>
                          {doc.jalur === 'EVALUASI' ? 'Jalur Evaluasi' : 'Jalur Klarifikasi'}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {doc.judul}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Pengaju: {doc.pengaju?.nama} &bull; Tgl: {formatDateIndo(doc.tanggalPengajuan)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusBadge.dot}`}></span>
                        {statusBadge.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
