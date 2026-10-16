import React, { useState } from 'react';
import { 
  Menu, 
  ChevronDown, 
  Building2, 
  Users, 
  ShieldCheck, 
  FolderSync, 
  Settings, 
  Sparkles, 
  PanelLeftClose, 
  PanelLeftOpen,
  RotateCcw
} from 'lucide-react';
import { DESA_LIST, KECAMATAN_INFO } from '../data/legalReferences';

export default function Header({
  currentRole,
  setCurrentRole,
  activeTab,
  selectedDocument,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  setIsMobileOpen,
  onOpenGoogleAppsScript,
  onOpenSettings,
  onResetData,
  isRoleMenuOpen,
  setIsRoleMenuOpen
}) {
  const handleSelectRole = (role, desaId = null) => {
    let newRoleState = { ...currentRole, role };

    if (role === 'KECAMATAN') {
      newRoleState = {
        role: 'KECAMATAN',
        desaId: null,
        desaNama: 'Pemerintah Kecamatan Waru',
        userNama: 'Tim Harmonisasi & Evaluasi Kecamatan Waru',
        userJabatan: 'Seksi Pemerintahan & Tim Evaluasi Hukum'
      };
    } else {
      const selectedDesa = DESA_LIST.find(d => d.id === (desaId || currentRole.desaId)) || DESA_LIST[0];
      if (role === 'PEMDES') {
        newRoleState = {
          role: 'PEMDES',
          desaId: selectedDesa.id,
          desaNama: selectedDesa.nama,
          userNama: `${selectedDesa.kades} (Kepala Desa)`,
          userJabatan: `Pemerintah ${selectedDesa.nama}`
        };
      } else if (role === 'BPD') {
        newRoleState = {
          role: 'BPD',
          desaId: selectedDesa.id,
          desaNama: selectedDesa.nama,
          userNama: `${selectedDesa.ketuaBpd} (Ketua BPD)`,
          userJabatan: `Badan Permusyawaratan Desa ${selectedDesa.nama}`
        };
      }
    }

    setCurrentRole(newRoleState);
    setIsRoleMenuOpen(false);
  };

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

  const getBreadcrumbTitle = () => {
    if (activeTab === 'dashboard') return 'Dashboard Analitik';
    if (activeTab === 'documents') return 'Daftar Produk Hukum Desa';
    if (activeTab === 'detail') return `Detail: ${selectedDocument?.id || 'Dokumen'}`;
    return 'SI Harmonisasi';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 flex-shrink-0">
      
      {/* Kiri: Toggle Sidebar & Breadcrumb Page Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title="Buka Menu Samping"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Hide/Unhide Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex items-center space-x-1.5 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title={isSidebarCollapsed ? "Tampilkan Menu Samping (Unhide)" : "Sembunyikan Menu Samping (Hide)"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-emerald-600" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-500" />
          )}
          <span className="text-xs font-semibold text-slate-600">
            {isSidebarCollapsed ? "Buka Menu" : "Tutup Menu"}
          </span>
        </button>

        {/* Separator */}
        <span className="hidden sm:inline text-slate-300">|</span>

        {/* Breadcrumb / Title */}
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">
            Kecamatan Waru &bull; Penajam Paser Utara
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-800 truncate">
            {getBreadcrumbTitle()}
          </h2>
        </div>
      </div>

      {/* Kanan: Google Drive Badge, Role Switcher, Settings */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Google Drive Status Pill */}
        <button
          onClick={onOpenGoogleAppsScript}
          title="Tersinkronisasi ke Google Drive waruppusigap@gmail.com"
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium transition-colors"
        >
          <FolderSync className="w-3.5 h-3.5 text-emerald-600" />
          <span className="truncate max-w-[160px]">waruppusigap@gmail.com</span>
        </button>

        {/* Pengaturan Button */}
        <button
          onClick={onOpenSettings}
          title="Pengaturan Aplikasi & Gemini API"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Role Switcher Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <div className={`p-1 rounded-md ${roleInfo.color} flex-shrink-0`}>
              <RoleIcon className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline truncate max-w-[130px]">{roleInfo.label}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Role Dropdown Menu */}
          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 text-slate-800 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Simulasi Ganti Peran (Switch Role)
              </div>

              {/* 1. Kecamatan Waru */}
              <div className="p-1">
                <button
                  onClick={() => handleSelectRole('KECAMATAN')}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-start space-x-2.5 text-xs transition-colors ${
                    currentRole.role === 'KECAMATAN'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold">Pemerintah Kecamatan Waru</div>
                    <div className="text-[10px] text-slate-500">Camat & Tim Evaluasi Hukum</div>
                  </div>
                </button>
              </div>

              {/* 2. Pemdes Per Desa */}
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase">
                Pemerintah Desa (Pemdes)
              </div>
              <div className="p-1 space-y-0.5">
                {DESA_LIST.map(desa => (
                  <button
                    key={`pemdes-${desa.id}`}
                    onClick={() => handleSelectRole('PEMDES', desa.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      currentRole.role === 'PEMDES' && currentRole.desaId === desa.id
                        ? 'bg-blue-50 text-blue-900 border border-blue-300 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{desa.nama}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Kades</span>
                  </button>
                ))}
              </div>

              {/* 3. BPD Per Desa */}
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase border-t border-slate-100 mt-1">
                Badan Permusyawaratan Desa (BPD)
              </div>
              <div className="p-1 space-y-0.5">
                {DESA_LIST.map(desa => (
                  <button
                    key={`bpd-${desa.id}`}
                    onClick={() => handleSelectRole('BPD', desa.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      currentRole.role === 'BPD' && currentRole.desaId === desa.id
                        ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span>BPD {desa.nama.replace('Desa ', '')}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">BPD</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
