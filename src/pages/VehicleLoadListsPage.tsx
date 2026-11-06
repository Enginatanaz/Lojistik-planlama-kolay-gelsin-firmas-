import React, { useState } from 'react';
import { Vehicle, LoadMovement, Route, Facility } from '../types/logistics';
import { ClipboardList, Truck, Printer, Download, Clock, Package } from 'lucide-react';

interface VehicleLoadListsPageProps {
  vehicles: Vehicle[];
  loads: LoadMovement[];
  routes: Route[];
  facilities: Facility[];
  hasCalculated: boolean;
}

export const VehicleLoadListsPage: React.FC<VehicleLoadListsPageProps> = ({
  vehicles,
  loads,
  routes,
  facilities,
  hasCalculated
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');

  const activeVehicles = vehicles.filter(v => v.status === 'HAZIR' || v.assignedLoadIds.length > 0);
  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || activeVehicles[0] || vehicles[0];
  const currentRoute = routes.find(r => r.id === currentVehicle?.assignedRouteId);
  const vehicleLoads = loads.filter(l => currentVehicle?.assignedLoadIds.includes(l.id));

  const facilityMap = new Map<string, Facility>();
  facilities.forEach(f => facilityMap.set(f.id, f));

  return (
    <div className="space-y-4">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <span>Araç Yükleme Listeleri ve Çıkış Manifestoları</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sefere hazır araçların koli bazlı yükleme fişleri, rampa atamaları ve irsaliye dökümleri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Manifestoyu Yazdır</span>
          </button>
        </div>
      </div>

      {/* Vehicle Selection Strip */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto text-xs scrollbar-thin">
        <span className="text-slate-500 font-semibold shrink-0">Araç Seçimi:</span>
        {vehicles.map(veh => {
          const isSelected = veh.id === currentVehicle?.id;
          const hasCargo = veh.assignedLoadIds.length > 0;

          return (
            <button
              key={veh.id}
              onClick={() => setSelectedVehicleId(veh.id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                  : hasCargo
                  ? 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                  : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {veh.plate} ({veh.assignedLoadIds.length} Yük)
            </button>
          );
        })}
      </div>

      {/* Manifest Sheet */}
      {currentVehicle ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Manifest Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black font-mono text-slate-900">{currentVehicle.plate}</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200">
                  {currentVehicle.type}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                  {currentVehicle.name}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Hat: <strong className="text-blue-700">{currentRoute?.code}</strong> &bull; {currentRoute?.name}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 border rounded-lg">
                <span className="text-slate-400 block text-[10px]">Kalkış Saati</span>
                <span className="font-bold text-slate-900">{currentVehicle.departureTime}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border rounded-lg">
                <span className="text-slate-400 block text-[10px]">Toplam Yüklenen</span>
                <span className="font-bold text-emerald-700">
                  {hasCalculated ? `${currentVehicle.currentDesi} Desi` : 'Henüz hesaplanmadı'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border rounded-lg">
                <span className="text-slate-400 block text-[10px]">Toplam Koli</span>
                <span className="font-bold text-slate-900">
                  {hasCalculated ? `${currentVehicle.currentPackages} Koli` : 'Henüz hesaplanmadı'}
                </span>
              </div>
            </div>
          </div>

          {/* Cargo Manifest Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs divide-y divide-slate-200 border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-3.5 py-2.5 text-left">Sıra</th>
                  <th className="px-3.5 py-2.5 text-left">Takip No</th>
                  <th className="px-3.5 py-2.5 text-left">Kargo Açıklaması</th>
                  <th className="px-3.5 py-2.5 text-left">Çıkış Şubesi</th>
                  <th className="px-3.5 py-2.5 text-left">Gerçek Varış Tesisi</th>
                  <th className="px-3.5 py-2.5 text-right">Paket</th>
                  <th className="px-3.5 py-2.5 text-right">Desi</th>
                  <th className="px-3.5 py-2.5 text-right">Ağırlık</th>
                  <th className="px-3.5 py-2.5 text-left">Öncelik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {vehicleLoads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      Bu araca henüz atanmış konsinye yükü bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  vehicleLoads.map((load, idx) => {
                    const origin = facilityMap.get(load.originFacilityId);
                    const trueDest = facilityMap.get(load.trueDestinationFacilityId);

                    return (
                      <tr key={load.id} className="hover:bg-slate-50">
                        <td className="px-3.5 py-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-3.5 py-2 font-mono font-bold text-blue-700">{load.trackingNumber}</td>
                        <td className="px-3.5 py-2 font-medium text-slate-800">{load.cargoDescription}</td>
                        <td className="px-3.5 py-2 text-slate-600">{origin?.code}</td>
                        <td className="px-3.5 py-2 font-bold text-emerald-800">{trueDest?.name} ({trueDest?.code})</td>
                        <td className="px-3.5 py-2 text-right font-mono font-bold">{load.packageCount}</td>
                        <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">{load.totalDesi.toLocaleString('tr-TR')}</td>
                        <td className="px-3.5 py-2 text-right font-mono text-slate-500">{load.totalWeightKg.toLocaleString('tr-TR')} kg</td>
                        <td className="px-3.5 py-2 font-semibold text-slate-700 text-[10px]">{load.priorityLevel}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};
