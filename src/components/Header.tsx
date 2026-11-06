import React from 'react';
import { 
  Truck, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  Play, 
  RotateCcw, 
  FileText, 
  PlusCircle,
  HelpCircle,
  Grid3X3,
  Calendar
} from 'lucide-react';
import { OptimizationSummary } from '../types/logistics';

interface HeaderProps {
  summary: OptimizationSummary | null;
  activeTab: 'lines' | 'loads' | 'matrix' | 'overflow' | 'rules';
  setActiveTab: (tab: 'lines' | 'loads' | 'matrix' | 'overflow' | 'rules') => void;
  onRunOptimization: () => void;
  onResetData: () => void;
  onOpenNewLoadModal: () => void;
  onOpenReportModal: () => void;
  pendingVerificationCount: number;
  unassignedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  activeTab,
  setActiveTab,
  onRunOptimization,
  onResetData,
  onOpenNewLoadModal,
  onOpenReportModal,
  pendingVerificationCount,
  unassignedCount
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-white/10">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  LOJİSTİK HAT PLANLAMA VE OPTİMİZASYON MERKEZİ
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Ankara Ana Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Çok Tesisli Konsolidasyon &amp; Sabit Sefer Yönetimi</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Kural Motoru v2.4 Aktif
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onRunOptimization}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-md shadow-blue-600/30 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Optimizasyonu Çalıştır</span>
            </button>

            <button
              onClick={onOpenNewLoadModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Yeni Yük Girişi</span>
            </button>

            {summary && (
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
                title="Optimizasyon Kural Günlüğü"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Denetim Raporu</span>
              </button>
            )}

            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-200 text-slate-400 text-sm font-medium border border-slate-700/80 transition"
              title="Varsayılan Verileri Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Operational KPI Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-slate-400 block">Planlanan Araçlar</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-white">{summary.activeVehicles} / {summary.totalVehicles}</span>
                <span className="text-emerald-400 font-medium">Sabit Seferler</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-slate-400 block">Ort. Filo Doluluğu</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-white">%{summary.averageVehicleOccupancyPct}</span>
                <span className="text-blue-400">Desi Bazlı</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-slate-400 block">Atanan Yük Hacmi</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-emerald-400">{summary.assignedDesi.toLocaleString()} Desi</span>
                <span className="text-slate-400">{summary.assignedPackagesCount} Koli</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
              <span className="text-slate-400 block">Cross Dock Yükleri</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-amber-300">{summary.crossDockLoadsCount} Konsinye</span>
                <span className="text-slate-400">ATM Aktarma</span>
              </div>
            </div>

            <div className={`border rounded-lg p-2.5 transition ${
              unassignedCount > 0 
                ? 'bg-rose-950/40 border-rose-800/80 text-rose-200' 
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="block text-slate-400">Açıkta Kalan Yük</span>
                {unassignedCount > 0 && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-rose-400">{summary.unassignedDesi.toLocaleString()} Desi</span>
                <span className="text-rose-300 font-semibold">{summary.unassignedLoadsCount} Adet</span>
              </div>
            </div>

            <div className={`border rounded-lg p-2.5 transition ${
              pendingVerificationCount > 0 
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-200' 
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="block text-slate-400">Kural Onayı Bekleyen</span>
                {pendingVerificationCount > 0 && <HelpCircle className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-amber-300">{pendingVerificationCount} Kayıt</span>
                <span className="text-amber-400 text-[11px]">Kullanıcı Onayı</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('lines')}
            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md whitespace-nowrap transition ${
              activeTab === 'lines'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Ana Hat Planlama Tablosu</span>
          </button>

          <button
            onClick={() => setActiveTab('loads')}
            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md whitespace-nowrap transition ${
              activeTab === 'loads'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Yük Hareketleri &amp; Konsinyeler</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md whitespace-nowrap transition ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Paket &amp; Desi Matrisi</span>
          </button>

          <button
            onClick={() => setActiveTab('overflow')}
            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md whitespace-nowrap transition ${
              activeTab === 'overflow'
                ? 'bg-rose-700 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Açıkta Kalan Yükler</span>
            {unassignedCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white ml-1">
                {unassignedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md whitespace-nowrap transition ${
              activeTab === 'rules'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Kural &amp; Doğrulama Merkezi</span>
            {pendingVerificationCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 ml-1">
                {pendingVerificationCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
