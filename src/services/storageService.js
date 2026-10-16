/**
 * Layanan Penyimpanan Lokal & Manajemen Data State Aplikasi
 */

import { INITIAL_DOCUMENTS } from '../data/seedData';
import { DESA_LIST, KECAMATAN_INFO } from '../data/legalReferences';
import { googleSheetService } from './googleSheetService';

const STORAGE_KEY_DOCS = 'waru_harmonisasi_documents_v1';
const STORAGE_KEY_ROLE = 'waru_harmonisasi_active_role_v1';
const STORAGE_KEY_SETTINGS = 'waru_harmonisasi_settings_v1';
const STORAGE_KEY_CLEAN_SLATE = 'waru_clean_slate_active_v1';

export const storageService = {
  getDocuments() {
    try {
      const isCleanSlate = localStorage.getItem(STORAGE_KEY_CLEAN_SLATE) === 'true';
      const data = localStorage.getItem(STORAGE_KEY_DOCS);
      
      // Jika data sudah tersimpan di localStorage (termasuk array kosong '[]')
      if (data !== null) {
        return JSON.parse(data);
      }
      
      // Jika belum ada data dan pengguna berada dalam mode clean slate (produksi bersih)
      if (isCleanSlate) {
        return [];
      }

      // Default awal (pertama kali dibuka sebelum dikosongkan): gunakan INITIAL_DOCUMENTS
      this.saveDocuments(INITIAL_DOCUMENTS);
      return INITIAL_DOCUMENTS;
    } catch (err) {
      console.error('Error reading documents from localStorage:', err);
      return [];
    }
  },

  saveDocuments(docs) {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs || []));
    } catch (err) {
      console.error('Error saving documents to localStorage:', err);
    }
  },

  /**
   * Mengosongkan seluruh database lokal (Clean Slate) agar siap untuk input data asli desa
   */
  clearAllDocuments() {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_CLEAN_SLATE, 'true');
    } catch (e) {
      console.error('Error clearing documents:', e);
    }
    return [];
  },

  resetToInitialData() {
    try {
      localStorage.removeItem(STORAGE_KEY_CLEAN_SLATE);
      this.saveDocuments(INITIAL_DOCUMENTS);
    } catch (e) {
      console.error('Error resetting documents:', e);
    }
    return INITIAL_DOCUMENTS;
  },

  /**
   * Mengambil data terpusat dari Google Spreadsheet secara otomatis
   */
  async fetchCentralData() {
    try {
      const centralDocs = await googleSheetService.fetchAllDocuments();
      if (centralDocs !== null && Array.isArray(centralDocs)) {
        // Jika dari Google Sheet datanya kosong [] (karena user sudah menghapus seluruh baris data di spreadsheet),
        // maka aplikasi HARUS mengikuti kondisi Google Sheet (menjadi kosong juga)!
        this.saveDocuments(centralDocs);
        if (centralDocs.length === 0) {
          localStorage.setItem(STORAGE_KEY_CLEAN_SLATE, 'true');
        }
        return { success: true, documents: centralDocs, fromCloud: true };
      }
    } catch (err) {
      console.warn('Central data fetch fallback to local:', err);
    }
    return { success: false, documents: this.getDocuments(), fromCloud: false };
  },

  getDocumentById(id) {
    const docs = this.getDocuments();
    return docs.find(d => d.id === id) || null;
  },

  addDocument(docData, creator = 'Pemdes') {
    const docs = this.getDocuments();
    const newId = `DOC-${new Date().getFullYear()}-${String(docs.length + 1).padStart(3, '0')}`;
    
    // Hitung SLA (20 hari kerja)
    const today = new Date();
    const slaDeadline = new Date(today);
    slaDeadline.setDate(today.getDate() + 28); // Kurang lebih 20 hari kerja
    const slaString = slaDeadline.toISOString().split('T')[0];

    const newDoc = {
      ...docData,
      id: newId,
      nomorRegistrasi: '',
      tanggalPengajuan: today.toISOString().split('T')[0],
      slaDeadline: slaString,
      slaDaysRemaining: 20,
      slaStatus: 'AMAN',
      status: docData.status || (docData.jenis === 'PERDES' ? 'PEMBAHASAN_BPD' : 'VERIFIKASI_KECAMATAN'),
      riwayatAktivitas: [
        {
          waktu: new Date().toLocaleString('id-ID'),
          aktor: creator,
          role: 'PEMDES',
          aksi: `Pengajuan awal draf ${docData.jenis} berhasil dibuat.`
        }
      ]
    };

    const updated = [newDoc, ...docs];
    this.saveDocuments(updated);
    
    // Auto-sync ke Google Sheet
    googleSheetService.syncSubmissionToSheet(newDoc, creator, 'PEMDES');

    return newDoc;
  },

  updateDocument(id, updates, actor = 'Sistem', role = 'KECAMATAN', activityText = '') {
    const docs = this.getDocuments();
    let updatedDoc = null;

    const newDocs = docs.map(doc => {
      if (doc.id === id) {
        const history = [...(doc.riwayatAktivitas || [])];
        if (activityText) {
          history.push({
            waktu: new Date().toLocaleString('id-ID'),
            aktor: actor,
            role: role,
            aksi: activityText
          });
        }
        updatedDoc = {
          ...doc,
          ...updates,
          riwayatAktivitas: history
        };
        return updatedDoc;
      }
      return doc;
    });

    this.saveDocuments(newDocs);

    if (updatedDoc) {
      googleSheetService.syncSubmissionToSheet(updatedDoc, actor, role);
    }

    return updatedDoc;
  },

  // Auth / Role Simulation
  getCurrentRole() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ROLE);
      if (data) return JSON.parse(data);
    } catch (e) {}

    // Default: Tim Kecamatan Waru
    return {
      role: 'KECAMATAN', // 'PEMDES' | 'BPD' | 'KECAMATAN'
      desaId: 'desa-bangun-mulya',
      desaNama: 'Desa Bangun Mulya',
      userNama: 'Tim Harmonisasi & Evaluasi Kecamatan Waru',
      userJabatan: 'Seksi Pemerintahan & Tim Perancang Perda'
    };
  },

  saveCurrentRole(roleState) {
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, JSON.stringify(roleState));
    } catch (e) {}
  },

  // Settings
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {}

    return {
      geminiApiKey: '',
      gasWebhookUrl: localStorage.getItem('waru_gas_webhook_url') || '',
      autoSyncGoogle: true,
      googleEmail: 'waruppusigap@gmail.com'
    };
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      if (settings.gasWebhookUrl !== undefined) {
        googleSheetService.setWebhookUrl(settings.gasWebhookUrl);
      }
    } catch (e) {}
  }
};
