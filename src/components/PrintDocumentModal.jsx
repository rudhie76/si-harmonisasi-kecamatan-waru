import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Scale, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import { KECAMATAN_INFO } from '../data/legalReferences';
import { formatDateIndo, exportHtmlToWord } from '../utils/helpers';

export default function PrintDocumentModal({ 
  document: doc, 
  onClose 
}) {
  const [docType, setDocType] = useState('MATRIKS'); // 'MATRIKS' | 'BERITA_ACARA' | 'SURAT_CAMAT'
  const currentDate = formatDateIndo(new Date());

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    const filename = `${docType}_${doc.desaNama.replace(/\s+/g, '_')}_${doc.id}.doc`;
    exportHtmlToWord('official-print-area', filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header Navigasi Modal */}
        <div className="bg-govnavy-900 text-white p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Cetak Dokumen Resmi Kecamatan Waru
              </h2>
              <p className="text-xs text-slate-300">
                Kop Surat Resmi Kabupaten Penajam Paser Utara &bull; Standar Tata Naskah Dinas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportWord}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm"
              title="Unduh file Microsoft Word (.doc)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Word (.doc)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Pilihan Jenis Dokumen Resmi */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 space-x-2 overflow-x-auto no-print">
          <button
            onClick={() => setDocType('MATRIKS')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              docType === 'MATRIKS'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>1. Lembar Matriks Harmonisasi</span>
          </button>

          <button
            onClick={() => setDocType('BERITA_ACARA')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              docType === 'BERITA_ACARA'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Berita Acara Hasil Evaluasi</span>
          </button>

          <button
            onClick={() => setDocType('SURAT_CAMAT')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              docType === 'SURAT_CAMAT'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Keputusan Camat & No. Registrasi</span>
          </button>
        </div>

        {/* AREA DOKUMEN CETAK RESMI (KOP SURAT PEMKAB PPU - KECAMATAN WARU) */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white" id="official-print-area">
          
          {/* KOP SURAT RESMI */}
          <div className="text-center border-b-4 border-double border-black pb-3 mb-6 relative">
            <div className="font-serif text-black space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold tracking-wider uppercase">
                PEMERINTAH KABUPATEN PENAJAM PASER UTARA
              </h3>
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-wide uppercase">
                KECAMATAN WARU
              </h2>
              <p className="text-xs italic text-black">
                {KECAMATAN_INFO.alamat} &bull; Telp. {KECAMATAN_INFO.telepon}
              </p>
              <p className="text-xs text-black">
                Pos-el: {KECAMATAN_INFO.emailResmi} &bull; Laman: waru.penajamkab.go.id
              </p>
            </div>
          </div>

          {/* DOKUMEN 1: MATRIKS HASIL HARMONISASI & EVALUASI */}
          {docType === 'MATRIKS' && (
            <div className="space-y-5 text-black font-serif text-xs sm:text-sm">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-sm sm:text-base uppercase underline">
                  MATRIKS HASIL HARMONISASI DAN EVALUASI PRODUK HUKUM DESA
                </h4>
                <p className="text-xs">
                  Nomor: 180.12 / {doc.id.replace('DOC-', '')} / PEM-WARU / {new Date().getFullYear()}
                </p>
              </div>

              {/* Tabel Identitas Pengajuan */}
              <table className="w-full text-xs border border-black border-collapse my-3">
                <tbody>
                  <tr>
                    <td className="p-2 border border-black font-bold w-48 bg-slate-100">Desa Pemohon</td>
                    <td className="p-2 border border-black">{doc.desaNama}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black font-bold bg-slate-100">Jenis & Judul Produk Hukum</td>
                    <td className="p-2 border border-black font-bold">{doc.judul}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black font-bold bg-slate-100">Jalur Mekanisme Permendagri 111/2014</td>
                    <td className="p-2 border border-black">
                      {doc.jalur === 'EVALUASI' ? 'Jalur Evaluasi (Sebelum Penetapan oleh Kades)' : 'Jalur Klarifikasi (Setelah Ditetapkan)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black font-bold bg-slate-100">Nomor Registrasi Produk Hukum</td>
                    <td className="p-2 border border-black font-mono font-bold">
                      {doc.nomorRegistrasi || 'DALAM PROSES EVALUASI'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Tabel Matriks */}
              <div className="mt-4">
                <table className="w-full text-xs border border-black border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-center font-bold">
                      <th className="p-2 border border-black w-8">No</th>
                      <th className="p-2 border border-black w-36">Bagian / Pasal</th>
                      <th className="p-2 border border-black">Bunyi Draf Awal</th>
                      <th className="p-2 border border-black">Catatan Harmonisasi Kecamatan</th>
                      <th className="p-2 border border-black">Rekomendasi Rumusan Perbaikan</th>
                      <th className="p-2 border border-black w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.matriksEvaluasi?.length > 0 ? (
                      doc.matriksEvaluasi.map((item, idx) => (
                        <tr key={idx} className="align-top">
                          <td className="p-2 border border-black text-center">{idx + 1}</td>
                          <td className="p-2 border border-black font-bold">{item.bagianPasal}</td>
                          <td className="p-2 border border-black font-mono text-[11px]">{item.drafAwal || '-'}</td>
                          <td className="p-2 border border-black">{item.catatanHarmonisasi}</td>
                          <td className="p-2 border border-black font-semibold">{item.rekomendasiPerbaikan}</td>
                          <td className="p-2 border border-black text-center font-bold">
                            {item.status.replace(/_/g, ' ')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 border border-black text-center italic">
                          Draf telah sesuai kaidah legal drafting dan tidak ditemukan pertentangan hukum.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan Resmi */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kasi Seksi Pemerintahan</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{KECAMATAN_INFO.kasiPemerintahan}</p>
                  <p>NIP. {KECAMATAN_INFO.kasiPemerintahanNip}</p>
                </div>
                <div>
                  <p>Waru, {currentDate}</p>
                  <p className="font-bold">CAMAT WARU,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{KECAMATAN_INFO.camatNama}</p>
                  <p>{KECAMATAN_INFO.camatPangkat}</p>
                  <p>NIP. {KECAMATAN_INFO.camatNip}</p>
                </div>
              </div>
            </div>
          )}

          {/* DOKUMEN 2: BERITA ACARA EVALUASI */}
          {docType === 'BERITA_ACARA' && (
            <div className="space-y-4 text-black font-serif text-xs sm:text-sm leading-relaxed">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-sm sm:text-base uppercase underline">
                  BERITA ACARA HASIL EVALUASI PRODUK HUKUM DESA
                </h4>
                <p className="text-xs">
                  Nomor: 180.12 / BA-{doc.id.replace('DOC-', '')} / WARU / {new Date().getFullYear()}
                </p>
              </div>

              <p className="text-justify indent-8">
                Pada hari ini, tanggal <strong>{currentDate}</strong>, bertempat di Ruang Rapat Kantor Kecamatan Waru, telah diselenggarakan Rapat Evaluasi dan Harmonisasi Rancangan Peraturan Desa oleh Tim Evaluasi Produk Hukum Kecamatan Waru terhadap:
              </p>

              <table className="w-full text-xs my-2">
                <tbody>
                  <tr>
                    <td className="w-36 py-1 font-bold">Pemerintah Desa</td>
                    <td className="w-4">:</td>
                    <td>{doc.desaNama}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-bold">Judul Raperdes</td>
                    <td>:</td>
                    <td className="font-bold">{doc.judul}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-bold">Kepala Desa</td>
                    <td>:</td>
                    <td>{doc.pengaju?.nama}</td>
                  </tr>
                </tbody>
              </table>

              <p className="text-justify indent-8">
                Berdasarkan hasil penelitian formal, yuridis, dan materi muatan sesuai ketentuan Permendagri Nomor 111 Tahun 2014 tentang Pedoman Teknis Peraturan di Desa serta peraturan perundang-undangan yang lebih tinggi, dengan ini disepakati:
              </p>

              <ol className="list-decimal pl-8 space-y-1 text-justify">
                <li>Rancangan Peraturan Desa dinyatakan telah memenuhi syarat tata naskah dinas dan batas kewenangan desa.</li>
                <li>Pemerintah Desa wajib menindaklanjuti dan menyempurnakan draf sesuai dengan Rekomendasi Matriks Harmonisasi terlampir paling lambat 7 (tujuh) hari kerja sejak diterimanya Berita Acara ini.</li>
                <li>Setelah dilakukan penyempurnaan, Camat Waru menerbitkan Keputusan Hasil Evaluasi dan Nomor Registrasi Produk Hukum Desa.</li>
              </ol>

              <p className="text-justify indent-8">
                Demikian Berita Acara ini dibuat dalam rangkap secukupnya untuk dipergunakan sebagaimana mestinya.
              </p>

              {/* Tanda Tangan Berita Acara */}
              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
                <div>
                  <p>Pihak I,</p>
                  <p className="font-bold">Kepala {doc.desaNama}</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{doc.pengaju?.nama}</p>
                </div>
                <div>
                  <p>Pihak II,</p>
                  <p className="font-bold">CAMAT WARU</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{KECAMATAN_INFO.camatNama}</p>
                  <p>NIP. {KECAMATAN_INFO.camatNip}</p>
                </div>
              </div>
            </div>
          )}

          {/* DOKUMEN 3: KEPUTUSAN CAMAT WARU & PEMBERIAN NO REGISTRASI */}
          {docType === 'SURAT_CAMAT' && (
            <div className="space-y-4 text-black font-serif text-xs sm:text-sm leading-relaxed">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-sm sm:text-base uppercase">
                  KEPUTUSAN CAMAT WARU
                </h4>
                <p className="text-xs font-bold">
                  NOMOR: 180.12 / SK-{doc.id.replace('DOC-', '')} / WARU / {new Date().getFullYear()}
                </p>
                <h5 className="font-bold text-xs uppercase pt-2">
                  TENTANG<br />
                  HASIL EVALUASI RANCANGAN PERATURAN DESA DAN PEMBERIAN NOMOR REGISTRASI PRODUK HUKUM {doc.desaNama.toUpperCase()}
                </h5>
                <p className="font-bold text-xs uppercase">CAMAT WARU,</p>
              </div>

              <div className="space-y-2 text-justify">
                <div className="flex items-start space-x-2">
                  <span className="font-bold w-24">Menimbang</span>
                  <span className="w-2">:</span>
                  <div className="flex-1 space-y-1">
                    <p>a. bahwa berdasarkan hasil evaluasi Tim Evaluasi Produk Hukum Kecamatan Waru, Rancangan Peraturan Desa {doc.desaNama} tentang {doc.kategori} dinilai telah sesuai dan tidak bertentangan dengan kepentingan umum dan ketentuan peraturan perundang-undangan yang lebih tinggi;</p>
                    <p>b. bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a, perlu menetapkan Keputusan Camat Waru tentang Hasil Evaluasi dan Pemberian Nomor Registrasi;</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="font-bold w-24">Mengingat</span>
                  <span className="w-2">:</span>
                  <div className="flex-1 space-y-1">
                    <p>1. Undang-Undang Nomor 6 Tahun 2014 tentang Desa jo. Undang-Undang Nomor 3 Tahun 2024;</p>
                    <p>2. Peraturan Menteri Dalam Negeri Nomor 111 Tahun 2014 tentang Pedoman Teknis Peraturan di Desa;</p>
                    <p>3. Peraturan Daerah Kabupaten Penajam Paser Utara tentang Tata Cara Pembentukan Produk Hukum Desa.</p>
                  </div>
                </div>

                <div className="text-center font-bold py-2">MEMUTUSKAN:</div>

                <div className="flex items-start space-x-2">
                  <span className="font-bold w-24">Menetapkan</span>
                  <span className="w-2">:</span>
                  <p className="flex-1 font-bold">
                    KEPUTUSAN CAMAT WARU TENTANG HASIL EVALUASI RANCANGAN PERATURAN DESA DAN PEMBERIAN NOMOR REGISTRASI.
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="font-bold w-24">KESATU</span>
                  <span className="w-2">:</span>
                  <p className="flex-1">
                    Menyatakan Rancangan Peraturan Desa {doc.desaNama} dengan judul <em>"{doc.judul}"</em> telah memenuhi syarat evaluasi.
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="font-bold w-24">KEDUA</span>
                  <span className="w-2">:</span>
                  <p className="flex-1">
                    Memberikan Nomor Registrasi Produk Hukum Desa: <strong className="font-mono text-sm underline">{doc.nomorRegistrasi || 'REG.180.12/01/WARU/2026'}</strong>.
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="font-bold w-24">KETIGA</span>
                  <span className="w-2">:</span>
                  <p className="flex-1">
                    Memerintahkan Kepala Desa {doc.desaNama} untuk menetapkan dan Sekretaris Desa untuk mengundangkan dalam Lembaran Desa {doc.desaNama}.
                  </p>
                </div>
              </div>

              {/* Tanda Tangan Camat Waru */}
              <div className="flex justify-end pt-8 text-center text-xs">
                <div className="w-64">
                  <p>Ditetapkan di Waru</p>
                  <p>pada tanggal {currentDate}</p>
                  <p className="font-bold mt-1">CAMAT WARU,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{KECAMATAN_INFO.camatNama}</p>
                  <p>{KECAMATAN_INFO.camatPangkat}</p>
                  <p>NIP. {KECAMATAN_INFO.camatNip}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
