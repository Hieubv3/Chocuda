import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, Search, FileCode, Layers, Store, ShoppingBag, Wrench, 
  Briefcase, UserCheck, Newspaper, Building2, MapPin, ChevronRight, Home, ExternalLink
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { INITIAL_PROJECTS, INITIAL_PROPERTIES, INITIAL_NEWS } from '../data/initialData';
import { INITIAL_USER_STOREFRONTS } from '../data/residentStoresData';
import { INITIAL_RESIDENT_SERVICES, DEFAULT_INDUSTRY_KYC_RULES } from '../data/residentServicesData';
import { INITIAL_RECRUITMENT_JOBS, INITIAL_CANDIDATE_PROFILES } from '../data/recruitmentData';
import { SUBDIVISION_SEO_DATA } from '../data/subdivisionData';
import { 
  getPropertyDetailUrl, getNewsDetailUrl, getProjectSlug, 
  getSubdivisionUrl, getAmenityUrl, getServiceDetailUrl, 
  getStoreDetailUrl, getProductDetailUrl, getJobDetailUrl, 
  getCandidateCvUrl 
} from '../lib/slugs';

export const SitemapDirectoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'products' | 'stores' | 'services' | 'jobs' | 'cv' | 'properties' | 'news'>('all');

  // Collect all products
  const allProducts = INITIAL_USER_STOREFRONTS.flatMap(store => 
    (store.products || []).map(p => ({
      ...p,
      storeName: store.storeName,
      storeSlug: store.slug || store.id,
      storeProject: store.project,
      url: getProductDetailUrl(p, store.slug || store.id)
    }))
  );

  // Collect all subdivisions
  const allSubdivisions = Object.entries(SUBDIVISION_SEO_DATA).map(([subKey, sub]) => ({
    id: sub.id,
    name: sub.name,
    project: sub.projectName,
    url: getSubdivisionUrl(sub.projectId, sub.name)
  }));

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://chocudan24h.com/sitemap';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title="Sitemap Toàn Diện — Sơ Đồ Toàn Bộ Đường Dẫn Website & Hàng Hóa Dịch Vụ Cư Dân"
        description="Sơ đồ website Chợ Cư Dân 24h: Danh bạ đầy đủ các đường dẫn chuẩn SEO Google & AI Index cho Bất động sản, Dự án, Phân khu, Gian hàng cư dân, Sản phẩm hàng hóa, Thợ & Dịch vụ, Việc làm và Hồ sơ ứng viên."
        url={shareUrl}
        keywords="sitemap chocudan24h, danh bạ link chợ cư dân, sơ đồ website vinhomes, seo google chocudan24h"
      />

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 gap-1.5">
            <Link to="/" className="hover:text-amber-500 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold">
              Sơ Đồ Website (Sitemap Directory)
            </span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full uppercase flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5" /> Chuẩn SEO Google & AI Index
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
              Sitemap.xml Trực Tiếp
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            SƠ ĐỒ TRUY CẬP ĐƯỜNG DẪN RIÊNG BIỆT TOÀN HỆ THỐNG
          </h1>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Mọi bài đăng hàng hóa, gian hàng, thợ kỹ thuật, tuyển dụng việc làm, hồ sơ ứng viên và bất động sản đều sở hữu <b>link URL độc lập</b> và được lập chỉ mục đầy đủ trong <b>Sitemap.xml</b> phục vụ Google Search & AI Search Bot (Gemini, ChatGPT, Perplexity).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-md"
            >
              <FileCode className="w-4 h-4" />
              <span>Xem File XML Live (/sitemap.xml)</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <span>Xem File robots.txt</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: 'all', label: 'Tất Cả Danh Mục' },
            { id: 'products', label: `Hàng Hóa Cư Dân (${allProducts.length})` },
            { id: 'stores', label: `Gian Hàng (${INITIAL_USER_STOREFRONTS.length})` },
            { id: 'services', label: `Dịch Vụ & Thợ (${INITIAL_RESIDENT_SERVICES.length})` },
            { id: 'jobs', label: `Tuyển Dụng (${INITIAL_RECRUITMENT_JOBS.length})` },
            { id: 'cv', label: `Hồ Sơ CV (${INITIAL_CANDIDATE_PROFILES.length})` },
            { id: 'properties', label: `BĐS (${INITIAL_PROPERTIES.length})` },
            { id: 'news', label: `Tin Tức (${INITIAL_NEWS.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. HÀNG HÓA & SẢN PHẨM CƯ DÂN */}
        {(activeFilter === 'all' || activeFilter === 'products') && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <span>Bài Đăng Sản Phẩm & Hàng Hóa Cư Dân ({allProducts.length} Link Riêng)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">/gian-hang/:storeSlug/san-pham/:productId</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allProducts.map(p => (
                <Link
                  key={p.id}
                  to={p.url}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-3 group transition"
                >
                  <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition truncate">
                      {p.name}
                    </h3>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                      {p.price.toLocaleString('vi-VN')}₫ / {p.unit}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate block">
                      Shop: {p.storeName} ({p.storeProject})
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 2. GIAN HÀNG CƯ DÂN */}
        {(activeFilter === 'all' || activeFilter === 'stores') && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-500" />
                <span>Gian Hàng & Cửa Hàng In-Store ({INITIAL_USER_STOREFRONTS.length} Link Riêng)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">/gian-hang/:storeSlug</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INITIAL_USER_STOREFRONTS.map(store => (
                <Link
                  key={store.id}
                  to={getStoreDetailUrl(store)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-3 group transition"
                >
                  <img src={store.logoUrl} alt={store.storeName} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-amber-500" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                      {store.storeName}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                      {store.category} • {store.address}
                    </span>
                    <span className="text-[10px] text-amber-500 font-bold">
                      {store.products?.length || 0} sản phẩm niêm yết
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 3. DỊCH VỤ & THỢ CƯ DÂN */}
        {(activeFilter === 'all' || activeFilter === 'services') && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-500" />
                <span>Thợ & Dịch Vụ Cư Dân ({INITIAL_RESIDENT_SERVICES.length} Link Riêng)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">/dich-vu-cu-dan/:serviceSlug</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INITIAL_RESIDENT_SERVICES.map(service => (
                <Link
                  key={service.id}
                  to={getServiceDetailUrl(service)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-500/10 dark:hover:bg-blue-500/10 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-3 group transition"
                >
                  <img src={service.images[0]} alt={service.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                      {service.title}
                    </h3>
                    <span className="text-[11px] text-emerald-600 font-bold block">
                      {service.priceDisplay}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      Thợ: {service.providerName} ({service.project})
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. TUYỂN DỤNG & VIỆC LÀM */}
        {(activeFilter === 'all' || activeFilter === 'jobs') && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-500" />
                <span>Việc Làm & Tuyển Dụng ({INITIAL_RECRUITMENT_JOBS.length} Link Riêng)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">/tuyen-dung/viec-lam/:jobId</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INITIAL_RECRUITMENT_JOBS.map(job => (
                <Link
                  key={job.id}
                  to={getJobDetailUrl(job)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-500/10 dark:hover:bg-purple-500/10 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1 group transition"
                >
                  <h3 className="font-black text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition truncate">
                    {job.title}
                  </h3>
                  <div className="text-[11px] text-emerald-600 font-bold">
                    Lương: {job.salaryDisplay}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {job.companyName} • {job.location}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 5. HỒ SƠ ỨNG VIÊN CV */}
        {(activeFilter === 'all' || activeFilter === 'cv') && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-500" />
                <span>Hồ Sơ Ứng Viên Cư Dân CV ({INITIAL_CANDIDATE_PROFILES.length} Link Riêng)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">/tuyen-dung/ung-vien/:candidateId</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INITIAL_CANDIDATE_PROFILES.map(cand => (
                <Link
                  key={cand.id}
                  to={getCandidateCvUrl(cand)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-500/10 dark:hover:bg-teal-500/10 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-3 group transition"
                >
                  <img 
                    src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                    alt={cand.fullName} 
                    className="w-10 h-10 rounded-full object-cover shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-xs text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition truncate">
                      {cand.fullName}
                    </h3>
                    <span className="text-[11px] text-amber-500 font-bold block truncate">
                      {cand.targetJobTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Kinh nghiệm: {cand.yearsOfExp || 1} năm • {cand.projectName || cand.currentProject}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 6. BẤT ĐỘNG SẢN & DỰ ÁN & PHÂN KHU */}
        {(activeFilter === 'all' || activeFilter === 'properties') && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-500" />
                <span>Bất Động Sản & Chuyển Nhượng Vinhomes ({INITIAL_PROPERTIES.length} Căn)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">/:projectSlug/:propertyId</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INITIAL_PROPERTIES.map(prop => (
                <Link
                  key={prop.id}
                  to={getPropertyDetailUrl(prop)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-red-500/10 dark:hover:bg-red-500/10 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-3 group transition"
                >
                  <img src={prop.images[0]} alt={prop.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-xs text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition truncate">
                      {prop.title}
                    </h3>
                    <div className="text-[11px] text-amber-600 font-bold">
                      {prop.priceDisplay}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {prop.project} • {prop.area}m²
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 7. TIN TỨC THỊ TRƯỜNG */}
        {(activeFilter === 'all' || activeFilter === 'news') && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-emerald-500" />
                <span>Tin Tức & Bảng Giá Thị Trường ({INITIAL_NEWS.length} Bài Viết)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">/tin-tuc/:category/:articleId</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INITIAL_NEWS.map(art => (
                <Link
                  key={art.id}
                  to={getNewsDetailUrl(art)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-3 group transition"
                >
                  <img src={art.image} alt={art.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                      {art.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 block">
                      {art.publishedAt} • {art.category || 'Tin tức'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};
