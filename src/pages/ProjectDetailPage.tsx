import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, MapPin, CheckCircle2, ChevronRight, Home, 
  Layers, Filter, Sparkles, Phone, MessageCircle, ExternalLink,
  Compass, ShieldCheck, Share2, ArrowLeft
} from 'lucide-react';
import { Project, Property, Language, ProjectCategory } from '../types';
import { SEOHead } from '../components/SEOHead';
import { PropertyCard } from '../components/PropertyCard';
import { ProjectFaqHub } from '../components/ProjectFaqHub';
import { getProjectIdFromSlug, getProjectSlug, getSubdivisionUrl, getAmenityUrl, getPropertyDetailUrl } from '../lib/slugs';
import { SocialShareModal } from '../components/SocialShareModal';
import { SUBDIVISION_SEO_DATA, SubdivisionSEOInfo } from '../data/subdivisionData';

interface ProjectDetailPageProps {
  projects: Project[];
  properties: Property[];
  language: Language;
  savedIds: string[];
  onToggleSave: (property: Property) => void;
  compareIds: string[];
  onToggleCompare: (property: Property) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projects,
  properties,
  language,
  savedIds,
  onToggleSave,
  compareIds,
  onToggleCompare
}) => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();

  // Resolve project id
  const targetId = getProjectIdFromSlug(projectSlug || 'ocean-park-2');
  const project = projects.find(p => p.id === targetId || p.id === projectSlug) || projects[0];

  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'rent'>('all');
  const [showShareModal, setShowShareModal] = useState(false);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Dự án không tồn tại</h1>
        <Link to="/du-an" className="inline-block px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm">
          Xem Tất Cả Dự Án Vinhomes
        </Link>
      </div>
    );
  }

  const projectName = project.title || project.name || 'Dự án Vinhomes';

  // Safely normalize subdivisions
  const rawSubdivisions: string[] = Array.isArray(project.subdivisions) ? project.subdivisions : [];
  const normalizedSubdivisions: SubdivisionSEOInfo[] = rawSubdivisions.map(subItem => {
    if (typeof subItem === 'string') {
      const existing = SUBDIVISION_SEO_DATA[subItem];
      if (existing) return existing;
      const subId = subItem.toLowerCase().replace(/\s+/g, '-');
      return {
        id: subId,
        projectId: project.id,
        projectName: projectName,
        name: subItem.startsWith('Phân khu') ? subItem : `Phân khu ${subItem}`,
        style: 'Kiến trúc sang trọng Châu Âu / Hiện đại',
        scaleArea: '15 - 35 ha',
        totalUnits: '500 - 2.000 căn thấp tầng & cao tầng',
        productTypes: ['Nhà liền kề', 'Shophouse', 'Biệt thự Song lập', 'Khu cao tầng quy hoạch'],
        avgUnitSizes: {
          lienKe: '50m² - 120m² (Trung bình 63m², 75m², 80m²)',
          shophouse: '75m² - 150m²',
          songLap: '120m² - 200m²',
          donLap: '200m² - 400m²'
        },
        highRiseCondosInfo: 'Khu chung cư cao tầng quy hoạch tháp căn hộ cao cấp đầy đủ tiện ích.',
        priceRange: 'Liên hệ Hotline 0868.499.929 nhận báo giá chi tiết',
        description: `Phân khu ${subItem} thuộc đại dự án ${projectName} sở hữu vị trí đắc địa, hạ tầng đồng bộ và không gian sống sinh thái đẳng cấp.`,
        highlights: [
          'Hệ thống công viên nội khu rợp bóng mát & đường chạy bộ',
          'Sân thể thao đa năng, công viên trẻ em & khu nướng BBQ',
          'Kết nối giao thông trục chính nội khu siêu tốc'
        ],
        images: [project.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80']
      };
    } else {
      const subObj = subItem as any;
      return {
        id: subObj.id || 'sub-item',
        projectId: project.id,
        projectName: projectName,
        name: subObj.name || 'Phân khu Vinhomes',
        style: subObj.style || 'Hiện đại',
        scaleArea: subObj.scaleArea || '20 ha',
        totalUnits: subObj.totalUnits || '1000 căn',
        productTypes: subObj.productTypes || ['Nhà liền kề', 'Shophouse'],
        avgUnitSizes: subObj.avgUnitSizes || { lienKe: '63m² - 75m²' },
        highRiseCondosInfo: subObj.highRiseCondosInfo || 'Quy hoạch cao tầng',
        priceRange: subObj.priceRange || 'Báo giá tốt nhất',
        description: subObj.description || `Phân khu thuộc ${projectName}`,
        highlights: subObj.highlights || ['Công viên', 'Tiện ích'],
        images: subObj.images || [project.image]
      };
    }
  });

  // Filter properties belonging to this project
  const projectProperties = properties.filter(p => p.project === project.id);
  const displayedProperties = projectProperties.filter(p => {
    if (activeTab === 'sale') return p.type === 'sale';
    if (activeTab === 'rent') return p.type === 'rent';
    return true;
  });

  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={`${projectName} - Sơ Đồ Quy Hoạch & Quỹ Căn Giá Gốc`}
        description={`${projectName}. Vị trí: ${project.location}. Quy mô: ${project.areaSize || 'Quy mô lớn'}. Khám phá sơ đồ phân khu, quỹ căn biệt thự shophouse, giá bán chuyển nhượng tốt nhất.`}
        image={project.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'}
        url={shareUrl}
        keywords={`dự án ${projectName}, sơ đồ ${projectName}, quỹ căn ${project.id}, shophouse vinhomes`}
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
            <span className="text-slate-900 dark:text-white font-bold truncate">
              {projectName}
            </span>
          </nav>
        </div>
      </div>

      {/* Project Selector Bar for Seamless Navigation */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <span className="text-slate-400 shrink-0 font-extrabold uppercase text-[10px]">
              Dự Án:
            </span>
            {projects.map(p => {
              const isCurr = p.id === project.id;
              const pSlug = getProjectSlug(p.id);
              const displayName = p.name.split('-')[0].trim();
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/du-an/${pSlug}`)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isCurr
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-400/40'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{displayName}</span>
                  {isCurr && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project Hero Banner */}
      <div className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img loading="lazy"
            src={project.image}
            alt={projectName}
            className="w-full h-full object-cover opacity-35 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider">
              ĐẠI ĐÔ THỊ VINHOMES
            </span>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-emerald-400 border border-emerald-400/30 rounded-full text-xs font-bold">
              {projectProperties.length} Căn Đang Bán & Cho Thuê
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {projectName}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span>{project.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Quy mô: {project.areaSize || project.totalUnits || 'Đại đô thị'}</span>
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="ml-auto px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia Sẻ Dự Án</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subdivisions List */}
      {normalizedSubdivisions.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                <span>Các Phân Khu Trọng Điểm Tại Dự Án</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bấm vào từng phân khu để xem chi tiết vị trí, bảng hàng và sơ đồ căn
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {normalizedSubdivisions.map(sub => (
              <div
                key={sub.id}
                onClick={() => navigate(getSubdivisionUrl(project.id, sub.id || sub.name))}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-md hover:shadow-xl transition cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden relative bg-slate-950">
                  <img loading="lazy"
                    src={sub.images && sub.images[0] ? sub.images[0] : project.image}
                    alt={sub.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-slate-950/80 text-emerald-400 font-black text-[10px] rounded-full backdrop-blur-sm">
                    {sub.productTypes && sub.productTypes.length > 0 ? sub.productTypes[0] : 'Phân khu VIP'}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {sub.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border-t border-slate-100 dark:border-slate-800">
                    <span>Xem sơ đồ & thông số</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities Section with Dedicated Links */}
      {project.amenities && project.amenities.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Chuỗi Tiện Ích Đẳng Cấp Dự Án</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nhấp vào từng tiện ích để xem bài viết phân tích quy mô & trải nghiệm chi tiết
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {project.amenities.map((amenity, idx) => (
              <div
                key={idx}
                onClick={() => navigate(getAmenityUrl(project.id, amenity))}
                className="group p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                    {amenity}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 shrink-0 transition" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Inventory Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Quỹ Căn BĐS Mới Nhất Tại {projectName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tổng hợp {displayedProperties.length} căn hộ, shophouse, liền kề & biệt thự có giá chuyển nhượng tốt nhất
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Tất Cả ({projectProperties.length})
            </button>
            <button
              onClick={() => setActiveTab('sale')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'sale' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Cần Bán ({projectProperties.filter(p => p.type === 'sale').length})
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'rent' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Cho Thuê ({projectProperties.filter(p => p.type === 'rent').length})
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
                onSelect={(selected) => navigate(`/${getProjectSlug(selected.project)}/${selected.id}`)}
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
              Chưa có căn phù hợp trong danh mục này
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Quý khách vui lòng chuyển qua tab "Tất Cả" hoặc liên hệ Hotline Chuyên viên tư vấn 0868.499.929 để nhận bảng hàng độc quyền nội bộ.
            </p>
          </div>
        )}
      </div>

      {/* FAQ Hub for this project */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProjectFaqHub 
          projectId={project.id}
          onOpenPostModal={() => navigate('/dang-tin')}
        />
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={`Khám phá quy hoạch & bảng hàng ${projectName}`}
          shareUrl={shareUrl}
          summary={project.description}
          imageUrl={project.image}
        />
      )}
    </div>
  );
};
