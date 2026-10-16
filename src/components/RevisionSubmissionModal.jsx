import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Upload, 
  Send, 
  AlertCircle, 
  FolderSync, 
  CheckCircle2 
} from 'lucide-react';
import { googleSheetService } from '../services/googleSheetService';

export default function RevisionSubmissionModal({ 
  document: doc, 
  onClose, 
  onUpdateDocument 
}) {
  const [teksDraf, setTeksDraf] = useState(doc.teksDraf || '');
  const [fileRevisi, setFileRevisi] = useState(null);
  const [catatanRevisiDesa, setCatatanRevisiDesa] = useState(
    'Pemerintah Desa telah menyempurnakan pasal-pasal dan dasar hukum sesuai dengan Rekomendasi Matriks Harmonisasi Kecamatan Waru.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRevision = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let fileLink = doc.berkas?.drafUtama?.driveLink;
      let fileName = doc.berkas?.drafUtama?.nama;

      if (fileRevisi) {
        const uploadRes = await googleSheetService.uploadFileToDrive({
          file: fileRevisi,
          desaNama: doc.desaNama,
          documentId: doc.id
        });
        fileLink = uploadRes.driveLink;
        fileName = uploadRes.fileName;
      }

      const updated = {
        teksDraf,
        status: doc.jalur === 'EVALUASI' ? 'EVALUASI_KECAMATAN' : 'VERIFIKASI_KECAMATAN',
        berkas: {
          ...doc.berkas,
          drafUtama: {
            nama: fileName || `Draf_Revisi_${doc.desaNama}.pdf`,
            ukuran: '1.3 MB',
            driveLink: fileLink,
            uploadTime: new Date().toLocaleString('id-ID')
          }
        }
      };

      onUpdateDocument(
        doc.id,
        updated,
        `Pemdes mengunggah draf perbaikan/revisi: "${catatanRevisiDesa}"`
      );

      onClose();

    } catch (err) {
      alert(`Terjadi kesalahan: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-orange-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-800 flex items-center justify-center text-white">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Unggah Draf Perbaikan / Revisi Desa
              </h2>
              <p className="text-xs text-orange-200">
                Pemerintah {doc.desaNama} &bull; Tindak Lanjut Matriks Evaluasi
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-orange-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmitRevision} className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
            <span className="font-bold text-orange-950 block mb-0.5">Dokumen yang Diperbaiki:</span>
            <div className="font-bold text-slate-900 text-sm">{doc.judul}</div>
            <div className="text-[11px] text-orange-800 mt-1">
              Status sebelumnya: Perlu Revisi Pemdes &bull; Harap periksa butir-butir bertanda merah di Matriks Evaluasi.
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Catatan Penjelasan Perbaikan dari Pemerintah Desa:
            </label>
            <textarea
              rows={2}
              required
              value={catatanRevisiDesa}
              onChange={(e) => setCatatanRevisiDesa(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
              <Upload className="w-4 h-4 text-orange-600" />
              <span>Unggah Berkas Draf Revisi Terbaru (.pdf / .docx) ke Google Drive:</span>
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFileRevisi(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-orange-100 file:text-orange-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Naskah Teks Draf Setelah Perbaikan:
            </label>
            <textarea
              rows={6}
              required
              value={teksDraf}
              onChange={(e) => setTeksDraf(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Kirimkan Draf Revisi ke Kecamatan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
