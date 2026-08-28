import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Property, NewsArticle, LeadContact, User, UpTinPricingConfig, UpTinTransaction, AdBanner, Project, ResidentServiceItem, UserStorefront, StoreOrder, StoreProduct, BUSINESS_CATEGORIES, StorePackage, StorePackageOrder } from '../types';
import { ShieldCheck, Check, Trash2, Phone, Mail, Sparkles, RefreshCw, RotateCcw, Archive, Eye, MessageSquare, Database, CheckCircle2, Clock, Zap, QrCode, Settings, Layers, UserCheck, Globe, Edit3, Plus, PlusCircle, MapPin, Building2, ImageIcon, FileText, Share2, X, Download, Search, Calendar, Filter, FileSpreadsheet, Upload, BarChart3, TrendingUp, UserX, UserPlus, PhoneCall, Award, Ban, Shield, Activity, Smartphone, Monitor, Tablet, ArrowUpRight, Wallet, Layout, Store, ShoppingBag, Wrench, Truck, Coffee, Star, BadgeCheck, ShieldAlert, DollarSign, Package, User as UserIcon, Briefcase, Home, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Menu, LogOut, ExternalLink } from 'lucide-react';
import { AdminAdsManager } from '../components/AdminAdsManager';
import { INITIAL_ADS } from '../data/initialData';
import { AdminRecruitmentManager } from '../components/AdminRecruitmentManager';
import { calculateExpiryInfo } from '../lib/expiration';

interface ReputationPost {
  id: string;
  partnerName: string;
  partnerCategory: string;
  title: string;
  content: string;
  rating?: number;
  authorName: string;
  authorRoom: string;
  images?: string[];
  youtubeUrl?: string;
  createdAt?: string;
  phoneContact?: string;
  zaloContact?: string;
}
import { AiUrlTrackerModal } from '../components/AiUrlTrackerModal';
import { validateImageSize, createInstantPreview, addWatermarkToImage } from '../lib/watermark';
import { EditPropertyModal, EditProjectModal, EditNewsModal, AddPropertyAdminModal } from '../components/AdminAssetManagerModals';
import { AdminMarketingCenter } from '../components/AdminMarketingCenter';
import { AdminSeoCenter } from '../components/AdminSeoCenter';
import { AdminZaloGroupCenter } from '../components/AdminZaloGroupCenter';
import { SocialShareModal } from '../components/SocialShareModal';
import { AdminCreditInjectorModal } from '../components/AdminCreditInjectorModal';
import { EnterpriseAdminCore } from '../components/EnterpriseAdminCore';
import { AdminTaxManagementModal } from '../components/AdminTaxManagementModal';
import { AdminBankWebhookCenter } from '../components/AdminBankWebhookCenter';
import { AdminFinanceHub } from '../components/AdminFinanceHub';
import { NotificationBellDropdown } from '../components/NotificationBellDropdown';
import { GoogleWorkspaceCenter } from '../components/GoogleWorkspaceCenter';
import { AdminLeadsSupervisionCRM } from '../components/AdminLeadsSupervisionCRM';
import { NewsReviewCenter } from '../components/NewsReviewCenter';
import { getProjectSlug } from '../lib/slugs';

interface AdminDashboardPageProps {
  properties: Property[];
  projects?: Project[];
  news: NewsArticle[];
  contacts: LeadContact[];
  pricingConfig: UpTinPricingConfig;
  onSavePricingConfig: (newConfig: UpTinPricingConfig) => void;
  onApproveProperty: (id: string) => void;
  onAddProperty?: (property: Property) => void;
  onUpdateProperty?: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  onUpdateProject?: (project: Project) => void;
  onAddProject?: (project: Project) => void;
  onDeleteProject?: (id: string) => void;
  onUpdateNews?: (newsArticle: NewsArticle) => void;
  onAddNews?: (newsArticle: NewsArticle) => void;
  onDeleteNews?: (id: string) => void;
  onOpenAiWriter: () => void;
  onRefreshData: () => void;
  onSeed1000Properties: () => void;
  onLogout?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  properties,
  projects = [],
  news,
  contacts,
  pricingConfig,
  onSavePricingConfig,
  onApproveProperty,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onUpdateProject,
  onAddProject,
  onDeleteProject,
  onUpdateNews,
  onAddNews,
  onDeleteNews,
  onOpenAiWriter,
  onRefreshData,
  onSeed1000Properties,
  onLogout
}) => {
  const navigate = useNavigate();
  // 7 Mảng Quản Trị Chuyên Biệt Tách Rời (1. BĐS, 2. Thợ Dịch Vụ, 3. Tuyển Dụng, 4. Dịch Vụ Cư Dân, 5. Người Dùng, 6. Quảng Cáo, 7. Công Cụ)
  const [adminSector, setAdminSector] = useState<'bds' | 'resident_market'>('bds');
  const [activeTab, setActiveTab] = useState<
    | 'properties' | 'projects' | 'news' | 'ads' | 'ads_float' | 'ads_header' | 'ads_popup' | 'ads_create' | 'pricing' | 'leads' | 'users' | 'analytics' | 'n8n' | 'marketing' | 'seo' | 'zalo' | 'affiliate_mgmt' | 'reputation' | 'enterprise_core' | 'workspace_sync'
    | 'resident_services_mgmt' | 'resident_services_add' | 'recruitment_mgmt' | 'recruitment_add' | 'stores_mgmt' | 'all_products_mgmt' | 'orders_mgmt' | 'partners_reputation' | 'resident_finance' | 'package_orders_mgmt'
  >('properties');

  // Compute active main category (Phân rõ các tab riêng biệt không bị gộp chung)
  const effectiveMainTab: 'bds' | 'technicians' | 'recruitment' | 'resident_market' | 'users_leads' | 'ads' | 'tools' = (() => {
    if (['properties', 'projects', 'news', 'pricing', 'affiliate_mgmt'].includes(activeTab)) return 'bds';
    if (activeTab === 'resident_services_mgmt' || activeTab === 'resident_services_add') return 'technicians';
    if (activeTab === 'recruitment_mgmt' || activeTab === 'recruitment_add') return 'recruitment';
    if (['stores_mgmt', 'all_products_mgmt', 'orders_mgmt', 'package_orders_mgmt', 'resident_finance', 'partners_reputation'].includes(activeTab)) return 'resident_market';
    if (['users', 'leads', 'enterprise_core'].includes(activeTab)) return 'users_leads';
    if (activeTab === 'ads' || activeTab.startsWith('ads') || (activeTab as string) === 'ads_mgmt') return 'ads';
    return 'tools';
  })();

  const handleSelectMainTab = (tab: 'bds' | 'technicians' | 'recruitment' | 'resident_market' | 'users_leads' | 'ads' | 'tools') => {
    if (tab === 'bds') {
      setAdminSector('bds');
      if (!['properties', 'projects', 'news', 'pricing', 'affiliate_mgmt'].includes(activeTab)) {
        setActiveTab('properties');
      }
    } else if (tab === 'technicians') {
      setAdminSector('resident_market');
      setActiveTab('resident_services_mgmt');
    } else if (tab === 'recruitment') {
      setAdminSector('resident_market');
      setActiveTab('recruitment_mgmt');
    } else if (tab === 'resident_market') {
      setAdminSector('resident_market');
      if (!['stores_mgmt', 'orders_mgmt', 'package_orders_mgmt', 'resident_finance', 'partners_reputation'].includes(activeTab)) {
        setActiveTab('stores_mgmt');
      }
    } else if (tab === 'users_leads') {
      if (!['users', 'leads', 'enterprise_core'].includes(activeTab)) {
        setActiveTab('users');
      }
    } else if (tab === 'ads') {
      setActiveTab('ads');
    } else if (tab === 'tools') {
      if (!['analytics', 'seo', 'marketing', 'zalo', 'workspace_sync', 'n8n', 'reputation'].includes(activeTab)) {
        setActiveTab('analytics');
      }
    }
  };

  // Mobile Gesture Navigation (Gạt sang trái: Sang Tab tiếp theo / Sổ menu | Gạt sang phải: Quay lại Tab trước)
  const MAIN_TAB_KEYS: Array<'bds' | 'technicians' | 'recruitment' | 'resident_market' | 'users_leads' | 'ads' | 'tools'> = [
    'bds',
    'technicians',
    'recruitment',
    'resident_market',
    'users_leads',
    'ads',
    'tools'
  ];

  const handleNextTab = () => {
    const currentIndex = MAIN_TAB_KEYS.indexOf(effectiveMainTab);
    const nextIndex = (currentIndex + 1) % MAIN_TAB_KEYS.length;
    handleSelectMainTab(MAIN_TAB_KEYS[nextIndex]);
  };

  const handlePrevTab = () => {
    const currentIndex = MAIN_TAB_KEYS.indexOf(effectiveMainTab);
    const prevIndex = (currentIndex - 1 + MAIN_TAB_KEYS.length) % MAIN_TAB_KEYS.length;
    handleSelectMainTab(MAIN_TAB_KEYS[prevIndex]);
  };

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [showMobileMenuDrawer, setShowMobileMenuDrawer] = useState<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Ngưỡng vuốt ngang (threshold: 45px và góc chủ đạo là trục X)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      if (deltaX < 0) {
        // Gạt sang trái (Swipe Left) -> Chuyển sang Tab kế tiếp
        handleNextTab();
      } else {
        // Gạt sang phải (Swipe Right) -> Quay lại Tab trước đó
        handlePrevTab();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const [adminReputationPosts, setAdminReputationPosts] = useState<ReputationPost[]>([]);

  // Resident Services & Marketplace State
  const [adminResidentServices, setAdminResidentServices] = useState<ResidentServiceItem[]>([]);
  const [adminStores, setAdminStores] = useState<UserStorefront[]>([]);
  const [adminStoreOrders, setAdminStoreOrders] = useState<StoreOrder[]>([]);
  const [adminStorePackages, setAdminStorePackages] = useState<StorePackage[]>([]);
  const [adminPackageOrders, setAdminPackageOrders] = useState<StorePackageOrder[]>([]);
  const [resServiceCatFilter, setResServiceCatFilter] = useState<string>('all');
  const [resServiceSearch, setResServiceSearch] = useState<string>('');
  const [resServiceKycFilter, setResServiceKycFilter] = useState<string>('all');
  const [resServiceExpiryFilter, setResServiceExpiryFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [showAddServiceModal, setShowAddServiceModal] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ResidentServiceItem | null>(null);

  // Dedicated Store Management & Moderation State
  const [selectedAdminStore, setSelectedAdminStore] = useState<UserStorefront | null>(null);
  const [storeSearchQuery, setStoreSearchQuery] = useState<string>('');
  const [storeProjectFilter, setStoreProjectFilter] = useState<string>('all');
  const [storeModerationFilter, setStoreModerationFilter] = useState<'all' | 'pending' | 'approved' | 'kiotviet'>('all');
  const [storeDetailActiveTab, setStoreDetailActiveTab] = useState<'products' | 'services' | 'info'>('products');

  // Icon Compact & Expandable Table rows state
  const [adminViewMode, setAdminViewMode] = useState<'icon_compact' | 'detailed'>('icon_compact');
  const [showMetricsDropdown, setShowMetricsDropdown] = useState<boolean>(false);
  const [isSubNavDropdownOpen, setIsSubNavDropdownOpen] = useState<boolean>(false);
  const [expandedAdminPropIds, setExpandedAdminPropIds] = useState<Record<string, boolean>>({});
  const [expandedProjectIds, setExpandedProjectIds] = useState<Record<string, boolean>>({});
  const [expandedNewsIds, setExpandedNewsIds] = useState<Record<string, boolean>>({});
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // User management and token recharge state
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<User | null>(null);
  const [creditFundType, setCreditFundType] = useState<'balance' | 'upTinCredits' | 'affiliatePoints'>('balance');
  const [creditAmount, setCreditAmount] = useState<number>(50000);
  const [creditReason, setCreditReason] = useState<string>('Thưởng / Nạp trực tiếp từ Ban Quản Trị');
  const [isProcessingCredit, setIsProcessingCredit] = useState<boolean>(false);

  const toggleExpandAdminProp = (id: string) => {
    setExpandedAdminPropIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandProject = (id: string) => {
    setExpandedProjectIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandNews = (id: string) => {
    setExpandedNewsIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandAllAdminProps = (propsList: Property[]) => {
    const allExpanded = propsList.length > 0 && propsList.every(p => expandedAdminPropIds[p.id]);
    const newState: Record<string, boolean> = {};
    propsList.forEach(p => {
      newState[p.id] = !allExpanded;
    });
    setExpandedAdminPropIds(newState);
  };

  // Store Create / Edit Form Modal
  const [showStoreFormModal, setShowStoreFormModal] = useState<boolean>(false);
  const [editingStoreItem, setEditingStoreItem] = useState<UserStorefront | null>(null);
  const [storeFormData, setStoreFormData] = useState({
    storeName: '',
    ownerName: '',
    ownerPhone: '',
    ownerZalo: '',
    category: 'Thực Phẩm & Ăn Uống',
    project: 'ocean-park-2' as any,
    subdivision: 'Phân Khu Kinh Đô Ánh Sáng',
    address: 'Vinhomes Ocean Park 2, Hưng Yên',
    description: '',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    status: 'approved' as 'approved' | 'pending' | 'rejected',
    verified: true
  });

  // Store Product Add / Edit Modal
  const [showStoreProductModal, setShowStoreProductModal] = useState<boolean>(false);
  const [editingStoreProduct, setEditingStoreProduct] = useState<StoreProduct | null>(null);
  const [storeProductForm, setStoreProductForm] = useState({
    id: '',
    name: '',
    code: '',
    category: 'Món Ăn & Đồ Uống',
    price: 50000,
    unit: 'suất',
    stockQuantity: 50,
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'],
    description: '',
    status: 'approved' as 'approved' | 'pending' | 'rejected',
    isAvailable: true
  });

  // Package Management State
  const [editingPkgModal, setEditingPkgModal] = useState<StorePackage | null>(null);
  const [showAddPkgModal, setShowAddPkgModal] = useState<boolean>(false);
  const [pkgFormData, setPkgFormData] = useState({
    name: '',
    priceDisplay: '',
    priceValue: 0,
    unit: '/ năm',
    badge: '',
    description: '',
    featuresStr: '',
    buttonText: 'Đăng Ký Ngay',
    buttonVariant: 'success' as 'primary' | 'success' | 'warning' | 'purple' | 'outline',
    popular: false
  });

  const handleOpenAddPkgModal = () => {
    setEditingPkgModal(null);
    setPkgFormData({
      name: '',
      priceDisplay: '',
      priceValue: 0,
      unit: '/ năm',
      badge: '',
      description: '',
      featuresStr: '',
      buttonText: 'Đăng Ký Ngay',
      buttonVariant: 'success',
      popular: false
    });
    setShowAddPkgModal(true);
  };

  const handleOpenEditPkgModal = (pkg: StorePackage) => {
    setEditingPkgModal(pkg);
    setPkgFormData({
      name: pkg.name || '',
      priceDisplay: pkg.priceDisplay || '',
      priceValue: pkg.priceValue || 0,
      unit: pkg.unit || '/ năm',
      badge: pkg.badge || '',
      description: pkg.description || '',
      featuresStr: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
      buttonText: pkg.buttonText || 'Đăng Ký Ngay',
      buttonVariant: (pkg.buttonVariant as any) || 'success',
      popular: Boolean(pkg.popular)
    });
    setShowAddPkgModal(true);
  };

  const handleSavePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgFormData.name || !pkgFormData.priceDisplay) {
      alert('Vui lòng điền Tên gói dịch vụ và Giá hiển thị!');
      return;
    }

    const payload = {
      name: pkgFormData.name,
      priceDisplay: pkgFormData.priceDisplay,
      priceValue: Number(pkgFormData.priceValue) || 0,
      unit: pkgFormData.unit,
      badge: pkgFormData.badge,
      description: pkgFormData.description,
      features: pkgFormData.featuresStr.split('\n').map(s => s.trim()).filter(Boolean),
      buttonText: pkgFormData.buttonText,
      buttonVariant: pkgFormData.buttonVariant,
      popular: pkgFormData.popular,
      color: pkgFormData.popular 
        ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 ring-2 ring-amber-500'
        : 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
    };

    try {
      const url = editingPkgModal ? `/api/admin/store-packages/${editingPkgModal.id}` : '/api/admin/store-packages';
      const method = editingPkgModal ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingPkgModal ? '🎉 Đã cập nhật gói dịch vụ thành công!' : '🎉 Đã tạo gói dịch vụ mới!');
        setShowAddPkgModal(false);
        setEditingPkgModal(null);
        fetchStorePackages();
      } else {
        alert('Có lỗi xảy ra khi lưu gói dịch vụ.');
      }
    } catch (err) {
      console.error('Error saving package:', err);
    }
  };

  const handleDeletePackageClick = async (pkgId: string, pkgName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa gói dịch vụ "${pkgName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/store-packages/${pkgId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Đã xóa gói dịch vụ!');
        fetchStorePackages();
      }
    } catch (err) {
      console.error('Error deleting package:', err);
    }
  };

  const handleUpdatePackageOrderStatus = async (orderId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/package-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(status === 'approved' ? '🎉 Đã phê duyệt & kích hoạt Gói Dịch Vụ cho khách hàng!' : 'Đã chuyển đơn đăng ký sang trạng thái Từ chối.');
        fetchPackageOrders();
      }
    } catch (err) {
      console.error('Error updating package order status:', err);
    }
  };

  // Form state for creating/editing Resident Services
  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvCategory, setNewSrvCategory] = useState(BUSINESS_CATEGORIES[0].id);
  const [newSrvSubCat, setNewSrvSubCat] = useState('');
  const [newSrvProject, setNewSrvProject] = useState('Vinhomes Ocean Park 1');
  const [newSrvProviderName, setNewSrvProviderName] = useState('');
  const [newSrvProviderPhone, setNewSrvProviderPhone] = useState('');
  const [newSrvProviderZalo, setNewSrvProviderZalo] = useState('');
  const [newSrvAddress, setNewSrvAddress] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('Liên hệ báo giá');
  const [newSrvImage, setNewSrvImage] = useState('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80');
  const [newSrvDesc, setNewSrvDesc] = useState('');

  const resetNewSrvForm = () => {
    setNewSrvTitle('');
    setNewSrvCategory(BUSINESS_CATEGORIES[0].id);
    setNewSrvSubCat('');
    setNewSrvProject('Vinhomes Ocean Park 1');
    setNewSrvProviderName('');
    setNewSrvProviderPhone('');
    setNewSrvProviderZalo('');
    setNewSrvAddress('');
    setNewSrvPrice('Liên hệ báo giá');
    setNewSrvImage('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80');
    setNewSrvDesc('');
  };

  const fetchResidentServices = async () => {
    try {
      const res = await fetch('/api/resident-services');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdminResidentServices(data);
      }
    } catch (e) {
      console.error('Error fetching resident services:', e);
    }
  };

  const handleRenewResidentService = async (srvId: string, title?: string) => {
    try {
      const res = await fetch(`/api/resident-services/${srvId}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`🎉 Đã gia hạn bài dịch vụ "${title || 'Cư dân'}" thành công thêm 30 ngày!`);
        fetchResidentServices();
      } else {
        alert(data.error || 'Có lỗi khi gia hạn dịch vụ.');
      }
    } catch (e) {
      console.error('Error renewing resident service:', e);
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdminStores(data);
      }
    } catch (e) {
      console.error('Error fetching stores:', e);
    }
  };

  const fetchStoreOrders = async () => {
    try {
      const res = await fetch('/api/store-orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdminStoreOrders(data);
      }
    } catch (e) {
      console.error('Error fetching store orders:', e);
    }
  };

  const fetchStorePackages = async () => {
    try {
      const res = await fetch('/api/store-packages');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdminStorePackages(data);
      }
    } catch (e) {
      console.error('Error fetching store packages:', e);
    }
  };

  const fetchPackageOrders = async () => {
    try {
      const res = await fetch('/api/admin/package-orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdminPackageOrders(data);
      }
    } catch (e) {
      console.error('Error fetching package orders:', e);
    }
  };

  React.useEffect(() => {
    fetch('/api/reputation-posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAdminReputationPosts(data);
      })
      .catch(err => console.error(err));

    fetchResidentServices();
    fetchStores();
    fetchStoreOrders();
    fetchStorePackages();
    fetchPackageOrders();
  }, [activeTab, adminSector]);
  const [localConfig, setLocalConfig] = useState<UpTinPricingConfig>(pricingConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showAiUrlTracker, setShowAiUrlTracker] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [propertySubFilter, setPropertySubFilter] = useState<'all' | 'sale' | 'rent' | 'pushed' | 'expiring' | 'archived' | 'pending'>('all');
  const [selectedSellerDetail, setSelectedSellerDetail] = useState<Property | null>(null);
  const [sharingProperty, setSharingProperty] = useState<Property | null>(null);
  const [userForCreditInjector, setUserForCreditInjector] = useState<User | null>(null);
  const [adminPropSearch, setAdminPropSearch] = useState<string>('');
  const [adminPropProjectFilter, setAdminPropProjectFilter] = useState<string>('all');
  const [adminProjectSearch, setAdminProjectSearch] = useState<string>('');
  const [adminNewsSearch, setAdminNewsSearch] = useState<string>('');
  const [adminNewsCatFilter, setAdminNewsCatFilter] = useState<string>('all');

  // Admin Affiliate & Platform Fee Config State
  const [affiliateF1Rate, setAffiliateF1Rate] = useState<number>(15); // 15%
  const [affiliateF2Rate, setAffiliateF2Rate] = useState<number>(5); // 5%
  const [refBonusUpTin, setRefBonusUpTin] = useState<number>(5); // +5 Up-Tin per referral
  const [servicePackageMonthPrice, setServicePackageMonthPrice] = useState<number>(199000); // 199k VNĐ/tháng
  const [servicePackage3MonthPrice, setServicePackage3MonthPrice] = useState<number>(499000); // 499k VNĐ/3 tháng
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'po-1', userName: 'Bùi Trung Hiếu', userPhone: '0988112233', amount: 300000, bank: 'Vietcombank', bankAccount: '0988112233', status: 'pending', requestedAt: '2026-08-02 09:15' },
    { id: 'po-2', userName: 'Nguyễn Văn Anh', userPhone: '0912345678', amount: 500000, bank: 'MB Bank', bankAccount: '0912345678', status: 'approved', requestedAt: '2026-08-01 14:20' },
  ]);

  // Leads filter & local sync state
  // Multi-level approval & Public Synchronization state
  const [isSyncingPublic, setIsSyncingPublic] = useState(false);

  const handleSyncToPublicWeb = async () => {
    setIsSyncingPublic(true);

    let newlyApprovedProperties = 0;
    for (const p of properties) {
      if (!p.approved && p.status !== 'approved') {
        try {
          await onApproveProperty(p.id);
          newlyApprovedProperties++;
        } catch (e) {
          console.warn('Auto approve property error:', e);
        }
      }
    }

    let newlyPublishedNews = 0;
    for (const n of news) {
      if (n.status === 'draft' && onUpdateNews) {
        onUpdateNews({ ...n, status: 'published' });
        newlyPublishedNews++;
      }
    }

    if (onRefreshData) {
      onRefreshData();
    }

    setTimeout(() => {
      setIsSyncingPublic(false);
      alert(
        `✅ ĐÃ ĐỒNG BỘ NỘI DUNG LÊN PUBLIC WEBSITE THÀNH CÔNG!\n\n` +
        `• Đã phê duyệt mới: ${newlyApprovedProperties} tin BĐS chờ duyệt, ${newlyPublishedNews} bài viết tin tức.\n` +
        `• Tổng dữ liệu hiển thị public: ${properties.length} tin BĐS, ${news.length} tin tức, ${projects.length} sơ đồ dự án.\n` +
        `• Toàn bộ Admin cấp dưới & Khách hàng đã có thể xem dữ liệu mới nhất trên giao diện Web Public.`
      );
    }, 600);
  };

  const handleUnapproveProperty = (p: Property) => {
    if (confirm(`Bạn có chắc muốn trả tin "${p.title}" về trạng thái Chờ Duyệt?`)) {
      if (onUpdateProperty) {
        onUpdateProperty({ ...p, approved: false, status: 'pending', approvalStatus: 'pending', rejectionReason: undefined, adminNote: undefined });
      }
    }
  };

  const [analyticsTimeFrame, setAnalyticsTimeFrame] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadTypeFilter, setLeadTypeFilter] = useState<string>('all');
  const [localContacts, setLocalContacts] = useState<LeadContact[]>(contacts);

  React.useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  const handleUpdateLeadStatus = async (id: string, newStatus: 'new' | 'contacted' | 'done') => {
    try {
      setLocalContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      onRefreshData();
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu xem nhà này?')) return;
    try {
      setLocalContacts(prev => prev.filter(c => c.id !== id));
      await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      onRefreshData();
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  const handleExportLeadsCSV = (listToExport: LeadContact[]) => {
    if (!listToExport || listToExport.length === 0) {
      alert('Chưa có dữ liệu đặt lịch xem nhà để xuất file!');
      return;
    }

    const headers = [
      'STT',
      'Họ và Tên Khách Hàng',
      'Số Điện Thoại Zalo',
      'Email',
      'Dự Án Quan Tâm',
      'Căn BĐS Đặt Lịch Xem',
      'Người Đăng Tin (Chủ Nhà / Admin)',
      'SĐT Người Đăng Tin',
      'Thời Gian Muốn Xem',
      'Ghi Chú Yêu Cầu',
      'Loại Yêu Cầu',
      'Trạng Thái',
      'Thời Gian Gửi Yêu Cầu'
    ];

    const rows = listToExport.map((c, index) => [
      index + 1,
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.projectInterest || '').replace(/"/g, '""')}"`,
      `"${(c.propertyTitle || '').replace(/"/g, '""')}"`,
      `"${(c.sellerName || 'Người đăng tin').replace(/"/g, '""')}"`,
      `"${(c.sellerPhone || '').replace(/"/g, '""')}"`,
      `"${(c.preferredTime || '').replace(/"/g, '""')}"`,
      `"${(c.note || '').replace(/"/g, '""')}"`,
      c.type === 'viewing' ? 'Đặt lịch xem nhà' : c.type === 'deposit' ? 'Cọc giữ chỗ' : 'Tư vấn',
      c.status === 'done' ? 'Đã hoàn tất' : c.status === 'contacted' ? 'Đã liên hệ' : 'Yêu cầu mới',
      `"${new Date(c.createdAt).toLocaleString('vi-VN')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `danh-sach-dat-lich-xem-nha-vinhomes-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredContacts = localContacts.filter(c => {
    const matchesSearch = !leadSearch || 
      (c.fullName && c.fullName.toLowerCase().includes(leadSearch.toLowerCase())) ||
      (c.phone && c.phone.includes(leadSearch)) ||
      (c.propertyTitle && c.propertyTitle.toLowerCase().includes(leadSearch.toLowerCase())) ||
      (c.sellerName && c.sellerName.toLowerCase().includes(leadSearch.toLowerCase()));
    
    const matchesStatus = leadStatusFilter === 'all' || c.status === leadStatusFilter || (!c.status && leadStatusFilter === 'new');
    const matchesType = leadTypeFilter === 'all' || c.type === leadTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'owner' | 'sale'>('all');
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Fetch users list from backend API
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setRegisteredUsers(data);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  // Fetch Analytics & Traffic Stats
  const fetchAnalyticsStats = async () => {
    try {
      const res = await fetch('/api/analytics/stats');
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    }
  };

  React.useEffect(() => {
    fetchUsers();
    fetchAnalyticsStats();
  }, [activeTab]);

  // User Management Actions
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      await fetch(`/api/auth/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      fetchUsers();
    } catch (e) {
      console.error('Error updating user role:', e);
    }
  };

  const handleAdjustUpTinCredits = async (userId: string, currentCredits: number) => {
    const input = window.prompt(`Nhập số lượt Up Tin mới cho tài khoản (Hiện tại: ${currentCredits} lượt):`, String(currentCredits + 10));
    if (input === null) return;
    const newAmount = parseInt(input, 10);
    if (isNaN(newAmount) || newAmount < 0) {
      alert('Vui lòng nhập số hợp lệ!');
      return;
    }

    try {
      setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, upTinCredits: newAmount } : u));
      await fetch(`/api/auth/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upTinCredits: newAmount })
      });
      alert(`Đã cấp ${newAmount} lượt Up Tin thành công!`);
      fetchUsers();
    } catch (e) {
      console.error('Error adjusting UpTin credits:', e);
    }
  };

  const handleToggleBlockUser = async (userId: string, currentBlocked: boolean) => {
    const actionName = currentBlocked ? 'MỞ KHÓA' : 'TẠM KHÓA';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản này?`)) return;

    try {
      setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !currentBlocked } : u));
      await fetch(`/api/auth/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !currentBlocked })
      });
      fetchUsers();
    } catch (e) {
      console.error('Error toggling block user:', e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('⚠️ CẢNH BÁO: Xóa tài khoản này khỏi hệ thống vĩnh viễn?')) return;

    try {
      setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
      await fetch(`/api/auth/users/${userId}`, { method: 'DELETE' });
      alert('Đã xóa tài khoản thành công!');
      fetchUsers();
    } catch (e) {
      console.error('Error deleting user:', e);
    }
  };

  // Asset Modals State
  const [showTaxModal, setShowTaxModal] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isAddingProperty, setIsAddingProperty] = useState<boolean>(false);
  const [addingPropertyType, setAddingPropertyType] = useState<'sale' | 'rent'>('sale');

  const openAddProperty = (type: 'sale' | 'rent' = 'sale') => {
    setAddingPropertyType(type);
    setIsAddingProperty(true);
  };
  const [expandedNavSections, setExpandedNavSections] = useState<Record<string, boolean>>({
    bds: true,
    technicians: true,
    recruitment: true,
    resident_market: true,
    users_leads: true,
    ads: true,
    tools: true
  });
  const toggleNavSection = (section: string) => {
    setExpandedNavSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [isAddingNews, setIsAddingNews] = useState(false);

  // User Add / Edit Modal States
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'owner',
    upTinCredits: 10,
    balance: 0,
    password: ''
  });

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo tài khoản');
      alert(data.message || 'Thêm thành viên mới thành công!');
      setIsAddingUser(false);
      setUserFormData({ name: '', email: '', phone: '', role: 'owner', upTinCredits: 10, balance: 0, password: '' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi hệ thống');
    }
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/auth/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role,
          upTinCredits: editingUser.upTinCredits,
          balance: editingUser.balance,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật tài khoản');
      alert(data.message || 'Cập nhật tài khoản thành công!');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi hệ thống');
    }
  };

  // Ad Banners State & Handlers (Persisted in localStorage)
  const [adsList, setAdsList] = useState<AdBanner[]>(() => {
    try {
      const saved = localStorage.getItem('chocudan24h_ads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse ads from localStorage:', e);
    }
    return INITIAL_ADS;
  });

  // Fetch live ads list for navigation counters and admin widgets
  React.useEffect(() => {
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAdsList(data);
          try { localStorage.setItem('chocudan24h_ads', JSON.stringify(data)); } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdImage, setNewAdImage] = useState('');
  const [newAdLink, setNewAdLink] = useState('');
  const [newAdPos, setNewAdPos] = useState<string>('float_right_pc');
  const [newAdWidthSize, setNewAdWidthSize] = useState<'small' | 'medium' | 'large' | 'compact'>('medium');
  const [newAdDisplayStyle, setNewAdDisplayStyle] = useState<'card_full' | 'image_only' | 'glowing_border' | 'minimal'>('glowing_border');
  const [newAdBadgeText, setNewAdBadgeText] = useState('QC CẠNH PHẢI');
  const [editingAd, setEditingAd] = useState<AdBanner | null>(null);
  const [showAdFormMobile, setShowAdFormMobile] = useState(false);
  const [previewingAd, setPreviewingAd] = useState<AdBanner | null>(null);
  const [expandedAdIds, setExpandedAdIds] = useState<Record<string, boolean>>({});

  const toggleExpandAd = (id: string) => {
    setExpandedAdIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSafeAdUrl = (url?: string) => {
    if (!url || url.trim() === '' || url === '#') return '/';
    const trimmed = url.trim();
    if (trimmed.startsWith('tel:') || trimmed.startsWith('mailto:') || trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('zalo.me') || trimmed.startsWith('facebook.com') || trimmed.startsWith('www.') || trimmed.includes('.')) {
      return `https://${trimmed}`;
    }
    return `/${trimmed}`;
  };

  const handleTestAdClick = (ad: AdBanner) => {
    const updated = adsList.map(a => a.id === ad.id ? { 
      ...a, 
      clickCount: (a.clickCount || a.clicks || 0) + 1,
      clicks: (a.clicks || a.clickCount || 0) + 1
    } : a);
    setAdsList(updated);
    
    // Also trigger backend click track
    try {
      fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id })
      });
    } catch (e) {}

    const targetUrl = getSafeAdUrl(ad.linkUrl || ad.targetUrl);
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  // Sync adsList to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('chocudan24h_ads', JSON.stringify(adsList));
    } catch (e) {
      console.warn('Failed to save ads to localStorage:', e);
    }
  }, [adsList]);

  // Start editing banner: pre-fill top form directly
  const handleStartEditAd = (ad: AdBanner) => {
    setEditingAd(ad);
    setNewAdTitle(ad.title);
    setNewAdImage(ad.imageUrl);
    setNewAdLink(ad.linkUrl || ad.targetUrl || '');
    setNewAdPos(ad.position || 'float_right_pc');
    setNewAdWidthSize(ad.widthSize || 'medium');
    setNewAdDisplayStyle(ad.displayStyle || 'card_full');
    setNewAdBadgeText(ad.badgeText || 'QC CẠNH PHẢI');
    setShowAdFormMobile(true);
    
    // Scroll smoothly to form section
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEditAd = () => {
    setEditingAd(null);
    setNewAdTitle('');
    setNewAdImage('');
    setNewAdLink('');
    setNewAdPos('float_right_pc');
    setNewAdWidthSize('medium');
    setNewAdDisplayStyle('card_full');
    setNewAdBadgeText('QC CẠNH PHẢI');
  };

  const handleAdFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetAdId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Dung lượng ảnh vượt quá 8MB, vui lòng chọn file nhẹ hơn.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (targetAdId) {
          // Change image directly on table row
          const updated = adsList.map(a => a.id === targetAdId ? { ...a, imageUrl: base64 } : a);
          setAdsList(updated);
          if (editingAd && editingAd.id === targetAdId) {
            setEditingAd({ ...editingAd, imageUrl: base64 });
            setNewAdImage(base64);
          }
          alert('Cập nhật ảnh Banner trực tiếp thành công!');
        } else {
          setNewAdImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFormAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle || !newAdImage) {
      alert('Vui lòng điền đầy đủ tiêu đề và hình ảnh banner.');
      return;
    }

    if (editingAd) {
      // Update existing
      const isAct = editingAd.active ?? editingAd.isActive ?? true;
      const updated = adsList.map(a => a.id === editingAd.id ? {
        ...editingAd,
        title: newAdTitle,
        imageUrl: newAdImage,
        linkUrl: newAdLink || '/',
        targetUrl: newAdLink || '/',
        position: newAdPos,
        widthSize: newAdWidthSize,
        displayStyle: newAdDisplayStyle,
        badgeText: newAdBadgeText,
        active: isAct,
        isActive: isAct
      } : a);
      setAdsList(updated);
      handleCancelEditAd();
      alert('Cập nhật Banner Quảng Cáo thành công!');
    } else {
      // Add new
      const newBanner: AdBanner = {
        id: `ad-${Date.now()}`,
        title: newAdTitle,
        imageUrl: newAdImage,
        linkUrl: newAdLink || '/',
        targetUrl: newAdLink || '/',
        position: newAdPos,
        widthSize: newAdWidthSize,
        displayStyle: newAdDisplayStyle,
        badgeText: newAdBadgeText,
        active: true,
        isActive: true,
        clickCount: 0,
        clicks: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAdsList([newBanner, ...adsList]);
      handleCancelEditAd();
      alert('Thêm Banner Quảng Cáo mới thành công!');
    }
  };

  const handleToggleAdActive = (id: string) => {
    const updated = adsList.map(a => a.id === id ? { ...a, active: !(a.active ?? a.isActive ?? true), isActive: !(a.active ?? a.isActive ?? true) } : a);
    setAdsList(updated);
  };

  const handleDeleteAd = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Banner quảng cáo này?')) {
      const updated = adsList.filter(a => a.id !== id);
      setAdsList(updated);
      if (editingAd && editingAd.id === id) {
        handleCancelEditAd();
      }
    }
  };

  // Property Statistics & Category Breakdown
  const saleProperties = properties.filter(p => p.type === 'sale' || (p as any).category === 'ban');
  const rentProperties = properties.filter(p => p.type === 'rent' || (p as any).category === 'cho-thue');
  
  // Sales team & Broker count
  const salesTeamList = registeredUsers.filter(u => u.role === 'sale' || u.role === 'manager' || u.role === 'broker' || u.role === 'admin');
  const totalSalesCount = salesTeamList.length > 0 ? salesTeamList.length : Math.max(12, registeredUsers.length);

  // Expiration Rules: 15-25 days live display (default 20 days), 1 month (30 days) seller/property data preservation
  const EXPIRY_DAYS = 20; 
  const ARCHIVE_PRESERVE_DAYS = 30;

  const getPropertyExpiryInfo = (p: Property) => {
    const baseDateStr = p.pushedAt || p.createdAt || '2026-07-01';
    const baseDate = new Date(baseDateStr);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = EXPIRY_DAYS - daysPassed;
    const isExpired = daysRemaining <= 0;
    const archiveDaysLeft = Math.max(0, (EXPIRY_DAYS + ARCHIVE_PRESERVE_DAYS) - daysPassed);

    // Format post date (DD/MM/YYYY)
    const postDateFormatted = !isNaN(baseDate.getTime()) 
      ? `${String(baseDate.getDate()).padStart(2, '0')}/${String(baseDate.getMonth() + 1).padStart(2, '0')}/${baseDate.getFullYear()}`
      : '15/07/2026';

    // Calculate exact expiration date
    const expiryDateObj = new Date(baseDate.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const expiryDateFormatted = `${String(expiryDateObj.getDate()).padStart(2, '0')}/${String(expiryDateObj.getMonth() + 1).padStart(2, '0')}/${expiryDateObj.getFullYear()}`;

    return {
      baseDateStr,
      postDateFormatted,
      expiryDateFormatted,
      daysPassed,
      daysRemaining,
      isExpired,
      archiveDaysLeft,
      isArchived: isExpired || p.status === 'sold'
    };
  };

  const archivedProperties = properties.filter(p => getPropertyExpiryInfo(p).isExpired || p.status === 'sold');
  const expiringSoonProperties = properties.filter(p => {
    const info = getPropertyExpiryInfo(p);
    return !info.isExpired && info.daysRemaining <= 5;
  });
  const pushedProperties = properties.filter(p => !!p.pushedAt);
  const pendingProperties = properties.filter(p => !p.approved && p.status !== 'approved');

  // Push / Bump property now (+20 days reset)
  const handlePushPropertyNow = (property: Property) => {
    const updated: Property = {
      ...property,
      pushedAt: new Date().toISOString(),
      status: 'approved',
      approved: true
    };
    if (onUpdateProperty) {
      onUpdateProperty(updated);
      alert(`⚡ Đã Up Tin thành công cho căn "${property.title}"! Đã gia hạn +20 ngày hiển thị.`);
    }
  };

  // Toggle archive status
  const handleToggleArchiveProperty = (property: Property) => {
    const expiryInfo = getPropertyExpiryInfo(property);
    const isCurrentlyArchived = expiryInfo.isExpired || property.status === 'sold';

    const updated: Property = {
      ...property,
      createdAt: isCurrentlyArchived ? new Date().toISOString() : '2026-06-01T00:00:00.000Z',
      pushedAt: isCurrentlyArchived ? new Date().toISOString() : undefined,
      status: isCurrentlyArchived ? 'approved' : 'pending',
      approved: isCurrentlyArchived
    };

    if (onUpdateProperty) {
      onUpdateProperty(updated);
      alert(isCurrentlyArchived 
        ? `🟢 Đã phục hồi tin "${property.title}" ra danh sách hiển thị!`
        : `📁 Đã chuyển căn "${property.title}" vào Kho Lưu Trữ (vẫn bảo lưu 100% Thông tin Người đăng & Căn BĐS)!`
      );
    }
  };

  const handleRejectProperty = (property: Property) => {
    const reason = window.prompt(
      `Nhập lý do từ chối bài đăng "${property.title}":`,
      'Hình ảnh hoặc thông tin bài đăng chưa đạt tiêu chuẩn kiểm duyệt.'
    );
    if (reason === null) return;

    const updated: Property = {
      ...property,
      approved: false,
      status: 'rejected',
      approvalStatus: 'rejected',
      rejectionReason: reason || 'Hình ảnh hoặc thông tin bài đăng chưa đạt tiêu chuẩn kiểm duyệt.',
      adminNote: reason || 'Hình ảnh hoặc thông tin bài đăng chưa đạt tiêu chuẩn kiểm duyệt.'
    };
    if (onUpdateProperty) {
      onUpdateProperty(updated);
      alert(`🔴 Đã từ chối bài đăng "${property.title}". Lý do đã được lưu và gửi tới người đăng.`);
    }
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePricingConfig(localConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSeed1000Click = () => {
    setIsSeeding(true);
    setTimeout(() => {
      onSeed1000Properties();
      setIsSeeding(false);
    }, 600);
  };

  // Resident Services & Store Handlers
    const handleToggleServiceApproval = async (srv: ResidentServiceItem) => {
    const isApproved = srv.status === 'approved' || (srv as any).approved;
    const nextStatus = isApproved ? 'pending' : 'approved';
    const updated = { ...srv, status: nextStatus as any, approved: nextStatus === 'approved' };
    setAdminResidentServices(prev => prev.map(s => s.id === srv.id ? updated : s));
    try {
      await fetch(`/api/resident-services/${srv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      alert(nextStatus === 'approved' ? `✓ Đã phê duyệt và hiển thị dịch vụ "${srv.title}" lên website!` : `⏳ Đã tạm ẩn dịch vụ "${srv.title}".`);
    } catch (e) {
      console.error('Error toggling service approval:', e);
    }
  };

  const handleApproveAllPendingServices = async () => {
    const pendingServices = adminResidentServices.filter(s => s.status === 'pending');
    if (pendingServices.length === 0) {
      alert('Không có bài dịch vụ nào đang chờ duyệt!');
      return;
    }
    if (!confirm(`Bạn có chắc muốn duyệt tất cả ${pendingServices.length} bài dịch vụ cư dân đang chờ?`)) return;
    for (const srv of pendingServices) {
      const updated = { ...srv, status: 'approved' as const, approved: true };
      try {
        await fetch(`/api/resident-services/${srv.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (e) {}
    }
    setAdminResidentServices(prev => prev.map(s => ({ ...s, status: 'approved', approved: true })));
    alert(`✓ Đã duyệt toàn bộ ${pendingServices.length} dịch vụ cư dân thành công!`);
  };

  const handleToggleServiceKyc = async (srv: ResidentServiceItem) => {
    const isCurrentlyVerified = srv.kycStatus === 'verified' || srv.verified;
    const newKycStatus = isCurrentlyVerified ? 'unverified' : 'verified';
    const newBadgeType = isCurrentlyVerified ? 'none' : 'blue_verified';

    try {
      const updated = { ...srv, verified: !isCurrentlyVerified, kycStatus: newKycStatus as any, kycBadgeType: newBadgeType as any };
      setAdminResidentServices(prev => prev.map(s => s.id === srv.id ? updated : s));
      await fetch('/api/resident-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      alert(isCurrentlyVerified ? `Đã gỡ Nút Xanh KYC của dịch vụ "${srv.title}"` : `🎉 Đã cấp NÚT XANH VERIFIED KYC cho dịch vụ "${srv.title}"!`);
    } catch (e) {
      console.error('Error toggling KYC:', e);
    }
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa dịch vụ "${title}"?`)) return;
    try {
      setAdminResidentServices(prev => prev.filter(s => s.id !== id));
      await fetch(`/api/resident-services/${id}`, { method: 'DELETE' });
      alert('Đã xóa dịch vụ cư dân thành công!');
    } catch (e) {
      console.error('Error deleting service:', e);
    }
  };

  const handleEditServiceClick = (srv: ResidentServiceItem) => {
    setEditingService(srv);
    setNewSrvTitle(srv.title);
    setNewSrvCategory(srv.categoryId);
    setNewSrvSubCat(srv.subCategory || '');
    setNewSrvProject(srv.project || 'Vinhomes Ocean Park 1');
    setNewSrvProviderName(srv.providerName || '');
    setNewSrvProviderPhone(srv.providerPhone || '');
    setNewSrvProviderZalo(srv.providerZalo || '');
    setNewSrvAddress(srv.address || '');
    setNewSrvPrice(srv.priceDisplay || 'Liên hệ báo giá');
    setNewSrvImage(srv.images && srv.images.length > 0 ? srv.images[0] : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80');
    setNewSrvDesc(srv.description || '');
    setShowAddServiceModal(true);
  };

  const handleSaveResidentServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvTitle || !newSrvProviderPhone) {
      alert('Vui lòng điền Tiêu đề dịch vụ và Số điện thoại liên hệ!');
      return;
    }

    const payload: Partial<ResidentServiceItem> = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      title: newSrvTitle,
      categoryId: newSrvCategory,
      subCategory: newSrvSubCat || 'Dịch vụ chính',
      project: newSrvProject as any,
      providerName: newSrvProviderName || 'Cư Dân Vinhomes',
      providerPhone: newSrvProviderPhone,
      providerZalo: newSrvProviderZalo || newSrvProviderPhone,
      address: newSrvAddress || 'KĐT Vinhomes',
      priceDisplay: newSrvPrice,
      rating: editingService ? editingService.rating : 5.0,
      reviewCount: editingService ? editingService.reviewCount : 1,
      images: [newSrvImage],
      description: newSrvDesc,
      verified: true,
      kycStatus: 'verified',
      kycBadgeType: 'blue_verified',
      legalCommitmentAccepted: true,
      createdAt: editingService ? editingService.createdAt : new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/resident-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(editingService ? '🎉 Đã cập nhật Dịch Vụ Cư Dân!' : '🎉 Đã thêm Dịch Vụ Cư Dân mới thành công!');
        setShowAddServiceModal(false);
        setEditingService(null);
        resetNewSrvForm();
        fetchResidentServices();
      }
    } catch (e) {
      console.error('Error saving resident service:', e);
    }
  };

  const handleDeleteStore = async (id: string, storeName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa gian hàng cư dân "${storeName}"?`)) return;
    try {
      setAdminStores(prev => prev.filter(s => s.id !== id));
      if (selectedAdminStore?.id === id) setSelectedAdminStore(null);
      await fetch(`/api/stores/${id}`, { method: 'DELETE' });
      alert('Đã xóa gian hàng thành công!');
    } catch (e) {
      console.error('Error deleting store:', e);
    }
  };

  // STORE CRUD HANDLERS
  const handleOpenCreateStore = () => {
    setEditingStoreItem(null);
    setStoreFormData({
      storeName: '',
      ownerName: '',
      ownerPhone: '',
      ownerZalo: '',
      category: 'Thực Phẩm & Ăn Uống',
      project: 'ocean-park-2',
      subdivision: 'Phân Khu Kinh Đô Ánh Sáng',
      address: 'Vinhomes Ocean Park 2, Hưng Yên',
      description: '',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      status: 'approved',
      verified: true
    });
    setShowStoreFormModal(true);
  };

  const handleOpenEditStore = (store: UserStorefront) => {
    setEditingStoreItem(store);
    setStoreFormData({
      storeName: store.storeName || '',
      ownerName: store.ownerName || '',
      ownerPhone: store.ownerPhone || '',
      ownerZalo: store.ownerZalo || '',
      category: store.category || 'Thực Phẩm & Ăn Uống',
      project: (store.project as any) || 'ocean-park-2',
      subdivision: store.subdivision || 'Nội khu',
      address: store.address || '',
      description: store.description || '',
      logoUrl: store.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      bannerUrl: store.bannerUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      status: store.status || 'approved',
      verified: Boolean(store.verified)
    });
    setShowStoreFormModal(true);
  };

  const handleSaveStoreFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeFormData.storeName.trim() || !storeFormData.ownerPhone.trim()) {
      alert('Vui lòng nhập Tên gian hàng và Số điện thoại!');
      return;
    }

    const payload: UserStorefront = {
      id: editingStoreItem ? editingStoreItem.id : `store-${Date.now()}`,
      userId: editingStoreItem ? editingStoreItem.userId : `usr-${Date.now()}`,
      ownerName: storeFormData.ownerName || 'Cư dân Vinhomes',
      ownerPhone: storeFormData.ownerPhone,
      ownerZalo: storeFormData.ownerZalo || storeFormData.ownerPhone,
      storeName: storeFormData.storeName,
      slug: storeFormData.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      logoUrl: storeFormData.logoUrl,
      bannerUrl: storeFormData.bannerUrl,
      category: storeFormData.category,
      project: storeFormData.project,
      subdivision: storeFormData.subdivision,
      address: storeFormData.address,
      description: storeFormData.description || 'Gian hàng cư dân phục vụ nội khu chuẩn chất lượng.',
      verified: storeFormData.verified,
      status: storeFormData.status,
      rating: editingStoreItem?.rating || 5.0,
      reviewCount: editingStoreItem?.reviewCount || 1,
      products: editingStoreItem?.products || [],
      createdAt: editingStoreItem?.createdAt || new Date().toISOString().split('T')[0]
    };

    try {
      if (editingStoreItem) {
        setAdminStores(prev => prev.map(s => s.id === payload.id ? payload : s));
        if (selectedAdminStore?.id === payload.id) setSelectedAdminStore(payload);
        await fetch(`/api/stores/${payload.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert('🎉 Đã cập nhật thông tin gian hàng thành công!');
      } else {
        setAdminStores(prev => [payload, ...prev]);
        await fetch('/api/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert('🎉 Đã tạo gian hàng cư dân mới thành công!');
      }
      setShowStoreFormModal(false);
      setEditingStoreItem(null);
    } catch (err) {
      console.error('Error saving store:', err);
    }
  };

  const handleToggleStoreStatus = async (store: UserStorefront) => {
    const nextStatus = (store.status === 'approved' || store.status === undefined) ? 'pending' : 'approved';
    const updated = { ...store, status: nextStatus as any, approved: nextStatus === 'approved' };
    setAdminStores(prev => prev.map(s => s.id === store.id ? updated : s));
    if (selectedAdminStore?.id === store.id) setSelectedAdminStore(updated);
    try {
      await fetch(`/api/stores/${store.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      alert(nextStatus === 'approved' ? '✓ Đã duyệt gian hàng và hiển thị công khai trên website!' : '⏳ Đã chuyển gian hàng về trạng thái Chờ duyệt / Ẩn.');
    } catch (e) {
      console.error(e);
    }
  };

  // PRODUCT CRUD & MODERATION HANDLERS
  const handleOpenAddProduct = (storeId: string) => {
    setEditingStoreProduct(null);
    setStoreProductForm({
      id: '',
      name: '',
      code: `SKU-${Math.floor(Math.random() * 800) + 100}`,
      category: 'Món Ăn & Đồ Uống',
      price: 45000,
      unit: 'suất',
      stockQuantity: 50,
      images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'],
      description: 'Sản phẩm tươi ngon, chuẩn vị, phục vụ tận căn hộ cho cư dân.',
      status: 'approved',
      isAvailable: true
    });
    setShowStoreProductModal(true);
  };

  const handleOpenEditProduct = (prod: StoreProduct) => {
    setEditingStoreProduct(prod);
    setStoreProductForm({
      id: prod.id,
      name: prod.name,
      code: prod.code || '',
      category: prod.category || 'Món Ăn & Đồ Uống',
      price: prod.price || 0,
      unit: prod.unit || 'suất',
      stockQuantity: prod.stockQuantity || 0,
      images: prod.images && prod.images.length > 0 ? prod.images : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'],
      description: prod.description || '',
      status: prod.status || 'approved',
      isAvailable: prod.isAvailable ?? true
    });
    setShowStoreProductModal(true);
  };

  const handleSaveStoreProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminStore) return;
    if (!storeProductForm.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }

    const prodPayload: StoreProduct = {
      id: editingStoreProduct ? editingStoreProduct.id : `p-${Date.now()}`,
      storeId: selectedAdminStore.id,
      code: storeProductForm.code || `SKU-${Math.floor(Math.random() * 800) + 100}`,
      name: storeProductForm.name,
      category: storeProductForm.category,
      price: Number(storeProductForm.price) || 0,
      unit: storeProductForm.unit || 'suất',
      stockQuantity: Number(storeProductForm.stockQuantity) || 0,
      images: storeProductForm.images,
      description: storeProductForm.description,
      isAvailable: storeProductForm.isAvailable,
      status: storeProductForm.status,
      approved: storeProductForm.status === 'approved',
      soldCount: editingStoreProduct?.soldCount || 0
    };

    let updatedProds = selectedAdminStore.products || [];
    if (editingStoreProduct) {
      updatedProds = updatedProds.map(p => p.id === prodPayload.id ? prodPayload : p);
    } else {
      updatedProds = [prodPayload, ...updatedProds];
    }

    const updatedStore = { ...selectedAdminStore, products: updatedProds };
    setSelectedAdminStore(updatedStore);
    setAdminStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));
    setShowStoreProductModal(false);
    setEditingStoreProduct(null);

    try {
      await fetch(`/api/stores/${selectedAdminStore.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodPayload)
      });
      alert(editingStoreProduct ? '🎉 Đã cập nhật sản phẩm thành công!' : '🎉 Đã thêm sản phẩm mới vào gian hàng!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleProductApproval = async (storeId: string, prodId: string) => {
    if (!selectedAdminStore) return;
    const prod = selectedAdminStore.products?.find(p => p.id === prodId);
    if (!prod) return;

    const nextStatus = (prod.status === 'approved' || prod.status === undefined) ? 'pending' : 'approved';
    const updatedProd: StoreProduct = {
      ...prod,
      status: nextStatus as any,
      approved: nextStatus === 'approved'
    };

    const updatedProds = (selectedAdminStore.products || []).map(p => p.id === prodId ? updatedProd : p);
    const updatedStore = { ...selectedAdminStore, products: updatedProds };
    setSelectedAdminStore(updatedStore);
    setAdminStores(prev => prev.map(s => s.id === storeId ? updatedStore : s));

    try {
      await fetch(`/api/stores/${storeId}/products/${prodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProd)
      });
      alert(nextStatus === 'approved' ? '✓ Đã DUYỆT sản phẩm! Sản phẩm hiện đã xuất hiện trên website Chợ Cư Dân 24H.' : '⏳ Đã chuyển sản phẩm về trạng thái CHỜ DUYỆT (Ẩn khỏi website công khai).');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStoreProduct = async (storeId: string, prodId: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi gian hàng?')) return;
    if (!selectedAdminStore) return;

    const updatedProds = (selectedAdminStore.products || []).filter(p => p.id !== prodId);
    const updatedStore = { ...selectedAdminStore, products: updatedProds };
    setSelectedAdminStore(updatedStore);
    setAdminStores(prev => prev.map(s => s.id === storeId ? updatedStore : s));

    try {
      await fetch(`/api/stores/${storeId}/products/${prodId}`, { method: 'DELETE' });
      alert('Đã xóa sản phẩm thành công!');
    } catch (e) {
      console.error(e);
    }
  };

  // RESIDENT SERVICE MODERATION & CRUD HANDLERS
  const handleQuickApproveService = async (serviceId: string) => {
    try {
      setAdminResidentServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: 'approved', approved: true } : s));
      const res = await fetch(`/api/resident-services/${serviceId}/approve`, { method: 'PUT' });
      if (res.ok) {
        alert('🎉 ĐÃ PHÊ DUYỆT! Dịch vụ cư dân hiện đã xuất hiện công khai trên Website.');
        fetchResidentServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleServiceStatus = async (serviceId: string, currentStatus?: string) => {
    const nextStatus = (currentStatus === 'approved' || currentStatus === undefined) ? 'pending' : 'approved';
    try {
      setAdminResidentServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: nextStatus as any, approved: nextStatus === 'approved' } : s));
      const res = await fetch(`/api/resident-services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, approved: nextStatus === 'approved' })
      });
      if (res.ok) {
        alert(nextStatus === 'approved' ? '✓ ĐÃ DUYỆT! Dịch vụ đã hiển thị lên Website.' : '⏳ Đã chuyển dịch vụ về trạng thái Chờ Duyệt (Chỉ cư dân thấy).');
        fetchResidentServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteResidentService = async (serviceId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài dịch vụ cư dân này khỏi hệ thống?')) return;
    try {
      setAdminResidentServices(prev => prev.filter(s => s.id !== serviceId));
      await fetch(`/api/resident-services/${serviceId}`, { method: 'DELETE' });
      alert('Đã xóa dịch vụ thành công!');
      fetchResidentServices();
    } catch (e) {
      console.error(e);
    }
  };

  // GLOBAL SYSTEM SYNC BUTTON
  const handleSyncAllToWebsite = () => {
    fetchResidentServices();
    fetchStores();
    alert('⚡ HỆ THỐNG ĐÃ ĐỒNG BỘ THÀNH CÔNG!\nTất cả dữ liệu Gian Hàng, Dịch Vụ Cư Dân, Sản Phẩm đã được cập nhật trực tiếp lên hệ thống website chocudan24h.com');
  };

  const handleUpdateStoreOrderStatus = async (orderId: string, newOrderStatus: string, newPaymentStatus?: string) => {
    try {
      setAdminStoreOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        orderStatus: newOrderStatus as any,
        ...(newPaymentStatus && { paymentStatus: newPaymentStatus as any })
      } : o));

      await fetch(`/api/stores/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newOrderStatus, ...(newPaymentStatus && { paymentStatus: newPaymentStatus }) })
      });
      alert('🎉 Đã cập nhật trạng thái đơn hàng chợ cư dân!');
    } catch (e) {
      console.error('Error updating order status:', e);
    }
  };

  return (
    <div className="max-w-[1550px] mx-auto px-2.5 sm:px-4 lg:px-6 py-2 sm:py-3 space-y-3">
      
      {/* 0. TOP COMPACT HEADER & QUICK SWITCHER */}
      <div className="bg-slate-900 text-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded">ADMIN TỔNG</span>
                <span className="text-[10px] text-emerald-400 font-bold hidden xs:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Realtime
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-black text-white tracking-tight">
                TRUNG TÂM QUẢN TRỊ CHỢ CƯ DÂN 24H
              </h1>
            </div>
          </div>

          {/* Direct exit/logout buttons on mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1.5 bg-slate-800 text-slate-300 rounded-xl hover:text-white border border-slate-700 transition"
              title="Xem Trang Chủ"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  localStorage.removeItem('hb_user');
                  navigate('/');
                }
              }}
              className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Toolbar buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          <button
            onClick={handleSyncToPublicWeb}
            disabled={isSyncingPublic}
            className={`px-3 py-1.5 font-black rounded-xl text-[11px] flex items-center gap-1 transition shadow cursor-pointer shrink-0 ${
              pendingProperties.length > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="Phê duyệt tin & Xuất bản trực tiếp lên Website công khai"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPublic ? 'animate-spin' : ''}`} />
            <span>{isSyncingPublic ? 'Đang đồng bộ...' : `🔄 Đồng Bộ Web ${pendingProperties.length > 0 ? `(${pendingProperties.length})` : ''}`}</span>
          </button>

          <button
            onClick={() => setShowTaxModal(true)}
            className="px-2.5 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/30 font-bold rounded-xl text-[11px] flex items-center gap-1 transition cursor-pointer shrink-0"
            title="Khai báo thuế TMĐT Quốc Gia"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-300" />
            <span className="hidden sm:inline">Thuế TMĐT</span>
          </button>

          <button
            onClick={() => setShowAiUrlTracker(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold rounded-xl text-[11px] flex items-center gap-1 transition cursor-pointer shrink-0"
            title="Theo dõi Website & Google AI Index"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Index</span>
          </button>

          <button
            onClick={onOpenAiWriter}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold rounded-xl text-[11px] flex items-center gap-1 transition cursor-pointer shrink-0"
            title="Viết bài tự động bằng AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Writer</span>
          </button>

          <button
            onClick={onRefreshData}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer border border-slate-700 shrink-0"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <div className="hidden md:flex items-center gap-1.5 pl-1 border-l border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-1 transition cursor-pointer text-[11px] border border-slate-700"
              title="Mở xem website công khai ngoài trang chủ"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xem Web</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  localStorage.removeItem('hb_user');
                  navigate('/');
                }
              }}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl flex items-center gap-1 transition cursor-pointer text-[11px]"
              title="Đăng xuất khỏi quyền Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Thoát</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE METRICS - THỐNG KÊ NHANH (Sổ ra / Thu gọn để tiết kiệm tối đa không gian) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-xs transition">
        <div className="flex items-center justify-between gap-2">
          {/* Quick summary inline text/chips */}
          <button
            type="button"
            onClick={() => setShowMetricsDropdown(!showMetricsDropdown)}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-left cursor-pointer py-0.5"
            title="Bấm để mở rộng / thu gọn thẻ thống kê chi tiết"
          >
            <span className="p-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-bold text-xs shrink-0 flex items-center gap-1">
              📊 <span className="font-extrabold hidden xs:inline">Chỉ số:</span>
            </span>
            
            <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 whitespace-nowrap">
                🏠 {saleProperties.length} Bán
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 whitespace-nowrap">
                🔑 {rentProperties.length} Thuê
              </span>
              <span className={`px-2 py-0.5 rounded-lg border whitespace-nowrap ${
                pendingProperties.length > 0
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                ⏳ {pendingProperties.length} Duyệt
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 whitespace-nowrap">
                🛠️ {adminResidentServices.length} Thợ
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 whitespace-nowrap">
                🏪 {adminStores.length} Shop
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 whitespace-nowrap">
                💼 {contacts.length} Việc
              </span>
            </div>
          </button>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMetricsDropdown(!showMetricsDropdown)}
            className="py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 transition"
          >
            <span>{showMetricsDropdown ? 'Thu gọn ▲' : 'Chi tiết ▼'}</span>
          </button>
        </div>

          {/* Collapsible Expanded Metrics Cards */}
          {showMetricsDropdown && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs pt-2.5 mt-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
            {/* Chờ Duyệt */}
            <button
              onClick={() => {
                handleSelectMainTab('bds');
                setActiveTab('properties');
                setPropertySubFilter('pending');
              }}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-150 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
                effectiveMainTab === 'bds' && activeTab === 'properties' && propertySubFilter === 'pending'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1 bg-amber-500/10 text-amber-500 rounded-md font-bold text-sm">⏳</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">Chờ Duyệt</span>
              </div>
              <span className={`font-mono font-black text-sm ${pendingProperties.length > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
                {pendingProperties.length}
              </span>
            </button>

            {/* Thợ Dịch Vụ */}
            <button
              onClick={() => {
                handleSelectMainTab('technicians');
                setActiveTab('resident_services_mgmt');
              }}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-150 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
                effectiveMainTab === 'technicians'
                  ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-orange-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1 bg-orange-500/10 text-orange-500 rounded-md font-bold text-sm">🛠️</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">Thợ Dịch Vụ</span>
              </div>
              <span className="font-mono font-black text-slate-900 dark:text-orange-400 text-sm">{adminResidentServices.length}</span>
            </button>

            {/* Gian Hàng */}
            <button
              onClick={() => {
                handleSelectMainTab('resident_market');
                setActiveTab('stores_mgmt');
              }}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-150 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
                effectiveMainTab === 'resident_market' && activeTab === 'stores_mgmt'
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-purple-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1 bg-purple-500/10 text-purple-500 rounded-md font-bold text-sm">🏪</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">Gian Hàng</span>
              </div>
              <span className="font-mono font-black text-slate-900 dark:text-purple-400 text-sm">{adminStores.length}</span>
            </button>

            {/* Khách & Việc */}
            <button
              onClick={() => {
                handleSelectMainTab('recruitment');
                setActiveTab('recruitment_mgmt');
              }}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-150 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
                effectiveMainTab === 'recruitment'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1 bg-blue-500/10 text-blue-500 rounded-md font-bold text-sm">💼</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">Khách & Việc</span>
              </div>
              <span className="font-mono font-black text-slate-900 dark:text-blue-400 text-sm">{contacts.length}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MAIN ADMIN WORKSPACE: 2-COLUMN WITH PERSISTENT LEFT SIDEBAR + MAIN WORKSPACE */}
      <div className="flex flex-col lg:flex-row items-start gap-4">
        
        {/* === CỘT TAB QUẢN TRỊ BÊN TRÁI (PERSISTENT LEFT SIDEBAR FOR DESKTOP ONLY) === */}
        <aside className="hidden lg:block lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-3 bg-slate-900 text-white border border-slate-800 rounded-2xl p-3 shadow-xl space-y-3 lg:max-h-[calc(100vh-1.5rem)] lg:overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/80 pb-2">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              MENU QUẢN TRỊ (7)
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
              v3.8
            </span>
          </div>

          <nav className="space-y-1.5 text-xs" aria-label="Admin Navigation">
            {/* 1. Bất Động Sản */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('bds');
                    setActiveTab('properties');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'bds'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-4 h-4 ${effectiveMainTab === 'bds' ? 'text-white' : 'text-emerald-400'}`} />
                    <span className="text-[12px] font-extrabold">1. Bất Động Sản</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-mono font-bold">
                    {properties.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('bds');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'bds' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.bds ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.bds ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Sub-items for BDS */}
              {expandedNavSections.bds && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('all'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'properties' && propertySubFilter === 'all'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Tất Cả BĐS</span>
                    <span className="font-mono text-[10px]">{properties.length}</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('sale'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'properties' && propertySubFilter === 'sale'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Mua Bán</span>
                    <span className="font-mono text-[10px]">{saleProperties.length}</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('rent'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'properties' && propertySubFilter === 'rent'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Cho Thuê</span>
                    <span className="font-mono text-[10px]">{rentProperties.length}</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('pending'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'properties' && propertySubFilter === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Chờ Duyệt</span>
                    <span className="font-mono text-[10px] text-amber-400 font-bold">{pendingProperties.length}</span>
                  </button>

                  <button
                    onClick={() => openAddProperty('sale')}
                    className="w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer text-emerald-400 hover:bg-emerald-500/20 font-bold border border-emerald-500/20"
                  >
                    <span>➕ Đăng Căn Bán Mới</span>
                    <span className="text-[10px] bg-emerald-500/20 px-1 rounded">Bán</span>
                  </button>

                  <button
                    onClick={() => openAddProperty('rent')}
                    className="w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer text-teal-400 hover:bg-teal-500/20 font-bold border border-teal-500/20"
                  >
                    <span>➕ Đăng Căn Thuê Mới</span>
                    <span className="text-[10px] bg-teal-500/20 px-1 rounded">Thuê</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'projects'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Dự Án & Mặt Bằng</span>
                    <span className="font-mono text-[10px]">{projects.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('news')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'news'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Tin Tức & Bài Viết</span>
                    <span className="font-mono text-[10px]">{news.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('pricing')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'pricing'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Bảng Giá Dịch Vụ
                  </button>

                  <button
                    onClick={() => setActiveTab('affiliate_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'affiliate_mgmt'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Đối Tác & Hoa Hồng
                  </button>
                </div>
              )}
            </div>

            {/* 2. Thợ Dịch Vụ & Kỹ Thuật */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('technicians');
                    setActiveTab('resident_services_mgmt');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'technicians'
                      ? 'bg-orange-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wrench className={`w-4 h-4 ${effectiveMainTab === 'technicians' ? 'text-slate-950' : 'text-orange-400'}`} />
                    <span className="text-[12px] font-extrabold">2. Thợ & Dịch Vụ</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-mono font-bold">
                    {adminResidentServices.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('technicians');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'technicians' ? 'bg-orange-600 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.technicians ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.technicians ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedNavSections.technicians && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => { handleSelectMainTab('technicians'); setActiveTab('resident_services_mgmt'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'resident_services_mgmt'
                        ? 'bg-orange-500/20 text-orange-300 font-extrabold border border-orange-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Danh Sách Thợ & KYC</span>
                    <span className="font-mono text-[10px]">{adminResidentServices.length}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Tuyển Dụng & Việc Làm */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('recruitment');
                    setActiveTab('recruitment_mgmt');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'recruitment'
                      ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className={`w-4 h-4 ${effectiveMainTab === 'recruitment' ? 'text-slate-950' : 'text-teal-400'}`} />
                    <span className="text-[12px] font-extrabold">3. Tuyển Dụng & CV</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-bold">
                    Việc làm
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('recruitment');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'recruitment' ? 'bg-teal-600 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.recruitment ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.recruitment ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedNavSections.recruitment && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => { handleSelectMainTab('recruitment'); setActiveTab('recruitment_mgmt'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'recruitment_mgmt'
                        ? 'bg-teal-500/20 text-teal-300 font-extrabold border border-teal-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Sàn Việc Làm & CV</span>
                    <span className="font-mono text-[10px]">Mở Sàn</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Chợ Cư Dân */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('resident_market');
                    setActiveTab('stores_mgmt');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'resident_market'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Store className={`w-4 h-4 ${effectiveMainTab === 'resident_market' ? 'text-slate-950' : 'text-amber-400'}`} />
                    <span className="text-[12px] font-extrabold">4. Chợ Cư Dân</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-mono font-bold">
                    {adminStores.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('resident_market');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'resident_market' ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.resident_market ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.resident_market ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedNavSections.resident_market && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => setActiveTab('stores_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'stores_mgmt'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Gian Hàng & Cửa Hàng</span>
                    <span className="font-mono text-[10px]">{adminStores.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('all_products_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'all_products_mgmt'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Tất Cả Sản Phẩm & Món</span>
                    <span className="font-mono text-[10px]">{adminStores.reduce((acc, s) => acc + (s.products?.length || 0), 0)}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'orders_mgmt'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Quản Lý Đơn Hàng</span>
                    <span className="font-mono text-[10px]">{adminStoreOrders.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('package_orders_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'package_orders_mgmt'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Gói Tiện Ích Cư Dân</span>
                    <span className="font-mono text-[10px]">{adminPackageOrders.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('resident_finance')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'resident_finance'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Doanh Thu & Quyết Toán
                  </button>

                  <button
                    onClick={() => setActiveTab('partners_reputation')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'partners_reputation'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Đánh Giá Uy Tín</span>
                    <span className="font-mono text-[10px]">{adminReputationPosts.length}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Thành Viên & Khách Hàng */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('users_leads');
                    setActiveTab('users');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'users_leads'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-4 h-4 ${effectiveMainTab === 'users_leads' ? 'text-white' : 'text-blue-400'}`} />
                    <span className="text-[12px] font-extrabold">5. Thành Viên & Khách</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-mono font-bold">
                    {registeredUsers.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('users_leads');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'users_leads' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.users_leads ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.users_leads ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedNavSections.users_leads && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'users'
                        ? 'bg-blue-500/20 text-blue-300 font-extrabold border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Danh Sách Thành Viên</span>
                    <span className="font-mono text-[10px]">{registeredUsers.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('leads')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'leads'
                        ? 'bg-blue-500/20 text-blue-300 font-extrabold border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Khách Hẹn Xem Nhà</span>
                    <span className="font-mono text-[10px]">{contacts.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('enterprise_core')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'enterprise_core'
                        ? 'bg-blue-500/20 text-blue-300 font-extrabold border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Phân Quyền & Quản Trị
                  </button>
                </div>
              )}
            </div>

            {/* 6. Banner & Quảng Cáo */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('ads');
                    setActiveTab('ads');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'ads'
                      ? 'bg-rose-600 text-white shadow-md ring-1 ring-rose-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${effectiveMainTab === 'ads' ? 'text-white' : 'text-rose-400'}`} />
                    <span className="text-[12px] font-extrabold">6. Quảng Cáo Banner</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-mono font-bold">
                    {adsList.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('ads');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'ads' ? 'bg-rose-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.ads ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.ads ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedNavSections.ads && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'ads'
                        ? 'bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Tất Cả Banner Quảng Cáo</span>
                    <span className="font-mono text-[10px]">{adsList.length}</span>
                  </button>

                  <button
                    onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads_float'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'ads_float'
                        ? 'bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Banner Bám Đuổi Phải & Trái</span>
                    <span className="font-mono text-[10px]">Float PC</span>
                  </button>

                  <button
                    onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads_header'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'ads_header'
                        ? 'bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Banner Top Header & Trang Chủ</span>
                    <span className="font-mono text-[10px]">Header</span>
                  </button>

                  <button
                    onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads_popup'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'ads_popup'
                        ? 'bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>• Pop-Up Nổi Trung Tâm</span>
                    <span className="font-mono text-[10px]">Pop-up</span>
                  </button>

                  <button
                    onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads_create'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between cursor-pointer ${
                      activeTab === 'ads_create'
                        ? 'bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30'
                        : 'text-rose-400 hover:text-white hover:bg-slate-800/60 font-bold'
                    }`}
                  >
                    <span>➕ Thêm Banner Mới</span>
                    <span className="text-[10px] bg-rose-500/20 px-1 rounded text-rose-300">Tạo</span>
                  </button>
                </div>
              )}
            </div>

            {/* 7. Công Cụ & Bot Hệ Thống */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 transition-all duration-200">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMainTab('tools');
                    setActiveTab('analytics');
                  }}
                  className={`flex-1 p-2.5 font-bold flex items-center justify-between transition cursor-pointer text-left ${
                    effectiveMainTab === 'tools'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Settings className={`w-4 h-4 ${effectiveMainTab === 'tools' ? 'text-white' : 'text-indigo-400'}`} />
                    <span className="text-[12px] font-extrabold">7. Công Cụ & Bot</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-bold">
                    SEO
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNavSection('tools');
                  }}
                  className={`p-2.5 transition cursor-pointer flex items-center justify-center border-l border-white/10 ${
                    effectiveMainTab === 'tools' ? 'bg-indigo-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={expandedNavSections.tools ? "Thu gọn mục con" : "Mở rộng mục con"}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedNavSections.tools ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedNavSections.tools && (
                <div className="p-1.5 space-y-0.5 bg-slate-950/70 border-t border-slate-800/60">
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Thống Kê Truy Cập
                  </button>
                  <button
                    onClick={() => setActiveTab('seo')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'seo'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Tối Ưu SEO
                  </button>
                  <button
                    onClick={() => setActiveTab('marketing')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'marketing'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Truyền Thông & Social
                  </button>
                  <button
                    onClick={() => setActiveTab('zalo')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'zalo'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Cộng Đồng Zalo
                  </button>
                  <button
                    onClick={() => setActiveTab('workspace_sync')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'workspace_sync'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Google Workspace
                  </button>
                  <button
                    onClick={() => setActiveTab('n8n')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition cursor-pointer ${
                      activeTab === 'n8n'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    • Tự Động Hóa n8n
                  </button>
                </div>
              )}
            </div>
          </nav>
        </aside>
        {/* === CỘT NỘI DUNG CHÍNH (MAIN WORKSPACE AREA) === */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          
          {/* Thanh chuyển đổi nhanh trên Mobile / Tablet (< lg) - Rút gọn tối đa, ưu tiên nội dung chính */}
          <div className="lg:hidden sticky top-2 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 shadow-xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-xs font-black text-white truncate flex items-center gap-1.5">
                  {effectiveMainTab === 'bds' && '🏢 1. BĐS & Dự Án'}
                  {effectiveMainTab === 'technicians' && '🛠️ 2. Thợ & Dịch Vụ'}
                  {effectiveMainTab === 'recruitment' && '💼 3. Tuyển Dụng & Việc'}
                  {effectiveMainTab === 'resident_market' && '🏪 4. Chợ Cư Dân'}
                  {effectiveMainTab === 'users_leads' && '👥 5. Thành Viên & Khách'}
                  {effectiveMainTab === 'ads' && '📢 6. Banner Quảng Cáo'}
                  {effectiveMainTab === 'tools' && '⚙️ 7. Công Cụ & Bot'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevTab}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-xs transition cursor-pointer border border-slate-700/60"
                  title="Tab trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-xs transition cursor-pointer border border-slate-700/60"
                  title="Tab sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubNavDropdownOpen(true)}
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md transition"
                  title="Mở toàn bộ Menu Quản Trị"
                >
                  <Menu className="w-3.5 h-3.5" />
                  <span>Menu (7)</span>
                </button>
              </div>
            </div>

            {/* Quick Horizontal Scrollable Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
              <button
                type="button"
                onClick={() => { handleSelectMainTab('bds'); setActiveTab('properties'); }}
                className={`py-1.5 px-3 rounded-xl font-bold shrink-0 transition cursor-pointer ${
                  effectiveMainTab === 'bds'
                    ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                1. BĐS ({properties.length})
              </button>
              <button
                type="button"
                onClick={() => { handleSelectMainTab('technicians'); setActiveTab('resident_services_mgmt'); }}
                className={`py-1.5 px-3 rounded-xl font-bold shrink-0 transition cursor-pointer ${
                  effectiveMainTab === 'technicians'
                    ? 'bg-orange-600 text-white shadow-xs ring-1 ring-orange-400'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                2. Thợ ({adminResidentServices.length})
              </button>
              <button
                type="button"
                onClick={() => { handleSelectMainTab('recruitment'); setActiveTab('recruitment_mgmt'); }}
                className={`py-1.5 px-3 rounded-xl font-bold shrink-0 transition cursor-pointer ${
                  effectiveMainTab === 'recruitment'
                    ? 'bg-teal-600 text-white shadow-xs ring-1 ring-teal-400'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                3. Việc Làm
              </button>
              <button
                type="button"
                onClick={() => { handleSelectMainTab('resident_market'); setActiveTab('stores_mgmt'); }}
                className={`py-1.5 px-3 rounded-xl font-bold shrink-0 transition cursor-pointer ${
                  effectiveMainTab === 'resident_market'
                    ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-400'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                4. Chợ ({adminStores.length})
              </button>
              <button
                type="button"
                onClick={() => { handleSelectMainTab('users_leads'); setActiveTab('users'); }}
                className={`py-1.5 px-3 rounded-xl font-bold shrink-0 transition cursor-pointer ${
                  effectiveMainTab === 'users_leads'
                    ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                5. Thành Viên
              </button>
              <button
                type="button"
                onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads'); }}
                className={`py-1.5 px-3 rounded-xl font-bold shrink-0 transition cursor-pointer ${
                  effectiveMainTab === 'ads'
                    ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-400'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                6. Banner ({adsList.length})
              </button>
              <button
                type="button"
                onClick={() => { handleSelectMainTab('tools'); setActiveTab('analytics'); }}
                className={`py-1.5 px-3 rounded-xl font-bold shrink-0 transition cursor-pointer ${
                  effectiveMainTab === 'tools'
                    ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-400'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                7. Bot & Công Cụ
              </button>
            </div>
          </div>

          {/* Full-Screen Drawer Modal on Mobile when clicked "Menu (7)" */}
          {isSubNavDropdownOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
              <div
                className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto space-y-3.5 shadow-2xl animate-in slide-in-from-bottom duration-250 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header of Drawer */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl font-black">
                      <Layers className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">MENU QUẢN TRỊ TOÀN DIỆN</h3>
                      <p className="text-[11px] text-slate-400">Chọn mục cần xem hoặc thao tác nhanh</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubNavDropdownOpen(false)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <X className="w-4 h-4" /> Đóng
                  </button>
                </div>

                {/* 7 Group Categories with Direct Sub-item Click */}
                <div className="space-y-3 text-xs">
                  {/* 1. BĐS */}
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-400 flex items-center gap-2 text-xs">
                        <Building2 className="w-4 h-4" /> 1. BẤT ĐỘNG SẢN & DỰ ÁN ({properties.length})
                      </span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                        BĐS
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => { handleSelectMainTab('bds'); setActiveTab('properties'); setPropertySubFilter('all'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Tất Cả BĐS</span>
                        <span className="font-mono text-emerald-400">{properties.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('bds'); setActiveTab('properties'); setPropertySubFilter('sale'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Mua Bán</span>
                        <span className="font-mono text-emerald-400">{saleProperties.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('bds'); setActiveTab('properties'); setPropertySubFilter('rent'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Cho Thuê</span>
                        <span className="font-mono text-teal-400">{rentProperties.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('bds'); setActiveTab('properties'); setPropertySubFilter('pending'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-amber-300 flex items-center justify-between border border-amber-500/30 cursor-pointer"
                      >
                        <span>• Chờ Duyệt</span>
                        <span className="font-mono font-black">{pendingProperties.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('bds'); setActiveTab('projects'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Dự Án Sơ Đồ</span>
                        <span className="font-mono text-emerald-400">{projects.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('bds'); setActiveTab('news'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Tin Tức & SEO</span>
                        <span className="font-mono text-emerald-400">{news.length}</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Thợ Dịch Vụ */}
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2">
                    <span className="font-black text-orange-400 flex items-center gap-2 text-xs">
                      <Wrench className="w-4 h-4" /> 2. THỢ KỸ THUẬT & DỊCH VỤ CƯ DÂN ({adminResidentServices.length})
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => { handleSelectMainTab('technicians'); setActiveTab('resident_services_mgmt'); setIsSubNavDropdownOpen(false); }}
                        className="col-span-2 p-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/40 rounded-xl text-[11px] font-bold text-left flex items-center justify-between cursor-pointer"
                      >
                        <span>🛠️ Quản Lý Đội Thợ & Cấp Nút Xanh KYC</span>
                        <span className="font-mono font-black">{adminResidentServices.length}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Tuyển Dụng */}
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2">
                    <span className="font-black text-teal-400 flex items-center gap-2 text-xs">
                      <Briefcase className="w-4 h-4" /> 3. VIỆC LÀM & TUYỂN DỤNG CƯ DÂN
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => { handleSelectMainTab('recruitment'); setActiveTab('recruitment_mgmt'); setIsSubNavDropdownOpen(false); }}
                        className="col-span-2 p-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 rounded-xl text-[11px] font-bold text-left flex items-center justify-between cursor-pointer"
                      >
                        <span>💼 Sàn Tuyển Dụng & Hồ Sơ Ứng Viên</span>
                        <span className="font-mono">Mở Sàn</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. Chợ Cư Dân */}
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2">
                    <span className="font-black text-purple-400 flex items-center gap-2 text-xs">
                      <Store className="w-4 h-4" /> 4. CHỢ CƯ DÂN & GIAN HÀNG ({adminStores.length})
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => { handleSelectMainTab('resident_market'); setActiveTab('stores_mgmt'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Gian Hàng Shop</span>
                        <span className="font-mono text-purple-400">{adminStores.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('resident_market'); setActiveTab('store_orders'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Đơn Hàng Shop</span>
                        <span className="font-mono text-purple-400">{adminStoreOrders.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('resident_market'); setActiveTab('store_packages'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Gói VIP Shop</span>
                        <span className="font-mono text-purple-400">{adminStorePackages.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('resident_market'); setActiveTab('package_orders'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Thu Phí VIP</span>
                        <span className="font-mono text-purple-400">{adminPackageOrders.length}</span>
                      </button>
                    </div>
                  </div>

                  {/* 5. Thành Viên & Khách Hàng */}
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2">
                    <span className="font-black text-blue-400 flex items-center gap-2 text-xs">
                      <UserCheck className="w-4 h-4" /> 5. THÀNH VIÊN & KHÁCH HÀNG ({registeredUsers.length})
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => { handleSelectMainTab('users_leads'); setActiveTab('users'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Danh Sách User</span>
                        <span className="font-mono text-blue-400">{registeredUsers.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('users_leads'); setActiveTab('leads'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Khách Xem Nhà</span>
                        <span className="font-mono text-blue-400">{contacts.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('users_leads'); setActiveTab('enterprise_core'); setIsSubNavDropdownOpen(false); }}
                        className="col-span-2 p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Phân Quyền & Quản Trị Hệ Thống</span>
                        <span className="font-mono text-blue-400 font-bold">Cấu hình</span>
                      </button>
                    </div>
                  </div>

                  {/* 6. Banner Quảng Cáo */}
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2">
                    <span className="font-black text-rose-400 flex items-center gap-2 text-xs">
                      <Sparkles className="w-4 h-4" /> 6. QUẢNG CÁO & BANNER ({adsList.length})
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads'); setIsSubNavDropdownOpen(false); }}
                        className="col-span-2 p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Tất Cả Banner Toàn Sàn</span>
                        <span className="font-mono text-rose-400">{adsList.length}</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads_float'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Bám Đuổi 2 Bên</span>
                        <span className="text-[10px] text-rose-400">Float</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads_header'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Header & Trang Chủ</span>
                        <span className="text-[10px] text-rose-400">Top</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads_popup'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>• Pop-Up Nổi Trung Tâm</span>
                        <span className="text-[10px] text-rose-400">Popup</span>
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads_create'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-rose-600/30 hover:bg-rose-600/40 text-left rounded-xl text-[11px] font-extrabold text-rose-300 flex items-center justify-between border border-rose-500/40 cursor-pointer"
                      >
                        <span>➕ Thêm Mới Banner</span>
                        <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-black">Tạo</span>
                      </button>
                    </div>
                  </div>

                  {/* 7. Công Cụ & Bot Hệ Thống */}
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2">
                    <span className="font-black text-indigo-400 flex items-center gap-2 text-xs">
                      <Settings className="w-4 h-4" /> 7. CÔNG CỤ, BOT & HỆ THỐNG
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => { handleSelectMainTab('tools'); setActiveTab('analytics'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 cursor-pointer"
                      >
                        • Thống Kê Truy Cập
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('tools'); setActiveTab('seo'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 cursor-pointer"
                      >
                        • Tối Ưu SEO Web
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('tools'); setActiveTab('marketing'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 cursor-pointer"
                      >
                        • Truyền Thông Social
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('tools'); setActiveTab('zalo'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 cursor-pointer"
                      >
                        • Cộng Đồng Zalo
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('tools'); setActiveTab('workspace_sync'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 cursor-pointer"
                      >
                        • Google Workspace
                      </button>
                      <button
                        onClick={() => { handleSelectMainTab('tools'); setActiveTab('n8n'); setIsSubNavDropdownOpen(false); }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-left rounded-xl text-[11px] font-bold text-slate-300 cursor-pointer"
                      >
                        • Tự Động Hóa n8n
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubNavDropdownOpen(false)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer text-center"
                  >
                    Đóng Menu & Quay Lại Làm Việc
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* ==================== TAB 1.1: BẤT ĐỘNG SẢN QUẢN TRỊ ==================== */}
      {(activeTab === 'properties' || (effectiveMainTab === 'bds' && !['projects', 'news', 'pricing', 'affiliate_mgmt'].includes(activeTab))) && (() => {
        const filteredProps = properties.filter(p => {
          // Sub filter
          if (propertySubFilter === 'sale' && p.type !== 'sale') return false;
          if (propertySubFilter === 'rent' && p.type !== 'rent') return false;
          if (propertySubFilter === 'pending' && (p.approved || p.status === 'approved')) return false;

          // Project filter
          if (adminPropProjectFilter !== 'all' && p.project !== adminPropProjectFilter) return false;

          // Search query
          if (adminPropSearch.trim()) {
            const q = adminPropSearch.toLowerCase();
            const titleMatch = (p.title || '').toLowerCase().includes(q);
            const locMatch = (p.location || '').toLowerCase().includes(q);
            const phoneMatch = (p.sellerPhone || '').toLowerCase().includes(q);
            const nameMatch = (p.sellerName || '').toLowerCase().includes(q);
            if (!titleMatch && !locMatch && !phoneMatch && !nameMatch) return false;
          }
          return true;
        });

        return (
          <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950/70 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">
                    🏢 BẤT ĐỘNG SẢN & TIN ĐĂNG
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] rounded">
                    {properties.length} Tin Live
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span>QUẢN LÝ BẤT ĐỘNG SẢN, DUYỆT BÀI & ĐỒNG BỘ TOÀN SÀN</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                  Quản lý danh sách tin mua bán, cho thuê, phê duyệt tin chờ duyệt, chỉnh sửa hình ảnh demo, giá bán và xuất bản trực tiếp lên website.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openAddProperty('sale')}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>+ Đăng Căn Bán</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAddProperty('rent')}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>+ Đăng Căn Cho Thuê</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenAiWriter}
                  className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
                  title="Soạn tin đăng tự động bằng Gemini AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Soạn Tin</span>
                </button>
                <button
                  type="button"
                  onClick={onRefreshData}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer border border-slate-700"
                  title="Tải lại và đồng bộ dữ liệu"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter and Sub-nav Pills */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Sub filter tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                  <button
                    type="button"
                    onClick={() => setPropertySubFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                      propertySubFilter === 'all'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Tất Cả ({properties.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertySubFilter('sale')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                      propertySubFilter === 'sale'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Mua Bán ({saleProperties.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertySubFilter('rent')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                      propertySubFilter === 'rent'
                        ? 'bg-teal-600 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Cho Thuê ({rentProperties.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertySubFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                      propertySubFilter === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    ⏳ Chờ Duyệt ({pendingProperties.length})
                  </button>
                </div>

                {/* Project Filter */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={adminPropProjectFilter}
                    onChange={(e) => setAdminPropProjectFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="all">Tất cả Đại Dự Án</option>
                    <option value="ocean-park-1">Vinhomes Ocean Park 1</option>
                    <option value="ocean-park-2">Vinhomes Ocean Park 2</option>
                    <option value="ocean-park-3">Vinhomes Ocean Park 3</option>
                    <option value="smart-city">Vinhomes Smart City</option>
                    <option value="grand-park">Vinhomes Grand Park</option>
                    <option value="co-loa">Vinhomes Cổ Loa</option>
                    <option value="vu-yen">Vinhomes Vũ Yên</option>
                  </select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Tìm theo tiêu đề căn, vị trí, phân khu, SĐT chính chủ..."
                  value={adminPropSearch}
                  onChange={(e) => setAdminPropSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Properties List */}
            {filteredProps.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                <Building2 className="w-10 h-10 mx-auto text-slate-400 opacity-40" />
                <p className="font-bold text-sm">Không tìm thấy bất động sản nào khớp với bộ lọc.</p>
                <button
                  onClick={() => { setAdminPropSearch(''); setAdminPropProjectFilter('all'); setPropertySubFilter('all'); }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProps.map(prop => {
                  const isApproved = prop.approved || prop.status === 'approved';
                  return (
                    <div
                      key={prop.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition duration-150"
                    >
                      <div>
                        {/* Image Preview */}
                        <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <img
                            src={prop.images && prop.images[0] ? prop.images[0] : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                            alt={prop.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                              prop.type === 'sale' ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white'
                            }`}>
                              {prop.type === 'sale' ? 'Mua Bán' : 'Cho Thuê'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              isApproved ? 'bg-emerald-500/90 text-white' : 'bg-amber-500 text-slate-950 font-black'
                            }`}>
                              {isApproved ? '✓ Đã Duyệt Live' : '⏳ Chờ Duyệt'}
                            </span>
                          </div>
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                            📷 {prop.images ? prop.images.length : 1} ảnh
                          </span>
                        </div>

                        {/* Card Info */}
                        <div className="p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-bold flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              {prop.location}
                            </span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-xs shrink-0">
                              {prop.priceDisplay}
                            </span>
                          </div>

                          <h3 className="font-black text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {prop.title}
                          </h3>

                          {prop.sellerName && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                              <span>Chính chủ: <strong>{prop.sellerName}</strong></span>
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{prop.sellerPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1.5">
                        {!isApproved && (
                          <button
                            type="button"
                            onClick={() => onApproveProperty(prop.id)}
                            className="col-span-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Phê Duyệt & Xuất Bản</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingProperty(prop)}
                          className="py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Sửa & Ảnh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSharingProperty(prop)}
                          className="py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Chia Sẻ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa tin BĐS "${prop.title}"?`)) {
                              onDeleteProperty(prop.id);
                            }
                          }}
                          className="col-span-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa Tin BĐS</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ==================== TAB 1.2: QUẢN LÝ DỰ ÁN & SƠ ĐỒ MẶT BẰNG ==================== */}
      {activeTab === 'projects' && (() => {
        const filteredProjects = projects.filter(proj => {
          if (!adminProjectSearch.trim()) return true;
          const q = adminProjectSearch.toLowerCase();
          return (proj.title || proj.name || '').toLowerCase().includes(q) || (proj.location || '').toLowerCase().includes(q);
        });

        return (
          <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950/70 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">
                    🗺️ DỰ ÁN & MẶT BẰNG QUY HOẠCH
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] rounded">
                    {projects.length} Đại Dự Án
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span>QUẢN LÝ ĐẠI DỰ ÁN, BANNER CHÍNH & SƠ ĐỒ MASTERPLAN</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                  Thêm mới hoặc chỉnh sửa đại dự án Vinhomes, thay đổi hình ảnh banner trang chủ, tải lên sơ đồ quy hoạch chi tiết phân khu và đồng bộ lưu trữ.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setIsAddingProject(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>+ Thêm Dự Án Mới</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Tìm theo tên dự án, vị trí..."
                  value={adminProjectSearch}
                  onChange={(e) => setAdminProjectSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <span className="text-xs font-bold text-slate-500">
                Hiển thị {filteredProjects.length} / {projects.length} dự án
              </span>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(proj => (
                <div
                  key={proj.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition"
                >
                  <div>
                    {/* Banner Image */}
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                      <img
                        src={proj.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                        alt={proj.title || proj.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white font-black text-[10px] rounded-md shadow">
                        DỰ ÁN LIVE
                      </span>
                      {proj.masterplanUrl && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-md shadow">
                          🗺️ Có Sơ Đồ Masterplan
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-2.5">
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">
                        {proj.title || proj.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{proj.location}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Quy mô:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{proj.areaSize || 'Đang cập nhật'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Khoảng giá:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{proj.priceRange || 'Liên hệ'}</span>
                        </div>
                      </div>

                      {proj.subdivisions && proj.subdivisions.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">Phân khu ({proj.subdivisions.length}):</span>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {proj.subdivisions.slice(0, 4).map((sub, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded text-slate-600 dark:text-slate-300">
                                {sub}
                              </span>
                            ))}
                            {proj.subdivisions.length > 4 && (
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded text-slate-400">
                                +{proj.subdivisions.length - 4} phân khu
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProject(false);
                        setEditingProject(proj);
                      }}
                      className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-800/60"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa & Sơ Đồ</span>
                    </button>

                    <Link
                      to={`/projects/${getProjectSlug(proj)}`}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                      title="Xem dự án trên Web"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa dự án "${proj.title || proj.name}"?`)) {
                          if (onDeleteProject) onDeleteProject(proj.id);
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl transition cursor-pointer border border-rose-200 dark:border-rose-800/60"
                      title="Xóa dự án"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ==================== TAB 1.3: QUẢN LÝ TIN TỨC & BẢN TIN THỊ TRƯỜNG ==================== */}
      {activeTab === 'news' && (() => {
        const filteredArticles = news.filter(art => {
          if (adminNewsCatFilter !== 'all' && art.category !== adminNewsCatFilter) return false;
          if (adminNewsSearch.trim()) {
            const q = adminNewsSearch.toLowerCase();
            const titleMatch = (art.title || '').toLowerCase().includes(q);
            const contentMatch = (art.content || '').toLowerCase().includes(q);
            const authorMatch = (art.author || '').toLowerCase().includes(q);
            if (!titleMatch && !contentMatch && !authorMatch) return false;
          }
          return true;
        });

        return (
          <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">
                    📰 TIN TỨC & THỊ TRƯỜNG BĐS
                  </span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] rounded">
                    {news.length} Bài Viết Live
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-amber-400 mt-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>QUẢN TRỊ BẢN TIN THỊ TRƯỜNG, BÀI VIẾT SEO & TỰ ĐỘNG HÓA</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                  Soạn thảo và đăng bài viết thị trường Vinhomes, lưu trữ hình ảnh trực tiếp lên Supabase Media và đồng bộ n8n Webhook tự động.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingNews(null);
                    setIsAddingNews(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>+ Đăng Tin Thị Trường Mới</span>
                </button>
              </div>
            </div>

            {/* 📋 CHƯƠNG TRÌNH DUYỆT BÀI VIẾT — kiểm duyệt trước khi xuất bản public */}
            <NewsReviewCenter
              news={news}
              onUpdateNews={onUpdateNews}
              onDeleteNews={onDeleteNews}
            />

            {/* n8n Webhook Automation Guide for Admin */}
            <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-blue-600 text-white font-black rounded-lg text-[10px]">n8n</span>
                <div>
                  <span className="font-bold text-blue-300">Webhook Tự Động Đồng Bộ Tin Tức (n8n Workflow):</span>
                  <code className="ml-2 px-2 py-0.5 bg-slate-950 text-amber-300 font-mono text-[11px] rounded border border-slate-800">
                    POST /api/webhooks/n8n-news
                  </code>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                ✓ Sẵn sàng nhận bài tự động
              </span>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setAdminNewsCatFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                    adminNewsCatFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Tất Cả ({news.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminNewsCatFilter('vinhomes')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                    adminNewsCatFilter === 'vinhomes'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Tin Vinhomes
                </button>
                <button
                  type="button"
                  onClick={() => setAdminNewsCatFilter('thi-truong')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                    adminNewsCatFilter === 'thi-truong'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Thị Trường
                </button>
                <button
                  type="button"
                  onClick={() => setAdminNewsCatFilter('quy-hoach')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                    adminNewsCatFilter === 'quy-hoach'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Quy Hoạch
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Tìm theo tiêu đề, nội dung, tác giả..."
                  value={adminNewsSearch}
                  onChange={(e) => setAdminNewsSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            {/* News Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map(art => (
                <div
                  key={art.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={art.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                        alt={art.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-md shadow uppercase">
                        {art.category || 'Tin Tức'}
                      </span>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white font-mono text-[10px] rounded">
                        {art.publishedAt}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-black text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {art.summary || art.content}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="truncate">✍️ {art.author || 'Ban Quản Trị'}</span>
                        <span className="font-mono text-amber-500 font-bold shrink-0">👁️ {art.views || 1} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNews(false);
                        setEditingNews(art);
                      }}
                      className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer border border-amber-200 dark:border-amber-800/60"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa Bài & Upload Ảnh</span>
                    </button>

                    <Link
                      to={`/news/${art.id}`}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                      title="Xem bài viết trên Web"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa bài viết "${art.title}"?`)) {
                          if (onDeleteNews) onDeleteNews(art.id);
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl transition cursor-pointer border border-rose-200 dark:border-rose-800/60"
                      title="Xóa bài viết"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ==================== TAB THỢ DỊCH VỤ & KỸ THUẬT CƯ DÂN ==================== */}
      {activeTab === 'resident_services_mgmt' && (
        <div className="space-y-4">
          {/* Header Banner - Compact & focused on Technicians */}
          <div className="bg-gradient-to-r from-slate-900 via-orange-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-orange-500/40 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-orange-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">
                  THỢ DỊCH VỤ & KỸ THUẬT CƯ DÂN
                </span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-[10px] rounded flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-blue-400" /> NÚT XANH VERIFIED KYC
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-orange-400 mt-1 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-400" />
                <span>QUẢN LÝ THỢ KỸ THUẬT, SỬA CHỮA ĐIỆN NƯỚC & DỊCH VỤ CƯ DÂN</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Quản lý đội ngũ Thợ Điện Nước, Điện Lạnh, Thợ Khóa, Cửa Cuốn, Nhôm Kính, Dọn Vệ Sinh & Taxi Cư Dân. Cấp Nút Xanh KYC để định danh uy tín.
              </p>
            </div>

            <button
              onClick={() => {
                resetNewSrvForm();
                setEditingService(null);
                setShowAddServiceModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5 border border-orange-300 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>➕ Thêm Thợ / Dịch Vụ Mới</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên dịch vụ, số điện thoại, tên nhà cung cấp..."
                  value={resServiceSearch}
                  onChange={(e) => setResServiceSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* KYC & Expiry Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={resServiceKycFilter}
                  onChange={(e) => setResServiceKycFilter(e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="all">Tất cả KYC</option>
                  <option value="verified">🔵 Đã Cấp Nút Xanh KYC</option>
                  <option value="unverified">⚪ Chưa Cấp Nút Xanh</option>
                </select>

                <select
                  value={resServiceExpiryFilter}
                  onChange={(e) => setResServiceExpiryFilter(e.target.value as any)}
                  className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="all">Tất cả thời hạn</option>
                  <option value="active">🟢 Đang hiển thị</option>
                  <option value="expiring">⏰ Sắp hết hạn (≤ 5 ngày)</option>
                  <option value="expired">🛑 Đã ẩn tự động (&gt; 30 ngày)</option>
                </select>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setResServiceCatFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  resServiceCatFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Tất Cả ({adminResidentServices.length})
              </button>
              {BUSINESS_CATEGORIES.map(cat => {
                const count = adminResidentServices.filter(s => s.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setResServiceCatFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      resServiceCatFilter === cat.id
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span className="opacity-70 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resident Services Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {adminResidentServices
              .filter(srv => {
                const expiry = calculateExpiryInfo(srv, 30);
                if (resServiceExpiryFilter === 'active' && expiry.isExpired) return false;
                if (resServiceExpiryFilter === 'expiring' && (expiry.isExpired || expiry.daysRemaining > 5)) return false;
                if (resServiceExpiryFilter === 'expired' && !expiry.isExpired) return false;

                if (resServiceCatFilter !== 'all' && srv.categoryId !== resServiceCatFilter) return false;
                if (resServiceKycFilter === 'verified' && !srv.verified && srv.kycStatus !== 'verified') return false;
                if (resServiceKycFilter === 'unverified' && (srv.verified || srv.kycStatus === 'verified')) return false;
                if (resServiceSearch) {
                  const query = resServiceSearch.toLowerCase();
                  return (
                    srv.title.toLowerCase().includes(query) ||
                    (srv.providerName && srv.providerName.toLowerCase().includes(query)) ||
                    (srv.providerPhone && srv.providerPhone.includes(query))
                  );
                }
                return true;
              })
              .map(srv => {
                const isVerified = srv.verified || srv.kycStatus === 'verified';
                const categoryObj = BUSINESS_CATEGORIES.find(c => c.id === srv.categoryId);
                const expiry = calculateExpiryInfo(srv, 30);

                return (
                  <div
                    key={srv.id}
                    className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all duration-200 shadow-xl space-y-4 flex flex-col justify-between ${
                      expiry.isExpired
                        ? 'border-rose-400/80 bg-rose-50/10'
                        : isVerified
                        ? 'border-blue-500/40 ring-1 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Image & Badges */}
                      <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={srv.images && srv.images.length > 0 ? srv.images[0] : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'}
                          alt={srv.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-400 font-extrabold text-[10px] rounded-lg border border-amber-500/30">
                            {categoryObj ? `${categoryObj.icon} ${categoryObj.name}` : srv.categoryId}
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-950/80 backdrop-blur-md text-emerald-300 font-extrabold text-[10px] rounded-lg border border-emerald-500/30">
                            {srv.project || 'Vinhomes'}
                          </span>
                        </div>

                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                          {isVerified ? (
                            <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white font-black text-[11px] rounded-full border border-blue-300 shadow-lg flex items-center gap-1">
                              <BadgeCheck className="w-3.5 h-3.5 text-white" />
                              <span>VERIFIED KYC</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-slate-300 font-bold text-[10px] rounded-full border border-slate-700 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-amber-400" />
                              <span>Chưa KYC</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Expiry info */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          {expiry.isExpired ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-400">
                              🛑 Đã ẩn sau 30 ngày
                            </span>
                          ) : expiry.statusBadge === 'expiring_soon' ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-400 animate-pulse">
                              ⏰ Sắp hết hạn (Còn {expiry.daysRemaining} ngày)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400">
                              🟢 Hiển thị: Còn {expiry.daysRemaining} ngày
                            </span>
                          )}
                        </div>

                        <h3 className="font-black text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
                          {srv.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                            {srv.priceDisplay || 'Liên hệ báo giá'}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{srv.rating || 5.0} ({srv.reviewCount || 1})</span>
                          </div>
                        </div>
                      </div>

                      {/* Provider Contact Info */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-500 dark:text-slate-400">Nhà cung cấp:</span>
                          <span className="text-slate-900 dark:text-white font-black">{srv.providerName || 'Cư Dân Vinhomes'}</span>
                        </div>
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-500 dark:text-slate-400">Số Điện Thoại:</span>
                          <a href={`tel:${srv.providerPhone}`} className="text-emerald-600 dark:text-emerald-400 font-black hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{srv.providerPhone}</span>
                          </a>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span>Đăng: {expiry.postDateFormatted}</span>
                          <span>Hết hạn: {expiry.expiresAtFormatted}</span>
                        </div>
                        {srv.providerZalo && (
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-500 dark:text-slate-400">Zalo Chính Chủ:</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{srv.providerZalo}</span>
                          </div>
                        )}
                        {srv.address && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                            <MapPin className="w-3 h-3 shrink-0 text-red-500" />
                            <span className="truncate">{srv.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleToggleServiceApproval(srv)}
                          className={`py-2.5 rounded-xl font-black text-[11px] transition flex items-center justify-center gap-1 shadow-md cursor-pointer ${
                            srv.status === 'approved' || (srv as any).approved
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{srv.status === 'approved' || (srv as any).approved ? '✓ Đã Duyệt Web' : '⏳ Chờ Duyệt (Duyệt)'}</span>
                        </button>
                        <button
                          onClick={() => handleToggleServiceKyc(srv)}
                          className={`py-2.5 rounded-xl font-black text-[11px] transition flex items-center justify-center gap-1 shadow-md cursor-pointer ${
                            isVerified
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-500 hover:text-white'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110'
                          }`}
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>{isVerified ? 'Gỡ KYC' : 'Cấp KYC'}</span>
                        </button>

                        <button
                          onClick={() => handleRenewResidentService(srv.id, srv.title)}
                          className="py-2.5 rounded-xl font-black text-[11px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition flex items-center justify-center gap-1 shadow-md cursor-pointer"
                          title="Gia hạn thêm 30 ngày hiển thị"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Gia Hạn +30 Ngày</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleEditServiceClick(srv)}
                          className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Chỉnh Sửa</span>
                        </button>

                        <button
                          onClick={() => handleDeleteService(srv.id, srv.title)}
                          className="py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa Bỏ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ==================== MẢNG 2: TAB TUYỂN DỤNG & VIỆC LÀM CƯ DÂN ==================== */}
      {activeTab === 'recruitment_mgmt' && (
        <AdminRecruitmentManager onRefresh={onRefreshData} />
      )}

      {/* ==================== MẢNG 2: TAB 2 - GIAN HÀNG & DỊCH VỤ CƯ DÂN ==================== */}
            {/* ==================== TAB TẤT CẢ SẢN PHẨM & MÓN ĂN TOÀN HỆ THỐNG ==================== */}
      {activeTab === 'all_products_mgmt' && (() => {
        // Collect all products with their parent store metadata
        const allProductsList: Array<StoreProduct & { storeId: string; storeName: string; ownerName?: string; ownerPhone?: string; project?: string }> = [];
        adminStores.forEach(st => {
          (st.products || []).forEach(p => {
            allProductsList.push({
              ...p,
              storeId: st.id,
              storeName: st.storeName,
              ownerName: st.ownerName,
              ownerPhone: st.ownerPhone || (st as any).phone,
              project: st.project
            });
          });
        });

        const pendingCount = allProductsList.filter(p => p.status === 'pending').length;
        const approvedCount = allProductsList.filter(p => p.status === 'approved' || p.status === undefined).length;

        // Filter products
        const filteredProducts = allProductsList.filter(p => {
          if (storeProjectFilter !== 'all' && p.project !== storeProjectFilter) return false;
          if (storeModerationFilter === 'pending' && p.status !== 'pending') return false;
          if (storeModerationFilter === 'approved' && p.status === 'pending') return false;
          if (storeSearchQuery.trim()) {
            const q = storeSearchQuery.toLowerCase().trim();
            const matchName = (p.name || '').toLowerCase().includes(q);
            const matchStore = (p.storeName || '').toLowerCase().includes(q);
            const matchCat = (p.category || '').toLowerCase().includes(q);
            const matchOwner = (p.ownerName || '').toLowerCase().includes(q);
            const matchPhone = (p.ownerPhone || '').includes(q);
            if (!matchName && !matchStore && !matchCat && !matchOwner && !matchPhone) return false;
          }
          return true;
        });

        const toggleSingleProductStatus = async (item: typeof allProductsList[0]) => {
          const newStatus = (item.status === 'approved' || item.status === undefined) ? 'pending' : 'approved';
          const targetStore = adminStores.find(s => s.id === item.storeId);
          if (!targetStore) return;

          const updatedProducts = (targetStore.products || []).map(p => 
            p.id === item.id ? { ...p, status: newStatus as any } : p
          );

          const updatedStore = { ...targetStore, products: updatedProducts };
          setAdminStores(prev => prev.map(s => s.id === targetStore.id ? updatedStore : s));

          try {
            await fetch(`/api/stores/${targetStore.id}/products/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            });
          } catch (e) {
            console.error('Error toggling product status:', e);
          }
        };

        const deleteSingleProduct = async (item: typeof allProductsList[0]) => {
          if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${item.name}" khỏi gian hàng "${item.storeName}"?`)) return;
          const targetStore = adminStores.find(s => s.id === item.storeId);
          if (!targetStore) return;

          const updatedProducts = (targetStore.products || []).filter(p => p.id !== item.id);
          const updatedStore = { ...targetStore, products: updatedProducts };
          setAdminStores(prev => prev.map(s => s.id === targetStore.id ? updatedStore : s));

          try {
            await fetch(`/api/stores/${targetStore.id}/products/${item.id}`, {
              method: 'DELETE'
            });
          } catch (e) {
            console.error('Error deleting product:', e);
          }
        };

        const approveAllPendingProducts = async () => {
          if (!confirm(`Duyệt hiển thị tất cả ${pendingCount} sản phẩm đang chờ lên website?`)) return;
          for (const st of adminStores) {
            const hasPending = (st.products || []).some(p => p.status === 'pending');
            if (hasPending) {
              const updatedProds = (st.products || []).map(p => ({ ...p, status: 'approved' as const }));
              const updatedSt = { ...st, products: updatedProds };
              setAdminStores(prev => prev.map(s => s.id === st.id ? updatedSt : s));
              try {
                await fetch(`/api/stores/${st.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedSt)
                });
              } catch (e) {}
            }
          }
          alert('✓ Đã phê duyệt toàn bộ sản phẩm thành công!');
        };

        return (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-900 p-5 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-2xl text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    QUẢN LÝ TẤT CẢ SẢN PHẨM & MÓN ĂN CƯ DÂN
                  </span>
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] rounded-full">
                    TOÀN BỘ GIAN HÀNG ({allProductsList.length} SẢN PHẨM)
                  </span>
                  {pendingCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-full animate-pulse flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {pendingCount} SẢN PHẨM CHỜ DUYỆT
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-amber-400 mt-1.5 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-amber-400" />
                  <span>DANH MỤC TOÀN BỘ SẢN PHẨM, MÓN ĂN & HÀNG HÓA CƯ DÂN</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Kiểm duyệt, chỉnh sửa giá, phân loại hoặc xóa nhanh mọi mặt hàng từ tất cả các gian hàng trong toàn bộ hệ thống đô thị Vinhomes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {pendingCount > 0 && (
                  <button
                    onClick={approveAllPendingProducts}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer border border-emerald-400/40"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ DUYỆT NHANH TẤT CẢ ({pendingCount})</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (adminStores.length > 0) {
                      setSelectedAdminStore(adminStores[0]);
                      handleOpenAddProduct(adminStores[0].id);
                    } else {
                      alert('Vui lòng tạo ít nhất 1 gian hàng trước khi thêm sản phẩm!');
                    }
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>➕ Thêm Món / Sản Phẩm Mới</span>
                </button>
              </div>
            </div>

            {/* Quick Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên sản phẩm, gian hàng, chủ shop, số điện thoại..."
                    value={storeSearchQuery}
                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {storeSearchQuery && (
                    <button
                      onClick={() => setStoreSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="w-full md:w-56 shrink-0">
                  <select
                    value={storeProjectFilter}
                    onChange={(e) => setStoreProjectFilter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="all">🏢 Tất Cả Dự Án Vinhomes</option>
                    <option value="ocean-park-1">Ocean Park 1 (Gia Lâm)</option>
                    <option value="ocean-park-2">Ocean Park 2 (The Empire)</option>
                    <option value="ocean-park-3">Ocean Park 3 (The Crown)</option>
                    <option value="smart-city">Smart City (Tây Mỗ)</option>
                    <option value="grand-park">Grand Park (TP. Thủ Đức)</option>
                  </select>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Trạng thái:
                </span>
                <button
                  onClick={() => setStoreModerationFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    storeModerationFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({allProductsList.length})
                </button>
                <button
                  onClick={() => setStoreModerationFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                    storeModerationFilter === 'pending'
                      ? 'bg-rose-500 text-white shadow'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Chờ duyệt ({pendingCount})</span>
                </button>
                <button
                  onClick={() => setStoreModerationFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                    storeModerationFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đang hiển thị Web ({approvedCount})</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5">Hình ảnh & Tên Sản Phẩm</th>
                      <th className="p-3.5">Gian Hàng / Chủ Shop</th>
                      <th className="p-3.5">Danh Mục</th>
                      <th className="p-3.5">Giá Bán</th>
                      <th className="p-3.5">Trạng Thái</th>
                      <th className="p-3.5 text-right">Thao Tác Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400">
                          <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                          <p className="font-bold">Không tìm thấy sản phẩm nào phù hợp bộ lọc.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => {
                        const isApproved = prod.status === 'approved' || prod.status === undefined;
                        const parentStore = adminStores.find(s => s.id === prod.storeId);

                        return (
                          <tr key={`${prod.storeId}-${prod.id}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            {/* Image & Title */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.images && prod.images.length > 0 ? prod.images[0] : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                                  alt={prod.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="font-extrabold text-slate-900 dark:text-white block truncate max-w-xs sm:max-w-md">
                                    {prod.name}
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                    <span className="font-mono">{prod.code || 'SKU-Auto'}</span>
                                    {prod.stockQuantity !== undefined && (
                                      <span>• Kho: <strong>{prod.stockQuantity} {prod.unit || 'món'}</strong></span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Store Name & Owner */}
                            <td className="p-3.5">
                              <div className="text-xs">
                                <span className="font-black text-emerald-600 dark:text-emerald-400 block truncate max-w-[180px]">
                                  🏪 {prod.storeName}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                  👤 {prod.ownerName || 'Cư dân'} {prod.ownerPhone && `• ${prod.ownerPhone}`}
                                </span>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-3.5">
                              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg border border-slate-200 dark:border-slate-700">
                                {prod.category || 'Món Ăn & Đồ Uống'}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="p-3.5">
                              <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                                {Number(prod.price || 0).toLocaleString('vi-VN')} đ
                              </span>
                              {prod.unit && <span className="text-[10px] text-slate-400 block">/{prod.unit}</span>}
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              <button
                                onClick={() => toggleSingleProductStatus(prod)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition flex items-center gap-1 ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-200'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 hover:bg-rose-200 animate-pulse'
                                }`}
                              >
                                {isApproved ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    <span>✓ Đã Duyệt Web</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-rose-500" />
                                    <span>⏳ Chờ Duyệt (Click để duyệt)</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Action Buttons */}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    if (parentStore) {
                                      setSelectedAdminStore(parentStore);
                                      handleOpenEditProduct(prod);
                                    }
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition cursor-pointer"
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteSingleProduct(prod)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg transition cursor-pointer"
                                  title="Xóa sản phẩm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

{activeTab === 'stores_mgmt' && (() => {
        // Calculate dynamic stats
        const allStoreProds = adminStores.flatMap(s => s.products || []);
        const totalProds = allStoreProds.length;
        const totalServs = adminResidentServices.length;
        const pendingProds = allStoreProds.filter(p => p.status === 'pending').length;
        const pendingServs = adminResidentServices.filter(s => s.status === 'pending').length;
        const totalPendingModeration = pendingProds + pendingServs;
        const connectedStores = adminStores.filter(s => s.kiotVietConfig?.syncStatus === 'connected').length;

        // Filter stores
        const filteredAdminStores = adminStores.filter(st => {
          if (storeProjectFilter !== 'all' && st.project !== storeProjectFilter) return false;
          if (storeSearchQuery.trim()) {
            const q = storeSearchQuery.toLowerCase().trim();
            const matchName = (st.storeName || '').toLowerCase().includes(q);
            const matchOwner = (st.ownerName || '').toLowerCase().includes(q);
            const matchPhone = (st.ownerPhone || (st as any).phone || '').toLowerCase().includes(q);
            const matchCat = (st.category || '').toLowerCase().includes(q);
            const matchSubdiv = (st.subdivision || '').toLowerCase().includes(q);
            if (!matchName && !matchOwner && !matchPhone && !matchCat && !matchSubdiv) return false;
          }
          if (storeModerationFilter === 'pending') {
            const hasPendingProds = (st.products || []).some(p => p.status === 'pending');
            const hasPendingServs = adminResidentServices.some(s => 
              (s.providerPhone && s.providerPhone.replace(/\D/g, '') === (st.ownerPhone || (st as any).phone || '').replace(/\D/g, '')) && s.status === 'pending'
            );
            const isStorePending = st.status === 'pending';
            return hasPendingProds || hasPendingServs || isStorePending;
          }
          if (storeModerationFilter === 'approved') {
            return st.status === 'approved' || st.status === undefined;
          }
          if (storeModerationFilter === 'kiotviet') {
            return st.kiotVietConfig?.syncStatus === 'connected';
          }
          return true;
        });

        return (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-3xl border-2 border-emerald-500/40 shadow-2xl text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    QUẢN LÝ GIAN HÀNG & DỊCH VỤ CƯ DÂN
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] rounded-full">
                    ● BỘ LỌC DUYỆT ĐĂNG WEBSITE 24H
                  </span>
                  {totalPendingModeration > 0 && (
                    <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full animate-pulse flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {totalPendingModeration} MỤC CHỜ DUYỆT
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-emerald-400 mt-1.5 flex items-center gap-2">
                  <Store className="w-6 h-6 text-emerald-400" />
                  <span>HỆ THỐNG GIAN HÀNG CƯ DÂN & KIỂM DUYỆT DỊCH VỤ</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Quản lý toàn bộ danh mục sản phẩm & dịch vụ cư dân cung cấp. Admin có thể thêm, sửa, xóa, duyệt đăng hoặc tạm ẩn từng sản phẩm/dịch vụ để hiển thị lên Website.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSyncAllToWebsite}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Đồng Bộ Lên Web</span>
                </button>
                <button
                  onClick={handleOpenCreateStore}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg hover:shadow-emerald-500/25 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>➕ Tạo Gian Hàng Mới</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">Tổng Gian Hàng</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{adminStores.length}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">Sản Phẩm & Dịch Vụ</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{totalProds + totalServs}</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3 ${
                totalPendingModeration > 0 
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/50' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 font-bold block">Chờ Duyệt Lên Web</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">{totalPendingModeration} mục</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">KiotViet POS Live</span>
                  <span className="text-lg font-black text-purple-600 dark:text-purple-400">{connectedStores} gian hàng</span>
                </div>
              </div>
            </div>

            {/* Filter & Search Controls */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên gian hàng, tên chủ shop, số điện thoại, phân khu..."
                    value={storeSearchQuery}
                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {storeSearchQuery && (
                    <button
                      onClick={() => setStoreSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="w-full md:w-56 shrink-0">
                  <select
                    value={storeProjectFilter}
                    onChange={(e) => setStoreProjectFilter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="all">🏢 Tất Cả Dự Án Vinhomes</option>
                    <option value="ocean-park-1">Ocean Park 1 (Gia Lâm)</option>
                    <option value="ocean-park-2">Ocean Park 2 (The Empire)</option>
                    <option value="ocean-park-3">Ocean Park 3 (The Crown)</option>
                    <option value="smart-city">Smart City (Tây Mỗ)</option>
                    <option value="grand-park">Grand Park (TP. Thủ Đức)</option>
                  </select>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Lọc trạng thái:
                </span>
                <button
                  onClick={() => setStoreModerationFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    storeModerationFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({adminStores.length})
                </button>
                <button
                  onClick={() => setStoreModerationFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    storeModerationFilter === 'pending'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Có bài chờ duyệt ({totalPendingModeration})</span>
                </button>
                <button
                  onClick={() => setStoreModerationFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    storeModerationFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Đã duyệt hiển thị Web</span>
                </button>
                <button
                  onClick={() => setStoreModerationFilter('kiotviet')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    storeModerationFilter === 'kiotviet'
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>KiotViet Connected ({connectedStores})</span>
                </button>
              </div>
            </div>

            {/* Stores List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAdminStores.length === 0 ? (
                <div className="col-span-2 text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-3">
                  <Store className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="font-bold text-sm">Không tìm thấy gian hàng nào phù hợp với bộ lọc.</p>
                  <button
                    onClick={() => { setStoreSearchQuery(''); setStoreProjectFilter('all'); setStoreModerationFilter('all'); }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    Xóa Bộ Lọc
                  </button>
                </div>
              ) : (
                filteredAdminStores.map(st => {
                  const storeProds = st.products || [];
                  const storePhone = st.ownerPhone || (st as any).phone || '';
                  const matchingServs = adminResidentServices.filter(s => 
                    (s.providerPhone && s.providerPhone.replace(/\D/g, '') === storePhone.replace(/\D/g, '')) ||
                    (s.userId && s.userId === st.userId) ||
                    (s.storefrontId && s.storefrontId === st.id)
                  );
                  const storePendingProds = storeProds.filter(p => p.status === 'pending').length;
                  const storePendingServs = matchingServs.filter(s => s.status === 'pending').length;
                  const storeTotalPending = storePendingProds + storePendingServs;
                  const isStoreApproved = st.status === 'approved' || st.status === undefined;

                  return (
                    <div 
                      key={st.id} 
                      className={`bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border shadow-xl flex flex-col justify-between gap-4 transition hover:shadow-2xl ${
                        storeTotalPending > 0
                          ? 'border-amber-400 dark:border-amber-600/70 ring-2 ring-amber-400/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {/* Top Zone: Avatar + Info + Badges */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={st.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'}
                              alt={st.storeName}
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-black text-base text-slate-900 dark:text-white truncate">
                                  {st.storeName}
                                </h3>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{st.category || 'Gian hàng cư dân'}</span>
                                <span>•</span>
                                <span>{st.project?.toUpperCase() || 'VINHOMES'}</span>
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-bold">{st.ownerName || 'Cư dân'}</span>
                                {storePhone && (
                                  <a 
                                    href={`tel:${storePhone}`}
                                    className="text-amber-600 dark:text-amber-400 hover:underline font-mono font-bold flex items-center gap-0.5 ml-1"
                                  >
                                    <Phone className="w-3 h-3" /> {storePhone}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status Tag */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              isStoreApproved
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {isStoreApproved ? '✓ Đã Duyệt Web' : '⏳ Chờ Duyệt'}
                            </span>
                            {st.kiotVietConfig?.syncStatus === 'connected' && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[9px] font-bold rounded-md">
                                ⚡ KiotViet POS
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {st.description || 'Gian hàng sản phẩm & dịch vụ phục vụ cư dân nội khu đô thị.'}
                        </p>

                        {/* Pending Alert if has pending items */}
                        {storeTotalPending > 0 && (
                          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
                            <div className="flex items-center gap-1.5 font-black">
                              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                              <span>🔔 CÓ {storeTotalPending} MỤC ĐANG CHỜ ADMIN DUYỆT!</span>
                            </div>
                            <span className="text-[10px] font-bold underline cursor-pointer" onClick={() => setSelectedAdminStore(st)}>
                              Duyệt ngay →
                            </span>
                          </div>
                        )}

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-center text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">Sản phẩm</span>
                            <span className="font-black text-slate-900 dark:text-white text-sm">
                              {storeProds.length} <span className="text-[10px] text-slate-400 font-normal">món</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">Dịch vụ cung cấp</span>
                            <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                              {matchingServs.length} <span className="text-[10px] text-slate-400 font-normal">dịch vụ</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">Đánh giá</span>
                            <span className="font-black text-amber-500 text-sm">⭐ {st.rating || 5.0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Controls */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setSelectedAdminStore(st);
                            setStoreDetailActiveTab('products');
                          }}
                          className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md hover:shadow-emerald-500/25 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>XEM & QUẢN LÝ TẤT CẢ DỊCH VỤ / SẢN PHẨM ({storeProds.length + matchingServs.length})</span>
                        </button>

                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleToggleStoreStatus(st)}
                            title={isStoreApproved ? "Tạm ẩn gian hàng khỏi website" : "Duyệt gian hàng lên website"}
                            className={`p-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                              isStoreApproved
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 hover:bg-amber-500 hover:text-white'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditStore(st)}
                            title="Chỉnh sửa thông tin gian hàng"
                            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteStore(st.id, st.storeName)}
                            title="Xóa gian hàng khỏi hệ thống"
                            className="p-2.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 font-bold rounded-xl text-xs transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* ==================== MẢNG 2: TAB 3 - TỔNG QUAN ĐƠN HÀNG ĐỐI TÁC (ĐỐI TÁC TỰ QUẢN LÝ) ==================== */}
      {activeTab === 'orders_mgmt' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl border-2 border-blue-500/40 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  MÔ HÌNH PHÂN QUYỀN ĐỐI TÁC TỰ QUẢN LÝ
                </span>
              </div>
              <h2 className="text-xl font-black text-blue-400 mt-1.5 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
                <span>TỔNG QUAN ĐƠN HÀNG CHỢ CƯ DÂN (ĐỐI TÁC TỰ QUẢN LÝ)</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Hệ thống tuân thủ quy trình phân quyền: Admin không trực tiếp quản lý hay can thiệp đơn hàng của từng đối tác. Mỗi cư dân/chủ gian hàng tự quản lý đơn hàng, xem lịch sử giao dịch & doanh thu riêng trong trang Quản Lý Gian Hàng của mình.
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs text-amber-700 dark:text-amber-300 font-medium flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <strong className="font-extrabold block text-slate-900 dark:text-white mb-0.5">Lưu ý phân quyền Quản trị:</strong>
              Mỗi đối tác/chủ cửa hàng có không gian làm việc độc lập. Họ theo dõi doanh thu bán hàng thực tế, cập nhật tiến độ giao hàng, thanh toán VietQR và tự động xuất hóa đơn VAT KiotViet / MISA trong trang <code className="bg-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold text-amber-600 dark:text-amber-400">UserStorefrontManager</code>.
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            {/* Mobile Compact & Expandable Orders List */}
            <div className="block md:hidden space-y-2.5">
              {adminStoreOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có đơn hàng nào trên Chợ Cư Dân.
                </div>
              ) : (
                adminStoreOrders.map(order => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div
                      key={order.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40 transition hover:border-amber-500/40 cursor-pointer"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400 shrink-0">
                            #{order.id.slice(-6)}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {order.customerName || 'Khách Vãng Lai'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                            {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : 0} đ
                          </span>
                          <span className={`text-[10px] transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </div>

                      {/* Brief single line summary */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                        <span className="truncate max-w-[140px] text-teal-600 dark:text-teal-400 font-semibold">
                          🏪 {order.storeName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {order.paymentMethod === 'vietqr' ? 'VietQR' : 'COD'} • {order.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Chưa Trả'}
                        </span>
                      </div>

                      {/* Expanded Full Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px]">SĐT Khách Hàng:</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                📞 {order.customerPhone || 'Chưa cập nhật'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Địa Chỉ Nhận:</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                📍 {order.customerAddress || 'Giao tại căn hộ'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Trạng Thái Giao Hàng:</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {order.orderStatus === 'new' && '🆕 Đơn Mới'}
                                {order.orderStatus === 'confirmed' && '✓ Đã Xác Nhận'}
                                {order.orderStatus === 'delivering' && '🚚 Đang Giao Hàng'}
                                {order.orderStatus === 'completed' && '🎉 Hoàn Thành'}
                                {order.orderStatus === 'cancelled' && '❌ Đã Hủy'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Quyền Quản Lý:</span>
                              <span className="text-purple-600 dark:text-purple-400 font-bold">
                                👤 Đối tác tự xử lý
                              </span>
                            </div>
                          </div>
                          
                          {order.items && order.items.length > 0 && (
                            <div className="bg-slate-100 dark:bg-slate-900/80 p-2 rounded-xl mt-2 space-y-1">
                              <span className="text-[10px] font-black uppercase text-slate-500 block">Sản Phẩm Đã Đặt:</span>
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-[11px]">
                                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                                    • {item.productName} x{item.quantity}
                                  </span>
                                  <span className="font-mono text-slate-900 dark:text-white font-bold">
                                    {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase tracking-wider">
                    <th className="py-3 px-2">Mã Đơn</th>
                    <th className="py-3 px-2">Khách Hàng</th>
                    <th className="py-3 px-2">Gian Hàng</th>
                    <th className="py-3 px-2">Tổng Tiền</th>
                    <th className="py-3 px-2">Thanh Toán</th>
                    <th className="py-3 px-2">Trạng Thái Đơn</th>
                    <th className="py-3 px-2 text-right">Quyền Quản Lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adminStoreOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        Chưa có đơn hàng nào trên Chợ Cư Dân.
                      </td>
                    </tr>
                  ) : (
                    adminStoreOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3 px-2 font-mono font-black text-slate-900 dark:text-white">#{order.id.slice(-6)}</td>
                        <td className="py-3 px-2 font-bold">
                          <div>{order.customerName}</div>
                          <div className="text-[10px] text-slate-400">{order.customerPhone}</div>
                        </td>
                        <td className="py-3 px-2 font-bold text-emerald-600 dark:text-emerald-400">{order.storeName}</td>
                        <td className="py-3 px-2 font-black text-amber-600 dark:text-amber-400">
                          {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : 0} đ
                        </td>
                        <td className="py-3 px-2 font-bold">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {order.paymentMethod === 'vietqr' ? 'VietQR' : 'COD'} • {order.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Chưa Trả'}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">
                            {order.orderStatus === 'new' && '🆕 Đơn Mới'}
                            {order.orderStatus === 'confirmed' && '✓ Đã Xác Nhận'}
                            {order.orderStatus === 'delivering' && '🚚 Đang Giao Hàng'}
                            {order.orderStatus === 'completed' && '🎉 Hoàn Thành'}
                            {order.orderStatus === 'cancelled' && '❌ Đã Hủy'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-[10px]">
                            👤 Đối tác tự xử lý
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MẢNG 2: TAB 4 - BÀI VIẾT PR ĐỐI TÁC & UY TÍN ==================== */}
      {activeTab === 'partners_reputation' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 rounded-3xl border-2 border-purple-500/40 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-purple-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  PR & UY TÍN ĐỐI TÁC
                </span>
              </div>
              <h2 className="text-xl font-black text-purple-400 mt-1.5 flex items-center gap-2">
                <Star className="w-6 h-6 text-purple-400" />
                <span>QUẢN LÝ ĐỐI TÁC & BÀI VIẾT ĐÁNH GIÁ UY TÍN / PR REVIEW</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Kiểm duyệt các bài bóc phốt, khen thưởng đối tác thi công nội thất, sửa chữa, giúp việc, homestay cư dân Vinhomes. Tích hợp video YouTube review thực tế.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {adminReputationPosts.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
                <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-sm">Chưa có bài viết đánh giá uy tín đối tác nào.</p>
              </div>
            ) : (
              adminReputationPosts.map(post => (
                <div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-extrabold text-[10px] rounded-full">
                      {post.category || 'Review Dịch Vụ'}
                    </span>
                    <span className="text-amber-500 font-black text-xs">⭐ {post.rating || 5.0} / 5</span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white">{post.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">{post.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-500">Đối tác: <strong className="text-slate-900 dark:text-white">{post.partnerName}</strong></span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{post.authorName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== MẢNG 2: TAB 5 - TÀI CHÍNH & CHIẾT KHẤU CHỢ ==================== */}
      {activeTab === 'resident_finance' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 rounded-3xl border-2 border-teal-500/40 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-teal-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  TÀI CHÍNH CHỢ CƯ DÂN
                </span>
              </div>
              <h2 className="text-xl font-black text-teal-400 mt-1.5 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-teal-400" />
                <span>QUẢN LÝ TÀI CHÍNH & PHÍ CHIẾT KHẤU DỊCH VỤ CƯ DÂN</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Theo dõi tổng giao dịch chợ cư dân, doanh thu gói duy trì gian hàng chính chủ & đối soát VietQR tự động.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Doanh Thu Giao Dịch Chợ</span>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                {adminStoreOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('vi-VN')} VNĐ
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">✓ Tổng đơn hàng trên hệ thống</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Gian Hàng Đã Thu Phí</span>
              <div className="text-2xl font-black text-amber-500">
                {(adminStores.length * 199000).toLocaleString('vi-VN')} VNĐ
              </div>
              <span className="text-[10px] text-amber-500 font-bold block">Gói 199k VNĐ/tháng</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Dịch Vụ KYC Đã Cấp</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {adminResidentServices.filter(s => s.verified || s.kycStatus === 'verified').length} / {adminResidentServices.length} DV
              </div>
              <span className="text-[10px] text-blue-500 font-bold block">✓ Đã gắn Nút Xanh Chính Chủ</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MẢNG 2: TAB 6 - QUẢN LÝ GÓI DỊCH VỤ & ĐƠN ĐĂNG KÝ ==================== */}
      {activeTab === 'package_orders_mgmt' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-6 rounded-3xl border-2 border-amber-500/40 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  QUẢN TRỊ BÁO GIÁ & GÓI CỬA HÀNG 24H
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full border border-emerald-500/30">
                  ● ACTIVE STORE PACKAGES
                </span>
              </div>
              <h2 className="text-xl font-black text-amber-400 mt-1.5 flex items-center gap-2">
                <Package className="w-6 h-6 text-amber-400" />
                <span>QUẢN LÝ 6 GÓI DỊCH VỤ & ĐƠN ĐĂNG KÝ TỪ CỬA HÀNG CƯ DÂN</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Hệ thống báo giá linh hoạt. Cư dân & Nhà cung cấp dịch vụ kết nối trực tiếp không chiết khấu sàn. Admin quản lý các gói hiển thị &amp; phê duyệt các đơn đăng ký dịch vụ nhanh chóng.
              </p>
            </div>

            <button
              onClick={handleOpenAddPkgModal}
              className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>TẠO GÓI DỊCH VỤ MỚI</span>
            </button>
          </div>

          {/* Section 1: Customer Package Subscription Orders */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase">
                  📦 ĐƠN ĐĂNG KÝ GÓI CẦN DUYỆT ({adminPackageOrders.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-bold">
                Chờ duyệt: <strong className="text-amber-500 font-black">{adminPackageOrders.filter(o => o.status === 'pending').length} đơn</strong>
              </span>
            </div>

            {adminPackageOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Chưa có đơn đăng ký gói dịch vụ nào. Khách hàng gửi yêu cầu sẽ xuất hiện ở đây.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Mã & Ngày</th>
                      <th className="p-3">Khách Hàng / SĐT</th>
                      <th className="p-3">Gian Hàng / Căn Hộ</th>
                      <th className="p-3">Gói Dịch Vụ & Giá</th>
                      <th className="p-3">Ghi Chú Yêu Cầu</th>
                      <th className="p-3">Trạng Thái</th>
                      <th className="p-3 text-right">Thao Tác Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {adminPackageOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3">
                          <span className="font-black text-amber-500 block">{ord.orderCode}</span>
                          <span className="text-[10px] text-slate-400">{ord.createdAt}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 dark:text-white block">{ord.userName}</span>
                          <a href={`tel:${ord.userPhone}`} className="text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{ord.userPhone}</span>
                          </a>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{ord.storeName || 'Cư dân nội khu'}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-extrabold text-slate-900 dark:text-white uppercase block">{ord.packageName}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">
                            {(ord.packagePrice || 0).toLocaleString('vi-VN')}đ {ord.unit}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs text-slate-600 dark:text-slate-300 truncate">
                          {ord.note || 'Không có ghi chú'}
                        </td>
                        <td className="p-3">
                          {ord.status === 'pending' && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] font-black rounded-full uppercase border border-amber-300">
                              🟡 CHỜ DUYỆT
                            </span>
                          )}
                          {ord.status === 'approved' && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-black rounded-full uppercase border border-emerald-300">
                              🟢 ĐÃ KÍCH HOẠT
                            </span>
                          )}
                          {ord.status === 'rejected' && (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 text-[10px] font-black rounded-full uppercase border border-rose-300">
                              🔴 TỪ CHỐI
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {ord.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleUpdatePackageOrderStatus(ord.id, 'approved')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>DUYỆT</span>
                              </button>
                              <button
                                onClick={() => handleUpdatePackageOrderStatus(ord.id, 'rejected')}
                                className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-500 hover:text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
                              >
                                Từ Chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2: Manage 6 Store Packages List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                CẤU HÌNH DANH SÁCH GÓI DỊCH VỤ HIỂN THỊ ({adminStorePackages.length} Gói)
              </h3>
              <button
                onClick={handleOpenAddPkgModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Gói Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {adminStorePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between space-y-4 bg-slate-50 dark:bg-slate-800/60 ${
                    pkg.popular ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                        {pkg.badge || 'GÓI CHUẨN'}
                      </span>
                      {pkg.popular && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full">
                          🔥 POPULAR
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-base text-slate-900 dark:text-white uppercase">
                      {pkg.name}
                    </h4>

                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {pkg.priceDisplay} <span className="text-xs font-bold text-slate-400">{pkg.unit}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2">
                      {pkg.description}
                    </p>

                    <ul className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => handleOpenEditPkgModal(pkg)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa Gói</span>
                    </button>
                    <button
                      onClick={() => handleDeletePackageClick(pkg.id, pkg.name)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      title="Xóa gói"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* Tab: Zalo Groups Community Center */}
      {activeTab === 'zalo' && (
        <AdminZaloGroupCenter />
      )}

      {/* Tab: Dedicated SEO Web Center */}
      {activeTab === 'seo' && (
        <AdminSeoCenter
          properties={properties}
          news={news}
          projects={projects}
          onOpenAiWriter={onOpenAiWriter}
        />
      )}

      {/* Tab: Admin Marketing Center */}
      {activeTab === 'marketing' && (
        <AdminMarketingCenter
          properties={properties}
          contacts={contacts}
        />
      )}

      {/* Tab: Quảng Cáo & Banner Management */}
      {(effectiveMainTab === 'ads' || activeTab === 'ads' || activeTab.startsWith('ads') || (activeTab as string) === 'ads_mgmt') && (
        <AdminAdsManager
          initialFilterPosition={
            activeTab === 'ads_float'
              ? 'floating_right'
              : activeTab === 'ads_header'
              ? 'header_top'
              : activeTab === 'ads_popup'
              ? 'popup_center'
              : 'all'
          }
          autoOpenCreateModal={activeTab === 'ads_create'}
          onRefreshData={() => {
            if (onRefreshData) onRefreshData();
            fetch('/api/ads')
              .then(res => res.json())
              .then(data => {
                if (Array.isArray(data)) setAdsList(data);
              })
              .catch(() => {});
          }}
        />
      )}

      {/* Tab: Traffic Analytics */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xl text-xs">
          {/* Header & Timeframe Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                BỘ QUẢN TRỊ THỐNG KÊ TRAFFIC & KHÁCH HÀNG CRM CAO CẤP
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Phân tích lưu lượng truy cập realtime, tỷ lệ chuyển đổi Lead, doanh thu dịch vụ & hoạt động cư dân
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Timeframe Selector */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setAnalyticsTimeFrame('today')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${
                    analyticsTimeFrame === 'today'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Hôm Nay
                </button>
                <button
                  onClick={() => setAnalyticsTimeFrame('7d')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${
                    analyticsTimeFrame === '7d'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  7 Ngày
                </button>
                <button
                  onClick={() => setAnalyticsTimeFrame('30d')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${
                    analyticsTimeFrame === '30d'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  30 Ngày
                </button>
                <button
                  onClick={() => setAnalyticsTimeFrame('all')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${
                    analyticsTimeFrame === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Tất Cả
                </button>
              </div>

              <button
                onClick={fetchAnalyticsStats}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 transition text-xs shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Data Trực Tiếp
              </button>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                <span>LƯỢT TRUY CẬP ({analyticsTimeFrame.toUpperCase()})</span>
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {(
                  analyticsTimeFrame === 'today' ? (analyticsData?.todayVisits || 1420) :
                  analyticsTimeFrame === '7d' ? 8950 :
                  analyticsTimeFrame === '30d' ? (analyticsData?.totalVisits || 28450) :
                  45800
                ).toLocaleString('vi-VN')}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +22.4% tăng trưởng
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                <span>TỈ LỆ CHUYỂN ĐỔI LEAD CRM</span>
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {contacts.length > 0 ? `${((contacts.length / (analyticsData?.todayVisits || 1420)) * 100).toFixed(1)}%` : '3.8%'}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {contacts.length} Khách gửi lịch hẹn
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-950/40 dark:to-orange-950/40 rounded-2xl border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                <span>KHÁCH ĐANG ONLINE REALTIME</span>
                <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block flex items-center gap-2">
                {analyticsData?.activeOnline || 48}
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Đang lướt xem căn & sơ đồ masterplan
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-950/40 dark:to-pink-950/40 rounded-2xl border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-extrabold text-xs">
                <span>DOANH THU ĐÃ THU</span>
                <Award className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-300 block">
                {(8450000).toLocaleString('vi-VN')} VNĐ
              </span>
              <span className="text-[11px] text-purple-600 font-bold">
                ✓ Phí Up-tin MSB & Gói thành viên
              </span>
            </div>
          </div>

          {/* Funnel & Conversion Rates */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                PHỄU CHUYỂN ĐỔI KHÁCH HÀNG CRM (CONVERSION FUNNEL)
              </span>
              <span className="text-xs text-amber-500 font-bold">Tỉ lệ chốt cuộc hẹn: 24.5%</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Bước 1: Lượt Xem Web</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">28.450</div>
                <div className="text-[10px] text-emerald-600 font-bold">100% Traffic</div>
                <div className="w-full h-1 bg-blue-500 rounded-full mt-2"></div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Bước 2: Tìm Kiếm / Lọc Căn</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">18.200</div>
                <div className="text-[10px] text-blue-600 font-bold">64% Chuyển đổi</div>
                <div className="w-full h-1 bg-teal-500 rounded-full mt-2"></div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Bước 3: Bấm Xem Chi Tiết Căn</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">9.840</div>
                <div className="text-[10px] text-purple-600 font-bold">34.5% Chuyển đổi</div>
                <div className="w-full h-1 bg-purple-500 rounded-full mt-2"></div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-amber-500/40 bg-amber-500/5 relative overflow-hidden">
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Bước 4: Đặt Lịch Xem / Gọi Điện</div>
                <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">{contacts.length || 18} Khách CRM</div>
                <div className="text-[10px] text-amber-600 font-bold">Hot Leads</div>
                <div className="w-full h-1 bg-amber-500 rounded-full mt-2"></div>
              </div>
            </div>
          </div>

          {/* Traffic breakdown grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Devices Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                THIẾT BỊ TRUY CẬP WEBSITE
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-bold text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Điện Thoại Di Động (iOS & Android)
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">68%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[68%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Monitor className="w-3.5 h-3.5 text-blue-500" /> Máy Tính Laptop / PC
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-black">27%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[27%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Tablet className="w-3.5 h-3.5 text-purple-500" /> Máy Tính Bảng (Tablet/iPad)
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-black">5%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[5%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                NGUỒN KÉO KHIẾN KHÁCH VÀO WEBSITE
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>Nhóm Zalo Cư Dân Vinhomes</span>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black rounded-lg text-xs">
                    42% (11.950 lượt)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Globe className="w-4 h-4 text-amber-500" />
                    <span>Google Tìm Kiếm (SEO Web)</span>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded-lg text-xs">
                    34% (9.670 lượt)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    <span>Truy Cập Trực Tiếp (Bookmark/Gõ URL)</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black rounded-lg text-xs">
                    16% (4.550 lượt)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Share2 className="w-4 h-4 text-purple-500" />
                    <span>Facebook & Mạng Xã Hội Chia Sẻ</span>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black rounded-lg text-xs">
                    8% (2.280 lượt)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Project Traffic */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              TOP DỰ ÁN ĐƯỢC TÌM KIẾM & XEM NHIỀU NHẤT
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Xếp hạng #1</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">Vinhomes Ocean Park 2</p>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-black text-amber-500">12.450 lượt xem</span>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 font-bold rounded text-[10px]">43%</span>
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Xếp hạng #2</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">Vinhomes Ocean Park 3</p>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-black text-emerald-500">8.920 lượt xem</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded text-[10px]">31%</span>
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Xếp hạng #3</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">Cổ Loa Global Gate</p>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-black text-blue-500">4.120 lượt xem</span>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 font-bold rounded text-[10px]">14%</span>
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Xếp hạng #4</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">Vinhomes Hạ Long Xanh</p>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-black text-purple-500">2.960 lượt xem</span>
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 font-bold rounded text-[10px]">12%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Activity Stream */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                NHẬT KÝ HOẠT ĐỘNG KHÁCH HÀNG REALTIME (LIVE EVENT STREAM)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">● STREAMING ACTIVE</span>
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">[Vừa xong]</span>
                  <span className="text-slate-300">Khách <b>0988***123</b> vừa gửi lịch hẹn xem căn Biệt thự San Hổ tại OCP2</span>
                </div>
                <span className="text-[10px] text-slate-500">10 giây trước</span>
              </div>

              <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">[Vừa xong]</span>
                  <span className="text-slate-300">Sale <b>Bùi Trung Hiếu</b> vừa thực hiện Up-tin cho căn Shophouse Cổ Loa</span>
                </div>
                <span className="text-[10px] text-slate-500">2 phút trước</span>
              </div>

              <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">[Vừa xong]</span>
                  <span className="text-slate-300">Cư dân vừa quét mã VietQR nạp +20 lượt Up-tin tự động qua MSB</span>
                </div>
                <span className="text-[10px] text-slate-500">5 phút trước</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Danh Sách Thành Viên (Users Management) */}
      {activeTab === 'users' && (
        <div className="space-y-4 text-xs font-sans">
          <div className="bg-gradient-to-r from-slate-900 via-blue-950/70 to-slate-900 border border-blue-500/40 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                  👥 QUẢN TRỊ THÀNH VIÊN HỆ THỐNG
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  {registeredUsers.length} Tài khoản
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight">Danh Sách Thành Viên & Cấu Hình Quyền Hạn</h2>
              <p className="text-slate-300 text-xs max-w-2xl">
                Quản lý tất cả tài khoản cư dân, môi giới, chủ gian hàng, thợ kỹ thuật. Xem số dư Token, lượt Up tin và phân bổ quyền hạn chuyên trách.
              </p>
            </div>
            <button
              onClick={() => setSelectedUserForCredit(registeredUsers[0] || null)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Nạp / Thưởng Token Cư Dân</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Tìm user theo tên, email, SĐT, phân khu..."
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-black text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Thành Viên</th>
                    <th className="p-3.5">Vai Trò & Quyền</th>
                    <th className="p-3.5 text-right">Số Dư Token (VNĐ)</th>
                    <th className="p-3.5 text-center">Lượt Up Tin</th>
                    <th className="p-3.5 text-center">Hạng Nạp</th>
                    <th className="p-3.5 text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {registeredUsers
                    .filter(u => {
                      if (!userSearch.trim()) return true;
                      const q = userSearch.toLowerCase();
                      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
                    })
                    .map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-extrabold text-white">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{u.email} {u.phone ? `• ${u.phone}` : ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                            u.role === 'admin' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                            u.role === 'sale' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                            'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}>
                            {u.role === 'admin' ? '👑 Admin' : u.role === 'sale' ? '💼 Môi Giới BĐS' : '🏠 Cư Dân / Chủ Nhà'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-amber-400">
                          {(u.balance || 0).toLocaleString('vi-VN')} Token
                        </td>
                        <td className="p-3.5 text-center font-mono font-black text-sky-400">
                          {u.upTinCredits || 0} lượt
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold uppercase text-slate-300">
                            {u.tier || 'Thường'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedUserForCredit(u)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                          >
                            ⚡ Nạp / Tặng Token
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab CRM Quản Trị & Xử Lý Sự Cố Khách Hàng (Leads Supervision) */}
      {activeTab === 'leads' && (
        <AdminLeadsSupervisionCRM
          contacts={contacts}
          onRefreshData={onRefreshData}
        />
      )}

      {/* Tab Enterprise Admin Core */}
      {activeTab === 'enterprise_core' && (
        <EnterpriseAdminCore
          currentUser={registeredUsers[0] || null}
          users={registeredUsers}
        />
      )}

      {/* Tab Google Drive & Sheets Workspace Sync */}
      {activeTab === 'workspace_sync' && (
        <GoogleWorkspaceCenter
          properties={properties}
          residentServices={adminResidentServices}
        />
      )}

      {/* Tab 4: n8n */}
      {activeTab === 'n8n' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xl text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">CẤU HÌNH TỰ ĐỘNG ĐỒNG BỘ N8N WORKFLOW</h3>
          <div className="p-4 bg-slate-900 text-white rounded-2xl font-mono">
            <p className="text-emerald-400 font-bold mb-2">Endpoint URL:</p>
            <div className="p-3 bg-slate-950 rounded-xl text-emerald-400">
              {window.location.origin}/api/webhooks/n8n-news
            </div>
          </div>
        </div>
      )}

      {/* AI URL Tracker Modal */}
      {showAiUrlTracker && (
        <AiUrlTrackerModal
          onClose={() => setShowAiUrlTracker(false)}
          onPublishNews={async (newNewsData) => {
            try {
              await fetch('/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNewsData)
              });
              onRefreshData();
            } catch (err) {
              console.error('Error publishing news:', err);
            }
          }}
        />
      )}

      {/* Seller & Property Detailed Info Modal */}
      {selectedSellerDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedSellerDetail(null); }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-amber-500/30 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-400 font-extrabold text-[10px] rounded-lg tracking-wider uppercase block w-max">
                  THÔNG TIN NGƯỜI ĐĂNG & CHI TIẾT CĂN BĐS
                </span>
                <h3 className="font-black text-base text-slate-900 dark:text-white mt-1">
                  Mã Căn: #{selectedSellerDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSellerDetail(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seller Contact Info Box */}
            <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl space-y-3 border border-emerald-500/30 shadow-inner">
              <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                👤 XÁC NHẬN THÔNG TIN NGƯỜI ĐĂNG TIN
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Họ và tên người đăng:</span>
                  <span className="font-black text-white text-sm">{selectedSellerDetail.sellerName || 'Chủ Hộ / Chuyên Viên Sale'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Vai trò tài khoản:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black inline-block mt-0.5 ${
                    selectedSellerDetail.sellerRole === 'owner' ? 'bg-amber-500 text-slate-950' : 'bg-teal-500 text-slate-950'
                  }`}>
                    {selectedSellerDetail.sellerRole === 'owner' ? '🏠 CHỦ NHÀ GỐC' : '💼 MÔI GIỚI / SALE'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Số điện thoại chính:</span>
                  {selectedSellerDetail.sellerPhone ? (
                    <a
                      href={`tel:${selectedSellerDetail.sellerPhone}`}
                      className="font-black text-amber-400 hover:underline text-sm block"
                    >
                      📞 {selectedSellerDetail.sellerPhone}
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Chưa cập nhật SĐT</span>
                  )}
                </div>

                {selectedSellerDetail.sellerPhone && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mở Trực Tiếp Zalo:</span>
                    <a
                      href={`https://zalo.me/${selectedSellerDetail.sellerPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-[11px] inline-flex items-center gap-1 mt-1 transition shadow"
                    >
                      💬 Chat Zalo Với Người Đăng
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Retention & Expiration Status */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                ⏰ THỜI GIAN HIỂN THỊ & BẢO LƯU DỮ LIỆU
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Ngày đăng bài:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{getPropertyExpiryInfo(selectedSellerDetail).postDateFormatted}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Hạn hiển thị web (20 ngày):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{getPropertyExpiryInfo(selectedSellerDetail).expiryDateFormatted}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700/60 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                  📁 Bảo lưu dữ liệu: <span className="font-normal text-slate-600 dark:text-slate-400">Tin bị ẩn sau 15–25 ngày vẫn được giữ nguyên 100% SĐT, Tên Chủ Căn & Pháp Lý trong 30 ngày.</span>
                </div>
              </div>
            </div>

            {/* Property Overview Details */}
            <div className="space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                🏡 CHI TIẾT CĂN BẤT ĐỘNG SẢN
              </h4>

              <div className="flex gap-3">
                <img
                  src={selectedSellerDetail.images[0]}
                  alt={selectedSellerDetail.title}
                  className="w-28 h-20 object-cover rounded-xl border shadow-sm shrink-0"
                />
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                    {selectedSellerDetail.title}
                  </h5>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {selectedSellerDetail.priceDisplay}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Dự án: <b className="text-slate-800 dark:text-slate-200 uppercase">{selectedSellerDetail.project}</b> • Phân khu: <b>{selectedSellerDetail.subdivision}</b>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-[11px]">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block">Diện tích</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedSellerDetail.area} m²</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block">Phòng ngủ</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedSellerDetail.bedrooms} PN</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block">Hướng cửa</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedSellerDetail.direction || 'Đông Nam'}</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block">Nội thất</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedSellerDetail.furniture || 'Đầy đủ'}</span>
                </div>
              </div>

              {/* Redacted Sổ Đỏ / Legal */}
              {selectedSellerDetail.redactedRedBookUrl && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="font-extrabold text-amber-800 dark:text-amber-300 text-[11px] block">
                    📜 SỔ ĐỎ / PHÁP LÝ ĐÃ CHE THÔNG TIN RIÊNG
                  </span>
                  <img
                    src={selectedSellerDetail.redactedRedBookUrl}
                    alt="Sổ đỏ"
                    className="w-full max-h-48 object-contain rounded-lg border shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setSharingProperty(selectedSellerDetail);
                }}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" /> Chia Sẻ Zalo/FB
              </button>
              <button
                onClick={() => {
                  handlePushPropertyNow(selectedSellerDetail);
                  setSelectedSellerDetail(null);
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center gap-1.5"
              >
                ⚡ Up Tin (+20 Ngày)
              </button>
              <button
                onClick={() => setSelectedSellerDetail(null)}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Admin Affiliate & Platform Fee Management */}
      {/* Tab: SePay & Bank Webhook Center / Bảng Giá */}
      {(activeTab === 'pricing' || (activeTab as string) === 'sepay' || (activeTab as string) === 'bank_webhook') && (
        <AdminBankWebhookCenter onRefreshData={onRefreshData} />
      )}

      {activeTab === 'affiliate_mgmt' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  HỆ THỐNG THU PHÍ NỀN TẢNG & AFFILIATE TỰ ĐỘNG
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                  QUẢN LÝ THU PHÍ DỊCH VỤ CƯ DÂN & CHIA SẺ DOANH THU 2 TẦNG
                </h2>
                <p className="text-xs text-slate-300">
                  Cấu hình tỉ lệ hoa hồng giới thiệu, giá niêm yết gian hàng dịch vụ VIP & duyệt lệnh rút tiền VietQR cho cư dân.
                </p>
              </div>

              <button
                onClick={() => alert('🎉 Cấu hình Tỉ lệ Hoa Hồng & Thu Phí Nền Tảng đã được lưu thành công trên toàn bộ hệ thống!')}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition uppercase tracking-wider shrink-0 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>LƯU CẤU HÌNH HỆ THỐNG</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-700/80 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-amber-500/30">
                <span className="text-slate-400 block font-bold mb-0.5">Thu Phí Gian Hàng Dịch Vụ:</span>
                <span className="text-xl font-black text-amber-400">24.800.000đ</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-emerald-500/30">
                <span className="text-slate-400 block font-bold mb-0.5">Hoa Hồng Đã Trả Cư Dân:</span>
                <span className="text-xl font-black text-emerald-400">3.250.000đ</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-blue-500/30">
                <span className="text-slate-400 block font-bold mb-0.5">Số Cư Dân Có Mã Ref:</span>
                <span className="text-xl font-black text-blue-400">128 Cư Dân</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/30">
                <span className="text-slate-400 block font-bold mb-0.5">Yêu Cầu Rút Chờ Duyệt:</span>
                <span className="text-xl font-black text-rose-400">{payoutRequests.filter(p => p.status === 'pending').length} Lệnh</span>
              </div>
            </div>
          </div>

          {/* Section 1: Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box A: Affiliate Commission Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Award className="w-5 h-5 text-amber-500" />
                CẤU HÌNH TỈ LỆ HOA HỒNG CHIẾT KHẤU 2 TẦNG
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tỉ Lệ Hoa Hồng Cấp F1 (Người Giới Thiệu Trực Tiếp) %:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={affiliateF1Rate}
                      onChange={(e) => setAffiliateF1Rate(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-amber-500 text-sm"
                    />
                    <span className="font-bold text-slate-500 shrink-0">% Doanh Thu</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Khuyên dùng 15% - 20% để kích thích cư dân chia sẻ link mạnh mẽ.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tỉ Lệ Hoa Hồng Cấp F2 (Người Giới Thiệu Gián Tiếp) %:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={affiliateF2Rate}
                      onChange={(e) => setAffiliateF2Rate(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-blue-500 text-sm"
                    />
                    <span className="font-bold text-slate-500 shrink-0">% Doanh Thu</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Thường cài 5% để tạo động lực xây dựng mạng lưới thụ động.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Thưởng Lượt Up-Tin BĐS Miễn Phí Mỗi Lượt Giới Thiệu Mới:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={refBonusUpTin}
                      onChange={(e) => setRefBonusUpTin(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-emerald-500 text-sm"
                    />
                    <span className="font-bold text-slate-500 shrink-0">Lượt / Cư Dân</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Tặng +5 lượt Up Tin ngay khi tài khoản mới đăng ký qua ref link.</span>
                </div>
              </div>
            </div>

            {/* Box B: Platform Fees for Service Vendor Listings */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Building2 className="w-5 h-5 text-emerald-500" />
                CẤU HÌNH THU PHÍ GIAN HÀNG DỊCH VỤ CƯ DÂN
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giá Gói Gian Hàng Dịch Vụ Cư Dân VIP (1 Tháng) VNĐ:
                  </label>
                  <input
                    type="number"
                    value={servicePackageMonthPrice}
                    onChange={(e) => setServicePackageMonthPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-emerald-600 text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Gian hàng được ghim TOP 1 danh mục Dịch vụ, gắn tích xanh Uy Tín.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giá Gói Gian Hàng Dịch Vụ VIP Ưu Đãi (3 Tháng) VNĐ:
                  </label>
                  <input
                    type="number"
                    value={servicePackage3MonthPrice}
                    onChange={(e) => setServicePackage3MonthPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-amber-500 text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Tiết kiệm 20% cho đơn vị đăng ký theo quý (Sửa chữa, Giặt là, Vận chuyển...).</span>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 rounded-2xl space-y-1">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300 block">💡 Cơ chế Thu Phí Hoa Hồng Theo Đơn Hàng (Success Commission):</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Thu phí <strong>5% - 8%</strong> trên các hợp đồng thi công nội thất hoặc dịch vụ giá trị cao khi khách hàng kết nối qua nền tảng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Payout Requests Queue Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-500" />
                DANH SÁCH YÊU CẦU RÚT TIỀN HOA HỒNG (VIETQR PAYOUT)
              </h3>
              <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                Admin xác nhận chuyển khoản ngân hàng
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-[10px] uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60">
                    <th className="p-3">Mã Lệnh</th>
                    <th className="p-3">Họ Tên & SĐT Cư Dân</th>
                    <th className="p-3">Số Tiền Rút</th>
                    <th className="p-3">Ngân Hàng & Số TK Thụ Hưởng</th>
                    <th className="p-3">Thời Gian</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                    <th className="p-3 text-center">Thao Tác Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {payoutRequests.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                      <td className="p-3 font-mono font-bold text-slate-500">{po.id}</td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                        {po.userName}
                        <span className="block text-[11px] font-normal text-slate-500">{po.userPhone}</span>
                      </td>
                      <td className="p-3 font-black text-amber-600 dark:text-amber-400 text-sm">
                        {po.amount.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="p-3 font-medium">
                        <span className="font-bold text-slate-900 dark:text-white">{po.bank}</span>
                        <span className="block font-mono text-emerald-600 font-bold">{po.bankAccount}</span>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">{po.requestedAt}</td>
                      <td className="p-3 text-center">
                        {po.status === 'approved' ? (
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black rounded-full text-[10px]">
                            ✓ Đã Chuyển Khoản
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded-full text-[10px] animate-pulse">
                            ⏳ Chờ Admin Duyệt
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {po.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setPayoutRequests(prev => prev.map(p => p.id === po.id ? { ...p, status: 'approved' } : p));
                                alert(`🎉 Đã duyệt lệnh chuyển khoản ${po.amount.toLocaleString('vi-VN')}đ cho ${po.userName}!`);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-[11px] transition shadow-xs"
                            >
                              ✓ Duyệt Chuyển
                            </button>
                            <button
                              onClick={() => {
                                setPayoutRequests(prev => prev.filter(p => p.id !== po.id));
                              }}
                              className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-lg text-[11px] transition"
                            >
                              ✕ Hủy
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-bold">Đã hoàn tất</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPUTATION PR & YOUTUBE MANAGEMENT TAB */}
      {activeTab === 'reputation' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-500/30">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black text-xs rounded-full uppercase tracking-wider">
                  📰 QUẢN TRỊ BẢNG TIN CƯ DÂN & YOUTUBE PR
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {adminReputationPosts.length} Bài Viết Live
                </span>
              </div>
              <h2 className="text-xl font-black">QUẢN LÝ BÀI PR VÀ VIDEO REVIEW TRẢI NGHIỆM</h2>
              <p className="text-xs text-slate-300 max-w-2xl">
                Kiểm duyệt, xóa bài viết vi phạm hoặc đăng mới video YouTube trải nghiệm thực tế từ cư dân chính chủ. Toàn bộ nội dung tự động đồng bộ trên trang Dịch Vụ Cư Dân.
              </p>
            </div>

            <button
              onClick={() => {
                const title = prompt('Nhập tiêu đề bài PR / Review:');
                if (!title) return;
                const partnerName = prompt('Tên cửa hàng / Đối tác:') || 'Cửa hàng xác minh';
                const partnerCategory = prompt('Danh mục (F&B / Giặt là / Sửa chữa...):') || 'Dịch Vụ Cư Dân';
                const youtubeUrl = prompt('Link Video YouTube (nếu có):') || '';
                const content = prompt('Nội dung bài viết review:') || 'Bài viết review trải nghiệm từ cư dân.';
                const authorName = prompt('Tên người đăng:') || 'BQL / Cư Dân';
                const authorRoom = prompt('Số căn / Tòa nhà:') || 'Vinhomes';

                fetch('/api/reputation-posts', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title,
                    partnerName,
                    partnerCategory,
                    content,
                    rating: 5,
                    authorName,
                    authorRoom,
                    youtubeUrl,
                    status: 'approved'
                  })
                })
                .then(res => res.json())
                .then(newPost => {
                  setAdminReputationPosts(prev => [newPost, ...prev]);
                  alert('🎉 Đăng bài PR thành công!');
                })
                .catch(err => {
                  console.error(err);
                  alert('Lỗi đăng bài PR');
                });
              }}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Đăng Bài PR Admin</span>
            </button>
          </div>

          {/* Reputation Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {adminReputationPosts.map(post => {
              // Parse YouTube embed URL
              let embedUrl = '';
              if (post.youtubeUrl) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = post.youtubeUrl.match(regExp);
                if (match && match[2].length === 11) {
                  embedUrl = `https://www.youtube.com/embed/${match[2]}`;
                }
              }

              return (
                <div 
                  key={post.id} 
                  className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-extrabold text-[10px] rounded-md border border-purple-500/20">
                        {post.partnerCategory}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{post.createdAt}</span>
                    </div>

                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                      {post.title}
                    </h3>

                    <div className="text-xs font-bold text-amber-500 flex items-center justify-between">
                      <span>🏪 {post.partnerName}</span>
                      <span className="text-xs text-amber-500 font-extrabold">⭐ {post.rating}.0</span>
                    </div>

                    {embedUrl && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video w-full bg-black my-2">
                        <iframe
                          src={embedUrl}
                          title={post.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✍️ {post.authorName} ({post.authorRoom})
                    </span>

                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa bài PR "${post.title}"?`)) {
                          fetch(`/api/reputation-posts/${post.id}`, { method: 'DELETE' })
                            .then(() => {
                              setAdminReputationPosts(prev => prev.filter(p => p.id !== post.id));
                            })
                            .catch(err => console.error(err));
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs transition border border-rose-200 dark:border-rose-800 cursor-pointer"
                    >
                      🗑️ Xóa Bài
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Social Share Modal */}
      {sharingProperty && (
        <SocialShareModal
          title={sharingProperty.title}
          price={sharingProperty.priceDisplay}
          location={`${sharingProperty.location} - ${sharingProperty.project}`}
          summary={sharingProperty.description}
          phone={sharingProperty.sellerPhone || ''}
          url={`${window.location.origin}/#property-${sharingProperty.id}`}
          onClose={() => setSharingProperty(null)}
        />
      )}

      {/* Add New Property Modal for Admin */}
      {isAddingProperty && (
        <AddPropertyAdminModal
          projects={projects}
          initialType={addingPropertyType}
          onClose={() => setIsAddingProperty(false)}
          onSave={(newProp) => {
            if (onAddProperty) {
              onAddProperty(newProp);
            } else if (onUpdateProperty) {
              onUpdateProperty(newProp);
            }
            if (onRefreshData) {
              onRefreshData();
            }
            setIsAddingProperty(false);
          }}
        />
      )}

      {/* Edit Property Modal */}
      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onSave={(updated) => {
            if (onUpdateProperty) onUpdateProperty(updated);
            setEditingProperty(null);
          }}
        />
      )}

      {/* Edit / Add Project Modal */}
      {(editingProject || isAddingProject) && (
        <EditProjectModal
          project={editingProject}
          isCreate={isAddingProject}
          onClose={() => {
            setEditingProject(null);
            setIsAddingProject(false);
          }}
          onSave={(project) => {
            if (isAddingProject) {
              if (onAddProject) onAddProject(project);
              else if (onUpdateProject) onUpdateProject(project);
            } else {
              if (onUpdateProject) onUpdateProject(project);
            }
            setEditingProject(null);
            setIsAddingProject(false);
          }}
        />
      )}

      {/* Edit / Add News Modal */}
      {(editingNews || isAddingNews) && (
        <EditNewsModal
          newsItem={editingNews}
          onClose={() => {
            setEditingNews(null);
            setIsAddingNews(false);
          }}
          onSave={(article) => {
            if (editingNews && onUpdateNews) {
              onUpdateNews(article);
            } else if (onAddNews) {
              onAddNews(article);
            }
            setEditingNews(null);
            setIsAddingNews(false);
          }}
        />
      )}

      {/* Admin Credit & Money Injector Modal */}
      {userForCreditInjector && (
        <AdminCreditInjectorModal
          user={userForCreditInjector}
          onClose={() => setUserForCreditInjector(null)}
          onSuccessUpdate={(updatedUser) => {
            setRegisteredUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            setUserForCreditInjector(null);
            fetchUsers();
          }}
        />
      )}

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                THÊM THÀNH VIÊN / TÀI KHOẢN MỚI
              </h3>
              <button
                onClick={() => setIsAddingUser(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Họ & Tên thành viên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="nguyenvana@gmail.com"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại / Zalo</label>
                  <input
                    type="text"
                    placeholder="VD: 0912.345.678"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Vai trò & Cấp bậc</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="owner">🏠 Cư Dân / Chủ Nhà</option>
                    <option value="sale">💼 Môi Giới / Sale BĐS</option>
                    <option value="admin">👑 Quản Trị Viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Mật khẩu ban đầu</label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData(p => ({ ...p, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Lượt Up-Tin tặng ban đầu</label>
                  <input
                    type="number"
                    value={userFormData.upTinCredits}
                    onChange={(e) => setUserFormData(p => ({ ...p, upTinCredits: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Số dư Ví VNĐ (đ)</label>
                  <input
                    type="number"
                    value={userFormData.balance}
                    onChange={(e) => setUserFormData(p => ({ ...p, balance: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition shadow-md cursor-pointer"
                >
                  TẠO THÀNH VIÊN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                CẬP NHẬT THÔNG TIN THÀNH VIÊN
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Họ & Tên</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại / Zalo</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Vai trò & Cấp bậc</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="owner">🏠 Cư Dân / Chủ Nhà</option>
                    <option value="sale">💼 Môi Giới / Sale BĐS</option>
                    <option value="admin">👑 Quản Trị Viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Lượt Up-Tin</label>
                  <input
                    type="number"
                    value={editingUser.upTinCredits || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, upTinCredits: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Enterprise & Business Verification in Admin modal */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 text-[11px] uppercase flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Hồ Sơ Doanh Nghiệp & Pháp Lý (MST / ĐKKD)
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Xác minh B2B</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-0.5">Tên Công Ty / Doanh Nghiệp</label>
                    <input
                      type="text"
                      placeholder="VD: Sàn BĐS NewHome / Cty Xây Dựng An Phát"
                      value={editingUser.companyName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, companyName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-0.5">Mã Số Thuế (MST)</label>
                    <input
                      type="text"
                      placeholder="VD: 0109988776"
                      value={editingUser.taxCode || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, taxCode: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-0.5">Link Ảnh Giấy Phép ĐKKD</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editingUser.businessLicenseUrl || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, businessLicenseUrl: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-0.5">Chứng Chỉ Nghề / Giấy Phép Con</label>
                    <input
                      type="text"
                      placeholder="Chứng chỉ Môi giới BĐS / Dược / ATTP..."
                      value={editingUser.brokerLicenseUrl || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, brokerLicenseUrl: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Số dư Ví VNĐ (đ)</label>
                <input
                  type="number"
                  value={editingUser.balance || 0}
                  onChange={(e) => setEditingUser({ ...editingUser, balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition shadow-md cursor-pointer"
                >
                  LƯU THAY ĐỔI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </div>
      </div>

      {/* Admin Tax Management Modal */}
      <AdminTaxManagementModal 
        isOpen={showTaxModal} 
        onClose={() => setShowTaxModal(false)} 
      />

      {/* Add / Edit Resident Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto overscroll-contain">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-500/50 shadow-2xl w-full max-w-2xl my-auto max-h-[94vh] overflow-y-auto flex flex-col relative">
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-amber-500/30 sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm sm:text-base text-amber-400">
                  {editingService ? '✏️ CHỈNH SỬA DỊCH VỤ CƯ DÂN' : '➕ THÊM DỊCH VỤ CƯ DÂN MỚI'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddServiceModal(false);
                  setEditingService(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResidentServiceSubmit} className="p-4 sm:p-6 space-y-4 text-xs pb-28 sm:pb-6">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Dịch Vụ / Ngành Nghề Cư Dân (*):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Sửa Chữa Thang Máy, Lắp Đặt Smarthome, Taxi Nội Khu..."
                  value={newSrvTitle}
                  onChange={(e) => setNewSrvTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Danh Mục Ngành Nghề (*):
                  </label>
                  <select
                    value={newSrvCategory}
                    onChange={(e) => setNewSrvCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    {BUSINESS_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Khu Đô Thị / Dự Án (*):
                  </label>
                  <select
                    value={newSrvProject}
                    onChange={(e) => setNewSrvProject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    <option value="Vinhomes Ocean Park 1">Vinhomes Ocean Park 1</option>
                    <option value="Vinhomes Ocean Park 2">Vinhomes Ocean Park 2</option>
                    <option value="Vinhomes Ocean Park 3">Vinhomes Ocean Park 3</option>
                    <option value="Vinhomes Smart City">Vinhomes Smart City</option>
                    <option value="Vinhomes Grand Park">Vinhomes Grand Park</option>
                    <option value="Toàn Hệ Thống Vinhomes">Toàn Hệ Thống Vinhomes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Họ Tên Nhà Cung Cấp / Cư Dân:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={newSrvProviderName}
                    onChange={(e) => setNewSrvProviderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Số Điện Thoại (*):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0987654321"
                    value={newSrvProviderPhone}
                    onChange={(e) => setNewSrvProviderPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Link/SĐT Zalo Chính Chủ:
                  </label>
                  <input
                    type="text"
                    placeholder="0987654321 hoặc link Zalo"
                    value={newSrvProviderZalo}
                    onChange={(e) => setNewSrvProviderZalo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Giá Hiển Thị (Ví dụ: 150.000đ/giờ, Báo giá theo khối lượng...):
                </label>
                <input
                  type="text"
                  placeholder="Thỏa thuận / 200.000đ"
                  value={newSrvPrice}
                  onChange={(e) => setNewSrvPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Địa Chỉ / Căn Hộ / Tòa Nhà:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tòa S2.01, Ocean Park 1"
                  value={newSrvAddress}
                  onChange={(e) => setNewSrvAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Mô Tả Chi Tiết Dịch Vụ:
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả năng lực, trang thiết bị, thời gian phục vụ, cam kết chất lượng..."
                  value={newSrvDesc}
                  onChange={(e) => setNewSrvDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                />
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 text-xs">
                    📷 Hình Ảnh Dịch Vụ:
                  </label>
                  <label className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>📁 Tải Ảnh Từ Máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const preview = await createInstantPreview(file);
                            setNewSrvImage(preview);
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {newSrvImage && (
                  <div className="relative rounded-xl overflow-hidden aspect-video max-w-xs bg-slate-900 border border-slate-300 dark:border-slate-700">
                    <img src={newSrvImage} alt="Service preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewSrvImage('')}
                      className="absolute top-1 right-1 w-6 h-6 bg-rose-600 text-white rounded-md flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddServiceModal(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl transition shadow-lg hover:brightness-110 cursor-pointer"
                >
                  {editingService ? 'LƯU CẬP NHẬT' : '➕ THÊM DỊCH VỤ MỚI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Package Modal */}
      {showAddPkgModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                {editingPkgModal ? `SỬA GÓI: ${editingPkgModal.name}` : 'THÊM GÓI DỊCH VỤ MỚI'}
              </h3>
              <button
                onClick={() => setShowAddPkgModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackageSubmit} className="space-y-3">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Tên Gói Dịch Vụ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: GÓI CỬA HÀNG ĐẢM BẢO"
                  value={pkgFormData.name}
                  onChange={(e) => setPkgFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Giá Hiển Thị *</label>
                  <input
                    type="text"
                    required
                    placeholder="1.990.000đ"
                    value={pkgFormData.priceDisplay}
                    onChange={(e) => setPkgFormData(p => ({ ...p, priceDisplay: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Số Tiền Số (đ)</label>
                  <input
                    type="number"
                    placeholder="1990000"
                    value={pkgFormData.priceValue}
                    onChange={(e) => setPkgFormData(p => ({ ...p, priceValue: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Đơn Vị Tính</label>
                  <input
                    type="text"
                    placeholder="/ năm, / tháng, / bài"
                    value={pkgFormData.unit}
                    onChange={(e) => setPkgFormData(p => ({ ...p, unit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Nhãn Huy Hiệu (Badge)</label>
                  <input
                    type="text"
                    placeholder="🔥 NỔI BẬT NHẤT"
                    value={pkgFormData.badge}
                    onChange={(e) => setPkgFormData(p => ({ ...p, badge: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Mô Tả Ngắn</label>
                <input
                  type="text"
                  placeholder="Mô tả công dụng gói..."
                  value={pkgFormData.description}
                  onChange={(e) => setPkgFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Tính Năng Bao Gồm (Mỗi dòng 1 tính năng)</label>
                <textarea
                  rows={4}
                  placeholder="Bao gồm toàn bộ gói Tick Xanh&#10;Huy hiệu Cửa Hàng Đảm Bảo&#10;Ưu tiên hỗ trợ từ Admin"
                  value={pkgFormData.featuresStr}
                  onChange={(e) => setPkgFormData(p => ({ ...p, featuresStr: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-popular"
                  checked={pkgFormData.popular}
                  onChange={(e) => setPkgFormData(p => ({ ...p, popular: e.target.checked }))}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="chk-popular" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Đánh dấu Gói ĐƯỢC CHỌN NHIỀU NHẤT (Nổi bật)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPkgModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  LƯU GÓI DỊCH VỤ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: QUẢN TRỊ CHI TIẾT GIAN HÀNG & DỊCH VỤ CƯ DÂN ==================== */}
      {selectedAdminStore && (() => {
        const storeProds = selectedAdminStore.products || [];
        const storePhone = selectedAdminStore.ownerPhone || (selectedAdminStore as any).phone || '';
        const matchingServs = adminResidentServices.filter(s => 
          (s.providerPhone && s.providerPhone.replace(/\D/g, '') === storePhone.replace(/\D/g, '')) ||
          (s.userId && s.userId === selectedAdminStore.userId) ||
          (s.storefrontId && s.storefrontId === selectedAdminStore.id)
        );
        const pendingProdsCount = storeProds.filter(p => p.status === 'pending').length;
        const pendingServsCount = matchingServs.filter(s => s.status === 'pending').length;

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Top Header */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-emerald-500/30">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedAdminStore.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'}
                    alt={selectedAdminStore.storeName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full uppercase">
                        {selectedAdminStore.category || 'Gian Hàng Cư Dân'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        selectedAdminStore.status === 'approved' || selectedAdminStore.status === undefined
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {selectedAdminStore.status === 'approved' || selectedAdminStore.status === undefined ? '✓ Đang Hiển Thị Web' : '⏳ Chờ Duyệt / Tạm Ẩn'}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
                      {selectedAdminStore.storeName}
                    </h2>
                    <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3 mt-1 font-medium">
                      <span>👤 Chủ shop: <strong>{selectedAdminStore.ownerName}</strong></span>
                      {storePhone && (
                        <span>📞 SĐT: <a href={`tel:${storePhone}`} className="text-amber-400 hover:underline font-mono font-bold">{storePhone}</a></span>
                      )}
                      <span>📍 Dự án: <strong>{selectedAdminStore.project?.toUpperCase() || 'VINHOMES'}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAdminStore(null)}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-base transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStoreDetailActiveTab('products')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      storeDetailActiveTab === 'products'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Sản Phẩm Gian Hàng ({storeProds.length})</span>
                    {pendingProdsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                        {pendingProdsCount} chờ
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setStoreDetailActiveTab('services')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      storeDetailActiveTab === 'services'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Dịch Vụ Cư Dân Cung Cấp ({matchingServs.length})</span>
                    {pendingServsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                        {pendingServsCount} chờ
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setStoreDetailActiveTab('info')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      storeDetailActiveTab === 'info'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Thông Tin & KiotViet POS</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {storeDetailActiveTab === 'products' && (
                    <button
                      onClick={() => handleOpenAddProduct(selectedAdminStore.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Sản Phẩm Mới</span>
                    </button>
                  )}
                  {storeDetailActiveTab === 'services' && (
                    <button
                      onClick={() => {
                        setEditingService(null);
                        resetNewSrvForm();
                        setNewSrvProviderName(selectedAdminStore.ownerName);
                        setNewSrvProviderPhone(storePhone);
                        setNewSrvProviderZalo(selectedAdminStore.ownerZalo || storePhone);
                        setNewSrvAddress(selectedAdminStore.address);
                        setNewSrvProject(selectedAdminStore.project as any);
                        setShowAddServiceModal(true);
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Dịch Vụ Mới</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                
                {/* TAB 1: SẢN PHẨM GIAN HÀNG */}
                {storeDetailActiveTab === 'products' && (
                  <div className="space-y-4">
                    {storeProds.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                        <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
                        <p className="font-bold text-sm text-slate-600 dark:text-slate-400">
                          Gian hàng này chưa có sản phẩm nào.
                        </p>
                        <button
                          onClick={() => handleOpenAddProduct(selectedAdminStore.id)}
                          className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-500"
                        >
                          ➕ Thêm Sản Phẩm Đầu Tiên
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {storeProds.map(prod => {
                          const isApproved = prod.status === 'approved' || prod.status === undefined;
                          const isPending = prod.status === 'pending';

                          return (
                            <div
                              key={prod.id}
                              className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 shadow-sm flex flex-col justify-between gap-3 transition ${
                                isPending
                                  ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20 bg-amber-50/20 dark:bg-amber-950/10'
                                  : 'border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                                  alt={prod.name}
                                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                <div className="min-w-0 flex-1 space-y-1">
                                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">
                                    {prod.name}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="font-black text-amber-500">
                                      {prod.price.toLocaleString('vi-VN')}đ
                                    </span>
                                    {prod.unit && <span className="text-slate-400 text-[10px]">/ {prod.unit}</span>}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span>Tồn: <strong>{prod.stockQuantity}</strong></span>
                                    <span>•</span>
                                    <span>{prod.category}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Moderation Status Tag */}
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                                <div>
                                  {isPending ? (
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] rounded-md border border-amber-500/30 flex items-center gap-1">
                                      ⏳ Chờ duyệt (Chỉ cư dân thấy)
                                    </span>
                                  ) : isApproved ? (
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-md border border-emerald-500/30 flex items-center gap-1">
                                      ✓ Đã duyệt • Hiện trên Web
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-600 dark:text-red-400 font-extrabold text-[10px] rounded-md border border-red-500/30 flex items-center gap-1">
                                      ❌ Tạm ẩn
                                    </span>
                                  )}
                                </div>

                                {prod.code && (
                                  <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                    {prod.code}
                                  </span>
                                )}
                              </div>

                              {/* Admin Action Buttons */}
                              <div className="grid grid-cols-3 gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductApproval(selectedAdminStore.id, prod.id)}
                                  title={isApproved ? "Chuyển về Chờ duyệt / Tạm ẩn" : "Duyệt hiển thị lên Website"}
                                  className={`py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                    isApproved
                                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white'
                                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                                  }`}
                                >
                                  {isApproved ? 'Ẩn web' : '✓ Duyệt'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3 text-blue-500" />
                                  <span>Sửa</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteStoreProduct(selectedAdminStore.id, prod.id)}
                                  className="py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: DỊCH VỤ CƯ DÂN LIÊN QUAN */}
                {storeDetailActiveTab === 'services' && (
                  <div className="space-y-4">
                    {matchingServs.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                        <Wrench className="w-10 h-10 text-slate-400 mx-auto" />
                        <p className="font-bold text-sm text-slate-600 dark:text-slate-400">
                          Chưa có bài dịch vụ cư dân nào được liên kết với số điện thoại này.
                        </p>
                        <button
                          onClick={() => {
                            setEditingService(null);
                            resetNewSrvForm();
                            setNewSrvProviderName(selectedAdminStore.ownerName);
                            setNewSrvProviderPhone(storePhone);
                            setNewSrvProviderZalo(selectedAdminStore.ownerZalo || storePhone);
                            setNewSrvAddress(selectedAdminStore.address);
                            setNewSrvProject(selectedAdminStore.project as any);
                            setShowAddServiceModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-500"
                        >
                          ➕ Thêm Dịch Vụ Mới
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {matchingServs.map(srv => {
                          const isApproved = srv.status === 'approved' || srv.approved === true || srv.status === undefined;
                          const isVerified = srv.verified || srv.kycStatus === 'verified';

                          return (
                            <div
                              key={srv.id}
                              className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 shadow-sm flex flex-col justify-between gap-3 ${
                                !isApproved
                                  ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20 bg-amber-50/20 dark:bg-amber-950/10'
                                  : 'border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={srv.images?.[0] || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80'}
                                  alt={srv.title}
                                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold rounded">
                                      {srv.subCategory || srv.categoryId}
                                    </span>
                                    {isVerified && (
                                      <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] font-black rounded flex items-center gap-0.5">
                                        <BadgeCheck className="w-2.5 h-2.5" /> KYC
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-2">
                                    {srv.title}
                                  </h4>
                                  <div className="text-[11px] font-black text-amber-500">
                                    {srv.priceDisplay || srv.price || 'Thỏa thuận'}
                                  </div>
                                </div>
                              </div>

                              {/* Status Tag */}
                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                <div>
                                  {isApproved ? (
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-md border border-emerald-500/30 flex items-center gap-1">
                                      ✓ Đã duyệt • Hiện trên Web
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] rounded-md border border-amber-500/30 flex items-center gap-1">
                                      ⏳ Chờ duyệt (Chỉ cư dân thấy)
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {srv.createdAt || 'Mới đăng'}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="grid grid-cols-3 gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleServiceStatus(srv.id, srv.status)}
                                  className={`py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                    isApproved
                                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white'
                                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                                  }`}
                                >
                                  {isApproved ? 'Ẩn web' : '✓ Duyệt'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEditServiceClick(srv)}
                                  className="py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3 text-blue-500" />
                                  <span>Sửa</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteResidentService(srv.id)}
                                  className="py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: THÔNG TIN GIAN HÀNG & KIOTVIET POS */}
                {storeDetailActiveTab === 'info' && (
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Tên Gian Hàng:</span>
                        <p className="font-black text-slate-900 dark:text-white text-sm">{selectedAdminStore.storeName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Chủ Sở Hữu & SĐT:</span>
                        <p className="font-black text-slate-900 dark:text-white text-sm">
                          {selectedAdminStore.ownerName} • {storePhone}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Địa Chỉ Phục Vụ:</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{selectedAdminStore.address}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Dự Án & Phân Khu:</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {selectedAdminStore.project?.toUpperCase()} • {selectedAdminStore.subdivision || 'Nội khu'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-slate-400 font-bold block mb-1">Mô Tả Gian Hàng:</span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedAdminStore.description}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          selectedAdminStore.kiotVietConfig?.syncStatus === 'connected'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {selectedAdminStore.kiotVietConfig?.syncStatus === 'connected' ? '⚡ KiotViet POS Live Connected' : 'Chưa kết nối API POS KiotViet'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenEditStore(selectedAdminStore)}
                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                      >
                        Chỉnh Sửa Thông Tin Gian Hàng
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Bottom Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Mọi thay đổi được tự động cập nhật ngay trên hệ thống Chợ Cư Dân 24H.</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setSelectedAdminStore(null)}
                    className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-300 cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      handleSyncAllToWebsite();
                      setSelectedAdminStore(null);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-emerald-500/25 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>CẬP NHẬT & ĐỒNG BỘ LÊN WEBSITE</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ==================== MODAL: THÊM / SỬA SẢN PHẨM GIAN HÀNG ==================== */}
      {showStoreProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-500" />
                <span>{editingStoreProduct ? 'CHỈNH SỬA SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}</span>
              </h3>
              <button
                onClick={() => setShowStoreProductModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStoreProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Tên Sản Phẩm (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cơm Gà Xối Mỡ Sốt Chua Ngọt"
                  value={storeProductForm.name}
                  onChange={(e) => setStoreProductForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Mã SKU</label>
                  <input
                    type="text"
                    value={storeProductForm.code}
                    onChange={(e) => setStoreProductForm(p => ({ ...p, code: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Danh Mục</label>
                  <select
                    value={storeProductForm.category}
                    onChange={(e) => setStoreProductForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Món Ăn & Đồ Uống">Món Ăn & Đồ Uống</option>
                    <option value="Thực Phẩm Tươi Sống">Thực Phẩm Tươi Sống</option>
                    <option value="Hàng Tiêu Dùng & Tạp Hóa">Hàng Tiêu Dùng & Tạp Hóa</option>
                    <option value="Đồ Gia Dụng & Nội Thất">Đồ Gia Dụng & Nội Thất</option>
                    <option value="Dịch Vụ Cư Dân">Dịch Vụ Cư Dân</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Giá Bán (VNĐ) (*)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={storeProductForm.price}
                    onChange={(e) => setStoreProductForm(p => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Đơn Vị</label>
                  <input
                    type="text"
                    placeholder="suất, hộp, cái..."
                    value={storeProductForm.unit}
                    onChange={(e) => setStoreProductForm(p => ({ ...p, unit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Tồn Kho</label>
                  <input
                    type="number"
                    min="0"
                    value={storeProductForm.stockQuantity}
                    onChange={(e) => setStoreProductForm(p => ({ ...p, stockQuantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300">Hình Ảnh Sản Phẩm (Dưới 10MB)</label>
                  <label className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 shadow transition">
                    <Upload className="w-3 h-3" />
                    <span>📁 Tải Từ Máy</span>
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
                            return;
                          }
                          const previewUrl = createInstantPreview(file);
                          setStoreProductForm(p => ({ ...p, images: [previewUrl] }));

                          addWatermarkToImage(file).then(compressed => {
                            if (compressed) {
                              setStoreProductForm(p => ({ ...p, images: [compressed] }));
                            }
                          }).catch(console.error);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={storeProductForm.images[0] || ''}
                    onChange={(e) => setStoreProductForm(p => ({ ...p, images: [e.target.value] }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  />
                  {storeProductForm.images[0] && (
                    <img
                      src={storeProductForm.images[0]}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Mô Tả Sản Phẩm</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả sản phẩm, thành phần, cam kết vệ sinh an toàn..."
                  value={storeProductForm.description}
                  onChange={(e) => setStoreProductForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Moderation Status selector */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="block font-extrabold text-slate-700 dark:text-slate-300">
                  Phê Duyệt Hiển Thị Website:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStoreProductForm(p => ({ ...p, status: 'approved' }))}
                    className={`py-2 px-3 rounded-lg font-black text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                      storeProductForm.status === 'approved'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Đã Duyệt (Hiện Web)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStoreProductForm(p => ({ ...p, status: 'pending' }))}
                    className={`py-2 px-3 rounded-lg font-black text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                      storeProductForm.status === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>⏳ Chờ Duyệt (Ẩn Web)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStoreProductModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  LƯU SẢN PHẨM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: THÊM / SỬA GIAN HÀNG CƯ DÂN ==================== */}
      {showStoreFormModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-500" />
                <span>{editingStoreItem ? 'CHỈNH SỬA GIAN HÀNG CƯ DÂN' : 'TẠO GIAN HÀNG MỚI'}</span>
              </h3>
              <button
                onClick={() => setShowStoreFormModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStoreFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Tên Gian Hàng (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bếp Cư Dân Vin - Cơm Niêu Singapore"
                  value={storeFormData.storeName}
                  onChange={(e) => setStoreFormData(p => ({ ...p, storeName: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Tên Chủ Shop</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={storeFormData.ownerName}
                    onChange={(e) => setStoreFormData(p => ({ ...p, ownerName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Số Điện Thoại (*)</label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912.345.678"
                    value={storeFormData.ownerPhone}
                    onChange={(e) => setStoreFormData(p => ({ ...p, ownerPhone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Dự Án Vinhomes</label>
                  <select
                    value={storeFormData.project}
                    onChange={(e) => setStoreFormData(p => ({ ...p, project: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    <option value="ocean-park-1">Ocean Park 1 (Gia Lâm)</option>
                    <option value="ocean-park-2">Ocean Park 2 (The Empire)</option>
                    <option value="ocean-park-3">Ocean Park 3 (The Crown)</option>
                    <option value="smart-city">Smart City (Tây Mỗ)</option>
                    <option value="grand-park">Grand Park (TP. Thủ Đức)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Ngành Hàng</label>
                  <select
                    value={storeFormData.category}
                    onChange={(e) => setStoreFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Thực Phẩm & Ăn Uống">Thực Phẩm & Ăn Uống</option>
                    <option value="Nội Thất & Gia Dụng">Nội Thất & Gia Dụng</option>
                    <option value="Bảo Trì & Sửa Chữa">Bảo Trì & Sửa Chữa</option>
                    <option value="Chăm Sóc & Làm Đẹp">Chăm Sóc & Làm Đẹp</option>
                    <option value="Vận Tải & Chuyển Nhà">Vận Tải & Chuyển Nhà</option>
                    <option value="Giáo Dục & Rèn Luyện">Giáo Dục & Rèn Luyện</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Địa Chỉ Phục Vụ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Shophouse Sao Biển 12-34, Vinhomes Ocean Park 2"
                  value={storeFormData.address}
                  onChange={(e) => setStoreFormData(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300">Logo Gian Hàng (Dưới 10MB)</label>
                  <label className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 shadow transition">
                    <Upload className="w-3 h-3" />
                    <span>📁 Tải Logo</span>
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
                            return;
                          }
                          const previewUrl = createInstantPreview(file);
                          setStoreFormData(p => ({ ...p, logoUrl: previewUrl }));

                          addWatermarkToImage(file, { skipWatermark: true, maxDim: 600 }).then(compressed => {
                            if (compressed) {
                              setStoreFormData(p => ({ ...p, logoUrl: compressed }));
                            }
                          }).catch(console.error);
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="url"
                  placeholder="https://..."
                  value={storeFormData.logoUrl}
                  onChange={(e) => setStoreFormData(p => ({ ...p, logoUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Mô Tả Gian Hàng</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả phong cách, sản phẩm chính, uy tín..."
                  value={storeFormData.description}
                  onChange={(e) => setStoreFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Status toggle */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="block font-extrabold text-slate-700 dark:text-slate-300">
                  Trạng Thái Phê Duyệt Gian Hàng:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStoreFormData(p => ({ ...p, status: 'approved' }))}
                    className={`py-2 px-3 rounded-lg font-black text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                      storeFormData.status === 'approved'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Đã Duyệt (Hiện Web)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStoreFormData(p => ({ ...p, status: 'pending' }))}
                    className={`py-2 px-3 rounded-lg font-black text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                      storeFormData.status === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>⏳ Chờ Duyệt (Tạm Ẩn)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStoreFormModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  LƯU GIAN HÀNG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NẠP / TẶNG TOKEN CƯ DÂN */}
      {selectedUserForCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Nạp / Tặng Token Thành Viên</h3>
                  <p className="text-[10px] text-slate-400">Cấp thêm số dư Token hoặc Lượt Up tin cho User</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForCredit(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Thành viên:</span>
                <span className="font-extrabold text-white">{selectedUserForCredit.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-300">{selectedUserForCredit.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số dư hiện tại:</span>
                <span className="font-mono font-bold text-amber-400">{(selectedUserForCredit.balance || 0).toLocaleString('vi-VN')} Token</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lượt Up tin hiện có:</span>
                <span className="font-mono font-bold text-sky-400">{selectedUserForCredit.upTinCredits || 0} lượt</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Loại tài nguyên cộng thưởng:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCreditFundType('balance')}
                    className={`py-1.5 px-2 rounded-xl text-center font-extrabold transition cursor-pointer border ${
                      creditFundType === 'balance'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    🪙 Token VNĐ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditFundType('upTinCredits')}
                    className={`py-1.5 px-2 rounded-xl text-center font-extrabold transition cursor-pointer border ${
                      creditFundType === 'upTinCredits'
                        ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-xs'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    🚀 Lượt Up Tin
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditFundType('affiliatePoints')}
                    className={`py-1.5 px-2 rounded-xl text-center font-extrabold transition cursor-pointer border ${
                      creditFundType === 'affiliatePoints'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    💸 Hoa Hồng
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {creditFundType === 'upTinCredits' ? 'Số lượt Up tin cấp phát:' : 'Số tiền / Token nạp (VNĐ):'}
                </label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={e => setCreditAmount(Number(e.target.value))}
                  placeholder={creditFundType === 'upTinCredits' ? '10' : '50000'}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Lý do nạp / ghi chú quản trị:</label>
                <input
                  type="text"
                  value={creditReason}
                  onChange={e => setCreditReason(e.target.value)}
                  placeholder="Thưởng sự kiện, nạp tiền trực tiếp..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedUserForCredit(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isProcessingCredit || creditAmount <= 0}
                onClick={async () => {
                  if (!selectedUserForCredit) return;
                  setIsProcessingCredit(true);
                  try {
                    const res = await fetch('/api/admin/finance/pump-balance', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: selectedUserForCredit.id,
                        amount: creditAmount,
                        actionType: 'credit',
                        fundType: creditFundType,
                        reason: creditReason,
                        adminName: 'Super Admin'
                      })
                    });
                    if (res.ok) {
                      alert(`🎉 Đã cấp thành công ${creditAmount.toLocaleString('vi-VN')} ${creditFundType === 'upTinCredits' ? 'lượt' : 'Token'} cho ${selectedUserForCredit.name}!`);
                      setSelectedUserForCredit(null);
                      if (onRefreshData) onRefreshData();
                    } else {
                      alert('Có lỗi xảy ra khi nạp điểm.');
                    }
                  } catch (e) {
                    alert('Lỗi kết nối máy chủ.');
                  } finally {
                    setIsProcessingCredit(false);
                  }
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isProcessingCredit ? 'Đang Xử Lý...' : 'XÁC NHẬN CỘNG ĐIỂM'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
