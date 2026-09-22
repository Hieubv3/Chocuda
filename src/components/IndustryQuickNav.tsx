import React from 'react';
import { Building2, KeyRound, Wrench, Briefcase } from 'lucide-react';

interface IndustryQuickNavProps {
  currentTab?: string;
  setCurrentTab: (tab: string) => void;
  className?: string;
}

/**
 * Thanh điều hướng 4 NHÓM NGÀNH dùng chung cho toàn site:
 *  1. Mua Bán BĐS  2. Cho Thuê BĐS  3. Dịch Vụ Cư Dân  4. Việc Làm Nội Khu
 *
 * Trước đây 4 nhóm này chỉ có ở Trang chủ => các trang khác bị "thiếu menu".
 * Component này được gắn toàn cục (App.tsx) để MỌI TRANG đều có 4 menu phụ.
 */
export const IndustryQuickNav: React.FC<IndustryQuickNavProps> = ({ currentTab, setCurrentTab, className = '' }) => {
  const items = [
    {
      tab: 'sale',
      label: 'Mua Bán BĐS',
      desc: 'Căn hộ, Shophouse, Biệt thự',
      Icon: Building2,
      active: 'border-brand-500 ring-2 ring-brand-500/40 bg-brand-50 dark:bg-brand-950/30',
      iconBox: 'bg-brand-500 text-ink-950',
      text: 'text-brand-600 dark:text-brand-400',
    },
    {
      tab: 'rent',
      label: 'Cho Thuê BĐS',
      desc: 'Căn hộ, Shophouse, Mặt bằng',
      Icon: KeyRound,
      active: 'border-sky-500 ring-2 ring-sky-500/40 bg-sky-50 dark:bg-sky-950/30',
      iconBox: 'bg-sky-500 text-white',
      text: 'text-sky-600 dark:text-sky-400',
    },
    {
      tab: 'services',
      label: 'Dịch Vụ Cư Dân',
      desc: 'Sửa chữa, dọn dẹp, tiện ích',
      Icon: Wrench,
      active: 'border-brand-500 ring-2 ring-brand-500/40 bg-brand-50 dark:bg-brand-950/30',
      iconBox: 'bg-brand-600 text-white',
      text: 'text-brand-600 dark:text-brand-400',
    },
    {
      tab: 'recruitment',
      label: 'Việc Làm Nội Khu',
      desc: 'Tuyển dụng & tìm việc làm',
      Icon: Briefcase,
      active: 'border-teal-500 ring-2 ring-teal-500/40 bg-teal-50 dark:bg-teal-950/30',
      iconBox: 'bg-teal-600 text-white',
      text: 'text-teal-600 dark:text-teal-400',
    },
  ];

  return (
    <nav
      aria-label="Điều hướng 4 nhóm ngành"
      className={`hidden lg:block w-full bg-ink-100/90 dark:bg-ink-900/70 border-b border-ink-200 dark:border-ink-800 ${className}`}
    >
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {items.map((item) => {
            const Icon = item.Icon;
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setCurrentTab(item.tab)}
                title={item.label}
                className={`group flex items-center gap-2 rounded-xl border bg-white dark:bg-ink-900 px-2.5 py-2 text-left transition hover:shadow-sm cursor-pointer ${
                  isActive ? item.active : 'border-ink-200 dark:border-ink-700 hover:border-ink-400'
                }`}
              >
                <span className={`p-1.5 rounded-lg shrink-0 ${item.iconBox}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] sm:text-xs font-black truncate text-ink-900 dark:text-white">
                    {item.label}
                  </span>
                  <span className={`block text-[9px] sm:text-[10px] font-semibold truncate ${item.text}`}>
                    {item.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default IndustryQuickNav;
