import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Wrench, Phone, MessageCircle, Star, BadgeCheck, ShieldCheck, 
  MapPin, Clock, Calendar, CheckCircle2, ChevronRight, Home, Share2, 
  User, DollarSign, ArrowLeft
} from 'lucide-react';
import { ResidentServiceItem, Language, User as UserType } from '../types';
import { SEOHead } from '../components/SEOHead';
import { SocialShareModal } from '../components/SocialShareModal';
import { recordZaloInteraction } from '../lib/visitorStats';
import { INITIAL_RESIDENT_SERVICES } from '../data/residentServicesData';

interface ResidentServiceDetailPageProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
}

export const ResidentServiceDetailPage: React.FC<ResidentServiceDetailPageProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const [services, setServices] = useState<ResidentServiceItem[]>(INITIAL_RESIDENT_SERVICES);
  const [showShareModal, setShowShareModal] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNote, setClientNote] = useState('');

  useEffect(() => {
    fetch('/api/resident-services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch(() => {});
  }, []);

  const service = services.find(s => s.id === serviceSlug || s.id === decodeURIComponent(serviceSlug || ''));

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Không tìm thấy dịch vụ
        </h1>
        <p className="text-xs text-slate-500">
          Dịch vụ cư dân có thể đã ngừng cung cấp hoặc đã cập nhật thông tin mới.
        </p>
        <Link
          to="/dich-vu-cu-dan"
          className="inline-block px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md"
        >
          Xem Danh Mục Dịch Vụ Cư Dân
        </Link>
      </div>
    );
  }

  const isVerified = service.verified || service.kycStatus === 'verified';
  const shareUrl = window.location.href;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: clientName,
        phone: clientPhone,
        propertyTitle: `[DỊCH VỤ CƯ DÂN] ${service.title}`,
        sellerName: service.providerName,
        sellerPhone: service.providerPhone,
        note: `Địa chỉ: ${clientAddress}. Yêu cầu: ${clientNote}`,
        type: 'service'
      })
    }).catch(() => {});

    setBookingDone(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={`${service.title} - Dịch Vụ Cư Dân Vinhomes`}
        description={`${service.title}. Đơn vị: ${service.providerName}. Báo giá: ${service.priceDisplay}. Hotline: ${service.providerPhone}. ${service.description?.substring(0, 120)}`}
        image={service.images && service.images[0] ? service.images[0] : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'}
        url={shareUrl}
        keywords={`${service.title}, dịch vụ vinhomes, thợ sửa chữa, ${service.categoryId}`}
      />

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap gap-1.5">
            <Link to="/" className="hover:text-amber-500 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to="/dich-vu-cu-dan" className="hover:text-amber-500">
              Dịch Vụ Cư Dân
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold truncate">
              {service.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Detail Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Main 2 Cols */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 relative">
                <img
                  src={service.images && service.images[0] ? service.images[0] : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />

                {isVerified && (
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <BadgeCheck className="w-4 h-4" />
                    <span>ĐÃ XÁC MINH KYC CHÍNH CHỦ</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black rounded-full uppercase">
                    {service.subCategory || 'Dịch Vụ Chuyên Nghiệp'}
                  </span>
                  
                  <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{service.rating || 5.0} ({service.reviewCount || 1} đánh giá)</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {service.title}
                </h1>

                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {service.priceDisplay || 'Liên hệ báo giá'}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                  Chi Tiết & Quy Trình Dịch Vụ
                </h2>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl">
                  {service.description || 'Dịch vụ chất lượng cao phục vụ cư dân tại khu đô thị Vinhomes. Cam kết đúng hẹn, giá cả minh bạch và bảo hành dài hạn.'}
                </div>
              </div>

            </div>

          </div>

          {/* Right Col: Provider & Direct Booking Form */}
          <div className="space-y-6 md:sticky md:top-24">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-lg shadow-md shrink-0">
                  {service.providerName ? service.providerName.charAt(0).toUpperCase() : 'DV'}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {service.providerName || 'Nhà Cung Cấp Dịch Vụ'}
                    </span>
                    {isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Đối tác dịch vụ nội khu
                  </span>
                </div>
              </div>

              {/* Call & Zalo */}
              <div className="space-y-2">
                <a
                  href={`tel:${service.providerPhone}`}
                  onClick={() => recordZaloInteraction()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>GỌI THỢ: {service.providerPhone}</span>
                </a>

                <a
                  href={`https://zalo.me/${(service.providerZalo || service.providerPhone).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => recordZaloInteraction()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>CHAT ZALO VỚI NHÀ CUNG CẤP</span>
                </a>
              </div>

              {/* Fast Booking Box */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wide">
                  Đặt Lịch Làm Dịch Vụ
                </h3>

                {bookingDone ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                    <span className="font-black text-emerald-700 dark:text-emerald-400 text-xs block">
                      ĐÃ GỬI YÊU CẦU ĐẶT LỊCH!
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Nhà cung cấp sẽ gọi điện cho bạn trong 5 phút.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Họ tên của bạn *"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-hidden"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Số điện thoại liên hệ *"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-hidden"
                    />
                    <input
                      type="text"
                      placeholder="Số căn / Phân khu Vinhomes"
                      value={clientAddress}
                      onChange={e => setClientAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-hidden"
                    />
                    <textarea
                      placeholder="Mô tả công việc cần làm..."
                      rows={2}
                      value={clientNote}
                      onChange={e => setClientNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-hidden"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wide transition shadow-sm cursor-pointer"
                    >
                      GỬI YÊU CẦU DỊCH VỤ
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Share Modal */}
      {showShareModal && (
        <SocialShareModal
          title={service.title}
          url={shareUrl}
          price={service.priceDisplay}
          location="Vinhomes"
          imageUrl={service.images && service.images[0]}
          onClose={() => setShowShareModal(false)}
        />
      )}

    </div>
  );
};
