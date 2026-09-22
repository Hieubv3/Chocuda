import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Hash, Search, Building2, Wrench, Briefcase, FileText, 
  ChevronRight, ExternalLink, Sparkles, MapPin, Tag, ArrowRight
} from 'lucide-react';
import { Property, NewsArticle, ProjectCategory } from '../types';
import { ResidentServiceItem } from '../data/residentServicesData';
import { RecruitmentJob } from '../types';
import { getPropertyDetailUrl, getNewsDetailUrl, getServiceDetailUrl, getJobDetailUrl } from '../lib/slugs';

interface HashtagExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTag?: string;
  properties?: Property[];
  services?: ResidentServiceItem[];
  newsArticles?: NewsArticle[];
  jobs?: RecruitmentJob[];
}

export const HashtagExploreModal: React.FC<HashtagExploreModalProps> = ({
  isOpen,
  onClose,
  initialTag = '',
  properties = [],
  services = [],
  newsArticles = [],
  jobs = []
}) => {
  const navigate = useNavigate();
  const [currentTag, setCurrentTag] = useState<string>(initialTag.replace('#', '').trim());
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'properties' | 'services' | 'jobs' | 'news'>('all');

  useEffect(() => {
    if (initialTag) {
      setCurrentTag(initialTag.replace('#', '').trim());
    }
  }, [initialTag]);

  // Suggested popular hashtags across platform
  const popularHashtags = [
    'ocean_park_2', 'ocean_park_3', 'smart_city', 'grand_park',
    'shophouse', 'can_ho', 'cat_lo', 'cho_thue', 'dien_nuoc',
    'am_thuc', 'sua_nha', 'tuyen_dung', 'tim_viec', 'noi_that'
  ];

  const searchKeyword = currentTag.toLowerCase().trim();

  // Matched Properties
  const matchedProperties = useMemo(() => {
    if (!searchKeyword) return properties.slice(0, 8);
    return properties.filter(p => 
      p.title.toLowerCase().includes(searchKeyword) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchKeyword))) ||
      p.category.toLowerCase().includes(searchKeyword) ||
      p.project.toLowerCase().includes(searchKeyword) ||
      p.subdivision.toLowerCase().includes(searchKeyword) ||
      p.description.toLowerCase().includes(searchKeyword)
    );
  }, [properties, searchKeyword]);

  // Matched Services
  const matchedServices = useMemo(() => {
    if (!searchKeyword) return services.slice(0, 8);
    return services.filter(s => 
      s.title.toLowerCase().includes(searchKeyword) ||
      s.categoryId.toLowerCase().includes(searchKeyword) ||
      s.project.toLowerCase().includes(searchKeyword) ||
      s.description.toLowerCase().includes(searchKeyword)
    );
  }, [services, searchKeyword]);

  // Matched Jobs
  const matchedJobs = useMemo(() => {
    if (!searchKeyword) return jobs.slice(0, 8);
    return jobs.filter(j => 
      j.title.toLowerCase().includes(searchKeyword) ||
      j.industry.toLowerCase().includes(searchKeyword) ||
      j.companyName.toLowerCase().includes(searchKeyword) ||
      j.description.toLowerCase().includes(searchKeyword)
    );
  }, [jobs, searchKeyword]);

  // Matched News
  const matchedNews = useMemo(() => {
    if (!searchKeyword) return newsArticles.slice(0, 8);
    return newsArticles.filter(n => 
      n.title.toLowerCase().includes(searchKeyword) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(searchKeyword))) ||
      n.summary.toLowerCase().includes(searchKeyword)
    );
  }, [newsArticles, searchKeyword]);

  const totalResults = matchedProperties.length + matchedServices.length + matchedJobs.length + matchedNews.length;

  if (!isOpen) return null;

  const handleNavigate = (url: string) => {
    onClose();
    navigate(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-brand-900 via-ink-900 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-brand-500/20 border border-brand-400/30 rounded-2xl text-brand-400">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-brand-500/30 text-brand-200 font-black text-[10px] rounded-full uppercase tracking-wider">
                  TÌM KIẾM THEO HASHTAG
                </span>
                <span className="text-xs text-brand-400 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> #{currentTag || 'toan_san'} ({totalResults} kết quả)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                KHÁM PHÁ BÀI VIẾT & DỊCH VỤ LIÊN QUAN
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hashtag Search Input & Popular Hashtags */}
        <div className="p-4 bg-ink-50 dark:bg-ink-800/60 border-b border-ink-200 dark:border-ink-800 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value.replace('#', ''))}
              placeholder="Nhập hashtag hoặc từ khóa cần tìm kiếm (vd: ocean_park_2, shophouse, dien_nuoc...)"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
          </div>

          {/* Popular Hashtags Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-ink-400 shrink-0">Gợi ý:</span>
            {popularHashtags.map(tag => (
              <button
                key={tag}
                onClick={() => setCurrentTag(tag)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 border cursor-pointer ${
                  currentTag === tag
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-700 hover:border-brand-400'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setActiveTypeTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTypeTab === 'all'
                  ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-black'
                  : 'bg-ink-200/80 dark:bg-ink-700 text-ink-600 dark:text-ink-300'
              }`}
            >
              Tất cả ({totalResults})
            </button>
            <button
              onClick={() => setActiveTypeTab('properties')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTypeTab === 'properties'
                  ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-black'
                  : 'bg-ink-200/80 dark:bg-ink-700 text-ink-600 dark:text-ink-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> BĐS ({matchedProperties.length})
            </button>
            <button
              onClick={() => setActiveTypeTab('services')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTypeTab === 'services'
                  ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-black'
                  : 'bg-ink-200/80 dark:bg-ink-700 text-ink-600 dark:text-ink-300'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Dịch Vụ ({matchedServices.length})
            </button>
            <button
              onClick={() => setActiveTypeTab('jobs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTypeTab === 'jobs'
                  ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-black'
                  : 'bg-ink-200/80 dark:bg-ink-700 text-ink-600 dark:text-ink-300'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Việc Làm ({matchedJobs.length})
            </button>
            <button
              onClick={() => setActiveTypeTab('news')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTypeTab === 'news'
                  ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-black'
                  : 'bg-ink-200/80 dark:bg-ink-700 text-ink-600 dark:text-ink-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Tin Tức ({matchedNews.length})
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {totalResults === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Tag className="w-12 h-12 text-ink-300 dark:text-ink-700 mx-auto" />
              <p className="font-bold text-ink-700 dark:text-ink-300 text-sm">
                Không tìm thấy bài viết hoặc dịch vụ nào với hashtag <b className="text-brand-500">#{currentTag}</b>
              </p>
              <p className="text-xs text-ink-400">
                Hãy thử chọn các hashtag phổ biến ở thanh gợi ý phía trên.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Properties Section */}
              {(activeTypeTab === 'all' || activeTypeTab === 'properties') && matchedProperties.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-2">
                    <h3 className="font-black text-sm text-ink-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-500" />
                      <span>Bất Động Sản Liên Quan ({matchedProperties.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedProperties.slice(0, 6).map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleNavigate(getPropertyDetailUrl(p))}
                        className="p-3 bg-ink-50 dark:bg-ink-800/60 hover:bg-brand-50 dark:hover:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 transition cursor-pointer flex gap-3 group"
                      >
                        <img loading="lazy"
                          src={p.images[0] || ''}
                          alt={p.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-bold text-xs text-ink-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition line-clamp-2">
                            {p.title}
                          </h4>
                          <p className="text-xs font-black text-rose-600 dark:text-rose-400">{p.priceDisplay}</p>
                          <div className="flex items-center gap-1 text-[10px] text-ink-400">
                            <MapPin className="w-3 h-3 text-brand-500" />
                            <span className="truncate">{p.location || p.subdivision}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resident Services Section */}
              {(activeTypeTab === 'all' || activeTypeTab === 'services') && matchedServices.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-2">
                    <h3 className="font-black text-sm text-ink-900 dark:text-white flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-brand-500" />
                      <span>Dịch Vụ Cư Dân Liên Quan ({matchedServices.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedServices.slice(0, 6).map(s => (
                      <div
                        key={s.id}
                        onClick={() => handleNavigate(getServiceDetailUrl(s))}
                        className="p-3 bg-ink-50 dark:bg-ink-800/60 hover:bg-brand-50 dark:hover:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 transition cursor-pointer flex gap-3 group"
                      >
                        <img loading="lazy"
                          src={s.images?.[0] || ''}
                          alt={s.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-bold text-xs text-ink-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition line-clamp-2">
                            {s.title}
                          </h4>
                          <p className="text-xs font-black text-price dark:text-price-dark">{s.priceDisplay || 'Thỏa thuận'}</p>
                          <div className="flex items-center gap-1 text-[10px] text-ink-400">
                            <span className="truncate">Thợ: {s.providerName} ({s.providerPhone})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recruitment Jobs Section */}
              {(activeTypeTab === 'all' || activeTypeTab === 'jobs') && matchedJobs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-2">
                    <h3 className="font-black text-sm text-ink-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      <span>Việc Làm Tuyển Dụng Liên Quan ({matchedJobs.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedJobs.slice(0, 6).map(j => (
                      <div
                        key={j.id}
                        onClick={() => handleNavigate(getJobDetailUrl(j))}
                        className="p-3 bg-ink-50 dark:bg-ink-800/60 hover:bg-blue-50 dark:hover:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 transition cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                            {j.companyName}
                          </span>
                          <span className="text-[10px] font-bold text-price">{j.salaryDisplay}</span>
                        </div>
                        <h4 className="font-bold text-xs text-ink-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                          {j.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-ink-400">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          <span className="truncate">{j.location || j.project}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News Articles Section */}
              {(activeTypeTab === 'all' || activeTypeTab === 'news') && matchedNews.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-2">
                    <h3 className="font-black text-sm text-ink-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span>Tin Tức & Bài Viết Liên Quan ({matchedNews.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedNews.slice(0, 6).map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNavigate(getNewsDetailUrl(n))}
                        className="p-3 bg-ink-50 dark:bg-ink-800/60 hover:bg-purple-50 dark:hover:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 transition cursor-pointer flex gap-3 group"
                      >
                        <img loading="lazy"
                          src={n.imageUrl || ''}
                          alt={n.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-bold text-xs text-ink-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition line-clamp-2">
                            {n.title}
                          </h4>
                          <p className="text-[10px] text-ink-400 line-clamp-2">{n.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-ink-100 dark:bg-ink-800 border-t border-ink-200 dark:border-ink-700 flex items-center justify-between text-xs text-ink-500 shrink-0">
          <span>Tìm kiếm thông minh trên toàn bộ hệ sinh thái Chợ Cư Dân 24H</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-ink-200 dark:bg-ink-700 hover:bg-ink-300 text-ink-800 dark:text-white font-bold rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
