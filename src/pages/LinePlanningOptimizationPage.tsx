import React from 'react';
import { Vehicle, Route, LoadMovement } from '../types/logistics';
import { LinePlanningTable } from '../components/LinePlanningTable';
import { Compass, Play, AlertCircle } from 'lucide-react';

interface LinePlanningOptimizationPageProps {
  vehicles: Vehicle[];
  routes: Route[];
  loads: LoadMovement[];
  hasCalculated: boolean;
  onRunOptimization: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const LinePlanningOptimizationPage: React.FC<LinePlanningOptimizationPageProps> = ({
  vehicles,
  routes,
  loads,
  hasCalculated,
  onRunOptimization,
  onSelectVehicle
}) => {
  return (
    <div className="space-y-4">
      {/* Status banner */}
      {!hasCalculated && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Optimizasyon Hesabı Başlatılmadı:</span>
              <span>Araç doluluk oranları ve sefere atama durumu hesaplanmayı beklemektedir.</span>
            </div>
          </div>
          <button
            onClick={onRunOptimization}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Optimizasyonu Şimdi Çalıştır</span>
          </button>
        </div>
      )}

      {/* Embedded Master Line Planning Table */}
      <LinePlanningTable
        vehicles={vehicles}
        routes={routes}
        loads={loads}
        onSelectVehicle={onSelectVehicle}
      />
    </div>
  );
};
