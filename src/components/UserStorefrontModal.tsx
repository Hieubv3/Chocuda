import React, { useState } from 'react';
import { 
  X, ShoppingBag, Search, CheckCircle2, Phone, MessageSquare, MapPin, 
  Sparkles, Star, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Clock,
  Building2, Check, RefreshCw, CreditCard, ChevronRight, Store
} from 'lucide-react';
import { UserStorefront, StoreProduct, StoreOrder } from '../types';

interface UserStorefrontModalProps {
  store: UserStorefront;
  onClose: () => void;
  currentUser?: any;
}

export const UserStorefrontModal: React.FC<UserStorefrontModalProps> = ({
  store,
  onClose,
  currentUser
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartItems, setCartItems] = useState<{ product: StoreProduct; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  
  // Checkout form
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [orderNote, setOrderNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'cod'>('vietqr');
  
  // VAT Invoice request
  const [needVatInvoice, setNeedVatInvoice] = useState<boolean>(false);
  const [vatCompany, setVatCompany] = useState<string>('');
  const [vatTaxCode, setVatTaxCode] = useState<string>('');
  const [vatEmail, setVatEmail] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<StoreOrder | null>(null);

  // Extract unique categories from store products
  const categories = Array.from(new Set(store.products.map(p => p.category)));

  // Filtered products
  const filteredProducts = store.products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q));
    }
    return true;
  });

  // Cart operations
  const addToCart = (product: StoreProduct) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as { product: StoreProduct; quantity: number }[];
    });
  };

  const cartTotalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên, SĐT và Căn hộ/Địa chỉ nhận hàng!');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        storeId: store.id,
        storeName: store.storeName,
        customerId: currentUser?.id || 'guest-cust',
        customerName,
        customerPhone,
        customerAddress,
        note: orderNote,
        items: cartItems.map(ci => ({
          productId: ci.product.id,
          productName: ci.product.name,
          price: ci.product.price,
          quantity: ci.quantity,
          unit: ci.product.unit
        })),
        totalAmount: cartTotalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'vietqr' ? 'paid' : 'unpaid',
        vatInvoiceRequest: needVatInvoice ? {
          companyName: vatCompany,
          taxCode: vatTaxCode,
          email: vatEmail
        } : null
      };

      const response = await fetch(`/api/stores/${store.id}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const resData = await response.json();
      if (response.ok && resData.order) {
        setPlacedOrder(resData.order);
        setCartItems([]);
        setIsCheckoutModalOpen(false);
      } else {
        alert(resData.error || 'Có lỗi xảy ra khi đặt hàng.');
      }
    } catch (err) {
      alert('Không thể kết nối máy chủ. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      {/* Screen Safety Fixed Close Button */}
      <button
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
        title="Đóng cửa sổ gian hàng"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] my-auto">
        
        {/* Close Button Inside Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition backdrop-blur-md shadow-lg border border-slate-700"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Store Banner & Header */}
        <div className="relative h-44 sm:h-56 bg-slate-800 shrink-0 overflow-hidden">
          <img 
            src={store.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'} 
            alt={store.storeName}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img 
                src={store.logoUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200&q=80'} 
                alt={store.storeName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-400 shadow-xl object-cover shrink-0"
              />
              <div className="text-white space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-md uppercase tracking-wide">
                    GIAN HÀNG CƯ DÂN
                  </span>
                  {store.kiotVietConfig?.enabled && (
                    <span className="px-2.5 py-0.5 bg-blue-600 text-white font-bold text-[10px] rounded-md flex items-center gap-1 shadow-xs">
                      ⚡ KẾT NỐI KIOTVIET POS
                    </span>
                  )}
                  {store.verified && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-md border border-emerald-500/40 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Xác Thực Chính Chủ
                    </span>
                  )}
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-amber-300 drop-shadow-md">
                  {store.storeName}
                </h1>
                <p className="text-xs text-slate-200 flex items-center gap-1.5 line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{store.address}</span>
                </p>
              </div>
            </div>

            {/* Quick Contact Buttons & Cart Button */}
            <div className="flex items-center gap-2 self-end">
              <a 
                href={`tel:${store.ownerPhone}`}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Gọi Cửa Hàng</span>
              </a>
              {store.ownerZalo && (
                <a 
                  href={`https://zalo.me/${store.ownerZalo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Zalo</span>
                </a>
              )}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Giỏ Hàng ({totalCartCount})</span>
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded-full animate-bounce shadow-md">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Store Details Banner */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-1">
            <span className="font-bold text-slate-900 dark:text-white">Mô tả:</span> {store.description}
          </p>
          <div className="flex items-center gap-4 text-slate-500 text-[11px] shrink-0 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {store.operatingHours || '08:00 - 21:00'}
            </span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {store.rating} ({store.reviewCount} Đánh giá)
            </span>
          </div>
        </div>

        {/* Content Area: Categories & Products Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Search & Category Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm món, dịch vụ trong cửa hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Tất cả ({store.products.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3 flex gap-3 hover:border-amber-500/50 transition shadow-sm group"
              >
                <img 
                  src={product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'} 
                  alt={product.name}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {product.category}
                      </span>
                      {product.code && (
                        <span className="text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                          {product.code}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2 flex items-end justify-between gap-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="text-amber-600 dark:text-amber-400 font-black text-sm">
                        {product.price.toLocaleString('vi-VN')}đ
                      </div>
                      {product.unit && (
                        <div className="text-[10px] text-slate-400">
                          / {product.unit} (Còn {product.stockQuantity})
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Chọn Mua</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-500 stroke-1" />
              <p className="font-bold text-sm">Chưa tìm thấy sản phẩm phù hợp.</p>
            </div>
          )}
        </div>

        {/* Floating Cart Drawer / Bottom Bar */}
        {cartItems.length > 0 && (
          <div className="bg-slate-900 text-white p-4 border-t border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                {totalCartCount}
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-bold">Tổng thanh toán giỏ hàng:</span>
                <span className="text-lg font-black text-amber-400">{cartTotalAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-2"
            >
              <span>TIẾN HÀNH ĐẶT HÀNG</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Checkout Modal Overlay */}
        {isCheckoutModalOpen && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto flex items-center justify-center">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl relative">
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 font-bold text-[10px] rounded uppercase">
                  XÁC NHẬN ĐƠN HÀNG
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  ĐẶT MUA TỪ GIAN HÀNG {store.storeName.toUpperCase()}
                </h2>
              </div>

              {/* Items Summary */}
              <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{product.name}</span>
                      <span className="block text-[10px] text-slate-400">{product.price.toLocaleString('vi-VN')}đ x {quantity}</span>
                    </div>
                    <span className="font-extrabold text-amber-500">
                      {(product.price * quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Customer Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và Tên Cư Dân Nhận Hàng (*):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số Điện Thoại Liên Hệ (*):
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Địa Chỉ Căn Hộ Nhận Hàng (*):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Căn 15.08 Tòa S2.01 Vinhomes..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ghi Chú Đơn Hàng:
                  </label>
                  <input
                    type="text"
                    placeholder="Giao giờ hành chính, gọi trước 10 phút..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hình Thức Thanh Toán:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vietqr')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition ${
                        paymentMethod === 'vietqr'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      💳 Chuyển Khoản VietQR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition ${
                        paymentMethod === 'cod'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      💵 Thanh Toán COD
                    </button>
                  </div>
                </div>

                {/* VAT Invoice Request Toggle */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needVatInvoice}
                      onChange={(e) => setNeedVatInvoice(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                      📄 Yêu cầu xuất Hóa Đơn Điện Tử VAT (KiotViet / MISA)
                    </span>
                  </label>

                  {needVatInvoice && (
                    <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
                      <input
                        type="text"
                        required={needVatInvoice}
                        placeholder="Tên Công Ty / Cơ Quan (*)"
                        value={vatCompany}
                        onChange={(e) => setVatCompany(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required={needVatInvoice}
                          placeholder="Mã Số Thuế (*)"
                          value={vatTaxCode}
                          onChange={(e) => setVatTaxCode(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                        />
                        <input
                          type="email"
                          required={needVatInvoice}
                          placeholder="Email nhận HĐ Điện Tử (*)"
                          value={vatEmail}
                          onChange={(e) => setVatEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-black text-slate-900 dark:text-white">TỔNG CỘNG:</span>
                  <span className="font-black text-amber-500 text-base">{cartTotalAmount.toLocaleString('vi-VN')}đ</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase tracking-wider transition shadow-lg text-xs"
                >
                  {isSubmitting ? 'Đang Xử Lý Đơn Hàng...' : 'XÁC NHẬN ĐẶT HÀNG NGAY'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Order Success Modal Overlay */}
        {placedOrder && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-4 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 w-full max-w-md text-center space-y-4 shadow-2xl relative">
              <button
                onClick={() => {
                  setPlacedOrder(null);
                  onClose();
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition bg-slate-800 rounded-full"
                title="Đóng Popup"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-black text-[10px] rounded-full uppercase">
                  ĐẶT HÀNG THÀNH CÔNG
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Mã Đơn: <span className="text-amber-500 font-mono">{placedOrder.orderCode}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Đơn hàng đã được tự động truyền tới Gian Hàng & Hệ Thống KiotViet POS của chủ cửa hàng!
                </p>
              </div>

              {placedOrder.paymentMethod === 'vietqr' && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                  <div className="text-center font-bold text-amber-500 mb-1"> Quét Mã QR Thanh Toán Ngân Hàng</div>
                  <img 
                    src={`https://img.vietqr.io/image/MB-0868499929-compact2.png?amount=${placedOrder.totalAmount}&addInfo=${encodeURIComponent(placedOrder.orderCode)}&accountName=STORE_${encodeURIComponent(store.storeName)}`}
                    alt="VietQR"
                    className="w-48 h-48 mx-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-md"
                  />
                  <p className="text-[10px] text-center text-slate-400">
                    Nội dung CK: <strong className="text-amber-400">{placedOrder.orderCode}</strong>
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setPlacedOrder(null);
                  onClose();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl uppercase transition shadow-lg"
              >
                HOÀN TẤT & ĐÓNG GIỜ
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
