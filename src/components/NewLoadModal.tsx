import React, { useState } from 'react';
import { 
  Facility, 
  Route, 
  LoadMovement 
} from '../types/logistics';
import { 
  PlusCircle, 
  Package, 
  Layers, 
  ShieldCheck, 
  MapPin, 
  ArrowRight 
} from 'lucide-react';

interface NewLoadModalProps {
  facilities: Facility[];
  routes: Route[];
  onAddLoad: (newLoad: LoadMovement) => void;
  onClose: () => void;
}

export const NewLoadModal: React.FC<NewLoadModalProps> = ({
  facilities,
  routes,
  onAddLoad,
  onClose
}) => {
  const originFacilities = facilities.filter(f => f.canOriginate);
  const destinationFacilities = facilities.filter(f => f.canReceive);

  const [originId, setOriginId] = useState(originFacilities[0]?.id || 'FAC-ANK-ATM');
  const [destId, setDestId] = useState(destinationFacilities[0]?.id || 'FAC-IST-AND');
  const [cargoDesc, setCargoDesc] = useState('');
  const [packageCount, setPackageCount] = useState<number>(150);
  const [totalDesi, setTotalDesi] = useState<number>(450);
  const [totalWeight, setTotalWeight] = useState<number>(2200);
  const [priority, setPriority] = useState<LoadMovement['priorityLevel']>('NORMAL');

  const originFac = facilities.find(f => f.id === originId);
  const destFac = facilities.find(f => f.id === destId);

  const requiresCrossDock = originId !== 'FAC-ANK-ATM';

  // Determine route
  let routeCode = 'ANK-IST-AND-01';
  let routeId = 'ROUTE-ANK-IST-AND';
  let stops = ['Ankara ATM', destFac?.name || 'Varış'];

  if (requiresCrossDock) {
    routeCode = 'ANK-CROSS';
    routeId = 'ROUTE-ANK-CROSS';
    stops = [originFac?.name || 'Kaynak', 'Ankara ATM Cross Dock'];
  } else {
    if (destFac?.city === 'İstanbul') {
      if (destFac.district?.includes('Avrupa') || destFac.district?.includes('Hadımköy')) {
        routeCode = 'ANK-IST-AVR-01';
        routeId = 'ROUTE-ANK-IST-AVR';
      } else {
        routeCode = 'ANK-IST-AND-01';
        routeId = 'ROUTE-ANK-IST-AND';
      }
    } else if (destFac?.city === 'İzmir') {
      routeCode = 'ANK-IZM-01';
      routeId = 'ROUTE-ANK-IZM';
    } else if (destFac?.city === 'Bursa' || destFac?.city === 'Eskişehir') {
      routeCode = 'ANK-BUR-01';
      routeId = 'ROUTE-ANK-BUR';
      stops = ['Ankara ATM', 'Eskişehir Ara Durak', 'Bursa Nilüfer'];
    } else if (destFac?.city === 'Antalya') {
      routeCode = 'ANK-ANT-01';
      routeId = 'ROUTE-ANK-ANT';
    } else if (destFac?.city === 'Adana') {
      routeCode = 'ANK-ADA-01';
      routeId = 'ROUTE-ANK-ADA';
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trackingNumber = `YK-${originFac?.code || 'ANK'}-${destFac?.code || 'DST'}-${Math.floor(100 + Math.random() * 900)}`;

    const newLoad: LoadMovement = {
      id: `LOAD-${Date.now()}`,
      trackingNumber,
      cargoDescription: cargoDesc || `${destFac?.city} Parsiyel Sevkiyatı`,
      originFacilityId: originId,
      originFacilityCode: originFac?.code || 'ANK-ATM',
      trueDestinationFacilityId: destId, // Gerçek varış ASLA DEĞİŞMEZ!
      trueDestinationFacilityCode: destFac?.code || 'DEST',
      crossDockFacilityId: requiresCrossDock ? 'FAC-ANK-ATM' : null,
      crossDockFacilityCode: requiresCrossDock ? 'ANK-ATM' : null,
      requiresCrossDock,
      routeId,
      routeCode,
      intermediateStops: stops,
      packageCount,
      totalDesi,
      totalWeightKg: totalWeight,
      assignedVehicleId: null,
      assignedVehiclePlate: null,
      status: 'PLANLANDI',
      ruleSource: 'Merkez Operasyon Yönergesi v2.4 Md. 4.1',
      ruleVersion: 'v2.4',
      requiresVerification: false,
      createdAt: new Date().toISOString(),
      priorityLevel: priority
    };

    onAddLoad(newLoad);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Yeni Yük / Konsinye Kaydı
              </h3>
              <p className="text-xs text-slate-500">
                Veri modeline uygun yeni operasyonel yük hareketi ekle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Origin and True Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                1. Kaynak / Çıkış Tesisi:
              </label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {originFacilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                2. Gerçek Varış Tesisi:
              </label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {destinationFacilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cross Dock Status Banner */}
          <div className="p-2.5 rounded-lg border text-[11px] flex items-center justify-between bg-slate-50 border-slate-200">
            <div>
              <span className="text-slate-500 block">Operasyonel Aktarma (Cross Dock):</span>
              <span className="font-bold text-slate-800">
                {requiresCrossDock ? 'Ankara ATM Cross Dock Zorunlu' : 'Doğrudan Hat (Direkt Sevkiyat)'}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
              requiresCrossDock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {requiresCrossDock ? 'Konsolidasyon Ringi' : 'Ana Hat Seferi'}
            </span>
          </div>

          {/* Cargo description */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Kargo &amp; Konsinye Açıklaması:
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Otomotiv Yedek Parça veya E-Ticaret Kolileri"
              value={cargoDesc}
              onChange={(e) => setCargoDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Volume and Weight */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Paket (Koli):
              </label>
              <input
                type="number"
                required
                min={1}
                value={packageCount}
                onChange={(e) => setPackageCount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Toplam Desi:
              </label>
              <input
                type="number"
                required
                min={1}
                value={totalDesi}
                onChange={(e) => setTotalDesi(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ağırlık (kg):
              </label>
              <input
                type="number"
                required
                min={1}
                value={totalWeight}
                onChange={(e) => setTotalWeight(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Hizmet / Öncelik Seviyesi:
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as LoadMovement['priorityLevel'])}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="NORMAL">Normal Parsiyel</option>
              <option value="SABIT_TAAHHUT">Sabit Sefer Taahhütlü (Öncelikli)</option>
              <option value="KRITIK">Kritik / Hızlı Teslim</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Yükü Kaydet ve Plana Al
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
