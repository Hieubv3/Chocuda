import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, MapPin, CheckCircle2, ChevronRight, Home, 
  Layers, Filter, Sparkles, Phone, MessageCircle, ExternalLink,
  Compass, ShieldCheck, Share2
} from 'lucide-react';
import { Project, Property, Language, ProjectCategory } from '../types';
import { SEOHead } from '../components/SEOHead';
import { PropertyCard } from '../components/PropertyCard';
import { SubdivisionDetailModal } from '../components/SubdivisionDetailModal';
import { ProjectFaqHub } from '../components/ProjectFaqHub';
import { getProjectIdFromSlug, getProjectSlug } from '../lib/slugs';
import { SocialShareModal } from '../components/SocialShareModal';

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
  const [selectedSubdivision, setSelectedSubdivision] = useState<any | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-black">Dự án không tồn tại</h1>
        <Link to="/du-an" className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm">
          Xem Tất Cả Dự Án
        </Link>
      </div>
    );
  }

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
        title={`${project.title} - Sơ Đồ Quy Hoạch & Quỹ Căn Giá Gốc`}
        description={`${project.title}. Vị trí: ${project.location}. Quy mô: ${project.scale}. Khám phá sơ đồ phân khu, quỹ căn biệt thự shophouse, giá bán chuyển nhượng tốt nhất.`}
        image={project.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'}
        url={shareUrl}
        keywords={`dự án ${project.title}, sơ đồ ${project.title}, quỹ căn ${project.id}, shophouse vinhomes`}
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
              {project.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Project Hero Banner */}
      <div className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={project.image}
            alt={project.title}
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
            {project.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{project.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Quy mô: {project.scale}</span>
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
      {project.subdivisions && project.subdivisions.length > 0 && (
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
            {project.subdivisions.map(sub => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubdivision(sub)}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-md hover:shadow-xl transition cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden relative bg-slate-950">
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-slate-950/80 text-emerald-400 font-black text-[10px] rounded-full backdrop-blur-sm">
                    {sub.propertiesCount || 'Quỹ căn VIP'}
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
                    <span>Xem bảng hàng</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
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
              Quỹ Căn BĐS Mới Nhất Tại {project.title}
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
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              Hiện chưa có căn nào trong mục này
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Chủ nhà hoặc môi giới có thể bấm đăng tin để đưa quỹ căn lên phân khu {project.title}.
            </p>
            <Link
              to="/dang-tin"
              className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
            >
              Đăng Tin BĐS Lên Dự Án Này
            </Link>
          </div>
        )}

      </div>

      {/* Project FAQs Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectFaqHub
          selectedProjectId={project.id as ProjectCategory}
          onSelectProject={() => {}}
        />
      </div>

      {/* Subdivision Modal */}
      {selectedSubdivision && (
        <SubdivisionDetailModal
          subdivision={selectedSubdivision}
          onClose={() => setSelectedSubdivision(null)}
          onViewProperties={() => {
            setSelectedSubdivision(null);
          }}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <SocialShareModal
          title={project.title}
          url={shareUrl}
          price={project.scale}
          location={project.location}
          imageUrl={project.image}
          onClose={() => setShowShareModal(false)}
        />
      )}

    </div>
  );
};
