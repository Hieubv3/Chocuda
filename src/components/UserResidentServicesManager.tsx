import React, { useState, useEffect } from 'react';
import { 
  Wrench, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Phone, 
  MapPin, Image as ImageIcon, ExternalLink, Sparkles, X, Check, Eye, Clock, ShieldCheck,
  ChevronDown, ChevronUp, Copy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResidentServiceItem, RESIDENT_SERVICE_CATEGORIES, VIN_MAJOR_PROJECTS } from '../data/residentServicesData';
import { User, ProjectCategory } from '../types';
import { createInstantPreview, validateImageSize } from '../lib/watermark';
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
  const [categoryId, setCategoryId] = useState('dien-nuoc-lanh');
  const [subCategory, setSubCategory] = useState('Sửa điện gia dụng');
  const [project, setProject] = useState<ProjectCategory>('ocean-park-2');
  const [subdivision, setSubdivision] = useState('Toàn khu đô thị');
  const [providerName, setProviderName] = useState(user.name || '');
  const [providerPhone, setProviderPhone] = useState(user.phone || '');
  const [providerZalo, setProviderZalo] = useState(user.phone || '');
  const [address, setAddress] = useState(user.apartmentAddress || 'Vinhomes Ocean Park 2');
  const [priceDisplay, setPriceDisplay] = useState('Từ 150.000đ / lần');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>(['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80']);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Load user services from localStorage & default seed if empty
  const loadUserServices = () => {
    try {
      const stored = localStorage.getItem('resident_services');
      let allServices: ResidentServiceItem[] = [];
      if (stored) {
        allServices = JSON.parse(stored);
      }

      // Filter for this user
      const userList = allServices.filter(s => {
        if (!s) return false;
        const matchId = user.id && s.userId === user.id;
        const matchPhone = user.phone && s.providerPhone === user.phone;
        const matchName = user.name && s.providerName && s.providerName.toLowerCase() === user.name.toLowerCase();
        return matchId || matchPhone || matchName;
      });

      if (userList.length > 0) {
        setServices(userList);
      } else {
        // If empty, supply a sample initial technician service ready for editing
        const sampleService: ResidentServiceItem = {
          id: `srv-${user.id || 'sample'}-1`,
          userId: user.id,
          title: `Dịch Vụ Kỹ Thuật Điện Nước & Điện Lạnh - Cư Dân ${user.name || 'Vinhomes'}`,
          categoryId: 'dien-nuoc-lanh',
          subCategory: 'Sửa điện lạnh & Điều hòa',
          project: 'ocean-park-2',
          subdivision: 'Phân khu Chà Là & Toàn khu',
          providerName: user.name || 'Kỹ Thuật Cư Dân',
          providerPhone: user.phone || '0988889999',
          providerZalo: user.phone || '0988889999',
          address: user.apartmentAddress || 'Vinhomes Ocean Park 2',
          priceDisplay: 'Từ 150.000đ / lần (Khảo sát miễn phí)',
          rating: 5.0,
          reviewCount: 28,
          images: [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
          ],
          description: 'Chuyên sửa chữa điện nước, bảo dưỡng điều hòa, xử lý rò rỉ nước, thay thế thiết bị điện dân dụng tại căn hộ. Có mặt sau 15 phút, giá niêm yết rõ ràng, bảo hành uy tín.',
          verified: true,
          legalCommitmentAccepted: true,
          status: 'approved',
          approved: true,
          kycStatus: 'verified',
          createdAt: new Date().toISOString()
        };
        setServices([sampleService]);
        // Also save to allServices
        allServices.push(sampleService);
        localStorage.setItem('resident_services', JSON.stringify(allServices));
      }
    } catch (e) {
      console.error('Error loading resident services:', e);
    }
  };

  useEffect(() => {
    loadUserServices();
  }, [user.id, user.phone, user.name]);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setTitle('');
    setCategoryId('dien-nuoc-lanh');
    setSubCategory('Sửa điện gia dụng');
    setProject('ocean-park-2');
    setSubdivision('Toàn khu đô thị');
    setProviderName(user.name || '');
    setProviderPhone(user.phone || '');
    setProviderZalo(user.phone || '');
    setAddress(user.apartmentAddress || 'Vinhomes Ocean Park 2');
    setPriceDisplay('Từ 150.000đ / lần');
    setDescription('');
    setImages(['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80']);
    setIsEditingModalOpen(true);
  };

  const handleOpenEditModal = (svc: ResidentServiceItem) => {
    setEditingService(svc);
    setTitle(svc.title);
    setCategoryId(svc.categoryId || 'dien-nuoc-lanh');
    setSubCategory(svc.subCategory || 'Sửa điện gia dụng');
    setProject(svc.project || 'ocean-park-2');
    setSubdivision(svc.subdivision || 'Toàn khu đô thị');
    setProviderName(svc.providerName || user.name || '');
    setProviderPhone(svc.providerPhone || user.phone || '');
    setProviderZalo(svc.providerZalo || svc.providerPhone || '');
    setAddress(svc.address || 'Vinhomes Ocean Park 2');
    setPriceDisplay(svc.priceDisplay || 'Từ 150.000đ');
    setDescription(svc.description || '');
    setImages(svc.images && svc.images.length > 0 ? [...svc.images] : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80']);
    setIsEditingModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageSize(file);
    if (!validation.valid) {
      alert(validation.message || 'Kích thước ảnh vượt quá giới hạn 10MB.');
      return;
    }
    try {
      const preview = await createInstantPreview(file);
      setImages(prev => [...prev, preview]);
    } catch (err) {
      console.error('Image preview error:', err);
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

  const handleDeleteService = (idToDelete: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng dịch vụ này?')) return;
    try {
      const stored = localStorage.getItem('resident_services');
      if (stored) {
        const all: ResidentServiceItem[] = JSON.parse(stored);
        const filtered = all.filter(s => s.id !== idToDelete);
        localStorage.setItem('resident_services', JSON.stringify(filtered));
      }
      setServices(prev => prev.filter(s => s.id !== idToDelete));
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Error deleting service:', e);
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên dịch vụ.');
      return;
    }
    if (!providerPhone.trim()) {
      alert('Vui lòng nhập số điện thoại thợ / chủ dịch vụ.');
      return;
    }

    try {
      const stored = localStorage.getItem('resident_services');
      let allServices: ResidentServiceItem[] = stored ? JSON.parse(stored) : [];

      if (editingService) {
        // Update existing
        const updated: ResidentServiceItem = {
          ...editingService,
          title: title.trim(),
          categoryId,
          subCategory: subCategory.trim(),
          project,
          subdivision: subdivision.trim(),
          providerName: providerName.trim(),
          providerPhone: providerPhone.trim(),
          providerZalo: providerZalo.trim() || providerPhone.trim(),
          address: address.trim(),
          priceDisplay: priceDisplay.trim(),
          description: description.trim(),
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'],
          status: 'approved',
          approved: true
        };

        const idx = allServices.findIndex(s => s.id === editingService.id);
        if (idx >= 0) {
          allServices[idx] = updated;
        } else {
          allServices.unshift(updated);
        }
        setServices(prev => prev.map(s => s.id === editingService.id ? updated : s));
      } else {
        // Add new
        const newSvc: ResidentServiceItem = {
          id: `srv-${user.id || 'usr'}-${Date.now()}`,
          userId: user.id,
          title: title.trim(),
          categoryId,
          subCategory: subCategory.trim(),
          project,
          subdivision: subdivision.trim(),
          providerName: providerName.trim(),
          providerPhone: providerPhone.trim(),
          providerZalo: providerZalo.trim() || providerPhone.trim(),
          address: address.trim(),
          priceDisplay: priceDisplay.trim(),
          rating: 5.0,
          reviewCount: 1,
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'],
          description: description.trim(),
          verified: true,
          legalCommitmentAccepted: true,
          status: 'approved',
          approved: true,
          kycStatus: 'verified',
          createdAt: new Date().toISOString()
        };
        allServices.unshift(newSvc);
        setServices(prev => [newSvc, ...prev]);
      }

      localStorage.setItem('resident_services', JSON.stringify(allServices));
      setIsEditingModalOpen(false);
      if (onRefresh) onRefresh();
      alert('🎉 Đã lưu dịch vụ thành công! Dịch vụ đã hiển thị ngay trên Chợ Cư Dân.');
    } catch (e) {
      console.error('Error saving resident service:', e);
      alert('Có lỗi xảy ra khi lưu dịch vụ.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Density Controls & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 p-3 sm:p-4 rounded-2xl border border-teal-500/30 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-teal-500 text-slate-950 font-black text-[9px] rounded uppercase">
              THỢ & DỊCH VỤ CƯ DÂN
            </span>
            <span className="text-xs text-teal-300 font-bold">
              Hiển thị trên Danh Bạ Tiện Ích Cư Dân Toàn Khu
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-white">
            Quản Lý Bài Đăng Dịch Vụ & Thợ Kỹ Thuật Của Bạn
          </h2>
          <p className="text-[11px] text-slate-300">
            Tự do thêm mới, sửa giá, cập nhật SĐT/Zalo và mô tả dịch vụ của bạn bất kỳ lúc nào.
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
              <span>⚡ Icon Thu Gọn</span>
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
            <span>+ Đăng Dịch Vụ</span>
          </button>
        </div>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/60 text-teal-600 rounded-full flex items-center justify-center mx-auto">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Bạn chưa đăng dịch vụ hoặc nghề kỹ thuật nào
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Đăng ký dịch vụ kỹ thuật điện nước, điều hòa, thợ khóa, giúp việc, đồ ăn... để hàng vạn cư dân trong khu đô thị tìm thấy bạn.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 transition cursor-pointer"
          >
            + Đăng Ký Dịch Vụ Ngay
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
                        src={svc.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80'}
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
                          ✓ Nút Xanh KYC
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                          🔧 {svc.subCategory || 'Dịch vụ'}
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
                      <span className="hidden md:inline">Xem Dịch Vụ</span>
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
                          📷 Ảnh Dịch Vụ ({svc.images.length} ảnh):
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
                        <span className="text-slate-400 block text-[10px]">Người Đăng / Thợ:</span>
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
                        ⭐ Đánh giá: <strong>5.0/5</strong> • Trạng thái: <strong className="text-emerald-600">Đang hoạt động</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          to={detailUrl}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-1 transition shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Xem Trên Web</span>
                        </Link>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}${detailUrl}`);
                            alert('📋 Đã sao chép liên kết dịch vụ cư dân!');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
            
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingService ? 'Chỉnh Sửa Dịch Vụ Cư Dân' : 'Đăng Bài Dịch Vụ / Thợ Kỹ Thuật Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thông tin hiển thị trực tiếp trên trang Dịch Vụ & Danh Bạ Thợ Vinhomes
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

            <form onSubmit={handleSaveService} className="p-4 sm:p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Dịch Vụ / Bài Đăng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Sửa Chữa Điện Lạnh, Điều Hòa Cư Dân 24/7 - Có Mặt Sau 15 Phút"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nhóm Ngành Dịch Vụ
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 outline-hidden"
                  >
                    {RESIDENT_SERVICE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
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
                    placeholder="VD: Nạp gas điều hòa, thay van khóa, thông tắc..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-hidden"
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
                    Báo Giá / Mức Phí
                  </label>
                  <input
                    type="text"
                    value={priceDisplay}
                    onChange={e => setPriceDisplay(e.target.value)}
                    placeholder="VD: Từ 150.000đ / lần hoặc Khảo sát báo giá miễn phí"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-amber-600 focus:ring-2 focus:ring-teal-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Thợ / Đơn Vị
                  </label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={e => setProviderName(e.target.value)}
                    placeholder="VD: Thợ Kỹ Thuật Tuấn"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 outline-hidden"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal-500 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số Zalo
                  </label>
                  <input
                    type="tel"
                    value={providerZalo}
                    onChange={e => setProviderZalo(e.target.value)}
                    placeholder="VD: 0988889999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Địa Chỉ / Khu Vực Hoạt Động
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="VD: Tòa S2.05 Ocean Park 1 & Phục vụ toàn khu Ocean Park 1, 2, 3"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mô Tả Dịch Vụ & Cam Kết Chất Lượng
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả kỹ năng, chính sách bảo hành, cam kết không phát sinh giá..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-hidden"
                />
              </div>

              {/* Photos manager */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Ảnh Minh Họa Dịch Vụ ({images.length})
                  </label>
                  <label className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg cursor-pointer inline-flex items-center gap-1">
                    <span>+ Tải Ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-900 border border-slate-300 dark:border-slate-700">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl shadow-md"
                >
                  LƯU DỊCH VỤ NGAY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
