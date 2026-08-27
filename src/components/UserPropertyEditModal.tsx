import React, { useState } from 'react';
import { 
  X, Check, Building2, MapPin, DollarSign, Home, Phone, 
  Image as ImageIcon, Trash2, Plus, AlertCircle, Sparkles, Upload
} from 'lucide-react';
import { Property, PropertyType, ProjectCategory, PropertyCategory } from '../types';
import { createInstantPreview, validateImageSize } from '../lib/watermark';

interface UserPropertyEditModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProperty: Property) => void;
}

export const UserPropertyEditModal: React.FC<UserPropertyEditModalProps> = ({
  property,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !property) return null;

  const [title, setTitle] = useState(property.title || '');
  const [type, setType] = useState<PropertyType>(property.type || 'sale');
  const [project, setProject] = useState<ProjectCategory>(property.project || 'ocean-park-2');
  const [category, setCategory] = useState<PropertyCategory>(property.category || 'shophouse');
  const [subdivision, setSubdivision] = useState(property.subdivision || 'Chà Là');
  const [priceNum, setPriceNum] = useState<string>(() => {
    if (typeof property.price === 'number') {
      return property.type === 'rent' ? String(property.price) : String(property.price);
    }
    return '8.5';
  });
  const [priceDisplay, setPriceDisplay] = useState(property.priceDisplay || '8.5 Tỷ');
  const [area, setArea] = useState<string>(String(property.area || 75));
  const [bedrooms, setBedrooms] = useState<string>(String(property.bedrooms || 3));
  const [bathrooms, setBathrooms] = useState<string>(String(property.bathrooms || 2));
  const [direction, setDirection] = useState(property.direction || 'Đông Nam');
  const [address, setAddress] = useState(property.address || property.location || 'Vinhomes Ocean Park 2');
  const [description, setDescription] = useState(property.description || '');
  const [sellerName, setSellerName] = useState(property.sellerName || '');
  const [sellerPhone, setSellerPhone] = useState(property.sellerPhone || '');
  const [images, setImages] = useState<string[]>(property.images && property.images.length > 0 ? [...property.images] : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePriceChange = (val: string) => {
    setPriceNum(val);
    if (!val) return;
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (type === 'rent') {
        setPriceDisplay(`${num} Triệu/tháng`);
      } else {
        setPriceDisplay(`${num} Tỷ`);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageSize(file);
      if (!validation.valid) {
        alert(validation.message || 'Kích thước ảnh vượt quá giới hạn 10MB.');
        continue;
      }
      try {
        const preview = await createInstantPreview(file);
        setImages(prev => [...prev, preview]);
      } catch (err) {
        console.error('Image preview error:', err);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (images.length <= 1) {
      alert('Bài đăng cần có ít nhất 1 hình ảnh minh họa.');
      return;
    }
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài đăng.');
      return;
    }
    if (!priceNum || isNaN(parseFloat(priceNum))) {
      alert('Vui lòng nhập mức giá hợp lệ.');
      return;
    }
    if (!sellerPhone.trim()) {
      alert('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }

    setIsSubmitting(true);

    const updatedProp: Property = {
      ...property,
      title: title.trim(),
      type,
      project,
      category,
      subdivision: subdivision.trim(),
      price: parseFloat(priceNum) || 0,
      priceDisplay: priceDisplay.trim() || `${priceNum} ${type === 'rent' ? 'Triệu/tháng' : 'Tỷ'}`,
      area: parseFloat(area) || 0,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      direction: direction.trim(),
      address: address.trim(),
      location: address.trim(),
      description: description.trim(),
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'],
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Send update to API
      try {
        await fetch(`/api/properties/${property.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProp)
        });
      } catch (err) {
        console.warn('API update property warning:', err);
      }

      // 2. Save to local storage cache
      try {
        const savedProps = localStorage.getItem('user_properties');
        if (savedProps) {
          const list: Property[] = JSON.parse(savedProps);
          const idx = list.findIndex(p => p.id === property.id);
          if (idx >= 0) {
            list[idx] = updatedProp;
          } else {
            list.unshift(updatedProp);
          }
          localStorage.setItem('user_properties', JSON.stringify(list));
        }
      } catch (err) {}

      // 3. Callback
      onSave(updatedProp);
      onClose();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Có lỗi xảy ra khi cập nhật tin. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col my-auto overscroll-contain">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Chỉnh Sửa Bài Đăng Bất Động Sản
              </h3>
              <p className="text-xs text-slate-500">
                Mã tin: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{property.code || property.id}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 pb-36 sm:pb-6">
          
          {/* Row 1: Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề bài đăng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Cắt lỗ gấp Shophouse Chà Là 15 trục đường 20m, full nội thất xịn"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
              required
            />
          </div>

          {/* Row 2: Type, Project, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nhu Cầu Giao Dịch
              </label>
              <select
                value={type}
                onChange={e => {
                  const newType = e.target.value as PropertyType;
                  setType(newType);
                  if (newType === 'rent') {
                    setPriceDisplay(`${priceNum} Triệu/tháng`);
                  } else {
                    setPriceDisplay(`${priceNum} Tỷ`);
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="sale">Cần Bán (Chuyển nhượng)</option>
                <option value="rent">Cho Thuê</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dự Án Vinhomes
              </label>
              <select
                value={project}
                onChange={e => setProject(e.target.value as ProjectCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
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
                Loại Hình BĐS
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as PropertyCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="shophouse">Shophouse / Nhà phố</option>
                <option value="townhouse">Liền kề</option>
                <option value="villa">Biệt thự đơn lập / Song lập</option>
                <option value="apartment">Chung cư cao tầng</option>
                <option value="studio">Studio</option>
                <option value="1br">Căn hộ 1PN / 1PN+1</option>
                <option value="2br">Căn hộ 2PN / 2PN+1</option>
                <option value="3br">Căn hộ 3PN</option>
                <option value="penthouse">Penthouse / Duplex</option>
              </select>
            </div>
          </div>

          {/* Row 3: Price, Area, Bedrooms, Bathrooms, Direction */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mức Giá ({type === 'rent' ? 'Triệu' : 'Tỷ'}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={priceNum}
                onChange={e => handlePriceChange(e.target.value)}
                placeholder={type === 'rent' ? '15' : '8.5'}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Diện Tích (m²)
              </label>
              <input
                type="number"
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder="75"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phòng Ngủ
              </label>
              <input
                type="number"
                value={bedrooms}
                onChange={e => setBedrooms(e.target.value)}
                placeholder="3"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vệ Sinh
              </label>
              <input
                type="number"
                value={bathrooms}
                onChange={e => setBathrooms(e.target.value)}
                placeholder="2"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hướng Nhà
              </label>
              <select
                value={direction}
                onChange={e => setDirection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="Đông Nam">Đông Nam</option>
                <option value="Chính Đông">Chính Đông</option>
                <option value="Chính Nam">Chính Nam</option>
                <option value="Đông Bắc">Đông Bắc</option>
                <option value="Tây Nam">Tây Nam</option>
                <option value="Chính Tây">Chính Tây</option>
                <option value="Tây Bắc">Tây Bắc</option>
                <option value="Chính Bắc">Chính Bắc</option>
              </select>
            </div>
          </div>

          {/* Row 4: Phân Khu & Địa chỉ cụ thể */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phân Khu
              </label>
              <input
                type="text"
                value={subdivision}
                onChange={e => setSubdivision(e.target.value)}
                placeholder="VD: Chà Là, Cọ Xanh, Sao Biển, Vịnh Thiên Đường..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Địa Chỉ / Vị Trí Cụ Thể
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="VD: Chà Là 15-28, Vinhomes Ocean Park 2"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Row 5: Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-500/20">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên Người Liên Hệ
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={e => setSellerName(e.target.value)}
                placeholder="VD: Anh Nam (Chính Chủ)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số Điện Thoại Liên Hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={sellerPhone}
                onChange={e => setSellerPhone(e.target.value)}
                placeholder="VD: 0988889999"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                required
              />
            </div>
          </div>

          {/* Row 6: Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mô tả chi tiết bài đăng
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả ưu điểm, tiện ích xung quanh, chính sách ưu đãi, pháp lý sổ đỏ..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Row 7: Images Manager */}
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                Hình Ảnh Bài Đăng ({images.length} ảnh)
              </label>
              <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Thêm Ảnh Mới</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 aspect-4/3 bg-slate-900">
                  <img loading="lazy"
                    src={imgUrl}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black rounded">
                      Ảnh Đại Diện
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-8 h-8 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg flex items-center justify-center shadow-md active:scale-90 transition cursor-pointer z-10"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>LƯU CẬP NHẬT TIN ĐĂNG</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
