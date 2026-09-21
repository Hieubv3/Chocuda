import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Building2, KeyRound, Wrench, Briefcase, LayoutGrid, X } from 'lucide-react';

interface MobileIndustryMenuProps {
  currentTab?: string;
  setCurrentTab: (tab: string) => void;
}

/**
 * Menu 4 NGÀNH dạng NỔI cho DI ĐỘNG (chỉ hiện < lg):
 *  - Tự động MỞ khi vào bất kỳ trang nào
 *  - Tự động THU GỌN (ẩn) sau vài giây nếu người dùng không tương tác
 *  - Bấm nút tròn để mở lại
 */
const ITEMS = [
  { tab: 'sale', label: 'Mua Bán BĐS', Icon: Building2, box: 'bg-amber-500 text-slate-950' },
  { tab: 'rent', label: 'Cho Thuê BĐS', Icon: KeyRound, box: 'bg-sky-500 text-white' },
  { tab: 'services', label: 'Dịch Vụ Cư Dân', Icon: Wrench, box: 'bg-emerald-600 text-white' },
  { tab: 'recruitment', label: 'Việc Làm Nội Khu', Icon: Briefcase, box: 'bg-teal-600 text-white' },
];

const AUTO_HIDE_MS = 5000;

export const MobileIndustryMenu: React.FC<MobileIndustryMenuProps> = ({ currentTab, setCurrentTab }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearTimer();
    timerRef.current = window.setTimeout(() => setOpen(false), AUTO_HIDE_MS);
  };

  const reveal = () => {
    setOpen(true);
    scheduleHide();
  };

  // Tự mở khi vào trang mới (trừ trang chủ)
  useEffect(() => {
    if (location.pathname === '/') {
      clearTimer();
      setOpen(false);
      return;
    }
    setOpen(true);
    scheduleHide();
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (location.pathname === '/') return null;

  return (
    <div className="lg:hidden fixed left-3 bottom-20 z-40 flex flex-col items-start gap-2">
      {/* Danh sách 4 ngành */}
      <div
        className={`flex flex-col items-start gap-2 transition-all duration-300 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
        onMouseEnter={clearTimer}
        onMouseLeave={scheduleHide}
        onTouchStart={clearTimer}
      >
        {ITEMS.map((item) => {
          const Icon = item.Icon;
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => {
                setCurrentTab(item.tab);
                scheduleHide();
              }}
              className={`flex items-center gap-2 rounded-full border pl-3 pr-1.5 py-1.5 shadow-lg backdrop-blur bg-white/95 dark:bg-slate-900/95 transition ${
                isActive ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className={`p-1.5 rounded-full shrink-0 ${item.box}`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold whitespace-nowrap text-slate-900 dark:text-white">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Nút tròn mở/đóng */}
      <button
        type="button"
        aria-label={open ? 'Đóng menu ngành' : 'Mở menu ngành'}
        onClick={() => {
          if (open) {
            clearTimer();
            setOpen(false);
          } else {
            reveal();
          }
        }}
        className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-2xl flex items-center justify-center transition"
      >
        {open ? <X className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default MobileIndustryMenu;
