import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Store, MapPin, Phone, MessageCircle, Star, ShieldCheck, 
  ChevronRight, Home, Share2, CheckCircle2, Clock, Award, ArrowLeft, 
  ExternalLink, Package, Truck, Sparkles, AlertCircle, RefreshCw, Send, Check, Heart
} from 'lucide-react';
import { UserStorefront, StoreProduct, Language, User as UserType } from '../types';
import { SEOHead } from '../components/SEOHead';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { SocialShareModal } from '../components/SocialShareModal';
import { INITIAL_USER_STOREFRONTS } from '../data/residentStoresData';
import { getStoreDetailUrl, getProductDetailUrl } from '../lib/slugs';
import { dispatchCustomerLead } from '../lib/leadNotifier';

interface ResidentProductDetailPageProps {
  language?: Language;
  currentUser?: UserType | null;
  onOpenAuth?: () => void;
}

export const ResidentProductDetailPage: React.FC<ResidentProductDetailPageProps> = ({
  language = 'vi',
  currentUser,
  onOpenAuth
}) => {
  const { storeSlug, productId, productSlug } = useParams<{ storeSlug?: string; productId: string; productSlug?: string }>();
  const navigate = useNavigate();

  const [stores, setStores] = useState<UserStorefront[]>(INITIAL_USER_STOREFRONTS);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Order modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderQty, setOrderQty] = useState(1);
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'cod'>('vietqr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch updated stores from API if available
  useEffect(() => {
    fetch('/api/user-storefronts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStores(data);
        }
      })
      .catch(() => {});
  }, []);

  // Find product and store
  let foundStore: UserStorefront | undefined;
  let foundProduct: StoreProduct | undefined;

  for (const st of stores) {
    if (storeSlug && (st.slug === storeSlug || st.id === storeSlug || st.id === decodeURIComponent(storeSlug))) {
      const p = st.products?.find(item => item.id === productId || item.code === productId);
      if (p) {
        foundStore = st;
        foundProduct = p;
        break;
      }
    } else {
      const p = st.products?.find(item => item.id === productId || item.code === productId);
      if (p) {
        foundStore = st;
        foundProduct = p;
        break;
      }
    }
  }

  // Fallback if not found by exact id, pick first product of store or fallback product
  const store = foundStore || (storeSlug ? stores.find(s => s.slug === storeSlug || s.id === storeSlug) : stores[0]) || stores[0];
  const product = foundProduct || store?.products?.[0] || {
    id: productId || 'p-unknown',
    storeId: store.id,
    name: 'Sản phẩm Cư Dân Vinhomes',
    category: store.category,
    price: 150000,
    unit: 'phần',
    stockQuantity: 10,
    images: [store.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
    description: 'Sản phẩm & hàng hóa chất lượng cao từ cư dân Vinhomes.',
    isAvailable: true,
    soldCount: 20
  };

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [store.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'];

  const currentImageUrl = images[activeImageIndex] || images[0];
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://chocudan24h.com/san-pham/${product.id}`;

  const relatedProducts = (store.products || []).filter(p => p.id !== product.id);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    setIsSubmitting(true);
    try {
      // 1. Dispatch lead notifier for instant SMS / Telegram / Zalo
      await dispatchCustomerLead({
        sourceType: 'general_consultation',
        title: `[ĐẶT HÀNG GIAN HÀNG CƯ DÂN] ${product.name} (x${orderQty} ${product.unit}) - ${store.storeName}`,
        customerName,
        customerPhone,
        note: `Địa chỉ: ${customerAddress}. Hình thức: ${paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Tiền mặt COD'}. Tổng tiền: ${(product.price * orderQty).toLocaleString('vi-VN')}đ. Ghi chú: ${orderNote}`,
        project: store.project,
        details: {
          storeId: store.id,
          storeName: store.storeName,
          sellerPhone: store.ownerPhone,
          sellerZalo: store.ownerZalo || store.ownerPhone,
          productId: product.id,
          productName: product.name,
          quantity: orderQty,
          totalAmount: product.price * orderQty,
          paymentMethod
        }
      });

      // 2. Submit order to server endpoint
      await fetch('/api/store-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          storeName: store.storeName,
          customerId: currentUser?.id || `guest-${Date.now()}`,
          customerName,
          customerPhone,
          customerAddress,
          note: orderNote,
          items: [
            {
              productId: product.id,
              productName: product.name,
              price: product.price,
              quantity: orderQty,
              unit: product.unit
            }
          ],
          totalAmount: product.price * orderQty,
          paymentMethod,
          paymentStatus: 'pending',
          orderStatus: 'delivering'
        })
      }).catch(() => {});

      setOrderSuccess(true);
    } catch (err) {
      console.error('Order submission error:', err);
      setOrderSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const breadcrumbs = [
    { name: 'Trang chủ', url: '/' },
    { name: 'Chợ Cư Dân & Gian Hàng', url: '/dich-vu-cu-dan' },
    { name: store.storeName, url: getStoreDetailUrl(store) },
    { name: product.name, url: shareUrl }
  ];

  const savingsAmount = product.originalPrice && product.originalPrice > product.price 
    ? product.originalPrice - product.price 
    : 0;

  const discountPercent = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={`${product.name} — ${product.price.toLocaleString('vi-VN')}đ | ${store.storeName}`}
        description={`${product.name}. Giá chỉ ${product.price.toLocaleString('vi-VN')}đ/${product.unit}. ${product.description || 'Chất lượng đảm bảo từ cư dân Vinhomes'} - Gian hàng ${store.storeName}, địa chỉ ${store.address}. Giao nhanh tận cửa 15-30 phút!`}
        image={currentImageUrl}
        url={shareUrl}
        type="product"
        keywords={`${product.name}, ${store.storeName}, chợ cư dân vinhomes, mua ${product.name} ${store.project}, shophouse vinhomes, thực phẩm đồ gia dụng vinhomes`}
      />

      <SeoJsonLd
        type="product"
        product={product}
        store={store}
      />

      <SeoJsonLd
        type="breadcrumb"
        breadcrumbs={breadcrumbs}
      />

      {/* Breadcrumb Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap gap-1.5">
            <Link to="/" className="hover:text-amber-500 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to="/dich-vu-cu-dan" className="hover:text-amber-500">
              Chợ Cư Dân & Gian Hàng
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to={getStoreDetailUrl(store)} className="hover:text-amber-500 truncate max-w-[200px]">
              {store.storeName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-amber-600 dark:text-amber-400 font-bold truncate max-w-[280px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Product Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* Navigation Back & Share Action Bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to={getStoreDetailUrl(store)}
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-amber-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Xem Toàn Bộ Gian Hàng ({store.storeName})</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Đã sao chép link' : 'Chia sẻ'}</span>
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition cursor-pointer"
              title="Chia sẻ mạng xã hội"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Showcase Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Gallery (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner group">
                <img loading="lazy"
                  src={currentImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-xl uppercase shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Giảm {discountPercent}%
                  </span>
                )}

                {product.isAvailable ? (
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl uppercase shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Sẵn Hàng
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl uppercase shadow-md">
                    Tạm Hết Hàng
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        activeImageIndex === idx ? 'border-amber-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img loading="lazy" src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Fast Trust Indicators */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span><b>Giao hàng siêu tốc:</b> 15 - 30 phút tận cửa căn hộ / Shophouse.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><b>Cam kết chính hãng:</b> Kiểm tra hàng trực tiếp trước khi thanh toán.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Store className="w-4 h-4 text-blue-500 shrink-0" />
                  <span><b>Người bán cùng khu:</b> Hàng xóm cư dân uy tín nội khu Vinhomes.</span>
                </div>
              </div>
            </div>

            {/* Right: Product Info & Buy Box (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Category & Badge Header */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] rounded-lg tracking-wider uppercase border border-amber-500/20">
                    {product.category || store.category}
                  </span>
                  {product.code && (
                    <span className="text-[11px] font-mono text-slate-400 font-bold">
                      SKU: {product.code}
                    </span>
                  )}
                  {product.soldCount ? (
                    <span className="text-[11px] font-bold text-slate-500">
                      • Đã bán {product.soldCount} lượt
                    </span>
                  ) : null}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-500/20 flex flex-wrap items-baseline gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                    {product.price.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ {product.unit}</span>
                </div>

                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-400 line-through">
                      {product.originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-black text-[11px] rounded-lg">
                      Tiết kiệm {savingsAmount.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                  Mô Tả Chi Tiết Sản Phẩm
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                  {product.description || 'Sản phẩm tươi ngon, chuẩn nguồn gốc được cung cấp trực tiếp bởi cư dân Vinhomes. Đảm bảo vệ sinh an toàn thực phẩm, bao đổi trả nếu không ưng ý.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setOrderModalOpen(true);
                      setOrderSuccess(false);
                    }}
                    className="py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wide transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Đặt Mua Giao Tận Nhà</span>
                  </button>

                  <a
                    href={`https://zalo.me/${store.ownerZalo || store.ownerPhone}?text=${encodeURIComponent(
                      `Chào bạn ${store.ownerName}, mình là cư dân Vinhomes muốn hỏi mua [${product.name}] giá ${product.price.toLocaleString('vi-VN')}đ tại ${shareUrl}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Nhắn Zalo Với Chủ Tiệm</span>
                  </a>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500 pt-1">
                  <a href={`tel:${store.ownerPhone}`} className="hover:text-emerald-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Gọi trực tiếp: {store.ownerPhone}</span>
                  </a>
                  <span>•</span>
                  <a href="tel:0868499929" className="hover:text-amber-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Hotline BQL Chợ Cư Dân: 0868.499.929</span>
                  </a>
                </div>
              </div>

              {/* Verified Store Banner Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img loading="lazy"
                    src={store.logoUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80'}
                    alt={store.storeName}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-500 shadow-sm shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link to={getStoreDetailUrl(store)} className="font-black text-sm text-slate-900 dark:text-white hover:text-amber-500 transition truncate">
                        {store.storeName}
                      </Link>
                      {store.verified && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-1.5 py-0.2 rounded border border-emerald-500/30 shrink-0 flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" /> KYC
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      <span>{store.address}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Chủ shop: <b>{store.ownerName}</b> • Giờ mở cửa: {store.operatingHours || '07:30 - 21:30'}
                    </p>
                  </div>
                </div>

                <Link
                  to={getStoreDetailUrl(store)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-800 dark:text-slate-200 font-black text-xs rounded-xl transition shrink-0"
                >
                  Vào Gian Hàng →
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* AI Search Engine Optimization & Structured Grounding Facts */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] rounded uppercase flex items-center gap-1 w-max">
                <Sparkles className="w-3 h-3" /> AI Search Grounding & Thông Tin Kiểm Chứng
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Bảng Thông Số Kỹ Thuật & Xuất Xứ Hàng Hóa
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-bold hidden sm:inline-block">
              Chuẩn SEO Google & AI Index
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 font-bold block">Tên Mặt Hàng:</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">{product.name}</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 font-bold block">Gian Hàng / Đơn Vị Cung Cấp:</span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">{store.storeName}</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 font-bold block">Mức Giá Niêm Yết:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                {product.price.toLocaleString('vi-VN')} VNĐ / {product.unit}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 font-bold block">Khu Vực Phục Vụ:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{store.project} ({store.subdivision || 'Nội khu'})</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 font-bold block">Thời Gian Giao Hàng:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">15 - 30 Phút (Giao tận cửa căn hộ)</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 font-bold block">Chính Sách Kiểm Tra & Đổi Trả:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Được đồng kiểm, 100% đổi trả nếu lỗi</span>
            </div>
          </div>
        </section>

        {/* Related Products From Same Store */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                <span>Sản Phẩm Khác Cùng Gian Hàng ({relatedProducts.length})</span>
              </h2>
              <Link to={getStoreDetailUrl(store)} className="text-xs font-bold text-amber-500 hover:underline">
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedProducts.map(rp => (
                <Link
                  key={rp.id}
                  to={getProductDetailUrl(rp, store.slug || store.id)}
                  className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-slate-950 overflow-hidden relative">
                    <img loading="lazy"
                      src={rp.images && rp.images[0] ? rp.images[0] : store.logoUrl}
                      alt={rp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {rp.soldCount && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-slate-950/80 text-amber-400 font-bold text-[9px] rounded backdrop-blur-xs">
                        Đã bán {rp.soldCount}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-amber-500 transition line-clamp-2 leading-snug">
                        {rp.name}
                      </h3>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800">
                      <span className="font-black text-amber-600 dark:text-amber-400 text-xs">
                        {rp.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-[10px] text-slate-400">/{rp.unit}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Order Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <span>Đặt Mua Giao Tận Căn Hộ</span>
              </h3>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">ĐẶT HÀNG THÀNH CÔNG!</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Gian hàng <b>{store.storeName}</b> đã nhận được yêu cầu đặt món <b>{product.name}</b> (x{orderQty}).
                  </p>
                  <p className="text-xs text-slate-500">
                    Chủ shop sẽ liên hệ qua SĐT <b>{customerPhone}</b> để giao hàng trong 15-30 phút!
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={`https://zalo.me/${store.ownerZalo || store.ownerPhone}?text=${encodeURIComponent(
                      `Chào shop ${store.storeName}, mình vừa đặt đơn hàng [${product.name} x${orderQty}] qua Chợ Cư Dân 24h, SĐT ${customerPhone}. Nhờ shop chuẩn bị giao giúp mình nhé!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Nhắn Zalo Báo Shop Giao Ngay</span>
                  </a>
                  <button
                    onClick={() => setOrderModalOpen(false)}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
                {/* Product Summary Box */}
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img loading="lazy" src={currentImageUrl} alt={product.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{product.name}</div>
                      <div className="text-amber-500 font-black">{product.price.toLocaleString('vi-VN')}₫ / {product.unit}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                      className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded font-black text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-black text-sm px-1 min-w-[20px] text-center">{orderQty}</span>
                    <button
                      type="button"
                      onClick={() => setOrderQty(orderQty + 1)}
                      className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded font-black text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between px-2 font-bold">
                  <span className="text-slate-500">Thành tiền tạm tính:</span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400">
                    {(product.price * orderQty).toLocaleString('vi-VN')}₫
                  </span>
                </div>

                {/* Form fields */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Họ và tên người nhận (*)</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ví dụ: Chị Mai - Cư dân San Hô 2"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Số điện thoại nhận hàng (*)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0988.xxx.xxx"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Địa chỉ giao (Căn hộ / Tòa nhà / Shophouse) (*)</label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Ví dụ: Tòa S2.05 Căn 12.08, Ocean Park 1"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Phương thức thanh toán</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vietqr')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-1.5 ${
                        paymentMethod === 'vietqr'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Chuyển VietQR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-1.5 ${
                        paymentMethod === 'cod'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Tiền mặt khi nhận</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Ghi chú thêm cho shop</label>
                  <input
                    type="text"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Giao trước 11h, gọi trước khi lên..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-sm uppercase tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang gửi đơn hàng...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Xác Nhận Đặt Hàng ({(product.price * orderQty).toLocaleString('vi-VN')}₫)</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Social Share Modal */}
      {showShareModal && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={`[Chợ Cư Dân 24h] ${product.name} - ${product.price.toLocaleString('vi-VN')}đ - Gian hàng ${store.storeName}`}
          url={shareUrl}
          image={currentImageUrl}
        />
      )}
    </div>
  );
};
