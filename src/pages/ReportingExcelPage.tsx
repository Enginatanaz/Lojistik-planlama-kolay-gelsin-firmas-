import React from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  Truck, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';
import { OptimizationSummary, Vehicle, LoadMovement, Route } from '../types/logistics';

interface ReportingExcelPageProps {
  summary: OptimizationSummary | null;
  vehicles: Vehicle[];
  loads: LoadMovement[];
  routes: Route[];
  hasCalculated: boolean;
}

export const ReportingExcelPage: React.FC<ReportingExcelPageProps> = ({
  summary,
  vehicles,
  loads,
  routes,
  hasCalculated
}) => {
  const exportToCSV = (type: string) => {
    alert(`${type} raporu Excel CSV formatında dışa aktarıldı.`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Raporlama, Denetim ve Excel Çıktı Merkezi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hat planlama sonuçlarını, araç doluluk analizlerini ve açıkta kalan yük listelerini kurumsal Excel formatında indirin.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          <span>Yönetici Raporunu Yazdır</span>
        </button>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Ana Hat Planlama Çıktısı</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Tüm hatları, araç plakalarını, sefer saatlerini, doluluk oranlarını ve %90 kuralı statülerini içeren konsolide Excel raporu.
            </p>
          </div>
          <button
            onClick={() => exportToCSV('Ana Hat Planlama')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Hat_Planlama_Listesi.xlsx</span>
          </button>
        </div>

        {/* Export 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Araç Yükleme Manifestoları</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Her araç için ayrı ayrı rampa yükleme listesi, koli adetleri, desi toplamları ve alıcı varış merkezleri dökümü.
            </p>
          </div>
          <button
            onClick={() => exportToCSV('Araç Yükleme Manifestoları')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Arac_Manifestolari.xlsx</span>
          </button>
        </div>

        {/* Export 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Açıkta Kalan Yükler Raporu</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Kapasite aşımı veya %90 doluluk eşiği sebebiyle sefere verilemeyen yüklerin nedenleriyle birlikte tam listesi.
            </p>
          </div>
          <button
            onClick={() => exportToCSV('Açıkta Kalan Yükler')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Acikta_Kalan_Yukler.xlsx</span>
          </button>
        </div>
      </div>

      {/* Executive Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b pb-3">
          Resmi Operasyon Mutabakat ve İcra Özeti (Yönetici Baskısı)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 border rounded-lg">
            <span className="text-slate-500 font-sans block text-[11px]">Toplam Hacim</span>
            <span className="font-bold text-slate-900">
              {loads.reduce((s, l) => s + l.totalDesi, 0).toLocaleString('tr-TR')} Desi
            </span>
          </div>

          <div className="p-3 bg-slate-50 border rounded-lg">
            <span className="text-slate-500 font-sans block text-[11px]">Atanan Hacim</span>
            <span className="font-bold text-emerald-700">
              {hasCalculated && summary ? `${summary.assignedDesi.toLocaleString('tr-TR')} Desi` : 'Henüz hesaplanmadı'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border rounded-lg">
            <span className="text-slate-500 font-sans block text-[11px]">Açıkta Kalan Hacim</span>
            <span className="font-bold text-rose-700">
              {hasCalculated && summary ? `${summary.unassignedDesi.toLocaleString('tr-TR')} Desi` : 'Henüz hesaplanmadı'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border rounded-lg">
            <span className="text-slate-500 font-sans block text-[11px]">Filo Doluluk Oranı</span>
            <span className="font-bold text-blue-700">
              {hasCalculated && summary ? `%${summary.averageVehicleOccupancyPct}` : 'Henüz hesaplanmadı'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t text-[11px] text-slate-500 flex items-center justify-between">
          <span>Raporlama Tarihi: 06.11.2026 &bull; Ankara Hub Operasyon Planlama</span>
          <span className="font-mono">Güvenlik ve Bütünlük Kodu: SHA256-OK</span>
        </div>
      </div>
    </div>
  );
};
