import React, { useState } from 'react';
import { ExternalLink, Sparkles, X, Megaphone } from 'lucide-react';
import { AdBanner } from '../types';
import { recordZaloInteraction } from '../lib/visitorStats';

interface AdBannerWidgetProps {
  ads: AdBanner[];
  position: AdBanner['position'];
  className?: string;
}

export const AdBannerWidget: React.FC<AdBannerWidgetProps> = ({ ads, position, className = '' }) => {
  const [dismissedAdIds, setDismissedAdIds] = useState<Set<string>>(new Set());

  // Read dynamically from localStorage if available
  const storedAds = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('chocudan24h_ads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return ads;
  }, [ads]);

  const activeAds = storedAds.filter(ad => 
    (ad.active ?? ad.isActive ?? true) && 
    ad.position === position &&
    !dismissedAdIds.has(ad.id)
  );

  if (activeAds.length === 0) return null;

  const handleDismiss = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDismissedAdIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const getSafeAdUrl = (url?: string) => {
    if (!url || url.trim() === '' || url === '#') return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('tel:') || trimmed.startsWith('mailto:') || trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('zalo.me') || trimmed.startsWith('facebook.com') || trimmed.startsWith('www.') || trimmed.includes('.')) {
      return `https://${trimmed}`;
    }
    return `/${trimmed}`;
  };

  const handleAdClick = (ad: AdBanner) => {
    if (ad.linkUrl?.includes('zalo.me') || ad.targetUrl?.includes('zalo.me')) {
      recordZaloInteraction();
    }
    fetch('/api/ads/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ad.id })
    }).catch(() => {});
  };

  // 1. BANNER TOP TRANG WEB (Header Top Bar - Hidden on mobile to avoid obstruction)
  if (position === 'header_top') {
    const currentAd = activeAds[0];
    return (
      <div className={`hidden md:flex bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 text-slate-950 px-3 py-1.5 text-xs font-bold items-center justify-between shadow-md relative z-30 ${className}`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-slate-950 text-amber-400 text-[10px] uppercase font-black px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
              <Megaphone className="w-3 h-3 text-amber-400" /> QC
            </span>
            <span className="truncate text-slate-950 font-black">{currentAd.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={getSafeAdUrl(currentAd.linkUrl || currentAd.targetUrl)}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleAdClick(currentAd)}
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold px-3 py-1 rounded-lg text-[11px] flex items-center gap-1 transition shadow-sm"
            >
              <span>Xem Ngay</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={(e) => handleDismiss(currentAd.id, e)}
              className="p-1 hover:bg-slate-950/20 text-slate-950 rounded-lg transition cursor-pointer"
              title="Tắt banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. BANNER CẠNH PHẢI WEB BÁM ĐUỔI TRÊN PC (Sticky Floating Right)
  if (position === 'float_right_pc') {
    return (
      <div className={`hidden lg:flex fixed right-3 top-32 z-40 flex-col space-y-3 ${className}`}>
        {activeAds.map(ad => {
          // Width sizes
          const widthClass = 
            ad.widthSize === 'small' ? 'w-40 xl:w-44' :
            ad.widthSize === 'large' ? 'w-60 xl:w-64' :
            ad.widthSize === 'compact' ? 'w-36 xl:w-36' :
            'w-48 xl:w-52'; // default 'medium'

          // Display Styles
          const isGlowing = ad.displayStyle === 'glowing_border';
          const isImageOnly = ad.displayStyle === 'image_only';
          const isMinimal = ad.displayStyle === 'minimal';

          const containerClasses = isGlowing
            ? 'bg-slate-900/95 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse hover:animate-none'
            : isImageOnly
            ? 'bg-slate-950 border-2 border-amber-500/60 shadow-2xl p-1'
            : isMinimal
            ? 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xl p-2'
            : 'bg-slate-900/95 border-2 border-amber-500/80 shadow-2xl backdrop-blur-md p-2';

          const badgeLabel = ad.badgeText || 'QC CẠNH PHẢI';

          return (
            <div
              key={ad.id}
              className={`group relative rounded-2xl transition-all duration-300 hover:scale-105 ${widthClass} ${containerClasses}`}
            >
              {/* Close Button Nút Tắt ❌ */}
              <button
                onClick={(e) => handleDismiss(ad.id, e)}
                className="absolute -top-2.5 -right-2.5 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full shadow-lg z-20 border-2 border-white cursor-pointer transition transform hover:scale-110"
                title="Tắt quảng cáo bám đuổi"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <a
                href={getSafeAdUrl(ad.linkUrl || ad.targetUrl)}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleAdClick(ad)}
                className="block"
              >
                {/* Image Container */}
                <div className={`relative rounded-xl overflow-hidden bg-slate-950 ${isImageOnly ? 'h-52 sm:h-60' : 'h-40 sm:h-44 mb-2'}`}>
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-md tracking-wider">
                    {badgeLabel}
                  </span>

                  {isImageOnly && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-2.5">
                      <p className="text-[11px] font-black text-amber-300 line-clamp-2 leading-tight">
                        {ad.title}
                      </p>
                      <span className="mt-1 text-[9px] font-extrabold text-slate-950 bg-amber-400 py-1 px-2 rounded-md text-center block uppercase tracking-wider">
                        Bấm Xem Ngay ↗
                      </span>
                    </div>
                  )}
                </div>

                {!isImageOnly && (
                  <>
                    <p className={`text-[11px] font-black line-clamp-2 leading-tight ${isMinimal ? 'text-slate-900 dark:text-white group-hover:text-amber-500' : 'text-amber-300 group-hover:text-white'}`}>
                      {ad.title}
                    </p>
                    <div className="mt-2 text-[10px] font-bold text-center bg-amber-500 hover:bg-amber-400 text-slate-950 py-1 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm">
                      <span>XEM CHI TIẾT</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </>
                )}
              </a>
            </div>
          );
        })}
      </div>
    );
  }

  // 3. BANNER CẠNH TRÁI WEB BÁM ĐUỔI TRÊN PC (Sticky Floating Left)
  if (position === 'float_left_pc') {
    return (
      <div className={`hidden lg:flex fixed left-3 top-32 z-40 flex-col space-y-3 w-48 xl:w-52 ${className}`}>
        {activeAds.map(ad => (
          <div
            key={ad.id}
            className="group relative bg-slate-900/95 border-2 border-emerald-500/80 rounded-2xl p-2 shadow-2xl backdrop-blur-md transition-all hover:scale-105 hover:border-emerald-400"
          >
            {/* Close Button Nút Tắt */}
            <button
              onClick={(e) => handleDismiss(ad.id, e)}
              className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full shadow-lg z-20 border border-white cursor-pointer transition transform hover:scale-110"
              title="Tắt quảng cáo bám đuổi"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <a
              href={getSafeAdUrl(ad.linkUrl || ad.targetUrl)}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleAdClick(ad)}
              className="block"
            >
              <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-950">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                  QC CẠNH TRÁI
                </span>
              </div>
              <p className="text-[11px] font-black text-emerald-300 group-hover:text-white line-clamp-2 leading-tight">
                {ad.title}
              </p>
              <div className="mt-2 text-[10px] font-bold text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-1 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1">
                <span>XEM CHI TIẾT</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          </div>
        ))}
      </div>
    );
  }

  // 4. BANNER POP-UP NỔI TRUNG TÂM (Center Modal Pop-up - Hidden on mobile)
  if (position === 'popup_modal') {
    const currentAd = activeAds[0];
    return (
      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div className="relative bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 text-white overflow-hidden">
          {/* Nút Tắt X */}
          <button
            onClick={(e) => handleDismiss(currentAd.id, e)}
            className="absolute top-3 right-3 bg-slate-800 hover:bg-rose-600 text-white p-2 rounded-full transition border border-slate-700 cursor-pointer shadow-lg z-20"
            title="Đóng quảng cáo"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase">
              THÔNG BÁO TỪ BQT
            </span>
            <span className="text-xs text-amber-400 font-bold truncate">{currentAd.title}</span>
          </div>

          <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={(e) => handleDismiss(currentAd.id, e)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition border border-slate-700 cursor-pointer"
            >
              Bỏ Qua
            </button>
            <a
              href={getSafeAdUrl(currentAd.linkUrl || currentAd.targetUrl)}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                handleAdClick(currentAd);
                handleDismiss(currentAd.id);
              }}
              className="flex-1 text-center py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>XEM NGAY SẢN PHẨM</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 5. BANNER GIỮA TRANG CHỦ (Home Middle)
  if (position === 'home_middle') {
    return (
      <div className={`my-8 space-y-4 ${className}`}>
        {activeAds.map(ad => (
          <a
            key={ad.id}
            href={getSafeAdUrl(ad.linkUrl || ad.targetUrl)}
            target="_blank"
            rel="noreferrer"
            onClick={() => handleAdClick(ad)}
            className="group block relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-xl transition-transform hover:scale-[1.01]"
          >
            <div className="relative h-36 sm:h-48 w-full">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-4 sm:p-6">
                <div className="space-y-1">
                  <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> BẤT ĐỘNG SẢN HOT
                  </span>
                  <h3 className="text-sm sm:text-lg font-black text-white group-hover:text-amber-400 transition">
                    {ad.title}
                  </h3>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  }

  // 6. BANNER CỘT BÊN & CHI TIẾT CĂN (Home Sidebar / Property Detail)
  if (position === 'home_sidebar' || position === 'property_detail') {
    return (
      <div className={`space-y-3 ${className}`}>
        {activeAds.map(ad => (
          <a
            key={ad.id}
            href={getSafeAdUrl(ad.linkUrl || ad.targetUrl)}
            target="_blank"
            rel="noreferrer"
            onClick={() => handleAdClick(ad)}
            className="group block bg-white dark:bg-slate-800 rounded-2xl p-3 border border-amber-500/30 shadow-md hover:border-amber-500 transition"
          >
            <div className="relative h-28 rounded-xl overflow-hidden mb-2">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-2 left-2 bg-slate-950/80 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded">
                QC
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-500 transition">
              {ad.title}
            </p>
          </a>
        ))}
      </div>
    );
  }

  // 7. BANNER CHỢ CƯ DÂN, THỢ & TUYỂN DỤNG (Resident Market, Services, Recruitment)
  if (position === 'resident_market_top' || position === 'resident_services' || position === 'recruitment' || activeAds.length > 0) {
    return (
      <div className={`my-4 space-y-3 ${className}`}>
        {activeAds.map(ad => (
          <a
            key={ad.id}
            href={getSafeAdUrl(ad.linkUrl || ad.targetUrl)}
            target="_blank"
            rel="noreferrer"
            onClick={() => handleAdClick(ad)}
            className="group block relative rounded-2xl overflow-hidden border border-rose-500/30 shadow-lg transition-transform hover:scale-[1.01]"
          >
            <div className="relative h-28 sm:h-36 w-full">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-3 sm:p-4">
                <div className="space-y-1">
                  <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {ad.badgeText || 'QUẢNG CÁO NỔI BẬT'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-rose-300 transition line-clamp-1">
                    {ad.title}
                  </h4>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  }

  return null;
};
