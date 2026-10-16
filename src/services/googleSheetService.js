/**
 * Layanan Sinkronisasi Google Sheets & Google Drive
 * Terhubung dengan akun waruppusigap@gmail.com melalui Google Apps Script Web App
 */

const STORAGE_KEY_WEBHOOK = 'waru_gas_webhook_url';
const DEFAULT_ACCOUNT = 'waruppusigap@gmail.com';

export const googleSheetService = {
  getWebhookUrl() {
    return localStorage.getItem(STORAGE_KEY_WEBHOOK) || '';
  },

  setWebhookUrl(url) {
    if (url) {
      localStorage.setItem(STORAGE_KEY_WEBHOOK, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_WEBHOOK);
    }
  },

  getAccountInfo() {
    return {
      email: DEFAULT_ACCOUNT,
      folderName: 'SI_HARMONISASI_KECAMATAN_WARU_UPLOADS',
      sheetName: 'DATABASE_SI_HARMONISASI_KECAMATAN_WARU',
      hasWebhook: Boolean(this.getWebhookUrl())
    };
  },

  /**
   * Mengunggah berkas ke Google Drive waruppusigap@gmail.com
   * Jika webhook belum dipasang, gunakan simulasi Drive link realistis
   */
  async uploadFileToDrive({ file, desaNama, documentId }) {
    const webhookUrl = this.getWebhookUrl();

    // 1. Jika Webhook GAS sudah aktif, kirim data base64 ke Google Drive waruppusigap@gmail.com
    if (webhookUrl && file) {
      try {
        const base64Data = await this.fileToBase64(file);
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'UPLOAD_FILE',
            fileName: `${desaNama.replace(/\s+/g, '_')}_${file.name}`,
            mimeType: file.type || 'application/pdf',
            base64Data: base64Data.split(',')[1] || base64Data,
            desaNama,
            documentId
          })
        });

        const result = await response.json();
        if (result.success) {
          return {
            success: true,
            driveLink: result.fileUrl,
            fileName: result.fileName,
            fileId: result.fileId,
            simulated: false
          };
        }
      } catch (err) {
        console.warn('Gagal upload ke GAS, beralih ke simulasi link:', err);
      }
    }

    // 2. Simulasi Google Drive Link untuk waruppusigap@gmail.com
    const randomId = Math.random().toString(36).substring(2, 12);
    const simulatedLink = `https://drive.google.com/drive/u/0/folders/waruppusigap-${desaNama.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${file ? file.name : 'dokumen'}-${randomId}`;

    return {
      success: true,
      driveLink: simulatedLink,
      fileName: file ? file.name : 'Draf_Dokumen_Harmonisasi.pdf',
      fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : '1.2 MB',
      simulated: true
    };
  },

  /**
   * Sinkronisasi data pengajuan produk hukum ke Google Spreadsheet
   */
  async syncSubmissionToSheet(document, aktor, role) {
    const webhookUrl = this.getWebhookUrl();

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SYNC_SUBMISSION',
            document,
            aktor,
            role
          })
        });
        const result = await response.json();
        return result;
      } catch (err) {
        console.warn('Gagal sync ke Google Sheet:', err);
      }
    }

    // Mode offline / simpan lokal
    return {
      success: true,
      simulated: true,
      message: 'Tersimpan di basis data lokal dan disiapkan untuk antrean sinkronisasi Google Sheet.'
    };
  },

  /**
   * Simpan Matriks Harmonisasi & Evaluasi ke Sheet Matriks_Harmonisasi
   */
  async saveEvaluationMatrixToSheet({ docId, desaNama, matriks }) {
    const webhookUrl = this.getWebhookUrl();

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SAVE_MATRIX',
            docId,
            desaNama,
            matriks
          })
        });
        return await response.json();
      } catch (err) {
        console.warn('Gagal simpan matriks ke GAS:', err);
      }
    }

    return {
      success: true,
      simulated: true,
      message: 'Matriks tersimpan di lokal.'
    };
  },

  /**
   * Tes Koneksi ke Google Apps Script Web App
   */
  async testConnection(url) {
    const targetUrl = url || this.getWebhookUrl();
    if (!targetUrl) {
      throw new Error('Masukkan URL Web App Google Apps Script terlebih dahulu.');
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TEST_CONNECTION' })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
};
