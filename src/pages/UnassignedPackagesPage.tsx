import React from 'react';
import { LoadMovement, Vehicle, Facility, Route } from '../types/logistics';
import { UnassignedLoadsPanel } from '../components/UnassignedLoadsPanel';
import { AlertTriangle } from 'lucide-react';

interface UnassignedPackagesPageProps {
  unassignedLoads: LoadMovement[];
  vehicles: Vehicle[];
  facilities: Facility[];
  routes: Route[];
  hasCalculated: boolean;
  onForceAssignToVehicle: (loadId: string, vehicleId: string) => void;
  onOpenVerificationCenter: () => void;
}

export const UnassignedPackagesPage: React.FC<UnassignedPackagesPageProps> = ({
  unassignedLoads,
  vehicles,
  facilities,
  routes,
  hasCalculated,
  onForceAssignToVehicle,
  onOpenVerificationCenter
}) => {
  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      {!hasCalculated && (
        <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-700">
          <strong>Bilgi:</strong> Planlama hesaplaması henüz çalıştırılmadığı için açıkta kalan yükler listesi optimizasyon başlatıldığında kesinleşecektir.
        </div>
      )}

      {/* Embedded Unassigned Loads Panel */}
      <UnassignedLoadsPanel
        unassignedLoads={unassignedLoads}
        vehicles={vehicles}
        facilities={facilities}
        routes={routes}
        onForceAssignToVehicle={onForceAssignToVehicle}
        onOpenVerificationCenter={onOpenVerificationCenter}
      />
    </div>
  );
};
