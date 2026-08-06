import React, { useState, useMemo } from 'react';
import { 
  Wrench, ShieldCheck, Phone, MessageSquare, MapPin, Search, PlusCircle, 
  Sparkles, Star, CheckCircle2, CheckCircle, ChevronRight, ChevronDown, AlertTriangle, ArrowUpRight, 
  Building2, ExternalLink, X, Info, Car, Utensils, Cpu, HeartHandshake, 
  GraduationCap, Hotel, Dog, ShoppingBag, ArrowUpRightSquare, Home, FileText, User,
  Award, ShieldAlert, Clock, FileCheck, Upload, Grid2x2, Grid3x3, List, LayoutGrid,
  Compass, Navigation
} from 'lucide-react';
import { ProjectCategory, User as UserType, UserStorefront } from '../types';
import { 
  RESIDENT_SERVICE_CATEGORIES, 
  VIN_MAJOR_PROJECTS, 
  ResidentServiceItem,
  ResidentServiceCategory,
  DEFAULT_INDUSTRY_KYC_RULES
} from '../data/residentServicesData';
import { INITIAL_USER_STOREFRONTS } from '../data/residentStoresData';
import { UserStorefrontModal } from './UserStorefrontModal';
import { StoreLocatorMapModal } from './StoreLocatorMapModal';
import { ServicePricingModal } from './ServicePricingModal';
import { AllStorefrontsDirectoryModal } from './AllStorefrontsDirectoryModal';
import { TripartiteAgreementModal } from './TripartiteAgreementModal';

interface ResidentServicesPageProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  initialProject?: ProjectCategory | 'all';
}

export const ResidentServicesPage: React.FC<ResidentServicesPageProps> = ({
  currentUser,
  onOpenAuth,
  initialProject = 'all'
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectCategory | 'all'>(initialProject);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);
  const [projectSearchTerm, setProjectSearchTerm] = useState<string>('');

  const filteredProjectsList = useMemo(() => {
    if (!projectSearchTerm.trim()) return VIN_MAJOR_PROJECTS;
    const term = projectSearchTerm.toLowerCase().trim();
    return VIN_MAJOR_PROJECTS.filter(p => p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term));
  }, [projectSearchTerm]);
  const [showLegalDisclaimer, setShowLegalDisclaimer] = useState<boolean>(false);
  const [selectedServiceModal, setSelectedServiceModal] = useState<ResidentServiceItem | null>(null);
  const [selectedStoreModal, setSelectedStoreModal] = useState<UserStorefront | null>(null);
  const [isPostingModalOpen, setIsPostingModalOpen] = useState<boolean>(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [isAllStoresDirectoryOpen, setIsAllStoresDirectoryOpen] = useState<boolean>(false);
  const [isTripartiteModalOpen, setIsTripartiteModalOpen] = useState<boolean>(false);
  const [stores, setStores] = useState<UserStorefront[]>(INITIAL_USER_STOREFRONTS);

  // Reputation PR posts state for resident partners & stores
  const [reputationPosts, setReputationPosts] = useState<any[]>([
    {
      id: 'rep-1',
      partnerName: 'Bún Chả Hà Nội Cụ Bà S2.12',
      partnerCategory: 'Quán Ăn & Nhà Hàng',
      project: 'vinhomes-ocean-park-1',
      authorName: 'Nguyễn Thị Minh Anh',
      authorRoom: 'S2.12 - Căn 1806',
      title: 'Review chân thực: Bún chả ngon đúng vị phố cổ, giao siêu nhanh 10 phút!',
      content: 'Nhà mình ăn bún chả ở đây từ ngày mới về S2.12. Thịt nướng than hoa thơm lừng, nước chấm ấm nóng vừa miệng. Đặc biệt chị chủ nhà cư dân siêu dễ thương, ship tận cửa không tính phí. Mọi người nên thử nem hải sản ở đây!',
      rating: 5,
      images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80'],
      createdAt: '10 phút trước',
      likesCount: 42,
      trustBadge: 'top_rated',
      zaloContact: 'https://zalo.me/0988123456',
      phoneContact: '0988.123.456'
    },
    {
      id: 'rep-2',
      partnerName: 'Sửa Chữa Điện Nước Anh Đức Cư Dân',
      partnerCategory: 'Sửa Chữa Gia Đình',
      project: 'vinhomes-ocean-park-2',
      authorName: 'Trần Quốc Tuấn',
      authorRoom: 'Chà Là 6 - Căn 22',
      title: 'Cảm ơn anh Đức đã cứu nguy sự cố chập điện lúc 11h đêm!',
      content: 'Hôm qua nhà mình bị nhảy aptomat lúc đêm muộn. Gọi anh Đức 5 phút sau anh qua ngay, mang đầy đủ thiết bị đo đạc báo giá minh bạch chỉ 150k. Đúng chất cư dân giúp đỡ nhau, làm việc có tâm!',
      rating: 5,
      images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'],
      createdAt: '2 giờ trước',
      likesCount: 89,
      trustBadge: 'gold_partner',
      zaloContact: 'https://zalo.me/0977888999',
      phoneContact: '0977.888.999'
    }
  ]);
  const [isPRModalOpen, setIsPRModalOpen] = useState<boolean>(false);
  const [selectedPRArticle, setSelectedPRArticle] = useState<any | null>(null);
  const [newPRForm, setNewPRForm] = useState({
    partnerName: '',
    partnerCategory: 'Quán Ăn & Nhà Hàng',
    project: 'vinhomes-ocean-park-1',
    authorName: '',
    authorRoom: '',
    title: '',
    content: '',
    rating: 5,
    imageUrl: '',
    youtubeUrl: '',
    phoneContact: '',
    zaloContact: ''
  });

  // Mobile & Desktop Layout view mode: 'grid-2col' | 'card-1col' | 'list-row' | 'grid-3col'
  const [viewMode, setViewMode] = useState<'grid-2col' | 'card-1col' | 'list-row' | 'grid-3col'>(() => {
    const savedMode = localStorage.getItem('hb_resident_services_view_mode');
    return (savedMode as any) || 'grid-2col';
  });

  // Local State for Services (loaded from server or initial data)
  const [services, setServices] = useState<ResidentServiceItem[]>(() => {
    const saved = localStorage.getItem('hb_resident_services');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Fetch services, stores and reputation posts from server API on mount
  React.useEffect(() => {
    fetch('/api/resident-services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          localStorage.setItem('hb_resident_services', JSON.stringify(data));
        }
      })
      .catch(err => console.warn('Using local fallback for resident services:', err));

    fetch('/api/stores')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStores(data);
        }
      })
      .catch(err => console.warn('Using mock stores:', err));

    fetch('/api/reputation-posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReputationPosts(data);
        }
      })
      .catch(err => console.warn('Using default reputation posts:', err));
  }, []);

  // Post new service form state
  const [postForm, setPostForm] = useState({
    title: '',
    categoryId: 'thang-may-sua-nha',
    subCategory: 'Lắp đặt & Bảo trì Thang máy gia đình',
    project: 'ocean-park-2' as ProjectCategory,
    subdivision: '',
    providerName: currentUser?.name || '',
    providerPhone: currentUser?.phone || '',
    providerZalo: '',
    address: '',
    priceDisplay: 'Khảo sát báo giá trực tiếp',
    imagesText: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=800&q=80',
    description: '',
    legalCommitmentAccepted: false,
    // KYC Additions
    applyKycNow: true,
    businessLicenseNo: '',
    taxCode: '',
    docNameInput: '',
    docUrlInput: ''
  });

  // Active Industry Rule for chosen Category
  const activePostCategoryObj = RESIDENT_SERVICE_CATEGORIES.find(c => c.id === postForm.categoryId);
  const activeIndustryKycRule = DEFAULT_INDUSTRY_KYC_RULES.find(r => r.categoryId === postForm.categoryId);

  // Filtered Services list
  const filteredServices = useMemo(() => {
    return services.filter(item => {
      if (selectedProject !== 'all' && item.project !== selectedProject) return false;
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
      if (selectedSubCategory !== 'all' && item.subCategory !== selectedSubCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchProvider = item.providerName.toLowerCase().includes(q);
        const matchSubdiv = (item.subdivision || '').toLowerCase().includes(q);
        const matchCategory = item.subCategory.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        return matchTitle || matchProvider || matchSubdiv || matchCategory || matchDesc;
      }
      return true;
    });
  }, [services, selectedProject, selectedCategory, selectedSubCategory, searchQuery]);

  // Submit Post Service Handler
  const handlePostServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.legalCommitmentAccepted) {
      alert('Bạn vui lòng tích chọn cam kết tự chịu 100% trách nhiệm trước pháp luật và cư dân.');
      return;
    }
    if (!postForm.title || !postForm.providerPhone || !postForm.address) {
      alert('Vui lòng điền đầy đủ tiêu đề, số điện thoại và địa chỉ phục vụ.');
      return;
    }

    const images = postForm.imagesText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.startsWith('http'));

    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80');
    }

    // Build submitted docs if provided
    const submittedDocs = [];
    if (postForm.applyKycNow && activeIndustryKycRule) {
      submittedDocs.push({
        id: `doc-${Date.now()}-1`,
        docType: activeIndustryKycRule.requiredDocTypes[0] || 'Giấy phép hành nghề',
        docName: postForm.docNameInput || 'GiayPhep_Scan.pdf',
        fileUrl: postForm.docUrlInput || images[0],
        status: 'pending' as const,
        uploadedAt: new Date().toISOString().split('T')[0]
      });
    }

    const newService: ResidentServiceItem = {
      id: `srv-${Date.now()}`,
      title: postForm.title,
      categoryId: postForm.categoryId,
      subCategory: postForm.subCategory,
      project: postForm.project,
      subdivision: postForm.subdivision || 'Nội Khu Dự Án',
      providerName: postForm.providerName || 'Thợ Cư Dân Vin',
      providerPhone: postForm.providerPhone,
      providerZalo: postForm.providerZalo || `https://zalo.me/${postForm.providerPhone.replace(/\D/g, '')}`,
      address: postForm.address,
      priceDisplay: postForm.priceDisplay || 'Thỏa thuận',
      rating: 5.0,
      reviewCount: 1,
      images,
      description: postForm.description || 'Dịch vụ cư dân uy tín, cam kết chất lượng chuẩn phong cách Vinhomes.',
      verified: false,
      legalCommitmentAccepted: true,
      createdAt: new Date().toISOString().split('T')[0],
      kycStatus: postForm.applyKycNow ? 'pending' : 'unverified',
      kycBadgeType: 'none',
      businessLicenseNo: postForm.businessLicenseNo,
      taxCode: postForm.taxCode,
      submittedDocs: submittedDocs.length > 0 ? submittedDocs : undefined,
      kycAppliedAt: postForm.applyKycNow ? new Date().toISOString().split('T')[0] : undefined
    };

    try {
      const res = await fetch('/api/resident-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      const data = await res.json();
      if (data && data.item) {
        setServices(prev => [data.item, ...prev]);
      } else {
        setServices(prev => [newService, ...prev]);
      }
    } catch (err) {
      setServices(prev => [newService, ...prev]);
    }

    // Save local cache
    const updated = [newService, ...services];
    localStorage.setItem('hb_resident_services', JSON.stringify(updated));

    alert('🚀 Đăng bài dịch vụ & gửi hồ sơ Định Danh Nút Xanh KYC thành công! Ban Quản Trị sẽ kiểm duyệt chứng chỉ ngành nghề trong vòng 24h.');
    setIsPostingModalOpen(false);
  };

  const selectedCategoryObj = useMemo(() => {
    return RESIDENT_SERVICE_CATEGORIES.find(c => c.id === selectedCategory);
  }, [selectedCategory]);

  // Helper function to render Category Icon dynamically
  const renderCategoryIcon = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName) {
      case 'ArrowUpRightSquare': return <ArrowUpRightSquare className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Car': return <Car className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Utensils': return <Utensils className={className} />;
      case 'HeartHandshake': return <HeartHandshake className={className} />;
      case 'Hotel': return <Hotel className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Dog': return <Dog className={className} />;
      case 'ShoppingBag': return <ShoppingBag className={className} />;
      default: return <Wrench className={className} />;
    }
  };

  // Helper function to extract and convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      
      {/* 1. HERO BANNER & HEADER SECTION */}
      <section className="bg-slate-900 text-white relative overflow-hidden pt-6 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold mb-2 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>NỀN TẢNG THƯƠNG MẠI & CỬA HÀNG ĐÃ XÁC MINH CƯ DÂN VINHOMES</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                CHỢ DỊCH VỤ & THỢ CƯ DÂN <span className="text-emerald-400">VINHOMES</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Lắp thang máy, sửa điện máy tính, taxi 24/7, ẩm thực ATVSTP, y tế gia đình & spa — Cửa hàng đã xác minh chính chủ & đã qua kiểm duyệt chứng chỉ ngành nghề!
              </p>
            </div>

            {/* Action Buttons - Bản đồ định vị + Bảng giá + Quản lý gian hàng & định danh */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                <span>💎 BẢNG GIÁ QUẢNG BÁ</span>
              </button>

              <button
                onClick={() => setIsTripartiteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 shadow-md transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>📜 THỎA THUẬN BA BÊN</span>
              </button>

              <button
                onClick={() => setIsMapModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-slate-950" />
                <span>📍 BẢN ĐỒ ĐỊNH VỊ</span>
              </button>

              <button
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuth();
                  } else {
                    window.location.hash = '#user-dashboard';
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>+ XÁC MINH CỬA HÀNG</span>
              </button>
            </div>
          </div>

          {/* Combined Search Box & Project Dropdown Selector */}
          <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              
              {/* Project Selector Dropdown Button & Popover */}
              <div className="relative w-full sm:w-72 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-black border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">
                      {selectedProject === 'all'
                        ? '🏢 Tất Cả Dự Án Vinhomes'
                        : VIN_MAJOR_PROJECTS.find(p => p.id === selectedProject)?.name || 'Chọn Dự Án'}
                    </span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Sổ Ra */}
                {isProjectDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 sm:w-72 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
                      <span>CHỌN DỰ ÁN VINHOMES</span>
                      <button onClick={() => setIsProjectDropdownOpen(false)} className="text-slate-400 hover:text-slate-200 p-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Filter Input Inside Popover */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={projectSearchTerm}
                        onChange={(e) => setProjectSearchTerm(e.target.value)}
                        placeholder="Gõ tên dự án..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700 font-bold"
                        autoFocus
                      />
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { name: 'Ocean Park 1', id: 'ocean-park-1' },
                        { name: 'Ocean Park 2', id: 'ocean-park-2' },
                        { name: 'Ocean Park 3', id: 'ocean-park-3' },
                        { name: 'Smart City', id: 'smart-city' },
                        { name: 'Grand Park', id: 'grand-park' },
                        { name: 'Riverside', id: 'riverside' }
                      ].map(chip => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => {
                            setSelectedProject(chip.id as ProjectCategory);
                            setIsProjectDropdownOpen(false);
                            setProjectSearchTerm('');
                          }}
                          className={`px-2 py-0.5 font-bold text-[10px] rounded-lg border transition cursor-pointer ${
                            selectedProject === chip.id
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {chip.name}
                        </button>
                      ))}
                    </div>

                    {/* Options List */}
                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      <button
                        onClick={() => {
                          setSelectedProject('all');
                          setIsProjectDropdownOpen(false);
                          setProjectSearchTerm('');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                          selectedProject === 'all'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-400" />
                          <span>🏢 Tất Cả Dự Án Vinhomes (Toàn Quốc)</span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-black">
                          {services.length} Dịch Vụ
                        </span>
                      </button>

                      {filteredProjectsList.map(proj => {
                        const count = services.filter(s => s.project === proj.id).length;
                        const isSelected = selectedProject === proj.id;
                        return (
                          <button
                            key={proj.id}
                            onClick={() => {
                              setSelectedProject(proj.id);
                              setIsProjectDropdownOpen(false);
                              setProjectSearchTerm('');
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition flex flex-col gap-1 cursor-pointer border ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                                : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="flex items-center gap-1.5 font-extrabold truncate">
                                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-300' : 'text-emerald-500'}`} />
                                <span className="truncate">{proj.name}</span>
                              </span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {count} dịch vụ
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] opacity-80 pl-5">
                              <span>📍 {proj.location}</span>
                              <span className={`px-1.5 py-0.2 rounded ${isSelected ? 'bg-amber-400/30 text-amber-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                {proj.tag}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Service & Store Search Input */}
              <div className="relative flex-1 w-full space-y-1.5">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-black" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm dịch vụ, món ăn, thợ cư dân (VD: Bún chả, Thang máy, Taxi, Spa...)"
                    className="w-full pl-9 pr-20 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700 shadow-inner"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  ) : (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 pointer-events-none hidden sm:inline-block">
                      ⚡ AI Search
                    </span>
                  )}
                </div>

                {/* Hot Service Suggestion Tags */}
                <div className="flex flex-wrap items-center justify-between gap-1 px-1">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1">
                      🔥 Gợi Ý:
                    </span>
                    {[
                      'Cơm Cư Dân',
                      'Bún Chả',
                      'Giặt Là',
                      'Thang Máy',
                      'Taxi 24/7',
                      'Cắt Tóc',
                      'Spa'
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSearchQuery(searchQuery === tag ? '' : tag)}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                          searchQuery === tag
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {(searchQuery || selectedProject !== 'all' || selectedCategory !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedProject('all');
                        setSelectedCategory('all');
                        setSelectedSubCategory('all');
                      }}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30 transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <X className="w-3 h-3" />
                      <span>Xóa bộ lọc</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN PAGE LAYOUT: LEFT CONTENT (SERVICES & MERCHANTS - lg:col-span-8) + RIGHT SIDEBAR (PR BULLETIN & NEWS FEED - lg:col-span-4) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ==================== LEFT COLUMN: CATEGORIES & RESIDENT SERVICES / STOREFRONTS (HIỂN THỊ BÊN TRÁI - 8 CỘT) ==================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Prominent Storefront Directory Banner */}
          <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl border border-purple-500/30 shadow-xl space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShoppingBag className="w-48 h-48 text-purple-300" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="space-y-1">
                <span className="px-3 py-1 bg-purple-500/30 border border-purple-400/40 text-purple-200 text-[10px] font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> CHỢ CƯ DÂN VINHOMES 24H
                </span>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  🏪 Gian Hàng Cư Dân & Đối Tác Dịch Vụ
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bảng tổng hợp tất cả gian hàng chính chủ cư dân, quán ăn, thực phẩm, sửa chữa, nội thất... được phân loại theo ngành nghề trên toàn bộ hệ thống.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAllStoresDirectoryOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer hover:scale-105 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Xem Toàn Bộ Gian Hàng ({stores.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Preview Store Badges */}
            <div className="pt-2 border-t border-purple-500/20 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin relative z-10">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">Ngành nghề nổi bật:</span>
              {Array.from(new Set(stores.map(s => s.category).filter(Boolean))).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setIsAllStoresDirectoryOpen(true)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-purple-100 font-extrabold text-[10px] rounded-xl transition shrink-0 border border-purple-400/20 cursor-pointer"
                >
                  🏪 {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedSubCategory('all'); }}
              className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md font-black'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
              }`}
            >
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">Tất Cả Dịch Vụ</div>
                <div className="text-[9px] opacity-70">Tổng {services.length} bài</div>
              </div>
            </button>

            {RESIDENT_SERVICE_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              const count = services.filter(s => s.categoryId === cat.id).length;
              const industryRule = DEFAULT_INDUSTRY_KYC_RULES.find(r => r.categoryId === cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory('all'); }}
                  className={`p-2.5 rounded-2xl border text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md font-black'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                      {renderCategoryIcon(cat.iconName, "w-3.5 h-3.5")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{cat.name}</div>
                      <div className="text-[9px] opacity-75 truncate">{count} thợ</div>
                    </div>
                  </div>
                  {industryRule?.isStrictMandatory && (
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-amber-300' : 'bg-emerald-500'}`} title="Yêu cầu giấy phép ngành nghề" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Subcategory Pills Bar */}
          {selectedCategoryObj && (
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Dịch vụ chi tiết thuộc: <strong className="text-emerald-600 dark:text-emerald-400">{selectedCategoryObj.name}</strong>
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {selectedCategoryObj.subCategories.length} phân loại
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedSubCategory('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                    selectedSubCategory === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Tất Cả
                </button>
                {selectedCategoryObj.subCategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      selectedSubCategory === sub
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stores Showcase Horizontal Slider / Cards */}
          {stores.length > 0 && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-amber-500/40 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-wider">
                    🏪 GIAN HÀNG CỬA HÀNG ĐÃ XÁC MINH
                  </span>
                  <h3 className="text-sm font-black text-amber-400 mt-0.5">
                    ĐẶT ĐỒ ĂN & MUA SẮM NỘI KHU VINHOMES
                  </h3>
                </div>
                <button
                  onClick={() => setIsPricingModalOpen(true)}
                  className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/40 hover:bg-amber-500/30 transition"
                >
                  + Mở Gian Hàng
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stores.slice(0, 2).map((st) => (
                  <div 
                    key={st.id} 
                    onClick={() => setSelectedStoreModal(st)}
                    className="bg-slate-950/90 rounded-2xl border border-slate-800 hover:border-amber-500/80 p-3 space-y-2 transition group flex flex-col justify-between cursor-pointer hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={st.logoUrl} 
                        alt={st.storeName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-black text-white line-clamp-1 block group-hover:text-amber-400 transition">{st.storeName}</span>
                        <span className="text-[10px] text-amber-300 font-bold block">{st.category} • {st.address}</span>
                        <span className="text-[9px] text-slate-400">Chủ tiệm: <strong className="text-white">{st.ownerName}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStoreModal(st);
                      }}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Vào Gian Hàng ({st.products?.length || 0} món)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Mode Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>DANH SÁCH DỊCH VỤ ({filteredServices.length})</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => { setViewMode('grid-2col'); localStorage.setItem('hb_resident_services_view_mode', 'grid-2col'); }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${viewMode === 'grid-2col' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                <Grid2x2 className="w-3.5 h-3.5" />
                <span>2 Cột</span>
              </button>
              <button
                onClick={() => { setViewMode('card-1col'); localStorage.setItem('hb_resident_services_view_mode', 'card-1col'); }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${viewMode === 'card-1col' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>1 Cột Lớn</span>
              </button>
              <button
                onClick={() => { setViewMode('list-row'); localStorage.setItem('hb_resident_services_view_mode', 'list-row'); }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${viewMode === 'list-row' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Hàng Ngang</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>DANH SÁCH DỊCH VỤ & CỬA HÀNG CƯ DÂN</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {filteredServices.length} Kết Quả
            </span>
          </h2>

          {/* View Mode Toggle Controls for Mobile & Desktop */}
          <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800/90 p-1 rounded-2xl shrink-0 self-start md:self-auto overflow-x-auto max-w-full border border-slate-300/60 dark:border-slate-700/60">
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 px-2 hidden sm:inline">
              Dạng xem Mobi:
            </span>

            {/* 2 Cột Ô Vuông (Chợ Mobi) */}
            <button
              onClick={() => {
                setViewMode('grid-2col');
                localStorage.setItem('hb_resident_services_view_mode', 'grid-2col');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'grid-2col'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-slate-700'
              }`}
              title="Lưới 2 cột ô vuông - Rất dễ lướt xem trên điện thoại"
            >
              <Grid2x2 className="w-4 h-4" />
              <span>2 Cột (Mobi)</span>
            </button>

            {/* 1 Cột Thẻ Lớn */}
            <button
              onClick={() => {
                setViewMode('card-1col');
                localStorage.setItem('hb_resident_services_view_mode', 'card-1col');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'card-1col'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-slate-700'
              }`}
              title="1 Cột thẻ lớn hình ảnh rộng"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>1 Cột Lớn</span>
            </button>

            {/* Hàng Ngang List Row */}
            <button
              onClick={() => {
                setViewMode('list-row');
                localStorage.setItem('hb_resident_services_view_mode', 'list-row');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'list-row'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-slate-700'
              }`}
              title="Danh sách hàng ngang gọn gàng"
            >
              <List className="w-4 h-4" />
              <span>Hàng Ngang</span>
            </button>

            {/* 3 Cột Lưới Nhỏ */}
            <button
              onClick={() => {
                setViewMode('grid-3col');
                localStorage.setItem('hb_resident_services_view_mode', 'grid-3col');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'grid-3col'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-slate-700'
              }`}
              title="Lưới 3 cột nhỏ thu gọn"
            >
              <Grid3x3 className="w-4 h-4" />
              <span>3 Cột Nhỏ</span>
            </button>
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-700 dark:text-slate-300">
              Chưa có dịch vụ nào thuộc danh mục này
            </h3>
            <p className="text-xs text-slate-500">
              Bạn là cư dân Vinhomes cung cấp dịch vụ này? Đăng ký ngay để xuất hiện trên chợ dịch vụ.
            </p>
          </div>
        ) : viewMode === 'list-row' ? (
          /* HÀNG NGANG LIST ROW LAYOUT */
          <div className="space-y-3">
            {filteredServices.map(service => {
              const projectObj = VIN_MAJOR_PROJECTS.find(p => p.id === service.project);
              const isGold = service.kycBadgeType === 'gold_certified';
              const isVerified = service.verified || service.kycStatus === 'verified';

              return (
                <div 
                  key={service.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col sm:flex-row items-stretch group"
                >
                  <div className="relative w-full sm:w-48 md:w-56 h-36 sm:h-auto bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden cursor-pointer" onClick={() => setSelectedServiceModal(service)}>
                    <img
                      src={service.images[0] || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80'}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                      <span className="bg-slate-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md border border-slate-700">
                        {projectObj?.name.split(' (')[0]}
                      </span>
                      {isVerified && (
                        <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> KYC
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          {service.subCategory}
                        </span>
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-slate-950" /> {service.rating.toFixed(1)}
                        </span>
                      </div>

                      <h3 
                        onClick={() => setSelectedServiceModal(service)}
                        className="font-black text-sm text-slate-900 dark:text-white hover:text-emerald-600 cursor-pointer transition mt-1.5 leading-snug"
                      >
                        {service.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-extrabold">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {service.providerName}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {service.address}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        💰 {service.priceDisplay}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${service.providerPhone}`}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Gọi</span>
                        </a>
                        <a
                          href={service.providerZalo || `https://zalo.me/${service.providerPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Zalo</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'grid-2col' ? (
          /* 2 CỘT Ô VUÔNG DỰ DỰA TRÊN THIẾT BỊ DI ĐỘNG */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredServices.map(service => {
              const projectObj = VIN_MAJOR_PROJECTS.find(p => p.id === service.project);
              const isGold = service.kycBadgeType === 'gold_certified';
              const isVerified = service.verified || service.kycStatus === 'verified';

              return (
                <div 
                  key={service.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group"
                >
                  <div className="relative h-28 sm:h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer" onClick={() => setSelectedServiceModal(service)}>
                    <img
                      src={service.images[0] || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80'}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1 z-10">
                      <span className="bg-slate-900/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-slate-700">
                        {projectObj?.name.split(' (')[0]}
                      </span>
                      {isVerified && (
                        <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-blue-200" />
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-slate-950" />
                        <span>{service.rating.toFixed(1)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate block">
                        {service.subCategory}
                      </span>
                      
                      <h3 
                        onClick={() => setSelectedServiceModal(service)}
                        className="font-black text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 cursor-pointer transition leading-snug mt-0.5"
                      >
                        {service.title}
                      </h3>

                      <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mt-1 truncate">
                        👤 {service.providerName}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate">
                        💰 {service.priceDisplay}
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        <a
                          href={`tel:${service.providerPhone}`}
                          className="flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Gọi</span>
                        </a>
                        <a
                          href={service.providerZalo || `https://zalo.me/${service.providerPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-extrabold"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Zalo</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 1 CỘT LỚN HOẶC 3 CỘT NHỎ */
          <div className={
            viewMode === 'grid-3col'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
              : "grid grid-cols-1 md:grid-cols-2 gap-6"
          }>
            {filteredServices.map(service => {
              const projectObj = VIN_MAJOR_PROJECTS.find(p => p.id === service.project);
              const isGold = service.kycBadgeType === 'gold_certified';
              const isVerified = service.verified || service.kycStatus === 'verified';
              const isPending = service.kycStatus === 'pending';

              return (
                <div 
                  key={service.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-200 flex flex-col justify-between group"
                >
                  {/* Thumbnail Header */}
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer" onClick={() => setSelectedServiceModal(service)}>
                    <img
                      src={service.images[0] || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80'}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Project & BLUE BADGE KYC Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-slate-700">
                        {projectObj?.name.split(' (')[0]}
                      </span>

                      {/* Gold Badge */}
                      {isGold && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                          <Award className="w-3.5 h-3.5 fill-slate-950" />
                          <span>ĐỐI TÁC VÀNG KYC</span>
                        </span>
                      )}

                      {/* Blue Badge KYC */}
                      {isVerified && !isGold && (
                        <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md border border-blue-400/50">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                          <span>NÚT XANH KYC CHÍNH CHỦ</span>
                        </span>
                      )}

                      {/* Pending Badge */}
                      {isPending && (
                        <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                          <Clock className="w-3 h-3 text-amber-200" />
                          <span>Chờ Duyệt Giấy Phép</span>
                        </span>
                      )}
                    </div>

                    {/* Subcategory Tag */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="bg-emerald-950/90 backdrop-blur-md text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-800/80">
                        {service.subCategory}
                      </span>
                      <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>{service.rating.toFixed(1)} ({service.reviewCount})</span>
                      </span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 
                        onClick={() => setSelectedServiceModal(service)}
                        className="font-black text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition"
                      >
                        {service.title}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{service.address}</span>
                      </div>

                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{service.providerName}</span>
                        {service.subdivision && (
                          <span className="text-[11px] text-slate-400 font-normal">({service.subdivision})</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Price & Contact Action Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        💰 {service.priceDisplay}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`tel:${service.providerPhone}`}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Gọi Điện</span>
                        </a>

                        <a
                          href={service.providerZalo || `https://zalo.me/${service.providerPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat Zalo</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

        {/* ==================== RIGHT COLUMN: BẢNG TIN CƯ DÂN & BÀI PR UY TÍN (HIỂN THỊ BÊN PHẢI - 4 CỘT) ==================== */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* PR Bulletin Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 sticky top-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-black text-[9px] rounded-full uppercase tracking-wider">
                  📰 BẢNG TIN CƯ DÂN & PR
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  BÀI VIẾT & REVIEW YOUTUBE
                </h2>
              </div>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setIsPRModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-[11px] rounded-xl shadow-md transition flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Tạo bài viết PR truyền thông cho Gian hàng"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Đăng Bài PR [Admin]</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Bảng tin tổng hợp review thực tế & video YouTube trải nghiệm từ cư dân chính chủ nội khu Vinhomes.
            </p>

            {/* Reputation PR Feed List */}
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1 scrollbar-thin">
              {reputationPosts.map((post) => {
                const embedUrl = getYouTubeEmbedUrl(post.youtubeUrl);
                return (
                  <div 
                    key={post.id}
                    onClick={() => setSelectedPRArticle(post)}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-purple-500/80 transition cursor-pointer space-y-2 group hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-extrabold text-[9px] rounded-md">
                        {post.partnerCategory}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        {post.createdAt}
                      </span>
                    </div>

                    <h3 className="font-black text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition leading-snug">
                      {post.title}
                    </h3>

                    <div className="text-[11px] font-bold text-amber-500 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const foundStore = stores.find(s => s.shopName.toLowerCase().trim() === post.partnerName.toLowerCase().trim() || post.partnerName.toLowerCase().includes(s.shopName.toLowerCase()));
                          if (foundStore) {
                            setSelectedStoreModal(foundStore);
                          } else {
                            setSelectedPRArticle(post);
                          }
                        }}
                        className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg text-[10px] font-black border border-purple-500/30 flex items-center gap-1 transition"
                        title="Click để xem Gian Hàng / Shop này"
                      >
                        <span>🏪 Shop: {post.partnerName}</span>
                      </button>
                      {embedUrl && (
                        <span className="text-[9px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          ▶ Video YouTube
                        </span>
                      )}
                    </div>

                    {/* Embedded YouTube Player in Feed Card */}
                    {embedUrl && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 my-1 aspect-video w-full bg-black">
                        <iframe
                          src={embedUrl}
                          title={post.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        ✍️ {post.authorName} ({post.authorRoom})
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{post.rating}.0</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Link & Admin Manage PR trigger */}
            <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl border border-amber-500/30 text-white space-y-2 text-xs">
              <div className="flex items-center justify-between font-extrabold text-amber-400 text-[11px]">
                <span>🏪 Quản Lý Bài Viết Bảng Tin</span>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => { window.location.hash = '#admin'; }}
                    className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded shadow-xs cursor-pointer"
                  >
                    Vào Trang Admin
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-300">
                Toàn bộ bài viết, video YouTube review và bài PR dịch vụ cư dân được kiểm duyệt minh bạch.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. DEDICATED FULL-SITE SERVICE DETAIL MODAL */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-auto relative space-y-0 animate-in zoom-in-95 duration-150">
            
            {/* Screen-Safety Fixed Floating Close Button */}
            <button
              onClick={() => setSelectedServiceModal(null)}
              className="sticky top-4 float-right mr-4 mt-4 z-50 bg-slate-900/90 hover:bg-rose-600 text-white p-2.5 rounded-full shadow-2xl transition duration-150 border border-slate-700 cursor-pointer flex items-center gap-1.5"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
              <span className="text-xs font-black hidden sm:inline-block">ĐÓNG SITE</span>
            </button>

            {/* Site Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-t-3xl border-b border-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="relative z-10 space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full">
                    {selectedServiceModal.subCategory}
                  </span>

                  {(selectedServiceModal.verified || selectedServiceModal.kycStatus === 'verified') && (
                    <span className="text-xs font-black uppercase bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>ĐỊNH DANH NÚT XANH CƯ DÂN VERIFIED</span>
                    </span>
                  )}

                  <span className="text-xs font-extrabold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>4.9 / 5.0 (52 Đánh giá)</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-black text-white leading-snug">
                  {selectedServiceModal.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Chủ cơ sở: {selectedServiceModal.providerName}</span>
                  </span>
                  {selectedServiceModal.subdivision && (
                    <span className="flex items-center gap-1 text-amber-300">
                      <Building2 className="w-4 h-4" />
                      <span>Phân khu: {selectedServiceModal.subdivision}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Dự án: {VIN_MAJOR_PROJECTS.find(p => p.id === selectedServiceModal.project)?.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Site Content Body Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Photo Gallery Grid */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>HÌNH ẢNH THỰC TẾ & THI CÔNG TRỰC TIẾP</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden">
                  {selectedServiceModal.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`mô tả ${idx}`}
                      className="w-full h-48 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 hover:scale-105 transition duration-300 shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Verified License & KYC Badges Box */}
              <div className="bg-emerald-950/20 border border-emerald-500/40 p-5 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/50 pb-3">
                  <span className="text-sm font-black text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>HỒ SƠ ĐỊNH DANH NÚT XANH & GIẤY PHÉP NGÀNH NGHỀ</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                    ✓ Đã Thẩm Định Bởi Chợ Cư Dân 24H
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div>• <b>Đại dự án:</b> {VIN_MAJOR_PROJECTS.find(p => p.id === selectedServiceModal.project)?.name}</div>
                  <div>• <b>Chủ cơ sở:</b> {selectedServiceModal.providerName} ({selectedServiceModal.providerRoom || 'Tòa S2.01 Ocean Park'})</div>
                  {selectedServiceModal.businessLicenseNo && (
                    <div>• <b>Số ĐKKD / Đăng ký Doanh nghiệp:</b> <span className="font-mono text-emerald-300 font-bold">{selectedServiceModal.businessLicenseNo}</span></div>
                  )}
                  {selectedServiceModal.kycApprovedAt && (
                    <div>• <b>Ngày cấp Nút Xanh:</b> {selectedServiceModal.kycApprovedAt} bởi {selectedServiceModal.kycApprovedBy || 'Ban Quản Trị chocudan24h.com'}</div>
                  )}
                </div>

                {/* Submitted Docs list */}
                {selectedServiceModal.submittedDocs && selectedServiceModal.submittedDocs.length > 0 && (
                  <div className="pt-3 border-t border-emerald-800/60 space-y-2">
                    <span className="text-xs font-bold text-emerald-300">Các chứng chỉ & giấy phép đã thẩm định:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedServiceModal.submittedDocs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-medium">{doc.docType}</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">{doc.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Description & Pricing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs uppercase text-slate-400 tracking-wider">MÔ TẢ CHI TIẾT & BẢNG GIÁ NIÊM YẾT:</h4>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30">
                    💰 {selectedServiceModal.priceDisplay}
                  </span>
                </div>
                
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-medium">
                  {selectedServiceModal.description}
                </p>
              </div>

              {/* Interactive Booking/Quote Form */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>YÊU CẦU KHẢO SÁT & BÁO GIÁ TẬN NƠI</span>
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Miễn phí 100%</span>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  alert(`Đã gửi yêu cầu khảo sát tới ${selectedServiceModal.providerName}! Thợ sẽ gọi lại trong 15 phút.`);
                }} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Tên cư dân:</label>
                    <input 
                      type="text" 
                      required 
                      defaultValue={currentUser?.displayName || ''} 
                      placeholder="Nguyễn Văn A" 
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Số phòng / Tòa nhà:</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Căn 1208 Tòa S2.01" 
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Số điện thoại liên hệ:</label>
                    <input 
                      type="tel" 
                      required 
                      defaultValue={currentUser?.phone || ''} 
                      placeholder="0988xxxxxx" 
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Thời gian mong muốn:</label>
                    <input 
                      type="text" 
                      placeholder="Hôm nay 15h00 hoặc Cuối tuần" 
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs transition shadow-md cursor-pointer"
                    >
                      🚀 GỬI YÊU CẦU ĐẶT LỊCH KHẢO SÁT
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Modal Footer Direct Actions */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-30">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Hotline hỗ trợ: <strong className="text-emerald-600 dark:text-emerald-400">{selectedServiceModal.providerPhone}</strong>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={`tel:${selectedServiceModal.providerPhone}`}
                  className="flex-1 sm:flex-none px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black text-center transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>GỌI HOTLINE ({selectedServiceModal.providerPhone})</span>
                </a>

                <a
                  href={selectedServiceModal.providerZalo || `https://zalo.me/${selectedServiceModal.providerPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black text-center transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>CHAT ZALO TƯ VẤN</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. POST NEW SERVICE MODAL WITH MANDATORY INDUSTRY KYC DOCUMENTS */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-8">
            {/* Modal Title */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase">
                  ĐĂNG DỊCH VỤ / ĐỊNH DANH NÚT XANH KYC
                </h2>
              </div>
              <button
                onClick={() => setIsPostingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Post Form */}
            <form onSubmit={handlePostServiceSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Danh mục ngành nghề (*)
                  </label>
                  <select
                    value={postForm.categoryId}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      const catObj = RESIDENT_SERVICE_CATEGORIES.find(c => c.id === newCatId);
                      setPostForm({
                        ...postForm,
                        categoryId: newCatId,
                        subCategory: catObj?.subCategories[0] || 'Khác'
                      });
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    {RESIDENT_SERVICE_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dịch vụ cụ thể (*)
                  </label>
                  <select
                    value={postForm.subCategory}
                    onChange={(e) => setPostForm({ ...postForm, subCategory: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    {activePostCategoryObj?.subCategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Industry License Notice */}
              {activeIndustryKycRule && (
                <div className="bg-emerald-950/20 border border-emerald-500/40 p-3.5 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>YÊU CẦU GIẤY PHÉP NGÀNH ({activeIndustryKycRule.categoryName}):</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {activeIndustryKycRule.description}
                  </p>
                  <div className="pt-1">
                    <span className="font-bold text-emerald-300">Giấy phép/chứng chỉ bắt buộc:</span>
                    <ul className="mt-1 space-y-1 text-slate-200">
                      {activeIndustryKycRule.requiredDocTypes.map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Dịch Vụ / Tiệm / Thợ (*)
                </label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="Ví dụ: Thi công Lắp Thang Máy Kính Homelift Shophouse Chà Là"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              {/* Project & Subdivision */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dự án Vinhomes (*)
                  </label>
                  <select
                    value={postForm.project}
                    onChange={(e) => setPostForm({ ...postForm, project: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    {VIN_MAJOR_PROJECTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phân khu / Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    value={postForm.subdivision}
                    onChange={(e) => setPostForm({ ...postForm, subdivision: e.target.value })}
                    placeholder="VD: Phân khu Chà Là 6 / Tòa S2.12"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Provider Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên người đăng / Thợ (*)
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.providerName}
                    onChange={(e) => setPostForm({ ...postForm, providerName: e.target.value })}
                    placeholder="VD: Anh Đức Cư Dân"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại (*)
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.providerPhone}
                    onChange={(e) => setPostForm({ ...postForm, providerPhone: e.target.value })}
                    placeholder="0988.xxx.xxx"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link Chat Zalo
                  </label>
                  <input
                    type="text"
                    value={postForm.providerZalo}
                    onChange={(e) => setPostForm({ ...postForm, providerZalo: e.target.value })}
                    placeholder="https://zalo.me/0988xxxxxx"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Address & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Địa chỉ cửa hàng / Khu vực nhận làm (*)
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.address}
                    onChange={(e) => setPostForm({ ...postForm, address: e.target.value })}
                    placeholder="VD: Chà Là 6-12, Vinhomes Ocean Park 2"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giá hiển thị tham khảo
                  </label>
                  <input
                    type="text"
                    value={postForm.priceDisplay}
                    onChange={(e) => setPostForm({ ...postForm, priceDisplay: e.target.value })}
                    placeholder="VD: Khảo sát báo giá miễn phí / Từ 200k"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* KYC License Number / Tax code inputs */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>NỘP GIẤY PHÉP ĐỂ NHẬN NÚT XANH ĐỊNH DANH</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={postForm.applyKycNow}
                    onChange={(e) => setPostForm({ ...postForm, applyKycNow: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>

                {postForm.applyKycNow && (
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-400">Số Giấy phép ĐKKD / Mã số thuế (Nếu có):</label>
                        <input
                          type="text"
                          value={postForm.businessLicenseNo}
                          onChange={(e) => setPostForm({ ...postForm, businessLicenseNo: e.target.value })}
                          placeholder="Mã số đăng ký kinh doanh..."
                          className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-400">Tên Tệp Scan / Bằng cấp tải lên:</label>
                        <input
                          type="text"
                          value={postForm.docNameInput}
                          onChange={(e) => setPostForm({ ...postForm, docNameInput: e.target.value })}
                          placeholder="VD: GPLX_HangB2_DoQuocKhanh.jpg"
                          className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Images URLs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL Hình ảnh minh họa (Mỗi đường dẫn 1 dòng)
                </label>
                <textarea
                  rows={2}
                  value={postForm.imagesText}
                  onChange={(e) => setPostForm({ ...postForm, imagesText: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả chi tiết dịch vụ & Bảo hành
                </label>
                <textarea
                  rows={3}
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  placeholder="Mô tả kỹ năng, cam kết thời gian hoàn thành, chính sách bảo hành..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              {/* MANDATORY LEGAL COMMITMENT CHECKBOX */}
              <div className="bg-amber-50 dark:bg-amber-950/50 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={postForm.legalCommitmentAccepted}
                    onChange={(e) => setPostForm({ ...postForm, legalCommitmentAccepted: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5 shrink-0"
                  />
                  <span className="text-xs font-extrabold text-amber-950 dark:text-amber-200 leading-snug">
                    Tôi xác nhận thông tin đăng bài là trung thực. Tôi cam kết cung cấp dịch vụ đúng chất lượng, đúng giá và tự chịu 100% trách nhiệm trước pháp luật & cư dân. (*)
                  </span>
                </label>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
                >
                  🚀 ĐĂNG DỊCH VỤ & GỬI HỒ SƠ NÚT XANH
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create PR Article Modal */}
      {isPRModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <button
            onClick={() => setIsPRModalOpen(false)}
            className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-auto max-h-[88vh] overflow-y-auto">
            <button
              onClick={() => setIsPRModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-[10px] rounded-full uppercase tracking-wider">
              📰 ĐĂNG BÀI VIẾT PR & ĐÁNH GIÁ UY TÍN
            </span>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Gửi Bài Review Uy Tín Cho Gian Hàng / Quán Ăn
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Bài viết của bạn giúp tăng uy tín cho các nhà bán hàng, quán ăn, dịch vụ cư dân chân chính trong khu đô thị.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newPost = {
                  id: `rep-${Date.now()}`,
                  partnerName: newPRForm.partnerName,
                  partnerCategory: newPRForm.partnerCategory,
                  project: newPRForm.project,
                  authorName: newPRForm.authorName || 'Cư Dân Ẩn Danh',
                  authorRoom: newPRForm.authorRoom || 'Nội Khu Vinhomes',
                  title: newPRForm.title,
                  content: newPRForm.content,
                  rating: Number(newPRForm.rating),
                  images: [newPRForm.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
                  youtubeUrl: newPRForm.youtubeUrl,
                  createdAt: 'Vừa xong',
                  likesCount: 1,
                  trustBadge: 'verified_resident',
                  phoneContact: newPRForm.phoneContact,
                  zaloContact: newPRForm.zaloContact
                };

                // Sync with API backend
                fetch('/api/reputation-posts', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newPost)
                }).catch(err => console.error('Error saving PR post:', err));

                setReputationPosts([newPost, ...reputationPosts]);
                setIsPRModalOpen(false);
                alert('🎉 Đã đăng bài PR & Video YouTube review thành công! Bài viết đã xuất hiện trên trang.');
              }}
              className="space-y-3 text-xs"
            >
              {/* SHOP SELECTION TABS FOR ADMIN PR */}
              <div className="p-3 bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-purple-700 dark:text-purple-300 text-xs">
                    🏷️ TAB CHỌN SHOP CẦN BÀI PR (Click tab để chọn):
                  </label>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold">
                    {stores.length} Shop sẵn có
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Click chọn tab tên Shop bên dưới để tự động gán thông tin PR cho gian hàng đó:
                </p>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin max-h-28 flex-wrap">
                  {stores.map((st) => {
                    const isSelected = newPRForm.partnerName === st.shopName;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setNewPRForm(prev => ({
                            ...prev,
                            partnerName: st.shopName,
                            partnerCategory: st.category || prev.partnerCategory,
                            phoneContact: st.phone || prev.phoneContact,
                            zaloContact: st.zalo || prev.zaloContact,
                            imageUrl: st.bannerImage || st.logoImage || prev.imageUrl,
                            authorRoom: st.address || prev.authorRoom,
                            authorName: currentUser?.name || 'Admin Quản Trị'
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 shrink-0 border cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400 scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                        }`}
                      >
                        <span>🏪 {st.shopName}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Quán Ăn / Gian Hàng / Đối Tác Dịch Vụ (*)
                </label>
                <input
                  type="text"
                  required
                  value={newPRForm.partnerName}
                  onChange={(e) => setNewPRForm({ ...newPRForm, partnerName: e.target.value })}
                  placeholder="Ví dụ: Bún Chả Cụ Bà S2.12 / Tiệm Bánh Cư Dân..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ngành Hàng</label>
                  <select
                    value={newPRForm.partnerCategory}
                    onChange={(e) => setNewPRForm({ ...newPRForm, partnerCategory: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Quán Ăn & Nhà Hàng">Quán Ăn & Nhà Hàng</option>
                    <option value="Sửa Chữa Gia Đình">Sửa Chữa Gia Đình</option>
                    <option value="Làm Đẹp & Spa">Làm Đẹp & Spa</option>
                    <option value="Đi Chợ & Đồ Ăn Sạch">Đi Chợ & Đồ Ăn Sạch</option>
                    <option value="Môi Giới BĐS Uy Tín">Môi Giới BĐS Uy Tín</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đánh Giá Sao</label>
                  <select
                    value={newPRForm.rating}
                    onChange={(e) => setNewPRForm({ ...newPRForm, rating: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-amber-500"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5/5 Tuyệt vời</option>
                    <option value={4}>⭐⭐⭐⭐ 4/5 Rất tốt</option>
                    <option value={3}>⭐⭐⭐ 3/5 Tốt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Người Đăng</label>
                  <input
                    type="text"
                    required
                    value={newPRForm.authorName}
                    onChange={(e) => setNewPRForm({ ...newPRForm, authorName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Căn Hộ / Tòa Nhà</label>
                  <input
                    type="text"
                    required
                    value={newPRForm.authorRoom}
                    onChange={(e) => setNewPRForm({ ...newPRForm, authorRoom: e.target.value })}
                    placeholder="S2.12 - Căn 1806"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu Đề Bài PR / Review (*)
                </label>
                <input
                  type="text"
                  required
                  value={newPRForm.title}
                  onChange={(e) => setNewPRForm({ ...newPRForm, title: e.target.value })}
                  placeholder="Ví dụ: Đồ ăn tươi ngon, giao tận căn hộ rất chu đáo..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Link Video YouTube Review (Tùy chọn)
                </label>
                <input
                  type="url"
                  value={newPRForm.youtubeUrl}
                  onChange={(e) => setNewPRForm({ ...newPRForm, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... hoặc Shorts"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-rose-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nội Dung Review Tốt & Khuyên Cư Dân Nên Dùng (*)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newPRForm.content}
                  onChange={(e) => setNewPRForm({ ...newPRForm, content: e.target.value })}
                  placeholder="Chia sẻ trải nghiệm chi tiết về món ăn, dịch vụ, thái độ phục vụ..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">URL Ảnh Review (Nếu có)</label>
                <input
                  type="text"
                  value={newPRForm.imageUrl}
                  onChange={(e) => setNewPRForm({ ...newPRForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl uppercase tracking-wider text-xs shadow-lg transition"
              >
                🚀 XÁC NHẬN ĐĂNG BÀI PR UY TÍN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Read PR Article Detail Modal */}
      {selectedPRArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <button
            onClick={() => setSelectedPRArticle(null)}
            className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-auto max-h-[88vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPRArticle(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-black text-[10px] rounded-md uppercase">
              {selectedPRArticle.partnerCategory}
            </span>

            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
              {selectedPRArticle.title}
            </h2>

            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
              <span>🏪 {selectedPRArticle.partnerName}</span>
              <span className="text-amber-500 flex items-center gap-1 font-black">
                <Star className="w-4 h-4 fill-amber-500" />
                {selectedPRArticle.rating}.0 / 5.0
              </span>
            </div>

            {/* Embedded YouTube Player in Detail Modal */}
            {getYouTubeEmbedUrl(selectedPRArticle.youtubeUrl) ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video w-full bg-black shadow-lg">
                <iframe
                  src={getYouTubeEmbedUrl(selectedPRArticle.youtubeUrl)!}
                  title={selectedPRArticle.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              selectedPRArticle.images?.[0] && (
                <img
                  src={selectedPRArticle.images[0]}
                  alt={selectedPRArticle.partnerName}
                  className="w-full h-48 object-cover rounded-2xl border border-slate-200 dark:border-slate-800"
                />
              )
            )}

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 whitespace-pre-line">
              {selectedPRArticle.content}
            </p>

            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-purple-900 dark:text-purple-300 block">Tác giả cư dân:</span>
                <span className="text-slate-600 dark:text-slate-400">{selectedPRArticle.authorName} ({selectedPRArticle.authorRoom})</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{selectedPRArticle.createdAt}</span>
            </div>

            {selectedPRArticle.phoneContact && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`tel:${selectedPRArticle.phoneContact}`}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>Gọi Đối Tác</span>
                </a>
                <a
                  href={selectedPRArticle.zaloContact || `https://zalo.me/${selectedPRArticle.phoneContact}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Zalo</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Storefront Modal */}
      {selectedStoreModal && (
        <UserStorefrontModal
          store={selectedStoreModal}
          onClose={() => setSelectedStoreModal(null)}
          currentUser={currentUser}
        />
      )}

      {/* Store & Service Locator Map Modal */}
      {isMapModalOpen && (
        <StoreLocatorMapModal
          stores={stores}
          services={services}
          onClose={() => setIsMapModalOpen(false)}
          onSelectStore={(st) => setSelectedStoreModal(st)}
          onSelectService={(srv) => setSelectedServiceModal(srv)}
          initialProject={selectedProject}
        />
      )}

      {/* Service Pricing & Store Packages Modal */}
      {isPricingModalOpen && (
        <ServicePricingModal
          currentUser={currentUser}
          onClose={() => setIsPricingModalOpen(false)}
        />
      )}

      {/* All Storefronts Directory Modal by Category */}
      {isAllStoresDirectoryOpen && (
        <AllStorefrontsDirectoryModal
          stores={stores}
          onClose={() => setIsAllStoresDirectoryOpen(false)}
          onSelectStore={(st) => {
            setIsAllStoresDirectoryOpen(false);
            setSelectedStoreModal(st);
          }}
        />
      )}

      {/* Tripartite Legal Agreement Modal */}
      <TripartiteAgreementModal
        isOpen={isTripartiteModalOpen}
        onClose={() => setIsTripartiteModalOpen(false)}
      />

    </div>
  );
};

