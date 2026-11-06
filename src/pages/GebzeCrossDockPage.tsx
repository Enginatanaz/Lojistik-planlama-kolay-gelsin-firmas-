import React from 'react';
import { Facility, LoadMovement, Route } from '../types/logistics';
import { Warehouse, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

interface GebzeCrossDockPageProps {
  facilities: Facility[];
  loads: LoadMovement[];
  routes: Route[];
  hasCalculated: boolean;
}

export const GebzeCrossDockPage: React.FC<GebzeCrossDockPageProps> = ({
  facilities,
  loads,
  routes,
  hasCalculated
}) => {
  const gebzeFacility = facilities.find(f => f.id === 'FAC-GBZ-CDK');
  const gebzeLoads = loads.filter(l => 
    l.trueDestinationFacilityCode === 'GBZ-CDK' || 
    l.crossDockFacilityCode === 'GBZ-CDK' ||
    l.intermediateStops.some(s => s.toLowerCase().includes('gebze') || s.toLowerCase().includes('kocaeli'))
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-indigo-600" />
            <span>Gebze Cross Dock ve Marmara Aktarma Merkezi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Marmara doğu aksı, Kocaeli sanayi bölgesi ve İstanbul Anadolu giriş kapısı konsolidasyon planı.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono">
          Kapasite: {gebzeFacility?.handlingCapacityDesi.toLocaleString('tr-TR')} Desi/Gün
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block text-[11px]">Tesis Konumu</span>
          <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>GOSB Lojistik Sahası, Gebze/Kocaeli</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ankara - İstanbul Anadolu Otoyolu Üzeri
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block text-[11px]">Marmara Konsolidasyon Hacmi</span>
          <div className="text-lg font-bold text-indigo-700 font-mono mt-1">
            {hasCalculated ? `${gebzeLoads.reduce((s, l) => s + l.totalDesi, 0).toLocaleString('tr-TR')} Desi` : 'Henüz hesaplanmadı'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Geçiş ve aktarma yükleri toplamı
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block text-[11px]">Rampa Durumu</span>
          <div className="text-lg font-bold text-emerald-700 font-mono mt-1 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            6 Rampa Aktif
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            TIR ve Kamyon eşzamanlı boşaltma
          </div>
        </div>
      </div>

      {/* Gebze Corridor Plan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          GEBZE CROSS DOCK GEÇİŞ VE AKTARMA PROTOKOLÜ
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Ankara çıkışlı İstanbul Anadolu (Tuzla/Orhanlı) araçları güzergâh üzerinde Gebze tesisine uğrayarak Kocaeli sanayi bölgesine yönelik parsiyel yükleri rampa transferiyle Gebze dağıtım araçlarına aktarır. Yükün gerçek varış tesisi kaydı sistemde korunur.
        </p>

        <div className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-700">ANK-IST-AND-01</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Gebze Rampa 3 Ara İndirme</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-emerald-800">Tuzla Orhanlı Ana Hub</span>
          </div>
          <span className="text-slate-500 font-sans">Süre: 4.5 Saat</span>
        </div>
      </div>
    </div>
  );
};
