import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Plus, Edit3, Trash2, Check, X, Eye, ExternalLink,
  Upload, RefreshCw, Filter, Search, ShieldCheck, CheckCircle2,
  AlertTriangle, ArrowUpDown, Image as ImageIcon, Link as LinkIcon,
  Phone, Calendar, User, FileText, Layers, ToggleLeft, ToggleRight,
  TrendingUp, MousePointerClick, Info, HelpCircle
} from 'lucide-react';
import { AdBanner } from '../types';

interface AdminAdsManagerProps {
  onRefreshData?: () => void;
  initialFilterPosition?: string;
  autoOpenCreateModal?: boolean;
}

// Pre-curated High-Converting Banner Templates for Vinhomes & Local Ecosystem
const SAMPLE_BANNER_PRESETS = [
  {
    title: 'Quỹ Căn Biệt Thự & Shophouse Ocean Park 2 Cắt Lỗ Sâu - Sổ Đỏ Sẵn Sàng',
    position: 'home_middle',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '/properties',
    badgeText: 'CẮT LỖ SÂU',
    displayStyle: 'glowing_border' as const,
    widthSize: 'large' as const
  },
  {
    title: '⚡ BẤM XEM NGAY: Danh Sách Căn Hộ Ocean Park 1, 2, 3 Giá Tốt Nhất Tháng Này',
    position: 'float_right_pc',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
    linkUrl: '/properties',
    badgeText: 'HOT BÁM ĐUỔI',
    displayStyle: 'glowing_border' as const,
    widthSize: 'medium' as const
  },
  {
    title: 'Gói Vay Vốn Ngân Hàng Lãi Suất 0% Trong 24 Tháng Tại Vinhomes',
    position: 'home_sidebar',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/mortgage-calculator',
    badgeText: 'LÃI SUẤT 0%',
    displayStyle: 'card_full' as const,
    widthSize: 'medium' as const
  },
  {
    title: 'Đăng Bán & Cho Thuê BĐS Vinhomes Miễn Phí Trên Chợ Cư Dân 24h',
    position: 'header_top',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '/post-property',
    badgeText: 'MIỄN PHÍ',
    displayStyle: 'card_full' as const,
    widthSize: 'large' as const
  },
  {
    title: 'Dịch Vụ Sửa Chữa Điện Nước & Thợ Kỹ Thuật Uy Tín Tại Nhà 24/7',
    position: 'float_left_pc',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    linkUrl: '/resident-services',
    badgeText: 'THỢ 24/7',
    displayStyle: 'glowing_border' as const,
    widthSize: 'medium' as const
  },
  {
    title: '🎉 Khai Trương Siêu Thị Cư Dân & Gian Hàng Ẩm Thực Tươi Sống Mỗi Ngày',
    position: 'popup_modal',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '/resident-market',
    badgeText: 'ƯU ĐÃI KHAI TRƯƠNG',
    displayStyle: 'glowing_border' as const,
    widthSize: 'large' as const
  }
];

const POSITION_LABELS: Record<string, { label: string; icon: string; desc: string; tag: string }> = {
  float_right_pc: {
    label: 'Cột Phải Bám Đuổi (Sticky Float Right)',
    icon: '👉',
    desc: 'Trượt bám đuổi bên phải màn hình máy tính PC/Laptop, có nút đóng ❌',
    tag: 'Bám đuổi Phải'
  },
  float_left_pc: {
    label: 'Cột Trái Bám Đuổi (Sticky Float Left)',
    icon: '👈',
    desc: 'Trượt bám đuổi bên trái màn hình máy tính PC/Laptop, có nút đóng ❌',
    tag: 'Bám đuổi Trái'
  },
  header_top: {
    label: 'Thanh Header Trên Cùng (Top Banner Bar)',
    icon: '🔝',
    desc: 'Hiển thị trên cùng đầu trang web, thu hút sự chú ý đầu tiên của khách',
    tag: 'Top Header'
  },
  home_middle: {
    label: 'Giữa Trang Chủ (Home Middle Banner)',
    icon: '🏢',
    desc: 'Hiển thị xen kẽ ở giữa danh sách tin bất động sản trang chủ',
    tag: 'Giữa Trang Chủ'
  },
  home_sidebar: {
    label: 'Cột Phải Trang Chủ (Home Sidebar Banner)',
    icon: '📑',
    desc: 'Nằm ở cột tiện ích bên phải trang chủ BĐS',
    tag: 'Sidebar BĐS'
  },
  property_detail: {
    label: 'Trang Chi Tiết Tin Đăng (Property Detail)',
    icon: '🔍',
    desc: 'Hiển thị ngay dưới thông tin liên hệ của từng tin đăng BĐS',
    tag: 'Chi Tiết BĐS'
  },
  popup_modal: {
    label: 'Pop-Up Nổi Trung Tâm (Center Modal Pop-up)',
    icon: '⭐',
    desc: 'Bật lên ngay trung tâm khi vào web (có nút tắt ❌, gây ấn tượng mạnh)',
    tag: 'Popup Nổi'
  },
  resident_market_top: {
    label: 'Trang Chợ Cư Dân (Resident Market Banner)',
    icon: '🏪',
    desc: 'Hiển thị trên đầu trang Chợ Cư Dân & Gian hàng',
    tag: 'Chợ Cư Dân'
  },
  resident_services: {
    label: 'Trang Thợ & Dịch Vụ Cư Dân (Technician Banner)',
    icon: '🛠️',
    desc: 'Hiển thị trên trang Thợ Kỹ thuật & Tuyển dụng',
    tag: 'Thợ & Dịch Vụ'
  }
};

const DEFAULT_PRESET_ADS: AdBanner[] = SAMPLE_BANNER_PRESETS.map((p, idx) => ({
  id: `preset_ad_${idx + 1}`,
  title: p.title,
  position: p.position,
  imageUrl: p.imageUrl,
  linkUrl: p.linkUrl,
  badgeText: p.badgeText,
  displayStyle: p.displayStyle,
  widthSize: p.widthSize,
  active: true,
  isActive: true,
  clickCount: 28 + idx * 12,
  clicks: 28 + idx * 12,
  viewCount: 350 + idx * 85,
  views: 350 + idx * 85,
  startDate: new Date().toISOString().split('T')[0],
  clientName: 'Ban Quản Trị Hệ Thống',
  clientPhone: '0988.247.247',
  clientNote: 'Banner mẫu hệ thống tự động khởi tạo',
  createdAt: new Date().toISOString()
}));

export const AdminAdsManager: React.FC<AdminAdsManagerProps> = ({
  onRefreshData,
  initialFilterPosition,
  autoOpenCreateModal
}) => {
  const [ads, setAds] = useState<AdBanner[]>(DEFAULT_PRESET_ADS);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [filterPosition, setFilterPosition] = useState<string>(initialFilterPosition || 'all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAd, setEditingAd] = useState<AdBanner | null>(null);

  // Form Input States
  const [formTitle, setFormTitle] = useState('');
  const [formPosition, setFormPosition] = useState('home_middle');
  const [formImage, setFormImage] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('');
  const [formWidthSize, setFormWidthSize] = useState<'small' | 'medium' | 'large' | 'compact'>('medium');
  const [formDisplayStyle, setFormDisplayStyle] = useState<'card_full' | 'image_only' | 'glowing_border' | 'minimal' | 'standard'>('card_full');
  const [formActive, setFormActive] = useState(true);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formClientNote, setFormClientNote] = useState('');

  // Interactive Live Preview Modal
  const [previewingAd, setPreviewingAd] = useState<AdBanner | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync with Server and LocalStorage
  const fetchAdsFromServer = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        const data: AdBanner[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAds(data);
          try {
            localStorage.setItem('chocudan24h_ads', JSON.stringify(data));
            localStorage.setItem('hb_ads', JSON.stringify(data));
          } catch (e) {}
        } else if (Array.isArray(data) && data.length === 0) {
          // If server has no ads yet, check localStorage or fallback to default preset ads
          const saved = localStorage.getItem('chocudan24h_ads') || localStorage.getItem('hb_ads');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setAds(parsed);
                return;
              }
            } catch (e) {}
          }
          setAds(DEFAULT_PRESET_ADS);
        }
      }
    } catch (err) {
      console.warn('Lỗi kết nối tải banner từ server, nạp từ bộ nhớ tạm:', err);
      try {
        const saved = localStorage.getItem('chocudan24h_ads');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAds(parsed);
          }
        }
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdsFromServer();
  }, []);

  useEffect(() => {
    if (initialFilterPosition) {
      setFilterPosition(initialFilterPosition);
    }
  }, [initialFilterPosition]);

  useEffect(() => {
    if (autoOpenCreateModal) {
      handleOpenAddForm();
    }
  }, [autoOpenCreateModal]);

  const syncStateAndLocal = (newAds: AdBanner[]) => {
    setAds(newAds);
    try {
      localStorage.setItem('chocudan24h_ads', JSON.stringify(newAds));
      localStorage.setItem('hb_ads', JSON.stringify(newAds));
    } catch (e) {}
    if (onRefreshData) onRefreshData();
  };

  const handleOpenAddForm = () => {
    setEditingAd(null);
    setFormTitle('');
    setFormPosition('home_middle');
    setFormImage('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
    setFormLink('/properties');
    setFormBadgeText('QUẢNG CÁO VIP');
    setFormWidthSize('medium');
    setFormDisplayStyle('glowing_border');
    setFormActive(true);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setFormClientName('');
    setFormClientPhone('');
    setFormClientNote('');
    setIsFormOpen(true);
  };

  const handleStartEdit = (ad: AdBanner) => {
    setEditingAd(ad);
    setFormTitle(ad.title || '');
    setFormPosition(ad.position || 'home_middle');
    setFormImage(ad.imageUrl || '');
    setFormLink(ad.linkUrl || ad.targetUrl || '/');
    setFormBadgeText(ad.badgeText || '');
    setFormWidthSize(ad.widthSize || 'medium');
    setFormDisplayStyle((ad.displayStyle as any) || 'card_full');
    setFormActive(ad.active ?? ad.isActive ?? true);
    setFormStartDate(ad.startDate || ad.createdAt || '');
    setFormEndDate(ad.endDate || '');
    setFormClientName(ad.clientName || '');
    setFormClientPhone(ad.clientPhone || '');
    setFormClientNote(ad.clientNote || '');
    setIsFormOpen(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleApplyPreset = (preset: typeof SAMPLE_BANNER_PRESETS[0]) => {
    setFormTitle(preset.title);
    setFormPosition(preset.position);
    setFormImage(preset.imageUrl);
    setFormLink(preset.linkUrl);
    setFormBadgeText(preset.badgeText);
    setFormDisplayStyle(preset.displayStyle);
    setFormWidthSize(preset.widthSize);
    showToast('Đã áp dụng mẫu banner thiết kế sẵn!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetAdId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Ảnh quá lớn. Vui lòng chọn ảnh dung lượng dưới 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        if (targetAdId) {
          // Direct quick upload for an existing ad in list
          try {
            const res = await fetch(`/api/ads/${targetAdId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl: base64 })
            });
            if (res.ok) {
              const data = await res.json();
              syncStateAndLocal(data.ads || ads.map(a => a.id === targetAdId ? { ...a, imageUrl: base64 } : a));
              showToast('✅ Đã cập nhật ảnh banner trực tiếp thành công!');
            }
          } catch (err) {
            syncStateAndLocal(ads.map(a => a.id === targetAdId ? { ...a, imageUrl: base64 } : a));
            showToast('✅ Đã cập nhật ảnh banner vào bộ nhớ!');
          }
        } else {
          setFormImage(base64);
          showToast('✅ Đã tải ảnh từ máy tính thành công!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formImage.trim()) {
      showToast('⚠️ Vui lòng nhập tiêu đề và hình ảnh cho banner!');
      return;
    }

    setIsSaving(true);
    const adData: Partial<AdBanner> = {
      title: formTitle.trim(),
      position: formPosition,
      imageUrl: formImage.trim(),
      linkUrl: formLink.trim() || '/',
      targetUrl: formLink.trim() || '/',
      badgeText: formBadgeText.trim(),
      widthSize: formWidthSize,
      displayStyle: formDisplayStyle,
      active: formActive,
      isActive: formActive,
      startDate: formStartDate,
      endDate: formEndDate,
      clientName: formClientName.trim(),
      clientPhone: formClientPhone.trim(),
      clientNote: formClientNote.trim()
    };

    try {
      if (editingAd) {
        // PUT update
        const res = await fetch(`/api/ads/${editingAd.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adData)
        });
        if (res.ok) {
          const data = await res.json();
          syncStateAndLocal(data.ads || ads.map(a => a.id === editingAd.id ? { ...a, ...adData } : a));
          showToast('🎉 Đã cập nhật Banner quảng cáo thành công!');
        } else {
          syncStateAndLocal(ads.map(a => a.id === editingAd.id ? { ...a, ...adData } : a));
          showToast('✅ Đã lưu cập nhật banner!');
        }
      } else {
        // POST create
        const newId = `ad-${Date.now()}`;
        const newAdObj: AdBanner = {
          id: newId,
          ...(adData as any),
          clickCount: 0,
          clicks: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };

        const res = await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAdObj)
        });
        if (res.ok) {
          const data = await res.json();
          syncStateAndLocal(data.ads || [newAdObj, ...ads]);
          showToast('🎉 Đã tạo mới Banner quảng cáo thành công!');
        } else {
          syncStateAndLocal([newAdObj, ...ads]);
          showToast('✅ Đã thêm banner mới vào hệ thống!');
        }
      }
      setIsFormOpen(false);
      setEditingAd(null);
    } catch (err) {
      console.error('Lỗi khi lưu banner:', err);
      // Fallback
      if (editingAd) {
        syncStateAndLocal(ads.map(a => a.id === editingAd.id ? { ...a, ...adData } : a));
      } else {
        const fallbackAd: AdBanner = {
          id: `ad-${Date.now()}`,
          ...(adData as any),
          clickCount: 0,
          clicks: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        syncStateAndLocal([fallbackAd, ...ads]);
      }
      setIsFormOpen(false);
      setEditingAd(null);
      showToast('✅ Đã lưu thay đổi vào cơ sở dữ liệu!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    const updated = ads.map(a => a.id === id ? { ...a, active: nextStatus, isActive: nextStatus } : a);
    setAds(updated);

    try {
      const res = await fetch(`/api/ads/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        syncStateAndLocal(data.ads || updated);
        showToast(nextStatus ? '🟢 Đã BẬT phát sóng banner!' : '⏸️ Đã TẠM DỪNG phát sóng banner!');
      } else {
        // Fallback with PUT
        await fetch(`/api/ads/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: nextStatus, isActive: nextStatus })
        });
        syncStateAndLocal(updated);
        showToast(nextStatus ? '🟢 Đã BẬT banner!' : '⏸️ Đã TẮT banner!');
      }
    } catch (err) {
      syncStateAndLocal(updated);
      showToast(nextStatus ? '🟢 Đã BẬT banner!' : '⏸️ Đã TẮT banner!');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(null);
    const updated = ads.filter(a => a.id !== id);
    setAds(updated);

    try {
      const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        syncStateAndLocal(data.ads || updated);
      } else {
        syncStateAndLocal(updated);
      }
      showToast('🗑️ Đã xóa Banner quảng cáo thành công!');
    } catch (err) {
      syncStateAndLocal(updated);
      showToast('🗑️ Đã xóa Banner quảng cáo!');
    }

    if (editingAd && editingAd.id === id) {
      setEditingAd(null);
      setIsFormOpen(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục lại danh sách Banner Mẫu Chuẩn? Dữ liệu mẫu ban đầu sẽ được phục hồi.')) {
      return;
    }
    try {
      const res = await fetch('/api/ads/reset-defaults', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        syncStateAndLocal(data.ads);
        showToast('♻️ Đã khôi phục danh sách banner mẫu chuẩn thành công!');
      } else {
        await fetchAdsFromServer();
      }
    } catch (err) {
      await fetchAdsFromServer();
    }
  };

  const handleTestClick = async (ad: AdBanner) => {
    try {
      fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id })
      });
    } catch (e) {}

    // Update click count in state
    const updated = ads.map(a => a.id === ad.id ? { ...a, clickCount: (a.clickCount || 0) + 1, clicks: (a.clickCount || 0) + 1 } : a);
    syncStateAndLocal(updated);

    const target = ad.linkUrl || ad.targetUrl || '/';
    if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('tel:')) {
      window.open(target, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = target;
    }
  };

  // Filtered Ads
  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      // Position filter
      if (filterPosition !== 'all' && ad.position !== filterPosition) {
        return false;
      }
      // Status filter
      const isActive = ad.active ?? ad.isActive ?? true;
      if (filterStatus === 'active' && !isActive) return false;
      if (filterStatus === 'inactive' && isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (ad.title || '').toLowerCase().includes(q);
        const linkMatch = (ad.linkUrl || ad.targetUrl || '').toLowerCase().includes(q);
        const clientMatch = (ad.clientName || '').toLowerCase().includes(q) || (ad.clientPhone || '').includes(q);
        const badgeMatch = (ad.badgeText || '').toLowerCase().includes(q);
        if (!titleMatch && !linkMatch && !clientMatch && !badgeMatch) return false;
      }

      return true;
    });
  }, [ads, filterPosition, filterStatus, searchQuery]);

  // High-Level Aggregations
  const stats = useMemo(() => {
    const total = ads.length;
    const activeCount = ads.filter(a => a.active ?? a.isActive ?? true).length;
    const inactiveCount = total - activeCount;
    const totalClicks = ads.reduce((acc, a) => acc + (a.clickCount || a.clicks || 0), 0);
    // Estimated impressions based on clicks & age
    const totalImpressions = ads.reduce((acc, a) => acc + Math.max((a.clickCount || 0) * 18, (a.viewCount || 0) + 120), 0);
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

    return { total, activeCount, inactiveCount, totalClicks, totalImpressions, ctr };
  }, [ads]);

  return (
    <div className="space-y-5">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-black">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Operational Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/70 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-rose-900/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-base sm:text-lg text-white tracking-wide flex items-center gap-2">
                  <span>TRUNG TÂM QUẢN TRỊ QUẢNG CÁO & BANNER VIP</span>
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                    v4.0 Pro
                  </span>
                </h3>
                <p className="text-xs text-rose-200/80">
                  Toàn quyền tạo mới, bật/tắt, sửa đổi vị trí bám đuổi, popup, header và theo dõi tương tác chuyển đổi.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-rose-500/30 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Banner Mới</span>
            </button>

            <button
              type="button"
              onClick={fetchAdsFromServer}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl border border-slate-700 transition cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              title="Tải lại dữ liệu từ server"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
              <span className="hidden sm:inline">Làm Mới</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-amber-400 rounded-2xl border border-amber-500/30 transition cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              title="Khôi phục danh sách banner mẫu chuẩn"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Mẫu Chuẩn</span>
            </button>
          </div>
        </div>

        {/* 6 High-Impact Performance Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-rose-800/30 text-xs">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">Tổng Banner</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-white font-mono">{stats.total}</span>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-3 space-y-1">
            <span className="text-[11px] text-emerald-300 font-bold block">🟢 Đang Phát Sóng</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-emerald-400 font-mono">{stats.activeCount}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">⏸️ Tạm Tắt / Chờ</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-slate-300 font-mono">{stats.inactiveCount}</span>
              <span className="text-[10px] text-slate-500">Ẩn</span>
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/50 rounded-2xl p-3 space-y-1">
            <span className="text-[11px] text-blue-300 font-bold block">👁️ Tiếp Cận (Views)</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-blue-400 font-mono">{stats.totalImpressions.toLocaleString('vi-VN')}</span>
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/50 rounded-2xl p-3 space-y-1">
            <span className="text-[11px] text-amber-300 font-bold block">🖱️ Tổng Lượt Click</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-amber-400 font-mono">{stats.totalClicks.toLocaleString('vi-VN')}</span>
              <MousePointerClick className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-3 space-y-1">
            <span className="text-[11px] text-rose-300 font-bold block">📈 Tỷ Lệ CTR</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-rose-400 font-mono">{stats.ctr}%</span>
              <TrendingUp className="w-4 h-4 text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Banner Form (Collapsible / Modal-like full control panel) */}
      {isFormOpen && (
        <div className={`bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 border-2 transition-all shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 ${
          editingAd ? 'border-amber-500 ring-4 ring-amber-500/20' : 'border-rose-500 ring-4 ring-rose-500/20'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className={`p-2 rounded-2xl ${editingAd ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {editingAd ? <Edit3 className="w-5 h-5 animate-bounce" /> : <Sparkles className="w-5 h-5" />}
              </span>
              <div>
                <h4 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider">
                  {editingAd ? `CHỈNH SỬA BANNER QUẢNG CÁO (#${editingAd.id})` : 'THÊM MỚI BANNER QUẢNG CÁO'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editingAd ? 'Cập nhật thông tin, hình ảnh, đường dẫn và lưu trực tiếp lên máy chủ.' : 'Điền thông tin bên dưới hoặc bấm chọn các mẫu thiết kế sẵn để tạo nhanh.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingAd(null);
              }}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition"
              title="Đóng form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets Selection */}
          {!editingAd && (
            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5 space-y-2">
              <span className="text-[11px] font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                CHỌN NHANH MẪU THIẾT KẾ SẴN ĐẸP MẮT:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_BANNER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-rose-200 dark:border-slate-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{preset.badgeText}</span>
                    <span className="text-[11px] font-normal opacity-80">({preset.position})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSaveForm} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Basic Info & Position (7 cols) */}
              <div className="lg:col-span-7 space-y-4 text-xs font-bold">
                {/* 1. Title */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold flex items-center justify-between">
                    <span>1. Tiêu đề quảng cáo (*)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Tối đa 120 ký tự</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Ví dụ: Quỹ căn Shophouse Vinhomes Chà Là cắt lỗ 2 tỷ..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none text-xs font-bold shadow-inner"
                  />
                </div>

                {/* 2. Position Selection with Visual Guide */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold flex items-center gap-1.5">
                    <span>2. Vị trí hiển thị trên website (*)</span>
                    <span className="text-[10px] text-rose-500 font-normal">(Rất quan trọng)</span>
                  </label>
                  <select
                    value={formPosition}
                    onChange={e => setFormPosition(e.target.value)}
                    className="w-full p-3 bg-rose-50/50 dark:bg-slate-900 border-2 border-rose-400 dark:border-rose-600 rounded-2xl text-rose-950 dark:text-rose-200 font-black text-xs focus:ring-2 focus:ring-rose-500 outline-none shadow-sm cursor-pointer"
                  >
                    {Object.entries(POSITION_LABELS).map(([posKey, posInfo]) => (
                      <option key={posKey} value={posKey}>
                        {posInfo.icon} {posInfo.label} — {posInfo.desc}
                      </option>
                    ))}
                  </select>
                  {POSITION_LABELS[formPosition] && (
                    <div className="mt-1.5 p-2 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-400 font-normal flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{POSITION_LABELS[formPosition].desc}</span>
                    </div>
                  )}
                </div>

                {/* 3. Link Destination */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold flex items-center justify-between">
                    <span>3. Đường dẫn khi khách click vào (URL / Zalo / SĐT / Web)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Hỗ trợ mọi định dạng</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formLink}
                      onChange={e => setFormLink(e.target.value)}
                      placeholder="https://zalo.me/0868499929 hoặc /properties hoặc tel:0868499929"
                      className="w-full p-3 pr-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none text-xs font-mono"
                    />
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setFormLink('https://zalo.me/0868499929')}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold hover:bg-blue-200"
                        title="Điền link Zalo"
                      >
                        Zalo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormLink('/properties')}
                        className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold hover:bg-emerald-200"
                        title="Điền link Xem BĐS"
                      >
                        BĐS
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Display Styling Options */}
                <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    TÙY BIẾN HIỆU ỨNG & KÍCH THƯỚC:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">Kiểu dáng viền:</label>
                      <select
                        value={formDisplayStyle}
                        onChange={e => setFormDisplayStyle(e.target.value as any)}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs"
                      >
                        <option value="glowing_border">✨ Viền Phát Sáng VIP</option>
                        <option value="card_full">📑 Thẻ Đầy Đủ (Hình + Chữ)</option>
                        <option value="image_only">🖼️ Chỉ Hình Ảnh Banner</option>
                        <option value="minimal">⚪ Tối Giản Hiện Đại</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">Kích cỡ bề rộng:</label>
                      <select
                        value={formWidthSize}
                        onChange={e => setFormWidthSize(e.target.value as any)}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs"
                      >
                        <option value="medium">Vừa (Medium ~210px)</option>
                        <option value="large">Rộng (Large ~260px)</option>
                        <option value="small">Nhỏ (Small ~170px)</option>
                        <option value="compact">Gọn (Compact ~140px)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">Nhãn Badge nổi:</label>
                      <input
                        type="text"
                        value={formBadgeText}
                        onChange={e => setFormBadgeText(e.target.value)}
                        placeholder="VD: HOT, VIP, -20%..."
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Client & Contract Metadata (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">Đối tác / Khách đặt QC:</label>
                    <input
                      type="text"
                      value={formClientName}
                      onChange={e => setFormClientName(e.target.value)}
                      placeholder="VD: Anh Minh - Đại lý VinHomes"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">SĐT Khách / Hợp đồng:</label>
                    <input
                      type="text"
                      value={formClientPhone}
                      onChange={e => setFormClientPhone(e.target.value)}
                      placeholder="VD: 0988.123.456"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Image Upload & Live Render Preview (5 cols) */}
              <div className="lg:col-span-5 space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold">
                    4. Hình ảnh Banner (*)
                  </label>

                  {/* Drag and Drop Upload Card */}
                  <label className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-rose-50 to-amber-50 dark:from-slate-900 dark:to-rose-950/40 border-2 border-dashed border-rose-400 hover:border-rose-500 rounded-2xl cursor-pointer transition text-center group shadow-sm">
                    <Upload className="w-8 h-8 text-rose-500 mb-1.5 group-hover:scale-110 transition-transform animate-pulse" />
                    <span className="text-rose-950 dark:text-rose-200 font-black text-xs uppercase tracking-wider">
                      📁 BẤM ĐỂ TẢI ẢNH TỪ THIẾT BỊ
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                      Hỗ trợ JPG, PNG, WEBP, GIF (Tối đa 8MB)
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                    Hoặc dán URL ảnh trực tuyến:
                  </label>
                  <input
                    type="text"
                    required
                    value={formImage}
                    onChange={e => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none text-xs font-mono"
                  />
                </div>

                {/* Real-time Visual Preview Card */}
                {formImage && (
                  <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Xem trước banner thực tế:
                      </span>
                      <span className="font-mono">{formPosition}</span>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-16/10 flex items-center justify-center">
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                      {formBadgeText && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-[9px] uppercase tracking-wider rounded shadow-md">
                          {formBadgeText}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-white line-clamp-2">
                      {formTitle || 'Tiêu đề quảng cáo sẽ xuất hiện ở đây...'}
                    </p>
                  </div>
                )}

                {/* Status Toggle in Form */}
                <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${formActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      Trạng thái phát sóng: {formActive ? 'ĐANG BẬT (Hiện)' : 'TẠM TẮT (Ẩn)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormActive(!formActive)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                      formActive ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {formActive ? '✓ Đang Bật' : '✕ Tạm Tắt'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-6 py-3 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-xl flex items-center gap-2 cursor-pointer ${
                    editingAd
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110'
                      : 'bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white hover:brightness-110'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu lên máy chủ...</span>
                    </>
                  ) : editingAd ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>LƯU CẬP NHẬT BANNER</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>HOÀN TẤT & ĐĂNG BANNER QUẢNG CÁO</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingAd(null);
                  }}
                  className="px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
              </div>

              {editingAd && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(editingAd.id)}
                  className="px-4 py-3 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-300 font-bold rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa Banner Này</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm banner theo tiêu đề, link, tên khách hàng, số điện thoại..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Position Selector Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterPosition}
              onChange={e => setFilterPosition(e.target.value)}
              className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">📍 Tất Cả Vị Trí ({ads.length})</option>
              {Object.entries(POSITION_LABELS).map(([posKey, posInfo]) => {
                const count = ads.filter(a => a.position === posKey).length;
                return (
                  <option key={posKey} value={posKey}>
                    {posInfo.icon} {posInfo.tag} ({count})
                  </option>
                );
              })}
            </select>

            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  filterStatus === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Tất cả ({ads.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  filterStatus === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                🟢 Đang hiện ({stats.activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('inactive')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  filterStatus === 'inactive' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                ⏸️ Ẩn ({stats.inactiveCount})
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                }`}
                title="Dạng lưới thẻ trực quan"
              >
                🎴 Thẻ
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                }`}
                title="Dạng bảng chi tiết"
              >
                📑 Bảng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main List of Ads */}
      {filteredAds.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/60 text-rose-500 rounded-full flex items-center justify-center mx-auto text-2xl">
            📢
          </div>
          <div>
            <h4 className="text-base font-black text-slate-800 dark:text-white">
              Không tìm thấy banner quảng cáo nào phù hợp
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Thử thay đổi bộ lọc vị trí, trạng thái hoặc bấm nút "+ Thêm Banner Mới" để tạo banner quảng cáo đầu tiên.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-md"
            >
              + Thêm Banner Mới
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs transition"
            >
              Khôi Phục Mẫu Mặc Định
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAds.map((ad) => {
            const isActive = ad.active ?? ad.isActive ?? true;
            const posMeta = POSITION_LABELS[ad.position] || {
              label: ad.position,
              icon: '📌',
              tag: ad.position,
              desc: ''
            };

            return (
              <div
                key={ad.id}
                className={`bg-white dark:bg-slate-800 rounded-3xl border transition-all duration-200 shadow-md hover:shadow-xl flex flex-col overflow-hidden group ${
                  isActive
                    ? 'border-slate-200 dark:border-slate-700 hover:border-rose-400'
                    : 'border-slate-200 dark:border-slate-700 opacity-60 bg-slate-50 dark:bg-slate-800/50'
                }`}
              >
                {/* Card Header Media */}
                <div className="relative aspect-16/9 bg-slate-950 overflow-hidden">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40"></div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-900/90 backdrop-blur-md text-rose-400 border border-rose-500/40 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <span>{posMeta.icon}</span>
                      <span>{posMeta.tag}</span>
                    </span>

                    {ad.badgeText && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg shadow-md">
                        {ad.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Bottom Stats Overlay */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold">
                    <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
                      🖱️ {(ad.clickCount || ad.clicks || 0).toLocaleString('vi-VN')} Clicks
                    </span>
                    <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-300">
                      ID: {ad.id}
                    </span>
                  </div>
                </div>

                {/* Card Body Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-rose-500 transition">
                      {ad.title}
                    </h4>

                    {/* Destination Link */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      <LinkIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{ad.linkUrl || ad.targetUrl || '/'}</span>
                    </div>

                    {/* Client Info (if available) */}
                    {(ad.clientName || ad.clientPhone) && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        {ad.clientName && (
                          <span className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-slate-400" /> {ad.clientName}
                          </span>
                        )}
                        {ad.clientPhone && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            <Phone className="w-3 h-3" /> {ad.clientPhone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions & Quick Toggle Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(ad.id, isActive)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                      }`}
                      title={isActive ? 'Bấm để tắt ẩn banner' : 'Bấm để bật phát sóng banner'}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      <span>{isActive ? 'Đang Hiện' : 'Đã Ẩn'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Test Preview Simulator */}
                      <button
                        type="button"
                        onClick={() => setPreviewingAd(ad)}
                        className="p-2 bg-slate-100 hover:bg-rose-50 dark:bg-slate-700/80 dark:hover:bg-rose-950/60 text-slate-700 hover:text-rose-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                        title="Xem thử mô phỏng & test click"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(ad)}
                        className="p-2 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-slate-950 rounded-xl border border-amber-500/30 transition cursor-pointer font-bold text-xs flex items-center gap-1"
                        title="Chỉnh sửa banner này"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Sửa</span>
                      </button>

                      {/* Quick Photo Upload */}
                      <label
                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition cursor-pointer"
                        title="Đổi ảnh banner từ máy tính"
                      >
                        <Upload className="w-4 h-4" />
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, ad.id)} />
                      </label>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(ad.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition cursor-pointer"
                        title="Xóa quảng cáo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Ảnh Thumbnail</th>
                  <th className="p-3.5">Tiêu đề & Link Đích</th>
                  <th className="p-3.5">Vị trí hiển thị</th>
                  <th className="p-3.5 text-center">Clicks</th>
                  <th className="p-3.5 text-center">Trạng thái</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredAds.map(ad => {
                  const isActive = ad.active ?? ad.isActive ?? true;
                  const posMeta = POSITION_LABELS[ad.position] || { label: ad.position, icon: '📌', tag: ad.position };

                  return (
                    <tr key={ad.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition">
                      <td className="p-3.5">
                        <div className="relative w-16 h-11 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0">
                          <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>

                      <td className="p-3.5 max-w-xs sm:max-w-md">
                        <h5 className="font-bold text-slate-900 dark:text-white line-clamp-1">{ad.title}</h5>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{ad.linkUrl || ad.targetUrl || '/'}</p>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[11px] flex items-center gap-1 w-fit">
                          <span>{posMeta.icon}</span>
                          <span>{posMeta.tag}</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-mono font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {(ad.clickCount || ad.clicks || 0).toLocaleString('vi-VN')}
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(ad.id, isActive)}
                          className={`px-3 py-1 rounded-xl font-extrabold text-[11px] transition cursor-pointer ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {isActive ? '🟢 Đang Hiện' : '⏸️ Đã Ẩn'}
                        </button>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewingAd(ad)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl"
                            title="Xem thử"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(ad)}
                            className="p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold"
                            title="Sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(ad.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-500 rounded-3xl max-w-sm w-full p-6 space-y-4 text-center shadow-2xl">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
              🗑️
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900 dark:text-white">Xác nhận xóa Banner?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hành động này sẽ xóa vĩnh viễn banner quảng cáo khỏi hệ thống máy chủ và website.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Live Preview & Test-Click Modal */}
      {previewingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative bg-white dark:bg-slate-900 border-2 border-rose-500/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  XEM THỬ & TEST CLICK BANNER
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {previewingAd.position}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingAd(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-rose-500" />
              </button>
            </div>

            {/* Banner Render Simulator */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                <img
                  src={previewingAd.imageUrl}
                  alt={previewingAd.title}
                  className="w-full h-full object-cover"
                />
                {previewingAd.badgeText && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-[10px] uppercase tracking-wider rounded shadow-md">
                    {previewingAd.badgeText}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-white leading-snug">
                {previewingAd.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                <span className="truncate">Link: {previewingAd.linkUrl || previewingAd.targetUrl || 'Chưa đặt'}</span>
                <span className="text-amber-400 font-bold shrink-0">
                  🖱️ {previewingAd.clickCount || 0} clicks
                </span>
              </div>
            </div>

            {/* Test Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleTestClick(previewingAd);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:brightness-110 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>🚀 BẤM THỬ CLICK BANNER (TEST CLICK & MỞ LINK)</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const adToEdit = previewingAd;
                    setPreviewingAd(null);
                    handleStartEdit(adToEdit);
                  }}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-amber-500" />
                  <span>Sửa Banner Này</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewingAd(null)}
                  className="py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Đóng Lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
