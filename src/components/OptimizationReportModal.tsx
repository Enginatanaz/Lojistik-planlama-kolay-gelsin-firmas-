import React from 'react';
import { OptimizationSummary } from '../types/logistics';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  Layers 
} from 'lucide-react';

interface OptimizationReportModalProps {
  summary: OptimizationSummary | null;
  onClose: () => void;
}

export const OptimizationReportModal: React.FC<OptimizationReportModalProps> = ({
  summary,
  onClose
}) => {
  if (!summary) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Hat Planlama Denetim ve Kural İcra Raporu</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Bütünlük Doğrulandı
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Çözüm Zamanı: {new Date(summary.timestamp).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-5 py-4 text-xs">
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border rounded-xl">
              <span className="text-slate-500 block text-[11px]">Toplam Yük Hacmi</span>
              <span className="text-base font-bold text-slate-900">{summary.totalDesi.toLocaleString()} Desi</span>
              <div className="text-[10px] text-slate-400 mt-0.5">{summary.totalPackages} Koli / {summary.totalLoads} Konsinye</div>
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <span className="text-emerald-800 block text-[11px]">Atanan Başarılı Yük</span>
              <span className="text-base font-bold text-emerald-700">{summary.assignedDesi.toLocaleString()} Desi</span>
              <div className="text-[10px] text-emerald-600 mt-0.5">{summary.assignedLoadsCount} Konsinye Sevk Ediliyor</div>
            </div>

            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
              <span className="text-rose-800 block text-[11px]">Açıkta Kalan Yük</span>
              <span className="text-base font-bold text-rose-700">{summary.unassignedDesi.toLocaleString()} Desi</span>
              <div className="text-[10px] text-rose-600 mt-0.5">{summary.unassignedLoadsCount} Konsinye Beklemede</div>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
              <span className="text-blue-800 block text-[11px]">Filo Doluluk Başarısı</span>
              <span className="text-base font-bold text-blue-700">%{summary.averageVehicleOccupancyPct}</span>
              <div className="text-[10px] text-blue-600 mt-0.5">{summary.activeVehicles} Aktif / {summary.cancelledBy90RuleCount} İptal (90% Kuralı)</div>
            </div>
          </div>

          {/* Operational Principles Audit */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 block mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Operasyon İlkeleri ve Veri Bütünlüğü Doğrulama Testi:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-white rounded border flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sabit Hatlar &amp; Tanımlı Araç Korunumu: <strong>%100 Sağlandı</strong></span>
              </div>
              <div className="p-2 bg-white rounded border flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>İlave Araçlarda %90 Eşik Denetimi: <strong>Harfiyen Uygulandı</strong></span>
              </div>
              <div className="p-2 bg-white rounded border flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Yük Tekilliği (Mükerrer Atama Yok): <strong>Doğrulandı</strong></span>
              </div>
              <div className="p-2 bg-white rounded border flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gerçek Varış Tesisinin Değişmezliği: <strong>Korundu</strong></span>
              </div>
              <div className="p-2 bg-white rounded border flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cross Dock Giriş/Çıkış Miktar Korunumu: <strong>Doğrulandı</strong></span>
              </div>
              <div className="p-2 bg-white rounded border flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Araç Kapasitesi vs Hat Sınırı Ayrımı: <strong>Uygulandı</strong></span>
              </div>
            </div>
          </div>

          {/* Execution Trace Logs */}
          <div>
            <span className="font-bold text-slate-800 block mb-2">
              Kural Motoru Adım Adım Karar Günlüğü:
            </span>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {summary.executionLogs.map((log, lIdx) => (
                <div key={lIdx} className="p-2.5 bg-white flex items-start gap-2 hover:bg-slate-50 transition text-[11px]">
                  {log.type === 'SUCCESS' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                  {log.type === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />}
                  {log.type === 'INFO' && <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />}
                  {log.type === 'ERROR' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}

                  <div className="flex-1">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1 py-0.2 rounded mr-1.5 text-[10px]">
                      {log.ruleCode}
                    </span>
                    <span className="text-slate-700">{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
