import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Store, MapPin, Phone, MessageCircle, Star, ShieldCheck, 
  ChevronRight, Home, Share2, ShoppingBag, CheckCircle2, 
  Clock, Award, ArrowLeft, ExternalLink, Package
} from 'lucide-react';
import { UserStorefront, StoreProduct, Language } from '../types';
import { SEOHead } from '../components/SEOHead';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { SocialShareModal } from '../components/SocialShareModal';
import { INITIAL_USER_STOREFRONTS } from '../data/residentStoresData';
import { getProductDetailUrl } from '../lib/slugs';

interface ResidentStoreDetailPageProps {
  language: Language;
  onOpenAuth: () => void;
}

export const ResidentStoreDetailPage: React.FC<ResidentStoreDetailPageProps> = ({
  language,
  onOpenAuth
}) => {
  const { storeSlug, productId } = useParams<{ storeSlug: string; productId?: string }>();
  const navigate = useNavigate();

  const [stores, setStores] = useState<UserStorefront[]>(INITIAL_USER_STOREFRONTS);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderQty, setOrderQty] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

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

  // Find store by id, slug or slug match
  const store = stores.find(
    s => s.slug === storeSlug || s.id === storeSlug || s.id === decodeURIComponent(storeSlug || '')
  ) || stores[0];

  // Set selected product if productId in URL
  useEffect(() => {
    if (store && productId) {
      const prod = store.products?.find(p => p.id === productId || p.code === productId);
      if (prod) {
        setSelectedProduct(prod);
      }
    }
  }, [store, productId]);

  if (!store) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Không tìm thấy gian hàng cư dân</h1>
        <p className="text-xs text-slate-500">Gian hàng có thể đang cập nhật hoặc tạm đóng cửa.</p>
        <Link to="/dich-vu-cu-dan" className="inline-block px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">
          Khám Phá Dịch Vụ Cư Dân
        </Link>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const products = store.products || [];

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedProduct) return;

    fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: customerName,
        phone: customerPhone,
        propertyTitle: `[ĐẶT HÀNG GIAN HÀNG CƯ DÂN] ${selectedProduct.name} (x${orderQty}) - ${store.storeName}`,
        sellerName: store.ownerName,
        sellerPhone: store.ownerPhone,
        note: `Địa chỉ: ${customerAddress}. Số lượng: ${orderQty} ${selectedProduct.unit}. Ghi chú: ${orderNote}`,
        type: 'market_order'
      })
    }).catch(() => {});

    setOrderSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={selectedProduct 
          ? `${selectedProduct.name} - ${selectedProduct.price.toLocaleString('vi-VN')}đ | ${store.storeName}`
          : `${store.storeName} - Gian Hàng Cư Dân Vinhomes`
        }
        description={selectedProduct
          ? `${selectedProduct.name}. Giá: ${selectedProduct.price.toLocaleString('vi-VN')}đ/${selectedProduct.unit}. ${selectedProduct.description} - Gian hàng ${store.storeName}`
          : `${store.storeName}. Địa chỉ: ${store.address}. Hotline: ${store.ownerPhone}. Chuyên ${store.category}`
        }
        image={selectedProduct && selectedProduct.images && selectedProduct.images[0] 
          ? selectedProduct.images[0] 
          : (store.bannerUrl || store.logoUrl || '')
        }
        url={shareUrl}
        keywords={`${store.storeName}, chợ cư dân vinhomes, mua sắm ${store.project}, nông sản thực phẩm`}
      />

      <SeoJsonLd
        type="store"
        store={store}
      />

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap gap-1.5">
            <Link to="/" className="hover:text-amber-500 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to="/dich-vu-cu-dan" className="hover:text-amber-500">
              Chợ Cư Dân & Dịch Vụ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold truncate">
              {store.storeName}
            </span>
            {selectedProduct && (
              <>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="text-amber-600 dark:text-amber-400 font-black truncate">
                  {selectedProduct.name}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Store Banner & Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="h-44 sm:h-60 w-full overflow-hidden relative">
            <img loading="lazy"
              src={store.bannerUrl || ''}
              alt={store.storeName}
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="p-6 sm:p-8 relative -mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 bg-slate-900/90 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img loading="lazy"
                src={store.logoUrl || ''}
                alt={store.storeName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-amber-500 shadow-2xl bg-white shrink-0"
              />
              <div className="space-y-1.5 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-md uppercase">
                    {store.category}
                  </span>
                  {store.verified && (
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Cư Dân Đã Xác Thực
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {store.storeName}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {store.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {store.operatingHours || 'Mở cửa cả ngày'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <a
                href={`tel:${store.ownerPhone}`}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Phone className="w-4 h-4" />
                <span>Gọi Điện: {store.ownerPhone}</span>
              </a>

              <a
                href={`https://zalo.me/${store.ownerZalo || store.ownerPhone}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Zalo</span>
              </a>

              <button
                onClick={() => setShowShareModal(true)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition cursor-pointer"
                title="Chia sẻ gian hàng"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Product Spotlight (If active) */}
        {selectedProduct && (
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full uppercase flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" /> SẢN PHẨM ĐANG XEM
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-xs font-bold text-slate-400 hover:text-white"
              >
                Đóng xem chi tiết ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950">
                <img loading="lazy"
                  src={selectedProduct.images && selectedProduct.images[0] ? selectedProduct.images[0] : store.logoUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-white">{selectedProduct.name}</h2>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-amber-400">
                      {selectedProduct.price.toLocaleString('vi-VN')}đ
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-slate-500 line-through">
                        {selectedProduct.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                    <span className="text-xs text-slate-400">/ {selectedProduct.unit}</span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="p-3.5 bg-slate-800/80 rounded-xl text-xs text-slate-300 space-y-1">
                    <div>• <b>Mã sản phẩm:</b> {selectedProduct.code || selectedProduct.id}</div>
                    <div>• <b>Tình trạng kho:</b> {selectedProduct.stockQuantity > 0 ? `Còn hàng (${selectedProduct.stockQuantity} ${selectedProduct.unit})` : 'Hết hàng'}</div>
                    <div>• <b>Giao hàng:</b> Giao nhanh tận cửa trong 15-30 phút nội khu Vinhomes.</div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setOrderModalOpen(true);
                      setOrderSuccess(false);
                    }}
                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm uppercase tracking-wide transition shadow-lg cursor-pointer"
                  >
                    🛒 Đặt Mua Giao Tận Nhà
                  </button>
                  <a
                    href={`https://zalo.me/${store.ownerZalo || store.ownerPhone}?text=${encodeURIComponent(`Chào bạn, tôi muốn đặt mua món [${selectedProduct.name}] giá ${selectedProduct.price.toLocaleString('vi-VN')}đ tại Gian hàng ${store.storeName}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Zalo</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Catalog Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              <span>Danh Mục Sản Phẩm & Món Ngon ({products.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(prod => (
              <div
                key={prod.id}
                onClick={() => {
                  navigate(getProductDetailUrl(prod, store.slug || store.id));
                }}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition shadow-md hover:shadow-xl flex flex-col justify-between cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-950 relative">
                  <img loading="lazy"
                    src={prod.images && prod.images[0] ? prod.images[0] : store.logoUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {prod.soldCount && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/80 text-amber-400 font-bold text-[10px] rounded-md backdrop-blur-sm">
                      Đã bán {prod.soldCount}
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-amber-500 transition line-clamp-2">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{prod.description}</p>
                  </div>

                  <div className="pt-2 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800">
                    <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                      {prod.price.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-[11px] text-slate-400">/{prod.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {orderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <span>Đặt Hàng Giao Tận Nhà</span>
              </h3>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-black text-slate-900 dark:text-white">ĐẶT HÀNG THÀNH CÔNG!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gian hàng <b>{store.storeName}</b> đã nhận được đơn hàng và sẽ liên hệ giao hàng trong 15-30 phút!
                </p>
                <button
                  onClick={() => setOrderModalOpen(false)}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{selectedProduct.name}</div>
                    <div className="text-amber-500 font-bold">{selectedProduct.price.toLocaleString('vi-VN')}đ / {selectedProduct.unit}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                      className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg font-bold"
                    >
                      -
                    </button>
                    <span className="font-black text-sm">{orderQty}</span>
                    <button
                      type="button"
                      onClick={() => setOrderQty(orderQty + 1)}
                      className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-300">Họ và tên người nhận (*)</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ví dụ: Anh Nam - Cư dân San Hô 2"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-300">Số điện thoại nhận hàng (*)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0988.xxx.xxx"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-300">Địa chỉ giao hàng (Tòa/Phân khu/Số nhà)</label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Ví dụ: Tòa S2.05 Căn 1208, OCP1"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-300">Ghi chú thêm</label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    rows={2}
                    placeholder="Giao giờ hành chính, gọi trước khi đến..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs font-black">
                  <span>Tổng thanh toán dự kiến:</span>
                  <span className="text-amber-500 text-sm">{(selectedProduct.price * orderQty).toLocaleString('vi-VN')}đ</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg cursor-pointer"
                >
                  Xác Nhận Đặt Hàng Ngay
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={`Gian hàng ${store.storeName} - Chợ Cư Dân Vinhomes`}
          shareUrl={shareUrl}
          summary={store.description}
          imageUrl={store.bannerUrl || store.logoUrl}
        />
      )}
    </div>
  );
};
