import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Printer, 
  ExternalLink, 
  FolderSync, 
  Download, 
  Edit3, 
  Send, 
  CheckSquare, 
  History,
  FileCheck,
  Scale,
  Plus
} from 'lucide-react';
import { getStatusBadge, getJalurBadge, formatDateIndo } from '../utils/helpers';
import EvaluationMatrixEditor from './EvaluationMatrixEditor';

export default function DocumentDetail({ 
  document: doc, 
  currentRole, 
  onBack, 
  onOpenAiGenerator, 
  onOpenPrint, 
  onOpenBpdReview,
  onOpenRegistration,
  onOpenRevisionModal,
  onUpdateDocument
}) {
  const [activeTab, setActiveTab] = useState('matriks'); // 'ringkasan' | 'teks' | 'bpd' | 'matriks' | 'log'
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationChecklist, setVerificationChecklist] = useState(
    doc.verifikasiKecamatan?.checklist || {
      suratPengantarKades: true,
      drafRaperdes: true,
      baMusdes: true,
      daftarHadirMusdes: true,
      baKesepakatanKadesBpd: Boolean(doc.catatanBpd),
      skPersetujuanBpd: Boolean(doc.catatanBpd),
      rkaDanRkpdes: true
    }
  );

  const statusBadge = getStatusBadge(doc.status);
  const jalurBadge = getJalurBadge(doc.jalur);

  // Alur tahapan stepper
  const getTimelineSteps = () => {
    return [
      {
        id: 'STEP_1',
        title: 'Penyusunan Desa',
        desc: 'Musdes & Draf',
        done: true,
        current: doc.status === 'DRAFT'
      },
      {
        id: 'STEP_2',
        title: 'Pembahasan BPD',
        desc: 'Kesepakatan Kades & BPD',
        done: doc.status !== 'DRAFT' && doc.status !== 'PEMBAHASAN_BPD' && doc.status !== 'REVISI_BPD',
        current: doc.status === 'PEMBAHASAN_BPD' || doc.status === 'REVISI_BPD'
      },
      {
        id: 'STEP_3',
        title: 'Verifikasi Administrasi',
        desc: 'Pemeriksaan Berkas',
        done: doc.status === 'EVALUASI_KECAMATAN' || doc.status === 'REVISI_DESA' || doc.status === 'SELESAI_TEREGISTRASI',
        current: doc.status === 'VERIFIKASI_KECAMATAN'
      },
      {
        id: 'STEP_4',
        title: 'Harmonisasi & Evaluasi',
        desc: 'AI & Tim Seksi Pemdes',
        done: doc.status === 'SELESAI_TEREGISTRASI',
        current: doc.status === 'EVALUASI_KECAMATAN' || doc.status === 'REVISI_DESA'
      },
      {
        id: 'STEP_5',
        title: 'Nomor Registrasi',
        desc: 'Penetapan & Pengundangan',
        done: doc.status === 'SELESAI_TEREGISTRASI',
        current: doc.status === 'SELESAI_TEREGISTRASI'
      }
    ];
  };

  const steps = getTimelineSteps();

  const handleSaveVerification = () => {
    const isAllChecked = Object.values(verificationChecklist).every(Boolean);
    const updated = {
      status: isAllChecked ? 'EVALUASI_KECAMATAN' : 'VERIFIKASI_KECAMATAN',
      verifikasiKecamatan: {
        statusAdministrasi: isAllChecked ? 'LENGKAP' : 'BELUM_LENGKAP',
        petugasVerifikator: 'Tim Evaluasi Seksi Pemerintahan Kec. Waru',
        tanggalVerifikasi: new Date().toISOString().split('T')[0],
        checklist: verificationChecklist,
        catatanVerifikasi: isAllChecked 
          ? 'Berkas administrasi dinyatakan LENGKAP dan memenuhi syarat formal Permendagri 111/2014. Dilanjutkan ke Harmonisasi & Evaluasi Substansi.'
          : 'Beberapa kelengkapan berkas fisik/lampiran belum terpenuhi.'
      }
    };

    onUpdateDocument(doc.id, updated, 'Verifikasi kelengkapan berkas oleh Tim Kecamatan Waru.');
    setIsVerifying(false);
  };

  const handleToggleJalur = () => {
    const nextJalur = doc.jalur === 'EVALUASI' ? 'KLARIFIKASI' : 'EVALUASI';
    const confirmMsg = nextJalur === 'EVALUASI'
      ? `Ubah jalur produk hukum ini ke JALUR EVALUASI (Permendagri 111/2014 Pasal 9-11)?\n\nJalur Evaluasi diperuntukkan bagi Raperdes sebelum ditetapkan dengan batas penelaahan 20 hari kerja.`
      : `Ubah jalur produk hukum ini ke JALUR KLARIFIKASI (Permendagri 111/2014 Pasal 18-20)?\n\nJalur Klarifikasi diperuntukkan bagi produk hukum setelah penetapan paling lama 7 hari untuk penelaahan dan nomor registrasi.`;

    if (window.confirm(confirmMsg)) {
      onUpdateDocument(
        doc.id, 
        { jalur: nextJalur }, 
        `Mengubah jalur penelaahan menjadi ${nextJalur === 'EVALUASI' ? 'Jalur Evaluasi (Pra-Penetapan)' : 'Jalur Klarifikasi (Pasca-Penetapan)'} sesuai Permendagri No. 111/2014.`
      );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Tombol Kembali & Bar Tindakan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Dokumen</span>
        </button>

        {/* Action Buttons Sesuai Peran Pengguna */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Aksi Khusus Kecamatan */}
          {currentRole.role === 'KECAMATAN' && (
            <>
              {doc.status === 'VERIFIKASI_KECAMATAN' && (
                <button
                  onClick={() => setIsVerifying(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Verifikasi Berkas</span>
                </button>
              )}

              <button
                onClick={() => onOpenAiGenerator(doc)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-950/20"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>AI Harmonisasi</span>
              </button>

              {doc.status !== 'SELESAI_TEREGISTRASI' && (
                <button
                  onClick={() => onOpenRegistration(doc)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Terbitkan No. Registrasi</span>
                </button>
              )}
            </>
          )}

          {/* Aksi Khusus BPD */}
          {currentRole.role === 'BPD' && (doc.status === 'PEMBAHASAN_BPD' || doc.status === 'REVISI_BPD') && (
            <button
              onClick={() => onOpenBpdReview(doc)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Beri Catatan & Persetujuan BPD</span>
            </button>
          )}

          {/* Aksi Khusus Pemdes */}
          {currentRole.role === 'PEMDES' && doc.status === 'REVISI_DESA' && (
            <button
              onClick={() => onOpenRevisionModal(doc)}
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>Unggah Draf Revisi</span>
            </button>
          )}

          {/* Tombol Cetak Dokumen Resmi Kop Surat Waru */}
          <button
            onClick={() => onOpenPrint(doc)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* Header Dokumen Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-md bg-slate-900 text-white">
              {doc.desaNama}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-500 px-2.5 py-1 rounded bg-slate-100">
              {doc.id}
            </span>
            <div className="inline-flex items-center space-x-1.5">
              <span className={`text-xs px-3 py-1 rounded-full border ${jalurBadge.badge}`}>
                {jalurBadge.label}
              </span>
              {(currentRole === 'KECAMATAN' || currentRole === 'ADMIN' || currentRole === 'PEMDES') && (
                <button
                  type="button"
                  onClick={handleToggleJalur}
                  className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 underline cursor-pointer px-1 py-0.5 rounded hover:bg-slate-100 transition-colors"
                  title="Klik untuk mengubah Jalur Evaluasi atau Klarifikasi"
                >
                  (Ubah Jalur)
                </button>
              )}
            </div>
            {doc.inisiatif === 'BPD' ? (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Inisiatif BPD (Permendagri 111/2014)
              </span>
            ) : (
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Prakarsa Pemdes
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {doc.nomorRegistrasi ? (
              <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                REGISTRASI: {doc.nomorRegistrasi}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Nomor Registrasi Belum Terbit
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {doc.judul}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
            <span>Jenis: <strong>{doc.jenis}</strong></span>
            <span>&bull;</span>
            <span>Kategori: <strong>{doc.kategori}</strong></span>
            <span>&bull;</span>
            <span>Pengusul: <strong>{doc.pengaju?.nama}</strong> ({doc.pengaju?.jabatan})</span>
            <span>&bull;</span>
            <span>Tanggal Pengajuan: {formatDateIndo(doc.tanggalPengajuan)}</span>
            {doc.jalur === 'EVALUASI' && (
              <>
                <span>&bull;</span>
                <span className="text-purple-700 font-bold">
                  SLA: Sisa {doc.slaDaysRemaining} Hari Kerja (Batas: {formatDateIndo(doc.slaDeadline)})
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stepper / Timeline Tracking Alur */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Lacak Posisi Dokumen (Tracking Workflow)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {steps.map((step, idx) => (
              <div 
                key={step.id}
                className={`p-3 rounded-xl border transition-all ${
                  step.current
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                    : step.done
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  {step.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : step.current ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex-shrink-0"></div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0"></div>
                  )}
                  <span className="text-[11px] font-bold truncate">
                    {idx + 1}. {step.title}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('matriks')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'matriks'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Matriks Harmonisasi & Evaluasi</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px]">
            {doc.matriksEvaluasi?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('teks')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'teks'
              ? 'border-blue-600 text-blue-700 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Teks Draf Peraturan</span>
        </button>

        <button
          onClick={() => setActiveTab('ringkasan')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'ringkasan'
              ? 'border-blue-600 text-blue-700 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderSync className="w-4 h-4" />
          <span>Berkas Google Drive & Berita Acara</span>
        </button>

        <button
          onClick={() => setActiveTab('bpd')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'bpd'
              ? 'border-amber-600 text-amber-700 bg-amber-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pembahasan & Catatan BPD</span>
        </button>

        <button
          onClick={() => setActiveTab('log')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'log'
              ? 'border-slate-800 text-slate-900 bg-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Aktivitas ({doc.riwayatAktivitas?.length || 0})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-6 shadow-sm">
        
        {/* TAB 1: MATRIKS HARMONISASI & EVALUASI */}
        {activeTab === 'matriks' && (
          <EvaluationMatrixEditor
            document={doc}
            currentRole={currentRole}
            onUpdateDocument={onUpdateDocument}
            onOpenAiGenerator={() => onOpenAiGenerator(doc)}
            onOpenPrint={() => onOpenPrint(doc)}
          />
        )}

        {/* TAB 2: TEKS DRAF PERATURAN */}
        {activeTab === 'teks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Naskah Teks Draf Peraturan Desa</h3>
                <p className="text-xs text-slate-500">Teks ini menjadi objek analisis pada modul AI Generator Harmonisasi Kecamatan.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(doc.teksDraf || '');
                    alert('Teks draf berhasil disalin ke clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Salin Teks
                </button>
                {currentRole.role === 'KECAMATAN' && (
                  <button
                    onClick={() => onOpenAiGenerator(doc)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analisis dengan AI</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto border border-slate-800">
              {doc.teksDraf || 'Teks draf belum dimasukkan.'}
            </div>
          </div>
        )}

        {/* TAB 3: BERKAS GOOGLE DRIVE & METADATA */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">Penyimpanan Berkas Google Drive (waruppusigap@gmail.com)</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  Folder: SI_HARMONISASI_KECAMATAN_WARU_UPLOADS
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Seluruh dokumen lampiran otomatis diunggah dan ditautkan ke Google Drive Kecamatan Waru.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Draf Utama */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-slate-500">1. Draf Produk Hukum Utama</span>
                    <h4 className="text-xs font-bold text-slate-800">{doc.berkas?.drafUtama?.nama || 'Draf_Perdes.pdf'}</h4>
                    <p className="text-[11px] text-slate-500">{doc.berkas?.drafUtama?.ukuran || '1.2 MB'} &bull; Diunggah: {doc.berkas?.drafUtama?.uploadTime || doc.tanggalPengajuan}</p>
                  </div>
                  <a
                    href={doc.berkas?.drafUtama?.driveLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    title="Buka di Google Drive"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* 2. Berita Acara Musdes */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-slate-500">2. Berita Acara Musdes Pembahasan</span>
                    <h4 className="text-xs font-bold text-slate-800">{doc.berkas?.lampiranMusdes?.nama || 'BA_Musdes_Pembahasan.pdf'}</h4>
                    <p className="text-[11px] text-slate-500">{doc.berkas?.lampiranMusdes?.ukuran || '2.4 MB'}</p>
                  </div>
                  <a
                    href={doc.berkas?.lampiranMusdes?.driveLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* 3. Daftar Hadir Musdes */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-slate-500">3. Daftar Hadir Musyawarah Desa</span>
                    <h4 className="text-xs font-bold text-slate-800">{doc.berkas?.daftarHadir?.nama || 'Daftar_Hadir_Peserta.pdf'}</h4>
                    <p className="text-[11px] text-slate-500">{doc.berkas?.daftarHadir?.ukuran || '900 KB'}</p>
                  </div>
                  <a
                    href={doc.berkas?.daftarHadir?.driveLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* 4. BA Kesepakatan BPD & SK BPD */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-slate-500">4. BA Kesepakatan Bersama Kades & BPD</span>
                    <h4 className="text-xs font-bold text-slate-800">{doc.berkas?.baKesepakatanBpd?.nama || 'Belum Diunggah BPD'}</h4>
                    <p className="text-[11px] text-slate-500">{doc.berkas?.baKesepakatanBpd?.ukuran || '-'}</p>
                  </div>
                  {doc.berkas?.baKesepakatanBpd?.driveLink && (
                    <a
                      href={doc.berkas.baKesepakatanBpd.driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist Verifikasi Kecamatan */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Checklist Kelengkapan Administrasi (Kecamatan Waru)</h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  doc.verifikasiKecamatan?.statusAdministrasi === 'LENGKAP' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Status: {doc.verifikasiKecamatan?.statusAdministrasi || 'MENUNGGU VERIFIKASI'}
                </span>
              </div>

              {isVerifying ? (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <div className="text-xs font-semibold text-blue-900">Periksa dan centang kelengkapan berkas fisik / digital:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.keys(verificationChecklist).map(key => (
                      <label key={key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={verificationChecklist[key]}
                          onChange={(e) => setVerificationChecklist({ ...verificationChecklist, [key]: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setIsVerifying(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveVerification}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
                    >
                      Simpan Status Verifikasi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <p>{doc.verifikasiKecamatan?.catatanVerifikasi || 'Belum ada catatan verifikasi resmi dari Seksi Pemerintahan Kecamatan Waru.'}</p>
                  <p className="text-[11px] text-slate-400">Verifikator: {doc.verifikasiKecamatan?.petugasVerifikator || '-'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PEMBAHASAN BPD */}
        {activeTab === 'bpd' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Catatan Pembahasan & Kesepakatan Badan Permusyawaratan Desa (BPD)</h3>
                <p className="text-xs text-slate-500">Hasil musyawarah BPD bersama Pemerintah Desa sebelum diteruskan ke Camat Waru.</p>
              </div>

              {currentRole.role === 'BPD' && (
                <button
                  onClick={() => onOpenBpdReview(doc)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Catatan BPD</span>
                </button>
              )}
            </div>

            {doc.catatanBpd ? (
              <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>Pengirim: {doc.catatanBpd.pengirim}</span>
                  <span>Tanggal: {formatDateIndo(doc.catatanBpd.tanggal)}</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-4 rounded-lg border border-amber-100">
                  {doc.catatanBpd.isi}
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Status: TELAH DIBAHAS & DISETUJUI BPD</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                Belum ada catatan pembahasan dari BPD untuk draf ini.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: RIWAYAT AKTIVITAS (AUDIT TRAIL) */}
        {activeTab === 'log' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Jejak Rekam Aktivitas & Pembahasan</h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {doc.riwayatAktivitas?.map((log, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-bold text-slate-800">{log.aktor} ({log.role})</span>
                      <span>{log.waktu}</span>
                    </div>
                    <p className="text-xs text-slate-700">{log.aksi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
