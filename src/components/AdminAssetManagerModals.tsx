import React, { useState } from 'react';
import { Property, Project, NewsArticle, ProjectCategory } from '../types';
import { X, Save, Image as ImageIcon, Trash2, Plus, PlusCircle, UserCheck, Upload, Check, Star, MapPin, Building2, Sparkles, AlertCircle, Lock, Shield, Cloud, Film } from 'lucide-react';
import { SoDoCensorEditor } from './SoDoCensorEditor';
import { compressImageFile } from '../lib/imageUtils';
import { uploadMediaToSupabase } from '../lib/supabaseStorage';

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

  // Handle image upload from computer (convert & compress to Web Data URL)
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
          setFormData(prev => ({
            ...prev,
            images: [compressedDataUrl, ...prev.images]
          }));
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
                    <img src={imgUrl} alt={`Property ${idx}`} className="w-full h-full object-cover" />
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
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      masterplanUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
      location: 'Hà Nội / TP.HCM / Quảng Ninh',
      areaSize: '450 ha',
      totalUnits: '12,000 căn',
      priceRange: '3.5 tỷ - 28 tỷ',
      status: 'Đang Mở Bán & Bàn Giao',
      description: 'Dự án đại đô thị với hạ tầng hiện đại, hệ thống tiện ích đẳng cấp và tiềm năng tăng giá bền vững.',
      subdivisions: [
        { name: 'Phân Khu Trung Tâm', totalUnits: '2,500 căn', highlights: 'Vị trí đắc địa kề công viên', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' }
      ],
      amenities: [
        { title: 'Công Viên Trung Tâm', image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80' }
      ]
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
          setFormData(prev => ({ ...prev, image: compressed }));
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
          setFormData(prev => ({ ...prev, masterplanUrl: compressed }));
        }
      } catch (err) {
        console.error('Error compressing masterplan image:', err);
      }
    }
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
              <img src={formData.image} alt="Project Main" className="w-32 h-20 object-cover rounded-xl border border-slate-300 shadow" />
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
              <img src={formData.masterplanUrl || formData.image} alt="Masterplan" className="w-32 h-20 object-cover rounded-xl border border-slate-300 shadow" />
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
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      publishedAt: new Date().toISOString().split('T')[0],
      views: 120,
      source: 'manual',
      status: 'published'
    }
  );

  const [isUploadingSupabase, setIsUploadingSupabase] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');

  const handleNewsMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('Kích thước file tối đa là 50MB!');
      return;
    }

    try {
      setIsUploadingSupabase(true);
      setUploadStatusMsg('Đang tải file lên Supabase Storage (bucket: media-posts)...');
      
      const publicUrl = await uploadMediaToSupabase(file, 'posts');
      setFormData(prev => ({ ...prev, image: publicUrl }));
      setUploadStatusMsg('✓ Đã tải lên Supabase Storage thành công!');
    } catch (err: any) {
      console.error('Error uploading to Supabase:', err);
      setUploadStatusMsg('Lỗi upload Supabase: ' + (err.message || 'Thử nén file hoặc dùng link ảnh'));
      
      // Fallback to local compress
      try {
        const compressed = await compressImageFile(file, 1200, 900, 0.82);
        if (compressed) {
          setFormData(prev => ({ ...prev, image: compressed }));
        }
      } catch (e2) {
        console.error(e2);
      }
    } finally {
      setIsUploadingSupabase(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung bài viết!');
      return;
    }

    const publishedArticle: NewsArticle = {
      ...formData,
      status: 'published'
    };

    // 1. Send to server API /api/news to store and persist in data store & Cloud SQL
    try {
      await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publishedArticle)
      });
    } catch (err) {
      console.warn('POST /api/news warning:', err);
    }

    onSave(publishedArticle);
    alert('🎉 Đã lưu bài viết tin tức / tin thị trường thành công! Dữ liệu đã được đồng bộ vào hệ thống & Public Website.');
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
              <p className="text-[11px] text-slate-300 flex items-center gap-2">
                <span>Tự động lưu ảnh/video vào <strong>Supabase Storage</strong> và đồng bộ bài viết vào <strong>Cloud SQL</strong></span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Featured Image / Video Section with Supabase integration */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-500" /> Tải Ảnh / Video Lên Supabase Storage (Bucket: media-posts)
              </h4>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-full">
                Supabase Storage CDN
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {formData.image.endsWith('.mp4') || formData.image.endsWith('.webm') ? (
                <div className="w-36 h-24 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-300 text-emerald-400 font-bold text-xs gap-1">
                  <Film className="w-5 h-5" /> Video MP4
                </div>
              ) : (
                <img src={formData.image} alt="News Featured" className="w-32 h-20 object-cover rounded-xl border border-slate-300 shadow" />
              )}
              
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] text-slate-400 block font-bold">Đường dẫn file (Public URL Supabase / Ảnh ngoài):</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 p-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                    placeholder="https://xrbjzcwmtjtfckorhvxo.supabase.co/storage/v1/object/public/media-posts/..."
                  />
                  <label className={`px-3 py-2 ${isUploadingSupabase ? 'bg-slate-500 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition shadow`}>
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingSupabase ? 'Đang tải Supabase...' : '📁 Tải Ảnh / Video'}</span>
                    <input type="file" accept="image/*,video/*" onChange={handleNewsMediaUpload} disabled={isUploadingSupabase} className="hidden" />
                  </label>
                </div>
                {uploadStatusMsg && (
                  <p className={`text-[11px] font-bold ${uploadStatusMsg.includes('✓') ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {uploadStatusMsg}
                  </p>
                )}
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
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
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
// 4. ADD NEW PROPERTY MODAL FOR ADMIN
// ==========================================
interface AddPropertyAdminModalProps {
  onClose: () => void;
  onSave: (newProperty: Property) => void;
  projects?: Project[];
  initialType?: 'sale' | 'rent';
}

export const AddPropertyAdminModal: React.FC<AddPropertyAdminModalProps> = ({
  onClose,
  onSave,
  projects = [],
  initialType = 'sale'
}) => {
  const [formData, setFormData] = useState<Partial<Property>>({
    id: `prop-${Date.now()}`,
    title: '',
    type: initialType,
    project: 'ocean-park-2',
    subdivision: 'Phân khu Chà Là',
    category: 'shophouse',
    price: initialType === 'sale' ? 5.5 : 18,
    priceDisplay: initialType === 'sale' ? '5.5 Tỷ' : '18 Triệu/tháng',
    area: 70,
    bedrooms: 3,
    bathrooms: 2,
    direction: 'Đông Nam',
    furniture: 'full',
    legal: 'so-do',
    address: 'Vinhomes Ocean Park 2, Văn Giang, Hưng Yên',
    description: initialType === 'sale'
      ? 'Chính chủ cần chuyển nhượng căn đẹp, vị trí đắc địa gần công viên và trục đường chính. Pháp lý sổ đỏ đầy đủ, nội thất hoàn thiện cao cấp.'
      : 'Cho thuê căn đẹp full nội thất sang trọng, xách vali về ở ngay. Tiện ích đẳng cấp 5 sao ngay dưới chân tòa nhà.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ],
    sellerName: 'Bùi Văn Hiếu',
    sellerPhone: '0868.499.929',
    sellerRole: 'owner',
    status: 'approved',
    approved: true,
    vipLevel: 'diamond',
    featured: true,
    createdAt: 'Vừa đăng xong'
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [isUploadingSupabase, setIsUploadingSupabase] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Handle Multi Image Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingSupabase(true);
    setUploadMsg(`Đang tải ${files.length} ảnh lên Supabase Storage...`);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const publicUrl = await uploadMediaToSupabase(file, 'properties');
        uploadedUrls.push(publicUrl);
      } catch (err: any) {
        console.warn('Lỗi Supabase Storage upload, nén fallback:', err);
        try {
          const compressed = await compressImageFile(file, 1200, 900, 0.82);
          if (compressed) uploadedUrls.push(compressed);
        } catch (e2) {
          console.error(e2);
        }
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }));
      setUploadMsg(`✓ Đã thêm ${uploadedUrls.length} ảnh thành công!`);
    } else {
      setUploadMsg('Không thể tải ảnh. Vui lòng thử lại!');
    }

    setIsUploadingSupabase(false);
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
      images: [...(prev.images || []), newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const handleDeleteImage = (index: number) => {
    const currentImages = formData.images || [];
    if (currentImages.length <= 1) {
      alert('Bất động sản cần giữ lại ít nhất 1 hình ảnh hiển thị.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: currentImages.filter((_, i) => i !== index)
    }));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    const currentImages = formData.images || [];
    const selected = currentImages[index];
    const remaining = currentImages.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: [selected, ...remaining]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Vui lòng nhập Tiêu đề bài đăng BĐS!');
      return;
    }

    const priceNum = Number(formData.price) || 0;
    const priceDisplay = formData.type === 'sale'
      ? `${priceNum} Tỷ`
      : `${priceNum} Triệu/tháng`;

    const newProperty: Property = {
      id: formData.id || `prop-${Date.now()}`,
      title: formData.title.trim(),
      type: formData.type || 'sale',
      project: formData.project || 'ocean-park-2',
      subdivision: formData.subdivision || 'Phân khu Chà Là',
      category: formData.category || 'shophouse',
      price: priceNum,
      priceDisplay: formData.priceDisplay || priceDisplay,
      area: Number(formData.area) || 70,
      bedrooms: Number(formData.bedrooms) || 2,
      bathrooms: Number(formData.bathrooms) || 2,
      direction: formData.direction || 'Đông Nam',
      furniture: formData.furniture || 'full',
      legal: formData.legal || 'so-do',
      address: formData.address || 'Vinhomes Ocean Park',
      description: formData.description || 'Thông tin bất động sản chính chủ.',
      images: formData.images && formData.images.length > 0 ? formData.images : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
      ],
      sellerName: formData.sellerName || 'Admin Quản Trị',
      sellerPhone: formData.sellerPhone || '0868.499.929',
      sellerRole: formData.sellerRole || 'owner',
      status: 'approved',
      approved: true,
      vipLevel: formData.vipLevel || 'diamond',
      featured: Boolean(formData.featured),
      createdAt: 'Hôm nay'
    };

    // 1. Post to Server /api/properties (synced to Cloud SQL)
    try {
      await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProperty)
      });
    } catch (err) {
      console.warn('Lỗi lưu server API, lưu qua state:', err);
    }

    onSave(newProperty);
    alert('🎉 Đã thêm mới bài đăng BĐS thành công! Dữ liệu đã được lưu vào Cloud SQL và xuất bản ra Website.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl my-6 overflow-hidden text-xs text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-emerald-600 rounded-xl text-white shadow-md">
              <PlusCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-emerald-400">ĐĂNG TIN BẤT ĐỘNG SẢN MỚI (CHỦ NHÀ / ADMIN)</h2>
              <p className="text-[11px] text-slate-300">Tải ảnh lên Supabase Storage & Tự động đồng bộ vào Cloud SQL PostgreSQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* SECTION 1: HÌNH ẢNH BĐS & SUPABASE STORAGE */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Hình Ảnh BĐS ({(formData.images || []).length} Ảnh) - Lưu Trên Supabase Storage
              </h3>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-lg">
                Ảnh 1 là Ảnh Bìa Đại Diện
              </span>
            </div>

            {/* Existing Images Gallery List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {(formData.images || []).map((imgUrl, idx) => (
                <div key={idx} className="relative group p-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img src={imgUrl} alt={`Property ${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-slate-950" /> ẢNH BÌA
                      </span>
                    )}
                    
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-1 p-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(idx)}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[9px] rounded-lg transition"
                          title="Đặt làm ảnh bìa đại diện"
                        >
                          Đặt Bìa
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(idx)}
                        className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Images Controls */}
            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Dán URL hình ảnh từ internet (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm URL
                </button>
                <label className={`px-4 py-2 ${isUploadingSupabase ? 'bg-slate-500 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow transition`}>
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingSupabase ? 'Đang tải Supabase...' : '📁 Tải Ảnh Từ Máy'}</span>
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={isUploadingSupabase} className="hidden" />
                </label>
              </div>
              {uploadMsg && (
                <p className={`text-[11px] font-bold ${uploadMsg.includes('✓') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                  {uploadMsg}
                </p>
              )}
              {imageError && <p className="text-[11px] text-rose-500 font-bold">{imageError}</p>}
            </div>
          </div>

          {/* SECTION 2: THÔNG TIN BẤT ĐỘNG SẢN CHÍNH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* Tiêu đề */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tiêu Đề Tin Đăng (*):
              </label>
              <input
                type="text"
                required
                placeholder="VD: Bán Shophouse Chà Là Vinhomes Ocean Park 2, 70m2 Hoàn Thiện Full..."
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Hình thức giao dịch */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hình Thức Giao Dịch (*):</label>
              <select
                value={formData.type || 'sale'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'sale' | 'rent' })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                <option value="sale">🟢 Mua Bán Chuyển Nhượng</option>
                <option value="rent">🟡 Cho Thuê</option>
              </select>
            </div>

            {/* Dự án */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dự Án Vinhomes (*):</label>
              <select
                value={formData.project || 'ocean-park-2'}
                onChange={(e) => setFormData({ ...formData, project: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                <option value="ocean-park-2">Vinhomes Ocean Park 2 (The Empire)</option>
                <option value="ocean-park-3">Vinhomes Ocean Park 3 (The Crown)</option>
                <option value="ocean-park-1">Vinhomes Ocean Park 1 (Gia Lâm)</option>
                <option value="smart-city">Vinhomes Smart City (Tây Mỗ)</option>
                <option value="grand-park">Vinhomes Grand Park (TP. Thủ Đức)</option>
                <option value="co-loa">Vinhomes Global Gate (Cổ Loa)</option>
                <option value="ha-long-xanh">Vinhomes Hạ Long Xanh</option>
                <option value="golden-crown">Golden Crown Hải Phòng</option>
                <option value="vu-yen">Vinhomes Royal Island (Vũ Yên)</option>
              </select>
            </div>

            {/* Phân khu */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phân Khu / Tòa / Dãy:</label>
              <input
                type="text"
                placeholder="VD: Phân khu Chà Là, San Hô, Sao Biển..."
                value={formData.subdivision || ''}
                onChange={(e) => setFormData({ ...formData, subdivision: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {/* Loại hình BĐS */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Loại Hình BĐS:</label>
              <select
                value={formData.category || 'shophouse'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                <option value="shophouse">Shophouse TMDV / Nhà phố</option>
                <option value="lien-ke">Liền kề</option>
                <option value="biet-thu-song-lap">Biệt thự Song Lập</option>
                <option value="biet-thu-don-lap">Biệt thự Đơn Lập</option>
                <option value="studio">Căn hộ Studio</option>
                <option value="1pn">Căn hộ 1PN / 1PN+1</option>
                <option value="2pn">Căn hộ 2PN / 2PN+1</option>
                <option value="3pn">Căn hộ 3PN / Penthouse</option>
              </select>
            </div>

            {/* Giá */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {formData.type === 'sale' ? 'Mức Giá (Tỷ VNĐ) (*):' : 'Giá Thuê (Triệu VNĐ/tháng) (*):'}
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder={formData.type === 'sale' ? '5.5' : '15'}
                value={formData.price || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    price: val,
                    priceDisplay: formData.type === 'sale' ? `${val} Tỷ` : `${val} Triệu/tháng`
                  });
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-amber-600 dark:text-amber-400"
              />
            </div>

            {/* Diện tích */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Diện Tích (m²) (*):</label>
              <input
                type="number"
                required
                placeholder="70"
                value={formData.area || ''}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            {/* Phòng ngủ */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phòng Ngủ:</label>
              <input
                type="number"
                min="0"
                value={formData.bedrooms || 2}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {/* Phòng tắm */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phòng Vệ Sinh:</label>
              <input
                type="number"
                min="0"
                value={formData.bathrooms || 2}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {/* Hướng nhà */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hướng Nhà:</label>
              <select
                value={formData.direction || 'Đông Nam'}
                onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Đông Nam">Đông Nam</option>
                <option value="Đông Bắc">Đông Bắc</option>
                <option value="Tây Nam">Tây Nam</option>
                <option value="Tây Bắc">Tây Bắc</option>
                <option value="Đông">Đông</option>
                <option value="Tây">Tây</option>
                <option value="Nam">Nam</option>
                <option value="Bắc">Bắc</option>
              </select>
            </div>

            {/* Tình trạng nội thất */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nội Thất:</label>
              <select
                value={formData.furniture || 'full'}
                onChange={(e) => setFormData({ ...formData, furniture: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="full">Full Nội Thất Cao Cấp</option>
                <option value="basic">Nội thất cơ bản CĐT</option>
                <option value="raw">Bàn giao thô</option>
              </select>
            </div>

            {/* Pháp lý */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pháp Lý:</label>
              <select
                value={formData.legal || 'so-do'}
                onChange={(e) => setFormData({ ...formData, legal: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="so-do">Sổ đỏ lâu dài / Đã có sổ</option>
                <option value="hdmb">Hợp đồng mua bán (HĐMB)</option>
                <option value="dang-cho-so">Đang chờ sổ</option>
              </select>
            </div>

            {/* VIP Tier */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cấp Độ VIP:</label>
              <select
                value={formData.vipLevel || 'diamond'}
                onChange={(e) => setFormData({ ...formData, vipLevel: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-amber-500"
              >
                <option value="diamond">💎 VIP Kim Cương (Ưu tiên số 1)</option>
                <option value="gold">🥇 VIP Vàng</option>
                <option value="silver">🥈 VIP Bạc</option>
                <option value="normal">Tin Thường</option>
              </select>
            </div>
          </div>

          {/* SECTION 3: THÔNG TIN NGƯỜI ĐĂNG & LIÊN HỆ */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-500" /> Thông Tin Người Đăng & Liên Hệ Xem Nhà
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Tên Người Đăng / Chủ Nhà:</label>
                <input
                  type="text"
                  value={formData.sellerName || ''}
                  onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                  placeholder="Bùi Văn Hiếu"
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Số Điện Thoại / Zalo (*):</label>
                <input
                  type="text"
                  required
                  value={formData.sellerPhone || ''}
                  onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
                  placeholder="0868.499.929"
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Vai Trò:</label>
                <select
                  value={formData.sellerRole || 'owner'}
                  onChange={(e) => setFormData({ ...formData, sellerRole: e.target.value as any })}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                >
                  <option value="owner">Chính Chủ Nhà</option>
                  <option value="sale">Môi Giới Chuyên Nghiệp</option>
                  <option value="investor">Nhà Đầu Tư F0</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: NỘI DUNG MÔ TẢ CHI TIẾT */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Mô Tả Chi Tiết Bất Động Sản (*):
            </label>
            <textarea
              rows={5}
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập thông tin chi tiết về tiện ích, hướng view, chính sách giá, liên hệ..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white leading-relaxed font-sans"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
            >
              <Check className="w-4 h-4" /> ĐĂNG BÀI & LƯU VÀO CLOUD SQL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

