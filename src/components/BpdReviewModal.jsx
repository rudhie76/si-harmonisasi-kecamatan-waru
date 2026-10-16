import React, { useState } from 'react';
import { 
  X, 
  Users, 
  CheckCircle2, 
  RotateCcw, 
  Upload, 
  FileText, 
  Send, 
  AlertTriangle 
} from 'lucide-react';
import { googleSheetService } from '../services/googleSheetService';

export default function BpdReviewModal({ 
  document: doc, 
  currentRole, 
  onClose, 
  onUpdateDocument 
}) {
  const [catatanBpd, setCatatanBpd] = useState(
    doc.catatanBpd?.isi || 
    'BPD telah menelaah dan membahas draf peraturan ini bersama Kepala Desa. Seluruh substansi materi telah disepakati dan memenuhi aspirasi warga desa.'
  );
  const [fileBaBpd, setFileBaBpd] = useState(null);
  const [fileSkBpd, setFileSkBpd] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!catatanBpd.trim()) {
      alert('Harap isi catatan musyawarah BPD terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Unggah berkas BA Kesepakatan BPD jika ada
      let baLink = doc.berkas?.baKesepakatanBpd?.driveLink || null;
      let baName = doc.berkas?.baKesepakatanBpd?.nama || null;
      if (fileBaBpd) {
        const uploadRes = await googleSheetService.uploadFileToDrive({
          file: fileBaBpd,
          desaNama: doc.desaNama,
          documentId: doc.id
        });
        baLink = uploadRes.driveLink;
        baName = uploadRes.fileName;
      }

      // Unggah berkas SK Persetujuan BPD jika ada
      let skLink = doc.berkas?.skPersetujuanBpd?.driveLink || null;
      let skName = doc.berkas?.skPersetujuanBpd?.nama || null;
      if (fileSkBpd) {
        const uploadRes = await googleSheetService.uploadFileToDrive({
          file: fileSkBpd,
          desaNama: doc.desaNama,
          documentId: doc.id
        });
        skLink = uploadRes.driveLink;
        skName = uploadRes.fileName;
      }

      const updated = {
        status: 'VERIFIKASI_KECAMATAN',
        catatanBpd: {
          tanggal: new Date().toISOString().split('T')[0],
          pengirim: currentRole.userNama || 'Ketua BPD',
          status: 'DISETUJUI_BPD',
          isi: catatanBpd
        },
        berkas: {
          ...doc.berkas,
          baKesepakatanBpd: baLink ? {
            nama: baName || 'BA_Kesepakatan_Kades_BPD.pdf',
            ukuran: '1.2 MB',
            driveLink: baLink,
            uploadTime: new Date().toLocaleString('id-ID')
          } : doc.berkas?.baKesepakatanBpd,
          skPersetujuanBpd: skLink ? {
            nama: skName || 'SK_Persetujuan_BPD.pdf',
            ukuran: '950 KB',
            driveLink: skLink,
            uploadTime: new Date().toLocaleString('id-ID')
          } : doc.berkas?.skPersetujuanBpd
        }
      };

      onUpdateDocument(
        doc.id, 
        updated, 
        'Disepakati oleh BPD dan diteruskan ke Kecamatan Waru untuk diverifikasi & dievaluasi.'
      );
      onClose();

    } catch (err) {
      alert(`Terjadi kesalahan: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const handleReturnToPemdes = () => {
    if (!catatanBpd.trim()) {
      alert('Harap tuliskan catatan alasan pengembalian draf kepada Pemdes.');
      return;
    }

    onUpdateDocument(
      doc.id,
      {
        status: 'REVISI_BPD',
        catatanBpd: {
          tanggal: new Date().toISOString().split('T')[0],
          pengirim: currentRole.userNama || 'Ketua BPD',
          status: 'DIKEMBALIKAN_REVISI',
          isi: catatanBpd
        }
      },
      'BPD mengembalikan draf peraturan ke Pemerintah Desa untuk perbaikan materi pembahasan.'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-amber-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Musyawarah & Keputusan BPD {doc.desaNama.replace('Desa ', '')}
              </h2>
              <p className="text-xs text-amber-200">
                Pemeriksaan Draf Peraturan Desa & Pembuatan Berita Acara Kesepakatan
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-0.5">Dokumen yang Dibahas:</span>
            <h4 className="font-bold text-slate-900 text-sm">{doc.judul}</h4>
            <div className="text-[11px] text-slate-500 mt-1">
              Desa: {doc.desaNama} &bull; Pengusul: {doc.pengaju?.nama}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Catatan Pembahasan / Masukan BPD:
            </label>
            <textarea
              rows={4}
              required
              value={catatanBpd}
              onChange={(e) => setCatatanBpd(e.target.value)}
              placeholder="Tuliskan poin-poin kesepakatan atau pasal yang perlu disempurnakan..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Upload BA Kesepakatan & SK BPD */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
            <div className="font-bold text-amber-950 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-amber-700" />
              <span>Unggah Dokumen Berita Acara BPD (Google Drive):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="block font-semibold text-slate-700 mb-1">1. BA Kesepakatan Kades & BPD (.pdf)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFileBaBpd(e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-amber-100 file:text-amber-800"
                />
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="block font-semibold text-slate-700 mb-1">2. SK Persetujuan BPD (.pdf)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFileSkBpd(e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-amber-100 file:text-amber-800"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReturnToPemdes}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kembalikan ke Pemdes untuk Revisi</span>
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Disepakati BPD - Teruskan ke Kecamatan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
