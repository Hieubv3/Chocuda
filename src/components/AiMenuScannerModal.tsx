import React, { useState, useRef } from 'react';
import { 
  Sparkles, Camera, Upload, FileText, CheckCircle2, AlertCircle, 
  ArrowRight, RefreshCw, X, Tag, DollarSign, Layers, Plus, Trash2,
  FileCheck, Edit3, Store, Check, Zap, Eye, HelpCircle, Utensils,
  Wrench, Car, Sparkle, ShoppingBag, ShieldCheck, Phone, MapPin
} from 'lucide-react';
import { RESIDENT_SERVICE_CATEGORIES, VIN_MAJOR_PROJECTS } from '../data/residentServicesData';
import { ProjectCategory } from '../types';

export interface ScannedMenuItem {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  unit: string;
  category?: string;
  description?: string;
}

export interface AiMenuScanResult {
  title: string;
  categoryId: string;
  categoryName: string;
  subCategory: string;
  priceDisplay: string;
  providerName?: string;
  providerPhone?: string;
  providerZalo?: string;
  address?: string;
  subdivision?: string;
  project: ProjectCategory;
  menuItems: ScannedMenuItem[];
  suggestedDescription: string;
  tags: string[];
  confidenceScore?: number;
}

interface AiMenuScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToServiceForm: (data: AiMenuScanResult, rawImage?: string) => void;
  onApplyToStoreProducts?: (items: ScannedMenuItem[]) => void;
  defaultProject?: ProjectCategory;
  currentUserPhone?: string;
  currentUserName?: string;
}

// Sample quick test templates for fast user discovery
const SAMPLE_TEMPLATES = [
  {
    name: '🍵 Menu Trà Sữa & Đồ Ăn Vặt',
    category: 'am-thuc-com-cu-dan',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    text: `MENU TIỆM TRÀ CHỢ CƯ DÂN S2.05 VINHOMES:
1. Trà sữa trân châu đường đen - 35.000đ (cốc)
2. Trà xoài macchiato phô mai - 40.000đ (cốc)
3. Trà chanh giã tay Tây Bắc - 25.000đ (cốc)
4. Nem chua rán giòn Phố Cổ - 35.000đ (đĩa 10 cái)
5. Khoai tây lắc phô mai - 30.000đ (hộp)
Hotline Zalo: 0868.499.929. Ship tận phòng Ocean Park 1, 2, 3 trong 15p!`
  },
  {
    name: '⚡ Báo Giá Sửa Điện Nước & Thang Máy',
    category: 'thang-may-sua-nha',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=800&q=80',
    text: `BẢNG BÁO GIÁ DỊCH VỤ KỸ THUẬT CƯ DÂN CHÀ LÀ 6:
- Khảo sát & sửa rò rỉ đường nước ngầm: 150.000đ/lần
- Thay vòi sen, lavabo, bồn cầu cao cấp: 120.000đ/vị trí
- Lắp đặt khóa cửa thông minh vân tay: 250.000đ/bộ
- Bảo trì & kiểm định thang máy gia đình: 350.000đ/lần
- Lắp giàn phơi thông minh, lưới an toàn: 650.000đ/bộ
Thợ cư dân Chà Là 6 - Có mặt 15 phút, bảo hành 12 tháng.`
  },
  {
    name: '✨ Báo Giá Giặt Là & Dọn Dẹp Nhà',
    category: 'dich-vu-gia-dinh-giat-la',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    text: `BẢNG GIÁ TIỆM GIẶT SẤY & DỌN NHÀ ECO VINHOMES:
- Dọn dẹp nhà theo giờ: 70.000đ/giờ (tối thiểu 2 giờ)
- Tổng vệ sinh căn hộ sau xây dựng: 15.000đ/m2
- Giặt rèm cửa khử khuẩn UV: 45.000đ/kg
- Giặt sấy quần áo lấy ngay: 20.000đ/kg
- Vệ sinh sofa da/nỉ tại nhà: 250.000đ/bộ
Giao nhận tận sảnh căn hộ miễn phí. Zalo: 0868.499.929`
  },
  {
    name: '✈️ Báo Giá Taxi Tiện Chuyến & Sân Bay',
    category: 'van-chuyen-taxi',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
    text: `BẢNG GIÁ XE TIỆN CHUYẾN CƯ DÂN VINHOMES 24/7:
- Ocean Park đi Sân Bay Nội Bài: 280.000đ (Xe 5 chỗ sạch sẽ)
- Ocean Park đi Sân Bay Nội Bài: 380.000đ (Xe 7 chỗ Xpander)
- Xe tiện chuyến Ocean Park - Hải Phòng / Hạ Long: 450.000đ/ghế
- Chở hàng chuyển đồ xe bán tải nội khu: 150.000đ/chuyến
Tài xế cư dân lịch sự, không hút thuốc, nhận đưa đón học sinh.`
  }
];

export const AiMenuScannerModal: React.FC<AiMenuScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyToServiceForm,
  onApplyToStoreProducts,
  defaultProject = 'ocean-park-2',
  currentUserPhone = '',
  currentUserName = ''
}) => {
  // Input Step States
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'sample'>('upload');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [categoryMode, setCategoryMode] = useState<'auto' | 'manual'>('auto');
  const [manualCategoryId, setManualCategoryId] = useState<string>('am-thuc-com-cu-dan');
  const [userNotes, setUserNotes] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<ProjectCategory>(defaultProject);

  // Processing & Review States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepMessage, setScanStepMessage] = useState<string>('');
  const [scanResult, setScanResult] = useState<AiMenuScanResult | null>(null);
  const [isEditingResult, setIsEditingResult] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh không được vượt quá 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setImageBase64(resultStr);
      setImagePreviewUrl(resultStr);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  // Select Sample Template
  const handleSelectSample = (sample: typeof SAMPLE_TEMPLATES[0]) => {
    setRawText(sample.text);
    setImagePreviewUrl(sample.image);
    setImageBase64(sample.image);
    setManualCategoryId(sample.category);
    setActiveTab('text');
  };

  // Clear Image
  const handleClearImage = () => {
    setImageBase64('');
    setImagePreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Execute AI Scan
  const handleStartScan = async () => {
    if (!imageBase64 && !rawText.trim()) {
      setErrorMessage('Vui lòng tải lên ảnh menu/báo giá hoặc dán nội dung văn bản để AI quét.');
      return;
    }

    setIsScanning(true);
    setErrorMessage('');
    setScanStepMessage('Đang khởi động Gemini AI Vision & OCR...');

    const stepTimer1 = setTimeout(() => {
      setScanStepMessage('Đang nhận diện món, bảng giá và phân loại ngành hàng...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setScanStepMessage('Đang tự động biên soạn bài đăng bán dịch vụ hấp dẫn...');
    }, 2500);

    try {
      const response = await fetch('/api/ai/scan-menu-pricelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64.startsWith('data:image') ? imageBase64 : undefined,
          rawText: rawText.trim() || undefined,
          manualCategory: categoryMode === 'manual' ? manualCategoryId : 'auto',
          userNotes: userNotes.trim() || undefined,
          project: selectedProject
        })
      });

      const resJson = await response.json();
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (resJson.success && resJson.data) {
        const data = resJson.data as AiMenuScanResult;
        
        // Enrich with user phone / name if missing
        if (!data.providerPhone && currentUserPhone) data.providerPhone = currentUserPhone;
        if (!data.providerZalo && currentUserPhone) data.providerZalo = currentUserPhone;
        if (!data.providerName && currentUserName) data.providerName = currentUserName;
        if (!data.project) data.project = selectedProject;

        setScanResult(data);
      } else {
        throw new Error(resJson.error || 'Không thể trích xuất dữ liệu từ menu.');
      }
    } catch (err: any) {
      console.error('Scan Menu Error:', err);
      setErrorMessage('Lỗi khi AI quét dữ liệu: ' + (err.message || 'Vui lòng thử lại.'));
    } finally {
      setIsScanning(false);
    }
  };

  // Add Item to Scanned Menu List
  const handleAddMenuItem = () => {
    if (!scanResult) return;
    const newItem: ScannedMenuItem = {
      id: `item-${Date.now()}`,
      name: 'Món / Hạng mục mới',
      price: 50000,
      priceDisplay: '50.000đ',
      unit: 'suất',
      category: 'Khác',
      description: ''
    };
    setScanResult({
      ...scanResult,
      menuItems: [...scanResult.menuItems, newItem]
    });
  };

  // Update item field
  const handleUpdateMenuItem = (id: string, field: keyof ScannedMenuItem, val: any) => {
    if (!scanResult) return;
    const updated = scanResult.menuItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: val };
        if (field === 'price') {
          const num = parseInt(val, 10) || 0;
          updatedItem.price = num;
          updatedItem.priceDisplay = `${num.toLocaleString('vi-VN')}đ`;
        }
        return updatedItem;
      }
      return item;
    });
    setScanResult({
      ...scanResult,
      menuItems: updated
    });
  };

  // Remove item
  const handleRemoveMenuItem = (id: string) => {
    if (!scanResult) return;
    setScanResult({
      ...scanResult,
      menuItems: scanResult.menuItems.filter(i => i.id !== id)
    });
  };

  // Handle Apply to Resident Post Form
  const handleApplyToServiceForm = () => {
    if (!scanResult) return;
    onApplyToServiceForm(scanResult, imagePreviewUrl || imageBase64);
    onClose();
  };

  // Handle Apply to Store Products
  const handleApplyToStore = () => {
    if (!scanResult || !onApplyToStoreProducts) return;
    onApplyToStoreProducts(scanResult.menuItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">AI Quét Menu & Báo Giá Tự Động</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500 text-slate-950 rounded-full">
                  Gemini 3.7 OCR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chụp ảnh menu, báo giá thợ hoặc dán bảng hàng — AI tự bóc tách dữ liệu & viết sẵn bài đăng bán dịch vụ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!scanResult ? (
            /* STEP 1: SCANNER INPUTS */
            <div className="space-y-5">
              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium transition-all ${
                    activeTab === 'upload'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Tải ảnh / Chụp Menu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium transition-all ${
                    activeTab === 'text'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Dán Bảng Giá / Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sample')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium transition-all ${
                    activeTab === 'sample'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Mẫu Thử Nhanh</span>
                </button>
              </div>

              {/* TAB 1: UPLOAD / CAMERA */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                      imagePreviewUrl
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : 'border-slate-700 hover:border-amber-400 hover:bg-slate-800/40 bg-slate-950/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {imagePreviewUrl ? (
                      <div className="relative inline-block group">
                        <img loading="lazy"
                          src={imagePreviewUrl}
                          alt="Menu Preview"
                          className="max-h-60 max-w-full rounded-xl object-contain shadow-lg border border-slate-700 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearImage();
                          }}
                          className="absolute -top-2 -right-2 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-500 shadow-md transition-transform transform group-hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="mt-2 text-xs text-amber-400 font-medium">Nhấp vào ảnh để chọn ảnh khác</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                          <Upload className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">
                            Nhấp để tải lên hoặc chụp ảnh trực tiếp
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Hỗ trợ Menu quán ăn, Bảng giá sửa chữa điện nước, Tờ rơi dịch vụ, Báo giá giặt là, Bảng hàng...
                          </p>
                        </div>
                        <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-full">
                          JPG, PNG, WEBP (Tối đa 15MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PASTE TEXT */}
              {activeTab === 'text' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Dán nội dung danh sách món / bảng giá dịch vụ từ Zalo hoặc tin nhắn:
                  </label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={6}
                    placeholder={`Ví dụ:\n1. Sửa điều hòa không lạnh: 150.000đ\n2. Bơm gas điều hòa R32: 250.000đ\n3. Vệ sinh bảo dưỡng máy lạnh: 100.000đ\nHotline: 0868.499.929`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* TAB 3: SAMPLE TEMPLATES */}
              {activeTab === 'sample' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Chọn 1 mẫu thử dưới đây để trải nghiệm tốc độ quét của AI:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SAMPLE_TEMPLATES.map((sample, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSample(sample)}
                        className="p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all flex items-start gap-3 group"
                      >
                        <img loading="lazy"
                          src={sample.image}
                          alt={sample.name}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                            {sample.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                            {sample.text}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 mt-1 font-medium">
                            Chọn mẫu này <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONFIGURATION ROW: CATEGORY & VINHOMES PROJECT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                
                {/* Industry Classification Option */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cơ Chế Phân Loại Ngành Hàng:</span>
                  </label>
                  
                  <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="catMode"
                        checked={categoryMode === 'auto'}
                        onChange={() => setCategoryMode('auto')}
                        className="text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span className="font-semibold text-amber-400">🤖 Tự động bằng AI</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="catMode"
                        checked={categoryMode === 'manual'}
                        onChange={() => setCategoryMode('manual')}
                        className="text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span>🛠️ Chọn thủ công</span>
                    </label>
                  </div>

                  {categoryMode === 'manual' ? (
                    <select
                      value={manualCategoryId}
                      onChange={(e) => setManualCategoryId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {RESIDENT_SERVICE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      AI sẽ tự động đọc món ăn/dịch vụ trong bảng giá để phân loại chính xác vào Cây Danh Mục Chợ Cư Dân.
                    </p>
                  )}
                </div>

                {/* Target Project Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Khu Đô Thị Vinhomes Phục Vụ:</span>
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value as ProjectCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {VIN_MAJOR_PROJECTS.map(proj => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name} ({proj.location})
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Extra User Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Ghi chú bổ sung cho AI (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Ví dụ: Tôi ở phân khu San Hô OCP2, miễn phí ship từ 2 món, nhận sửa chữa 24/7..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Scan Trigger Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartScan}
                  disabled={isScanning || (!imageBase64 && !rawText.trim())}
                  className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isScanning || (!imageBase64 && !rawText.trim())
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 hover:shadow-amber-500/20 active:scale-[0.99]'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{scanStepMessage || 'Đang quét menu & biên soạn...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>🚀 AI Quét Menu & Biên Soạn Bài Đăng (1 Click)</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            /* STEP 2: REVIEW EXTRACTED DATA & AUTO-GENERATED POST */
            <div className="space-y-6">
              
              {/* Success Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">
                      🎉 AI Đã Quét & Bóc Tách Thành Công {scanResult.menuItems?.length || 0} Hạng Mục!
                    </h4>
                    <p className="text-xs text-emerald-400/80">
                      Ngành hàng: <b>{scanResult.categoryName}</b> • Độ chuẩn xác: <b>{scanResult.confidenceScore || 98}%</b>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingResult(!isEditingResult)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isEditingResult ? 'Khóa chỉnh sửa' : 'Chỉnh sửa nhanh'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanResult(null)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs rounded-lg transition-colors"
                  >
                    Quét lại
                  </button>
                </div>
              </div>

              {/* Key Service Metadata Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Tiêu Đề Bài Đăng Dịch Vụ:
                  </label>
                  {isEditingResult ? (
                    <input
                      type="text"
                      value={scanResult.title}
                      onChange={(e) => setScanResult({ ...scanResult, title: e.target.value })}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-sm font-bold text-white focus:outline-none"
                    />
                  ) : (
                    <p className="text-base font-bold text-white tracking-tight">
                      {scanResult.title}
                    </p>
                  )}
                </div>

                {/* Category & Price Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Ngành hàng (Danh mục):</span>
                    {isEditingResult ? (
                      <select
                        value={scanResult.categoryId}
                        onChange={(e) => {
                          const cId = e.target.value;
                          const found = RESIDENT_SERVICE_CATEGORIES.find(c => c.id === cId);
                          setScanResult({
                            ...scanResult,
                            categoryId: cId,
                            categoryName: found ? found.name : scanResult.categoryName,
                            subCategory: found?.subCategories[0] || scanResult.subCategory
                          });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-400 mt-1"
                      >
                        {RESIDENT_SERVICE_CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 mt-0.5">
                        <Tag className="w-3.5 h-3.5" />
                        {scanResult.categoryName}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Phân loại chi tiết:</span>
                    <span className="text-xs font-medium text-slate-200 mt-0.5 block truncate">
                      {scanResult.subCategory}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Mức giá hiển thị:</span>
                    {isEditingResult ? (
                      <input
                        type="text"
                        value={scanResult.priceDisplay}
                        onChange={(e) => setScanResult({ ...scanResult, priceDisplay: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-emerald-400 mt-1"
                      />
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                        {scanResult.priceDisplay}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact & Location Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Hotline/Zalo: <b>{scanResult.providerPhone || scanResult.providerZalo || '0868.499.929'}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Khu vực: <b>{scanResult.address || 'Đại đô thị Vinhomes Ocean Park'}</b></span>
                  </div>
                </div>

              </div>

              {/* Scanned Menu / Price List Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-amber-400" />
                    <span>Bảng Thực Đơn / Báo Giá Chi Tiết ({scanResult.menuItems?.length || 0} món):</span>
                  </h4>
                  {isEditingResult && (
                    <button
                      type="button"
                      onClick={handleAddMenuItem}
                      className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm món/dịch vụ</span>
                    </button>
                  )}
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <div className="overflow-x-auto max-h-60 custom-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Tên món / Hạng mục dịch vụ</th>
                          <th className="py-2.5 px-3">Đơn vị</th>
                          <th className="py-2.5 px-3">Đơn giá (VNĐ)</th>
                          <th className="py-2.5 px-3">Ghi chú</th>
                          {isEditingResult && <th className="py-2.5 px-3 text-center">Xóa</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {scanResult.menuItems?.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-200">
                              {isEditingResult ? (
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleUpdateMenuItem(item.id, 'name', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                />
                              ) : (
                                item.name
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-400">
                              {isEditingResult ? (
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={(e) => handleUpdateMenuItem(item.id, 'unit', e.target.value)}
                                  className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                />
                              ) : (
                                item.unit
                              )}
                            </td>
                            <td className="py-2 px-3 font-bold text-emerald-400">
                              {isEditingResult ? (
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => handleUpdateMenuItem(item.id, 'price', e.target.value)}
                                  className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-bold"
                                />
                              ) : (
                                item.priceDisplay
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-400">
                              {isEditingResult ? (
                                <input
                                  type="text"
                                  value={item.description || ''}
                                  onChange={(e) => handleUpdateMenuItem(item.id, 'description', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
                                />
                              ) : (
                                item.description || '—'
                              )}
                            </td>
                            {isEditingResult && (
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMenuItem(item.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* AI Auto-Generated Marketing Post (Suggested Description) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Bài Viết Mô Tả Gợi Ý Độc Quyền (AI Copywriting):</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Đã tự động định dạng bảng giá & cam kết</span>
                </div>

                <div className="relative">
                  <textarea
                    value={scanResult.suggestedDescription}
                    onChange={(e) => setScanResult({ ...scanResult, suggestedDescription: e.target.value })}
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleApplyToServiceForm}
                  className="flex-1 py-3.5 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>✨ Áp Dụng Vào Form Đăng Bài Dịch Vụ (Điền Tự Động 100%)</span>
                </button>

                {onApplyToStoreProducts && (
                  <button
                    type="button"
                    onClick={handleApplyToStore}
                    className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Store className="w-4 h-4 text-amber-400" />
                    <span>🛍️ Thêm Vào Gian Hàng Quán</span>
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
