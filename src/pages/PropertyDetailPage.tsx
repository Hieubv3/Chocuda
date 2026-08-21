import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Bed, Bath, Compass, ShieldCheck, Phone, MessageCircle, 
  Calendar, Share2, Calculator, CheckCircle2, ChevronRight, Home, 
  Building2, Sparkles, Heart, Eye, ArrowLeft, Clock, DollarSign, UserCheck, Hash
} from 'lucide-react';
import { Property, Language, ProjectCategory } from '../types';
import { getTranslation } from '../lib/i18n';
import { SEOHead } from '../components/SEOHead';
import { SocialShareModal } from '../components/SocialShareModal';
import { MortgageCalculator } from '../components/MortgageCalculator';
import { recordZaloInteraction } from '../lib/visitorStats';
import { dispatchCustomerLead } from '../lib/leadNotifier';
import { getProjectSlug } from '../lib/slugs';
import { PropertyCard } from '../components/PropertyCard';

interface PropertyDetailPageProps {
  properties: Property[];
  language: Language;
  savedIds: string[];
  onToggleSave: (property: Property) => void;
  compareIds: string[];
  onToggleCompare: (property: Property) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  properties,
  language,
  savedIds,
  onToggleSave,
  compareIds,
  onToggleCompare
}) => {
  const { id, projectSlug } = useParams<{ id: string; projectSlug?: string }>();
  const navigate = useNavigate();
  const t = getTranslation(language);

  const cleanParamId = id ? decodeURIComponent(id).trim() : '';

  // Local state for fetched property if not present in initial array
  const [fetchedProperty, setFetchedProperty] = useState<Property | null>(null);
  const [isFetchingServer, setIsFetchingServer] = useState<boolean>(false);

  // Find property by ID or slug match in memory
  const propertyInMemory = properties.find(p => 
    p && (
      p.id === id || 
      p.id === cleanParamId || 
      (cleanParamId && p.id && p.id.toLowerCase() === cleanParamId.toLowerCase())
    )
  );

  const property = propertyInMemory || fetchedProperty;

  // If not found in memory, try fetching directly from /api/properties/:id
  useEffect(() => {
    if (!propertyInMemory && cleanParamId) {
      setIsFetchingServer(true);
      fetch(`/api/properties/${cleanParamId}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Not found');
        })
        .then(data => {
          if (data && data.id) {
            setFetchedProperty(data);
          }
        })
        .catch(err => {
          console.warn('Property fetch error:', err);
        })
        .finally(() => {
          setIsFetchingServer(false);
        });
    }
  }, [cleanParamId, propertyInMemory]);

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMortgageModal, setShowMortgageModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Booking lead form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('Cuối tuần này');
  const [note, setNote] = useState('');

  if (isFetchingServer && !property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Đang tải thông tin chi tiết bài đăng...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <SEOHead title="Không tìm thấy bất động sản | Chợ Cư Dân 24h" />
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Không tìm thấy bất động sản
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Mã căn hoặc tin đăng này có thể đã được giao dịch hoặc tạm ngừng hiển thị. Quý khách vui lòng xem các căn khác đang mở bán.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/bat-dong-san"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-md"
          >
            Xem Quỹ Căn Đang Bán & Cho Thuê
          </Link>
          <Link
            to="/"
            className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = savedIds.includes(property.id);
  const isCompared = compareIds.includes(property.id);

  // Related properties in same project
  const relatedProperties = properties
    .filter(p => p.id !== property.id && p.project === property.project)
    .slice(0, 4);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    try {
      await dispatchCustomerLead({
        sourceType: 'property_viewing',
        title: `[XEM NHÀ BĐS] ${property.title}`,
        customerName: fullName,
        customerPhone: phone,
        project: property.project,
        subdivision: property.subdivision,
        note: `Thời gian muốn xem: ${preferredTime}. Ghi chú: ${note}`,
        details: {
          propertyId: property.id,
          propertyPrice: property.priceDisplay,
          sellerName: property.sellerName,
          sellerPhone: property.sellerPhone
        }
      });
    } catch (err) {
      console.warn('Lead dispatch error:', err);
    }

    fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        phone,
        propertyId: property.id,
        propertyTitle: property.title,
        projectInterest: property.project,
        sellerName: property.sellerName,
        sellerPhone: property.sellerPhone,
        preferredTime,
        note,
        type: 'viewing'
      })
    })
      .then(() => setFormSubmitted(true))
      .catch(() => setFormSubmitted(true));
  };

  const shareUrl = window.location.href;
  const projectTitle = property.project === 'ocean-park-2' ? 'Vinhomes Ocean Park 2' :
                       property.project === 'ocean-park-3' ? 'Vinhomes Ocean Park 3' :
                       property.project === 'ha-long-xanh' ? 'Vinhomes Hạ Long Xanh' :
                       property.project === 'smart-city' ? 'Vinhomes Smart City' : 'Vinhomes Ocean Park';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={`${property.title} - ${property.priceDisplay}`}
        description={`${property.title}. Giá: ${property.priceDisplay}, Diện tích: ${property.area}m2, Vị trí: ${property.address}. Liên hệ chính chủ/môi giới: ${property.sellerPhone}`}
        image={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'}
        url={shareUrl}
        keywords={`${property.title}, mua bán ${projectTitle}, bđs ${property.project}, biệt thự shophouse vinhomes`}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap gap-1.5">
            <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to={`/du-an/${getProjectSlug(property.project)}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
              {projectTitle}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to={property.type === 'rent' ? '/cho-thue' : '/bat-dong-san'} className="hover:text-emerald-600 dark:hover:text-emerald-400">
              {property.type === 'rent' ? 'Cho Thuê' : 'Mua Bán'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs sm:max-w-md">
              {property.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Main Content Layout: Left Gallery & Info, Right Sticky Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLS: Gallery + Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={property.images[selectedImgIndex] || property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />

                {/* VIP Badge */}
                {property.vipLevel && property.vipLevel !== 'normal' && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>TIN VIP {property.vipLevel.toUpperCase()}</span>
                  </div>
                )}

                {/* Top Right Action Buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => onToggleSave(property)}
                    className={`p-2.5 rounded-full backdrop-blur-md transition shadow-md cursor-pointer ${
                      isSaved ? 'bg-red-500 text-white' : 'bg-slate-900/70 text-white hover:bg-slate-900'
                    }`}
                    title="Lưu tin yêu thích"
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-md cursor-pointer"
                    title="Chia sẻ link lên Zalo, Facebook"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Photo counter */}
                <div className="absolute bottom-4 right-4 bg-slate-950/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  {selectedImgIndex + 1} / {property.images.length} hình ảnh
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {property.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`relative w-20 h-16 sm:w-24 sm:h-18 shrink-0 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                        selectedImgIndex === idx ? 'border-emerald-500 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Key Details & Title */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>{projectTitle}</span>
                  {property.subdivision && (
                    <>
                      <span>•</span>
                      <span>Phân khu {property.subdivision}</span>
                    </>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {property.title}
                </h1>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{property.address}</span>
                </div>
              </div>

              {/* Price & Primary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Mức Giá</span>
                  <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {property.priceDisplay}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Diện Tích</span>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {property.area} m²
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Phòng Ngủ / WC</span>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{property.bedrooms || 2} PN</span>
                    <span className="text-xs text-slate-400">/ {property.bathrooms || 2} WC</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Hướng Nhà</span>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {property.direction || 'Đông Nam'}
                  </div>
                </div>
              </div>

              {/* Detailed Specs List */}
              <div className="space-y-3">
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">
                  Đặc Điểm Chi Tiết
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-slate-500 dark:text-slate-400">Loại Hình:</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize">{property.category}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-slate-500 dark:text-slate-400">Tình Trạng Pháp Lý:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{property.legal === 'so-do' ? 'Sổ đỏ lâu dài' : 'HĐMB chính chủ'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-slate-500 dark:text-slate-400">Nội Thất Bàn Giao:</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize">
                      {property.furniture === 'full' ? 'Đầy đủ nội thất cao cấp' : property.furniture === 'basic' ? 'Nội thất cơ bản CĐT' : 'Thô nguyên bản'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-slate-500 dark:text-slate-400">Thời Gian Đăng:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{property.createdAt || 'Hôm nay'}</span>
                  </div>
                </div>
              </div>

              {/* Description Content */}
              <div className="space-y-3">
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">
                  Mô Tả Chi Tiết Từ Chủ Nhà / Môi Giới
                </h2>

                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {property.description || 'Vị trí đắc địa, căn góc thoáng mát, gần công viên trung tâm và trường học. Pháp lý rõ ràng, hỗ trợ vay ngân hàng lãi suất ưu đãi.'}
                </div>

                {/* Hashtag exploration pills */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-emerald-500" /> Chủ đề liên quan:
                  </span>
                  {[
                    property.project ? property.project.replace(/-/g, '_') : 'ocean_park_2',
                    property.subdivision ? property.subdivision.toLowerCase().replace(/[^a-z0-9]+/g, '_') : null,
                    property.category ? property.category.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'can_ho',
                    property.transactionType === 'rent' ? 'cho_thue' : 'chuyen_nhuong',
                    'vinhomes',
                    'chocudan24h'
                  ].filter(Boolean).map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('chocudan_explore_hashtag', { detail: { tag } }));
                      }}
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-0.5"
                    >
                      <span>#{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mortgage Calculator Action */}
              <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-black text-sm text-amber-400">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span>DỰ TÍNH LÃI SUẤT VAY MUA CĂN NÀY</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Hỗ trợ vay tới 70% giá trị căn hộ với lãi suất ưu đãi từ các ngân hàng đối tác.
                  </p>
                </div>

                <button
                  onClick={() => setShowMortgageModal(true)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shrink-0 cursor-pointer"
                >
                  Mở Bảng Tính Lãi Vay
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT COL: Seller Card & Direct Viewing Booking Form */}
          <div className="space-y-6 lg:sticky lg:top-24">
            
            {/* Seller Contact Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                  {property.sellerName ? property.sellerName.charAt(0).toUpperCase() : 'HB'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 dark:text-white text-base">
                      {property.sellerName || 'Chủ Nhà / Quản Trị Viên'}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {property.sellerRole === 'owner' ? 'Chủ Nhà Chính Chủ' : 'Môi Giới Chuyên Viên'}
                  </span>
                </div>
              </div>

              {/* Direct Call & Zalo Buttons */}
              <div className="space-y-2.5">
                <a
                  href={`tel:${property.sellerPhone}`}
                  onClick={() => recordZaloInteraction()}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95"
                >
                  <Phone className="w-4 h-4 animate-bounce" />
                  <span>GỌI ĐIỆN: {property.sellerPhone}</span>
                </a>

                <a
                  href={`https://zalo.me/${property.sellerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => recordZaloInteraction()}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>CHAT ZALO VỚI NGƯỜI ĐĂNG</span>
                </a>
              </div>

              {/* Fast Booking Form */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                  Đăng Ký Đi Xem Nhà Trực Tiếp
                </h3>

                {formSubmitted ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm block">
                      ĐÃ GỬI YÊU CẦU THÀNH CÔNG!
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Chuyên viên hoặc chủ nhà sẽ gọi điện cho bạn trong 10 phút để xác nhận lịch xem nhà.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Họ và tên của bạn *"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="Số điện thoại nhận liên hệ *"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <select
                        value={preferredTime}
                        onChange={e => setPreferredTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      >
                        <option value="Hôm nay">Muốn xem: Ngay hôm nay</option>
                        <option value="Ngày mai">Muốn xem: Ngày mai</option>
                        <option value="Cuối tuần này">Muốn xem: Cuối tuần này</option>
                        <option value="Buổi tối">Muốn xem: Ngoài giờ hành chính (Buổi tối)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                    >
                      📅 GỬI YÊU CẦU ĐẶT LỊCH XEM
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* RELATED PROPERTIES SECTION */}
        {relatedProperties.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Bất Động Sản Tương Tự Cùng Dự Án
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Các căn đang bán & cho thuê giá tốt nhất tại {projectTitle}
                </p>
              </div>

              <Link
                to={`/du-an/${getProjectSlug(property.project)}`}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả quỹ căn</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProperties.map(p => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  language={language}
                  onSelect={(selected) => navigate(getProjectSlug(selected.project) ? `/${getProjectSlug(selected.project)}/${selected.id}` : `/bat-dong-san/${selected.id}`)}
                  isSaved={savedIds.includes(p.id)}
                  onToggleSave={onToggleSave}
                  isCompared={compareIds.includes(p.id)}
                  onToggleCompare={onToggleCompare}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Share Modal */}
      {showShareModal && (
        <SocialShareModal
          title={property.title}
          url={shareUrl}
          price={property.priceDisplay}
          location={property.address}
          imageUrl={property.images[0]}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Mortgage Modal */}
      {showMortgageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative border border-slate-200 dark:border-slate-800 shadow-2xl">
            <button
              onClick={() => setShowMortgageModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full"
            >
              ✕
            </button>
            <MortgageCalculator initialPrice={property.price} />
          </div>
        </div>
      )}

    </div>
  );
};
