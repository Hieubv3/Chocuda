import React from 'react';
import { Home, Building2, Plus, ShoppingBag, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onPostClick: () => void;
  onOpenMenu: () => void;
  onSelectCategory?: (categoryTitle: string) => void;
  onGoHome?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab = 'home',
  onTabChange,
  onPostClick,
  onOpenMenu,
  onSelectCategory,
  onGoHome,
}) => {
  const handleHomeClick = () => {
    onTabChange?.('home');
    if (onGoHome) {
      onGoHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBDSClick = () => {
    onTabChange?.('bds');
    onSelectCategory?.('Mua Bán BĐS');
  };

  const handleMarketClick = () => {
    onTabChange?.('market');
    onSelectCategory?.('Dịch Vụ Cư Dân');
  };

  return (
    <nav
      id="mobile-bottom-navbar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-2 py-1.5 flex items-center justify-around select-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      {/* 1. Trang Chủ */}
      <button
        id="btn-nav-home"
        onClick={handleHomeClick}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
          activeTab === 'home' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <Home className="w-5 h-5 stroke-[2.2]" />
        </div>
        <span className={`text-[11px] mt-0.5 leading-tight ${
          activeTab === 'home' ? 'font-bold text-emerald-600' : 'font-medium text-slate-600'
        }`}>
          Trang Chủ
        </span>
      </button>

      {/* 2. Bất Động Sản */}
      <button
        id="btn-nav-bds"
        onClick={handleBDSClick}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
          activeTab === 'bds' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <Building2 className="w-5 h-5 stroke-[2]" />
        </div>
        <span className={`text-[11px] mt-0.5 leading-tight ${
          activeTab === 'bds' ? 'font-bold text-emerald-600' : 'font-medium text-slate-600'
        }`}>
          Bất Động Sản
        </span>
      </button>

      {/* 3. Đăng Tin (Nút tròn viền xanh ở giữa) */}
      <button
        id="btn-nav-post"
        onClick={onPostClick}
        className="flex-1 flex flex-col items-center justify-center py-0.5 transition-transform active:scale-90 group"
      >
        <div className="w-9 h-9 rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
          <Plus className="w-5 h-5 stroke-[2.8]" />
        </div>
        <span className="text-[11px] font-bold text-emerald-600 mt-0.5 leading-tight">
          Đăng Tin
        </span>
      </button>

      {/* 4. Chợ Cư Dân */}
      <button
        id="btn-nav-market"
        onClick={handleMarketClick}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
          activeTab === 'market' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 stroke-[2]" />
        </div>
        <span className={`text-[11px] mt-0.5 leading-tight ${
          activeTab === 'market' ? 'font-bold text-emerald-600' : 'font-medium text-slate-600'
        }`}>
          Chợ Cư Dân
        </span>
      </button>

      {/* 5. Menu (3 GẠCH Ở DƯỚI) */}
      <button
        id="btn-nav-menu-bottom"
        onClick={onOpenMenu}
        className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 hover:text-slate-900 transition-colors active:scale-95"
      >
        <div className="relative">
          <Menu className="w-5 h-5 stroke-[2.2] text-slate-700" />
          <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </div>
        <span className="text-[11px] font-medium text-slate-700 mt-0.5 leading-tight">
          Menu
        </span>
      </button>
    </nav>
  );
};
