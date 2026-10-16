import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
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

  // Sidebar Hide/Unhide State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('waru_sidebar_collapsed') === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

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
    // 1. Muat instan dari cache lokal/seed data (0.01 detik)
    const loadedDocs = storageService.getDocuments();
    setDocuments(loadedDocs);

    // 2. Otomatis cek & tarik data terpusat dari Google Sheet tanpa perlu klik tombol apa pun!
    storageService.fetchCentralData().then(result => {
      if (result.fromCloud && Array.isArray(result.documents)) {
        setDocuments(result.documents);
        if (result.documents.length > 0) {
          showToast(`Tersinkronisasi otomatis dengan Google Sheet (${result.documents.length} dokumen)`, 'success');
        } else {
          showToast('Database Google Sheet terhubung dalam kondisi bersih (Siap input data asli)', 'info');
        }
      }
    });
  }, []);

  const handleClearAllData = async () => {
    const emptyDocs = storageService.clearAllDocuments();
    setDocuments(emptyDocs);
    setSelectedDocument(null);
    setActiveTab('dashboard');
    showToast('Database berhasil dikosongkan! Sistem siap menerima pengajuan resmi.', 'success');

    try {
      await googleSheetService.clearAllSpreadsheetData();
    } catch (e) {
      console.warn('Gagal membersihkan spreadsheet via GAS:', e);
    }
  };

  const handleToggleSidebar = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem('waru_sidebar_collapsed', String(collapsed));
  };

  const handleRoleChange = (newRoleState) => {
    setCurrentRole(newRoleState);
    storageService.saveCurrentRole(newRoleState);
    showToast(`Beralih peran ke: ${newRoleState.userJabatan || newRoleState.desaNama || 'Kecamatan Waru'}`, 'info');
  };

  const handleSelectDocument = (doc) => {
    const latest = documents.find(d => d.id === doc.id) || doc;
    setSelectedDocument(latest);
    setActiveTab('detail');
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
  };

  const totalPending = documents.filter(d => d.status !== 'SELESAI_TEREGISTRASI').length;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      
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

      {/* 1. Sidebar Navigasi Samping Profesional (Collapsible Hide/Unhide) */}
      <Sidebar
        currentRole={currentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewDraft={() => setIsNewDraftModalOpen(true)}
        onOpenAiGenerator={() => {
          setAiTargetDoc(selectedDocument || documents[0] || null);
          setIsAiModalOpen(true);
        }}
        onOpenGoogleAppsScript={() => setIsGasModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onResetData={handleResetData}
        onClearAllData={handleClearAllData}
        totalPendingCount={totalPending}
        onNavigateToDocuments={handleNavigateToDocuments}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleToggleSidebar}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        onOpenRoleMenu={() => setIsRoleMenuOpen(true)}
      />

      {/* 2. Area Konten Utama */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        
        {/* Top Header App Bar */}
        <Header
          currentRole={currentRole}
          setCurrentRole={handleRoleChange}
          activeTab={activeTab}
          selectedDocument={selectedDocument}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={handleToggleSidebar}
          setIsMobileOpen={setIsMobileMenuOpen}
          onOpenGoogleAppsScript={() => setIsGasModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onResetData={handleResetData}
          onClearAllData={handleClearAllData}
          isRoleMenuOpen={isRoleMenuOpen}
          setIsRoleMenuOpen={setIsRoleMenuOpen}
        />

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
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
          </div>
        </main>
      </div>

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
          documents={documents}
          onClose={() => setIsGasModalOpen(false)}
          onClearAllData={handleClearAllData}
        />
      )}

      {/* Modal 8: Pengaturan Aplikasi */}
      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onResetData={handleResetData}
          onClearAllData={handleClearAllData}
        />
      )}

    </div>
  );
}
