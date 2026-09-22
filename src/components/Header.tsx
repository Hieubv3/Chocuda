import React, { useState, useEffect } from 'react';
import { Building2, Phone, Heart, Scale, User, ShieldCheck, Globe, Menu, X, PlusCircle, Sparkles, Sun, Moon, Zap, KeyRound, ChevronDown, Home, Store, Wrench, Smartphone, Briefcase, Coins, LogOut } from 'lucide-react';
import { Language, User as UserType, HeightCategory, PropertyCategory } from '../types';
import { getTranslation } from '../lib/i18n';
import { Logo } from './Logo';
import { ResidentMobileDrawer } from './ResidentMobileDrawer';
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

  // Mở / tắt / đóng menu mobile từ nút "Menu" ở thanh dưới
  React.useEffect(() => {
    const openMenu = () => setMobileMenuOpen(true);
    const toggleMenu = () => setMobileMenuOpen((v) => !v);
    const closeMenu = () => setMobileMenuOpen(false);
    window.addEventListener('open-mobile-menu', openMenu);
    window.addEventListener('toggle-mobile-menu', toggleMenu);
    window.addEventListener('close-mobile-menu', closeMenu);
    return () => {
      window.removeEventListener('open-mobile-menu', openMenu);
      window.removeEventListener('toggle-mobile-menu', toggleMenu);
      window.removeEventListener('close-mobile-menu', closeMenu);
    };
  }, []);
  const [saleHover, setSaleHover] = useState(false);
  const [rentHover, setRentHover] = useState(false);

  const [langOpen, setLangOpen] = useState(false);
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
    { id: 'recruitment', label: 'Việc Làm Nội Khu' },
    { id: 'market', label: 'Chợ Cư Dân' },
    { id: 'community', label: 'Cộng Đồng' },
    { id: 'mortgage', label: 'Tính Lãi Vay' },
  ];

  const navBtn = (active: boolean) =>
    `px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
      active
        ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300 font-bold'
        : 'text-ink-600 dark:text-ink-300 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-ink-100/70 dark:hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-ink-950/95 backdrop-blur-md border-b border-ink-200/80 dark:border-white/10 transition-colors">
      {/* Thanh tiện ích trên cùng */}
      <div className="bg-ink-950 text-ink-300 text-[11px] py-1 px-4 hidden sm:block border-b border-white/10">
        <div className="max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1680px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center text-ink-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-400" />
              chocudan24h.com
            </span>
            <span className="text-white/20">|</span>
            {(onlineCount > 0 || views > 0) && (
              <div className="flex items-center gap-2 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 text-[10px]">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                <span className="text-brand-300 font-bold">{onlineCount} đang online</span>
                <span className="text-white/20">|</span>
                <span className="text-ink-300 font-medium">{views.toLocaleString('vi-VN')} lượt xem</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAndroidModal}
              className="flex items-center text-[10px] bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/40 text-brand-200 font-bold px-2.5 py-0.5 rounded-full transition gap-1 cursor-pointer"
              title="Tải ứng dụng Android APK chính thức"
            >
              <Smartphone className="w-3 h-3" />
              <span>Tải app Android (.APK)</span>
            </button>

            <a href="tel:0868499929" title="Hotline hỗ trợ cư dân đăng tin và vận hành nền tảng" className="flex items-center text-brand-300 font-bold hover:text-brand-200 transition">
              <Phone className="w-3 h-3 mr-1" />
              Hotline: 0868.499.929
            </a>

            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAiWriter}
                className="flex items-center text-[10px] bg-brand-500 hover:bg-brand-400 text-ink-950 font-bold px-2 py-0.5 rounded transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI Studio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thanh điều hướng chính */}
      <div className="max-w-7xl xl:max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-2 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between min-h-[56px] py-1.5 gap-2">

          <Logo variant="header" onClick={() => setCurrentTab('home')} />

          {/* Menu trên máy tính */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            <button onClick={() => setCurrentTab('home')} className={navBtn(currentTab === 'home')}>
              {t.nav.home}
            </button>
            <button onClick={() => setCurrentTab('profile')} className={navBtn(currentTab === 'profile')}>
              {t.nav.profile}
            </button>
            <button onClick={() => setCurrentTab('projects')} className={navBtn(currentTab === 'projects')}>
              {t.nav.projects}
            </button>

            <button
              onClick={() => setCurrentTab('services')}
              className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-bold whitespace-nowrap flex items-center gap-1 transition-colors duration-150 ${
                currentTab === 'services'
                  ? 'bg-brand-600 text-white'
                  : 'text-brand-700 dark:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Dịch Vụ Cư Dân</span>
            </button>

            {/* MUA BÁN */}
            <div
              className="relative group"
              onMouseEnter={() => setSaleHover(true)}
              onMouseLeave={() => setSaleHover(false)}
            >
              <button
                onClick={() => handleNavFilter('sale', 'all')}
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap flex items-center gap-1 transition-colors duration-150 ${
                  currentTab === 'sale'
                    ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300 font-bold'
                    : 'text-ink-600 dark:text-ink-300 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-ink-100/70 dark:hover:bg-white/5'
                }`}
              >
                <span>{t.nav.forSale}</span>
                <ChevronDown className="w-3.5 h-3.5 text-ink-400 group-hover:text-brand-500 transition-transform" />
              </button>

              {saleHover && (
                <div className="absolute top-full left-0 pt-1.5 w-72 z-50">
                  <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl shadow-2xl p-3 space-y-2">
                    <div className="text-[10px] font-bold uppercase text-ink-400 px-2 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-500" />
                      <span>Danh mục mua bán</span>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavFilter('sale', 'cao-tang', 'all')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-500/10 text-ink-800 dark:text-ink-200 font-bold text-xs flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-brand-500" />
                          <span>Bán cao tầng (căn hộ)</span>
                        </div>
                        <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">→</span>
                      </button>
                      <div className="pl-8 text-[11px] text-ink-500 dark:text-ink-400 space-y-1">
                        <button onClick={() => handleNavFilter('sale', 'cao-tang', 'studio')} className="block hover:text-brand-600 text-left w-full py-0.5">Studio và 1PN (đầu tư tốt)</button>
                        <button onClick={() => handleNavFilter('sale', 'cao-tang', '2pn')} className="block hover:text-brand-600 text-left w-full py-0.5">Căn hộ 2PN (gia đình trẻ)</button>
                        <button onClick={() => handleNavFilter('sale', 'cao-tang', '3pn')} className="block hover:text-brand-600 text-left w-full py-0.5">Căn hộ 3PN+ (không gian rộng)</button>
                      </div>
                    </div>

                    <hr className="border-ink-100 dark:border-white/10" />

                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavFilter('sale', 'thap-tang', 'all')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-500/10 text-ink-800 dark:text-ink-200 font-bold text-xs flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-brand-500" />
                          <span>Bán thấp tầng (nhà đất, villa)</span>
                        </div>
                        <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">→</span>
                      </button>
                      <div className="pl-8 text-[11px] text-ink-500 dark:text-ink-400 space-y-1">
                        <button onClick={() => handleNavFilter('sale', 'thap-tang', 'shophouse')} className="block hover:text-brand-600 text-left w-full py-0.5">Shophouse thương mại</button>
                        <button onClick={() => handleNavFilter('sale', 'thap-tang', 'lien-ke')} className="block hover:text-brand-600 text-left w-full py-0.5">Nhà liền kề phố</button>
                        <button onClick={() => handleNavFilter('sale', 'thap-tang', 'biet-thu-song-lap')} className="block hover:text-brand-600 text-left w-full py-0.5">Biệt thự song lập và đơn lập</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CHO THUÊ */}
            <div
              className="relative group"
              onMouseEnter={() => setRentHover(true)}
              onMouseLeave={() => setRentHover(false)}
            >
              <button
                onClick={() => handleNavFilter('rent', 'all')}
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap flex items-center gap-1 transition-colors duration-150 ${
                  currentTab === 'rent'
                    ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300 font-bold'
                    : 'text-ink-600 dark:text-ink-300 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-ink-100/70 dark:hover:bg-white/5'
                }`}
              >
                <span>{t.nav.forRent}</span>
                <ChevronDown className="w-3.5 h-3.5 text-ink-400 group-hover:text-brand-500 transition-transform" />
              </button>

              {rentHover && (
                <div className="absolute top-full left-0 pt-1.5 w-72 z-50">
                  <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl shadow-2xl p-3 space-y-2">
                    <div className="text-[10px] font-bold uppercase text-ink-400 px-2 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-500" />
                      <span>Danh mục cho thuê</span>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavFilter('rent', 'cao-tang', 'all')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-500/10 text-ink-800 dark:text-ink-200 font-bold text-xs flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-brand-500" />
                          <span>Cho thuê cao tầng (căn hộ)</span>
                        </div>
                        <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">→</span>
                      </button>
                      <div className="pl-8 text-[11px] text-ink-500 dark:text-ink-400 space-y-1">
                        <button onClick={() => handleNavFilter('rent', 'cao-tang', 'studio')} className="block hover:text-brand-600 text-left w-full py-0.5">Cho thuê Studio và 1PN</button>
                        <button onClick={() => handleNavFilter('rent', 'cao-tang', '2pn')} className="block hover:text-brand-600 text-left w-full py-0.5">Cho thuê căn hộ 2PN full đồ</button>
                        <button onClick={() => handleNavFilter('rent', 'cao-tang', '3pn')} className="block hover:text-brand-600 text-left w-full py-0.5">Cho thuê căn hộ 3PN VIP</button>
                      </div>
                    </div>

                    <hr className="border-ink-100 dark:border-white/10" />

                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavFilter('rent', 'thap-tang', 'all')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-500/10 text-ink-800 dark:text-ink-200 font-bold text-xs flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-brand-500" />
                          <span>Thuê thấp tầng và thuê tầng</span>
                        </div>
                        <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">→</span>
                      </button>
                      <div className="pl-8 text-[11px] text-ink-500 dark:text-ink-400 space-y-1">
                        <button onClick={() => handleNavFilter('rent', 'thue-tang', 'thue-tang')} className="block hover:text-brand-600 text-left w-full py-0.5">Thuê tầng, mặt bằng kinh doanh</button>
                        <button onClick={() => handleNavFilter('rent', 'thap-tang', 'shophouse')} className="block hover:text-brand-600 text-left w-full py-0.5">Cho thuê shophouse khối đế</button>
                        <button onClick={() => handleNavFilter('rent', 'thap-tang', 'biet-thu-song-lap')} className="block hover:text-brand-600 text-left w-full py-0.5">Cho thuê biệt thự nguyên căn</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setCurrentTab('news')} className={navBtn(currentTab === 'news')}>
              {t.nav.news}
            </button>

            {currentUser && (
              <button
                onClick={() => setCurrentTab('user_dashboard')}
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  currentTab === 'user_dashboard'
                    ? 'bg-brand-600 text-white font-bold'
                    : 'text-ink-700 dark:text-ink-200 hover:text-brand-700 dark:hover:text-brand-300 bg-ink-100/80 dark:bg-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Quản Lý Tin</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth();
                }
                setCurrentTab('post');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs xl:text-sm font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ml-1 ${
                currentTab === 'post'
                  ? 'bg-brand-700 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>{t.nav.postProperty}</span>
            </button>
          </nav>

          {/* Công cụ bên phải */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Ngôn ngữ */}
            <div className="relative">
              <button onClick={() => setLangOpen((v) => !v)} aria-haspopup="true" aria-expanded={langOpen} className="p-1.5 sm:p-2 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-white/5 rounded-xl flex items-center text-xs font-bold transition">
                <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                <span className="uppercase text-[11px] hidden sm:inline ml-1">{language}</span>
              </button>
              {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}
              <div className={langOpen ? 'absolute right-0 top-full pt-1.5 w-32 block z-50' : 'absolute right-0 top-full pt-1.5 w-32 hidden z-50'}>
                <div className="bg-white dark:bg-ink-900 rounded-xl shadow-xl border border-ink-200 dark:border-white/10 py-1 text-xs font-medium">
                  <button
                    onClick={() => { setLanguage('vi'); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 ${language === 'vi' ? 'text-brand-700 font-bold bg-brand-500/10' : 'text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-white/5'}`}
                  >
                    Tiếng Việt
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 ${language === 'en' ? 'text-brand-700 font-bold bg-brand-500/10' : 'text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-white/5'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('zh'); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 ${language === 'zh' ? 'text-brand-700 font-bold bg-brand-500/10' : 'text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-white/5'}`}
                  >
                    中文
                  </button>
                </div>
              </div>
            </div>

            {/* Sáng / Tối */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 sm:p-2 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-white/5 rounded-xl transition"
              title="Chế độ sáng tối"
            >
              {darkMode ? <Sun className="w-4 h-4 text-brand-400" /> : <Moon className="w-4 h-4 text-ink-700" />}
            </button>

            {/* Đã lưu */}
            <button
              onClick={onOpenSaved}
              className="relative p-1.5 sm:p-2 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-white/5 rounded-xl transition"
              title="Căn hộ đã lưu"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* So sánh */}
            <button
              onClick={onOpenCompare}
              className="relative p-1.5 sm:p-2 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-white/5 rounded-xl transition hidden sm:block"
              title="So sánh căn"
            >
              <Scale className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Tài khoản */}
            {currentUser?.role === 'admin' ? (
              <div className="relative group shrink-0 flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentTab('user_dashboard')}
                  className="hidden md:flex items-center gap-1 px-2 py-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Số dư Token Cư Dân"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{(currentUser.balance || 0).toLocaleString('vi-VN')} Token</span>
                </button>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className="px-2 sm:px-3 py-1.5 bg-ink-950 text-brand-300 border border-brand-500/30 hover:bg-ink-900 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
                <div className="absolute right-0 top-full pt-1.5 w-52 hidden group-hover:block z-50 text-xs font-bold">
                  <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-xl border border-ink-200 dark:border-white/10 py-1">
                    <button
                      onClick={() => setCurrentTab('admin')}
                      className="w-full text-left px-3 py-2 text-ink-800 dark:text-ink-200 hover:bg-brand-500/10 transition flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                      Bảng quản trị
                    </button>
                    <button
                      onClick={() => setCurrentTab('user_dashboard')}
                      className="w-full text-left px-3 py-2 text-ink-800 dark:text-ink-200 hover:bg-brand-500/10 transition flex items-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5 text-brand-500" />
                      Quản lý tin và ví Token
                    </button>
                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        else onOpenAuth();
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border-t border-ink-100 dark:border-white/10 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Đăng xuất admin
                    </button>
                  </div>
                </div>
              </div>
            ) : currentUser ? (
              <div className="relative group shrink-0 flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentTab('user_dashboard')}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Số dư Token Cư Dân của bạn"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{(currentUser.balance || 0).toLocaleString('vi-VN')} Token</span>
                </button>
                <button
                  onClick={() => setCurrentTab('user_dashboard')}
                  className="px-2 sm:px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-800 dark:text-brand-200 rounded-xl text-xs font-bold flex items-center gap-1 transition border border-brand-500/30 shrink-0"
                  title={currentUser?.name || 'Tài khoản cá nhân'}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="hidden xs:inline sm:inline">{currentUser?.name || 'Cá nhân'}</span>
                </button>
                <div className="absolute right-0 top-full pt-1.5 w-64 hidden group-hover:block z-50 text-xs font-bold">
                  <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-200 dark:border-white/10 py-1 overflow-hidden">
                    <div className="px-3.5 py-2.5 border-b border-ink-100 dark:border-white/10 bg-ink-50/70 dark:bg-white/5">
                      <p className="text-ink-900 dark:text-white font-bold truncate">{currentUser?.name || 'Cư dân'}</p>
                      <p className="text-[10px] text-ink-400 font-normal truncate">{currentUser?.email || ''}</p>
                      <div className="mt-2 pt-2 border-t border-ink-200/60 dark:border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-ink-500 dark:text-ink-400">Ví Token:</span>
                          <span className="font-mono font-bold text-brand-600 dark:text-brand-400 tabular-nums">{(currentUser.balance || 0).toLocaleString('vi-VN')} Token</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-ink-500 dark:text-ink-400">Điểm rút tiền:</span>
                          <span className="font-mono font-bold text-brand-600 dark:text-brand-400 tabular-nums">{(currentUser.affiliatePoints || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentTab('user_dashboard')}
                      className="w-full text-left px-3.5 py-2.5 text-ink-800 dark:text-ink-200 hover:bg-brand-500/10 transition flex items-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5 text-brand-500" />
                      Quản lý tin và ví Token
                    </button>
                    <button
                      onClick={() => setCurrentTab('post')}
                      className="w-full text-left px-3.5 py-2.5 text-brand-700 dark:text-brand-300 hover:bg-brand-500/10 transition flex items-center gap-2"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Đăng tin BĐS mới
                    </button>
                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        else onOpenAuth();
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border-t border-ink-100 dark:border-white/10 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Đăng xuất, đổi tài khoản
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-2 sm:px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline sm:inline">Đăng nhập</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Bốn lối tắt, chỉ hiện trên máy tính */}
      <div className="hidden lg:block bg-ink-100/80 dark:bg-ink-950/80 border-t border-ink-200/80 dark:border-white/10 py-1.5 px-2 sm:px-3">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-1 sm:gap-2.5">
          <button
            onClick={() => handleNavFilter('sale', 'all')}
            className={`py-1.5 px-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 border ${
              currentTab === 'sale'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-200 border-ink-200 dark:border-white/10 hover:border-brand-400 hover:text-brand-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Mua bán</span>
          </button>

          <button
            onClick={() => handleNavFilter('rent', 'all')}
            className={`py-1.5 px-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 border ${
              currentTab === 'rent'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-200 border-ink-200 dark:border-white/10 hover:border-brand-400 hover:text-brand-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Cho thuê BĐS</span>
          </button>

          <button
            onClick={() => setCurrentTab('services')}
            className={`py-1.5 px-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 border ${
              currentTab === 'services'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-200 border-ink-200 dark:border-white/10 hover:border-brand-400 hover:text-brand-700'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Dịch vụ cư dân</span>
          </button>

          <button
            onClick={() => setCurrentTab('recruitment')}
            className={`py-1.5 px-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 border ${
              currentTab === 'recruitment'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-200 border-ink-200 dark:border-white/10 hover:border-brand-400 hover:text-brand-700'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tuyển dụng</span>
          </button>
        </div>
      </div>

      {/* Menu di động */}
      <ResidentMobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout || (() => {})}
        savedCount={savedCount}
        compareCount={compareCount}
        onOpenSaved={onOpenSaved}
        onOpenCompare={onOpenCompare}
        onOpenAndroidModal={onOpenAndroidModal}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
      />
    </header>
  );
};
