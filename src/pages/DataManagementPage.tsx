import React, { useState } from 'react';
import { 
  LoadMovement, 
  Facility, 
  Vehicle, 
  Route 
} from '../types/logistics';
import { 
  Database, 
  Search, 
  Filter, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Download, 
  PlusCircle,
  FileText
} from 'lucide-react';

interface DataManagementPageProps {
  loads: LoadMovement[];
  facilities: Facility[];
  vehicles: Vehicle[];
  routes: Route[];
  onOpenNewLoadModal: () => void;
}

export const DataManagementPage: React.FC<DataManagementPageProps> = ({
  loads,
  facilities,
  vehicles,
  routes,
  onOpenNewLoadModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('ALL');
  const [selectedDest, setSelectedDest] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const facilityMap = new Map<string, Facility>();
  facilities.forEach(f => facilityMap.set(f.id, f));

  const filteredLoads = loads.filter(l => {
    const matchesSearch = 
      l.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.originFacilityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.trueDestinationFacilityCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedOrigin !== 'ALL' && l.originFacilityId !== selectedOrigin) return false;
    if (selectedDest !== 'ALL' && l.trueDestinationFacilityId !== selectedDest) return false;
    if (selectedStatus !== 'ALL' && l.status !== selectedStatus) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Veri Yönetimi ve Konsinye Veri Havuzu</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tüm sevkiyat kayıtları, çıkış ve gerçek varış tesisleri, operasyonel cross dock atamaları ve kural referansları.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewLoadModal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            + Yeni Yük Ekle
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Takip no, kargo tanımı..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="ALL">Tüm Çıkış Tesisleri</option>
            {facilities.filter(f => f.canOriginate).map(f => (
              <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
            ))}
          </select>

          <select
            value={selectedDest}
            onChange={(e) => setSelectedDest(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="ALL">Tüm Varış Tesisleri</option>
            {facilities.filter(f => f.canReceive).map(f => (
              <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="PLANLANDI">Planlandı</option>
            <option value="CROSS_DOCK_BEKLIYOR">Cross Dock Bekliyor</option>
            <option value="ACIKTA_KALAN">Açıkta Kalan Yük</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          Toplam <strong>{filteredLoads.length}</strong> / {loads.length} Kayıt
        </span>
      </div>

      {/* Main Wide Data Table with Horizontal Scroll & Sticky Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[580px] scrollbar-thin">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b">Takip No</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b">Yük Tanımı</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b">1. Çıkış Tesisi</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b">2. Gerçek Varış Tesisi</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b">3. Cross Dock</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b">4. Güzergâh</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b text-right">5. Paket</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b text-right">6. Desi</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b text-right">Ağırlık</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b">7. Araç Plakası</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b">8. Durum</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap border-b">9. Kural &amp; Sürüm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLoads.map(load => {
                const origin = facilityMap.get(load.originFacilityId);
                const trueDest = facilityMap.get(load.trueDestinationFacilityId);
                const isUnassigned = load.status === 'ACIKTA_KALAN' || !load.assignedVehicleId;

                return (
                  <tr key={load.id} className={`hover:bg-slate-50 transition ${isUnassigned ? 'bg-rose-50/20' : ''}`}>
                    <td className="px-3.5 py-2.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {load.trackingNumber}
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-slate-900 max-w-[200px] truncate" title={load.cargoDescription}>
                      {load.cargoDescription}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-700">
                      {origin?.code} - {origin?.city}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap font-bold text-emerald-800 bg-emerald-50/60">
                      {trueDest?.code} - {trueDest?.city}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-600">
                      {load.requiresCrossDock ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                          {load.crossDockFacilityCode || 'ANK-ATM'}
                        </span>
                      ) : (
                        <span className="text-slate-400">Direkt</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-slate-600">
                      {load.routeCode}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-right font-bold text-slate-800">
                      {load.packageCount}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-right font-bold text-slate-900">
                      {load.totalDesi.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-right text-slate-500">
                      {load.totalWeightKg.toLocaleString('tr-TR')} kg
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap font-mono font-semibold text-slate-800">
                      {load.assignedVehiclePlate || <span className="text-rose-600">Atanmadı</span>}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        load.status === 'PLANLANDI'
                          ? 'bg-blue-100 text-blue-800'
                          : load.status === 'CROSS_DOCK_BEKLIYOR'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {load.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-500 font-mono text-[10px]">
                      {load.ruleVersion}
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
