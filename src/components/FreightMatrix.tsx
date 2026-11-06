import React, { useState } from 'react';
import { 
  Facility, 
  LoadMovement, 
  MatrixCell 
} from '../types/logistics';
import { 
  Grid3X3, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  Plus, 
  RefreshCw, 
  HelpCircle,
  Truck
} from 'lucide-react';

interface FreightMatrixProps {
  facilities: Facility[];
  loads: LoadMovement[];
  onUpdateLoadDesi: (loadId: string, newDesi: number, newPackages: number) => void;
  onSimulateSurge: () => void;
}

export const FreightMatrix: React.FC<FreightMatrixProps> = ({
  facilities,
  loads,
  onUpdateLoadDesi,
  onSimulateSurge
}) => {
  const originFacilities = facilities.filter(f => f.canOriginate);
  const destinationFacilities = facilities.filter(f => f.canReceive);

  const [selectedCell, setSelectedCell] = useState<{
    origin: Facility;
    dest: Facility;
    cellLoads: LoadMovement[];
    totalPackages: number;
    totalDesi: number;
  } | null>(null);

  // Build matrix data
  const matrixData = new Map<string, { packages: number; desi: number; loadIds: string[]; requiresCrossDock: boolean }>();

  loads.forEach(load => {
    const key = `${load.originFacilityId}__${load.trueDestinationFacilityId}`;
    const existing = matrixData.get(key) || { 
      packages: 0, 
      desi: 0, 
      loadIds: [], 
      requiresCrossDock: load.requiresCrossDock 
    };

    existing.packages += load.packageCount;
    existing.desi += load.totalDesi;
    existing.loadIds.push(load.id);
    existing.requiresCrossDock = load.requiresCrossDock;

    matrixData.set(key, existing);
  });

  // Calculate totals
  const originTotals = new Map<string, { packages: number; desi: number }>();
  const destTotals = new Map<string, { packages: number; desi: number }>();

  originFacilities.forEach(orig => {
    let p = 0; let d = 0;
    destinationFacilities.forEach(dest => {
      const cell = matrixData.get(`${orig.id}__${dest.id}`);
      if (cell) {
        p += cell.packages;
        d += cell.desi;
      }
    });
    originTotals.set(orig.id, { packages: p, desi: d });
  });

  destinationFacilities.forEach(dest => {
    let p = 0; let d = 0;
    originFacilities.forEach(orig => {
      const cell = matrixData.get(`${orig.id}__${dest.id}`);
      if (cell) {
        p += cell.packages;
        d += cell.desi;
      }
    });
    destTotals.set(dest.id, { packages: p, desi: d });
  });

  const grandTotalDesi = Array.from(destTotals.values()).reduce((sum, item) => sum + item.desi, 0);
  const grandTotalPackages = Array.from(destTotals.values()).reduce((sum, item) => sum + item.packages, 0);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-blue-600" />
            <span>Paket ve Desi Akış Matrisi (O-D Matrix)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Çıkış tesisleri (Ankara ATM, Sincan, OSTİM) ile varış tesisleri arasındaki yük hacmi ve direkt/aktarma güzergâh dağılımı.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateSurge}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
            title="İstanbul Anadolu talebini 1.900 Desi artırarak 3. Tır %90 eşiğini test et"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>+1900 Desi İlave Yük Simülasyonu (%90 Testi)</span>
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 text-left font-semibold border-r border-slate-800 min-w-[200px]">
                  Çıkış Noktası \ Varış
                </th>
                {destinationFacilities.map(dest => (
                  <th key={dest.id} className="p-3 text-center border-r border-slate-800 min-w-[125px]">
                    <div className="font-bold text-white">{dest.city}</div>
                    <div className="text-[10px] text-slate-300 font-mono">{dest.code}</div>
                  </th>
                ))}
                <th className="p-3 text-center bg-slate-950 text-amber-400 font-bold min-w-[120px]">
                  Toplam Çıkış
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {originFacilities.map((orig, rIdx) => {
                const rowTot = originTotals.get(orig.id) || { packages: 0, desi: 0 };
                const isCrossDockOrigin = orig.id !== 'FAC-ANK-ATM';

                return (
                  <tr key={orig.id} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    {/* Origin Row Header */}
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-900 bg-slate-100/50">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{orig.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{orig.code} ({orig.district})</div>
                      {isCrossDockOrigin ? (
                        <span className="inline-block mt-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Cross Dock Zorunlu
                        </span>
                      ) : (
                        <span className="inline-block mt-1 text-[10px] text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          Ana Hub / Direkt Çıkış
                        </span>
                      )}
                    </td>

                    {/* Matrix Cells */}
                    {destinationFacilities.map(dest => {
                      const cell = matrixData.get(`${orig.id}__${dest.id}`);
                      const packages = cell?.packages || 0;
                      const desi = cell?.desi || 0;
                      const hasCargo = packages > 0 || desi > 0;
                      const requiresCross = isCrossDockOrigin;

                      return (
                        <td
                          key={dest.id}
                          onClick={() => {
                            if (hasCargo && cell) {
                              const cellLoads = loads.filter(l => cell.loadIds.includes(l.id));
                              setSelectedCell({
                                origin: orig,
                                dest,
                                cellLoads,
                                totalPackages: packages,
                                totalDesi: desi
                              });
                            }
                          }}
                          className={`p-2.5 text-center border-r border-slate-200 transition ${
                            hasCargo 
                              ? 'cursor-pointer hover:bg-blue-50/80' 
                              : 'text-slate-300'
                          }`}
                        >
                          {hasCargo ? (
                            <div className="space-y-1">
                              <div className="font-bold text-slate-900 text-sm">
                                {desi.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">Desi</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                {packages} <span className="text-[10px]">Koli</span>
                              </div>
                              <div>
                                {requiresCross ? (
                                  <span className="inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                    Cross Dock
                                  </span>
                                ) : (
                                  <span className="inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Direkt Sefer
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Row Total */}
                    <td className="p-3 text-center bg-slate-100/90 font-bold border-l border-slate-300 text-slate-900">
                      <div>{rowTot.desi.toLocaleString()} Desi</div>
                      <div className="text-[11px] text-slate-500 font-normal">{rowTot.packages} Koli</div>
                    </td>
                  </tr>
                );
              })}

              {/* Column Totals */}
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                <td className="p-3 border-r border-slate-800 text-amber-400">
                  Toplam Varış Hacmi
                </td>
                {destinationFacilities.map(dest => {
                  const colTot = destTotals.get(dest.id) || { packages: 0, desi: 0 };
                  return (
                    <td key={dest.id} className="p-3 text-center border-r border-slate-800">
                      <div className="text-white text-xs">{colTot.desi.toLocaleString()} Desi</div>
                      <div className="text-[10px] text-slate-300 font-normal">{colTot.packages} Koli</div>
                    </td>
                  );
                })}
                <td className="p-3 text-center bg-slate-950 text-amber-400 font-black text-sm">
                  <div>{grandTotalDesi.toLocaleString()} Desi</div>
                  <div className="text-[10px] text-slate-400 font-normal">{grandTotalPackages} Koli</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cell Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedCell.origin.name}</span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <span>{selectedCell.dest.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toplam: <strong>{selectedCell.totalDesi.toLocaleString()} Desi</strong> ({selectedCell.totalPackages} Koli, {selectedCell.cellLoads.length} Konsinye)
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
              {selectedCell.cellLoads.map(load => (
                <div key={load.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-blue-700">{load.trackingNumber}</div>
                    <div className="text-slate-700 font-medium">{load.cargoDescription}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {load.totalDesi} Desi • {load.packageCount} Koli • {load.totalWeightKg} kg
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                      load.status === 'PLANLANDI' 
                        ? 'bg-blue-100 text-blue-800'
                        : load.status === 'CROSS_DOCK_BEKLIYOR'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {load.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {load.assignedVehiclePlate ? `Araç: ${load.assignedVehiclePlate}` : 'Açıkta'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCell(null)}
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
