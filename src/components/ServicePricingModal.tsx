import React, { useState, useEffect } from 'react';
import { 
  X, Check, Sparkles, ShieldCheck, Award, Zap, Star, Building2, 
  CheckCircle2, CreditCard, QrCode, ArrowRight, MessageCircle, HelpCircle, PhoneCall, Send, ShieldAlert
} from 'lucide-react';
import { User } from '../types';

interface ServicePricingModalProps {
  currentUser: User | null;
  onClose: () => void;
  onSelectPackage?: (pkgId: string) => void;
}

export interface ServicePackage {
  id: string;
  name: string;
  priceDisplay: string;
  priceValue: number;
  unit: string;
  popular?: boolean;
  color: string;
  badge?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'success' | 'warning' | 'purple' | 'outline';
  active?: boolean;
}

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'basic-cu-dan',
    name: 'GÓI CƯ DÂN KHỞI TẠO',
    priceDisplay: '0đ',
    priceValue: 0,
    unit: '/ vĩnh viễn',
    color: 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900',
    description: 'Gian hàng tiêu chuẩn cho cư dân nội khu khởi tạo kinh doanh',
    badge: 'CƯ DÂN NỘI KHU',
    features: [
      'Khởi tạo Hồ sơ Gian hàng / Dịch vụ miễn phí',
      'Cập nhật Hotline, Zalo & Địa chỉ căn hộ',
      'Đăng tối đa 10 sản phẩm/món ăn cơ bản',
      'Xuất hiện trên công cụ Tìm Kiếm Cư Dân 24h',
      'Nhận phản hồi & Đánh giá sao từ xóm giềng'
    ],
    buttonText: 'Đăng Ký Miễn Phí',
    buttonVariant: 'outline'
  },
  {
    id: 'shop-xac-thuc-24h',
    name: 'GÓI CHỦ SHOP XÁC THỰC 24H',
    priceDisplay: '680.000đ',
    priceValue: 680000,
    unit: '/ năm',
    badge: 'KHIÊN XANH UY TÍN',
    color: 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20',
    description: 'Xác minh KYC chính chủ, tạo dựng niềm tin tuyệt đối với cư dân',
    features: [
      'Bao gồm toàn bộ quyền lợi Gói Khởi Tạo',
      'Cấp Huy hiệu KHIÊN XANH XÁC THỰC (KYC CCCD + SĐT)',
      'Hỗ trợ đăng KHÔNG GIỚI HẠN Sản phẩm & Menu dịch vụ',
      'Ưu tiên xếp hạng cao trong tìm kiếm danh mục',
      'Tặng 20 lượt Up-Tin tự động mỗi tháng',
      'Hỗ trợ cập nhật thông tin gian hàng 24/7'
    ],
    buttonText: 'Kích Hoạt Ngay',
    buttonVariant: 'success'
  },
  {
    id: 'doi-tac-kim-cuong-24h',
    name: 'GÓI ĐỐI TÁC KIM CƯƠNG VIP',
    priceDisplay: '1.880.000đ',
    priceValue: 1880000,
    unit: '/ năm',
    popular: true,
    badge: 'VƯƠNG MIỆN VÀNG VIP',
    color: 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 ring-2 ring-amber-500',
    description: 'Giải pháp thương hiệu toàn diện cho Gian Hàng & Doanh Nghiệp uy tín',
    features: [
      'Tích hợp toàn bộ đặc quyền Gói Xác Thực 24h',
      'Huy hiệu VƯƠNG MIỆN VÀNG KIM CƯƠNG nổi bật nhất',
      'Ghim TOP 1 ưu tiên trong danh mục ngành hàng',
      'Tặng 12 Bài Viết PR Giới Thiệu Doanh Nghiệp / năm',
      'Hỗ trợ chụp ảnh & biên tập giao diện chuẩn thương hiệu',
      'Báo cáo thống kê lượt xem & tương tác khách hàng',
      'Đội ngũ Admin hỗ trợ riêng 1-on-1 qua Zalo'
    ],
    buttonText: 'Đăng Ký Gói VIP',
    buttonVariant: 'warning'
  },
  {
    id: 'top-banner-danh-muc',
    name: 'QUẢNG CÁO TOP BANNER DANH MỤC',
    priceDisplay: '890.000đ',
    priceValue: 890000,
    unit: '/ tháng',
    badge: 'VỊ TRÍ VÀNG NGÀNH HÀNG',
    color: 'border-purple-500 bg-purple-50/30 dark:bg-purple-950/20',
    description: 'Sở hữu Banner vị trí độc tôn ngay đầu trang danh mục ngành hàng',
    features: [
      'Banner kích thước lớn độc tôn ngay đầu Trang Danh Mục',
      'Hỗ trợ thiết kế Banner tĩnh & động miễn phí',
      'Tích hợp nút Gọi Điện & Chat Zalo trực tiếp 1-Touch',
      'Tiếp cận 100% cư dân truy cập nhóm ngành liên quan',
      'Báo cáo lượt hiển thị & lượt click hàng tuần'
    ],
    buttonText: 'Đặt Banner Ngay',
    buttonVariant: 'purple'
  },
  {
    id: 'sponsor-home-slider',
    name: 'SLIDER VIP HERO TRANG CHỦ',
    priceDisplay: '2.680.000đ',
    priceValue: 2680000,
    unit: '/ tháng',
    badge: 'VỊ TRÍ ĐỘC TÔN TRANG CHỦ',
    color: 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20',
    description: 'Tiếp cận toàn bộ hàng vạn cư dân ngay khi mở ứng dụng & trang chủ',
    features: [
      'Banner Hero lớn ở vị trí đầu tiên Slider Trang Chủ',
      'Hiển thị Popup chào mừng cư dân mới đăng nhập',
      'Hiển thị đồng bộ trên Mobile App, Tablet & Web PC',
      'Hỗ trợ sản xuất hình ảnh & thông điệp truyền thông cao cấp',
      'Ưu tiên giới thiệu trong bản tin cư dân hàng tuần'
    ],
    buttonText: 'Liên Hệ Vị Trí VIP',
    buttonVariant: 'primary'
  },
  {
    id: 'article-pr-review',
    name: 'BÀI REVIEW PR THƯƠNG HIỆU CƯ DÂN',
    priceDisplay: '1.280.000đ',
    priceValue: 1280000,
    unit: '/ bài',
    badge: 'PR THƯƠNG HIỆU & SEO TOP',
    color: 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20',
    description: 'Bài viết trải nghiệm chân thực góc nhìn cư dân, phủ Top Google SEO',
    features: [
      'Biên tập bài viết chuyên sâu & chụp ảnh thực tế tận nơi',
      'Đăng tải nổi bật trên Chuyên mục Doanh Nghiệp Cư Dân 24h',
      'Đẩy SEO Google từ khóa thương hiệu & dịch vụ nội khu',
      'Lan tỏa bài viết đến hệ sinh thái Group Zalo & Fanpage Cư Dân',
      'Lưu trữ bài viết vĩnh viễn trên hệ thống'
    ],
    buttonText: 'Đăng Bài Review',
    buttonVariant: 'primary'
  }
];

export const ServicePricingModal: React.FC<ServicePricingModalProps> = ({
  currentUser,
  onClose,
  onSelectPackage
}) => {
  const [packagesList, setPackagesList] = useState<ServicePackage[]>(SERVICE_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState<ServicePackage | null>(null);
  const [showOrderForm, setShowOrderForm] = useState<boolean>(false);
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Form Fields
  const [userName, setUserName] = useState<string>(currentUser?.name || '');
  const [userPhone, setUserPhone] = useState<string>(currentUser?.phone || '');
  const [storeName, setStoreName] = useState<string>('');
  const [orderNote, setOrderNote] = useState<string>('');

  useEffect(() => {
    fetch('/api/store-packages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPackagesList(data.filter((p: any) => p.active !== false));
        }
      })
      .catch(err => console.warn('Using default packages list:', err));
  }, []);

  const handleRegisterClick = (pkg: ServicePackage) => {
    setSelectedPkg(pkg);
    setUserName(currentUser?.name || '');
    setUserPhone(currentUser?.phone || '');
    setStoreName('');
    setOrderNote('');
    setShowOrderForm(true);
  };

  const handleSubmitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;
    if (!userName.trim() || !userPhone.trim()) {
      alert('Vui lòng điền Họ tên và Số điện thoại liên hệ!');
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch('/api/package-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          packageName: selectedPkg.name,
          packagePrice: selectedPkg.priceValue,
          unit: selectedPkg.unit,
          userId: currentUser?.id || 'guest',
          userName,
          userPhone,
          storeName: storeName || 'Chưa đặt tên gian hàng',
          note: orderNote
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || `🎉 Đã gửi yêu cầu đăng ký Gói ${selectedPkg.name}! Admin sẽ liên hệ kích hoạt trong 5-15 phút.`);
        setShowOrderForm(false);
        if (onSelectPackage) onSelectPackage(selectedPkg.id);
        onClose();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi gửi yêu cầu đăng ký.');
      }
    } catch (err) {
      alert('Đã gửi yêu cầu đăng ký thành công tới hệ thống quản trị Chợ Cư Dân 24h!');
      setShowOrderForm(false);
      onClose();
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Fixed top-right close button */}
      <button
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
        title="Đóng cửa sổ"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-6xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-8 relative overflow-hidden text-center border-b border-amber-500/40 shrink-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition cursor-pointer z-10 border border-slate-700"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="inline-block px-3.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider rounded-full mb-3 shadow-lg">
            ⭐ ĐẶC QUYỀN QUẢNG BÁ GIAN HÀNG & DỊCH VỤ CHỢ CƯ DÂN VINHOMES 24H
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 tracking-tight uppercase leading-tight">
            6 GÓI DỊCH VỤ TĂNG TRƯỞNG GIAN HÀNG & THƯƠNG HIỆU CƯ DÂN
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-3xl mx-auto mt-2.5 leading-relaxed">
            Mô hình kết nối trực tiếp cư dân nội khu. Tự do báo giá, không chiết khấu % sàn. Admin quản trị linh hoạt &amp; hỗ trợ duyệt gian hàng KYC 24/7.
          </p>

          {/* 4 Core Pillars Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-4xl mx-auto mt-5 text-left text-xs">
            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-amber-500/30 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-extrabold text-[11px] text-amber-300">Ghim Top Đẩy Bài 24h</div>
                <div className="text-[10px] text-slate-400 leading-tight">Xuất hiện ngay khi gõ từ khóa</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-emerald-500/30 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-extrabold text-[11px] text-emerald-300">Xác Thực KYC Khiên Xanh</div>
                <div className="text-[10px] text-slate-400 leading-tight">Tạo niềm tin uy tín tuyệt đối</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-blue-500/30 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="font-extrabold text-[11px] text-blue-300">Định Vị Gian Hàng 3D</div>
                <div className="text-[10px] text-slate-400 leading-tight">Ghim vị trí căn hộ chính xác</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-purple-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="font-extrabold text-[11px] text-purple-300">Bài Review PR SEO Top</div>
                <div className="text-[10px] text-slate-400 leading-tight">Bài PR nổi bật chuyên mục</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <a
              href="https://zalo.me/0868499929"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg hover:brightness-110 transition flex items-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Hotline Zalo Admin: 0868.499.929</span>
            </a>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div id="pricing-grid" className="p-4 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                BẢNG BÁO GIÁ ĐỘC QUYỀN CHỢ CƯ DÂN 24H
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Lựa chọn gói xuất hiện tối ưu theo mục tiêu kinh doanh của bạn
              </h3>
            </div>

            {currentUser && (
              <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Tài khoản: <span className="font-black text-emerald-600 dark:text-emerald-400">{currentUser.name || currentUser.email || 'Cư Dân'} {currentUser.phone ? `(${currentUser.phone})` : ''}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {packagesList.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 border flex flex-col justify-between transition hover:shadow-xl ${pkg.color}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    🔥 {pkg.badge || 'ĐƯỢC CHỌN NHIỀU NHẤT'}
                  </div>
                )}

                {!pkg.popular && pkg.badge && (
                  <div className="inline-block bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2 w-fit">
                    {pkg.badge}
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {pkg.name}
                  </h4>
                  
                  <div className="my-3 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {pkg.priceDisplay}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {pkg.unit}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-4 min-h-[32px]">
                    {pkg.description}
                  </p>

                  <ul className="space-y-2.5 border-t border-slate-200 dark:border-slate-800/80 pt-4 mb-6">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleRegisterClick(pkg)}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md ${
                    pkg.buttonVariant === 'warning'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : pkg.buttonVariant === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : pkg.buttonVariant === 'purple'
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : pkg.buttonVariant === 'primary'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {pkg.buttonText || 'Đăng Ký Khởi Tạo'}
                </button>
              </div>
            ))}
          </div>

          {/* Support Footer */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <span className="font-black text-slate-900 dark:text-white block text-sm">
                  Hệ Thống Duyệt Hồ Sơ KYC &amp; Hỗ Trợ 24/7
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Quản trị viên hỗ trợ cập nhật thông tin, chụp ảnh sản phẩm &amp; kích hoạt gói trực tiếp qua Zalo.
                </span>
              </div>
            </div>

            <a
              href="https://zalo.me/0868499929"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shrink-0 transition flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Zalo Admin: 0868.499.929</span>
            </a>
          </div>

        </div>

      </div>

      {/* Subscription Order Modal */}
      {showOrderForm && selectedPkg && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setShowOrderForm(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full">
                ĐĂNG KÝ GÓI DỊCH VỤ
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {selectedPkg.name}
              </h3>
              <p className="text-xs text-amber-500 font-bold mt-0.5">
                Giá: {selectedPkg.priceDisplay} {selectedPkg.unit}
              </p>
            </div>

            <form onSubmit={handleSubmitSubscription} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên người đăng ký <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Số điện thoại Hotline / Zalo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userPhone}
                  onChange={e => setUserPhone(e.target.value)}
                  placeholder="0868xxxxxx"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Cửa hàng / Dịch vụ / Số Căn Hộ
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="Ví dụ: Bún Chả Cụ Bà - Căn S2.12"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú thêm cho Admin (Thời gian liên hệ, yêu cầu xuất HĐ...)
                </label>
                <textarea
                  rows={2}
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                  placeholder="Nhập ghi chú yêu cầu..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200">
                <strong>💡 Lưu ý:</strong> Sau khi bấm gửi đăng ký, Admin Chợ Cư Dân 24h sẽ gọi xác nhận &amp; hướng dẫn kích hoạt nhanh trong vòng 5-15 phút.
              </div>

              <button
                type="submit"
                disabled={submittingOrder}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submittingOrder ? 'ĐANG GỬI ĐĂNG KÝ...' : 'XÁC NHẬN GỬI ĐĂNG KÝ GÓI'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

