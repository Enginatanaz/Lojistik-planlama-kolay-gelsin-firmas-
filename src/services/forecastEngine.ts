/**
 * MANUEL PAKET GİRİŞİ & FORECAST HESAPLAMA MOTORU
 * 20×20 Paket Dağılım Matrisi ve OD Desi/Paket Katsayıları
 * 
 * Temel İlke: Kullanıcı yalnızca toplam paket sayısını manuel girer.
 * Desi değerleri kullanıcı tarafından girilmez; paket sayısına göre otomatik hesaplanır.
 */

import * as XLSX from 'xlsx';
import { Facility, LoadMovement, Route } from '../types/logistics';

export const FORECAST_FACILITIES: string[] = [
  'ADANA TM',
  'AFYON TM',
  'AKSARAY TM',
  'ANKARA TM',
  'ANTALYA TM',
  'AVRUPA TM',
  'BURSA TM',
  'DİYARBAKIR TM',
  'ERZURUM TM',
  'GAZİANTEP TM',
  'GEBZE TM',
  'İZMİR TM',
  'KAYSERİ TM',
  'KOCAELİ TM',
  'KONYA TM',
  'MARMARA TM',
  'MERZİFON TM',
  'SAMSUN TM',
  'TRABZON TM',
  'VAN TM'
];

export interface ForecastResult {
  totalPackagesInput: number;
  packageMatrix: number[][]; // N×N
  desiMatrix: number[][]; // N×N
  packageRowTotals: number[]; // N
  packageColTotals: number[]; // N
  desiRowTotals: number[]; // N
  desiColTotals: number[]; // N
  grandPackageTotal: number;
  grandDesiTotal: number;
  generalDesiPackageRatio: number;
  reconciliationAdjustments: number; // Largest remainder adjustment count
  coefficientVersion: string;
  calculatedAt: string;
  isValid: boolean;
  validationErrors: string[];
}

// 20 Tesis Sıralaması
export function getFacilityList(): string[] {
  return [...FORECAST_FACILITIES];
}

// 20 Çıkış Tesisinin toplam paket payları (Reference 568.723 için kalibre edilmiştir)
const ROW_PKG_TARGETS = [
  22730,  // 0: ADANA TM
  7296,   // 1: AFYON TM
  6670,   // 2: AKSARAY TM
  64579,  // 3: ANKARA TM
  23138,  // 4: ANTALYA TM
  129845, // 5: AVRUPA TM
  28766,  // 6: BURSA TM
  11256,  // 7: DİYARBAKIR TM
  7713,   // 8: ERZURUM TM
  19594,  // 9: GAZİANTEP TM
  24500,  // 10: GEBZE TM
  40024,  // 11: İZMİR TM
  14383,  // 12: KAYSERİ TM
  21470,  // 13: KOCAELİ TM
  16467,  // 14: KONYA TM
  120816, // 15: MARMARA TM
  6253,   // 16: MERZİFON TM
  12298,  // 17: SAMSUN TM
  9172,   // 18: TRABZON TM
  6253    // 19: VAN TM
];

// 20 Çıkış Tesisinin toplam desi hedefleri (Reference 2.127.057 için kalibre edilmiştir)
const ROW_DESI_TARGETS = [
  74057,  // 0: ADANA TM
  30577,  // 1: AFYON TM
  27954,  // 2: AKSARAY TM
  177500, // 3: ANKARA TM
  96970,  // 4: ANTALYA TM
  448232, // 5: AVRUPA TM
  120556, // 6: BURSA TM
  47173,  // 7: DİYARBAKIR TM
  32325,  // 8: ERZURUM TM
  82117,  // 9: GAZİANTEP TM
  78500,  // 10: GEBZE TM
  167739, // 11: İZMİR TM
  60278,  // 12: KAYSERİ TM
  89979,  // 13: KOCAELİ TM
  69012,  // 14: KONYA TM
  460197, // 15: MARMARA TM
  26206,  // 16: MERZİFON TM
  51540,  // 17: SAMSUN TM
  38439,  // 18: TRABZON TM
  26206   // 19: VAN TM
];

// Varış tesisi çekim ağırlıkları (Population / Industrial hub index)
const DESTINATION_WEIGHTS = [
  0.038, // 0: ADANA
  0.017, // 1: AFYON
  0.014, // 2: AKSARAY
  0.110, // 3: ANKARA
  0.043, // 4: ANTALYA
  0.215, // 5: AVRUPA
  0.052, // 6: BURSA
  0.024, // 7: DİYARBAKIR
  0.017, // 8: ERZURUM
  0.036, // 9: GAZİANTEP
  0.048, // 10: GEBZE
  0.076, // 11: İZMİR
  0.027, // 12: KAYSERİ
  0.040, // 13: KOCAELİ
  0.030, // 14: KONYA
  0.155, // 15: MARMARA
  0.014, // 16: MERZİFON
  0.023, // 17: SAMSUN
  0.017, // 18: TRABZON
  0.013  // 19: VAN
];

// Varsayılan 20×20 Paket Dağıtım Katsayıları Matrisi
export function getPackageDistributionCoefficients(): number[][] {
  const dwSum = DESTINATION_WEIGHTS.reduce((a, b) => a + b, 0);
  const normDestW = DESTINATION_WEIGHTS.map(w => w / dwSum);
  const totalPkgRef = 568723;
  const n = FORECAST_FACILITIES.length;

  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    const targetRowP = ROW_PKG_TARGETS[i] || 10000;
    const rawW: number[] = [];
    for (let j = 0; j < n; j++) {
      let w = normDestW[j];
      if (i === j) w *= 0.10; // İçi aktarma payı
      rawW[j] = w;
    }
    const rowWSum = rawW.reduce((a, b) => a + b, 0);
    for (let j = 0; j < n; j++) {
      const colFrac = rawW[j] / rowWSum;
      matrix[i][j] = (targetRowP * colFrac) / totalPkgRef;
    }
  }
  return matrix;
}

// Varsayılan 20×20 OD Desi/Paket Oranları Matrisi
export function getODDesiPackageRatios(): number[][] {
  const n = FORECAST_FACILITIES.length;
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    const avgRatio = (ROW_DESI_TARGETS[i] || 30000) / (ROW_PKG_TARGETS[i] || 10000);
    for (let j = 0; j < n; j++) {
      let destMultiplier = 1.0;
      if (j === 5 || j === 15 || j === 10) destMultiplier = 1.02; // Marmara/Avrupa/Gebze sanayi yükleri
      else if (j === 3) destMultiplier = 0.98; // Ankara e-ticaret
      matrix[i][j] = Number((avgRatio * destMultiplier).toFixed(4));
    }
  }
  return matrix;
}

/**
 * 4. PAKET DAĞILIM MATRİSİ HESAPLAMA MOTORU
 * Formül: Paket(i,j) = ROUND(ToplamPaket × PaketDağıtımKatsayısı(i,j), 0)
 * Bütün hücreler bu formülle hesaplanır.
 * Yuvarlama farkı kontrollü Largest Remainder (Hamilton) yöntemi ile tam mutabık kılınır.
 */
export function calculatePackageMatrix(
  totalPackages: number,
  coefficients: number[][] = getPackageDistributionCoefficients()
): { matrix: number[][]; adjustments: number } {
  const n = FORECAST_FACILITIES.length;
  const matrix: number[][] = [];
  const remainders: { i: number; j: number; frac: number }[] = [];
  let sumFloor = 0;

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      const coef = (coefficients[i] && coefficients[i][j]) ? coefficients[i][j] : 0;
      const exact = totalPackages * coef;
      const floorVal = Math.floor(exact);
      const frac = exact - floorVal;
      matrix[i][j] = floorVal;
      sumFloor += floorVal;
      remainders.push({ i, j, frac });
    }
  }

  // Largest Remainder Method ile tam mutabakat
  let diff = totalPackages - sumFloor;
  let adjustments = 0;

  if (diff > 0) {
    remainders.sort((a, b) => b.frac - a.frac);
    for (let k = 0; k < diff && k < remainders.length; k++) {
      matrix[remainders[k].i][remainders[k].j] += 1;
      adjustments++;
    }
  } else if (diff < 0) {
    remainders.sort((a, b) => a.frac - b.frac);
    for (let k = 0; k < Math.abs(diff) && k < remainders.length; k++) {
      if (matrix[remainders[k].i][remainders[k].j] > 0) {
        matrix[remainders[k].i][remainders[k].j] -= 1;
        adjustments++;
      }
    }
  }

  return { matrix, adjustments };
}

/**
 * 5. DESİ DAĞILIM MATRİSİ – PAKET SAYISINA BAĞLI OTOMATİK HESAPLAMA
 * Desi matrisi bağımsız veya sabit bir tablo değildir.
 * Her zaman güncel paket dağılım matrisinden hesaplanır.
 * Formül: Desi(i,j) = ROUND(Paket(i,j) × ODDesiPaketOranı(i,j), 2)
 */
export function calculateDesiMatrix(
  packageMatrix: number[][],
  ratios: number[][] = getODDesiPackageRatios()
): number[][] {
  const n = FORECAST_FACILITIES.length;
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      const pkg = packageMatrix[i][j] || 0;
      const ratio = (ratios[i] && ratios[i][j]) ? ratios[i][j] : 3.5;
      matrix[i][j] = Math.round(pkg * ratio * 100) / 100;
    }
  }

  return matrix;
}

// Satır ve Sütun Toplamları
export function calculatePackageRowTotals(packageMatrix: number[][]): number[] {
  return packageMatrix.map(row => row.reduce((sum, val) => sum + val, 0));
}

export function calculatePackageColumnTotals(packageMatrix: number[][]): number[] {
  const n = FORECAST_FACILITIES.length;
  const colTotals = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      colTotals[j] += packageMatrix[i][j] || 0;
    }
  }
  return colTotals;
}

export function calculateDesiRowTotals(desiMatrix: number[][]): number[] {
  return desiMatrix.map(row => 
    Math.round(row.reduce((sum, val) => sum + val, 0) * 100) / 100
  );
}

export function calculateDesiColumnTotals(desiMatrix: number[][]): number[] {
  const n = FORECAST_FACILITIES.length;
  const colTotals = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      colTotals[j] += desiMatrix[i][j] || 0;
    }
  }
  return colTotals.map(v => Math.round(v * 100) / 100);
}

export function calculateGeneralPackageTotal(packageMatrix: number[][]): number {
  return packageMatrix.reduce((rowSum, row) => 
    rowSum + row.reduce((colSum, val) => colSum + val, 0), 0
  );
}

export function calculateGeneralDesiTotal(desiMatrix: number[][]): number {
  const sum = desiMatrix.reduce((rowSum, row) => 
    rowSum + row.reduce((colSum, val) => colSum + val, 0), 0
  );
  return Math.round(sum * 100) / 100;
}

export function calculateGeneralDesiPackageRatio(totalDesi: number, totalPackages: number): number {
  if (!totalPackages || totalPackages <= 0) return 0;
  return Math.round((totalDesi / totalPackages) * 1000) / 1000;
}

// Doğrulama Fonksiyonları
export function validatePackageMatrix(packageMatrix: number[][], expectedTotal: number): { isValid: boolean; error?: string } {
  const actualTotal = calculateGeneralPackageTotal(packageMatrix);
  if (actualTotal !== expectedTotal) {
    return {
      isValid: false,
      error: `Paket matrisi genel toplamı (${actualTotal}) kullanıcı girdisiyle (${expectedTotal}) eşleşmiyor. Fark: ${actualTotal - expectedTotal}`
    };
  }
  return { isValid: true };
}

export function validateDesiMatrix(desiMatrix: number[][]): { isValid: boolean; error?: string } {
  const total = calculateGeneralDesiTotal(desiMatrix);
  if (total <= 0 || isNaN(total)) {
    return { isValid: false, error: 'Hesaplanan toplam desi geçersiz veya sıfır.' };
  }
  return { isValid: true };
}

/**
 * calculateForecast(totalPackages)
 * Tek bir hesaplama çalışmasında paket matrisini, desi matrisini, bütün toplamları
 * ve doğrulama sonuçlarını üreten merkezi fonksiyon.
 */
export function calculateForecast(
  totalPackages: number,
  customCoefficients?: number[][],
  customRatios?: number[][]
): ForecastResult {
  const coefs = customCoefficients || getPackageDistributionCoefficients();
  const ratios = customRatios || getODDesiPackageRatios();

  const { matrix: packageMatrix, adjustments } = calculatePackageMatrix(totalPackages, coefs);
  const desiMatrix = calculateDesiMatrix(packageMatrix, ratios);

  const packageRowTotals = calculatePackageRowTotals(packageMatrix);
  const packageColTotals = calculatePackageColumnTotals(packageMatrix);
  const desiRowTotals = calculateDesiRowTotals(desiMatrix);
  const desiColTotals = calculateDesiColumnTotals(desiMatrix);

  const grandPackageTotal = calculateGeneralPackageTotal(packageMatrix);
  const grandDesiTotal = calculateGeneralDesiTotal(desiMatrix);
  const generalDesiPackageRatio = calculateGeneralDesiPackageRatio(grandDesiTotal, grandPackageTotal);

  const validationErrors: string[] = [];
  const pkgVal = validatePackageMatrix(packageMatrix, totalPackages);
  if (!pkgVal.isValid && pkgVal.error) validationErrors.push(pkgVal.error);

  const desiVal = validateDesiMatrix(desiMatrix);
  if (!desiVal.isValid && desiVal.error) validationErrors.push(desiVal.error);

  const now = new Date();
  const calculatedAt = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return {
    totalPackagesInput: totalPackages,
    packageMatrix,
    desiMatrix,
    packageRowTotals,
    packageColTotals,
    desiRowTotals,
    desiColTotals,
    grandPackageTotal,
    grandDesiTotal,
    generalDesiPackageRatio,
    reconciliationAdjustments: adjustments,
    coefficientVersion: 'Kasım 2026 Forecast v2.4 (20×20 OD)',
    calculatedAt,
    isValid: validationErrors.length === 0,
    validationErrors
  };
}

/**
/**
 * Tesis Kodunun Manuel Paket Girişi (FORECAST_FACILITIES) Sırasındaki İndeksini Verir
 * 0: ADANA, 1: AFYON, 2: AKSARAY, 3: ANKARA, 4: ANTALYA, 5: AVRUPA, 6: BURSA,
 * 7: DİYARBAKIR, 8: ERZURUM, 9: GAZİANTEP, 10: GEBZE, 11: İZMİR, 12: KAYSERİ,
 * 13: KOCAELİ, 14: KONYA, 15: MARMARA, 16: MERZİFON, 17: SAMSUN, 18: TRABZON, 19: VAN
 */
export function getForecastIndexForFacility(facilityCode: string): number {
  const codeMap: Record<string, number> = {
    'ADA-CKR': 0,
    'AFY-TM': 1,
    'AKS-TM': 2,
    'ANK-ATM': 3,
    'ANT-KPZ': 4,
    'IST-AVR': 5,
    'BUR-NLF': 6,
    'DIY-TM': 7,
    'ERZ-TM': 8,
    'GZT-TM': 9,
    'GBZ-CDK': 10,
    'IZM-KML': 11,
    'KAY-TM': 12,
    'KOC-TM': 13,
    'KON-TM': 14,
    'IST-AND': 15,
    'MRZ-TM': 16,
    'SAM-TM': 17,
    'TRB-TM': 18,
    'VAN-TM': 19
  };
  return codeMap[facilityCode] ?? -1;
}

/**
 * Tesisleri Manuel Paket Girişi verileriyle zenginleştirir.
 * Soldaki Sütun = Çıkış Tesisi (Günlük Toplama Paket Sayısı ve Desisi)
 * Üstteki Satır = Varış Tesisi (Günlük Dağıtım / Teslimat Paket Sayısı ve Desisi)
 */
export function enrichFacilitiesWithForecast(
  facilities: Facility[],
  forecast: ForecastResult
): Facility[] {
  return facilities.map(fac => {
    const idx = getForecastIndexForFacility(fac.code);
    if (idx < 0) return fac;

    const dailyCollectionPackages = forecast.packageRowTotals[idx] || 0;
    const dailyCollectionDesi = forecast.desiRowTotals[idx] || 0;
    const dailyDeliveryPackages = forecast.packageColTotals[idx] || 0;
    const dailyDeliveryDesi = forecast.desiColTotals[idx] || 0;

    return {
      ...fac,
      dailyCollectionPackages,
      dailyCollectionDesi,
      dailyDeliveryPackages,
      dailyDeliveryDesi,
      // Elleçleme kapasitesi de tahmin edilen günlük hacmi kapsayacak şekilde dinamik tutulur
      handlingCapacityDesi: Math.max(fac.handlingCapacityDesi, Math.round(dailyCollectionDesi * 1.2))
    };
  });
}

/**
 * MANUEL PAKET GİRİŞİ MATRİSİNİ CANLI YÜK HAREKETLERİNE DÖNÜŞTÜRÜCÜ
 * Soldaki Sütun = Çıkış Tesisi (Satır i)
 * Üstteki Satır = Varış Tesisi (Sütun j)
 * Matristeki tüm paket ve desi hacimleri doğrudan ve eksiksiz olarak yüklere dönüştürülür.
 */
export function generateLoadsFromForecast(
  forecast: ForecastResult,
  facilities: Facility[],
  routes: Route[]
): LoadMovement[] {
  const loads: LoadMovement[] = [];
  const facilityNames = FORECAST_FACILITIES;
  const n = facilityNames.length;

  const facilityMap = new Map<string, Facility>();
  facilities.forEach(f => {
    facilityNames.forEach((fn, idx) => {
      const targetIdx = getForecastIndexForFacility(f.code);
      if (targetIdx === idx) {
        facilityMap.set(fn, f);
      }
    });
  });

  let loadCounter = 1;
  for (let i = 0; i < n; i++) {
    const origName = facilityNames[i];
    const origFacility = facilityMap.get(origName);
    if (!origFacility) continue;

    for (let j = 0; j < n; j++) {
      const destName = facilityNames[j];
      const destFacility = facilityMap.get(destName);
      if (!destFacility) continue;

      const packages = forecast.packageMatrix[i] ? forecast.packageMatrix[i][j] || 0 : 0;
      const desi = forecast.desiMatrix[i] ? forecast.desiMatrix[i][j] || 0 : 0;

      if (packages <= 0 && desi <= 0) continue;

      const isInternal = (i === j);

      const directRoute = routes.find(r => 
        r.originFacilityId === origFacility.id && r.destinationFacilityId === destFacility.id
      ) || routes.find(r => 
        r.originFacilityId === 'FAC-ANK-ATM' && r.destinationFacilityId === destFacility.id
      ) || routes[0];

      const requiresCrossDock = !isInternal && origFacility.id !== 'FAC-ANK-ATM' && destFacility.id !== 'FAC-ANK-ATM';

      loads.push({
        id: `LOAD-FC-${loadCounter.toString().padStart(3, '0')}`,
        trackingNumber: `YK-${origFacility.code}-${destFacility.code}-${(100 + loadCounter)}`,
        cargoDescription: isInternal
          ? `${origFacility.city} İçi Yerel Dağıtım ve Şube Besleme (${packages} Pk / ${desi} Desi)`
          : `${origFacility.city} -> ${destFacility.city} Konsolidasyon Yükü (${packages} Pk / ${desi} Desi)`,
        originFacilityId: origFacility.id,
        originFacilityCode: origFacility.code,
        trueDestinationFacilityId: destFacility.id,
        trueDestinationFacilityCode: destFacility.code,
        crossDockFacilityId: requiresCrossDock ? 'FAC-ANK-ATM' : null,
        crossDockFacilityCode: requiresCrossDock ? 'ANK-ATM' : null,
        requiresCrossDock,
        routeId: directRoute?.id || 'ROUTE-ANK-IST-AND',
        routeCode: directRoute?.code || 'ANK-IST-AND-01',
        intermediateStops: isInternal
          ? [origFacility.name, `${origFacility.city} Yerel Dağıtım Alanı`]
          : requiresCrossDock 
            ? [origFacility.name, 'Ankara ATM Cross Dock', destFacility.name] 
            : [origFacility.name, destFacility.name],
        packageCount: packages,
        totalDesi: desi,
        totalWeightKg: Math.round(desi * 6.2),
        assignedVehicleId: null,
        assignedVehiclePlate: null,
        status: isInternal ? 'PLANLANDI' : (requiresCrossDock ? 'CROSS_DOCK_BEKLIYOR' : 'PLANLANDI'),
        ruleSource: 'Manuel Paket Girişi Forecast Matrisi v2.4',
        ruleVersion: 'v2.4',
        requiresVerification: false,
        createdAt: new Date().toISOString(),
        priorityLevel: isInternal ? 'NORMAL' : 'NORMAL'
      });

      loadCounter++;
    }
  }

  return loads;
}

/**
 * EXCEL DIŞA VE İÇE AKTARMA MOTORU
 */
export function exportForecastToExcel(result: ForecastResult): void {
  const facilities = getFacilityList();
  const n = facilities.length;
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Paket Dağılım Matrisi
  const pkgHeader = ['Çıkış \\ Varış', ...facilities, 'ÇIKIŞ TOPLAMI'];
  const pkgRows: (string | number)[][] = [pkgHeader];

  for (let i = 0; i < n; i++) {
    const row = [facilities[i], ...result.packageMatrix[i], result.packageRowTotals[i]];
    pkgRows.push(row);
  }
  pkgRows.push(['VARIŞ TOPLAMI', ...result.packageColTotals, result.grandPackageTotal]);

  const wsPkg = XLSX.utils.aoa_to_sheet(pkgRows);
  XLSX.utils.book_append_sheet(wb, wsPkg, 'Paket Dağılım Matrisi');

  // 2. Sheet: Desi Dağılım Matrisi
  const desiHeader = ['Çıkış \\ Varış', ...facilities, 'ÇIKIŞ TOPLAMI'];
  const desiRows: (string | number)[][] = [desiHeader];

  for (let i = 0; i < n; i++) {
    const row = [facilities[i], ...result.desiMatrix[i], result.desiRowTotals[i]];
    desiRows.push(row);
  }
  desiRows.push(['VARIŞ TOPLAMI', ...result.desiColTotals, result.grandDesiTotal]);

  const wsDesi = XLSX.utils.aoa_to_sheet(desiRows);
  XLSX.utils.book_append_sheet(wb, wsDesi, 'Desi Dağılım Matrisi');

  // 3. Sheet: Dağıtım Katsayıları (Coefficients)
  const coefMatrix = getPackageDistributionCoefficients();
  const coefHeader = ['Çıkış \\ Varış', ...facilities];
  const coefRows: (string | number)[][] = [coefHeader];
  for (let i = 0; i < n; i++) {
    coefRows.push([facilities[i], ...coefMatrix[i]]);
  }
  const wsCoef = XLSX.utils.aoa_to_sheet(coefRows);
  XLSX.utils.book_append_sheet(wb, wsCoef, 'Paket Dağıtım Katsayıları');

  // 4. Sheet: OD Desi/Paket Oranları (OD Ratios)
  const ratioMatrix = getODDesiPackageRatios();
  const ratioHeader = ['Çıkış \\ Varış', ...facilities];
  const ratioRows: (string | number)[][] = [ratioHeader];
  for (let i = 0; i < n; i++) {
    ratioRows.push([facilities[i], ...ratioMatrix[i]]);
  }
  const wsRatio = XLSX.utils.aoa_to_sheet(ratioRows);
  XLSX.utils.book_append_sheet(wb, wsRatio, 'OD Desi Paket Oranları');

  const filename = `Hat_Planlama_Forecast_${result.totalPackagesInput}_Paket.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Excel dosyasından N×N katsayı yükleme
 */
export function parseExcelCoefficients(fileData: ArrayBuffer): {
  success: boolean;
  coefficients?: number[][];
  ratios?: number[][];
  error?: string;
} {
  try {
    const wb = XLSX.read(fileData, { type: 'array' });
    const facilities = getFacilityList();
    const n = facilities.length;

    const coefSheetName = wb.SheetNames.find(name => 
      name.toLowerCase().includes('katsayı') || 
      name.toLowerCase().includes('dağıtım') ||
      name.toLowerCase().includes('coef') ||
      name.toLowerCase().includes('paket')
    ) || wb.SheetNames[0];

    const ws = wb.Sheets[coefSheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    if (!data || data.length < (n + 1)) {
      return { success: false, error: `Excel sayfasında en az ${n + 1} satır (başlık + ${n} tesis) bulunmalıdır.` };
    }

    const coefficients: number[][] = [];
    for (let i = 0; i < n; i++) {
      coefficients[i] = [];
      const row = data[i + 1] || [];
      for (let j = 0; j < n; j++) {
        const val = parseFloat(row[j + 1]);
        coefficients[i][j] = isNaN(val) ? 0 : val;
      }
    }

    let sum = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        sum += coefficients[i][j];
      }
    }

    if (sum > 0 && Math.abs(sum - 1.0) > 0.001) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          coefficients[i][j] = coefficients[i][j] / sum;
        }
      }
    }

    return {
      success: true,
      coefficients
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Excel ayrıştırma hatası: ${err?.message || 'Bilinmeyen hata'}`
    };
  }
}
