import React, { useEffect, useState } from 'react';

interface BannerNewsRailProps {
  /** Ngành để lọc tin; bỏ trống = lấy tất cả (trang chủ) */
  industry?: string;
  title?: string;
}

const CACHE_KEY = 'chocudan24h_news_cache';

interface RailItem {
  id: string;
  title: string;
}

function readCache(): RailItem[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

function writeCache(items: RailItem[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

/**
 * "Bảng tin" (bản tin):
 * - PC (lg+): rail nằm TRÊN banner, mép phải ~15%, cùng lớp với banner.
 * - Di động: khối bảng tin hiển thị BÊN DƯỚI các nút icon vuông.
 * Có cache localStorage để không mất bảng tin khi API lỗi.
 */
export const BannerNewsRail: React.FC<BannerNewsRailProps> = ({ industry, title = 'BẢN TIN' }) => {
  const [items, setItems] = useState<RailItem[]>(() => readCache());

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        let list: any[] = [];
        const url = industry ? `/api/news?industry=${industry}` : '/api/news';
        const r1 = await fetch(url);
        if (r1.ok) list = await r1.json();
        if ((!Array.isArray(list) || list.length === 0) && industry) {
          const r2 = await fetch('/api/news');
          if (r2.ok) list = await r2.json();
        }
        if (!alive) return;
        const arr = Array.isArray(list) ? list : [];
        const mapped = arr
          .filter((n) => n.status !== 'draft')
          .slice(0, 8)
          .map((n) => ({ id: String(n.id), title: n.title || '' }));
        if (mapped.length > 0) {
          setItems(mapped);
          writeCache(mapped);
        }
      } catch {
        /* giữ cache nếu lỗi */
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [industry]);

  if (items.length === 0) return null;

  return (
    <>
      {/* PC: rail nằm trên banner, mép phải 15%, cùng lớp banner */}
      <aside className="hidden lg:flex flex-col absolute top-0 right-0 bottom-0 w-[15%] min-w-[180px] max-w-[320px] bg-slate-950/80 backdrop-blur-md border-l border-white/15 z-[3]">
        <div className="px-2 py-1.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shrink-0">
          {title}
        </div>
        <ul className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {items.map((n) => (
            <li
              key={n.id}
              className="text-[10px] text-slate-100 leading-snug line-clamp-2 pb-1.5 border-b border-white/10 last:border-0"
            >
              {n.title}
            </li>
          ))}
        </ul>
      </aside>

      {/* Di động: khối bảng tin bên dưới các nút icon vuông */}
      <div className="lg:hidden relative z-[3] w-full bg-slate-950/85 backdrop-blur-md border-t border-white/15">
        <div className="px-3 py-1.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
          {title}
        </div>
        <ul className="divide-y divide-white/10 max-h-60 overflow-y-auto">
          {items.map((n) => (
            <li key={n.id} className="px-3 py-2 text-[11px] text-slate-100 leading-snug line-clamp-2">
              {n.title}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
