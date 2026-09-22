import React from 'react';
import { X, Building2, Layers, CheckCircle2, MapPin, Phone, MessageCircle, Calendar, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { SubdivisionSEOInfo } from '../data/subdivisionData';

interface SubdivisionDetailModalProps {
  subdivision: SubdivisionSEOInfo;
  onClose: () => void;
  onConsultClick?: () => void;
}

export const SubdivisionDetailModal: React.FC<SubdivisionDetailModalProps> = ({
  subdivision,
  onClose,
  onConsultClick
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-ink-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-brand-500/30 shadow-2xl overflow-y-auto max-h-[92vh] text-ink-800 dark:text-ink-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-ink-200 dark:border-ink-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-500/20 text-brand-700 dark:text-brand-400 font-extrabold text-[11px] rounded-lg tracking-wider uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>BÀI VIẾT TỔNG QUAN PHÂN KHU CHUẨN SEO</span>
            </div>
            <h2 className="text-2xl font-black text-ink-900 dark:text-white mt-1.5">
              {subdivision.name} — {subdivision.projectName}
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400 flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Phong cách: <b>{subdivision.style}</b></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-ink-100 dark:hover:bg-ink-800 rounded-xl text-ink-500 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Image Preview */}
        {subdivision.images && subdivision.images[0] && (
          <div className="relative rounded-2xl overflow-hidden border border-ink-200 dark:border-ink-800 aspect-[16/9] max-h-64 shadow-md">
            <img loading="lazy"
              src={subdivision.images[0]}
              alt={subdivision.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="bg-brand-500 text-ink-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider">
                QUY MÔ {subdivision.scaleArea}
              </span>
              <p className="text-xs font-bold text-ink-200 mt-1">{subdivision.totalUnits}</p>
            </div>
          </div>
        )}

        {/* Quick Spec Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-2xl border border-brand-200 dark:border-brand-800 text-center">
            <span className="text-ink-500 dark:text-ink-400 block text-[10px] uppercase font-bold">Diện tích phân khu</span>
            <span className="text-sm font-black text-brand-600 dark:text-brand-400">{subdivision.scaleArea}</span>
          </div>

          <div className="p-3 bg-ink-100 dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 text-center">
            <span className="text-ink-500 dark:text-ink-400 block text-[10px] uppercase font-bold">Tổng số sản phẩm</span>
            <span className="text-xs font-bold text-ink-900 dark:text-white">{subdivision.totalUnits}</span>
          </div>

          <div className="p-3 bg-ink-100 dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 text-center col-span-2">
            <span className="text-ink-500 dark:text-ink-400 block text-[10px] uppercase font-bold">Khoảng giá giao dịch</span>
            <span className="text-xs font-black text-brand-600 dark:text-brand-400">{subdivision.priceRange}</span>
          </div>
        </div>

        {/* Description & SEO Details */}
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-4 bg-ink-50 dark:bg-ink-800/80 rounded-2xl border border-ink-200 dark:border-ink-700 space-y-2">
            <h3 className="font-extrabold text-sm text-ink-900 dark:text-white uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-500" />
              MÔ TẢ VỊ TRÍ & ĐẶC ĐIỂM {subdivision.name.toUpperCase()}
            </h3>
            <p className="text-ink-700 dark:text-ink-300">
              {subdivision.description}
            </p>
          </div>

          {/* Average Unit Sizes breakdown */}
          <div className="p-4 bg-ink-900 text-white rounded-2xl border border-ink-800 space-y-3">
            <h3 className="font-extrabold text-xs text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
               DIỆN TÍCH TRUNG BÌNH CÁC LOẠI HÌNH CĂN
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {subdivision.avgUnitSizes.lienKe && (
                <div className="p-2.5 bg-ink-800/90 rounded-xl border border-ink-700">
                  <span className="text-brand-300 font-bold block"> Nhà Liền Kề:</span>
                  <span className="text-ink-200">{subdivision.avgUnitSizes.lienKe}</span>
                </div>
              )}
              {subdivision.avgUnitSizes.shophouse && (
                <div className="p-2.5 bg-ink-800/90 rounded-xl border border-ink-700">
                  <span className="text-brand-300 font-bold block"> Shophouse Thương Mại:</span>
                  <span className="text-ink-200">{subdivision.avgUnitSizes.shophouse}</span>
                </div>
              )}
              {subdivision.avgUnitSizes.songLap && (
                <div className="p-2.5 bg-ink-800/90 rounded-xl border border-ink-700">
                  <span className="text-brand-300 font-bold block"> Biệt Thự Song Lập:</span>
                  <span className="text-ink-200">{subdivision.avgUnitSizes.songLap}</span>
                </div>
              )}
              {subdivision.avgUnitSizes.donLap && (
                <div className="p-2.5 bg-ink-800/90 rounded-xl border border-ink-700">
                  <span className="text-brand-300 font-bold block"> Biệt Thự Đơn Lập:</span>
                  <span className="text-ink-200">{subdivision.avgUnitSizes.donLap}</span>
                </div>
              )}
            </div>
          </div>

          {/* High-Rise Condos Info */}
          <div className="p-4 bg-brand-950/40 border border-brand-500/30 text-brand-200 rounded-2xl space-y-2">
            <h3 className="font-extrabold text-xs text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
               KHU CHUNG CƯ CAO TẦNG PHÂN KHU
            </h3>
            <p className="text-xs text-ink-200 leading-relaxed whitespace-pre-line">
              {subdivision.highRiseCondosInfo}
            </p>
          </div>

          {/* Key Highlights List */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-ink-900 dark:text-white uppercase tracking-wider text-xs">
               ƯU ĐIỂM NỔI BẬT KHÔNG THỂ BỎ QUA:
            </h3>
            <ul className="space-y-1.5">
              {subdivision.highlights.map((h, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <span className="text-ink-700 dark:text-ink-300">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-ink-200 dark:border-ink-800">
          <a
            href="https://zalo.me/0868499929"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Nhận Bảng Hàng & Báo Giá Zalo 0868.499.929</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:0868499929"
              className="px-4 py-3 bg-brand-500 hover:bg-brand-600 text-ink-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              <Phone className="w-4 h-4" />
              <span>Gọi Hotline</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-ink-200 dark:bg-ink-800 hover:bg-ink-300 text-ink-800 dark:text-ink-200 font-bold rounded-xl text-xs transition"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
