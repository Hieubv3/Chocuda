import React from 'react';
import { MapPin } from 'lucide-react';

export interface AreaOption {
  key: string;
  label: string;
  icon: string;
}

export const AREA_OPTIONS: AreaOption[] = [
  { key: 'ha-noi', label: 'Hà Nội', icon: '🏙️' },
  { key: 'tp-hcm', label: 'TP. Hồ Chí Minh', icon: '🌆' },
  { key: 'da-nang', label: 'Đà Nẵng', icon: '🌉' },
  { key: 'hai-phong', label: 'Hải Phòng', icon: '⚓' },
  { key: 'quang-ninh', label: 'Quảng Ninh', icon: '⛰️' },
  { key: 'long-an', label: 'Long An', icon: '🌾' },
  { key: 'khac', label: 'Thành phố khác', icon: '📍' },
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
}

/**
 * Modal chọn khu vực lần đầu tham gia (Hà Nội, TP.HCM, Đà Nẵng, ...).
 */
export const AreaSelectModal: React.FC<AreaSelectModalProps> = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Chọn khu vực của bạn</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chúng tôi sẽ ưu tiên hiển thị tin &amp; dịch vụ gần khu vực của bạn nhất.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {AREA_OPTIONS.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => onSelect(a)}
              className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-400 active:scale-95 transition text-left cursor-pointer"
            >
              <span className="text-lg shrink-0">{a.icon}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
