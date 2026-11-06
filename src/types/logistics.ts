/**
 * Lojistik Hat Planlama ve Optimizasyon Merkezi
 * Tip Tanımları ve Veri Modeli
 */

export type FacilityType = 'HUB' | 'CROSS_DOCK' | 'BRANCH' | 'INDUSTRIAL_HUB';

export interface FacilityOperationalHours {
  generalOperatingHours: string;       // Kaynak dokümanda genel: "15:00 - 00:00"
  crossDockHours?: string;             // Ankara: "24 Saat (00:00 - 23:59)", Gebze: "15:00 - 08:00", Gaziantep: "04:00", vb.
  collectionShift?: string;            // Ankara, Adana, Gaziantep: "15:00 - 23:00"
  specialCrossDockNotes?: string;      // Özel aktarma, 48 saatlik kural, sevkiyat kuralları
}

export interface Facility {
  id: string;
  code: string;
  name: string;
  city: string;
  district: string;
  type: FacilityType;
  isActive: boolean;
  isAnkaraCenter: boolean;
  canCrossDock: boolean;
  canOriginate: boolean;
  canReceive: boolean;
  handlingCapacityDesi: number;        // Günlük elleçleme kapasitesi (Desi)
  dailyCollectionPackages?: number;    // Günlük Toplama Paket Sayısı (Manuel Paket Girişi Çıkış Toplamı)
  dailyCollectionDesi?: number;        // Günlük Toplama Desisi (Manuel Paket Girişi Çıkış Desi Toplamı)
  dailyDeliveryPackages?: number;      // Günlük Varış / Dağıtım Paket Sayısı (Manuel Paket Girişi Varış Toplamı)
  dailyDeliveryDesi?: number;          // Günlük Varış Desisi (Manuel Paket Girişi Varış Desi Toplamı)
  operationalRole: string;             // Kaynak dokümandaki birebir operasyon rolü
  operatingHours: FacilityOperationalHours; // Özel ve genel çalışma takvimi
  allowedDirectLineConnections?: string[]; // Direkt hat veya yönlendirme bağlantıları
  addressNote?: string;
}

export interface VehicleOriginLoadBreakdown {
  originFacilityId: string;
  originFacilityCode: string;
  originFacilityName: string;
  packageCount: number;
  totalDesi: number;
  percentageOfLoad: number;
}

export type VehicleType = 'TIR' | 'KAMYON' | 'KAMYONET' | 'PANELVAN' | 'KIRKAYAK';

export type NavigationTab = 
  | 'overview'
  | 'manuel_paket_girisi'
  | 'data_management'
  | 'excel_import'
  | 'package_matrix'
  | 'desi_matrix'
  | 'facility_vehicle_definitions'
  | 'fixed_line_management'
  | 'line_planning_optimization'
  | 'direct_line_analysis'
  | 'vehicle_optimization'
  | 'ankara_cross_dock'
  | 'gebze_cross_dock'
  | 'vehicle_load_lists'
  | 'unassigned_packages'
  | 'operation_rules'
  | 'planning_history'
  | 'reporting_excel';

export interface OperationalMetadata {
  operationDate: string;
  activeDataset: string;
  dataImportTime: string;
  lastCalculationTime: string | null;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  name: string;
  
  // Fiziksel araç kapasiteleri (TIR: 22.500, Kamyon: 12.500, Kamyonet: 4.500, Panelvan: 4.500)
  maxDesiCapacity: number;
  maxPackageCapacity: number;
  maxWeightKg: number;

  // Hatta uygulanan daha düşük operasyonel yük sınırı (Fiziksel kapasiteden ayrı alandır!)
  routeOperationalLimitDesi?: number;

  // Planlanan Hat Bilgisi
  assignedRouteId: string;
  assignedRouteCode?: string;
  tripSequence: number; // 1 = 1. Araç (Sabit), 2 = 2. Araç (İlave), 3 = 3. Araç...
  isFixedDeparture: boolean; // Sabit hat aracı mı? (Evetse %90 şartı aranmaz)
  departureTime: string; // Planlanan kalkış saati (Örn: "21:30")
  arrivalTime: string; // Planlanan varış saati (Örn: "04:30")
  
  // Durum
  status: 'BEKLEMEDE' | 'YUKLENIYOR' | 'HAZIR' | 'YOLDA' | 'IPTAL_90_KURALI' | 'TAMAMLANDI';
  
  // Atanan Yük Bilgisi (Yük Tekilliği: Bir yük yalnızca bir araçta olabilir)
  assignedLoadIds: string[];
  currentDesi: number;
  currentPackages: number;

  // Bir araçta birden fazla kaynak tesisin yükü varsa kaynak tesis bazında dağılım
  originBreakdown?: VehicleOriginLoadBreakdown[];
  
  // Kural ve istisna notları
  exceptionNote?: string;
  ruleReference: string;
}

export interface RouteStop {
  stopIndex: number;
  facilityId: string;
  facilityCode: string;
  facilityName: string;
  estimatedArrival?: string;
  estimatedDeparture?: string;
  isOrigin: boolean;
  isDestination: boolean;
  isCrossDock: boolean;
  isIntermediateStop: boolean;
}

export interface Route {
  id: string;
  code: string;
  name: string;
  originFacilityId: string;
  destinationFacilityId: string;
  intermediateFacilityIds: string[]; // Ara duraklar
  stops: RouteStop[];
  distanceKm: number;
  standardDurationHours: number;
  
  // Operasyonel Hat Sınırı (Araç kapasitesinden ayrı kontrol edilir!)
  routeOperationalMaxDesi: number;
  routeOperationalMaxPackages: number;
  
  // Sabit hat kuralları
  fixedVehicleCount: number; // Tanımlı sabit araç adedi
  allowAdditionalVehicles: boolean; // İlave araç açılabilir mi?
  additionalVehicleMinOccupancyRate: number; // Genellikle 0.90 (%90 kuralı)
  
  // Cross dock kuralları
  isDirectRoute: boolean;
  allowedOriginFacilityIds: string[]; // Bu hatta hangi kaynakların yükleri birleştirilebilir
  
  ruleReference: string;
  ruleVersion: string;
}

export type LoadStatus = 
  | 'ACIKTA_KALAN'          // Atanamadı (kapasite veya kural nedeniyle)
  | 'PLANLANDI'             // Araca planlandı
  | 'YUKLENDI'              // Araca yüklendi
  | 'CROSS_DOCK_BEKLIYOR'   // Aktarma merkezinde bekliyor
  | 'YOLDA'                 // Sevkiyat halinde
  | 'TAMAMLANDI';           // Teslim edildi

export type UnassignedReason = 
  | 'NONE'
  | 'SECOND_VEHICLE_BELOW_90'     // İkinci ve sonraki araç için %90 doluluk eşiği sağlanamadı
  | 'VEHICLE_CAPACITY_EXCEEDED'   // Araç fiziksel kapasitesi aşıldı
  | 'ROUTE_OPERATIONAL_LIMIT'     // Hatta izin verilen operasyonel yük sınırı aşıldı
  | 'NO_PERMITTED_LINE'           // Kaynak birleştirme kuralı gereği doğrudan hat yok
  | 'USER_VERIFICATION_REQUIRED'; // Kural netleştirilmediği için beklemede

export interface LoadMovement {
  id: string;
  trackingNumber: string;
  cargoDescription: string;
  
  // 1. Kaynak / Çıkış Tesisi
  originFacilityId: string;
  originFacilityCode: string;
  
  // 2. Gerçek Varış Tesisi (HİÇBİR Cross Dock veya ara durak nedeniyle ASLA değiştirilemez!)
  trueDestinationFacilityId: string;
  trueDestinationFacilityCode: string;
  
  // 3. Operasyonel Aktarma / Cross Dock Tesisi (Varsa)
  crossDockFacilityId?: string | null;
  crossDockFacilityCode?: string | null;
  requiresCrossDock: boolean;
  
  // 4. Güzergâh ve Ara Duraklar
  routeId: string;
  routeCode: string;
  intermediateStops: string[]; // Tesis isimleri / kodları
  
  // 5. Paket Adedi
  packageCount: number;
  
  // 6. Toplam Desi
  totalDesi: number;
  totalWeightKg: number;
  
  // 7. Yükün hangi araçta bulunduğu (Aynı yük asla 2 araca atanamaz!)
  assignedVehicleId?: string | null;
  assignedVehiclePlate?: string | null;
  
  // 8. Hareketin Durumu
  status: LoadStatus;
  unassignedReason?: UnassignedReason;
  unassignedExplanation?: string;
  
  // 9. Kural Kaynağı ve Kural Versiyonu
  ruleSource: string;
  ruleVersion: string;
  requiresVerification: boolean;
  
  createdAt: string;
  priorityLevel: 'NORMAL' | 'KRITIK' | 'SABIT_TAAHHUT';
}

export type RuleStatus = 'AKTIF' | 'DOGRULAMA_GEREKLI' | 'ESKI_NOT_ARSIV';

export interface OperationalRule {
  id: string;
  code: string;
  title: string;
  category: 'SABIT_HAT' | 'YUZDE_90_KURALI' | 'DIREKT_SEVKIYAT' | 'CROSS_DOCK_BIRLESTIRME' | 'KAPASITE_LIMITI' | 'VERI_BUTUNLUGU' | 'ISTISNA';
  description: string;
  sourceDocument: string;
  version: string;
  status: RuleStatus;
  
  // Kuralla ilgili operasyonel parametreler
  targetRouteCode?: string;
  occupancyThreshold?: number; // Örn: 0.90
  isSpecialException?: boolean;
  originalNotes?: string; // Eski operasyon notu veya kaynak metin
  verificationQuestion?: string; // Doğrulama gerekiyorsa sorulan soru
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface MatrixCell {
  originCode: string;
  destinationCode: string;
  packageCount: number;
  totalDesi: number;
  loadIds: string[];
  suggestedRouteCode: string;
  isDirectPossible: boolean;
  requiresCrossDock: boolean;
  crossDockHubCode?: string;
}

export interface OptimizationSummary {
  timestamp: string;
  totalLoads: number;
  totalPackages: number;
  totalDesi: number;
  
  assignedLoadsCount: number;
  assignedPackagesCount: number;
  assignedDesi: number;
  
  unassignedLoadsCount: number;
  unassignedPackagesCount: number;
  unassignedDesi: number;
  
  totalVehicles: number;
  activeVehicles: number;
  cancelledBy90RuleCount: number;
  
  averageVehicleOccupancyPct: number;
  fixedLineAdherencePct: number;
  crossDockLoadsCount: number;
  directLoadsCount: number;

  directDesi: number;
  ankaraCrossDockDesi: number;
  gebzeCrossDockDesi: number;
  consolidatedDesi: number;
  ruleViolationCount: number;
  neededSpotVehicles: number;
  fleetBreakdown: {
    tir: number;
    kamyon: number;
    kamyonet: number;
    panelvan: number;
  };
  
  executionLogs: {
    ruleCode: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  }[];
}
