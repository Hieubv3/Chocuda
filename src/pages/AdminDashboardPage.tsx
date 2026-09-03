import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Property, NewsArticle, LeadContact, User, UpTinPricingConfig, UpTinTransaction, AdBanner, Project, ResidentServiceItem, UserStorefront, StoreOrder, StoreProduct, BUSINESS_CATEGORIES, StorePackage, StorePackageOrder } from '../types';
import { ShieldCheck, Check, Trash2, Phone, Mail, Sparkles, RefreshCw, RotateCcw, Archive, Eye, MessageSquare, Database, CheckCircle2, Clock, Zap, QrCode, Settings, Layers, UserCheck, Globe, Edit3, Plus, PlusCircle, MapPin, Building2, ImageIcon, FileText, Share2, X, Download, Search, Calendar, Filter, FileSpreadsheet, Upload, BarChart3, TrendingUp, UserX, UserPlus, PhoneCall, Award, Ban, Shield, Activity, Smartphone, Monitor, Tablet, ArrowUpRight, Wallet, Layout, Store, ShoppingBag, Wrench, Truck, Coffee, Star, BadgeCheck, ShieldAlert, DollarSign, Package, User as UserIcon, Briefcase, Home, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Menu, LogOut, Loader2, Save } from 'lucide-react';
import { AdminRecruitmentManager } from '../components/AdminRecruitmentManager';
import { AdminKycManager } from '../components/AdminKycManager';
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
import { uploadBase64DataUrl, isBase64DataUrl, uploadFiles } from '../lib/uploadService';
import { compressImageFile } from '../lib/imageUtils';
import { HeroCardConfig, loadHeroCards, saveHeroCards } from '../data/heroCardsData';
import { EditPropertyModal, EditProjectModal, EditNewsModal, EditFaqModal } from '../components/AdminAssetManagerModals';
import { AdminMarketingCenter } from '../components/AdminMarketingCenter';
import { AdminSeoCenter } from '../components/AdminSeoCenter';
import { AdminZaloGroupCenter } from '../components/AdminZaloGroupCenter';
import { SocialShareModal } from '../components/SocialShareModal';
import { AdminCreditInjectorModal } from '../components/AdminCreditInjectorModal';
import { EnterpriseAdminCore } from '../components/EnterpriseAdminCore';
import { AdminTaxManagementModal } from '../components/AdminTaxManagementModal';
import { GoogleWorkspaceCenter } from '../components/GoogleWorkspaceCenter';

interface AdminDashboardPageProps {
  properties: Property[];
  projects?: Project[];
  news: NewsArticle[];
  contacts: LeadContact[];
  pricingConfig: UpTinPricingConfig;
  onSavePricingConfig: (newConfig: UpTinPricingConfig) => void;
  onApproveProperty: (id: string) => void;
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
  // 7 Máº£ng Quáº£n Trá»‹ ChuyÃªn Biá»‡t TÃ¡ch Rá»i (1. BÄS, 2. Thá»£ Dá»‹ch Vá»¥, 3. Tuyá»ƒn Dá»¥ng, 4. Dá»‹ch Vá»¥ CÆ° DÃ¢n, 5. NgÆ°á»i DÃ¹ng, 6. Quáº£ng CÃ¡o, 7. CÃ´ng Cá»¥)
  const [adminSector, setAdminSector] = useState<'bds' | 'resident_market'>('bds');
  const [activeTab, setActiveTab] = useState<
    | 'properties' | 'projects' | 'news' | 'ads' | 'pricing' | 'leads' | 'users' | 'analytics' | 'n8n' | 'marketing' | 'seo' | 'zalo' | 'affiliate_mgmt' | 'reputation' | 'enterprise_core' | 'workspace_sync' | 'faq'
    | 'resident_services_mgmt' | 'recruitment_mgmt' | 'stores_mgmt' | 'orders_mgmt' | 'partners_reputation' | 'resident_finance' | 'package_orders_mgmt'
  >('properties');

  // Compute active main category (PhÃ¢n rÃµ cÃ¡c tab riÃªng biá»‡t khÃ´ng bá»‹ gá»™p chung)
  const effectiveMainTab: 'bds' | 'technicians' | 'recruitment' | 'resident_market' | 'users_leads' | 'ads' | 'tools' = (() => {
    if (['properties', 'projects', 'news', 'pricing', 'affiliate_mgmt', 'faq'].includes(activeTab)) return 'bds';
    if (activeTab === 'resident_services_mgmt') return 'technicians';
    if (activeTab === 'recruitment_mgmt') return 'recruitment';
    if (['stores_mgmt', 'orders_mgmt', 'package_orders_mgmt', 'resident_finance', 'partners_reputation'].includes(activeTab)) return 'resident_market';
    if (['users', 'leads', 'enterprise_core'].includes(activeTab)) return 'users_leads';
    if (activeTab === 'ads') return 'ads';
    return 'tools';
  })();

  const handleSelectMainTab = (tab: 'bds' | 'technicians' | 'recruitment' | 'resident_market' | 'users_leads' | 'ads' | 'tools') => {
    if (tab === 'bds') {
      setAdminSector('bds');
      if (!['properties', 'projects', 'news', 'pricing', 'affiliate_mgmt', 'faq'].includes(activeTab)) {
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

  // Mobile Gesture Navigation (Gáº¡t sang trÃ¡i: Sang Tab tiáº¿p theo / Sá»• menu | Gáº¡t sang pháº£i: Quay láº¡i Tab trÆ°á»›c)
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

    // NgÆ°á»¡ng vuá»‘t ngang (threshold: 45px vÃ  gÃ³c chá»§ Ä‘áº¡o lÃ  trá»¥c X)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      if (deltaX < 0) {
        // Gáº¡t sang trÃ¡i (Swipe Left) -> Chuyá»ƒn sang Tab káº¿ tiáº¿p
        handleNextTab();
      } else {
        // Gáº¡t sang pháº£i (Swipe Right) -> Quay láº¡i Tab trÆ°á»›c Ä‘Ã³
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
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const toggleExpandAdminProp = (id: string) => {
    setExpandedAdminPropIds(prev => ({ ...prev, [id]: !prev[id] }));
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
    category: '',
    project: '' as any,
    subdivision: '',
    address: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    status: 'pending' as 'approved' | 'pending' | 'rejected',
    verified: false
  });

  // Store Product Add / Edit Modal
  const [showStoreProductModal, setShowStoreProductModal] = useState<boolean>(false);
  const [editingStoreProduct, setEditingStoreProduct] = useState<StoreProduct | null>(null);
  const [storeProductForm, setStoreProductForm] = useState({
    id: '',
    name: '',
    code: '',
    category: '',
    price: 0,
    unit: '',
    stockQuantity: 0,
    images: [],
    description: '',
    status: 'pending' as 'approved' | 'pending' | 'rejected',
    isAvailable: false
  });

  // Package Management State
  const [editingPkgModal, setEditingPkgModal] = useState<StorePackage | null>(null);
  const [showAddPkgModal, setShowAddPkgModal] = useState<boolean>(false);
  const [pkgFormData, setPkgFormData] = useState({
    name: '',
    priceDisplay: '',
    priceValue: 0,
    unit: '',
    badge: '',
    description: '',
    featuresStr: '',
    buttonText: '',
    buttonVariant: 'primary' as 'primary' | 'success' | 'warning' | 'purple' | 'outline',
    popular: false
  });

  const handleOpenAddPkgModal = () => {
    setEditingPkgModal(null);
    setPkgFormData({
      name: '',
      priceDisplay: '',
      priceValue: 0,
      unit: '',
      badge: '',
      description: '',
      featuresStr: '',
      buttonText: '',
      buttonVariant: 'primary',
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
       unit: pkg.unit || '',
       badge: pkg.badge || '',
       description: pkg.description || '',
       featuresStr: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
       buttonText: pkg.buttonText || '',
       buttonVariant: (pkg.buttonVariant as any) || 'primary',
       popular: Boolean(pkg.popular)
    });
    setShowAddPkgModal(true);
  };

  const handleSavePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgFormData.name || !pkgFormData.priceDisplay) {
      alert('Vui lÃ²ng Ä‘iá»n TÃªn gÃ³i dá»‹ch vá»¥ vÃ  GiÃ¡ hiá»ƒn thá»‹!');
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
        alert(editingPkgModal ? 'ðŸŽ‰ ÄÃ£ cáº­p nháº­t gÃ³i dá»‹ch vá»¥ thÃ nh cÃ´ng!' : 'ðŸŽ‰ ÄÃ£ táº¡o gÃ³i dá»‹ch vá»¥ má»›i!');
        setShowAddPkgModal(false);
        setEditingPkgModal(null);
        fetchStorePackages();
      } else {
        alert('CÃ³ lá»—i xáº£y ra khi lÆ°u gÃ³i dá»‹ch vá»¥.');
      }
    } catch (err) {
      console.error('Error saving package:', err);
    }
  };

  const handleDeletePackageClick = async (pkgId: string, pkgName: string) => {
    if (!confirm(`Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a gÃ³i dá»‹ch vá»¥ "${pkgName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/store-packages/${pkgId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('ÄÃ£ xÃ³a gÃ³i dá»‹ch vá»¥!');
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
        alert(status === 'approved' ? 'ðŸŽ‰ ÄÃ£ phÃª duyá»‡t & kÃ­ch hoáº¡t GÃ³i Dá»‹ch Vá»¥ cho khÃ¡ch hÃ ng!' : 'ÄÃ£ chuyá»ƒn Ä‘Æ¡n Ä‘Äƒng kÃ½ sang tráº¡ng thÃ¡i Tá»« chá»‘i.');
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
  const [newSrvProject, setNewSrvProject] = useState('');
  const [newSrvProviderName, setNewSrvProviderName] = useState('');
  const [newSrvProviderPhone, setNewSrvProviderPhone] = useState('');
  const [newSrvProviderZalo, setNewSrvProviderZalo] = useState('');
  const [newSrvAddress, setNewSrvAddress] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvImage, setNewSrvImage] = useState('');
  const [newSrvDesc, setNewSrvDesc] = useState('');

  const resetNewSrvForm = () => {
    setNewSrvTitle('');
    setNewSrvCategory('');
    setNewSrvSubCat('');
    setNewSrvProject('');
    setNewSrvProviderName('');
    setNewSrvProviderPhone('');
    setNewSrvProviderZalo('');
    setNewSrvAddress('');
    setNewSrvPrice('');
    setNewSrvImage('');
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
        alert(`ðŸŽ‰ ÄÃ£ gia háº¡n bÃ i dá»‹ch vá»¥ "${title || 'CÆ° dÃ¢n'}" thÃ nh cÃ´ng thÃªm 30 ngÃ y!`);
        fetchResidentServices();
      } else {
        alert(data.error || 'CÃ³ lá»—i khi gia háº¡n dá»‹ch vá»¥.');
      }
    } catch (e) {
      console.error('Error renewing resident service:', e);
      alert('KhÃ´ng thá»ƒ káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.');
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

  // Admin Affiliate & Platform Fee Config State
  const [affiliateF1Rate, setAffiliateF1Rate] = useState<number>(0);
  const [affiliateF2Rate, setAffiliateF2Rate] = useState<number>(0);
  const [refBonusUpTin, setRefBonusUpTin] = useState<number>(0);
  const [servicePackageMonthPrice, setServicePackageMonthPrice] = useState<number>(0);
  const [servicePackage3MonthPrice, setServicePackage3MonthPrice] = useState<number>(0);
  const [isSavingAffiliateConfig, setIsSavingAffiliateConfig] = useState(false);

  const fetchAffiliateConfig = async () => {
    try {
      const res = await fetch('/api/admin/affiliate-config');
      const cfg = await res.json();
      if (cfg) {
        if (typeof cfg.affiliateF1Rate === 'number') setAffiliateF1Rate(cfg.affiliateF1Rate);
        if (typeof cfg.affiliateF2Rate === 'number') setAffiliateF2Rate(cfg.affiliateF2Rate);
        if (typeof cfg.refBonusUpTin === 'number') setRefBonusUpTin(cfg.refBonusUpTin);
        if (typeof cfg.servicePackageMonthPrice === 'number') setServicePackageMonthPrice(cfg.servicePackageMonthPrice);
        if (typeof cfg.servicePackage3MonthPrice === 'number') setServicePackage3MonthPrice(cfg.servicePackage3MonthPrice);
      }
    } catch (err) {
      console.warn('KhÃ´ng thá»ƒ táº£i cáº¥u hÃ¬nh affiliate:', err);
    }
  };

  const handleSaveAffiliateConfig = async () => {
    setIsSavingAffiliateConfig(true);
    try {
      const res = await fetch('/api/admin/affiliate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateF1Rate,
          affiliateF2Rate,
          refBonusUpTin,
          servicePackageMonthPrice,
          servicePackage3MonthPrice
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('ðŸŽ‰ ÄÃ£ lÆ°u cáº¥u hÃ¬nh Hoa Há»“ng & Thu PhÃ­ Ná»n Táº£ng xuá»‘ng server thÃ nh cÃ´ng!');
      } else {
        alert(data.error || 'LÆ°u cáº¥u hÃ¬nh tháº¥t báº¡i.');
      }
    } catch (err) {
      alert('Lá»—i mÃ¡y chá»§ khi lÆ°u cáº¥u hÃ¬nh.');
    } finally {
      setIsSavingAffiliateConfig(false);
    }
  };
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [payoutRequestsLoading, setPayoutRequestsLoading] = useState(false);
  const [payoutActionId, setPayoutActionId] = useState<string | null>(null);
  const [affiliateStats, setAffiliateStats] = useState<{ totalPaid: number; refUserCount: number } | null>(null);

  const fetchAffiliateStats = async () => {
    try {
      const res = await fetch('/api/auth/users');
      const users = await res.json();
      if (Array.isArray(users)) {
        const totalPaid = users.reduce((sum: number, u: any) => sum + (Number(u.totalAffiliateEarned) || 0), 0);
        const refUserCount = users.filter((u: any) => (Number(u.affiliatePoints) || 0) > 0 || (Number(u.totalAffiliateEarned) || 0) > 0).length;
        setAffiliateStats({ totalPaid, refUserCount });
      }
    } catch (err) {
      console.warn('KhÃ´ng thá»ƒ táº£i sá»‘ liá»‡u affiliate:', err);
    }
  };

  const fetchPayoutRequests = async () => {
    setPayoutRequestsLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals?status=all');
      const data = await res.json();
      if (Array.isArray(data)) setPayoutRequests(data);
    } catch (err) {
      console.warn('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch yÃªu cáº§u rÃºt tiá»n:', err);
    } finally {
      setPayoutRequestsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'affiliate_mgmt') {
      fetchPayoutRequests();
      fetchAffiliateStats();
      fetchAffiliateConfig();
    }
  }, [activeTab]);

  const handleApprovePayout = async (id: string) => {
    setPayoutActionId(id);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await fetchPayoutRequests();
      } else {
        alert(data.error || 'Duyá»‡t lá»‡nh rÃºt tiá»n tháº¥t báº¡i.');
      }
    } catch (err) {
      alert('Lá»—i mÃ¡y chá»§ khi duyá»‡t lá»‡nh rÃºt tiá»n.');
    } finally {
      setPayoutActionId(null);
    }
  };

  const handleRejectPayout = async (id: string) => {
    const reason = window.prompt('LÃ½ do tá»« chá»‘i (tiá»n sáº½ Ä‘Æ°á»£c hoÃ n láº¡i vÃ o vÃ­ cÆ° dÃ¢n):', 'ThÃ´ng tin ngÃ¢n hÃ ng khÃ´ng khá»›p');
    if (reason === null) return;
    setPayoutActionId(id);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchPayoutRequests();
      } else {
        alert(data.error || 'Tá»« chá»‘i lá»‡nh rÃºt tiá»n tháº¥t báº¡i.');
      }
    } catch (err) {
      alert('Lá»—i mÃ¡y chá»§ khi tá»« chá»‘i lá»‡nh rÃºt tiá»n.');
    } finally {
      setPayoutActionId(null);
    }
  };

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
        `âœ… ÄÃƒ Äá»’NG Bá»˜ Ná»˜I DUNG LÃŠN PUBLIC WEBSITE THÃ€NH CÃ”NG!\n\n` +
        `â€¢ ÄÃ£ phÃª duyá»‡t má»›i: ${newlyApprovedProperties} tin BÄS chá» duyá»‡t, ${newlyPublishedNews} bÃ i viáº¿t tin tá»©c.\n` +
        `â€¢ Tá»•ng dá»¯ liá»‡u hiá»ƒn thá»‹ public: ${properties.length} tin BÄS, ${news.length} tin tá»©c, ${projects.length} sÆ¡ Ä‘á»“ dá»± Ã¡n.\n` +
        `â€¢ ToÃ n bá»™ Admin cáº¥p dÆ°á»›i & KhÃ¡ch hÃ ng Ä‘Ã£ cÃ³ thá»ƒ xem dá»¯ liá»‡u má»›i nháº¥t trÃªn giao diá»‡n Web Public.`
      );
    }, 600);
  };

  const handleUnapproveProperty = (p: Property) => {
    if (confirm(`Báº¡n cÃ³ cháº¯c muá»‘n tráº£ tin "${p.title}" vá» tráº¡ng thÃ¡i Chá» Duyá»‡t?`)) {
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
    if (!window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a yÃªu cáº§u xem nhÃ  nÃ y?')) return;
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
      alert('ChÆ°a cÃ³ dá»¯ liá»‡u Ä‘áº·t lá»‹ch xem nhÃ  Ä‘á»ƒ xuáº¥t file!');
      return;
    }

    const headers = [
      'STT',
      'Há» vÃ  TÃªn KhÃ¡ch HÃ ng',
      'Sá»‘ Äiá»‡n Thoáº¡i Zalo',
      'Email',
      'Dá»± Ãn Quan TÃ¢m',
      'CÄƒn BÄS Äáº·t Lá»‹ch Xem',
      'NgÆ°á»i ÄÄƒng Tin (Chá»§ NhÃ  / Admin)',
      'SÄT NgÆ°á»i ÄÄƒng Tin',
      'Thá»i Gian Muá»‘n Xem',
      'Ghi ChÃº YÃªu Cáº§u',
      'Loáº¡i YÃªu Cáº§u',
      'Tráº¡ng ThÃ¡i',
      'Thá»i Gian Gá»­i YÃªu Cáº§u'
    ];

    const rows = listToExport.map((c, index) => [
      index + 1,
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.projectInterest || '').replace(/"/g, '""')}"`,
      `"${(c.propertyTitle || '').replace(/"/g, '""')}"`,
      `"${(c.sellerName || 'NgÆ°á»i Ä‘Äƒng tin').replace(/"/g, '""')}"`,
      `"${(c.sellerPhone || '').replace(/"/g, '""')}"`,
      `"${(c.preferredTime || '').replace(/"/g, '""')}"`,
      `"${(c.note || '').replace(/"/g, '""')}"`,
      c.type === 'viewing' ? 'Äáº·t lá»‹ch xem nhÃ ' : c.type === 'deposit' ? 'Cá»c giá»¯ chá»—' : 'TÆ° váº¥n',
      c.status === 'done' ? 'ÄÃ£ hoÃ n táº¥t' : c.status === 'contacted' ? 'ÄÃ£ liÃªn há»‡' : 'YÃªu cáº§u má»›i',
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
    const input = window.prompt(`Nháº­p sá»‘ lÆ°á»£t Up Tin má»›i cho tÃ i khoáº£n (Hiá»‡n táº¡i: ${currentCredits} lÆ°á»£t):`, String(currentCredits + 10));
    if (input === null) return;
    const newAmount = parseInt(input, 10);
    if (isNaN(newAmount) || newAmount < 0) {
      alert('Vui lÃ²ng nháº­p sá»‘ há»£p lá»‡!');
      return;
    }

    try {
      setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, upTinCredits: newAmount } : u));
      await fetch(`/api/auth/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upTinCredits: newAmount })
      });
      alert(`ÄÃ£ cáº¥p ${newAmount} lÆ°á»£t Up Tin thÃ nh cÃ´ng!`);
      fetchUsers();
    } catch (e) {
      console.error('Error adjusting UpTin credits:', e);
    }
  };

  const handleToggleBlockUser = async (userId: string, currentBlocked: boolean) => {
    const actionName = currentBlocked ? 'Má»ž KHÃ“A' : 'Táº M KHÃ“A';
    if (!window.confirm(`Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n ${actionName} tÃ i khoáº£n nÃ y?`)) return;

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
    if (!window.confirm('âš ï¸ Cáº¢NH BÃO: XÃ³a tÃ i khoáº£n nÃ y khá»i há»‡ thá»‘ng vÄ©nh viá»…n?')) return;

    try {
      setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
      await fetch(`/api/auth/users/${userId}`, { method: 'DELETE' });
      alert('ÄÃ£ xÃ³a tÃ i khoáº£n thÃ nh cÃ´ng!');
      fetchUsers();
    } catch (e) {
      console.error('Error deleting user:', e);
    }
  };

  // Asset Modals State
  const [showTaxModal, setShowTaxModal] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<string>('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');

  // Project hierarchy: parent projects (no parentId) and their children
  const parentProjects = projects.filter(p => !p.parentId);
  const childProjects = (parentId: string) => projects.filter(p => p.parentId === parentId);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [adminFaq, setAdminFaq] = useState<any[]>([]);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  // Project Tree State â€” quáº£n lÃ½ cÃ¢y dá»± Ã¡n (dá»± Ã¡n â†’ phÃ¢n khu â†’ dÃ£y phá»‘)
  const [expandedProjectTree, setExpandedProjectTree] = useState<Set<string>>(new Set());
  const [expandedSubdivisionTree, setExpandedSubdivisionTree] = useState<Set<string>>(new Set());
  const [addingSubdivisionTo, setAddingSubdivisionTo] = useState<string | null>(null); // projectId
  const [addingStreetTo, setAddingStreetTo] = useState<string | null>(null); // subdivisionId
  const [newSubdivisionName, setNewSubdivisionName] = useState('');
  const [newStreetName, setNewStreetName] = useState('');
  const [newAmenityName, setNewAmenityName] = useState('');
  const [addingAmenityTo, setAddingAmenityTo] = useState<string | null>(null); // projectId

  const toggleProjectTree = (id: string) => {
    setExpandedProjectTree(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSubdivisionTree = (id: string) => {
    setExpandedSubdivisionTree(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ThÃªm phÃ¢n khu vÃ o dá»± Ã¡n
  const handleAddSubdivision = (projectId: string) => {
    const name = newSubdivisionName.trim();
    if (!name) return;
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !onUpdateProject) return;
    const newSub = { id: `sub-${Date.now()}`, name, streets: [] };
    onUpdateProject({ ...proj, subdivisions: [...(proj.subdivisions || []), newSub] });
    setNewSubdivisionName('');
    setAddingSubdivisionTo(null);
    setExpandedProjectTree(prev => new Set(prev).add(projectId));
  };

  // ThÃªm dÃ£y phá»‘ vÃ o phÃ¢n khu
  const handleAddStreet = (projectId: string, subdivisionId: string) => {
    const name = newStreetName.trim();
    if (!name) return;
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !onUpdateProject) return;
    const updatedSubs = (proj.subdivisions || []).map((s: any) => {
      if (s.id === subdivisionId) {
        return { ...s, streets: [...(s.streets || []), name] };
      }
      return s;
    });
    onUpdateProject({ ...proj, subdivisions: updatedSubs });
    setNewStreetName('');
    setAddingStreetTo(null);
    setExpandedSubdivisionTree(prev => new Set(prev).add(subdivisionId));
  };

  // ThÃªm tiá»‡n Ã­ch vÃ o dá»± Ã¡n
  const handleAddAmenity = (projectId: string) => {
    const name = newAmenityName.trim();
    if (!name) return;
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !onUpdateProject) return;
    onUpdateProject({ ...proj, amenities: [...(proj.amenities || []), name] });
    setNewAmenityName('');
    setAddingAmenityTo(null);
  };

  // XÃ³a phÃ¢n khu
  const handleDeleteSubdivision = (projectId: string, subdivisionId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !onUpdateProject) return;
    onUpdateProject({ ...proj, subdivisions: (proj.subdivisions || []).filter((s: any) => s.id !== subdivisionId) });
  };

  // XÃ³a dÃ£y phá»‘
  const handleDeleteStreet = (projectId: string, subdivisionId: string, streetName: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !onUpdateProject) return;
    const updatedSubs = (proj.subdivisions || []).map((s: any) => {
      if (s.id === subdivisionId) {
        return { ...s, streets: (s.streets || []).filter((st: string) => st !== streetName) };
      }
      return s;
    });
    onUpdateProject({ ...proj, subdivisions: updatedSubs });
  };

  // XÃ³a tiá»‡n Ã­ch
  const handleDeleteAmenity = (projectId: string, amenityName: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !onUpdateProject) return;
    onUpdateProject({ ...proj, amenities: (proj.amenities || []).filter((a: string) => a !== amenityName) });
  };

  // User Add / Edit Modal States
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    upTinCredits: 0,
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
      if (!res.ok) throw new Error(data.error || 'Lá»—i khi táº¡o tÃ i khoáº£n');
      alert(data.message || 'ThÃªm thÃ nh viÃªn má»›i thÃ nh cÃ´ng!');
      setIsAddingUser(false);
      setUserFormData({ name: '', email: '', phone: '', role: '', upTinCredits: 0, balance: 0, password: '' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Lá»—i há»‡ thá»‘ng');
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
      if (!res.ok) throw new Error(data.error || 'Lá»—i khi cáº­p nháº­t tÃ i khoáº£n');
      alert(data.message || 'Cáº­p nháº­t tÃ i khoáº£n thÃ nh cÃ´ng!');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Lá»—i há»‡ thá»‘ng');
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
    return [];
  });

  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdImage, setNewAdImage] = useState('');
  const [newAdLink, setNewAdLink] = useState('');
  const [newAdPos, setNewAdPos] = useState<string>('float_right_pc');
  const [newAdWidthSize, setNewAdWidthSize] = useState<'small' | 'medium' | 'large' | 'compact'>('medium');
  const [newAdDisplayStyle, setNewAdDisplayStyle] = useState<'card_full' | 'image_only' | 'glowing_border' | 'minimal'>('glowing_border');
  const [newAdBadgeText, setNewAdBadgeText] = useState('QC Cáº NH PHáº¢I');
  const [newAdParentId, setNewAdParentId] = useState<string>('');
  const [expandedAds, setExpandedAds] = useState<Set<string>>(new Set());
  const [editingAd, setEditingAd] = useState<AdBanner | null>(null);

  // ===== HERO CARDS (4 tháº» danh má»¥c trang chá»§ - quáº£n lÃ½ áº£nh Ä‘áº¡i diá»‡n) =====
  const [heroCards, setHeroCards] = useState<HeroCardConfig[]>(() => loadHeroCards());
  const [heroCardSaved, setHeroCardSaved] = useState(false);

  const handleHeroCardImageUpload = async (cardId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('KÃ­ch thÆ°á»›c áº£nh tá»‘i Ä‘a lÃ  15MB');
      return;
    }
    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 900, 0.82);
      if (!compressedDataUrl) return;
      const url = isBase64DataUrl(compressedDataUrl)
        ? await uploadBase64DataUrl(compressedDataUrl, 'hero-cards')
        : compressedDataUrl;
      if (url) {
        setHeroCards(prev => prev.map(c => (c.id === cardId ? { ...c, image: url } : c)));
        setHeroCardSaved(false);
      }
    } catch (err) {
      console.error('Error uploading hero card image:', err);
    }
  };

  const handleHeroCardUrlChange = (cardId: string, url: string) => {
    setHeroCards(prev => prev.map(c => (c.id === cardId ? { ...c, image: url } : c)));
    setHeroCardSaved(false);
  };

  const handleHeroCardToggle = (cardId: string) => {
    setHeroCards(prev => prev.map(c => (c.id === cardId ? { ...c, active: !c.active } : c)));
    setHeroCardSaved(false);
  };

  const handleSaveHeroCards = () => {
    saveHeroCards(heroCards);
    setHeroCardSaved(true);
    setTimeout(() => setHeroCardSaved(false), 2500);
  };

  const handleResetHeroCards = () => {
    if (!confirm('KhÃ´i phá»¥c áº£nh máº·c Ä‘á»‹nh cho 4 tháº» danh má»¥c?')) return;
    setHeroCards(loadHeroCards());
    localStorage.removeItem('chocudan24h_hero_cards');
    setHeroCardSaved(true);
    setTimeout(() => setHeroCardSaved(false), 2500);
  };

  // Sync adsList to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('chocudan24h_ads', JSON.stringify(adsList));
    } catch (e) {
      console.warn('Failed to save ads to localStorage:', e);
    }
  }, [adsList]);

  // ===== áº¢nh 4 nhÃ³m ngÃ nh trÃªn trang chá»§ (Homepage Category Images) =====
  const [categoryImages, setCategoryImages] = useState<{ key: string; label: string; image: string; link: string }[]>([]);
  const [categoryImageBusy, setCategoryImageBusy] = useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/homepage-category-images')
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) setCategoryImages(data);
      })
      .catch(() => {});
  }, []);

  // Fetch FAQ / Q&A items
  React.useEffect(() => {
    fetch('/api/faq')
      .then(r => r.ok ? r.json() : { faq: [] })
      .then((data: any) => {
        if (Array.isArray(data.faq)) setAdminFaq(data.faq);
      })
      .catch(() => {});
  }, []);

  const handleCategoryImageUpload = async (key: string, file: File) => {
    if (!file) return;
    setCategoryImageBusy(key);
    try {
      // NÃ©n nháº¹ áº£nh trÆ°á»›c khi upload (giá»¯ dung lÆ°á»£ng nhá»)
      const compressed = await addWatermarkToImage(file, { skipWatermark: true, maxDim: 800 });
      // Upload lÃªn server láº¥y URL public /uploads/... thay vÃ¬ lÆ°u base64 thÃ´ vÃ o data store
      const url = await uploadBase64DataUrl(compressed, 'category-images');
      if (!url) {
        alert('âŒ Upload áº£nh tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i!');
        return;
      }
      const res = await fetch(`/api/homepage-category-images/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories)) setCategoryImages(data.categories);
        alert('âœ… ÄÃ£ cáº­p nháº­t áº£nh nhÃ³m ngÃ nh!');
      } else {
        alert('âŒ Lá»—i khi lÆ°u áº£nh. Vui lÃ²ng thá»­ láº¡i.');
      }
    } catch (e) {
      console.error('Upload category image failed:', e);
      alert('âŒ Lá»—i khi upload áº£nh.');
    } finally {
      setCategoryImageBusy(null);
    }
  };

  // Start editing banner: pre-fill top form directly
  const handleStartEditAd = (ad: AdBanner) => {
    setEditingAd(ad);
    setNewAdTitle(ad.title);
    setNewAdImage(ad.imageUrl);
    setNewAdLink(ad.linkUrl || ad.targetUrl || '');
    setNewAdPos(ad.position || 'float_right_pc');
    setNewAdWidthSize(ad.widthSize || 'medium');
    setNewAdDisplayStyle(ad.displayStyle || 'card_full');
    setNewAdBadgeText(ad.badgeText || 'QC Cáº NH PHáº¢I');
    setNewAdParentId(ad.parentId || '');
    
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
    setNewAdBadgeText('QC Cáº NH PHáº¢I');
    setNewAdParentId('');
  };

  const handleAdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetAdId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Dung lÆ°á»£ng áº£nh vÆ°á»£t quÃ¡ 8MB, vui lÃ²ng chá»n file nháº¹ hÆ¡n.');
        return;
      }
      // Upload áº£nh lÃªn server -> nháº­n URL public (thay vÃ¬ lÆ°u base64)
      try {
        const url = await uploadBase64DataUrl(await fileToDataUrl(file), 'ads');
        if (!url) {
          alert('Upload áº£nh banner tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i!');
          return;
        }
        if (targetAdId) {
          // Change image directly on table row
          const updated = adsList.map(a => a.id === targetAdId ? { ...a, imageUrl: url } : a);
          setAdsList(updated);
          if (editingAd && editingAd.id === targetAdId) {
            setEditingAd({ ...editingAd, imageUrl: url });
            setNewAdImage(url);
          }
          alert('Cáº­p nháº­t áº£nh Banner trá»±c tiáº¿p thÃ nh cÃ´ng!');
        } else {
          setNewAdImage(url);
        }
      } catch (err) {
        console.error('Lá»—i upload áº£nh banner:', err);
        alert('Lá»—i khi upload áº£nh banner. Vui lÃ²ng thá»­ láº¡i!');
      }
    }
  };

  // Helper: Ä‘á»c File -> base64 data URL (dÃ¹ng cho upload banner)
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSaveFormAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle || !newAdImage) {
      alert('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ tiÃªu Ä‘á» vÃ  hÃ¬nh áº£nh banner.');
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
        parentId: newAdParentId || undefined,
        active: isAct,
        isActive: isAct
      } : a);
      setAdsList(updated);
      handleCancelEditAd();
      alert('Cáº­p nháº­t Banner Quáº£ng CÃ¡o thÃ nh cÃ´ng!');
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
        parentId: newAdParentId || undefined,
        active: true,
        isActive: true,
        clickCount: 0,
        clicks: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAdsList([newBanner, ...adsList]);
      handleCancelEditAd();
      alert('ThÃªm Banner Quáº£ng CÃ¡o má»›i thÃ nh cÃ´ng!');
    }
  };

  const handleToggleAdActive = (id: string) => {
    const updated = adsList.map(a => a.id === id ? { ...a, active: !(a.active ?? a.isActive ?? true), isActive: !(a.active ?? a.isActive ?? true) } : a);
    setAdsList(updated);
  };

  const handleDeleteAd = (id: string) => {
    if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a Banner quáº£ng cÃ¡o nÃ y?')) {
      const updated = adsList.filter(a => a.id !== id);
      setAdsList(updated);
      if (editingAd && editingAd.id === id) {
        handleCancelEditAd();
      }
    }
  };

  // Quáº£ng cÃ¡o cha (khÃ´ng cÃ³ parentId) vÃ  con
  const parentAds = adsList.filter(a => !a.parentId);
  const childAds = (parentId: string) => adsList.filter(a => a.parentId === parentId);
  const toggleExpandAd = (adId: string) => {
    setExpandedAds(prev => {
      const next = new Set(prev);
      if (next.has(adId)) next.delete(adId);
      else next.add(adId);
      return next;
    });
  };

  // Property Statistics & Category Breakdown
  const saleProperties = properties.filter(p => p.type === 'sale' || (p as any).category === 'ban');
  const rentProperties = properties.filter(p => p.type === 'rent' || (p as any).category === 'cho-thue');
  
  // Sales team & Broker count
  const salesTeamList = registeredUsers.filter(u => u.role === 'sale' || u.role === 'manager' || u.role === 'broker' || u.role === 'admin');
  const totalSalesCount = salesTeamList.length;

  // Expiration Rules: 15-25 days live display (default 20 days), 1 month (30 days) seller/property data preservation
  const EXPIRY_DAYS = 20; 
  const ARCHIVE_PRESERVE_DAYS = 30;

  const getPropertyExpiryInfo = (p: Property) => {
    const baseDateStr = p.pushedAt || p.createdAt || '';
    const baseDate = new Date(baseDateStr);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = EXPIRY_DAYS - daysPassed;
    const isExpired = daysRemaining <= 0;
    const archiveDaysLeft = Math.max(0, (EXPIRY_DAYS + ARCHIVE_PRESERVE_DAYS) - daysPassed);

    // Format post date (DD/MM/YYYY)
    const postDateFormatted = !isNaN(baseDate.getTime()) 
      ? `${String(baseDate.getDate()).padStart(2, '0')}/${String(baseDate.getMonth() + 1).padStart(2, '0')}/${baseDate.getFullYear()}`
      : 'â€”';

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
      alert(`âš¡ ÄÃ£ Up Tin thÃ nh cÃ´ng cho cÄƒn "${property.title}"! ÄÃ£ gia háº¡n +20 ngÃ y hiá»ƒn thá»‹.`);
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
        ? `ðŸŸ¢ ÄÃ£ phá»¥c há»“i tin "${property.title}" ra danh sÃ¡ch hiá»ƒn thá»‹!`
        : `ðŸ“ ÄÃ£ chuyá»ƒn cÄƒn "${property.title}" vÃ o Kho LÆ°u Trá»¯ (váº«n báº£o lÆ°u 100% ThÃ´ng tin NgÆ°á»i Ä‘Äƒng & CÄƒn BÄS)!`
      );
    }
  };

  const handleRejectProperty = (property: Property) => {
    const reason = window.prompt(
      `Nháº­p lÃ½ do tá»« chá»‘i bÃ i Ä‘Äƒng "${property.title}":`,
      'HÃ¬nh áº£nh hoáº·c thÃ´ng tin bÃ i Ä‘Äƒng chÆ°a Ä‘áº¡t tiÃªu chuáº©n kiá»ƒm duyá»‡t.'
    );
    if (reason === null) return;

    const updated: Property = {
      ...property,
      approved: false,
      status: 'rejected',
      approvalStatus: 'rejected',
      rejectionReason: reason || 'HÃ¬nh áº£nh hoáº·c thÃ´ng tin bÃ i Ä‘Äƒng chÆ°a Ä‘áº¡t tiÃªu chuáº©n kiá»ƒm duyá»‡t.',
      adminNote: reason || 'HÃ¬nh áº£nh hoáº·c thÃ´ng tin bÃ i Ä‘Äƒng chÆ°a Ä‘áº¡t tiÃªu chuáº©n kiá»ƒm duyá»‡t.'
    };
    if (onUpdateProperty) {
      onUpdateProperty(updated);
      alert(`ðŸ”´ ÄÃ£ tá»« chá»‘i bÃ i Ä‘Äƒng "${property.title}". LÃ½ do Ä‘Ã£ Ä‘Æ°á»£c lÆ°u vÃ  gá»­i tá»›i ngÆ°á»i Ä‘Äƒng.`);
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
  const handleToggleServiceKyc = async (srv: ResidentServiceItem) => {
    const isCurrentlyVerified = srv.kycStatus === 'verified' || srv.verified;
    const newKycStatus = isCurrentlyVerified ? 'unverified' : 'verified';
    const newBadgeType = isCurrentlyVerified ? 'none' : 'blue_verified';

    try {
      const updated = { ...srv, verified: !isCurrentlyVerified, kycStatus: newKycStatus as any, kycBadgeType: newBadgeType as any };
      setAdminResidentServices(prev => prev.map(s => s.id === srv.id ? updated : s));
      await fetch(`/api/resident-services/${srv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      alert(isCurrentlyVerified ? `ÄÃ£ gá»¡ NÃºt Xanh KYC cá»§a dá»‹ch vá»¥ "${srv.title}"` : `ðŸŽ‰ ÄÃ£ cáº¥p NÃšT XANH VERIFIED KYC cho dá»‹ch vá»¥ "${srv.title}"!`);
    } catch (e) {
      console.error('Error toggling KYC:', e);
    }
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (!confirm(`Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a dá»‹ch vá»¥ "${title}"?`)) return;
    try {
      setAdminResidentServices(prev => prev.filter(s => s.id !== id));
      await fetch(`/api/resident-services/${id}`, { method: 'DELETE' });
      alert('ÄÃ£ xÃ³a dá»‹ch vá»¥ cÆ° dÃ¢n thÃ nh cÃ´ng!');
    } catch (e) {
      console.error('Error deleting service:', e);
    }
  };

  const handleEditServiceClick = (srv: ResidentServiceItem) => {
    setEditingService(srv);
    setNewSrvTitle(srv.title);
    setNewSrvCategory(srv.categoryId);
    setNewSrvSubCat(srv.subCategory || '');
    setNewSrvProject(srv.project || '');
    setNewSrvProviderName(srv.providerName || '');
    setNewSrvProviderPhone(srv.providerPhone || '');
    setNewSrvProviderZalo(srv.providerZalo || '');
    setNewSrvAddress(srv.address || '');
    setNewSrvPrice(srv.priceDisplay || '');
    setNewSrvImage(srv.images && srv.images.length > 0 ? srv.images[0] : '');
    setNewSrvDesc(srv.description || '');
    setShowAddServiceModal(true);
  };

  const handleSaveResidentServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvTitle || !newSrvProviderPhone) {
      alert('Vui lÃ²ng Ä‘iá»n TiÃªu Ä‘á» dá»‹ch vá»¥ vÃ  Sá»‘ Ä‘iá»‡n thoáº¡i liÃªn há»‡!');
      return;
    }

    const payload: Partial<ResidentServiceItem> = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      userId: 'user-admin',
      title: newSrvTitle,
      categoryId: newSrvCategory,
      subCategory: newSrvSubCat || '',
      project: newSrvProject as any,
      providerName: newSrvProviderName || '',
      providerPhone: newSrvProviderPhone,
      providerZalo: newSrvProviderZalo || newSrvProviderPhone,
      address: newSrvAddress || '',
      priceDisplay: newSrvPrice,
      rating: editingService ? editingService.rating : 0,
      reviewCount: editingService ? editingService.reviewCount : 0,
      images: [newSrvImage],
      description: newSrvDesc,
      verified: false,
      kycStatus: 'pending',
      kycBadgeType: 'none',
      legalCommitmentAccepted: false,
      createdAt: editingService ? editingService.createdAt : new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/resident-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(editingService ? 'ðŸŽ‰ ÄÃ£ cáº­p nháº­t Dá»‹ch Vá»¥ CÆ° DÃ¢n!' : 'ðŸŽ‰ ÄÃ£ thÃªm Dá»‹ch Vá»¥ CÆ° DÃ¢n má»›i thÃ nh cÃ´ng!');
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
    if (!confirm(`Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a gian hÃ ng cÆ° dÃ¢n "${storeName}"?`)) return;
    try {
      setAdminStores(prev => prev.filter(s => s.id !== id));
      if (selectedAdminStore?.id === id) setSelectedAdminStore(null);
      await fetch(`/api/stores/${id}`, { method: 'DELETE' });
      alert('ÄÃ£ xÃ³a gian hÃ ng thÃ nh cÃ´ng!');
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
      category: '',
      project: '',
      subdivision: '',
      address: '',
      description: '',
      logoUrl: '',
      bannerUrl: '',
      status: 'pending',
      verified: false
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
       category: store.category || '',
       project: (store.project as any) || '',
       subdivision: store.subdivision || '',
       address: store.address || '',
       description: store.description || '',
       logoUrl: store.logoUrl || '',
       bannerUrl: store.bannerUrl || '',
       status: store.status || 'pending',
       verified: Boolean(store.verified)
    });
    setShowStoreFormModal(true);
  };

  const handleSaveStoreFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeFormData.storeName.trim() || !storeFormData.ownerPhone.trim()) {
      alert('Vui lÃ²ng nháº­p TÃªn gian hÃ ng vÃ  Sá»‘ Ä‘iá»‡n thoáº¡i!');
      return;
    }

    const payload: UserStorefront = {
      id: editingStoreItem ? editingStoreItem.id : `store-${Date.now()}`,
      userId: editingStoreItem ? editingStoreItem.userId : `usr-${Date.now()}`,
      ownerName: storeFormData.ownerName || 'CÆ° dÃ¢n Vinhomes',
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
      description: storeFormData.description || 'Gian hÃ ng cÆ° dÃ¢n phá»¥c vá»¥ ná»™i khu chuáº©n cháº¥t lÆ°á»£ng.',
      verified: storeFormData.verified,
      status: storeFormData.status,
      rating: editingStoreItem?.rating || 0,
      reviewCount: editingStoreItem?.reviewCount || 0,
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
        alert('ðŸŽ‰ ÄÃ£ cáº­p nháº­t thÃ´ng tin gian hÃ ng thÃ nh cÃ´ng!');
      } else {
        setAdminStores(prev => [payload, ...prev]);
        await fetch('/api/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert('ðŸŽ‰ ÄÃ£ táº¡o gian hÃ ng cÆ° dÃ¢n má»›i thÃ nh cÃ´ng!');
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
      alert(nextStatus === 'approved' ? 'âœ“ ÄÃ£ duyá»‡t gian hÃ ng vÃ  hiá»ƒn thá»‹ cÃ´ng khai trÃªn website!' : 'â³ ÄÃ£ chuyá»ƒn gian hÃ ng vá» tráº¡ng thÃ¡i Chá» duyá»‡t / áº¨n.');
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
      code: '',
      category: '',
      price: 0,
      unit: '',
      stockQuantity: 0,
      images: [],
      description: '',
      status: 'pending',
      isAvailable: false
    });
    setShowStoreProductModal(true);
  };

  const handleOpenEditProduct = (prod: StoreProduct) => {
    setEditingStoreProduct(prod);
    setStoreProductForm({
      id: prod.id,
      name: prod.name,
      code: prod.code || '',
      category: prod.category || '',
      price: prod.price || 0,
      unit: prod.unit || '',
      stockQuantity: prod.stockQuantity || 0,
      images: prod.images && prod.images.length > 0 ? prod.images : [],
      description: prod.description || '',
      status: prod.status || 'pending',
      isAvailable: prod.isAvailable ?? false
    });
    setShowStoreProductModal(true);
  };

  const handleSaveStoreProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminStore) return;
    if (!storeProductForm.name.trim()) {
      alert('Vui lÃ²ng nháº­p tÃªn sáº£n pháº©m!');
      return;
    }

    const prodPayload: StoreProduct = {
      id: editingStoreProduct ? editingStoreProduct.id : `p-${Date.now()}`,
      storeId: selectedAdminStore.id,
      code: storeProductForm.code || `SKU-${Math.floor(Math.random() * 800) + 100}`,
      name: storeProductForm.name,
      category: storeProductForm.category,
      price: Number(storeProductForm.price) || 0,
      unit: storeProductForm.unit || 'suáº¥t',
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
      alert(editingStoreProduct ? 'ðŸŽ‰ ÄÃ£ cáº­p nháº­t sáº£n pháº©m thÃ nh cÃ´ng!' : 'ðŸŽ‰ ÄÃ£ thÃªm sáº£n pháº©m má»›i vÃ o gian hÃ ng!');
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
      alert(nextStatus === 'approved' ? 'âœ“ ÄÃ£ DUYá»†T sáº£n pháº©m! Sáº£n pháº©m hiá»‡n Ä‘Ã£ xuáº¥t hiá»‡n trÃªn website Chá»£ CÆ° DÃ¢n 24H.' : 'â³ ÄÃ£ chuyá»ƒn sáº£n pháº©m vá» tráº¡ng thÃ¡i CHá»œ DUYá»†T (áº¨n khá»i website cÃ´ng khai).');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStoreProduct = async (storeId: string, prodId: string) => {
    if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a sáº£n pháº©m nÃ y khá»i gian hÃ ng?')) return;
    if (!selectedAdminStore) return;

    const updatedProds = (selectedAdminStore.products || []).filter(p => p.id !== prodId);
    const updatedStore = { ...selectedAdminStore, products: updatedProds };
    setSelectedAdminStore(updatedStore);
    setAdminStores(prev => prev.map(s => s.id === storeId ? updatedStore : s));

    try {
      await fetch(`/api/stores/${storeId}/products/${prodId}`, { method: 'DELETE' });
      alert('ÄÃ£ xÃ³a sáº£n pháº©m thÃ nh cÃ´ng!');
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
        alert('ðŸŽ‰ ÄÃƒ PHÃŠ DUYá»†T! Dá»‹ch vá»¥ cÆ° dÃ¢n hiá»‡n Ä‘Ã£ xuáº¥t hiá»‡n cÃ´ng khai trÃªn Website.');
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
        alert(nextStatus === 'approved' ? 'âœ“ ÄÃƒ DUYá»†T! Dá»‹ch vá»¥ Ä‘Ã£ hiá»ƒn thá»‹ lÃªn Website.' : 'â³ ÄÃ£ chuyá»ƒn dá»‹ch vá»¥ vá» tráº¡ng thÃ¡i Chá» Duyá»‡t (Chá»‰ cÆ° dÃ¢n tháº¥y).');
        fetchResidentServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteResidentService = async (serviceId: string) => {
    if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a bÃ i dá»‹ch vá»¥ cÆ° dÃ¢n nÃ y khá»i há»‡ thá»‘ng?')) return;
    try {
      setAdminResidentServices(prev => prev.filter(s => s.id !== serviceId));
      await fetch(`/api/resident-services/${serviceId}`, { method: 'DELETE' });
      alert('ÄÃ£ xÃ³a dá»‹ch vá»¥ thÃ nh cÃ´ng!');
      fetchResidentServices();
    } catch (e) {
      console.error(e);
    }
  };

  // GLOBAL SYSTEM SYNC BUTTON
  const handleSyncAllToWebsite = () => {
    fetchResidentServices();
    fetchStores();
    alert('âš¡ Há»† THá»NG ÄÃƒ Äá»’NG Bá»˜ THÃ€NH CÃ”NG!\nTáº¥t cáº£ dá»¯ liá»‡u Gian HÃ ng, Dá»‹ch Vá»¥ CÆ° DÃ¢n, Sáº£n Pháº©m Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t trá»±c tiáº¿p lÃªn há»‡ thá»‘ng website chocudan24h.com');
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
      alert('ðŸŽ‰ ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng chá»£ cÆ° dÃ¢n!');
    } catch (e) {
      console.error('Error updating order status:', e);
    }
  };

  return (
    <div className="max-w-[1550px] mx-auto px-3 sm:px-5 lg:px-6 py-4 space-y-4">
      
      {/* 0. QUICK SHORTCUTS NAVIGATION BAR - Äiá»u hÆ°á»›ng nhanh trá»±c tiáº¿p bÃªn trong Admin */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-sm flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5 flex-wrap font-bold text-slate-700 dark:text-slate-300">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-extrabold hidden md:inline">
            ÄIá»€U HÆ¯á»šNG NHANH PHÃ‚N Há»†:
          </span>
          
          <button
            type="button"
            onClick={() => {
              handleSelectMainTab('bds');
              setActiveTab('properties');
              setPropertySubFilter('all');
            }}
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold transition cursor-pointer active:scale-95 shadow-2xs ${
              effectiveMainTab === 'bds' && activeTab === 'properties' && propertySubFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            title="Quáº£n lÃ½ toÃ n bá»™ Báº¥t Äá»™ng Sáº£n"
          >
            <Home className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tá»•ng Quan BÄS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSelectMainTab('bds');
              setActiveTab('properties');
              setPropertySubFilter('sale');
            }}
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold transition cursor-pointer active:scale-95 shadow-2xs ${
              effectiveMainTab === 'bds' && activeTab === 'properties' && propertySubFilter === 'sale'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            title="Lá»c danh sÃ¡ch BÄS Mua BÃ¡n"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>BÄS Mua BÃ¡n</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSelectMainTab('bds');
              setActiveTab('properties');
              setPropertySubFilter('rent');
            }}
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold transition cursor-pointer active:scale-95 shadow-2xs ${
              effectiveMainTab === 'bds' && activeTab === 'properties' && propertySubFilter === 'rent'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            title="Lá»c danh sÃ¡ch BÄS Cho ThuÃª"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Cho ThuÃª</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSelectMainTab('technicians');
              setActiveTab('resident_services_mgmt');
            }}
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold transition cursor-pointer active:scale-95 shadow-2xs ${
              effectiveMainTab === 'technicians'
                ? 'bg-orange-500 text-slate-950 font-black shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            title="Quáº£n lÃ½ Thá»£ Dá»‹ch Vá»¥ CÆ° DÃ¢n"
          >
            <Wrench className="w-3.5 h-3.5 text-orange-500" />
            <span>Dá»‹ch Vá»¥ &amp; Thá»£</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSelectMainTab('recruitment');
              setActiveTab('recruitment_mgmt');
            }}
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold transition cursor-pointer active:scale-95 shadow-2xs ${
              effectiveMainTab === 'recruitment'
                ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            title="Quáº£n lÃ½ Viá»‡c LÃ m & Tuyá»ƒn Dá»¥ng"
          >
            <Briefcase className="w-3.5 h-3.5 text-purple-500" />
            <span>Tuyá»ƒn Dá»¥ng &amp; CV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSelectMainTab('resident_market');
              setActiveTab('stores_mgmt');
            }}
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold transition cursor-pointer active:scale-95 shadow-2xs ${
              effectiveMainTab === 'resident_market'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            title="Quáº£n lÃ½ Chá»£ CÆ° DÃ¢n & Gian HÃ ng"
          >
            <Store className="w-3.5 h-3.5 text-amber-500" />
            <span>Chá»£ CÆ° DÃ¢n</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSelectMainTab('users_leads');
              setActiveTab('users');
            }}
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold transition cursor-pointer active:scale-95 shadow-2xs ${
              effectiveMainTab === 'users_leads'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
            title="Quáº£n lÃ½ ThÃ nh ViÃªn & KhÃ¡ch HÃ ng"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>ThÃ nh ViÃªn</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center gap-1 transition cursor-pointer active:scale-95 border border-slate-200 dark:border-slate-700"
            title="Má»Ÿ xem website cÃ´ng khai ngoÃ i trang chá»§"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Xem Web NgoÃ i</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/tai-khoan')}
            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer active:scale-95 border border-emerald-300 dark:border-emerald-700"
            title="Xem Trang CÃ¡ NhÃ¢n cá»§a báº¡n"
          >
            <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Dashboard CÃ¡ NhÃ¢n</span>
          </button>

          {/* NÃšT ÄÄ‚NG XUáº¤T ADMIN */}
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
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
            title="ÄÄƒng xuáº¥t khá»i quyá»n Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ÄÄƒng Xuáº¥t</span>
          </button>
        </div>
      </div>

      {/* 1. TOP HEADER - Tinh gá»n, hiá»‡n Ä‘áº¡i, khÃ´ng chiáº¿m diá»‡n tÃ­ch */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">ADMIN Tá»”NG</span>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Há»‡ Thá»‘ng Äang Hoáº¡t Äá»™ng Realtime
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight mt-0.5">
              TRUNG TÃ‚M QUáº¢N TRá»Š Há»† THá»NG CHá»¢ CÆ¯ DÃ‚N 24H
            </h1>
          </div>
        </div>

        {/* Toolbar NÃºt Thao TÃ¡c Nhanh */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleSyncToPublicWeb}
            disabled={isSyncingPublic}
            className={`px-3.5 py-2 font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow cursor-pointer ${
              pendingProperties.length > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="PhÃª duyá»‡t tin & Xuáº¥t báº£n trá»±c tiáº¿p lÃªn Website cÃ´ng khai"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPublic ? 'animate-spin' : ''}`} />
            <span>{isSyncingPublic ? 'Äang Ä‘á»“ng bá»™...' : `ðŸ”„ Äá»“ng Bá»™ Web ${pendingProperties.length > 0 ? `(${pendingProperties.length} Chá» Duyá»‡t)` : 'Public'}`}</span>
          </button>

          <button
            onClick={() => setShowTaxModal(true)}
            className="px-3 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Khai bÃ¡o thuáº¿ TMÄT Quá»‘c Gia"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-300" />
            <span className="hidden sm:inline">Thuáº¿ TMÄT</span>
          </button>

          <button
            onClick={() => setShowAiUrlTracker(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Theo dÃµi Website & Google AI Index"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Theo DÃµi AI</span>
          </button>

          <button
            onClick={handleSeed1000Click}
            disabled={isSeeding}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Táº¡o nhanh 1,000 tin máº«u kiá»ƒm thá»­"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{isSeeding ? 'Äang táº¡o...' : 'Test 1K Tin'}</span>
          </button>

          <button
            onClick={onOpenAiWriter}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Viáº¿t bÃ i tá»± Ä‘á»™ng báº±ng AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Writer</span>
          </button>

          <button
            onClick={onRefreshData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer border border-slate-700"
            title="LÃ m má»›i dá»¯ liá»‡u"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. LIVE METRICS - THá»NG KÃŠ NHANH (Sá»• ra / Thu gá»n Ä‘á»ƒ tiáº¿t kiá»‡m tá»‘i Ä‘a khÃ´ng gian) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-xs transition">
        <div className="flex items-center justify-between gap-2">
          {/* Quick summary inline text/chips */}
          <button
            type="button"
            onClick={() => setShowMetricsDropdown(!showMetricsDropdown)}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-left cursor-pointer py-0.5"
            title="Báº¥m Ä‘á»ƒ má»Ÿ rá»™ng / thu gá»n tháº» thá»‘ng kÃª chi tiáº¿t"
          >
            <span className="p-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-bold text-xs shrink-0 flex items-center gap-1">
              ðŸ“Š <span className="font-extrabold hidden xs:inline">Chá»‰ sá»‘:</span>
            </span>
            
            <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 whitespace-nowrap">
                ðŸ  {saleProperties.length} BÃ¡n
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 whitespace-nowrap">
                ðŸ”‘ {rentProperties.length} ThuÃª
              </span>
              <span className={`px-2 py-0.5 rounded-lg border whitespace-nowrap ${
                pendingProperties.length > 0
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                â³ {pendingProperties.length} Duyá»‡t
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 whitespace-nowrap">
                ðŸ› ï¸ {adminResidentServices.length} Thá»£
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 whitespace-nowrap">
                ðŸª {adminStores.length} Shop
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 whitespace-nowrap">
                ðŸ’¼ {contacts.length} Viá»‡c
              </span>
            </div>
          </button>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMetricsDropdown(!showMetricsDropdown)}
            className="py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 transition"
          >
            <span>{showMetricsDropdown ? 'Thu gá»n â–²' : 'Chi tiáº¿t â–¼'}</span>
          </button>
        </div>

        {/* Collapsible Expanded Metrics Cards */}
        {showMetricsDropdown && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs pt-2.5 mt-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
            {/* BÄS BÃ¡n */}
            <button
              onClick={() => {
                handleSelectMainTab('bds');
                setActiveTab('properties');
                setPropertySubFilter('sale');
              }}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-150 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
                effectiveMainTab === 'bds' && activeTab === 'properties' && propertySubFilter === 'sale'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1 bg-emerald-500/10 text-emerald-500 rounded-md font-bold text-sm">ðŸ </span>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">BÄS BÃ¡n</span>
              </div>
              <span className="font-mono font-black text-slate-900 dark:text-emerald-400 text-sm">{saleProperties.length}</span>
            </button>

            {/* Cho ThuÃª */}
            <button
              onClick={() => {
                handleSelectMainTab('bds');
                setActiveTab('properties');
                setPropertySubFilter('rent');
              }}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-150 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
                effectiveMainTab === 'bds' && activeTab === 'properties' && propertySubFilter === 'rent'
                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-teal-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="p-1 bg-teal-500/10 text-teal-500 rounded-md font-bold text-sm">ðŸ”‘</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">Cho ThuÃª</span>
              </div>
              <span className="font-mono font-black text-slate-900 dark:text-teal-400 text-sm">{rentProperties.length}</span>
            </button>

            {/* Chá» Duyá»‡t */}
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
                <span className="p-1 bg-amber-500/10 text-amber-500 rounded-md font-bold text-sm">â³</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">Chá» Duyá»‡t</span>
              </div>
              <span className={`font-mono font-black text-sm ${pendingProperties.length > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
                {pendingProperties.length}
              </span>
            </button>

            {/* Thá»£ Dá»‹ch Vá»¥ */}
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
                <span className="p-1 bg-orange-500/10 text-orange-500 rounded-md font-bold text-sm">ðŸ› ï¸</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">Thá»£ Dá»‹ch Vá»¥</span>
              </div>
              <span className="font-mono font-black text-slate-900 dark:text-orange-400 text-sm">{adminResidentServices.length}</span>
            </button>

            {/* Gian HÃ ng */}
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
                <span className="p-1 bg-purple-500/10 text-purple-500 rounded-md font-bold text-sm">ðŸª</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">Gian HÃ ng</span>
              </div>
              <span className="font-mono font-black text-slate-900 dark:text-purple-400 text-sm">{adminStores.length}</span>
            </button>

            {/* KhÃ¡ch & Viá»‡c */}
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
                <span className="p-1 bg-blue-500/10 text-blue-500 rounded-md font-bold text-sm">ðŸ’¼</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">KhÃ¡ch & Viá»‡c</span>
              </div>
              <span className="font-mono font-black text-slate-900 dark:text-blue-400 text-sm">{contacts.length}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MAIN ADMIN WORKSPACE: 2-COLUMN WITH PERSISTENT LEFT SIDEBAR + MAIN WORKSPACE */}
      <div className="flex flex-col lg:flex-row items-start gap-4">
        
        {/* === Cá»˜T TAB QUáº¢N TRá»Š BÃŠN TRÃI (PERSISTENT LEFT SIDEBAR FOR DESKTOP) === */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-3 bg-slate-900 text-white border border-slate-800 rounded-2xl p-3 shadow-xl space-y-3 lg:max-h-[calc(100vh-1.5rem)] lg:overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/80 pb-2">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              MENU QUáº¢N TRá»Š (7)
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
              v3.8
            </span>
          </div>

          <nav className="space-y-1 text-xs" aria-label="Admin Navigation">
            {/* 1. Báº¥t Äá»™ng Sáº£n */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  handleSelectMainTab('bds');
                  setActiveTab('properties');
                }}
                className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition cursor-pointer ${
                  effectiveMainTab === 'bds'
                    ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className={`w-4 h-4 ${effectiveMainTab === 'bds' ? 'text-white' : 'text-emerald-400'}`} />
                  <span className="text-[12px] font-extrabold">1. Báº¥t Äá»™ng Sáº£n</span>
                </div>
                <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-mono font-bold">
                  {properties.length}
                </span>
              </button>

              {/* Sub-items if BDS active */}
              {effectiveMainTab === 'bds' && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-emerald-500/40 ml-3.5 animate-in fade-in duration-150">
                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('all'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'properties' && propertySubFilter === 'all'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ Táº¥t Cáº£ BÄS</span>
                    <span className="font-mono text-[10px]">{properties.length}</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('sale'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'properties' && propertySubFilter === 'sale'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ Mua BÃ¡n</span>
                    <span className="font-mono text-[10px]">{saleProperties.length}</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('rent'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'properties' && propertySubFilter === 'rent'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ Cho ThuÃª</span>
                    <span className="font-mono text-[10px]">{rentProperties.length}</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('properties'); setPropertySubFilter('pending'); }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'properties' && propertySubFilter === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ Chá» Duyá»‡t</span>
                    <span className="font-mono text-[10px] text-amber-400 font-bold">{pendingProperties.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'projects'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ Dá»± Ãn & Máº·t Báº±ng</span>
                    <span className="font-mono text-[10px]">{projects.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('news')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'news'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ Tin Tá»©c & BÃ i Viáº¿t</span>
                    <span className="font-mono text-[10px]">{news.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('faq')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'faq'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ Q&A / FAQ</span>
                    <span className="font-mono text-[10px]">{adminFaq.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition ${
                      activeTab === 'pricing'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    â€¢ Báº£ng GiÃ¡ Dá»‹ch Vá»¥
                  </button>
                  <button
                    onClick={() => setActiveTab('affiliate_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition ${
                      activeTab === 'affiliate_mgmt'
                        ? 'bg-emerald-500/20 text-emerald-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    â€¢ Äá»‘i TÃ¡c & Hoa Há»“ng
                  </button>
                </div>
              )}
            </div>

            {/* 2. Thá»£ Dá»‹ch Vá»¥ & Ká»¹ Thuáº­t */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  handleSelectMainTab('technicians');
                  setActiveTab('resident_services_mgmt');
                }}
                className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition cursor-pointer ${
                  effectiveMainTab === 'technicians'
                    ? 'bg-orange-500 text-slate-950 font-black shadow-md ring-1 ring-orange-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className={`w-4 h-4 ${effectiveMainTab === 'technicians' ? 'text-slate-950' : 'text-orange-400'}`} />
                  <span className="text-[12px] font-extrabold">2. Thá»£ & Dá»‹ch Vá»¥</span>
                </div>
                <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-mono font-bold">
                  {adminResidentServices.length}
                </span>
              </button>
            </div>

            {/* 3. Tuyá»ƒn Dá»¥ng & Viá»‡c LÃ m */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  handleSelectMainTab('recruitment');
                  setActiveTab('recruitment_mgmt');
                }}
                className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition cursor-pointer ${
                  effectiveMainTab === 'recruitment'
                    ? 'bg-teal-500 text-slate-950 font-black shadow-md ring-1 ring-teal-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className={`w-4 h-4 ${effectiveMainTab === 'recruitment' ? 'text-slate-950' : 'text-teal-400'}`} />
                  <span className="text-[12px] font-extrabold">3. Tuyá»ƒn Dá»¥ng & CV</span>
                </div>
                <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-bold">
                  Viá»‡c lÃ m
                </span>
              </button>
            </div>

            {/* 4. Chá»£ CÆ° DÃ¢n */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  handleSelectMainTab('resident_market');
                  setActiveTab('stores_mgmt');
                }}
                className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition cursor-pointer ${
                  effectiveMainTab === 'resident_market'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-1 ring-amber-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Store className={`w-4 h-4 ${effectiveMainTab === 'resident_market' ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span className="text-[12px] font-extrabold">4. Chá»£ CÆ° DÃ¢n</span>
                </div>
                <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px] font-mono font-bold">
                  {adminStores.length}
                </span>
              </button>

              {effectiveMainTab === 'resident_market' && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-amber-500/40 ml-3.5 animate-in fade-in duration-150">
                  <button
                    onClick={() => setActiveTab('stores_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'stores_mgmt'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ Gian HÃ ng & Shop</span>
                    <span className="font-mono text-[10px]">{adminStores.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'orders_mgmt'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ Quáº£n LÃ½ ÄÆ¡n HÃ ng</span>
                    <span className="font-mono text-[10px]">{adminStoreOrders.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('package_orders_mgmt')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'package_orders_mgmt'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ GÃ³i Tiá»‡n Ãch CÆ° DÃ¢n</span>
                    <span className="font-mono text-[10px]">{adminPackageOrders.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('resident_finance')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition ${
                      activeTab === 'resident_finance'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    â€¢ Doanh Thu & Quyáº¿t ToÃ¡n
                  </button>
                  <button
                    onClick={() => setActiveTab('partners_reputation')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'partners_reputation'
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ ÄÃ¡nh GiÃ¡ Uy TÃ­n</span>
                    <span className="font-mono text-[10px]">{adminReputationPosts.length}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. ThÃ nh ViÃªn & KhÃ¡ch HÃ ng */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  handleSelectMainTab('users_leads');
                  setActiveTab('users');
                }}
                className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition cursor-pointer ${
                  effectiveMainTab === 'users_leads'
                    ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className={`w-4 h-4 ${effectiveMainTab === 'users_leads' ? 'text-white' : 'text-blue-400'}`} />
                  <span className="text-[12px] font-extrabold">5. ThÃ nh ViÃªn & KhÃ¡ch</span>
                </div>
                <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-mono font-bold">
                  {registeredUsers.length}
                </span>
              </button>

              {effectiveMainTab === 'users_leads' && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-blue-500/40 ml-3.5 animate-in fade-in duration-150">
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'users'
                        ? 'bg-blue-500/20 text-blue-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ Danh SÃ¡ch ThÃ nh ViÃªn</span>
                    <span className="font-mono text-[10px]">{registeredUsers.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-between ${
                      activeTab === 'leads'
                        ? 'bg-blue-500/20 text-blue-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span>â€¢ KhÃ¡ch Háº¹n Xem NhÃ </span>
                    <span className="font-mono text-[10px]">{contacts.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('enterprise_core')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition ${
                      activeTab === 'enterprise_core'
                        ? 'bg-blue-500/20 text-blue-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    â€¢ PhÃ¢n Quyá»n & Quáº£n Trá»‹
                  </button>
                </div>
              )}
            </div>

            {/* 6. Banner & Quáº£ng CÃ¡o */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  handleSelectMainTab('ads');
                  setActiveTab('ads');
                }}
                className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition cursor-pointer ${
                  effectiveMainTab === 'ads'
                    ? 'bg-rose-600 text-white shadow-md ring-1 ring-rose-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${effectiveMainTab === 'ads' ? 'text-white' : 'text-rose-400'}`} />
                  <span className="text-[12px] font-extrabold">6. Quáº£ng CÃ¡o Banner</span>
                </div>
                <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-mono font-bold">
                  {adsList.length}
                </span>
              </button>
            </div>

            {/* 7. CÃ´ng Cá»¥ & Há»‡ Thá»‘ng */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  handleSelectMainTab('tools');
                  setActiveTab('analytics');
                }}
                className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition cursor-pointer ${
                  effectiveMainTab === 'tools'
                    ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className={`w-4 h-4 ${effectiveMainTab === 'tools' ? 'text-white' : 'text-indigo-400'}`} />
                  <span className="text-[12px] font-extrabold">7. CÃ´ng Cá»¥ &amp; Bot</span>
                </div>
                <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] font-bold">
                  SEO
                </span>
              </button>

              {effectiveMainTab === 'tools' && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-indigo-500/40 ml-3.5 animate-in fade-in duration-150">
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition ${
                      activeTab === 'analytics'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    â€¢ Thá»‘ng KÃª Truy Cáº­p
                  </button>
                  <button
                    onClick={() => setActiveTab('seo')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition ${
                      activeTab === 'seo'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    â€¢ Tá»‘i Æ¯u SEO
                  </button>
                  <button
                    onClick={() => setActiveTab('marketing')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition ${
                      activeTab === 'marketing'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    â€¢ Truyá»n ThÃ´ng & Social
                  </button>
                  <button
                    onClick={() => setActiveTab('zalo')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition ${
                      activeTab === 'zalo'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    â€¢ Cá»™ng Äá»“ng Zalo
                  </button>
                  <button
                    onClick={() => setActiveTab('workspace_sync')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition ${
                      activeTab === 'workspace_sync'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    â€¢ Google Workspace
                  </button>
                  <button
                    onClick={() => setActiveTab('n8n')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] transition ${
                      activeTab === 'n8n'
                        ? 'bg-indigo-500/20 text-indigo-300 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    â€¢ Tá»± Äá»™ng HÃ³a n8n
                  </button>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* === Cá»˜T Ná»˜I DUNG CHÃNH (MAIN WORKSPACE AREA) === */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          
          {/* Thanh chuyá»ƒn Ä‘á»•i nhanh trÃªn Mobile / Tablet (< lg) */}
          <div className="lg:hidden bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center justify-between gap-2">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {effectiveMainTab === 'bds' && '1. Báº¥t Äá»™ng Sáº£n'}
              {effectiveMainTab === 'technicians' && '2. Thá»£ & Dá»‹ch Vá»¥'}
              {effectiveMainTab === 'recruitment' && '3. Tuyá»ƒn Dá»¥ng'}
              {effectiveMainTab === 'resident_market' && '4. Chá»£ CÆ° DÃ¢n'}
              {effectiveMainTab === 'users_leads' && '5. ThÃ nh ViÃªn'}
              {effectiveMainTab === 'ads' && '6. Banner QC'}
              {effectiveMainTab === 'tools' && '7. CÃ´ng Cá»¥'}
            </span>
            <button
              type="button"
              onClick={() => setIsSubNavDropdownOpen(!isSubNavDropdownOpen)}
              className="py-1 px-2.5 bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg cursor-pointer"
            >
              {isSubNavDropdownOpen ? 'ÄÃ³ng Menu â–²' : 'Chá»n PhÃ¢n Há»‡ â–¼'}
            </button>
          </div>

          {isSubNavDropdownOpen && (
            <div className="lg:hidden bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-xl grid grid-cols-2 gap-1.5 text-xs animate-in fade-in duration-150">
              <button
                onClick={() => { handleSelectMainTab('bds'); setActiveTab('properties'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-emerald-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4" /> 1. BÄS ({properties.length})
              </button>
              <button
                onClick={() => { handleSelectMainTab('technicians'); setActiveTab('resident_services_mgmt'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-orange-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4" /> 2. Thá»£ ({adminResidentServices.length})
              </button>
              <button
                onClick={() => { handleSelectMainTab('recruitment'); setActiveTab('recruitment_mgmt'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-teal-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Briefcase className="w-4 h-4" /> 3. Tuyá»ƒn Dá»¥ng
              </button>
              <button
                onClick={() => { handleSelectMainTab('resident_market'); setActiveTab('stores_mgmt'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Store className="w-4 h-4" /> 4. Chá»£ ({adminStores.length})
              </button>
              <button
                onClick={() => { handleSelectMainTab('users_leads'); setActiveTab('users'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-blue-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" /> 5. ThÃ nh ViÃªn
              </button>
              <button
                onClick={() => { handleSelectMainTab('ads'); setActiveTab('ads'); setIsSubNavDropdownOpen(false); }}
                className="p-2 bg-slate-900 text-rose-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> 6. Quáº£ng CÃ¡o
              </button>
              <button
                onClick={() => { handleSelectMainTab('tools'); setActiveTab('analytics'); setIsSubNavDropdownOpen(false); }}
                className="col-span-2 p-2 bg-slate-900 text-indigo-400 font-bold rounded-xl text-left flex items-center gap-1.5"
              >
                <Settings className="w-4 h-4" /> 7. CÃ´ng Cá»¥ & Bot Há»‡ Thá»‘ng
              </button>
            </div>
          )}

      {/* ==================== TAB THá»¢ Dá»ŠCH Vá»¤ & Ká»¸ THUáº¬T CÆ¯ DÃ‚N ==================== */}
      {activeTab === 'resident_services_mgmt' && (
        <div className="space-y-4">
          {/* Header Banner - Compact & focused on Technicians */}
          <div className="bg-gradient-to-r from-slate-900 via-orange-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-orange-500/40 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-orange-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">
                  THá»¢ Dá»ŠCH Vá»¤ & Ká»¸ THUáº¬T CÆ¯ DÃ‚N
                </span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-[10px] rounded flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-blue-400" /> NÃšT XANH VERIFIED KYC
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-orange-400 mt-1 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-400" />
                <span>QUáº¢N LÃ THá»¢ Ká»¸ THUáº¬T, Sá»¬A CHá»®A ÄIá»†N NÆ¯á»šC & Dá»ŠCH Vá»¤ CÆ¯ DÃ‚N</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Quáº£n lÃ½ Ä‘á»™i ngÅ© Thá»£ Äiá»‡n NÆ°á»›c, Äiá»‡n Láº¡nh, Thá»£ KhÃ³a, Cá»­a Cuá»‘n, NhÃ´m KÃ­nh, Dá»n Vá»‡ Sinh & Taxi CÆ° DÃ¢n. Cáº¥p NÃºt Xanh KYC Ä‘á»ƒ Ä‘á»‹nh danh uy tÃ­n.
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
              <span>âž• ThÃªm Thá»£ / Dá»‹ch Vá»¥ Má»›i</span>
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
                  placeholder="TÃ¬m theo tÃªn dá»‹ch vá»¥, sá»‘ Ä‘iá»‡n thoáº¡i, tÃªn nhÃ  cung cáº¥p..."
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
                  <option value="all">Táº¥t cáº£ KYC</option>
                  <option value="verified">ðŸ”µ ÄÃ£ Cáº¥p NÃºt Xanh KYC</option>
                  <option value="unverified">âšª ChÆ°a Cáº¥p NÃºt Xanh</option>
                </select>

                <select
                  value={resServiceExpiryFilter}
                  onChange={(e) => setResServiceExpiryFilter(e.target.value as any)}
                  className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="all">Táº¥t cáº£ thá»i háº¡n</option>
                  <option value="active">ðŸŸ¢ Äang hiá»ƒn thá»‹</option>
                  <option value="expiring">â° Sáº¯p háº¿t háº¡n (â‰¤ 5 ngÃ y)</option>
                  <option value="expired">ðŸ›‘ ÄÃ£ áº©n tá»± Ä‘á»™ng (&gt; 30 ngÃ y)</option>
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
                Táº¥t Cáº£ ({adminResidentServices.length})
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
                        {srv.images && srv.images.length > 0 ? (
                          <img loading="lazy"
                          src={srv.images[0]}
                          alt={srv.title}
                          className="w-full h-full object-cover"
                        />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">ChÆ°a cÃ³ áº£nh</div>
                        )}
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
                              <span>ChÆ°a KYC</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Expiry info */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          {expiry.isExpired ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-400">
                              ðŸ›‘ ÄÃ£ áº©n sau 30 ngÃ y
                            </span>
                          ) : expiry.statusBadge === 'expiring_soon' ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-400 animate-pulse">
                              â° Sáº¯p háº¿t háº¡n (CÃ²n {expiry.daysRemaining} ngÃ y)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400">
                              ðŸŸ¢ Hiá»ƒn thá»‹: CÃ²n {expiry.daysRemaining} ngÃ y
                            </span>
                          )}
                        </div>

                        <h3 className="font-black text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
                          {srv.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                            {srv.priceDisplay || 'â€”'}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{srv.rating || 0} ({srv.reviewCount || 0})</span>
                          </div>
                        </div>
                      </div>

                      {/* Provider Contact Info */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-500 dark:text-slate-400">NhÃ  cung cáº¥p:</span>
                          <span className="text-slate-900 dark:text-white font-black">{srv.providerName || 'CÆ° DÃ¢n Vinhomes'}</span>
                        </div>
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-500 dark:text-slate-400">Sá»‘ Äiá»‡n Thoáº¡i:</span>
                          <a href={`tel:${srv.providerPhone}`} className="text-emerald-600 dark:text-emerald-400 font-black hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{srv.providerPhone}</span>
                          </a>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span>ÄÄƒng: {expiry.postDateFormatted}</span>
                          <span>Háº¿t háº¡n: {expiry.expiresAtFormatted}</span>
                        </div>
                        {srv.providerZalo && (
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-500 dark:text-slate-400">Zalo ChÃ­nh Chá»§:</span>
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
                          onClick={() => handleToggleServiceKyc(srv)}
                          className={`py-2.5 rounded-xl font-black text-[11px] transition flex items-center justify-center gap-1 shadow-md cursor-pointer ${
                            isVerified
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-500 hover:text-white'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110'
                          }`}
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>{isVerified ? 'Gá»¡ KYC' : 'Cáº¥p KYC'}</span>
                        </button>

                        <button
                          onClick={() => handleRenewResidentService(srv.id, srv.title)}
                          className="py-2.5 rounded-xl font-black text-[11px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition flex items-center justify-center gap-1 shadow-md cursor-pointer"
                          title="Gia háº¡n thÃªm 30 ngÃ y hiá»ƒn thá»‹"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Gia Háº¡n +30 NgÃ y</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleEditServiceClick(srv)}
                          className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Chá»‰nh Sá»­a</span>
                        </button>

                        <button
                          onClick={() => handleDeleteService(srv.id, srv.title)}
                          className="py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>XÃ³a Bá»</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* KYC Manager â€” Admin duyá»‡t/cáº¥p/thu há»“i NÃºt Xanh Äá»‹nh Danh */}
          <AdminKycManager
            services={adminResidentServices}
            onUpdateServiceKyc={async (serviceId, updates) => {
              setAdminResidentServices(prev => prev.map(s => s.id === serviceId ? { ...s, ...updates } : s));
              const target = adminResidentServices.find(s => s.id === serviceId);
              if (target) {
                try {
                  await fetch(`/api/resident-services/${serviceId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...target, ...updates })
                  });
                } catch (e) {
                  console.error('Error saving KYC update:', e);
                }
              }
            }}
            onRefreshData={fetchResidentServices}
          />
        </div>
      )}

      {/* ==================== Máº¢NG 2: TAB TUYá»‚N Dá»¤NG & VIá»†C LÃ€M CÆ¯ DÃ‚N ==================== */}
      {activeTab === 'recruitment_mgmt' && (
        <AdminRecruitmentManager onRefresh={onRefreshData} />
      )}

      {/* ==================== Máº¢NG 2: TAB 2 - GIAN HÃ€NG & Dá»ŠCH Vá»¤ CÆ¯ DÃ‚N ==================== */}
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
                    QUáº¢N LÃ GIAN HÃ€NG & Dá»ŠCH Vá»¤ CÆ¯ DÃ‚N
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] rounded-full">
                    â— Bá»˜ Lá»ŒC DUYá»†T ÄÄ‚NG WEBSITE 24H
                  </span>
                  {totalPendingModeration > 0 && (
                    <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full animate-pulse flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {totalPendingModeration} Má»¤C CHá»œ DUYá»†T
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-emerald-400 mt-1.5 flex items-center gap-2">
                  <Store className="w-6 h-6 text-emerald-400" />
                  <span>Há»† THá»NG GIAN HÃ€NG CÆ¯ DÃ‚N & KIá»‚M DUYá»†T Dá»ŠCH Vá»¤</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Quáº£n lÃ½ toÃ n bá»™ danh má»¥c sáº£n pháº©m & dá»‹ch vá»¥ cÆ° dÃ¢n cung cáº¥p. Admin cÃ³ thá»ƒ thÃªm, sá»­a, xÃ³a, duyá»‡t Ä‘Äƒng hoáº·c táº¡m áº©n tá»«ng sáº£n pháº©m/dá»‹ch vá»¥ Ä‘á»ƒ hiá»ƒn thá»‹ lÃªn Website.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSyncAllToWebsite}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Äá»“ng Bá»™ LÃªn Web</span>
                </button>
                <button
                  onClick={handleOpenCreateStore}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg hover:shadow-emerald-500/25 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>âž• Táº¡o Gian HÃ ng Má»›i</span>
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
                  <span className="text-[11px] text-slate-400 font-bold block">Tá»•ng Gian HÃ ng</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{adminStores.length}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">Sáº£n Pháº©m & Dá»‹ch Vá»¥</span>
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
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 font-bold block">Chá» Duyá»‡t LÃªn Web</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">{totalPendingModeration} má»¥c</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">KiotViet POS Live</span>
                  <span className="text-lg font-black text-purple-600 dark:text-purple-400">{connectedStores} gian hÃ ng</span>
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
                    placeholder="TÃ¬m theo tÃªn gian hÃ ng, tÃªn chá»§ shop, sá»‘ Ä‘iá»‡n thoáº¡i, phÃ¢n khu..."
                    value={storeSearchQuery}
                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {storeSearchQuery && (
                    <button
                      onClick={() => setStoreSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                    >
                      âœ•
                    </button>
                  )}
                </div>

                <div className="w-full md:w-56 shrink-0">
                  <select
                    value={storeProjectFilter}
                    onChange={(e) => setStoreProjectFilter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="all">ðŸ¢ Táº¥t Cáº£ Dá»± Ãn Vinhomes</option>
                    <option value="ocean-park-1">Ocean Park 1 (Gia LÃ¢m)</option>
                    <option value="ocean-park-2">Ocean Park 2 (The Empire)</option>
                    <option value="ocean-park-3">Ocean Park 3 (The Crown)</option>
                    <option value="smart-city">Smart City (TÃ¢y Má»—)</option>
                    <option value="grand-park">Grand Park (TP. Thá»§ Äá»©c)</option>
                  </select>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Lá»c tráº¡ng thÃ¡i:
                </span>
                <button
                  onClick={() => setStoreModerationFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    storeModerationFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Táº¥t cáº£ ({adminStores.length})
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
                  <span>CÃ³ bÃ i chá» duyá»‡t ({totalPendingModeration})</span>
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
                  <span>ÄÃ£ duyá»‡t hiá»ƒn thá»‹ Web</span>
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
                  <p className="font-bold text-sm">KhÃ´ng tÃ¬m tháº¥y gian hÃ ng nÃ o phÃ¹ há»£p vá»›i bá»™ lá»c.</p>
                  <button
                    onClick={() => { setStoreSearchQuery(''); setStoreProjectFilter('all'); setStoreModerationFilter('all'); }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    XÃ³a Bá»™ Lá»c
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
                            <img loading="lazy"
                              src={st.logoUrl || ''}
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
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{st.category || 'Gian hÃ ng cÆ° dÃ¢n'}</span>
                                <span>â€¢</span>
                                <span>{st.project?.toUpperCase() || 'VINHOMES'}</span>
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-bold">{st.ownerName || 'CÆ° dÃ¢n'}</span>
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
                              {isStoreApproved ? 'âœ“ ÄÃ£ Duyá»‡t Web' : 'â³ Chá» Duyá»‡t'}
                            </span>
                            {st.kiotVietConfig?.syncStatus === 'connected' && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[9px] font-bold rounded-md">
                                âš¡ KiotViet POS
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {st.description || 'Gian hÃ ng sáº£n pháº©m & dá»‹ch vá»¥ phá»¥c vá»¥ cÆ° dÃ¢n ná»™i khu Ä‘Ã´ thá»‹.'}
                        </p>

                        {/* Pending Alert if has pending items */}
                        {storeTotalPending > 0 && (
                          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
                            <div className="flex items-center gap-1.5 font-black">
                              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                              <span>ðŸ”” CÃ“ {storeTotalPending} Má»¤C ÄANG CHá»œ ADMIN DUYá»†T!</span>
                            </div>
                            <span className="text-[10px] font-bold underline cursor-pointer" onClick={() => setSelectedAdminStore(st)}>
                              Duyá»‡t ngay â†’
                            </span>
                          </div>
                        )}

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-center text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">Sáº£n pháº©m</span>
                            <span className="font-black text-slate-900 dark:text-white text-sm">
                              {storeProds.length} <span className="text-[10px] text-slate-400 font-normal">mÃ³n</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">Dá»‹ch vá»¥ cung cáº¥p</span>
                            <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                              {matchingServs.length} <span className="text-[10px] text-slate-400 font-normal">dá»‹ch vá»¥</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">ÄÃ¡nh giÃ¡</span>
                            <span className="font-black text-amber-500 text-sm">â­ {st.rating || 0}</span>
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
                          <span>XEM & QUáº¢N LÃ Táº¤T Cáº¢ Dá»ŠCH Vá»¤ / Sáº¢N PHáº¨M ({storeProds.length + matchingServs.length})</span>
                        </button>

                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleToggleStoreStatus(st)}
                            title={isStoreApproved ? "Táº¡m áº©n gian hÃ ng khá»i website" : "Duyá»‡t gian hÃ ng lÃªn website"}
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
                            title="Chá»‰nh sá»­a thÃ´ng tin gian hÃ ng"
                            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteStore(st.id, st.storeName)}
                            title="XÃ³a gian hÃ ng khá»i há»‡ thá»‘ng"
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

      {/* ==================== Máº¢NG 2: TAB 3 - Tá»”NG QUAN ÄÆ N HÃ€NG Äá»I TÃC (Äá»I TÃC Tá»° QUáº¢N LÃ) ==================== */}
      {activeTab === 'orders_mgmt' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl border-2 border-blue-500/40 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  MÃ” HÃŒNH PHÃ‚N QUYá»€N Äá»I TÃC Tá»° QUáº¢N LÃ
                </span>
              </div>
              <h2 className="text-xl font-black text-blue-400 mt-1.5 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
                <span>Tá»”NG QUAN ÄÆ N HÃ€NG CHá»¢ CÆ¯ DÃ‚N (Äá»I TÃC Tá»° QUáº¢N LÃ)</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Há»‡ thá»‘ng tuÃ¢n thá»§ quy trÃ¬nh phÃ¢n quyá»n: Admin khÃ´ng trá»±c tiáº¿p quáº£n lÃ½ hay can thiá»‡p Ä‘Æ¡n hÃ ng cá»§a tá»«ng Ä‘á»‘i tÃ¡c. Má»—i cÆ° dÃ¢n/chá»§ gian hÃ ng tá»± quáº£n lÃ½ Ä‘Æ¡n hÃ ng, xem lá»‹ch sá»­ giao dá»‹ch & doanh thu riÃªng trong trang Quáº£n LÃ½ Gian HÃ ng cá»§a mÃ¬nh.
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs text-amber-700 dark:text-amber-300 font-medium flex items-start gap-3">
            <span className="text-xl">ðŸ’¡</span>
            <div>
              <strong className="font-extrabold block text-slate-900 dark:text-white mb-0.5">LÆ°u Ã½ phÃ¢n quyá»n Quáº£n trá»‹:</strong>
              Má»—i Ä‘á»‘i tÃ¡c/chá»§ cá»­a hÃ ng cÃ³ khÃ´ng gian lÃ m viá»‡c Ä‘á»™c láº­p. Há» theo dÃµi doanh thu bÃ¡n hÃ ng thá»±c táº¿, cáº­p nháº­t tiáº¿n Ä‘á»™ giao hÃ ng, thanh toÃ¡n VietQR vÃ  tá»± Ä‘á»™ng xuáº¥t hÃ³a Ä‘Æ¡n VAT KiotViet / MISA trong trang <code className="bg-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold text-amber-600 dark:text-amber-400">UserStorefrontManager</code>.
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            {/* Mobile Compact & Expandable Orders List */}
            <div className="block md:hidden space-y-2.5">
              {adminStoreOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng nÃ o trÃªn Chá»£ CÆ° DÃ¢n.
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
                            {order.customerName || 'KhÃ¡ch VÃ£ng Lai'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                            {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : 0} Ä‘
                          </span>
                          <span className={`text-[10px] transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            â–¼
                          </span>
                        </div>
                      </div>

                      {/* Brief single line summary */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                        <span className="truncate max-w-[140px] text-teal-600 dark:text-teal-400 font-semibold">
                          ðŸª {order.storeName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {order.paymentMethod === 'vietqr' ? 'VietQR' : 'COD'} â€¢ {order.paymentStatus === 'paid' ? 'ÄÃ£ Thanh ToÃ¡n' : 'ChÆ°a Tráº£'}
                        </span>
                      </div>

                      {/* Expanded Full Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px]">SÄT KhÃ¡ch HÃ ng:</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                ðŸ“ž {order.customerPhone || 'ChÆ°a cáº­p nháº­t'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Äá»‹a Chá»‰ Nháº­n:</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                ðŸ“ {order.customerAddress || 'Giao táº¡i cÄƒn há»™'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Tráº¡ng ThÃ¡i Giao HÃ ng:</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {order.orderStatus === 'new' && 'ðŸ†• ÄÆ¡n Má»›i'}
                                {order.orderStatus === 'confirmed' && 'âœ“ ÄÃ£ XÃ¡c Nháº­n'}
                                {order.orderStatus === 'delivering' && 'ðŸšš Äang Giao HÃ ng'}
                                {order.orderStatus === 'completed' && 'ðŸŽ‰ HoÃ n ThÃ nh'}
                                {order.orderStatus === 'cancelled' && 'âŒ ÄÃ£ Há»§y'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Quyá»n Quáº£n LÃ½:</span>
                              <span className="text-purple-600 dark:text-purple-400 font-bold">
                                ðŸ‘¤ Äá»‘i tÃ¡c tá»± xá»­ lÃ½
                              </span>
                            </div>
                          </div>
                          
                          {order.items && order.items.length > 0 && (
                            <div className="bg-slate-100 dark:bg-slate-900/80 p-2 rounded-xl mt-2 space-y-1">
                              <span className="text-[10px] font-black uppercase text-slate-500 block">Sáº£n Pháº©m ÄÃ£ Äáº·t:</span>
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-[11px]">
                                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                                    â€¢ {item.productName} x{item.quantity}
                                  </span>
                                  <span className="font-mono text-slate-900 dark:text-white font-bold">
                                    {(item.price * item.quantity).toLocaleString('vi-VN')} Ä‘
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
                    <th className="py-3 px-2">MÃ£ ÄÆ¡n</th>
                    <th className="py-3 px-2">KhÃ¡ch HÃ ng</th>
                    <th className="py-3 px-2">Gian HÃ ng</th>
                    <th className="py-3 px-2">Tá»•ng Tiá»n</th>
                    <th className="py-3 px-2">Thanh ToÃ¡n</th>
                    <th className="py-3 px-2">Tráº¡ng ThÃ¡i ÄÆ¡n</th>
                    <th className="py-3 px-2 text-right">Quyá»n Quáº£n LÃ½</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adminStoreOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng nÃ o trÃªn Chá»£ CÆ° DÃ¢n.
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
                          {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : 0} Ä‘
                        </td>
                        <td className="py-3 px-2 font-bold">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {order.paymentMethod === 'vietqr' ? 'VietQR' : 'COD'} â€¢ {order.paymentStatus === 'paid' ? 'ÄÃ£ Thanh ToÃ¡n' : 'ChÆ°a Tráº£'}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">
                            {order.orderStatus === 'new' && 'ðŸ†• ÄÆ¡n Má»›i'}
                            {order.orderStatus === 'confirmed' && 'âœ“ ÄÃ£ XÃ¡c Nháº­n'}
                            {order.orderStatus === 'delivering' && 'ðŸšš Äang Giao HÃ ng'}
                            {order.orderStatus === 'completed' && 'ðŸŽ‰ HoÃ n ThÃ nh'}
                            {order.orderStatus === 'cancelled' && 'âŒ ÄÃ£ Há»§y'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-[10px]">
                            ðŸ‘¤ Äá»‘i tÃ¡c tá»± xá»­ lÃ½
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

      {/* ==================== Máº¢NG 2: TAB 4 - BÃ€I VIáº¾T PR Äá»I TÃC & UY TÃN ==================== */}
      {activeTab === 'partners_reputation' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 rounded-3xl border-2 border-purple-500/40 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-purple-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  PR & UY TÃN Äá»I TÃC
                </span>
              </div>
              <h2 className="text-xl font-black text-purple-400 mt-1.5 flex items-center gap-2">
                <Star className="w-6 h-6 text-purple-400" />
                <span>QUáº¢N LÃ Äá»I TÃC & BÃ€I VIáº¾T ÄÃNH GIÃ UY TÃN / PR REVIEW</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Kiá»ƒm duyá»‡t cÃ¡c bÃ i bÃ³c phá»‘t, khen thÆ°á»Ÿng Ä‘á»‘i tÃ¡c thi cÃ´ng ná»™i tháº¥t, sá»­a chá»¯a, giÃºp viá»‡c, homestay cÆ° dÃ¢n Vinhomes. TÃ­ch há»£p video YouTube review thá»±c táº¿.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {adminReputationPosts.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
                <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-sm">ChÆ°a cÃ³ bÃ i viáº¿t Ä‘Ã¡nh giÃ¡ uy tÃ­n Ä‘á»‘i tÃ¡c nÃ o.</p>
              </div>
            ) : (
              adminReputationPosts.map(post => (
                <div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-extrabold text-[10px] rounded-full">
                      {post.category || 'Review Dá»‹ch Vá»¥'}
                    </span>
                    <span className="text-amber-500 font-black text-xs">â­ {post.rating || 0} / 5</span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white">{post.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">{post.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-500">Äá»‘i tÃ¡c: <strong className="text-slate-900 dark:text-white">{post.partnerName}</strong></span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{post.authorName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== Máº¢NG 2: TAB 5 - TÃ€I CHÃNH & CHIáº¾T KHáº¤U CHá»¢ ==================== */}
      {activeTab === 'resident_finance' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 rounded-3xl border-2 border-teal-500/40 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-teal-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  TÃ€I CHÃNH CHá»¢ CÆ¯ DÃ‚N
                </span>
              </div>
              <h2 className="text-xl font-black text-teal-400 mt-1.5 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-teal-400" />
                <span>QUáº¢N LÃ TÃ€I CHÃNH & PHÃ CHIáº¾T KHáº¤U Dá»ŠCH Vá»¤ CÆ¯ DÃ‚N</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Theo dÃµi tá»•ng giao dá»‹ch chá»£ cÆ° dÃ¢n, doanh thu gÃ³i duy trÃ¬ gian hÃ ng chÃ­nh chá»§ & Ä‘á»‘i soÃ¡t VietQR tá»± Ä‘á»™ng.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Doanh Thu Giao Dá»‹ch Chá»£</span>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                {adminStoreOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('vi-VN')} VNÄ
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">âœ“ Tá»•ng Ä‘Æ¡n hÃ ng trÃªn há»‡ thá»‘ng</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Gian HÃ ng ÄÃ£ Thu PhÃ­</span>
              <div className="text-2xl font-black text-amber-500">
                {(adminStores.length * 199000).toLocaleString('vi-VN')} VNÄ
              </div>
              <span className="text-[10px] text-amber-500 font-bold block">GÃ³i 199k VNÄ/thÃ¡ng</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Dá»‹ch Vá»¥ KYC ÄÃ£ Cáº¥p</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {adminResidentServices.filter(s => s.verified || s.kycStatus === 'verified').length} / {adminResidentServices.length} DV
              </div>
              <span className="text-[10px] text-blue-500 font-bold block">âœ“ ÄÃ£ gáº¯n NÃºt Xanh ChÃ­nh Chá»§</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Máº¢NG 2: TAB 6 - QUáº¢N LÃ GÃ“I Dá»ŠCH Vá»¤ & ÄÆ N ÄÄ‚NG KÃ ==================== */}
      {activeTab === 'package_orders_mgmt' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-6 rounded-3xl border-2 border-amber-500/40 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  QUáº¢N TRá»Š BÃO GIÃ & GÃ“I Cá»¬A HÃ€NG 24H
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full border border-emerald-500/30">
                  â— ACTIVE STORE PACKAGES
                </span>
              </div>
              <h2 className="text-xl font-black text-amber-400 mt-1.5 flex items-center gap-2">
                <Package className="w-6 h-6 text-amber-400" />
                <span>QUáº¢N LÃ 6 GÃ“I Dá»ŠCH Vá»¤ & ÄÆ N ÄÄ‚NG KÃ Tá»ª Cá»¬A HÃ€NG CÆ¯ DÃ‚N</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Há»‡ thá»‘ng bÃ¡o giÃ¡ linh hoáº¡t. CÆ° dÃ¢n & NhÃ  cung cáº¥p dá»‹ch vá»¥ káº¿t ná»‘i trá»±c tiáº¿p khÃ´ng chiáº¿t kháº¥u sÃ n. Admin quáº£n lÃ½ cÃ¡c gÃ³i hiá»ƒn thá»‹ &amp; phÃª duyá»‡t cÃ¡c Ä‘Æ¡n Ä‘Äƒng kÃ½ dá»‹ch vá»¥ nhanh chÃ³ng.
              </p>
            </div>

            <button
              onClick={handleOpenAddPkgModal}
              className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Táº O GÃ“I Dá»ŠCH Vá»¤ Má»šI</span>
            </button>
          </div>

          {/* Section 1: Customer Package Subscription Orders */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase">
                  ðŸ“¦ ÄÆ N ÄÄ‚NG KÃ GÃ“I Cáº¦N DUYá»†T ({adminPackageOrders.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-bold">
                Chá» duyá»‡t: <strong className="text-amber-500 font-black">{adminPackageOrders.filter(o => o.status === 'pending').length} Ä‘Æ¡n</strong>
              </span>
            </div>

            {adminPackageOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                ChÆ°a cÃ³ Ä‘Æ¡n Ä‘Äƒng kÃ½ gÃ³i dá»‹ch vá»¥ nÃ o. KhÃ¡ch hÃ ng gá»­i yÃªu cáº§u sáº½ xuáº¥t hiá»‡n á»Ÿ Ä‘Ã¢y.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">MÃ£ & NgÃ y</th>
                      <th className="p-3">KhÃ¡ch HÃ ng / SÄT</th>
                      <th className="p-3">Gian HÃ ng / CÄƒn Há»™</th>
                      <th className="p-3">GÃ³i Dá»‹ch Vá»¥ & GiÃ¡</th>
                      <th className="p-3">Ghi ChÃº YÃªu Cáº§u</th>
                      <th className="p-3">Tráº¡ng ThÃ¡i</th>
                      <th className="p-3 text-right">Thao TÃ¡c Admin</th>
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
                          <span className="font-bold text-slate-800 dark:text-slate-200">{ord.storeName || 'CÆ° dÃ¢n ná»™i khu'}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-extrabold text-slate-900 dark:text-white uppercase block">{ord.packageName}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">
                            {(ord.packagePrice || 0).toLocaleString('vi-VN')}Ä‘ {ord.unit}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs text-slate-600 dark:text-slate-300 truncate">
                          {ord.note || 'KhÃ´ng cÃ³ ghi chÃº'}
                        </td>
                        <td className="p-3">
                          {ord.status === 'pending' && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] font-black rounded-full uppercase border border-amber-300">
                              ðŸŸ¡ CHá»œ DUYá»†T
                            </span>
                          )}
                          {ord.status === 'approved' && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-black rounded-full uppercase border border-emerald-300">
                              ðŸŸ¢ ÄÃƒ KÃCH HOáº T
                            </span>
                          )}
                          {ord.status === 'rejected' && (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 text-[10px] font-black rounded-full uppercase border border-rose-300">
                              ðŸ”´ Tá»ª CHá»I
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
                                <span>DUYá»†T</span>
                              </button>
                              <button
                                onClick={() => handleUpdatePackageOrderStatus(ord.id, 'rejected')}
                                className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-500 hover:text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
                              >
                                Tá»« Chá»‘i
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">ÄÃ£ xá»­ lÃ½</span>
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
                Cáº¤U HÃŒNH DANH SÃCH GÃ“I Dá»ŠCH Vá»¤ HIá»‚N THá»Š ({adminStorePackages.length} GÃ³i)
              </h3>
              <button
                onClick={handleOpenAddPkgModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>ThÃªm GÃ³i Má»›i</span>
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
                        {pkg.badge || 'GÃ“I CHUáº¨N'}
                      </span>
                      {pkg.popular && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full">
                          ðŸ”¥ POPULAR
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
                      <span>Sá»­a GÃ³i</span>
                    </button>
                    <button
                      onClick={() => handleDeletePackageClick(pkg.id, pkg.name)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      title="XÃ³a gÃ³i"
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

      {/* ==================== Máº¢NG 2: TAB QUáº¢N TRá»Š TUYá»‚N Dá»¤NG & VIá»†C LÃ€M ==================== */}
      {activeTab === 'recruitment_mgmt' && (
        <AdminRecruitmentManager onRefresh={onRefreshData} />
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

      {/* Tab: Quáº£ng CÃ¡o Management */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          {/* ===== áº¢NH 4 NHÃ“M NGÃ€NH TRANG CHá»¦ ===== */}
          {categoryImages.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-500" />
                  <span>áº¢NH 4 NHÃ“M NGÃ€NH TRANG CHá»¦</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">Hiá»ƒn thá»‹ trÃªn trang chá»§</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {categoryImages.map(cat => (
                  <div key={cat.key} className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[4/3]">
                      <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-slate-950/80 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                        {cat.label}
                      </span>
                    </div>
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-[11px] cursor-pointer transition">
                      {categoryImageBusy === cat.key ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{categoryImageBusy === cat.key ? 'ÄANG LÆ¯U...' : 'Äá»”I áº¢NH'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={categoryImageBusy === cat.key}
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleCategoryImageUpload(cat.key, f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border transition-all shadow-xl space-y-4 ${
            editingAd 
              ? 'border-2 border-amber-500 ring-4 ring-amber-500/20' 
              : 'border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                {editingAd ? (
                  <>
                    <Edit3 className="w-5 h-5 text-amber-500 animate-bounce" />
                    <span>CHá»ˆNH Sá»¬A BANNER QUáº¢NG CÃO</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>THÃŠM BANNER QUáº¢NG CÃO Má»šI (DÃ€NH RIÃŠNG CHO ADMIN)</span>
                  </>
                )}
              </h3>
              {editingAd && (
                <button
                  type="button"
                  onClick={handleCancelEditAd}
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Há»§y Sá»­a (Trá»Ÿ vá» ThÃªm Má»›i)
                </button>
              )}
            </div>

            {editingAd && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                <span>âš ï¸ Báº¡n Ä‘ang chá»‰nh sá»­a Banner: <strong>"{editingAd.title}"</strong></span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Thay Ä‘á»•i thÃ´ng tin bÃªn dÆ°á»›i vÃ  nháº¥n "LÆ°u Cáº­p Nháº­t Banner"</span>
              </div>
            )}
            
            <form onSubmit={handleSaveFormAd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold">
                {/* Column 1: Text details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold">1. TiÃªu Ä‘á» quáº£ng cÃ¡o (*)</label>
                    <input
                      type="text"
                      required
                      placeholder="VÃ­ dá»¥: Quá»¹ cÄƒn Shophouse ChÃ  LÃ  cáº¯t lá»— 2 tá»·..."
                      value={newAdTitle}
                      onChange={e => setNewAdTitle(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold">2. ÄÆ°á»ng dáº«n liÃªn káº¿t (Link Web / Zalo)</label>
                    <input
                      type="text"
                      placeholder="VÃ­ dá»¥: https://zalo.me/0912345678"
                      value={newAdLink}
                      onChange={e => setNewAdLink(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                    />
                  </div>

                   <div>
                     <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold">3. Vá»‹ trÃ­ hiá»ƒn thá»‹ trÃªn website (*)</label>
                     <select
                       value={newAdPos}
                       onChange={e => setNewAdPos(e.target.value as any)}
                       className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-amber-300 dark:border-slate-700 rounded-2xl text-amber-600 dark:text-amber-400 font-black text-xs focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
                     >
                       <option value="float_right_pc">ðŸ“Œ Cáº¡nh Pháº£i Web BÃ¡m Äuá»•i trÃªn PC (Sticky Float Right - CÃ³ nÃºt táº¯t âŒ)</option>
                       <option value="header_top">ðŸ“Œ Thanh trÃªn cÃ¹ng Header (Top Banner Bar)</option>
                       <option value="float_left_pc">ðŸ“Œ Cáº¡nh TrÃ¡i Web BÃ¡m Äuá»•i trÃªn PC (Sticky Float Left - CÃ³ nÃºt táº¯t âŒ)</option>
                       <option value="home_middle">ðŸ“Œ Giá»¯a Trang Chá»§ (Náº±m giá»¯a danh sÃ¡ch tin)</option>
                       <option value="home_sidebar">ðŸ“Œ Cá»™t Pháº£i Trang Chá»§ (Sidebar Banner)</option>
                       <option value="property_detail">ðŸ“Œ Trang Chi Tiáº¿t BÄS (Detail Page Banner)</option>
                       <option value="popup_modal">ðŸ“Œ Pop-Up Ná»•i Trung TÃ¢m MÃ n HÃ¬nh (Center Popup - CÃ³ nÃºt táº¯t âŒ)</option>
                     </select>
                   </div>

                   {/* Chá»n quáº£ng cÃ¡o cha (náº¿u lÃ  quáº£ng cÃ¡o con) */}
                   <div>
                     <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold">4. GÃ¡n vÃ o Quáº£ng cÃ¡o Cha (náº¿u cÃ³)</label>
                     <select
                       value={newAdParentId}
                       onChange={e => setNewAdParentId(e.target.value || '')}
                       className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                     >
                       <option value="">â€” KhÃ´ng gÃ¡n (lÃ  quáº£ng cÃ¡o cha Ä‘á»™c láºµn) â€”</option>
                       {parentAds.filter(a => a.id !== editingAd?.id).map(ad => (
                         <option key={ad.id} value={ad.id}>
                           {ad.title} ({ad.position})
                         </option>
                       ))}
                     </select>
                     <p className="text-[10px] text-slate-400 mt-1">Chá»n quáº£ng cÃ¡o cha Ä‘á»ƒ gáº¯n vÃ o nhÃ³m. Quáº£ng cÃ¡o con sáº½ hiá»ƒn thá»‹ dÆ°á»›i quáº£ng cÃ¡o cha trong menu.</p>
                   </div>

                  {/* Quáº£n Trá»‹ KÃ­ch ThÆ°á»›c & Kiá»ƒu Hiá»ƒn Thá»‹ Banner Cáº¡nh Pháº£i */}
                  <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1.5 uppercase">
                        <Sparkles className="w-4 h-4 text-amber-500" /> TÃ™Y CHá»ˆNH KÃCH THÆ¯á»šC & KIá»‚U HIá»‚N THá»Š Cáº NH PHáº¢I:
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">ðŸ“ KÃ­ch thÆ°á»›c bá» rá»™ng (Size):</label>
                        <select
                          value={newAdWidthSize}
                          onChange={(e) => setNewAdWidthSize(e.target.value as any)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                        >
                          <option value="medium">Vá»«a (Medium - ~210px Chuáº©n Web)</option>
                          <option value="large">Rá»™ng / Lá»›n (VIP Large - ~260px)</option>
                          <option value="small">Nhá» (Small - ~170px Tiáº¿t kiá»‡m)</option>
                          <option value="compact">SiÃªu Gá»n (Compact - ~140px Mini)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">ðŸŽ¨ Kiá»ƒu hiá»ƒn thá»‹ (Style):</label>
                        <select
                          value={newAdDisplayStyle}
                          onChange={(e) => setNewAdDisplayStyle(e.target.value as any)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                        >
                          <option value="glowing_border">âœ¨ VIP Viá»n PhÃ¡t SÃ¡ng Gold Glow (GÃ¢y chÃº Ã½)</option>
                          <option value="card_full">Tháº» Äáº§y Äá»§ (HÃ¬nh + TiÃªu Ä‘á» + NÃºt báº¥m)</option>
                          <option value="image_only">ðŸ–¼ï¸ Chá»‰ HÃ¬nh áº¢nh Banner (TrÃ n viá»n + NÃºt táº¯t âŒ)</option>
                          <option value="minimal">âšª Tá»‘i Giáº£n SÃ¡ng (Clean Light Minimalist)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">ðŸ·ï¸ NhÃ£n Badge hiá»ƒn thá»‹:</label>
                        <input
                          type="text"
                          value={newAdBadgeText}
                          onChange={(e) => setNewAdBadgeText(e.target.value)}
                          placeholder="VÃ­ dá»¥: QUáº¢NG CÃO Cáº NH PHáº¢I..."
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Visual Website Blueprint Setup Map */}
                  <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-3 space-y-2 text-white">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-400 text-[11px] uppercase flex items-center gap-1">
                        <Layout className="w-3.5 h-3.5" /> SÆ  Äá»’ Vá»Š TRÃ TRá»°C QUAN (Báº¤M VÃ€O Äá»‚ CHá»ŒN):
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">
                        {newAdPos === 'header_top' && 'Top Header'}
                        {newAdPos === 'float_right_pc' && 'Cáº¡nh Pháº£i PC (BÃ¡m Ä‘uá»•i)'}
                        {newAdPos === 'float_left_pc' && 'Cáº¡nh TrÃ¡i PC (BÃ¡m Ä‘uá»•i)'}
                        {newAdPos === 'home_middle' && 'Giá»¯a Trang Chá»§'}
                        {newAdPos === 'home_sidebar' && 'Sidebar Cá»™t Pháº£i'}
                        {newAdPos === 'property_detail' && 'Trang Chi Tiáº¿t'}
                        {newAdPos === 'popup_modal' && 'Pop-Up Ná»•i'}
                      </span>
                    </div>

                    <div className="border border-slate-700 bg-slate-950 rounded-xl p-2 space-y-1.5 text-[10px] font-bold">
                      {/* Top Header */}
                      <div
                        onClick={() => setNewAdPos('header_top')}
                        className={`p-1.5 rounded text-center cursor-pointer transition border flex items-center justify-between ${
                          newAdPos === 'header_top'
                            ? 'bg-amber-500 text-slate-950 border-white font-black shadow-md'
                            : 'bg-slate-800 text-amber-300 border-amber-500/30 hover:bg-slate-750'
                        }`}
                      >
                        <span>ðŸ“Œ Thanh TrÃªn CÃ¹ng Header</span>
                        <span className="text-[9px] opacity-80">({adsList.filter(a => a.position === 'header_top').length})</span>
                      </div>

                      {/* Main Grid */}
                      <div className="grid grid-cols-12 gap-1.5">
                        <div
                          onClick={() => setNewAdPos('float_left_pc')}
                          className={`col-span-3 p-1.5 rounded text-center cursor-pointer transition border flex flex-col justify-center ${
                            newAdPos === 'float_left_pc'
                              ? 'bg-emerald-600 text-white border-white font-black shadow'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
                          }`}
                        >
                          <span className="text-[9px]">ðŸ“Œ Cáº¡nh TrÃ¡i (PC)</span>
                          <span className="text-[8px] text-emerald-200">BÃ¡m Ä‘uá»•i âŒ</span>
                        </div>

                        <div className="col-span-6 space-y-1">
                          <div
                            onClick={() => setNewAdPos('home_middle')}
                            className={`p-1.5 rounded text-center cursor-pointer transition border ${
                              newAdPos === 'home_middle'
                                ? 'bg-amber-500 text-slate-950 border-white font-black shadow'
                                : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/40'
                            }`}
                          >
                            <span>ðŸ“Œ Giá»¯a Trang Chá»§</span>
                          </div>
                          <div
                            onClick={() => setNewAdPos('property_detail')}
                            className={`p-1 rounded text-center cursor-pointer transition border ${
                              newAdPos === 'property_detail'
                                ? 'bg-purple-600 text-white border-white font-black shadow'
                                : 'bg-purple-950/40 text-purple-300 border-purple-500/30 hover:bg-purple-900/40'
                            }`}
                          >
                            <span className="text-[9px]">ðŸ“Œ Trang Chi Tiáº¿t BÄS</span>
                          </div>
                        </div>

                        <div className="col-span-3 space-y-1">
                          <div
                            onClick={() => setNewAdPos('home_sidebar')}
                            className={`p-1 rounded text-center cursor-pointer transition border ${
                              newAdPos === 'home_sidebar'
                                ? 'bg-blue-600 text-white border-white font-black shadow'
                                : 'bg-blue-950/40 text-blue-300 border-blue-500/30 hover:bg-blue-900/40'
                            }`}
                          >
                            <span className="text-[9px]">ðŸ“Œ Sidebar Cá»™t Pháº£i</span>
                          </div>
                          <div
                            onClick={() => setNewAdPos('float_right_pc')}
                            className={`p-1 rounded text-center cursor-pointer transition border ${
                              newAdPos === 'float_right_pc'
                                ? 'bg-amber-500 text-slate-950 border-white font-black shadow'
                                : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/40'
                            }`}
                          >
                            <span className="text-[9px]">ðŸ“Œ Cáº¡nh Pháº£i (PC) âŒ</span>
                          </div>
                        </div>
                      </div>

                      {/* Popup Modal */}
                      <div
                        onClick={() => setNewAdPos('popup_modal')}
                        className={`p-1.5 rounded text-center cursor-pointer transition border flex items-center justify-between ${
                          newAdPos === 'popup_modal'
                            ? 'bg-rose-600 text-white border-white font-black shadow'
                            : 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/40'
                        }`}
                      >
                        <span>ðŸ“Œ Pop-Up Ná»•i Trung TÃ¢m (Center Popup Modal)</span>
                        <span className="text-[9px] opacity-80">({adsList.filter(a => a.position === 'popup_modal').length})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Image Upload & Preview */}
                <div className="space-y-4">
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold">4. HÃ¬nh áº£nh Banner (*)</label>

                  {/* High visibility upload button */}
                  <label className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-950/40 dark:to-slate-900 border-2 border-dashed border-amber-400 hover:border-amber-500 rounded-2xl cursor-pointer transition text-center group shadow-sm">
                    <Upload className="w-8 h-8 text-amber-500 mb-1.5 group-hover:scale-110 transition-transform animate-pulse" />
                    <span className="text-amber-950 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                      ðŸ“ Báº¤M VÃ€O ÄÃ‚Y Äá»‚ Táº¢I áº¢NH Tá»ª MÃY TÃNH (PC)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                      Há»— trá»£ Ä‘á»‹nh dáº¡ng JPG, PNG, WEBP (Dung lÆ°á»£ng max 8MB)
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleAdFileUpload(e)} />
                  </label>

                  {/* Fallback URL input */}
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px] font-medium">Hoáº·c dÃ¡n URL link áº£nh cÃ³ sáºµn:</label>
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={newAdImage}
                      onChange={e => setNewAdImage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono"
                    />
                  </div>

                  {/* Image Live Preview */}
                  {newAdImage && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-amber-300 dark:border-amber-800/60 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" /> xem trÆ°á»›c áº£nh banner:
                        </span>
                        <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                          Äá»•i áº£nh tá»« PC
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleAdFileUpload(e)} />
                        </label>
                      </div>
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img loading="lazy" src={newAdImage} alt="Preview" className="h-24 w-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form submit bar */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className={`px-7 py-3.5 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 ${
                      editingAd 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-110'
                    }`}
                  >
                    {editingAd ? (
                      <>
                        <Check className="w-5 h-5" /> ðŸ’¾ LÆ¯U Cáº¬P NHáº¬T BANNER
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" /> + THÃŠM BANNER QUáº¢NG CÃO Má»šI
                      </>
                    )}
                  </button>
                  {editingAd && (
                    <button
                      type="button"
                      onClick={handleCancelEditAd}
                      className="px-5 py-3.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Há»¦Y Sá»¬A (TRá»ž Vá»€ THÃŠM Má»šI)
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  * Banner má»›i Ä‘Äƒng hoáº·c vá»«a cáº­p nháº­t sáº½ Ä‘Æ°á»£c hiá»ƒn thá»‹ ngay láº­p tá»©c ngoÃ i trang chá»§.
                </p>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                DANH SÃCH BANNER QUáº¢NG CÃO ÄANG HOáº T Äá»˜NG ({parentAds.length} nhÃ³m, {adsList.length} tá»•ng)
              </h3>
              <span className="text-[11px] text-slate-400">áº¤n nÃºt âœï¸ Sá»­a Ä‘á»ƒ chá»‰nh sá»­a trá»±c tiáº¿p thÃ´ng tin á»Ÿ khung trÃªn</span>
            </div>

            <div className="overflow-x-auto">
              {/* Tree View cho quáº£ng cÃ¡o cha/con */}
              <div className="space-y-1">
                {parentAds.map(ad => {
                  const isBeingEdited = editingAd?.id === ad.id;
                  const isExpanded = expandedAds.has(ad.id);
                  const children = childAds(ad.id);
                  return (
                    <div key={ad.id} className="space-y-1">
                      {/* Quáº£ng cÃ¡o cha */}
                      <div className={`flex items-center gap-2 p-3 rounded-xl transition ${
                        isBeingEdited 
                          ? 'bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-500' 
                          : 'bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {children.length > 0 && (
                          <button
                            onClick={() => toggleExpandAd(ad.id)}
                            className="p-1 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
                            title={isExpanded ? 'Thu gá»n' : 'Má»Ÿ rá»™ng'}
                          >
                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                        <div className="relative group w-16 shrink-0">
                          <img loading="lazy" src={ad.imageUrl} alt={ad.title} className="w-16 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                          <label 
                            className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg cursor-pointer text-white text-[9px] font-extrabold transition"
                            title="Táº£i áº£nh má»›i trá»±c tiáº¿p"
                          >
                            <Upload className="w-3 h-3 text-amber-400" />
                            <input type="file" accept="image/*" className="hidden" onChange={e => handleAdFileUpload(e, ad.id)} />
                          </label>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{ad.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                              {ad.position === 'header_top' && 'ðŸ“Œ Top Header'}
                              {ad.position === 'float_right_pc' && 'ðŸ“Œ Cáº¡nh Pháº£i PC'}
                              {ad.position === 'float_left_pc' && 'ðŸ“Œ Cáº¡nh TrÃ¡i PC'}
                              {ad.position === 'home_middle' && 'ðŸ“Œ Giá»¯a Trang Chá»§'}
                              {ad.position === 'home_sidebar' && 'ðŸ“Œ Sidebar'}
                              {ad.position === 'property_detail' && 'ðŸ“Œ Chi Tiáº¿t BÄS'}
                              {ad.position === 'popup_modal' && 'ðŸ“Œ Pop-Up'}
                              {!['header_top','float_right_pc','float_left_pc','home_middle','home_sidebar','property_detail','popup_modal'].includes(ad.position) && ad.position}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400">{(ad.clickCount || ad.clicks || 0).toLocaleString('vi-VN')} lÆ°á»£t</span>
                            <span className={(ad.active ?? ad.isActive ?? true) ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-500'}>
                              {(ad.active ?? ad.isActive ?? true) ? 'âœ“ Hiá»‡n' : 'âœ• áº¨n'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleAdActive(ad.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black transition ${
                              (ad.active ?? ad.isActive ?? true)
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                            }`}
                          >
                            {(ad.active ?? ad.isActive ?? true) ? 'âœ“ Äang Hiá»‡n' : 'âœ• ÄÃ£ áº¨n'}
                          </button>
                          <button
                            onClick={() => handleStartEditAd(ad)}
                            className={`px-2.5 py-1 rounded-lg font-black text-xs flex items-center gap-1 transition shadow-sm border ${
                              isBeingEdited
                                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400'
                                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400'
                            }`}
                            title="Sá»­a thÃ´ng tin banner quáº£ng cÃ¡o á»Ÿ khung trÃªn"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {isBeingEdited ? 'âœï¸ Äang Sá»­a' : 'âœï¸ Sá»¬A'}
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                            title="XÃ³a quáº£ng cÃ¡o"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quáº£ng cÃ¡o con */}
                      {isExpanded && children.length > 0 && (
                        <div className="ml-8 space-y-1">
                          {children.map(childAd => {
                            const childEdited = editingAd?.id === childAd.id;
                            return (
                              <div key={childAd.id} className={`flex items-center gap-2 p-2.5 rounded-lg transition ${
                                childEdited 
                                  ? 'bg-amber-50/80 dark:bg-amber-950/30 border-l-2 border-amber-500' 
                                  : 'bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-700'
                              }`}>
                                <div className="relative group w-12 shrink-0">
                                  <img loading="lazy" src={childAd.imageUrl} alt={childAd.title} className="w-12 h-8 object-cover rounded border border-slate-200 dark:border-slate-700 shadow-sm" />
                                  <label 
                                    className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded cursor-pointer text-white text-[8px] transition"
                                    title="Táº£i áº£nh má»›i trá»±c tiáº¿p"
                                  >
                                    <Upload className="w-2.5 h-2.5 text-amber-400" />
                                    <input type="file" accept="image/*" className="hidden" onChange={e => handleAdFileUpload(e, childAd.id)} />
                                  </label>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 text-xs">{childAd.title}</p>
                                  <div className="flex items-center gap-2 text-[9px] text-slate-500 dark:text-slate-400">
                                    <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                                      {childAd.position === 'header_top' && 'ðŸ“Œ Top Header'}
                                      {childAd.position === 'float_right_pc' && 'ðŸ“Œ Cáº¡nh Pháº£i PC'}
                                      {childAd.position === 'float_left_pc' && 'ðŸ“Œ Cáº¡nh TrÃ¡i PC'}
                                      {childAd.position === 'home_middle' && 'ðŸ“Œ Giá»¯a Trang Chá»§'}
                                      {childAd.position === 'home_sidebar' && 'ðŸ“Œ Sidebar'}
                                      {childAd.position === 'property_detail' && 'ðŸ“Œ Chi Tiáº¿t BÄS'}
                                      {childAd.position === 'popup_modal' && 'ðŸ“Œ Pop-Up'}
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400">{(childAd.clickCount || childAd.clicks || 0).toLocaleString('vi-VN')}</span>
                                    <span className={(childAd.active ?? childAd.isActive ?? true) ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-500'}>
                                      {(childAd.active ?? childAd.isActive ?? true) ? 'âœ“' : 'âœ•'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleToggleAdActive(childAd.id)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-black transition ${
                                      (childAd.active ?? childAd.isActive ?? true)
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                    }`}
                                  >
                                    {(childAd.active ?? childAd.isActive ?? true) ? 'âœ“' : 'âœ•'}
                                  </button>
                                  <button
                                    onClick={() => handleStartEditAd(childAd)}
                                    className={`p-1 rounded text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition ${
                                      childEdited ? 'bg-amber-400/30' : ''
                                    }`}
                                    title="Sá»­a"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAd(childAd.id)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition"
                                    title="XÃ³a"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== HERO CARDS IMAGE MANAGEMENT (4 tháº» danh má»¥c trang chá»§) ===== */}
      {activeTab === 'ads' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-500" />
                QUáº¢N LÃ áº¢NH THáºº DANH Má»¤C TRANG CHá»¦ (4 tháº» hero)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Thay Ä‘á»•i áº£nh Ä‘áº¡i diá»‡n cho 4 tháº»: Mua BÃ¡n BÄS, Cho ThuÃª BÄS, Dá»‹ch Vá»¥ CÆ° DÃ¢n, Tuyá»ƒn Dá»¥ng Viá»‡c LÃ m. áº¢nh sáº½ hiá»ƒn thá»‹ ngay trÃªn trang chá»§.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetHeroCards}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                title="KhÃ´i phá»¥c áº£nh máº·c Ä‘á»‹nh"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Äáº·t láº¡i máº·c Ä‘á»‹nh
              </button>
              <button
                onClick={handleSaveHeroCards}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 transition shadow"
              >
                <Save className="w-3.5 h-3.5" /> LÆ°u táº¥t cáº£
              </button>
            </div>
          </div>

          {heroCardSaved && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> ÄÃ£ lÆ°u cáº¥u hÃ¬nh áº£nh tháº» danh má»¥c!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {heroCards.map((card) => (
              <div
                key={card.id}
                className={`border rounded-2xl p-3 space-y-3 transition-all ${
                  card.active
                    ? 'border-amber-500/40 bg-amber-50/5 dark:bg-amber-950/10'
                    : 'border-slate-300 dark:border-slate-600 opacity-60'
                }`}
              >
                {/* Image Preview */}
                <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700">
                  <img
                    loading="lazy"
                    src={card.image || '/images/demo/placeholder.jpg'}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/demo/placeholder.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <div className="absolute bottom-1 left-1.5 right-1.5">
                    <span className="text-white font-black text-[10px] bg-slate-950/80 px-1.5 py-0.5 rounded truncate block">
                      {card.title}
                    </span>
                  </div>
                </div>

                {/* Upload + URL */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className="flex-1 cursor-pointer px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition">
                      <Upload className="w-3.5 h-3.5" /> Táº£i áº£nh
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleHeroCardImageUpload(card.id, e)}
                        className="hidden"
                      />
                    </label>
                    <label className="flex-1 text-[9px] font-bold text-slate-500 dark:text-slate-400">hoáº·c dÃ¡n URL</label>
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={card.image}
                    onChange={(e) => handleHeroCardUrlChange(card.id, e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-[10px] focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Hiá»ƒn thá»‹</span>
                  <button
                    onClick={() => handleHeroCardToggle(card.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                      card.active ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      card.active ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 1: Properties Table */}
      {activeTab === 'properties' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-4 shadow-xl">
          {/* Header & Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>ðŸ¢</span> QUáº¢N LÃ Táº¤T Cáº¢ Báº¤T Äá»˜NG Sáº¢N ({properties.length} CÄ‚N)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Tá»± Ä‘á»™ng háº¿t háº¡n hiá»ƒn thá»‹ sau 15â€“25 ngÃ y. Dá»¯ liá»‡u NgÆ°á»i Ä‘Äƒng & Chi tiáº¿t cÄƒn Ä‘Æ°á»£c báº£o lÆ°u Ä‘áº§y Ä‘á»§ trong Kho LÆ°u Trá»¯.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Density View Switcher */}
              <div className="bg-slate-100 dark:bg-slate-700/60 p-0.5 rounded-xl flex items-center gap-0.5 text-[11px] font-bold">
                <button
                  onClick={() => setAdminViewMode('icon_compact')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    adminViewMode === 'icon_compact'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Cháº¿ Ä‘á»™ biá»ƒu tÆ°á»£ng thu gá»n"
                >
                  <span>âš¡ Icon Thu Gá»n</span>
                </button>
                <button
                  onClick={() => setAdminViewMode('detailed')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    adminViewMode === 'detailed'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Cháº¿ Ä‘á»™ chi tiáº¿t Ä‘áº§y Ä‘á»§"
                >
                  <span>ðŸ“‹ Chi Tiáº¿t</span>
                </button>
              </div>

              <button
                onClick={() => {
                  const currentFiltered = properties.filter((p) => {
                    const expiryInfo = getPropertyExpiryInfo(p);
                    if (propertySubFilter === 'sale') return p.type === 'sale' || (p as any).category === 'ban';
                    if (propertySubFilter === 'rent') return p.type === 'rent' || (p as any).category === 'cho-thue';
                    if (propertySubFilter === 'pushed') return !!p.pushedAt;
                    if (propertySubFilter === 'expiring') return !expiryInfo.isExpired && expiryInfo.daysRemaining <= 5;
                    if (propertySubFilter === 'archived') return expiryInfo.isExpired || p.status === 'sold';
                    if (propertySubFilter === 'pending') return (!p.approved && p.status !== 'approved' && p.status !== 'rejected');
                    return true;
                  }).slice(0, 150);
                  toggleExpandAllAdminProps(currentFiltered);
                }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded-xl transition cursor-pointer"
                title="Má»Ÿ rá»™ng hoáº·c thu gá»n táº¥t cáº£ dÃ²ng"
              >
                Má»Ÿ rá»™ng / Thu gá»n â–¾
              </button>

              <button
                onClick={handleSeed1000Click}
                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-extrabold rounded-xl text-[11px] shrink-0 transition flex items-center gap-1"
              >
                <span>âœ¨</span> + 1,000 Tin Test
              </button>
            </div>
          </div>

          {/* Sub-Filters Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setPropertySubFilter('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs transition shrink-0 ${
                propertySubFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Táº¥t Cáº£ ({properties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('sale')}
              className={`px-2.5 py-1.5 rounded-xl text-xs transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'sale'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              ðŸ  BÃ¡n ({saleProperties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('rent')}
              className={`px-2.5 py-1.5 rounded-xl text-xs transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'rent'
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100'
              }`}
            >
              ðŸ”‘ ThuÃª ({rentProperties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('pushed')}
              className={`px-2.5 py-1.5 rounded-xl text-xs transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'pushed'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
              }`}
            >
              âš¡ Tin Ná»•i Báº­t ({pushedProperties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('expiring')}
              className={`px-2.5 py-1.5 rounded-xl text-xs transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'expiring'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              â° Sáº¯p Háº¿t Háº¡n ({expiringSoonProperties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('archived')}
              className={`px-2.5 py-1.5 rounded-xl text-xs transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'archived'
                  ? 'bg-purple-700 text-white shadow'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
              }`}
            >
              ðŸ“ Tin ÄÃ£ ÄÃ³ng ({archivedProperties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('pending')}
              className={`px-2.5 py-1.5 rounded-xl text-xs transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'pending'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              â³ Chá» PhÃª Duyá»‡t ({pendingProperties.length})
            </button>
          </div>

          {/* Properties Mobile Compact Icon List (< md) */}
          <div className="block md:hidden space-y-2 max-h-[660px] overflow-y-auto pr-0.5">
            {properties
              .filter((p) => {
                const expiryInfo = getPropertyExpiryInfo(p);
                if (propertySubFilter === 'sale') return p.type === 'sale' || (p as any).category === 'ban';
                if (propertySubFilter === 'rent') return p.type === 'rent' || (p as any).category === 'cho-thue';
                if (propertySubFilter === 'pushed') return !!p.pushedAt;
                if (propertySubFilter === 'expiring') return !expiryInfo.isExpired && expiryInfo.daysRemaining <= 5;
                if (propertySubFilter === 'archived') return expiryInfo.isExpired || p.status === 'sold';
                if (propertySubFilter === 'pending') return (!p.approved && p.status !== 'approved' && p.status !== 'rejected');
                return true;
              })
              .slice(0, 150)
              .map((p) => {
                const expiryInfo = getPropertyExpiryInfo(p);
                const sellerPhoneFormatted = p.sellerPhone || 'ChÆ°a cÃ³ sá»‘ liÃªn há»‡';
                const sellerNameFormatted = p.sellerName || 'ChÃ­nh Chá»§ / ChuyÃªn ViÃªn BÄS';
                const isApproved = p.status === 'approved' || p.approved || p.approvalStatus === 'approved';
                const isRejected = p.status === 'rejected' || p.approvalStatus === 'rejected';
                const isExpanded = adminViewMode === 'detailed' || Boolean(expandedAdminPropIds[p.id]);

                return (
                  <div
                    key={`mob-${p.id}`}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 shadow-xs transition hover:border-emerald-500/40"
                  >
                    {/* Compact Top Row: Thumbnail + Core Specs + Price */}
                    <div
                      onClick={() => toggleExpandAdminProp(p.id)}
                      className="flex items-start gap-2.5 cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <img loading="lazy"
                          src={p.images[0] || ''}
                          alt={p.title}
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                        />
                        <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-slate-950/80 text-white text-[8px] font-bold rounded">
                          {p.images?.length || 1}ðŸ“·
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-[11px] text-slate-900 dark:text-white truncate">
                            {p.title}
                          </span>
                          <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 shrink-0 font-mono">
                            {p.priceDisplay}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                            ðŸ“ {p.project}
                          </span>
                          <span>â€¢</span>
                          <span className="font-mono">ðŸ“ {p.area}mÂ²</span>
                          {p.bedrooms && (
                            <>
                              <span>â€¢</span>
                              <span>ðŸ›ï¸ {p.bedrooms}PN</span>
                            </>
                          )}
                          <span>â€¢</span>
                          <span>{p.type === 'sale' ? 'ðŸ  BÃ¡n' : 'ðŸ”‘ ThuÃª'}</span>
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-1 text-[10px]">
                          <span className="text-slate-600 dark:text-slate-300 truncate font-semibold">
                            ðŸ‘¤ {sellerNameFormatted}
                          </span>
                          <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {isApproved ? 'ðŸŸ¢ ÄÃ£ duyá»‡t' : isRejected ? 'ðŸ”´ Tá»« chá»‘i' : 'ðŸŸ¡ Chá» duyá»‡t'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Mobile Action Bar */}
                    <div className="flex items-center justify-between gap-1 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePushPropertyNow(p)}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[9px] flex items-center gap-0.5 cursor-pointer shadow-xs"
                          title="Äáº©y tin lÃªn Ä‘áº§u (+20 ngÃ y)"
                        >
                          <Zap className="w-2.5 h-2.5 fill-slate-950" />
                          <span>Äáº©y Tin</span>
                        </button>
                        <a
                          href={`tel:${sellerPhoneFormatted.replace(/\D/g, '')}`}
                          className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg text-[9px] flex items-center gap-0.5"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>Gá»i Äiá»‡n</span>
                        </a>
                        <a
                          href={`https://zalo.me/${sellerPhoneFormatted.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold rounded-lg text-[9px] flex items-center gap-0.5"
                        >
                          <span>Nháº¯n Zalo</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isApproved && (
                          <button
                            onClick={() => onApproveProperty(p.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-[9px] flex items-center gap-0.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-2.5 h-2.5" /> Duyá»‡t
                          </button>
                        )}
                        {!isRejected && (
                          <button
                            onClick={() => handleRejectProperty(p)}
                            className="px-1.5 py-1 bg-rose-600 text-white font-bold rounded-lg text-[9px] cursor-pointer"
                          >
                            âœ•
                          </button>
                        )}
                        <button
                          onClick={() => setEditingProperty(p)}
                          className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => toggleExpandAdminProp(p.id)}
                          className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details for Mobile */}
                    {isExpanded && (
                      <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[10px] animate-in fade-in duration-150">
                        {p.images && p.images.length > 0 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            {p.images.map((imgUrl, idx) => (
                              <img loading="lazy"
                                key={idx}
                                src={imgUrl}
                                alt="CÄƒn há»™"
                                className="w-20 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-1.5 text-[9px] bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>ðŸ“ Vá»‹ trÃ­: <strong>{p.address || p.location || p.project}</strong></div>
                          <div>ðŸ§­ HÆ°á»›ng: <strong>{p.direction || 'ÄÃ´ng Nam'}</strong></div>
                          <div>ðŸ“œ PhÃ¡p lÃ½: <strong>{p.legalStatus || 'Sá»• Ä‘á»'}</strong></div>
                          <div>ðŸ›‹ï¸ Ná»™i tháº¥t: <strong>{p.furniture || 'Äáº§y Ä‘á»§'}</strong></div>
                        </div>
                        {p.description && (
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl">
                            {p.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <button
                            onClick={() => setSelectedSellerDetail(p)}
                            className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-[9px] flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Xem ThÃ´ng Tin LiÃªn Há»‡
                          </button>
                          <button
                            onClick={() => onDeleteProperty(p.id)}
                            className="px-2 py-1 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold rounded-lg text-[9px] flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> XÃ³a
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Properties Desktop Full Data Table (>= md) */}
          <div className="hidden md:block overflow-x-auto max-h-[680px] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 shadow-xs">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5 w-14">áº¢nh</th>
                  <th className="p-2.5 min-w-[220px]">Báº¥t Äá»™ng Sáº£n & Dá»± Ãn</th>
                  <th className="p-2.5 min-w-[140px]">NgÆ°á»i ÄÄƒng</th>
                  <th className="p-2.5 w-28">GiÃ¡ & Loáº¡i</th>
                  <th className="p-2.5 w-28">Tráº¡ng ThÃ¡i</th>
                  <th className="p-2.5 w-28">Thá»i Háº¡n</th>
                  <th className="p-2.5 text-center min-w-[260px]">Thao TÃ¡c</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {properties
                  .filter((p) => {
                    const expiryInfo = getPropertyExpiryInfo(p);
                    if (propertySubFilter === 'sale') return p.type === 'sale' || (p as any).category === 'ban';
                    if (propertySubFilter === 'rent') return p.type === 'rent' || (p as any).category === 'cho-thue';
                    if (propertySubFilter === 'pushed') return !!p.pushedAt;
                    if (propertySubFilter === 'expiring') return !expiryInfo.isExpired && expiryInfo.daysRemaining <= 5;
                    if (propertySubFilter === 'archived') return expiryInfo.isExpired || p.status === 'sold';
                    if (propertySubFilter === 'pending') return (!p.approved && p.status !== 'approved' && p.status !== 'rejected');
                    return true;
                  })
                  .slice(0, 150)
                  .map((p) => {
                    const expiryInfo = getPropertyExpiryInfo(p);
                    const sellerPhoneFormatted = p.sellerPhone || 'ChÆ°a cáº­p nháº­t SÄT';
                    const sellerNameFormatted = p.sellerName || 'Chá»§ Há»™ / Sale BÄS';
                    const isApproved = p.status === 'approved' || p.approved || p.approvalStatus === 'approved';
                    const isRejected = p.status === 'rejected' || p.approvalStatus === 'rejected';
                    const isExpanded = adminViewMode === 'detailed' || Boolean(expandedAdminPropIds[p.id]);

                    return (
                      <React.Fragment key={p.id}>
                        <tr className="hover:bg-slate-50/90 dark:hover:bg-slate-900/60 transition text-xs">
                          {/* 1. Thumbnail */}
                          <td className="p-2">
                            <div 
                              onClick={() => toggleExpandAdminProp(p.id)}
                              className="relative cursor-pointer group"
                              title="Báº¥m Ä‘á»ƒ xem album áº£nh"
                            >
                              <img loading="lazy"
                                src={p.images[0] || ''}
                                alt={p.title}
                                className="w-12 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:opacity-85 transition"
                              />
                              <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-slate-950/80 text-white text-[7px] font-bold rounded">
                                {p.images?.length || 1}ðŸ“·
                              </span>
                            </div>
                          </td>

                          {/* 2. Title & Specs */}
                          <td className="p-2 max-w-xs">
                            <button
                              onClick={() => toggleExpandAdminProp(p.id)}
                              className="font-bold text-slate-900 dark:text-white line-clamp-1 text-left hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-xs"
                              title={p.title}
                            >
                              {p.title}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                                ðŸ“ {p.project}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">â€¢</span>
                              <span className="text-[9px] text-slate-500 font-medium font-mono">ðŸ“ {p.area} mÂ²</span>
                              {p.bedrooms && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-600">â€¢</span>
                                  <span className="text-[9px] text-slate-500 font-medium">ðŸ›ï¸ {p.bedrooms}PN</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* 3. Poster Info */}
                          <td className="p-2">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="flex items-center gap-1">
                                {p.sellerRole === 'owner' ? (
                                  <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold rounded text-[9px]">
                                    ðŸ  Chá»§ NhÃ 
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-teal-500/15 text-teal-700 dark:text-teal-400 font-bold rounded text-[9px]">
                                    ðŸ’¼ MÃ´i Giá»›i
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] truncate max-w-[130px]" title={sellerNameFormatted}>
                                {sellerNameFormatted}
                              </span>
                              <a
                                href={`https://zalo.me/${sellerPhoneFormatted.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                              >
                                ðŸ“ž {sellerPhoneFormatted}
                              </a>
                            </div>
                          </td>

                          {/* 4. Price & Type */}
                          <td className="p-2">
                            <span className="font-black text-emerald-600 dark:text-emerald-400 block text-xs font-mono">
                              ðŸ’° {p.priceDisplay}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold inline-block mt-0.5 ${
                              p.type === 'sale' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300'
                            }`}>
                              {p.type === 'sale' ? 'ðŸ  BÃN' : 'ðŸ”‘ CHO THUÃŠ'}
                            </span>
                          </td>

                          {/* 5. Status Badge */}
                          <td className="p-2">
                            <div className="space-y-1">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30'
                                  : isRejected
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-500/30'
                              }`}>
                                {isApproved && 'ðŸŸ¢ Äang hiá»‡n'}
                                {isRejected && 'ðŸ”´ Tá»« chá»‘i'}
                                {!isApproved && !isRejected && 'ðŸŸ¡ Chá» duyá»‡t'}
                              </span>
                              {p.rejectionReason && (
                                <div className="text-[9px] text-rose-600 dark:text-rose-400 font-medium line-clamp-1 max-w-[110px]" title={p.rejectionReason}>
                                  {p.rejectionReason}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 6. Expiry / Archive Info */}
                          <td className="p-2">
                            <div className="space-y-0.5 text-[10px]">
                              <div className="text-slate-500 dark:text-slate-400 text-[9px]">
                                ÄÄƒng: <span className="font-semibold text-slate-700 dark:text-slate-300">{expiryInfo.postDateFormatted}</span>
                              </div>

                              {expiryInfo.isExpired ? (
                                <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950/70 border border-purple-300 dark:border-purple-800 rounded text-purple-900 dark:text-purple-300 text-[9px] font-bold block">
                                  ðŸ“ LÆ°u trá»¯: {expiryInfo.archiveDaysLeft}d
                                </span>
                              ) : expiryInfo.daysRemaining <= 5 ? (
                                <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 rounded text-amber-900 dark:text-amber-300 text-[9px] font-bold block">
                                  â° CÃ²n {expiryInfo.daysRemaining} ngÃ y
                                </span>
                              ) : (
                                <span className="text-emerald-700 dark:text-emerald-400 text-[9px] font-bold block">
                                  âš¡ CÃ²n <b>{expiryInfo.daysRemaining} ngÃ y</b>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 7. Action Icons Bar - Clean & Standardized */}
                          <td className="p-2 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                              {/* Up Tin Button */}
                              <button
                                type="button"
                                onClick={() => handlePushPropertyNow(p)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-slate-950 transition cursor-pointer"
                                title="Äáº©y tin lÃªn Ä‘áº§u & gia háº¡n (+20 ngÃ y)"
                              >
                                <Zap className="w-3.5 h-3.5 fill-current" />
                              </button>

                              {/* View Details Modal Button */}
                              <button
                                type="button"
                                onClick={() => setSelectedSellerDetail(p)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/15 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white transition cursor-pointer"
                                title="Xem chi tiáº¿t cÄƒn & SÄT chÃ­nh chá»§"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Property */}
                              <button
                                type="button"
                                onClick={() => setEditingProperty(p)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-700/70 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                title="Chá»‰nh sá»­a ná»™i dung & che má» áº£nh"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Share Button */}
                              <button
                                type="button"
                                onClick={() => setSharingProperty(p)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500/15 hover:bg-sky-500 text-sky-600 dark:text-sky-400 hover:text-white transition cursor-pointer"
                                title="Chia sáº» tin lÃªn Zalo, Facebook"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Approval Status Toggle Buttons */}
                              {!isApproved ? (
                                <button
                                  type="button"
                                  onClick={() => onApproveProperty(p.id)}
                                  className="h-7 px-2 flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] transition shadow-xs cursor-pointer"
                                  title="PhÃª duyá»‡t tin Ä‘Äƒng"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Duyá»‡t</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRejectProperty(p)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white transition cursor-pointer"
                                  title="Tá»« chá»‘i / Gá»¡ tin"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Pending button if approved or rejected */}
                              {(isApproved || isRejected) && (
                                <button
                                  type="button"
                                  onClick={() => handleUnapproveProperty(p)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-slate-950 transition cursor-pointer"
                                  title="ÄÆ°a vá» tráº¡ng thÃ¡i Chá» Duyá»‡t"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Archive / Restore Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleArchiveProperty(p)}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg transition cursor-pointer ${
                                  expiryInfo.isExpired
                                    ? 'bg-emerald-500/15 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white'
                                    : 'bg-purple-500/15 hover:bg-purple-600 text-purple-600 dark:text-purple-400 hover:text-white'
                                }`}
                                title={expiryInfo.isExpired ? 'Phá»¥c há»“i hiá»ƒn thá»‹ tin' : 'Chuyá»ƒn vÃ o Kho LÆ°u Trá»¯'}
                              >
                                {expiryInfo.isExpired ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                              </button>

                              {/* Delete Property */}
                              <button
                                type="button"
                                onClick={() => onDeleteProperty(p.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white transition cursor-pointer"
                                title="XÃ³a vÄ©nh viá»…n"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Expand / Collapse Button */}
                              <button
                                type="button"
                                onClick={() => toggleExpandAdminProp(p.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                title={isExpanded ? 'Thu gá»n chi tiáº¿t' : 'Má»Ÿ rá»™ng album áº£nh & thÃ´ng sá»‘'}
                              >
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED ACCORDION ROW */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-700">
                            <td colSpan={7} className="p-3 sm:p-4">
                              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                                {/* Photo Gallery */}
                                {p.images && p.images.length > 0 && (
                                  <div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                                      ðŸ“· ToÃ n Bá»™ Album áº¢nh CÄƒn Há»™ / Biá»‡t Thá»± ({p.images.length} áº£nh):
                                    </span>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                      {p.images.map((imgUrl, imgIndex) => (
                                        <img loading="lazy"
                                          key={imgIndex}
                                          src={imgUrl}
                                          alt={`${p.title} - áº£nh ${imgIndex + 1}`}
                                          className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Technical Specs Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-400 block text-[10px]">Dá»± Ãn / Vá»‹ TrÃ­:</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                                      ðŸ“ {p.project} â€¢ {p.address || p.location || 'Vinhomes'}
                                    </span>
                                  </div>

                                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-400 block text-[10px]">CÆ¡ Cáº¥u / PhÃ²ng:</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                      ðŸ›ï¸ {p.bedrooms || 1} PN â€¢ ðŸš¿ {p.bathrooms || 1} WC â€¢ ðŸ“ {p.area} mÂ²
                                    </span>
                                  </div>

                                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-400 block text-[10px]">HÆ°á»›ng / Táº§ng:</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                      ðŸ§­ {p.direction || 'ÄÃ´ng Nam'} {p.floor ? `â€¢ Táº§ng ${p.floor}` : ''}
                                    </span>
                                  </div>

                                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-400 block text-[10px]">PhÃ¡p LÃ½ & Ná»™i Tháº¥t:</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                                      ðŸ“œ {p.legalStatus || 'Sá»• Ä‘á» lÃ¢u dÃ i'} â€¢ {p.furniture || 'Äáº§y Ä‘á»§'}
                                    </span>
                                  </div>
                                </div>

                                {/* Full Description */}
                                {p.description && (
                                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                      ðŸ“ Ná»™i Dung BÃ i ÄÄƒng Äáº§y Äá»§:
                                    </span>
                                    <p className="text-slate-700 dark:text-slate-300 text-xs whitespace-pre-line leading-relaxed">
                                      {p.description}
                                    </p>
                                  </div>
                                )}

                                {/* Direct Actions bar inside accordion */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <span>ðŸ‘¤ NgÆ°á»i Ä‘Äƒng: <strong>{sellerNameFormatted}</strong></span>
                                    <span>â€¢</span>
                                    <a
                                      href={`tel:${sellerPhoneFormatted}`}
                                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                    >
                                      ðŸ“ž {sellerPhoneFormatted}
                                    </a>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setSelectedSellerDetail(p)}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Xem SÄT Gá»‘c & CÄƒn Há»™</span>
                                    </button>

                                    <button
                                      onClick={() => setEditingProperty(p)}
                                      className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center gap-1"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Sá»­a Ná»™i Dung & áº¢nh</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Projects Management */}
      {activeTab === 'projects' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                QUáº¢N LÃ Dá»° ÃN VINHOMES & SÆ  Äá»’ QUY HOáº CH ({projects.length} Dá»° ÃN)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chá»‰nh sá»­a thÃ´ng tin thÆ°Æ¡ng máº¡i, hÃ¬nh áº£nh banner chÃ­nh, sÆ¡ Ä‘á»“ quy hoáº¡ch masterplan hoáº·c thÃªm dá»± Ã¡n / tÃ²a nhÃ  má»›i vÃ o há»‡ thá»‘ng.
              </p>
            </div>
            <button
              onClick={() => setIsAddingProject(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> + ThÃªm Dá»± Ãn / TÃ²a NhÃ  Má»›i
            </button>
          </div>

          {/* ===== SUB-MENU: Filter bar for projects ===== */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="TÃ¬m dá»± Ã¡n, tÃ²a nhÃ ..."
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
            {/* Project tree view (parent/child hierarchy) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProjectCategoryFilter('all')}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none min-w-[140px] flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{projectCategoryFilter === 'all' ? 'Táº¥t cáº£ dá»± Ã¡n' : (projects.find(p => p.id === projectCategoryFilter)?.name || projectCategoryFilter)}</span>
                <ChevronDown className="w-3 h-3 ml-auto" />
              </button>
              {/* Tree dropdown */}
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-80 overflow-y-auto">
                <div className="p-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  CÃ¢y dá»± Ã¡n
                </div>
                {parentProjects.map((p) => {
                  const isExpanded = expandedProjectTree.has(p.id);
                  const children = childProjects(p.id);
                  const isSelected = projectCategoryFilter === p.id;
                  return (
                    <div key={p.id}>
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg mx-1 ${
                          isSelected ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                        }`}
                        onClick={() => {
                          setProjectCategoryFilter(p.id);
                          if (children.length > 0) toggleProjectTree(p.id);
                        }}
                      >
                        {children.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleProjectTree(p.id); }}
                            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                          >
                            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate">{p.name.split(' - ')[0]}</span>
                      </div>
                      {isExpanded && children.length > 0 && (
                        <div className="ml-4 border-l border-slate-200 dark:border-slate-700">
                          {children.map((child) => {
                            const childSelected = projectCategoryFilter === child.id;
                            return (
                              <div
                                key={child.id}
                                className={`px-2.5 py-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg mx-1 truncate ${
                                  childSelected ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold' : 'text-slate-600 dark:text-slate-300'
                                }`}
                                onClick={() => setProjectCategoryFilter(child.id)}
                              >
                                <span className="text-xs">{child.name.split(' - ')[0]}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Standalone projects (no parent) */}
                {projects.filter(p => !p.parentId && !parentProjects.includes(p)).map((p) => (
                  <div
                    key={p.id}
                    className={`px-2.5 py-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg mx-1 truncate ${
                      projectCategoryFilter === p.id ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                    }`}
                    onClick={() => setProjectCategoryFilter(p.id)}
                  >
                    <span className="text-xs">{p.name.split(' - ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Status filter */}
            <select
              value={projectStatusFilter}
              onChange={(e) => setProjectStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none min-w-[130px]"
            >
              <option value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
              <option value="Dang mo ban">Äang má»Ÿ bÃ¡n</option>
              <option value="Hoan thanh">HoÃ n thiá»‡n</option>
              <option value="Dang xay dung">Äang xÃ¢y dá»±ng</option>
              <option value="Sap mo ban">Sáº¯p má»Ÿ bÃ¡n</option>
            </select>
            {/* Clear filters */}
            {(projectSearchQuery || projectCategoryFilter !== 'all' || projectStatusFilter !== 'all') && (
              <button
                onClick={() => { setProjectSearchQuery(''); setProjectCategoryFilter('all'); setProjectStatusFilter('all'); }}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                title="XÃ³a bá»™ lá»c"
              >
                <X className="w-3.5 h-3.5" /> XÃ³a
              </button>
            )}
          </div>
          <div className="space-y-3">
            {projects.map((proj) => {
              const isExpanded = expandedProjectTree.has(proj.id);
              const subs = proj.subdivisions || [];
              const amens = proj.amenities || [];
              return (
                <div key={proj.id} className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* DÃ²ng dá»± Ã¡n */}
                  <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => toggleProjectTree(proj.id)}
                      className="p-1 text-slate-600 dark:text-slate-400 hover:text-amber-600 transition"
                      title={isExpanded ? 'Thu gá»n' : 'Má»Ÿ rá»™ng'}
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    <img src={proj.image} alt={proj.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {proj.title || proj.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {proj.location} Â· {subs.length} phÃ¢n khu Â· {amens.length} tiá»‡n Ã­ch
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => { setAddingSubdivisionTo(proj.id); setNewSubdivisionName(''); }}
                        className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                        title="ThÃªm phÃ¢n khu"
                      >
                        <Plus className="w-3 h-3" /> PhÃ¢n khu
                      </button>
                      <button
                        onClick={() => { setAddingAmenityTo(proj.id); setNewAmenityName(''); }}
                        className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                        title="ThÃªm tiá»‡n Ã­ch"
                      >
                        <Plus className="w-3 h-3" /> Tiá»‡n Ã­ch
                      </button>
                      <button
                        onClick={() => setEditingProject(proj)}
                        className="px-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[10px] flex items-center gap-1"
                        title="Sá»­a dá»± Ã¡n"
                      >
                        <Edit3 className="w-3 h-3" /> Sá»­a
                      </button>
                      {onDeleteProject && (
                        <button
                          onClick={() => onDeleteProject(proj.id)}
                          className="px-2 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                          title="XÃ³a dá»± Ã¡n"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ná»™i dung má»Ÿ rá»™ng: phÃ¢n khu + tiá»‡n Ã­ch */}
                  {isExpanded && (
                    <div className="p-3 space-y-3">
                      {/* Form thÃªm phÃ¢n khu */}
                      {addingSubdivisionTo === proj.id && (
                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-2 border border-emerald-200 dark:border-emerald-800">
                          <input
                            autoFocus
                            value={newSubdivisionName}
                            onChange={(e) => setNewSubdivisionName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubdivision(proj.id); }}
                            placeholder="TÃªn phÃ¢n khu má»›i..."
                            className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white"
                          />
                          <button onClick={() => handleAddSubdivision(proj.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs">ThÃªm</button>
                          <button onClick={() => setAddingSubdivisionTo(null)} className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs">Há»§y</button>
                        </div>
                      )}

                      {/* Form thÃªm tiá»‡n Ã­ch */}
                      {addingAmenityTo === proj.id && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl p-2 border border-blue-200 dark:border-blue-800">
                          <input
                            autoFocus
                            value={newAmenityName}
                            onChange={(e) => setNewAmenityName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddAmenity(proj.id); }}
                            placeholder="TÃªn tiá»‡n Ã­ch má»›i..."
                            className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white"
                          />
                          <button onClick={() => handleAddAmenity(proj.id)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs">ThÃªm</button>
                          <button onClick={() => setAddingAmenityTo(null)} className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs">Há»§y</button>
                        </div>
                      )}

                      {/* PhÃ¢n khu */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          ðŸ˜ï¸ PhÃ¢n Khu ({subs.length})
                        </div>
                        {subs.length === 0 && (
                          <div className="text-xs text-slate-400 italic px-2">ChÆ°a cÃ³ phÃ¢n khu. Nháº¥n "+ PhÃ¢n khu" Ä‘á»ƒ thÃªm.</div>
                        )}
                        {subs.map((sub: any) => {
                          const subExpanded = expandedSubdivisionTree.has(sub.id);
                          const streets = sub.streets || [];
                          return (
                            <div key={sub.id} className="ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-3 space-y-1.5">
                              {/* DÃ²ng phÃ¢n khu */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSubdivisionTree(sub.id)}
                                  className="p-0.5 text-slate-500 hover:text-amber-600 transition"
                                  title={subExpanded ? 'Thu gá»n' : 'Má»Ÿ rá»™ng'}
                                >
                                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${subExpanded ? 'rotate-90' : ''}`} />
                                </button>
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex-1">
                                  {sub.name}
                                </span>
                                <button
                                  onClick={() => { setAddingStreetTo(sub.id); setNewStreetName(''); }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                                  title="ThÃªm dÃ£y phá»‘"
                                >
                                  <Plus className="w-3 h-3" /> DÃ£y phá»‘
                                </button>
                                <button
                                  onClick={() => handleDeleteSubdivision(proj.id, sub.id)}
                                  className="px-1.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px]"
                                  title="XÃ³a phÃ¢n khu"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Form thÃªm dÃ£y phá»‘ */}
                              {addingStreetTo === sub.id && (
                                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg p-1.5 border border-emerald-200 dark:border-emerald-800 ml-5">
                                  <input
                                    autoFocus
                                    value={newStreetName}
                                    onChange={(e) => setNewStreetName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddStreet(proj.id, sub.id); }}
                                    placeholder="TÃªn dÃ£y phá»‘..."
                                    className="flex-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white"
                                  />
                                  <button onClick={() => handleAddStreet(proj.id, sub.id)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs">ThÃªm</button>
                                  <button onClick={() => setAddingStreetTo(null)} className="px-1.5 py-1 text-slate-500 hover:text-slate-700 text-xs">Há»§y</button>
                                </div>
                              )}

                              {/* DÃ£y phá»‘ */}
                              {subExpanded && (
                                <div className="ml-5 space-y-1">
                                  {streets.length === 0 && (
                                    <div className="text-[11px] text-slate-400 italic">ChÆ°a cÃ³ dÃ£y phá»‘.</div>
                                  )}
                                  {streets.map((street: string, si: number) => (
                                    <div key={si} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                      <span className="text-xs text-slate-700 dark:text-slate-300 flex-1">{street}</span>
                                      <button
                                        onClick={() => handleDeleteStreet(proj.id, sub.id, street)}
                                        className="px-1 py-0.5 text-rose-500 hover:text-rose-700 text-[10px]"
                                        title="XÃ³a dÃ£y phá»‘"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Tiá»‡n Ã­ch */}
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          ðŸŠ Tiá»‡n Ãch ({amens.length})
                        </div>
                        {amens.length === 0 && (
                          <div className="text-xs text-slate-400 italic px-2">ChÆ°a cÃ³ tiá»‡n Ã­ch. Nháº¥n "+ Tiá»‡n Ã­ch" Ä‘á»ƒ thÃªm.</div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {amens.map((amenity: string, ai: number) => (
                            <span key={ai} className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg px-2 py-1 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                              {amenity}
                              <button
                                onClick={() => handleDeleteAmenity(proj.id, amenity)}
                                className="text-rose-500 hover:text-rose-700"
                                title="XÃ³a tiá»‡n Ã­ch"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: News Articles Management */}
      {activeTab === 'news' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                QUáº¢N LÃ BÃ€I VIáº¾T & TIN Tá»¨C BÄS CHUáº¨N SEO ({news.length} BÃ€I)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Soáº¡n bÃ i viáº¿t tin tá»©c, cáº­p nháº­t thÃ´ng tin dá»± Ã¡n, chá»‰nh sá»­a ná»™i dung vÃ  thay Ä‘á»•i hÃ¬nh áº£nh Ä‘áº¡i diá»‡n.
              </p>
            </div>
            <button
              onClick={() => setIsAddingNews(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> ThÃªm BÃ i Viáº¿t Má»›i
            </button>
          </div>

          {/* Responsive card grid â€” gá»n gÃ ng trÃªn di Ä‘á»™ng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                {/* áº¢nh bÃ¬a */}
                <div className="relative h-32 bg-slate-950">
                  <img loading="lazy" src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 text-emerald-400 font-black text-[10px] rounded-full backdrop-blur-sm uppercase">
                    {item.category}
                  </span>
                  {item.status === 'published' ? (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600/90 text-white font-black text-[10px] rounded-full">
                      ðŸŸ¢ ÄÃ£ Äá»“ng Bá»™
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/90 text-slate-950 font-black text-[10px] rounded-full">
                      ðŸŸ¡ Chá» Duyá»‡t
                    </span>
                  )}
                </div>

                {/* Ná»™i dung bÃ i viáº¿t */}
                <div className="p-4 space-y-2.5 flex flex-col flex-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.summary}
                  </p>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="font-bold text-slate-700 dark:text-slate-200 truncate">{item.author}</div>
                    <div className="text-[10px] text-slate-400">{item.publishedAt}</div>
                  </div>

                  {/* Thao tÃ¡c */}
                  <div className="flex items-center gap-2 pt-1 mt-auto">
                    {item.status === 'published' ? (
                      <button
                        onClick={() => onUpdateNews && onUpdateNews({ ...item, status: 'draft' })}
                        className="flex-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-bold rounded-lg transition text-[11px]"
                        title="Chuyá»ƒn bÃ i nÃ y vá» tráº¡ng thÃ¡i Chá» Duyá»‡t"
                      >
                        ðŸŸ¡ Tráº£ Chá» Duyá»‡t
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateNews && onUpdateNews({ ...item, status: 'published' })}
                        className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg transition shadow text-[11px]"
                        title="PhÃª duyá»‡t bÃ i viáº¿t vÃ  xuáº¥t báº£n lÃªn Web Public"
                      >
                        ðŸŸ¢ Duyá»‡t & ÄÄƒng Public
                      </button>
                    )}

                    <button
                      onClick={() => setEditingNews(item)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                      title="Sá»­a bÃ i & Thay áº£nh"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Sá»­a
                    </button>
                    {onDeleteNews && (
                      <button
                        onClick={() => onDeleteNews(item.id)}
                        className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                        title="XÃ³a bÃ i viáº¿t"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: FAQ / Q&A Management */}
      {activeTab === 'faq' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                QUáº¢N LÃ CÃ‚U Há»ŽI Q&A / FAQ ({adminFaq.length} CÃ‚U Há»ŽI)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ThÃªm, sá»­a, xÃ³a cÃ¢u há»i & tráº£ lá»i hiá»ƒn thá»‹ trÃªn trang chi tiáº¿t dá»± Ã¡n (tá»‘i Æ°u SEO).
              </p>
            </div>
            <button
              onClick={() => setIsAddingFaq(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> + ThÃªm CÃ¢u Há»i Q&A
            </button>
          </div>

          {/* Responsive card grid â€” gá»n gÃ ng trÃªn di Ä‘á»™ng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminFaq.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="p-4 space-y-2.5 flex flex-col flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold rounded-md text-[10px] uppercase">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-md text-[10px]">
                      {item.projectId === 'all' ? 'Táº¥t cáº£ dá»± Ã¡n' : item.projectId}
                    </span>
                  </div>

                  {/* Question */}
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                    â“ {item.question}
                  </h4>

                  {/* Answer */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3">
                    {item.answer}
                  </p>

                  {/* Keywords */}
                  {item.keywords && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.keywords.slice(0, 3).map((k: string, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-[9px] rounded">
                          #{k}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 pt-1">
                    Cáº­p nháº­t: {item.updatedAt}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 mt-auto">
                    <button
                      onClick={() => setEditingFaq(item)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-1 text-[11px]"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Sá»­a
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm('XÃ³a cÃ¢u há»i Q&A nÃ y?')) return;
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`/api/faq/${item.id}`, {
                            method: 'DELETE',
                            headers: token ? { Authorization: `Bearer ${token}` } : {}
                          });
                          if (res.ok) {
                            setAdminFaq(prev => prev.filter(f => f.id !== item.id));
                          }
                        } catch (err) {
                          console.error('Error deleting FAQ:', err);
                        }
                      }}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition flex items-center justify-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> XÃ³a
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {adminFaq.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              ChÆ°a cÃ³ cÃ¢u há»i Q&A nÃ o. Nháº¥n "ThÃªm CÃ¢u Há»i Q&A" Ä‘á»ƒ báº¯t Ä‘áº§u.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pricing Setup Form */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSavePricing} className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              âš™ï¸ Cáº¤U HÃŒNH Báº¬T/Táº®T THANH TOÃN & Báº¢NG GIÃ UP TIN / VIETQR DONATE
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Admin thiáº¿t láº­p Báº­t/Táº¯t cháº¿ Ä‘á»™ thu phÃ­. Khi Táº¯t thanh toÃ¡n, há»‡ thá»‘ng chuyá»ƒn sang cháº¿ Ä‘á»™ <strong>Donate Miá»…n PhÃ­ tÃ¹y tÃ¢m</strong> cho khÃ¡ch hÃ ng.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-4 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl border border-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ÄÃ£ lÆ°u thay Ä‘á»•i cáº¥u hÃ¬nh Thanh toÃ¡n & VietQR Donate thÃ nh cÃ´ng!
            </div>
          )}

          {/* ADMIN TOGGLE: PAYMENT VS DONATE MODE */}
          <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-sky-500/15 p-5 rounded-2xl border-2 border-amber-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  CÃ€I Äáº¶T Cá»”NG CÆ  CHáº¾ Báº¬T / Táº®T THANH TOÃN
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  Cháº¿ Äá»™ Hiá»‡n Táº¡i: {localConfig.paymentEnabled !== false ? 'ðŸ’³ Báº¬T THU PHÃ THEO Báº¢NG GIÃ' : 'ðŸŽ Táº®T THU PHÃ â€” CHUYá»‚N SANG DONATE TÃ™Y TÃ‚M (MIá»„N PHÃ)'}
                </h4>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setLocalConfig({ ...localConfig, paymentEnabled: true, donateModeEnabled: false })}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                    localConfig.paymentEnabled !== false
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ðŸ’³ Báº­t Thanh ToÃ¡n
                </button>
                <button
                  type="button"
                  onClick={() => setLocalConfig({ ...localConfig, paymentEnabled: false, donateModeEnabled: true })}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                    localConfig.paymentEnabled === false
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-500 hover:text-amber-500'
                  }`}
                >
                  ðŸŽ Táº¯t Thanh ToÃ¡n (Báº­t Donate)
                </button>
              </div>
            </div>

            {localConfig.paymentEnabled === false && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-500/30 space-y-3">
                <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                  Lá»i nháº¯n Donate hiá»ƒn thá»‹ khi khÃ¡ch báº¥m Up-Tin / Náº¡p PhÃ­:
                </label>
                <textarea
                  rows={2}
                  value={localConfig.donateMessage || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, donateMessage: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-slate-100"
                  placeholder="Nháº­p thÃ´ng Ä‘iá»‡p Donate tÃ¹y tÃ¢m..."
                />
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  âš¡ Khi Táº¯t Thanh ToÃ¡n, ngÆ°á»i dÃ¹ng báº¥m "Up Tin" hoáº·c "Náº¡p tiá»n" sáº½ Ä‘Æ°á»£c Up-Tin thÃ nh cÃ´ng ngay láº­p tá»©c MIá»„N PHÃ, Ä‘á»“ng thá»i hiá»ƒn thá»‹ tÃ¹y chá»n Donate chuyá»ƒn khoáº£n tÃ¹y tÃ¢m.
                </p>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              1. Báº£ng GiÃ¡ GÃ³i Dá»‹ch Vá»¥ Up Tin Khi Báº­t Thu PhÃ­ (VNÄ)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  GiÃ¡ Up Tin 1 LÆ°á»£t (VNÄ):
                </label>
                <input
                  type="number"
                  value={localConfig.singlePushPrice}
                  onChange={(e) => setLocalConfig({ ...localConfig, singlePushPrice: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  GÃ³i Auto-Push 5 LÆ°á»£t (VNÄ):
                </label>
                <input
                  type="number"
                  value={localConfig.autoPush5Price}
                  onChange={(e) => setLocalConfig({ ...localConfig, autoPush5Price: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  VIP Báº¡c (VNÄ / NgÃ y):
                </label>
                <input
                  type="number"
                  value={localConfig.vipSilverPriceDay}
                  onChange={(e) => setLocalConfig({ ...localConfig, vipSilverPriceDay: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  VIP VÃ ng (VNÄ / NgÃ y):
                </label>
                <input
                  type="number"
                  value={localConfig.vipGoldPriceDay}
                  onChange={(e) => setLocalConfig({ ...localConfig, vipGoldPriceDay: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  VIP Kim CÆ°Æ¡ng (VNÄ / NgÃ y):
                </label>
                <input
                  type="number"
                  value={localConfig.vipDiamondPriceDay}
                  onChange={(e) => setLocalConfig({ ...localConfig, vipDiamondPriceDay: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              2. ThÃ´ng Tin TÃ i Khoáº£n Nháº­n Chuyá»ƒn Khoáº£n VietQR / Donate
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  TÃªn NgÃ¢n HÃ ng:
                </label>
                <input
                  type="text"
                  value={localConfig.bankName}
                  onChange={(e) => setLocalConfig({ ...localConfig, bankName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white"
                  placeholder="Vietcombank / MB Bank / Techcombank"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Sá»‘ TÃ i Khoáº£n:
                </label>
                <input
                  type="text"
                  value={localConfig.accountNumber}
                  onChange={(e) => setLocalConfig({ ...localConfig, accountNumber: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  TÃªn Chá»§ TÃ i Khoáº£n:
                </label>
                <input
                  type="text"
                  value={localConfig.accountHolder}
                  onChange={(e) => setLocalConfig({ ...localConfig, accountHolder: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-bold uppercase text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition transform active:scale-95"
            >
              LÆ°u Cáº¥u HÃ¬nh GiÃ¡ & NgÃ¢n HÃ ng
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Leads */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                DANH SÃCH YÃŠU Cáº¦U Äáº¶T Lá»ŠCH XEM NHÃ€ & TÆ¯ Váº¤N (QUáº¢N TRá»Š LEADS CHá»¦ NHÃ€ & ADMIN)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Táº¥t cáº£ lÆ°á»£t Ä‘áº·t lá»‹ch xem nhÃ  cá»§a khÃ¡ch hÃ ng (gá»­i tá»›i ngÆ°á»i Ä‘Äƒng tin/chá»§ nhÃ  & há»‡ thá»‘ng) Ä‘Æ°á»£c tá»•ng há»£p chi tiáº¿t vÃ  cÃ³ thá»ƒ xuáº¥t ra file Excel/CSV.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExportLeadsCSV(filteredContacts)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl flex items-center gap-2 transition text-xs shadow-md"
              >
                <Download className="w-4 h-4" />
                Xuáº¥t File Excel / CSV ({filteredContacts.length})
              </button>
              <button
                onClick={onRefreshData}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center gap-1.5 transition text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                LÃ m Má»›i Dá»¯ Liá»‡u
              </button>
            </div>
          </div>

          {/* Metrics Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Tá»”NG YÃŠU Cáº¦U</span>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{localContacts.length}</div>
            </div>
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">YÃŠU Cáº¦U Má»šI (CHá»œ Gá»ŒI)</span>
              <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">
                {localContacts.filter(c => c.status === 'new' || !c.status).length}
              </div>
            </div>
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">Lá»ŠCH Háº¸N XEM NHÃ€</span>
              <div className="text-xl font-black text-sky-700 dark:text-sky-300 mt-1">
                {localContacts.filter(c => c.type === 'viewing').length}
              </div>
            </div>
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">ÄÃƒ LIÃŠN Há»† / Xá»¬ LÃ</span>
              <div className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">
                {localContacts.filter(c => c.status === 'done' || c.status === 'contacted').length}
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder="TÃ¬m tÃªn khÃ¡ch, SÄT, tÃªn cÄƒn, ngÆ°á»i Ä‘Äƒng tin..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
                <option value="new">ðŸ”´ YÃªu cáº§u má»›i</option>
                <option value="contacted">ðŸŸ¡ ÄÃ£ liÃªn há»‡</option>
                <option value="done">ðŸŸ¢ HoÃ n táº¥t</option>
              </select>

              <select
                value={leadTypeFilter}
                onChange={(e) => setLeadTypeFilter(e.target.value)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">Táº¥t cáº£ loáº¡i yÃªu cáº§u</option>
                <option value="viewing">ðŸ“… Äáº·t lá»‹ch xem nhÃ </option>
                <option value="consultation">ðŸ’¬ TÆ° váº¥n chung</option>
                <option value="deposit">ðŸ’° Cá»c giá»¯ chá»—</option>
              </select>
            </div>
          </div>

          {/* Table Display */}
          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">ChÆ°a cÃ³ dá»¯ liá»‡u Ä‘áº·t lá»‹ch xem nhÃ  nÃ o phÃ¹ há»£p vá»›i bá»™ lá»c.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile Compact & Expandable Leads List */}
              <div className="block md:hidden space-y-2.5">
                {filteredContacts.map((c, idx) => {
                  const isExpanded = expandedLeadId === c.id;
                  return (
                    <div
                      key={c.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40 transition hover:border-amber-500/40 cursor-pointer"
                      onClick={() => setExpandedLeadId(isExpanded ? null : c.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                            {c.fullName}
                          </span>
                          {c.type === 'viewing' && (
                            <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] rounded font-bold shrink-0">
                              Xem NhÃ 
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'done'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : c.status === 'contacted'
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {c.status === 'done' ? 'ðŸŸ¢ HoÃ n táº¥t' : c.status === 'contacted' ? 'ðŸŸ¡ ÄÃ£ liÃªn há»‡' : 'ðŸ”´ Má»›i'}
                          </span>
                          <span className={`text-[10px] transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            â–¼
                          </span>
                        </div>
                      </div>

                      {/* Summary line */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                        <span className="truncate max-w-[170px] text-slate-800 dark:text-slate-200 font-semibold">
                          ðŸ¢ {c.propertyTitle || c.projectInterest}
                        </span>
                        <a
                          href={`tel:${c.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                          ðŸ“ž {c.phone}
                        </a>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px]">NgÆ°á»i ÄÄƒng / Chá»§ NhÃ :</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {c.sellerName || 'Admin / Ban Quáº£n Trá»‹'}
                              </span>
                              {c.sellerPhone && (
                                <span className="block text-slate-500 font-mono text-[10px]">
                                  SÄT: {c.sellerPhone}
                                </span>
                              )}
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[10px]">Lá»‹ch Háº¹n Xem:</span>
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                {c.preferredTime || 'CÃ ng sá»›m cÃ ng tá»‘t'}
                              </span>
                            </div>
                          </div>

                          {c.note && (
                            <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-xl text-[11px] italic text-slate-600 dark:text-slate-300">
                              "{c.note}"
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <select
                                value={c.status || 'new'}
                                onChange={(e) => handleUpdateLeadStatus(c.id, e.target.value as any)}
                                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold"
                              >
                                <option value="new">ðŸ”´ YÃªu cáº§u má»›i</option>
                                <option value="contacted">ðŸŸ¡ ÄÃ£ liÃªn há»‡</option>
                                <option value="done">ðŸŸ¢ HoÃ n táº¥t</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${c.phone}`}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Gá»i</span>
                              </a>
                              <a
                                href={`https://zalo.me/${c.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-xs"
                              >
                                Zalo
                              </a>
                              <button
                                onClick={() => handleDeleteLead(c.id)}
                                className="p-1.5 bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300 rounded-xl"
                                title="XÃ³a"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">STT</th>
                      <th className="py-3 px-3">KhÃ¡ch HÃ ng Äáº·t Lá»‹ch</th>
                      <th className="py-3 px-3">CÄƒn BÄS Quan TÃ¢m</th>
                      <th className="py-3 px-3">NgÆ°á»i ÄÄƒng Tin (Chá»§ NhÃ  / Admin)</th>
                      <th className="py-3 px-3">Lá»‹ch Háº¹n & Ghi ChÃº</th>
                      <th className="py-3 px-3">Tráº¡ng ThÃ¡i</th>
                      <th className="py-3 px-3 text-right">Thao TÃ¡c</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800/40">
                    {filteredContacts.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition">
                        <td className="py-3.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                        
                        {/* Customer info */}
                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                            {c.fullName}
                            {c.type === 'viewing' && (
                              <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] rounded-md font-bold">
                                Xem NhÃ 
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <a href={`tel:${c.phone}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {c.phone}
                            </a>
                            <a
                              href={`https://zalo.me/${c.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 px-1.5 py-0.5 rounded font-semibold hover:underline"
                            >
                              Zalo
                            </a>
                          </div>
                          {c.email && <div className="text-[10px] text-slate-400 mt-0.5">{c.email}</div>}
                        </td>

                        {/* Property title */}
                        <td className="py-3.5 px-3 max-w-xs">
                          {c.propertyTitle ? (
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2">{c.propertyTitle}</p>
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{c.projectInterest}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">YÃªu cáº§u tÆ° váº¥n dá»± Ã¡n {c.projectInterest}</span>
                          )}
                        </td>

                        {/* Seller info */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{c.sellerName || 'NgÆ°á»i Ä‘Äƒng tin'}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            {c.sellerPhone ? (
                              <>
                                <span>SÄT: {c.sellerPhone}</span>
                                <a
                                  href={`https://zalo.me/${c.sellerPhone.replace(/\D/g, '')}?text=BÃ¡o%20lá»‹ch%20xem%20nhÃ %3A%20${encodeURIComponent(c.fullName)}%20(${c.phone})`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] text-blue-500 font-bold hover:underline"
                                >
                                  (BÃ¡o Chá»§)
                                </a>
                              </>
                            ) : (
                              <span className="italic text-slate-400">ChÆ°a cÃ³ SÄT</span>
                            )}
                          </div>
                        </td>

                        {/* Viewing time & Note */}
                        <td className="py-3.5 px-3 max-w-xs">
                          {c.preferredTime && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold text-[10px] rounded-lg mb-1 border border-amber-200 dark:border-amber-800">
                              <Clock className="w-3 h-3" />
                              {c.preferredTime}
                            </div>
                          )}
                          {c.note ? (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              "{c.note}"
                            </p>
                          ) : (
                            <span className="text-slate-400 text-[10px]">KhÃ´ng cÃ³ ghi chÃº</span>
                          )}
                          <div className="text-[9px] text-slate-400 mt-1">
                            {new Date(c.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3.5 px-3">
                          <select
                            value={c.status || 'new'}
                            onChange={(e) => handleUpdateLeadStatus(c.id, e.target.value as any)}
                            className={`p-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                              c.status === 'done'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                : c.status === 'contacted'
                                ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                                : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            }`}
                          >
                            <option value="new">ðŸ”´ YÃªu cáº§u má»›i</option>
                            <option value="contacted">ðŸŸ¡ ÄÃ£ liÃªn há»‡</option>
                            <option value="done">ðŸŸ¢ HoÃ n táº¥t</option>
                          </select>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <a
                              href={`tel:${c.phone}`}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                              title="Gá»i ngay cho khÃ¡ch"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteLead(c.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900 dark:text-rose-300 rounded-lg transition"
                              title="XÃ³a yÃªu cáº§u"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xl text-xs">
          {/* Header & KPI Metrics for Users */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                QUáº¢N LÃ THÃ€NH VIÃŠN, CÆ¯ DÃ‚N & PHÃ‚N Cáº¤P QUáº¢N TRá»Š
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Xem thá»‘ng kÃª tÃ i khoáº£n, táº¡o má»›i user, phÃ¢n vai trÃ² (Admin / CÆ° DÃ¢n / MÃ´i Giá»›i), cá»™ng lÆ°á»£t Up Tin & táº¡m khÃ³a tÃ i khoáº£n
              </p>
            </div>

            {/* Quick User Stats Pills & Add Button */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-xl font-extrabold flex items-center gap-1.5 text-xs">
                ðŸ‘¥ Tá»•ng: <strong className="text-amber-500">{registeredUsers.length}</strong>
              </span>
              <span className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl font-extrabold flex items-center gap-1.5 text-xs">
                ðŸ¢ Doanh Nghiá»‡p: <strong>{registeredUsers.filter(u => u.accountType === 'business_enterprise' || u.role === 'partner' || u.companyName).length}</strong>
              </span>
              <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl font-extrabold flex items-center gap-1.5 text-xs">
                ðŸ  CÆ° DÃ¢n: <strong>{registeredUsers.filter(u => u.role === 'owner' || (!u.companyName && u.accountType !== 'business_enterprise' && u.role !== 'sale' && u.role !== 'admin')).length}</strong>
              </span>
              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl font-extrabold flex items-center gap-1.5 text-xs">
                ðŸ’¼ MÃ´i Giá»›i/Sale: <strong>{registeredUsers.filter(u => u.role === 'sale').length}</strong>
              </span>
              <span className="px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl font-extrabold flex items-center gap-1.5 text-xs">
                ðŸ‘‘ Admin: <strong>{registeredUsers.filter(u => u.role === 'admin').length}</strong>
              </span>

              <button
                onClick={() => setIsAddingUser(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ THÃŠM THÃ€NH VIÃŠN Má»šI</span>
              </button>
            </div>
          </div>

          {/* Controls: Search & Role Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="TÃ¬m theo TÃªn, SÄT, Email, MST, TÃªn CÃ´ng Ty..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition ${
                  userRoleFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Táº¥t Cáº£ ({registeredUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('business')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition ${
                  userRoleFilter === 'business'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                ðŸ¢ Doanh Nghiá»‡p (B2B)
              </button>
              <button
                onClick={() => setUserRoleFilter('owner')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition ${
                  userRoleFilter === 'owner'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                ðŸ  CÆ° DÃ¢n / ChÃ­nh Chá»§
              </button>
              <button
                onClick={() => setUserRoleFilter('sale')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition ${
                  userRoleFilter === 'sale'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                ðŸ’¼ MÃ´i Giá»›i / Sale
              </button>
              <button
                onClick={() => setUserRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition ${
                  userRoleFilter === 'admin'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                ðŸ‘‘ Quáº£n Trá»‹ ViÃªn
              </button>
              <button
                onClick={fetchUsers}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 transition text-xs shadow-xs shrink-0"
                title="LÃ m má»›i danh sÃ¡ch"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {registeredUsers.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <UserX className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">ChÆ°a cÃ³ dá»¯ liá»‡u thÃ nh viÃªn phÃ¹ há»£p.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile Compact & Expandable Users List */}
              <div className="block md:hidden space-y-2.5">
                {registeredUsers
                  .filter(u => {
                    const matchesSearch = !userSearch || 
                      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
                      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
                      (u.phone && u.phone.includes(userSearch)) ||
                      (u.companyName && u.companyName.toLowerCase().includes(userSearch.toLowerCase())) ||
                      (u.taxCode && u.taxCode.includes(userSearch));
                    
                    const isBusinessUser = u.accountType === 'business_enterprise' || u.role === 'partner' || !!u.companyName || !!u.taxCode;
                    const matchesRole = userRoleFilter === 'all' 
                      ? true 
                      : userRoleFilter === 'business'
                      ? isBusinessUser
                      : userRoleFilter === 'owner'
                      ? (u.role === 'owner' || (!isBusinessUser && u.role !== 'sale' && u.role !== 'admin'))
                      : u.role === userRoleFilter;
                    return matchesSearch && matchesRole;
                  })
                  .map((u) => {
                    const isExpanded = expandedUserId === u.id;
                    const userPropertiesList = properties.filter(p => 
                      (p.userId && p.userId === u.id) ||
                      (p.contactEmail && u.email && p.contactEmail.toLowerCase() === u.email.toLowerCase()) ||
                      (p.contactPhone && u.phone && p.contactPhone.replace(/\D/g, '') === u.phone.replace(/\D/g, ''))
                    );
                    const isUserBlocked = (u as any).isBlocked;

                    return (
                      <div
                        key={u.id}
                        className={`border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40 transition hover:border-amber-500/40 cursor-pointer ${isUserBlocked ? 'opacity-70 bg-rose-50/20' : ''}`}
                        onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {u.avatar ? (
                              <img loading="lazy" src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-amber-500/30 shrink-0" />
                            ) : (
                              <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black rounded-full flex items-center justify-center text-[11px] shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-900 dark:text-white text-xs block truncate">
                                {u.name || 'NgÆ°á»i dÃ¹ng'}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {u.email || u.phone || 'ChÆ°a cáº­p nháº­t email'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : u.role === 'owner'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {u.role === 'admin' ? 'ðŸ‘‘ Admin' : u.role === 'owner' ? 'ðŸ  CÆ° DÃ¢n' : 'ðŸ’¼ MÃ´i Giá»›i'}
                            </span>
                            <span className={`text-[10px] transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              â–¼
                            </span>
                          </div>
                        </div>

                        {/* Brief summary row */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                          <span>ðŸ“¦ <b>{userPropertiesList.length}</b> BÄS â€¢ âš¡ <b>{u.upTinCredits || 0}</b> LÆ°á»£t Up</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {(u.balance || 0).toLocaleString('vi-VN')} Ä‘
                          </span>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-400 block text-[10px]">SÄT / Zalo:</span>
                                {u.phone ? (
                                  <a
                                    href={`tel:${u.phone}`}
                                    onClick={e => e.stopPropagation()}
                                    className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                  >
                                    ðŸ“ž {u.phone}
                                  </a>
                                ) : (
                                  <span className="text-slate-400 italic">ChÆ°a cÃ³ SÄT</span>
                                )}
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Tráº¡ng ThÃ¡i:</span>
                                <span className={isUserBlocked ? 'font-bold text-rose-600' : 'font-bold text-emerald-600'}>
                                  {isUserBlocked ? 'ðŸ”´ Táº¡m KhÃ³a' : 'ðŸŸ¢ Hoáº¡t Äá»™ng'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold"
                              >
                                <option value="owner">ðŸ  Chá»§ NhÃ  / CÆ° DÃ¢n</option>
                                <option value="sale">ðŸ’¼ MÃ´i Giá»›i / Sale</option>
                                <option value="admin">ðŸ‘‘ Quáº£n Trá»‹ ViÃªn (Admin)</option>
                              </select>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setUserForCreditInjector(u)}
                                  className="px-2 py-1 bg-amber-500 text-slate-950 rounded-lg font-bold text-[10px]"
                                >
                                  ðŸ’µ BÆ¡m VÃ­/LÆ°á»£t
                                </button>
                                <button
                                  onClick={() => handleToggleBlockUser(u.id, !!isUserBlocked)}
                                  className={`px-2 py-1 rounded-lg font-bold text-[10px] ${
                                    isUserBlocked ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {isUserBlocked ? 'Má»Ÿ KhÃ³a' : 'KhÃ³a'}
                                </button>
                                <button
                                  onClick={() => setEditingUser(u)}
                                  className="p-1 bg-blue-50 text-blue-600 rounded-lg"
                                  title="Sá»­a"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1 bg-rose-50 text-rose-600 rounded-lg"
                                  title="XÃ³a"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3.5">Há» & TÃªn</th>
                      <th className="py-3 px-3">Email liÃªn há»‡</th>
                      <th className="py-3 px-3">SÄT / Zalo</th>
                      <th className="py-3 px-3 text-center">BÄS ÄÃ£ ÄÄƒng</th>
                      <th className="py-3 px-3 text-center">LÆ°á»£t Up Tin</th>
                      <th className="py-3 px-3 text-center">VÃ­ VNÄ & Äiá»ƒm</th>
                      <th className="py-3 px-3">Vai TrÃ² / Cáº¥p Báº­c</th>
                      <th className="py-3 px-3 text-center">Tráº¡ng ThÃ¡i</th>
                      <th className="py-3 px-3.5 text-right">Thao TÃ¡c Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {registeredUsers
                      .filter(u => {
                        const matchesSearch = !userSearch || 
                          (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
                          (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
                          (u.phone && u.phone.includes(userSearch)) ||
                          (u.companyName && u.companyName.toLowerCase().includes(userSearch.toLowerCase())) ||
                          (u.taxCode && u.taxCode.includes(userSearch));
                        
                        const isBusinessUser = u.accountType === 'business_enterprise' || u.role === 'partner' || !!u.companyName || !!u.taxCode;
                        const matchesRole = userRoleFilter === 'all' 
                          ? true 
                          : userRoleFilter === 'business'
                          ? isBusinessUser
                          : userRoleFilter === 'owner'
                          ? (u.role === 'owner' || (!isBusinessUser && u.role !== 'sale' && u.role !== 'admin'))
                          : u.role === userRoleFilter;
                        return matchesSearch && matchesRole;
                      })
                      .map((u) => {
                        const userPropertiesList = properties.filter(p => 
                          (p.userId && p.userId === u.id) ||
                          (p.contactEmail && u.email && p.contactEmail.toLowerCase() === u.email.toLowerCase()) ||
                          (p.contactPhone && u.phone && p.contactPhone.replace(/\D/g, '') === u.phone.replace(/\D/g, ''))
                        );

                        const isUserBlocked = (u as any).isBlocked;

                        return (
                          <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${isUserBlocked ? 'opacity-60 bg-rose-50/20 dark:bg-rose-950/20' : ''}`}>
                            {/* User Info */}
                            <td className="py-3.5 px-3.5 font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                              {u.avatar ? (
                                <img loading="lazy" src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-amber-500/30 shrink-0" />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black rounded-full flex items-center justify-center text-xs shadow-xs shrink-0">
                                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-slate-900 dark:text-white">{u.name}</span>
                                  {u.provider === 'google' && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/10 text-blue-600 font-bold rounded border border-blue-500/20">Google</span>
                                  )}
                                  {(u.companyName || u.accountType === 'business_enterprise') && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-blue-600 text-white font-bold rounded">DN</span>
                                  )}
                                  {u.businessLicenseUrl && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-600 text-white font-bold rounded" title="ÄÃ£ cÃ³ Giáº¥y phÃ©p ÄKKD">ÄKKD âœ“</span>
                                  )}
                                </div>
                                {u.companyName && (
                                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block truncate max-w-[180px]">
                                    ðŸ¢ {u.companyName} {u.taxCode ? `(MST: ${u.taxCode})` : ''}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 block font-normal">
                                  ÄÄƒng kÃ½: {u.registeredAt ? new Date(u.registeredAt).toLocaleDateString('vi-VN') : 'Má»›i táº¡o'}
                                </span>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                              {u.email}
                            </td>

                            {/* Phone / Zalo */}
                            <td className="py-3 px-3">
                              {u.phone ? (
                                <div className="flex items-center gap-1.5">
                                  <a 
                                    href={`tel:${u.phone}`} 
                                    className="font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                  >
                                    <PhoneCall className="w-3 h-3 text-emerald-500" />
                                    {u.phone}
                                  </a>
                                  <a
                                    href={`https://zalo.me/${u.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-1.5 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 font-bold rounded text-[9px] transition"
                                  >
                                    Zalo
                                  </a>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-xs">ChÆ°a cáº­p nháº­t SÄT</span>
                              )}
                            </td>

                            {/* Posted Listings */}
                            <td className="py-3 px-3 text-center">
                              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold rounded-lg border border-amber-500/30 text-xs inline-flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                                <span>{userPropertiesList.length} tin</span>
                              </span>
                            </td>

                            {/* UpTin Credits */}
                            <td className="py-3 px-3 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <span className="font-black text-amber-500 text-xs">{u.upTinCredits || 0} lÆ°á»£t</span>
                                <button
                                  onClick={() => setUserForCreditInjector(u)}
                                  className="p-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg transition text-[10px] shadow-xs"
                                  title="Cá»™ng hoáº·c Ä‘iá»u chá»‰nh lÆ°á»£t Up Tin"
                                >
                                  + Táº·ng
                                </button>
                              </div>
                            </td>

                            {/* Wallet Balance & Social Points */}
                            <td className="py-3 px-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                                  {(u.balance || 0).toLocaleString('vi-VN')}Ä‘
                                </span>
                                <button
                                  onClick={() => setUserForCreditInjector(u)}
                                  className="px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-md text-[10px] shadow-xs flex items-center gap-1 transition cursor-pointer"
                                  title="Má»Ÿ cÃ´ng cá»¥ bÆ¡m tiá»n vÃ­, lÆ°á»£t Up-Tin vÃ  Ä‘iá»ƒm thÆ°á»Ÿng"
                                >
                                  <Wallet className="w-2.5 h-2.5 text-emerald-200" />
                                  <span>ðŸ’µ BÆ¡m VÃ­</span>
                                </button>
                              </div>
                            </td>

                            {/* Role Selector */}
                            <td className="py-3 px-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                className={`px-2.5 py-1.5 rounded-xl font-extrabold text-[11px] border focus:outline-none cursor-pointer transition ${
                                  u.role === 'admin'
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                    : u.role === 'owner'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                }`}
                              >
                                <option value="owner">ðŸ  Chá»§ NhÃ  / CÆ° DÃ¢n</option>
                                <option value="sale">ðŸ’¼ MÃ´i Giá»›i / Sale</option>
                                <option value="admin">ðŸ‘‘ Quáº£n Trá»‹ ViÃªn (Admin)</option>
                              </select>
                            </td>

                            {/* Blocked Status */}
                            <td className="py-3 px-3 text-center">
                              {isUserBlocked ? (
                                <span className="px-2.5 py-1 bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold rounded-lg border border-rose-500/40 text-[10px] inline-flex items-center gap-1">
                                  <Ban className="w-3 h-3 text-rose-500" />
                                  Táº¡m KhÃ³a
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-lg border border-emerald-500/30 text-[10px] inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  Hoáº¡t Äá»™ng
                                </span>
                              )}
                            </td>

                            {/* Admin Actions */}
                            <td className="py-3 px-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingUser(u)}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900 dark:text-blue-300 rounded-xl transition cursor-pointer"
                                  title="Sá»­a thÃ´ng tin tÃ i khoáº£n"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleToggleBlockUser(u.id, !!isUserBlocked)}
                                  className={`px-2 py-1.5 rounded-xl font-bold transition text-[10px] flex items-center gap-1 cursor-pointer ${
                                    isUserBlocked
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                                  }`}
                                  title={isUserBlocked ? 'Má»Ÿ khÃ³a tÃ i khoáº£n' : 'KhÃ³a táº¡m thá»i'}
                                >
                                  {isUserBlocked ? <ShieldCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                  {isUserBlocked ? 'Má»Ÿ KhÃ³a' : 'KhÃ³a TK'}
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900 dark:text-rose-300 rounded-xl transition cursor-pointer"
                                  title="XÃ³a ngÆ°á»i dÃ¹ng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* Tab: Traffic Analytics */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xl text-xs">
          {/* Header & Timeframe Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Bá»˜ QUáº¢N TRá»Š THá»NG KÃŠ TRAFFIC & KHÃCH HÃ€NG CRM CAO Cáº¤P
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                PhÃ¢n tÃ­ch lÆ°u lÆ°á»£ng truy cáº­p realtime, tá»· lá»‡ chuyá»ƒn Ä‘á»•i Lead, doanh thu dá»‹ch vá»¥ & hoáº¡t Ä‘á»™ng cÆ° dÃ¢n
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
                  HÃ´m Nay
                </button>
                <button
                  onClick={() => setAnalyticsTimeFrame('7d')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${
                    analyticsTimeFrame === '7d'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  7 NgÃ y
                </button>
                <button
                  onClick={() => setAnalyticsTimeFrame('30d')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${
                    analyticsTimeFrame === '30d'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  30 NgÃ y
                </button>
                <button
                  onClick={() => setAnalyticsTimeFrame('all')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition ${
                    analyticsTimeFrame === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Táº¥t Cáº£
                </button>
              </div>

              <button
                onClick={fetchAnalyticsStats}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 transition text-xs shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Data Trá»±c Tiáº¿p
              </button>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                <span>LÆ¯á»¢T TRUY Cáº¬P ({analyticsTimeFrame.toUpperCase()})</span>
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {(
                  analyticsTimeFrame === 'today' ? (analyticsData?.todayVisits || 0) :
                  analyticsTimeFrame === '7d' ? (analyticsData?.visits7d || 0) :
                  analyticsTimeFrame === '30d' ? (analyticsData?.totalVisits || 0) :
                  (analyticsData?.totalVisits || 0)
                ).toLocaleString('vi-VN')}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> {analyticsData?.growthPercent ? `${analyticsData.growthPercent}% tÄƒng trÆ°á»Ÿng` : 'â€”'}
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                <span>Tá»ˆ Lá»† CHUYá»‚N Äá»”I LEAD CRM</span>
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {contacts.length > 0 && analyticsData?.todayVisits ? `${((contacts.length / analyticsData.todayVisits) * 100).toFixed(1)}%` : 'â€”'}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {contacts.length} KhÃ¡ch gá»­i lá»‹ch háº¹n
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-950/40 dark:to-orange-950/40 rounded-2xl border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                <span>KHÃCH ÄANG ONLINE REALTIME</span>
                <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block flex items-center gap-2">
                {analyticsData?.activeOnline || 0}
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Äang lÆ°á»›t xem cÄƒn & sÆ¡ Ä‘á»“ masterplan
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-950/40 dark:to-pink-950/40 rounded-2xl border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-extrabold text-xs">
                <span>DOANH THU ÄÃƒ THU</span>
                <Award className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-300 block">
                {(analyticsData?.revenue || 0).toLocaleString('vi-VN')} VNÄ
              </span>
              <span className="text-[11px] text-purple-600 font-bold">
                âœ“ PhÃ­ Up-tin MSB & GÃ³i thÃ nh viÃªn
              </span>
            </div>
          </div>

          {/* Funnel & Conversion Rates */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                PHá»„U CHUYá»‚N Äá»”I KHÃCH HÃ€NG CRM (CONVERSION FUNNEL)
              </span>
              <span className="text-xs text-amber-500 font-bold">Tá»‰ lá»‡ chá»‘t cuá»™c háº¹n: {analyticsData?.appointmentRate ? `${analyticsData.appointmentRate}%` : 'â€”'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="text-[10px] text-slate-400 font-bold uppercase">BÆ°á»›c 1: LÆ°á»£t Xem Web</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{analyticsData?.funnelStep1 || 0}</div>
                <div className="text-[10px] text-emerald-600 font-bold">100% Traffic</div>
                <div className="w-full h-1 bg-blue-500 rounded-full mt-2"></div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="text-[10px] text-slate-400 font-bold uppercase">BÆ°á»›c 2: TÃ¬m Kiáº¿m / Lá»c CÄƒn</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{analyticsData?.funnelStep2 || 0}</div>
                <div className="text-[10px] text-blue-600 font-bold">{analyticsData?.funnelStep2Rate ? `${analyticsData.funnelStep2Rate}% Chuyá»ƒn Ä‘á»•i` : 'â€”'}</div>
                <div className="w-full h-1 bg-teal-500 rounded-full mt-2"></div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="text-[10px] text-slate-400 font-bold uppercase">BÆ°á»›c 3: Báº¥m Xem Chi Tiáº¿t CÄƒn</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{analyticsData?.funnelStep3 || 0}</div>
                <div className="text-[10px] text-purple-600 font-bold">{analyticsData?.funnelStep3Rate ? `${analyticsData.funnelStep3Rate}% Chuyá»ƒn Ä‘á»•i` : 'â€”'}</div>
                <div className="w-full h-1 bg-purple-500 rounded-full mt-2"></div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-amber-500/40 bg-amber-500/5 relative overflow-hidden">
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">BÆ°á»›c 4: Äáº·t Lá»‹ch Xem / Gá»i Äiá»‡n</div>
                <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">{contacts.length || 0} KhÃ¡ch CRM</div>
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
                THIáº¾T Bá»Š TRUY Cáº¬P WEBSITE
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-bold text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Äiá»‡n Thoáº¡i Di Äá»™ng (iOS & Android)
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">{analyticsData?.deviceBreakdown?.mobile || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analyticsData?.deviceBreakdown?.mobile || 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Monitor className="w-3.5 h-3.5 text-blue-500" /> MÃ¡y TÃ­nh Laptop / PC
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-black">{analyticsData?.deviceBreakdown?.desktop || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${analyticsData?.deviceBreakdown?.desktop || 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Tablet className="w-3.5 h-3.5 text-purple-500" /> MÃ¡y TÃ­nh Báº£ng (Tablet/iPad)
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-black">{analyticsData?.deviceBreakdown?.tablet || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analyticsData?.deviceBreakdown?.tablet || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                NGUá»’N KÃ‰O KHIáº¾N KHÃCH VÃ€O WEBSITE
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>NhÃ³m Zalo CÆ° DÃ¢n Vinhomes</span>
                  </div>
                   <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black rounded-lg text-xs">
                     {analyticsData?.trafficSources?.zalo ? `${analyticsData.trafficSources.zalo.percent}% (${analyticsData.trafficSources.zalo.visits.toLocaleString('vi-VN')} lÆ°á»£t)` : 'â€”'}
                   </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Globe className="w-4 h-4 text-amber-500" />
                    <span>Google TÃ¬m Kiáº¿m (SEO Web)</span>
                  </div>
                   <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded-lg text-xs">
                     {analyticsData?.trafficSources?.google ? `${analyticsData.trafficSources.google.percent}% (${analyticsData.trafficSources.google.visits.toLocaleString('vi-VN')} lÆ°á»£t)` : 'â€”'}
                   </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    <span>Truy Cáº­p Trá»±c Tiáº¿p (Bookmark/GÃµ URL)</span>
                  </div>
                   <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black rounded-lg text-xs">
                     {analyticsData?.trafficSources?.direct ? `${analyticsData.trafficSources.direct.percent}% (${analyticsData.trafficSources.direct.visits.toLocaleString('vi-VN')} lÆ°á»£t)` : 'â€”'}
                   </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Share2 className="w-4 h-4 text-purple-500" />
                    <span>Facebook & Máº¡ng XÃ£ Há»™i Chia Sáº»</span>
                  </div>
                   <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black rounded-lg text-xs">
                     {analyticsData?.trafficSources?.social ? `${analyticsData.trafficSources.social.percent}% (${analyticsData.trafficSources.social.visits.toLocaleString('vi-VN')} lÆ°á»£t)` : 'â€”'}
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Project Traffic */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              TOP Dá»° ÃN ÄÆ¯á»¢C TÃŒM KIáº¾M & XEM NHIá»€U NHáº¤T
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {analyticsData?.topProjects && analyticsData.topProjects.length > 0 ? (
                analyticsData.topProjects.map((proj, idx) => (
                  <div key={proj.id || idx} className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Xáº¿p háº¡ng #{idx + 1}</span>
                    <p className="font-extrabold text-slate-900 dark:text-white text-xs">{proj.name}</p>
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className={`font-black ${['text-amber-500', 'text-emerald-500', 'text-blue-500', 'text-purple-500'][idx % 4]}`}>{proj.views.toLocaleString('vi-VN')} lÆ°á»£t xem</span>
                      <span className={`px-2 py-0.5 bg-${['amber', 'emerald', 'blue', 'purple'][idx % 4]}-500/10 text-${['amber', 'emerald', 'blue', 'purple'][idx % 4]}-600 font-bold rounded text-[10px]`}>{proj.percent}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-4 text-slate-500 dark:text-slate-400">ChÆ°a cÃ³ dá»¯ liá»‡u dá»± Ã¡n</div>
              )}
            </div>
          </div>

          {/* Live Activity Stream */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                NHáº¬T KÃ HOáº T Äá»˜NG KHÃCH HÃ€NG REALTIME (LIVE EVENT STREAM)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">â— STREAMING ACTIVE</span>
            </h4>

            <div className="space-y-2 text-xs font-mono">
              {analyticsData?.liveEvents && analyticsData.liveEvents.length > 0 ? (
                analyticsData.liveEvents.map((event, idx) => (
                  <div key={idx} className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={event.type === 'appointment' ? 'text-emerald-400' : event.type === 'upTin' ? 'text-blue-400' : 'text-amber-400'}>[Vá»«a xong]</span>
                      <span className="text-slate-300">{event.message}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{event.timeAgo}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">ChÆ°a cÃ³ hoáº¡t Ä‘á»™ng nÃ o</div>
              )}
            </div>
          </div>
        </div>
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
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Cáº¤U HÃŒNH Tá»° Äá»˜NG Äá»’NG Bá»˜ N8N WORKFLOW</h3>
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
                  THÃ”NG TIN NGÆ¯á»œI ÄÄ‚NG & CHI TIáº¾T CÄ‚N BÄS
                </span>
                <h3 className="font-black text-base text-slate-900 dark:text-white mt-1">
                  MÃ£ CÄƒn: #{selectedSellerDetail.id}
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
                ðŸ‘¤ XÃC NHáº¬N THÃ”NG TIN NGÆ¯á»œI ÄÄ‚NG TIN
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Há» vÃ  tÃªn ngÆ°á»i Ä‘Äƒng:</span>
                  <span className="font-black text-white text-sm">{selectedSellerDetail.sellerName || 'Chá»§ Há»™ / ChuyÃªn ViÃªn Sale'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Vai trÃ² tÃ i khoáº£n:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black inline-block mt-0.5 ${
                    selectedSellerDetail.sellerRole === 'owner' ? 'bg-amber-500 text-slate-950' : 'bg-teal-500 text-slate-950'
                  }`}>
                    {selectedSellerDetail.sellerRole === 'owner' ? 'ðŸ  CHá»¦ NHÃ€ Gá»C' : 'ðŸ’¼ MÃ”I GIá»šI / SALE'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Sá»‘ Ä‘iá»‡n thoáº¡i chÃ­nh:</span>
                  {selectedSellerDetail.sellerPhone ? (
                    <a
                      href={`tel:${selectedSellerDetail.sellerPhone}`}
                      className="font-black text-amber-400 hover:underline text-sm block"
                    >
                      ðŸ“ž {selectedSellerDetail.sellerPhone}
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs italic">ChÆ°a cáº­p nháº­t SÄT</span>
                  )}
                </div>

                {selectedSellerDetail.sellerPhone && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Má»Ÿ Trá»±c Tiáº¿p Zalo:</span>
                    <a
                      href={`https://zalo.me/${selectedSellerDetail.sellerPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-[11px] inline-flex items-center gap-1 mt-1 transition shadow"
                    >
                      ðŸ’¬ Chat Zalo Vá»›i NgÆ°á»i ÄÄƒng
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Retention & Expiration Status */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                â° THá»œI GIAN HIá»‚N THá»Š & Báº¢O LÆ¯U Dá»® LIá»†U
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">NgÃ y Ä‘Äƒng bÃ i:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{getPropertyExpiryInfo(selectedSellerDetail).postDateFormatted}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Háº¡n hiá»ƒn thá»‹ web (20 ngÃ y):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{getPropertyExpiryInfo(selectedSellerDetail).expiryDateFormatted}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700/60 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                  ðŸ“ Báº£o lÆ°u dá»¯ liá»‡u: <span className="font-normal text-slate-600 dark:text-slate-400">Tin bá»‹ áº©n sau 15â€“25 ngÃ y váº«n Ä‘Æ°á»£c giá»¯ nguyÃªn 100% SÄT, TÃªn Chá»§ CÄƒn & PhÃ¡p LÃ½ trong 30 ngÃ y.</span>
                </div>
              </div>
            </div>

            {/* Property Overview Details */}
            <div className="space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                ðŸ¡ CHI TIáº¾T CÄ‚N Báº¤T Äá»˜NG Sáº¢N
              </h4>

              <div className="flex gap-3">
                <img loading="lazy"
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
                    Dá»± Ã¡n: <b className="text-slate-800 dark:text-slate-200 uppercase">{selectedSellerDetail.project}</b> â€¢ PhÃ¢n khu: <b>{selectedSellerDetail.subdivision}</b>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-[11px]">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block">Diá»‡n tÃ­ch</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedSellerDetail.area} mÂ²</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block">PhÃ²ng ngá»§</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedSellerDetail.bedrooms} PN</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block">HÆ°á»›ng cá»­a</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedSellerDetail.direction || 'ÄÃ´ng Nam'}</span>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block">Ná»™i tháº¥t</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedSellerDetail.furniture || 'Äáº§y Ä‘á»§'}</span>
                </div>
              </div>

              {/* Redacted Sá»• Äá» / Legal */}
              {selectedSellerDetail.redactedRedBookUrl && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="font-extrabold text-amber-800 dark:text-amber-300 text-[11px] block">
                    ðŸ“œ Sá»” Äá»Ž / PHÃP LÃ ÄÃƒ CHE THÃ”NG TIN RIÃŠNG
                  </span>
                  <img loading="lazy"
                    src={selectedSellerDetail.redactedRedBookUrl}
                    alt="Sá»• Ä‘á»"
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
                <Share2 className="w-4 h-4" /> Chia Sáº» Zalo/FB
              </button>
              <button
                onClick={() => {
                  handlePushPropertyNow(selectedSellerDetail);
                  setSelectedSellerDetail(null);
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center gap-1.5"
              >
                âš¡ Up Tin (+20 NgÃ y)
              </button>
              <button
                onClick={() => setSelectedSellerDetail(null)}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
              >
                ÄÃ³ng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Admin Affiliate & Platform Fee Management */}
      {activeTab === 'affiliate_mgmt' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  Há»† THá»NG THU PHÃ Ná»€N Táº¢NG & AFFILIATE Tá»° Äá»˜NG
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                  QUáº¢N LÃ THU PHÃ Dá»ŠCH Vá»¤ CÆ¯ DÃ‚N & CHIA Sáºº DOANH THU 2 Táº¦NG
                </h2>
                <p className="text-xs text-slate-300">
                  Cáº¥u hÃ¬nh tá»‰ lá»‡ hoa há»“ng giá»›i thiá»‡u, giÃ¡ niÃªm yáº¿t gian hÃ ng dá»‹ch vá»¥ VIP & duyá»‡t lá»‡nh rÃºt tiá»n VietQR cho cÆ° dÃ¢n.
                </p>
              </div>

              <button
                onClick={handleSaveAffiliateConfig}
                disabled={isSavingAffiliateConfig}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg transition uppercase tracking-wider shrink-0 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingAffiliateConfig ? 'ÄANG LÆ¯U...' : 'LÆ¯U Cáº¤U HÃŒNH Há»† THá»NG'}</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-700/80 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-amber-500/30">
                <span className="text-slate-400 block font-bold mb-0.5">Thu PhÃ­ Gian HÃ ng Dá»‹ch Vá»¥:</span>
                <span className="text-sm font-black text-slate-400">ChÆ°a theo dÃµi</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-emerald-500/30">
                <span className="text-slate-400 block font-bold mb-0.5">Hoa Há»“ng ÄÃ£ Tráº£ CÆ° DÃ¢n:</span>
                <span className="text-xl font-black text-emerald-400">{affiliateStats ? `${affiliateStats.totalPaid.toLocaleString('vi-VN')}Ä‘` : '...'}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-blue-500/30">
                <span className="text-slate-400 block font-bold mb-0.5">Sá»‘ CÆ° DÃ¢n CÃ³ MÃ£ Ref:</span>
                <span className="text-xl font-black text-blue-400">{affiliateStats ? `${affiliateStats.refUserCount} CÆ° DÃ¢n` : '...'}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/30">
                <span className="text-slate-400 block font-bold mb-0.5">YÃªu Cáº§u RÃºt Chá» Duyá»‡t:</span>
                <span className="text-xl font-black text-rose-400">{payoutRequests.filter(p => p.status === 'pending').length} Lá»‡nh</span>
              </div>
            </div>
          </div>

          {/* Section 1: Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box A: Affiliate Commission Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Award className="w-5 h-5 text-amber-500" />
                Cáº¤U HÃŒNH Tá»ˆ Lá»† HOA Há»’NG CHIáº¾T KHáº¤U 2 Táº¦NG
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tá»‰ Lá»‡ Hoa Há»“ng Cáº¥p F1 (NgÆ°á»i Giá»›i Thiá»‡u Trá»±c Tiáº¿p) %:
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
                  <span className="text-[10px] text-slate-400 mt-1 block">KhuyÃªn dÃ¹ng 15% - 20% Ä‘á»ƒ kÃ­ch thÃ­ch cÆ° dÃ¢n chia sáº» link máº¡nh máº½.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tá»‰ Lá»‡ Hoa Há»“ng Cáº¥p F2 (NgÆ°á»i Giá»›i Thiá»‡u GiÃ¡n Tiáº¿p) %:
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
                  <span className="text-[10px] text-slate-400 mt-1 block">ThÆ°á»ng cÃ i 5% Ä‘á»ƒ táº¡o Ä‘á»™ng lá»±c xÃ¢y dá»±ng máº¡ng lÆ°á»›i thá»¥ Ä‘á»™ng.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ThÆ°á»Ÿng LÆ°á»£t Up-Tin BÄS Miá»…n PhÃ­ Má»—i LÆ°á»£t Giá»›i Thiá»‡u Má»›i:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={refBonusUpTin}
                      onChange={(e) => setRefBonusUpTin(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-emerald-500 text-sm"
                    />
                    <span className="font-bold text-slate-500 shrink-0">LÆ°á»£t / CÆ° DÃ¢n</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Táº·ng +5 lÆ°á»£t Up Tin ngay khi tÃ i khoáº£n má»›i Ä‘Äƒng kÃ½ qua ref link.</span>
                </div>
              </div>
            </div>

            {/* Box B: Platform Fees for Service Vendor Listings */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Building2 className="w-5 h-5 text-emerald-500" />
                Cáº¤U HÃŒNH THU PHÃ GIAN HÃ€NG Dá»ŠCH Vá»¤ CÆ¯ DÃ‚N
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GiÃ¡ GÃ³i Gian HÃ ng Dá»‹ch Vá»¥ CÆ° DÃ¢n VIP (1 ThÃ¡ng) VNÄ:
                  </label>
                  <input
                    type="number"
                    value={servicePackageMonthPrice}
                    onChange={(e) => setServicePackageMonthPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-emerald-600 text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Gian hÃ ng Ä‘Æ°á»£c ghim TOP 1 danh má»¥c Dá»‹ch vá»¥, gáº¯n tÃ­ch xanh Uy TÃ­n.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GiÃ¡ GÃ³i Gian HÃ ng Dá»‹ch Vá»¥ VIP Æ¯u ÄÃ£i (3 ThÃ¡ng) VNÄ:
                  </label>
                  <input
                    type="number"
                    value={servicePackage3MonthPrice}
                    onChange={(e) => setServicePackage3MonthPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-amber-500 text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Tiáº¿t kiá»‡m 20% cho Ä‘Æ¡n vá»‹ Ä‘Äƒng kÃ½ theo quÃ½ (Sá»­a chá»¯a, Giáº·t lÃ , Váº­n chuyá»ƒn...).</span>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 rounded-2xl space-y-1">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300 block">ðŸ’¡ CÆ¡ cháº¿ Thu PhÃ­ Hoa Há»“ng Theo ÄÆ¡n HÃ ng (Success Commission):</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Thu phÃ­ <strong>5% - 8%</strong> trÃªn cÃ¡c há»£p Ä‘á»“ng thi cÃ´ng ná»™i tháº¥t hoáº·c dá»‹ch vá»¥ giÃ¡ trá»‹ cao khi khÃ¡ch hÃ ng káº¿t ná»‘i qua ná»n táº£ng.
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
                DANH SÃCH YÃŠU Cáº¦U RÃšT TIá»€N HOA Há»’NG (VIETQR PAYOUT)
              </h3>
              <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                Admin xÃ¡c nháº­n chuyá»ƒn khoáº£n ngÃ¢n hÃ ng
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-[10px] uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60">
                    <th className="p-3">MÃ£ Lá»‡nh</th>
                    <th className="p-3">User ID CÆ° DÃ¢n</th>
                    <th className="p-3">Sá»‘ Tiá»n RÃºt</th>
                    <th className="p-3">NgÃ¢n HÃ ng & Sá»‘ TK Thá»¥ HÆ°á»Ÿng</th>
                    <th className="p-3">Thá»i Gian</th>
                    <th className="p-3 text-center">Tráº¡ng ThÃ¡i</th>
                    <th className="p-3 text-center">Thao TÃ¡c Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {payoutRequestsLoading && (
                    <tr><td colSpan={7} className="p-6 text-center text-slate-400 font-bold">Äang táº£i danh sÃ¡ch...</td></tr>
                  )}
                  {!payoutRequestsLoading && payoutRequests.length === 0 && (
                    <tr><td colSpan={7} className="p-6 text-center text-slate-400 font-bold">ChÆ°a cÃ³ yÃªu cáº§u rÃºt tiá»n nÃ o.</td></tr>
                  )}
                  {payoutRequests.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                      <td className="p-3 font-mono font-bold text-slate-500">{po.referenceCode || po.id}</td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                        {po.userId}
                      </td>
                      <td className="p-3 font-black text-amber-600 dark:text-amber-400 text-sm">
                        {Number(po.amount || 0).toLocaleString('vi-VN')} VNÄ
                      </td>
                      <td className="p-3 font-medium">
                        <span className="font-bold text-slate-900 dark:text-white">{po.bankDetails?.bankName}</span>
                        <span className="block font-mono text-emerald-600 font-bold">{po.bankDetails?.accountNumber}</span>
                        <span className="block text-[10px] text-slate-400">{po.bankDetails?.accountHolder}</span>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">{po.requestedAtDisplay}</td>
                      <td className="p-3 text-center">
                        {po.status === 'approved' ? (
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black rounded-full text-[10px]">
                            âœ“ ÄÃ£ Chuyá»ƒn Khoáº£n
                          </span>
                        ) : po.status === 'rejected' ? (
                          <span className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black rounded-full text-[10px]">
                            âœ• ÄÃ£ Tá»« Chá»‘i
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded-full text-[10px] animate-pulse">
                            â³ Chá» Admin Duyá»‡t
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {po.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              disabled={payoutActionId === po.id}
                              onClick={() => handleApprovePayout(po.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-lg text-[11px] transition shadow-xs"
                            >
                              {payoutActionId === po.id ? '...' : 'âœ“ Duyá»‡t Chuyá»ƒn'}
                            </button>
                            <button
                              disabled={payoutActionId === po.id}
                              onClick={() => handleRejectPayout(po.id)}
                              className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 disabled:opacity-50 text-rose-700 font-bold rounded-lg text-[11px] transition"
                            >
                              âœ• Tá»« Chá»‘i
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-bold">
                            {po.status === 'rejected' ? 'ÄÃ£ hoÃ n tiá»n vÃ o vÃ­' : 'ÄÃ£ hoÃ n táº¥t'}
                          </span>
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
                  ðŸ“° QUáº¢N TRá»Š Báº¢NG TIN CÆ¯ DÃ‚N & YOUTUBE PR
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {adminReputationPosts.length} BÃ i Viáº¿t Live
                </span>
              </div>
              <h2 className="text-xl font-black">QUáº¢N LÃ BÃ€I PR VÃ€ VIDEO REVIEW TRáº¢I NGHIá»†M</h2>
              <p className="text-xs text-slate-300 max-w-2xl">
                Kiá»ƒm duyá»‡t, xÃ³a bÃ i viáº¿t vi pháº¡m hoáº·c Ä‘Äƒng má»›i video YouTube tráº£i nghiá»‡m thá»±c táº¿ tá»« cÆ° dÃ¢n chÃ­nh chá»§. ToÃ n bá»™ ná»™i dung tá»± Ä‘á»™ng Ä‘á»“ng bá»™ trÃªn trang Dá»‹ch Vá»¥ CÆ° DÃ¢n.
              </p>
            </div>

            <button
              onClick={() => {
                const title = prompt('Nháº­p tiÃªu Ä‘á» bÃ i PR / Review:');
                if (!title) return;
                const partnerName = prompt('TÃªn cá»­a hÃ ng / Äá»‘i tÃ¡c:') || 'Cá»­a hÃ ng xÃ¡c minh';
                const partnerCategory = prompt('Danh má»¥c (F&B / Giáº·t lÃ  / Sá»­a chá»¯a...):') || 'Dá»‹ch Vá»¥ CÆ° DÃ¢n';
                const youtubeUrl = prompt('Link Video YouTube (náº¿u cÃ³):') || '';
                const content = prompt('Ná»™i dung bÃ i viáº¿t review:') || 'BÃ i viáº¿t review tráº£i nghiá»‡m tá»« cÆ° dÃ¢n.';
                const authorName = prompt('TÃªn ngÆ°á»i Ä‘Äƒng:') || 'BQL / CÆ° DÃ¢n';
                const authorRoom = prompt('Sá»‘ cÄƒn / TÃ²a nhÃ :') || 'Vinhomes';

                fetch('/api/reputation-posts', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title,
                    partnerName,
                    partnerCategory,
                    content,
                    rating: 0,
                    authorName,
                    authorRoom,
                    youtubeUrl,
                    status: 'approved'
                  })
                })
                .then(res => res.json())
                .then(newPost => {
                  setAdminReputationPosts(prev => [newPost, ...prev]);
                  alert('ðŸŽ‰ ÄÄƒng bÃ i PR thÃ nh cÃ´ng!');
                })
                .catch(err => {
                  console.error(err);
                  alert('Lá»—i Ä‘Äƒng bÃ i PR');
                });
              }}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ ÄÄƒng BÃ i PR Admin</span>
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
                      <span>ðŸª {post.partnerName}</span>
                      <span className="text-xs text-amber-500 font-extrabold">â­ {post.rating}.0</span>
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
                      âœï¸ {post.authorName} ({post.authorRoom})
                    </span>

                    <button
                      onClick={() => {
                        if (confirm(`Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a bÃ i PR "${post.title}"?`)) {
                          fetch(`/api/reputation-posts/${post.id}`, { method: 'DELETE' })
                            .then(() => {
                              setAdminReputationPosts(prev => prev.filter(p => p.id !== post.id));
                            })
                            .catch(err => console.error(err));
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs transition border border-rose-200 dark:border-rose-800 cursor-pointer"
                    >
                      ðŸ—‘ï¸ XÃ³a BÃ i
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

      {/* Edit / Add FAQ Modal */}
      {(editingFaq || isAddingFaq) && (
        <EditFaqModal
          faqItem={editingFaq}
          isCreate={isAddingFaq}
          onClose={() => {
            setEditingFaq(null);
            setIsAddingFaq(false);
          }}
          onSave={async (item) => {
            try {
              const token = localStorage.getItem('token');
              const isEdit = Boolean(editingFaq);
              const res = await fetch(`/api/faq${isEdit ? `/${item.id}` : ''}`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(item)
              });
              if (res.ok) {
                // Refresh FAQ list
                const data = await fetch('/api/faq').then(r => r.json());
                if (Array.isArray(data.faq)) setAdminFaq(data.faq);
              }
            } catch (err) {
              console.error('Error saving FAQ:', err);
            }
            setEditingFaq(null);
            setIsAddingFaq(false);
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
                THÃŠM THÃ€NH VIÃŠN / TÃ€I KHOáº¢N Má»šI
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
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Há» & TÃªn thÃ nh viÃªn *</label>
                <input
                  type="text"
                  required
                  placeholder="VÃ­ dá»¥: Nguyá»…n VÄƒn A"
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
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Sá»‘ Ä‘iá»‡n thoáº¡i / Zalo</label>
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
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Vai trÃ² & Cáº¥p báº­c</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="owner">ðŸ  CÆ° DÃ¢n / Chá»§ NhÃ </option>
                    <option value="sale">ðŸ’¼ MÃ´i Giá»›i / Sale BÄS</option>
                    <option value="admin">ðŸ‘‘ Quáº£n Trá»‹ ViÃªn (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Máº­t kháº©u ban Ä‘áº§u</label>
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
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">LÆ°á»£t Up-Tin táº·ng ban Ä‘áº§u</label>
                  <input
                    type="number"
                    value={userFormData.upTinCredits}
                    onChange={(e) => setUserFormData(p => ({ ...p, upTinCredits: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Sá»‘ dÆ° VÃ­ VNÄ (Ä‘)</label>
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
                  Há»§y Bá»
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition shadow-md cursor-pointer"
                >
                  Táº O THÃ€NH VIÃŠN
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
                Cáº¬P NHáº¬T THÃ”NG TIN THÃ€NH VIÃŠN
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
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Há» & TÃªn</label>
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
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Sá»‘ Ä‘iá»‡n thoáº¡i / Zalo</label>
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
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Vai trÃ² & Cáº¥p báº­c</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="owner">ðŸ  CÆ° DÃ¢n / Chá»§ NhÃ </option>
                    <option value="sale">ðŸ’¼ MÃ´i Giá»›i / Sale BÄS</option>
                    <option value="admin">ðŸ‘‘ Quáº£n Trá»‹ ViÃªn (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">LÆ°á»£t Up-Tin</label>
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
                    Há»“ SÆ¡ Doanh Nghiá»‡p & PhÃ¡p LÃ½ (MST / ÄKKD)
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">XÃ¡c minh B2B</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-0.5">TÃªn CÃ´ng Ty / Doanh Nghiá»‡p</label>
                    <input
                      type="text"
                      placeholder="VD: SÃ n BÄS NewHome / Cty XÃ¢y Dá»±ng An PhÃ¡t"
                      value={editingUser.companyName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, companyName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-0.5">MÃ£ Sá»‘ Thuáº¿ (MST)</label>
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
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-0.5">Link áº¢nh Giáº¥y PhÃ©p ÄKKD</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editingUser.businessLicenseUrl || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, businessLicenseUrl: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-0.5">Chá»©ng Chá»‰ Nghá» / Giáº¥y PhÃ©p Con</label>
                    <input
                      type="text"
                      placeholder="Chá»©ng chá»‰ MÃ´i giá»›i BÄS / DÆ°á»£c / ATTP..."
                      value={editingUser.brokerLicenseUrl || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, brokerLicenseUrl: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Sá»‘ dÆ° VÃ­ VNÄ (Ä‘)</label>
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
                  Há»§y Bá»
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition shadow-md cursor-pointer"
                >
                  LÆ¯U THAY Äá»”I
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
                  {editingService ? 'âœï¸ CHá»ˆNH Sá»¬A Dá»ŠCH Vá»¤ CÆ¯ DÃ‚N' : 'âž• THÃŠM Dá»ŠCH Vá»¤ CÆ¯ DÃ‚N Má»šI'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddServiceModal(false);
                  setEditingService(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold transition cursor-pointer"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleSaveResidentServiceSubmit} className="p-4 sm:p-6 space-y-4 text-xs pb-28 sm:pb-6">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  TÃªn Dá»‹ch Vá»¥ / NgÃ nh Nghá» CÆ° DÃ¢n (*):
                </label>
                <input
                  type="text"
                  required
                  placeholder="VÃ­ dá»¥: Sá»­a Chá»¯a Thang MÃ¡y, Láº¯p Äáº·t Smarthome, Taxi Ná»™i Khu..."
                  value={newSrvTitle}
                  onChange={(e) => setNewSrvTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Danh Má»¥c NgÃ nh Nghá» (*):
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
                    Khu ÄÃ´ Thá»‹ / Dá»± Ãn (*):
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
                    <option value="ToÃ n Há»‡ Thá»‘ng Vinhomes">ToÃ n Há»‡ Thá»‘ng Vinhomes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Há» TÃªn NhÃ  Cung Cáº¥p / CÆ° DÃ¢n:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyá»…n VÄƒn A"
                    value={newSrvProviderName}
                    onChange={(e) => setNewSrvProviderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Sá»‘ Äiá»‡n Thoáº¡i (*):
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
                    Link/SÄT Zalo ChÃ­nh Chá»§:
                  </label>
                  <input
                    type="text"
                    placeholder="0987654321 hoáº·c link Zalo"
                    value={newSrvProviderZalo}
                    onChange={(e) => setNewSrvProviderZalo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  GiÃ¡ Hiá»ƒn Thá»‹ (VÃ­ dá»¥: 150.000Ä‘/giá», BÃ¡o giÃ¡ theo khá»‘i lÆ°á»£ng...):
                </label>
                <input
                  type="text"
                  placeholder="Thá»a thuáº­n / 200.000Ä‘"
                  value={newSrvPrice}
                  onChange={(e) => setNewSrvPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Äá»‹a Chá»‰ / CÄƒn Há»™ / TÃ²a NhÃ :
                </label>
                <input
                  type="text"
                  placeholder="VÃ­ dá»¥: TÃ²a S2.01, Ocean Park 1"
                  value={newSrvAddress}
                  onChange={(e) => setNewSrvAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  MÃ´ Táº£ Chi Tiáº¿t Dá»‹ch Vá»¥:
                </label>
                <textarea
                  rows={3}
                  placeholder="MÃ´ táº£ nÄƒng lá»±c, trang thiáº¿t bá»‹, thá»i gian phá»¥c vá»¥, cam káº¿t cháº¥t lÆ°á»£ng..."
                  value={newSrvDesc}
                  onChange={(e) => setNewSrvDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none scroll-mt-24"
                />
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 text-xs">
                    ðŸ“· HÃ¬nh áº¢nh Dá»‹ch Vá»¥:
                  </label>
                  <label className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ðŸ“ Táº£i áº¢nh Tá»« MÃ¡y</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const preview = await createInstantPreview(file);
                            setNewSrvImage(preview);
                            // Upload lÃªn server -> URL public
                            const urls = await uploadFiles([file]);
                            if (urls[0]) setNewSrvImage(urls[0]);
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
                    <img loading="lazy" src={newSrvImage} alt="Service preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewSrvImage('')}
                      className="absolute top-1 right-1 w-6 h-6 bg-rose-600 text-white rounded-md flex items-center justify-center text-xs"
                    >
                      âœ•
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
                  Há»§y Bá»
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl transition shadow-lg hover:brightness-110 cursor-pointer"
                >
                  {editingService ? 'LÆ¯U Cáº¬P NHáº¬T' : 'âž• THÃŠM Dá»ŠCH Vá»¤ Má»šI'}
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
                {editingPkgModal ? `Sá»¬A GÃ“I: ${editingPkgModal.name}` : 'THÃŠM GÃ“I Dá»ŠCH Vá»¤ Má»šI'}
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
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">TÃªn GÃ³i Dá»‹ch Vá»¥ *</label>
                <input
                  type="text"
                  required
                  placeholder="VÃ­ dá»¥: GÃ“I Cá»¬A HÃ€NG Äáº¢M Báº¢O"
                  value={pkgFormData.name}
                  onChange={(e) => setPkgFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">GiÃ¡ Hiá»ƒn Thá»‹ *</label>
                  <input
                    type="text"
                    required
                    placeholder="1.990.000Ä‘"
                    value={pkgFormData.priceDisplay}
                    onChange={(e) => setPkgFormData(p => ({ ...p, priceDisplay: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Sá»‘ Tiá»n Sá»‘ (Ä‘)</label>
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
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">ÄÆ¡n Vá»‹ TÃ­nh</label>
                  <input
                    type="text"
                    placeholder="/ nÄƒm, / thÃ¡ng, / bÃ i"
                    value={pkgFormData.unit}
                    onChange={(e) => setPkgFormData(p => ({ ...p, unit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">NhÃ£n Huy Hiá»‡u (Badge)</label>
                  <input
                    type="text"
                    placeholder="ðŸ”¥ Ná»”I Báº¬T NHáº¤T"
                    value={pkgFormData.badge}
                    onChange={(e) => setPkgFormData(p => ({ ...p, badge: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">MÃ´ Táº£ Ngáº¯n</label>
                <input
                  type="text"
                  placeholder="MÃ´ táº£ cÃ´ng dá»¥ng gÃ³i..."
                  value={pkgFormData.description}
                  onChange={(e) => setPkgFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">TÃ­nh NÄƒng Bao Gá»“m (Má»—i dÃ²ng 1 tÃ­nh nÄƒng)</label>
                <textarea
                  rows={4}
                  placeholder="Bao gá»“m toÃ n bá»™ gÃ³i Tick Xanh&#10;Huy hiá»‡u Cá»­a HÃ ng Äáº£m Báº£o&#10;Æ¯u tiÃªn há»— trá»£ tá»« Admin"
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
                  ÄÃ¡nh dáº¥u GÃ³i ÄÆ¯á»¢C CHá»ŒN NHIá»€U NHáº¤T (Ná»•i báº­t)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPkgModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Há»§y Bá»
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  LÆ¯U GÃ“I Dá»ŠCH Vá»¤
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: QUáº¢N TRá»Š CHI TIáº¾T GIAN HÃ€NG & Dá»ŠCH Vá»¤ CÆ¯ DÃ‚N ==================== */}
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
                  <img loading="lazy"
                    src={selectedAdminStore.logoUrl || ''}
                    alt={selectedAdminStore.storeName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full uppercase">
                        {selectedAdminStore.category || 'Gian HÃ ng CÆ° DÃ¢n'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        selectedAdminStore.status === 'approved' || selectedAdminStore.status === undefined
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {selectedAdminStore.status === 'approved' || selectedAdminStore.status === undefined ? 'âœ“ Äang Hiá»ƒn Thá»‹ Web' : 'â³ Chá» Duyá»‡t / Táº¡m áº¨n'}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
                      {selectedAdminStore.storeName}
                    </h2>
                    <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3 mt-1 font-medium">
                      <span>ðŸ‘¤ Chá»§ shop: <strong>{selectedAdminStore.ownerName}</strong></span>
                      {storePhone && (
                        <span>ðŸ“ž SÄT: <a href={`tel:${storePhone}`} className="text-amber-400 hover:underline font-mono font-bold">{storePhone}</a></span>
                      )}
                      <span>ðŸ“ Dá»± Ã¡n: <strong>{selectedAdminStore.project?.toUpperCase() || 'VINHOMES'}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAdminStore(null)}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-base transition cursor-pointer"
                >
                  âœ•
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
                    <span>Sáº£n Pháº©m Gian HÃ ng ({storeProds.length})</span>
                    {pendingProdsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                        {pendingProdsCount} chá»
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
                    <span>Dá»‹ch Vá»¥ CÆ° DÃ¢n Cung Cáº¥p ({matchingServs.length})</span>
                    {pendingServsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                        {pendingServsCount} chá»
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
                    <span>ThÃ´ng Tin & KiotViet POS</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {storeDetailActiveTab === 'products' && (
                    <button
                      onClick={() => handleOpenAddProduct(selectedAdminStore.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ThÃªm Sáº£n Pháº©m Má»›i</span>
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
                      <span>ThÃªm Dá»‹ch Vá»¥ Má»›i</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                
                {/* TAB 1: Sáº¢N PHáº¨M GIAN HÃ€NG */}
                {storeDetailActiveTab === 'products' && (
                  <div className="space-y-4">
                    {storeProds.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                        <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
                        <p className="font-bold text-sm text-slate-600 dark:text-slate-400">
                          Gian hÃ ng nÃ y chÆ°a cÃ³ sáº£n pháº©m nÃ o.
                        </p>
                        <button
                          onClick={() => handleOpenAddProduct(selectedAdminStore.id)}
                          className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-500"
                        >
                          âž• ThÃªm Sáº£n Pháº©m Äáº§u TiÃªn
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
                                <img loading="lazy"
                                  src={prod.images?.[0] || ''}
                                  alt={prod.name}
                                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                <div className="min-w-0 flex-1 space-y-1">
                                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">
                                    {prod.name}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="font-black text-amber-500">
                                      {prod.price.toLocaleString('vi-VN')}Ä‘
                                    </span>
                                    {prod.unit && <span className="text-slate-400 text-[10px]">/ {prod.unit}</span>}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span>Tá»“n: <strong>{prod.stockQuantity}</strong></span>
                                    <span>â€¢</span>
                                    <span>{prod.category}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Moderation Status Tag */}
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                                <div>
                                  {isPending ? (
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] rounded-md border border-amber-500/30 flex items-center gap-1">
                                      â³ Chá» duyá»‡t (Chá»‰ cÆ° dÃ¢n tháº¥y)
                                    </span>
                                  ) : isApproved ? (
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-md border border-emerald-500/30 flex items-center gap-1">
                                      âœ“ ÄÃ£ duyá»‡t â€¢ Hiá»‡n trÃªn Web
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-600 dark:text-red-400 font-extrabold text-[10px] rounded-md border border-red-500/30 flex items-center gap-1">
                                      âŒ Táº¡m áº©n
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
                                  title={isApproved ? "Chuyá»ƒn vá» Chá» duyá»‡t / Táº¡m áº©n" : "Duyá»‡t hiá»ƒn thá»‹ lÃªn Website"}
                                  className={`py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                    isApproved
                                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white'
                                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                                  }`}
                                >
                                  {isApproved ? 'áº¨n web' : 'âœ“ Duyá»‡t'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3 text-blue-500" />
                                  <span>Sá»­a</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteStoreProduct(selectedAdminStore.id, prod.id)}
                                  className="py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>XÃ³a</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Dá»ŠCH Vá»¤ CÆ¯ DÃ‚N LIÃŠN QUAN */}
                {storeDetailActiveTab === 'services' && (
                  <div className="space-y-4">
                    {matchingServs.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                        <Wrench className="w-10 h-10 text-slate-400 mx-auto" />
                        <p className="font-bold text-sm text-slate-600 dark:text-slate-400">
                          ChÆ°a cÃ³ bÃ i dá»‹ch vá»¥ cÆ° dÃ¢n nÃ o Ä‘Æ°á»£c liÃªn káº¿t vá»›i sá»‘ Ä‘iá»‡n thoáº¡i nÃ y.
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
                          âž• ThÃªm Dá»‹ch Vá»¥ Má»›i
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
                                <img loading="lazy"
                                  src={srv.images?.[0] || ''}
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
                                    {srv.priceDisplay || srv.price || 'Thá»a thuáº­n'}
                                  </div>
                                </div>
                              </div>

                              {/* Status Tag */}
                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                <div>
                                  {isApproved ? (
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-md border border-emerald-500/30 flex items-center gap-1">
                                      âœ“ ÄÃ£ duyá»‡t â€¢ Hiá»‡n trÃªn Web
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] rounded-md border border-amber-500/30 flex items-center gap-1">
                                      â³ Chá» duyá»‡t (Chá»‰ cÆ° dÃ¢n tháº¥y)
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {srv.createdAt || 'Má»›i Ä‘Äƒng'}
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
                                  {isApproved ? 'áº¨n web' : 'âœ“ Duyá»‡t'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEditServiceClick(srv)}
                                  className="py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3 text-blue-500" />
                                  <span>Sá»­a</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteResidentService(srv.id)}
                                  className="py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>XÃ³a</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: THÃ”NG TIN GIAN HÃ€NG & KIOTVIET POS */}
                {storeDetailActiveTab === 'info' && (
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">TÃªn Gian HÃ ng:</span>
                        <p className="font-black text-slate-900 dark:text-white text-sm">{selectedAdminStore.storeName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Chá»§ Sá»Ÿ Há»¯u & SÄT:</span>
                        <p className="font-black text-slate-900 dark:text-white text-sm">
                          {selectedAdminStore.ownerName} â€¢ {storePhone}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Äá»‹a Chá»‰ Phá»¥c Vá»¥:</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{selectedAdminStore.address}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Dá»± Ãn & PhÃ¢n Khu:</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {selectedAdminStore.project?.toUpperCase()} â€¢ {selectedAdminStore.subdivision || 'Ná»™i khu'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-slate-400 font-bold block mb-1">MÃ´ Táº£ Gian HÃ ng:</span>
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
                          {selectedAdminStore.kiotVietConfig?.syncStatus === 'connected' ? 'âš¡ KiotViet POS Live Connected' : 'ChÆ°a káº¿t ná»‘i API POS KiotViet'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenEditStore(selectedAdminStore)}
                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                      >
                        Chá»‰nh Sá»­a ThÃ´ng Tin Gian HÃ ng
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Bottom Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Má»i thay Ä‘á»•i Ä‘Æ°á»£c tá»± Ä‘á»™ng cáº­p nháº­t ngay trÃªn há»‡ thá»‘ng Chá»£ CÆ° DÃ¢n 24H.</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setSelectedAdminStore(null)}
                    className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-300 cursor-pointer"
                  >
                    ÄÃ³ng
                  </button>
                  <button
                    onClick={() => {
                      handleSyncAllToWebsite();
                      setSelectedAdminStore(null);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-emerald-500/25 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Cáº¬P NHáº¬T & Äá»’NG Bá»˜ LÃŠN WEBSITE</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ==================== MODAL: THÃŠM / Sá»¬A Sáº¢N PHáº¨M GIAN HÃ€NG ==================== */}
      {showStoreProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-500" />
                <span>{editingStoreProduct ? 'CHá»ˆNH Sá»¬A Sáº¢N PHáº¨M' : 'THÃŠM Sáº¢N PHáº¨M Má»šI'}</span>
              </h3>
              <button
                onClick={() => setShowStoreProductModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleSaveStoreProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">TÃªn Sáº£n Pháº©m (*)</label>
                <input
                  type="text"
                  required
                  placeholder="VÃ­ dá»¥: CÆ¡m GÃ  Xá»‘i Má»¡ Sá»‘t Chua Ngá»t"
                  value={storeProductForm.name}
                  onChange={(e) => setStoreProductForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">MÃ£ SKU</label>
                  <input
                    type="text"
                    value={storeProductForm.code}
                    onChange={(e) => setStoreProductForm(p => ({ ...p, code: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Danh Má»¥c</label>
                  <select
                    value={storeProductForm.category}
                    onChange={(e) => setStoreProductForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    <option value="MÃ³n Ä‚n & Äá»“ Uá»‘ng">MÃ³n Ä‚n & Äá»“ Uá»‘ng</option>
                    <option value="Thá»±c Pháº©m TÆ°Æ¡i Sá»‘ng">Thá»±c Pháº©m TÆ°Æ¡i Sá»‘ng</option>
                    <option value="HÃ ng TiÃªu DÃ¹ng & Táº¡p HÃ³a">HÃ ng TiÃªu DÃ¹ng & Táº¡p HÃ³a</option>
                    <option value="Äá»“ Gia Dá»¥ng & Ná»™i Tháº¥t">Äá»“ Gia Dá»¥ng & Ná»™i Tháº¥t</option>
                    <option value="Dá»‹ch Vá»¥ CÆ° DÃ¢n">Dá»‹ch Vá»¥ CÆ° DÃ¢n</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">GiÃ¡ BÃ¡n (VNÄ) (*)</label>
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
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">ÄÆ¡n Vá»‹</label>
                  <input
                    type="text"
                    placeholder="suáº¥t, há»™p, cÃ¡i..."
                    value={storeProductForm.unit}
                    onChange={(e) => setStoreProductForm(p => ({ ...p, unit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Tá»“n Kho</label>
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
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300">HÃ¬nh áº¢nh Sáº£n Pháº©m (DÆ°á»›i 10MB)</label>
                  <label className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 shadow transition">
                    <Upload className="w-3 h-3" />
                    <span>ðŸ“ Táº£i Tá»« MÃ¡y</span>
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

                          addWatermarkToImage(file).then(async compressed => {
                            if (compressed) {
                              // Upload lÃªn server -> URL public
                              const url = isBase64DataUrl(compressed)
                                ? await uploadBase64DataUrl(compressed, 'store-products')
                                : compressed;
                              if (url) setStoreProductForm(p => ({ ...p, images: [url] }));
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
                    <img loading="lazy"
                      src={storeProductForm.images[0]}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">MÃ´ Táº£ Sáº£n Pháº©m</label>
                <textarea
                  rows={2}
                  placeholder="MÃ´ táº£ sáº£n pháº©m, thÃ nh pháº§n, cam káº¿t vá»‡ sinh an toÃ n..."
                  value={storeProductForm.description}
                  onChange={(e) => setStoreProductForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Moderation Status selector */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="block font-extrabold text-slate-700 dark:text-slate-300">
                  PhÃª Duyá»‡t Hiá»ƒn Thá»‹ Website:
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
                    <span>âœ“ ÄÃ£ Duyá»‡t (Hiá»‡n Web)</span>
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
                    <span>â³ Chá» Duyá»‡t (áº¨n Web)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStoreProductModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Há»§y Bá»
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  LÆ¯U Sáº¢N PHáº¨M
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: THÃŠM / Sá»¬A GIAN HÃ€NG CÆ¯ DÃ‚N ==================== */}
      {showStoreFormModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-500" />
                <span>{editingStoreItem ? 'CHá»ˆNH Sá»¬A GIAN HÃ€NG CÆ¯ DÃ‚N' : 'Táº O GIAN HÃ€NG Má»šI'}</span>
              </h3>
              <button
                onClick={() => setShowStoreFormModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleSaveStoreFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">TÃªn Gian HÃ ng (*)</label>
                <input
                  type="text"
                  required
                  placeholder="VÃ­ dá»¥: Báº¿p CÆ° DÃ¢n Vin - CÆ¡m NiÃªu Singapore"
                  value={storeFormData.storeName}
                  onChange={(e) => setStoreFormData(p => ({ ...p, storeName: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">TÃªn Chá»§ Shop</label>
                  <input
                    type="text"
                    placeholder="Nguyá»…n VÄƒn A"
                    value={storeFormData.ownerName}
                    onChange={(e) => setStoreFormData(p => ({ ...p, ownerName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Sá»‘ Äiá»‡n Thoáº¡i (*)</label>
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
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Dá»± Ãn Vinhomes</label>
                  <select
                    value={storeFormData.project}
                    onChange={(e) => setStoreFormData(p => ({ ...p, project: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    <option value="ocean-park-1">Ocean Park 1 (Gia LÃ¢m)</option>
                    <option value="ocean-park-2">Ocean Park 2 (The Empire)</option>
                    <option value="ocean-park-3">Ocean Park 3 (The Crown)</option>
                    <option value="smart-city">Smart City (TÃ¢y Má»—)</option>
                    <option value="grand-park">Grand Park (TP. Thá»§ Äá»©c)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">NgÃ nh HÃ ng</label>
                  <select
                    value={storeFormData.category}
                    onChange={(e) => setStoreFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Thá»±c Pháº©m & Ä‚n Uá»‘ng">Thá»±c Pháº©m & Ä‚n Uá»‘ng</option>
                    <option value="Ná»™i Tháº¥t & Gia Dá»¥ng">Ná»™i Tháº¥t & Gia Dá»¥ng</option>
                    <option value="Báº£o TrÃ¬ & Sá»­a Chá»¯a">Báº£o TrÃ¬ & Sá»­a Chá»¯a</option>
                    <option value="ChÄƒm SÃ³c & LÃ m Äáº¹p">ChÄƒm SÃ³c & LÃ m Äáº¹p</option>
                    <option value="Váº­n Táº£i & Chuyá»ƒn NhÃ ">Váº­n Táº£i & Chuyá»ƒn NhÃ </option>
                    <option value="GiÃ¡o Dá»¥c & RÃ¨n Luyá»‡n">GiÃ¡o Dá»¥c & RÃ¨n Luyá»‡n</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Äá»‹a Chá»‰ Phá»¥c Vá»¥</label>
                <input
                  type="text"
                  placeholder="VÃ­ dá»¥: Shophouse Sao Biá»ƒn 12-34, Vinhomes Ocean Park 2"
                  value={storeFormData.address}
                  onChange={(e) => setStoreFormData(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300">Logo Gian HÃ ng (DÆ°á»›i 10MB)</label>
                  <label className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 shadow transition">
                    <Upload className="w-3 h-3" />
                    <span>ðŸ“ Táº£i Logo</span>
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

                          addWatermarkToImage(file, { skipWatermark: true, maxDim: 600 }).then(async compressed => {
                            if (compressed) {
                              // Upload lÃªn server -> URL public
                              const url = isBase64DataUrl(compressed)
                                ? await uploadBase64DataUrl(compressed, 'store-logos')
                                : compressed;
                              if (url) setStoreFormData(p => ({ ...p, logoUrl: url }));
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
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">MÃ´ Táº£ Gian HÃ ng</label>
                <textarea
                  rows={2}
                  placeholder="MÃ´ táº£ phong cÃ¡ch, sáº£n pháº©m chÃ­nh, uy tÃ­n..."
                  value={storeFormData.description}
                  onChange={(e) => setStoreFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Status toggle */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="block font-extrabold text-slate-700 dark:text-slate-300">
                  Tráº¡ng ThÃ¡i PhÃª Duyá»‡t Gian HÃ ng:
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
                    <span>âœ“ ÄÃ£ Duyá»‡t (Hiá»‡n Web)</span>
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
                    <span>â³ Chá» Duyá»‡t (Táº¡m áº¨n)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStoreFormModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Há»§y Bá»
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  LÆ¯U GIAN HÃ€NG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
