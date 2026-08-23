import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, MapPin, CheckCircle2, ChevronRight, Home, 
  Sparkles, Phone, MessageCircle, ArrowLeft, Award, 
  Share2, Maximize2, ShieldCheck, Compass, Info
} from 'lucide-react';
import { Project, Property, Language } from '../types';
import { SEOHead } from '../components/SEOHead';
import { PropertyCard } from '../components/PropertyCard';
import { ProjectFaqHub } from '../components/ProjectFaqHub';
import { SocialShareModal } from '../components/SocialShareModal';
import { AMENITY_SEO_DATA, AmenitySEOInfo } from '../data/subdivisionData';
import { getProjectIdFromSlug, getProjectSlug, slugify } from '../lib/slugs';

interface AmenityDetailPageProps {
  projects: Project[];
  properties: Property[];
  language: Language;
  savedIds: string[];
  onToggleSave: (property: Property) => void;
  compareIds: string[];
  onToggleCompare: (property: Property) => void;
}

export const AmenityDetailPage: React.FC<AmenityDetailPageProps> = ({
  projects,
  properties,
  language,
  savedIds,
  onToggleSave,
  compareIds,
  onToggleCompare
}) => {
  const { projectSlug, amenitySlug } = useParams<{ projectSlug?: string; amenitySlug?: string }>();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  // Resolve target project
  const targetProjectId = projectSlug ? getProjectIdFromSlug(projectSlug) : undefined;
  const project = projects.find(p => p.id === targetProjectId || p.id === projectSlug) || projects[0];

  // Resolve amenity info from AMENITY_SEO_DATA or dynamic fallback
  const amenity = useMemo<AmenitySEOInfo>(() => {
    const rawSlug = amenitySlug || '';
    const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim();

    // 1. Match in AMENITY_SEO_DATA by key or id
    for (const [key, data] of Object.entries(AMENITY_SEO_DATA)) {
      if (
        data.id === cleanSlug || 
        key.toLowerCase() === cleanSlug ||
        slugify(data.name) === cleanSlug ||
        slugify(key) === cleanSlug ||
        cleanSlug.includes(data.id) ||
        data.name.toLowerCase().includes(cleanSlug)
      ) {
        return data;
      }
    }

    // 2. Format clean title from slug
    const formattedTitle = rawSlug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const projectName = project?.name || 'Vinhomes';

    return {
      id: cleanSlug,
      name: formattedTitle,
      projectId: project?.id || 'ocean-park-2',
      scale: 'Quy mô quốc tế đẳng cấp đại đô thị',
      category: 'Tiện ích cao cấp 5 sao',
      status: 'Đang vận hành phục vụ cư dân',
      summary: `Hạng mục ${formattedTitle} là điểm nhấn tiện ích vượt trội gia tăng chất lượng sống chuẩn nghỉ dưỡng cho cư dân tại ${projectName}.`,
      contentSEO: `
Hạng mục **${formattedTitle}** được Tập đoàn Vingroup đầu tư bài bản với thiết kế hiện đại, đạt tiêu chuẩn quốc tế.

Đây là công trình biểu tượng góp phần tạo nên giá trị bất động sản gia tăng bền vững cho toàn bộ siêu đô thị.
      `,
      highlights: [
        'Phục vụ hoàn toàn miễn phí hoặc ưu đãi đặc quyền cho cư dân Vinhomes',
        'Đội ngũ quản lý vận hành chuyên nghiệp bởi Vinhomes',
        'Cảnh quan check-in sinh thái xanh mát rợp bóng cây',
        'Hạ tầng an ninh bảo vệ an toàn 24/7'
      ],
      image: project?.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
    };
  }, [amenitySlug, project]);

  // Project properties for cross-promotion
  const relatedProperties = useMemo(() => {
    return properties.filter(p => p.project === amenity.projectId || (project && p.project === project.id)).slice(0, 4);
  }, [properties, amenity, project]);

  const currentProjectSlug = getProjectSlug(amenity.projectId || project?.id || 'ocean-park-2');
  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={`${amenity.name} - ${project?.name || 'Vinhomes'} | Tiện Ích Đẳng Cấp`}
        description={`${amenity.name}. Phân loại: ${amenity.category}. Quy mô: ${amenity.scale}. ${amenity.summary.substring(0, 160)}`}
        image={amenity.image || project?.image}
        url={shareUrl}
        keywords={`${amenity.name}, tiện ích ${project?.name}, vinhomes, ${amenity.category}`}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap gap-1.5">
            <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to="/du-an" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Dự Án Vinhomes
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to={`/du-an/${currentProjectSlug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 truncate max-w-[180px]">
              {project?.name || 'Dự án'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate">
              {amenity.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={amenity.image || project?.image}
            alt={amenity.name}
            className="w-full h-full object-cover opacity-35 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/du-an/${currentProjectSlug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dự án {project?.name}</span>
            </Link>
            <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider">
              {amenity.category}
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              {amenity.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {amenity.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed font-medium">
            {amenity.summary}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="tel:0868499929"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              <Phone className="w-4 h-4" />
              <span>Hotline Tư Vấn: 0868.499.929</span>
            </a>

            <a
              href="https://zalo.me/0868499929"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Nhận Thông Tin Trải Nghiệm Qua Zalo</span>
            </a>

            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer border border-slate-700"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia Sẻ Bài Viết</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Quick Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Phân loại tiện ích</span>
            <span className="text-base font-black text-slate-900 dark:text-white line-clamp-1">{amenity.category}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Quy mô đầu tư</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{amenity.scale}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Tình trạng vận hành</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{amenity.status}</span>
          </div>
        </div>

        {/* 2 Columns: Detailed Content & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Main Article Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Box */}
            {amenity.image && (
              <div className="rounded-3xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg relative">
                <img
                  src={amenity.image}
                  alt={amenity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold text-white">
                  📍 {project?.name}
                </div>
              </div>
            )}

            {/* Markdown Content */}
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Chi Tiết Quy Hoạch & Trải Nghiệm Tiện Ích</span>
              </h2>

              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {amenity.contentSEO}
              </div>
            </div>

          </div>

          {/* Right Col: Highlights & CTAs */}
          <div className="space-y-6">
            
            {/* Highlights Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Đặc Quyền Cư Dân</span>
              </h3>
              <ul className="space-y-3 text-xs">
                {amenity.highlights.map((hl, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {hl}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Project Quick Link */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md">
                  Về Dự Án
                </span>
                <h4 className="text-lg font-black leading-snug">
                  {project?.name}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {project?.location}
                </p>
              </div>

              <Link
                to={`/du-an/${currentProjectSlug}`}
                className="block w-full text-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition"
              >
                XEM TOÀN BỘ QUY HOẠCH DỰ ÁN
              </Link>
            </div>

            {/* Post Listing CTA */}
            <div className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-3xl shadow-xl space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-black leading-snug">
                  Bạn Muốn Sở Hữu Căn Hộ Gần {amenity.name}?
                </h4>
                <p className="text-xs text-slate-900 font-medium leading-relaxed">
                  Liên hệ ngay Hotline 0868.499.929 để nhận danh sách quỹ căn view trực diện đẹp nhất và chính sách giá gốc CĐT.
                </p>
              </div>

              <a
                href="tel:0868499929"
                className="block w-full text-center py-3 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition"
              >
                GỌI HOTLINE 0868.499.929
              </a>
            </div>

          </div>

        </div>

        {/* Realtime Property Inventory in this Project */}
        {relatedProperties.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Quỹ Căn Bán & Cho Thuê Gần {amenity.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Các căn hộ, liền kề & shophouse nổi bật tại {project?.name}
                </p>
              </div>

              <Link
                to={`/du-an/${currentProjectSlug}`}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProperties.map(p => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  language={language}
                  onSelect={(selected) => navigate(`/${getProjectSlug(selected.project)}/${selected.id}`)}
                  isSaved={savedIds.includes(p.id)}
                  onToggleSave={onToggleSave}
                  isCompared={compareIds.includes(p.id)}
                  onToggleCompare={onToggleCompare}
                />
              ))}
            </div>
          </div>
        )}

        {/* Project FAQ */}
        <div className="pt-4">
          <ProjectFaqHub 
            projectId={amenity.projectId || project?.id}
            onOpenPostModal={() => navigate('/dang-tin')}
          />
        </div>

      </div>

      {/* Share Modal */}
      {showShareModal && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={`Khám phá tiện ích ${amenity.name} - ${project?.name}`}
          shareUrl={shareUrl}
          summary={amenity.summary}
          imageUrl={amenity.image}
        />
      )}
    </div>
  );
};
