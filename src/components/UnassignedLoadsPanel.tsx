import React, { useState } from 'react';
import { 
  LoadMovement, 
  Vehicle, 
  Facility, 
  Route 
} from '../types/logistics';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Info, 
  ArrowRight, 
  Package, 
  Truck, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface UnassignedLoadsPanelProps {
  unassignedLoads: LoadMovement[];
  vehicles: Vehicle[];
  facilities: Facility[];
  routes: Route[];
  onForceAssignToVehicle: (loadId: string, vehicleId: string) => void;
  onOpenVerificationCenter: () => void;
}

export const UnassignedLoadsPanel: React.FC<UnassignedLoadsPanelProps> = ({
  unassignedLoads,
  vehicles,
  facilities,
  routes,
  onForceAssignToVehicle,
  onOpenVerificationCenter
}) => {
  const [selectedLoadForOverride, setSelectedLoadForOverride] = useState<LoadMovement | null>(null);
  const [targetVehicleId, setTargetVehicleId] = useState<string>('');

  const facilityMap = new Map<string, Facility>();
  facilities.forEach(f => facilityMap.set(f.id, f));

  const totalUnassignedDesi = unassignedLoads.reduce((sum, l) => sum + l.totalDesi, 0);
  const totalUnassignedPackages = unassignedLoads.reduce((sum, l) => sum + l.packageCount, 0);

  // Group by reason
  const below90Loads = unassignedLoads.filter(l => l.unassignedReason === 'SECOND_VEHICLE_BELOW_90');
  const capacityExceededLoads = unassignedLoads.filter(l => l.unassignedReason === 'VEHICLE_CAPACITY_EXCEEDED');
  const routeLimitLoads = unassignedLoads.filter(l => l.unassignedReason === 'ROUTE_OPERATIONAL_LIMIT');
  const verificationLoads = unassignedLoads.filter(l => l.unassignedReason === 'USER_VERIFICATION_REQUIRED');

  return (
    <div className="space-y-6">
      {/* Overview Alert Banner */}
      <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-950 flex items-center gap-2">
                <span>Açıkta Kalan Yük ve Kapasite Yönetim Masası</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                  {unassignedLoads.length} Konsinye Beklemede
                </span>
              </h2>
              <p className="text-xs text-rose-800 mt-1 max-w-2xl leading-relaxed">
                Operasyon kuralı kısıtları (%90 doluluk eşiği, araç kapasitesi, hat operasyonel sınırı veya teyit bekleyen kural kayıtları) nedeniyle sefere verilemeyen yükler burada şeffaf gerekçeleriyle tutulmaktadır.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/80 px-4 py-2.5 rounded-lg border border-rose-200 text-right">
            <div>
              <span className="text-[11px] text-slate-500 block">Açıkta Kalan Desi</span>
              <span className="text-lg font-black text-rose-700">{totalUnassignedDesi.toLocaleString()} Desi</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[11px] text-slate-500 block">Koli Toplamı</span>
              <span className="text-lg font-bold text-slate-900">{totalUnassignedPackages} Koli</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Operational Reasons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* %90 Kuralı Nedeniyle Açıkta */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">%90 Eşiği Altı (2. Araç)</span>
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
              {below90Loads.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 leading-tight">
            İlave araç açılması için asgari %90 doluluk şartı sağlanamadığı için araç açılmadı.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-amber-800">
            Hacim: {below90Loads.reduce((s, l) => s + l.totalDesi, 0).toLocaleString()} Desi
          </div>
        </div>

        {/* Araç Kapasitesi Dolumu */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Kapasite Aşımı</span>
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center">
              {capacityExceededLoads.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 leading-tight">
            Mevcut araçların fiziki desi veya paket hacmi tükendiği için taşamadı.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-800">
            Hacim: {capacityExceededLoads.reduce((s, l) => s + l.totalDesi, 0).toLocaleString()} Desi
          </div>
        </div>

        {/* Hat Operasyonel Sınırı */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Hat Operasyonel Sınırı</span>
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center">
              {routeLimitLoads.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 leading-tight">
            Bolu güzergahı gibi tünel &amp; emniyet sınırı (3000 Desi) kısıtına takıldı.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-800">
            Hacim: {routeLimitLoads.reduce((s, l) => s + l.totalDesi, 0).toLocaleString()} Desi
          </div>
        </div>

        {/* Kullanıcı Doğrulaması Bekleyen */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">Doğrulama Bekleyen</span>
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
              {verificationLoads.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 leading-tight">
            Kaynak kuralındaki belirsizlik çözülene kadar bekletilen konsinyeler.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100">
            <button
              onClick={onOpenVerificationCenter}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
            >
              Kuralı Doğrula →
            </button>
          </div>
        </div>
      </div>

      {/* Unassigned Loads Detailed List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Açıkta Kalan Konsinyeler Detay Listesi
          </h3>
          <span className="text-xs text-slate-500">
            Yük tekilliği ilkesi korunmaktadır (Mükerrer atama yapılamaz).
          </span>
        </div>

        {unassignedLoads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">Açıkta Kalan Yük Yok</h4>
            <p className="text-xs text-slate-500 mt-1">
              Tüm yük konsinyeleri kurallara ve araç kapasitelerine uygun şekilde sefere planlanmıştır.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {unassignedLoads.map(load => {
              const origin = facilityMap.get(load.originFacilityId);
              const trueDest = facilityMap.get(load.trueDestinationFacilityId);

              return (
                <div key={load.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-700 text-sm">
                        {load.trackingNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {load.cargoDescription}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Hat: {load.routeCode}
                      </span>
                    </div>

                    {/* Routing */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-medium text-slate-800">{origin?.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Gerçek Varış: {trueDest?.name} ({trueDest?.code})
                      </span>
                    </div>

                    {/* Volume and Metrics */}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-bold text-slate-900">
                        {load.totalDesi.toLocaleString()} Desi
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-700 font-medium">
                        {load.packageCount} Koli
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-700 font-medium">
                        {load.totalWeightKg.toLocaleString()} kg
                      </span>
                    </div>

                    {/* Unassigned Cause & Explanation */}
                    <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Açıkta Kalma Sebebi:</span>
                        <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                          {load.unassignedExplanation || 'Kapasite veya operasyonel kural eşiği sağlanamadı.'}
                        </p>
                        <div className="mt-1 text-[10px] text-slate-500">
                          Kaynak: <span className="font-medium text-slate-700">{load.ruleSource}</span> (Versiyon: {load.ruleVersion})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex flex-col gap-2">
                    {load.requiresVerification ? (
                      <button
                        onClick={onOpenVerificationCenter}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                      >
                        Kuralı Onayla &amp; Çöz
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedLoadForOverride(load)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                      >
                        Özel İstisna İle Araca Ata
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Override Assignment Modal */}
      {selectedLoadForOverride && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Yönetici Özel İstisnası ile Araç Atama</span>
              </h3>
              <button
                onClick={() => setSelectedLoadForOverride(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <span className="font-bold block mb-1">Operasyonel İstisna Uyarısı:</span>
                <p>
                  Bu işlem %90 eşik kuralını veya hat kapasite kısıtını yönetici inisiyatifiyle aşar.
                  Atama kural denetim günlüğüne "Yönetici Özel İstisnası" olarak işlenir.
                </p>
              </div>

              <div>
                <span className="text-slate-500 block">Konsinye:</span>
                <span className="text-sm font-bold text-slate-900">
                  {selectedLoadForOverride.trackingNumber} ({selectedLoadForOverride.totalDesi} Desi)
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Atanacak Aracı Seçiniz:
                </label>
                <select
                  value={targetVehicleId}
                  onChange={(e) => setTargetVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Araç Seçin --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plate} ({v.name}) - Mevcut: {v.currentDesi}/{v.maxDesiCapacity} Desi - {v.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLoadForOverride(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition"
              >
                İptal
              </button>
              <button
                disabled={!targetVehicleId}
                onClick={() => {
                  if (targetVehicleId) {
                    onForceAssignToVehicle(selectedLoadForOverride.id, targetVehicleId);
                    setSelectedLoadForOverride(null);
                    setTargetVehicleId('');
                  }
                }}
                className="px-4 py-2 bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition"
              >
                İstisna ile Ata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
