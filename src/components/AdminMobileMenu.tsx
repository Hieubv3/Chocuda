import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface AdminMobileMenuItem {
  key: string;
  label: string;
  onClick: () => void;
  active?: boolean;
}

export interface AdminMobileMenuGroup {
  title: string;
  items: AdminMobileMenuItem[];
}

interface AdminMobileMenuProps {
  open: boolean;
  onClose: () => void;
  groups: AdminMobileMenuGroup[];
}

/**
 * Drawer "Tất cả chức năng" cho Admin trên mobile.
 * - Trượt từ phải sang, có nền mờ (backdrop) bấm để đóng.
 * - Bấm từng mục sẽ điều hướng tới đúng khu chức năng (parent xử lý).
 * - Chỉ tồn tại trên màn < 1024px (lg:hidden).
 */
export const AdminMobileMenu: React.FC<AdminMobileMenuProps> = ({ open, onClose, groups }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = (Array.from(panel.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')) as HTMLElement[])
        .filter((element: HTMLElement) => !element.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cd24-admin-mobile-menu lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="cd24-admin-mobile-menu-panel absolute right-0 top-0 bottom-0 w-[86%] max-w-[340px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Tất cả chức năng quản trị"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="text-[15px] font-black text-slate-900 dark:text-white">Tất cả chức năng</div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 pb-24 space-y-4">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1.5 mb-1.5">
                {g.title}
              </div>
              <div className="space-y-1">
                {g.items.map((it) => (
                  <button
                    key={it.key}
                    type="button"
                    onClick={it.onClick}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition active:scale-[0.98] cursor-pointer ${
                      it.active
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{it.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMobileMenu;
