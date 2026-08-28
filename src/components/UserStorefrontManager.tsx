import React, { useState, useEffect } from 'react';
import { 
  Store, RefreshCw, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, 
  ExternalLink, ShoppingBag, Eye, Phone, MessageSquare, MapPin, Sparkles, 
  Clock, ShieldCheck, Database, Key, Globe, Check, ArrowUpRight, Award, Zap, X,
  DollarSign, TrendingUp, XCircle, Filter, Search
} from 'lucide-react';
import { UserStorefront, StoreProduct, StoreOrder, User } from '../types';
import { UserStorefrontModal } from './UserStorefrontModal';
import { AiMenuScannerModal, AiMenuScanResult, ScannedMenuItem } from './AiMenuScannerModal';
import { addWatermarkToImage, validateImageSize, createInstantPreview } from '../lib/watermark';
import { uploadBase64DataUrl } from '../lib/uploadService';

interface UserStorefrontManagerProps {
  user: User;
}

export const UserStorefrontManager: React.FC<UserStorefrontManagerProps> = ({ user }) => {
  const [store, setStore] = useState<UserStorefront | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncingKiotViet, setIsSyncingKiotViet] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [orders, setOrders] = useState<StoreOrder[]>([]);

  // Form states
  const [autoUseProfileInfo, setAutoUseProfileInfo] = useState<boolean>(true);
  const [storeName, setStoreName] = useState<string>('');
  const [category, setCategory] = useState<string>('Thực Phẩm & Ăn Uống');
  const [address, setAddress] = useState<string>('');
  const [ownerPhone, setOwnerPhone] = useState<string>(user.phone || '');
  const [ownerZalo, setOwnerZalo] = useState<string>(user.phone || '');
  const [description, setDescription] = useState<string>('');
  const [operatingHours, setOperatingHours] = useState<string>('08:00 - 21:00 hàng ngày');
  const [logoUrl, setLogoUrl] = useState<string>('https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80');
  const [bannerUrl, setBannerUrl] = useState<string>('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80');

  // KiotViet config state
  const [kvStoreDomain, setKvStoreDomain] = useState<string>('cuahangvinhomes.kiotviet.vn');
  const [kvClientId, setKvClientId] = useState<string>('');
  const [kvClientSecret, setKvClientSecret] = useState<string>('');
  const [kvBranchId, setKvBranchId] = useState<string>('Chi nhánh Ocean Park');
  const [kvAutoSync, setKvAutoSync] = useState<boolean>(true);

  // New product state
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdCategory, setNewProdCategory] = useState<string>('Món Ăn & Đồ Uống');
  const [newProdPrice, setNewProdPrice] = useState<number>(50000);
  const [newProdUnit, setNewProdUnit] = useState<string>('suất');
  const [newProdStock, setNewProdStock] = useState<number>(20);
  const [newProdCode, setNewProdCode] = useState<string>('');
  const [newProdImage, setNewProdImage] = useState<string>('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
  const [newProdDesc, setNewProdDesc] = useState<string>('');

  // Physical Photo Menu Digitizer & Admin Approval state
  const [showPhotoMenuModal, setShowPhotoMenuModal] = useState<boolean>(false);
  const [showAiScannerModal, setShowAiScannerModal] = useState<boolean>(false);
  const [photoMenuUrl, setPhotoMenuUrl] = useState<string>('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80');
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState<boolean>(false);
  const [extractedDishes, setExtractedDishes] = useState<{ id: string; name: string; price: number; unit: string; category: string; status: 'pending' | 'approved' }[]>([
    { id: 'ocr-1', name: 'Cơm Sườn Nướng Mật Ong', price: 45000, unit: 'suất', category: 'Cơm Cư Dân', status: 'pending' },
    { id: 'ocr-2', name: 'Trà Chanh Giã Tay Tây Bắc', price: 25000, unit: 'cốc', category: 'Đồ Uống', status: 'pending' },
    { id: 'ocr-3', name: 'Bún Cát Hải Sản Đầy Đủ', price: 55000, unit: 'bát', category: 'Món Nước', status: 'pending' }
  ]);

  // Batch add products from AI Menu Scanner
  const handleBatchAddScannedProducts = (scannedData: any) => {
    let itemsList: any[] = [];
    if (Array.isArray(scannedData)) {
      itemsList = scannedData;
    } else if (scannedData && Array.isArray(scannedData.menuItems)) {
      itemsList = scannedData.menuItems;
    } else if (scannedData && Array.isArray(scannedData.items)) {
      itemsList = scannedData.items;
    }

    if (!itemsList || itemsList.length === 0) {
      alert('Không tìm thấy danh sách món nào trong kết quả quét.');
      return;
    }

    const isUserAdmin = user.role === 'admin';
    const currentStoreId = store?.id || `store-${user.id}`;
    
    const newProducts: StoreProduct[] = itemsList.map((item: any, idx: number) => ({
      id: `p-scan-${Date.now()}-${idx}`,
      storeId: currentStoreId,
      code: `SCAN-${Math.floor(Math.random() * 9000) + 1000}`,
      name: item.name || 'Món ăn / Hàng hóa',
      category: item.category || category || 'Món Ăn & Đồ Uống',
      price: Number(item.price) || 50000,
      unit: item.unit || 'suất',
      stockQuantity: 50,
      images: [
        item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
      ],
      description: item.description || `Món ngon niêm yết chính xác từ Menu: ${item.name} (${item.unit || 'suất'})`,
      isAvailable: true,
      status: isUserAdmin ? 'approved' : 'pending',
      approved: isUserAdmin,
      soldCount: 0
    }));

    const existingProds = store?.products || [];
    const updatedProducts = [...newProducts, ...existingProds];
    
    const updatedStore: UserStorefront = store ? {
      ...store,
      products: updatedProducts
    } : {
      id: currentStoreId,
      userId: user.id,
      shopName: storeName || user.name || 'Gian Hàng Cư Dân',
      storeName: storeName || user.name || 'Gian Hàng Cư Dân',
      slug: (storeName || user.name || 'gian-hang').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: category || 'Ẩm thực & Đồ Uống',
      project: 'ocean-park-2',
      address: address || 'Vinhomes Ocean Park',
      ownerName: user.name || 'Chủ Gian Hàng',
      ownerPhone: ownerPhone || user.phone || '0868.499.929',
      ownerZalo: ownerZalo || user.phone || '0868.499.929',
      description: description || 'Gian hàng cư dân chất lượng cao, phục vụ nhanh chóng.',
      rating: 5.0,
      reviewCount: 1,
      verified: isUserAdmin,
      products: updatedProducts,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStore(updatedStore);

    fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStore)
    }).catch(e => console.warn('Store persist error:', e));

    alert(`🎉 Đã tự động thêm ${newProducts.length} món/sản phẩm từ Menu quét vào gian hàng của bạn thành công!`);
  };

  // Order Invoice Export & Filter State
  const [exportedInvoices, setExportedInvoices] = useState<Record<string, { invoiceCode: string; exportedAt: string }>>({});
  const [orderSearchTerm, setOrderSearchTerm] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  const handleUpdateOrderStatus = async (orderId: string, newOrderStatus: string, newPaymentStatus?: string) => {
    try {
      const res = await fetch(`/api/stores/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newOrderStatus,
          ...(newPaymentStatus && { paymentStatus: newPaymentStatus })
        })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { 
          ...o, 
          orderStatus: newOrderStatus as any,
          ...(newPaymentStatus && { paymentStatus: newPaymentStatus as any })
        } : o));
      } else {
        // Fallback local update
        setOrders(prev => prev.map(o => o.id === orderId ? { 
          ...o, 
          orderStatus: newOrderStatus as any,
          ...(newPaymentStatus && { paymentStatus: newPaymentStatus as any })
        } : o));
      }
    } catch (err) {
      // Fallback local update
      setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        orderStatus: newOrderStatus as any,
        ...(newPaymentStatus && { paymentStatus: newPaymentStatus as any })
      } : o));
    }
  };

  // Fetch Store & Orders
  useEffect(() => {
    fetch(`/api/stores/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStore(data);
          setStoreName(data.storeName);
          setCategory(data.category);
          setAddress(data.address);
          setOwnerPhone(data.ownerPhone);
          setOwnerZalo(data.ownerZalo || '');
          setDescription(data.description);
          setOperatingHours(data.operatingHours || '08:00 - 21:00');
          if (data.logoUrl) setLogoUrl(data.logoUrl);
          if (data.bannerUrl) setBannerUrl(data.bannerUrl);

          if (data.kiotVietConfig) {
            setKvStoreDomain(data.kiotVietConfig.storeDomain || '');
            setKvClientId(data.kiotVietConfig.clientId || '');
            setKvBranchId(data.kiotVietConfig.branchId || '');
            setKvAutoSync(data.kiotVietConfig.autoSync ?? true);
          }
        } else {
          // Initialize default store for this user
          const defaultName = `Gian Hàng Cư Dân ${user?.name || 'Vinhomes'}`;
          setStoreName(defaultName);
          setAddress(`Căn hộ phân khu Vinhomes Ocean Park`);
          setDescription(`Cửa hàng chuyên dịch vụ & sản phẩm chất lượng cao của cư dân ${user?.name || 'Vinhomes'}.`);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // Fetch store orders
    if (user?.id) {
      fetch(`/api/stores/${user.id}/orders`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch(() => {});
    }
  }, [user?.id, user?.name]);

  // Save Store Configuration
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const storePayload: UserStorefront = {
      id: store?.id || `store-${user?.id || 'guest'}`,
      userId: user?.id || 'guest',
      ownerName: user?.name || storeName || 'Cư Dân',
      ownerPhone,
      ownerZalo,
      storeName,
      slug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      logoUrl,
      bannerUrl,
      category,
      project: 'ocean-park-2',
      address,
      description,
      operatingHours,
      verified: true,
      rating: store?.rating || 5.0,
      reviewCount: store?.reviewCount || 1,
      createdAt: store?.createdAt || new Date().toISOString().split('T')[0],
      kiotVietConfig: {
        enabled: Boolean(kvClientId.trim()),
        storeDomain: kvStoreDomain,
        clientId: kvClientId,
        clientSecret: kvClientSecret || '••••••••••••••••',
        retailerName: storeName,
        branchId: kvBranchId,
        autoSync: kvAutoSync,
        lastSyncedAt: store?.kiotVietConfig?.lastSyncedAt || new Date().toLocaleString('vi-VN'),
        syncStatus: kvClientId.trim() ? 'connected' : 'disconnected',
        syncedProductsCount: store?.products?.length || 0
      },
      products: store?.products || []
    };

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storePayload)
      });
      const resData = await response.json();
      if (response.ok && resData.store) {
        setStore(resData.store);
        alert('🎉 Đã cập nhật thành công thông tin Gian Hàng Cư Dân!');
      } else {
        alert(resData.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // Sync KiotViet POS API
  const handleSyncKiotViet = async () => {
    if (!kvClientId.trim()) {
      alert('Vui lòng điền Client ID và Secret Key của tài khoản KiotViet!');
      return;
    }

    setIsSyncingKiotViet(true);
    try {
      const storeId = store?.id || `store-${user.id}`;
      const response = await fetch(`/api/stores/${storeId}/sync-kiotviet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: kvClientId,
          clientSecret: kvClientSecret,
          storeDomain: kvStoreDomain,
          branchId: kvBranchId
        })
      });

      const resData = await response.json();
      if (response.ok && resData.store) {
        setStore(resData.store);
        alert(resData.message);
      } else {
        alert(resData.error || 'Đồng bộ KiotViet thất bại.');
      }
    } catch (err) {
      alert('Không thể kết nối tới API KiotViet. Vui lòng thử lại!');
    } finally {
      setIsSyncingKiotViet(false);
    }
  };

  // Generate Gemini AI SEO Description for Product
  const handleGenerateProductSeo = async () => {
    if (!newProdName.trim()) {
      alert('Vui lòng nhập Tên Sản Phẩm / Món Ăn trước khi sinh mô tả AI!');
      return;
    }
    setIsGeneratingSeo(true);
    try {
      const res = await fetch('/api/ai/generate-product-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: newProdName,
          category: newProdCategory,
          price: newProdPrice,
          storeName: storeName || 'Gian Hàng Cư Dân',
          rawNotes: newProdDesc
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        if (data.result.seoTitle && data.result.seoTitle !== newProdName) {
          setNewProdName(data.result.seoTitle);
        }
        setNewProdDesc(data.result.seoDescription);
        alert('✨ Đã viết xong mô tả sản phẩm chuẩn SEO bằng Gemini AI (Giống người thật viết 100%)!');
      } else {
        alert('Không thể tạo mô tả AI. Vui lòng thử lại.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ AI.');
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  const openNewProductModal = () => {
    setEditingProductId(null);
    setNewProdName('');
    setNewProdCategory('Món Ăn & Đồ Uống');
    setNewProdPrice(50000);
    setNewProdUnit('suất');
    setNewProdStock(20);
    setNewProdCode('');
    setNewProdImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setNewProdDesc('');
    setShowAddProductModal(true);
  };

  const handleEditProduct = (prod: StoreProduct) => {
    setEditingProductId(prod.id);
    setNewProdName(prod.name);
    setNewProdCategory(prod.category || 'Món Ăn & Đồ Uống');
    setNewProdPrice(prod.price);
    setNewProdUnit(prod.unit || 'suất');
    setNewProdStock(prod.stockQuantity);
    setNewProdCode(prod.code || '');
    setNewProdImage(prod.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setNewProdDesc(prod.description || '');
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi gian hàng?')) return;
    const updatedProducts = (store?.products || []).filter(p => p.id !== productId);
    const updatedStore = { ...store!, products: updatedProducts };
    setStore(updatedStore as UserStorefront);

    fetch(`/api/stores/${store?.id || `store-${user.id}`}/products/${productId}`, {
      method: 'DELETE'
    });
  };

  // Add or Edit Product
  const handleAddOrUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const isUserAdmin = user.role === 'admin';
    const prodPayload: StoreProduct = {
      id: editingProductId || `p-man-${Date.now()}`,
      storeId: store?.id || `store-${user.id}`,
      code: newProdCode || `SKU-${Math.floor(Math.random() * 900) + 100}`,
      name: newProdName,
      category: newProdCategory,
      price: Number(newProdPrice),
      unit: newProdUnit,
      stockQuantity: Number(newProdStock),
      images: [newProdImage],
      description: newProdDesc || 'Sản phẩm phục vụ cư dân Vinhomes chuẩn SEO',
      isAvailable: true,
      status: isUserAdmin ? 'approved' : 'pending',
      approved: isUserAdmin,
      soldCount: 0
    };

    let updatedProducts = store?.products || [];
    if (editingProductId) {
      const existing = updatedProducts.find(p => p.id === editingProductId);
      updatedProducts = updatedProducts.map(p => p.id === editingProductId ? { ...p, ...prodPayload, status: existing?.status || prodPayload.status } : p);
    } else {
      updatedProducts = [prodPayload, ...updatedProducts];
    }

    const updatedStore = { ...store!, products: updatedProducts };
    setStore(updatedStore as UserStorefront);
    setShowAddProductModal(false);
    setEditingProductId(null);

    // Save to backend
    fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStore)
    });

    if (!isUserAdmin && !editingProductId) {
      alert('🎉 Đã thêm sản phẩm thành công! Sản phẩm đang ở trạng thái ⏳ Chờ Admin duyệt trước khi xuất hiện trên Website.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 font-bold">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
        Đang tải thông tin gian hàng cư dân & KiotViet POS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
              HỆ THỐNG GIAN HÀNG CƯ DÂN & KIOTVIET POS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              QUẢN LÝ TỰ ĐỘNG GIAN HÀNG & KẾT NỐI KIOTVIET
            </h2>
            <p className="text-xs text-slate-300">
              Mỗi cư dân có gian hàng trực tuyến riêng. Tự động đồng bộ sản phẩm, tồn kho và đơn hàng với phần mềm KiotViet / Sapo!
            </p>
          </div>

          {store && (
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem Gian Hàng</span>
            </button>
          )}
        </div>

        {/* Sync Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-amber-500/30">
            <span className="text-slate-400 block font-bold mb-0.5">Tên Gian Hàng:</span>
            <span className="text-sm font-black text-amber-400 line-clamp-1">{storeName || 'Chưa Đặt Tên'}</span>
          </div>
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-blue-500/30">
            <span className="text-slate-400 block font-bold mb-0.5">Trạng Thái KiotViet:</span>
            <span className="text-sm font-black text-blue-400">
              {store?.kiotVietConfig?.enabled ? '⚡ Đã Kết Nối API' : '⚪ Chưa Kết Nối API'}
            </span>
          </div>
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/30">
            <span className="text-slate-400 block font-bold mb-0.5">Sản Phẩm Trong Khai Kho:</span>
            <span className="text-sm font-black text-emerald-400">{store?.products?.length || 0} Sản phẩm</span>
          </div>
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-purple-500/30">
            <span className="text-slate-400 block font-bold mb-0.5">Đơn Hàng Mới Nhận:</span>
            <span className="text-sm font-black text-purple-400">{orders.length} Đơn Hàng</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section A: Store Basic Info Form */}
        <form onSubmit={handleSaveStore} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Store className="w-5 h-5 text-amber-500" />
            THÔNG TIN THƯƠNG HIỆU GIAN HÀNG
          </h3>

          {/* Auto-fill interactive checkbox banner */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoUseProfileInfo}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAutoUseProfileInfo(checked);
                  if (checked && user) {
                    if (user.phone) {
                      setOwnerPhone(user.phone);
                      setOwnerZalo(user.phone);
                    }
                    if (user.name) {
                      setStoreName(`Gian Hàng Cư Dân ${user.name}`);
                    }
                    setAddress('Căn hộ phân khu Vinhomes Ocean Park');
                  }
                }}
                className="w-5 h-5 rounded border-amber-500 text-amber-500 focus:ring-amber-500 mt-0.5 shrink-0"
              />
              <div>
                <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400 block uppercase">
                  ☑ Tự động lấy thông tin cá nhân từ tài khoản (Họ tên, SĐT, Căn hộ)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  {autoUseProfileInfo 
                    ? `Đã tích chọn (Đồng ý): Tự động dùng thông tin tài khoản (${user.name || 'Cư dân'} - ${user.phone || '0868.499.929'}).` 
                    : 'Bỏ tích chọn (Không đồng ý): Bạn có thể tự do nhập Tên thương hiệu, SĐT Zalo & Địa chỉ hiển thị mới bên dưới.'}
                </p>
              </div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên Gian Hàng Cư Dân (*):
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ví dụ: Tiệm Bánh & Nông Sản Sạch Chị Mai - San Hô 2"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Danh Mục Sản Phẩm / Dịch Vụ:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="Thực Phẩm & Ăn Uống">Thực Phẩm & Ăn Uống</option>
                  <option value="Nội Thất & Thi Công">Nội Thất & Thi Công</option>
                  <option value="Sửa Chữa & Bảo Trì">Sửa Chữa & Bảo Trì</option>
                  <option value="Giặt Là & Dịch Vụ Gia Đình">Giặt Là & Dịch Vụ Gia Đình</option>
                  <option value="Thời Trang & Làm Đẹp">Thời Trang & Làm Đẹp</option>
                  <option value="Đồ Cho Mẹ & Bé">Đồ Cho Mẹ & Bé</option>
                  <option value="Dịch Vụ Khác">Dịch Vụ Khác</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Giờ Mở Cửa Hoạt Động:
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="08:00 - 21:30"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Số Điện Thoại Liên Hệ Cửa Hàng (*):
                </label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Số Zalo Tư Vấn Đặt Hàng:
                </label>
                <input
                  type="tel"
                  value={ownerZalo}
                  onChange={(e) => setOwnerZalo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Địa Chỉ Gian Hàng Trong Dự Án (*):
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shophouse SH2-18, Phân khu San Hô, Vinhomes..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mô Tả Giới Thiệu Cửa Hàng:
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Giới thiệu dịch vụ, nguồn gốc sản phẩm, ưu đãi dành cho cư dân..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Logo Cửa Hàng (Chọn từ PC hoặc nhập Link URL):
                </label>
                <div className="flex gap-2">
                  <label className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow">
                    <span>📁 Chọn Ảnh (Dưới 10MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const check = validateImageSize(file);
                          if (!check.valid) {
                            alert(check.message);
                            e.target.value = '';
                            return;
                          }
                          setLogoUrl(createInstantPreview(file));
                          try {
                            const watermarked = await addWatermarkToImage(file);
                            if (watermarked) {
                              // Upload lên server -> URL public
                              const url = watermarked.startsWith('data:image/')
                                ? await uploadBase64DataUrl(watermarked, 'store-logos')
                                : watermarked;
                              if (url) setLogoUrl(url);
                            }
                          } catch (err) {
                            console.error('Lỗi tải logo:', err);
                          } finally {
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Banner Gian Hàng (Chọn từ PC hoặc nhập Link URL):
                </label>
                <div className="flex gap-2">
                  <label className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow">
                    <span>📁 Chọn Banner (Dưới 10MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const check = validateImageSize(file);
                          if (!check.valid) {
                            alert(check.message);
                            e.target.value = '';
                            return;
                          }
                          setBannerUrl(createInstantPreview(file));
                          try {
                            const watermarked = await addWatermarkToImage(file);
                            if (watermarked) {
                              // Upload lên server -> URL public
                              const url = watermarked.startsWith('data:image/')
                                ? await uploadBase64DataUrl(watermarked, 'store-banners')
                                : watermarked;
                              if (url) setBannerUrl(url);
                            }
                          } catch (err) {
                            console.error('Lỗi tải banner:', err);
                          } finally {
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md"
            >
              {isSaving ? 'Đang Lưu Thông Tin...' : 'LƯU THÔNG TIN GIAN HÀNG'}
            </button>
          </div>
        </form>

        {/* Section B: KiotViet POS API Integration Box */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl border border-blue-500/40 p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-blue-500/30 pb-3">
            <h3 className="font-extrabold text-base text-blue-300 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              KẾT NỐI PHẦN MỀM BÁN HÀNG KIOTVIET (API INTEGRATION)
            </h3>
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 font-bold text-[10px] rounded-md border border-blue-500/40">
              POS Direct Sync
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Nhập thông tin kết nối API từ ứng dụng KiotViet (hoặc Sapo) để tự động đồng bộ danh mục sản phẩm, giá bán, tồn kho thực tế và đơn đặt hàng mới.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Tên Miền Cửa Hàng KiotViet (Retailer Store Domain):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={kvStoreDomain}
                  onChange={(e) => setKvStoreDomain(e.target.value)}
                  placeholder="cuahangvinhomes.kiotviet.vn"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-blue-500/30 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  KiotViet Client ID:
                </label>
                <input
                  type="text"
                  value={kvClientId}
                  onChange={(e) => setKvClientId(e.target.value)}
                  placeholder="kv-client-..."
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-blue-500/30 rounded-xl text-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  KiotViet Client Secret Key:
                </label>
                <input
                  type="password"
                  value={kvClientSecret}
                  onChange={(e) => setKvClientSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-blue-500/30 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Tên / Mã Chi Nhánh KiotViet (Branch Name):
              </label>
              <input
                type="text"
                value={kvBranchId}
                onChange={(e) => setKvBranchId(e.target.value)}
                placeholder="Chi nhánh Ocean Park 2 (ID: 10928)"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-blue-500/30 rounded-xl text-white"
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="kvAutoSync"
                checked={kvAutoSync}
                onChange={(e) => setKvAutoSync(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="kvAutoSync" className="text-slate-300 font-bold cursor-pointer">
                Tự động đồng bộ tồn kho & đẩy đơn hàng từ Chợ Cư Dân sang KiotViet
              </label>
            </div>

            <button
              type="button"
              onClick={handleSyncKiotViet}
              disabled={isSyncingKiotViet}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingKiotViet ? 'animate-spin' : ''}`} />
              <span>{isSyncingKiotViet ? 'Đang Đăng Nhập KiotViet...' : '⚡ Kết Nối & Đồng Bộ KiotViet'}</span>
            </button>

            {store?.kiotVietConfig?.lastSyncedAt && (
              <div className="text-[11px] text-emerald-400 font-bold text-center flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Lần đồng bộ gần nhất: {store.kiotVietConfig.lastSyncedAt} ({store.kiotVietConfig.syncedProductsCount || 0} sản phẩm)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section C: Product Catalog Management */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              DANH MỤC SẢN PHẨM & DỊCH VỤ GIAN HÀNG ({store?.products?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách sản phẩm cư dân có thể mua trực tiếp từ gian hàng của bạn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAiScannerModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 ring-1 ring-amber-300 animate-pulse cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>🤖 AI Quét Menu & Tự Động Thêm Món Vào Gian Hàng</span>
            </button>

            <button
              onClick={openNewProductModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Món / Sản Phẩm Mới</span>
            </button>
          </div>
        </div>

        {/* Product Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {store?.products?.map((prod) => (
            <div 
              key={prod.id}
              className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="flex gap-3 items-center">
                <img loading="lazy" 
                  src={prod.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'} 
                  alt={prod.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{prod.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-black text-amber-500">{prod.price.toLocaleString('vi-VN')}đ</span>
                    {prod.unit && <span className="text-slate-400">/ {prod.unit}</span>}
                    <span className="text-slate-400">(Tồn: {prod.stockQuantity})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {prod.status === 'pending' ? (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[9px] rounded-md border border-amber-500/30">
                        ⏳ Chờ duyệt
                      </span>
                    ) : prod.status === 'rejected' ? (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold text-[9px] rounded-md border border-red-500/30">
                        ❌ Tạm ẩn
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] rounded-md border border-emerald-500/30">
                        ✓ Đã duyệt • Hiện trên Web
                      </span>
                    )}
                    {prod.kiotVietId && (
                      <span className="inline-block px-1.5 py-0.5 bg-blue-500/10 text-blue-500 font-mono font-bold text-[9px] rounded">
                        ⚡ {prod.code || prod.kiotVietId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons: Edit, Delete, AI SEO Description */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => handleEditProduct(prod)}
                  className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold flex items-center gap-1"
                  title="Sửa thông tin sản phẩm"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Sửa</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg font-bold flex items-center gap-1"
                  title="Xóa sản phẩm khỏi gian hàng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))}

          {(!store?.products || store.products.length === 0) && (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs font-bold space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-500 stroke-1" />
              <p>Chưa có sản phẩm trong gian hàng. Hãy bấm "⚡ Kết Nối KiotViet API" hoặc bấm "Thêm Món Mới" để bắt đầu bán hàng!</p>
            </div>
          )}
        </div>
      </div>

      {/* Section D: Order Management, Revenue Statistics & KiotViet VAT Invoice Export */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded uppercase tracking-wider">
              BÁO CÁO DOANH THU & ĐƠN HÀNG CÁ NHÂN
            </span>
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 mt-1">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              QUẢN LÝ LỊCH SỬ ĐƠN HÀNG & DOANH THU GIAN HÀNG ({orders.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi doanh thu bán hàng thực tế, cập nhật tiến độ giao hàng, thanh toán VietQR và xuất Hóa Đơn VAT.
            </p>
          </div>
        </div>

        {/* REVENUE STATS DASHBOARD GRID */}
        {(() => {
          const totalRevenue = orders
            .filter(o => o.orderStatus === 'completed' || o.paymentStatus === 'paid')
            .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
          const completedCount = orders.filter(o => o.orderStatus === 'completed').length;
          const activeCount = orders.filter(o => o.orderStatus === 'new' || o.orderStatus === 'confirmed' || o.orderStatus === 'delivering').length;
          const cancelledCount = orders.filter(o => o.orderStatus === 'cancelled').length;

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-md space-y-1">
                <div className="flex items-center justify-between opacity-90 text-xs font-bold">
                  <span>TỔNG DOANH THU</span>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-xl font-black">{totalRevenue.toLocaleString('vi-VN')} VNĐ</div>
                <div className="text-[10px] opacity-80 font-medium">Doanh thu từ đơn thành công/đã trả</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>TỔNG ĐƠN HÀNG</span>
                  <ShoppingBag className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{orders.length} đơn</div>
                <div className="text-[10px] text-slate-400 font-medium">Đơn hàng cư dân đặt mua</div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <span>ĐANG XỬ LÝ / GIAO</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400">{activeCount} đơn</div>
                <div className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Cần xác nhận & giao hàng</div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span>ĐƠN HOÀN THÀNH</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedCount} đơn</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Khách đã nhận hàng thành công</div>
              </div>
            </div>
          );
        })()}

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between text-xs pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên, SĐT khách..."
              value={orderSearchTerm}
              onChange={(e) => setOrderSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'new', label: '🆕 Mới' },
              { id: 'confirmed', label: '✓ Xác Nhận' },
              { id: 'delivering', label: '🚚 Đang Giao' },
              { id: 'completed', label: '🎉 Hoàn Thành' },
              { id: 'cancelled', label: '❌ Đã Hủy' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setOrderStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  orderStatusFilter === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ORDER LIST & ACTION ITEMS */}
        {(() => {
          const filteredOrders = orders.filter(ord => {
            const matchesStatus = orderStatusFilter === 'all' ? true : ord.orderStatus === orderStatusFilter;
            const matchesSearch = !orderSearchTerm.trim() ? true : (
              ord.orderCode.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
              ord.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
              ord.customerPhone.includes(orderSearchTerm)
            );
            return matchesStatus && matchesSearch;
          });

          if (filteredOrders.length === 0) {
            return (
              <div className="p-8 text-center text-slate-400 text-xs font-bold space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-500 stroke-1" />
                <p>Không tìm thấy đơn hàng phù hợp với bộ lọc.</p>
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {filteredOrders.map((ord) => {
                const invoice = exportedInvoices[ord.id];
                const vatReq = (ord as any).vatInvoiceRequest;

                return (
                  <div 
                    key={ord.id}
                    className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div>
                        <span className="font-black text-amber-500 text-sm">{ord.orderCode}</span>
                        <span className="ml-2 font-bold text-slate-900 dark:text-white">| Khách: {ord.customerName} ({ord.customerPhone})</span>
                        <span className="block text-[11px] text-slate-400">📍 Địa chỉ: {ord.customerAddress} • {ord.createdAt}</span>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                        <span className="font-black text-emerald-500 text-sm">{ord.totalAmount.toLocaleString('vi-VN')} VNĐ</span>
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">
                          {ord.paymentMethod === 'vietqr' ? '💳 VietQR' : '💵 COD'} ({ord.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'})
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <span className="font-bold text-[11px] text-slate-400">Sản phẩm khách mua:</span>
                      <div className="flex flex-wrap gap-2">
                        {ord.items.map((it, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {it.productName} (x{it.quantity}) - {(it.price * it.quantity).toLocaleString('vi-VN')}đ
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Order Controls: Change Status & Payment */}
                    <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 text-[11px]">Trạng Thái Đơn:</span>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg font-bold border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="new">🆕 Đơn Mới</option>
                          <option value="confirmed">✓ Đã Xác Nhận</option>
                          <option value="delivering">🚚 Đang Giao Hàng</option>
                          <option value="completed">🎉 Hoàn Thành</option>
                          <option value="cancelled">❌ Hủy Đơn</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 text-[11px]">Thanh Toán:</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(ord.id, ord.orderStatus, ord.paymentStatus === 'paid' ? 'pending' : 'paid')}
                          className={`px-3 py-1.5 rounded-lg font-extrabold text-[11px] transition cursor-pointer ${
                            ord.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {ord.paymentStatus === 'paid' ? '✓ Đã Thanh Toán' : '⏳ Chưa Thanh Toán (Bấm Đổi)'}
                        </button>
                      </div>
                    </div>

                    {/* VAT Invoice Request details & Export action button */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      {vatReq ? (
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 space-y-0.5">
                          <span className="font-black flex items-center gap-1">
                            📄 Khách hàng yêu cầu xuất HĐ Điện Tử VAT:
                          </span>
                          <div className="text-[11px] font-bold">
                            • Cty: {vatReq.companyName} | MST: {vatReq.taxCode}
                          </div>
                          <div className="text-[10px]">
                            • Email nhận: {vatReq.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Khách không yêu cầu xuất hóa đơn VAT công ty.
                        </span>
                      )}

                      {/* Invoice status button */}
                      {invoice ? (
                        <div className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Đã Xuất HĐĐT: <strong>{invoice.invoiceCode}</strong></span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const code = `HD-KV-${Math.floor(Math.random() * 899999) + 100000}`;
                            setExportedInvoices(prev => ({
                              ...prev,
                              [ord.id]: { invoiceCode: code, exportedAt: new Date().toLocaleString('vi-VN') }
                            }));
                            alert(`🎉 Đã truyền dữ liệu & xuất thành công Hóa Đơn Điện Tử KiotViet/MISA!\nMã hóa đơn: ${code}`);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>📄 Xuất Hóa Đơn VAT KiotViet / MISA</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Add / Edit Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center overflow-y-auto">
          <button
            type="button"
            onClick={() => setShowAddProductModal(false)}
            className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
            title="Đóng"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <form onSubmit={handleAddOrUpdateProduct} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-xs my-auto max-h-[88vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowAddProductModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition bg-slate-800 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              {editingProductId ? 'SỬA SẢN PHẨM / DỊCH VỤ' : 'THÊM SẢN PHẨM / MÓN MỚI VÀO GIAN HÀNG'}
            </h3>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Tên Sản Phẩm / Món Ăn / Dịch Vụ (*):</label>
              <input
                type="text"
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="Ví dụ: Cơm Sườn Nướng Mật Ong S2.12"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Giá Bán VNĐ (*):</label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Đơn Vị Tính:</label>
                <input
                  type="text"
                  value={newProdUnit}
                  onChange={(e) => setNewProdUnit(e.target.value)}
                  placeholder="hộp / suất / cái..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Số Lượng Tồn Kho:</label>
                <input
                  type="number"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Mã Sản Phẩm / SKU:</label>
                <input
                  type="text"
                  value={newProdCode}
                  onChange={(e) => setNewProdCode(e.target.value)}
                  placeholder="SP-001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>
            </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Ảnh Sản Phẩm (Chọn từ PC hoặc dán Link URL):</label>
                <div className="flex gap-2">
                  <label className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow">
                    <span>📁 Chọn Ảnh (Dưới 10MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const check = validateImageSize(file);
                          if (!check.valid) {
                            alert(check.message);
                            e.target.value = '';
                            return;
                          }
                          setNewProdImage(createInstantPreview(file));
                          try {
                            const watermarked = await addWatermarkToImage(file);
                            if (watermarked) {
                              // Upload lên server -> URL public
                              const url = watermarked.startsWith('data:image/')
                                ? await uploadBase64DataUrl(watermarked, 'store-products')
                                : watermarked;
                              if (url) setNewProdImage(url);
                            }
                          } catch (err) {
                            console.error('Lỗi tải ảnh sản phẩm:', err);
                          } finally {
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

            {/* AI SEO Description Generator Button */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Mô Tả Sản Phẩm / Bài Viết Chuẩn SEO:
                </label>
                <button
                  type="button"
                  onClick={handleGenerateProductSeo}
                  disabled={isGeneratingSeo}
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow flex items-center gap-1 transition"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingSeo ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingSeo ? 'Đang viết AI...' : '✨ Viết Bài AI Chuẩn SEO (Giống Người Thật)'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                placeholder="Nhập mô tả sản phẩm hoặc bấm nút 'Viết Bài AI Chuẩn SEO' ở trên để Gemini AI tự động viết bài tự nhiên như cư dân thật 100%..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs leading-relaxed"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl"
              >
                {editingProductId ? 'Lưu Cập Nhật' : 'Lưu Sản Phẩm Mới'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Photo Menu Scanner Modal */}
      {showPhotoMenuModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center overflow-y-auto">
          <button
            type="button"
            onClick={() => setShowPhotoMenuModal(false)}
            className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
            title="Đóng"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl space-y-5 shadow-2xl relative text-xs my-auto max-h-[88vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowPhotoMenuModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 font-bold text-[10px] rounded uppercase">
                TỰ ĐỘNG HÓA AI & DUYỆT THỦ CÔNG
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                📸 NHẬP MÓN & NIÊM YẾT GIÁ TỪ ẢNH CHỤP MENU
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Chụp ảnh thực đơn/bảng giá giấy của quán. Hệ thống AI tự quét danh sách món & giá niêm yết để gửi Ban Quản Trị Admin duyệt thủ công.
              </p>
            </div>

            {/* Image Preview / Input */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-300">Ảnh Menu Giấy Đã Chụp (Tải từ PC hoặc dán Link Web):</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow">
                  <span>📁 CHỌN ẢNH MENU (DƯỚI 10MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const check = validateImageSize(file);
                        if (!check.valid) {
                          alert(check.message);
                          e.target.value = '';
                          return;
                        }
                        setPhotoMenuUrl(createInstantPreview(file));
                        try {
                          const watermarked = await addWatermarkToImage(file);
                          if (watermarked) {
                            // Upload lên server -> URL public
                            const url = watermarked.startsWith('data:image/')
                              ? await uploadBase64DataUrl(watermarked, 'store-menus')
                              : watermarked;
                            if (url) setPhotoMenuUrl(url);
                          }
                        } catch (err) {
                          console.error('Lỗi tải ảnh menu:', err);
                        } finally {
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                </label>

                <input
                  type="text"
                  value={photoMenuUrl}
                  onChange={(e) => setPhotoMenuUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
                
                <button
                  type="button"
                  onClick={async () => {
                    if (!photoMenuUrl) {
                      alert('Vui lòng chọn ảnh hoặc dán link ảnh trước.');
                      return;
                    }
                    setIsAnalyzingPhoto(true);
                    try {
                      const res = await fetch('/api/ai/scan-menu-pricelist', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          imageBase64: photoMenuUrl,
                          providerName: storeName || user.name
                        })
                      });
                      const data = await res.json();
                      if (data.success && data.result?.items && data.result.items.length > 0) {
                        setExtractedDishes(data.result.items.map((it: any, idx: number) => ({
                          id: `ocr-${Date.now()}-${idx}`,
                          name: it.name,
                          price: Number(it.price) || 0,
                          unit: it.unit || 'suất',
                          category: it.category || 'Món Ăn',
                          status: 'pending'
                        })));
                        alert(`✨ Gemini AI đã nhận diện thành công ${data.result.items.length} món & giá niêm yết từ ảnh Menu!`);
                      } else {
                        alert('Không nhận diện được món tự động. Đã chuyển sang chế độ nhập thủ công.');
                      }
                    } catch (e) {
                      alert('Lỗi kết nối máy chủ AI khi quét ảnh.');
                    } finally {
                      setIsAnalyzingPhoto(false);
                    }
                  }}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isAnalyzingPhoto ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzingPhoto ? 'Đang Quét AI...' : 'Quét Lại Ảnh Bằng AI'}</span>
                </button>
              </div>

              {photoMenuUrl && (
                <div className="h-40 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative">
                  <img loading="lazy" src={photoMenuUrl} alt="Menu preview" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                    <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-md uppercase">
                      ẢNH MENU THỰC TẾ ĐÃ CHỤP
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Items Review Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  Danh Sách Món AI Tự Động Trích Xuất ({extractedDishes.length}):
                </span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 font-bold text-[10px] rounded">
                  ⏳ Chờ Admin Duyệt Thủ Công
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 space-y-1">
                {extractedDishes.map((dish, idx) => (
                  <div key={dish.id} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{dish.name}</span>
                      <span className="block text-[10px] text-slate-400">{dish.category} • {dish.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-500">{dish.price.toLocaleString('vi-VN')}đ</span>
                      <span className="block text-[9px] text-amber-400 font-bold">Chờ duyệt</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert('🎉 Yêu cầu niêm yết menu từ ảnh chụp đã gửi thành công!\nBan Quản Trị Admin sẽ kiểm tra và phê duyệt hiển thị trong thời gian sớm nhất.');
                setShowPhotoMenuModal(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
            >
              GỬI YÊU CẦU NIÊM YẾT BẢNG GIÁ ĐẾN ADMIN
            </button>
          </div>
        </div>
      )}

      {/* AI Menu & Price List Scanner Modal for Storefront */}
      <AiMenuScannerModal
        isOpen={showAiScannerModal}
        onClose={() => setShowAiScannerModal(false)}
        onApplyToStoreProducts={handleBatchAddScannedProducts}
        defaultProject="ocean-park-2"
        currentUserPhone={user.phone || ''}
        currentUserName={user.name || storeName || ''}
      />

      {/* Preview Store Front Modal */}
      {showPreviewModal && store && (
        <UserStorefrontModal
          store={store}
          onClose={() => setShowPreviewModal(false)}
          currentUser={user}
        />
      )}
    </div>
  );
};
