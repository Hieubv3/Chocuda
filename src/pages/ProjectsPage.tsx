import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Building2, CheckCircle2, ChevronRight, Layers, Award, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { Project, ProjectCategory, Language, Property, isAdminProperty } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { getProjectSlug, getSubdivisionUrl, getAmenityUrl, getPropertyDetailUrl } from '../lib/slugs';

interface ProjectsPageProps {
  projects: Project[];
  language: Language;
  selectedProjectId?: ProjectCategory;
  onFilterPropertiesByProject: (projectId: ProjectCategory) => void;
  properties?: Property[];
  onSelectProperty?: (property: Property) => void;
  savedIds?: string[];
  onToggleSave?: (property: Property) => void;
  compareIds?: string[];
  onToggleCompare?: (property: Property) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  language,
  selectedProjectId,
  onFilterPropertiesByProject,
  properties = [],
  onSelectProperty,
  savedIds = [],
  onToggleSave,
  compareIds = [],
  onToggleCompare
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProjectCategory>(selectedProjectId || 'ocean-park-2');

  const currentProject = projects.find(p => p.id === activeTab) || projects[0];

  // Quy định: Các căn bán trong phần dự án chỉ hiển thị căn bán và cho thuê của admin và admin tổng đăng (các đối tác khác không hiển thị)
  const adminProjectProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    return properties.filter(p => 
      p.project === currentProject.id && 
      (p.approved || p.status === 'approved') &&
      isAdminProperty(p)
    );
  }, [properties, currentProject.id]);

  const handleSubdivisionClick = (subName: string) => {
    navigate(getSubdivisionUrl(currentProject.id, subName));
  };

  const handleAmenityClick = (amenityTitle: string) => {
    navigate(getAmenityUrl(currentProject.id, amenityTitle));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
          GIỚI THIỆU DỰ ÁN TRỌNG ĐIỂM
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          VINHOMES OCEAN PARK 2, 3 & HẠ LONG XANH
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Hệ thống Siêu đại đô thị biển đẳng cấp hàng đầu Việt Nam do Tập đoàn Vingroup làm Chủ đầu tư.
        </p>
      </div>

      {/* Project Selector Tabs - Responsive Rectangular Columns */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-black">
            🏛️ DANH SÁCH DỰ ÁN DẠNG CỘT HỘP CHỮ NHẬT ({projects.length}):
          </span>
          <span className="text-[11px] text-amber-500 font-extrabold hidden sm:inline">
            Click chọn xem chi tiết & sơ đồ từng dự án
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 p-2.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
          {projects.map((p) => {
            const isSelected = activeTab === p.id;
            const displayName = p.name.split('-')[0].trim();
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center text-center border min-h-[48px] relative group cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg ring-2 ring-amber-400/50 scale-[1.02] z-10'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-md'
                }`}
              >
                <span className="line-clamp-2 leading-tight">
                  {displayName}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 mt-1 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Project Detail Breakdown */}
      {currentProject && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Main Visual Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl aspect-[21/9] max-h-[420px]">
            <img
              src={currentProject.image}
              alt={currentProject.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="bg-amber-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-lg">
                {currentProject.status}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black">{currentProject.name}</h2>
              <p className="text-xs sm:text-sm text-slate-200 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-amber-400 shrink-0" />
                {currentProject.location}
              </p>
            </div>
          </div>

          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Quy mô tổng thể</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{currentProject.areaSize}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Số lượng sản phẩm</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{currentProject.totalUnits}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Khoảng giá giao dịch</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">{currentProject.priceRange}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Trạng thái hạ tầng</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{currentProject.status}</span>
            </div>
          </div>

          {/* Subdivisions & Amenities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Subdivisions Box */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-amber-500 flex items-center">
                  <Layers className="w-5 h-5 mr-2" />
                  DANH SÁCH PHÂN KHU (CLICK ĐỌC CHI TIẾT SEO)
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded">
                  Chỉ Cần Click Căn
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nhấp vào từng phân khu bên dưới để xem bài viết chi tiết chuẩn SEO về quy mô, diện tích trung bình các căn và khu chung cư cao tầng:
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {currentProject.subdivisions.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubdivisionClick(sub)}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 hover:from-amber-500 hover:to-amber-600 text-slate-900 dark:text-amber-300 hover:text-slate-950 rounded-xl border border-amber-500/30 hover:border-amber-500 transition shadow-sm flex items-center gap-1.5 group"
                  >
                    <span>Phân khu {sub}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-slate-950 transition" />
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Box */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-amber-500 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  TIỆN ÍCH ĐẲNG CẤP (CLICK XEM BÀI VIẾT)
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded">
                  Bài Viết Đầy Đủ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nhấp vào tiện ích bên dưới để đọc bài viết đánh giá chi tiết quy mô & đặc quyền cư dân:
              </p>
              <div className="space-y-2 text-xs">
                {currentProject.amenities.map((amenity, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAmenityClick(amenity)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-amber-500/10 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition">
                        {amenity}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 shrink-0 transition" />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Masterplan Map Section */}
          <div className="p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl space-y-4 text-center">
            <h3 className="text-xl font-black text-amber-400">
              SƠ ĐỒ MẶT BẰNG QUY HOẠCH TỔNG THỂ {currentProject.name.toUpperCase()}
            </h3>
            <div className="rounded-2xl overflow-hidden border border-slate-700 max-h-96">
              <img
                src={currentProject.masterplanUrl}
                alt="Masterplan"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/du-an/${getProjectSlug(currentProject.id)}`}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-xl inline-flex items-center space-x-2"
              >
                <span>Xem Trang Chi Tiết {currentProject.name}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => onFilterPropertiesByProject(currentProject.id)}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-xl inline-flex items-center space-x-2"
              >
                <span>Xem Toàn Bộ Quỹ Căn Bán / Thuê ({adminProjectProperties.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admin & Admin Tổng Properties Section */}
          <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-purple-500/10 p-5 rounded-3xl border border-amber-500/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    QUỸ CĂN BÁN & CHO THUÊ CHÍNH CHỦ ADMIN / ADMIN TỔNG — {currentProject.name.toUpperCase()}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Chỉ hiển thị thông tin căn bán và cho thuê do Admin và Admin Tổng đăng trực tiếp. (Thông tin từ các đối tác khác không hiển thị tại mục Dự án).
                </p>
              </div>
              <span className="shrink-0 text-xs font-black bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {adminProjectProperties.length} Căn Đang Mở Bán/Thuê
              </span>
            </div>

            {adminProjectProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminProjectProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    language={language}
                    onSelect={onSelectProperty || (() => {})}
                    isSaved={savedIds?.includes(property.id) || false}
                    onToggleSave={onToggleSave || (() => {})}
                    isCompared={compareIds?.includes(property.id) || false}
                    onToggleCompare={onToggleCompare || (() => {})}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center space-y-3 border border-slate-200 dark:border-slate-700">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Chưa có căn bán hoặc cho thuê nào do Admin / Admin Tổng đăng trực tiếp tại dự án này.
                </p>
                <p className="text-[11px] text-slate-400">
                  (Mục dự án quy định chỉ hiển thị tin chính chủ Admin & Admin Tổng đăng, tự động ẩn các tin từ đối tác khác)
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
