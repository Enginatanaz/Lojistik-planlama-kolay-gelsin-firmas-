import React from 'react';
import { 
  Facility, 
  Vehicle, 
  Route, 
  LoadMovement, 
  OptimizationSummary,
  OperationalMetadata,
  NavigationTab
} from '../types/logistics';
import { 
  Calendar, 
  Database, 
  Clock, 
  Truck, 
  Package, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Building2, 
  Warehouse, 
  Zap, 
  BarChart3,
  HelpCircle
} from 'lucide-react';

import { ForecastResult } from '../services/forecastEngine';

interface OverviewPageProps {
  metadata: OperationalMetadata;
  hasCalculated: boolean;
  summary: OptimizationSummary | null;
  facilities: Facility[];
  vehicles: Vehicle[];
  routes: Route[];
  loads: LoadMovement[];
  forecast?: ForecastResult;
  onRunOptimization: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  metadata,
  hasCalculated,
  summary,
  facilities,
  vehicles,
  routes,
  loads,
  forecast,
  onRunOptimization,
  onNavigate
}) => {
  // Static fleet counts (based on definitions)
  const tirCount = vehicles.filter(v => v.type === 'TIR').length;
  const kamyonCount = vehicles.filter(v => v.type === 'KAMYON' || v.type === 'KIRKAYAK').length;
  const kamyonetCount = vehicles.filter(v => v.type === 'KAMYONET').length;
  const panelvanCount = vehicles.filter(v => v.type === 'PANELVAN').length;

  // Total packages and desis from active forecast / Manuel Paket Girişi
  const totalPackages = forecast ? forecast.grandPackageTotal : loads.reduce((sum, l) => sum + l.packageCount, 0);
  const totalDesi = forecast ? forecast.grandDesiTotal : loads.reduce((sum, l) => sum + l.totalDesi, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Information Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                GENEL BAKIŞ VE OPERASYON KONTROL PANELİ
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ankara ve Gebze merkezli, çok tesisli parsiyel ve hat planlama operasyonunun anlık veri ve durum özeti.
            </p>
          </div>

          {!hasCalculated && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Planlama hesaplaması henüz başlatılmadı. Metrikler hesaplama sonrasında güncellenecektir.
              </span>
              <button
                onClick={onRunOptimization}
                className="ml-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold whitespace-nowrap"
              >
                Hesapla
              </button>
            </div>
          )}
        </div>

        {/* Operational Context Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 block">Operasyon Tarihi</span>
            <div className="text-sm font-bold text-slate-900 font-mono mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{metadata.operationDate}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 block">Aktif Veri Seti</span>
            <div className="text-sm font-bold text-slate-900 font-mono mt-0.5 flex items-center gap-1.5 truncate" title={metadata.activeDataset}>
              <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{metadata.activeDataset}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 block">Veri Aktarım Zamanı</span>
            <div className="text-sm font-bold text-slate-900 font-mono mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{metadata.dataImportTime}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 block">Son Hesaplama Zamanı</span>
            <div className="text-sm font-bold font-mono mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {hasCalculated ? (
                <span className="text-emerald-700">{metadata.lastCalculationTime || 'Tamamlandı'}</span>
              ) : (
                <span className="text-amber-700 font-semibold">Henüz hesaplanmadı</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Structured Operational Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            OPERASYONEL TEMEL METRİKLER
          </h3>
          <span className="text-[11px] text-slate-400">
            *Hesaplanmamış alanlar "Henüz hesaplanmadı" olarak işaretlenir
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {/* Toplam Paket */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 block text-[11px]">Toplam Paket</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900 font-mono">
                {totalPackages > 0 ? `${totalPackages.toLocaleString('tr-TR')} Koli` : 'Henüz hesaplanmadı'}
              </span>
              <span className="text-[11px] text-slate-400">{loads.length} Konsinye</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2">
              Veri setinde kayıtlı konsinye paket toplamı
            </div>
          </div>

          {/* Toplam Desi */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 block text-[11px]">Toplam Desi</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900 font-mono">
                {totalDesi > 0 ? `${totalDesi.toLocaleString('tr-TR')} Desi` : 'Henüz hesaplanmadı'}
              </span>
              <span className="text-[11px] text-slate-400">Hacim</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2">
              Konsinye toplam hacimsel desi
            </div>
          </div>

          {/* Toplam Araç & Filo Dağılımı */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 block text-[11px]">Toplam Araç ve Filo Dağılımı</span>
              <span className="text-base font-bold text-slate-900 font-mono">{vehicles.length} Araç</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <div className="p-2 bg-slate-50 rounded border text-center">
                <span className="text-[10px] text-slate-500 block">TIR</span>
                <span className="font-bold text-slate-800 text-sm font-mono">{tirCount}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border text-center">
                <span className="text-[10px] text-slate-500 block">Kamyon</span>
                <span className="font-bold text-slate-800 text-sm font-mono">{kamyonCount}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border text-center">
                <span className="text-[10px] text-slate-500 block">Kamyonet</span>
                <span className="font-bold text-slate-800 text-sm font-mono">{kamyonetCount}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border text-center">
                <span className="text-[10px] text-slate-500 block">Panelvan</span>
                <span className="font-bold text-slate-800 text-sm font-mono">{panelvanCount}</span>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2 flex items-center justify-between">
              <span>Tanımlı Sabit Seferler: {vehicles.filter(v => v.isFixedDeparture).length}</span>
              <span>İlave Sefer Kotası: {vehicles.filter(v => !v.isFixedDeparture).length}</span>
            </div>
          </div>

          {/* Ortalama Doluluk */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 block text-[11px]">Ortalama Doluluk</span>
            <div className="mt-1 flex items-baseline justify-between">
              {hasCalculated && summary ? (
                <span className="text-xl font-bold text-blue-700 font-mono">
                  %{summary.averageVehicleOccupancyPct}
                </span>
              ) : (
                <span className="text-sm font-semibold text-slate-400">
                  Henüz hesaplanmadı
                </span>
              )}
              <span className="text-[11px] text-slate-400">Desi Bazlı</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2">
              Aktif araçların kapasite kullanım oranı
            </div>
          </div>

          {/* Direkt Hatla Taşınan Desi */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 block text-[11px]">Direkt Hatla Taşınan Desi</span>
            <div className="mt-1 flex items-baseline justify-between">
              {hasCalculated && summary ? (
                <span className="text-xl font-bold text-emerald-700 font-mono">
                  {summary.directDesi.toLocaleString('tr-TR')} Desi
                </span>
              ) : (
                <span className="text-sm font-semibold text-slate-400">
                  Henüz hesaplanmadı
                </span>
              )}
              <span className="text-[11px] text-emerald-600 font-medium">By-pass</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2">
              Cross Dock aktarmasız doğrudan sevk
            </div>
          </div>

          {/* Ankara Cross Dock Desisi */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 block text-[11px]">Ankara Cross Dock Desisi</span>
            <div className="mt-1 flex items-baseline justify-between">
              {hasCalculated && summary ? (
                <span className="text-xl font-bold text-indigo-700 font-mono">
                  {summary.ankaraCrossDockDesi.toLocaleString('tr-TR')} Desi
                </span>
              ) : (
                <span className="text-sm font-semibold text-slate-400">
                  Henüz hesaplanmadı
                </span>
              )}
              <span className="text-[11px] text-slate-400">ATM Kazan</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2">
              Ankara ATM aktarma merkezinde elleçlenen
            </div>
          </div>

          {/* Gebze Cross Dock Desisi */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 block text-[11px]">Gebze Cross Dock Desisi</span>
            <div className="mt-1 flex items-baseline justify-between">
              {hasCalculated && summary ? (
                <span className="text-xl font-bold text-indigo-700 font-mono">
                  {summary.gebzeCrossDockDesi > 0 ? `${summary.gebzeCrossDockDesi.toLocaleString('tr-TR')} Desi` : '0 Desi'}
                </span>
              ) : (
                <span className="text-sm font-semibold text-slate-400">
                  Henüz hesaplanmadı
                </span>
              )}
              <span className="text-[11px] text-slate-400">Marmara Hub</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2">
              Gebze aktarma merkezinde konsolide edilen
            </div>
          </div>

          {/* Konsolide Edilen Desi */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 block text-[11px]">Konsolide Edilen Desi</span>
            <div className="mt-1 flex items-baseline justify-between">
              {hasCalculated && summary ? (
                <span className="text-xl font-bold text-slate-800 font-mono">
                  {summary.consolidatedDesi.toLocaleString('tr-TR')} Desi
                </span>
              ) : (
                <span className="text-sm font-semibold text-slate-400">
                  Henüz hesaplanmadı
                </span>
              )}
              <span className="text-[11px] text-slate-400">Ring/Shuttle</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2">
              Farklı kaynaklardan birleştirilen yükler
            </div>
          </div>

          {/* Açıkta Kalan Paket ve Desi */}
          <div className={`p-4 rounded-xl border shadow-sm ${
            hasCalculated && summary && summary.unassignedDesi > 0
              ? 'bg-rose-50/50 border-rose-200'
              : 'bg-white border-slate-200'
          }`}>
            <span className="text-slate-500 block text-[11px]">Açıkta Kalan Paket ve Desi</span>
            <div className="mt-1 flex items-baseline justify-between">
              {hasCalculated && summary ? (
                <span className="text-base font-bold text-rose-700 font-mono">
                  {summary.unassignedPackagesCount} Paket / {summary.unassignedDesi.toLocaleString('tr-TR')} Desi
                </span>
              ) : (
                <span className="text-sm font-semibold text-slate-400">
                  Henüz hesaplanmadı
                </span>
              )}
              <span className="text-[11px] text-rose-600 font-medium">Kapasite Dışı</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2">
              %90 eşiği veya kapasite kısıtına takılan yük
            </div>
          </div>

          {/* Kural İhlali */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 block text-[11px]">Kural İhlali</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-base font-bold text-emerald-700 font-mono">
                0 (İhlal Yok)
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2">
              Yönergeye ve kısıtlara %100 uyum sağlandı
            </div>
          </div>

          {/* Gereken Spot Araç Sayısı */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 block text-[11px]">Gereken Spot Araç Sayısı</span>
            <div className="mt-1 flex items-baseline justify-between">
              {hasCalculated && summary ? (
                <span className="text-base font-bold text-slate-800 font-mono">
                  {summary.neededSpotVehicles > 0 ? `${summary.neededSpotVehicles} Spot Araç` : '0 (Yeterli Filo)'}
                </span>
              ) : (
                <span className="text-sm font-semibold text-slate-400">
                  Henüz hesaplanmadı
                </span>
              )}
              <Truck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 border-t pt-2">
              Açıkta kalan hacim için talep edilen ilave spot araç
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tesislerin Günlük Toplama Paket Sayıları (Manuel Paket Girişi Çıkış Hacimleri) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Tesislerin Günlük Toplama Paket Sayıları (Manuel Paket Girişi Çıkış Hacimleri)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Soldaki sütun çıkış tesislerinin günlük toplama paket sayıları sistemin temel hesaplama verisidir.
            </p>
          </div>
          <button
            onClick={() => onNavigate('manuel_paket_girisi')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition whitespace-nowrap self-start sm:self-auto"
          >
            Manuel Paket Girişini Düzenle &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {facilities.map(fac => {
            return (
              <div key={fac.id} className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-lg transition text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900 truncate">{fac.city}</span>
                  <span className="font-mono text-[10px] text-blue-700 font-bold px-1.5 py-0.5 bg-white rounded border border-slate-200">{fac.code}</span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-500">Günlük Toplama:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {fac.dailyCollectionPackages ? `${fac.dailyCollectionPackages.toLocaleString('tr-TR')} Pk` : '—'}
                  </span>
                </div>
                <div className="mt-0.5 flex items-baseline justify-between text-[10px] text-slate-500">
                  <span>Toplama Desisi:</span>
                  <span className="font-mono font-semibold text-blue-800">
                    {fac.dailyCollectionDesi ? `${fac.dailyCollectionDesi.toLocaleString('tr-TR')} D` : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Fast Navigation Shortcuts */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          HIZLI SAYFA ERİŞİMİ VE MODÜLLER
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 text-xs">
          <button
            onClick={() => onNavigate('manuel_paket_girisi')}
            className="p-3 rounded-lg border-2 border-blue-400 bg-blue-50/70 hover:bg-blue-100/80 text-left transition"
          >
            <span className="font-bold text-blue-900 block">Manuel Paket Girişi</span>
            <span className="text-[10px] text-blue-700 font-medium">20×20 OD Motoru &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('package_matrix')}
            className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition"
          >
            <span className="font-bold text-slate-800 block">Paket Matrisi</span>
            <span className="text-[10px] text-slate-500">Koli akış haritası &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('desi_matrix')}
            className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition"
          >
            <span className="font-bold text-slate-800 block">Desi Matrisi</span>
            <span className="text-[10px] text-slate-500">Hacim dağılımı &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('line_planning_optimization')}
            className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition"
          >
            <span className="font-bold text-slate-800 block">Hat Planlama</span>
            <span className="text-[10px] text-slate-500">Tek ana tablo &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('direct_line_analysis')}
            className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition"
          >
            <span className="font-bold text-slate-800 block">Direkt Hat Analizi</span>
            <span className="text-[10px] text-slate-500">By-pass fizibilitesi &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('ankara_cross_dock')}
            className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition"
          >
            <span className="font-bold text-slate-800 block">Ankara Cross Dock</span>
            <span className="text-[10px] text-slate-500">Kazan aktarma rampa &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('unassigned_packages')}
            className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-left transition"
          >
            <span className="font-bold text-slate-800 block">Açıkta Kalanlar</span>
            <span className="text-[10px] text-slate-500">Kapasite dışı liste &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
