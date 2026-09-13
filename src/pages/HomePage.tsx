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
import { HIEU_BUI_PROFILE, INITIAL_ADS, WIDGET_GROUPS } from '../data/initialData';
import { loadHeroCards } from '../data/heroCardsData';
import { getTranslation } from '../lib/i18n';
import { DashboardContent } from '../components/DashboardContent';
import { BannerNewsRail } from '../components/BannerNewsRail';
import { IndustryFeed, IndustryFeedItem } from '../components/IndustryFeed';
import { INITIAL_RESIDENT_SERVICES } from '../data/residentServicesData';
import { getStoredAreaKey, prioritizeByArea } from '../lib/areaPriority';
import { WidgetItem } from '../types';

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

  // Read hero card images (admin-managed via localStorage, fallback to defaults)
  const heroCards = React.useMemo(() => loadHeroCards(), []);
  const heroCardImage = (id: string, fallback: string) =>
    heroCards.find(c => c.id === id && c.active)?.image || fallback;

  // Search state
  const [searchType, setSearchType] = React.useState<PropertyType>('sale');
  const [searchProject, setSearchProject] = React.useState<string>('all');
  const [searchCategory, setSearchCategory] = React.useState<string>('all');
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState<boolean>(false);

  // Ảnh 4 nhóm ngành (admin quản lý trong Admin Dashboard)
  const [categoryImages, setCategoryImages] = React.useState<{ key: string; label: string; image: string; link: string }[]>([]);
  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/homepage-category-images')
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setCategoryImages(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleHeroSearch = () => {
    if (searchProject !== 'all') {
      onSelectProject(searchProject as ProjectCategory);
    }
    setCurrentTab(searchType);
  };

  const areaKey = typeof window !== 'undefined' ? getStoredAreaKey() : null;
  const prioritizedProperties = prioritizeByArea(properties, areaKey, (p: Property) => p.project);
  const featuredProperties = prioritizedProperties.slice(0, 6);

  // ===== Ưu tiên: Dịch vụ · Cho thuê căn hộ · Chuyển nhượng =====
  const toPropFeed = (list: Property[]): IndustryFeedItem[] =>
    list.slice(0, 5).map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.priceDisplay,
      image: p.images?.[0],
      date: p.createdAt ? String(p.createdAt).slice(0, 10) : '',
    }));
  const rentFeedItems: IndustryFeedItem[] = toPropFeed(prioritizedProperties.filter((p) => p.type === 'rent'));
  const saleFeedItems: IndustryFeedItem[] = toPropFeed(prioritizedProperties.filter((p) => p.type === 'sale'));
  const serviceFeedItems: IndustryFeedItem[] = (INITIAL_RESIDENT_SERVICES as any[]).slice(0, 5).map((s: any) => ({
    id: String(s.id),
    title: s.title || s.name || '',
    subtitle: s.priceDisplay || s.price || s.category || '',
    image: (Array.isArray(s.images) ? s.images[0] : s.image) || '',
    date: s.createdAt ? String(s.createdAt).slice(0, 10) : '',
  }));

  // ===== Bản tin 4 ngành (bài viết tin tức) =====
  const [newsIndustryFilter, setNewsIndustryFilter] = React.useState('all');
  const homeNews = React.useMemo(() => {
    const base = (news || []).filter(n => n.status !== 'draft');
    const list = newsIndustryFilter === 'all'
      ? base
      : base.filter(n => n.industry === newsIndustryFilter);
    return list.slice(0, 6);
  }, [news, newsIndustryFilter]);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Banner Section */}
      <section className="relative bg-slate-950 text-white pt-5 pb-6 sm:pt-12 sm:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] shadow-2xl">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-30">
          <img loading="lazy"
            src="/images/demo/hero-city-1.jpg"
            alt="Vinhomes Ocean Park"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        </div>

        <div className="relative max-w-7xl mx-auto space-y-2 sm:space-y-8 text-center sm:text-left">
          
          {/* Top Badge */}
          <div className="hidden sm:inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-extrabold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHỢ CƯ DÂN 24H — CHOCUDAN24H.COM</span>
          </div>

          {/* Hero Titles */}
          <div className="space-y-1 sm:space-y-2 max-w-3xl">
            <h1 className="tracking-tight text-white leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 font-black text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-tight drop-shadow-md">
                KẾT NỐI CƯ DÂN VINHOMES
              </span>
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-200 font-medium leading-snug">
              Mua bán, cho thuê BĐS và dịch vụ nội khu Vinhomes — hỗ trợ 24/7.
            </p>
            <p className="hidden sm:flex text-[10px] sm:text-[11px] text-amber-300 font-semibold items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span>Hotline/Zalo 0868.499.929</span>
            </p>
          </div>

          {/* Search Box Widget */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-4xl">
            
            {/* 4 nhóm ngành - 4 ô vuông có ảnh (thu nhỏ 30% trên di động) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              {[
                {
                  key: 'sale',
                  title: '1. Mua Bán BĐS',
                  cta: 'Xem giá căn →',
                  badge: 'Chính Chủ',
                  icon: Building2,
                  img: heroCardImage('sale', '/images/demo/project-tower.jpg'),
                  iconCls: 'bg-amber-500 text-slate-950',
                  badgeCls: 'bg-amber-500/90 text-slate-950',
                  ctaCls: 'text-amber-300',
                  activeCls: 'border-amber-500 ring-2 ring-amber-500/50 shadow-md',
                  active: searchType === 'sale',
                  onClick: () => { setSearchType('sale'); setCurrentTab('sale'); },
                },
                {
                  key: 'rent',
                  title: '2. Cho Thuê BĐS',
                  cta: 'Xem cho thuê →',
                  badge: 'Ở Ngay',
                  icon: KeyRound,
                  img: heroCardImage('rent', '/images/demo/project-apartment.jpg'),
                  iconCls: 'bg-sky-500 text-white',
                  badgeCls: 'bg-sky-500/90 text-white',
                  ctaCls: 'text-sky-300',
                  activeCls: 'border-sky-500 ring-2 ring-sky-500/50 shadow-md',
                  active: searchType === 'rent',
                  onClick: () => { setSearchType('rent'); setCurrentTab('rent'); },
                },
                {
                  key: 'services',
                  title: '3. Dịch Vụ Cư Dân',
                  cta: 'Khám phá chợ →',
                  badge: 'Tiện Ích',
                  icon: Wrench,
                  img: heroCardImage('services', '/images/demo/ad-service.jpg'),
                  iconCls: 'bg-emerald-600 text-white',
                  badgeCls: 'bg-emerald-600/90 text-white',
                  ctaCls: 'text-emerald-300',
                  activeCls: 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-md',
                  active: false,
                  onClick: () => setCurrentTab('services'),
                },
                {
                  key: 'recruitment',
                  title: '4. Tuyển Dụng',
                  cta: 'Tìm việc làm →',
                  badge: 'Việc Làm',
                  icon: Briefcase,
                  img: heroCardImage('recruitment', '/images/demo/hero-city-2.jpg'),
                  iconCls: 'bg-teal-600 text-white',
                  badgeCls: 'bg-teal-600/90 text-white',
                  ctaCls: 'text-teal-300',
                  activeCls: 'border-teal-500 ring-2 ring-teal-500/50 shadow-md',
                  active: false,
                  onClick: () => setCurrentTab('recruitment'),
                },
              ].map((card) => {
                const CardIcon = card.icon;
                return (
                  <button
                    key={card.key}
                    onClick={card.onClick}
                    className={`group relative aspect-square rounded-2xl overflow-hidden border text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      card.active
                        ? card.activeCls
                        : 'border-slate-200 dark:border-slate-700 hover:shadow-lg'
                    }`}
                  >
                    <img loading="lazy"
                      src={card.img}
                      alt={card.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/35 to-transparent" />

                    {/* Icon + Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <div className={`p-1.5 rounded-lg shadow-xs ${card.iconCls}`}>
                        <CardIcon className="w-4 h-4" />
                      </div>
                      <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${card.badgeCls}`}>
                        {card.badge}
                      </span>
                    </div>

                    {/* Title + CTA */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <span className="block text-white font-black text-[11px] sm:text-sm uppercase tracking-tight drop-shadow-sm">
                        {card.title}
                      </span>
                      <span className={`block text-[10px] font-bold pt-0.5 ${card.ctaCls}`}>
                        {card.cta}
                      </span>
                    </div>
                  </button>
                );
              })}
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

        {/* Bản tin nằm trong banner (mép phải ~12%) */}
        <BannerNewsRail title="TIN NỔI BẬT" />
      </section>

      {/* 2. Key Values Bar - compact */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="flex items-center gap-1.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">Minh Bạch</p>
              <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 truncate">{t.stats.deals}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <Star className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500" />
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">Uy Tín</p>
              <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 truncate">{t.stats.satisfaction}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">Chuyên Nghiệp</p>
              <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 truncate">{t.stats.experience}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">Tận Tâm</p>
              <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 truncate">{t.stats.support}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 ƯU TIÊN: Dịch vụ · Cho thuê căn hộ · Chuyển nhượng (trước Dự án trọng điểm) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
          <div>
            <span className="text-xs font-black uppercase text-amber-500 tracking-wider">TIN ĐĂNG CƯ DÂN</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">DỊCH VỤ · CHO THUÊ · CHUYỂN NHƯỢNG</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ưu tiên hiển thị tin mới nhất của cư dân</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <IndustryFeed
            title="DỊCH VỤ CƯ DÂN"
            accent="bg-emerald-600"
            items={serviceFeedItems}
            emptyText="Chưa có dịch vụ"
            onViewAll={() => setCurrentTab('services')}
            onItemClick={() => setCurrentTab('services')}
          />
          <IndustryFeed
            title="CHO THUÊ CĂN HỘ"
            accent="bg-sky-500"
            items={rentFeedItems}
            emptyText="Chưa có tin cho thuê"
            onViewAll={() => setCurrentTab('rent')}
            onItemClick={() => setCurrentTab('rent')}
          />
          <IndustryFeed
            title="CHUYỂN NHƯỢNG / MUA BÁN"
            accent="bg-amber-500"
            items={saleFeedItems}
            emptyText="Chưa có tin mua bán"
            onViewAll={() => setCurrentTab('sale')}
            onItemClick={() => setCurrentTab('sale')}
          />
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
                <img loading="lazy"
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
                  <img loading="lazy"
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
                <img loading="lazy" src={item.image} alt={item.title} className="w-full h-full object-cover" />
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

      {/* Widget Groups Dashboard - DỊCH VỤ MỚI ở đầu tiên */}
      <DashboardContent
        categories={[]}
        widgetGroups={WIDGET_GROUPS}
        onSelectCategory={(cat) => {}}
        onSelectWidgetItem={(item) => {}}
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
