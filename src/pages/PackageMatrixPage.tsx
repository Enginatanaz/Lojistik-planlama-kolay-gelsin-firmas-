import React from 'react';
import { Facility, LoadMovement } from '../types/logistics';
import { ForecastResult, FORECAST_FACILITIES, getForecastIndexForFacility } from '../services/forecastEngine';
import { Grid3X3, CheckCircle, Database } from 'lucide-react';

interface PackageMatrixPageProps {
  facilities: Facility[];
  loads: LoadMovement[];
  forecast?: ForecastResult;
}

export const PackageMatrixPage: React.FC<PackageMatrixPageProps> = ({
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

  // If forecast is provided, use exact forecast matrix values
  // Otherwise fall back to calculating from loads
  const getCellPackageCount = (orig: Facility, dest: Facility): number => {
    if (forecast) {
      const i = getForecastIndexForFacility(orig.code);
      const j = getForecastIndexForFacility(dest.code);
      if (i >= 0 && j >= 0 && forecast.packageMatrix[i]) {
        return forecast.packageMatrix[i][j] || 0;
      }
    }
    const matchingLoads = loads.filter(l => l.originFacilityId === orig.id && l.trueDestinationFacilityId === dest.id);
    return matchingLoads.reduce((sum, l) => sum + l.packageCount, 0);
  };

  const getRowTotal = (orig: Facility, rowIndex: number): number => {
    if (forecast) {
      const i = getForecastIndexForFacility(orig.code);
      if (i >= 0 && forecast.packageRowTotals[i] !== undefined) {
        return forecast.packageRowTotals[i];
      }
    }
    return destinationFacilities.reduce((sum, dest) => sum + getCellPackageCount(orig, dest), 0);
  };

  const getColTotal = (dest: Facility, colIndex: number): number => {
    if (forecast) {
      const j = getForecastIndexForFacility(dest.code);
      if (j >= 0 && forecast.packageColTotals[j] !== undefined) {
        return forecast.packageColTotals[j];
      }
    }
    return originFacilities.reduce((sum, orig) => sum + getCellPackageCount(orig, dest), 0);
  };

  const grandTotalPackages = forecast 
    ? forecast.grandPackageTotal 
    : originFacilities.reduce((sum, orig, i) => sum + getRowTotal(orig, i), 0);

  return (
    <div className="space-y-4">
      {/* Title & Status */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <Grid3X3 className="w-5 h-5 text-blue-600" />
              <span>Paket Dağılım Matrisi (20×20 Koli Adetleri)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Soldaki sütun <strong>Çıkış Tesislerini (Günlük Toplama Paket Sayıları)</strong>, üstteki satır ise <strong>Varış Tesislerini (Günlük Dağıtım Paket Sayıları)</strong> temsil eder.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs font-semibold">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Kaynak: Manuel Paket Girişi Modülü</span>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3.5 py-1.5 rounded-lg shadow-2xs">
            Genel Toplam: {grandTotalPackages.toLocaleString('tr-TR')} Paket
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
                  <div className="text-blue-300 font-bold">Çıkış Tesisleri \ Varış</div>
                  <div className="text-[10px] text-slate-400 font-normal">Soldaki sütun: Günlük Toplama</div>
                </th>
                {destinationFacilities.map((dest, colIdx) => (
                  <th key={dest.id} className="p-2.5 text-center border-r border-slate-800 min-w-[105px]">
                    <div className="font-bold text-white text-[11px] truncate">{dest.city}</div>
                    <div className="text-[10px] text-blue-300 font-mono font-semibold">{dest.code}</div>
                  </th>
                ))}
                <th className="p-3 text-center bg-slate-950 text-blue-400 font-bold min-w-[125px] sticky right-0 z-20">
                  <div>Günlük Toplama</div>
                  <div className="text-[10px] text-slate-300 font-normal">(Çıkış Toplamı)</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {originFacilities.map((orig, rIdx) => {
                const rowSum = getRowTotal(orig, rIdx);
                return (
                  <tr key={orig.id} className={rIdx % 2 === 0 ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/60 hover:bg-blue-50/40'}>
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-900 bg-slate-100/80 sticky left-0 z-10">
                      <div className="font-bold text-[11px]">{orig.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between mt-0.5">
                        <span className="font-bold text-blue-700">{orig.code}</span>
                        <span className="text-slate-400">{orig.city}</span>
                      </div>
                    </td>

                    {destinationFacilities.map((dest, cIdx) => {
                      const count = getCellPackageCount(orig, dest);
                      const isDiagonal = orig.id === dest.id;
                      return (
                        <td 
                          key={dest.id} 
                          className={`p-2 text-center border-r border-slate-200 ${
                            isDiagonal ? 'bg-blue-50/60' : ''
                          }`}
                        >
                          {count > 0 ? (
                            <span className={`font-mono text-[11px] ${
                              isDiagonal ? 'font-bold text-blue-800' : 'font-semibold text-slate-900'
                            }`}>
                              {count.toLocaleString('tr-TR')}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="p-3 text-right bg-slate-100/90 font-bold text-slate-900 border-l border-slate-300 font-mono text-[11px] sticky right-0 z-10">
                      {rowSum.toLocaleString('tr-TR')}
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800 sticky bottom-0 z-20">
                <td className="p-3 border-r border-slate-800 text-blue-300 sticky left-0 bg-slate-900 z-30">
                  <div className="font-black">Günlük Dağıtım (Varış Toplamı)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Tüm Tesislerin Giriş Yükü</div>
                </td>
                {destinationFacilities.map((dest, cIdx) => {
                  const colSum = getColTotal(dest, cIdx);
                  return (
                    <td key={dest.id} className="p-2.5 text-center border-r border-slate-800 font-mono text-[11px] text-slate-100 font-bold">
                      {colSum.toLocaleString('tr-TR')}
                    </td>
                  );
                })}
                <td className="p-3 text-right bg-slate-950 text-blue-400 font-black font-mono text-sm sticky right-0 z-30">
                  {grandTotalPackages.toLocaleString('tr-TR')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
