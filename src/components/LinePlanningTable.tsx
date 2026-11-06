import React, { useState } from 'react';
import { 
  Vehicle, 
  Route, 
  LoadMovement 
} from '../types/logistics';
import { 
  Truck, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Maximize2, 
  ChevronRight, 
  Info,
  Filter
} from 'lucide-react';

interface LinePlanningTableProps {
  vehicles: Vehicle[];
  routes: Route[];
  loads: LoadMovement[];
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const LinePlanningTable: React.FC<LinePlanningTableProps> = ({
  vehicles,
  routes,
  loads,
  onSelectVehicle
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'FIXED' | 'EXTRA' | 'SHUTTLE' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper map for routes
  const routeMap = new Map<string, Route>();
  routes.forEach(r => routeMap.set(r.id, r));

  const filteredVehicles = vehicles.filter(veh => {
    const route = routeMap.get(veh.assignedRouteId);
    const matchesSearch = 
      veh.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veh.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (route && route.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (route && route.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'FIXED') {
      return veh.isFixedDeparture && !route?.code.includes('CROSS');
    }
    if (filterType === 'EXTRA') {
      return !veh.isFixedDeparture;
    }
    if (filterType === 'SHUTTLE') {
      return route?.code.includes('CROSS');
    }
    if (filterType === 'CANCELLED') {
      return veh.status === 'IPTAL_90_KURALI';
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filtrele:
          </span>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filterType === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tüm Filo ({vehicles.length})
          </button>

          <button
            onClick={() => setFilterType('FIXED')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filterType === 'FIXED'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Sabit Şehirlerarası Hatlar ({vehicles.filter(v => v.isFixedDeparture && !routeMap.get(v.assignedRouteId)?.code.includes('CROSS')).length})
          </button>

          <button
            onClick={() => setFilterType('EXTRA')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filterType === 'EXTRA'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            %90 Eşikli İlave Seferler ({vehicles.filter(v => !v.isFixedDeparture).length})
          </button>

          <button
            onClick={() => setFilterType('SHUTTLE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filterType === 'SHUTTLE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cross Dock Besleme Servisleri ({vehicles.filter(v => routeMap.get(v.assignedRouteId)?.code.includes('CROSS')).length})
          </button>

          <button
            onClick={() => setFilterType('CANCELLED')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filterType === 'CANCELLED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            %90 Altında Kalanlar ({vehicles.filter(v => v.status === 'IPTAL_90_KURALI').length})
          </button>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Hat kodu, plaka veya varış ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Main Single Master Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Ana Hat Planlama ve Sefer İcra Tablosu</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ankara merkezli tüm sabit araçlar, %90 eşikli ilave seferler ve besleme ring servisleri tek konsolide tabloda.
            </p>
          </div>
          <span className="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-medium">
            Gösterilen: <strong className="text-slate-900">{filteredVehicles.length}</strong> Araç
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3">Hat &amp; Güzergâh</th>
                <th scope="col" className="px-4 py-3">Sefer &amp; Araç</th>
                <th scope="col" className="px-4 py-3">Plaka / Tip</th>
                <th scope="col" className="px-4 py-3">Planlanan Saat</th>
                <th scope="col" className="px-4 py-3">Kapasite / Operasyon Sınırı</th>
                <th scope="col" className="px-4 py-3">Yüklenen Miktar</th>
                <th scope="col" className="px-4 py-3 min-w-[170px]">Doluluk Oranı (%90 Eşiği)</th>
                <th scope="col" className="px-4 py-3">Kural &amp; İstisna Statüsü</th>
                <th scope="col" className="px-4 py-3">Sefer Durumu</th>
                <th scope="col" className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredVehicles.map(veh => {
                const route = routeMap.get(veh.assignedRouteId);
                const effectiveDesiLimit = route 
                  ? Math.min(veh.maxDesiCapacity, route.routeOperationalMaxDesi)
                  : veh.maxDesiCapacity;
                
                const occupancyPct = effectiveDesiLimit > 0 
                  ? Math.round((veh.currentDesi / effectiveDesiLimit) * 100) 
                  : 0;

                const isCancelled90 = veh.status === 'IPTAL_90_KURALI';
                const isShuttle = route?.code.includes('CROSS');

                return (
                  <tr 
                    key={veh.id} 
                    className={`hover:bg-slate-50/90 transition ${
                      isCancelled90 ? 'bg-rose-50/40' : veh.isFixedDeparture ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    {/* Hat & Güzergah */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px]">
                          {route?.code || 'HATSIZ'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 max-w-[210px] leading-tight truncate" title={route?.name}>
                        {route?.name}
                      </div>
                      {route?.intermediateFacilityIds && route.intermediateFacilityIds.length > 0 && (
                        <span className="inline-block mt-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Ara Duraklı
                        </span>
                      )}
                    </td>

                    {/* Sefer & Sıra */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">{veh.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sefer No: #{veh.tripSequence}
                      </div>
                    </td>

                    {/* Plaka / Tip */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-slate-800">{veh.plate}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{veh.type}</div>
                    </td>

                    {/* Saat */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{veh.departureTime}</span>
                        <span className="text-slate-400">→</span>
                        <span>{veh.arrivalTime}</span>
                      </div>
                    </td>

                    {/* Kapasite / Sınır */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-slate-900 font-medium">
                        {veh.maxDesiCapacity.toLocaleString()} Desi
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span>Hat Sınırı:</span>
                        <strong className="text-slate-700">{route?.routeOperationalMaxDesi.toLocaleString()} Desi</strong>
                      </div>
                    </td>

                    {/* Yüklenen Miktar */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {veh.currentDesi.toLocaleString()} Desi
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {veh.currentPackages} Koli ({veh.assignedLoadIds.length} Konsinye)
                      </div>
                    </td>

                    {/* Doluluk Barı */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">%{occupancyPct}</span>
                          <span className="text-[10px] text-slate-400">
                            {veh.currentDesi} / {effectiveDesiLimit}
                          </span>
                        </div>
                        
                        {/* Progress Bar with 90% indicator tick */}
                        <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isCancelled90
                                ? 'bg-rose-500'
                                : occupancyPct >= 90
                                ? 'bg-emerald-500'
                                : occupancyPct >= 60
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                          />
                          {/* 90% vertical threshold line */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-slate-900/60 z-10" 
                            style={{ left: '90%' }} 
                            title="%90 İlave Araç Eşiği"
                          />
                        </div>

                        {!veh.isFixedDeparture && (
                          <div className="text-[10px] text-slate-500 flex items-center justify-between">
                            <span>Eşik: %90</span>
                            {occupancyPct < 90 ? (
                              <span className="text-rose-600 font-semibold">%{90 - occupancyPct} eksik</span>
                            ) : (
                              <span className="text-emerald-600 font-semibold">Eşik Geçildi</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kural & İstisna */}
                    <td className="px-4 py-3.5">
                      {veh.isFixedDeparture ? (
                        <div className="flex items-start gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">Sabit Sefer Önceliği</span>
                            <span className="text-[10px] text-emerald-700">Doluluk aranmaksızın kesin kalkar</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1 text-[11px] text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">Genel %90 Kuralı</span>
                            <span className="text-[10px] text-slate-500">2. ve sonraki ilave araç</span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Sefer Durumu */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isCancelled90 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          %90 Eşik Altı (İptal)
                        </span>
                      ) : veh.status === 'HAZIR' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Sefer Hazır
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-300">
                          Beklemede
                        </span>
                      )}
                    </td>

                    {/* Aksiyon */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectVehicle(veh)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition"
                      >
                        <span>Detay &amp; Yükler</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
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
