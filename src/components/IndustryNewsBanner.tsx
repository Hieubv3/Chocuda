import React from 'react';
import { Newspaper, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../types';

interface IndustryNewsBannerProps {
  news: NewsArticle[];
  currentTab: string;
  className?: string;
}

// Map tab names to display labels
const TAB_LABELS: Record<string, string> = {
  'sale': 'MUA BÁN',
  'rent': 'CHO THUÊ',
  'services': 'DỊCH VỤ',
  'recruitment': 'TUYỂN DỤNG',
};

export const IndustryNewsBanner: React.FC<IndustryNewsBannerProps> = ({
  news,
  currentTab,
  className = '',
}) => {
  // Show all news (all are real-estate related) — could filter by tab later
  const displayNews = news.filter(n => n.status === 'published').slice(0, 6);

  if (displayNews.length === 0) return null;

  const tabLabel = TAB_LABELS[currentTab] || 'BẤT ĐỘNG SẢN';

  return (
    <div className={`w-full ${className}`}>
      {/* PC: 10% height banner */}
      <div className="hidden md:block relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-xl"
        style={{ minHeight: '10vh', maxHeight: '12vh' }}>
        <div className="absolute inset-0 bg-[url('/images/demo/hero-city-2.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-slate-950/95" />

        <div className="relative h-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-lg shadow-lg">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                {tabLabel}
              </span>
              <h3 className="text-white font-black text-lg ml-2">
                Tin tức ngành hàng mới nhất
              </h3>
            </div>
          </div>
          <a
            href="/tin-tuc"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1 transition shadow-lg"
          >
            Xem tất cả
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {/* Scrollable news strip inside banner */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4">
          <div className="flex gap-3 overflow-hidden">
            {displayNews.slice(0, 3).map((article) => (
              <a
                key={article.id}
                href={`/tin-tuc/${article.id}`}
                className="flex-shrink-0 w-48 bg-slate-800/80 hover:bg-slate-750 rounded-lg p-2.5 border border-slate-700/50 transition cursor-pointer group"
              >
                <p className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200 line-clamp-2 leading-tight">
                  {article.title}
                </p>
                <p className="text-[9px] text-slate-500 mt-1">{article.publishedAt}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: 2-column grid of news items */}
      <div className="md:hidden grid grid-cols-2 gap-3 px-4 py-3">
        {displayNews.slice(0, 4).map((article) => (
          <a
            key={article.id}
            href={`/tin-tuc/${article.id}`}
            className="group block bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start gap-2.5">
              <div className="bg-amber-50 text-amber-600 p-1.5 rounded-lg shrink-0">
                <Newspaper className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-amber-600 transition">
                  {article.title}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">{article.publishedAt}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
