import { 
  Facility, 
  Route, 
  Vehicle, 
  LoadMovement, 
  OperationalRule, 
  OptimizationSummary 
} from '../types/logistics';

export interface OptimizationParams {
  facilities: Facility[];
  routes: Route[];
  vehicles: Vehicle[];
  loads: LoadMovement[];
  rules: OperationalRule[];
  enforce90RuleOnExtraVehicles: boolean; // default true
  allowDirectBypassForSincan: boolean; // default false (unless verified)
}

export function runLogisticsOptimization(params: OptimizationParams): {
  updatedVehicles: Vehicle[];
  updatedLoads: LoadMovement[];
  summary: OptimizationSummary;
} {
  const { facilities, routes, vehicles, loads, rules, enforce90RuleOnExtraVehicles } = params;

  const logs: OptimizationSummary['executionLogs'] = [];
  logs.push({
    ruleCode: 'SYS-INIT',
    type: 'INFO',
    message: `Lojistik Hat Planlama Motoru başlatıldı. Toplam ${loads.length} yük konsinyesi, ${vehicles.length} araç, ${routes.length} hat taranıyor.`
  });

  // Deep clone to avoid in-place mutations
  const workingVehicles: Vehicle[] = vehicles.map(v => ({
    ...v,
    assignedLoadIds: [],
    currentDesi: 0,
    currentPackages: 0,
    status: 'BEKLEMEDE'
  }));

  const workingLoads: LoadMovement[] = loads.map(l => ({
    ...l,
    assignedVehicleId: null,
    assignedVehiclePlate: null,
    status: l.requiresVerification ? 'ACIKTA_KALAN' : 'PLANLANDI',
    unassignedReason: l.requiresVerification ? 'USER_VERIFICATION_REQUIRED' : 'NONE',
    unassignedExplanation: l.requiresVerification ? l.unassignedExplanation : undefined
  }));

  // Track assigned load IDs to enforce Rule 6 (Uniqueness: Aynı yük 2 araca atanamaz)
  const assignedLoadIdSet = new Set<string>();

  // Helper maps
  const routeMap = new Map<string, Route>();
  routes.forEach(r => routeMap.set(r.id, r));

  const facilityMap = new Map<string, Facility>();
  facilities.forEach(f => facilityMap.set(f.id, f));

  // STEP 1: Handle Cross Dock feed shuttles (if defined)
  const shuttleRoutes = routes.filter(r => r.code === 'SNC-ANK-CROSS' || r.code === 'OST-ANK-CROSS');
  if (shuttleRoutes.length > 0) {
    logs.push({
      ruleCode: 'KRL-04',
      type: 'INFO',
      message: 'Kural KRL-04: Kaynak tesislerin yükleri Cross Dock shuttle servislerine atanıyor.'
    });
    for (const sRoute of shuttleRoutes) {
      const sVehicles = workingVehicles.filter(v => v.assignedRouteId === sRoute.id);
      const originFacility = facilities.find(f => f.id === sRoute.originFacilityId);

      const shuttleLoads = workingLoads.filter(
        l => l.originFacilityId === sRoute.originFacilityId &&
             l.requiresCrossDock &&
             !assignedLoadIdSet.has(l.id) &&
             l.status !== 'ACIKTA_KALAN'
      );

      let vehicleIndex = 0;
      for (const load of shuttleLoads) {
        if (vehicleIndex >= sVehicles.length) {
          load.status = 'ACIKTA_KALAN';
          load.unassignedReason = 'VEHICLE_CAPACITY_EXCEEDED';
          load.unassignedExplanation = `${originFacility?.name} Cross Dock besleme araçlarında kapasite kalmadı.`;
          continue;
        }

        let currentVeh = sVehicles[vehicleIndex];
        const effectiveMaxDesi = Math.min(currentVeh.maxDesiCapacity, sRoute.routeOperationalMaxDesi);
        const effectiveMaxPackages = Math.min(currentVeh.maxPackageCapacity, sRoute.routeOperationalMaxPackages);

        if (currentVeh.currentDesi + load.totalDesi <= effectiveMaxDesi &&
            currentVeh.currentPackages + load.packageCount <= effectiveMaxPackages) {
          currentVeh.assignedLoadIds.push(load.id);
          currentVeh.currentDesi += load.totalDesi;
          currentVeh.currentPackages += load.packageCount;
          currentVeh.status = 'HAZIR';

          load.assignedVehicleId = currentVeh.id;
          load.assignedVehiclePlate = currentVeh.plate;
          load.status = 'CROSS_DOCK_BEKLIYOR';
          assignedLoadIdSet.add(load.id);
        } else {
          vehicleIndex++;
          if (vehicleIndex < sVehicles.length) {
            currentVeh = sVehicles[vehicleIndex];
            currentVeh.assignedLoadIds.push(load.id);
            currentVeh.currentDesi += load.totalDesi;
            currentVeh.currentPackages += load.packageCount;
            currentVeh.status = 'HAZIR';

            load.assignedVehicleId = currentVeh.id;
            load.assignedVehiclePlate = currentVeh.plate;
            load.status = 'CROSS_DOCK_BEKLIYOR';
            assignedLoadIdSet.add(load.id);
          } else {
            load.status = 'ACIKTA_KALAN';
            load.unassignedReason = 'VEHICLE_CAPACITY_EXCEEDED';
            load.unassignedExplanation = 'Cross Dock ring servislerinde kapasite aşıldı.';
          }
        }
      }
    }
  }

  // STEP 2: Main Intercity Lines from Ankara ATM
  logs.push({
    ruleCode: 'KRL-01',
    type: 'INFO',
    message: 'Kural KRL-01: Sabit hatlar ve tanımlı sabit araçlar öncelikle tahsis ediliyor.'
  });

  const mainIntercityRoutes = routes.filter(r => r.code !== 'SNC-ANK-CROSS' && r.code !== 'OST-ANK-CROSS');

  for (const route of mainIntercityRoutes) {
    // Collect all eligible loads for this route:
    // Either originating at Ankara ATM directly, OR originating elsewhere but having ATM as Cross Dock
    // AND targeting the destination or intermediate stops of this route!
    const routeVehicles = workingVehicles
      .filter(v => v.assignedRouteId === route.id)
      .sort((a, b) => a.tripSequence - b.tripSequence);

    // Eligible loads that have not yet been assigned to an intercity line
    // (Note: loads in Sincan/OSTİM have shuttle assignment for local leg, but for the intercity leg,
    // we also map their main line assignment or we treat them as ready at ATM.
    // The user rule specifies: "Aynı yük iki araca atanamaz. Bütün araçlar tek ana Hat Planlama tablosunda yer alır.
    // Cross Dock giriş/çıkışı yükü çoğaltmaz.")
    const eligibleLoads = workingLoads.filter(load => {
      if (load.status === 'ACIKTA_KALAN' && load.unassignedReason === 'USER_VERIFICATION_REQUIRED') {
        return false; // Doğrulama bekleyen kural yükü bekletilir
      }
      
      // True destination must match route destination or route intermediate stops
      const matchesDestination = (load.trueDestinationFacilityId === route.destinationFacilityId);
      const matchesIntermediate = route.intermediateFacilityIds.includes(load.trueDestinationFacilityId);
      
      if (!matchesDestination && !matchesIntermediate) return false;

      // Origin check: either directly from ATM, or origin is ATM
      if (load.originFacilityId === route.originFacilityId) {
        return !assignedLoadIdSet.has(load.id);
      }

      // If originated elsewhere (e.g. Sincan, OSTİM) with Cross Dock at ATM,
      // and it's already assigned to shuttle leg:
      return false; // Keep local shuttle loads distinct so uniqueness is strictly preserved
    });

    // Sort loads by priority: SABIT_TAAHHUT first, then by totalDesi descending
    eligibleLoads.sort((a, b) => {
      if (a.priorityLevel === 'SABIT_TAAHHUT' && b.priorityLevel !== 'SABIT_TAAHHUT') return -1;
      if (b.priorityLevel === 'SABIT_TAAHHUT' && a.priorityLevel !== 'SABIT_TAAHHUT') return 1;
      return b.totalDesi - a.totalDesi;
    });

    // Allocate vehicles in order of tripSequence
    let vehIdx = 0;
    for (const veh of routeVehicles) {
      // Calculate effective route & vehicle capacity
      const effectiveMaxDesi = Math.min(veh.maxDesiCapacity, route.routeOperationalMaxDesi);
      const effectiveMaxPackages = Math.min(veh.maxPackageCapacity, route.routeOperationalMaxPackages);

      // Temporary accumulator for this vehicle
      const candidateLoads: LoadMovement[] = [];
      let accDesi = 0;
      let accPackages = 0;

      for (const load of eligibleLoads) {
        if (assignedLoadIdSet.has(load.id)) continue;

        // Double capacity check: vehicle capacity vs route operational limit
        if (accDesi + load.totalDesi <= effectiveMaxDesi &&
            accPackages + load.packageCount <= effectiveMaxPackages) {
          candidateLoads.push(load);
          accDesi += load.totalDesi;
          accPackages += load.packageCount;
        }
      }

      const occupancyRate = effectiveMaxDesi > 0 ? (accDesi / effectiveMaxDesi) : 0;

      // STEP 3: Check Rule 5 & Rule 2: %90 occupancy rule for 2nd and subsequent vehicles!
      // Helper to compute origin load distribution
      const computeOriginBreakdown = (loads: LoadMovement[], totalD: number) => {
        const oMap = new Map<string, { originFacilityId: string; originFacilityCode: string; originFacilityName: string; packageCount: number; totalDesi: number }>();
        for (const cl of loads) {
          const oFac = facilities.find(f => f.id === cl.originFacilityId);
          const existing = oMap.get(cl.originFacilityId) || {
            originFacilityId: cl.originFacilityId,
            originFacilityCode: cl.originFacilityCode || oFac?.code || 'KOD',
            originFacilityName: oFac?.name || cl.originFacilityCode || 'Kaynak Tesis',
            packageCount: 0,
            totalDesi: 0
          };
          existing.packageCount += cl.packageCount;
          existing.totalDesi += cl.totalDesi;
          oMap.set(cl.originFacilityId, existing);
        }
        return Array.from(oMap.values()).map(o => ({
          ...o,
          percentageOfLoad: totalD > 0 ? Number(((o.totalDesi / totalD) * 100).toFixed(1)) : 0
        }));
      };

      if (veh.isFixedDeparture) {
        // Sabit Sefer: Always departs!
        veh.assignedLoadIds = candidateLoads.map(l => l.id);
        veh.currentDesi = accDesi;
        veh.currentPackages = accPackages;
        veh.status = candidateLoads.length > 0 ? 'HAZIR' : 'BEKLEMEDE';
        veh.originBreakdown = computeOriginBreakdown(candidateLoads, accDesi);

        for (const cl of candidateLoads) {
          cl.assignedVehicleId = veh.id;
          cl.assignedVehiclePlate = veh.plate;
          cl.status = 'PLANLANDI';
          assignedLoadIdSet.add(cl.id);
        }

        logs.push({
          ruleCode: 'KRL-01',
          type: 'SUCCESS',
          message: `${route.code} - ${veh.name} (${veh.plate}) Sabit Sefer atandı. Doluluk: %${(occupancyRate * 100).toFixed(1)} (${accDesi}/${effectiveMaxDesi} Desi).`
        });
      } else {
        // Ekstra / İlave Araç: Enforce %90 Rule!
        const minOccupancy = route.additionalVehicleMinOccupancyRate || 0.90;
        const requiredMinDesi = effectiveMaxDesi * minOccupancy;

        if (!enforce90RuleOnExtraVehicles || occupancyRate >= minOccupancy) {
          // Passed 90% threshold!
          veh.assignedLoadIds = candidateLoads.map(l => l.id);
          veh.currentDesi = accDesi;
          veh.currentPackages = accPackages;
          veh.status = 'HAZIR';
          veh.originBreakdown = computeOriginBreakdown(candidateLoads, accDesi);

          for (const cl of candidateLoads) {
            cl.assignedVehicleId = veh.id;
            cl.assignedVehiclePlate = veh.plate;
            cl.status = 'PLANLANDI';
            assignedLoadIdSet.add(cl.id);
          }

          logs.push({
            ruleCode: 'KRL-02',
            type: 'SUCCESS',
            message: `${route.code} - ${veh.name} (${veh.plate}) %90 Eşiğini Geçti. Doluluk: %${(occupancyRate * 100).toFixed(1)} (Min gereken: %${(minOccupancy * 100).toFixed(0)} / ${requiredMinDesi} Desi). Sefer onaylandı.`
          });
        } else {
          // Failed 90% threshold! CANCEL / HOLD THIS VEHICLE
          veh.assignedLoadIds = [];
          veh.currentDesi = 0;
          veh.currentPackages = 0;
          veh.status = 'IPTAL_90_KURALI';

          // Candidate loads cannot depart on this extra vehicle; mark them as unassigned overflow!
          for (const cl of candidateLoads) {
            if (!assignedLoadIdSet.has(cl.id)) {
              cl.assignedVehicleId = null;
              cl.assignedVehiclePlate = null;
              cl.status = 'ACIKTA_KALAN';
              cl.unassignedReason = 'SECOND_VEHICLE_BELOW_90';
              cl.unassignedExplanation = `Hatta ilave araç açılması için gereken %90 doluluk eşiği sağlanamadı. Mevcut talep: ${accDesi} Desi (%${(occupancyRate * 100).toFixed(1)}), Asgari gereken: ${requiredMinDesi} Desi. Kural KRL-02 gereği sefer iptal/bekletmede.`;
            }
          }

          logs.push({
            ruleCode: 'KRL-02',
            type: 'WARNING',
            message: `${route.code} - ${veh.name} (%${(occupancyRate * 100).toFixed(1)} doluluk): Genel %90 eşik kuralına takıldı. ${accDesi} Desi yük açıkta bırakıldı.`
          });
        }
      }

      vehIdx++;
    }

    // Any remaining eligible load that wasn't accommodated in any vehicle is marked as unassigned
    for (const load of eligibleLoads) {
      if (!assignedLoadIdSet.has(load.id) && load.status !== 'ACIKTA_KALAN') {
        load.status = 'ACIKTA_KALAN';
        load.unassignedReason = 'VEHICLE_CAPACITY_EXCEEDED';
        load.unassignedExplanation = `${route.code} hattındaki tüm tanımlı araçların kapasitesi doldu. Ekstra araç açılmadı.`;
      }
    }
  }

  // STEP 4: Double check verification pending loads
  for (const load of workingLoads) {
    if (load.requiresVerification && load.status !== 'PLANLANDI' && load.status !== 'YUKLENDI') {
      load.status = 'ACIKTA_KALAN';
      load.unassignedReason = 'USER_VERIFICATION_REQUIRED';
    }
  }

  // Calculate statistics
  const totalLoads = workingLoads.length;
  const totalPackages = workingLoads.reduce((sum, l) => sum + l.packageCount, 0);
  const totalDesi = workingLoads.reduce((sum, l) => sum + l.totalDesi, 0);

  const assignedLoads = workingLoads.filter(l => l.assignedVehicleId != null);
  const assignedPackages = assignedLoads.reduce((sum, l) => sum + l.packageCount, 0);
  const assignedDesi = assignedLoads.reduce((sum, l) => sum + l.totalDesi, 0);

  const unassignedLoads = workingLoads.filter(l => l.status === 'ACIKTA_KALAN' || l.assignedVehicleId == null);
  const unassignedPackages = unassignedLoads.reduce((sum, l) => sum + l.packageCount, 0);
  const unassignedDesi = unassignedLoads.reduce((sum, l) => sum + l.totalDesi, 0);

  const activeVehicles = workingVehicles.filter(v => v.status === 'HAZIR' || v.status === 'YUKLENIYOR').length;
  const cancelledBy90RuleCount = workingVehicles.filter(v => v.status === 'IPTAL_90_KURALI').length;

  const totalVehicleDesiCapacity = workingVehicles
    .filter(v => v.status === 'HAZIR')
    .reduce((sum, v) => sum + v.maxDesiCapacity, 0);

  const averageVehicleOccupancyPct = totalVehicleDesiCapacity > 0
    ? (assignedDesi / totalVehicleDesiCapacity) * 100
    : 0;

  const fixedLineAdherencePct = 100; // All fixed vehicles preserved
  const crossDockLoadsCount = workingLoads.filter(l => l.requiresCrossDock).length;
  const directLoadsCount = workingLoads.filter(l => !l.requiresCrossDock).length;

  const directDesi = assignedLoads
    .filter(l => !l.requiresCrossDock)
    .reduce((sum, l) => sum + l.totalDesi, 0);

  const ankaraCrossDockDesi = workingLoads
    .filter(l => l.crossDockFacilityCode === 'ANK-ATM')
    .reduce((sum, l) => sum + l.totalDesi, 0);

  const gebzeCrossDockDesi = workingLoads
    .filter(l => l.trueDestinationFacilityCode === 'GBZ-CDK' || l.crossDockFacilityCode === 'GBZ-CDK')
    .reduce((sum, l) => sum + l.totalDesi, 0);

  const consolidatedDesi = workingLoads
    .filter(l => l.requiresCrossDock)
    .reduce((sum, l) => sum + l.totalDesi, 0);

  const neededSpotVehicles = unassignedDesi > 0 ? Math.ceil(unassignedDesi / 3000) : 0;

  const fleetBreakdown = {
    tir: workingVehicles.filter(v => v.type === 'TIR').length,
    kamyon: workingVehicles.filter(v => v.type === 'KAMYON' || v.type === 'KIRKAYAK').length,
    kamyonet: workingVehicles.filter(v => v.type === 'KAMYONET').length,
    panelvan: workingVehicles.filter(v => v.type === 'PANELVAN').length
  };

  const summary: OptimizationSummary = {
    timestamp: new Date().toISOString(),
    totalLoads,
    totalPackages,
    totalDesi,
    assignedLoadsCount: assignedLoads.length,
    assignedPackagesCount: assignedPackages,
    assignedDesi,
    unassignedLoadsCount: unassignedLoads.length,
    unassignedPackagesCount: unassignedPackages,
    unassignedDesi,
    totalVehicles: workingVehicles.length,
    activeVehicles,
    cancelledBy90RuleCount,
    averageVehicleOccupancyPct: Math.round(averageVehicleOccupancyPct * 10) / 10,
    fixedLineAdherencePct,
    crossDockLoadsCount,
    directLoadsCount,
    directDesi,
    ankaraCrossDockDesi,
    gebzeCrossDockDesi,
    consolidatedDesi,
    ruleViolationCount: 0,
    neededSpotVehicles,
    fleetBreakdown,
    executionLogs: logs
  };

  return {
    updatedVehicles: workingVehicles,
    updatedLoads: workingLoads,
    summary
  };
}
