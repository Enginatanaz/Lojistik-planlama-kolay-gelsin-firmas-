import React from 'react';
import { Route, Facility } from '../types/logistics';
import { GitFork, ShieldCheck, Clock, ArrowRight, AlertCircle } from 'lucide-react';

interface FixedLineManagementPageProps {
  routes: Route[];
  facilities: Facility[];
}

export const FixedLineManagementPage: React.FC<FixedLineManagementPageProps> = ({
  routes,
  facilities
}) => {
  const facilityMap = new Map<string, Facility>();
  facilities.forEach(f => facilityMap.set(f.id, f));

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-blue-600" />
            <span>Sabit Hat Yönetimi ve Operasyonel Yük Sınırları</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sabit hatlar önceliklidir ve tanımlı sabit araç adetleri asgari doluluk şartı aranmaksızın korunur.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Kural KRL-01: Sabit Sefer Önceliği Aktif
        </span>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="min-w-full text-xs divide-y divide-slate-200 border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">Hat Kodu</th>
                <th className="px-4 py-3 text-left">Hat Tanımı &amp; Güzergâh</th>
                <th className="px-4 py-3 text-center">Sabit Araç Adedi</th>
                <th className="px-4 py-3 text-right">Hat Operasyonel Sınırı (Desi)</th>
                <th className="px-4 py-3 text-right">Hat Koli Sınırı</th>
                <th className="px-4 py-3 text-center">İlave Araç %90 Eşiği</th>
                <th className="px-4 py-3 text-left">Mesafe / Süre</th>
                <th className="px-4 py-3 text-left">İzin Verilen Kaynaklar</th>
                <th className="px-4 py-3 text-left">Kural Referansı &amp; Sürüm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {routes.map(route => {
                const isShuttle = route.code.includes('CROSS');

                return (
                  <tr key={route.id} className={`hover:bg-slate-50 transition ${isShuttle ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {route.code}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{route.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        {route.stops.map((s, idx) => (
                          <React.Fragment key={s.facilityId}>
                            <span>{s.facilityName}</span>
                            {idx < route.stops.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-slate-400" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                        {route.fixedVehicleCount} Araç (Sabit)
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {route.routeOperationalMaxDesi.toLocaleString('tr-TR')} Desi
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-slate-700 whitespace-nowrap">
                      {route.routeOperationalMaxPackages.toLocaleString('tr-TR')} Koli
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {route.allowAdditionalVehicles ? (
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px] border">
                          %{(route.additionalVehicleMinOccupancyRate * 100).toFixed(0)} Doluluk Şartı
                        </span>
                      ) : (
                        <span className="text-slate-400">İlave Kapalı</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {route.distanceKm} km • {route.standardDurationHours} Saat
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {route.allowedOriginFacilityIds.map(fId => {
                          const fac = facilityMap.get(fId);
                          return (
                            <span key={fId} className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-700 border">
                              {fac?.code || fId}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[10px]">
                      <div>{route.ruleReference}</div>
                      <div className="text-blue-600 font-bold">{route.ruleVersion}</div>
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
