import React, { useState, useEffect } from 'react';
import { PROJECT_FAQ_DATA, ProjectFaqItem } from '../data/projectFaqData';
import { SeoJsonLd } from './SeoJsonLd';
import { HelpCircle, Search, Calendar, RefreshCw, CheckCircle2, Shield, Sparkles, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface ProjectFaqHubProps {
  selectedProjectFilter?: string;
  className?: string;
}

export const ProjectFaqHub: React.FC<ProjectFaqHubProps> = ({
  selectedProjectFilter = 'all',
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'investor' | 'resident' | 'tenant' | 'legal_planning'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [faqItems, setFaqItems] = useState<ProjectFaqItem[]>(PROJECT_FAQ_DATA);
  const [openFaqId, setOpenFaqId] = useState<string | null>(PROJECT_FAQ_DATA[0]?.id || null);

  // Load FAQ from server (admin-managed), fallback to static data
  useEffect(() => {
    fetch('/api/faq')
      .then(r => r.ok ? r.json() : { faq: [] })
      .then((data: any) => {
        if (Array.isArray(data.faq) && data.faq.length > 0) {
          setFaqItems(data.faq);
          setOpenFaqId(data.faq[0]?.id || null);
        }
      })
      .catch(() => {});
  }, []);

  // Filter FAQ items based on category, project, and search term
  const filteredFaqs = faqItems.filter((item) => {
    const matchesProject = selectedProjectFilter === 'all' || item.projectId === 'all' || item.projectId === selectedProjectFilter;
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.keywords.some((k) => k.toLowerCase().includes(query));

    return matchesProject && matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl ${className}`}>
      {/* Dynamic JSON-LD Schema Injector */}
      <SeoJsonLd type="faq" faqItems={filteredFaqs} />

      {/* Header & Update Schedule Indicator */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </span>
            <span className="text-xs font-black text-amber-500 uppercase tracking-widest">
              BỘ Q&A TOÀN DIỆN CHO NHÀ ĐẦU TƯ, CƯ DÂN & NGƯỜI THUÊ
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Cẩm Nang Giải Đáp Pháp Lý, Quy Hoạch & Đầu Tư BĐS Vinhomes
          </h2>
        </div>

        {/* Weekly Auto-Update Badge */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold shrink-0">
          <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
          <div>
            <p className="text-slate-900 dark:text-white font-extrabold flex items-center gap-1">
              <span>Cập Nhật Tự Động: 1 Tuần / Lần</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            </p>
            <p className="text-[10px] text-slate-400 font-normal">
              Lịch cập nhật tiếp theo: <strong className="text-amber-500">Thứ 2 Tuần Tới</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Search & SEO Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo từ khóa: Sổ đỏ, Vành Đai 4, Vinschool, phí quản lý, lợi nhuận..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-extrabold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-2.5 rounded-xl transition whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Tất Cả ({faqItems.length})
          </button>
          <button
            onClick={() => setActiveCategory('investor')}
            className={`px-3 py-2.5 rounded-xl transition whitespace-nowrap ${
              activeCategory === 'investor'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            📈 Nhà Đầu Tư
          </button>
          <button
            onClick={() => setActiveCategory('resident')}
            className={`px-3 py-2.5 rounded-xl transition whitespace-nowrap ${
              activeCategory === 'resident'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🏢 Cư Dân
          </button>
          <button
            onClick={() => setActiveCategory('tenant')}
            className={`px-3 py-2.5 rounded-xl transition whitespace-nowrap ${
              activeCategory === 'tenant'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🔑 Người Thuê
          </button>
          <button
            onClick={() => setActiveCategory('legal_planning')}
            className={`px-3 py-2.5 rounded-xl transition whitespace-nowrap ${
              activeCategory === 'legal_planning'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            📜 Pháp Lý & Quy Hoạch
          </button>
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            <BookOpen className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            Không tìm thấy câu hỏi phù hợp từ khóa &quot;{searchTerm}&quot;. Vui lòng thử lại với từ khóa khác như Sổ đỏ, Vành đai, Vinschool...
          </div>
        ) : (
          filteredFaqs.map((item) => {
            const isOpen = openFaqId === item.id;
            return (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden transition shadow-sm hover:border-amber-500/50"
              >
                <button
                  onClick={() => toggleFaq(item.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-amber-500 transition"
                >
                  <span className="flex items-start gap-2.5">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded font-black text-[10px] uppercase shrink-0 mt-0.5">
                      {item.category === 'investor'
                        ? 'Đầu Tư'
                        : item.category === 'resident'
                        ? 'Cư Dân'
                        : item.category === 'tenant'
                        ? 'Khách Thuê'
                        : 'Pháp Lý'}
                    </span>
                    <span>{item.question}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-amber-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 space-y-3 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                    <p className="leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                      {item.answer}
                    </p>

                    {/* SEO Keyword Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/40 text-[10px]">
                      <span className="text-slate-400 font-bold">Từ khóa SEO AI Google:</span>
                      {item.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-semibold"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
