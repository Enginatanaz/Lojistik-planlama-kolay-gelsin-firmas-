import React from 'react';
import { Facility, LoadMovement } from '../types/logistics';
import { ForecastResult, FORECAST_FACILITIES, getForecastIndexForFacility } from '../services/forecastEngine';
import { BarChart3, Database } from 'lucide-react';

interface DesiMatrixPageProps {
  facilities: Facility[];
  loads: LoadMovement[];
  forecast?: ForecastResult;
}

export const DesiMatrixPage: React.FC<DesiMatrixPageProps> = ({
  facilities,
  loads,
  forecast
}) => {
  // Sort facilities according to strict FORECAST_FACILITIES ordering (0..19)
  const orderedFacilities = [...facilities].sort((a, b) => {
    const idxA = getForecastIndexForFacility(a.code);
    const idxB = getForecastIndexForFacility(b.code);
    return idxA - idxB;
  });

  const originFacilities = orderedFacilities.filter(f => f.canOriginate);
  const destinationFacilities = orderedFacilities.filter(f => f.canReceive);

  // If forecast is provided, use exact forecast desi matrix values
  const getCellDesi = (orig: Facility, dest: Facility): number => {
    if (forecast) {
      const i = getForecastIndexForFacility(orig.code);
      const j = getForecastIndexForFacility(dest.code);
      if (i >= 0 && j >= 0 && forecast.desiMatrix[i]) {
        return forecast.desiMatrix[i][j] || 0;
      }
    }
    const matchingLoads = loads.filter(l => l.originFacilityId === orig.id && l.trueDestinationFacilityId === dest.id);
    return matchingLoads.reduce((sum, l) => sum + l.totalDesi, 0);
  };

  const getRowTotal = (orig: Facility, rowIndex: number): number => {
    if (forecast) {
      const i = getForecastIndexForFacility(orig.code);
      if (i >= 0 && forecast.desiRowTotals[i] !== undefined) {
        return forecast.desiRowTotals[i];
      }
    }
    return destinationFacilities.reduce((sum, dest) => sum + getCellDesi(orig, dest), 0);
  };

  const getColTotal = (dest: Facility, colIndex: number): number => {
    if (forecast) {
      const j = getForecastIndexForFacility(dest.code);
      if (j >= 0 && forecast.desiColTotals[j] !== undefined) {
        return forecast.desiColTotals[j];
      }
    }
    return originFacilities.reduce((sum, orig) => sum + getCellDesi(orig, dest), 0);
  };

  const grandTotalDesi = forecast 
    ? forecast.grandDesiTotal 
    : originFacilities.reduce((sum, orig, i) => sum + getRowTotal(orig, i), 0);

  return (
    <div className="space-y-4">
      {/* Title & Status */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Desi Dağılım Matrisi (20×20 Hacimsel Desi Tablosu)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Soldaki sütun <strong>Çıkış Tesislerini (Günlük Toplama Desisi)</strong>, üstteki satır ise <strong>Varış Tesislerini (Günlük Varış Desisi)</strong> temsil eder.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-xs font-semibold">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Kaynak: Manuel Paket Girişi Modülü</span>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3.5 py-1.5 rounded-lg shadow-2xs">
            Genel Toplam: {grandTotalDesi.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} Desi
          </span>
        </div>
      </div>

      {/* Table with horizontal scroll and fixed header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[620px] scrollbar-thin">
          <table className="min-w-full text-xs border-collapse">
            <thead className="bg-slate-900 text-white sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="p-3 text-left font-semibold border-r border-slate-800 min-w-[210px] sticky left-0 bg-slate-900 z-20">
                  <div className="text-indigo-300 font-bold">Çıkış Tesisleri \ Varış</div>
                  <div className="text-[10px] text-slate-400 font-normal">Soldaki sütun: Günlük Toplama Desisi</div>
                </th>
                {destinationFacilities.map((dest) => (
                  <th key={dest.id} className="p-2.5 text-center border-r border-slate-800 min-w-[105px]">
                    <div className="font-bold text-white text-[11px] truncate">{dest.city}</div>
                    <div className="text-[10px] text-indigo-300 font-mono font-semibold">{dest.code}</div>
                  </th>
                ))}
                <th className="p-3 text-center bg-slate-950 text-indigo-400 font-bold min-w-[125px] sticky right-0 z-20">
                  <div>Günlük Toplama</div>
                  <div className="text-[10px] text-slate-300 font-normal">(Çıkış Desi)</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {originFacilities.map((orig, rIdx) => {
                const rowSum = getRowTotal(orig, rIdx);
                return (
                  <tr key={orig.id} className={rIdx % 2 === 0 ? 'bg-white hover:bg-indigo-50/40' : 'bg-slate-50/60 hover:bg-indigo-50/40'}>
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-900 bg-slate-100/80 sticky left-0 z-10">
                      <div className="font-bold text-[11px]">{orig.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between mt-0.5">
                        <span className="font-bold text-indigo-700">{orig.code}</span>
                        <span className="text-slate-400">{orig.city}</span>
                      </div>
                    </td>

                    {destinationFacilities.map((dest) => {
                      const desi = getCellDesi(orig, dest);
                      const isDiagonal = orig.id === dest.id;
                      return (
                        <td 
                          key={dest.id} 
                          className={`p-2 text-center border-r border-slate-200 ${
                            isDiagonal ? 'bg-indigo-50/60' : ''
                          }`}
                        >
                          {desi > 0 ? (
                            <span className={`font-mono text-[11px] ${
                              isDiagonal ? 'font-bold text-indigo-800' : 'font-semibold text-slate-900'
                            }`}>
                              {desi.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="p-3 text-right bg-slate-100/90 font-bold text-slate-900 border-l border-slate-300 font-mono text-[11px] sticky right-0 z-10">
                      {rowSum.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800 sticky bottom-0 z-20">
                <td className="p-3 border-r border-slate-800 text-indigo-300 sticky left-0 bg-slate-900 z-30">
                  <div className="font-black">Günlük Dağıtım (Varış Desisi)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Tüm Tesislerin Giriş Desisi</div>
                </td>
                {destinationFacilities.map((dest, cIdx) => {
                  const colSum = getColTotal(dest, cIdx);
                  return (
                    <td key={dest.id} className="p-2.5 text-center border-r border-slate-800 font-mono text-[11px] text-slate-100 font-bold">
                      {colSum.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}
                    </td>
                  );
                })}
                <td className="p-3 text-right bg-slate-950 text-indigo-400 font-black font-mono text-sm sticky right-0 z-30">
                  {grandTotalDesi.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
