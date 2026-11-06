import React from 'react';
import { 
  Vehicle, 
  Route, 
  LoadMovement, 
  Facility 
} from '../types/logistics';
import { 
  Truck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Package, 
  AlertCircle, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  routes: Route[];
  loads: LoadMovement[];
  facilities: Facility[];
  onClose: () => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  routes,
  loads,
  facilities,
  onClose
}) => {
  if (!vehicle) return null;

  const route = routes.find(r => r.id === vehicle.assignedRouteId);
  const assignedLoads = loads.filter(l => vehicle.assignedLoadIds.includes(l.id));

  const facilityMap = new Map<string, Facility>();
  facilities.forEach(f => facilityMap.set(f.id, f));

  const effectiveMaxDesi = route 
    ? Math.min(vehicle.maxDesiCapacity, route.routeOperationalMaxDesi) 
    : vehicle.maxDesiCapacity;

  const occupancyPct = effectiveMaxDesi > 0 
    ? Math.round((vehicle.currentDesi / effectiveMaxDesi) * 100) 
    : 0;

  const isCancelled90 = vehicle.status === 'IPTAL_90_KURALI';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-mono">
                  {vehicle.plate}
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 border">
                  {vehicle.type}
                </span>
                {vehicle.isFixedDeparture ? (
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Sabit Sefer #{vehicle.tripSequence}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">
                    %90 Eşikli İlave Sefer
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {vehicle.name} • Hat: <strong className="text-blue-700">{route?.code}</strong>
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-5 py-4 text-xs">
          {/* Times and Route */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-slate-500 block text-[11px]">Güzergâh:</span>
              <span className="text-xs font-bold text-slate-800">{route?.name}</span>
            </div>

            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-[10px] text-slate-400 block">Kalkış - Varış:</span>
                <span className="text-xs font-bold text-slate-800">
                  {vehicle.departureTime} → {vehicle.arrivalTime}
                </span>
              </div>
            </div>
          </div>

          {/* Route Stops Sequence */}
          {route && route.stops.length > 0 && (
            <div>
              <span className="font-bold text-slate-700 block mb-2">Güzergâh ve Durak Sıralaması:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {route.stops.map((stop, sIdx) => (
                  <React.Fragment key={stop.facilityId}>
                    <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm shrink-0">
                      <div className="text-[10px] text-slate-400 font-mono">Durak #{stop.stopIndex}</div>
                      <div className="font-bold text-slate-800">{stop.facilityName}</div>
                      <div className="text-[10px] text-indigo-600 font-medium">
                        {stop.isOrigin ? 'Çıkış Noktası' : stop.isDestination ? 'Son Varış' : 'Ara İndirme/Bindirme'}
                      </div>
                    </div>
                    {sIdx < route.stops.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Dual Capacity & Occupancy Visualization */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Kapasite ve Doluluk Denetimi:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                isCancelled90 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                %{occupancyPct} Doluluk
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  isCancelled90 ? 'bg-rose-500' : occupancyPct >= 90 ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(occupancyPct, 100)}%` }}
              />
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10" 
                style={{ left: '90%' }} 
                title="%90 Eşik Çizgisi"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
              <div className="p-2 bg-slate-50 rounded border">
                <span className="text-slate-400 block text-[10px]">Araç Fiziki Kapasitesi</span>
                <span className="font-bold text-slate-800">{vehicle.maxDesiCapacity} Desi</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border">
                <span className="text-slate-400 block text-[10px]">Hat Operasyonel Sınırı</span>
                <span className="font-bold text-indigo-700">{route?.routeOperationalMaxDesi} Desi</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border">
                <span className="text-slate-400 block text-[10px]">Yüklenen Toplam</span>
                <span className="font-bold text-emerald-700">{vehicle.currentDesi} Desi</span>
              </div>
            </div>

            {vehicle.exceptionNote && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{vehicle.exceptionNote}</span>
              </div>
            )}
          </div>

          {/* Assigned Loads Manifest */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">
                Araç Yük Manifestosu ({assignedLoads.length} Konsinye / {vehicle.currentPackages} Koli):
              </span>
              <span className="text-[11px] text-slate-500">
                Yük Tekilliği Korunmaktadır
              </span>
            </div>

            {assignedLoads.length === 0 ? (
              <div className="p-6 text-center text-slate-400 border border-dashed rounded-xl">
                Bu araca henüz atanmış yük bulunmamaktadır.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {assignedLoads.map(load => {
                  const trueDest = facilityMap.get(load.trueDestinationFacilityId);
                  return (
                    <div key={load.id} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">{load.trackingNumber}</span>
                          <span className="text-slate-700 font-medium">{load.cargoDescription}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Gerçek Varış: <strong className="text-emerald-700">{trueDest?.name}</strong> • Öncelik: {load.priorityLevel}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900">{load.totalDesi} Desi</span>
                        <div className="text-[10px] text-slate-500">{load.packageCount} Koli</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
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
