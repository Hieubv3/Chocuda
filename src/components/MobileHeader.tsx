import React from 'react';
import { Menu, Bell, Search, PlusCircle, MapPin } from 'lucide-react';

interface MobileHeaderProps {
  onToggleMenu: () => void;
  selectedArea: string;
  onSelectAreaClick: () => void;
  onSearchClick: () => void;
  onPostClick: () => void;
  unreadCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onToggleMenu,
  selectedArea,
  onSelectAreaClick,
  onSearchClick,
  onPostClick,
  unreadCount = 6,
}) => {
  return (
    <header
      id="mobile-header"
      className="sticky top-0 z-30 w-full bg-[#131b31]/95 backdrop-blur-md border-b border-white/10 px-3 py-2.5 flex items-center justify-between shadow-md lg:hidden"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-white text-xs shadow-sm">
              24
            </div>
            <span className="font-bold text-sm tracking-tight text-white">Chợ Cư Dân</span>
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Vinhomes
            </span>
          </div>
          <button
            onClick={onSelectAreaClick}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 truncate max-w-[150px] text-left"
          >
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{selectedArea}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onSearchClick}
          aria-label="Tìm kiếm tin"
          className="p-2 rounded-lg bg-[#1a2342] text-slate-300 hover:text-white border border-white/5 active:scale-95"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleMenu}
          aria-label="Thông báo"
          className="relative p-2 rounded-lg bg-[#1a2342] text-slate-300 hover:text-white border border-white/5 active:scale-95"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={onPostClick}
          className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold px-2.5 py-2 rounded-lg shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Đăng tin</span>
        </button>
      </div>
    </header>
  );
};
