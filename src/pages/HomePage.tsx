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
import { RealTimeNewsBoard } from '../components/RealTimeNewsBoard';
import { DeveloperUnitsPublic } from '../components/DeveloperUnitsPublic';
import { VIN_MAJOR_PROJECTS } from '../data/residentServicesData';
import { HIEU_BUI_PROFILE, INITIAL_ADS } from '../data/initialData';
import { IndustryFeed } from '../components/IndustryFeed';
import { INITIAL_RESIDENT_SERVICES } from '../data/residentServicesData';
import { loadHeroCards } from '../data/heroCardsData';
import { HomeBannerSection } from '../components/HomeBannerSection';
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

  const featuredProperties = properties.slice(0, 6);
  const [inventoryProjectId, setInventoryProjectId] = React.useState<ProjectCategory>(
    (projects.find(p => p.id === 'ocean-park-2')?.id || projects[0]?.id || 'ocean-park-2') as ProjectCategory
  );
  const inventoryProject = projects.find(p => p.id === inventoryProjectId) || projects[0];

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Banner Section */}
      <HomeBannerSection
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onSelectProperty={onSelectProperty}
        properties={properties}
        news={news}
        bannerImage="/images/demo/hero-city-1.jpg"
      />

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

      {/* Tổng hợp 3 ngành: Dịch vụ · Cho thuê · Chuyển nhượng (dạng gian hàng, thẻ ảnh lớn) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
          <span className="text-xs font-black uppercase text-amber-500 tracking-wider">GIAN HÀNG TỔNG HỢP CƯ DÂN</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">DỊCH VỤ · CHO THUÊ · CHUYỂN NHƯỢNG</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tổng hợp tin mới nhất của cư dân</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: 'DỊCH VỤ CƯ DÂN',
              accent: 'bg-emerald-600',
              tab: 'services',
              items: (INITIAL_RESIDENT_SERVICES as any[]).slice(0, 4).map((s: any) => ({
                id: String(s.id),
                title: s.title || s.name || '',
                price: s.priceDisplay || s.price || s.category || '',
                image: (Array.isArray(s.images) ? s.images[0] : s.image) || '',
              })),
            },
            {
              title: 'CHO THUÊ CĂN HỘ',
              accent: 'bg-sky-500',
              tab: 'rent',
              items: properties.filter((p) => p.type === 'rent').slice(0, 4).map((p) => ({
                id: p.id,
                title: p.title,
                price: p.priceDisplay,
                image: p.images?.[0],
              })),
            },
            {
              title: 'CHUYỂN NHƯỢNG / MUA BÁN',
              accent: 'bg-amber-500',
              tab: 'sale',
              items: properties.filter((p) => p.type === 'sale').slice(0, 4).map((p) => ({
                id: p.id,
                title: p.title,
                price: p.priceDisplay,
                image: p.images?.[0],
              })),
            },
          ].map((col) => (
            <div
              key={col.title}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              <div className={`px-4 py-2.5 flex items-center justify-between ${col.accent}`}>
                <span className="font-black text-xs uppercase tracking-wider text-white">{col.title}</span>
                <button
                  onClick={() => setCurrentTab(col.tab)}
                  className="text-[10px] font-bold bg-black/20 hover:bg-black/30 text-white px-2 py-0.5 rounded transition cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5">
                {col.items.length === 0 ? (
                  <p className="col-span-2 text-xs italic text-slate-400 py-4 text-center">Chưa có tin</p>
                ) : (
                  col.items.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => setCurrentTab(col.tab)}
                      className="text-left rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition group cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {it.image ? (
                          <img
                            loading="lazy"
                            src={it.image}
                            alt={it.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Chưa có ảnh</div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                          {it.title}
                        </p>
                        {it.price && (
                          <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 mt-1">{it.price}</p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => {
                onSelectProject(proj.id);
                setCurrentTab('projects');
              }}
              className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
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

              <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-2">
                    {proj.name}
                  </h3>
                  <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-700 text-[10px] sm:text-xs flex justify-between items-center gap-1">
                  <span className="text-slate-400 hidden sm:inline">Khoảng giá</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 truncate">{proj.priceRange}</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-6">
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

      {/* 7. Tin Tức & 4 Nhóm Ngành — 1 lớp hiển thị */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-amber-500 tracking-wider">TIN TỨC & NHÓM NGÀNH</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-6 items-start">
          {/* 4 Nhóm Ngành — lưới 2x2 */}
          {categoryImages.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {categoryImages.map(cat => (
                <a
                  key={cat.key}
                  href={cat.link}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentTab(cat.key === 'mua-ban' ? 'sale' : cat.key === 'cho-thue' ? 'rent' : cat.key === 'tuyen-dung' ? 'recruitment' : 'services');
                  }}
                  className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block"
                >
                  <img
                    loading="lazy"
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-28 sm:h-36 lg:h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-white font-black text-xs sm:text-sm drop-shadow-md">{cat.label}</span>
                    <div className="flex items-center text-amber-400 text-[10px] sm:text-[11px] font-bold mt-1">
                      <span>Khám phá ngay</span>
                      <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Bản tin — 3 dòng gọn */}
          <div className="space-y-3">
            {news.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentTab('news')}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-amber-400/60 transition duration-300 cursor-pointer flex items-stretch overflow-hidden"
              >
                <div className="relative w-28 sm:w-36 shrink-0">
                  <img loading="lazy" src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  {item.source === 'n8n' && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                      n8n
                    </span>
                  )}
                  {item.source === 'ai' && (
                    <span className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                      AI
                    </span>
                  )}
                </div>
                <div className="p-3 sm:p-4 flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center text-[10px] text-slate-400 space-x-2 mb-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{item.publishedAt}</span>
                      <span>•</span>
                      <span className="truncate">{item.author}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-amber-500">
                      {item.title}
                    </h3>
                  </div>
                  <div className="pt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center">
                    <span>Đọc tiếp</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
