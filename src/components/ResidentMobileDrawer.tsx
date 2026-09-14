import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  KeyRound,
  Wrench,
  ShoppingBag,
  Utensils,
  Briefcase,
  Bell,
  Calculator,
  PhoneCall,
  PlusCircle,
  Search,
  MapPin,
  ChevronDown,
  ChevronRight,
  Home,
  Layers,
  Users,
  ShieldCheck,
  Heart,
  Scale,
  Smartphone,
  BookOpen,
  Compass,
  Moon,
  Sun,
  Globe,
  HelpCircle,
  X,
  User,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { User as UserType, Language } from '../types';

interface ResidentMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  savedCount?: number;
  compareCount?: number;
  onOpenSaved: () => void;
  onOpenCompare: () => void;
  onOpenAndroidModal?: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const ResidentMobileDrawer: React.FC<ResidentMobileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onLogout,
  savedCount = 0,
  compareCount = 0,
  onOpenSaved,
  onOpenCompare,
  onOpenAndroidModal,
  darkMode,
  setDarkMode,
  language,
  setLanguage
}) => {
  const navigate = useNavigate();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [selectedProjectName, setSelectedProjectName] = useState('Vinhomes Ocean Park 2 (The Empire)');
  const [menuSearchText, setMenuSearchText] = useState('');

  const projectList = [
    { name: 'Vinhomes Ocean Park 1 (Gia Lâm)', slug: 'ocean-park-1' },
    { name: 'Vinhomes Ocean Park 2 (The Empire)', slug: 'ocean-park-2' },
    { name: 'Vinhomes Ocean Park 3 (The Crown)', slug: 'ocean-park-3' },
    { name: 'Vinhomes Smart City (Tây Mỗ)', slug: 'smart-city' },
    { name: 'Vinhomes Grand Park (TP. Thủ Đức)', slug: 'grand-park' }
  ];

  // Khóa cuộn trang khi menu đang mở
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Phím ESC để đóng menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleMenuSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!menuSearchText.trim()) return;
    onClose();
    navigate(`/bat-dong-san?q=${encodeURIComponent(menuSearchText.trim())}`);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex animate-in fade-in duration-200" id="resident-mobile-drawer">
      {/* Lớp nền mờ (Backdrop) */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer transition-opacity"
        onClick={onClose}
        title="Nhấn để đóng menu"
      />

      {/* Thân Drawer kéo từ bên trái sang */}
      <div className="relative w-[325px] sm:w-[370px] max-w-[90vw] h-full max-h-[100dvh] bg-[#0c1322] text-white flex flex-col shadow-2xl z-10 overflow-y-auto overscroll-contain animate-in slide-in-from-left duration-200 border-r border-slate-800/90 select-none">
        
        {/* Header Drawer: Thông tin tài khoản cư dân */}
        <div className="p-4 border-b border-slate-800/80 flex items-start justify-between gap-3 bg-[#10192d] sticky top-0 z-20">
          {currentUser ? (
            <div
              onClick={() => {
                onClose();
                navigate('/tai-khoan');
              }}
              className="flex items-center gap-3 min-w-0 cursor-pointer group"
              title="Xem trang cá nhân & Ví Token"
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 shadow-md bg-slate-800 flex items-center justify-center">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-amber-400 font-extrabold text-lg">{currentUser.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#10192d] rounded-full shadow-sm" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm sm:text-base text-white truncate group-hover:text-amber-400 transition">
                    {currentUser.name || 'Cư Dân'}
                  </h3>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20 shrink-0" />
                </div>
                <p className="text-xs text-slate-300 font-medium truncate flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{currentUser.apartment ? `Căn hộ ${currentUser.apartment}` : (currentUser.email || currentUser.phone || 'Thành viên cư dân')}</span>
                </p>
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    🪙 {(currentUser.balance || 0).toLocaleString('vi-VN')} Token
                  </span>
                  {currentUser.role === 'admin' && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="flex items-center gap-3 min-w-0 cursor-pointer group"
              title="Đăng nhập tài khoản cư dân"
            >
              <div className="w-11 h-11 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-500/30 transition">
                <User className="w-6 h-6 text-amber-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition">
                  Chào Mừng Quý Cư Dân!
                </h3>
                <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  Đăng nhập / Đăng ký tài khoản
                </p>
                <span className="inline-block text-[10.5px] text-amber-400 font-bold mt-0.5">
                  Đăng tin & nhận Token ➜
                </span>
              </div>
            </div>
          )}

          {/* Nút đóng X */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 border border-slate-700"
            title="Đóng menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung bên trong Drawer */}
        <div className="p-4 space-y-4 flex-1">
          
          {/* Bộ chọn 5 Đại Đô Thị Vinhomes */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Đại Đô Thị Vinhomes
            </label>
            <button
              type="button"
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="w-full bg-[#141d33] hover:bg-[#1b2642] border border-slate-700/80 rounded-xl px-3 py-2.5 flex items-center justify-between text-xs text-slate-100 transition cursor-pointer shadow-inner"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold truncate text-[12px]">{selectedProjectName}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {projectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#141d33] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30">
                {projectList.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => {
                      setSelectedProjectName(p.name);
                      setProjectDropdownOpen(false);
                      onClose();
                      navigate(`/du-an/${p.slug}`);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-[11.5px] font-semibold transition hover:bg-slate-700/60 flex items-center justify-between border-b border-slate-800 last:border-0 ${
                      selectedProjectName === p.name ? 'text-amber-400 bg-slate-800' : 'text-slate-200'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {selectedProjectName === p.name && <span className="text-amber-400 text-xs font-black">✓</span>}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    onClose();
                    navigate('/du-an');
                  }}
                  className="w-full text-left px-3 py-2.5 text-[11px] font-bold text-amber-400 bg-slate-900 hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <span>🗺️ Xem tất cả 5 Đại đô thị & Mặt bằng CĐT</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            )}
          </div>

          {/* Ô tìm kiếm nhanh */}
          <form onSubmit={handleMenuSearch} className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm căn hộ, shophouse, dịch vụ..."
              value={menuSearchText}
              onChange={(e) => setMenuSearchText(e.target.value)}
              className="w-full bg-[#141d33] border border-slate-700/80 rounded-xl pl-9 pr-16 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition"
            />
            {menuSearchText.trim() && (
              <button
                type="button"
                onClick={() => setMenuSearchText('')}
                className="absolute right-10 text-slate-400 hover:text-white p-1 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[11px] font-black transition cursor-pointer"
            >
              Tìm
            </button>
          </form>

          {/* Hai nút CTA nhanh */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (!currentUser) {
                  onOpenAuth();
                } else {
                  navigate('/dang-tin');
                }
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng tin mới</span>
            </button>

            <a
              href="tel:1900232389"
              className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>BQL: 1900 232389</span>
            </a>
          </div>

          {/* Lưới 9 Tiện ích Cư Dân */}
          <div className="pt-1">
            <div className="mb-2.5 px-0.5 flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                TIỆN ÍCH CƯ DÂN CHÍNH
              </h4>
              <span className="text-[10px] text-amber-400 font-bold">9 Dịch vụ</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {/* 1. Mua Bán BĐS */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/mua-ban');
                }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative w-13 h-13 rounded-2xl bg-[#281b16] border border-[#5c2e1f] group-hover:border-amber-400 transition-all flex items-center justify-center shadow-md group-hover:scale-105">
                  <span className="absolute -top-1 -right-1 bg-[#ea580c] text-white text-[8.5px] font-bold px-1 py-0.2 rounded-full shadow leading-none">
                    Mới
                  </span>
                  <Building2 className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-200 mt-1.5 leading-tight group-hover:text-amber-400">
                  Mua Bán BĐS
                </span>
              </button>

              {/* 2. Cho Thuê */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/cho-thue');
                }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative w-13 h-13 rounded-2xl bg-[#102235] border border-[#173e5f] group-hover:border-sky-400 transition-all flex items-center justify-center shadow-md group-hover:scale-105">
                  <span className="absolute -top-1 -right-1 bg-[#0284c7] text-white text-[8.5px] font-bold px-1 py-0.2 rounded-full shadow leading-none">
                    Hot
                  </span>
                  <KeyRound className="w-5 h-5 text-[#06b6d4]" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-200 mt-1.5 leading-tight group-hover:text-sky-400">
                  Cho Thuê
                </span>
              </button>

              {/* 3. Dịch Vụ Cư Dân */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/dich-vu-cu-dan');
                }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative w-13 h-13 rounded-2xl bg-[#0f2a28] border border-[#134e48] group-hover:border-teal-400 transition-all flex items-center justify-center shadow-md group-hover:scale-105">
                  <Wrench className="w-5 h-5 text-[#14b8a6]" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-200 mt-1.5 leading-tight group-hover:text-teal-400">
                  Dịch Vụ Cư Dân
                </span>
              </button>

              {/* 4. Chợ Cư Dân */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/cho-cu-dan');
                }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative w-13 h-13 rounded-2xl bg-[#2c142b] border border-[#541e50] group-hover:border-pink-400 transition-all flex items-center justify-center shadow-md group-hover:scale-105">
                  <ShoppingBag className="w-5 h-5 text-[#ec4899]" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-200 mt-1.5 leading-tight group-hover:text-pink-400">
                  Chợ Cư Dân
                </span>
              </button>

              {/* 5. Ẩm Thực Tận Căn */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/gian-hang');
                }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative w-13 h-13 rounded-2xl bg-[#292113] border border-[#4f3e1b] group-hover:border-yellow-400 transition-all flex items-center justify-center shadow-md group-hover:scale-105">
                  <Utensils className="w-5 h-5 text-[#eab308]" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-200 mt-1.5 leading-tight group-hover:text-yellow-400">
                  Ẩm Thực Tận Căn
                </span>
              </button>

              {/* 6. Tuyển Dụng */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/tuyen-dung');
                }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative w-13 h-13 rounded-2xl bg-[#1a1d3b] border border-[#2c316a] group-hover:border-indigo-400 transition-all flex items-center justify-center shadow-md group-hover:scale-105">
                  <Briefcase className="w-5 h-5 text-[#818cf8]" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-200 mt-1.5 leading-tight group-hover:text-indigo-400">
                  Tuyển Dụng
                </span>
              </button>

              {/* 7. Tin Tức BQL */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/tin-tuc');
                }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative w-13 h-13 rounded-2xl bg-[#281639] border border-[#4d206e] group-hover:border-purple-400 transition-all flex items-center justify-center shadow-md group-hover:scale-105">
                  <span className="absolute -top-1 -right-1 bg-[#a855f7] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow leading-none">
                    6
                  </span>
                  <Bell className="w-5 h-5 text-[#c084fc]" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-200 mt-1.5 leading-tight group-hover:text-purple-400">
                  Tin Tức BQL
                </span>
              </button>

              {/* 8. Tính Lãi Vay */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/tinh-lai-vay');
                }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative w-13 h-13 rounded-2xl bg-[#0f2b2b] border border-[#144f4e] group-hover:border-emerald-400 transition-all flex items-center justify-center shadow-md group-hover:scale-105">
                  <Calculator className="w-5 h-5 text-[#10b981]" />
                </div>
                <span className="text-[10.5px] font-bold text-slate-200 mt-1.5 leading-tight group-hover:text-emerald-400">
                  Tính Lãi Vay
                </span>
              </button>
            </div>
          </div>

          {/* Danh mục & Công cụ chi tiết */}
          <div className="pt-2 border-t border-slate-800/80">
            <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 px-0.5">
              DANH MỤC & CÔNG CỤ
            </h4>
            
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-amber-400 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Trang Chủ Hệ Thống</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/du-an');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-amber-400 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold">Mặt Bằng & Phân Khu Dự Án</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/cong-dong');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-amber-400 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Cộng Đồng Cư Dân Vinhomes</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/chuyen-gia');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-amber-400 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span className="font-semibold">Chuyên Gia Tư Vấn BĐS</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSaved();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-rose-400 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="font-semibold">Căn Hộ Đã Lưu</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                  {savedCount} căn
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCompare();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-emerald-400 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">So Sánh Bất Động Sản</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  {compareCount} căn
                </span>
              </button>

              {onOpenAndroidModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAndroidModal();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-amber-400 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Cài Đặt App Android (.APK)</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    Miễn phí
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/ve-chung-toi');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-amber-400 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold">Về Chúng Tôi & Cẩm Nang</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/sitemap');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-amber-400 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-violet-400" />
                  <span className="font-semibold">Sơ Đồ Website (Sitemap)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Nút Admin nếu là quản trị viên */}
              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/admin');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition mt-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="font-bold">👑 Bảng Quản Trị Hệ Thống (Admin)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}
            </div>
          </div>

          {/* Cài đặt Giao diện & Ngôn ngữ */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-0.5">
              CÀI ĐẶT GIAO DIỆN & HỆ THỐNG
            </h4>

            {/* Sáng / Tối */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141d33] border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Chế độ hiển thị</span>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  darkMode
                    ? 'bg-slate-800 text-amber-300 border border-slate-700'
                    : 'bg-amber-500 text-slate-950 shadow-xs'
                }`}
              >
                {darkMode ? '🌙 Tối (Dark)' : '☀️ Sáng (Light)'}
              </button>
            </div>

            {/* Chuyển ngôn ngữ */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141d33] border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Ngôn ngữ</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage('vi')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    language === 'vi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇻🇳 VN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    language === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇬🇧 EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('zh')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    language === 'zh' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇨🇳 中文
                </button>
              </div>
            </div>

            {/* Đăng xuất */}
            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition cursor-pointer mt-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất tài khoản</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Drawer */}
        <div className="p-4 bg-[#080d19] border-t border-slate-800/80 text-xs mt-auto">
          <div className="flex items-center justify-between text-[11.5px] text-slate-400 pb-2.5">
            <span className="font-normal text-slate-400">Phiên bản v2.5 (Cư dân)</span>
            <span className="text-[#10b981] font-bold flex items-center gap-1">
              <span>•</span>
              <span>Trực tuyến 24/7</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <a href="tel:0868499929" className="text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Hỗ trợ cư dân</span>
            </a>
            <span className="text-slate-500">© Chợ Cư Dân Vinhomes</span>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
