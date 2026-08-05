import React, { useState } from 'react';
import { Upload, CheckCircle2, ShieldCheck, Home, Phone, User, Building2, AlertTriangle, Share2, Globe, MessageSquare, Send, Copy, Check, Lock, Sparkles, Image as ImageIcon, Shield } from 'lucide-react';
import { PropertyType, ProjectCategory, PropertyCategory, Language, Property, User as UserType } from '../types';
import { SoDoCensorEditor } from '../components/SoDoCensorEditor';
import { addWatermarkToImage } from '../lib/watermark';

interface PostPropertyPageProps {
  language: Language;
  user?: UserType | null;
  onOpenAuth?: () => void;
  onPropertySubmitted?: () => void;
  existingProperties?: Property[];
}

export const PostPropertyPage: React.FC<PostPropertyPageProps> = ({
  language,
  user,
  onOpenAuth,
  onPropertySubmitted,
  existingProperties = []
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PropertyType>('sale');
  const [project, setProject] = useState<ProjectCategory>('ocean-park-2');
  const [category, setCategory] = useState<PropertyCategory>('shophouse');
  const [subdivision, setSubdivision] = useState('Chà Là');
  const [price, setPrice] = useState('8.5'); // Tỷ hoặc Triệu
  const [area, setArea] = useState('75');
  const [bedrooms, setBedrooms] = useState('4');
  const [bathrooms, setBathrooms] = useState('4');
  const [direction, setDirection] = useState('Đông Nam');
  const [furniture, setFurniture] = useState<'raw' | 'basic' | 'full'>('full');
  const [legal, setLegal] = useState<'red-book' | 'contract' | 'waiting'>('red-book');
  const [address, setAddress] = useState('Phân khu Chà Là, Vinhomes Ocean Park 2');
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('0868.499.929');
  const [sellerRole, setSellerRole] = useState<'owner' | 'sale'>('owner');

  // Images state
  const [imagesList, setImagesList] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
  ]);
  const [newImgInput, setNewImgInput] = useState('');

  // Legal Docs State
  const [soDoImage, setSoDoImage] = useState<string>('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80');
  const [soDoRedactedImage, setSoDoRedactedImage] = useState<string>('');
  const [brokerCertImage, setBrokerCertImage] = useState<string>('');
  const [showSoDoEditor, setShowSoDoEditor] = useState(false);

  // AI Assistant State (Viết bài từ ảnh & tự động điền form)
  const aiFileInputRef = React.useRef<HTMLInputElement>(null);
  const [aiImageBase64, setAiImageBase64] = useState<string>('');
  const [aiImagePreviewUrl, setAiImagePreviewUrl] = useState<string>('');
  const [aiPromptInput, setAiPromptInput] = useState<string>('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const handleAiImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAiImageBase64(base64);
      setAiImagePreviewUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiPostWriter = async () => {
    if (!aiImageBase64 && !aiPromptInput.trim()) {
      alert('Vui lòng chọn 1 hình ảnh hoặc nhập mô tả ngắn để Gemini AI phân tích & viết bài.');
      return;
    }

    setIsAiAnalyzing(true);
    setAiSuccessMessage(null);

    try {
      const res = await fetch('/api/ai/generate-property-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: aiPromptInput,
          imageBase64: aiImageBase64,
          currentType: type
        })
      });

      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        if (d.title) setTitle(d.title);
        if (d.type) setType(d.type as any);
        if (d.project) setProject(d.project as any);
        if (d.category) setCategory(d.category as any);
        if (d.subdivision) setSubdivision(d.subdivision);
        if (d.price) setPrice(d.price);
        if (d.area) setArea(d.area);
        if (d.bedrooms) setBedrooms(d.bedrooms);
        if (d.bathrooms) setBathrooms(d.bathrooms);
        if (d.direction) setDirection(d.direction);
        if (d.furniture) setFurniture(d.furniture as any);
        if (d.legal) setLegal(d.legal as any);
        if (d.address) setAddress(d.address);
        if (d.description) setDescription(d.description);

        if (aiImageBase64) {
          setImagesList(prev => [aiImageBase64, ...prev.filter(i => i !== aiImageBase64)]);
        }

        setAiSuccessMessage('🎉 Gemini AI đã đọc ảnh & tự động soạn thảo bài đăng hoàn chỉnh bên dưới! Quý khách có thể kiểm tra và bấm "ĐĂNG TIN MỚI".');
      } else {
        throw new Error(result.error || 'Lỗi khi Gemini AI tạo bài viết');
      }
    } catch (err: any) {
      alert('Không thể nhờ AI viết bài: ' + err.message);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImgInput) return;
    const watermarked = await addWatermarkToImage(newImgInput);
    setImagesList(prev => [...prev, watermarked]);
    setNewImgInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateWarning(null);

    // Rule Check 0: Must be logged in to post listing
    if (!user) {
      alert('🔒 QUY ĐỊNH HỆ THỐNG: Quý khách không được phép đăng tin khi chưa đăng nhập. Vui lòng đăng nhập hoặc đăng ký tài khoản mới!');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    // Rule Check 1: Sale must upload AT LEAST 3 images
    if (sellerRole === 'sale' && imagesList.length < 3) {
      alert('⚠️ QUY ĐỊNH CHO MÔI GIỚI / SALE: Bắt buộc tải lên ít nhất 3 hình ảnh thực tế của bất động sản!');
      return;
    }

    // Rule Check 2: Owner must upload Sổ Đỏ
    if (sellerRole === 'owner' && !soDoImage) {
      alert('⚠️ QUY ĐỊNH CHỦ NHÀ: Vui lòng tải lên ảnh Sổ Đỏ / Giấy chứng nhận quyền sử dụng đất!');
      return;
    }

    setLoading(true);

    const priceNum = parseFloat(price) || 0;
    const areaNum = parseFloat(area) || 0;

    // Check for Duplicate Listings
    const isDuplicateImage = existingProperties.some(p => p.images && imagesList.some(img => p.images.includes(img)));
    const isDuplicateSpecs = existingProperties.some(p => 
      p.project === project && 
      p.subdivision?.toLowerCase() === subdivision.toLowerCase() && 
      Math.abs(p.area - areaNum) < 0.5 && 
      Math.abs(p.price - priceNum) < 0.1
    );

    if (isDuplicateImage || isDuplicateSpecs) {
      setLoading(false);
      setDuplicateWarning(
        `CẢNH BÁO TRÙNG TIN: ${
          isDuplicateImage 
            ? 'Hình ảnh bất động sản này đã tồn tại trong hệ thống!' 
            : `Thông số căn (Dự án: ${project.toUpperCase()}, Phân khu: ${subdivision}, Diện tích: ${areaNum}m², Giá: ${priceNum}) đã có người đăng!`
        } Vui lòng kiểm tra lại thông tin để đảm bảo tính minh bạch.`
      );
      return;
    }

    const payload = {
      title,
      type,
      project,
      category,
      subdivision,
      price: priceNum,
      priceDisplay: type === 'sale' ? `${priceNum} Tỷ` : `${priceNum} Tr/tháng`,
      area: areaNum,
      bedrooms: parseInt(bedrooms) || 1,
      bathrooms: parseInt(bathrooms) || 1,
      direction,
      furniture,
      legal,
      address,
      description: description || `Bất động sản vị trí đẹp tại ${project.toUpperCase()}, phù hợp để ở hoặc đầu tư kinh doanh.`,
      images: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
      sellerName: sellerName || 'Chủ nhà chính chủ',
      sellerPhone: sellerPhone || '0868.499.929',
      sellerRole,
      soDoImage: sellerRole === 'owner' ? soDoImage : undefined,
      soDoRedactedImage: sellerRole === 'owner' ? (soDoRedactedImage || soDoImage) : undefined,
      approved: false, // Hidden until approved
      approvalStatus: 'pending' // Tin chờ duyệt
    };

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        if (onPropertySubmitted) onPropertySubmitted();
      } else {
        alert(data.error || 'Lỗi khi gửi thông tin đăng tin.');
      }
    } catch (err: any) {
      alert('Không thể kết nối máy chủ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase text-amber-500 tracking-wider">KÊNH KẾT NỐI CHÍNH CHỦ CƯ DÂN VINHOMES</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          ĐĂNG TIN BÁN / CHO THUÊ BẤT ĐỘNG SẢN VINHOMES
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Nền tảng trao đổi thông tin chuyển nhượng, cho thuê và kết nối sản phẩm BĐS trực tiếp của cư dân Vinhomes để bỏ qua rào cản bảo mật với sale. (Hotline/Zalo <b>0868.499.929</b> chuyên trách hỗ trợ cư dân đăng tin & vận hành nền tảng).
        </p>
      </div>

      {submitted ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">ĐĂNG TIN THÀNH CÔNG!</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Hệ thống đã ghi nhận bất động sản của bạn. Ban quản trị Nhà đẹp Vinhomes sẽ xác minh thông tin chính chủ và duyệt hiển thị.
            </p>
          </div>

          {/* Social Share Box */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-center space-x-2 text-amber-500 font-bold text-xs">
              <Share2 className="w-4 h-4" />
              <span>CHIA SẺ NGAY LÊN MẠNG XÃ HỘI ĐỂ TIẾP CẬN KHÁCH HÀNG</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5" /> Facebook
              </a>
              <a
                href="https://zalo.me/"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Zalo
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" /> Telegram
              </a>
              <button
                onClick={handleCopyShareLink}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Đã Chép' : 'Copy Link'}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setSubmitted(false);
              setTitle('');
              setDescription('');
            }}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition shadow"
          >
            Đăng Thêm Căn Khác
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {!user && (
            <div className="p-6 sm:p-8 bg-amber-500/10 border-2 border-amber-500 rounded-3xl text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                🔒
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-amber-100">
                  YÊU CẦU ĐĂNG NHẬP ĐỂ ĐĂNG TIN BĐS
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-amber-200/90 max-w-2xl mx-auto leading-relaxed">
                  Quy định Chợ Cư Dân 24h: <b>Quý khách không được đăng tin khi chưa đăng nhập</b>. Vui lòng đăng nhập hoặc đăng ký tài khoản mới (đã xác thực SĐT OTP & Email OTP) để đăng tin bán / cho thuê BĐS chính chủ.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition transform hover:-translate-y-0.5 uppercase tracking-wider"
                >
                  🔑 ĐĂNG NHẬP / ĐĂNG KÝ XÁC THỰC NGAY
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6 text-xs font-bold text-slate-700 dark:text-slate-300">
          
          {/* AI ASSISTANT CARD: VIẾT BÀI TỪ ẢNH & TỰ ĐỘNG ĐIỀN FORM */}
          <div className="p-5 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border-2 border-emerald-500/50 rounded-2xl text-white space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide text-amber-300 flex items-center gap-1.5">
                    ✨ HỖ TRỢ VIẾT BÀI TỪ ẢNH BẤT ĐỘNG SẢN BẰNG GEMINI AI
                  </h3>
                  <p className="text-[11px] text-emerald-200 font-normal">
                    Tải 1 ảnh nhà/sổ đỏ & nhập câu lệnh ngắn, AI sẽ tự phân tích để soạn bài đăng & tự điền thông số vào form bên dưới.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <input
                type="file"
                ref={aiFileInputRef}
                accept="image/*"
                onChange={handleAiImageSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => aiFileInputRef.current?.click()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition shrink-0"
              >
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>{aiImageBase64 ? '✓ Đã Tải Ảnh (Đổi ảnh khác)' : '📷 Tải Ảnh BĐS Để AI Đọc'}</span>
              </button>

              <input
                type="text"
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                placeholder="Ví dụ: Bán căn Chà Là 80m2 8.5 tỷ 4PN, nội thất cao cấp..."
                className="flex-1 px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
              />

              <button
                type="button"
                onClick={handleRunAiPostWriter}
                disabled={isAiAnalyzing}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition shrink-0"
              >
                <Sparkles className={`w-4 h-4 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAiAnalyzing ? 'AI Đang Viết Bài...' : '✨ AI Đọc Ảnh & Điền Form'}</span>
              </button>
            </div>

            {aiImagePreviewUrl && (
              <div className="flex items-center gap-3 pt-2 border-t border-emerald-800/60">
                <img src={aiImagePreviewUrl} alt="Preview BĐS" className="w-14 h-14 object-cover rounded-xl border border-amber-400" />
                <span className="text-[11px] text-amber-200 font-normal">
                  📷 Đã đính kèm ảnh BĐS. Bấm <strong className="text-white">"AI Đọc Ảnh & Điền Form"</strong> để tạo nội dung bài đăng hoàn chỉnh.
                </span>
              </div>
            )}

            {aiSuccessMessage && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}
          </div>

          {duplicateWarning && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 rounded-2xl flex items-start space-x-3 text-rose-700 dark:text-rose-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div className="space-y-1">
                <span className="font-extrabold text-sm block">KHÔNG THỂ ĐĂNG TIN</span>
                <p className="text-xs leading-relaxed">{duplicateWarning}</p>
              </div>
            </div>
          )}

          {/* Section 1: Basic Classification */}
          <div className="space-y-4 border-b border-slate-100 dark:border-slate-700 pb-6">
            <h3 className="text-sm font-extrabold text-amber-500 uppercase tracking-wider flex items-center">
              <Home className="w-4 h-4 mr-2" />
              1. PHÂN LOẠI BẤT ĐỘNG SẢN (Khách hàng & Sale chỉ đăng tin Bán/Cho thuê)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1">Nhu cầu đăng tin (*)</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-amber-600"
                >
                  <option value="sale">Cần Bán Nhà</option>
                  <option value="rent">Cho Thuê Nhà</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Dự án Vinhomes (*)</label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="ocean-park-2">Vinhomes Ocean Park 2 (The Empire)</option>
                  <option value="ocean-park-3">Vinhomes Ocean Park 3 (Grand Park)</option>
                  <option value="ocean-park-1">Vinhomes Ocean Park 1 (Gia Lâm)</option>
                  <option value="ha-long-xanh">Vinhomes Hạ Long Xanh (Quảng Ninh)</option>
                  <option value="smart-city">Vinhomes Smart City (Tây Mỗ)</option>
                  <option value="royal-island">Vinhomes Royal Island (Vũ Yên)</option>
                  <option value="grand-park">Vinhomes Grand Park (TP. Thủ Đức)</option>
                  <option value="khac">Dự án khác</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Loại căn (*)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="shophouse">Shophouse Thương Mại</option>
                  <option value="biet-thu-song-lap">Biệt Thự Song Lập</option>
                  <option value="biet-thu-don-lap">Biệt Thự Đơn Lập</option>
                  <option value="lien-ke">Nhà Liền Kề</option>
                  <option value="2pn">Căn Hộ 2PN</option>
                  <option value="3pn">Căn Hộ 3PN+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Details & Pricing */}
          <div className="space-y-4 border-b border-slate-100 dark:border-slate-700 pb-6">
            <h3 className="text-sm font-extrabold text-amber-500 uppercase tracking-wider flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              2. CHI TIẾT & MỨC GIÁ
            </h3>

            <div>
              <label className="block mb-1">Tiêu đề tin đăng (*)</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Bán cắt lỗ Shophouse Chà Là 75m2 hoàn thiện full 4 tầng sầm uất"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block mb-1">{type === 'sale' ? 'Mức giá (Tỷ VNĐ)' : 'Giá thuê (Triệu/tháng)'}</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-amber-500"
                />
              </div>

              <div>
                <label className="block mb-1">Diện tích (m²)</label>
                <input
                  type="number"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Số phòng ngủ</label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Hướng nhà</label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Đông Nam">Đông Nam</option>
                  <option value="Đông Bắc">Đông Bắc</option>
                  <option value="Tây Nam">Tây Nam</option>
                  <option value="Tây Bắc">Tây Bắc</option>
                  <option value="Chính Nam">Chính Nam</option>
                  <option value="Chính Bắc">Chính Bắc</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Trạng thái nội thất</label>
                <select
                  value={furniture}
                  onChange={(e) => setFurniture(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="full">Đầy đủ nội thất cao cấp</option>
                  <option value="basic">Nội thất cơ bản CĐT</option>
                  <option value="raw">Bàn giao thô nguyên bản</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Tình trạng pháp lý</label>
                <select
                  value={legal}
                  onChange={(e) => setLegal(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="red-book">Sổ đỏ chính chủ sẵn sàng</option>
                  <option value="contract">Hợp đồng mua bán (HĐMB)</option>
                  <option value="waiting">Đang chờ cấp sổ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1">Mô tả đầy đủ bất động sản</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ghi rõ vị trí phân khu, view đường rộng bao nhiêu mét, tiềm năng kinh doanh hay ở..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-normal"
              />
            </div>
          </div>

          {/* Section 3: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-amber-500 uppercase tracking-wider flex items-center">
              <User className="w-4 h-4 mr-2" />
              3. THÔNG TIN NGƯỜI ĐĂNG TIN
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1">Họ tên chính chủ / Sale (*)</label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Số điện thoại / Zalo (*)</label>
                <input
                  type="tel"
                  required
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="0868.xxx.xxx"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Bạn là chính chủ hay người đăng bán hộ? (*)</label>
                <select
                  value={sellerRole}
                  onChange={(e) => setSellerRole(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-extrabold text-amber-600 dark:text-amber-400"
                >
                  <option value="owner">🏠 Tôi là CHỦ NHÀ chính chủ (Yêu cầu Sổ đỏ / Hợp đồng mua bán)</option>
                  <option value="sale">💼 Tôi ĐĂNG BÁN HỘ / MÔI GIỚI (Yêu cầu Chứng chỉ môi giới / Giấy ủy quyền)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Hình Ảnh Thực Tế & Sổ Đỏ Pháp Lý */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-6">
            <h3 className="text-sm font-extrabold text-amber-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                4. HÌNH ẢNH THỰC TẾ & SỔ ĐỎ PHÁP LÝ
              </span>
              {sellerRole === 'sale' && (
                <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded uppercase">
                  SALE YÊU CẦU TỐI THIỂU 3 ẢNH (*)
                </span>
              )}
            </h3>

            {/* Gallery Images List */}
            <div className="space-y-3">
              <label className="block font-bold">Danh sách hình ảnh bất động sản (Chọn file từ PC hoặc dán link URL)</label>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>📁 CHỌN ẢNH TỪ MÁY TÍNH (PC)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(async file => {
                        const watermarked = await addWatermarkToImage(file);
                        setImagesList(prev => [...prev, watermarked]);
                      });
                    }}
                  />
                </label>

                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Hoặc dán link ảnh Web (https://...)"
                    value={newImgInput}
                    onChange={e => setNewImgInput(e.target.value)}
                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shrink-0"
                  >
                    + Thêm Link
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {imagesList.map((img, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-black">
                    <img src={img} alt={`Img ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 text-[9px] bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                      Ảnh #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Rules: Owner vs Sale Censor Permissions */}
            {sellerRole === 'owner' ? (
              <div className="p-5 bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500 text-slate-950 font-black rounded-xl shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-xs">
                      QUY ĐỊNH CHỦ NHÀ: TẢI ẢNH & SỔ ĐỎ NGUYÊN BẢN GỐC (KHÔNG CHE)
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      Chủ nhà gửi trực tiếp <strong>ảnh Sổ Đỏ / Giấy tờ chính chủ nguyên bản gốc (chưa che)</strong>. Ban Quản Trị (Admin) sẽ tiếp nhận để kiểm tra, đối chiếu chính chủ và vị trí căn nhà. Sau khi xác minh, Admin sẽ chủ động <strong>che mờ thông tin vị trí & số sổ nhạy cảm</strong> trước khi phê duyệt công khai.
                    </p>
                  </div>
                </div>

                {/* Owner Sổ Đỏ Upload Input */}
                <div className="pt-2 border-t border-amber-500/20 space-y-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    Ảnh Sổ Đỏ / Hợp Đồng Mua Bán Nguyên Bản (Admin bảo mật tuyệt đối):
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>📁 CHỌN SỔ ĐỎ TỪ PC</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const watermarked = await addWatermarkToImage(file);
                            setSoDoImage(watermarked);
                            setSoDoRedactedImage(watermarked);
                          }
                        }}
                      />
                    </label>

                    <input
                      type="url"
                      placeholder="Hoặc dán link ảnh Sổ Đỏ gốc (https://...)"
                      value={soDoImage}
                      onChange={(e) => {
                        setSoDoImage(e.target.value);
                        setSoDoRedactedImage(e.target.value);
                      }}
                      className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-amber-500/30 rounded-xl font-mono text-[11px] text-slate-900 dark:text-white"
                    />
                  </div>
                  {soDoImage && (
                    <div className="w-36 h-24 rounded-xl overflow-hidden border border-amber-500/40 shadow-sm mt-1">
                      <img src={soDoImage} alt="Sổ đỏ gốc" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SALE / BROKER DOCUMENT & CENSOR PERMISSIONS */
              <div className="p-5 bg-teal-500/10 border-2 border-teal-500/40 rounded-3xl space-y-4 text-xs">
                <div className="space-y-2 border-b border-teal-500/20 pb-3">
                  <h4 className="font-extrabold text-teal-700 dark:text-teal-300 uppercase tracking-wider text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    XÁC MINH MÔI GIỚI: TẢI CHỨNG CHỈ HÀNH NGHỀ / GIẤY ỦY QUYỀN BÁN HỘ
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Môi giới bán hộ cần tải lên <strong>Chứng chỉ hành nghề BĐS</strong> hoặc <strong>Giấy ủy quyền / Thỏa thuận môi giới</strong> từ Chủ nhà để được xác minh uy tín.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>📁 CHỌN GIẤY TỜ TỪ PC</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const watermarked = await addWatermarkToImage(file);
                            setBrokerCertImage(watermarked);
                          }
                        }}
                      />
                    </label>

                    <input
                      type="url"
                      placeholder="Hoặc dán link ảnh Chứng chỉ hành nghề (https://...)"
                      value={brokerCertImage}
                      onChange={(e) => setBrokerCertImage(e.target.value)}
                      className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-teal-500/30 rounded-xl font-mono text-[11px] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-600 text-white font-black rounded-xl shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-teal-700 dark:text-teal-300 uppercase tracking-wider text-xs">
                        QUYỀN CHO SALE / MÔI GIỚI: CÔNG CỤ CHE MỜ VỊ TRÍ & SỔ ĐỎ
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                        Môi giới có quyền trực tiếp bôi đen hoặc làm mờ vị trí căn, số nhà, thông tin cá nhân trên ảnh / Sổ đỏ trước khi gửi duyệt.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSoDoEditor(true)}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>MỞ CÔNG CỤ CHE MỜ VỊ TRÍ & SỔ ĐỎ</span>
                  </button>
                </div>

                {/* Sổ Đỏ / Image Preview for Sale */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">Ảnh Gốc Chưa Che:</span>
                    <img src={soDoImage} alt="Gốc" className="w-full h-24 object-cover rounded-xl border border-slate-300 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold block">Ảnh Đã Che Mờ (Công khai):</span>
                    <img src={soDoRedactedImage || soDoImage} alt="Đã Che" className="w-full h-24 object-cover rounded-xl border-2 border-teal-500/60" />
                  </div>
                </div>

                {showSoDoEditor && (
                  <div className="pt-2">
                    <SoDoCensorEditor
                      originalImageUrl={soDoImage}
                      onSaveRedacted={(dataUrl) => {
                        setSoDoRedactedImage(dataUrl);
                        setShowSoDoEditor(false);
                        alert('Đã lưu ảnh đã bôi đen / che mờ vị trí thành công!');
                      }}
                      onCancel={() => setShowSoDoEditor(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-xl"
          >
            {loading ? 'Đang gửi thông tin...' : 'GỬI ĐĂNG TIN BẤT ĐỘNG SẢN (CHỜ DUYỆT)'}
          </button>

        </form>
        </div>
      )}

    </div>
  );
};
