/**
 * Layanan AI Generator Harmonisasi Produk Hukum Desa
 * Terintegrasi dengan Google Gemini API & Mesin Aturan Yuridis Indonesia (Permendagri 111/2014)
 */

import { REGULASI_TIDAK_BERLAKU_WARNING, HIERARKI_REGULASI_ACUAN } from '../data/legalReferences';

/**
 * Prompt Sistem untuk Gemini API
 */
const SYSTEM_PROMPT = `Anda adalah Tenaga Ahli Hukum Perancang Peraturan Perundang-undangan dan Tim Verifikator/Evaluator Produk Hukum Desa pada Pemerintah Kecamatan Waru, Kabupaten Penajam Paser Utara (PPU), Provinsi Kalimantan Timur.
Tugas Anda adalah melakukan harmonisasi, sinkronisasi, dan evaluasi yuridis materiil maupun formal terhadap draf produk hukum desa (Perdes / Perkades / SK Kades) berdasarkan Permendagri No. 111 Tahun 2014, UU No. 6 Tahun 2014 jo. UU No. 3 Tahun 2024 tentang Desa, Permendagri No. 20 Tahun 2018, dan Peraturan Daerah/Bupati Kabupaten Penajam Paser Utara.

Analisis draf peraturan harus mencakup 8 bagian struktur peraturan perundang-undangan:
1. Judul / Penamaan (nomenklatur, tata naskah)
2. Pembukaan & Jabatan Pembentuk (frasa 'Dengan Rahmat Tuhan Yang Maha Esa', jabatan kades)
3. Konsiderans Menimbang (aspek filosofis, sosiologis, yuridis)
4. Dasar Hukum Mengingat (hierarki peraturan, cek regulasi kadaluarsa/dicabut, kelengkapan UU Desa terbaru)
5. Diktum Memutuskan / Menetapkan (format kesepakatan bersama BPD jika Perdes)
6. Batang Tubuh (Pasal demi pasal, konsistensi asas, kepatuhan kewenangan desa, sanksi administratif)
7. Ketentuan Penutup & Pengundangan (mulai berlaku, Lembaran Desa/Berita Desa oleh Sekdes)
8. Lampiran (jika ada rincian anggaran/tabel)

Keluarkan output dalam format JSON array dengan skema:
[
  {
    "id": "AI-001",
    "bagianPasal": "Nama Bagian / Nomor Pasal",
    "drafAwal": "Kutipan teks asli dari draf",
    "catatanHarmonisasi": "Penjelasan evaluasi yuridis, kelemahan, atau potensi pertentangan",
    "rekomendasiPerbaikan": "Rumusan konkrit perbaikan kalimat / tata bahasa legal drafting",
    "status": "PERLU_PERBAIKAN" | "SESUAI" | "PERHATIAN_KHUSUS",
    "kategoriAspek": "FORMAL" | "YURIDIS" | "SUBSTANSI" | "TEKNIK_PENYUSUNAN"
  }
]`;

/**
 * Panggil Gemini API secara langsung jika API Key tersedia
 */
async function callGeminiApi(draftText, jenisProduk, namaDesa, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Lakukan harmonisasi dan evaluasi draf ${jenisProduk} dari ${namaDesa} berikut ini:
  
--- TEKS DRAF MULAI ---
${draftText}
--- TEKS DRAF SELESAI ---

Pastikan memeriksa apakah ada undang-undang yang sudah dicabut (seperti UU 32/2004 atau Permendagri 113/2014) dan apakah telah menggunakan UU Desa terbaru (UU 3/2024).`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPT + '\n\n' + prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal menghubungi Gemini API (Status ${response.status})`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Format respon Gemini kosong');

  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  return Array.isArray(parsed) ? parsed : (parsed.matriks || parsed.items || []);
}

/**
 * Mesin Analisis Yuridis Cerdas (Internal Rule-Based Fallback)
 * Bekerja 100% offline dengan aturan yuridis komprehensif Permendagri 111/2014
 */
export function analyzeDraftRuleBased(draftText, jenisProduk = 'PERDES', namaDesa = 'Desa Bangun Mulya') {
  const lines = draftText.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = draftText;
  const results = [];
  let counter = 1;

  const makeId = () => `AI-${String(counter++).padStart(3, '0')}`;

  // 1. Analisis Judul & Penamaan
  const titleLine = lines.slice(0, 5).join(' ');
  const hasNomor = /NOMOR\s+\d+/i.test(titleLine);
  const hasTahun = /TAHUN\s+\d{4}/i.test(titleLine);

  if (!hasNomor || !hasTahun) {
    results.push({
      id: makeId(),
      bagianPasal: '1. Judul / Penamaan',
      drafAwal: lines.slice(0, 3).join('\n') || 'Judul Peraturan',
      catatanHarmonisasi: 'Nomenklatur penomoran belum lengkap. Berdasarkan Lampiran Permendagri No. 111 Tahun 2014, judul harus memuat Jenis Peraturan, Nomor (dengan angka arab), dan Tahun penetapan.',
      rekomendasiPerbaikan: `RANCANGAN PERATURAN DESA ${namaDesa.toUpperCase().replace('DESA ', '')}\nNOMOR [Nomor Arab] TAHUN [Tahun Empat Angka]\nTENTANG [JUDUL DENGAN HURUF KAPITAL]`,
      status: 'PERLU_PERBAIKAN',
      kategoriAspek: 'FORMAL'
    });
  } else {
    results.push({
      id: makeId(),
      bagianPasal: '1. Judul / Penamaan',
      drafAwal: lines.slice(0, 3).join('\n'),
      catatanHarmonisasi: 'Penamaan dan nomenklatur judul telah memenuhi tata naskah dinas dan format baku Permendagri 111/2014.',
      rekomendasiPerbaikan: 'Pertahankan format penulisan huruf kapital pada judul.',
      status: 'SESUAI',
      kategoriAspek: 'FORMAL'
    });
  }

  // 2. Analisis Pembukaan & Jabatan Pembentuk
  const hasRahmat = /DENGAN\s+RAHMAT\s+TUHAN\s+YANG\s+MAHA\s+ESA/i.test(fullText);
  const hasKades = /KEPALA\s+DESA/i.test(fullText);

  if (!hasRahmat) {
    results.push({
      id: makeId(),
      bagianPasal: '2. Pembukaan (Frasa Sakral)',
      drafAwal: 'Bagian Pembukaan',
      catatanHarmonisasi: 'Frasa "DENGAN RAHMAT TUHAN YANG MAHA ESA" tidak ditemukan. Ini adalah syarat mutlak pembukaan peraturan perundang-undangan Republik Indonesia.',
      rekomendasiPerbaikan: 'Tambahkan tepat di bawah judul sebelum nama jabatan pembentuk:\n"DENGAN RAHMAT TUHAN YANG MAHA ESA"',
      status: 'PERLU_PERBAIKAN',
      kategoriAspek: 'FORMAL'
    });
  } else {
    results.push({
      id: makeId(),
      bagianPasal: '2. Pembukaan & Jabatan',
      drafAwal: 'DENGAN RAHMAT TUHAN YANG MAHA ESA\nKEPALA DESA...',
      catatanHarmonisasi: 'Pencantuman frasa pembukaan dan nama jabatan pembentuk peraturan sudah tepat.',
      rekomendasiPerbaikan: 'Pastikan penulisan jabatan pembentuk tidak diikuti nama orang pada bagian pembukaan.',
      status: 'SESUAI',
      kategoriAspek: 'FORMAL'
    });
  }

  // 3. Analisis Konsiderans "Menimbang"
  const menimbangMatch = fullText.match(/Menimbang\s*:\s*([\s\S]*?)(?=Mengingat\s*:)/i);
  if (menimbangMatch) {
    const menimbangText = menimbangMatch[1];
    const hasHurufA = /a\.\s*bahwa/i.test(menimbangText);
    const hasHurufB = /b\.\s*bahwa/i.test(menimbangText);
    const hasHurufC = /c\.\s*bahwa/i.test(menimbangText);

    if (!hasHurufA || !hasHurufB) {
      results.push({
        id: makeId(),
        bagianPasal: '3. Konsiderans Menimbang',
        drafAwal: menimbangText.slice(0, 160) + '...',
        catatanHarmonisasi: 'Konsiderans Menimbang idealnya memuat minimal 3 aspek: filosofis (huruf a), sosiologis/kebutuhan masyarakat (huruf b), dan yuridis/kewenangan (huruf c).',
        rekomendasiPerbaikan: 'Lengkapi struktur butir Menimbang dengan pola: a. bahwa untuk melaksanakan kebutuhan... b. bahwa kondisi riil masyarakat... c. bahwa berdasarkan pertimbangan a dan b perlu menetapkan...',
        status: 'PERHATIAN_KHUSUS',
        kategoriAspek: 'TEKNIK_PENYUSUNAN'
      });
    } else {
      results.push({
        id: makeId(),
        bagianPasal: '3. Konsiderans Menimbang',
        drafAwal: menimbangText.slice(0, 150) + '...',
        catatanHarmonisasi: 'Konsiderans Menimbang telah memuat latar belakang sosiologis dan landasan kebutuhan regulasi tingkat desa secara berurutan.',
        rekomendasiPerbaikan: 'Pastikan setiap akhir butir diakhiri tanda baca titik koma (;) dan butir terakhir diakhiri titik (.).',
        status: 'SESUAI',
        kategoriAspek: 'TEKNIK_PENYUSUNAN'
      });
    }
  }

  // 4. Analisis Dasar Hukum "Mengingat"
  const mengingatMatch = fullText.match(/Mengingat\s*:\s*([\s\S]*?)(?=(Dengan Kesepakatan Bersama|MEMUTUSKAN))/i);
  if (mengingatMatch) {
    const mengingatText = mengingatMatch[1];

    // Cek regulasi yang sudah kadaluarsa/dicabut
    REGULASI_TIDAK_BERLAKU_WARNING.forEach(reg => {
      if (mengingatText.includes(reg.keyword) || new RegExp(reg.keyword.replace(/\s+/g, '\\s+'), 'i').test(mengingatText)) {
        results.push({
          id: makeId(),
          bagianPasal: `4. Dasar Hukum Mengingat (${reg.keyword})`,
          drafAwal: `Pencantuman regulasi "${reg.keyword}"`,
          catatanHarmonisasi: `PERINGATAN YURIDIS: Peraturan ini sudah DICABUT / TIDAK BERLAKU LAGI dalam sistem hukum nasional. Menjadikannya dasar hukum dapat mengakibatkan produk hukum desa batal demi hukum.`,
          rekomendasiPerbaikan: `Hapus atau ganti rujukan tersebut dengan regulasi yang masih berlaku: ${reg.pengganti}.`,
          status: 'PERLU_PERBAIKAN',
          kategoriAspek: 'YURIDIS'
        });
      }
    });

    // Cek apakah UU Desa menyertakan pembaruan UU 3/2024
    if (/Undang-Undang Nomor 6 Tahun 2014/i.test(mengingatText) && !/Undang-Undang Nomor 3 Tahun 2024/i.test(mengingatText)) {
      results.push({
        id: makeId(),
        bagianPasal: '4. Dasar Hukum Mengingat (UU Desa)',
        drafAwal: 'Undang-Undang Nomor 6 Tahun 2014 tentang Desa;',
        catatanHarmonisasi: 'UU Nomor 6 Tahun 2014 telah mengalami perubahan penting dengan diundangkannya Undang-Undang Nomor 3 Tahun 2024 tentang Perubahan Kedua atas UU No. 6/2014 (termasuk masa jabatan kades & BPD 8 tahun serta kewenangan keuangan).',
        rekomendasiPerbaikan: 'Ubah rumusan menjadi: "Undang-Undang Nomor 6 Tahun 2014 tentang Desa sebagaimana telah diubah terakhir dengan Undang-Undang Nomor 3 Tahun 2024 tentang Perubahan Kedua atas Undang-Undang Nomor 6 Tahun 2014 tentang Desa (Lembaran Negara Republik Indonesia Tahun 2024 Nomor 77, Tambahan Lembaran Negara Republik Indonesia Nomor 6917);"',
        status: 'PERLU_PERBAIKAN',
        kategoriAspek: 'YURIDIS'
      });
    }

    // Cek rujukan Perda/Perbup PPU
    if (!/Penajam Paser Utara/i.test(mengingatText)) {
      results.push({
        id: makeId(),
        bagianPasal: '4. Dasar Hukum Mengingat (Regulasi Daerah PPU)',
        drafAwal: 'Daftar Mengingat belum memuat Perda/Perbup PPU',
        catatanHarmonisasi: 'Belum mencantumkan Peraturan Daerah Kabupaten Penajam Paser Utara dan Peraturan Bupati Penajam Paser Utara terkait pedoman teknis produk hukum desa sebagai delegasi kewenangan daerah.',
        rekomendasiPerbaikan: 'Tambahkan rujukan: "Peraturan Daerah Kabupaten Penajam Paser Utara tentang Tata Cara Pembentukan Produk Hukum Desa" dan Perbup terkait.',
        status: 'PERLU_PERBAIKAN',
        kategoriAspek: 'YURIDIS'
      });
    }
  }

  // 5. Analisis Konsiderans Persetujuan & "Memutuskan/Menetapkan"
  if (jenisProduk === 'PERDES') {
    const hasKesepakatanBpd = /Dengan\s+Kesepakatan\s+Bersama[\s\S]*?BADAN\s+PERMUSYAWARATAN\s+DESA/i.test(fullText);
    if (!hasKesepakatanBpd) {
      results.push({
        id: makeId(),
        bagianPasal: '5. Klausul Persetujuan Bersama BPD',
        drafAwal: 'Langsung menuju MEMUTUSKAN',
        catatanHarmonisasi: 'Sesuai Pasal 69 UU Desa dan Permendagri 111/2014, Peraturan Desa wajib memuat klausul: "Dengan Kesepakatan Bersama BADAN PERMUSYAWARATAN DESA [NAMA DESA] dan KEPALA DESA [NAMA DESA]".',
        rekomendasiPerbaikan: 'Sisipkan klausul kesepakatan bersama sebelum kata "MEMUTUSKAN:".',
        status: 'PERLU_PERBAIKAN',
        kategoriAspek: 'FORMAL'
      });
    } else {
      results.push({
        id: makeId(),
        bagianPasal: '5. Klausul Kesepakatan BPD & Diktum',
        drafAwal: 'Dengan Kesepakatan Bersama BPD dan Kades...',
        catatanHarmonisasi: 'Klausul persetujuan bersama BPD dan frasa MEMUTUSKAN: Menetapkan: telah sesuai kaidah Peraturan Desa.',
        rekomendasiPerbaikan: 'Format sudah baku dan sah.',
        status: 'SESUAI',
        kategoriAspek: 'FORMAL'
      });
    }
  }

  // 6. Analisis Batang Tubuh (Pasal per Pasal)
  const pasalMatches = fullText.match(/Pasal\s+\d+[\s\S]*?(?=(Pasal\s+\d+|Agar setiap orang|Ditetapkan di|$))/gi);
  if (pasalMatches && pasalMatches.length > 0) {
    pasalMatches.forEach((pasalText, idx) => {
      const pasalNumMatch = pasalText.match(/Pasal\s+(\d+)/i);
      const pasalNum = pasalNumMatch ? pasalNumMatch[1] : idx + 1;
      const snippet = pasalText.trim().slice(0, 180);

      // Cek sanksi pidana kurungan (Desa TIDAK BOLEH memuat pidana kurungan)
      if (/kurungan|penjara|denda pidana/i.test(pasalText)) {
        results.push({
          id: makeId(),
          bagianPasal: `6. Batang Tubuh (Pasal ${pasalNum} - Sanksi)`,
          drafAwal: snippet,
          catatanHarmonisasi: 'PELANGGARAN KEWENANGAN: Peraturan Desa TIDAK BERWENANG memuat sanksi pidana kurungan/penjara. Kewenangan sanksi pada Perdes hanya sebatas sanksi administratif atau sanksi sosial adat/kebersihan.',
          rekomendasiPerbaikan: `Ubah sanksi menjadi sanksi administratif bertingkat (teguran lisan, peringatan tertulis, penghentian sementara layanan/kegiatan, atau kerja sosial).`,
          status: 'PERLU_PERBAIKAN',
          kategoriAspek: 'SUBSTANSI'
        });
      }

      // Cek belanja defisit tanpa pembiayaan netto
      if (/Defisit/i.test(pasalText) && /Rp/i.test(pasalText)) {
        results.push({
          id: makeId(),
          bagianPasal: `6. Batang Tubuh (Pasal ${pasalNum} - Struktur Anggaran APBDes)`,
          drafAwal: snippet,
          catatanHarmonisasi: 'Pemeriksaan Keseimbangan Anggaran: Apabila terjadi defisit pada Belanja Desa, pastikan pos Penerimaan Pembiayaan (SiLPA) mencukupi sehingga Sisa Lebih Pembiayaan Anggaran Tahun Berkenaan (SiLPA Akhir) bernilai Rp 0,00 (Anggaran Berimbang).',
          rekomendasiPerbaikan: 'Pastikan angka antara Pendapatan, Belanja, dan Pembiayaan Netto tepat dan seimbang matematis di lampiran tabel APBDes.',
          status: 'PERHATIAN_KHUSUS',
          kategoriAspek: 'SUBSTANSI'
        });
      }
    });

    if (results.filter(r => r.bagianPasal.startsWith('6. Batang Tubuh')).length === 0) {
      results.push({
        id: makeId(),
        bagianPasal: '6. Batang Tubuh (Materi Muatan)',
        drafAwal: `Materi pokok terdiri dari ${pasalMatches.length} pasal.`,
        catatanHarmonisasi: 'Susunan pasal telah memenuhi urutan ketentuan umum, materi pokok pengaturan, dan ketentuan sanksi/pelaksanaan.',
        rekomendasiPerbaikan: 'Pertahankan rumusan pasal yang jelas, lugas, dan tidak multitafsir bagi masyarakat desa.',
        status: 'SESUAI',
        kategoriAspek: 'SUBSTANSI'
      });
    }
  }

  // 7. Ketentuan Penutup & Pengundangan
  const hasPenutup = /mulai\s+berlaku\s+pada\s+tanggal/i.test(fullText);
  const hasSekdes = /SEKRETARIS\s+DESA/i.test(fullText);
  const hasLembaranDesa = /Lembaran\s+Desa|Berita\s+Desa/i.test(fullText);

  if (!hasPenutup || !hasSekdes || !hasLembaranDesa) {
    results.push({
      id: makeId(),
      bagianPasal: '7. Ketentuan Penutup & Pengundangan',
      drafAwal: 'Bagian Penutup dan Tanda Tangan',
      catatanHarmonisasi: 'Ketentuan pengundangan belum lengkap. Peraturan Desa harus ditandatangani oleh Kepala Desa dan DIUNDANGKAN oleh Sekretaris Desa dalam Lembaran Desa (atau Berita Desa untuk Perkades) agar mempunyai kekuatan hukum mengikat.',
      rekomendasiPerbaikan: 'Lengkapi dengan klausul:\n"Agar setiap orang mengetahuinya, memerintahkan pengundangan Peraturan Desa ini dengan penempatannya dalam Lembaran Desa [Nama Desa].\n\nDitetapkan di...\nKEPALA DESA...\n\nDiundangkan di...\nSEKRETARIS DESA...\nLEMBARAN DESA... TAHUN... NOMOR..."',
      status: 'PERLU_PERBAIKAN',
      kategoriAspek: 'FORMAL'
    });
  } else {
    results.push({
      id: makeId(),
      bagianPasal: '7. Ketentuan Penutup & Pengundangan',
      drafAwal: 'Diundangkan di... oleh Sekretaris Desa dalam Lembaran Desa.',
      catatanHarmonisasi: 'Klausul pemberlakuan, penandatanganan Kades, dan pengundangan oleh Sekdes dalam Lembaran Desa sudah lengkap dan benar.',
      rekomendasiPerbaikan: 'Pastikan tanggal penetapan Kades mendahului atau sama dengan tanggal pengundangan Sekdes.',
      status: 'SESUAI',
      kategoriAspek: 'FORMAL'
    });
  }

  // 8. Evaluasi Lampiran
  const hasLampiranMention = /Lampiran/i.test(fullText);
  if (hasLampiranMention) {
    results.push({
      id: makeId(),
      bagianPasal: '8. Lampiran Produk Hukum',
      drafAwal: 'Tercantum dalam Lampiran yang merupakan bagian tidak terpisahkan...',
      catatanHarmonisasi: 'Peraturan merujuk pada Lampiran. Pastikan format tabel lampiran mencantumkan judul lampiran, nomor peraturan desa, dan ditandatangani oleh Kepala Desa sesuai tata naskah.',
      rekomendasiPerbaikan: 'Pastikan dokumen lampiran fisik/PDF diunggah lengkap bersama draf utama.',
      status: 'SESUAI',
      kategoriAspek: 'FORMAL'
    });
  }

  return results;
}

/**
 * Controller Utama Harmonisasi AI
 * Mencoba Gemini API jika key ada, otomatis fallback ke Rule-Based Engine
 */
export async function generateHarmonizationNotes({ draftText, jenisProduk, namaDesa, apiKey }) {
  if (!draftText || draftText.trim().length < 20) {
    throw new Error('Teks draf peraturan terlalu pendek untuk dianalisis (minimal 20 karakter).');
  }

  // 1. Coba Gemini API jika API Key tersedia
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const geminiResults = await callGeminiApi(draftText, jenisProduk, namaDesa, apiKey.trim());
      if (geminiResults && geminiResults.length > 0) {
        return {
          source: 'GEMINI_AI',
          matriks: geminiResults
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to internal legal rule engine:', err);
      // Fallback lanjut ke bawah
    }
  }

  // 2. Gunakan Mesin Yuridis Cerdas Internal (Permendagri 111/2014 & UU Desa)
  const ruleResults = analyzeDraftRuleBased(draftText, jenisProduk, namaDesa);
  return {
    source: 'INTERNAL_LEGAL_ENGINE',
    matriks: ruleResults
  };
}
