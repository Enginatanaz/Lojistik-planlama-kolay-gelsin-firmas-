import React from 'react';
import { Vehicle, Route } from '../types/logistics';
import { Cpu, ShieldCheck, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface VehicleOptimizationPageProps {
  vehicles: Vehicle[];
  routes: Route[];
  hasCalculated: boolean;
}

export const VehicleOptimizationPage: React.FC<VehicleOptimizationPageProps> = ({
  vehicles,
  routes,
  hasCalculated
}) => {
  const routeMap = new Map<string, Route>();
  routes.forEach(r => routeMap.set(r.id, r));

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>Araç Optimizasyonu ve %90 Doluluk Eşik Matrisi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            İkinci ve sonraki araçlar için genel %90 kuralı uygulanır; sabit araçlar ve tanımlı istisnalar bu kuraldan muaftır.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
          Kural KRL-02: %90 Eşik Kuralı
        </span>
      </div>

      {/* Threshold Explanation Alert */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Kural Mantığı:</strong> Bir hatta birden fazla araç planlandığında, 1. araç (ve hat tanımındaki tanımlı sabit araçlar) tam kapasiteye ulaşmasa dahi tarifeli olarak sevk edilir. 2. ve sonraki ilave araçların sefere çıkabilmesi için atanmış yük hacminin aracın veya hat sınırının <strong>asgari %90’ına</strong> ulaşması şarttır. Eşiği geçemeyen araçlar iptal edilerek yükler açıkta kalan yükler masasına aktarılır.
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="min-w-full text-xs divide-y divide-slate-200 border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">Hat Kodu</th>
                <th className="px-4 py-3 text-left">Araç / Sefer Sırası</th>
                <th className="px-4 py-3 text-left">Plaka / Tip</th>
                <th className="px-4 py-3 text-center">Sefer Türü</th>
                <th className="px-4 py-3 text-right">Efektif Kapasite</th>
                <th className="px-4 py-3 text-right">Gereken Min. Desi (%90)</th>
                <th className="px-4 py-3 text-right">Yüklü Desi</th>
                <th className="px-4 py-3 text-center">Doluluk Oranı</th>
                <th className="px-4 py-3 text-center">Optimizasyon Kararı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {vehicles.map(veh => {
                const route = routeMap.get(veh.assignedRouteId);
                const effectiveDesi = route ? Math.min(veh.maxDesiCapacity, route.routeOperationalMaxDesi) : veh.maxDesiCapacity;
                const requiredMinDesi = effectiveDesi * 0.90;
                const occupancyPct = effectiveDesi > 0 ? Math.round((veh.currentDesi / effectiveDesi) * 100) : 0;
                const isCancelled = veh.status === 'IPTAL_90_KURALI';

                return (
                  <tr key={veh.id} className={`hover:bg-slate-50 transition ${isCancelled ? 'bg-rose-50/25' : ''}`}>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {route?.code || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      {veh.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-800 whitespace-nowrap">
                      {veh.plate} ({veh.type})
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {veh.isFixedDeparture ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          Sabit Sefer (Muaf)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          %90 Eşik Kuralına Tabi
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 whitespace-nowrap">
                      {effectiveDesi.toLocaleString('tr-TR')} Desi
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {veh.isFixedDeparture ? '—' : `${requiredMinDesi.toLocaleString('tr-TR')} Desi`}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                      {hasCalculated ? `${veh.currentDesi.toLocaleString('tr-TR')} Desi` : 'Henüz hesaplanmadı'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold whitespace-nowrap">
                      {hasCalculated ? `%{occupancyPct}` : 'Henüz hesaplanmadı'}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {!hasCalculated ? (
                        <span className="text-slate-400 font-semibold text-[11px]">Henüz hesaplanmadı</span>
                      ) : isCancelled ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          %90 Altında (İptal)
                        </span>
                      ) : veh.status === 'HAZIR' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Sefer Onaylandı
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          Beklemede
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
