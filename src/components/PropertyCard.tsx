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
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  language,
  onSelect,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  onOpenUpTinModal
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-md ${
            property.type === 'sale'
              ? 'bg-emerald-600 text-white'
              : 'bg-teal-600 text-white'
          }`}>
            {property.type === 'sale' ? 'CẦN BÁN' : 'CHO THUÊ'}
          </span>

          {/* Pending Approval Badge */}
          {(property.approvalStatus === 'pending' || (property.status === 'pending' && !property.approved)) && (
            <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow flex items-center gap-1 animate-pulse">
              ⏳ TIN CHỜ DUYỆT (HIỂN THỊ TẠM)
            </span>
          )}

          {/* VIP Level Badges */}
          {isVipDiamond && (
            <span className="text-[10px] font-black badge-vip-diamond px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Crown className="w-3 h-3" /> VIP KIM CƯƠNG
            </span>
          )}

          {isVipGold && (
            <span className="text-[10px] font-bold badge-vip-gold px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> VIP VÀNG
            </span>
          )}

          {isVipSilver && (
            <span className="text-[10px] font-bold badge-vip-silver px-2.5 py-1 rounded-lg">
              VIP BẠC
            </span>
          )}

          {/* Up Tin Tag */}
          {!isVipDiamond && !isVipGold && isRecentlyPushed && (
            <span className="text-[10px] font-black badge-uptin px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Zap className="w-3 h-3" /> UP TIN TOP 1
            </span>
          )}

          <span className="text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/30">
            {projectNames[property.project] || property.project}
          </span>
        </div>

        {/* Top Right Actions (Save & Compare & Up-Tin) */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
          {onOpenUpTinModal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenUpTinModal(property);
              }}
              className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[10px] font-bold rounded-lg shadow-md flex items-center gap-1 backdrop-blur-md transition transform active:scale-95"
              title="Thanh toán Up Tin lên đầu"
            >
              <Zap className="w-3 h-3 text-emerald-200" />
              Up Tin
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property);
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-slate-900/60 hover:bg-slate-900 text-white/80 hover:text-white'
            }`}
            title={isSaved ? 'Đã lưu' : 'Lưu tin'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(property);
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition ${
              isCompared
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900/60 hover:bg-slate-900 text-white/80 hover:text-white'
            }`}
            title="So sánh căn"
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Image Overlay Badges */}
        <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-center text-white text-xs font-semibold">
          <span className="bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded text-[11px] text-slate-200">
            {categoryNames[property.category] || property.category}
          </span>
          {property.subdivision && (
            <span className="text-[11px] text-emerald-300 font-bold">
              Phân khu {property.subdivision}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Title */}
        <div>
          <h3
            onClick={() => onSelect(property)}
            className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors leading-snug"
          >
            {property.title}
          </h3>

          <div className="mt-1.5 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>
        </div>

        {/* Key Specs Matrix */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-1">
            <span className="font-extrabold text-slate-900 dark:text-white">{property.area}</span>
            <span className="text-[11px] text-slate-500">m²</span>
          </div>
          
          <div className="flex items-center space-x-1 justify-center">
            <Bed className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold">{property.bedrooms}</span>
            <span className="text-[10px] text-slate-500">{t.propertyCard.bedrooms}</span>
          </div>

          <div className="flex items-center space-x-1 justify-end">
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-[11px] truncate">{property.direction}</span>
          </div>
        </div>

        {/* Legal & Seller Tag */}
        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {t.legal[property.legal] || property.legal}
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
              property.sellerRole === 'owner' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
              property.sellerRole === 'sale' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
              'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}>
              {property.sellerRole === 'owner' ? 'Chủ nhà' : property.sellerRole === 'sale' ? 'Sale' : 'Sàn'}
            </span>
            <span className="truncate max-w-[100px]">{property.sellerName}</span>
          </span>
        </div>

        {/* Price & Action Buttons Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Mức giá</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {property.priceDisplay}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {(() => {
              const phoneClean = (property.sellerPhone || '0868499929').replace(/\D/g, '');
              const sellerName = property.sellerName || 'Người đăng tin';
              return (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShareModal(true);
                    }}
                    className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 rounded-xl transition"
                    title="Chia sẻ bài đăng lên Group Facebook & Zalo"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://zalo.me/${phoneClean}?text=Tôi%20quan%20tâm%20căn%3A%20${encodeURIComponent(property.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl transition"
                    title={`Chat Zalo trực tiếp với ${sellerName} (${property.sellerPhone || '0868.499.929'})`}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <a
                    href={`tel:${phoneClean}`}
                    className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl transition"
                    title={`Gọi trực tiếp người đăng ${sellerName}: ${property.sellerPhone || '0868.499.929'}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </>
              );
            })()}

            <button
              onClick={() => onSelect(property)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              {t.propertyCard.viewDetails}
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

