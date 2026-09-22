import React from 'react';
import { MapPin, ChevronRight, ChevronLeft, Check, Wrench, Briefcase, Store, Building2, Search, Users } from 'lucide-react';
import { VIN_MAJOR_PROJECTS } from '../data/residentServicesData';
import { Language } from '../types';
import { getTranslation } from '../lib/i18n';

export interface AreaOption {
  key: string;
  label: string;
  icon: string;
}

export const AREA_OPTIONS: AreaOption[] = [
  { key: 'ha-noi', label: 'Hà Nội', icon: '' },
  { key: 'tp-hcm', label: 'TP. Hồ Chí Minh', icon: '' },
  { key: 'da-nang', label: 'Đà Nẵng', icon: '' },
  { key: 'hai-phong', label: 'Hải Phòng', icon: '' },
  { key: 'quang-ninh', label: 'Quảng Ninh', icon: '' },
  { key: 'long-an', label: 'Long An', icon: '' },
  { key: 'khac', label: 'Thành phố khác', icon: '' },
];

export const AREA_STORAGE_KEY = 'chocudan24h_area';

export function getStoredArea(): AreaOption | null {
  try {
    const raw = localStorage.getItem(AREA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.key) return parsed as AreaOption;
  } catch {
    /* ignore */
  }
  return null;
}

interface AreaSelectModalProps {
  isOpen: boolean;
  onSelect: (area: AreaOption) => void;
  onClose?: () => void;
  language?: Language;
}

/**
 * Luồng chọn khu vực và dự án trước khi vào giao diện chính.
 * Ba bước: khu vực, dự án đang ở hoặc muốn tìm hiểu, nhu cầu quan tâm.
 */
export const AreaSelectModal: React.FC<AreaSelectModalProps> = ({ isOpen, onSelect, onClose, language = 'vi' }) => {
  const t = getTranslation(language);
  const [step, setStep] = React.useState(1);
  const [area, setArea] = React.useState<AreaOption | null>(null);
  const [project, setProject] = React.useState<string>('all');
  const [needs, setNeeds] = React.useState<string[]>(['services', 'recruitment']);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (isOpen) { setStep(1); setQuery(''); }
  }, [isOpen]);

  if (!isOpen) return null;

  const PROJECT_OPTIONS = VIN_MAJOR_PROJECTS as unknown as { id: string; name: string; tag?: string; location?: string }[];
  const filteredProjects = PROJECT_OPTIONS.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (p.name || '').toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q);
  });

  const NEED_OPTIONS = [
    { key: 'services', label: t.ui.needServices, icon: Wrench },
    { key: 'recruitment', label: t.ui.needJobs, icon: Briefcase },
    { key: 'market', label: t.ui.needMarket, icon: Store },
    { key: 'realestate', label: t.ui.needRealEstate, icon: Building2 },
    { key: 'community', label: t.ui.needCommunity, icon: Users },
  ];

  const toggleNeed = (key: string) => {
    setNeeds((prev) => prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]);
  };

  const finish = () => {
    const chosen: AreaOption = area || { key: 'khac', label: 'Toàn quốc', icon: '' };
    try {
      localStorage.setItem('chocudan24h_area_project', JSON.stringify({ areaKey: chosen.key, project, needs }));
    } catch { /* ignore */ }
    onSelect(chosen);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-white dark:bg-ink-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-ink-200 dark:border-ink-700">
        <div className="p-5 space-y-4">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-ink-900 dark:text-white">
              {step === 1 ? t.ui.chooseAreaTitle : step === 2 ? t.ui.chooseProjectTitle : t.ui.chooseNeedsTitle}
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              {step === 1 ? t.ui.chooseAreaSub : step === 2 ? t.ui.chooseProjectSub : t.ui.chooseNeedsSub}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <span key={s} className={s <= step ? 'h-1.5 w-8 rounded-full bg-brand-600' : 'h-1.5 w-8 rounded-full bg-ink-200 dark:bg-ink-700'} />
            ))}
          </div>

          {step === 1 && (
            <div className="grid grid-cols-2 gap-2">
              {AREA_OPTIONS.map((a) => (
                <button key={a.key} type="button"
                  onClick={() => { setArea(a); setStep(2); }}
                  className="flex items-center gap-2 p-3 rounded-2xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/60 hover:border-brand-400 active:scale-95 transition text-left cursor-pointer">
                  <span className="text-xs font-bold text-ink-800 dark:text-ink-100 leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 h-11 rounded-2xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/60">
                <Search className="w-4 h-4 text-ink-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.ui.searchProjectPlaceholder}
                  className="flex-1 bg-transparent outline-none text-xs font-semibold text-ink-800 dark:text-ink-100 placeholder:text-ink-400" />
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => setProject('all')}
                  className={project === 'all' ? 'w-full flex items-center gap-2 p-3 rounded-2xl border-2 border-brand-500 bg-brand-500/10 text-left' : 'w-full flex items-center gap-2 p-3 rounded-2xl border border-ink-200 dark:border-ink-700 text-left'}>
                  <Building2 className="w-4 h-4 text-brand-500" />
                  <span className="text-xs font-bold text-ink-800 dark:text-ink-100">{t.ui.allProjects}</span>
                  {project === 'all' && <Check className="w-4 h-4 text-brand-500 ml-auto" />}
                </button>
                {filteredProjects.map((p) => (
                  <button key={p.id} type="button" onClick={() => setProject(String(p.id))}
                    className={project === String(p.id) ? 'w-full flex items-center gap-2 p-3 rounded-2xl border-2 border-brand-500 bg-brand-500/10 text-left' : 'w-full flex items-center gap-2 p-3 rounded-2xl border border-ink-200 dark:border-ink-700 text-left'}>
                    <MapPin className="w-4 h-4 text-brand-500" />
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-ink-800 dark:text-ink-100 truncate">{p.name}</span>
                      {p.location && <span className="block text-[10px] text-ink-400 truncate">{p.location}</span>}
                    </span>
                    {project === String(p.id) && <Check className="w-4 h-4 text-brand-500 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-2">
              {NEED_OPTIONS.map((n) => {
                const Icon = n.icon;
                const on = needs.includes(n.key);
                return (
                  <button key={n.key} type="button" onClick={() => toggleNeed(n.key)} aria-pressed={on}
                    className={on ? 'flex items-center gap-2 p-3 rounded-2xl border-2 border-brand-500 bg-brand-500/10 text-left' : 'flex items-center gap-2 p-3 rounded-2xl border border-ink-200 dark:border-ink-700 text-left'}>
                    <Icon className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-bold text-ink-800 dark:text-ink-100">{n.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)}
                className="h-11 px-4 rounded-2xl border border-ink-300 dark:border-ink-600 text-xs font-bold text-ink-700 dark:text-ink-200 flex items-center gap-1 active:scale-95 transition">
                <ChevronLeft className="w-4 h-4" /> {t.ui.back}
              </button>
            ) : (
              <button type="button" onClick={onClose}
                className="h-11 px-4 rounded-2xl border border-ink-300 dark:border-ink-600 text-xs font-bold text-ink-700 dark:text-ink-200 active:scale-95 transition">
                {t.ui.skip}
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)}
                className="flex-1 h-11 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black flex items-center justify-center gap-1 active:scale-95 transition">
                {t.ui.continue} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={finish}
                className="flex-1 h-11 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black flex items-center justify-center gap-1 active:scale-95 transition">
                {t.ui.enterApp} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
