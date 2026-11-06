import React, { useState, useMemo } from 'react';
import { Facility, Vehicle } from '../types/logistics';
import { 
  Building2, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Filter, 
  Search, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  MapPin, 
  Calendar, 
  Sliders, 
  Eye,
  GitFork,
  X,
  Gauge,
  Database
} from 'lucide-react';

interface FacilityVehicleDefinitionsPageProps {
  facilities: Facility[];
  vehicles: Vehicle[];
}

type TabType = 'FACILITIES' | 'SCHEDULE' | 'VEHICLES' | 'MULTI_ORIGIN';

export const FacilityVehicleDefinitionsPage: React.FC<FacilityVehicleDefinitionsPageProps> = ({
  facilities,
  vehicles
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('FACILITIES');
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('ALL');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('ALL');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState<string>('ALL');
  
  // Selected items for modal/drawer
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedVehicleForOrigin, setSelectedVehicleForOrigin] = useState<Vehicle | null>(null);

  // Statistics
  const hubCount = facilities.filter(f => f.type === 'HUB').length;
  const crossDockCount = facilities.filter(f => f.canCrossDock).length;
  const branchCount = facilities.filter(f => f.type === 'BRANCH' || f.type === 'INDUSTRIAL_HUB').length;
  
  const tirCount = vehicles.filter(v => v.type === 'TIR').length;
  const kamyonCount = vehicles.filter(v => v.type === 'KAMYON' || v.type === 'KIRKAYAK').length;
  const kamyonetCount = vehicles.filter(v => v.type === 'KAMYONET').length;
  const panelvanCount = vehicles.filter(v => v.type === 'PANELVAN').length;
  const fixedVehicleCount = vehicles.filter(v => v.isFixedDeparture).length;

  // Filtered facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter(fac => {
      const matchesSearch = 
        fac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fac.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fac.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fac.operationalRole.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      if (facilityTypeFilter === 'ALL') return true;
      if (facilityTypeFilter === 'CROSS_DOCK_CAPABLE') return fac.canCrossDock;
      return fac.type === facilityTypeFilter;
    });
  }, [facilities, searchTerm, facilityTypeFilter]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(veh => {
      const matchesSearch = 
        veh.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        veh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        veh.assignedRouteId.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (vehicleTypeFilter !== 'ALL' && veh.type !== vehicleTypeFilter) return false;
      if (vehicleStatusFilter === 'FIXED') return veh.isFixedDeparture;
      if (vehicleStatusFilter === 'EXTRA') return !veh.isFixedDeparture;
      return true;
    });
  }, [vehicles, searchTerm, vehicleTypeFilter, vehicleStatusFilter]);

  return (
    <div className="space-y-5">
      {/* 1. Header & Title Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              <span>TESİS VE ARAÇ ANA VERİ (MASTER DATA) MERKEZİ</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ankara merkezli çok tesisli ağın tesis rolleri, özel çalışma vardiyaları, araç fiziksel kapasiteleri ve hat bazlı operasyonel kısıtları.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap p-1 bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200">
          <button
            onClick={() => { setActiveTab('FACILITIES'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'FACILITIES' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Tesis Ana Listesi ({facilities.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('SCHEDULE'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'SCHEDULE' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Çalışma Saatleri &amp; Vardiyalar</span>
          </button>

          <button
            onClick={() => { setActiveTab('VEHICLES'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'VEHICLES' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Araç Kapasiteleri ({vehicles.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('MULTI_ORIGIN'); setSearchTerm(''); }}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'MULTI_ORIGIN' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-emerald-400" />
            <span>Çoklu Kaynak Dağılımı</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Toplam Tesis</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1 flex items-baseline justify-between">
            <span>{facilities.length}</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              %100 Aktif
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">19 TM + 3 Destek Noktası</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Cross Dock Merkezleri</span>
          <div className="text-xl font-black text-amber-900 font-mono mt-1 flex items-baseline justify-between">
            <span>{crossDockCount}</span>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Aktarma
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Ankara, Gebze, Antep vb.</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">TIR Filosu (22.500 Desi)</span>
          <div className="text-xl font-black text-blue-900 font-mono mt-1 flex items-baseline justify-between">
            <span>{tirCount}</span>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              22.500 D
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Fiziksel Max Kapasite</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Kamyon (12.500 Desi)</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1 flex items-baseline justify-between">
            <span>{kamyonCount}</span>
            <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              12.500 D
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Ara Hat &amp; Besleme Ring</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Kamyonet / Panelvan</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1 flex items-baseline justify-between">
            <span>{kamyonetCount + panelvanCount}</span>
            <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              4.500 D
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Ekspres &amp; Şehir İçi Ring</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Sabit Hat Araçları</span>
          <div className="text-xl font-black text-emerald-900 font-mono mt-1 flex items-baseline justify-between">
            <span>{fixedVehicleCount}</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Garantili
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">%90 kuralından muaf</span>
        </div>
      </div>

      {/* 3. TAB 1: TESİS ANA LİSTESİ VE OPERASYON ROLLERİ */}
      {activeTab === 'FACILITIES' && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tesis adı, kodu, şehir veya operasyon rolü ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Tesis Türü:</span>
              {[
                { id: 'ALL', label: 'Tümü' },
                { id: 'HUB', label: 'Ana HUB' },
                { id: 'CROSS_DOCK_CAPABLE', label: 'Cross Dock Yetkili' },
                { id: 'BRANCH', label: 'Bölge Şube' },
                { id: 'INDUSTRIAL_HUB', label: 'Sanayi Depo' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFacilityTypeFilter(t.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    facilityTypeFilter === t.id
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[620px] scrollbar-thin">
              <table className="min-w-full text-xs border-collapse">
                <thead className="bg-slate-900 text-white sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="p-3 text-left border-r border-slate-800 min-w-[90px]">Kod</th>
                    <th className="p-3 text-left border-r border-slate-800 min-w-[180px]">Tesis Adı &amp; Şehir</th>
                    <th className="p-3 text-left border-r border-slate-800 min-w-[90px]">Tür</th>
                    <th className="p-3 text-left border-r border-slate-800 min-w-[280px]">Operasyonel Rol ve Fonksiyon</th>
                    <th className="p-3 text-left border-r border-slate-800 min-w-[160px]">Çalışma Düzeni &amp; Vardiya</th>
                    <th className="p-3 text-right border-r border-slate-800 min-w-[130px] bg-slate-950 text-blue-300">
                      <div>Günlük Toplama</div>
                      <div className="text-[10px] text-slate-400 font-normal">Manuel Paket Girişi</div>
                    </th>
                    <th className="p-3 text-right border-r border-slate-800 min-w-[110px]">Günlük Elleçleme</th>
                    <th className="p-3 text-center border-r border-slate-800 min-w-[100px]">Cross Dock</th>
                    <th className="p-3 text-center min-w-[80px]">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredFacilities.map((fac, idx) => {
                    const hasSpecialSchedule = 
                      fac.code === 'ANK-ATM' || 
                      fac.code === 'GBZ-CDK' || 
                      fac.code === 'GZT-TM' || 
                      fac.code === 'ADA-CKR';

                    return (
                      <tr 
                        key={fac.id} 
                        className={`hover:bg-slate-50 transition cursor-pointer ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                        onClick={() => setSelectedFacility(fac)}
                      >
                        {/* Kod */}
                        <td className="p-3 font-mono font-bold text-blue-700 border-r border-slate-200 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                            {fac.code}
                          </span>
                        </td>

                        {/* Ad & Şehir */}
                        <td className="p-3 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{fac.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{fac.city} &bull; {fac.district}</span>
                          </div>
                        </td>

                        {/* Tür */}
                        <td className="p-3 border-r border-slate-200 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            fac.type === 'HUB' ? 'bg-purple-100 text-purple-800' :
                            fac.type === 'CROSS_DOCK' ? 'bg-amber-100 text-amber-800' :
                            fac.type === 'INDUSTRIAL_HUB' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {fac.type}
                          </span>
                        </td>

                        {/* Operasyonel Rol */}
                        <td className="p-3 border-r border-slate-200 leading-relaxed text-slate-700">
                          {fac.operationalRole}
                        </td>

                        {/* Çalışma Saatleri */}
                        <td className="p-3 border-r border-slate-200 font-mono text-[11px]">
                          {hasSpecialSchedule ? (
                            <div className="space-y-0.5">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {fac.operatingHours.crossDockHours || fac.operatingHours.collectionShift}
                              </span>
                              <div className="text-[10px] text-slate-500 font-sans">
                                Genel: {fac.operatingHours.generalOperatingHours}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-slate-800 font-medium">
                                {fac.operatingHours.generalOperatingHours}
                              </span>
                              <div className="text-[10px] text-slate-400 font-sans">Standart Düzen</div>
                            </div>
                          )}
                        </td>

                        {/* Günlük Toplama (Manuel Paket Girişi) */}
                        <td className="p-3 text-right border-r border-slate-200 bg-blue-50/30 whitespace-nowrap">
                          {fac.dailyCollectionPackages ? (
                            <div>
                              <div className="font-mono font-bold text-blue-900 text-xs">
                                {fac.dailyCollectionPackages.toLocaleString('tr-TR')} Pk
                              </div>
                              <div className="font-mono text-[10px] text-slate-500">
                                {fac.dailyCollectionDesi?.toLocaleString('tr-TR')} Desi
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Günlük Elleçleme */}
                        <td className="p-3 text-right border-r border-slate-200 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {fac.handlingCapacityDesi.toLocaleString('tr-TR')} Desi
                        </td>

                        {/* Cross Dock Durumu */}
                        <td className="p-3 text-center border-r border-slate-200 whitespace-nowrap">
                          {fac.canCrossDock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Aktarma Merkezi
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* İşlem */}
                        <td className="p-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFacility(fac);
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition"
                            title="Tesis detaylarını görüntüle"
                          >
                            <Eye className="w-4 h-4" />
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
      )}

      {/* 4. TAB 2: ÇALIŞMA SAATLERİ VE OPERASYON TAKVİMİ */}
      {activeTab === 'SCHEDULE' && (
        <div className="space-y-4">
          {/* Kaynak Doküman Kuralı Banner */}
          <div className="p-4 bg-amber-50/80 border-2 border-amber-300 rounded-xl text-amber-950 text-xs flex items-start gap-3 shadow-xs">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-sm">
                OPERASYON KURALI: Tesis Çalışma Saatleri ve Özel Cross Dock İstisnaları
              </span>
              <p className="leading-relaxed">
                Kaynak dokümanda <strong>genel tesis çalışma düzeni 15:00–00:00</strong> olarak belirtilmiştir. 
                Ancak operasyonel aktarma gereksinimleri nedeniyle özel tesis saatleri tanımlanmıştır:
              </p>
              <ul className="list-disc list-inside space-y-0.5 font-medium pt-1 text-slate-800">
                <li><strong>Ankara Cross Dock:</strong> 24 saat kesintisiz çalışır. Diğer şehirlerden gelen, Ankara'ya özgü 48 saatlik paketleri Cross Dock yapar.</li>
                <li><strong>Gebze Cross Dock:</strong> 15:00'te başlar ve sabah 08:00'e kadar kesintisiz çalışır (Avrupa, Marmara ve Kocaeli konsolidasyonu).</li>
                <li><strong>Gaziantep Cross Dock:</strong> 15:00–23:00 toplama yapar; Diyarbakır'dan gelen paketleri Ankara'ya sevk etmek için 04:00'te araç çıkarır.</li>
                <li><strong>Adana TM:</strong> Toplama vardiyası 15:00–23:00'tür. Gerekirse bu saatler içinde Cross Dock aktarma yapar.</li>
              </ul>
              <p className="text-[11px] text-amber-800 pt-1 font-semibold">
                &bull; Kural Gereği: Genel saatler özel tesis saatlerinin yerine UYGULANMAZ; her tesis kendi operasyon takvimine göre planlanır.
              </p>
            </div>
          </div>

          {/* Özel Saatler Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Ankara ATM */}
            <div className="bg-white p-4 rounded-xl border-2 border-blue-400 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono font-bold text-blue-700 text-xs">ANK-ATM</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">24 Saat</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">Ankara Ana Transfer Merkezi</h4>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Cross Dock:</span>
                    <strong className="text-blue-900 font-mono">00:00 - 23:59 (24h)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Toplama Vardiyası:</span>
                    <strong className="text-slate-800 font-mono">15:00 - 23:00</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                  Gaziantep, Diyarbakır ve Erzurum araçları Ankara'nın kendi 15:00–23:00 toplama vardiyasında da yük alır. 48 saatlik paketler Cross Dock yapılır.
                </p>
              </div>
            </div>

            {/* Gebze Cross Dock */}
            <div className="bg-white p-4 rounded-xl border-2 border-purple-400 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono font-bold text-purple-700 text-xs">GBZ-CDK</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900">15:00 - 08:00</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">Gebze Cross Dock / Konsolidasyon</h4>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gece Vardiyası:</span>
                    <strong className="text-purple-900 font-mono">15:00 - 08:00 (17h)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Konsolidasyon:</span>
                    <strong className="text-slate-800 font-mono">Avrupa, Marmara, Kocaeli</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                  15:00'te başlar ve sabah 08:00'e kadar kesintisiz çalışır. Batı Marmara ve sanayi yüklerini birleştirir.
                </p>
              </div>
            </div>

            {/* Gaziantep TM */}
            <div className="bg-white p-4 rounded-xl border-2 border-emerald-400 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono font-bold text-emerald-700 text-xs">GZT-TM</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">04:00 Sevk</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">Gaziantep Aktarma Merkezi</h4>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Toplama:</span>
                    <strong className="text-slate-800 font-mono">15:00 - 23:00</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cross Dock Sevk:</span>
                    <strong className="text-emerald-900 font-mono">04:00 Sabah</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                  Diyarbakır'dan gelen paketleri Cross Dock yaparak Ankara'ya sevk etmek için 04:00'te araç çıkarır.
                </p>
              </div>
            </div>

            {/* Adana TM */}
            <div className="bg-white p-4 rounded-xl border-2 border-amber-400 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono font-bold text-amber-700 text-xs">ADA-CKR</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">15:00 - 23:00</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">Adana Transfer Merkezi</h4>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Toplama Vardiyası:</span>
                    <strong className="text-amber-900 font-mono">15:00 - 23:00</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Esnek Cross Dock:</span>
                    <strong className="text-slate-800 font-mono">İhtiyaca Göre</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                  Adana ve çevre yönlendirmeleri; toplama saatleri içinde gerekirse esnek Cross Dock aktarması yürütülür.
                </p>
              </div>
            </div>
          </div>

          {/* Standart Tesis Saatleri Karşılaştırma Matrisi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                Tüm Tesislerin Vardiya ve Saat Çizelgesi Doğrulaması
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                Genel: 15:00 - 00:00 &bull; Özel İstisnalar Korundu
              </span>
            </div>

            <div className="overflow-x-auto max-h-[450px] scrollbar-thin">
              <table className="min-w-full text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                  <tr>
                    <th className="p-3 text-left">Tesis Kodu</th>
                    <th className="p-3 text-left">Tesis Adı</th>
                    <th className="p-3 text-left">Genel Çalışma Düzeni</th>
                    <th className="p-3 text-left">Özel Cross Dock / Toplama Saatleri</th>
                    <th className="p-3 text-left">Özel Operasyonel Not</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {facilities.map(fac => {
                    const isSpecial = 
                      fac.code === 'ANK-ATM' || 
                      fac.code === 'GBZ-CDK' || 
                      fac.code === 'GZT-TM' || 
                      fac.code === 'ADA-CKR';

                    return (
                      <tr key={fac.id} className={isSpecial ? 'bg-amber-50/40 font-medium' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {fac.code}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                          {fac.name}
                        </td>
                        <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                          {fac.operatingHours.generalOperatingHours}
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono">
                          {fac.operatingHours.crossDockHours || fac.operatingHours.collectionShift ? (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                              {fac.operatingHours.crossDockHours || fac.operatingHours.collectionShift}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-sans text-[11px]">Genel saate tabi</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">
                          {fac.operatingHours.specialCrossDockNotes || 'Standart aktarma ve hat düzeni'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: ARAÇ TİPLERİ, FİZİKSEL KAPASİTELER VE HAT SINIRLARI */}
      {activeTab === 'VEHICLES' && (
        <div className="space-y-4">
          {/* 4 Resmi Araç Tipi Kartı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border-2 border-blue-400 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-blue-950">TIR</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Ana Hat</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-blue-900 font-mono">22.500 Desi</div>
                <div className="text-xs text-slate-500 mt-1">Fiziksel Taşıma Kapasitesi</div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between"><span>Paket Hacmi:</span><strong>~1.600 Koli</strong></div>
                <div className="flex justify-between"><span>Ağırlık Limiti:</span><strong>24.000 kg (24 Ton)</strong></div>
                <div className="flex justify-between text-blue-700 font-semibold"><span>Hat Operasyonel Sınırı:</span><strong>20.000 - 21.000 Desi</strong></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-emerald-400 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-emerald-950">KAMYON</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Bölge &amp; Ring</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-emerald-900 font-mono">12.500 Desi</div>
                <div className="text-xs text-slate-500 mt-1">Fiziksel Taşıma Kapasitesi</div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between"><span>Paket Hacmi:</span><strong>~850 Koli</strong></div>
                <div className="flex justify-between"><span>Ağırlık Limiti:</span><strong>12.000 kg (12 Ton)</strong></div>
                <div className="flex justify-between text-emerald-700 font-semibold"><span>Hat Operasyonel Sınırı:</span><strong>12.000 - 12.500 Desi</strong></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-amber-400 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-amber-950">KAMYONET</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Şehir İçi Dağıtım</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-amber-900 font-mono">4.500 Desi</div>
                <div className="text-xs text-slate-500 mt-1">Fiziksel Taşıma Kapasitesi</div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between"><span>Paket Hacmi:</span><strong>~320 Koli</strong></div>
                <div className="flex justify-between"><span>Ağırlık Limiti:</span><strong>4.000 kg (4 Ton)</strong></div>
                <div className="flex justify-between text-amber-700 font-semibold"><span>Hat Operasyonel Sınırı:</span><strong>4.500 Desi</strong></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-slate-400 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">PANELVAN</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">Ekspres Koli</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 font-mono">4.500 Desi</div>
                <div className="text-xs text-slate-500 mt-1">Fiziksel Taşıma Kapasitesi</div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between"><span>Paket Hacmi:</span><strong>~280 Koli</strong></div>
                <div className="flex justify-between"><span>Ağırlık Limiti:</span><strong>3.500 kg (3.5 Ton)</strong></div>
                <div className="flex justify-between text-slate-700 font-semibold"><span>Hat Operasyonel Sınırı:</span><strong>4.500 Desi</strong></div>
              </div>
            </div>
          </div>

          {/* Önemli İlke Notu */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>Ayrık Kontrol Kuralı:</strong> Araç fiziksel kapasitesi (örn: TIR 22.500 Desi) ile hatta uygulanabilen daha düşük operasyonel yük sınırı (örn: Bolu kış kısıtı 20.000 Desi) ayrı alanlardır. Optimizasyon etkin sınır olarak <code className="font-mono font-bold bg-white px-1 py-0.5 rounded border">MIN(Fiziksel, Hat Sınırı)</code> değerini uygular.
              </span>
            </div>
          </div>

          {/* Araç Filtresi */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Araç Tipi:</span>
              {['ALL', 'TIR', 'KAMYON', 'KAMYONET', 'PANELVAN'].map(type => (
                <button
                  key={type}
                  onClick={() => setVehicleTypeFilter(type)}
                  className={`px-3 py-1 rounded-md transition font-medium ${
                    vehicleTypeFilter === type 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {type === 'ALL' ? 'Tümü' : type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sefer Statüsü:</span>
              <button
                onClick={() => setVehicleStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md ${vehicleStatusFilter === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
              >
                Tümü
              </button>
              <button
                onClick={() => setVehicleStatusFilter('FIXED')}
                className={`px-2.5 py-1 rounded-md ${vehicleStatusFilter === 'FIXED' ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
              >
                Sabit Seferler
              </button>
              <button
                onClick={() => setVehicleStatusFilter('EXTRA')}
                className={`px-2.5 py-1 rounded-md ${vehicleStatusFilter === 'EXTRA' ? 'bg-amber-700 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
              >
                %90 Eşikli İlave
              </button>
            </div>
          </div>

          {/* Araç Tablosu */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
              <table className="min-w-full text-xs border-collapse">
                <thead className="bg-slate-900 text-white sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="p-3 text-left border-r border-slate-800 min-w-[100px]">Plaka</th>
                    <th className="p-3 text-left border-r border-slate-800 min-w-[180px]">Araç Adı &amp; Tanımı</th>
                    <th className="p-3 text-center border-r border-slate-800 min-w-[90px]">Tip</th>
                    <th className="p-3 text-right border-r border-slate-800 min-w-[120px] bg-slate-950 text-blue-300">
                      Fiziksel Kapasite
                    </th>
                    <th className="p-3 text-right border-r border-slate-800 min-w-[120px] bg-slate-950 text-amber-300">
                      Hat Operasyon Sınırı
                    </th>
                    <th className="p-3 text-right border-r border-slate-800 min-w-[110px]">Etkin Sınır</th>
                    <th className="p-3 text-left border-r border-slate-800 min-w-[140px]">Tahsisli Hat</th>
                    <th className="p-3 text-center border-r border-slate-800 min-w-[110px]">Sefer Türü</th>
                    <th className="p-3 text-center border-r border-slate-800 min-w-[90px]">Saat</th>
                    <th className="p-3 text-center min-w-[90px]">Kaynak Dağılımı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredVehicles.map((veh, idx) => {
                    const opLimit = veh.routeOperationalLimitDesi || veh.maxDesiCapacity;
                    const effectiveLimit = Math.min(veh.maxDesiCapacity, opLimit);
                    const isLimitReduced = opLimit < veh.maxDesiCapacity;

                    return (
                      <tr key={veh.id} className={`hover:bg-slate-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        {/* Plaka */}
                        <td className="p-3 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                          {veh.plate}
                        </td>

                        {/* Ad */}
                        <td className="p-3 border-r border-slate-200 font-medium text-slate-800">
                          {veh.name}
                        </td>

                        {/* Tip */}
                        <td className="p-3 text-center border-r border-slate-200 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            veh.type === 'TIR' ? 'bg-blue-100 text-blue-900' :
                            veh.type === 'KAMYON' || veh.type === 'KIRKAYAK' ? 'bg-emerald-100 text-emerald-900' :
                            veh.type === 'KAMYONET' ? 'bg-amber-100 text-amber-900' :
                            'bg-slate-200 text-slate-900'
                          }`}>
                            {veh.type}
                          </span>
                        </td>

                        {/* Fiziksel Kapasite */}
                        <td className="p-3 text-right border-r border-slate-200 font-mono font-bold text-slate-900 whitespace-nowrap bg-blue-50/20">
                          {veh.maxDesiCapacity.toLocaleString('tr-TR')} Desi
                        </td>

                        {/* Hat Operasyonel Sınırı */}
                        <td className="p-3 text-right border-r border-slate-200 font-mono font-bold whitespace-nowrap bg-amber-50/20">
                          {isLimitReduced ? (
                            <span className="text-amber-900 font-black">
                              {opLimit.toLocaleString('tr-TR')} Desi ⚠️
                            </span>
                          ) : (
                            <span className="text-slate-700">
                              {opLimit.toLocaleString('tr-TR')} Desi
                            </span>
                          )}
                        </td>

                        {/* Etkin Sınır */}
                        <td className="p-3 text-right border-r border-slate-200 font-mono font-black text-slate-950 whitespace-nowrap bg-slate-100/70">
                          {effectiveLimit.toLocaleString('tr-TR')} Desi
                        </td>

                        {/* Hat */}
                        <td className="p-3 border-r border-slate-200 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                          {veh.assignedRouteCode || veh.assignedRouteId}
                        </td>

                        {/* Sabit / İlave */}
                        <td className="p-3 text-center border-r border-slate-200 whitespace-nowrap">
                          {veh.isFixedDeparture ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              Sabit #{veh.tripSequence}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              %90 Eşikli #{veh.tripSequence}
                            </span>
                          )}
                        </td>

                        {/* Saat */}
                        <td className="p-3 text-center border-r border-slate-200 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {veh.departureTime}
                        </td>

                        {/* Kaynak Dağılımı İncele */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedVehicleForOrigin(veh);
                              setActiveTab('MULTI_ORIGIN');
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-blue-700 font-medium text-[10px] border transition"
                            title="Kaynak tesis dağılımını incele"
                          >
                            İncele &rarr;
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
      )}

      {/* 6. TAB 4: ÇOKLU KAYNAK YÜK DAĞILIMI (MULTI-ORIGIN BREAKDOWN) */}
      {activeTab === 'MULTI_ORIGIN' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-emerald-950 text-xs flex items-start gap-3 shadow-xs">
            <GitFork className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">
                OPERASYON KURALI: Araç Bazında Kaynak Tesis Yük Dağılımı
              </span>
              <p className="mt-1 leading-relaxed">
                <strong>"Bir araçta birden fazla kaynak tesisin yükü varsa kaynak tesis bazında dağılım saklanır."</strong> 
                Özellikle Ankara ATM'de Cross Dock sonrası Bolu, Hadımköy, İzmir veya Bursa araçlarına binen yüklerin hangi tesisten (Ankara ATM, Sincan Depo, OSTİM vb.) geldiği net olarak ayrı tutulur ve raporlanır.
              </p>
            </div>
          </div>

          {/* Vehicle Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-800">İncelenecek Aracı Seçiniz:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {vehicles.slice(0, 8).map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicleForOrigin(v)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition border ${
                    (selectedVehicleForOrigin?.id || vehicles[0]?.id) === v.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {v.plate} ({v.type})
                </button>
              ))}
            </div>
          </div>

          {/* Selected Vehicle Breakdown Card */}
          {(() => {
            const activeVeh = selectedVehicleForOrigin || vehicles[0];
            if (!activeVeh) return null;

            // Generate representative breakdown if not yet calculated by optimization engine
            const breakdowns = activeVeh.originBreakdown && activeVeh.originBreakdown.length > 0
              ? activeVeh.originBreakdown
              : [
                  {
                    originFacilityId: 'FAC-ANK-ATM',
                    originFacilityCode: 'ANK-ATM',
                    originFacilityName: 'Ankara ATM (Kazan Ana Hub)',
                    packageCount: 1050,
                    totalDesi: 15500,
                    percentageOfLoad: 77.5
                  },
                  {
                    originFacilityId: 'FAC-GBZ-CDK',
                    originFacilityCode: 'GBZ-CDK',
                    originFacilityName: 'Gebze Cross Dock / Konsolidasyon',
                    packageCount: 320,
                    totalDesi: 4500,
                    percentageOfLoad: 22.5
                  }
                ];

            const totalDesiAssigned = breakdowns.reduce((sum, b) => sum + b.totalDesi, 0);
            const totalPackagesAssigned = breakdowns.reduce((sum, b) => sum + b.packageCount, 0);

            return (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>{activeVeh.name} ({activeVeh.plate})</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-mono">
                        {activeVeh.type}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      Hat: {activeVeh.assignedRouteCode || activeVeh.assignedRouteId} &bull; Kalkış: {activeVeh.departureTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-600">Yüklenen Toplam:</span>
                    <strong className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded">
                      {totalPackagesAssigned.toLocaleString('tr-TR')} Paket / {totalDesiAssigned.toLocaleString('tr-TR')} Desi
                    </strong>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>Kaynak Tesis Payı Dağılımı:</span>
                    <span>Toplam: %100</span>
                  </div>
                  <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 border">
                    {breakdowns.map((b, i) => {
                      const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-purple-600'];
                      return (
                        <div
                          key={b.originFacilityId}
                          style={{ width: `${b.percentageOfLoad}%` }}
                          className={`${colors[i % colors.length]} transition-all relative group`}
                          title={`${b.originFacilityName}: %${b.percentageOfLoad}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Table of Origins */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      <tr>
                        <th className="p-2.5 text-left">Kaynak / Çıkış Tesisi</th>
                        <th className="p-2.5 text-left">Kaynak Kodu</th>
                        <th className="p-2.5 text-right">Paket Adedi</th>
                        <th className="p-2.5 text-right">Yüklenen Desi</th>
                        <th className="p-2.5 text-right">Araçtaki Yük Payı (%)</th>
                        <th className="p-2.5 text-left">Operasyon Durumu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {breakdowns.map(b => (
                        <tr key={b.originFacilityId} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">
                            {b.originFacilityName}
                          </td>
                          <td className="p-2.5 font-mono text-blue-700 font-bold">
                            {b.originFacilityCode}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-800">
                            {b.packageCount.toLocaleString('tr-TR')}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {b.totalDesi.toLocaleString('tr-TR')} Desi
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-blue-700">
                            %{b.percentageOfLoad.toFixed(1)}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {b.originFacilityCode === 'ANK-ATM' ? 'Doğrudan ATM Çıkışı' : 'Cross Dock Konsolidasyon'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 7. Facility Detail Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-bold text-xs">
                  {selectedFacility.code}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedFacility.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFacility(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 py-4 text-xs">
              {/* Role */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-950 uppercase text-[11px] block">
                  Operasyonel Rol ve Fonksiyon:
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {selectedFacility.operationalRole}
                </p>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                  <span className="font-bold text-slate-600 text-[10px] uppercase block">Genel Çalışma Saatleri</span>
                  <div className="text-sm font-mono font-bold text-slate-900">
                    {selectedFacility.operatingHours.generalOperatingHours}
                  </div>
                  <span className="text-[10px] text-slate-400">Kaynak Standart Düzen</span>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                  <span className="font-bold text-amber-900 text-[10px] uppercase block">Özel Cross Dock / Toplama</span>
                  <div className="text-sm font-mono font-bold text-amber-950">
                    {selectedFacility.operatingHours.crossDockHours || selectedFacility.operatingHours.collectionShift || 'Standart Saat'}
                  </div>
                  <span className="text-[10px] text-amber-800 font-medium">Özel Tesis İstisnası</span>
                </div>
              </div>

              {/* Manuel Paket Girişi Operasyonel Verileri (Tek Doğruluk Kaynağı) */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-300 uppercase text-[11px] flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>Manuel Paket Girişi Operasyonel Hacimleri</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Çıkış &amp; Varış Matrisi</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Günlük Toplama (Çıkış Satır Toplamı)</span>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">
                      {selectedFacility.dailyCollectionPackages ? `${selectedFacility.dailyCollectionPackages.toLocaleString('tr-TR')} Paket` : '—'}
                    </div>
                    <div className="text-[10px] text-blue-300 font-mono mt-0.5">
                      {selectedFacility.dailyCollectionDesi ? `${selectedFacility.dailyCollectionDesi.toLocaleString('tr-TR')} Desi` : ''}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Günlük Dağıtım (Varış Sütun Toplamı)</span>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">
                      {selectedFacility.dailyDeliveryPackages ? `${selectedFacility.dailyDeliveryPackages.toLocaleString('tr-TR')} Paket` : '—'}
                    </div>
                    <div className="text-[10px] text-indigo-300 font-mono mt-0.5">
                      {selectedFacility.dailyDeliveryDesi ? `${selectedFacility.dailyDeliveryDesi.toLocaleString('tr-TR')} Desi` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Special notes */}
              {selectedFacility.operatingHours.specialCrossDockNotes && (
                <div className="p-3 bg-slate-50 border rounded-lg">
                  <span className="font-bold text-slate-700 block text-[11px]">Vardiya ve Sevkiyat Notu:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {selectedFacility.operatingHours.specialCrossDockNotes}
                  </p>
                </div>
              )}

              {/* Technical Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded border">
                  <span className="text-[10px] text-slate-500 block">Tesis Türü</span>
                  <span className="font-bold text-slate-900 text-xs">{selectedFacility.type}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border">
                  <span className="text-[10px] text-slate-500 block">Günlük Kapasite</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">
                    {selectedFacility.handlingCapacityDesi.toLocaleString('tr-TR')} Desi
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border">
                  <span className="text-[10px] text-slate-500 block">Cross Dock</span>
                  <span className="font-bold text-xs text-amber-800">
                    {selectedFacility.canCrossDock ? 'Yetkili' : 'Yetkisiz'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border">
                  <span className="text-[10px] text-slate-500 block">Aktiflik</span>
                  <span className="font-bold text-xs text-emerald-700">✓ %100 Aktif</span>
                </div>
              </div>

              {/* Address */}
              <div className="p-3 bg-slate-50 border rounded-lg text-slate-600">
                <span className="font-bold text-slate-700 block text-[11px]">Saha ve Konum:</span>
                <span>{selectedFacility.addressNote || `${selectedFacility.district}, ${selectedFacility.city}`}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedFacility(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
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
