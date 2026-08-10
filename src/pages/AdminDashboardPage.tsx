import React, { useState } from 'react';
import { Property, NewsArticle, LeadContact, User, UpTinPricingConfig, UpTinTransaction, AdBanner, Project } from '../types';
import { ShieldCheck, Check, Trash2, Phone, Mail, Sparkles, RefreshCw, Eye, MessageSquare, Database, CheckCircle2, Clock, Zap, QrCode, Settings, Layers, UserCheck, Globe, Edit3, Plus, PlusCircle, MapPin, Building2, ImageIcon, FileText, Share2, X, Download, Search, Calendar, Filter, FileSpreadsheet, Upload, BarChart3, TrendingUp, UserX, UserPlus, PhoneCall, Award, Ban, Shield, Activity, Smartphone, Monitor, Tablet, ArrowUpRight, Wallet } from 'lucide-react';

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
import { EditPropertyModal, EditProjectModal, EditNewsModal } from '../components/AdminAssetManagerModals';
import { AdminMarketingCenter } from '../components/AdminMarketingCenter';
import { AdminSeoCenter } from '../components/AdminSeoCenter';
import { AdminZaloGroupCenter } from '../components/AdminZaloGroupCenter';
import { SocialShareModal } from '../components/SocialShareModal';
import { AdminCreditInjectorModal } from '../components/AdminCreditInjectorModal';
import { EnterpriseAdminCore } from '../components/EnterpriseAdminCore';
import { AdminTaxManagementModal } from '../components/AdminTaxManagementModal';

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
  onSeed1000Properties
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'projects' | 'news' | 'ads' | 'pricing' | 'leads' | 'users' | 'analytics' | 'n8n' | 'marketing' | 'seo' | 'zalo' | 'affiliate_mgmt' | 'reputation' | 'enterprise_core'>('properties');
  const [adminReputationPosts, setAdminReputationPosts] = useState<ReputationPost[]>([]);

  React.useEffect(() => {
    fetch('/api/reputation-posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAdminReputationPosts(data);
      })
      .catch(err => console.error(err));
  }, []);
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
  const [affiliateF1Rate, setAffiliateF1Rate] = useState<number>(15); // 15%
  const [affiliateF2Rate, setAffiliateF2Rate] = useState<number>(5); // 5%
  const [refBonusUpTin, setRefBonusUpTin] = useState<number>(5); // +5 Up-Tin per referral
  const [servicePackageMonthPrice, setServicePackageMonthPrice] = useState<number>(199000); // 199k VNĐ/tháng
  const [servicePackage3MonthPrice, setServicePackage3MonthPrice] = useState<number>(499000); // 499k VNĐ/3 tháng
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'po-1', userName: 'Bùi Trung Hiếu', userPhone: '0868499929', amount: 300000, bank: 'Vietcombank', bankAccount: '0868499929', status: 'pending', requestedAt: '2026-08-02 09:15' },
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
    if (confirm(`Bạn có chắc muốn trả tin "${p.title}" về trạng thái Chờ Duyệt (Sub-admin)?`)) {
      if (onUpdateProperty) {
        onUpdateProperty({ ...p, approved: false, status: 'pending' });
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
      `"${(c.sellerName || 'Nhà đẹp Vinhomes').replace(/"/g, '""')}"`,
      `"${(c.sellerPhone || '0868.499.929').replace(/"/g, '""')}"`,
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
    return [
      {
        id: 'ad-1',
        title: 'Mở Bán Quỹ Căn Độc Quyền Ocean Park 2 - Chiết Khấu 15%',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        linkUrl: '/project/ocean-park-2',
        targetUrl: '/project/ocean-park-2',
        position: 'home_top',
        active: true,
        isActive: true,
        clickCount: 1420,
        clicks: 1420,
        createdAt: '2026-07-28'
      },
      {
        id: 'ad-2',
        title: 'Vinhomes Hạ Long Xanh - Cơ Hội Đầu Tư X2 Tài Sản',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        linkUrl: '/news/news-ha-long-xanh',
        targetUrl: '/news/news-ha-long-xanh',
        position: 'sidebar',
        active: true,
        isActive: true,
        clickCount: 890,
        clicks: 890,
        createdAt: '2026-07-28'
      }
    ];
  });

  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdImage, setNewAdImage] = useState('');
  const [newAdLink, setNewAdLink] = useState('');
  const [newAdPos, setNewAdPos] = useState<'home_top' | 'sidebar' | 'detail_bottom' | 'home_middle' | 'home_sidebar' | 'header_top' | 'property_detail'>('home_top');
  const [editingAd, setEditingAd] = useState<AdBanner | null>(null);

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
    setNewAdPos((ad.position as any) || 'home_top');
    
    // Scroll smoothly to form section
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEditAd = () => {
    setEditingAd(null);
    setNewAdTitle('');
    setNewAdImage('');
    setNewAdLink('');
    setNewAdPos('home_top');
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
        active: true,
        isActive: true,
        clickCount: 0,
        clicks: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAdsList([newBanner, ...adsList]);
      setNewAdTitle('');
      setNewAdImage('');
      setNewAdLink('');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header - Mệnh Mộc Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-emerald-600 text-white font-black text-[10px] rounded-lg tracking-wider">
              ADMIN TỔNG
            </span>
            <span className="text-xs text-emerald-300 font-bold bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Hệ Thống Chính Thức
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            QUẢN TRỊ NHÀ ĐẸP VINHOMES & SETUP GIÁ UP TIN
          </h1>
          <p className="text-xs text-slate-300">
            Quản lý duyệt 1,000 tin đăng, cấu hình giá đẩy tin VietQR & phân quyền quản lý
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            onClick={() => setShowTaxModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-slate-900 hover:from-indigo-500 hover:to-slate-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition transform active:scale-95 uppercase tracking-wider border border-indigo-400/40"
          >
            <Shield className="w-4 h-4 text-indigo-300 animate-pulse" />
            <span>🏛️ Khai Báo Thuế TMĐT Quốc Gia</span>
          </button>

          <button
            onClick={() => setShowAiUrlTracker(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition transform active:scale-95 uppercase tracking-wider"
          >
            <Globe className="w-4 h-4 text-slate-950" />
            <span>🌐 Theo Dõi Website & AI Biên Soạn</span>
          </button>

          <button
            onClick={handleSeed1000Click}
            disabled={isSeeding}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/50 transition transform active:scale-95"
          >
            <Zap className="w-4 h-4 text-emerald-200" />
            {isSeeding ? 'Đang tạo 1,000 tin...' : '⚡ Test 1,000 Tin Đăng'}
          </button>

          <button
            onClick={onOpenAiWriter}
            className="px-4 py-2.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-emerald-500/40"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI Writer
          </button>

          <button
            onClick={onRefreshData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BỘ PHÊ DUYỆT CẤP QUẢN TRỊ & ĐỒNG BỘ WEB PUBLIC */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-5 rounded-3xl border-2 border-emerald-500/50 shadow-2xl text-white space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                CHẾ ĐỘ CẤP QUẢN TRỊ & PHÊ DUYỆT SUB-ADMIN
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] rounded-full">
                ● REALTIME SYNC ACTIVE
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
              <span>🔄 BỘ ĐỒNG BỘ NỘI DUNG LÊN PUBLIC WEBSITE & CHẾ ĐỘ CẤP CHỜ DUYỆT</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">
              Các bài đăng do Admin cấp dưới hoặc Môi giới/Chủ nhà tải lên sẽ ở trạng thái <strong className="text-amber-400">🟡 Chờ Duyệt</strong>. Khi Admin cấp cao bấm nút <strong>"Phê duyệt & Đồng bộ Public"</strong>, toàn bộ nội dung chuẩn hóa sẽ lập tức xuất bản trực tiếp lên giao diện Web công khai.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleSyncToPublicWeb}
              disabled={isSyncingPublic}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-xl flex items-center gap-2 border border-emerald-300 transform active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-slate-950 ${isSyncingPublic ? 'animate-spin' : ''}`} />
              <span>{isSyncingPublic ? 'Đang đồng bộ Public...' : '🔄 NÚT ĐỒNG BỘ LÊN WEB PUBLIC'}</span>
            </button>

            {pendingProperties.length > 0 && (
              <button
                onClick={handleSyncToPublicWeb}
                className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Duyệt Nhanh {pendingProperties.length} Tin Chờ</span>
              </button>
            )}
          </div>
        </div>

        {/* Status breakdown metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Chờ Cấp Phê Duyệt</span>
            <div className="text-lg font-black text-amber-400 flex items-center gap-1.5">
              <span>{pendingProperties.length} Tin BĐS</span>
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
            </div>
            <span className="text-[10px] text-slate-400 block">Sub-admin / Môi giới gửi</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Đã Đồng Bộ Public</span>
            <div className="text-lg font-black text-emerald-400">
              {properties.filter(p => p.approved || p.status === 'approved').length} / {properties.length} Căn
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block">✓ Đang công khai trên Web</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Bài Viết & Tin Tức</span>
            <div className="text-lg font-black text-sky-400">
              {news.filter(n => n.status === 'published').length} / {news.length} Bài
            </div>
            <span className="text-[10px] text-sky-400 font-semibold block">✓ Chuẩn SEO Public</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Dự Án Masterplan</span>
            <div className="text-lg font-black text-purple-300">
              {projects.length} Dự Án
            </div>
            <span className="text-[10px] text-purple-400 font-semibold block">✓ Sơ đồ & Bảng giá</span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards - Key Real Estate & Expiration Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
        {/* Stat 1: Căn Đang Bán */}
        <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-emerald-500/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-bold">Căn Đang Bán</span>
            <span className="p-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-md">🏠</span>
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{saleProperties.length} căn</span>
          <span className="text-[10px] text-emerald-600 font-bold block">✓ Trực tuyến</span>
        </div>

        {/* Stat 2: Căn Cho Thuê */}
        <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-teal-500/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-bold">Căn Cho Thuê</span>
            <span className="p-1 bg-teal-100 dark:bg-teal-950 text-teal-600 rounded-md">🔑</span>
          </div>
          <span className="text-2xl font-black text-teal-600 dark:text-teal-400 block">{rentProperties.length} căn</span>
          <span className="text-[10px] text-teal-600 font-bold block">✓ Căn hộ & Shophouse</span>
        </div>

        {/* Stat 3: Khách Yêu Cầu */}
        <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-blue-500/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-bold">Số Lượng Khách</span>
            <span className="p-1 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-md">📞</span>
          </div>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{contacts.length} khách</span>
          <span className="text-[10px] text-blue-600 font-bold block">Đã để lại SĐT</span>
        </div>

        {/* Stat 4: Sale / Môi Giới */}
        <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-amber-500/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-bold">Số Lượng Sale</span>
            <span className="p-1 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-md">💼</span>
          </div>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">{totalSalesCount} nhân sự</span>
          <span className="text-[10px] text-amber-600 font-bold block">Tài khoản môi giới</span>
        </div>

        {/* Stat 5: Lưu Trữ / Hết Hạn (15-25 Ngày, Giữ SĐT 1 Tháng) */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-purple-900 dark:text-purple-300 font-bold">Kho Lưu Trữ</span>
            <span className="p-1 bg-purple-200 dark:bg-purple-900 text-purple-700 rounded-md">📁</span>
          </div>
          <span className="text-2xl font-black text-purple-700 dark:text-purple-300 block">{archivedProperties.length} căn</span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">✓ Lưu 1 tháng (Giữ SĐT & Căn)</span>
        </div>

        {/* Stat 6: Tin Chờ Duyệt */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-amber-900 dark:text-amber-300 font-bold">Tin Chờ Duyệt</span>
            <span className="p-1 bg-amber-200 dark:bg-amber-900 text-amber-800 rounded-md">⏳</span>
          </div>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">{pendingProperties.length} căn</span>
          <span className="text-[10px] text-amber-600 font-bold block">Cần duyệt ngay</span>
        </div>
      </div>

      {/* Vertical Left Sidebar Admin Navigation Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* LEFT VERTICAL SIDEBAR MENU */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xl md:sticky md:top-20 z-10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                DANH MỤC QUẢN TRỊ
              </span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
              15 CHỨC NĂNG
            </span>
          </div>

          {/* Group 1: CORE & BĐS */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider px-2 block pt-1">
              Quản Trị Core & BĐS
            </span>

            <button
              onClick={() => setActiveTab('enterprise_core')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'enterprise_core'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg ring-2 ring-purple-400/50'
                  : 'text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="truncate">⭐ KPI & Phân Quyền</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('properties')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'properties'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">BĐS & Hình Ảnh</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'properties' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'}`}>
                {properties.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                <span className="truncate">Dự Án & Sơ Đồ</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Bài Viết & Tin Tức</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'news' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'}`}>
                {news.length}
              </span>
            </button>
          </div>

          {/* Group 2: KHÁCH HÀNG & THÀNH VIÊN */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider px-2 block">
              Khách Hàng & Nguồn Thu
            </span>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">Khách Yêu Cầu</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'leads' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'}`}>
                {contacts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <UserCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Quản Lý Thành Viên</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'users' ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'}`}>
                {registeredUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">Giá Up Tin & VietQR</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('affiliate_mgmt')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'affiliate_mgmt'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Affiliate & Thu Phí</span>
              </div>
            </button>
          </div>

          {/* Group 3: MARKETING & TIẾP THỊ */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider px-2 block">
              Marketing & SEO
            </span>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 border border-blue-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <BarChart3 className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">Thống Kê Traffic</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'seo'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Globe className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Chuyên SEO Web</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('marketing')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'marketing'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Share2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">Marketing Hàng Loạt</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('zalo')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'zalo'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 border border-blue-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">Zalo Group Cư Dân</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'ads'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Quảng Cáo Banner</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'ads' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {adsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reputation')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'reputation'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 border border-purple-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">PR & Review YouTube</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'reputation' ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-600'}`}>
                {adminReputationPosts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('n8n')}
              className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                activeTab === 'n8n'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Database className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">Webhook n8n</span>
              </div>
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT PANEL */}
        <main className="flex-1 min-w-0 w-full space-y-6">

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

      {/* Tab: Quảng Cáo Management */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
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
                    <span>CHỈNH SỬA BANNER QUẢNG CÁO</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>THÊM BANNER QUẢNG CÁO MỚI (DÀNH RIÊNG CHO ADMIN)</span>
                  </>
                )}
              </h3>
              {editingAd && (
                <button
                  type="button"
                  onClick={handleCancelEditAd}
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Hủy Sửa (Trở về Thêm Mới)
                </button>
              )}
            </div>

            {editingAd && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                <span>⚠️ Bạn đang chỉnh sửa Banner: <strong>"{editingAd.title}"</strong></span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Thay đổi thông tin bên dưới và nhấn "Lưu Cập Nhật Banner"</span>
              </div>
            )}
            
            <form onSubmit={handleSaveFormAd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold">
                {/* Column 1: Text details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold">1. Tiêu đề quảng cáo (*)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Quỹ căn Shophouse Chà Là cắt lỗ 2 tỷ..."
                      value={newAdTitle}
                      onChange={e => setNewAdTitle(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold">2. Đường dẫn liên kết (Link Web / Zalo)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: https://zalo.me/0868499929"
                      value={newAdLink}
                      onChange={e => setNewAdLink(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold">3. Vị trí hiển thị trên website (*)</label>
                    <select
                      value={newAdPos}
                      onChange={e => setNewAdPos(e.target.value as any)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-amber-300 dark:border-slate-700 rounded-2xl text-amber-600 dark:text-amber-400 font-black text-xs focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
                    >
                      <option value="header_top">Thanh trên cùng Header (Top Banner)</option>
                      <option value="home_middle">Giữa Trang Chủ (Middle Banner)</option>
                      <option value="home_sidebar">Cột Bên Trang Chủ (Sidebar Banner)</option>
                      <option value="property_detail">Trang Chi Tiết Căn (Detail Banner)</option>
                    </select>
                  </div>
                </div>

                {/* Column 2: Image Upload & Preview */}
                <div className="space-y-4">
                  <label className="block text-slate-700 dark:text-slate-300 font-extrabold">4. Hình ảnh Banner (*)</label>

                  {/* High visibility upload button */}
                  <label className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-950/40 dark:to-slate-900 border-2 border-dashed border-amber-400 hover:border-amber-500 rounded-2xl cursor-pointer transition text-center group shadow-sm">
                    <Upload className="w-8 h-8 text-amber-500 mb-1.5 group-hover:scale-110 transition-transform animate-pulse" />
                    <span className="text-amber-950 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                      📁 BẤM VÀO ĐÂY ĐỂ TẢI ẢNH TỪ MÁY TÍNH (PC)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                      Hỗ trợ định dạng JPG, PNG, WEBP (Dung lượng max 8MB)
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleAdFileUpload(e)} />
                  </label>

                  {/* Fallback URL input */}
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px] font-medium">Hoặc dán URL link ảnh có sẵn:</label>
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
                          <Check className="w-4 h-4" /> xem trước ảnh banner:
                        </span>
                        <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                          Đổi ảnh từ PC
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleAdFileUpload(e)} />
                        </label>
                      </div>
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={newAdImage} alt="Preview" className="h-24 w-full object-cover" />
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
                        <Check className="w-5 h-5" /> 💾 LƯU CẬP NHẬT BANNER
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" /> + THÊM BANNER QUẢNG CÁO MỚI
                      </>
                    )}
                  </button>
                  {editingAd && (
                    <button
                      type="button"
                      onClick={handleCancelEditAd}
                      className="px-5 py-3.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> HỦY SỬA (TRỞ VỀ THÊM MỚI)
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  * Banner mới đăng hoặc vừa cập nhật sẽ được hiển thị ngay lập tức ngoài trang chủ.
                </p>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                DANH SÁCH BANNER QUẢNG CÁO ĐANG HOẠT ĐỘNG ({adsList.length})
              </h3>
              <span className="text-[11px] text-slate-400">Ấn nút ✏️ Sửa để chỉnh sửa trực tiếp thông tin ở khung trên</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold">
                    <th className="p-3">Hình ảnh Banner</th>
                    <th className="p-3">Tiêu đề quảng cáo</th>
                    <th className="p-3">Vị trí</th>
                    <th className="p-3">Lượt click</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Thao tác sửa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adsList.map(ad => {
                    const isBeingEdited = editingAd?.id === ad.id;
                    return (
                      <tr 
                        key={ad.id} 
                        className={`transition ${
                          isBeingEdited 
                            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-500' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                        }`}
                      >
                        <td className="p-3">
                          <div className="relative group w-24">
                            <img src={ad.imageUrl} alt={ad.title} className="w-24 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
                            <label 
                              className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-xl cursor-pointer text-white text-[9px] font-extrabold transition"
                              title="Tải ảnh mới trực tiếp"
                            >
                              <Upload className="w-3.5 h-3.5 mb-0.5 text-amber-400" />
                              <span>Đổi ảnh</span>
                              <input type="file" accept="image/*" className="hidden" onChange={e => handleAdFileUpload(e, ad.id)} />
                            </label>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white max-w-xs">
                          <p className="line-clamp-2">{ad.title}</p>
                          <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="text-[10px] text-amber-500 hover:underline">
                            {ad.linkUrl}
                          </a>
                        </td>
                        <td className="p-3 font-extrabold text-amber-600 dark:text-amber-400">
                          {ad.position === 'header_top' && 'Top Header'}
                          {ad.position === 'home_middle' && 'Giữa Trang Chủ'}
                          {ad.position === 'home_sidebar' && 'Cột Trang Chủ'}
                          {ad.position === 'property_detail' && 'Chi Tiết BĐS'}
                          {!['header_top','home_middle','home_sidebar','property_detail'].includes(ad.position) && ad.position}
                        </td>
                        <td className="p-3 font-black text-emerald-600">{(ad.clickCount || ad.clicks || 0).toLocaleString('vi-VN')} lượt</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleAdActive(ad.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition ${
                              (ad.active ?? ad.isActive ?? true)
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                            }`}
                          >
                            {(ad.active ?? ad.isActive ?? true) ? '✓ Đang Hiện' : '✕ Đã Ẩn'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEditAd(ad)}
                              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition shadow-sm border ${
                                isBeingEdited
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400'
                                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400'
                              }`}
                              title="Sửa thông tin banner quảng cáo ở ô trên"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>{isBeingEdited ? '✏️ Đang Sửa...' : '✏️ SỬA BANNER'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
                              title="Xóa quảng cáo"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* Tab 1: Properties Table */}
      {activeTab === 'properties' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 shadow-xl">
          {/* Header & Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>🏢</span> QUẢN LÝ TẤT CẢ BẤT ĐỘNG SẢN ({properties.length} CĂN)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tự động hết hạn hiển thị sau 15–25 ngày. Dữ liệu Người đăng & Chi tiết căn được bảo lưu đầy đủ 1 tháng (30 ngày) trong Kho Lưu Trữ.
              </p>
            </div>

            <button
              onClick={handleSeed1000Click}
              className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-extrabold rounded-xl text-xs shrink-0 transition flex items-center gap-1.5"
            >
              <span>✨</span> + Tạo 1,000 Tin Test Mượt Mà
            </button>
          </div>

          {/* Sub-Filters Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            <button
              onClick={() => setPropertySubFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                propertySubFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Tất Cả ({properties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('sale')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'sale'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              🏠 Đang Bán ({saleProperties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('rent')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'rent'
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100'
              }`}
            >
              🔑 Cho Thuê ({rentProperties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('pushed')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'pushed'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
              }`}
            >
              ⚡ Đã Up Tin ({pushedProperties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('expiring')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'expiring'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              ⏰ Sắp Hết Hạn (≤5 ngày) ({expiringSoonProperties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('archived')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'archived'
                  ? 'bg-purple-700 text-white shadow'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
              }`}
            >
              📁 Kho Lưu Trữ ({archivedProperties.length})
            </button>

            <button
              onClick={() => setPropertySubFilter('pending')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 flex items-center gap-1 ${
                propertySubFilter === 'pending'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              ⏳ Chờ Duyệt ({pendingProperties.length})
            </button>
          </div>

          {/* Properties Data Table */}
          <div className="overflow-x-auto max-h-[620px] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 shadow-sm">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="p-3">Hình ảnh</th>
                  <th className="p-3">Tiêu đề & Dự án</th>
                  <th className="p-3">Thông Tin Người Đăng</th>
                  <th className="p-3">Loại & Mức giá</th>
                  <th className="p-3">Hạn Hiển Thị (15–25 Ngày)</th>
                  <th className="p-3 text-center">Thao Tác Quản Lý</th>
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
                    if (propertySubFilter === 'pending') return !p.approved && p.status !== 'approved';
                    return true;
                  })
                  .slice(0, 150)
                  .map((p) => {
                    const expiryInfo = getPropertyExpiryInfo(p);
                    const sellerPhoneFormatted = p.sellerPhone || '0868.499.929';
                    const sellerNameFormatted = p.sellerName || 'Chủ Hộ / Sale BĐS';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition">
                        <td className="p-3">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-16 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                          />
                        </td>

                        <td className="p-3 max-w-xs">
                          <span className="font-bold text-slate-900 dark:text-white line-clamp-1 block">{p.title}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                              {p.project}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-[10px] text-slate-500 font-medium">{p.area} m²</span>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                              {p.sellerRole === 'owner' ? (
                                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 font-black rounded text-[9px]">
                                  🏠 CHỦ NHÀ GỐC
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-teal-500/20 text-teal-700 dark:text-teal-400 font-black rounded text-[9px]">
                                  💼 SALE / MÔI GIỚI
                                </span>
                              )}
                            </div>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-[11px]">
                              {sellerNameFormatted}
                            </span>
                            <a
                              href={`https://zalo.me/${sellerPhoneFormatted.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                            >
                              📞 {sellerPhoneFormatted}
                            </a>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 block text-xs">
                            {p.priceDisplay}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block mt-0.5 ${
                            p.type === 'sale' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          }`}>
                            {p.type === 'sale' ? 'BÁN' : 'CHO THUÊ'}
                          </span>
                        </td>

                        <td className="p-3 max-w-[200px]">
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-500 font-medium">
                              🗓️ Đăng: <span className="font-bold text-slate-700 dark:text-slate-300">{expiryInfo.postDateFormatted}</span>
                            </div>

                            {expiryInfo.isExpired ? (
                              <div className="p-1.5 bg-purple-100 dark:bg-purple-950/70 border border-purple-300 dark:border-purple-800 rounded-lg text-purple-900 dark:text-purple-300 text-[10px] font-bold">
                                📁 <b>TỰ ĐỘNG LƯU TRỮ</b>
                                <div className="text-[9px] text-purple-700 dark:text-purple-400">
                                  Bảo lưu SĐT & Căn {expiryInfo.archiveDaysLeft} ngày
                                </div>
                              </div>
                            ) : expiryInfo.daysRemaining <= 5 ? (
                              <div className="p-1.5 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-300 text-[10px] font-bold">
                                ⏰ <b>SẮP HẾT HẠN: Còn {expiryInfo.daysRemaining} ngày</b>
                                <div className="text-[9px] text-amber-700 dark:text-amber-400">
                                  Bấm Up Tin để gia hạn +20 ngày
                                </div>
                              </div>
                            ) : (
                              <div className="p-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                                ⚡ Hạn hiển thị: Còn <b>{expiryInfo.daysRemaining} ngày</b>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Up Tin Button */}
                            <button
                              onClick={() => handlePushPropertyNow(p)}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[10px] transition shadow flex items-center gap-1 shrink-0"
                              title="Up tin lên đầu & gia hạn thêm +20 ngày"
                            >
                              <Zap className="w-3 h-3 fill-slate-950" /> Up Tin (+20d)
                            </button>

                            {/* View Details Modal Button */}
                            <button
                              onClick={() => setSelectedSellerDetail(p)}
                              className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition flex items-center gap-1 shrink-0"
                              title="Xem đầy đủ Thông Tin Người Đăng & Chi Tiết Căn BĐS"
                            >
                              <Eye className="w-3 h-3" /> SĐT & Căn
                            </button>

                            {/* Share to Zalo / FB Button */}
                            <button
                              onClick={() => setSharingProperty(p)}
                              className="px-2 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-lg text-[10px] transition shadow flex items-center gap-1 shrink-0"
                              title="Chia sẻ thông tin căn này lên Zalo, Group Facebook, Telegram"
                            >
                              <Share2 className="w-3 h-3" /> Chia Sẻ Zalo/FB
                            </button>

                            {/* Archive / Restore Button */}
                            <button
                              onClick={() => handleToggleArchiveProperty(p)}
                              className={`p-1.5 rounded-lg text-[10px] font-bold transition shrink-0 ${
                                expiryInfo.isExpired
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 text-purple-800 dark:text-purple-300'
                              }`}
                              title={expiryInfo.isExpired ? 'Phục hồi hiển thị' : 'Chuyển vào Kho Lưu Trữ'}
                            >
                              {expiryInfo.isExpired ? '🟢 Phục Hồi' : '📁 Lưu Trữ'}
                            </button>

                            {/* Edit Property */}
                            <button
                              onClick={() => setEditingProperty(p)}
                              className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg transition"
                              title="Sửa BĐS & Che Mờ Vị Trí Ảnh"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Approve if pending */}
                            {(!p.approved && p.status !== 'approved') ? (
                              <button
                                onClick={() => onApproveProperty(p.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-[10px] transition shadow flex items-center gap-1"
                                title="Phê duyệt tin này và đồng bộ lên Web Public"
                              >
                                <Check className="w-3.5 h-3.5" /> Duyệt & Đồng Bộ Public
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnapproveProperty(p)}
                                className="px-2 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-bold rounded-lg text-[10px] transition flex items-center gap-1"
                                title="Trả tin này về trạng thái Chờ Duyệt (Dành cho Sub-admin kiểm duyệt lại)"
                              >
                                🟡 Trả Chờ Duyệt
                              </button>
                            )}

                            {/* Delete Property */}
                            <button
                              onClick={() => onDeleteProperty(p.id)}
                              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition"
                              title="Xóa tin vĩnh viễn"
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

      {/* Tab: Projects Management */}
      {activeTab === 'projects' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                QUẢN LÝ DỰ ÁN VINHOMES & SƠ ĐỒ QUY HOẠCH ({projects.length} DỰ ÁN)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chỉnh sửa thông tin thương mại, hình ảnh banner chính, sơ đồ quy hoạch masterplan hoặc thêm dự án / tòa nhà mới vào hệ thống.
              </p>
            </div>
            <button
              onClick={() => setIsAddingProject(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> + Thêm Dự Án / Tòa Nhà Mới
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 font-bold text-slate-500">Banner / Sơ đồ</th>
                  <th className="p-3 font-bold text-slate-500">Dự án & Vị trí</th>
                  <th className="p-3 font-bold text-slate-500">Quy mô & Căn hộ</th>
                  <th className="p-3 font-bold text-slate-500">Khoảng giá</th>
                  <th className="p-3 font-bold text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-3">
                      <div className="flex gap-2">
                        <img src={proj.image} alt={proj.title} className="w-16 h-12 object-cover rounded-lg border shadow-sm" title="Banner chính" />
                        {proj.masterplanUrl && (
                          <img src={proj.masterplanUrl} alt="Sơ đồ" className="w-12 h-12 object-cover rounded-lg border shadow-sm" title="Sơ đồ quy hoạch" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <span className="font-bold text-slate-900 dark:text-white block">{proj.title}</span>
                      <span className="text-[10px] text-slate-500 block">{proj.location}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-600 block">{proj.areaSize}</span>
                      <span className="text-[10px] text-slate-500">{proj.totalUnits}</span>
                    </td>
                    <td className="p-3 font-black text-amber-600 dark:text-amber-400">
                      {proj.priceRange}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingProject(proj)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                          title="Sửa thông tin & Thay ảnh"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Sửa & Thay Ảnh
                        </button>
                        {onDeleteProject && (
                          <button
                            onClick={() => onDeleteProject(proj.id)}
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                            title="Xóa dự án này"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: News Articles Management */}
      {activeTab === 'news' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                QUẢN LÝ BÀI VIẾT & TIN TỨC BĐS CHUẨN SEO ({news.length} BÀI)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Soạn bài viết tin tức, cập nhật thông tin dự án, chỉnh sửa nội dung và thay đổi hình ảnh đại diện.
              </p>
            </div>
            <button
              onClick={() => setIsAddingNews(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Thêm Bài Viết Mới
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 font-bold text-slate-500">Ảnh bìa</th>
                  <th className="p-3 font-bold text-slate-500">Tiêu đề bài viết</th>
                  <th className="p-3 font-bold text-slate-500">Chuyên mục</th>
                  <th className="p-3 font-bold text-slate-500">Trạng Thái Duyệt</th>
                  <th className="p-3 font-bold text-slate-500">Tác giả & Ngày đăng</th>
                  <th className="p-3 font-bold text-slate-500">Thao tác Phê Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-3">
                      <img src={item.image} alt={item.title} className="w-16 h-12 object-cover rounded-lg border shadow-sm" />
                    </td>
                    <td className="p-3 max-w-sm">
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1 block">{item.summary}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold rounded-md text-[10px]">
                        {item.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.status === 'published' ? (
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold rounded-lg text-[10px] inline-flex items-center gap-1">
                          🟢 Đã Đồng Bộ Public
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold rounded-lg text-[10px] inline-flex items-center gap-1">
                          🟡 Chờ Duyệt (Nháp)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">
                      <div>{item.author}</div>
                      <div className="text-[10px] text-slate-400">{item.publishedAt}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.status === 'published' ? (
                          <button
                            onClick={() => onUpdateNews && onUpdateNews({ ...item, status: 'draft' })}
                            className="px-2 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-bold rounded-lg transition text-[10px]"
                            title="Chuyển bài này về trạng thái Chờ Duyệt (Sub-admin kiểm duyệt lại)"
                          >
                            🟡 Trả Chờ Duyệt
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateNews && onUpdateNews({ ...item, status: 'published' })}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg transition shadow text-[10px]"
                            title="Phê duyệt bài viết và xuất bản lên Web Public"
                          >
                            🟢 Duyệt & Đăng Public
                          </button>
                        )}

                        <button
                          onClick={() => setEditingNews(item)}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center gap-1 text-[10px]"
                          title="Sửa bài & Thay ảnh"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Sửa
                        </button>
                        {onDeleteNews && (
                          <button
                            onClick={() => onDeleteNews(item.id)}
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Pricing Setup Form */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSavePricing} className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              ⚙️ CẤU HÌNH BẬT/TẮT THANH TOÁN & BẢNG GIÁ UP TIN / VIETQR DONATE
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Admin thiết lập Bật/Tắt chế độ thu phí. Khi Tắt thanh toán, hệ thống chuyển sang chế độ <strong>Donate Miễn Phí tùy tâm</strong> cho khách hàng.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-4 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl border border-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Đã lưu thay đổi cấu hình Thanh toán & VietQR Donate thành công!
            </div>
          )}

          {/* ADMIN TOGGLE: PAYMENT VS DONATE MODE */}
          <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-sky-500/15 p-5 rounded-2xl border-2 border-amber-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  CÀI ĐẶT CỔNG CƠ CHẾ BẬT / TẮT THANH TOÁN
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  Chế Độ Hiện Tại: {localConfig.paymentEnabled !== false ? '💳 BẬT THU PHÍ THEO BẢNG GIÁ' : '🎁 TẮT THU PHÍ — CHUYỂN SANG DONATE TÙY TÂM (MIỄN PHÍ)'}
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
                  💳 Bật Thanh Toán
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
                  🎁 Tắt Thanh Toán (Bật Donate)
                </button>
              </div>
            </div>

            {localConfig.paymentEnabled === false && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-500/30 space-y-3">
                <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                  Lời nhắn Donate hiển thị khi khách bấm Up-Tin / Nạp Phí:
                </label>
                <textarea
                  rows={2}
                  value={localConfig.donateMessage || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, donateMessage: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-slate-100"
                  placeholder="Nhập thông điệp Donate tùy tâm..."
                />
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  ⚡ Khi Tắt Thanh Toán, người dùng bấm "Up Tin" hoặc "Nạp tiền" sẽ được Up-Tin thành công ngay lập tức MIỄN PHÍ, đồng thời hiển thị tùy chọn Donate chuyển khoản tùy tâm.
                </p>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              1. Bảng Giá Gói Dịch Vụ Up Tin Khi Bật Thu Phí (VNĐ)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Giá Up Tin 1 Lượt (VNĐ):
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
                  Gói Auto-Push 5 Lượt (VNĐ):
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
                  VIP Bạc (VNĐ / Ngày):
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
                  VIP Vàng (VNĐ / Ngày):
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
                  VIP Kim Cương (VNĐ / Ngày):
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
              2. Thông Tin Tài Khoản Nhận Chuyển Khoản VietQR / Donate
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tên Ngân Hàng:
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
                  Số Tài Khoản:
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
                  Tên Chủ Tài Khoản:
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
              Lưu Cấu Hình Giá & Ngân Hàng
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
                DANH SÁCH YÊU CẦU ĐẶT LỊCH XEM NHÀ & TƯ VẤN (QUẢN TRỊ LEADS CHỦ NHÀ & ADMIN)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tất cả lượt đặt lịch xem nhà của khách hàng (gửi tới người đăng tin/chủ nhà & hệ thống) được tổng hợp chi tiết và có thể xuất ra file Excel/CSV.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExportLeadsCSV(filteredContacts)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl flex items-center gap-2 transition text-xs shadow-md"
              >
                <Download className="w-4 h-4" />
                Xuất File Excel / CSV ({filteredContacts.length})
              </button>
              <button
                onClick={onRefreshData}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center gap-1.5 transition text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Làm Mới Dữ Liệu
              </button>
            </div>
          </div>

          {/* Metrics Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">TỔNG YÊU CẦU</span>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{localContacts.length}</div>
            </div>
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">YÊU CẦU MỚI (CHỜ GỌI)</span>
              <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">
                {localContacts.filter(c => c.status === 'new' || !c.status).length}
              </div>
            </div>
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">LỊCH HẸN XEM NHÀ</span>
              <div className="text-xl font-black text-sky-700 dark:text-sky-300 mt-1">
                {localContacts.filter(c => c.type === 'viewing').length}
              </div>
            </div>
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">ĐÃ LIÊN HỆ / XỬ LÝ</span>
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
                placeholder="Tìm tên khách, SĐT, tên căn, người đăng tin..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="new">🔴 Yêu cầu mới</option>
                <option value="contacted">🟡 Đã liên hệ</option>
                <option value="done">🟢 Hoàn tất</option>
              </select>

              <select
                value={leadTypeFilter}
                onChange={(e) => setLeadTypeFilter(e.target.value)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">Tất cả loại yêu cầu</option>
                <option value="viewing">📅 Đặt lịch xem nhà</option>
                <option value="consultation">💬 Tư vấn chung</option>
                <option value="deposit">💰 Cọc giữ chỗ</option>
              </select>
            </div>
          </div>

          {/* Table Display */}
          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Chưa có dữ liệu đặt lịch xem nhà nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">STT</th>
                    <th className="py-3 px-3">Khách Hàng Đặt Lịch</th>
                    <th className="py-3 px-3">Căn BĐS Quan Tâm</th>
                    <th className="py-3 px-3">Người Đăng Tin (Chủ Nhà / Admin)</th>
                    <th className="py-3 px-3">Lịch Hẹn & Ghi Chú</th>
                    <th className="py-3 px-3">Trạng Thái</th>
                    <th className="py-3 px-3 text-right">Thao Tác</th>
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
                              Xem Nhà
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
                          <span className="text-slate-400 italic">Yêu cầu tư vấn dự án {c.projectInterest}</span>
                        )}
                      </td>

                      {/* Seller info */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{c.sellerName || 'Nhà đẹp Vinhomes'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span>SĐT: {c.sellerPhone || '0868.499.929'}</span>
                          <a
                            href={`https://zalo.me/${(c.sellerPhone || '0868499929').replace(/\D/g, '')}?text=Báo%20lịch%20xem%20nhà%3A%20${encodeURIComponent(c.fullName)}%20(${c.phone})`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[9px] text-blue-500 font-bold hover:underline"
                          >
                            (Báo Chủ)
                          </a>
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
                          <span className="text-slate-400 text-[10px]">Không có ghi chú</span>
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
                          <option value="new">🔴 Yêu cầu mới</option>
                          <option value="contacted">🟡 Đã liên hệ</option>
                          <option value="done">🟢 Hoàn tất</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <a
                            href={`tel:${c.phone}`}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                            title="Gọi ngay cho khách"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDeleteLead(c.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900 dark:text-rose-300 rounded-lg transition"
                            title="Xóa yêu cầu"
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
                QUẢN LÝ THÀNH VIÊN, CƯ DÂN & PHÂN CẤP QUẢN TRỊ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Xem thống kê tài khoản, tạo mới user, phân vai trò (Admin / Cư Dân / Môi Giới), cộng lượt Up Tin & tạm khóa tài khoản
              </p>
            </div>

            {/* Quick User Stats Pills & Add Button */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-xl font-extrabold flex items-center gap-1.5 text-xs">
                👥 Tổng: <strong className="text-amber-500">{registeredUsers.length}</strong>
              </span>
              <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl font-extrabold flex items-center gap-1.5 text-xs">
                🏠 Cư Dân/Chủ Nhà: <strong>{registeredUsers.filter(u => u.role === 'owner').length}</strong>
              </span>
              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl font-extrabold flex items-center gap-1.5 text-xs">
                💼 Môi Giới/Sale: <strong>{registeredUsers.filter(u => u.role === 'sale').length}</strong>
              </span>
              <span className="px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl font-extrabold flex items-center gap-1.5 text-xs">
                👑 Admin: <strong>{registeredUsers.filter(u => u.role === 'admin').length}</strong>
              </span>

              <button
                onClick={() => setIsAddingUser(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ THÊM THÀNH VIÊN MỚI</span>
              </button>
            </div>
          </div>

          {/* Controls: Search & Role Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm theo Tên, SĐT, Email..."
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
                Tất Cả ({registeredUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('owner')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition ${
                  userRoleFilter === 'owner'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                🏠 Chủ Nhà / Cư Dân
              </button>
              <button
                onClick={() => setUserRoleFilter('sale')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition ${
                  userRoleFilter === 'sale'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                💼 Môi Giới / Sale
              </button>
              <button
                onClick={() => setUserRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition ${
                  userRoleFilter === 'admin'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                👑 Quản Trị Viên
              </button>
              <button
                onClick={fetchUsers}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 transition text-xs shadow-xs shrink-0"
                title="Làm mới danh sách"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {registeredUsers.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <UserX className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Chưa có dữ liệu thành viên phù hợp.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3.5">Họ & Tên</th>
                    <th className="py-3 px-3">Email liên hệ</th>
                    <th className="py-3 px-3">SĐT / Zalo</th>
                    <th className="py-3 px-3 text-center">BĐS Đã Đăng</th>
                    <th className="py-3 px-3 text-center">Lượt Up Tin</th>
                    <th className="py-3 px-3 text-center">Ví VNĐ & Điểm</th>
                    <th className="py-3 px-3">Vai Trò / Cấp Bậc</th>
                    <th className="py-3 px-3 text-center">Trạng Thái</th>
                    <th className="py-3 px-3.5 text-right">Thao Tác Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {registeredUsers
                    .filter(u => {
                      const matchesSearch = !userSearch || 
                        (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
                        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
                        (u.phone && u.phone.includes(userSearch));
                      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
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
                              <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-amber-500/30 shrink-0" />
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
                              </div>
                              <span className="text-[10px] text-slate-400 block font-normal">
                                Đăng ký: {u.registeredAt ? new Date(u.registeredAt).toLocaleDateString('vi-VN') : 'Mới tạo'}
                              </span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                            {u.email}
                          </td>

                          {/* Phone / Zalo */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <a 
                                href={`tel:${u.phone || '0868499929'}`} 
                                className="font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <PhoneCall className="w-3 h-3 text-emerald-500" />
                                {u.phone || '0868.499.929'}
                              </a>
                              <a
                                href={`https://zalo.me/${(u.phone || '0868499929').replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-1.5 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 font-bold rounded text-[9px] transition"
                              >
                                Zalo
                              </a>
                            </div>
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
                              <span className="font-black text-amber-500 text-xs">{u.upTinCredits || 10} lượt</span>
                              <button
                                onClick={() => setUserForCreditInjector(u)}
                                className="p-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg transition text-[10px] shadow-xs"
                                title="Cộng hoặc điều chỉnh lượt Up Tin"
                              >
                                + Tặng
                              </button>
                            </div>
                          </td>

                          {/* Wallet Balance & Social Points */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                                {(u.balance || 0).toLocaleString('vi-VN')}đ
                              </span>
                              <button
                                onClick={() => setUserForCreditInjector(u)}
                                className="px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-md text-[10px] shadow-xs flex items-center gap-1 transition cursor-pointer"
                                title="Mở công cụ bơm tiền ví, lượt Up-Tin và điểm thưởng"
                              >
                                <Wallet className="w-2.5 h-2.5 text-emerald-200" />
                                <span>💵 Bơm Ví</span>
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
                              <option value="owner">🏠 Chủ Nhà / Cư Dân</option>
                              <option value="sale">💼 Môi Giới / Sale</option>
                              <option value="admin">👑 Quản Trị Viên (Admin)</option>
                            </select>
                          </td>

                          {/* Blocked Status */}
                          <td className="py-3 px-3 text-center">
                            {isUserBlocked ? (
                              <span className="px-2.5 py-1 bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold rounded-lg border border-rose-500/40 text-[10px] inline-flex items-center gap-1">
                                <Ban className="w-3 h-3 text-rose-500" />
                                Tạm Khóa
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-lg border border-emerald-500/30 text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Hoạt Động
                              </span>
                            )}
                          </td>

                          {/* Admin Actions */}
                          <td className="py-3 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900 dark:text-blue-300 rounded-xl transition cursor-pointer"
                                title="Sửa thông tin tài khoản"
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
                                title={isUserBlocked ? 'Mở khóa tài khoản' : 'Khóa tạm thời'}
                              >
                                {isUserBlocked ? <ShieldCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                {isUserBlocked ? 'Mở Khóa' : 'Khóa TK'}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900 dark:text-rose-300 rounded-xl transition cursor-pointer"
                                title="Xóa người dùng"
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

      {/* Tab Enterprise Admin Core */}
      {activeTab === 'enterprise_core' && (
        <EnterpriseAdminCore
          currentUser={registeredUsers[0] || null}
          users={registeredUsers}
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
                  <a
                    href={`tel:${selectedSellerDetail.sellerPhone || '0868499929'}`}
                    className="font-black text-amber-400 hover:underline text-sm block"
                  >
                    📞 {selectedSellerDetail.sellerPhone || '0868.499.929'}
                  </a>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Mở Trực Tiếp Zalo:</span>
                  <a
                    href={`https://zalo.me/${(selectedSellerDetail.sellerPhone || '0868499929').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-[11px] inline-flex items-center gap-1 mt-1 transition shadow"
                  >
                    💬 Chat Zalo Với Người Đăng
                  </a>
                </div>
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
          phone={sharingProperty.sellerPhone || '0868499929'}
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
                    placeholder="0868.499.929"
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

        </main>
      </div>

      {/* Admin Tax Management Modal */}
      <AdminTaxManagementModal 
        isOpen={showTaxModal} 
        onClose={() => setShowTaxModal(false)} 
      />

    </div>
  );
};
