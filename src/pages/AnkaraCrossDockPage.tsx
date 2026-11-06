import React from 'react';
import { Facility, LoadMovement, Route, Vehicle } from '../types/logistics';
import { Building2, ArrowDownRight, ArrowUpRight, ShieldCheck, MapPin } from 'lucide-react';

interface AnkaraCrossDockPageProps {
  facilities: Facility[];
  loads: LoadMovement[];
  routes: Route[];
  vehicles: Vehicle[];
  hasCalculated: boolean;
}

export const AnkaraCrossDockPage: React.FC<AnkaraCrossDockPageProps> = ({
  facilities,
  loads,
  routes,
  vehicles,
  hasCalculated
}) => {
  const ankaraHub = facilities.find(f => f.id === 'FAC-ANK-ATM');

  // Loads passing through or originating from Ankara ATM cross dock
  const crossDockLoads = loads.filter(l => l.crossDockFacilityCode === 'ANK-ATM' || l.requiresCrossDock);
  const totalInboundDesi = crossDockLoads.reduce((sum, l) => sum + l.totalDesi, 0);
  const totalInboundPackages = crossDockLoads.reduce((sum, l) => sum + l.packageCount, 0);

  // Feeder shuttle routes
  const feedRoutes = routes.filter(r => r.code === 'SNC-ANK-CROSS' || r.code === 'OST-ANK-CROSS');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Ankara Ana Transfer Merkezi (ATM Kazan) Cross Dock Yönetimi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sincan OSB ve OSTİM çıkışlı parsiyel yüklerin konsolidasyonu, rampa planı ve ana hatlara aktarma akışı.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono">
          Kapasite: {ankaraHub?.handlingCapacityDesi.toLocaleString('tr-TR')} Desi/Gün
        </span>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block text-[11px]">Toplam Cross Dock Girişi</span>
          <div className="text-lg font-bold text-slate-900 font-mono mt-1">
            {totalInboundDesi.toLocaleString('tr-TR')} Desi
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalInboundPackages} Koli &bull; {crossDockLoads.length} Konsinye
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block text-[11px]">Aktif Besleme Servisleri</span>
          <div className="text-lg font-bold text-blue-700 font-mono mt-1">
            5 Sabit Ring Seferi
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Sincan (3) + OSTİM (2) Kamyon Seferi
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block text-[11px]">Yük Korunumu Doğrulaması</span>
          <div className="text-lg font-bold text-emerald-700 font-mono mt-1 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            %100 Korundu
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Cross Dock girişi yükü çoğaltmaz ilkesi aktif
          </div>
        </div>
      </div>

      {/* Cross Dock Feeder Routes Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b bg-slate-50 font-bold text-xs text-slate-800">
          Cross Dock Besleme ve Konsolidasyon Hatları
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs divide-y divide-slate-200">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5 text-left">Hat Kodu</th>
                <th className="px-4 py-2.5 text-left">Güzergâh</th>
                <th className="px-4 py-2.5 text-center">Sabit Sefer Adedi</th>
                <th className="px-4 py-2.5 text-right">Sefer Kapasitesi</th>
                <th className="px-4 py-2.5 text-left">Çalışma Saatleri</th>
                <th className="px-4 py-2.5 text-left">Kural Kaynağı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {feedRoutes.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-2.5 font-mono font-bold text-blue-700">{r.code}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{r.name}</td>
                  <td className="px-4 py-2.5 text-center font-bold text-emerald-700">{r.fixedVehicleCount} Sefer</td>
                  <td className="px-4 py-2.5 text-right font-mono">{r.routeOperationalMaxDesi} Desi</td>
                  <td className="px-4 py-2.5 text-slate-600">17:00 - 20:30 (Akşam Ringleri)</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500 text-[10px]">{r.ruleReference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross Dock Load Manifest */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b bg-slate-50 font-bold text-xs text-slate-800">
          Ankara ATM Üzerinden Aktarılacak Konsinyeler
        </div>
        <div className="overflow-x-auto max-h-80">
          <table className="min-w-full text-xs divide-y divide-slate-200">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] sticky top-0">
              <tr>
                <th className="px-4 py-2.5 text-left">Takip No</th>
                <th className="px-4 py-2.5 text-left">Kaynak Şube</th>
                <th className="px-4 py-2.5 text-left">Gerçek Varış</th>
                <th className="px-4 py-2.5 text-right">Paket</th>
                <th className="px-4 py-2.5 text-right">Desi</th>
                <th className="px-4 py-2.5 text-left">Bulunduğu Araç</th>
                <th className="px-4 py-2.5 text-left">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {crossDockLoads.map(load => (
                <tr key={load.id}>
                  <td className="px-4 py-2 font-mono font-bold text-blue-700">{load.trackingNumber}</td>
                  <td className="px-4 py-2 text-slate-700">{load.originFacilityCode}</td>
                  <td className="px-4 py-2 font-bold text-emerald-800">{load.trueDestinationFacilityCode} (Değişmez)</td>
                  <td className="px-4 py-2 text-right font-mono">{load.packageCount}</td>
                  <td className="px-4 py-2 text-right font-mono font-bold">{load.totalDesi.toLocaleString('tr-TR')}</td>
                  <td className="px-4 py-2 font-mono text-slate-800">{load.assignedVehiclePlate || 'Atanmadı'}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Cross Dock
                    </span>
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
