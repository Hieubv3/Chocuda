import React from 'react';
import { Newspaper } from 'lucide-react';
import { NewsArticle } from '../types';

interface IndustryNewsBannerProps {
  news: NewsArticle[];
  currentTab: string;
  className?: string;
}

const TAB_CONFIG: Record<string, { label: string; color: string }> = {
  'sale': { label: 'MUA BÁN', color: 'amber' },
  'rent': { label: 'CHO THUÊ', color: 'blue' },
  'services': { label: 'DỊCH VỤ', color: 'emerald' },
  'recruitment': { label: 'TUYỂN DỤNG', color: 'teal' },
};

const COLOR_MAP = {
  amber: { bg: 'bg-amber-500', text: 'text-amber-950', hover: 'hover:text-amber-600', border: 'border-amber-200' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-950', hover: 'hover:text-blue-600', border: 'border-blue-200' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-950', hover: 'hover:text-emerald-600', border: 'border-emerald-200' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-950', hover: 'hover:text-teal-600', border: 'border-teal-200' },
};

export const IndustryNewsBanner: React.FC<IndustryNewsBannerProps> = ({
  news,
  currentTab,
  className = '',
}) => {
  const displayNews = news.filter(n => n.status === 'published').slice(0, 4);
  const config = TAB_CONFIG[currentTab] || { label: 'BẤT ĐỘNG SẢN', color: 'amber' };
  const colors = COLOR_MAP[config.color] || COLOR_MAP.amber;

  if (displayNews.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      {/* Unified 2-column block — PC & Mobile */}
      <div className="grid grid-cols-2 gap-3">
        {/* Column 1: Badge + Title */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl px-5 py-4 flex items-center gap-3 border border-slate-700/50 shadow-lg">
          <div className={`${colors.bg} text-slate-950 p-2 rounded-lg shadow-md shrink-0`}>
            <Newspaper className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className={`${colors.bg} text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider`}>
              {config.label}
            </span>
            <h3 className={`text-white font-black text-base ml-1 truncate ${colors.hover}`}>
              Tin tức ngành hàng
            </h3>
          </div>
        </div>

        {/* Column 2: News list */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
          <div className="space-y-2">
            {displayNews.map((article) => (
              <a
                key={article.id}
                href={`/tin-tuc/${article.id}`}
                className={`block text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-${config.color}-600 dark:hover:text-${config.color}-400 transition leading-tight line-clamp-2`}
              >
                {article.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
