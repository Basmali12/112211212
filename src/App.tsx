import { useState } from 'react';
import {
  CheckCircle2,
  FolderSync,
  Folder,
  HardDrive,
  Shield,
  Palette,
  Eye,
  Sliders,
  Sparkles,
  ChevronDown,
  Settings,
  Home,
  File
} from 'lucide-react';
import type { AppConfig, ToastNotification, SimulatorView } from './types';
import { DesktopWindow } from './components/DesktopWindow';
import { ToastContainer } from './components/Toast';
import { StorageLocationModal } from './components/StorageLocationModal';
import { INITIAL_MILITARY_RECORDS } from './mockData';
import { usePwaInstall } from './usePwaInstall';
import {
  MilitaryCamoBackground,
  CamoPatternType,
  CamoIntensity
} from './components/MilitaryCamoBackground';

const CONFIG_STORAGE_KEY = 'customtkinter_desktop_app_config_v1';
const CAMO_STORAGE_KEY = 'military_camo_preferences_v1';

const DEFAULT_CONFIG: AppConfig = {
  appearance_mode: 'Dark',
  color_theme: 'blue',
  default_save_path: 'C:\\Data\\Exports',
  last_updated: new Date().toISOString(),
};

export default function App() {
  const [activeSimulatorView, setActiveSimulatorView] = useState<SimulatorView>('home');
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CONFIG;
  });

  // Military Camouflage Background State (مرقطة مع جندي تكتيكي)
  const [camoEnabled, setCamoEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${CAMO_STORAGE_KEY}_enabled`);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [camoPattern, setCamoPattern] = useState<CamoPatternType>(() => {
    try {
      const saved = localStorage.getItem(`${CAMO_STORAGE_KEY}_pattern`);
      return (saved as CamoPatternType) || 'soldier';
    } catch {
      return 'soldier';
    }
  });

  const [camoIntensity, setCamoIntensity] = useState<CamoIntensity>(() => {
    try {
      const saved = localStorage.getItem(`${CAMO_STORAGE_KEY}_intensity`);
      return (saved as CamoIntensity) || 'medium';
    } catch {
      return 'medium';
    }
  });

  const [isCamoMenuOpen, setIsCamoMenuOpen] = useState<boolean>(false);

  const setAndSaveCamoPattern = (pat: CamoPatternType) => {
    setCamoPattern(pat);
    try {
      localStorage.setItem(`${CAMO_STORAGE_KEY}_pattern`, pat);
    } catch {}
  };

  const setAndSaveCamoIntensity = (inte: CamoIntensity) => {
    setCamoIntensity(inte);
    try {
      localStorage.setItem(`${CAMO_STORAGE_KEY}_intensity`, inte);
    } catch {}
  };

  const setAndSaveCamoEnabled = (enabled: boolean) => {
    setCamoEnabled(enabled);
    try {
      localStorage.setItem(`${CAMO_STORAGE_KEY}_enabled`, JSON.stringify(enabled));
    } catch {}
  };

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isAppStorageModalOpen, setIsAppStorageModalOpen] = useState<boolean>(false);
  const [appRecords] = useState(INITIAL_MILITARY_RECORDS);
  const { isInstallable, promptInstall } = usePwaInstall();

  // Sync config to localStorage
  const updateConfig = (newProps: Partial<AppConfig>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        ...newProps,
        last_updated: new Date().toISOString(),
      };
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Local storage failure fallback
      }
      return updated;
    });
  };

  const showToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastNotification = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Military Camouflage Background with Soldier Silhouette and mottled texture */}
      {camoEnabled && (
        <MilitaryCamoBackground
          pattern={camoPattern}
          intensity={camoIntensity}
          showSoldier={camoPattern === 'soldier'}
        />
      )}

      {/* Top Bar Contract: 3-Zone Clean Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪖</span>
              <span className="text-lg font-bold tracking-tight text-white">
                منظومة شؤون المنتسبين العسكرية
              </span>
            </div>
          </div>

          {/* Zone 2 / 3: Top Navigation Tabs, Military Camo Controller & Primary actions */}
          <div className="flex items-center gap-2.5">
            {/* Top Navigation Tabs: الرئيسية والإعدادات */}
            <div className="flex items-center gap-1 bg-neutral-950/80 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveSimulatorView('home')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSimulatorView === 'home'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
                title="الانتقال إلى الرئيسية (السجلات والبحث)"
              >
                <Home className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </button>

              {/* زر تبويبة الملفات (أضابير الفوج والسرايا) */}
              <button
                onClick={() => setActiveSimulatorView('blank')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSimulatorView === 'blank'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
                title="عرض أضابير وسجلات الفوج والسرايا والوحدات"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>الملفات</span>
              </button>

              <button
                onClick={() => setActiveSimulatorView('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSimulatorView === 'settings'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
                title="الانتقال إلى الإعدادات (حفظ C: واستيراد وتصدير Excel)"
              >
                <Settings className={`w-3.5 h-3.5 ${activeSimulatorView === 'settings' ? 'rotate-90 transition-transform duration-300' : ''}`} />
                <span>⚙️ الإعدادات</span>
              </button>
            </div>

            {/* Camouflage Theme Dropdown Controller (بجانب تبويبة الإعدادات تماماً) */}
            <div className="relative">
              <button
                onClick={() => setIsCamoMenuOpen(!isCamoMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  camoEnabled
                    ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-200 hover:bg-emerald-900 shadow-xs'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-750'
                }`}
                title="تخصيص الخلفية العسكرية المرقطة ومظهر الجندي"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>خلفية مرقطة عسكرية</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Camo Settings Menu */}
              {isCamoMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-3 z-50 text-right font-sans"
                  dir="rtl"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>🪖</span> إعدادات الخلفية المرقطة
                    </span>
                    <button
                      onClick={() => setAndSaveCamoEnabled(!camoEnabled)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                        camoEnabled
                          ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {camoEnabled ? 'مفعلة ✓' : 'معطلة'}
                    </button>
                  </div>

                  {/* Patterns Selection */}
                  <div className="space-y-1 mb-3">
                    <div className="text-[11px] text-neutral-400 font-semibold mb-1">
                      اختر نمط التمويه المرقط:
                    </div>
                    {[
                      { id: 'soldier', label: '🪖 مرقط تكتيكي + جندي مقاتل', desc: 'تمويه مرقط مع صورة ظلية لجندي بالعتاد' },
                      { id: 'woodland', label: '🌲 مرقط كلاسيكي (Woodland)', desc: 'بقع مموهة زيتونية وخاكية أصلية' },
                      { id: 'digital', label: '👾 مرقط رقمي تكتيكي (Digital)', desc: 'تمويه بكسل رقمي عسكري متطور' },
                      { id: 'desert', label: '🏜️ مرقط صحراوي (Desert Camo)', desc: 'ألوان رملية وبيج تكتيكية' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAndSaveCamoPattern(item.id as CamoPatternType)}
                        className={`w-full text-right p-2 rounded-lg text-xs transition-colors flex flex-col cursor-pointer ${
                          camoPattern === item.id
                            ? 'bg-emerald-950/70 border border-emerald-600/80 text-emerald-200'
                            : 'bg-neutral-850/60 hover:bg-neutral-800 text-neutral-300 border border-transparent'
                        }`}
                      >
                        <span className="font-bold">{item.label}</span>
                        <span className="text-[10px] text-neutral-400">{item.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Intensity Selection */}
                  <div className="border-t border-neutral-800 pt-2">
                    <div className="text-[11px] text-neutral-400 font-semibold mb-1.5">
                      درجة وضوح التمويه المرقط:
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'subtle', label: 'خفيف' },
                        { id: 'medium', label: 'متوسط' },
                        { id: 'bold', label: 'بارز وقوي' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setAndSaveCamoIntensity(item.id as CamoIntensity)}
                          className={`py-1 rounded text-center text-xs font-semibold cursor-pointer transition-colors ${
                            camoIntensity === item.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isInstallable && (
              <button
                onClick={promptInstall}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer animate-pulse"
                title="تثبيت التطبيق كبرنامج مستقل لسطح المكتب يعمل أوفلاين بدون إنترنت وبدون بايثون"
              >
                <span>💻 تثبيت كبرنامج لسطح المكتب</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Viewport: Complete Standalone System */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <DesktopWindow
          config={config}
          onUpdateConfig={updateConfig}
          onShowToast={showToast}
          activeView={activeSimulatorView}
          onActiveViewChange={setActiveSimulatorView}
        />
      </main>

      {/* Military Software Footer */}
      <footer className="border-t border-neutral-850 py-5 text-xs text-neutral-500 text-center font-sans">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <p>
            منظومة شؤون وسجلات المنتسبين العسكرية — نظام مستقل لإدارة قواعد البيانات والتحديث الفوري في قرص C:
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>برنامج حاسوب مستقل</span>
            <span>·</span>
            <span>تخزين مباشر Excel (.xlsx)</span>
          </div>
        </div>
      </footer>

      {/* Floating Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Storage Location & C: Drive Instant Persistence Modal */}
      <StorageLocationModal
        isOpen={isAppStorageModalOpen}
        onClose={() => setIsAppStorageModalOpen(false)}
        config={config}
        records={appRecords}
        onUpdateConfig={updateConfig}
        onShowToast={showToast}
        isDarkMode={config.appearance_mode === 'Dark'}
      />
    </div>
  );
}
