import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DocumentList from './components/DocumentList';
import DocumentDetail from './components/DocumentDetail';
import DocumentSubmissionModal from './components/DocumentSubmissionModal';
import AiHarmonizerModal from './components/AiHarmonizerModal';
import PrintDocumentModal from './components/PrintDocumentModal';
import BpdReviewModal from './components/BpdReviewModal';
import RegistrationModal from './components/RegistrationModal';
import RevisionSubmissionModal from './components/RevisionSubmissionModal';
import GoogleAppsScriptModal from './components/GoogleAppsScriptModal';
import SettingsModal from './components/SettingsModal';
import { storageService } from './services/storageService';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [currentRole, setCurrentRole] = useState(storageService.getCurrentRole());
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'documents' | 'detail'
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentListFilters, setDocumentListFilters] = useState({});

  // Modals
  const [isNewDraftModalOpen, setIsNewDraftModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTargetDoc, setAiTargetDoc] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetDoc, setPrintTargetDoc] = useState(null);
  const [isBpdModalOpen, setIsBpdModalOpen] = useState(false);
  const [bpdTargetDoc, setBpdTargetDoc] = useState(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regTargetDoc, setRegTargetDoc] = useState(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionTargetDoc, setRevisionTargetDoc] = useState(null);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  useEffect(() => {
    const loadedDocs = storageService.getDocuments();
    setDocuments(loadedDocs);
  }, []);

  const handleRoleChange = (newRoleState) => {
    setCurrentRole(newRoleState);
    storageService.saveCurrentRole(newRoleState);
    showToast(`Beralih peran ke: ${newRoleState.userJabatan || newRoleState.desaNama || 'Kecamatan Waru'}`, 'info');
  };

  const handleSelectDocument = (doc) => {
    // Refresh latest version
    const latest = documents.find(d => d.id === doc.id) || doc;
    setSelectedDocument(latest);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateDocument = (docData) => {
    const created = storageService.addDocument(docData, currentRole.userNama);
    setDocuments(storageService.getDocuments());
    setSelectedDocument(created);
    setActiveTab('detail');
    showToast(`Draf ${created.jenis} (${created.id}) berhasil diajukan dan disimpan di Google Drive!`, 'success');
  };

  const handleUpdateDocument = (id, updates, activityText = '') => {
    const updated = storageService.updateDocument(
      id,
      updates,
      currentRole.userNama,
      currentRole.role,
      activityText
    );
    const refreshed = storageService.getDocuments();
    setDocuments(refreshed);
    if (selectedDocument && selectedDocument.id === id) {
      setSelectedDocument(updated);
    }
    showToast(activityText || 'Dokumen berhasil diperbarui!', 'success');
    return updated;
  };

  const handleApplyAiMatrix = (docId, newMatrix) => {
    const updated = handleUpdateDocument(
      docId,
      { 
        matriksEvaluasi: newMatrix,
        status: 'EVALUASI_KECAMATAN'
      },
      'AI Generator Harmonisasi menghasilkan catatan telaah dan matriks evaluasi baru.'
    );
    showToast(`Matriks Harmonisasi AI (${newMatrix.length} butir) berhasil diterapkan!`, 'success');
  };

  const handleResetData = () => {
    const initial = storageService.resetToInitialData();
    setDocuments(initial);
    setSelectedDocument(null);
    setActiveTab('dashboard');
    showToast('Seluruh data berhasil dikembalikan ke data contoh bawaan!', 'info');
  };

  // Shortcut Modals
  const handleOpenAiForDoc = (doc) => {
    setAiTargetDoc(doc);
    setIsAiModalOpen(true);
  };

  const handleOpenPrintForDoc = (doc) => {
    setPrintTargetDoc(doc);
    setIsPrintModalOpen(true);
  };

  const handleOpenBpdReviewForDoc = (doc) => {
    setBpdTargetDoc(doc);
    setIsBpdModalOpen(true);
  };

  const handleOpenRegForDoc = (doc) => {
    setRegTargetDoc(doc);
    setIsRegModalOpen(true);
  };

  const handleOpenRevisionForDoc = (doc) => {
    setRevisionTargetDoc(doc);
    setIsRevisionModalOpen(true);
  };

  const handleNavigateToDocuments = (filters = {}) => {
    setDocumentListFilters(filters);
    setActiveTab('documents');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPending = documents.filter(d => d.status !== 'SELESAI_TEREGISTRASI').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-700'
              : toast.type === 'info'
              ? 'bg-govnavy-900 text-slate-100 border-slate-700'
              : 'bg-rose-950 text-rose-100 border-rose-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewDraft={() => setIsNewDraftModalOpen(true)}
        onOpenAiGenerator={() => {
          setAiTargetDoc(selectedDocument || documents[0]);
          setIsAiModalOpen(true);
        }}
        onOpenGoogleAppsScript={() => setIsGasModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onResetData={handleResetData}
        totalPendingCount={totalPending}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex-1 w-full">
        {activeTab === 'dashboard' && (
          <Dashboard
            documents={documents}
            currentRole={currentRole}
            onSelectDocument={handleSelectDocument}
            onOpenNewDraft={() => setIsNewDraftModalOpen(true)}
            onOpenAiGenerator={() => {
              setAiTargetDoc(documents[0]);
              setIsAiModalOpen(true);
            }}
            onNavigateToDocuments={handleNavigateToDocuments}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentList
            documents={documents}
            currentRole={currentRole}
            onSelectDocument={handleSelectDocument}
            onOpenNewDraft={() => setIsNewDraftModalOpen(true)}
            onOpenAiForDoc={handleOpenAiForDoc}
            onOpenPrintForDoc={handleOpenPrintForDoc}
            initialFilters={documentListFilters}
          />
        )}

        {activeTab === 'detail' && selectedDocument && (
          <DocumentDetail
            document={selectedDocument}
            currentRole={currentRole}
            onBack={() => setActiveTab('documents')}
            onOpenAiGenerator={handleOpenAiForDoc}
            onOpenPrint={handleOpenPrintForDoc}
            onOpenBpdReview={handleOpenBpdReviewForDoc}
            onOpenRegistration={handleOpenRegForDoc}
            onOpenRevisionModal={handleOpenRevisionForDoc}
            onUpdateDocument={handleUpdateDocument}
          />
        )}
      </main>

      {/* Footer Instansi Resmi */}
      <footer className="bg-govnavy-950 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-200">
              SI HARMONISASI KECAMATAN WARU
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sistem Informasi Harmonisasi & Evaluasi Produk Hukum Desa &bull; Permendagri No. 111 Tahun 2014
            </p>
            <p className="text-[11px] text-slate-500">
              Pemerintah Kabupaten Penajam Paser Utara &bull; Email: <span className="text-emerald-400">waruppusigap@gmail.com</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button onClick={() => setIsGasModalOpen(true)} className="hover:text-emerald-300">
              Google Drive & Sheet Setup
            </button>
            <span>&bull;</span>
            <button onClick={() => setIsSettingsModalOpen(true)} className="hover:text-slate-200">
              Pengaturan & API Gemini
            </button>
            <span>&bull;</span>
            <button onClick={handleResetData} className="hover:text-slate-200">
              Reset Data Contoh
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* Modal 1: Pengajuan Draf Baru Pemdes */}
      {isNewDraftModalOpen && (
        <DocumentSubmissionModal
          currentRole={currentRole}
          onClose={() => setIsNewDraftModalOpen(false)}
          onSubmitSuccess={handleCreateDocument}
        />
      )}

      {/* Modal 2: AI Generator Harmonisasi Kecamatan */}
      {isAiModalOpen && (
        <AiHarmonizerModal
          document={aiTargetDoc || selectedDocument || documents[0]}
          documents={documents}
          onClose={() => setIsAiModalOpen(false)}
          onApplyMatrixToDoc={handleApplyAiMatrix}
          onOpenSettings={() => {
            setIsAiModalOpen(false);
            setIsSettingsModalOpen(true);
          }}
        />
      )}

      {/* Modal 3: Cetak Dokumen Resmi Kop Surat Waru */}
      {isPrintModalOpen && (
        <PrintDocumentModal
          document={printTargetDoc || selectedDocument || documents[0]}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Modal 4: Review Musyawarah BPD */}
      {isBpdModalOpen && (
        <BpdReviewModal
          document={bpdTargetDoc || selectedDocument}
          currentRole={currentRole}
          onClose={() => setIsBpdModalOpen(false)}
          onUpdateDocument={handleUpdateDocument}
        />
      )}

      {/* Modal 5: Penerbitan Nomor Registrasi */}
      {isRegModalOpen && (
        <RegistrationModal
          document={regTargetDoc || selectedDocument}
          onClose={() => setIsRegModalOpen(false)}
          onUpdateDocument={handleUpdateDocument}
        />
      )}

      {/* Modal 6: Unggah Draf Revisi Desa */}
      {isRevisionModalOpen && (
        <RevisionSubmissionModal
          document={revisionTargetDoc || selectedDocument}
          onClose={() => setIsRevisionModalOpen(false)}
          onUpdateDocument={handleUpdateDocument}
        />
      )}

      {/* Modal 7: Setup Google Apps Script / Drive waruppusigap@gmail.com */}
      {isGasModalOpen && (
        <GoogleAppsScriptModal
          onClose={() => setIsGasModalOpen(false)}
        />
      )}

      {/* Modal 8: Pengaturan Aplikasi */}
      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onResetData={handleResetData}
        />
      )}

    </div>
  );
}
