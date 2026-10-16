import React, { useState } from 'react';
import { 
  X, 
  FileCheck, 
  CheckCircle2, 
  Building2, 
  Send 
} from 'lucide-react';
import { KECAMATAN_INFO } from '../data/legalReferences';

export default function RegistrationModal({ 
  document: doc, 
  onClose, 
  onUpdateDocument 
}) {
  const currentYear = new Date().getFullYear();
  const defaultNoReg = doc.nomorRegistrasi || `REG.180.12/${String(Math.floor(Math.random() * 80) + 10).padStart(2, '0')}/WARU/${currentYear}`;

  const [nomorRegistrasi, setNomorRegistrasi] = useState(defaultNoReg);
  const [tanggalRegistrasi, setTanggalRegistrasi] = useState(new Date().toISOString().split('T')[0]);
  const [kesimpulanCamat, setKesimpulanCamat] = useState(
    'Rancangan Peraturan Desa telah dievaluasi dan diharmonisasi secara yuridis formal maupun materiil, tidak bertentangan dengan kepentingan umum dan peraturan perundang-undangan yang lebih tinggi. Diberikan Nomor Registrasi dan dapat ditetapkan menjadi Peraturan Desa oleh Kepala Desa.'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nomorRegistrasi.trim()) {
      alert('Nomor Registrasi wajib diisi.');
      return;
    }

    onUpdateDocument(
      doc.id,
      {
        nomorRegistrasi: nomorRegistrasi.trim(),
        status: 'SELESAI_TEREGISTRASI',
        slaDaysRemaining: 0,
        keputusanKecamatan: {
          nomorRegistrasi: nomorRegistrasi.trim(),
          tanggal: tanggalRegistrasi,
          pejabat: KECAMATAN_INFO.camatNama,
          kesimpulan: kesimpulanCamat
        }
      },
      `Pemerintah Kecamatan Waru menerbitkan Nomor Registrasi Resmi: ${nomorRegistrasi.trim()}`
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full my-auto shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 flex items-center justify-center text-white">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Penerbitan Nomor Registrasi Produk Hukum
              </h2>
              <p className="text-xs text-emerald-200">
                Pemerintah Kecamatan Waru &bull; Kab. Penajam Paser Utara
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-500 text-[11px] uppercase">Dokumen Tujuan:</span>
            <div className="font-bold text-slate-900 text-xs sm:text-sm">{doc.judul}</div>
            <div className="text-[11px] text-slate-500">Desa: {doc.desaNama} &bull; Jalur: {doc.jalur}</div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Nomor Registrasi Resmi Kecamatan</label>
            <input
              type="text"
              required
              value={nomorRegistrasi}
              onChange={(e) => setNomorRegistrasi(e.target.value)}
              placeholder="Contoh: REG.180.12/01/WARU/2026"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Format baku: REG.[Kode Klasifikasi]/[Nomor Urut]/WARU/[Tahun]
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Tanggal Penerbitan</label>
            <input
              type="date"
              required
              value={tanggalRegistrasi}
              onChange={(e) => setTanggalRegistrasi(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Kesimpulan Hasil Evaluasi Camat Waru</label>
            <textarea
              rows={4}
              required
              value={kesimpulanCamat}
              onChange={(e) => setKesimpulanCamat(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
            />
          </div>

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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Sahkan Nomor Registrasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
