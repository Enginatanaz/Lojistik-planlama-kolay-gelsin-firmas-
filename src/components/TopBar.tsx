import React from 'react';
import { 
  Menu, 
  Play, 
  RotateCcw, 
  Calendar, 
  Database, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { OperationalMetadata, OptimizationSummary } from '../types/logistics';

interface TopBarProps {
  metadata: OperationalMetadata;
  hasCalculated: boolean;
  summary: OptimizationSummary | null;
  onRunOptimization: () => void;
  onResetData: () => void;
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  metadata,
  hasCalculated,
  summary,
  onRunOptimization,
  onResetData,
  onOpenMobileMenu
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left Section: Mobile toggle and System Metadata Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Menüyü Aç"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">
                LOJİSTİK OPERASYON VE HAT YÖNETİM MERKEZİ
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                Masaüstü Operasyon Paneli
              </span>
            </div>
            
            {/* Operational Metadata details */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Operasyon Tarihi: <strong className="text-slate-200 font-mono">{metadata.operationDate}</strong></span>
              </span>

              <span className="hidden md:inline-block text-slate-600">&bull;</span>

              <span className="flex items-center gap-1">
                <Database className="w-3 h-3 text-slate-400" />
                <span>Aktif Veri Seti: <strong className="text-slate-200 font-mono">{metadata.activeDataset}</strong></span>
              </span>

              <span className="hidden md:inline-block text-slate-600">&bull;</span>

              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Veri Aktarımı: <strong className="text-slate-200 font-mono">{metadata.dataImportTime}</strong></span>
              </span>

              <span className="hidden md:inline-block text-slate-600">&bull;</span>

              <span className="flex items-center gap-1">
                <span>Son Hesaplama: </span>
                {hasCalculated ? (
                  <span className="text-emerald-400 font-bold font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {metadata.lastCalculationTime || 'Tamamlandı'}
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold font-mono">
                    Henüz hesaplanmadı
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRunOptimization}
            className={`
              inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition
              ${hasCalculated 
                ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'}
            `}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">
              {hasCalculated ? 'Optimizasyonu Yeniden Çalıştır' : 'Optimizasyonu Başlat'}
            </span>
            <span className="sm:hidden">Çalıştır</span>
          </button>

          <button
            onClick={onResetData}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
            title="Verileri Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline ml-1">Sıfırla</span>
          </button>
        </div>
      </div>
    </header>
  );
};
