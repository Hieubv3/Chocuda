import React, { useState } from 'react';
import { Heart, Scale, MapPin, Bed, Bath, Compass, ShieldCheck, Phone, MessageCircle, Zap, Crown, Sparkles, Share2 } from 'lucide-react';
import { Property, Language } from '../types';
import { getTranslation } from '../lib/i18n';
import { SocialShareModal } from './SocialShareModal';

interface PropertyCardProps {
  property: Property;
  language: Language;
  onSelect: (property: Property) => void;
  isSaved: boolean;
  onToggleSave: (property: Property) => void;
  isCompared: boolean;
  onToggleCompare: (property: Property) => void;
  onOpenUpTinModal?: (property: Property) => void;
  viewMode?: 'grid-3col' | 'grid-2col' | 'grid' | 'list';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  language,
  onSelect,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  onOpenUpTinModal,
  viewMode = 'grid'
}) => {
  const t = getTranslation(language);
  const [showShareModal, setShowShareModal] = useState(false);

  const projectNames: Record<string, string> = {
    'ocean-park-2': 'Vinhomes Ocean Park 2',
    'ocean-park-3': 'Vinhomes Ocean Park 3',
    'ha-long-xanh': 'Vinhomes Hạ Long Xanh',
    'khac': 'Dự án khác'
  };

  const categoryNames: Record<string, string> = {
    'studio': 'Studio',
    '1pn': '1 Phòng Ngủ',
    '2pn': '2 Phòng Ngủ',
    '3pn': '3+ Phòng Ngủ',
    'shophouse': 'Shophouse',
    'biet-thu-don-lap': 'Biệt Thự Đơn Lập',
    'biet-thu-song-lap': 'Biệt Thự Song Lập',
    'lien-ke': 'Nhà Liền Kề'
  };

  // Determine VIP badge or Up-tin status
  const isVipDiamond = property.vipLevel === 'diamond';
  const isVipGold = property.vipLevel === 'gold';
  const isVipSilver = property.vipLevel === 'silver';
  const isRecentlyPushed = Boolean(property.pushedAt);

  // CHỢ TỐT / NHÀ TỐT STYLE HORIZONTAL LISTING ROW (1 CĂN / 1 DÒNG TỐI ƯU MOBI)
  if (viewMode === 'list') {
    const phoneClean = (property.sellerPhone || '').replace(/\D/g, '');
    const sellerName = property.sellerName || 'Người đăng tin';

    return (
      <div className={`group bg-white dark:bg-slate-800/95 rounded-2xl border transition-all duration-200 flex flex-row items-stretch overflow-hidden shadow-xs hover:shadow-md relative ${
        isVipDiamond
          ? 'border-purple-500/80 ring-1 ring-purple-500/30'
          : isVipGold
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
          : 'border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/60'
      }`}>
        {/* Left Image Thumbnail */}
        <div 
          className="w-28 sm:w-36 md:w-44 shrink-0 relative bg-slate-900 cursor-pointer overflow-hidden min-h-[110px]"
          onClick={() => onSelect(property)}
        >
          <img
            src={property.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

          {/* Top Left Badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1 items-center z-10 pointer-events-none">
            <span className={`text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow ${
              property.type === 'sale' ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white'
            }`}>
              {property.type === 'sale' ? 'BÁN' : 'THUÊ'}
            </span>
            {isVipDiamond && (
              <span className="text-[8px] font-black badge-vip-diamond px-1 py-0.5 rounded">VIP</span>
            )}
            {isVipGold && (
              <span className="text-[8px] font-black badge-vip-gold px-1 py-0.5 rounded">GOLD</span>
            )}
          </div>

          {/* Heart Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property);
            }}
            className={`absolute top-1.5 right-1.5 p-1 rounded-md backdrop-blur-md transition ${
              isSaved ? 'bg-rose-500 text-white' : 'bg-slate-900/70 text-white/90 hover:text-white'
            }`}
            title={isSaved ? 'Đã lưu' : 'Lưu tin'}
          >
            <Heart className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Sub-division & Watermark bottom tags */}
          <div className="absolute bottom-1 left-1.5 right-1.5 flex justify-between items-center pointer-events-none">
            {property.subdivision ? (
              <span className="text-[8px] sm:text-[9px] font-bold text-emerald-300 bg-slate-950/85 px-1.5 py-0.5 rounded backdrop-blur-md border border-emerald-500/30 truncate max-w-[60%]">
                PK {property.subdivision}
              </span>
            ) : <span />}
            <span className="text-[7.5px] font-black text-amber-300 bg-slate-950/90 px-1 py-0.5 rounded backdrop-blur-md border border-amber-500/30">
              chocudan24h
            </span>
          </div>
        </div>

        {/* Right Info Content */}
        <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between min-w-0 space-y-1.5">
          <div>
            <h3
              onClick={() => onSelect(property)}
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors leading-snug"
            >
              {property.title}
            </h3>

            <div className="mt-1 flex items-center text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
              <MapPin className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{property.address}</span>
            </div>
          </div>

          {/* Price & Specs Row */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {property.priceDisplay}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-600/50">
                {property.area} m² • {property.bedrooms} PN
              </span>
            </div>

            <span className="text-[10px] text-slate-400 hidden sm:inline font-medium">
              {projectNames[property.project] || property.project}
            </span>
          </div>

          {/* Footer Seller Role & Quick Actions */}
          <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1 truncate max-w-[60%]">
              <span className={`px-1 py-0.2 rounded text-[8px] font-extrabold uppercase shrink-0 ${
                property.sellerRole === 'owner' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                property.sellerRole === 'sale' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                {property.sellerRole === 'owner' ? 'Chủ nhà' : property.sellerRole === 'sale' ? 'Sale' : 'Sàn'}
              </span>
              <span className="truncate text-slate-600 dark:text-slate-300 font-medium">{sellerName}</span>
            </span>

            <div className="flex items-center gap-1 shrink-0 ml-auto">
              {onOpenUpTinModal && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenUpTinModal(property);
                  }}
                  className="px-1.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-bold rounded shadow-xs flex items-center gap-0.5"
                  title="Đẩy tin lên đầu"
                >
                  <Zap className="w-2.5 h-2.5" /> Đẩy Tin
                </button>
              )}

              <a
                href={`https://zalo.me/${phoneClean}?text=Tôi%20quan%20tâm%20căn%3A%20${encodeURIComponent(property.title)}`}
                target="_blank"
                rel="noreferrer"
                className="p-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition"
                title={`Zalo ${sellerName}`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>

              <a
                href={`tel:${phoneClean}`}
                className="p-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition"
                title={`Gọi ${sellerName}`}
              >
                <Phone className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onSelect(property)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow-xs transition"
              >
                Xem Căn
              </button>
            </div>
          </div>
        </div>

        {showShareModal && (
          <SocialShareModal
            title={property.title}
            summary={property.description}
            price={property.priceDisplay}
            location={property.projectName}
            phone={property.sellerPhone}
            url={window.location.href}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`group bg-white dark:bg-slate-800/90 rounded-2xl border transition-all duration-300 flex flex-col h-full relative overflow-hidden ${
      isVipDiamond
        ? 'border-purple-500/80 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/30'
        : isVipGold
        ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30'
        : 'border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/60 hover:shadow-xl'
    }`}>
      
      {/* Image Thumbnail & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer" onClick={() => onSelect(property)}>
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Header Overlay with flex layout to prevent overlap between left badges and right actions */}
        <div className="absolute top-0 left-0 right-0 p-1.5 flex justify-between items-start gap-1 z-10 pointer-events-none">
          {/* Top Left Badges Container */}
          <div className="flex flex-wrap gap-1 items-center max-w-[70%] pointer-events-auto">
            <span className={`text-[8px] font-extrabold uppercase px-1 py-0.2 rounded shadow-xs ${
              property.type === 'sale'
                ? 'bg-emerald-600 text-white'
                : 'bg-teal-600 text-white'
            }`}>
              {property.type === 'sale' ? 'BÁN' : 'THUÊ'}
            </span>

            {/* Pending Approval Badge */}
            {(property.approvalStatus === 'pending' || (property.status === 'pending' && !property.approved)) && (
              <span className="text-[8px] font-black bg-amber-500/90 text-slate-950 px-1 py-0.2 rounded shadow-xs flex items-center gap-0.5 animate-pulse">
                ⏳ CHỜ
              </span>
            )}

            {/* VIP Level Badges */}
            {isVipDiamond && (
              <span className="text-[8px] font-black badge-vip-diamond px-1 py-0.2 rounded flex items-center gap-0.5">
                <Crown className="w-2 h-2" /> VIP
              </span>
            )}

            {isVipGold && (
              <span className="text-[8px] font-bold badge-vip-gold px-1 py-0.2 rounded flex items-center gap-0.5">
                <Sparkles className="w-2 h-2" /> GOLD
              </span>
            )}

            {isVipSilver && (
              <span className="text-[8px] font-bold badge-vip-silver px-1 py-0.2 rounded">
                SILVER
              </span>
            )}

            {/* Đẩy Tin Tag */}
            {!isVipDiamond && !isVipGold && isRecentlyPushed && (
              <span className="text-[8px] font-black badge-uptin px-1 py-0.2 rounded flex items-center gap-0.5">
                <Zap className="w-2 h-2" /> ĐẨY TIN
              </span>
            )}

            <span className="text-[8px] font-semibold bg-black/50 backdrop-blur-md text-emerald-300 px-1 py-0.2 rounded border border-white/15 truncate max-w-[85px] sm:max-w-[105px]">
              {projectNames[property.project] || property.project}
            </span>
          </div>

          {/* Top Right Actions (Save & Compare & Đẩy Tin) */}
          <div className="flex items-center gap-1 shrink-0 pointer-events-auto">
            {onOpenUpTinModal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenUpTinModal(property);
                }}
                className="px-1.5 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[8px] font-bold rounded shadow-xs flex items-center gap-0.5 backdrop-blur-md transition transform active:scale-95"
                title="Đẩy tin lên đầu danh sách"
              >
                <Zap className="w-2 h-2 text-emerald-200" />
                Đẩy Tin
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(property);
              }}
              className={`p-1 rounded backdrop-blur-md transition ${
                isSaved
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/40 hover:bg-black/70 text-white/90 hover:text-white'
              }`}
              title={isSaved ? 'Đã lưu' : 'Lưu tin'}
            >
              <Heart className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(property);
              }}
              className={`p-1 rounded backdrop-blur-md transition ${
                isCompared
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-black/40 hover:bg-black/70 text-white/90 hover:text-white'
              }`}
              title="So sánh căn"
            >
              <Scale className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bottom Image Overlay Badges - Micro semi-transparent tags */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between items-center text-white text-xs font-semibold pointer-events-none">
          <span className="bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] text-amber-300 font-black border border-amber-500/40 flex items-center gap-1 shadow-xs">
            <span>🛡️ CHỢ CƯ DÂN 24H • chocudan24h.com</span>
          </span>
          {property.subdivision && (
            <span className="text-[8px] text-emerald-300 font-bold bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded border border-emerald-500/40 truncate max-w-[35%]">
              PK {property.subdivision}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
        
        {/* Title */}
        <div>
          <h3
            onClick={() => onSelect(property)}
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors leading-snug"
          >
            {property.title}
          </h3>

          <div className="mt-0.5 flex items-center text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            <MapPin className="w-3 h-3 mr-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>
        </div>

        {/* Key Specs Matrix - Compact 1-line strip */}
        {(property.completionStatus || property.furnitureDetail || property.completionDetail) && (
          <div className="flex items-center gap-1 text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.5 rounded-md truncate">
            <span className="truncate">
              🏠 {property.completionStatus ? property.completionStatus.toUpperCase() : ''} 
              {property.furnitureDetail ? ` • ${property.furnitureDetail}` : ''}
              {property.completionDetail ? ` (${property.completionDetail})` : ''}
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-0.5 py-1 px-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 text-center items-center">
          <div className="flex items-center justify-center gap-0.5 min-w-0">
            <span className="font-extrabold text-slate-900 dark:text-white truncate">{property.area}</span>
            <span className="text-[9px] text-slate-500 shrink-0">m²</span>
          </div>
          
          <div className="flex items-center justify-center gap-0.5 min-w-0 border-x border-slate-200/60 dark:border-slate-700/60 px-0.5">
            <Bed className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold shrink-0">{property.bedrooms}</span>
            <span className="text-[9px] text-slate-500 shrink-0">PN</span>
          </div>

          <div className="flex items-center justify-center gap-0.5 min-w-0">
            <Compass className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-[9px] sm:text-[10px] truncate">{property.direction}</span>
          </div>
        </div>

        {/* Legal & Seller Tag */}
        <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 py-0.5 gap-1">
          <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold truncate shrink-0">
            <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 shrink-0" />
            <span className="truncate max-w-[75px] sm:max-w-[100px]">{t.legal[property.legal] || property.legal}</span>
          </span>
          <span className="text-slate-400 flex items-center gap-1 min-w-0 overflow-hidden">
            <span className={`px-1 py-0.2 rounded text-[8px] font-bold uppercase shrink-0 ${
              property.sellerRole === 'owner' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
              property.sellerRole === 'sale' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
              'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}>
              {property.sellerRole === 'owner' ? 'Chủ' : property.sellerRole === 'sale' ? 'Sale' : 'Sàn'}
            </span>
            <span className="truncate text-[9px] sm:text-[10px]">{property.sellerName}</span>
          </span>
        </div>

        {/* Price & Action Buttons Footer */}
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-1">
          <div className="min-w-0 flex-1">
            <span className="text-[8px] sm:text-[9px] text-slate-400 block font-medium leading-none mb-0.5">Mức giá</span>
            <span className="text-xs sm:text-sm md:text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight block truncate">
              {property.priceDisplay}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {(() => {
              const phoneClean = (property.sellerPhone || '').replace(/\D/g, '');
              const sellerName = property.sellerName || 'Người đăng tin';
              return (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShareModal(true);
                    }}
                    className="p-1 sm:p-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg transition hidden sm:flex"
                    title="Chia sẻ bài đăng lên Group Facebook & Zalo"
                  >
                    <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>

                  {phoneClean && (
                    <>
                      <a
                        href={`https://zalo.me/${phoneClean}?text=Tôi%20quan%20tâm%20căn%3A%20${encodeURIComponent(property.title)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 sm:p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition"
                        title={`Chat Zalo trực tiếp với ${sellerName}`}
                      >
                        <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </a>

                      <a
                        href={`tel:${phoneClean}`}
                        className="p-1 sm:p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition"
                        title={`Gọi trực tiếp ${sellerName}`}
                      >
                        <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </a>
                    </>
                  )}
                </>
              );
            })()}

            <button
              onClick={() => onSelect(property)}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-[11px] font-bold rounded-lg shadow-xs transition shrink-0 whitespace-nowrap"
            >
              Xem Căn
            </button>
          </div>
        </div>

      </div>

      {showShareModal && (
        <SocialShareModal
          title={property.title}
          summary={property.description}
          price={property.priceDisplay}
          location={property.projectName}
          phone={property.sellerPhone}
          url={window.location.href}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

