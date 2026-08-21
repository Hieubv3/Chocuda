import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Move, Sparkles, ExternalLink, ChevronRight, ChevronLeft, 
  Volume2, VolumeX, Eye, ArrowRight, ShieldCheck, Flame, Store, Briefcase, Building2
} from 'lucide-react';
import { AdBanner } from '../types';

interface DraggableSidebarAdsProps {
  ads: AdBanner[];
  onOpenItem?: (type: 'property' | 'service' | 'store' | 'job' | 'custom', idOrUrl: string) => void;
}

export const DraggableSidebarAds: React.FC<DraggableSidebarAdsProps> = ({
  ads,
  onOpenItem
}) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 160 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 160
  });

  // Filter right sidebar ads or active ads
  const rightAds = ads.filter(a => a.active || a.isActive !== false);

  // Auto rotate ad every 6 seconds if multiple ads exist
  useEffect(() => {
    if (rightAds.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAdIndex(prev => (prev + 1) % rightAds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [rightAds.length]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from header or handle
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      
      const newY = Math.max(80, Math.min(window.innerHeight - 300, dragStartRef.current.posY + dy));
      const newX = Math.max(-window.innerWidth + 240, Math.min(0, dragStartRef.current.posX + dx));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;
      
      const newY = Math.max(80, Math.min(window.innerHeight - 300, dragStartRef.current.posY + dy));
      const newX = Math.max(-window.innerWidth + 240, Math.min(0, dragStartRef.current.posX + dx));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  if (rightAds.length === 0) return null;

  const currentAd = rightAds[activeAdIndex] || rightAds[0];

  const handleAdClick = (ad: AdBanner) => {
    // Record click
    try {
      fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id })
      });
    } catch (e) {}

    const target = ad.linkUrl || ad.targetUrl || '';
    if (!target) return;

    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.open(target, '_blank', 'noopener,noreferrer');
    } else if (target.startsWith('/')) {
      navigate(target);
    } else {
      navigate(`/${target}`);
    }
  };

  return (
    <div
      style={{
        top: `${position.y}px`,
        right: `${Math.abs(position.x)}px`,
        transform: `translate(${position.x > 0 ? position.x : 0}px, 0)`,
      }}
      className={`fixed z-40 transition-all duration-150 select-none ${
        isCollapsed ? 'w-10' : 'w-64 sm:w-72'
      }`}
    >
      {/* Collapsed Ribbon */}
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-gradient-to-b from-amber-500 to-rose-600 text-slate-950 font-black py-4 px-2 rounded-l-2xl shadow-2xl flex flex-col items-center gap-2 border-y border-l border-amber-300 hover:scale-105 transition cursor-pointer"
          title="Mở bảng tin quảng cáo & ưu đãi cư dân"
        >
          <ChevronLeft className="w-5 h-5 animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
            QUẢNG CÁO VIP ({rightAds.length})
          </span>
          <Flame className="w-4 h-4 text-rose-900" />
        </button>
      ) : (
        /* Full Expanded Ad Card */
        <div className="bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col group">
          
          {/* Header Drag Handle */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="px-3 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-slate-950 flex items-center justify-between cursor-move"
          >
            <div className="flex items-center gap-1.5 font-black text-[11px] tracking-tight">
              <Move className="w-3.5 h-3.5" />
              <span>TIN TÀI TRỢ & DỊCH VỤ VIP</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded-full">
                {activeAdIndex + 1}/{rightAds.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(true);
                }}
                className="p-1 hover:bg-slate-950/20 rounded-md transition"
                title="Thu gọn quảng cáo"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </div>
          </div>

          {/* Ad Content Banner */}
          <div
            onClick={() => handleAdClick(currentAd)}
            className="cursor-pointer relative overflow-hidden bg-slate-950 p-2.5 space-y-2 group/ad"
          >
            <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80">
              <img
                src={currentAd.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}
                alt={currentAd.title}
                className="w-full h-full object-cover group-hover/ad:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              
              {currentAd.badgeText && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider rounded-md shadow-md">
                  {currentAd.badgeText}
                </span>
              )}

              <span className="absolute bottom-2 right-2 text-[9px] text-amber-400 font-bold bg-slate-900/80 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Xem Ngay
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-xs text-white group-hover/ad:text-amber-400 transition line-clamp-2 leading-snug">
                {currentAd.title}
              </h4>
            </div>

            {/* Direct Action Link */}
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3 h-3" /> Xác thực BQT
              </span>
              <span className="text-amber-400 font-black flex items-center gap-0.5 group-hover/ad:translate-x-0.5 transition-transform">
                Chi tiết <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Ad Carousel Dots & Navigation */}
          {rightAds.length > 1 && (
            <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAdIndex(prev => (prev - 1 + rightAds.length) % rightAds.length);
                }}
                className="text-slate-400 hover:text-white px-1 font-bold"
              >
                ◀ Trước
              </button>

              <div className="flex items-center gap-1">
                {rightAds.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAdIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeAdIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAdIndex(prev => (prev + 1) % rightAds.length);
                }}
                className="text-slate-400 hover:text-white px-1 font-bold"
              >
                Tiếp ▶
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
