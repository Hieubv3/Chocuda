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
import { INITIAL_RECRUITMENT_JOBS } from '../data/recruitmentData';
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

      {/* 1.5. CTA theo mẫu 02: mở gian hàng / đăng tin tuyển dụng / tạo CV tìm việc */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button onClick={() => setCurrentTab('services')} className="btn btn-primary">
            <Wrench className="w-4 h-4" />
            <span>Mở gian hàng, bán dịch vụ</span>
          </button>
          <button onClick={() => setCurrentTab('recruitment')} className="btn btn-secondary">
            <Briefcase className="w-4 h-4" />
            <span>Đăng tin tuyển dụng</span>
          </button>
          <button onClick={() => setCurrentTab('recruitment')} className="btn btn-secondary">
            <UserCheck className="w-4 h-4" />
            <span>Tạo CV, tìm việc</span>
          </button>
        </div>
      </section>

      {/* 2. Key Values Bar - compact */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 p-2.5 bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 shadow-md">
          <div className="flex items-center gap-1.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-black text-ink-900 dark:text-white truncate">Minh Bạch</p>
              <p className="text-[9px] font-semibold text-ink-500 dark:text-ink-400 truncate">{t.stats.deals}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <Star className="w-4 h-4 text-brand-500 shrink-0 fill-brand-500" />
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-black text-ink-900 dark:text-white truncate">Uy Tín</p>
              <p className="text-[9px] font-semibold text-ink-500 dark:text-ink-400 truncate">{t.stats.satisfaction}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-black text-ink-900 dark:text-white truncate">Chuyên Nghiệp</p>
              <p className="text-[9px] font-semibold text-ink-500 dark:text-ink-400 truncate">{t.stats.experience}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="w-4 h-4 text-brand-500 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-black text-ink-900 dark:text-white truncate">Tận Tâm</p>
              <p className="text-[9px] font-semibold text-ink-500 dark:text-ink-400 truncate">{t.stats.support}</p>
            </div>
          </div>
        </div>
      </section>
      {/* 2.5. DỊCH VỤ CƯ DÂN — ưu tiên theo mẫu 02 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-ink-200 dark:border-ink-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider">Dịch vụ cư dân</span>
            <h2 className="text-xl font-black text-ink-900 dark:text-white mt-0.5">Dịch vụ cư dân nội khu</h2>
            <p className="text-[11px] text-ink-500 dark:text-ink-400">Thợ &amp; dịch vụ đã xác minh KYC trong khu đô thị</p>
          </div>
          <button onClick={() => setCurrentTab('services')} className="btn btn-secondary btn-sm shrink-0">
            <span>{t.ui.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(INITIAL_RESIDENT_SERVICES as any[]).filter((sv: any) => sv.verified).slice(0, 6).map((sv: any) => (
            <div key={sv.id} onClick={() => setCurrentTab('services')} className="card24 p-3.5 flex gap-3 cursor-pointer">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 shrink-0">
                {sv.images && sv.images[0] ? (
                  <img loading="lazy" src={sv.images[0]} alt={sv.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-400"><Wrench className="w-5 h-5" /></div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start gap-1.5">
                  <span className="text-xs font-black text-ink-900 dark:text-white line-clamp-2">{sv.title}</span>
                  {sv.verified && (
                    <span className="badge badge-soft shrink-0"><ShieldCheck className="w-2.5 h-2.5" /> KYC</span>
                  )}
                </div>
                <p className="spec24 line-clamp-1">{sv.providerName} • {sv.address}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="price24">{sv.priceDisplay}</span>
                  <span className="rating24"><Star className="w-3 h-3" /> {sv.rating} ({sv.reviewCount})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2.6. VIỆC LÀM NỘI KHU — ưu tiên theo mẫu 02 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-ink-200 dark:border-ink-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider">Việc làm</span>
            <h2 className="text-xl font-black text-ink-900 dark:text-white mt-0.5">Việc làm nội khu</h2>
            <p className="text-[11px] text-ink-500 dark:text-ink-400">Tuyển dụng &amp; tìm việc ngay trong khu đô thị</p>
          </div>
          <button onClick={() => setCurrentTab('recruitment')} className="btn btn-secondary btn-sm shrink-0">
            <span>{t.ui.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(INITIAL_RECRUITMENT_JOBS as any[]).filter((j: any) => j.status === 'active').slice(0, 6).map((j: any) => (
            <div key={j.id} onClick={() => setCurrentTab('recruitment')} className="card24 p-3.5 flex gap-3 cursor-pointer">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 shrink-0">
                {j.companyLogo ? (
                  <img loading="lazy" src={j.companyLogo} alt={j.companyName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-400"><Briefcase className="w-5 h-5" /></div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start gap-1.5">
                  <span className="text-xs font-black text-ink-900 dark:text-white line-clamp-2">{j.title}</span>
                  {j.isUrgent && <span className="badge badge-job shrink-0">Gấp</span>}
                </div>
                <p className="spec24 line-clamp-1">{j.companyName} • {j.location}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="price24">{j.salaryDisplay}</span>
                  <span className="note24 line-clamp-1">{j.jobType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Tổng hợp 3 ngành: Dịch vụ · Cho thuê · Chuyển nhượng (dạng gian hàng, thẻ ảnh lớn) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-ink-200 dark:border-ink-800 pb-2 mb-3">
          <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider">{t.ui.forResidents}</span>
          <h2 className="text-base sm:text-xl font-black text-ink-900 dark:text-white mt-0.5 leading-tight">{t.ui.servicesJobsRealestate}</h2>
          <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0">{t.ui.residentsTagline}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: t.ui.residentServices,
              accent: 'bg-brand-600',
              tab: 'services',
              items: (INITIAL_RESIDENT_SERVICES as any[]).slice(0, 4).map((s: any) => ({
                id: String(s.id),
                title: s.title || s.name || '',
                price: s.priceDisplay || s.price || s.category || '',
                image: (Array.isArray(s.images) ? s.images[0] : s.image) || '',
              })),
            },
            {
              title: t.ui.jobsInArea,
              accent: 'bg-sky-600',
              tab: 'recruitment',
              items: (INITIAL_RECRUITMENT_JOBS as any[]).filter((j: any) => j.status === 'active').slice(0, 4).map((j: any) => ({
                id: String(j.id),
                title: j.title,
                price: j.salaryDisplay || '',
                image: j.companyLogo || '',
              })),
            },
            {
              title: t.ui.buyRentRealEstate,
              accent: 'bg-ink-500',
              tab: 'sale',
              items: properties.slice(0, 4).map((p) => ({
                id: p.id,
                title: p.title,
                price: p.priceDisplay,
                image: p.images?.[0],
              })),
            },
          ].map((col) => (
            <div
              key={col.title}
              className="bg-white dark:bg-ink-900 rounded-3xl border border-ink-200 dark:border-ink-800 overflow-hidden shadow-sm"
            >
              <div className={`px-4 py-2.5 flex items-center justify-between ${col.accent}`}>
                <span className="font-black text-xs uppercase tracking-wider text-white">{col.title}</span>
                <button
                  onClick={() => setCurrentTab(col.tab)}
                  className="text-[10px] font-bold bg-black/20 hover:bg-black/30 text-white px-2 py-0.5 rounded transition cursor-pointer"
                >
                  {t.ui.viewAll}
                </button>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5">
                {col.items.length === 0 ? (
                  <p className="col-span-2 text-xs italic text-ink-400 py-4 text-center">{t.ui.noListings}</p>
                ) : (
                  col.items.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => setCurrentTab(col.tab)}
                      className="text-left rounded-2xl overflow-hidden border border-ink-200 dark:border-ink-700 hover:border-brand-400 transition group cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100 dark:bg-ink-800">
                        {it.image ? (
                          <img
                            loading="lazy"
                            src={it.image}
                            alt={it.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-300 text-xs">{t.ui.noImage}</div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-bold text-ink-800 dark:text-ink-100 line-clamp-2 leading-snug">
                          {it.title}
                        </p>
                        {it.price && (
                          <p className="text-[10px] font-black text-brand-600 dark:text-brand-400 mt-1">{it.price}</p>
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

      

      {/* 5. Hiếu Bùi Profile Bio Highlight Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 text-white rounded-3xl p-8 sm:p-12 border border-ink-800 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Avatar & Badges */}
            <div className="lg:col-span-4 text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-white p-3 border-4 border-brand-500/50 shadow-2xl mx-auto flex items-center justify-center overflow-hidden">
                  <img loading="lazy"
                    src={logoImg}
                    alt="Logo Chợ Cư Dân 24H Vinhomes"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="absolute bottom-2 right-2 bg-brand-500 text-white p-2 rounded-2xl shadow-lg">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-brand-400">{HIEU_BUI_PROFILE.name}</h3>
                <p className="text-xs font-bold text-ink-400">{HIEU_BUI_PROFILE.title}</p>
                <p className="text-[11px] text-brand-300 font-semibold mt-0.5">{HIEU_BUI_PROFILE.domain}</p>
              </div>
            </div>

            {/* Content & Story */}
            <div className="lg:col-span-8 space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase text-brand-400 tracking-widest">
                  VỀ CHÚNG TÔI
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {t.sections.hieuBuiBioTitle}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-ink-300 leading-relaxed whitespace-pre-line">
                {HIEU_BUI_PROFILE.bio}
              </p>

              {/* Achievements list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {HIEU_BUI_PROFILE.achievements.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-ink-800/80 p-2.5 rounded-xl border border-ink-700/60">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <span className="font-semibold text-ink-200">{item}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-ink-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center"
                >
                  <span>Xem Hồ Sơ Cá Nhân & Thành Tích</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>

                <a
                  href="tel:0868499929"
                  className="px-6 py-3 bg-ink-800 hover:bg-ink-700 text-brand-400 font-bold rounded-xl text-xs flex items-center transition border border-ink-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Hotline: 0868.499.929
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>



      {/* 7. Tin Tức & 4 Nhóm Ngành — 1 lớp hiển thị */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink-200 dark:border-ink-800 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-brand-500 tracking-wider">TIN TỨC & NHÓM NGÀNH</span>
            <h2 className="text-2xl font-black text-ink-900 dark:text-white mt-1">
              {t.sections.newsTitle}
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">{t.sections.newsSub}</p>
          </div>

          <button
            onClick={() => setCurrentTab('news')}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center shrink-0"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-white font-black text-xs sm:text-sm drop-shadow-md">{cat.label}</span>
                    <div className="flex items-center text-brand-400 text-[10px] sm:text-[11px] font-bold mt-1">
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
                className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 shadow-sm hover:shadow-lg hover:border-brand-400/60 transition duration-300 cursor-pointer flex items-stretch overflow-hidden"
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
                    <div className="flex items-center text-[10px] text-ink-400 space-x-2 mb-1">
                      <Clock className="w-3 h-3 text-brand-500" />
                      <span>{item.publishedAt}</span>
                      <span>•</span>
                      <span className="truncate">{item.author}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-ink-900 dark:text-white line-clamp-2 hover:text-brand-500">
                      {item.title}
                    </h3>
                  </div>
                  <div className="pt-2 text-[11px] font-bold text-brand-600 dark:text-brand-400 flex items-center">
                    <span>Đọc tiếp</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BẤT ĐỘNG SẢN — KÊNH PHỤ TRỢ (ưu tiên dịch vụ cư dân & việc làm phía trên) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-ink-200 dark:border-ink-800 pb-3">
          <span className="text-[10px] font-black uppercase text-ink-500 dark:text-ink-400 tracking-wider">Kênh phụ trợ</span>
          <h2 className="text-xl font-black text-ink-900 dark:text-white mt-0.5">Bất động sản, kênh phụ trợ</h2>
          <p className="text-[11px] text-ink-500 dark:text-ink-400">Mua bán, cho thuê &amp; dự án Vinhomes trong khu đô thị</p>
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

      {/* 3. Featured Projects Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink-200 dark:border-ink-800 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-brand-500 tracking-wider">HỆ THỐNG DỰ ÁN</span>
            <h2 className="text-2xl font-black text-ink-900 dark:text-white mt-1">
              {t.sections.featuredProjects}
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">{t.sections.featuredProjectsSub}</p>
          </div>
          
          <button
            onClick={() => setCurrentTab('projects')}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center shrink-0"
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
              className="group bg-white dark:bg-ink-800 rounded-3xl overflow-hidden border border-ink-200 dark:border-ink-700 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                <img loading="lazy"
                  src={proj.image}
                  alt={proj.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-brand-500 text-ink-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                  {proj.status}
                </span>
              </div>

              <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-base font-bold text-ink-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-2">
                    {proj.name}
                  </h3>
                  <p className="hidden sm:block text-xs text-ink-500 dark:text-ink-400 mt-1 line-clamp-2">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-ink-100 dark:border-ink-700 text-[10px] sm:text-xs flex justify-between items-center gap-1">
                  <span className="text-ink-400 hidden sm:inline">Khoảng giá</span>
                  <span className="font-extrabold text-brand-600 dark:text-brand-400 truncate">{proj.priceRange}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Listings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink-200 dark:border-ink-800 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-brand-500 tracking-wider">GIỎ HÀNG HOT</span>
            <h2 className="text-2xl font-black text-ink-900 dark:text-white mt-1">
              {t.sections.featuredProperties}
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">{t.sections.featuredPropertiesSub}</p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentTab('sale')}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-ink-950 font-bold rounded-xl text-xs transition shadow-sm"
            >
              Xem Nhà Bán ({properties.filter(p => p.type === 'sale').length})
            </button>
            <button
              onClick={() => setCurrentTab('rent')}
              className="px-4 py-2 bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 text-ink-800 dark:text-ink-200 font-bold rounded-xl text-xs transition"
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
      <AdBannerWidget ads={liveAds} position="home_middle" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />{/* SEO Popular Links Section at Bottom of HomePage */}
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
