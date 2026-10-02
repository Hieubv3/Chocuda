import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  LayoutGrid,
  Map,
  Menu as MenuIcon,
  Newspaper,
  Package,
  Plus,
  Settings2,
  ShieldCheck,
  Store,
  Users,
  Wrench,
  X,
} from 'lucide-react';

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
  inline?: boolean;
}

/**
 * Drawer "Tất cả chức năng" cho Admin trên mobile.
 * - Trượt từ phải sang, có nền mờ (backdrop) bấm để đóng.
 * - Bấm từng mục sẽ điều hướng tới đúng khu chức năng (parent xử lý).
 * - Chỉ tồn tại trên màn < 1024px (lg:hidden).
 */
export const AdminMobileMenu: React.FC<AdminMobileMenuProps> = ({ open, onClose, groups, inline = false }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setExpandedGroups(inline ? new Set([groups[0]?.title].filter(Boolean) as string[]) : new Set(groups.map(group => group.title)));
  }, [open, inline]);

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
      if (document.activeElement === panel) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
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

  const allExpanded = groups.length > 0 && groups.every(group => expandedGroups.has(group.title));
  const toggleGroup = (title: string) => {
    setExpandedGroups(current => {
      const next = new Set(current);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const iconFor = (key: string, label: string) => {
    const value = `${key} ${label}`.toLowerCase();
    if (value.includes('add') || value.includes('thêm')) return Plus;
    if (value.includes('property') || value.includes('bds') || value.includes('căn')) return Building2;
    if (value.includes('project') || value.includes('dự án')) return Map;
    if (value.includes('news') || value.includes('tin')) return Newspaper;
    if (value.includes('service') || value.includes('dịch vụ')) return Wrench;
    if (value.includes('job') || value.includes('tuyển')) return BriefcaseBusiness;
    if (value.includes('store') || value.includes('gian hàng')) return Store;
    if (value.includes('user') || value.includes('cư dân')) return Users;
    if (value.includes('pricing') || value.includes('giá')) return Package;
    if (value.includes('faq') || value.includes('hỏi')) return CircleDot;
    if (value.includes('analytics') || value.includes('phân tích')) return Activity;
    if (value.includes('setting') || value.includes('cấu hình')) return Settings2;
    if (value.includes('security') || value.includes('kyc')) return ShieldCheck;
    return LayoutGrid;
  };

  return (
    <div className={`cd24-admin-mobile-menu ${inline ? 'cd24-admin-mobile-menu-inline relative z-10' : 'lg:hidden fixed inset-0 z-50'}`}>
      {!inline && <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} />}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`cd24-admin-mobile-menu-panel ${inline ? 'relative w-full rounded-2xl border border-emerald-900/40' : 'absolute inset-0 w-full max-w-none'} bg-white dark:bg-slate-900 shadow-2xl flex flex-col`}
        role={inline ? 'region' : 'dialog'}
        aria-modal={inline ? undefined : true}
        aria-label="Tất cả chức năng quản trị"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white shadow-sm">
              <MenuIcon className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[15px] font-black text-slate-900 dark:text-white">Chức năng quản trị</div>
              <div className="text-[10px] text-slate-400 font-bold">Chọn nhóm để mở các ô chức năng</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setExpandedGroups(allExpanded ? new Set() : new Set(groups.map(group => group.title)))}
              className="px-2.5 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300 active:scale-95 transition cursor-pointer"
            >
              {allExpanded ? 'Thu gọn' : 'Mở toàn bộ'}
            </button>
            {!inline && <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition cursor-pointer"
              aria-label="Đóng menu"
            >
              <X className="w-4 h-4" />
            </button>}
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto p-3 pb-5 ${inline ? 'grid grid-cols-2 gap-3 items-start' : 'space-y-4'}`}>
          {groups.map((g) => (
            <div key={g.title} className={`${inline ? (expandedGroups.has(g.title) ? 'col-span-2' : '') : ''} rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/20 overflow-hidden`}>
              <button
                type="button"
                onClick={() => toggleGroup(g.title)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left cursor-pointer"
                aria-expanded={expandedGroups.has(g.title)}
              >
                <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </span>
                  {g.title}
                </span>
                {expandedGroups.has(g.title) ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedGroups.has(g.title) && (
                <div className="grid grid-cols-2 gap-2 p-2 pt-0">
                  {g.items.map((it) => {
                    const Icon = iconFor(it.key, it.label);
                    return (
                      <button
                        key={it.key}
                        type="button"
                        onClick={it.onClick}
                        className={`min-h-[68px] text-center px-2 py-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer ${
                          it.active
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-400/40'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="line-clamp-2 leading-tight">{it.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMobileMenu;
