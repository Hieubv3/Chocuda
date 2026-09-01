import React, { useState } from 'react';
import { Property, Project, NewsArticle, ProjectCategory } from '../types';
import { X, Save, Image as ImageIcon, Trash2, Plus, Upload, Check, Star, MapPin, Building2, Sparkles, AlertCircle, Lock, Shield, HelpCircle, Youtube } from 'lucide-react';
import { SoDoCensorEditor } from './SoDoCensorEditor';
import { compressImageFile } from '../lib/imageUtils';
import { uploadBase64DataUrl, isBase64DataUrl } from '../lib/uploadService';

// ==========================================
// 1. EDIT PROPERTY MODAL (WITH FULL IMAGE MANAGER)
// ==========================================
interface EditPropertyModalProps {
  property: Property;
  onClose: () => void;
  onSave: (updated: Property) => void;
}

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  property,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Property>({ ...property });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [censorTargetIndex, setCensorTargetIndex] = useState<number | null>(null);
  const [showSoDoCensorAdmin, setShowSoDoCensorAdmin] = useState(false);

  // Handle image upload from computer (compress -> upload server -> URL public)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Kích thước ảnh tối đa là 15MB');
        return;
      }
      try {
        const compressedDataUrl = await compressImageFile(file, 1200, 900, 0.82);
        if (compressedDataUrl) {
          // Upload lên server -> URL public (thay vì lưu base64)
          const url = isBase64DataUrl(compressedDataUrl)
            ? await uploadBase64DataUrl(compressedDataUrl, 'properties')
            : compressedDataUrl;
          if (url) {
            setFormData(prev => ({
              ...prev,
              images: [url, ...prev.images]
            }));
          }
        }
      } catch (err) {
        console.error('Error compressing image file:', err);
      }
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    if (!newImageUrl.startsWith('http') && !newImageUrl.startsWith('data:image')) {
      setImageError('Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://');
      return;
    }
    setImageError('');
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const handleDeleteImage = (index: number) => {
    if (formData.images.length <= 1) {
      alert('Bất động sản cần giữ lại ít nhất 1 hình ảnh hiển thị.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    const selected = formData.images[index];
    const remaining = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: [selected, ...remaining]
    }));
  };

  const handleUpdateImageAt = (index: number, newUrl: string) => {
    const updated = [...formData.images];
    updated[index] = newUrl;
    setFormData(prev => ({ ...prev, images: updated }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const approvedProperty: Property = {
      ...formData,
      approved: true,
      status: 'approved'
    };
    onSave(approvedProperty);
    alert('✅ Đã lưu cập nhật bất động sản & đồng bộ trực tiếp lên Public Website thành công!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden text-xs">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-emerald-600 rounded-xl text-white">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-emerald-400">QUẢN LÝ & CHỈNH SỬA BẤT ĐỘNG SẢN #{formData.id}</h2>
              <p className="text-[11px] text-slate-300">Thay đổi thông tin, đăng/xóa/sửa tất cả hình ảnh demo thực tế</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* SECTION 1: MANAGE IMAGES (THAY/XÓA/SỬA ẢNH DEMO) */}
          <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Quản Lý {formData.images.length} Hình Ảnh BĐS (Đổi/Xóa/Thêm)
              </h3>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg">
                Ảnh 1 là Ảnh Bìa Đại Diện
              </span>
            </div>

            {/* Existing Images Gallery List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} className="relative group p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img loading="lazy" src={imgUrl} alt={`Property ${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                        <Star className="w-3 h-3 fill-slate-950" /> ÁNH BÌA
                      </span>
                    )}
                    
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-1.5 p-1">
                      <button
                        type="button"
                        onClick={() => setCensorTargetIndex(idx)}
                        className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg transition flex items-center gap-1 shadow cursor-pointer"
                        title="Che sương mờ bảo mật & đóng watermark"
                      >
                        <Lock className="w-3 h-3" /> Che Sương Mờ
                      </button>

                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(idx)}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg transition"
                          title="Đặt làm ảnh đại diện"
                        >
                          Đặt Bìa
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(idx)}
                        className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Edit URL Input */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">URL Ảnh #{idx + 1}:</label>
                    <input
                      type="text"
                      value={imgUrl}
                      onChange={(e) => handleUpdateImageAt(idx, e.target.value)}
                      className="w-full p-1.5 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Image Controls */}
            <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Thêm Hình Ảnh Mới Cho BĐS:</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Dán URL hình ảnh từ internet (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Thêm URL
                </button>
                <label className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow">
                  <Upload className="w-4 h-4" /> Tải Tệp Ảnh
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              {imageError && <p className="text-[11px] text-rose-500 font-bold">{imageError}</p>}
            </div>

            {/* Active Image Censor Editor Modal Overlay for Admin */}
            {censorTargetIndex !== null && formData.images[censorTargetIndex] && (
              <div className="p-4 bg-slate-900 border-2 border-teal-500 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-white">
                  <span className="font-extrabold text-teal-400 flex items-center gap-1.5 uppercase text-xs">
                    <Lock className="w-4 h-4 text-teal-400" />
                    BỘ CHE MỜ VỊ TRÍ & BÔI ĐEN DÀNH CHO ADMIN (ẢNH #{censorTargetIndex + 1})
                  </span>
                  <button
                    type="button"
                    onClick={() => setCensorTargetIndex(null)}
                    className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg text-xs"
                  >
                    ✕ Đóng
                  </button>
                </div>
                <SoDoCensorEditor
                  originalImageUrl={formData.images[censorTargetIndex]}
                  onSaveRedacted={(redactedDataUrl) => {
                    handleUpdateImageAt(censorTargetIndex, redactedDataUrl);
                    setCensorTargetIndex(null);
                    alert(`Đã lưu ảnh đã che mờ/bôi đen vị trí cho Ảnh #${censorTargetIndex + 1}!`);
                  }}
                  onCancel={() => setCensorTargetIndex(null)}
                />
              </div>
            )}
          </div>

          {/* SECTION: ADMIN SỔ ĐỎ XÁC MINH & CHE MỜ VỊ TRÍ */}
          <div className="p-5 bg-gradient-to-r from-amber-500/10 via-slate-900/50 to-teal-500/10 dark:bg-slate-900 rounded-2xl border-2 border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  ADMIN XÁC MINH CHỦ NHÀ & BÔI ĐEN SỔ ĐỎ
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Đối chiếu ảnh gốc do Chủ Nhà / Sale gửi để xác minh chính chủ, sau đó che mờ vị trí nhạy cảm trước khi công khai.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSoDoCensorAdmin(true)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 shrink-0 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>MỞ BỘ CHE SỔ ĐỎ ADMIN</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold mb-1">
                  URL Sổ Đỏ Gốc (Bảo mật cho Admin):
                </label>
                <input
                  type="text"
                  value={formData.soDoImage || ''}
                  onChange={(e) => setFormData({ ...formData, soDoImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 text-[11px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-teal-600 dark:text-teal-400 block font-bold mb-1">
                  URL Sổ Đỏ Đã Che (Hiển thị cho Khách):
                </label>
                <input
                  type="text"
                  value={formData.soDoRedactedImage || formData.soDoImage || ''}
                  onChange={(e) => setFormData({ ...formData, soDoRedactedImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 text-[11px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {showSoDoCensorAdmin && (
              <div className="pt-2">
                <SoDoCensorEditor
                  originalImageUrl={formData.soDoImage || formData.images[0]}
                  onSaveRedacted={(dataUrl) => {
                    setFormData({ ...formData, soDoRedactedImage: dataUrl });
                    setShowSoDoCensorAdmin(false);
                    alert('Admin đã bôi đen/che mờ Sổ Đỏ thành công!');
                  }}
                  onCancel={() => setShowSoDoCensorAdmin(false)}
                />
              </div>
            )}
          </div>

          {/* SECTION 2: PROPERTY BASIC INFORMATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tiêu Đề Bài Đăng (*):</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nhu Cầu (*):</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'sale' | 'rent' })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                <option value="sale">Bán Bất Động Sản</option>
                <option value="rent">Cho Thuê Bất Động Sản</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dự Án Vinhomes (*):</label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value as ProjectCategory })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                <option value="ocean-park-2">Vinhomes Ocean Park 2 (The Empire)</option>
                <option value="ocean-park-3">Vinhomes Ocean Park 3 (Grand Park)</option>
                <option value="ocean-park-1">Vinhomes Ocean Park 1 (Gia Lâm)</option>
                <option value="ha-long-xanh">Vinhomes Hạ Long Xanh (Quảng Ninh)</option>
                <option value="green-paradise-can-gio">Vinhomes Green Paradise Cần Giờ</option>
                <option value="tan-my-hau-nghia">Vinhomes Tân Mỹ - Hậu Nghĩa Long An</option>
                <option value="green-city-hoc-mon">Vinhomes Green City Hóc Môn</option>
                <option value="lang-van-da-nang">Vinhomes Làng Vân Đà Nẵng</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mức Giá Hiển Thị (Ví dụ: 8.5 Tỷ hoặc 12 Tr/tháng):</label>
              <input
                type="text"
                required
                value={formData.priceDisplay}
                onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Diện Tích (m²):</label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phân Khu / Vị Trí:</label>
              <input
                type="text"
                value={formData.subdivision || ''}
                onChange={(e) => setFormData({ ...formData, subdivision: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                placeholder="VD: Phân khu Chà Là, Phố Biển, San Hô..."
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Trạng Thái Kiểm Duyệt & Cấp VIP:</label>
              <div className="flex gap-2">
                <select
                  value={formData.approved ? 'approved' : 'pending'}
                  onChange={(e) => setFormData({ ...formData, approved: e.target.value === 'approved', status: e.target.value as any })}
                  className="w-1/2 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
                >
                  <option value="approved">✓ Đã Duyệt</option>
                  <option value="pending">⏳ Chờ Duyệt</option>
                </select>

                <select
                  value={formData.vipLevel || 'normal'}
                  onChange={(e) => setFormData({ ...formData, vipLevel: e.target.value as any })}
                  className="w-1/2 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-purple-600"
                >
                  <option value="normal">Tin Thường</option>
                  <option value="silver">🥈 VIP Bạc</option>
                  <option value="gold">🥇 VIP Vàng</option>
                  <option value="diamond">💎 VIP Kim Cương</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Địa Chỉ Chi Tiết:</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mô Tả Chi Tiết BĐS:</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300 transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition transform active:scale-95"
            >
              <Save className="w-4 h-4" /> Lưu Bất Động Sản & Hình Ảnh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ==========================================
// 2. EDIT PROJECT MODAL (QUẢN LÝ DỰ ÁN & THAY ẢNH DỰ ÁN)
// ==========================================
interface EditProjectModalProps {
  project?: Project | null;
  isCreate?: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  isCreate = false,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Project>(
    project || {
      id: `du-an-${Date.now()}` as any,
      title: '',
      name: '',
      image: '',
      images: [],
      masterplanUrl: '',
      youtubeUrl: '',
      legalInfo: '',
      currentStatus: '',
      location: '',
      areaSize: '',
      totalUnits: '',
      priceRange: '',
      status: 'Đang Mở Bán & Bàn Giao',
      description: '',
      subdivisions: [],
      amenities: []
    }
  );

  const handleMainBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Kích thước ảnh tối đa là 15MB');
        return;
      }
      try {
        const compressed = await compressImageFile(file, 1400, 1000, 0.82);
        if (compressed) {
          // Upload lên server -> URL public
          const url = isBase64DataUrl(compressed)
            ? await uploadBase64DataUrl(compressed, 'projects')
            : compressed;
          if (url) setFormData(prev => ({ ...prev, image: url }));
        }
      } catch (err) {
        console.error('Error compressing banner image:', err);
      }
    }
  };

  const handleMasterplanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Kích thước ảnh tối đa là 15MB');
        return;
      }
      try {
        const compressed = await compressImageFile(file, 1600, 1200, 0.82);
        if (compressed) {
          // Upload lên server -> URL public
          const url = isBase64DataUrl(compressed)
            ? await uploadBase64DataUrl(compressed, 'projects')
            : compressed;
          if (url) setFormData(prev => ({ ...prev, masterplanUrl: url }));
        }
      } catch (err) {
        console.error('Error compressing masterplan image:', err);
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls: string[] = [];
    for (const file of Array.from(files) as File[]) {
      if (file.size > 15 * 1024 * 1024) {
        alert(`Ảnh ${file.name} quá lớn (tối đa 15MB)`);
        continue;
      }
      try {
        const compressed = await compressImageFile(file, 1600, 1200, 0.82);
        if (compressed) {
          const url = isBase64DataUrl(compressed)
            ? await uploadBase64DataUrl(compressed, 'projects')
            : compressed;
          if (url) newUrls.push(url);
        }
      } catch (err) {
        console.error('Error compressing gallery image:', err);
      }
    }
    if (newUrls.length > 0) {
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newUrls] }));
    }
  };

  const removeGalleryImage = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Vui lòng nhập tên thương mại dự án!');
      return;
    }
    const finalProject = {
      ...formData,
      name: formData.title // Sync name and title
    };
    onSave(finalProject);
    alert(`Đã ${isCreate ? 'thêm mới' : 'cập nhật'} thông tin Dự án ${finalProject.title} thành công!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-emerald-600 rounded-xl text-white">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-emerald-400">
                {isCreate ? 'THÊM DỰ ÁN / TÒA NHÀ MỚI VÀO HỆ THỐNG' : 'CHỈNH SỬA DỰ ÁN & THAY ẢNH BANNER / SƠ ĐỒ'}
              </h2>
              <p className="text-[11px] text-slate-300">{formData.title || 'Nhập thông tin dự án mới'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Main Image Replacement */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-500" /> 1. Hình Ảnh Banner Chính Dự Án
            </h4>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <img loading="lazy" src={formData.image} alt="Project Main" className="w-32 h-20 object-cover rounded-xl border border-slate-300 shadow" />
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] text-slate-400 block font-bold">URL hoặc Tải tệp ảnh banner chính (*):</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 p-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                    placeholder="https://..."
                  />
                  <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition shadow">
                    <Upload className="w-4 h-4" /> Tải Ảnh Từ Thiết Bị
                    <input type="file" accept="image/*" onChange={handleMainBannerUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Masterplan Map Image Replacement */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-amber-500" /> 2. Hình Ảnh Sơ Đồ Quy Hoạch / Mặt Bằng Masterplan
            </h4>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <img loading="lazy" src={formData.masterplanUrl || formData.image} alt="Masterplan" className="w-32 h-20 object-cover rounded-xl border border-slate-300 shadow" />
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] text-slate-400 block font-bold">URL hoặc Tải tệp ảnh sơ đồ quy hoạch:</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={formData.masterplanUrl || ''}
                    onChange={(e) => setFormData({ ...formData, masterplanUrl: e.target.value })}
                    className="flex-1 p-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <label className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition shadow">
                    <Upload className="w-4 h-4" /> Tải Ảnh Từ Thiết Bị
                    <input type="file" accept="image/*" onChange={handleMasterplanUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Images (Nhiều ảnh dự án) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-sky-500" /> 3. Gallery Ảnh Dự Án (nhiều ảnh)
            </h4>
            <div className="flex flex-wrap gap-3">
              {(formData.images || []).map((img, idx) => (
                <div key={idx} className="relative group">
                  <img loading="lazy" src={img} alt={`Gallery ${idx + 1}`} className="w-28 h-20 object-cover rounded-xl border border-slate-300 shadow" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow text-[10px] font-black opacity-0 group-hover:opacity-100 transition"
                    title="Xóa ảnh"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="w-28 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-500 cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span className="text-[9px] font-bold mt-0.5">Thêm Ảnh</span>
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
              </label>
            </div>
            <p className="text-[10px] text-slate-400">Có thể chọn nhiều ảnh cùng lúc. Ảnh gallery sẽ hiển thị trong tab "Tổng Quan" của trang dự án.</p>
          </div>

          {/* Video YouTube Giới Thiệu */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-500" /> 4. Video Giới Thiệu (YouTube)
            </h4>
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 block font-bold">URL video YouTube (admin chỉ định kênh/video):</label>
              <input
                type="text"
                value={formData.youtubeUrl || ''}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {formData.youtubeUrl && (
                <div className="aspect-video rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950">
                  <iframe
                    src={formData.youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="YouTube video player"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <p className="text-[10px] text-slate-400">Video sẽ hiển thị trong tab "Video Giới Thiệu" của trang dự án.</p>
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tên Thương Mại Dự Án:</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Vị Trí Tọa Độ:</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Quy Mô Diện Tích:</label>
              <input
                type="text"
                value={formData.areaSize}
                onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Khoảng Giá Mở Bán/Chuyển Nhượng:</label>
              <input
                type="text"
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mô Tả Tổng Quan Dự Án:</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {/* Phân Khu (Subdivisions) — mỗi dòng 1 phân khu */}
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Danh Sách Phân Khu (Subdivisions) — mỗi dòng 1 phân khu:
              </label>
              <textarea
                rows={3}
                value={(formData.subdivisions || []).join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  subdivisions: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                })}
                placeholder={'VD:\nChà Là\nSan Hô\nHải Tăng\nCổ Loa'}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">Mỗi dòng là một phân khu. Các phân khu này sẽ hiển thị trong trang chi tiết dự án.</p>
            </div>

            {/* Tiện Ích (Amenities) — mỗi dòng 1 tiện ích */}
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Danh Sách Tiện Ích (Amenities) — mỗi dòng 1 tiện ích:
              </label>
              <textarea
                rows={3}
                value={(formData.amenities || []).join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  amenities: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                })}
                placeholder={'VD:\nHồ bơi\nPhòng gym\nCông viên\nTrường học'}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">Mỗi dòng là một tiện ích. Các tiện ích này sẽ hiển thị trong trang chi tiết dự án.</p>
            </div>

            {/* Pháp Lý (Legal Info) */}
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Thông Tin Pháp Lý Dự Án:
              </label>
              <textarea
                rows={3}
                value={formData.legalInfo || ''}
                onChange={(e) => setFormData({ ...formData, legalInfo: e.target.value })}
                placeholder={'VD:\n- Chủ đầu tư: Công ty CP Vinhomes\n- Sổ đỏ: Sổ hồng vĩnh viễn\n- Pháp lý: Đã hoàn thiện hồ sơ pháp lý, bàn giao sổ đỏ từng căn'}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">Hiển thị trong tab "Pháp Lý" của trang dự án.</p>
            </div>

            {/* Hiện Trạng / Tiến Độ (Current Status) */}
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Hiện Trạng / Tiến Độ Dự Án:
              </label>
              <textarea
                rows={3}
                value={formData.currentStatus || ''}
                onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                placeholder={'VD:\n- Đã bàn giao 70% căn hộ\n- Hạ tầng khu đô thị hoàn thiện 90%\n- Công viên trung tâm đã đưa vào sử dụng'}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">Hiển thị trong tab "Hiện Trạng" của trang dự án.</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Lưu Dự Án & Thay Ảnh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ==========================================
// 3. EDIT NEWS MODAL (SOẠN & THAY ẢNH BÀI VIẾT TIN TỨC)
// ==========================================
interface EditNewsModalProps {
  newsItem: NewsArticle | null;
  onClose: () => void;
  onSave: (article: NewsArticle) => void;
}

export const EditNewsModal: React.FC<EditNewsModalProps> = ({
  newsItem,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<NewsArticle>(
    newsItem || {
      id: `news-${Date.now()}`,
      title: '',
      summary: '',
      content: '',
      category: 'vinhomes',
      author: 'Nhà đẹp Vinhomes - 0868.499.929',
      image: '',
      publishedAt: new Date().toISOString().split('T')[0],
      views: 0,
      source: 'manual',
      status: 'published'
    }
  );

  const handleNewsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Kích thước ảnh tối đa là 15MB');
        return;
      }
      try {
        const compressed = await compressImageFile(file, 1200, 900, 0.82);
        if (compressed) {
          // Upload lên server -> URL public
          const url = isBase64DataUrl(compressed)
            ? await uploadBase64DataUrl(compressed, 'news')
            : compressed;
          if (url) setFormData(prev => ({ ...prev, image: url }));
        }
      } catch (err) {
        console.error('Error compressing news image:', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung bài viết');
      return;
    }
    const publishedArticle: NewsArticle = {
      ...formData,
      status: 'published'
    };
    onSave(publishedArticle);
    alert('✅ Đã lưu bài viết tin tức & xuất bản công khai lên Public Website!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-amber-500 text-slate-950 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-amber-400">
                {newsItem ? 'CHỈNH SỬA BÀI VIẾT TIN TỨC & THAY ẢNH' : 'THÊM BÀI VIẾT TIN TỨC MỚI (CHUẨN SEO)'}
              </h2>
              <p className="text-[11px] text-slate-300">Quản lý bài viết thị trường & dự án Vinhomes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Featured Image Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-amber-500" /> Hình Ảnh Minh Họa Bài Viết (Tải Ảnh Từ Thiết Bị)
            </h4>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <img loading="lazy" src={formData.image} alt="News Featured" className="w-32 h-20 object-cover rounded-xl border border-slate-300 shadow" />
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] text-slate-400 block font-bold">URL hoặc Tải tệp ảnh đại diện bài viết (*):</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 p-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                    placeholder="https://..."
                  />
                  <label className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition shadow">
                    <Upload className="w-4 h-4" /> Tải Ảnh Từ Thiết Bị
                    <input type="file" accept="image/*" onChange={handleNewsImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tiêu Đề Bài Viết Chuẩn SEO (*):</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Chuyên Mục:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                <option value="vinhomes">Dự án Vinhomes</option>
                <option value="thi-truong">Tin Thị Trường BĐS</option>
                <option value="kinh-nghiem">Kinh Nghiệm Đầu Tư</option>
                <option value="quy-hoach">Quy Hoạch Hạ Tầng</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tác Giả:</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tóm Tắt Ngắn (1-2 câu):</label>
              <textarea
                rows={2}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nội Dung Chi Tiết Bài Viết (Hỗ Trợ Markdown ##, **bold**):</label>
              <textarea
                rows={8}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Xuất Bản Bài Viết & Hình Ảnh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. EDIT FAQ / Q&A MODAL (SOẠN CÂU HỎI & TRẢ LỜI)
// ==========================================
interface EditFaqModalProps {
  faqItem: any | null;
  isCreate?: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
}

export const EditFaqModal: React.FC<EditFaqModalProps> = ({
  faqItem,
  isCreate = false,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<any>(
    faqItem || {
      id: `faq-${Date.now()}`,
      projectId: 'all',
      category: 'investor',
      question: '',
      answer: '',
      keywords: [],
      updatedAt: new Date().toISOString().split('T')[0]
    }
  );
  const [keywordsText, setKeywordsText] = useState<string>(
    (faqItem?.keywords || []).join(', ')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      alert('Vui lòng nhập đầy đủ câu hỏi và câu trả lời!');
      return;
    }
    const finalItem = {
      ...formData,
      keywords: keywordsText.split(',').map(k => k.trim()).filter(Boolean)
    };
    onSave(finalItem);
    alert(`Đã ${isCreate ? 'thêm mới' : 'cập nhật'} câu hỏi Q&A thành công!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-emerald-600 rounded-xl text-white">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-emerald-400">
                {isCreate ? 'THÊM CÂU HỎI Q&A MỚI' : 'CHỈNH SỬA CÂU HỎI Q&A'}
              </h2>
              <p className="text-[11px] text-slate-300">Quản lý câu hỏi & trả lời hiển thị trên trang dự án</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dự Án:</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                <option value="all">Tất cả dự án</option>
                <option value="ocean-park-1">Vinhomes Ocean Park 1 (Gia Lâm)</option>
                <option value="ocean-park-2">Vinhomes Ocean Park 2 (The Empire)</option>
                <option value="ocean-park-3">Vinhomes Ocean Park 3 (Grand Park)</option>
                <option value="ha-long-xanh">Vinhomes Hạ Long Xanh (Quảng Ninh)</option>
                <option value="green-paradise-can-gio">Vinhomes Green Paradise Cần Giờ</option>
                <option value="tan-my-hau-nghia">Vinhomes Tân Mỹ - Hậu Nghĩa Long An</option>
                <option value="green-city-hoc-mon">Vinhomes Green City Hóc Môn</option>
                <option value="lang-van-da-nang">Vinhomes Làng Vân Đà Nẵng</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Chuyên Mục:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                <option value="investor">Nhà Đầu Tư</option>
                <option value="resident">Cư Dân</option>
                <option value="tenant">Khách Thuê</option>
                <option value="legal_planning">Pháp Lý & Quy Hoạch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Câu Hỏi:</label>
            <textarea
              rows={2}
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              placeholder="VD: Vinhomes Ocean Park 2 có những phân khu nào?"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Câu Trả Lời:</label>
            <textarea
              rows={5}
              required
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              placeholder="Nhập câu trả lời chi tiết..."
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Từ Khóa SEO (phân tách bằng dấu phẩy):
            </label>
            <input
              type="text"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              placeholder="VD: vinhomes ocean park 2, phân khu, đầu tư"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Lưu Câu Hỏi Q&A
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
