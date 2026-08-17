import React, { useState } from 'react';
import { Phone, Mail, MapPin, Globe, Facebook, Youtube, ShieldCheck, ExternalLink, Lock, Building2, Smartphone, Download, QrCode, Sparkles, X } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../lib/i18n';
import { Logo } from './Logo';
import { useVisitorStats } from '../lib/visitorStats';

interface FooterProps {
  language: Language;
  setCurrentTab: (tab: string) => void;
  onOpenSecretAdmin: () => void;
  onOpenAndroidModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ language, setCurrentTab, onOpenSecretAdmin, onOpenAndroidModal }) => {
  const t = getTranslation(language);
  const { views, zaloInteractions, onlineCount } = useVisitorStats();
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Logo variant="footer" onClick={() => setCurrentTab('home')} />
            
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footer.aboutDesc}
            </p>

            <div className="pt-2 flex items-center space-x-2 text-xs text-amber-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Nền Tảng BĐS & Dịch Vụ Cư Dân Vinhomes Uy Tín</span>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center space-x-3">
              <a
                href="https://facebook.com/chocudan24h"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center transition"
                title="Facebook Chợ Cư Dân 24h"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://zalo.me/0868499929"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center transition font-black text-xs"
                title="Zalo Chat"
              >
                Zalo
              </a>
              <a
                href="https://tiktok.com/@chocudan24h"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center transition font-bold text-xs"
                title="TikTok Chợ Cư Dân 24h"
              >
                TikTok
              </a>
              <a
                href="https://youtube.com/@chocudan24h"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center transition"
                title="YouTube Chợ Cư Dân 24h"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Key Projects & Resident Groups */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
              GROUP CƯ DÂN & DỰ ÁN
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => setCurrentTab('projects')}
                  className="hover:text-amber-400 flex items-center transition cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5 text-amber-500" />
                  Cư Dân Ocean Park 2 - The Empire
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('projects')}
                  className="hover:text-amber-400 flex items-center transition cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5 text-amber-500" />
                  Cư Dân Ocean Park 3 - Grand Park
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('projects')}
                  className="hover:text-amber-400 flex items-center transition cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5 text-amber-500" />
                  Cư Dân Ocean Park 1 & Smart City
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('sale')}
                  className="hover:text-amber-400 flex items-center transition cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5 text-amber-500" />
                  Quỹ Shophouse Chà Là & San Hô Cắt Lỗ
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('services')}
                  className="hover:text-amber-400 flex items-center transition cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5 text-amber-500" />
                  Chợ Cư Dân & Gian Hàng Dịch Vụ 24/7
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation & Topics */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
              CHỦ ĐỀ & LIÊN KẾT NHANH
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button onClick={() => setCurrentTab('services')} className="hover:text-amber-400 transition cursor-pointer">
                  🍲 Dịch Vụ Cư Dân & Thực Phẩm Nội Khu
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('recruitment')} className="hover:text-amber-400 text-teal-400 font-bold flex items-center gap-1.5 transition cursor-pointer">
                  💼 Làm Việc Tại Chợ Cư Dân (Tuyển Dụng)
                  <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-300 text-[10px] rounded-sm font-black">HOT</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('post-property')} className="hover:text-amber-400 transition cursor-pointer">
                  ✍️ Đăng tin bài bán / Cho thuê nhà đất
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('news')} className="hover:text-amber-400 transition cursor-pointer">
                  📰 Tin tức & Quy hoạch BĐS mới nhất
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('mortgage')} className="hover:text-amber-400 transition cursor-pointer">
                  💰 Công cụ tính lãi suất vay ngân hàng
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('profile')} className="hover:text-amber-400 transition cursor-pointer">
                  ℹ️ Giới thiệu hệ thống Chợ Cư Dân 24H
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Office */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
              VĂN PHÒNG GIAO DỊCH
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Phân khu Chà Là, Vinhomes Ocean Park 2, Văn Giang, Hưng Yên</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <a href="tel:0868499929" className="text-amber-400 font-bold hover:underline block">
                    0868.499.929
                  </a>
                  <span className="text-[10px] text-slate-400 font-medium">
                    (Hotline hỗ trợ cư dân đăng tin & quản trị nền tảng)
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>hotro.chocudan24h@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Globe className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-slate-200 font-semibold">https://chocudan24h.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Combined Unified Box: Android App Download + Real-Time Website Traffic Counter */}
        <div className="mt-8 p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-2xl shadow-xl transition-all space-y-3.5 divide-y divide-slate-800/80">
          
          {/* Row 1: Android App Download Banner */}
          {!isBannerDismissed && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pb-1">
              
              {/* Left Column: Icon & Info */}
              <div className="flex items-center space-x-3 w-full sm:w-auto min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-md shrink-0">
                  <Smartphone className="w-5 h-5 stroke-[2.5]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-white text-xs truncate">
                      App Android Chợ Cư Dân 24h
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                      1.2 MB • Cài Đặt 2s
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    Cài đặt trực tiếp lên màn hình chính Android, mượt mà 100%, không tốn dung lượng.
                  </p>
                </div>
              </div>

              {/* Right Column: Download Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                <button
                  onClick={onOpenAndroidModal}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 text-[11px] uppercase tracking-wide cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>TẢI FILE APK</span>
                </button>

                <button
                  onClick={onOpenAndroidModal}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl transition flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>MÃ QR</span>
                </button>

                <button
                  onClick={() => setIsBannerDismissed(true)}
                  title="Ẩn thông báo app"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* Row 2: Website Access & Real-Time Traffic Counter */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3.5 text-xs ${!isBannerDismissed ? 'pt-3.5' : ''}`}>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-white font-black text-xs sm:text-sm tracking-wide block">BỘ ĐẾM LƯỢT TRUY CẬP WEBSITE CHỢ CƯ DÂN 24H</span>
                <p className="text-[11px] text-slate-400">Được cập nhật tự động thời gian thực theo lượt xem & tương tác cư dân</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-end shrink-0">
              <div className="px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700/80 flex items-center gap-2 shadow-xs">
                <span className="text-emerald-400 font-extrabold text-xs sm:text-sm">🟢 {onlineCount}</span>
                <span className="text-slate-300 text-[11px] font-semibold">Đang Online</span>
              </div>

              <div className="px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700/80 flex items-center gap-2 shadow-xs">
                <span className="text-amber-400 font-extrabold text-xs sm:text-sm">👁️ {views.toLocaleString('vi-VN')}</span>
                <span className="text-slate-300 text-[11px] font-semibold">Tổng lượt xem</span>
              </div>

              <div className="px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700/80 flex items-center gap-2 shadow-xs">
                <span className="text-blue-400 font-extrabold text-xs sm:text-sm">💬 {zaloInteractions.toLocaleString('vi-VN')}</span>
                <span className="text-slate-300 text-[11px] font-semibold">Tương tác Zalo</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bộ Công Thương License & Registration Certificate Section */}
        <div className="mt-8 p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="w-16 h-16 bg-red-950/80 rounded-2xl border-2 border-red-600/80 flex flex-col items-center justify-center text-center p-1 shrink-0 shadow-lg relative group">
              <span className="text-[9px] font-black text-red-400 uppercase leading-none">ĐÃ THÔNG BÁO</span>
              <div className="w-6 h-6 my-0.5 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-[10px]">
                ★
              </div>
              <span className="text-[8px] font-bold text-slate-300 leading-none">BỘ CÔNG THƯƠNG</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[10px] font-black uppercase tracking-wider">
                  ĐÃ ĐĂNG KÝ SÀN TMĐT / MXH BỘ CÔNG THƯƠNG
                </span>
                <span className="text-slate-400 text-[11px]">Mã số chứng nhận: <strong>418/GP-BCT</strong></span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong>Sở Kế hoạch & Đầu tư Hà Nội:</strong> ĐKKD số 0109882341 do SKHĐT Hà Nội cấp lần đầu ngày 12/10/2021.
              </p>
              <p className="text-[10px] text-slate-500">
                Chịu trách nhiệm nội dung: Ban Quản Trị Hệ Thống Chợ Cư Dân 24H (chocudan24h.com).
              </p>
            </div>
          </div>

          {/* Official Seals */}
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="http://online.gov.vn" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-600/50 rounded-xl transition text-red-300 text-xs font-bold"
            >
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Cổng Thông Tin Bộ Công Thương</span>
            </a>
          </div>
        </div>

        {/* Disclaimer Section / Tuyên bố miễn trừ trách nhiệm */}
        <div className="mt-10 p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-amber-400 font-extrabold uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM (DISCLAIMER)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Thông tin, giá bán, vị trí và hình ảnh các dự án/bất động sản trên website <strong>chocudan24h.com</strong> được tổng hợp từ chủ nhà, chủ đầu tư và các nguồn đối tác đáng tin cậy. Thông tin chỉ mang tính chất tham khảo và có thể thay đổi theo thời điểm mà không cần thông báo trước. Quý khách hàng & nhà đầu tư vui lòng đối chiếu trực tiếp hồ sơ pháp lý, thực tế căn nhà và thông tin từ chủ sở hữu trước khi thực hiện các giao dịch đặt cọc hoặc mua bán. Chúng tôi không chịu trách nhiệm pháp lý cho các quyết định tài chính dựa trên nội dung tham khảo này.
          </p>
        </div>

        {/* Bottom copyright & domain verification */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>{t.footer.rights}</p>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
            <button
              onClick={() => {
                setCurrentTab('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-amber-400 font-semibold transition cursor-pointer"
            >
              Chính sách bảo mật (Privacy Policy)
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setCurrentTab('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-amber-400 font-semibold transition cursor-pointer"
            >
              Điều khoản sử dụng
            </button>
            <span>•</span>
            <span className="text-amber-500 font-semibold">SSL Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
