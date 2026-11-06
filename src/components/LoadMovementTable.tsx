import React, { useState } from 'react';
import { 
  LoadMovement, 
  Facility, 
  Vehicle, 
  Route 
} from '../types/logistics';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Truck, 
  ShieldCheck, 
  FileCode, 
  Package, 
  Layers,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface LoadMovementTableProps {
  loads: LoadMovement[];
  facilities: Facility[];
  vehicles: Vehicle[];
  routes: Route[];
  onOpenNewLoadModal: () => void;
  onSelectLoad?: (load: LoadMovement) => void;
}

export const LoadMovementTable: React.FC<LoadMovementTableProps> = ({
  loads,
  facilities,
  vehicles,
  routes,
  onOpenNewLoadModal,
  onSelectLoad
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [originFilter, setOriginFilter] = useState<string>('ALL');
  const [selectedRuleInfo, setSelectedRuleInfo] = useState<{ source: string; version: string; explanation?: string } | null>(null);

  const facilityMap = new Map<string, Facility>();
  facilities.forEach(f => facilityMap.set(f.id, f));

  const vehicleMap = new Map<string, Vehicle>();
  vehicles.forEach(v => vehicleMap.set(v.id, v));

  const filteredLoads = loads.filter(load => {
    const matchesSearch = 
      load.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.originFacilityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.trueDestinationFacilityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (load.assignedVehiclePlate && load.assignedVehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ACIKTA_KALAN' && load.status !== 'ACIKTA_KALAN') return false;
      if (statusFilter === 'CROSS_DOCK' && !load.requiresCrossDock) return false;
      if (statusFilter === 'PLANLANDI' && load.status !== 'PLANLANDI') return false;
    }

    if (originFilter !== 'ALL' && load.originFacilityId !== originFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Takip No, kargo tanımı, plaka..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 w-56 sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tüm Durumlar ({loads.length})</option>
            <option value="PLANLANDI">Planlandı / Hazır</option>
            <option value="CROSS_DOCK">Cross Dock İntikal</option>
            <option value="ACIKTA_KALAN">Açıkta Kalan / Bekleyen</option>
          </select>

          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tüm Çıkış Tesisleri</option>
            <option value="FAC-ANK-ATM">Ankara ATM (Kazan)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Toplam: <strong className="text-slate-800">{filteredLoads.length}</strong> Konsinye
          </span>
          <button
            onClick={onOpenNewLoadModal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            + Yeni Yük Ekle
          </button>
        </div>
      </div>

      {/* Main Table satisfying complete Data Model */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Yük Hareketleri ve Konsinye Veri Modeli</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Her yükün çıkış tesisi, değişmez gerçek varış tesisi, cross dock noktası, güzergahı, hacmi, aracı, statüsü ve kural sürümü.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Gerçek Varış Asla Değiştirilemez İlkesi
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3">Takip / Yük Tanımı</th>
                <th scope="col" className="px-4 py-3">1. Kaynak / Çıkış Tesisi</th>
                <th scope="col" className="px-4 py-3">2. Gerçek Varış Tesisi</th>
                <th scope="col" className="px-4 py-3">3. Cross Dock Aktarma</th>
                <th scope="col" className="px-4 py-3">4. Güzergâh ve Ara Duraklar</th>
                <th scope="col" className="px-4 py-3">5. Paket</th>
                <th scope="col" className="px-4 py-3">6. Toplam Desi</th>
                <th scope="col" className="px-4 py-3">7. Bulunduğu Araç</th>
                <th scope="col" className="px-4 py-3">8. Hareket Durumu</th>
                <th scope="col" className="px-4 py-3">9. Kural Kaynağı &amp; Sürüm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredLoads.map(load => {
                const origin = facilityMap.get(load.originFacilityId);
                const trueDest = facilityMap.get(load.trueDestinationFacilityId);
                const crossDock = load.crossDockFacilityId ? facilityMap.get(load.crossDockFacilityId) : null;
                const vehicle = load.assignedVehicleId ? vehicleMap.get(load.assignedVehicleId) : null;

                const isUnassigned = load.status === 'ACIKTA_KALAN' || !load.assignedVehicleId;

                return (
                  <tr 
                    key={load.id}
                    className={`hover:bg-slate-50 transition ${
                      isUnassigned ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Takip / Tanım */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-blue-700">{load.trackingNumber}</div>
                      <div className="text-[11px] text-slate-600 font-medium max-w-[180px] truncate" title={load.cargoDescription}>
                        {load.cargoDescription}
                      </div>
                      {load.priorityLevel === 'SABIT_TAAHHUT' && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                          Sabit Taahhüt
                        </span>
                      )}
                    </td>

                    {/* 1. Kaynak Tesisi */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{origin?.city} - {origin?.code}</span>
                      <div className="text-[10px] text-slate-500">{origin?.name}</div>
                    </td>

                    {/* 2. Gerçek Varış Tesisi (Asla Değişmez!) */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                          {trueDest?.city} - {trueDest?.code}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{trueDest?.name}</div>
                    </td>

                    {/* 3. Operasyonel Cross Dock */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {load.requiresCrossDock && crossDock ? (
                        <div>
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 text-[11px]">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {crossDock.code}
                          </span>
                          <div className="text-[10px] text-amber-700 mt-0.5">Aktarma Merkezi</div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          Direkt Sevkiyat
                        </span>
                      )}
                    </td>

                    {/* 4. Güzergah & Ara Duraklar */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800 text-[11px]">{load.routeCode}</div>
                      <div className="text-[10px] text-slate-500 flex items-center flex-wrap gap-1 mt-0.5">
                        {load.intermediateStops.map((stop, sIdx) => (
                          <React.Fragment key={sIdx}>
                            <span>{stop}</span>
                            {sIdx < load.intermediateStops.length - 1 && (
                              <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </td>

                    {/* 5. Paket Adedi */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{load.packageCount}</span>
                      <span className="text-[10px] text-slate-500 ml-1">Koli</span>
                    </td>

                    {/* 6. Toplam Desi */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{load.totalDesi.toLocaleString()} Desi</div>
                      <div className="text-[10px] text-slate-500">{load.totalWeightKg.toLocaleString()} kg</div>
                    </td>

                    {/* 7. Bulunduğu Araç */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {vehicle ? (
                        <div>
                          <div className="font-mono font-bold text-blue-700 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {vehicle.plate}
                          </div>
                          <div className="text-[10px] text-slate-500">{vehicle.name}</div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-semibold border border-rose-200">
                          Açıkta / Atanmadı
                        </span>
                      )}
                    </td>

                    {/* 8. Hareket Durumu */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {load.status === 'PLANLANDI' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          Planlandı
                        </span>
                      )}
                      {load.status === 'CROSS_DOCK_BEKLIYOR' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Cross Dock Seferinde
                        </span>
                      )}
                      {load.status === 'ACIKTA_KALAN' && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Açıkta Kalan Yük
                          </span>
                          {load.unassignedExplanation && (
                            <div className="text-[10px] text-rose-700 mt-1 max-w-[180px] leading-tight truncate" title={load.unassignedExplanation}>
                              {load.unassignedExplanation}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 9. Kural Kaynağı & Sürümü */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelectedRuleInfo({
                          source: load.ruleSource,
                          version: load.ruleVersion,
                          explanation: load.unassignedExplanation
                        })}
                        className="text-left group flex items-start gap-1 p-1 rounded hover:bg-slate-100 transition"
                      >
                        <FileCode className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] group-hover:text-blue-600 flex items-center gap-1">
                            <span>{load.ruleSource}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-blue-600" />
                          </div>
                          <div className="text-[10px] text-indigo-600 font-mono">
                            Sürüm: {load.ruleVersion}
                          </div>
                        </div>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule Info Modal */}
      {selectedRuleInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Kural Kaynağı ve Sürüm Detayı</span>
              </h3>
              <button
                onClick={() => setSelectedRuleInfo(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Referans Doküman:</span>
                <span className="text-sm font-bold text-slate-900">{selectedRuleInfo.source}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Kural Versiyonu:</span>
                <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-0.5">
                  {selectedRuleInfo.version}
                </span>
              </div>

              {selectedRuleInfo.explanation && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="font-bold text-rose-900 block mb-1">Operasyonel Durum Açıklaması:</span>
                  <p className="text-rose-800 leading-relaxed">{selectedRuleInfo.explanation}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRuleInfo(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
