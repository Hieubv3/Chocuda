import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, MapPin, CheckCircle2, ChevronRight, Home, 
  Layers, Sparkles, Phone, MessageCircle, ExternalLink,
  Compass, ShieldCheck, Share2, ArrowLeft, Info, DollarSign,
  Maximize2, Award, FileText
} from 'lucide-react';
import { Project, Property, Language } from '../types';
import { SEOHead } from '../components/SEOHead';
import { PropertyCard } from '../components/PropertyCard';
import { ProjectFaqHub } from '../components/ProjectFaqHub';
import { SocialShareModal } from '../components/SocialShareModal';
import { SUBDIVISION_SEO_DATA, SubdivisionSEOInfo } from '../data/subdivisionData';
import { getProjectIdFromSlug, getProjectSlug, getPropertyDetailUrl } from '../lib/slugs';

interface SubdivisionDetailPageProps {
  projects: Project[];
  properties: Property[];
  language: Language;
  savedIds: string[];
  onToggleSave: (property: Property) => void;
  compareIds: string[];
  onToggleCompare: (property: Property) => void;
}

export const SubdivisionDetailPage: React.FC<SubdivisionDetailPageProps> = ({
  projects,
  properties,
  language,
  savedIds,
  onToggleSave,
  compareIds,
  onToggleCompare
}) => {
  const { projectSlug, subdivisionSlug } = useParams<{ projectSlug?: string; subdivisionSlug?: string }>();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'rent'>('all');

  // Resolve target project
  const targetProjectId = projectSlug ? getProjectIdFromSlug(projectSlug) : undefined;
  const project = projects.find(p => p.id === targetProjectId || p.id === projectSlug) || projects[0];

  // Resolve subdivision info from preset data or dynamic fallback
  const subdivision = useMemo<SubdivisionSEOInfo>(() => {
    const rawSubSlug = subdivisionSlug || '';
    const cleanSubSlug = decodeURIComponent(rawSubSlug).toLowerCase().trim();

    // 1. Direct key match in SUBDIVISION_SEO_DATA
    for (const [key, data] of Object.entries(SUBDIVISION_SEO_DATA)) {
      if (
        data.id === cleanSubSlug || 
        key.toLowerCase() === cleanSubSlug ||
        data.name.toLowerCase().includes(cleanSubSlug) ||
        cleanSubSlug.includes(data.id)
      ) {
        return data;
      }
    }

    // 2. Format a clean name from the slug
    const formattedName = rawSubSlug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const projectName = project?.name || 'Vinhomes';

    return {
      id: cleanSubSlug,
      projectId: project?.id || 'ocean-park-2',
      projectName: projectName,
      name: formattedName.startsWith('Phân Khu') || formattedName.startsWith('Phân khu') ? formattedName : `Phân khu ${formattedName}`,
      style: 'Kiến trúc sang trọng Châu Âu & Đông Dương tân cổ điển',
      scaleArea: '20 - 35 ha',
      totalUnits: '800 - 2.200 căn thấp tầng & cao tầng',
      productTypes: ['Nhà liền kề', 'Shophouse thương mại', 'Biệt thự Song lập', 'Biệt thự Đơn lập', 'Khu chung cư cao tầng quy hoạch'],
      avgUnitSizes: {
        lienKe: '48m² - 120m² (Trung bình 63m², 70m², 80m²)',
        shophouse: '75m² - 160m² (Mặt tiền rộng kinh doanh thuận tiện)',
        songLap: '120m² - 200m² (Xây 4 tầng, hoàn thiện mặt ngoài)',
        donLap: '200m² - 450m² (Vị trí góc công viên view hồ)'
      },
      highRiseCondosInfo: project?.id === 'ha-long-xanh' || project?.id === 'green-paradise-can-gio' || project?.id === 'tan-my-hau-nghia'
        ? 'Chung cư cao tầng: Đang cập nhật quy hoạch chi tiết các tòa tháp từ Chủ đầu tư Vingroup.'
        : 'Cụm chung cư cao tầng quy hoạch các tòa tháp căn hộ Masterise Lumiere / Sol Forest / Sapphire cao 25-30 tầng đầy đủ các loại căn Studio, 1PN, 2PN, 3PN.',
      priceRange: 'Liền kề từ 5.5 tỷ | Shophouse từ 8.5 tỷ | Biệt thự từ 14 tỷ | Căn hộ từ 1.8 tỷ',
      description: `Phân khu ${formattedName} thuộc siêu đô thị ${projectName}, sở hữu vị trí chiến lược, không gian sống xanh chuẩn nghỉ dưỡng cùng hạ tầng tiện ích đẳng cấp quốc tế.`,
      highlights: [
        'Hệ thống công viên nội khu rợp bóng mát, sân chơi trẻ em & khu thể thao ngoài trời',
        'Kết nối giao thông thuận tiện ra các trục đường chính và tiện ích biểu tượng',
        'Môi trường sống an ninh an toàn 24/7 với ban quản lý Vinhomes chuyên nghiệp',
        'Tiềm năng gia tăng giá trị bền vững và thanh khoản chuyển nhượng cao'
      ],
      images: [
        project?.image || ''
      ]
    };
  }, [subdivisionSlug, project]);

  // Filter properties belonging to this project and subdivision
  const subdivisionProperties = useMemo(() => {
    const subNameClean = subdivision.name.toLowerCase().replace('phân khu', '').trim();
    return properties.filter(p => {
      const matchProject = p.project === subdivision.projectId || (project && p.project === project.id);
      if (!matchProject) return false;

      // Match subdivision name
      if (p.subdivision) {
        const pSubClean = p.subdivision.toLowerCase().replace('phân khu', '').trim();
        if (pSubClean.includes(subNameClean) || subNameClean.includes(pSubClean)) return true;
      }

      // Check title or address as fallback
      const textToSearch = `${p.title} ${p.address}`.toLowerCase();
      return textToSearch.includes(subNameClean);
    });
  }, [properties, subdivision, project]);

  const displayedProperties = useMemo(() => {
    return subdivisionProperties.filter(p => {
      if (activeTab === 'sale') return p.type === 'sale';
      if (activeTab === 'rent') return p.type === 'rent';
      return true;
    });
  }, [subdivisionProperties, activeTab]);

  const currentProjectSlug = getProjectSlug(subdivision.projectId || project?.id || 'ocean-park-2');
  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={`${subdivision.name} - ${subdivision.projectName} | Sơ Đồ & Quỹ Căn Giá Gốc`}
        description={`${subdivision.name} thuộc ${subdivision.projectName}. Quy mô: ${subdivision.scaleArea}. Số lượng: ${subdivision.totalUnits}. ${subdivision.description.substring(0, 160)}`}
        image={subdivision.images[0] || project?.image || ''}
        url={shareUrl}
        keywords={`${subdivision.name}, ${subdivision.projectName}, bán căn hộ ${subdivision.name}, liền kề ${subdivision.name}, shophouse ${subdivision.name}`}
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
              {subdivision.projectName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate">
              {subdivision.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img loading="lazy"
            src={subdivision.images[0] || project?.image}
            alt={subdivision.name}
            className="w-full h-full object-cover opacity-30 filter brightness-90"
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
              <span>Dự án {subdivision.projectName}</span>
            </Link>
            <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider">
              PHÂN KHU TRỌNG ĐIỂM
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              {subdivisionProperties.length} Căn Đang Giao Dịch
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {subdivision.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            {subdivision.description}
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
              <span>Tư Vấn Zalo 24/7</span>
            </a>

            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer border border-slate-700"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia Sẻ Phân Khu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Kiến trúc thiết kế</span>
            <span className="text-base font-black text-slate-900 dark:text-white line-clamp-1">{subdivision.style}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Quy mô diện tích</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{subdivision.scaleArea}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Số lượng sản phẩm</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{subdivision.totalUnits}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Khoảng giá chuyển nhượng</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">{subdivision.priceRange}</span>
          </div>
        </div>

        {/* 2-Column Specs & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Details & Unit Sizes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Unit Sizes Breakdown Card */}
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-emerald-500" />
                  <span>Cơ Cấu Diện Tích Trung Bình Các Loại Căn</span>
                </h3>
                <span className="text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg">
                  Thông Số Chuẩn CĐT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {subdivision.avgUnitSizes.lienKe && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase text-[10px]">
                      Nhà Liền Kề
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {subdivision.avgUnitSizes.lienKe}
                    </span>
                  </div>
                )}

                {subdivision.avgUnitSizes.shophouse && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase text-[10px]">
                      Shophouse Thương Mại
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {subdivision.avgUnitSizes.shophouse}
                    </span>
                  </div>
                )}

                {subdivision.avgUnitSizes.songLap && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase text-[10px]">
                      Biệt Thự Song Lập
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {subdivision.avgUnitSizes.songLap}
                    </span>
                  </div>
                )}

                {subdivision.avgUnitSizes.donLap && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase text-[10px]">
                      Biệt Thự Đơn Lập
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {subdivision.avgUnitSizes.donLap}
                    </span>
                  </div>
                )}
              </div>

              {/* High-Rise Condos Info */}
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    Quy Hoạch Cụm Chung Cư Cao Tầng Tại Phân Khu
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {subdivision.highRiseCondosInfo}
                </p>
              </div>
            </div>

            {/* Photo Gallery */}
            {subdivision.images.length > 0 && (
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Hình Ảnh Thực Tế & Thiết Kế Phân Khu</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subdivision.images.map((imgUrl, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden aspect-[16/10] bg-slate-950 relative border border-slate-200 dark:border-slate-700">
                      <img loading="lazy" src={imgUrl} alt={`${subdivision.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Col: Highlights & Contact CTA */}
          <div className="space-y-6">
            
            {/* Highlights Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Điểm Nhấn Vượt Trội</span>
              </h3>
              <ul className="space-y-3 text-xs">
                {subdivision.highlights.map((hl, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {hl}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Types Pill Box */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Các Loại Sản Phẩm Phát Triển
              </h4>
              <div className="flex flex-wrap gap-2">
                {subdivision.productTypes.map((pt, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {pt}
                  </span>
                ))}
              </div>
            </div>

            {/* Post Listing CTA */}
            <div className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-3xl shadow-xl space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-950 text-white rounded-md">
                  Chính Chủ Đăng Tin
                </span>
                <h4 className="text-lg font-black leading-snug">
                  Bạn Đang Sở Hữu BĐS Tại {subdivision.name}?
                </h4>
                <p className="text-xs text-slate-900 font-medium leading-relaxed">
                  Đăng tin bán hoặc cho thuê miễn phí trên Chợ Cư Dân 24H để tiếp cận hàng ngàn khách mua & thuê thực tế!
                </p>
              </div>

              <Link
                to="/dang-tin"
                className="block w-full text-center py-3 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition"
              >
                ĐĂNG TIN CĂN HỘ / NHÀ PHỐ NGAY
              </Link>
            </div>

          </div>

        </div>

        {/* Realtime Property Inventory in this Subdivision */}
        <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Quỹ Căn Đang Bán & Cho Thuê Tại {subdivision.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tìm thấy {displayedProperties.length} căn hộ, shophouse, liền kề & biệt thự giá tốt
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeTab === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Tất Cả ({subdivisionProperties.length})
              </button>
              <button
                onClick={() => setActiveTab('sale')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeTab === 'sale' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Cần Bán ({subdivisionProperties.filter(p => p.type === 'sale').length})
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeTab === 'rent' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Cho Thuê ({subdivisionProperties.filter(p => p.type === 'rent').length})
              </button>
            </div>
          </div>

          {displayedProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayedProperties.map(p => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  language={language}
                  onSelect={(selected) => navigate(getPropertyDetailUrl(selected))}
                  isSaved={savedIds.includes(p.id)}
                  onToggleSave={onToggleSave}
                  isCompared={compareIds.includes(p.id)}
                  onToggleCompare={onToggleCompare}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-black text-base text-slate-800 dark:text-slate-200">
                Chưa có căn phù hợp tại {subdivision.name}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Quý khách có thể xem các phân khu lân cận hoặc liên hệ Hotline 0868.499.929 để nhận bảng hàng độc quyền nội bộ.
              </p>
              <div className="pt-2">
                <Link
                  to={`/du-an/${currentProjectSlug}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow"
                >
                  <span>Xem Toàn Bộ Dự Án {subdivision.projectName}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Project FAQ */}
        <div className="pt-4">
          <ProjectFaqHub 
            projectId={subdivision.projectId}
            onOpenPostModal={() => navigate('/dang-tin')}
          />
        </div>

      </div>

      {/* Share Modal */}
      {showShareModal && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={`Khám phá quy hoạch & bảng hàng ${subdivision.name}`}
          shareUrl={shareUrl}
          summary={subdivision.description}
          imageUrl={subdivision.images[0]}
        />
      )}
    </div>
  );
};
