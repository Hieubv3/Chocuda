import React from 'react';

export interface AdminMobileNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

interface AdminMobileNavProps {
  items: AdminMobileNavItem[];
}

/**
 * Thanh điều hướng dưới cho Admin trên mobile (thiết kế mới).
 * - Chỉ hiển thị trên màn hình nhỏ (md:hidden).
 * - Có safe-area-inset-bottom cho iPhone.
 */
export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({ items }) => {
  return (
    <nav
      className="cd24-admin-mobile-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-6px_20px_rgba(16,40,32,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Điều hướng quản trị"
    >
      <div className="flex items-stretch">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={it.onClick}
            data-admin-menu-trigger={it.key === 'menu' ? 'true' : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold transition active:scale-95 cursor-pointer ${
              it.active
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span
              className={`flex items-center justify-center w-10 h-6 rounded-xl transition ${
                it.active ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''
              }`}
            >
              {it.icon}
            </span>
            <span className="leading-none">{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default AdminMobileNav;
