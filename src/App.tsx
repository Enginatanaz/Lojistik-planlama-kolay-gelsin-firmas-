import React, { useState, useMemo } from 'react';
import { 
  Facility, 
  Route, 
  Vehicle, 
  LoadMovement, 
  OperationalRule, 
  OptimizationSummary,
  NavigationTab,
  OperationalMetadata 
} from './types/logistics';
import { 
  INITIAL_FACILITIES, 
  INITIAL_ROUTES, 
  INITIAL_VEHICLES, 
  INITIAL_RULES, 
  INITIAL_LOADS 
} from './data/initialLogisticsData';
import { runLogisticsOptimization } from './services/optimizationEngine';
import { 
  calculateForecast, 
  ForecastResult, 
  generateLoadsFromForecast,
  enrichFacilitiesWithForecast 
} from './services/forecastEngine';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';

// Modular Pages
import { OverviewPage } from './pages/OverviewPage';
import { ManuelPaketGirisiPage } from './pages/ManuelPaketGirisiPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { ExcelImportPage } from './pages/ExcelImportPage';
import { PackageMatrixPage } from './pages/PackageMatrixPage';
import { DesiMatrixPage } from './pages/DesiMatrixPage';
import { FacilityVehicleDefinitionsPage } from './pages/FacilityVehicleDefinitionsPage';
import { FixedLineManagementPage } from './pages/FixedLineManagementPage';
import { LinePlanningOptimizationPage } from './pages/LinePlanningOptimizationPage';
import { DirectLineAnalysisPage } from './pages/DirectLineAnalysisPage';
import { VehicleOptimizationPage } from './pages/VehicleOptimizationPage';
import { AnkaraCrossDockPage } from './pages/AnkaraCrossDockPage';
import { GebzeCrossDockPage } from './pages/GebzeCrossDockPage';
import { VehicleLoadListsPage } from './pages/VehicleLoadListsPage';
import { UnassignedPackagesPage } from './pages/UnassignedPackagesPage';
import { OperationRulesPage } from './pages/OperationRulesPage';
import { PlanningHistoryPage } from './pages/PlanningHistoryPage';
import { ReportingExcelPage } from './pages/ReportingExcelPage';

// Shared Modals
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { OptimizationReportModal } from './components/OptimizationReportModal';
import { NewLoadModal } from './components/NewLoadModal';

import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [routes] = useState<Route[]>(INITIAL_ROUTES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [rules, setRules] = useState<OperationalRule[]>(INITIAL_RULES);
  const [summary, setSummary] = useState<OptimizationSummary | null>(null);

  // In Phase 1, calculations are NOT pre-run; user initiates calculation or sees "Henüz hesaplanmadı"
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  // Operational Metadata
  const [metadata, setMetadata] = useState<OperationalMetadata>({
    operationDate: '06.11.2026',
    activeDataset: '2026_Q4_Hat_Matrisi_v1.xlsx',
    dataImportTime: '06.11.2026 08:30',
    lastCalculationTime: null
  });

  // Current tab
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 20×20 OD Forecast State (Default: 568.723 reference scenario - SINGLE SOURCE OF TRUTH)
  const [forecast, setForecast] = useState<ForecastResult>(() => calculateForecast(568723));

  // Tesisler doğrudan Manuel Paket Girişi verileriyle zenginleştirilir:
  // Soldaki sütun = Çıkış Tesisleri (Günlük Toplama Paket Sayıları ve Desisi)
  // Üstteki satır = Varış Tesisleri (Günlük Varış / Dağıtım Paket Sayıları ve Desisi)
  const facilities = useMemo(() => {
    return enrichFacilitiesWithForecast(INITIAL_FACILITIES, forecast);
  }, [forecast]);

  const [loads, setLoads] = useState<LoadMovement[]>(() => 
    generateLoadsFromForecast(calculateForecast(568723), enrichFacilitiesWithForecast(INITIAL_FACILITIES, calculateForecast(568723)), INITIAL_ROUTES)
  );

  const handleUpdateTotalPackages = (newTotal: number) => {
    const updatedForecast = calculateForecast(newTotal);
    setForecast(updatedForecast);
    const enriched = enrichFacilitiesWithForecast(INITIAL_FACILITIES, updatedForecast);
    const updatedLoads = generateLoadsFromForecast(updatedForecast, enriched, routes);
    setLoads(updatedLoads);
    showToast(`Toplam paket ${newTotal.toLocaleString('tr-TR')} olarak güncellendi. 20×20 Manuel Paket Girişi verileri, tesis günlük toplama sayıları ve tüm planlama yükleri otomatik yenilendi.`, 'success');
  };

  const handleUpdateCustomCoefficients = (newCoefs: number[][]) => {
    const updatedForecast = calculateForecast(forecast.totalPackagesInput, newCoefs);
    setForecast(updatedForecast);
    const enriched = enrichFacilitiesWithForecast(INITIAL_FACILITIES, updatedForecast);
    const updatedLoads = generateLoadsFromForecast(updatedForecast, enriched, routes);
    setLoads(updatedLoads);
    showToast('Excel katsayı matrisi uygulandı; Manuel Paket Girişi, tesis günlük toplama sayıları ve tüm planlama yükleri güncellendi.', 'success');
  };

  // Modals
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showNewLoadModal, setShowNewLoadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleRunOptimization = () => {
    const result = runLogisticsOptimization({
      facilities,
      routes,
      vehicles,
      loads,
      rules,
      enforce90RuleOnExtraVehicles: true,
      allowDirectBypassForSincan: false
    });

    const now = new Date();
    const formattedTime = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    setVehicles(result.updatedVehicles);
    setLoads(result.updatedLoads);
    setSummary(result.summary);
    setHasCalculated(true);
    setMetadata(prev => ({
      ...prev,
      lastCalculationTime: formattedTime
    }));

    showToast(`Optimizasyon hesabı tamamlandı: ${result.summary.assignedLoadsCount} konsinye yüklendi, ${result.summary.unassignedLoadsCount} yük açıkta kaldı.`, 'success');
  };

  const handleResetData = () => {
    const defaultForecast = calculateForecast(568723);
    setForecast(defaultForecast);
    setVehicles(INITIAL_VEHICLES);
    setLoads(generateLoadsFromForecast(defaultForecast, INITIAL_FACILITIES, INITIAL_ROUTES));
    setRules(INITIAL_RULES);
    setSummary(null);
    setHasCalculated(false);
    setMetadata({
      operationDate: '06.11.2026',
      activeDataset: '2026_Q4_Hat_Matrisi_v1.xlsx',
      dataImportTime: '06.11.2026 08:30',
      lastCalculationTime: null
    });
    showToast('Veriler ve optimizasyon durumu başlangıç haline sıfırlandı.', 'info');
  };

  const handleAddLoad = (newLoad: LoadMovement) => {
    const updated = [newLoad, ...loads];
    setLoads(updated);
    if (hasCalculated) {
      const result = runLogisticsOptimization({
        facilities,
        routes,
        vehicles,
        loads: updated,
        rules,
        enforce90RuleOnExtraVehicles: true,
        allowDirectBypassForSincan: false
      });
      setVehicles(result.updatedVehicles);
      setLoads(result.updatedLoads);
      setSummary(result.summary);
    }
    showToast(`${newLoad.trackingNumber} nolu yük sisteme eklendi.`, 'success');
  };

  const handleVerifyRule = (ruleId: string, approved: boolean, operatorName: string) => {
    const updatedRules = rules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          status: 'AKTIF' as OperationalRule['status'],
          verifiedBy: operatorName,
          verifiedAt: new Date().toISOString(),
          description: approved 
            ? `${rule.description} [KULLANICI ONAYLADI: ${operatorName}]`
            : `${rule.description} [KULLANICI REDDETTİ: Kısıt korundu]`
        };
      }
      return rule;
    });

    setRules(updatedRules);

    let updatedLoads = [...loads];
    if (ruleId === 'KRL-06-DOGRULAMA' && approved) {
      updatedLoads = loads.map(l => {
        if (l.requiresVerification) {
          return {
            ...l,
            requiresVerification: false,
            status: 'PLANLANDI' as LoadMovement['status'],
            unassignedReason: 'NONE' as LoadMovement['unassignedReason'],
            unassignedExplanation: 'Operasyonel rampa onayı verildi; yük ilgili araca tahsis edildi.'
          };
        }
        return l;
      });
    }

    setLoads(updatedLoads);

    if (hasCalculated) {
      const result = runLogisticsOptimization({
        facilities,
        routes,
        vehicles,
        loads: updatedLoads,
        rules: updatedRules,
        enforce90RuleOnExtraVehicles: true,
        allowDirectBypassForSincan: false
      });
      setVehicles(result.updatedVehicles);
      setLoads(result.updatedLoads);
      setSummary(result.summary);
    }

    showToast(`Kural başarıyla ${approved ? 'onaylandı ve yürürlüğe girdi' : 'kısıtı korundu'}.`, 'success');
  };

  const handleAddNewRule = (ruleData: Partial<OperationalRule>) => {
    const newRule: OperationalRule = {
      id: `KRL-${Date.now()}`,
      code: ruleData.code || 'KRL-CUSTOM',
      title: ruleData.title || 'Özel Operasyonel Kural',
      category: ruleData.category || 'ISTISNA',
      description: ruleData.description || '',
      sourceDocument: ruleData.sourceDocument || 'Planlama İnisiyatifi',
      version: ruleData.version || 'v1.0',
      status: 'AKTIF'
    };

    setRules([newRule, ...rules]);
    showToast(`Yeni operasyonel kural (${newRule.code}) kaydedildi.`, 'info');
  };

  const handleForceAssignToVehicle = (loadId: string, vehicleId: string) => {
    const targetVeh = vehicles.find(v => v.id === vehicleId);
    const targetLoad = loads.find(l => l.id === loadId);
    if (!targetVeh || !targetLoad) return;

    const updatedLoads = loads.map(l => {
      if (l.id === loadId) {
        return {
          ...l,
          assignedVehicleId: targetVeh.id,
          assignedVehiclePlate: targetVeh.plate,
          status: 'PLANLANDI' as LoadMovement['status'],
          unassignedReason: 'NONE' as LoadMovement['unassignedReason'],
          unassignedExplanation: undefined
        };
      }
      return l;
    });

    const updatedVehicles = vehicles.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          assignedLoadIds: [...v.assignedLoadIds, loadId],
          currentDesi: v.currentDesi + targetLoad.totalDesi,
          currentPackages: v.currentPackages + targetLoad.packageCount,
          status: 'HAZIR' as Vehicle['status'],
          exceptionNote: `${v.exceptionNote || ''} [Yönetici İstisnasıyla ${targetLoad.trackingNumber} eklendi]`
        };
      }
      return v;
    });

    setLoads(updatedLoads);
    setVehicles(updatedVehicles);
    showToast(`${targetLoad.trackingNumber} nolu yük yönetici inisiyatifiyle ${targetVeh.plate} aracına atandı.`, 'warning');
  };

  const unassignedCount = hasCalculated 
    ? loads.filter(l => l.status === 'ACIKTA_KALAN' || !l.assignedVehicleId).length
    : 0;

  const pendingRuleCount = rules.filter(r => r.status === 'DOGRULAMA_GEREKLI').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-emerald-300 border-emerald-500'
              : toastMessage.type === 'warning'
              ? 'bg-amber-950 text-amber-200 border-amber-600'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 17-Item Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        unassignedCount={unassignedCount}
        pendingRuleCount={pendingRuleCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Operational Bar */}
        <TopBar
          metadata={metadata}
          hasCalculated={hasCalculated}
          summary={summary}
          onRunOptimization={handleRunOptimization}
          onResetData={handleResetData}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Dynamic Page Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewPage
              metadata={metadata}
              hasCalculated={hasCalculated}
              summary={summary}
              facilities={facilities}
              vehicles={vehicles}
              routes={routes}
              loads={loads}
              forecast={forecast}
              onRunOptimization={handleRunOptimization}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'manuel_paket_girisi' && (
            <ManuelPaketGirisiPage
              forecast={forecast}
              onUpdateTotalPackages={handleUpdateTotalPackages}
              onUpdateCustomCoefficients={handleUpdateCustomCoefficients}
            />
          )}

          {currentTab === 'data_management' && (
            <DataManagementPage
              loads={loads}
              facilities={facilities}
              vehicles={vehicles}
              routes={routes}
              onOpenNewLoadModal={() => setShowNewLoadModal(true)}
            />
          )}

          {currentTab === 'excel_import' && (
            <ExcelImportPage />
          )}

          {currentTab === 'package_matrix' && (
            <PackageMatrixPage
              facilities={facilities}
              loads={loads}
              forecast={forecast}
            />
          )}

          {currentTab === 'desi_matrix' && (
            <DesiMatrixPage
              facilities={facilities}
              loads={loads}
              forecast={forecast}
            />
          )}

          {currentTab === 'facility_vehicle_definitions' && (
            <FacilityVehicleDefinitionsPage
              facilities={facilities}
              vehicles={vehicles}
            />
          )}

          {currentTab === 'fixed_line_management' && (
            <FixedLineManagementPage
              routes={routes}
              facilities={facilities}
            />
          )}

          {currentTab === 'line_planning_optimization' && (
            <LinePlanningOptimizationPage
              vehicles={vehicles}
              routes={routes}
              loads={loads}
              hasCalculated={hasCalculated}
              onRunOptimization={handleRunOptimization}
              onSelectVehicle={(veh) => setSelectedVehicle(veh)}
            />
          )}

          {currentTab === 'direct_line_analysis' && (
            <DirectLineAnalysisPage
              facilities={facilities}
              loads={loads}
              routes={routes}
            />
          )}

          {currentTab === 'vehicle_optimization' && (
            <VehicleOptimizationPage
              vehicles={vehicles}
              routes={routes}
              hasCalculated={hasCalculated}
            />
          )}

          {currentTab === 'ankara_cross_dock' && (
            <AnkaraCrossDockPage
              facilities={facilities}
              loads={loads}
              routes={routes}
              vehicles={vehicles}
              hasCalculated={hasCalculated}
            />
          )}

          {currentTab === 'gebze_cross_dock' && (
            <GebzeCrossDockPage
              facilities={facilities}
              loads={loads}
              routes={routes}
              hasCalculated={hasCalculated}
            />
          )}

          {currentTab === 'vehicle_load_lists' && (
            <VehicleLoadListsPage
              vehicles={vehicles}
              loads={loads}
              routes={routes}
              facilities={facilities}
              hasCalculated={hasCalculated}
            />
          )}

          {currentTab === 'unassigned_packages' && (
            <UnassignedPackagesPage
              unassignedLoads={loads.filter(l => l.status === 'ACIKTA_KALAN' || !l.assignedVehicleId)}
              vehicles={vehicles}
              facilities={facilities}
              routes={routes}
              hasCalculated={hasCalculated}
              onForceAssignToVehicle={handleForceAssignToVehicle}
              onOpenVerificationCenter={() => setCurrentTab('operation_rules')}
            />
          )}

          {currentTab === 'operation_rules' && (
            <OperationRulesPage
              rules={rules}
              onVerifyRule={handleVerifyRule}
              onAddNewRule={handleAddNewRule}
            />
          )}

          {currentTab === 'planning_history' && (
            <PlanningHistoryPage
              summary={summary}
              hasCalculated={hasCalculated}
              onOpenReportModal={() => setShowReportModal(true)}
            />
          )}

          {currentTab === 'reporting_excel' && (
            <ReportingExcelPage
              summary={summary}
              vehicles={vehicles}
              loads={loads}
              routes={routes}
              hasCalculated={hasCalculated}
            />
          )}
        </main>
      </div>

      {/* Shared Modals */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          routes={routes}
          loads={loads}
          facilities={facilities}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {showReportModal && (
        <OptimizationReportModal
          summary={summary}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showNewLoadModal && (
        <NewLoadModal
          facilities={facilities}
          routes={routes}
          onAddLoad={handleAddLoad}
          onClose={() => setShowNewLoadModal(false)}
        />
      )}
    </div>
  );
}
