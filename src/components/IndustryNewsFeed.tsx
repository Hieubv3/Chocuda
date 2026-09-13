import React, { useEffect, useState } from 'react';
import { IndustryFeed, IndustryFeedItem } from './IndustryFeed';

type IndustryKey = 'mua-ban' | 'cho-thue' | 'dich-vu' | 'tuyen-dung';

interface IndustryNewsFeedProps {
  industry: IndustryKey;
  title?: string;
  accent?: string;
  onViewAll?: () => void;
  limit?: number;
}

/**
 * "Bản tin" theo ngành: lấy bài viết tin tức của ngành từ /api/news?industry=...
 * Dùng trên các trang ngành (Mua bán, Cho thuê, Dịch vụ, Tuyển dụng).
 */
export const IndustryNewsFeed: React.FC<IndustryNewsFeedProps> = ({
  industry,
  title,
  accent = 'bg-amber-500',
  onViewAll,
  limit = 5,
}) => {
  const [items, setItems] = useState<IndustryFeedItem[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        let list: any[] = [];
        const r1 = await fetch(`/api/news?industry=${industry}`);
        if (r1.ok) list = await r1.json();
        // Fallback: nếu ngành chưa có bài riêng thì lấy tin mới nhất chung
        if (!Array.isArray(list) || list.length === 0) {
          const r2 = await fetch('/api/news');
          if (r2.ok) list = await r2.json();
        }
        if (!alive) return;
        const arr = Array.isArray(list) ? list : [];
        setItems(
          arr
            .filter((n) => n.status !== 'draft')
            .slice(0, limit)
            .map((n) => ({
              id: String(n.id),
              title: n.title || '',
              subtitle: n.summary || '',
              image: n.image || '',
              date: n.publishedAt ? String(n.publishedAt).slice(0, 10) : '',
            }))
        );
      } catch {
        /* ignore */
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [industry, limit]);

  if (items.length === 0) return null;

  return (
    <IndustryFeed
      title={title || 'BẢN TIN'}
      accent={accent}
      items={items}
      onViewAll={onViewAll}
    />
  );
};
