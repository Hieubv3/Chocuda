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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-amber-500/30 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-800 dark:text-slate-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-400 font-extrabold text-[11px] rounded-lg tracking-wider uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>BÀI VIẾT TỔNG QUAN PHÂN KHU CHUẨN SEO</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
              {subdivision.name} — {subdivision.projectName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Phong cách: <b>{subdivision.style}</b></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Image Preview */}
        {subdivision.images && subdivision.images[0] && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/9] max-h-64 shadow-md">
            <img loading="lazy"
              src={subdivision.images[0]}
              alt={subdivision.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider">
                QUY MÔ {subdivision.scaleArea}
              </span>
              <p className="text-xs font-bold text-slate-200 mt-1">{subdivision.totalUnits}</p>
            </div>
          </div>
        )}

        {/* Quick Spec Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Diện tích phân khu</span>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400">{subdivision.scaleArea}</span>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Tổng số sản phẩm</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{subdivision.totalUnits}</span>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center col-span-2">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Khoảng giá giao dịch</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{subdivision.priceRange}</span>
          </div>
        </div>

        {/* Description & SEO Details */}
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-500" />
              MÔ TẢ VỊ TRÍ & ĐẶC ĐIỂM {subdivision.name.toUpperCase()}
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              {subdivision.description}
            </p>
          </div>

          {/* Average Unit Sizes breakdown */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              📐 DIỆN TÍCH TRUNG BÌNH CÁC LOẠI HÌNH CĂN
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {subdivision.avgUnitSizes.lienKe && (
                <div className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700">
                  <span className="text-amber-300 font-bold block">🏠 Nhà Liền Kề:</span>
                  <span className="text-slate-200">{subdivision.avgUnitSizes.lienKe}</span>
                </div>
              )}
              {subdivision.avgUnitSizes.shophouse && (
                <div className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700">
                  <span className="text-amber-300 font-bold block">🏬 Shophouse Thương Mại:</span>
                  <span className="text-slate-200">{subdivision.avgUnitSizes.shophouse}</span>
                </div>
              )}
              {subdivision.avgUnitSizes.songLap && (
                <div className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700">
                  <span className="text-amber-300 font-bold block">🏡 Biệt Thự Song Lập:</span>
                  <span className="text-slate-200">{subdivision.avgUnitSizes.songLap}</span>
                </div>
              )}
              {subdivision.avgUnitSizes.donLap && (
                <div className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700">
                  <span className="text-amber-300 font-bold block">🏰 Biệt Thự Đơn Lập:</span>
                  <span className="text-slate-200">{subdivision.avgUnitSizes.donLap}</span>
                </div>
              )}
            </div>
          </div>

          {/* High-Rise Condos Info */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 rounded-2xl space-y-2">
            <h3 className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              🏢 KHU CHUNG CƯ CAO TẦNG PHÂN KHU
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {subdivision.highRiseCondosInfo}
            </p>
          </div>

          {/* Key Highlights List */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              🌟 ƯU ĐIỂM NỔI BẬT KHÔNG THỂ BỎ QUA:
            </h3>
            <ul className="space-y-1.5">
              {subdivision.highlights.map((h, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
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
              className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              <Phone className="w-4 h-4" />
              <span>Gọi Hotline</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
