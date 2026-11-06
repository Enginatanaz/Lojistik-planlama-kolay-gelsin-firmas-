import React from 'react';
import { Facility, LoadMovement, Route } from '../types/logistics';
import { Zap, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface DirectLineAnalysisPageProps {
  facilities: Facility[];
  loads: LoadMovement[];
  routes: Route[];
}

export const DirectLineAnalysisPage: React.FC<DirectLineAnalysisPageProps> = ({
  facilities,
  loads,
  routes
}) => {
  const originFacilities = facilities.filter(f => f.canOriginate);
  const destinationFacilities = facilities.filter(f => f.canReceive);

  // Compute origin-destination aggregate volume
  const corridorVolumes: {
    origin: Facility;
    dest: Facility;
    totalDesi: number;
    totalPackages: number;
    isDirectPossible: boolean;
    directThresholdDesi: number;
    status: 'DIRECT_FEASIBLE' | 'CROSS_DOCK_REQUIRED' | 'PROHIBITED_BY_RULE';
    reason: string;
  }[] = [];

  originFacilities.forEach(orig => {
    destinationFacilities.forEach(dest => {
      const cellLoads = loads.filter(l => l.originFacilityId === orig.id && l.trueDestinationFacilityId === dest.id);
      const totalDesi = cellLoads.reduce((sum, l) => sum + l.totalDesi, 0);
      const totalPackages = cellLoads.reduce((sum, l) => sum + l.packageCount, 0);

      const directThreshold = 2400; // %80 tır kapasitesi
      const isFeasible = totalDesi >= directThreshold;

      corridorVolumes.push({
        origin: orig,
        dest,
        totalDesi,
        totalPackages,
        isDirectPossible: true,
        directThresholdDesi: directThreshold,
        status: isFeasible ? 'DIRECT_FEASIBLE' : 'CROSS_DOCK_REQUIRED',
        reason: isFeasible
          ? 'Kural KRL-03: Yeterli müstakil hacim (%80+) mevcut; gereksiz cross dock yapılmadan doğrudan sevk edilir.'
          : 'Müstakil hacim direkt tır açmak için yetersiz; güzergah konsolidasyonuna yönlendirilir.'
      });
    });
  });

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Direkt Hat Analizi ve Cross Dock By-pass Değerlendirmesi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            "Direkt sevkiyat mümkünse gereksiz Cross Dock yapılmaz." kuralının koridor bazlı hacim fizibilite analizi.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
          Kural KRL-03: Direkt Sevkiyat Önceliği
        </span>
      </div>

      {/* Corridor Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="min-w-full text-xs divide-y divide-slate-200 border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">Çıkış Noktası</th>
                <th className="px-4 py-3 text-left">Gerçek Varış Noktası</th>
                <th className="px-4 py-3 text-right">Mevcut Talep (Desi)</th>
                <th className="px-4 py-3 text-right">Paket Sayısı</th>
                <th className="px-4 py-3 text-right">Direkt Hat Eşik Hacmi</th>
                <th className="px-4 py-3 text-center">Fizibilite Durumu</th>
                <th className="px-4 py-3 text-left">Operasyonel Kural Gerekçesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {corridorVolumes.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                    {item.origin.name} ({item.origin.code})
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                    {item.dest.name} ({item.dest.code})
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {item.totalDesi.toLocaleString('tr-TR')} Desi
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                    {item.totalPackages.toLocaleString('tr-TR')} Koli
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500 whitespace-nowrap">
                    {item.directThresholdDesi.toLocaleString('tr-TR')} Desi
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {item.status === 'DIRECT_FEASIBLE' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Direkt Sevk Uygun
                      </span>
                    ) : item.status === 'CROSS_DOCK_REQUIRED' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                        Cross Dock Gerekli
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                        Kural Kısıtı
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-[11px] max-w-md">
                    {item.reason}
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
