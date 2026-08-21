import React, { useState, useEffect } from 'react';
import { Building2, Phone, Heart, Scale, User, ShieldCheck, Globe, Menu, X, PlusCircle, Sparkles, Sun, Moon, Zap, KeyRound, Share2, ChevronDown, Home, Store, Wrench, Smartphone, Download, Briefcase } from 'lucide-react';
import { Language, User as UserType, HeightCategory, PropertyCategory } from '../types';
import { getTranslation } from '../lib/i18n';
import { Logo } from './Logo';
import { useVisitorStats } from '../lib/visitorStats';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  savedCount: number;
  compareCount: number;
  onOpenSaved: () => void;
  onOpenCompare: () => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  onOpenAiWriter: () => void;
  onOpenMarketingModal?: () => void;
  onOpenAndroidModal?: () => void;
  currentUser: UserType | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onNavigateWithFilter?: (type: 'sale' | 'rent', heightCategory?: HeightCategory, category?: PropertyCategory | 'all') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  savedCount,
  compareCount,
  onOpenSaved,
  onOpenCompare,
  onOpenAuth,
  onLogout,
  onOpenAiWriter,
  onOpenMarketingModal,
  onOpenAndroidModal,
  currentUser,
  darkMode,
  setDarkMode,
  onNavigateWithFilter
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saleHover, setSaleHover] = useState(false);
  const [rentHover, setRentHover] = useState(false);

  const t = getTranslation(language);
  const { views, onlineCount } = useVisitorStats();

  const handleNavFilter = (type: 'sale' | 'rent', heightCategory?: HeightCategory, category?: PropertyCategory | 'all') => {
    if (onNavigateWithFilter) {
      onNavigateWithFilter(type, heightCategory, category);
    } else {
      setCurrentTab(type);
    }
    setSaleHover(false);
    setRentHover(false);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'profile', label: t.nav.profile },
    { id: 'projects', label: t.nav.projects },
    { id: 'services', label: 'Dịch Vụ Cư Dân' },
    { id: 'sale', label: t.nav.forSale },
    { id: 'rent', label: t.nav.forRent },
    { id: 'news', label: t.nav.news },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      {/* Top Banner Bar - Clean Slim Slate */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 hidden sm:block border-b border-slate-800">
        <div className="max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1680px] mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center text-slate-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              chocudan24h.com
            </span>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-2 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700 text-[10px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold">{onlineCount} đang Online</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-medium">{views.toLocaleString('vi-VN')} lượt xem</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAndroidModal}
              className="flex items-center text-[10px] bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 font-black px-2.5 py-0.5 rounded-full transition shadow-xs animate-pulse hover:animate-none gap-1"
              title="Tải ứng dụng Android APK chính thức"
            >
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>Tải App Android (.APK)</span>
            </button>

            <a href="tel:0868499929" title="Hotline hỗ trợ cư dân đăng tin & vận hành nền tảng" className="flex items-center text-emerald-400 font-bold hover:text-emerald-300 transition">
              <Phone className="w-3 h-3 mr-1 text-emerald-400" />
              Hotline: 0868.499.929
            </a>

            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAiWriter}
                className="flex items-center text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-0.5 rounded transition shadow-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI Studio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar - Compact height (~56px) */}
      <div className="max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-2 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between min-h-[56px] py-1.5 gap-2">
          
          {/* Logo & Brand */}
          <Logo variant="header" onClick={() => setCurrentTab('home')} />

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                currentTab === 'home'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {t.nav.home}
            </button>

            <button
              onClick={() => setCurrentTab('profile')}
              className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                currentTab === 'profile'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {t.nav.profile}
            </button>

            <button
              onClick={() => setCurrentTab('projects')}
              className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                currentTab === 'projects'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {t.nav.projects}
            </button>

            <button
              onClick={() => setCurrentTab('services')}
              className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-extrabold whitespace-nowrap flex items-center gap-1 transition-all duration-150 ${
                currentTab === 'services'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Dịch Vụ Cư Dân</span>
            </button>

            {/* MUA BÁN DROPDOWN (FLOATING SUB-MENU) */}
            <div
              className="relative group"
              onMouseEnter={() => setSaleHover(true)}
              onMouseLeave={() => setSaleHover(false)}
            >
              <button
                onClick={() => handleNavFilter('sale', 'all')}
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap flex items-center gap-1 transition-all duration-150 ${
                  currentTab === 'sale'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <span>{t.nav.forSale}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-transform" />
              </button>

              {/* Floating Sub-Menu Popover */}
              {saleHover && (
                <div className="absolute top-full left-0 pt-1.5 w-72 z-50">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>DANH MỤC PHẦN KHÁCH XEM (MUA BÁN)</span>
                    </div>

                    {/* Cao tầng Option */}
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavFilter('sale', 'cao-tang', 'all')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between group/sub cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-500" />
                          <span>BÁN CAO TẦNG (Căn Hộ)</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold group-hover/sub:translate-x-0.5 transition-transform">→</span>
                      </button>
                      <div className="pl-8 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <button onClick={() => handleNavFilter('sale', 'cao-tang', 'studio')} className="block hover:text-emerald-600 text-left w-full py-0.5">Studio & 1PN (Đầu tư tốt)</button>
                        <button onClick={() => handleNavFilter('sale', 'cao-tang', '2pn')} className="block hover:text-emerald-600 text-left w-full py-0.5">Căn hộ 2PN (Gia đình trẻ)</button>
                        <button onClick={() => handleNavFilter('sale', 'cao-tang', '3pn')} className="block hover:text-emerald-600 text-left w-full py-0.5">Căn hộ 3PN+ (Không gian rộng)</button>
                      </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    {/* Thấp tầng Option */}
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavFilter('sale', 'thap-tang', 'all')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between group/sub cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-amber-500" />
                          <span>BÁN THẤP TẦNG (Nhà Đất / Villa)</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold group-hover/sub:translate-x-0.5 transition-transform">→</span>
                      </button>
                      <div className="pl-8 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <button onClick={() => handleNavFilter('sale', 'thap-tang', 'shophouse')} className="block hover:text-emerald-600 text-left w-full py-0.5">Shophouse Thương Mại</button>
                        <button onClick={() => handleNavFilter('sale', 'thap-tang', 'lien-ke')} className="block hover:text-emerald-600 text-left w-full py-0.5">Nhà Liền Kề Phố</button>
                        <button onClick={() => handleNavFilter('sale', 'thap-tang', 'biet-thu-song-lap')} className="block hover:text-emerald-600 text-left w-full py-0.5">Biệt Thự Song Lập & Đơn Lập</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CHO THUÊ DROPDOWN (FLOATING SUB-MENU) */}
            <div
              className="relative group"
              onMouseEnter={() => setRentHover(true)}
              onMouseLeave={() => setRentHover(false)}
            >
              <button
                onClick={() => handleNavFilter('rent', 'all')}
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap flex items-center gap-1 transition-all duration-150 ${
                  currentTab === 'rent'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <span>{t.nav.forRent}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-transform" />
              </button>

              {/* Floating Sub-Menu Popover */}
              {rentHover && (
                <div className="absolute top-full left-0 pt-1.5 w-72 z-50">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>DANH MỤC PHẦN KHÁCH XEM (CHO THUÊ)</span>
                    </div>

                    {/* Cho Thuê Cao tầng Option */}
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavFilter('rent', 'cao-tang', 'all')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between group/sub cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-teal-500" />
                          <span>CHO THUÊ CAO TẦNG (Căn Hộ)</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold group-hover/sub:translate-x-0.5 transition-transform">→</span>
                      </button>
                      <div className="pl-8 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <button onClick={() => handleNavFilter('rent', 'cao-tang', 'studio')} className="block hover:text-emerald-600 text-left w-full py-0.5">Cho thuê Studio & 1PN</button>
                        <button onClick={() => handleNavFilter('rent', 'cao-tang', '2pn')} className="block hover:text-emerald-600 text-left w-full py-0.5">Cho thuê Căn Hộ 2PN Full Đồ</button>
                        <button onClick={() => handleNavFilter('rent', 'cao-tang', '3pn')} className="block hover:text-emerald-600 text-left w-full py-0.5">Cho thuê Căn Hộ 3PN VIP</button>
                      </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    {/* Cho Thuê Thấp tầng & Thuê tầng Option */}
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavFilter('rent', 'thap-tang', 'all')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-between group/sub cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-purple-500" />
                          <span>THUÊ THẤP TẦNG & THUÊ TẦNG</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold group-hover/sub:translate-x-0.5 transition-transform">→</span>
                      </button>
                      <div className="pl-8 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <button onClick={() => handleNavFilter('rent', 'thue-tang', 'thue-tang')} className="block hover:text-emerald-600 text-left w-full py-0.5">Thuê Tầng / Mặt Bằng Kinh Doanh</button>
                        <button onClick={() => handleNavFilter('rent', 'thap-tang', 'shophouse')} className="block hover:text-emerald-600 text-left w-full py-0.5">Cho Thuê Shophouse Khối Đế</button>
                        <button onClick={() => handleNavFilter('rent', 'thap-tang', 'biet-thu-song-lap')} className="block hover:text-emerald-600 text-left w-full py-0.5">Cho Thuê Biệt Thự Nguyên Căn</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setCurrentTab('news')}
              className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                currentTab === 'news'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {t.nav.news}
            </button>

            {currentUser && (
              <button
                onClick={() => setCurrentTab('user_dashboard')}
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  currentTab === 'user_dashboard'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Quản Lý Tin</span>
              </button>
            )}
            
            {/* Post Listing CTA */}
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth();
                }
                setCurrentTab('post');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs xl:text-sm font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ml-1 ${
                currentTab === 'post'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs'
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>{t.nav.postProperty}</span>
            </button>
          </nav>

          {/* Header Action Tools */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            
            {/* Language Dropdown */}
            <div className="relative group">
              <button className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center text-xs font-bold transition">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="uppercase text-[11px] hidden sm:inline ml-1">{language}</span>
              </button>
              <div className="absolute right-0 top-full pt-1.5 w-28 hidden group-hover:block z-50">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-xs font-medium">
                  <button
                    onClick={() => setLanguage('vi')}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                      language === 'vi' ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-slate-700' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span>🇻🇳 Tiếng Việt</span>
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                      language === 'en' ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-slate-700' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                  </button>
                  <button
                    onClick={() => setLanguage('zh')}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                      language === 'zh' ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-slate-700' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span>🇨🇳 中文</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Chế độ Sáng/Tối"
            >
              {darkMode ? <Sun className="w-4 h-4 text-emerald-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Favorites Badge */}
            <button
              onClick={onOpenSaved}
              className="relative p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Căn hộ đã lưu"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-extrabold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Compare Badge */}
            <button
              onClick={onOpenCompare}
              className="relative p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition hidden sm:block"
              title="So sánh căn"
            >
              <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>

            {/* User Account Button / Admin Panel */}
            {currentUser?.role === 'admin' ? (
              <div className="relative group shrink-0 flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentTab('user_dashboard')}
                  className="hidden md:flex items-center gap-1 px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-300 rounded-xl text-xs font-black transition cursor-pointer"
                  title="Số dư Token Cư Dân"
                >
                  <span>🪙</span>
                  <span>{(currentUser.balance || 0).toLocaleString('vi-VN')} Token</span>
                </button>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className="px-2 sm:px-3 py-1.5 bg-slate-900 text-emerald-400 border border-emerald-500/40 hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1 shadow"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
                <div className="absolute right-0 top-full pt-1.5 w-48 hidden group-hover:block z-50 text-xs font-bold">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1">
                    <button
                      onClick={() => setCurrentTab('admin')}
                      className="w-full text-left px-3 py-2 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 transition"
                    >
                      👑 Bảng Quản Trị Admin
                    </button>
                    <button
                      onClick={() => setCurrentTab('user_dashboard')}
                      className="w-full text-left px-3 py-2 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 transition"
                    >
                      ⚡ Quản Lý Tin & Ví Token
                    </button>
                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        else onOpenAuth();
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition border-t border-slate-100 dark:border-slate-700"
                    >
                      🚪 Đăng Xuất Admin
                    </button>
                  </div>
                </div>
              </div>
            ) : currentUser ? (
              <div className="relative group shrink-0 flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentTab('user_dashboard')}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-300 rounded-xl text-xs font-black transition cursor-pointer"
                  title="Số dư Token Cư Dân của bạn"
                >
                  <span>🪙</span>
                  <span>{(currentUser.balance || 0).toLocaleString('vi-VN')} Token</span>
                </button>
                <button
                  onClick={() => setCurrentTab('user_dashboard')}
                  className="px-2 sm:px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition border border-emerald-200 dark:border-emerald-800 shrink-0"
                  title={currentUser?.name || 'Tài khoản cá nhân'}
                >
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="hidden xs:inline sm:inline">{currentUser?.name || 'Cá Nhân'}</span>
                </button>
                <div className="absolute right-0 top-full pt-1.5 w-60 hidden group-hover:block z-50 text-xs font-bold">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 overflow-hidden">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70">
                      <p className="text-slate-900 dark:text-white font-extrabold truncate">{currentUser?.name || 'Cư Dân'}</p>
                      <p className="text-[10px] text-slate-400 font-normal truncate">{currentUser?.email || ''}</p>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Ví Token:</span>
                          <span className="font-mono font-black text-amber-500">{(currentUser.balance || 0).toLocaleString('vi-VN')} Token</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Điểm Rút Tiền:</span>
                          <span className="font-mono font-black text-emerald-500">{(currentUser.affiliatePoints || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentTab('user_dashboard')}
                      className="w-full text-left px-3.5 py-2.5 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 transition flex items-center gap-2"
                    >
                      ⚡ Quản Lý Tin & Ví Token
                    </button>
                    <button
                      onClick={() => setCurrentTab('post')}
                      className="w-full text-left px-3.5 py-2.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition flex items-center gap-2"
                    >
                      + Đăng Tin BĐS Mới
                    </button>
                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        else onOpenAuth();
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition border-t border-slate-100 dark:border-slate-700 flex items-center gap-2"
                    >
                      🚪 Đăng Xuất / Đổi Tài Khoản
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-2 sm:px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition shrink-0 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span className="hidden xs:inline sm:inline">Đăng Nhập</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 4 Sub-Tabs Bar - 4 ô chữ nhật gọn gàng: Mua bán, Cho thuê BĐS, Dịch vụ cư dân, Tuyển Dụng */}
      <div className="bg-slate-100/90 dark:bg-slate-950/90 border-t border-slate-200/80 dark:border-slate-800/80 py-1.5 px-2 sm:px-3">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-1 sm:gap-2.5">
          <button
            onClick={() => handleNavFilter('sale', 'all')}
            className={`py-1.5 px-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 border shadow-2xs ${
              currentTab === 'sale'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">Mua Bán</span>
          </button>

          <button
            onClick={() => handleNavFilter('rent', 'all')}
            className={`py-1.5 px-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 border shadow-2xs ${
              currentTab === 'rent'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="truncate">Cho Thuê BĐS</span>
          </button>

          <button
            onClick={() => setCurrentTab('services')}
            className={`py-1.5 px-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 border shadow-2xs ${
              currentTab === 'services'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Dịch Vụ Cư Dân</span>
          </button>

          <button
            onClick={() => setCurrentTab('recruitment')}
            className={`py-1.5 px-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 border shadow-2xs ${
              currentTab === 'recruitment'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="truncate">Tuyển Dụng</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          
          {/* Mobile Login / User Profile CTA */}
          {currentUser ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">{currentUser?.name || currentUser?.email || 'Cư Dân'}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {currentUser?.role === 'admin' ? '👑 Admin' : currentUser?.role === 'sale' ? '💼 Môi Giới' : '🏠 Chủ Nhà'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentTab(currentUser?.role === 'admin' ? 'admin' : 'user_dashboard');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Quản Lý
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full p-3 bg-amber-500 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
            >
              <User className="w-4 h-4" />
              <span>ĐĂNG NHẬP / ĐĂNG KÝ TÀI KHOẢN</span>
            </button>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold ${
                currentTab === item.id
                  ? 'bg-emerald-600 text-white font-extrabold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
          {currentUser && (
            <button
              onClick={() => {
                setCurrentTab('user_dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center"
            >
              <Zap className="w-4 h-4 mr-2" /> Quản Lý & Đẩy Tin Đăng
            </button>
          )}
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth();
              }
              setCurrentTab('post');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {t.nav.postProperty}
          </button>
        </div>
      )}
    </header>
  );
};

