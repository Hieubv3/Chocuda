import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface IndustryFeedItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  date?: string;
}

interface IndustryFeedProps {
  title: string;
  accent?: string;
  items: IndustryFeedItem[];
  emptyText?: string;
  onViewAll?: () => void;
  onItemClick?: (item: IndustryFeedItem) => void;
}

/**
 * "Bản tin" theo ngành: danh sách tin đăng mới nhất của một ngành.
 * Dùng trên trang chủ (tổng hợp 4 ngành) và trên từng trang ngành.
 */
export const IndustryFeed: React.FC<IndustryFeedProps> = ({
  title,
  accent = 'bg-amber-500',
  items,
  emptyText = 'Chưa có dữ liệu',
  onViewAll,
  onItemClick,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      <div className={`px-3.5 py-2 flex items-center justify-between ${accent}`}>
        <span className="font-black text-[11px] uppercase tracking-wider text-white">{title}</span>
        <span className="text-[10px] font-bold bg-black/20 text-white px-1.5 py-0.5 rounded">{items.length}</span>
      </div>
      <ul className="flex-1 divide-y divide-slate-100 dark:divide-slate-700/60">
        {items.length === 0 && (
          <li className="px-3.5 py-3 text-xs italic text-slate-400">{emptyText}</li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
          >
            {item.image && (
              <img
                loading="lazy"
                src={item.image}
                alt={item.title}
                className="w-11 h-11 rounded-lg object-cover shrink-0 bg-slate-100 dark:bg-slate-700"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                {item.title}
              </p>
              {item.subtitle && (
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
              )}
            </div>
            {item.date && (
              <span className="text-[10px] text-slate-400 shrink-0">{item.date}</span>
            )}
          </li>
        ))}
      </ul>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full py-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-center gap-1 transition-colors"
        >
          Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
