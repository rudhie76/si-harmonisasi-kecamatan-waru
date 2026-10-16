import React from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  PlusCircle, 
  FolderSync, 
  Settings, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Scale, 
  LayoutDashboard, 
  Bookmark, 
  FileCode,
  X,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { DESA_LIST } from '../data/legalReferences';

export default function Sidebar({
  currentRole,
  activeTab,
  setActiveTab,
  onOpenNewDraft,
  onOpenAiGenerator,
  onOpenGoogleAppsScript,
  onOpenSettings,
  onResetData,
  onClearAllData,
  totalPendingCount,
  onNavigateToDocuments,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onOpenRoleMenu
}) {
  const getRoleBadge = () => {
    if (currentRole.role === 'KECAMATAN') {
      return {
        label: 'Kecamatan Waru',
        desc: 'Verifikator & Tim Evaluasi',
        color: 'bg-emerald-600 text-white',
        icon: Building2
      };
    }
    if (currentRole.role === 'BPD') {
      return {
        label: `BPD ${currentRole.desaNama.replace('Desa ', '')}`,
        desc: 'Musyawarah & Persetujuan',
        color: 'bg-amber-600 text-white',
        icon: Users
      };
    }
    return {
      label: `Pemdes ${currentRole.desaNama.replace('Desa ', '')}`,
      desc: 'Pengusul & Pembuat Draf',
      color: 'bg-blue-600 text-white',
      icon: ShieldCheck
    };
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;

  const handleNavClick = (tab, filters = null) => {
    if (filters) {
      onNavigateToDocuments(filters);
    } else {
      setActiveTab(tab);
    }
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-govnavy-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Brand & Toggle Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-govnavy-950 flex-shrink-0">
          <div 
            onClick={() => handleNavClick('dashboard')} 
            className="flex items-center space-x-3 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30 flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                    SI HARMONISASI
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    WARU
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Kab. Penajam Paser Utara
                </p>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse/Expand Toggle on Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Tampilkan Menu Penuh" : "Kecilkan Menu (Hide Samping)"}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Card */}
        {(!isCollapsed || isMobileOpen) ? (
          <div className="p-3 m-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className={`p-2 rounded-lg ${roleInfo.color} flex-shrink-0 shadow-sm`}>
                <RoleIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {roleInfo.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {roleInfo.desc}
                </div>
              </div>
            </div>
            <button
              onClick={onOpenRoleMenu}
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-slate-900 border border-slate-700 hover:border-emerald-500/50 transition-colors whitespace-nowrap flex-shrink-0"
              title="Ganti Peran Pengguna"
            >
              Ganti
            </button>
          </div>
        ) : (
          <div className="py-3 flex justify-center border-b border-slate-800">
            <button
              onClick={onOpenRoleMenu}
              title={`Peran Aktif: ${roleInfo.label} (Klik untuk Ganti Peran)`}
              className={`p-2 rounded-xl ${roleInfo.color} shadow-md transition-transform hover:scale-105`}
            >
              <RoleIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin">
          
          {/* Menu Utama */}
          <div className="space-y-1">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Menu Utama
              </div>
            )}

            <button
              onClick={() => handleNavClick('dashboard')}
              title="Dashboard Analitik"
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>Dashboard Analitik</span>}
            </button>

            <button
              onClick={() => handleNavClick('documents')}
              title="Daftar Produk Hukum"
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'documents'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <FileText className="w-4 h-4 flex-shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span className="truncate">Daftar Produk Hukum</span>}
              </div>
              {(!isCollapsed || isMobileOpen) && totalPendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-govnavy-950 font-extrabold text-[10px]">
                  {totalPendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Kategori Permendagri 111/2014 */}
          <div className="space-y-1">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Jalur Permendagri 111
              </div>
            )}

            <button
              onClick={() => handleNavClick('documents', { jalur: 'EVALUASI' })}
              title="Jalur Evaluasi (APBDes, Pungutan, Tata Ruang, SOTK)"
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-purple-300 hover:bg-purple-950/40 transition-colors ${
                isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
              }`}
            >
              <Bookmark className="w-4 h-4 text-purple-400 flex-shrink-0" />
              {(!isCollapsed || isMobileOpen) && (
                <div className="text-left">
                  <div className="font-semibold">Jalur Evaluasi</div>
                  <div className="text-[10px] text-slate-500">Sebelum Ditetapkan</div>
                </div>
              )}
            </button>

            <button
              onClick={() => handleNavClick('documents', { jalur: 'KLARIFIKASI' })}
              title="Jalur Klarifikasi (Perdes lainnya, Perkades & SK)"
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-sky-300 hover:bg-sky-950/40 transition-colors ${
                isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
              }`}
            >
              <FileCode className="w-4 h-4 text-sky-400 flex-shrink-0" />
              {(!isCollapsed || isMobileOpen) && (
                <div className="text-left">
                  <div className="font-semibold">Jalur Klarifikasi</div>
                  <div className="text-[10px] text-slate-500">Setelah Ditetapkan</div>
                </div>
              )}
            </button>
          </div>

          {/* Tombol Aksi Cepat Sesuai Role */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {currentRole.role === 'PEMDES' && (
              <button
                onClick={() => {
                  onOpenNewDraft();
                  setIsMobileOpen(false);
                }}
                title="Ajukan Draf Produk Hukum Baru"
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950/40 ${
                  isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
                }`}
              >
                <PlusCircle className="w-4 h-4 flex-shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>+ Ajukan Draf Baru</span>}
              </button>
            )}

            {currentRole.role === 'BPD' && (
              <button
                onClick={() => {
                  onOpenNewDraft();
                  setIsMobileOpen(false);
                }}
                title="Ajukan Raperdes Inisiatif BPD (Pasal 6-8 Permendagri 111/2014)"
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-md shadow-amber-950/40 ${
                  isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
                }`}
              >
                <PlusCircle className="w-4 h-4 flex-shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>+ Usul Inisiatif BPD</span>}
              </button>
            )}

            {currentRole.role === 'KECAMATAN' && (
              <button
                onClick={() => {
                  onOpenAiGenerator();
                  setIsMobileOpen(false);
                }}
                title="Buka AI Generator Harmonisasi Kecamatan"
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-950/40 border border-indigo-400/30 ${
                  isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse flex-shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>AI Harmonisasi</span>}
              </button>
            )}
          </div>

          {/* Integrasi & Pengaturan */}
          <div className="space-y-1 pt-2 border-t border-slate-800">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Integrasi Cloud & Sistem
              </div>
            )}

            <button
              onClick={() => {
                onOpenGoogleAppsScript();
                setIsMobileOpen(false);
              }}
              title="Google Drive & Sheet (waruppusigap@gmail.com)"
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-emerald-300 hover:bg-slate-800 transition-colors ${
                isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
              }`}
            >
              <FolderSync className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              {(!isCollapsed || isMobileOpen) && (
                <div className="text-left truncate">
                  <div className="font-semibold text-slate-200">Google Drive & Sheet</div>
                  <div className="text-[10px] text-emerald-400 truncate">waruppusigap@gmail.com</div>
                </div>
              )}
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setIsMobileOpen(false);
              }}
              title="Pengaturan & Gemini API"
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${
                isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>Pengaturan & Gemini API</span>}
            </button>

            <button
              onClick={() => {
                if (confirm('Kosongkan seluruh data draf bawaan?\n\nAplikasi akan bersih (0 dokumen) sehingga Anda siap menginput data yang sebenarnya dari desa.')) {
                  onClearAllData();
                  setIsMobileOpen(false);
                }
              }}
              title="Kosongkan Database (Siap Input Data Asli)"
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors ${
                isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
              }`}
            >
              <Trash2 className="w-4 h-4 flex-shrink-0 text-rose-500" />
              {(!isCollapsed || isMobileOpen) && <span>Kosongkan Data (Input Asli)</span>}
            </button>

            <button
              onClick={() => {
                onResetData();
                setIsMobileOpen(false);
              }}
              title="Reset Data ke Contoh Bawaan (Demo)"
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
                isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
              }`}
            >
              <RotateCcw className="w-4 h-4 flex-shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>Reset Data Contoh</span>}
            </button>
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-govnavy-950 flex-shrink-0">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <div>
                <span className="font-bold text-slate-400">Kec. Waru</span> &bull; v1.2
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:flex items-center space-x-1 text-slate-400 hover:text-white text-[10px] px-2 py-1 rounded hover:bg-slate-800"
                title="Sembunyikan menu ke samping"
              >
                <span>Hide</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Buka Menu Penuh"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
