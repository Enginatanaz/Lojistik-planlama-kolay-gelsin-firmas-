import React from 'react';
import { History, CheckCircle2, Clock, Calendar, User, FileText } from 'lucide-react';
import { OptimizationSummary } from '../types/logistics';

interface PlanningHistoryPageProps {
  summary: OptimizationSummary | null;
  hasCalculated: boolean;
  onOpenReportModal: () => void;
}

export const PlanningHistoryPage: React.FC<PlanningHistoryPageProps> = ({
  summary,
  hasCalculated,
  onOpenReportModal
}) => {
  // Historical session runs
  const historyRuns = [
    ...(hasCalculated && summary ? [{
      id: 'RUN-20261106-0924',
      date: new Date(summary.timestamp).toLocaleString('tr-TR'),
      dataset: '2026_Q4_Hat_Matrisi_v1.xlsx',
      version: 'v2.4 (Canlı Hesaplama)',
      operator: 'Baş Planlamacı (Ankara Hub)',
      status: 'BAŞARILI',
      assignedDesi: summary.assignedDesi,
      unassignedDesi: summary.unassignedDesi,
      activeVehicles: summary.activeVehicles,
      totalVehicles: summary.totalVehicles
    }] : []),
    {
      id: 'RUN-20261105-2315',
      date: '05.11.2026 23:15:00',
      dataset: '2026_Q4_Hat_Matrisi_v1.xlsx',
      version: 'v2.3 (Gece Seferi Kesinleşti)',
      operator: 'Gece Vardiya Amiri',
      status: 'BAŞARILI',
      assignedDesi: 22400,
      unassignedDesi: 1450,
      activeVehicles: 9,
      totalVehicles: 17
    },
    {
      id: 'RUN-20261105-1800',
      date: '05.11.2026 18:00:12',
      dataset: '2026_Q4_Hat_Matrisi_v1.xlsx',
      version: 'v2.2 (Akşam Konsolidasyon Provası)',
      operator: 'Hat Planlama Masası',
      status: 'BAŞARILI',
      assignedDesi: 20850,
      unassignedDesi: 2900,
      activeVehicles: 8,
      totalVehicles: 17
    },
    {
      id: 'RUN-20261104-2130',
      date: '04.11.2026 21:30:45',
      dataset: '2026_Q4_Hat_Matrisi_v1.xlsx',
      version: 'v2.1 (Arşiv Seferi)',
      operator: 'Baş Planlamacı',
      status: 'TAMAMLANDI',
      assignedDesi: 23100,
      unassignedDesi: 950,
      activeVehicles: 9,
      totalVehicles: 17
    }
  ];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Planlama Geçmişi ve Sefer Çalıştırma Arşivi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geçmiş hat optimizasyonu kayıtları, kural versiyonları, onaylayan kullanıcılar ve sonuç metrikleri.
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border">
          {historyRuns.length} Kayıtlı Sefer Oturumu
        </span>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="min-w-full text-xs divide-y divide-slate-200 border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">Çalıştırma ID</th>
                <th className="px-4 py-3 text-left">Zaman Damgası</th>
                <th className="px-4 py-3 text-left">Veri Seti</th>
                <th className="px-4 py-3 text-left">Kural Sürümü</th>
                <th className="px-4 py-3 text-left">Planlayan Yetkili</th>
                <th className="px-4 py-3 text-right">Atanan Desi</th>
                <th className="px-4 py-3 text-right">Açıkta Kalan Desi</th>
                <th className="px-4 py-3 text-center">Aktif / Toplam Araç</th>
                <th className="px-4 py-3 text-center">Durum</th>
                <th className="px-4 py-3 text-right">Denetim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {historyRuns.map((run, rIdx) => (
                <tr key={run.id} className={`hover:bg-slate-50 transition ${rIdx === 0 && hasCalculated ? 'bg-blue-50/20' : ''}`}>
                  <td className="px-4 py-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {run.id}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap font-mono">
                    {run.date}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                    {run.dataset}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-800">
                    {run.version}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                    {run.operator}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                    {run.assignedDesi.toLocaleString('tr-TR')} Desi
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-700 whitespace-nowrap">
                    {run.unassignedDesi.toLocaleString('tr-TR')} Desi
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-800 whitespace-nowrap">
                    {run.activeVehicles} / {run.totalVehicles}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={onOpenReportModal}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md font-semibold transition"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Rapor</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
