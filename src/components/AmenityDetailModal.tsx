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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-ink-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-brand-500/30 shadow-2xl overflow-y-auto max-h-[92vh] text-ink-800 dark:text-ink-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-ink-200 dark:border-ink-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-500/20 text-brand-700 dark:text-brand-400 font-extrabold text-[11px] rounded-lg tracking-wider uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>BÀI VIẾT BÁO CHÍ & TỔNG QUAN TIỆN ÍCH ĐẲNG CẤP</span>
            </div>
            <h2 className="text-2xl font-black text-ink-900 dark:text-white mt-1.5">
              {amenity.name}
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400 flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Phân loại: <b>{amenity.category}</b> • Quy mô: <b>{amenity.scale}</b></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-ink-100 dark:hover:bg-ink-800 rounded-xl text-ink-500 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Amenity Image */}
        {amenity.image && (
          <div className="relative rounded-2xl overflow-hidden border border-ink-200 dark:border-ink-800 aspect-[16/9] max-h-64 shadow-md">
            <img loading="lazy"
              src={amenity.image}
              alt={amenity.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="bg-brand-500 text-ink-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider">
                {amenity.status}
              </span>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="p-4 bg-brand-50 dark:bg-brand-950/40 rounded-2xl border border-brand-200 dark:border-brand-800 text-xs text-brand-900 dark:text-brand-200 leading-relaxed font-medium">
          {amenity.summary}
        </div>

        {/* Detailed SEO Markdown Content */}
        <div className="space-y-4 text-xs leading-relaxed text-ink-700 dark:text-ink-300">
          <div className="p-5 bg-ink-50 dark:bg-ink-800/80 rounded-2xl border border-ink-200 dark:border-ink-700 space-y-3">
            <h3 className="font-extrabold text-sm text-ink-900 dark:text-white uppercase tracking-wider text-brand-500">
              CHI TIẾT VỀ {amenity.name.toUpperCase()}
            </h3>
            <div className="whitespace-pre-line leading-relaxed text-ink-800 dark:text-ink-200">
              {amenity.contentSEO}
            </div>
          </div>

          {/* Highlights List */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-ink-900 dark:text-white uppercase tracking-wider text-xs">
               ĐIỂM CỘNG TIỆN ÍCH DÀNH CHO CƯ DÂN:
            </h3>
            <ul className="space-y-1.5">
              {amenity.highlights.map((h, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <span className="text-ink-700 dark:text-ink-300 font-semibold">{h}</span>
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
            <span>Tư Vấn Đi Xem Thực Tế Lịch Zalo 0868.499.929</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:0868499929"
              className="px-4 py-3 bg-brand-500 hover:bg-brand-600 text-ink-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              <Phone className="w-4 h-4" />
              <span>Hotline 24/7</span>
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
