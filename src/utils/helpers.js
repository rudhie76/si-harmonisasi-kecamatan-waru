/**
 * Utility Helpers
 */

export function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

export function formatCurrencyIdr(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

export function getStatusBadge(status) {
  switch (status) {
    case 'DRAFT':
      return { label: 'Draf di Desa', bg: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-400' };
    case 'PEMBAHASAN_BPD':
      return { label: 'Pembahasan BPD', bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' };
    case 'REVISI_BPD':
      return { label: 'Revisi BPD ke Pemdes', bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
    case 'VERIFIKASI_KECAMATAN':
      return { label: 'Verifikasi Berkas Kecamatan', bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-500' };
    case 'EVALUASI_KECAMATAN':
      return { label: 'Evaluasi & Harmonisasi Kecamatan', bg: 'bg-indigo-50 text-indigo-800 border-indigo-300', dot: 'bg-indigo-500' };
    case 'REVISI_DESA':
      return { label: 'Perlu Revisi Pemdes', bg: 'bg-orange-50 text-orange-800 border-orange-300', dot: 'bg-orange-500' };
    case 'SELESAI_TEREGISTRASI':
      return { label: 'Selesai & Teregistrasi', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-400' };
  }
}

export function getJalurBadge(jalur) {
  if (jalur === 'EVALUASI') {
    return {
      label: 'Jalur Evaluasi (Sebelum Penetapan)',
      sub: 'APBDes, Pungutan, Tata Ruang, SOTK',
      badge: 'bg-purple-100 text-purple-900 border-purple-300 font-semibold',
      iconColor: 'text-purple-700'
    };
  }
  return {
    label: 'Jalur Klarifikasi (Setelah Penetapan)',
    sub: 'Perdes lainnya, Perkades & SK Kades',
    badge: 'bg-sky-100 text-sky-900 border-sky-300 font-semibold',
    iconColor: 'text-sky-700'
  };
}

export function exportHtmlToWord(elementId, filename = 'Dokumen_Resmi_Kecamatan_Waru.doc') {
  const element = document.getElementById(elementId);
  if (!element) return;

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
        table { border-collapse: collapse; width: 100%; margin-top: 15px; }
        th, td { border: 1px solid #000; padding: 6px 8px; font-size: 11pt; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
        .text-center { text-align: center; }
        .text-justify { text-align: justify; }
        .font-bold { font-weight: bold; }
        .kop-title { font-size: 14pt; font-weight: bold; margin: 0; text-align: center; }
        .kop-sub { font-size: 12pt; font-weight: bold; margin: 0; text-align: center; }
        .kop-address { font-size: 10pt; font-style: italic; margin: 0; text-align: center; }
        hr.kop-line { border: 2px solid #000; margin-top: 8px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
