import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Send, Globe, Users, ExternalLink, Sparkles } from 'lucide-react';

interface SocialShareModalProps {
  title: string;
  url?: string;
  summary?: string;
  price?: string;
  location?: string;
  phone?: string;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ 
  title, 
  url = window.location.href, 
  summary,
  price,
  location,
  phone = '',
  onClose 
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedGroupText, setCopiedGroupText] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`[Chợ Cư Dân 24H Vinhomes] ${title}`);

  // Structured Post formatted for Facebook / Zalo Groups
  const groupFormattedPost = `🔥 [ĐĂNG LẠI TỪ CHỢ CƯ DÂN 24H VINHOMES]
📌 ${title.toUpperCase()}
${price ? `💰 Mức giá: ${price}\n` : ''}${location ? `📍 Vị trí: ${location}\n` : ''}${summary ? `📝 Mô tả ngắn: ${summary.slice(0, 150)}...\n` : ''}
👉 Xem bài đăng chi tiết & liên hệ chính chủ tại:
🔗 ${url}
${phone ? `\n📞 Liên hệ/Zalo: ${phone}` : ''}
#Chocudan24h #Vinhomes #BatDongSanVinhomes #MuabanBDS`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyGroupText = () => {
    navigator.clipboard.writeText(groupFormattedPost);
    setCopiedGroupText(true);
    setTimeout(() => setCopiedGroupText(false), 2500);
  };

  const shareFacebookFeed = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };

  const shareFacebookGroup = () => {
    // Copy group post format to clipboard first, then open Facebook Groups
    navigator.clipboard.writeText(groupFormattedPost);
    setCopiedGroupText(true);
    setTimeout(() => setCopiedGroupText(false), 2500);
    window.open(`https://www.facebook.com/groups/`, '_blank');
  };

  const shareZaloGroup = () => {
    // Copy group post format to clipboard first, then open Zalo Share / Web
    navigator.clipboard.writeText(groupFormattedPost);
    setCopiedGroupText(true);
    setTimeout(() => setCopiedGroupText(false), 2500);
    window.open(`https://chat.zalo.me/`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-5 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight">CHIA SẺ LÊN GROUP FACEBOOK & ZALO</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 px-2 font-medium">
            "{title}"
          </p>
        </div>

        {/* Primary Social Group Action Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            1. Chọn Kênh Chia Sẻ Trực Tiếp:
          </span>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareFacebookGroup}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-lg hover:scale-[1.02]"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Group Facebook</span>
            </button>

            <button
              onClick={shareZaloGroup}
              className="p-3 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-lg hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>Group Zalo</span>
            </button>

            <button
              onClick={shareFacebookFeed}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <Globe className="w-4 h-4" /> Trang Cánhân FB
            </button>

            <button
              onClick={shareTelegram}
              className="p-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <Send className="w-4 h-4" /> Telegram
            </button>
          </div>
        </div>

        {/* Formatted Group Post Auto Copy Block */}
        <div className="space-y-2 p-3.5 bg-amber-500/10 dark:bg-amber-500/5 rounded-2xl border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Nội Dung Định Dạng Sẵn Để Đăng Group:
            </span>
            <button
              onClick={handleCopyGroupText}
              className={`px-3 py-1.5 text-xs font-black rounded-xl flex items-center gap-1 transition ${
                copiedGroupText
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              {copiedGroupText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedGroupText ? 'Đã Sao Chép!' : 'Copy Bài Viết'}
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed line-clamp-4">
            {groupFormattedPost}
          </p>
        </div>

        {/* Direct Link Input & Copy */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Liên kết bài đăng chính thức:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-mono truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 font-bold text-xs rounded-xl flex items-center gap-1 transition shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã chép' : 'Sao chép Link'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

