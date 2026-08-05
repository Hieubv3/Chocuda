import React, { useState } from 'react';
import { 
  X, Check, Sparkles, ShieldCheck, Award, Zap, Star, Building2, 
  CheckCircle2, CreditCard, QrCode, ArrowRight, MessageCircle, HelpCircle, PhoneCall
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
}

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'free',
    name: 'FREE',
    priceDisplay: '0đ',
    priceValue: 0,
    unit: '/ vĩnh viễn',
    color: 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900',
    description: 'Khởi tạo gian hàng cơ bản cho cư dân mới',
    features: [
      'Hiển thị thông tin cửa hàng cơ bản',
      'Địa chỉ, SĐT, giờ mở cửa',
      'Xuất hiện trên kết quả tìm kiếm',
      'Nhận đánh giá từ cư dân nội khu'
    ],
    buttonText: 'Đăng ký miễn phí',
    buttonVariant: 'outline'
  },
  {
    id: 'tick-xanh',
    name: 'TICK XANH XÁC THỰC',
    priceDisplay: '749.000đ',
    priceValue: 749000,
    unit: '/ năm',
    badge: 'XÁC THỰC UY TÍN',
    color: 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20',
    description: 'Xác thực uy tín, tăng niềm tin tuyệt đối với cư dân',
    features: [
      'Bao gồm toàn bộ gói Miễn phí',
      'Huy hiệu Tick Xanh xác thực chính chủ',
      'Xác minh chủ cửa hàng & giấy phép',
      'Xác minh SĐT + Địa chỉ căn hộ',
      'Thêm 30 ảnh + 30 Dịch vụ / Sản phẩm',
      'Được cộng điểm uy tín trong thuật toán ghim Top',
      'Hỗ trợ cập nhật thông tin 24/7'
    ],
    buttonText: 'Đăng ký ngay',
    buttonVariant: 'success'
  },
  {
    id: 'cua-hang-dam-bao',
    name: 'CỬA HÀNG ĐẢM BẢO',
    priceDisplay: '1.990.000đ',
    priceValue: 1990000,
    unit: '/ năm',
    popular: true,
    badge: 'ĐƯỢC CHỌN NHIỀU NHẤT',
    color: 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 ring-2 ring-amber-500',
    description: 'Đối tác đồng hành lâu dài cùng Chợ Cư Dân 24h',
    features: [
      'Bao gồm toàn bộ gói Tick Xanh',
      'Huy hiệu "Cửa Hàng Đảm Bảo" VIP',
      'Hỗ trợ cập nhật hồ sơ & món ăn/dịch vụ',
      'Báo cáo lượt xem cửa hàng chi tiết',
      'Ưu tiên hỗ trợ từ đội ngũ Admin',
      'Cộng điểm chất lượng cao nhất trong xếp hạng',
      '01 bài Tin doanh nghiệp mỗi tháng (12 bài/năm)'
    ],
    buttonText: 'Đăng ký ngay',
    buttonVariant: 'warning'
  },
  {
    id: 'quang-cao-danh-muc',
    name: 'QUẢNG CÁO DANH MỤC',
    priceDisplay: '990.000đ',
    priceValue: 990000,
    unit: '/ tháng',
    badge: 'QUẢNG CÁO TOP',
    color: 'border-purple-500 bg-purple-50/30 dark:bg-purple-950/20',
    description: 'Banner đầu trang danh mục tiếp cận khách hàng mục tiêu',
    features: [
      'Hỗ trợ thiết kế Banner miễn phí',
      'Banner xuất hiện đầu trang danh mục ngành',
      'Hiển thị trên trang liên quan',
      'Link trực tiếp đến cửa hàng / Zalo',
      'Báo cáo lượt hiển thị & click hàng tháng'
    ],
    buttonText: 'Liên hệ tư vấn',
    buttonVariant: 'purple'
  },
  {
    id: 'quang-cao-trang-chu',
    name: 'QUẢNG CÁO TRANG CHỦ',
    priceDisplay: '2.990.000đ',
    priceValue: 2990000,
    unit: '/ tháng',
    badge: 'SLIDER VIP HOME',
    color: 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20',
    description: 'Banner lớn xuất hiện ngay tại trang chủ tiếp cận toàn bộ cư dân',
    features: [
      'Banner lớn tại Slider trang chủ',
      'Banner giữa trang chủ độ phân giải cao',
      'Hiển thị ảnh Popup khi cư dân truy cập',
      'Ưu tiên tiếp cận cư dân mới chuyển về',
      'Hiển thị trên mọi thiết bị (Mobile/App/Desktop)',
      'Hỗ trợ làm Banner truyền thông chuyên nghiệp'
    ],
    buttonText: 'Liên hệ tư vấn',
    buttonVariant: 'primary'
  },
  {
    id: 'bai-viet-gioi-thieu',
    name: 'BÀI VIẾT GIỚI THIỆU DOANH NGHIỆP',
    priceDisplay: '1.500.000đ',
    priceValue: 1500000,
    unit: '/ bài',
    badge: 'ARTICLE PR',
    color: 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20',
    description: 'Bài viết chuyên sâu giới thiệu sản phẩm / dịch vụ chất lượng',
    features: [
      'Bài viết giới thiệu chuyên nghiệp',
      'Chụp ảnh & biên tập nội dung tận nơi',
      'Đăng trên chuyên mục giới thiệu doanh nghiệp',
      'Chia sẻ lên các cộng đồng cư dân Vinhomes',
      'Tối ưu SEO Google lên Top từ khóa nội khu'
    ],
    buttonText: 'Liên hệ tư vấn',
    buttonVariant: 'outline'
  }
];

export const ServicePricingModal: React.FC<ServicePricingModalProps> = ({
  currentUser,
  onClose,
  onSelectPackage
}) => {
  const [selectedPkg, setSelectedPkg] = useState<ServicePackage | null>(null);
  const [showQrCheckout, setShowQrCheckout] = useState<boolean>(false);

  const handleRegister = (pkg: ServicePackage) => {
    setSelectedPkg(pkg);
    if (pkg.priceValue === 0) {
      alert('🎉 Bạn đã đăng ký thành công Gói Cửa Hàng FREE! Hãy hoàn thiện thông tin gian hàng.');
      if (onSelectPackage) onSelectPackage(pkg.id);
      onClose();
      return;
    }
    setShowQrCheckout(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Fixed top-right close button for screen safety */}
      <button
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
        title="Đóng cửa sổ (Close)"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-6xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Unique Header Hero Banner for Chợ Cư Dân Vinhomes 24h Ecosystem */}
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
            ⭐ ĐẶC QUYỀN QUẢNG BÁ BÁO GIÁ DÀNH RIÊNG ĐỐI TÁC CHỢ CƯ DÂN VINHOMES 24H
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 tracking-tight uppercase leading-tight">
            HỆ SINH THÁI QUẢNG BÁ GIAN HÀNG & DỊCH VỤ CƯ DÂN NỘI KHU
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-3xl mx-auto mt-2.5 leading-relaxed">
            Thiết kế riêng biệt cho mô hình bán hàng cư dân Vinhomes. Tự động kết nối 120.000+ cư dân Ocean Park 1-2-3, Smart City & Grand Park qua Thuật toán AI Smart Push, KiotViet POS & Bản đồ Kiot Nội khu.
          </p>

          {/* 4 Core Pillars Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-4xl mx-auto mt-5 text-left text-xs">
            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-amber-500/30 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-extrabold text-[11px] text-amber-300">AI Smart Push 24h</div>
                <div className="text-[10px] text-slate-400 leading-tight">Tự đẩy top khi cư dân gõ món</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-emerald-500/30 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-extrabold text-[11px] text-emerald-300">KiotViet & HĐĐT VAT</div>
                <div className="text-[10px] text-slate-400 leading-tight">Đồng bộ POS & xuất HĐ MISA</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-blue-500/30 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="font-extrabold text-[11px] text-blue-300">Bản Đồ Kiot 3D Nội Khu</div>
                <div className="text-[10px] text-slate-400 leading-tight">Ghim vị trí căn hộ chính xác</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-purple-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="font-extrabold text-[11px] text-purple-300">Bài Đăng PR Uy Tín</div>
                <div className="text-[10px] text-slate-400 leading-tight">Bài review đối tác đạt KYC</div>
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
              <span>Hotline Zalo OA VIP: 0868.499.929</span>
            </a>
            <button
              onClick={() => {
                const el = document.getElementById('pricing-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition shadow-md"
            >
              🚀 Chọn Gói Khởi Nghiệp Cư Dân
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div id="pricing-grid" className="p-4 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                6 GÓI DÀNH CHO CỬA HÀNG & DỊCH VỤ CƯ DÂN
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Chọn cách xuất hiện phù hợp với mục tiêu của bạn
              </h3>
            </div>

            {currentUser && (
              <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Ví của bạn: <span className="font-black text-emerald-600 dark:text-emerald-400">{(currentUser.balance || 0).toLocaleString('vi-VN')} VNĐ</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICE_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 border flex flex-col justify-between transition hover:shadow-xl ${pkg.color}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    🔥 {pkg.badge}
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
                  onClick={() => handleRegister(pkg)}
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
                  {pkg.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* Guarantee / Support Box */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <span className="font-black text-slate-900 dark:text-white block text-sm">
                  Cam Kết Chất Lượng & Hỗ Trợ Kỹ Thuật 24/7
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Mọi gian hàng đăng ký đều được duyệt hồ sơ KYC & hỗ trợ chụp ảnh, biên tập nội dung chuẩn thương hiệu.
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
              <span>Chat Zalo Admin: 0868.499.929</span>
            </a>
          </div>

        </div>

      </div>

      {/* QR Checkout Modal */}
      {showQrCheckout && selectedPkg && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-center relative shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setShowQrCheckout(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full">
              THANH TOÁN GÓI {selectedPkg.name}
            </span>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Chuyển Khoản QR Banking 24/7
            </h3>

            <p className="text-xs text-slate-500">
              Số tiền: <span className="font-black text-emerald-600 text-sm">{selectedPkg.priceDisplay}</span>
            </p>

            {/* QR Code Placeholder */}
            <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500 inline-block mx-auto shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STK:0868499929-MBBANK-Goi:${selectedPkg.id}`}
                alt="QR Payment"
                className="w-44 h-44 mx-auto"
              />
              <span className="text-[10px] font-bold text-slate-600 block mt-2">
                MBBANK: 0868499929 | CTK: CHỌ CƯ DÂN VINHOMES
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              Nội dung chuyển khoản: <span className="font-black text-amber-500">{currentUser?.phone || 'GOI'}-{selectedPkg.id}</span>
            </p>

            <button
              onClick={() => {
                alert(`✅ Hệ thống đã ghi nhận yêu cầu đăng ký Gói ${selectedPkg.name}. Admin sẽ duyệt kích hoạt trong vòng 5-15 phút!`);
                setShowQrCheckout(false);
                onClose();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
            >
              ĐÃ CHUYỂN KHOẢN - BÁO ADMIN KHÍCH HOẠT
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
