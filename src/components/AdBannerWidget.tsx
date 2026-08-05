import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { AdBanner } from '../types';
import { recordZaloInteraction } from '../lib/visitorStats';

interface AdBannerWidgetProps {
  ads: AdBanner[];
  position: AdBanner['position'];
  className?: string;
}

export const AdBannerWidget: React.FC<AdBannerWidgetProps> = ({ ads, position, className = '' }) => {
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

  const activeAds = storedAds.filter(ad => (ad.active ?? ad.isActive ?? true) && ad.position === position);

  if (activeAds.length === 0) return null;

  const handleAdClick = (ad: AdBanner) => {
    if (ad.linkUrl?.includes('zalo.me') || ad.targetUrl?.includes('zalo.me')) {
      recordZaloInteraction();
    }
    // Record click stat locally or via API if needed
    fetch('/api/ads/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ad.id })
    }).catch(() => {});
  };

  if (position === 'header_top') {
    return (
      <div className={`bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md ${className}`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-slate-950 text-amber-400 text-[10px] uppercase font-black px-2 py-0.5 rounded-md shrink-0">
              QUẢNG CÁO
            </span>
            <span className="truncate">{activeAds[0].title}</span>
          </div>
          <a
            href={activeAds[0].linkUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => handleAdClick(activeAds[0])}
            className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold px-3 py-1 rounded-lg text-[11px] flex items-center gap-1 shrink-0 transition"
          >
            <span>Xem Ngay</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  if (position === 'home_middle') {
    return (
      <div className={`my-8 space-y-4 ${className}`}>
        {activeAds.map(ad => (
          <a
            key={ad.id}
            href={ad.linkUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => handleAdClick(ad)}
            className="group block relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-xl transition-transform hover:scale-[1.01]"
          >
            <div className="relative h-32 sm:h-44 w-full">
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

  if (position === 'home_sidebar' || position === 'property_detail') {
    return (
      <div className={`space-y-3 ${className}`}>
        {activeAds.map(ad => (
          <a
            key={ad.id}
            href={ad.linkUrl}
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

  return null;
};
