import React from 'react';
import { 
  NavigationTab 
} from '../types/logistics';
import { 
  LayoutDashboard, 
  Database, 
  FileSpreadsheet, 
  Grid3X3, 
  BarChart3, 
  Truck, 
  GitFork, 
  Compass, 
  Zap, 
  Cpu, 
  Building2, 
  Warehouse, 
  ClipboardList, 
  AlertTriangle, 
  ShieldCheck, 
  History, 
  FileText,
  Calculator,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unassignedCount?: number;
  pendingRuleCount?: number;
}

interface MenuItem {
  id: NavigationTab;
  number: number;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  unassignedCount = 0,
  pendingRuleCount = 0
}) => {
  const sections: MenuSection[] = [
    {
      title: 'GENEL BAKIŞ & KONTROL',
      items: [
        { id: 'overview', number: 1, label: 'Genel Bakış', icon: LayoutDashboard }
      ]
    },
    {
      title: 'HESAPLAMA MOTORU & MATRİS',
      items: [
        { 
          id: 'manuel_paket_girisi', 
          number: 0, 
          label: 'Manuel Paket Girişi', 
          icon: Calculator,
          badge: '19×19 OD',
          badgeColor: 'bg-emerald-600 text-white font-bold'
        },
        { id: 'data_management', number: 2, label: 'Veri Yönetimi', icon: Database },
        { id: 'excel_import', number: 3, label: 'Excel Veri Aktarımı', icon: FileSpreadsheet },
        { id: 'package_matrix', number: 4, label: 'Paket Dağılım Matrisi', icon: Grid3X3 },
        { id: 'desi_matrix', number: 5, label: 'Desi Dağılım Matrisi', icon: BarChart3 }
      ]
    },
    {
      title: 'FİLO VE HAT TANIMLARI',
      items: [
        { id: 'facility_vehicle_definitions', number: 6, label: 'Tesis ve Araç Tanımları', icon: Truck },
        { id: 'fixed_line_management', number: 7, label: 'Sabit Hat Yönetimi', icon: GitFork }
      ]
    },
    {
      title: 'PLANLAMA VE OPTİMİZASYON',
      items: [
        { id: 'line_planning_optimization', number: 8, label: 'Hat Planlama ve Optimizasyon', icon: Compass },
        { id: 'direct_line_analysis', number: 9, label: 'Direkt Hat Analizi', icon: Zap },
        { id: 'vehicle_optimization', number: 10, label: 'Araç Optimizasyonu', icon: Cpu }
      ]
    },
    {
      title: 'CROSS DOCK MERKEZLERİ',
      items: [
        { id: 'ankara_cross_dock', number: 11, label: 'Ankara Cross Dock', icon: Building2 },
        { id: 'gebze_cross_dock', number: 12, label: 'Gebze Cross Dock', icon: Warehouse }
      ]
    },
    {
      title: 'OPERASYON VE DAĞITIM',
      items: [
        { id: 'vehicle_load_lists', number: 13, label: 'Araç Yükleme Listeleri', icon: ClipboardList },
        { 
          id: 'unassigned_packages', 
          number: 14, 
          label: 'Açıkta Kalan Paketler', 
          icon: AlertTriangle,
          badge: unassignedCount > 0 ? `${unassignedCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white'
        }
      ]
    },
    {
      title: 'YÖNETİŞİM VE RAPORLAMA',
      items: [
        { 
          id: 'operation_rules', 
          number: 15, 
          label: 'Operasyon Kuralları', 
          icon: ShieldCheck,
          badge: pendingRuleCount > 0 ? `${pendingRuleCount}` : undefined,
          badgeColor: 'bg-amber-500 text-slate-950'
        },
        { id: 'planning_history', number: 16, label: 'Planlama Geçmişi', icon: History },
        { id: 'reporting_excel', number: 17, label: 'Raporlama ve Excel Çıktısı', icon: FileText }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand / Logo */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
              LH
            </div>
            <div>
              <h1 className="font-bold text-white text-xs tracking-tight">
                LOJİSTİK HAT MERKEZİ
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">
                Ankara &bull; Çok Tesisli Ağ
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs scrollbar-thin">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors font-medium
                        ${isActive 
                          ? 'bg-blue-600/20 text-white font-semibold border-l-3 border-blue-500 shadow-sm' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`text-[10px] font-mono shrink-0 w-4 ${isActive ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
                          {item.number > 0 ? `${item.number}.` : '★'}
                        </span>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                        <span className="truncate text-xs">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-[10px]">
            <span>Faz 1: Mimari &amp; Navigasyon</span>
            <span className="text-emerald-400 font-semibold">Aktif</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 font-mono truncate">
            Sürüm: 2026.11.06 (Masaüstü Öncelikli)
          </div>
        </div>
      </aside>
    </>
  );
};
