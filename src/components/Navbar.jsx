import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles, 
  FolderSync, 
  Settings, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { DESA_LIST, KECAMATAN_INFO } from '../data/legalReferences';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  activeTab, 
  setActiveTab,
  onOpenNewDraft,
  onOpenAiGenerator,
  onOpenGoogleAppsScript,
  onOpenSettings,
  onResetData,
  totalPendingCount
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

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
    setShowRoleMenu(false);
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

  return (
    <header className="sticky top-0 z-40 bg-govnavy-900 text-white border-b border-slate-700 shadow-md">
      {/* Top Banner Pemerintah */}
      <div className="bg-govnavy-950 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sistem Resmi Evaluasi Produk Hukum Desa &bull; <strong>Kecamatan Waru, Kab. Penajam Paser Utara</strong></span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onOpenGoogleAppsScript}
            className="flex items-center space-x-1 hover:text-emerald-300 text-slate-300 transition-colors"
          >
            <FolderSync className="w-3.5 h-3.5 text-emerald-400" />
            <span>Drive: <strong>waruppusigap@gmail.com</strong></span>
          </button>
          <span className="hidden sm:inline text-slate-600">|</span>
          <button 
            onClick={onResetData}
            title="Reset data ke data contoh bawaan"
            className="hidden sm:flex items-center space-x-1 hover:text-slate-100 text-slate-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Nama Sistem */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-600 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-emerald-400/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  SI HARMONISASI
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  WARU
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Evaluasi Produk Hukum Desa &bull; Permendagri 111/2014
              </p>
            </div>
          </div>

          {/* Navigasi Utama */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Dashboard Analitik
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'documents' 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Daftar Produk Hukum</span>
              {totalPendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-xs rounded-full bg-amber-500 text-govnavy-950 font-bold">
                  {totalPendingCount}
                </span>
              )}
            </button>

            {/* Quick Action Khusus Pemdes */}
            {currentRole.role === 'PEMDES' && (
              <button
                onClick={onOpenNewDraft}
                className="ml-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950/40 flex items-center space-x-1.5 border border-emerald-400/30"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Ajukan Draf Baru</span>
              </button>
            )}

            {/* Quick Action Khusus Kecamatan (AI Harmonizer) */}
            {currentRole.role === 'KECAMATAN' && (
              <button
                onClick={onOpenAiGenerator}
                className="ml-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-md shadow-indigo-950/40 flex items-center space-x-1.5 border border-indigo-400/30"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>AI Harmonisasi</span>
              </button>
            )}
          </nav>

          {/* Switch Role & User Dropdown */}
          <div className="flex items-center space-x-3">
            {/* Tombol Setup Google Apps Script */}
            <button
              onClick={onOpenGoogleAppsScript}
              title="Integrasi Google Sheet & Drive waruppusigap@gmail.com"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors hidden sm:block"
            >
              <FolderSync className="w-4 h-4" />
            </button>

            {/* Tombol Pengaturan */}
            <button
              onClick={onOpenSettings}
              title="Pengaturan Aplikasi & Gemini API"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Role Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
              >
                <div className={`p-1.5 rounded-md ${roleInfo.color}`}>
                  <RoleIcon className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white flex items-center space-x-1">
                    <span>{roleInfo.label}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {roleInfo.desc}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu Switch Role */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Simulasi Ganti Peran (Switch Role)
                  </div>

                  {/* 1. Kecamatan Waru */}
                  <div className="p-1">
                    <button
                      onClick={() => handleSelectRole('KECAMATAN')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start space-x-2.5 text-sm transition-colors ${
                        currentRole.role === 'KECAMATAN'
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold">Pemerintah Kecamatan Waru</div>
                        <div className="text-xs text-slate-400">Camat, Sekcam & Tim Evaluasi Produk Hukum</div>
                      </div>
                    </button>
                  </div>

                  {/* 2. Pemdes Per Desa */}
                  <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase">
                    Pemerintah Desa (Pemdes)
                  </div>
                  <div className="p-1 space-y-0.5">
                    {DESA_LIST.map(desa => (
                      <button
                        key={`pemdes-${desa.id}`}
                        onClick={() => handleSelectRole('PEMDES', desa.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          currentRole.role === 'PEMDES' && currentRole.desaId === desa.id
                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span>{desa.nama}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Kades: {desa.kades.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>

                  {/* 3. BPD Per Desa */}
                  <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase border-t border-slate-800 mt-1">
                    Badan Permusyawaratan Desa (BPD)
                  </div>
                  <div className="p-1 space-y-0.5">
                    {DESA_LIST.map(desa => (
                      <button
                        key={`bpd-${desa.id}`}
                        onClick={() => handleSelectRole('BPD', desa.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          currentRole.role === 'BPD' && currentRole.desaId === desa.id
                            ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 font-semibold'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>BPD {desa.nama.replace('Desa ', '')}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Ketua BPD</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
