import React, { useEffect, useState } from 'react';
import { fetchPageBanners, PageBannerConfig } from '../lib/pageBanners';
import { BannerNewsRail } from './BannerNewsRail';

interface PageBannerProps {
  pageKey: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  fallbackImage?: string;
  className?: string;
  compact?: boolean;
  /** Nếu đặt: hiển thị bản tin tin tức của ngành trong banner (mép phải) */
  newsIndustry?: 'mua-ban' | 'cho-thue' | 'dich-vu' | 'tuyen-dung';
}

/**
 * Banner ảnh đầu trang (admin quản trị qua API /api/page-banners).
 * Dùng cho các trang: Mua bán, Cho thuê, Dịch vụ, Tuyển dụng, Tin tức, Dự án.
 */
export const PageBanner: React.FC<PageBannerProps> = ({
  pageKey,
  fallbackTitle = '',
  fallbackSubtitle = '',
  fallbackImage = '',
  className = '',
  compact = false,
  newsIndustry,
}) => {
  const [banner, setBanner] = useState<PageBannerConfig | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPageBanners().then((list) => {
      if (!alive) return;
      setBanner(list.find((b) => b.key === pageKey) || null);
    });
    return () => {
      alive = false;
    };
  }, [pageKey]);

  const title = banner?.title || fallbackTitle;
  const subtitle = banner?.subtitle || fallbackSubtitle;
  const image = banner?.image || fallbackImage;

  if (!image && !title) return null;

  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      {image && (
        <img
          loading="lazy"
          src={image}
          alt={title || pageKey}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/35" />
      <div
        className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center ${
          compact ? 'py-6 sm:py-8 min-h-[130px]' : 'py-8 sm:py-12 min-h-[180px] sm:min-h-[220px]'
        }`}
      >
        {title && (
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-1.5 text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bản tin nằm trong banner (mép phải ~12%) */}
      {newsIndustry && <BannerNewsRail industry={newsIndustry} title="BẢN TIN" />}
    </section>
  );
};
