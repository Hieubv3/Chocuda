import React, { useState } from 'react';
import { Search, ChevronRight, ChevronDown, Sparkles, Building2, ShieldCheck, MapPin, Phone, ArrowRight, CheckCircle2, UserCheck, Star, Clock, KeyRound, Wrench, Briefcase } from 'lucide-react';
import logoImg from '../assets/images/chocudan24h_custom_logo_1785384117746.jpg';
import { Property, Project, NewsArticle, Language, PropertyType, ProjectCategory } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { RealestateVideoChannelSection } from '../components/RealestateVideoChannelSection';
import { MortgageCalculator } from '../components/MortgageCalculator';
import { AdBannerWidget } from '../components/AdBannerWidget';
import { ProjectFaqHub } from '../components/ProjectFaqHub';
import { VinhomesProjectSelectModal } from '../components/VinhomesProjectSelectModal';
import { PopularVinhomesLinksSection } from '../components/PopularVinhomesLinksSection';
import { VIN_MAJOR_PROJECTS } from '../data/residentServicesData';
import { HIEU_BUI_PROFILE, INITIAL_ADS } from '../data/initialData';
import { getTranslation } from '../lib/i18n';

interface HomePageProps {
  language: Language;
  projects: Project[];
  properties: Property[];
  news: NewsArticle[];
  setCurrentTab: (tab: string) => void;
  onSelectProperty: (property: Property) => void;
  savedIds: string[];
  onToggleSave: (property: Property) => void;
  compareIds: string[];
  onToggleCompare: (property: Property) => void;
  onSelectProject: (project: ProjectCategory) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  language,
  projects,
  properties,
  news,
  setCurrentTab,
  onSelectProperty,
  savedIds,
  onToggleSave,
  compareIds,
  onToggleCompare,
  onSelectProject
}) => {
  const t = getTranslation(language);

  // Read persisted ads from localStorage if present
  const liveAds = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('chocudan24h_ads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load ads in HomePage:', e);
    }
    return INITIAL_ADS;
  }, []);

  // Search state
  const [searchType, setSearchType] = React.useState<PropertyType>('sale');
  const [searchProject, setSearchProject] = React.useState<string>('all');
  const [searchCategory, setSearchCategory] = React.useState<string>('all');
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState<boolean>(false);

  const handleHeroSearch = () => {
    if (searchProject !== 'all') {
      onSelectProject(searchProject as ProjectCategory);
    }
    setCurrentTab(searchType);
  };

  const featuredProperties = properties.slice(0, 6);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Banner Section */}
      <section className="relative bg-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] shadow-2xl">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=80"
            alt="Vinhomes Ocean Park"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        </div>

        <div className="relative max-w-7xl mx-auto space-y-4 sm:space-y-8 text-center sm:text-left">
          
          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-extrabold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHỢ CƯ DÂN 24H — CHOCUDAN24H.COM</span>
          </div>

          {/* Hero Titles */}
          <div className="space-y-2 sm:space-y-3 max-w-4xl">
            <h1 className="tracking-tight text-white leading-tight">
              <span className="block text-slate-200 font-bold text-[11px] sm:text-sm md:text-base tracking-wide uppercase mb-0.5 opacity-90">
                NỀN TẢNG TRAO ĐỔI THÔNG TIN CHUYỂN NHƯỢNG, CHO THUÊ & DỊCH VỤ NỘI KHU
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 font-black text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-tight drop-shadow-md">
                KẾT NỐI CƯ DÂN VINHOMES
              </span>
            </h1>
            <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl max-w-3xl space-y-1 text-left">
              <p className="text-[11px] sm:text-sm text-slate-200 font-medium leading-snug sm:leading-relaxed">
                Nền tảng trực tiếp dành cho cư dân Vinhomes trao đổi thông tin mua bán, cho thuê BĐS và đăng tin dịch vụ tiện ích nội khu — Tối ưu kết nối minh bạch, hỗ trợ cư dân 24/7.
              </p>
              <p className="text-[10px] sm:text-[11px] text-amber-300 font-semibold flex items-center gap-1.5 pt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span>Hotline/Zalo 0868.499.929: Chuyên trách hỗ trợ cư dân đăng tin & hỗ trợ vận hành.</span>
              </p>
            </div>
          </div>

          {/* Search Box Widget */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-4xl">
            
            {/* Desktop 4 Services Cards (Horizontal Grid) */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-200 dark:border-slate-800 pb-5 mb-5">
              {/* Card 1: Mua Bán BĐS */}
              <button
                onClick={() => {
                  setSearchType('sale');
                  setCurrentTab('sale');
                }}
                className={`group text-left rounded-2xl border transition overflow-hidden flex flex-col justify-between cursor-pointer ${
                  searchType === 'sale'
                    ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 shadow-md ring-2 ring-amber-500/50'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                {/* Image Simulation Preview */}
                <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
                    alt="Mua Bán BĐS"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                  
                  {/* Badge & Icon on Image */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className="p-1 bg-amber-500 text-slate-950 rounded-md shadow-xs">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="px-1.5 py-0.2 bg-amber-500/90 text-slate-950 text-[9px] font-black rounded uppercase tracking-wider">
                      Chính Chủ
                    </span>
                  </div>

                  <div className="absolute bottom-1.5 left-2 right-2">
                    <span className="text-white font-black text-xs sm:text-sm drop-shadow-sm uppercase tracking-tight block truncate">
                      1. Mua Bán BĐS
                    </span>
                  </div>
                </div>

                {/* Brief Info */}
                <div className="p-2.5 space-y-0.5">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug font-medium line-clamp-2">
                    Căn hộ, Shophouse & Biệt thự Vinhomes bán chính chủ.
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold pt-0.5">
                    <span>Xem bảng giá →</span>
                  </div>
                </div>
              </button>

              {/* Card 2: Cho Thuê BĐS */}
              <button
                onClick={() => {
                  setSearchType('rent');
                  setCurrentTab('rent');
                }}
                className={`group text-left rounded-2xl border transition overflow-hidden flex flex-col justify-between cursor-pointer ${
                  searchType === 'rent'
                    ? 'bg-sky-500/10 dark:bg-sky-500/20 border-sky-500 shadow-md ring-2 ring-sky-500/50'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-sky-400 hover:shadow-md'
                }`}
              >
                {/* Image Simulation Preview */}
                <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"
                    alt="Cho Thuê BĐS"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                  
                  {/* Badge & Icon on Image */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className="p-1 bg-sky-500 text-white rounded-md shadow-xs">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <span className="px-1.5 py-0.2 bg-sky-500/90 text-white text-[9px] font-black rounded uppercase tracking-wider">
                      Ở Ngay
                    </span>
                  </div>

                  <div className="absolute bottom-1.5 left-2 right-2">
                    <span className="text-white font-black text-xs sm:text-sm drop-shadow-sm uppercase tracking-tight block truncate">
                      2. Cho Thuê BĐS
                    </span>
                  </div>
                </div>

                {/* Brief Info */}
                <div className="p-2.5 space-y-0.5">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug font-medium line-clamp-2">
                    Căn hộ full đồ, Thuê theo tầng, VP & Mặt bằng KD.
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 font-bold pt-0.5">
                    <span>Xem danh sách →</span>
                  </div>
                </div>
              </button>

              {/* Card 3: Dịch Vụ Cư Dân */}
              <button
                onClick={() => setCurrentTab('services')}
                className="group text-left rounded-2xl border transition overflow-hidden flex flex-col justify-between bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 hover:shadow-md cursor-pointer"
              >
                {/* Image Simulation Preview */}
                <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"
                    alt="Dịch Vụ Cư Dân"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                  
                  {/* Badge & Icon on Image */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className="p-1 bg-emerald-600 text-white rounded-md shadow-xs">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <span className="px-1.5 py-0.2 bg-emerald-600/90 text-white text-[9px] font-black rounded uppercase tracking-wider">
                      Tiện Ích
                    </span>
                  </div>

                  <div className="absolute bottom-1.5 left-2 right-2">
                    <span className="text-white font-black text-xs sm:text-sm drop-shadow-sm uppercase tracking-tight block truncate">
                      3. Dịch Vụ Cư Dân
                    </span>
                  </div>
                </div>

                {/* Brief Info */}
                <div className="p-2.5 space-y-0.5">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug font-medium line-clamp-2">
                    Sửa chữa, Giặt là, Taxi, Spa, Đặt cơm & Gian hàng.
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold pt-0.5">
                    <span>Khám phá chợ →</span>
                  </div>
                </div>
              </button>

              {/* Card 4: Việc Làm & Tuyển Dụng */}
              <button
                onClick={() => setCurrentTab('recruitment')}
                className="group text-left rounded-2xl border transition overflow-hidden flex flex-col justify-between bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-teal-400 hover:shadow-md cursor-pointer"
              >
                {/* Image Simulation Preview */}
                <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80"
                    alt="Tuyển Dụng Việc Làm"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                  
                  {/* Badge & Icon on Image */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className="p-1 bg-teal-600 text-white rounded-md shadow-xs">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <span className="px-1.5 py-0.2 bg-teal-600/90 text-white text-[9px] font-black rounded uppercase tracking-wider">
                      Việc Làm
                    </span>
                  </div>

                  <div className="absolute bottom-1.5 left-2 right-2">
                    <span className="text-white font-black text-xs sm:text-sm drop-shadow-sm uppercase tracking-tight block truncate">
                      4. Việc Làm & Tuyển Dụng
                    </span>
                  </div>
                </div>

                {/* Brief Info */}
                <div className="p-2.5 space-y-0.5">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug font-medium line-clamp-2">
                    Tìm việc làm nội khu, ứng tuyển thợ, nhân sự DN.
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 font-bold pt-0.5">
                    <span>Tìm việc ngay →</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Mobile Compact 2x2 Clean Services Grid (Ultra Neat Chợ Tốt Style) */}
            <div className="grid sm:hidden grid-cols-2 gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              {/* Mobile Card 1: Mua Bán */}
              <button
                onClick={() => {
                  setSearchType('sale');
                  setCurrentTab('sale');
                }}
                className={`text-left p-2 rounded-xl border transition flex items-center gap-2 cursor-pointer ${
                  searchType === 'sale'
                    ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/80 shadow-xs ring-1 ring-amber-500/40'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80"
                    alt="Mua Bán BĐS"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-extrabold text-[11px] text-slate-900 dark:text-white uppercase truncate block">
                    1. Mua Bán BĐS
                  </span>
                  <span className="text-[9px] font-bold text-amber-500 block truncate">Xem giá căn →</span>
                </div>
              </button>

              {/* Mobile Card 2: Cho Thuê */}
              <button
                onClick={() => {
                  setSearchType('rent');
                  setCurrentTab('rent');
                }}
                className={`text-left p-2 rounded-xl border transition flex items-center gap-2 cursor-pointer ${
                  searchType === 'rent'
                    ? 'bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/80 shadow-xs ring-1 ring-sky-500/40'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80"
                    alt="Cho Thuê BĐS"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-extrabold text-[11px] text-slate-900 dark:text-white uppercase truncate block">
                    2. Cho Thuê BĐS
                  </span>
                  <span className="text-[9px] font-bold text-sky-400 block truncate">Xem cho thuê →</span>
                </div>
              </button>

              {/* Mobile Card 3: Dịch Vụ Cư Dân */}
              <button
                onClick={() => setCurrentTab('services')}
                className="text-left p-2 rounded-xl border transition flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 cursor-pointer"
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80"
                    alt="Dịch Vụ Cư Dân"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-extrabold text-[11px] text-slate-900 dark:text-white uppercase truncate block">
                    3. Dịch Vụ Cư Dân
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 block truncate">Khám phá chợ →</span>
                </div>
              </button>

              {/* Mobile Card 4: Việc Làm & Tuyển Dụng */}
              <button
                onClick={() => setCurrentTab('recruitment')}
                className="text-left p-2 rounded-xl border transition flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 cursor-pointer"
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=300&q=80"
                    alt="Việc Làm"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-extrabold text-[11px] text-slate-900 dark:text-white uppercase truncate block">
                    4. Tuyển Dụng
                  </span>
                  <span className="text-[9px] font-bold text-teal-400 block truncate">Tìm việc làm →</span>
                </div>
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Dự án chọn lọc</label>
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(true)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-slate-900 dark:text-white flex items-center justify-between text-left transition cursor-pointer shadow-xs"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">
                      {searchProject === 'all'
                        ? '🏢 Tất cả dự án Vinhomes (Toàn quốc)'
                        : VIN_MAJOR_PROJECTS.find(p => p.id === searchProject)?.name || searchProject}
                    </span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                </button>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Loại hình sản phẩm</label>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value="all">Tất cả loại căn</option>
                  
                  <optgroup label="🏢 CAO TẦNG (CĂN HỘ CHUNG CƯ)">
                    <option value="studio">Căn Hộ Studio</option>
                    <option value="1pn">Căn Hộ 1PN</option>
                    <option value="2pn">Căn Hộ 2PN</option>
                    <option value="3pn">Căn Hộ 3PN+</option>
                  </optgroup>

                  <optgroup label="🏡 THẤP TẦNG (BIỆT THỰ & SHOPHOUSE)">
                    <option value="shophouse">Shophouse Thương Mại</option>
                    <option value="lien-ke">Nhà Liền Kề</option>
                    <option value="biet-thu-song-lap">Biệt Thự Song Lập</option>
                    <option value="biet-thu-don-lap">Biệt Thự Đơn Lập</option>
                  </optgroup>

                  <optgroup label="🏬 THUÊ TẦNG / MẶT BẰNG">
                    <option value="thue-tang">Thuê Tầng / Mặt Bằng Shophouse</option>
                    <option value="mat-bang">Mặt Bằng Kinh Doanh Sầm Uất</option>
                  </optgroup>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleHeroSearch}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{t.hero.searchBtn}</span>
                </button>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
              {t.hero.quickTags}
            </p>
          </div>

        </div>
      </section>

      {/* 2. Key Values Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-amber-500">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Minh Bạch</span>
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.stats.deals}</p>
            <p className="text-[11px] text-slate-400">Chuyển nhượng & Cho thuê chính chủ</p>
          </div>

          <div className="text-center sm:text-left space-y-1 border-l sm:border-l-0 lg:border-l border-slate-200 dark:border-slate-700 pl-4 sm:pl-0 lg:pl-4">
            <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-amber-500">
              <Star className="w-5 h-5 shrink-0 fill-amber-500" />
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Uy Tín</span>
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.stats.satisfaction}</p>
            <p className="text-[11px] text-slate-400">Đánh giá tốt từ cư dân & khách hàng</p>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-amber-500">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Chuyên Nghiệp</span>
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.stats.experience}</p>
            <p className="text-[11px] text-slate-400">Am hiểu chuyên sâu thị trường BĐS</p>
          </div>

          <div className="text-center sm:text-left space-y-1 border-l sm:border-l-0 lg:border-l border-slate-200 dark:border-slate-700 pl-4 sm:pl-0 lg:pl-4">
            <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-amber-500">
              <Clock className="w-5 h-5 shrink-0" />
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Tận Tâm</span>
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.stats.support}</p>
            <p className="text-[11px] text-slate-400">Tư vấn trực tiếp, nhận báo giá Zalo</p>
          </div>
        </div>
      </section>

      {/* 3. Featured Projects Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-amber-500 tracking-wider">HỆ THỐNG DỰ ÁN</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {t.sections.featuredProjects}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.sections.featuredProjectsSub}</p>
          </div>
          
          <button
            onClick={() => setCurrentTab('projects')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center shrink-0"
          >
            <span>Xem chi tiết cả 3 dự án</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => {
                onSelectProject(proj.id);
                setCurrentTab('projects');
              }}
              className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={proj.image}
                  alt={proj.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                  {proj.status}
                </span>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Khoảng giá</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">{proj.priceRange}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Listings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-amber-500 tracking-wider">GIỎ HÀNG HOT</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {t.sections.featuredProperties}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.sections.featuredPropertiesSub}</p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentTab('sale')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm"
            >
              Xem Nhà Bán ({properties.filter(p => p.type === 'sale').length})
            </button>
            <button
              onClick={() => setCurrentTab('rent')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
            >
              Xem Cho Thuê ({properties.filter(p => p.type === 'rent').length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              language={language}
              onSelect={onSelectProperty}
              isSaved={savedIds.includes(property.id)}
              onToggleSave={onToggleSave}
              isCompared={compareIds.includes(property.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>
      </section>

      {/* Middle Banner Ad */}
      <AdBannerWidget ads={liveAds} position="home_middle" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />

      {/* 5. Hiếu Bùi Profile Bio Highlight Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Avatar & Badges */}
            <div className="lg:col-span-4 text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-white p-3 border-4 border-amber-500/50 shadow-2xl mx-auto flex items-center justify-center overflow-hidden">
                  <img
                    src={logoImg}
                    alt="Logo Chợ Cư Dân 24H Vinhomes"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-amber-400">{HIEU_BUI_PROFILE.name}</h3>
                <p className="text-xs font-bold text-slate-400">{HIEU_BUI_PROFILE.title}</p>
                <p className="text-[11px] text-amber-300 font-semibold mt-0.5">{HIEU_BUI_PROFILE.domain}</p>
              </div>
            </div>

            {/* Content & Story */}
            <div className="lg:col-span-8 space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase text-amber-400 tracking-widest">
                  VỀ CHÚNG TÔI
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {t.sections.hieuBuiBioTitle}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {HIEU_BUI_PROFILE.bio}
              </p>

              {/* Achievements list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {HIEU_BUI_PROFILE.achievements.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{item}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center"
                >
                  <span>Xem Hồ Sơ Cá Nhân & Thành Tích</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>

                <a
                  href="tel:0868499929"
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs flex items-center transition border border-slate-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Hotline: 0868.499.929
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>



      {/* 6. Bank Mortgage Estimator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MortgageCalculator language={language} />
      </section>

      {/* 6.5. Comprehensive Q&A Knowledge Hub Section for SEO & Investors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProjectFaqHub />
      </section>

      {/* 6.5 Official Video Media Channel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RealestateVideoChannelSection />
      </section>

      {/* 7. Real Estate Market News Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-amber-500 tracking-wider">TIN TỨC & PHÂN TÍCH</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {t.sections.newsTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.sections.newsSub}</p>
          </div>

          <button
            onClick={() => setCurrentTab('news')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center shrink-0"
          >
            <span>Xem tất cả tin tức</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => setCurrentTab('news')}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                {item.source === 'n8n' && (
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow">
                    n8n Sync
                  </span>
                )}
                {item.source === 'ai' && (
                  <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow">
                    Gemini AI
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-[11px] text-slate-400 space-x-2 mb-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{item.publishedAt}</span>
                    <span>•</span>
                    <span>{item.author}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-amber-500">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center">
                  <span>Đọc tiếp</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO Popular Links Section at Bottom of HomePage */}
      <PopularVinhomesLinksSection
        setCurrentTab={setCurrentTab}
        onSelectProject={onSelectProject}
      />

      {/* Modal Selection */}
      <VinhomesProjectSelectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        selectedProject={searchProject as ProjectCategory | 'all'}
        onSelectProject={(p) => setSearchProject(p)}
      />

    </div>
  );
};
