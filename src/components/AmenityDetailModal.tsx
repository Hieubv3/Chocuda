import React from 'react';
import { X, Award, CheckCircle2, Sparkles, Phone, MessageCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { AmenitySEOInfo } from '../data/subdivisionData';

interface AmenityDetailModalProps {
  amenity: AmenitySEOInfo;
  onClose: () => void;
}

export const AmenityDetailModal: React.FC<AmenityDetailModalProps> = ({
  amenity,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-amber-500/30 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-800 dark:text-slate-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-400 font-extrabold text-[11px] rounded-lg tracking-wider uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>BÀI VIẾT BÁO CHÍ & TỔNG QUAN TIỆN ÍCH ĐẲNG CẤP</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
              {amenity.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Phân loại: <b>{amenity.category}</b> • Quy mô: <b>{amenity.scale}</b></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Amenity Image */}
        {amenity.image && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/9] max-h-64 shadow-md">
            <img
              src={amenity.image}
              alt={amenity.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {amenity.status}
              </span>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
          {amenity.summary}
        </div>

        {/* Detailed SEO Markdown Content */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-amber-500">
              CHI TIẾT VỀ {amenity.name.toUpperCase()}
            </h3>
            <div className="whitespace-pre-line leading-relaxed text-slate-800 dark:text-slate-200">
              {amenity.contentSEO}
            </div>
          </div>

          {/* Highlights List */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              🌟 ĐIỂM CỘNG TIỆN ÍCH DÀNH CHO CƯ DÂN:
            </h3>
            <ul className="space-y-1.5">
              {amenity.highlights.map((h, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{h}</span>
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
            <span>Tư Vấn Đi Xem Thực Tế Lịch Zalo 0868.499.929</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:0868499929"
              className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              <Phone className="w-4 h-4" />
              <span>Hotline 24/7</span>
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
