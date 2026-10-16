import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Building2, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  FolderSync, 
  Send,
  Users,
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import { DESA_LIST, JENIS_PRODUK_HUKUM, KATEGORI_EVALUASI_MANDATORI } from '../data/legalReferences';
import { googleSheetService } from '../services/googleSheetService';
import { SAMPLE_DRAFT_APBDES_BANGUN_MULYA } from '../data/seedData';

export default function DocumentSubmissionModal({ 
  currentRole, 
  onClose, 
  onSubmitSuccess 
}) {
  const isBpd = currentRole.role === 'BPD';
  const initialDesa = DESA_LIST.find(d => d.id === currentRole.desaId) || DESA_LIST[0];

  const [desaId, setDesaId] = useState(currentRole.desaId || 'desa-bangun-mulya');
  const [jenis, setJenis] = useState('PERDES');
  const [kategori, setKategori] = useState(isBpd ? 'Ketertiban & Lingkungan Hidup' : 'APBDes / Perubahan APBDes');
  const [judul, setJudul] = useState('');
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [namaPengaju, setNamaPengaju] = useState(
    isBpd 
      ? (currentRole.userNama?.split('(')[0]?.trim() || initialDesa.ketuaBpd)
      : (currentRole.userNama?.split('(')[0]?.trim() || initialDesa.kades)
  );
  const [kontak, setKontak] = useState('081255443322');
  const [teksDraf, setTeksDraf] = useState('');

  // File uploads
  const [fileDraf, setFileDraf] = useState(null);
  const [fileMusdes, setFileMusdes] = useState(null);
  const [fileDaftarHadir, setFileDaftarHadir] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const selectedDesa = DESA_LIST.find(d => d.id === desaId) || DESA_LIST[0];

  // Tentukan jalur otomatis berdasarkan Permendagri 111/2014
  const isMandatoryEvaluation = jenis === 'PERDES' && KATEGORI_EVALUASI_MANDATORI.includes(kategori);
  const jalurOtomatis = isMandatoryEvaluation ? 'EVALUASI' : 'KLARIFIKASI';

  const handleInsertTemplate = () => {
    if (isBpd) {
      setJudul(`Rancangan Peraturan Desa ${selectedDesa.nama.replace('Desa ', '')} Nomor ... Tahun ${tahun} tentang Pengelolaan Sampah Terpadu dan Pelestarian Lingkungan Hidup Desa`);
      setTeksDraf(`RANCANGAN PERATURAN DESA ${selectedDesa.nama.toUpperCase().replace('DESA ', '')}
NOMOR ... TAHUN ${tahun}
TENTANG
PENGELOLAAN SAMPAH TERPADU DAN PELESTARIAN LINGKUNGAN HIDUP DESA

DENGAN RAHMAT TUHAN YANG MAHA ESA
KEPALA DESA ${selectedDesa.nama.toUpperCase().replace('DESA ', '')},

Menimbang:
a. bahwa lingkungan hidup yang bersih, sehat, dan asri merupakan hak asasi setiap warga desa...
b. bahwa timbulan sampah yang tidak terkelola dengan baik berpotensi mencemari sungai dan pemukiman...
c. bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a dan huruf b, atas usul inisiatif Badan Permusyawaratan Desa, perlu menetapkan Peraturan Desa tentang Pengelolaan Sampah Terpadu;

Mengingat:
1. Undang-Undang Nomor 6 Tahun 2014 tentang Desa sebagaimana telah diubah dengan Undang-Undang Nomor 3 Tahun 2024;
2. Peraturan Menteri Dalam Negeri Nomor 111 Tahun 2014 tentang Pedoman Teknis Peraturan di Desa;

Dengan Kesepakatan Bersama
BADAN PERMUSYAWARATAN DESA ${selectedDesa.nama.toUpperCase().replace('DESA ', '')}
dan
KEPALA DESA ${selectedDesa.nama.toUpperCase().replace('DESA ', '')}

MEMUTUSKAN:
Menetapkan: PERATURAN DESA TENTANG PENGELOLAAN SAMPAH TERPADU DAN PELESTARIAN LINGKUNGAN HIDUP DESA.

BAB I
KETENTUAN UMUM
Pasal 1
...
`);
    } else {
      setJudul(`Rancangan Peraturan Desa ${selectedDesa.nama.replace('Desa ', '')} Nomor 02 Tahun ${tahun} tentang Pengelolaan Keuangan dan Aset Desa`);
      setTeksDraf(SAMPLE_DRAFT_APBDES_BANGUN_MULYA);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judul.trim()) {
      alert('Judul draf produk hukum wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Mengunggah berkas ke Google Drive (waruppusigap@gmail.com)...');

    try {
      // 1. Upload berkas draf ke Google Drive
      const drafUploadResult = await googleSheetService.uploadFileToDrive({
        file: fileDraf,
        desaNama: selectedDesa.nama,
        documentId: 'PENDING'
      });

      // 2. Upload berkas kedua (BA Musdes / Penjelasan BPD)
      let musdesUploadResult = null;
      if (fileMusdes) {
        musdesUploadResult = await googleSheetService.uploadFileToDrive({
          file: fileMusdes,
          desaNama: selectedDesa.nama,
          documentId: 'PENDING'
        });
      }

      // 3. Upload berkas ketiga (Daftar Hadir / BA Internal BPD)
      let hadirUploadResult = null;
      if (fileDaftarHadir) {
        hadirUploadResult = await googleSheetService.uploadFileToDrive({
          file: fileDaftarHadir,
          desaNama: selectedDesa.nama,
          documentId: 'PENDING'
        });
      }

      setUploadProgress('Menyimpan data dan sinkronisasi ke Google Sheet...');

      const newDocData = {
        desaId: selectedDesa.id,
        desaNama: selectedDesa.nama,
        jenis,
        kategori,
        jalur: jalurOtomatis,
        judul,
        tahun: Number(tahun),
        inisiatif: isBpd ? 'BPD' : 'PEMDES',
        pengaju: {
          nama: namaPengaju,
          jabatan: isBpd ? `Ketua BPD ${selectedDesa.nama}` : (jenis === 'PERDES' ? `Kepala ${selectedDesa.nama}` : `Pemerintah ${selectedDesa.nama}`),
          kontak
        },
        teksDraf: teksDraf || SAMPLE_DRAFT_APBDES_BANGUN_MULYA,
        berkas: {
          drafUtama: {
            nama: drafUploadResult.fileName || (fileDraf ? fileDraf.name : `Draf_${isBpd ? 'Inisiatif_BPD' : jenis}_${selectedDesa.nama}.pdf`),
            ukuran: drafUploadResult.fileSize || '1.2 MB',
            driveLink: drafUploadResult.driveLink,
            uploadTime: new Date().toLocaleString('id-ID')
          },
          lampiranMusdes: musdesUploadResult ? {
            nama: musdesUploadResult.fileName,
            ukuran: musdesUploadResult.fileSize,
            driveLink: musdesUploadResult.driveLink,
            uploadTime: new Date().toLocaleString('id-ID')
          } : null,
          daftarHadir: hadirUploadResult ? {
            nama: hadirUploadResult.fileName,
            ukuran: hadirUploadResult.fileSize,
            driveLink: hadirUploadResult.driveLink,
            uploadTime: new Date().toLocaleString('id-ID')
          } : null
        },
        catatanBpd: isBpd ? {
          statusPersetujuan: 'DISETUJUI_BPD',
          tanggalPersetujuan: new Date().toISOString().split('T')[0],
          nomorSkPersetujuan: `SK-BPD/${selectedDesa.nama.replace(/\s+/g, '_').toUpperCase()}/INISIATIF/${tahun}`,
          catatanPembahasan: `Rancangan Peraturan Desa diajukan atas inisiatif Badan Permusyawaratan Desa (BPD) ${selectedDesa.nama} sesuai Pasal 6-8 Permendagri No. 111 Tahun 2014 untuk dibahas bersama Pemerintah Desa.`
        } : null,
        verifikasiKecamatan: null,
        matriksEvaluasi: []
      };

      onSubmitSuccess(newDocData);
      onClose();

    } catch (err) {
      alert(`Terjadi kesalahan: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className={`text-white p-5 flex items-center justify-between border-b ${
          isBpd ? 'bg-gradient-to-r from-govnavy-900 via-slate-900 to-amber-950 border-amber-800/40' : 'bg-govnavy-900 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              isBpd ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              {isBpd ? <Users className="w-5 h-5 text-amber-100" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {isBpd ? 'Pengajuan Raperdes Inisiatif BPD' : 'Pengajuan Draf Produk Hukum Desa Baru'}
                </h2>
                {isBpd && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                    Inisiatif BPD
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {isBpd 
                  ? 'Permendagri No. 111 Tahun 2014 Pasal 6-8 &bull; Raperdes Usulan Badan Permusyawaratan Desa'
                  : 'Kecamatan Waru &bull; Sinkronisasi Google Drive & Sheet waruppusigap@gmail.com'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Isi */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Box Penjelasan Yuridis Khusus BPD */}
          {isBpd && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-xs">
                  Hak Prakarsa BPD Sesuai Permendagri No. 111 Tahun 2014 Pasal 6-8:
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Badan Permusyawaratan Desa (BPD) berwenang memprakarsai dan mengusulkan Rancangan Peraturan Desa (Raperdes) kepada Kepala Desa (kecuali materi APBDes, RKPDes, & Laporan Pertanggungjawaban Realisasi APBDes yang merupakan kewenangan Kepala Desa). Raperdes inisiatif ini akan dibahas bersama Pemerintah Desa sebelum disampaikan ke Camat Waru.
                </p>
              </div>
            </div>
          )}

          {/* Identitas Desa & Jenis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isBpd ? 'Wilayah Desa (BPD Pengusul)' : 'Pemerintah Desa Pemohon'}
              </label>
              <select
                value={desaId}
                onChange={(e) => setDesaId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-900 bg-white"
              >
                {DESA_LIST.map(d => (
                  <option key={d.id} value={d.id}>{d.nama}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Produk Hukum</label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-900 bg-white"
              >
                <option value="PERDES">1. Peraturan Desa (Perdes) {isBpd ? '- Inisiatif BPD' : ''}</option>
                {!isBpd && (
                  <>
                    <option value="PERMAKADES">2. Peraturan Bersama Kepala Desa (Permakades)</option>
                    <option value="PERKADES">3. Peraturan Kepala Desa (Perkades)</option>
                    <option value="SK_KADES">4. Keputusan Kepala Desa (SK Kades)</option>
                  </>
                )}
              </select>
              {isBpd && (
                <p className="text-[10px] text-slate-500 mt-1">
                  *BPD berwenang mengusulkan Peraturan Desa (Perdes). Perkades & SK Kades adalah ranah operasional Kepala Desa.
                </p>
              )}
            </div>
          </div>

          {/* Kategori & Deteksi Jalur Permendagri 111/2014 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isBpd ? 'Substansi Materi Raperdes Inisiatif BPD' : 'Substansi / Kategori Materi'}
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white font-medium"
              >
                {isBpd ? (
                  <>
                    <option value="Ketertiban & Lingkungan Hidup">Ketertiban & Lingkungan Hidup</option>
                    <option value="Pengelolaan Aset & BUMDes">Pengelolaan Aset & BUMDes</option>
                    <option value="Sosial & Bantuan Langsung">Sosial & Kelembagaan Masyarakat</option>
                    <option value="Pungutan Desa">Pungutan Desa (Mandatori Evaluasi)</option>
                    <option value="Tata Ruang Desa">Tata Ruang Desa (Mandatori Evaluasi)</option>
                    <option value="Susunan Organisasi dan Tata Kerja (SOTK) Pemdes">SOTK Pemdes (Mandatori Evaluasi)</option>
                    <option value="Lainnya">Lainnya</option>
                  </>
                ) : (
                  <>
                    <option value="APBDes / Perubahan APBDes">APBDes / Perubahan APBDes (Mandatori Evaluasi)</option>
                    <option value="Pungutan Desa">Pungutan Desa (Mandatori Evaluasi)</option>
                    <option value="Tata Ruang Desa">Tata Ruang Desa (Mandatori Evaluasi)</option>
                    <option value="Susunan Organisasi dan Tata Kerja (SOTK) Pemdes">SOTK Pemdes (Mandatori Evaluasi)</option>
                    <option value="Pengelolaan Aset & BUMDes">Pengelolaan Aset & BUMDes</option>
                    <option value="Ketertiban & Lingkungan Hidup">Ketertiban & Lingkungan Hidup</option>
                    <option value="Sosial & Bantuan Langsung">Sosial & Bantuan Langsung</option>
                    <option value="Pengadaan Barang & Jasa">Pengadaan Barang & Jasa</option>
                    <option value="Lainnya">Lainnya</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jalur Penelaahan Kecamatan (Otomatis)</label>
              <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                jalurOtomatis === 'EVALUASI' 
                  ? 'bg-purple-50 border-purple-300 text-purple-900' 
                  : 'bg-sky-50 border-sky-300 text-sky-900'
              }`}>
                <Scale className="w-4 h-4 flex-shrink-0" />
                <div className="leading-tight">
                  <div className="font-bold">
                    {jalurOtomatis === 'EVALUASI' ? 'Jalur Evaluasi (Sebelum Ditetapkan)' : 'Jalur Klarifikasi (Setelah Ditetapkan)'}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {jalurOtomatis === 'EVALUASI' ? 'Wajib evaluasi Camat max 20 hari kerja' : 'Paling lambat 7 hari setelah penetapan'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Judul & Tahun */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  {isBpd ? 'Judul Raperdes Inisiatif BPD' : 'Judul Lengkap Produk Hukum'}
                </label>
                <button
                  type="button"
                  onClick={handleInsertTemplate}
                  className={`${isBpd ? 'text-amber-700' : 'text-blue-600'} hover:underline text-[11px] font-semibold`}
                >
                  {isBpd ? 'Gunakan Template Inisiatif BPD' : 'Gunakan Contoh Template'}
                </button>
              </div>
              <input
                type="text"
                required
                placeholder={
                  isBpd 
                    ? `Contoh: Rancangan Peraturan Desa ${selectedDesa.nama.replace('Desa ', '')} tentang Pengelolaan Sampah Terpadu...` 
                    : `Contoh: Rancangan Peraturan Desa ${selectedDesa.nama.replace('Desa ', '')} Nomor 02 Tahun 2026 tentang...`
                }
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Pengajuan</label>
              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Pengaju & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isBpd ? 'Nama Ketua BPD / Inisiator Usulan' : 'Nama Kepala Desa / Pengusul'}
              </label>
              <input
                type="text"
                required
                value={namaPengaju}
                onChange={(e) => setNamaPengaju(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isBpd ? 'Nomor Kontak BPD' : 'Nomor Kontak / WhatsApp Desa'}
              </label>
              <input
                type="text"
                required
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Area Unggah Berkas ke Drive waruppusigap@gmail.com */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 text-slate-800 font-bold">
              <Upload className={`w-4 h-4 ${isBpd ? 'text-amber-600' : 'text-emerald-600'}`} />
              <span>Unggah Berkas Fisik (Tersimpan ke Google Drive waruppusigap@gmail.com)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Berkas 1: Draf Utama */}
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <label className="block font-semibold text-slate-700 mb-1">
                  {isBpd ? '1. Draf Raperdes Inisiatif (.pdf/.docx)' : '1. Draf Peraturan (.pdf/.docx)'}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFileDraf(e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-blue-50 file:text-blue-700"
                />
              </div>

              {/* Berkas 2: BA Musdes / Penjelasan BPD */}
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <label className="block font-semibold text-slate-700 mb-1">
                  {isBpd ? '2. Naskah Penjelasan BPD (.pdf)' : '2. Berita Acara Musdes (.pdf)'}
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFileMusdes(e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-blue-50 file:text-blue-700"
                />
              </div>

              {/* Berkas 3: Daftar Hadir / BA Internal BPD */}
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <label className="block font-semibold text-slate-700 mb-1">
                  {isBpd ? '3. BA Rapat Internal BPD (.pdf)' : '3. Daftar Hadir Musdes (.pdf)'}
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFileDaftarHadir(e.target.files[0])}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-blue-50 file:text-blue-700"
                />
              </div>
            </div>
          </div>

          {/* Teks Draf Peraturan untuk Analisis AI */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Teks Naskah Draf (Untuk Analisis AI Harmonisasi Kecamatan)
            </label>
            <textarea
              rows={6}
              value={teksDraf}
              onChange={(e) => setTeksDraf(e.target.value)}
              placeholder={
                isBpd 
                  ? "Tempelkan naskah draf Raperdes inisiatif BPD lengkap di sini..." 
                  : "Tempelkan atau ketik draf lengkap peraturan desa di sini..."
              }
              className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Upload Progress Message */}
          {isSubmitting && (
            <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
              isBpd ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <FolderSync className="w-4 h-4 animate-spin text-emerald-600" />
              <span>{uploadProgress}</span>
            </div>
          )}

          {/* Footer Tombol */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
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
              className={`px-5 py-2.5 rounded-xl text-white font-bold flex items-center space-x-2 shadow-md disabled:opacity-50 ${
                isBpd 
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/20' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isBpd ? 'Kirim Usulan Raperdes BPD ke Sistem' : 'Kirim Pengajuan ke Sistem'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
