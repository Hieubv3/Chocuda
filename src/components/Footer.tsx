import React, { useState } from 'react';
import { Phone, Mail, MapPin, Globe, Facebook, Youtube, ShieldCheck, ExternalLink, Building2, Smartphone, Download, QrCode, X, Utensils, Briefcase, PenLine, Newspaper, Calculator, Info, Eye, MessageCircle } from 'lucide-react';
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
  // Thu gọn liên kết trên di động
  const [showMoreLinks, setShowMoreLinks] = useState(false);

  const linkClass = 'flex items-center gap-1.5 transition cursor-pointer hover:text-brand-400';
  const headClass = 'text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2';

  return (
    <footer className="bg-ink-950 text-ink-200 pt-10 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Logo variant="footer" onClick={() => setCurrentTab('home')} />

            <p className="text-xs text-ink-400 leading-relaxed">
              {t.footer.aboutDesc}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-brand-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Nền tảng BĐS và dịch vụ cư dân Vinhomes uy tín</span>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://facebook.com/chocudan24h"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-500 hover:text-ink-950 flex items-center justify-center transition"
                title="Facebook Chợ Cư Dân 24h"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://zalo.me/0868499929"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-500 hover:text-ink-950 flex items-center justify-center transition font-bold text-xs"
                title="Zalo Chat"
              >
                Zalo
              </a>
              <a
                href="https://tiktok.com/@chocudan24h"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-500 hover:text-ink-950 flex items-center justify-center transition font-bold text-xs"
                title="TikTok Chợ Cư Dân 24h"
              >
                TikTok
              </a>
              <a
                href="https://youtube.com/@chocudan24h"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-500 hover:text-ink-950 flex items-center justify-center transition"
                title="YouTube Chợ Cư Dân 24h"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Key Projects & Resident Groups */}
          <div className={showMoreLinks ? 'space-y-4' : 'space-y-4 hidden md:block'}>
            <h3 className={headClass}>Nhóm cư dân và dự án</h3>
            <ul className="space-y-3 text-xs text-ink-300">
              <li>
                <button onClick={() => setCurrentTab('projects')} className={linkClass}>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                  Cư dân Ocean Park 2, The Empire
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('projects')} className={linkClass}>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                  Cư dân Ocean Park 3, Grand Park
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('projects')} className={linkClass}>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                  Cư dân Ocean Park 1 và Smart City
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('sale')} className={linkClass}>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                  Quỹ shophouse Chà Là và San Hô cắt lỗ
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('services')} className={linkClass}>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                  Chợ cư dân và gian hàng dịch vụ 24/7
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation & Topics */}
          <div className={showMoreLinks ? 'space-y-4' : 'space-y-4 hidden md:block'}>
            <h3 className={headClass}>Chủ đề và liên kết nhanh</h3>
            <ul className="space-y-3 text-xs text-ink-300">
              <li>
                <button onClick={() => setCurrentTab('services')} className={linkClass}>
                  <Utensils className="w-3.5 h-3.5 text-brand-400" />
                  Dịch vụ cư dân và thực phẩm nội khu
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('recruitment')} className="flex items-center gap-1.5 transition cursor-pointer text-brand-300 font-bold hover:text-brand-200">
                  <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                  Làm việc tại Chợ Cư Dân, tuyển dụng
                  <span className="px-1.5 py-0.5 bg-brand-500/20 text-brand-200 text-[10px] rounded font-bold">HOT</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('post-property')} className={linkClass}>
                  <PenLine className="w-3.5 h-3.5 text-brand-400" />
                  Đăng tin bán hoặc cho thuê nhà đất
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('news')} className={linkClass}>
                  <Newspaper className="w-3.5 h-3.5 text-brand-400" />
                  Tin tức và quy hoạch BĐS mới nhất
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('mortgage')} className={linkClass}>
                  <Calculator className="w-3.5 h-3.5 text-brand-400" />
                  Công cụ tính lãi suất vay ngân hàng
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('profile')} className={linkClass}>
                  <Info className="w-3.5 h-3.5 text-brand-400" />
                  Giới thiệu hệ thống Chợ Cư Dân 24H
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Office */}
          <div className="space-y-4">
            <h3 className={headClass}>Văn phòng giao dịch</h3>
            <div className="space-y-3 text-xs text-ink-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Phân khu Chà Là, Vinhomes Ocean Park 2, Văn Giang, Hưng Yên</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <a href="tel:0868499929" className="text-brand-300 font-bold hover:underline block">
                    0868.499.929
                  </a>
                  <span className="text-[10px] text-ink-400 font-medium">
                    Hotline hỗ trợ cư dân đăng tin và quản trị nền tảng
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>hotro.chocudan24h@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="text-ink-100 font-semibold">https://chocudan24h.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Di động: nút mở/thu liên kết để footer gọn hơn */}
        <button
          type="button"
          onClick={() => setShowMoreLinks((v) => !v)}
          className="md:hidden mt-4 w-full py-2 rounded-xl border border-white/10 text-xs font-bold text-brand-300 hover:bg-white/5 transition"
        >
          {showMoreLinks ? 'Thu gọn liên kết' : 'Xem thêm liên kết'}
        </button>

        {/* Khối chung: tải app Android và bộ đếm truy cập */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl transition-all space-y-3.5">
          {!isBannerDismissed && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-ink-950 shadow-md shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-xs truncate">App Android Chợ Cư Dân 24h</span>
                    <span className="px-2 py-0.5 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full text-[10px] font-bold">1,2 MB, cài trong 2 giây</span>
                  </div>
                  <p className="text-[11px] text-ink-400 truncate mt-0.5">
                    Cài trực tiếp lên màn hình chính Android, chạy mượt, không tốn dung lượng.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                <button
                  onClick={onOpenAndroidModal}
                  className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-400 text-ink-950 font-bold rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 text-[11px] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file APK</span>
                </button>
                <button
                  onClick={onOpenAndroidModal}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-brand-500/30 text-brand-200 font-bold rounded-xl transition flex items-center gap-1.5 text-[11px] cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Mã QR</span>
                </button>
                <button
                  onClick={() => setIsBannerDismissed(true)}
                  title="Ẩn thông báo app"
                  className="p-1.5 text-ink-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3.5 text-xs`}>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
              </span>
              <div>
                <span className="text-white font-bold text-xs sm:text-sm block">Bộ đếm lượt truy cập website Chợ Cư Dân 24H</span>
                <p className="text-[11px] text-ink-400">Cập nhật tự động theo lượt xem và tương tác cư dân</p>
              </div>
            </div>

            {(onlineCount > 0 || views > 0 || zaloInteractions > 0) && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-end shrink-0">
                <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                  <span className="text-brand-300 font-bold text-xs sm:text-sm tabular-nums">{onlineCount}</span>
                  <span className="text-ink-300 text-[11px] font-semibold">Đang online</span>
                </div>
                <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-brand-300 font-bold text-xs sm:text-sm tabular-nums">{views.toLocaleString('vi-VN')}</span>
                  <span className="text-ink-300 text-[11px] font-semibold">Tổng lượt xem</span>
                </div>
                <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-sky-300 font-bold text-xs sm:text-sm tabular-nums">{zaloInteractions.toLocaleString('vi-VN')}</span>
                  <span className="text-ink-300 text-[11px] font-semibold">Tương tác Zalo</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bộ Công Thương */}
        <div className="mt-8 p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-xs text-ink-300">
            <div className="w-16 h-16 bg-red-950/60 rounded-2xl border border-red-600/60 flex flex-col items-center justify-center text-center p-1 shrink-0">
              <span className="text-[9px] font-bold text-red-300 uppercase leading-none">Đã thông báo</span>
              <div className="w-6 h-6 my-0.5 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-[10px]">★</div>
              <span className="text-[8px] font-bold text-ink-300 leading-none">Bộ Công Thương</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-red-500/15 text-red-300 border border-red-500/40 rounded text-[10px] font-bold uppercase tracking-wider">
                  Đã đăng ký sàn TMĐT, MXH Bộ Công Thương
                </span>
                <span className="text-ink-400 text-[11px]">Mã số chứng nhận: <strong className="text-ink-200">418/GP-BCT</strong></span>
              </div>
              <p className="text-[11px] text-ink-400 leading-relaxed">
                <strong className="text-ink-200">Sở Kế hoạch và Đầu tư Hà Nội:</strong> ĐKKD số 0109882341 do SKHĐT Hà Nội cấp lần đầu ngày 12/10/2021.
              </p>
              <p className="text-[10px] text-ink-500">
                Chịu trách nhiệm nội dung: Ban quản trị hệ thống Chợ Cư Dân 24H (chocudan24h.com).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="http://online.gov.vn"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-600/50 rounded-xl transition text-red-200 text-xs font-bold"
            >
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>Cổng thông tin Bộ Công Thương</span>
            </a>
          </div>
        </div>

        {/* Tuyên bố miễn trừ trách nhiệm */}
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 text-xs text-ink-400">
          <div className="flex items-center gap-2 text-brand-300 font-bold uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
            <span>Tuyên bố miễn trừ trách nhiệm</span>
          </div>
          <p className="text-[11px] leading-relaxed text-ink-400">
            Thông tin, giá bán, vị trí và hình ảnh các dự án, bất động sản trên website <strong className="text-ink-200">chocudan24h.com</strong> được tổng hợp từ chủ nhà, chủ đầu tư và các nguồn đối tác đáng tin cậy. Thông tin chỉ mang tính chất tham khảo và có thể thay đổi theo thời điểm mà không cần thông báo trước. Quý khách hàng và nhà đầu tư vui lòng đối chiếu trực tiếp hồ sơ pháp lý, thực tế căn nhà và thông tin từ chủ sở hữu trước khi thực hiện các giao dịch đặt cọc hoặc mua bán. Chúng tôi không chịu trách nhiệm pháp lý cho các quyết định tài chính dựa trên nội dung tham khảo này.
          </p>
        </div>

        {/* Bottom copyright & domain verification */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-ink-500">
          <p>{t.footer.rights}</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={() => {
                setCurrentTab('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-brand-300 font-semibold transition cursor-pointer"
            >
              Chính sách bảo mật
            </button>
            <span className="text-white/20">•</span>
            <button
              onClick={() => {
                setCurrentTab('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-brand-300 font-semibold transition cursor-pointer"
            >
              Điều khoản sử dụng
            </button>
            <span className="text-white/20">•</span>
            <a href="/sitemap" className="hover:text-brand-300 font-semibold transition">
              Sơ đồ website
            </a>
            <span className="text-white/20">•</span>
            <span className="text-brand-400 font-semibold">SSL Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
