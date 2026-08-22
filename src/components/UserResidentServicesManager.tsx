import React, { useState, useEffect } from 'react';
import { 
  Wrench, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Phone, 
  MapPin, Image as ImageIcon, ExternalLink, Sparkles, X, Check, Eye, Clock, ShieldCheck,
  ChevronDown, ChevronUp, Copy, Car, Utensils, Hammer, Sparkle, RefreshCw, Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResidentServiceItem, RESIDENT_SERVICE_CATEGORIES, VIN_MAJOR_PROJECTS } from '../data/residentServicesData';
import { User, ProjectCategory } from '../types';
import { createInstantPreview, validateImageSize, addWatermarkToImage } from '../lib/watermark';
import { getServiceDetailUrl } from '../lib/slugs';

interface UserResidentServicesManagerProps {
  user: User;
  onRefresh?: () => void;
}

export const UserResidentServicesManager: React.FC<UserResidentServicesManagerProps> = ({
  user,
  onRefresh
}) => {
  const [services, setServices] = useState<ResidentServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ResidentServiceItem | null>(null);

  // Density & Expand state
  const [serviceViewMode, setServiceViewMode] = useState<'icon_compact' | 'detailed'>('icon_compact');
  const [expandedSvcIds, setExpandedSvcIds] = useState<Record<string, boolean>>({});

  const toggleExpandSvc = (id: string) => {
    setExpandedSvcIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandAllSvc = () => {
    const allExpanded = services.length > 0 && services.every(s => expandedSvcIds[s.id]);
    const newState: Record<string, boolean> = {};
    services.forEach(s => {
      newState[s.id] = !allExpanded;
    });
    setExpandedSvcIds(newState);
  };

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('van-tai-xe-dien');
  const [subCategory, setSubCategory] = useState('Xe Taxi & Vận chuyển nội/ngoại khu 24/7');
  const [project, setProject] = useState<ProjectCategory>('ocean-park-2');
  const [subdivision, setSubdivision] = useState('Toàn khu đô thị');
  const [providerName, setProviderName] = useState(user.name || '');
  const [providerPhone, setProviderPhone] = useState(user.phone || '');
  const [providerZalo, setProviderZalo] = useState(user.phone || '');
  const [address, setAddress] = useState(user.apartmentAddress || 'Vinhomes Ocean Park 2');
  const [priceDisplay, setPriceDisplay] = useState('Từ 50.000đ - 150.000đ');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load user services from Server API + LocalStorage fallback
  const loadUserServices = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch from Server
      const res = await fetch(`/api/resident-services?userId=${user.id || ''}&isAdmin=${user.role === 'admin'}`);
      let serverServices: ResidentServiceItem[] = [];
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          serverServices = data;
        }
      }

      // 2. Fetch from LocalStorage
      let localServices: ResidentServiceItem[] = [];
      const storedHb = localStorage.getItem('hb_resident_services');
      const storedOld = localStorage.getItem('resident_services');
      if (storedHb) {
        try { localServices = JSON.parse(storedHb); } catch (e) {}
      } else if (storedOld) {
        try { localServices = JSON.parse(storedOld); } catch (e) {}
      }

      // Merge unique
      const combinedMap = new Map<string, ResidentServiceItem>();
      [...serverServices, ...localServices].forEach(s => {
        if (s && s.id) combinedMap.set(s.id, s);
      });
      const allMerged = Array.from(combinedMap.values());

      // Filter for this user
      const userList = allMerged.filter(s => {
        if (!s) return false;
        const matchId = user.id && s.userId === user.id;
        const matchPhone = user.phone && s.providerPhone === user.phone;
        const matchName = user.name && s.providerName && s.providerName.toLowerCase() === user.name.toLowerCase();
        return matchId || matchPhone || matchName || (user.role === 'admin');
      });

      if (userList.length > 0) {
        setServices(userList);
      } else {
        // Sample starter service
        const sampleService: ResidentServiceItem = {
          id: `srv-${user.id || 'sample'}-1`,
          userId: user.id,
          title: `Dịch Vụ Đặt Xe Điện Buggy, Taxi Cư Dân & Vận Chuyển 24/7 - ${user.name || 'Vinhomes'}`,
          categoryId: 'van-tai-xe-dien',
          subCategory: 'Xe Taxi & Chở đồ nội khu 24/7',
          project: 'ocean-park-2',
          subdivision: 'Toàn đại đô thị Ocean Park 1, 2, 3',
          providerName: user.name || 'Tài Xế / Đội Xe Cư Dân',
          providerPhone: user.phone || '0868499929',
          providerZalo: user.phone || '0868499929',
          address: user.apartmentAddress || 'Vinhomes Ocean Park 2',
          priceDisplay: 'Từ 20.000đ / chuyến (Nội khu) - Trọn gói sân bay 250k',
          rating: 5.0,
          reviewCount: 36,
          images: [
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
          ],
          description: 'Nhận đón trả cư dân đi học, đi làm, đi siêu thị Vincom, đi sân bay Nội Bài 24/7. Xe đời mới sạch sẽ, không mùi, đúng giờ, chu đáo và phục vụ tận tâm.',
          verified: true,
          legalCommitmentAccepted: true,
          status: 'approved',
          approved: true,
          kycStatus: 'verified',
          createdAt: new Date().toISOString()
        };
        setServices([sampleService]);
        
        // Sync sample
        try {
          fetch('/api/resident-services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sampleService)
          }).catch(() => {});
        } catch (e) {}
      }
    } catch (e) {
      console.error('Error loading resident services:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserServices();
  }, [user.id, user.phone, user.name]);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setTitle('');
    setCategoryId('van-tai-xe-dien');
    setSubCategory('Xe Taxi & Vận chuyển nội/ngoại khu 24/7');
    setProject('ocean-park-2');
    setSubdivision('Toàn khu đô thị');
    setProviderName(user.name || '');
    setProviderPhone(user.phone || '');
    setProviderZalo(user.phone || '');
    setAddress(user.apartmentAddress || 'Vinhomes Ocean Park 2');
    setPriceDisplay('Từ 50.000đ / lần');
    setDescription('');
    setImages(['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80']);
    setIsEditingModalOpen(true);
  };

  const handleOpenEditModal = (svc: ResidentServiceItem) => {
    setEditingService(svc);
    setTitle(svc.title);
    setCategoryId(svc.categoryId || 'van-tai-xe-dien');
    setSubCategory(svc.subCategory || 'Dịch vụ cư dân');
    setProject(svc.project || 'ocean-park-2');
    setSubdivision(svc.subdivision || 'Toàn khu đô thị');
    setProviderName(svc.providerName || user.name || '');
    setProviderPhone(svc.providerPhone || user.phone || '');
    setProviderZalo(svc.providerZalo || svc.providerPhone || '');
    setAddress(svc.address || 'Vinhomes Ocean Park 2');
    setPriceDisplay(svc.priceDisplay || 'Từ 50.000đ');
    setDescription(svc.description || '');
    setImages(svc.images && svc.images.length > 0 ? [...svc.images] : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80']);
    setIsEditingModalOpen(true);
  };

  // Image Upload from Device (Camera / Gallery / PC)
  const handleImageUploadFromDevice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingImage(true);

    try {
      for (const file of files) {
        const validation = validateImageSize(file);
        if (!validation.valid) {
          alert(validation.message || 'Kích thước ảnh vượt quá giới hạn 10MB.');
          continue;
        }
        // Instant preview
        const instantPreview = createInstantPreview(file);
        setImages(prev => [...prev, instantPreview]);

        // Compress and watermark
        addWatermarkToImage(file).then(watermarked => {
          if (watermarked) {
            setImages(prev => prev.map(img => img === instantPreview ? watermarked : img));
          }
        }).catch(err => console.warn('Watermark err:', err));
      }
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (idxToRemove: number) => {
    if (images.length <= 1) {
      alert('Dịch vụ cần ít nhất 1 ảnh minh họa.');
      return;
    }
    setImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleDeleteService = async (idToDelete: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng dịch vụ này?')) return;
    try {
      // 1. Delete on Server
      await fetch(`/api/resident-services/${idToDelete}`, { method: 'DELETE' });

      // 2. Delete in local state & localStorage
      const storedHb = localStorage.getItem('hb_resident_services');
      if (storedHb) {
        const all: ResidentServiceItem[] = JSON.parse(storedHb);
        localStorage.setItem('hb_resident_services', JSON.stringify(all.filter(s => s.id !== idToDelete)));
      }
      const storedOld = localStorage.getItem('resident_services');
      if (storedOld) {
        const allOld: ResidentServiceItem[] = JSON.parse(storedOld);
        localStorage.setItem('resident_services', JSON.stringify(allOld.filter(s => s.id !== idToDelete)));
      }

      setServices(prev => prev.filter(s => s.id !== idToDelete));
      if (onRefresh) onRefresh();
      alert('🗑️ Đã xóa bài dịch vụ thành công!');
    } catch (e) {
      console.error('Error deleting service:', e);
      alert('Không thể xóa bài dịch vụ lúc này.');
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên dịch vụ hoặc tiêu đề bài đăng.');
      return;
    }
    if (!providerPhone.trim()) {
      alert('Vui lòng nhập số điện thoại Zalo để cư dân liên hệ.');
      return;
    }

    setIsSaving(true);
    try {
      const finalImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'];

      if (editingService) {
        // Update existing service
        const updated: ResidentServiceItem = {
          ...editingService,
          title: title.trim(),
          categoryId,
          subCategory: subCategory.trim(),
          project,
          subdivision: subdivision.trim(),
          providerName: providerName.trim() || user.name || 'Thợ Cư Dân',
          providerPhone: providerPhone.trim(),
          providerZalo: providerZalo.trim() || providerPhone.trim(),
          address: address.trim(),
          priceDisplay: priceDisplay.trim(),
          description: description.trim(),
          images: finalImages,
          status: 'approved',
          approved: true,
          updatedAt: new Date().toISOString()
        };

        // Server update
        await fetch(`/api/resident-services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });

        // Update local caches
        updateLocalCache(updated);
        setServices(prev => prev.map(s => s.id === editingService.id ? updated : s));
      } else {
        // Create new service
        const newSvc: ResidentServiceItem = {
          id: `srv-${user.id || 'usr'}-${Date.now()}`,
          userId: user.id,
          title: title.trim(),
          categoryId,
          subCategory: subCategory.trim(),
          project,
          subdivision: subdivision.trim(),
          providerName: providerName.trim() || user.name || 'Thợ Cư Dân',
          providerPhone: providerPhone.trim(),
          providerZalo: providerZalo.trim() || providerPhone.trim(),
          address: address.trim(),
          priceDisplay: priceDisplay.trim(),
          rating: 5.0,
          reviewCount: 1,
          images: finalImages,
          description: description.trim(),
          verified: true,
          legalCommitmentAccepted: true,
          status: 'approved',
          approved: true,
          kycStatus: 'verified',
          createdAt: new Date().toISOString()
        };

        // Server create
        await fetch('/api/resident-services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSvc)
        });

        // Update local caches
        updateLocalCache(newSvc);
        setServices(prev => [newSvc, ...prev]);
      }

      setIsEditingModalOpen(false);
      if (onRefresh) onRefresh();
      alert('🎉 Đã lưu & xuất bản bài đăng Dịch Vụ Cư Dân thành công! Bài viết đã hiển thị ngay trên Chợ Cư Dân.');
    } catch (e) {
      console.error('Error saving resident service:', e);
      alert('Có lỗi xảy ra khi lưu bài dịch vụ.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocalCache = (item: ResidentServiceItem) => {
    try {
      const storedHb = localStorage.getItem('hb_resident_services');
      let allHb: ResidentServiceItem[] = storedHb ? JSON.parse(storedHb) : [];
      const idx = allHb.findIndex(s => s.id === item.id);
      if (idx >= 0) allHb[idx] = item;
      else allHb.unshift(item);
      localStorage.setItem('hb_resident_services', JSON.stringify(allHb));
      localStorage.setItem('resident_services', JSON.stringify(allHb));
    } catch (e) {
      console.warn('Cache error:', e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Density Controls & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 p-3.5 sm:p-4 rounded-2xl border border-teal-500/30 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-teal-500 text-slate-950 font-black text-[9px] rounded uppercase">
              ⚡ THỢ, ĐẶT XE & DỊCH VỤ CƯ DÂN
            </span>
            <span className="text-xs text-teal-300 font-bold hidden sm:inline">
              Hiển thị tức thì trên Danh Bạ & Chợ Cư Dân Vinhomes
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-white">
            Quản Lý Bài Đăng Dịch Vụ, Đặt Xe & Thợ Kỹ Thuật
          </h2>
          <p className="text-[11px] text-slate-300">
            Tự do thêm mới bài đăng, tải ảnh từ điện thoại/máy tính, sửa giá và SĐT Zalo của bạn bất kỳ lúc nào.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Density Switcher */}
          <div className="bg-slate-800/90 p-0.5 rounded-xl flex items-center gap-0.5 text-[11px] font-bold border border-slate-700">
            <button
              onClick={() => setServiceViewMode('icon_compact')}
              className={`px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                serviceViewMode === 'icon_compact'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ biểu tượng thu gọn"
            >
              <span>⚡ Thu Gọn</span>
            </button>
            <button
              onClick={() => setServiceViewMode('detailed')}
              className={`px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                serviceViewMode === 'detailed'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ chi tiết đầy đủ"
            >
              <span>📋 Chi Tiết</span>
            </button>
          </div>

          {services.length > 0 && (
            <button
              onClick={toggleExpandAllSvc}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-xl border border-slate-700 transition cursor-pointer"
              title="Mở rộng hoặc thu gọn tất cả"
            >
              {services.every(s => expandedSvcIds[s.id]) ? 'Thu gọn ▴' : 'Mở rộng ▾'}
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Đăng Dịch Vụ Mới</span>
          </button>
        </div>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-500 mx-auto" />
          <p className="text-xs text-slate-500">Đang tải danh sách bài đăng dịch vụ...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/60 text-teal-600 rounded-full flex items-center justify-center mx-auto">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Bạn chưa có bài đăng dịch vụ hoặc đặt xe nào
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Đăng ký dịch vụ đặt xe, sửa chữa điện nước, đồ ăn, dọn nhà, thang máy... để tiếp cận hàng vạn cư dân Vinhomes.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 transition cursor-pointer"
          >
            + Đăng Dịch Vụ Ngay
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((svc) => {
            const detailUrl = getServiceDetailUrl(svc);
            const isExpanded = serviceViewMode === 'detailed' || Boolean(expandedSvcIds[svc.id]);

            return (
              <div
                key={svc.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition shadow-xs overflow-hidden ${
                  isExpanded
                    ? 'border-teal-500/60 ring-1 ring-teal-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Compact Primary Row */}
                <div className="p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div 
                      onClick={() => toggleExpandSvc(svc.id)}
                      className="relative shrink-0 cursor-pointer group"
                    >
                      <img
                        src={svc.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=200&q=80'}
                        alt={svc.title}
                        className="w-14 h-12 sm:w-16 sm:h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 group-hover:opacity-90 transition"
                      />
                      <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-slate-950/80 text-white text-[8px] font-bold rounded">
                        {svc.images?.length || 1} 📷
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20">
                          ✓ Đang Hoạt Động
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                          🏷️ {svc.subCategory || 'Dịch vụ'}
                        </span>
                        <span className="text-xs font-black text-amber-500 font-mono">
                          💰 {svc.priceDisplay}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium hidden sm:inline truncate">
                          📍 {svc.address || svc.subdivision || 'Vinhomes'}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleExpandSvc(svc.id)}
                        className="text-xs font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 text-left line-clamp-1 block cursor-pointer"
                      >
                        {svc.title}
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <Link
                      to={detailUrl}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition flex items-center gap-1 text-[11px] font-bold"
                      title="Xem dịch vụ công khai"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden md:inline">Xem</span>
                    </Link>

                    <button
                      onClick={() => handleOpenEditModal(svc)}
                      className="p-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition flex items-center gap-1 text-[11px] cursor-pointer"
                      title="Chỉnh sửa dịch vụ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Sửa</span>
                    </button>

                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                      title="Xóa dịch vụ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleExpandSvc(svc.id)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition flex items-center gap-0.5 text-[11px] font-bold cursor-pointer"
                      title={isExpanded ? 'Thu gọn' : 'Mở rộng chi tiết'}
                    >
                      <span className="text-[10px] text-slate-500 hidden lg:inline">{isExpanded ? 'Gọn' : 'Chi tiết'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Accordion */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200 text-xs">
                    {/* Image Carousel */}
                    {svc.images && svc.images.length > 0 && (
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                          📷 Album Ảnh Dịch Vụ ({svc.images.length} ảnh):
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {svc.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`${svc.title} - ${i + 1}`}
                              className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specs / Contact Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Người Đăng / Chủ Dịch Vụ:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                          👤 {svc.providerName || 'Thợ Cư Dân'}
                        </span>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Số Điện Thoại / Zalo:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                          📞 {svc.providerPhone} {svc.providerZalo ? `(Zalo: ${svc.providerZalo})` : ''}
                        </span>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                        <span className="text-slate-400 block text-[10px]">Khu Vực Phục Vụ:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                          📍 {svc.project} • {svc.subdivision || 'Toàn dự án'}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {svc.description && (
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          📝 Mô Tả Dịch Vụ:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 text-xs whitespace-pre-line leading-relaxed">
                          {svc.description}
                        </p>
                      </div>
                    )}

                    {/* Bottom Action strip */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px]">
                      <span className="text-slate-500">
                        ⭐ Đánh giá: <strong>5.0/5</strong> • Trạng thái: <strong className="text-emerald-600">Đang hiển thị công khai</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          to={detailUrl}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-1 transition shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Xem Trang Chi Tiết</span>
                        </Link>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}${detailUrl}`);
                            alert('📋 Đã sao chép liên kết bài đăng dịch vụ cư dân!');
                          }}
                          className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Service Modal */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto overscroll-contain">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col my-auto relative">
            
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {editingService ? 'Chỉnh Sửa Dịch Vụ Cư Dân' : 'Đăng Dịch Vụ, Đặt Xe & Thợ Kỹ Thuật'}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Hiển thị trực tiếp trên Danh Bạ & Chợ Tiện Ích Cư Dân Vinhomes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-4 sm:p-6 space-y-4 text-xs pb-28 sm:pb-6">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu Đề Bài Đăng Dịch Vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Dịch Vụ Đặt Xe Buggy & Taxi Sân Bay 24/7 / Sửa Điện Lạnh 15 Phút Có Mặt"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 outline-hidden scroll-mt-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nhóm Ngành Dịch Vụ (*)
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => {
                      const newCat = e.target.value;
                      setCategoryId(newCat);
                      if (newCat === 'van-tai-xe-dien') setSubCategory('Xe Taxi & Vận chuyển nội/ngoại khu 24/7');
                      else if (newCat === 'an-uong-nha-hang') setSubCategory('Cơm văn phòng & Đồ ăn đêm ship tận căn');
                      else if (newCat === 'dien-nuoc-lanh') setSubCategory('Sửa điện lạnh & Điều hòa gia dụng');
                      else if (newCat === 'thang-may-sua-nha') setSubCategory('Thang máy & Cải tạo sửa nhà');
                      else if (newCat === 've-sinh-giup-viec') setSubCategory('Dọn dẹp & Giúp việc theo giờ');
                      else if (newCat === 'sua-chua-khoa') setSubCategory('Mở khóa & Sửa đồ gia dụng');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 outline-hidden"
                  >
                    <option value="van-tai-xe-dien">⚡ Vận Tải - Đặt Xe Buggy & Taxi 24/7</option>
                    <option value="an-uong-nha-hang">🍲 Ăn Uống, Cafe & Đồ Ăn Giao Tận Căn</option>
                    <option value="dien-nuoc-lanh">❄️ Điện Nước & Điện Lạnh Cư Dân</option>
                    <option value="thang-may-sua-nha">🛗 Thang Máy, Cải Tạo & Sửa Nhà</option>
                    <option value="ve-sinh-giup-viec">🧹 Vệ Sinh, Giúp Việc & Giặt Là</option>
                    <option value="sua-chua-khoa">🔑 Sửa Chữa Gia Dụng & Thợ Khóa</option>
                    <option value="cham-soc-thu-cung">🐕 Chăm Sóc Thú Cưng & Spa Chó Mèo</option>
                    <option value="lam-dep-suc-khoe">💆 Làm Đẹp, Nail & Spa Thư Giãn</option>
                    <option value="giao-duc-gia-su">🎓 Gia Sư & Luyện Thi Nội Khu</option>
                    <option value="khach-san-homestay">🏨 Khách Sạn & Homestay Vinhomes</option>
                    <option value="di-cho-thuc-pham">🛒 Đi Chợ & Thực Phẩm Sạch Cư Dân</option>
                    <option value="moi-gioi-bds-uy-tin">🏡 Môi Giới BĐS Uy Tín</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chuyên Môn / Hạng Mục Cụ Thể
                  </label>
                  <input
                    type="text"
                    value={subCategory}
                    onChange={e => setSubCategory(e.target.value)}
                    placeholder="VD: Taxi sân bay Nội Bài / Nạp gas điều hòa / Cơm trưa..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-hidden scroll-mt-24"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Khu Đô Thị
                  </label>
                  <select
                    value={project}
                    onChange={e => setProject(e.target.value as ProjectCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 outline-hidden"
                  >
                    <option value="ocean-park-2">Vinhomes Ocean Park 2</option>
                    <option value="ocean-park-3">Vinhomes Ocean Park 3</option>
                    <option value="ocean-park-1">Vinhomes Ocean Park 1</option>
                    <option value="smart-city">Vinhomes Smart City</option>
                    <option value="grand-park">Vinhomes Grand Park</option>
                    <option value="ha-long-xanh">Vinhomes Hạ Long Xanh</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Báo Giá / Mức Phí Hiển Thị
                  </label>
                  <input
                    type="text"
                    value={priceDisplay}
                    onChange={e => setPriceDisplay(e.target.value)}
                    placeholder="VD: Từ 30.000đ - 150.000đ / Khảo sát miễn phí"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-amber-600 focus:ring-2 focus:ring-teal-500 outline-hidden scroll-mt-24"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Đơn Vị / Người Đăng
                  </label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={e => setProviderName(e.target.value)}
                    placeholder="VD: Nhà Xe Minh Hoàng / Bếp Cư Dân..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 outline-hidden scroll-mt-24"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số Điện Thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={providerPhone}
                    onChange={e => setProviderPhone(e.target.value)}
                    placeholder="VD: 0988889999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal-500 outline-hidden scroll-mt-24"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số Zalo Nhận Đơn
                  </label>
                  <input
                    type="tel"
                    value={providerZalo}
                    onChange={e => setProviderZalo(e.target.value)}
                    placeholder="VD: 0988889999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal-500 outline-hidden scroll-mt-24"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Địa Chỉ / Phân Khu Hoạt Động
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="VD: Sảnh S2.05 Ocean Park 1 & Phục vụ toàn bộ Ocean Park 1, 2, 3"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-hidden scroll-mt-24"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mô Tả Dịch Vụ, Thực Đơn Hoặc Cam Kết Chất Lượng
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả kỹ năng, danh mục món ăn/loại xe, cam kết thời gian có mặt, bảo hành uy tín..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-hidden scroll-mt-24"
                />
              </div>

              {/* Photos manager with Multi-Device Upload */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                      📷 Hình Ảnh Dịch Vụ & Xe / Cửa Hàng ({images.length} ảnh)
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Hỗ trợ chụp trực tiếp từ camera điện thoại hoặc tải ảnh từ máy tính.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingImage ? 'Đang Tải...' : '📁 Tải Ảnh Từ Máy'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUploadFromDevice}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Grid of uploaded images */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-900 border border-slate-300 dark:border-slate-700 group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-7 h-7 sm:w-6 sm:h-6 bg-rose-600 hover:bg-rose-500 text-white rounded-md flex items-center justify-center transition shadow-md active:scale-90 z-10 cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-teal-600 text-white font-bold text-[8px] rounded">
                          Ảnh đại diện
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 z-20">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang Lưu...</span>
                    </>
                  ) : (
                    <span>🚀 LƯU & XUẤT BẢN DỊCH VỤ</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
