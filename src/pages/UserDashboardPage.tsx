import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Property, User, Language, UpTinPricingConfig, UpTinTransaction } from '../types';
import {
  Zap, Crown, Eye, MessageSquare, MessageCircle, Trash2, ShieldCheck, CheckCircle2,
  Clock, Sparkles, AlertCircle, ArrowUpRight, Users, Share2,
  Gift, Wallet, Copy, Check, ExternalLink, Award, RefreshCw,
  Building2, FileText, ChevronDown, ChevronUp, Home,
  ShoppingBag, Briefcase, Calculator, Plus, Phone, Mail, CheckCircle,
  Edit2, Wrench, Settings, UserCheck, CreditCard
} from 'lucide-react';
import { calculateExpiryInfo } from '../lib/expiration';
import { UpTinPaymentModal } from '../components/UpTinPaymentModal';
import { KycVerificationModal } from '../components/KycVerificationModal';
import { UserStorefrontManager } from '../components/UserStorefrontManager';
import { InteractionProofChatModal } from '../components/InteractionProofChatModal';
import { UserCvManagement } from '../components/UserCvManagement';
import { UserEmployerRegistrationModal } from '../components/UserEmployerRegistrationModal';
import { UserWalletSection } from '../components/UserWalletSection';
import { UserProfileEditModal } from '../components/UserProfileEditModal';
import { UserPropertyEditModal } from '../components/UserPropertyEditModal';
import { UserResidentServicesManager } from '../components/UserResidentServicesManager';
import { TechnicalServiceEscrowModal } from '../components/TechnicalServiceEscrowModal';
import { playMessageRingtone } from '../lib/audioRingtone';
import { RECRUITMENT_PACKAGES } from '../data/recruitmentData';
import { getPropertyDetailUrl, getProjectSlug } from '../lib/slugs';
import { ResidentUtilities } from '../components/ResidentUtilities';

interface UserDashboardPageProps {
  user?: User;
  currentUser?: User;
  properties: Property[];
  language: Language;
  pricingConfig: UpTinPricingConfig;
  onPostNewProperty?: () => void;
  onOpenPostProperty?: () => void;
  onSelectProperty?: (property: Property) => void;
  onUpdateProperty?: (property: Property) => void;
  onDeleteProperty?: (id: string) => void;
  onOpenAiWriter?: () => void;
  onRefreshData?: () => void;
  onLogout?: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  user: propUser,
  currentUser,
  properties,
  language,
  pricingConfig,
  onPostNewProperty,
  onOpenPostProperty,
  onSelectProperty,
  onUpdateProperty,
  onDeleteProperty,
  onOpenAiWriter,
  onRefreshData = () => {},
  onLogout
}) => {
  const navigate = useNavigate();
  const rawUser = currentUser || propUser || {};
  const user: User = {
    id: rawUser.id || 'user-default',
    name: rawUser.name || (rawUser.email ? rawUser.email.split('@')[0] : 'Cư Dân Vinhomes'),
    email: rawUser.email || 'cudan@chocudan24h.com',
    role: rawUser.role || 'visitor',
    provider: rawUser.provider || 'local',
    phone: rawUser.phone || '',
    avatar: rawUser.avatar || '',
    upTinCredits: typeof rawUser.upTinCredits === 'number' ? rawUser.upTinCredits : 20,
    tier: rawUser.tier || 'thuong',
    balance: rawUser.balance || 0,
    totalTopup: rawUser.totalTopup || 0
  };

  const handlePostProperty = onOpenPostProperty || onPostNewProperty || (() => navigate('/dang-tin'));
  const handleSelectProp = onSelectProperty || ((p: Property) => navigate(getPropertyDetailUrl(p)));
  const handleDeleteProp = onDeleteProperty || (() => {});

  const [activeTab, setActiveTab] = useState<'my_properties' | 'my_services' | 'my_store' | 'wallet_tokens' | 'my_cv' | 'recruiter_packages' | 'affiliate' | 'account_profile' | 'transactions' | 'resident_utilities'>('my_properties');
  const [propertyFilter, setPropertyFilter] = useState<'all' | 'approved' | 'pending' | 'expired'>('all');
  const [selectedPropertyForUpTin, setSelectedPropertyForUpTin] = useState<Property | null>(null);
  const [localTransactions, setLocalTransactions] = useState<UpTinTransaction[]>([]);
  const [serverWalletTransactions, setServerWalletTransactions] = useState<any[]>([]);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showEmployerRegModal, setShowEmployerRegModal] = useState(false);
  const [showSocialDrawer, setShowSocialDrawer] = useState(false);
  const [userState, setUserState] = useState<User>(user);
  const [isSyncingBalance, setIsSyncingBalance] = useState(false);
  const [upTinCredits, setUpTinCredits] = useState(user.upTinCredits || 12);
  const [showInteractionChatModal, setShowInteractionChatModal] = useState<boolean>(false);
  const [isRenewingId, setIsRenewingId] = useState<string | null>(null);

  // Profile & Property Edit Modals state
  const [showProfileEditModal, setShowProfileEditModal] = useState<boolean>(false);
  const [showEscrowModal, setShowEscrowModal] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showPropertyEditModal, setShowPropertyEditModal] = useState<boolean>(false);

  // Icon Compact & Expandable items state
  const [userViewMode, setUserViewMode] = useState<'icon_compact' | 'detailed'>('icon_compact');
  const [expandedPropIds, setExpandedPropIds] = useState<Record<string, boolean>>({});

  // Synchronize with parent user prop
  useEffect(() => {
    if (user) {
      setUserState(prev => {
        if (
          prev.id === user.id &&
          prev.balance === user.balance &&
          prev.upTinCredits === user.upTinCredits &&
          prev.affiliatePoints === user.affiliatePoints &&
          prev.role === user.role &&
          prev.name === user.name
        ) {
          return prev;
        }
        return { ...prev, ...user };
      });
      if (typeof user.upTinCredits === 'number') setUpTinCredits(user.upTinCredits);
      if (typeof user.affiliatePoints === 'number') setAffiliateWallet(user.affiliatePoints);
    }
  }, [user?.id, user?.balance, user?.upTinCredits, user?.affiliatePoints, user?.tier, user?.role, user?.name, user?.phone, user?.email]);

  // Live Token Sync with Server, Admin & LocalStorage
  const refreshUserBalance = async (showToast = false) => {
    if (!user || (!user.id && !user.email)) return;
    setIsSyncingBalance(true);
    try {
      const queryParams = new URLSearchParams();
      if (user.id) queryParams.set('userId', user.id);
      if (user.email) queryParams.set('email', user.email);
      if (user.phone) queryParams.set('phone', user.phone);

      const [resUser, resWallet] = await Promise.allSettled([
        fetch(`/api/auth/users/${user.id || 'me'}?${queryParams.toString()}`),
        fetch(`/api/wallets/${user.id || 'me'}?${queryParams.toString()}`)
      ]);

      if (resUser.status === 'fulfilled' && resUser.value.ok) {
        const freshData = await resUser.value.json();
        if (freshData) {
          setUserState(prev => ({ ...prev, ...freshData }));
          if (typeof freshData.upTinCredits === 'number') {
            setUpTinCredits(freshData.upTinCredits);
          }
          if (typeof freshData.affiliatePoints === 'number') {
            setAffiliateWallet(freshData.affiliatePoints);
          }
          const merged = { ...user, ...freshData };
          try {
            localStorage.setItem('hb_user', JSON.stringify(merged));
          } catch (e) {}
          if (showToast) {
            alert(` ĐÃ ĐỒNG BỘ SỐ DƯ TỨC THÌ TỪ HỆ THỐNG:\n• Token Cư Dân: ${(freshData.balance || 0).toLocaleString('vi-VN')} Token\n• Điểm Rút Tiền: ${(freshData.affiliatePoints || 0).toLocaleString('vi-VN')} đ\n• Lượt Up Tin: ${freshData.upTinCredits || 0} lượt`);
          }
        }
      }

      if (resWallet.status === 'fulfilled' && resWallet.value.ok) {
        const walletData = await resWallet.value.json();
        if (walletData && Array.isArray(walletData.transactions)) {
          setServerWalletTransactions(walletData.transactions);
        }
      }
    } catch (err) {
      console.warn('Balance sync error:', err);
    } finally {
      setIsSyncingBalance(false);
    }
  };

  useEffect(() => {
    refreshUserBalance();
    const interval = setInterval(() => refreshUserBalance(false), 4000);
    const handleTokenUpdated = (e: any) => {
      if (e.detail && (e.detail.id === user.id || e.detail.email === user.email || !user.id)) {
        setUserState(prev => ({ ...prev, ...e.detail }));
        if (typeof e.detail.upTinCredits === 'number') {
          setUpTinCredits(e.detail.upTinCredits);
        }
        if (typeof e.detail.affiliatePoints === 'number') {
          setAffiliateWallet(e.detail.affiliatePoints);
        }
      }
    };

    window.addEventListener('user-token-updated', handleTokenUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener('user-token-updated', handleTokenUpdated);
    };
  }, [user.id, user.email, user.phone]);

  // Affiliate & Referral State
  const [copiedLink, setCopiedLink] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('300000');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [affiliateWallet, setAffiliateWallet] = useState(450000);

  const userRefCode = `REF-${user?.name ? user.name.replace(/\s+/g, '').toUpperCase().slice(0, 8) : 'CUDAN24H'}`;
  const userRefLink = `https://chocudan24h.com/?ref=${userRefCode}`;

  const handleCopyRefLink = () => {
    navigator.clipboard.writeText(userRefLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Filter properties belonging to logged in user
  const userProperties = (properties || []).filter(p => {
    if (!p) return false;
    if (user.role === 'admin') return true;
    const matchId = Boolean(user.id && (p.userId === user.id || (p as any).authorId === user.id || (p as any).createdBy === user.id));
    const matchEmail = Boolean(user.email && (
      (p.userEmail && p.userEmail.toLowerCase() === user.email.toLowerCase()) ||
      ((p as any).sellerEmail && (p as any).sellerEmail.toLowerCase() === user.email.toLowerCase())
    ));
    const matchPhone = Boolean(user.phone && (p.sellerPhone === user.phone || (p as any).userPhone === user.phone));
    const matchName = Boolean(user.name && p.sellerName && user.name.length > 2 && p.sellerName.toLowerCase() === user.name.toLowerCase());
    return matchId || matchEmail || matchPhone || matchName;
  });

  const approvedCount = userProperties.filter(p => p.status === 'approved' || p.approved).length;
  const pendingCount = userProperties.filter(p => p.status !== 'approved' && !p.approved && p.status !== 'rejected').length;
  const totalViews = userProperties.reduce((acc, p) => acc + (p.viewsCount || Math.floor(Math.random() * 80) + 12), 0);

  // Filtered properties for active filter pill
  const filteredProperties = userProperties.filter(p => {
    const expiry = calculateExpiryInfo(p, 30);
    if (propertyFilter === 'approved') return (p.status === 'approved' || p.approved) && !expiry.isExpired;
    if (propertyFilter === 'pending') return p.status !== 'approved' && !p.approved && p.status !== 'rejected';
    if (propertyFilter === 'expired') return expiry.isExpired;
    return true;
  });

  const toggleExpandProp = (id: string) => {
    setExpandedPropIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandAllProps = () => {
    const allExpanded = filteredProperties.length > 0 && filteredProperties.every(p => expandedPropIds[p.id]);
    const newState: Record<string, boolean> = {};
    filteredProperties.forEach(p => {
      newState[p.id] = !allExpanded;
    });
    setExpandedPropIds(newState);
  };

  const handleUpTinSuccess = (updatedProp: Property, newTx: UpTinTransaction) => {
    setSelectedPropertyForUpTin(null);
    setLocalTransactions(prev => [newTx, ...prev]);
    onRefreshData();
  };

  const handleRenewProperty = async (propId: string) => {
    setIsRenewingId(propId);
    try {
      const res = await fetch(`/api/properties/${propId}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || ' Đã gia hạn hiển thị tin thành công thêm 30 ngày!');
        onRefreshData();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi gia hạn tin.');
      }
    } catch (e) {
      console.error('Error renewing property:', e);
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setIsRenewingId(null);
    }
  };

  // Per-user storage key for claimed social channels
  const userSocialKey = `claimed_social_user_${user.id || user.phone || 'guest'}`;
  const [claimedSocial, setClaimedSocial] = useState<{
    facebook?: boolean;
    youtube?: boolean;
    tiktok?: boolean;
    zalo?: boolean;
    google?: boolean;
    telegram?: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem(userSocialKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      facebook: false,
      youtube: false,
      tiktok: false,
      zalo: false,
      google: false,
      telegram: false
    };
  });

  const handleClaimReward = (platform: 'facebook' | 'youtube' | 'tiktok' | 'zalo' | 'google' | 'telegram', points: number, url: string) => {
    if (claimedSocial[platform]) {
      alert(` Bạn đã nhận lượt Up Tin từ kênh ${platform.toUpperCase()} rồi.`);
      return;
    }
    window.open(url, '_blank');
    const updatedClaimed = { ...claimedSocial, [platform]: true };
    setClaimedSocial(updatedClaimed);
    try {
      localStorage.setItem(userSocialKey, JSON.stringify(updatedClaimed));
    } catch (e) {}
    setUpTinCredits(prev => prev + points);
    playMessageRingtone();
    alert(` Đã cộng +${points} Lượt Up Tin miễn phí từ kênh ${platform.toUpperCase()}!`);
  };

  const getTierBadge = () => {
    const topup = user.totalTopup || 0;
    if (topup >= 15000000) return { name: 'KIM CƯƠNG', color: 'bg-cyan-500 text-ink-950' };
    if (topup >= 5000000) return { name: 'HẠNG VÀNG', color: 'bg-brand-400 text-ink-950' };
    if (topup >= 1000000) return { name: 'HẠNG BẠC', color: 'bg-ink-300 text-ink-950' };
    return { name: 'CƯ DÂN', color: 'bg-brand-600 text-white' };
  };

  const tierInfo = getTierBadge();

  // Check if user is allowed to do business / has merchant permission
  const isBusinessAllowed = Boolean(
    userState.role === 'admin' ||
    userState.role === 'partner' ||
    userState.role === 'sale' ||
    userState.role === 'owner' ||
    userState.accountType === 'business_enterprise' ||
    userState.accountType === 'technician' ||
    userState.kycStatus === 'verified' ||
    (userState.businessCategories && userState.businessCategories.length > 0) ||
    Boolean(userState.companyName) ||
    Boolean((userState as any).isBusinessAllowed)
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* QUICK SYSTEM NAVIGATION SHORTCUTS BAR (Fixed access to all app sections) */}
      <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-2xl p-2 sm:p-2.5 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5 shrink-0 font-bold text-ink-700 dark:text-ink-300">
          <span className="text-ink-400 text-[11px] uppercase tracking-wider hidden md:inline">Điều Hướng Nhanh:</span>
          
          <Link
            to="/"
            className="px-2.5 py-1.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-1 text-ink-700 dark:text-ink-200 transition"
          >
            <Home className="w-3.5 h-3.5 text-brand-500" />
            <span>Trang Chủ</span>
          </Link>

          <Link
            to="/bat-dong-san"
            className="px-2.5 py-1.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-1 text-ink-700 dark:text-ink-200 transition"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>BĐS Mua Bán</span>
          </Link>

          <Link
            to="/cho-thue"
            className="px-2.5 py-1.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-1 text-ink-700 dark:text-ink-200 transition"
          >
            <Zap className="w-3.5 h-3.5 text-brand-500" />
            <span>Cho Thuê</span>
          </Link>

          <Link
            to="/dich-vu-cu-dan"
            className="px-2.5 py-1.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-1 text-ink-700 dark:text-ink-200 transition"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-500" />
            <span>Chợ Cư Dân</span>
          </Link>

          <Link
            to="/tuyen-dung"
            className="px-2.5 py-1.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-1 text-ink-700 dark:text-ink-200 transition"
          >
            <Briefcase className="w-3.5 h-3.5 text-teal-500" />
            <span>Tuyển Dụng CV</span>
          </Link>

          <Link
            to="/tinh-lai-vay"
            className="px-2.5 py-1.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center gap-1 text-ink-700 dark:text-ink-200 transition"
          >
            <Calculator className="w-3.5 h-3.5 text-rose-500" />
            <span>Tính Lãi Vay</span>
          </Link>
        </div>

        <button
          onClick={handlePostProperty}
          className="px-3.5 py-1.5 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-ink-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1 shrink-0 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ĐĂNG TIN MỚI</span>
        </button>
      </div>

      {/* STREAMLINED COMPACT USER PROFILE & METRICS CARD */}
      <div className="bg-gradient-to-r from-ink-950 via-ink-900 to-brand-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-brand-800/40 space-y-4">
        {/* Row 1: Profile Top Info & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-800/80">
          <div className="flex items-center gap-3">
            <img loading="lazy"
              src={user.avatar || ''}
              alt={user.name}
              className="w-12 h-12 rounded-xl border border-brand-400/60 shadow-xs object-cover shrink-0"
            />
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-white truncate max-w-xs">{user.name}</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-400/30">
                  {user.role === 'admin' ? ' Admin Tổng' : user.role === 'sale' ? ' Môi Giới' : ' Chủ Nhà'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shadow-xs ${tierInfo.color}`}>
                  {tierInfo.name}
                </span>
                {userState.kycStatus === 'verified' ? (
                  <span className="px-2 py-0.5 bg-brand-500 text-ink-950 text-[9px] font-black rounded-md flex items-center gap-1">
                     Nút Xanh KYC
                  </span>
                ) : (
                  <button
                    onClick={() => setShowKycModal(true)}
                    className="px-2 py-0.5 bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/40 text-[9px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition"
                  >
                    <ShieldCheck className="w-3 h-3 text-brand-400" />
                    <span>Xác thực KYC</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap text-[11px] text-ink-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-brand-400" />
                  <strong className="text-ink-200">{user.phone || 'Chưa nhập SĐT'}</strong>
                </span>
                <span className="text-ink-600">|</span>
                <span className="flex items-center gap-1 truncate max-w-[220px]">
                  <Mail className="w-3 h-3 text-sky-400" />
                  <strong className="text-ink-200 truncate">{user.email}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
            <button
              onClick={() => setShowProfileEditModal(true)}
              className="px-3 py-1.5 bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/50 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Chỉnh sửa họ tên, SĐT, Zalo, địa chỉ căn hộ, STK ngân hàng"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Sửa Thông Tin</span>
            </button>

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            <button
              onClick={() => refreshUserBalance(true)}
              disabled={isSyncingBalance}
              className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-sky-300 border border-ink-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Đồng bộ số dư trực tiếp từ hệ thống"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBalance ? 'animate-spin text-brand-400' : 'text-sky-400'}`} />
              <span className="hidden sm:inline">{isSyncingBalance ? 'Đang đồng bộ...' : 'Đồng Bộ'}</span>
            </button>

            <button
              onClick={() => setShowSocialDrawer(!showSocialDrawer)}
              className="px-3 py-1.5 bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Nhận thêm lượt Up Tin miễn phí từ kênh truyền thông"
            >
              <Gift className="w-3.5 h-3.5 text-brand-400" />
              <span>+Up Tin Free</span>
              {showSocialDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 bg-ink-800/80 hover:bg-rose-900/60 text-ink-300 hover:text-rose-200 border border-ink-700 rounded-xl text-xs font-medium transition cursor-pointer"
                title="Đăng xuất hoặc đổi tài khoản"
              >
                Đổi Nick
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Ultra-Compact Metric Stats Grid (5 pills) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {/* Box 1: Token Cư Dân / Ví Doanh Nghiệp (Chỉ hiển thị cho tài khoản được phép kinh doanh) */}
          {isBusinessAllowed ? (
            <div
              onClick={() => setActiveTab('wallet_tokens')}
              className="bg-ink-900/90 hover:bg-ink-800/90 border border-brand-500/40 p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-2"
              title="Ví Token & Điểm kinh doanh khả dụng"
            >
              <div>
                <span className="text-[10px] text-brand-400 font-bold uppercase block">Token Kinh Doanh</span>
                <span className="text-base font-black text-brand-300 font-mono">
                  {(userState.balance || 0).toLocaleString('vi-VN')}
                </span>
              </div>
              <span className="p-1.5 bg-brand-500/20 text-brand-400 rounded-lg text-xs"></span>
            </div>
          ) : (
            <div
              onClick={() => setShowEmployerRegModal(true)}
              className="bg-ink-900/70 hover:bg-ink-800/90 border border-ink-700/80 p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 opacity-90 group"
              title="Tài khoản chưa kích hoạt ví kinh doanh - Bấm để đăng ký"
            >
              <div>
                <span className="text-[10px] text-ink-400 font-bold uppercase block flex items-center gap-1">
                  <span> Ví Kinh Doanh</span>
                </span>
                <span className="text-xs font-bold text-brand-400 group-hover:underline">
                  Kích hoạt ngay →
                </span>
              </div>
              <span className="p-1.5 bg-ink-800 text-ink-400 rounded-lg text-xs"></span>
            </div>
          )}

          {/* Box 2: Tiền Affiliate Rút ATM */}
          <div
            onClick={() => setActiveTab('affiliate')}
            className="bg-ink-900/90 hover:bg-ink-800/90 border border-brand-500/40 p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-2"
          >
            <div>
              <span className="text-[10px] text-brand-400 font-bold uppercase block">Ví Rút Tiền</span>
              <span className="text-base font-black text-brand-300 font-mono">
                {(userState.affiliatePoints || affiliateWallet || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <span className="p-1.5 bg-brand-500/20 text-brand-400 rounded-lg text-xs"></span>
          </div>

          {/* Box 3: Lượt Up Tin Top 1 */}
          <div
            onClick={() => setActiveTab('my_properties')}
            className="bg-ink-900/90 hover:bg-ink-800/90 border border-sky-500/40 p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-2"
          >
            <div>
              <span className="text-[10px] text-sky-400 font-bold uppercase block">Lượt Up Tin</span>
              <span className="text-base font-black text-sky-300 font-mono">{upTinCredits} lượt</span>
            </div>
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>

          {/* Box 4: Tổng Tin BĐS */}
          <div
            onClick={() => setActiveTab('my_properties')}
            className="bg-ink-900/90 hover:bg-ink-800/90 border border-ink-700 p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-2"
          >
            <div>
              <span className="text-[10px] text-ink-400 font-bold uppercase block">Tin Đăng BĐS</span>
              <span className="text-base font-black text-white font-mono">
                {userProperties.length} <span className="text-[10px] font-normal text-brand-400">({approvedCount} duyệt)</span>
              </span>
            </div>
            <Zap className="w-4 h-4 text-brand-400" />
          </div>

          {/* Box 5: Lượt Khách Xem */}
          <div className="bg-ink-900/90 border border-ink-700 p-2.5 rounded-xl col-span-2 sm:col-span-1 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-ink-400 font-bold uppercase block">Lượt Khách Xem</span>
              <span className="text-base font-black text-white font-mono">
                {totalViews.toLocaleString('vi-VN')}
              </span>
            </div>
            <Eye className="w-4 h-4 text-ink-400" />
          </div>
        </div>

        {/* Row 3: Quick Live Chat & Zalo Group Support Bar (Gọn gàng trong Mục Cá Nhân) */}
        <div className="bg-ink-900/90 border border-blue-500/40 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-400"></span>
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-white truncate">
                   Hỗ Trợ Zalo Cư Dân &amp; Kênh Chat Trực Tiếp
                </span>
                <span className="bg-brand-500/20 text-brand-300 text-[9px] px-1.5 py-0.5 rounded border border-brand-500/30 font-bold shrink-0">
                  ● Đang trực tuyến
                </span>
              </div>
              <span className="text-[10px] text-ink-300 block truncate mt-0.5">
                Nhắn tin với BQT để được hỗ trợ đăng tin, nạp token, duyệt bài và tham gia nhóm Zalo cư dân
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-zalo-hub'))}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Mở Nhóm Zalo &amp; Chat</span>
            </button>
            <a
              href="tel:0868499929"
              className="px-2.5 py-1.5 bg-ink-800 hover:bg-ink-700 text-brand-300 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-ink-700"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0868.499.929</span>
            </a>
          </div>
        </div>

        {/* COMPACT COLLAPSIBLE SOCIAL CHANNELS REWARD DRAWER */}
        {showSocialDrawer && (
          <div className="bg-ink-900/95 border border-brand-500/40 rounded-xl p-3.5 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-ink-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="bg-brand-500 text-ink-950 text-[9px] font-black px-2 py-0.5 rounded">TẶNG UP TIN FREE</span>
                <span className="text-xs font-bold text-white">Tương tác kênh truyền thông nhận ngay +5 đến +10 Lượt Up Tin</span>
              </div>
              <button
                onClick={() => setShowSocialDrawer(false)}
                className="text-xs text-ink-400 hover:text-white"
              >
                 Đóng
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              <div className="bg-ink-800/90 p-2 rounded-lg border border-ink-700 flex flex-col justify-between gap-1.5">
                <span className="font-bold text-sky-400 text-[11px] truncate">Zalo OA</span>
                <button
                  onClick={() => handleClaimReward('zalo', 5, 'https://zalo.me/')}
                  disabled={claimedSocial.zalo}
                  className={`py-1 px-2 rounded text-[11px] font-bold ${
                    claimedSocial.zalo ? 'bg-ink-700 text-ink-400' : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  {claimedSocial.zalo ? ' Đã nhận' : '+5 Up Tin'}
                </button>
              </div>

              <div className="bg-ink-800/90 p-2 rounded-lg border border-ink-700 flex flex-col justify-between gap-1.5">
                <span className="font-bold text-blue-400 text-[11px] truncate">Facebook</span>
                <button
                  onClick={() => handleClaimReward('facebook', 5, 'https://www.facebook.com/chocudan24h')}
                  disabled={claimedSocial.facebook}
                  className={`py-1 px-2 rounded text-[11px] font-bold ${
                    claimedSocial.facebook ? 'bg-ink-700 text-ink-400' : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {claimedSocial.facebook ? ' Đã nhận' : '+5 Up Tin'}
                </button>
              </div>

              <div className="bg-ink-800/90 p-2 rounded-lg border border-ink-700 flex flex-col justify-between gap-1.5">
                <span className="font-bold text-rose-400 text-[11px] truncate">YouTube</span>
                <button
                  onClick={() => handleClaimReward('youtube', 5, 'https://www.youtube.com/@chocudan24h')}
                  disabled={claimedSocial.youtube}
                  className={`py-1 px-2 rounded text-[11px] font-bold ${
                    claimedSocial.youtube ? 'bg-ink-700 text-ink-400' : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {claimedSocial.youtube ? ' Đã nhận' : '+5 Up Tin'}
                </button>
              </div>

              <div className="bg-ink-800/90 p-2 rounded-lg border border-ink-700 flex flex-col justify-between gap-1.5">
                <span className="font-bold text-ink-200 text-[11px] truncate">TikTok</span>
                <button
                  onClick={() => handleClaimReward('tiktok', 5, 'https://www.tiktok.com/@chocudan24h')}
                  disabled={claimedSocial.tiktok}
                  className={`py-1 px-2 rounded text-[11px] font-bold ${
                    claimedSocial.tiktok ? 'bg-ink-700 text-ink-400' : 'bg-ink-100 text-ink-900'
                  }`}
                >
                  {claimedSocial.tiktok ? ' Đã nhận' : '+5 Up Tin'}
                </button>
              </div>

              <div className="bg-ink-800/90 p-2 rounded-lg border border-ink-700 flex flex-col justify-between gap-1.5">
                <span className="font-bold text-brand-400 text-[11px] truncate">Google Maps</span>
                <button
                  onClick={() => handleClaimReward('google', 10, 'https://maps.google.com')}
                  disabled={claimedSocial.google}
                  className={`py-1 px-2 rounded text-[11px] font-bold ${
                    claimedSocial.google ? 'bg-ink-700 text-ink-400' : 'bg-brand-500 text-ink-950 font-black'
                  }`}
                >
                  {claimedSocial.google ? ' Đã nhận' : '+10 Up Tin'}
                </button>
              </div>

              <div className="bg-ink-800/90 p-2 rounded-lg border border-ink-700 flex flex-col justify-between gap-1.5">
                <span className="font-bold text-indigo-400 text-[11px] truncate">Chat Admin</span>
                <button
                  onClick={() => setShowInteractionChatModal(true)}
                  className="py-1 px-2 bg-brand-500 hover:bg-brand-400 text-ink-950 font-black rounded text-[11px]"
                >
                   Gửi Bằng Chứng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COMPACT SEGMENTED TAB BAR */}
      <div className="bg-white dark:bg-ink-900 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto text-xs font-bold border border-ink-200 dark:border-ink-800 shadow-xs">
        <button
          onClick={() => setActiveTab('my_properties')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'my_properties'
              ? 'bg-brand-600 text-white shadow-xs font-black'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Tin Đăng BĐS ({userProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resident_utilities')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'resident_utilities'
              ? 'bg-brand-500 text-ink-950 shadow-xs font-black'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tiện Ích Cư Dân</span>
        </button>

        <button
          onClick={() => setActiveTab('my_services')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'my_services'
              ? 'bg-teal-600 text-white shadow-xs font-black'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Dịch Vụ & Kỹ Thuật</span>
        </button>

        <button
          onClick={() => setActiveTab('my_store')}
          className={`flex-1 min-w-[135px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'my_store'
              ? 'bg-purple-600 text-white shadow-xs font-black'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Gian Hàng & Dịch Vụ</span>
        </button>

        <button
          onClick={() => setActiveTab('my_cv')}
          className={`flex-1 min-w-[125px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'my_cv'
              ? 'bg-sky-600 text-white shadow-xs font-black'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tuyển Dụng & Việc Làm</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet_tokens')}
          className={`flex-1 min-w-[145px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'wallet_tokens'
              ? 'bg-brand-500 text-ink-950 shadow-xs font-black'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <span>{isBusinessAllowed ? '' : ''}</span>
          <span>{isBusinessAllowed ? `Ví Token B2B (${(userState.balance || 0).toLocaleString('vi-VN')})` : 'Ví Kinh Doanh'}</span>
        </button>

        <button
          onClick={() => setActiveTab('affiliate')}
          className={`flex-1 min-w-[135px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'affiliate'
              ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-ink-950 shadow-xs font-black'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Rút Hoa Hồng VietQR</span>
        </button>

        <button
          onClick={() => setActiveTab('account_profile')}
          className={`flex-1 min-w-[145px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'account_profile'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Hồ Sơ & Ngân Hàng</span>
        </button>

        <button
          onClick={() => setActiveTab('recruiter_packages')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'recruiter_packages'
              ? 'bg-blue-600 text-white shadow-xs font-black'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Gói Tuyển Dụng</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-ink-800 text-white shadow-xs font-black'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Lịch Sử Up Tin</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY PROPERTIES (TIN ĐĂNG BẤT ĐỘNG SẢN) */}
      {/* ========================================================================= */}
      {activeTab === 'resident_utilities' && (
        <div className="bg-white dark:bg-ink-900 rounded-3xl p-5 border border-ink-200 dark:border-ink-800 shadow-xl space-y-4">
          <div className="border-b border-ink-200 dark:border-ink-800 pb-3">
            <h2 className="text-base font-black text-ink-900 dark:text-white uppercase">Tiện Ích Cư Dân</h2>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
              Công cụ dành riêng cho tài khoản cư dân đã đăng nhập.
            </p>
          </div>
          <ResidentUtilities currentUser={userState} />
        </div>
      )}

      {activeTab === 'my_properties' && (
        <div className="space-y-3">
          {/* Header & Filter Controls & Density Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-ink-900 p-2.5 sm:p-3 rounded-2xl border border-ink-200 dark:border-ink-800 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
              <button
                onClick={() => setPropertyFilter('all')}
                className={`px-2.5 py-1.5 rounded-xl text-xs transition ${
                  propertyFilter === 'all'
                    ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-950 font-black'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:text-ink-900'
                }`}
              >
                Tất Cả ({userProperties.length})
              </button>

              <button
                onClick={() => setPropertyFilter('approved')}
                className={`px-2.5 py-1.5 rounded-xl text-xs transition ${
                  propertyFilter === 'approved'
                    ? 'bg-brand-600 text-white font-black'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:text-ink-900'
                }`}
              >
                 Đang Hiện ({approvedCount})
              </button>

              <button
                onClick={() => setPropertyFilter('pending')}
                className={`px-2.5 py-1.5 rounded-xl text-xs transition ${
                  propertyFilter === 'pending'
                    ? 'bg-brand-500 text-ink-950 font-black'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:text-ink-900'
                }`}
              >
                 Chờ Duyệt ({pendingCount})
              </button>

              <button
                onClick={() => setPropertyFilter('expired')}
                className={`px-2.5 py-1.5 rounded-xl text-xs transition ${
                  propertyFilter === 'expired'
                    ? 'bg-rose-600 text-white font-black'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:text-ink-900'
                }`}
              >
                 Quá Hạn
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              {/* Density View Switcher */}
              <div className="bg-ink-100 dark:bg-ink-800 p-0.5 rounded-xl flex items-center gap-0.5 text-[11px] font-bold">
                <button
                  onClick={() => setUserViewMode('icon_compact')}
                  className={`px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    userViewMode === 'icon_compact'
                      ? 'bg-white dark:bg-ink-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-ink-500 hover:text-ink-900 dark:hover:text-white'
                  }`}
                  title="Chế độ biểu tượng thu gọn, click để mở rộng"
                >
                  <span></span>
                  <span className="hidden sm:inline">Icon Thu Gọn</span>
                </button>
                <button
                  onClick={() => setUserViewMode('detailed')}
                  className={`px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    userViewMode === 'detailed'
                      ? 'bg-white dark:bg-ink-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-ink-500 hover:text-ink-900 dark:hover:text-white'
                  }`}
                  title="Chế độ hiển thị chi tiết đầy đủ"
                >
                  <span></span>
                  <span className="hidden sm:inline">Chi Tiết</span>
                </button>
              </div>

              {filteredProperties.length > 0 && (
                <button
                  onClick={toggleExpandAllProps}
                  className="px-2 py-1 bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-300 font-bold text-[11px] rounded-xl transition cursor-pointer"
                  title="Mở rộng hoặc thu gọn tất cả tin đăng"
                >
                  {filteredProperties.every(p => expandedPropIds[p.id]) ? 'Thu gọn ▴' : 'Mở rộng ▾'}
                </button>
              )}

              <button
                onClick={handlePostProperty}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Đăng Tin</span>
              </button>
            </div>
          </div>

          {/* Listings Container */}
          {filteredProperties.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-6 space-y-3">
              <div className="w-12 h-12 bg-brand-100 dark:bg-brand-950/60 text-brand-600 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-ink-900 dark:text-ink-100">
                {propertyFilter === 'all' ? 'Bạn chưa có bài đăng bất động sản nào' : 'Không có bài đăng nào trong mục này'}
              </h3>
              <p className="text-xs text-ink-500 max-w-sm mx-auto">
                Đăng tin miễn phí tiếp cận hàng vạn cư dân mua & thuê Vinhomes Ocean Park 1, 2, 3 và Hạ Long Xanh.
              </p>
              <button
                onClick={handlePostProperty}
                className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-brand-700 transition cursor-pointer"
              >
                + Đăng Tin Ngay
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProperties.map((prop) => {
                const expiry = calculateExpiryInfo(prop, 30);
                const isApproved = prop.status === 'approved' || prop.approved || prop.approvalStatus === 'approved';
                const isRejected = prop.status === 'rejected' || prop.approvalStatus === 'rejected';
                const isPending = !isApproved && !isRejected;
                const detailUrl = getPropertyDetailUrl(prop);
                const isExpanded = userViewMode === 'detailed' || Boolean(expandedPropIds[prop.id]);

                return (
                  <div
                    key={prop.id}
                    className={`bg-white dark:bg-ink-900 rounded-2xl border transition shadow-xs overflow-hidden ${
                      expiry.isExpired
                        ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/10'
                        : isExpanded
                        ? 'border-brand-500/60 ring-1 ring-brand-500/20'
                        : 'border-ink-200 dark:border-ink-800 hover:border-ink-300 dark:hover:border-ink-700'
                    }`}
                  >
                    {/* PRIMARY COMPACT HEADER ROW (Icon-First & Dense) */}
                    <div className="p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                      
                      {/* Left: Thumbnail & Core Icon Specs */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Thumbnail */}
                        <div 
                          onClick={() => toggleExpandProp(prop.id)}
                          className="relative shrink-0 cursor-pointer group"
                        >
                          <img loading="lazy"
                            src={prop.images?.[0] || ''}
                            alt={prop.title}
                            className="w-14 h-12 sm:w-16 sm:h-14 rounded-xl object-cover border border-ink-200 dark:border-ink-800 group-hover:opacity-90 transition"
                          />
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-ink-950/80 text-white text-[8px] font-bold rounded">
                            {prop.images?.length || 1} 
                          </span>
                        </div>

                        {/* Text & Icon Pills */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Status Icon Pill */}
                            {isApproved && !expiry.isExpired && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 border border-brand-500/30">
                                 Hiện
                              </span>
                            )}
                            {isApproved && expiry.isExpired && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                                 Hết hạn
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300">
                                 Chờ
                              </span>
                            )}
                            {isRejected && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                                 Từ chối
                              </span>
                            )}

                            {/* Type Pill */}
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                              prop.type === 'sale' ? 'bg-brand-500/10 text-brand-600' : 'bg-teal-500/10 text-teal-600'
                            }`}>
                              {prop.type === 'sale' ? ' Bán' : ' Thuê'}
                            </span>

                            {/* Price */}
                            <span className="text-xs font-black text-brand-600 dark:text-brand-400 font-mono">
                               {prop.priceDisplay}
                            </span>

                            {/* Area */}
                            <span className="text-[10px] text-ink-500 font-mono font-bold">
                               {prop.area}m²
                            </span>

                            {/* Bedrooms */}
                            {prop.bedrooms && (
                              <span className="text-[10px] text-ink-500 font-bold hidden md:inline">
                                 {prop.bedrooms}PN
                              </span>
                            )}

                            {/* Expiry */}
                            {isApproved && !expiry.isExpired && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-ink-100 dark:bg-ink-800 text-ink-500 inline-flex items-center gap-0.5">
                                ⏳ {expiry.daysRemaining}d
                              </span>
                            )}
                          </div>

                          {/* Title (Clickable) */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleExpandProp(prop.id)}
                              className="text-xs font-bold text-ink-900 dark:text-ink-100 hover:text-brand-600 dark:hover:text-brand-400 text-left line-clamp-1 cursor-pointer"
                              title="Bấm để mở rộng xem chi tiết"
                            >
                              {prop.title}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Functional Action Icons */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center flex-wrap">
                        {/* View Public Button */}
                        <Link
                          to={detailUrl}
                          className="p-1.5 bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-300 rounded-xl transition flex items-center gap-1 text-[11px] font-bold"
                          title="Xem bài đăng công khai"
                        >
                          <Eye className="w-3.5 h-3.5 text-ink-500" />
                          <span className="hidden md:inline">Xem Tin</span>
                        </Link>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingProperty(prop);
                            setShowPropertyEditModal(true);
                          }}
                          className="p-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-xl transition flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                          title="Sửa bài đăng BĐS"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Sửa</span>
                        </button>

                        {/* Up Tin Button */}
                        <button
                          onClick={() => setSelectedPropertyForUpTin(prop)}
                          className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-[11px] rounded-xl shadow-xs flex items-center gap-1 transition cursor-pointer"
                          title="Đẩy tin lên Top 1"
                        >
                          <Zap className="w-3.5 h-3.5 text-brand-200" />
                          <span>Up Tin</span>
                        </button>

                        {/* Renew Button */}
                        <button
                          onClick={() => handleRenewProperty(prop.id)}
                          disabled={isRenewingId === prop.id}
                          className="p-1.5 bg-ink-100 dark:bg-ink-800 hover:bg-brand-50 text-ink-600 hover:text-brand-600 rounded-xl transition cursor-pointer"
                          title="Gia hạn +30 ngày"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRenewingId === prop.id ? 'animate-spin text-brand-500' : ''}`} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
                              handleDeleteProp(prop.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                          title="Xóa bài đăng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Expand / Collapse Chevron Button */}
                        <button
                          onClick={() => toggleExpandProp(prop.id)}
                          className="p-1.5 bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-300 rounded-xl transition flex items-center gap-0.5 text-[11px] font-bold cursor-pointer"
                          title={isExpanded ? 'Thu gọn' : 'Mở rộng chi tiết'}
                        >
                          <span className="text-[10px] text-ink-500 hidden lg:inline">{isExpanded ? 'Gọn' : 'Chi tiết'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED DETAILED ACCORDION (Click to Expand) */}
                    {isExpanded && (
                      <div className="p-3 sm:p-4 bg-ink-50/80 dark:bg-ink-800/40 border-t border-ink-200 dark:border-ink-800 space-y-3 animate-in fade-in duration-200 text-xs">
                        {/* 1. Image Gallery Strip */}
                        {prop.images && prop.images.length > 0 && (
                          <div>
                            <span className="text-[10px] text-ink-500 font-bold uppercase tracking-wider block mb-1.5">
                               Album Ảnh ({prop.images.length} ảnh):
                            </span>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                              {prop.images.map((imgUrl, imgIdx) => (
                                <img loading="lazy"
                                  key={imgIdx}
                                  src={imgUrl}
                                  alt={`${prop.title} - ảnh ${imgIdx + 1}`}
                                  className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl object-cover border border-ink-200 dark:border-ink-700 shrink-0 shadow-xs"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. Full Technical Specs Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="bg-white dark:bg-ink-900 p-2 rounded-xl border border-ink-200 dark:border-ink-800">
                            <span className="text-ink-400 block text-[10px]">Dự Án / Phân Khu:</span>
                            <span className="font-bold text-ink-800 dark:text-ink-200 truncate block">
                               {prop.project} {prop.subdivision ? `• ${prop.subdivision}` : ''}
                            </span>
                          </div>

                          <div className="bg-white dark:bg-ink-900 p-2 rounded-xl border border-ink-200 dark:border-ink-800">
                            <span className="text-ink-400 block text-[10px]">Cơ Cấu Phòng:</span>
                            <span className="font-bold text-ink-800 dark:text-ink-200 block">
                               {prop.bedrooms || 1} PN •  {prop.bathrooms || 1} WC
                            </span>
                          </div>

                          <div className="bg-white dark:bg-ink-900 p-2 rounded-xl border border-ink-200 dark:border-ink-800">
                            <span className="text-ink-400 block text-[10px]">Hướng & Tầng:</span>
                            <span className="font-bold text-ink-800 dark:text-ink-200 block">
                               {prop.direction || 'Đông Nam'} {prop.floor ? `• Tầng ${prop.floor}` : ''}
                            </span>
                          </div>

                          <div className="bg-white dark:bg-ink-900 p-2 rounded-xl border border-ink-200 dark:border-ink-800">
                            <span className="text-ink-400 block text-[10px]">Pháp Lý & Nội Thất:</span>
                            <span className="font-bold text-ink-800 dark:text-ink-200 truncate block">
                               {prop.legalStatus || 'Sổ đỏ lâu dài'} • {prop.furniture || 'Đầy đủ'}
                            </span>
                          </div>
                        </div>

                        {/* 3. Description Box */}
                        {prop.description && (
                          <div className="bg-white dark:bg-ink-900 p-2.5 rounded-xl border border-ink-200 dark:border-ink-800">
                            <span className="text-[10px] text-ink-400 font-bold uppercase tracking-wider block mb-1">
                               Mô Tả Chi Tiết:
                            </span>
                            <p className="text-ink-700 dark:text-ink-300 text-xs whitespace-pre-line line-clamp-4 leading-relaxed">
                              {prop.description}
                            </p>
                          </div>
                        )}

                        {/* 4. Bottom Footer Info & Fast Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-ink-200 dark:border-ink-700/60 text-[11px]">
                          <div className="flex items-center gap-3 text-ink-500">
                            <span> Đăng: <strong>{expiry.postDateFormatted}</strong></span>
                            <span>⏳ Hết hạn: <strong>{expiry.expiresAtFormatted}</strong></span>
                            <span> Lượt xem: <strong>{prop.viewsCount || 24}</strong></span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={detailUrl}
                              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl flex items-center gap-1 transition shadow-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Mở Trang BĐS</span>
                            </Link>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}${detailUrl}`);
                                alert(' Đã sao chép liên kết bài đăng BĐS!');
                              }}
                              className="px-2.5 py-1.5 bg-ink-200 dark:bg-ink-700 hover:bg-ink-300 text-ink-700 dark:text-ink-200 font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: MY SERVICES (DỊCH VỤ & THỢ KỸ THUẬT CƯ DÂN) */}
      {/* ========================================================================= */}
      {activeTab === 'my_services' && (
        <UserResidentServicesManager
          user={userState}
          onRefresh={onRefreshData}
          onOpenEscrowModal={() => setShowEscrowModal(true)}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WALLET & TOKENS (VÍ TOKEN CƯ DÂN & TIỀN RÚT) */}
      {/* ========================================================================= */}
      {activeTab === 'wallet_tokens' && (
        isBusinessAllowed ? (
          <UserWalletSection
            userState={userState}
            affiliateWallet={affiliateWallet}
            upTinCredits={upTinCredits}
            serverWalletTransactions={serverWalletTransactions}
            onOpenWithdrawModal={() => setShowWithdrawModal(true)}
            onRefreshBalance={refreshUserBalance}
            isSyncingBalance={isSyncingBalance}
            onOpenEscrowModal={() => setShowEscrowModal(true)}
            onQuickExchangeAffiliate={(credits) => {
              setUpTinCredits(prev => prev + credits);
              setUserState(prev => ({ ...prev, affiliatePoints: 0 }));
              setAffiliateWallet(0);
              alert(` Đã quy đổi thành công sang +${credits} Lượt Up Tin BĐS!`);
            }}
          />
        ) : (
          <div className="bg-white dark:bg-ink-900 rounded-2xl border border-brand-500/40 p-6 sm:p-8 text-center space-y-4 shadow-md animate-in fade-in">
            <div className="w-16 h-16 bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center mx-auto text-2xl border border-brand-500/20">
              
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base sm:text-lg font-black text-ink-900 dark:text-white">
                Ví Doanh Nghiệp Chỉ Dành Cho Tài Khoản Được Phép Kinh Doanh
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400">
                Để đảm bảo môi trường giao dịch an toàn và minh bạch, chỉ các tài khoản đã đăng ký Doanh Nghiệp B2B, Thợ Dịch Vụ, Môi Giới hoặc hoàn tất Xác Thực Danh Tính (KYC) mới có quyền sử dụng Ví Nạp Token & Ký Quỹ Escrow.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowEmployerRegModal(true)}
                className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-ink-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Đăng Ký Tài Khoản Doanh Nghiệp / B2B</span>
              </button>

              <button
                onClick={() => setShowKycModal(true)}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Xác Thực Danh Tính KYC</span>
              </button>

              <button
                onClick={() => setShowProfileEditModal(true)}
                className="px-4 py-2.5 bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-800 dark:text-ink-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Cập Nhật Ngành Nghề Kinh Doanh</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY CV (HỒ SƠ CV CƯ DÂN) */}
      {/* ========================================================================= */}
      {activeTab === 'my_cv' && (
        <UserCvManagement currentUser={userState} onRefresh={onRefreshData} />
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RECRUITER PACKAGES (GÓI NHÀ TUYỂN DỤNG) */}
      {/* ========================================================================= */}
      {activeTab === 'recruiter_packages' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-brand-950 via-ink-900 to-teal-950 p-4 sm:p-5 rounded-2xl border border-brand-500/30 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="px-2 py-0.5 bg-brand-500 text-ink-950 font-black text-[9px] rounded uppercase">
                DOANH NGHIỆP & CHỦ SHOP
              </span>
              <h2 className="text-base sm:text-lg font-black text-brand-300 mt-1">
                GÓI NHÀ TUYỂN DỤNG & MỞ KHÓA CV CƯ DÂN
              </h2>
              <p className="text-xs text-ink-300">
                Mở khóa thông tin ứng viên, đăng tin VIP và tiếp cận hàng vạn người tìm việc nội khu Vinhomes.
              </p>
            </div>

            <button
              onClick={() => setShowEmployerRegModal(true)}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-ink-950 font-black text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
            >
              + ĐĂNG KÝ GÓI DOANH NGHIỆP
            </button>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {RECRUITMENT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white dark:bg-ink-900 rounded-2xl border p-4 flex flex-col justify-between space-y-3 shadow-xs relative ${
                  pkg.isPopular ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-ink-200 dark:border-ink-800'
                }`}
              >
                {pkg.isPopular && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-brand-500 text-ink-950 text-[9px] font-black rounded-full uppercase">
                    Phổ biến nhất
                  </span>
                )}

                <div className="space-y-2">
                  <div className="text-xs font-black text-ink-900 dark:text-white uppercase">{pkg.name}</div>
                  <div>
                    <div className="text-xl font-black text-ink-900 dark:text-white">
                      {pkg.priceVnd.toLocaleString('vi-VN')} <span className="text-xs font-normal text-ink-400">VNĐ</span>
                    </div>
                    <div className="text-xs font-bold text-brand-500">
                       {pkg.priceToken.toLocaleString('vi-VN')} Token Cư Dân
                    </div>
                  </div>

                  <p className="text-[11px] text-ink-500 dark:text-ink-400 border-t border-ink-100 dark:border-ink-800 pt-2">
                    {pkg.description}
                  </p>

                  <ul className="space-y-1.5 text-xs text-ink-700 dark:text-ink-300">
                    <li className="flex items-center gap-1.5">
                      <span className="text-brand-500 font-bold"></span>
                      <span><strong>{pkg.jobPostsCount}</strong> tin tuyển dụng</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-brand-500 font-bold"></span>
                      <span>Mở khóa <strong>{pkg.cvUnlockCount}</strong> CV ứng viên</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-brand-500 font-bold"></span>
                      <span>Thời hạn: <strong>{pkg.durationDays} ngày</strong></span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setShowEmployerRegModal(true)}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                    pkg.isPopular
                      ? 'bg-brand-500 text-ink-950 hover:bg-brand-400'
                      : 'bg-ink-900 dark:bg-ink-800 text-white hover:bg-ink-800'
                  }`}
                >
                  Đăng Ký Gói
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MY STORE & KIOTVIET POS */}
      {/* ========================================================================= */}
      {activeTab === 'my_store' && (
        <UserStorefrontManager user={user} />
      )}

      {/* ========================================================================= */}
      {/* TAB 6: UP-TIN TRANSACTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-3">
            <h3 className="font-extrabold text-sm text-ink-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              LỊCH SỬ NẠP & ĐẨY TIN LÊN TOP 1
            </h3>
            <span className="text-xs text-ink-500">
              Số dư Up Tin: <strong className="text-brand-600 dark:text-brand-400 font-bold">{upTinCredits} lượt</strong>
            </span>
          </div>

          {localTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-ink-500 space-y-1">
              <p>Chưa có lịch sử Up Tin nào trong phiên này.</p>
              <p className="text-[11px] text-ink-400">Bấm nút "+Up Tin Free" ở trên để nhận lượt Up Tin miễn phí!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-ink-100 dark:border-ink-800 text-ink-400 font-bold uppercase text-[10px] bg-ink-50 dark:bg-ink-800/40">
                    <th className="p-2.5">Thời Gian</th>
                    <th className="p-2.5">Loại</th>
                    <th className="p-2.5">Nội Dung</th>
                    <th className="p-2.5 text-right">Số Lượt</th>
                    <th className="p-2.5 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                  {localTransactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-ink-50 dark:hover:bg-ink-800/50">
                      <td className="p-2.5 font-mono text-ink-500 text-[11px]">{tx.createdAt}</td>
                      <td className="p-2.5 font-bold text-ink-800 dark:text-ink-200">{tx.type}</td>
                      <td className="p-2.5 text-ink-600 dark:text-ink-300">{tx.description}</td>
                      <td className="p-2.5 text-right font-black text-brand-600 dark:text-brand-400">+{tx.credits}</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-[10px] rounded">
                           Thành Công
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: AFFILIATE & REVENUE SHARING */}
      {/* ========================================================================= */}
      {activeTab === 'affiliate' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-ink-900 via-ink-800 to-brand-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-ink-700/80 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <span className="px-2.5 py-0.5 bg-brand-500 text-ink-950 font-black text-[9px] rounded uppercase inline-flex items-center gap-1">
                  <Gift className="w-3 h-3" /> HOA HỒNG GIỚI THIỆU 15% - 20%
                </span>
                <h2 className="text-base sm:text-lg font-black text-brand-400">
                  Giới Thiệu Cư Dân & Môi Giới — Nhận Hoa Hồng Nạp Tiền Tự Động
                </h2>
                <p className="text-xs text-ink-300">
                  Khi người được bạn giới thiệu mua gói Up Tin hoặc đăng ký dịch vụ, bạn sẽ nhận hoa hồng rút về ATM hoặc quy đổi Up Tin.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-right shrink-0 space-y-1 w-full md:w-auto">
                <span className="text-[10px] text-ink-300 font-bold block">VÍ HOA HỒNG KHẢ DỤNG</span>
                <span className="text-xl font-black text-brand-400 block">{affiliateWallet.toLocaleString('vi-VN')} VNĐ</span>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-3 py-1.5 bg-brand-500 hover:bg-brand-400 text-ink-950 font-black rounded-xl text-xs transition cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 inline mr-1" /> Rút Tiền VietQR
                </button>
              </div>
            </div>

            {/* Referral Link Copy Bar */}
            <div className="bg-ink-900/90 p-3 rounded-xl border border-brand-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="p-2 bg-brand-500/20 text-brand-400 rounded-lg shrink-0 font-mono font-bold text-xs">
                  {userRefCode}
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] text-ink-400 block font-bold">Link giới thiệu của bạn:</span>
                  <span className="text-xs font-mono font-bold text-brand-400 truncate block">{userRefLink}</span>
                </div>
              </div>

              <button
                onClick={handleCopyRefLink}
                className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                  copiedLink
                    ? 'bg-brand-500 text-ink-950'
                    : 'bg-brand-500 hover:bg-brand-400 text-ink-950'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Đã sao chép!' : 'Sao Chép Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: ACCOUNT PROFILE & BANK DETAILS */}
      {/* ========================================================================= */}
      {activeTab === 'account_profile' && (
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-100 dark:border-ink-800">
            <div className="flex items-center gap-3">
              <img loading="lazy"
                src={userState.avatar || ''}
                alt={userState.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/50 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-ink-900 dark:text-white">
                    {userState.name}
                  </h2>
                  <span className="px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[10px] rounded-md border border-brand-500/20">
                    {userState.role === 'admin' ? ' Admin' : 'Cư Dân'}
                  </span>
                </div>
                <p className="text-xs text-ink-500">{userState.email}</p>
                <p className="text-xs text-ink-500 mt-0.5"> {userState.phone || 'Chưa cập nhật SĐT'}</p>
              </div>
            </div>

            <button
              onClick={() => setShowProfileEditModal(true)}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-center"
            >
              <Edit2 className="w-4 h-4" />
              <span>Chỉnh Sửa Hồ Sơ & Ngân Hàng</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Box 1: Thông tin liên hệ cư dân */}
            <div className="bg-ink-50 dark:bg-ink-800/50 p-4 rounded-2xl border border-ink-200 dark:border-ink-700 space-y-3">
              <h3 className="font-black text-ink-900 dark:text-white flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4 text-brand-500" />
                Thông Tin Cư Dân & Căn Hộ
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-ink-200 dark:border-ink-700/60 pb-1.5">
                  <span className="text-ink-500">Họ và tên:</span>
                  <span className="font-bold text-ink-800 dark:text-ink-200">{userState.name}</span>
                </div>
                <div className="flex justify-between border-b border-ink-200 dark:border-ink-700/60 pb-1.5">
                  <span className="text-ink-500">Số điện thoại:</span>
                  <span className="font-bold font-mono text-ink-800 dark:text-ink-200">{userState.phone || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-ink-200 dark:border-ink-700/60 pb-1.5">
                  <span className="text-ink-500">Số Zalo liên hệ:</span>
                  <span className="font-bold font-mono text-ink-800 dark:text-ink-200">{userState.zaloPhone || userState.phone || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-ink-200 dark:border-ink-700/60 pb-1.5">
                  <span className="text-ink-500">Email đăng nhập:</span>
                  <span className="font-bold text-ink-800 dark:text-ink-200">{userState.email}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-ink-500">Căn hộ / Địa chỉ:</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 truncate max-w-[200px]">{userState.apartmentAddress || 'Vinhomes Ocean Park'}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Thông tin tài khoản ngân hàng */}
            <div className="bg-ink-50 dark:bg-ink-800/50 p-4 rounded-2xl border border-ink-200 dark:border-ink-700 space-y-3">
              <h3 className="font-black text-ink-900 dark:text-white flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-brand-500" />
                Tài Khoản Ngân Hàng Nhận Tiền
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-ink-200 dark:border-ink-700/60 pb-1.5">
                  <span className="text-ink-500">Ngân hàng:</span>
                  <span className="font-bold text-ink-800 dark:text-ink-200">{userState.bankName || 'Vietcombank'}</span>
                </div>
                <div className="flex justify-between border-b border-ink-200 dark:border-ink-700/60 pb-1.5">
                  <span className="text-ink-500">Số tài khoản:</span>
                  <span className="font-bold font-mono text-brand-600 dark:text-brand-400">{userState.bankAccountNumber || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex justify-between border-b border-ink-200 dark:border-ink-700/60 pb-1.5">
                  <span className="text-ink-500">Tên chủ tài khoản:</span>
                  <span className="font-bold uppercase text-ink-800 dark:text-ink-200">{userState.bankAccountName || userState.name.toUpperCase()}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-ink-500">Phương thức rút tiền:</span>
                  <span className="font-bold text-brand-600">VietQR Tự Động 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* User Profile Edit Modal */}
      <UserProfileEditModal
        isOpen={showProfileEditModal}
        onClose={() => setShowProfileEditModal(false)}
        user={userState}
        onSave={(updated) => {
          setUserState(prev => ({ ...prev, ...updated }));
          if (onRefreshData) onRefreshData();
        }}
      />

      {/* User Property Edit Modal */}
      <UserPropertyEditModal
        isOpen={showPropertyEditModal}
        onClose={() => {
          setShowPropertyEditModal(false);
          setEditingProperty(null);
        }}
        property={editingProperty}
        onSave={(savedProp) => {
          if (onUpdateProperty) {
            onUpdateProperty(savedProp);
          }
          if (onRefreshData) {
            onRefreshData();
          }
        }}
      />

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowWithdrawModal(false);
                setWithdrawalSuccess(false);
              }}
              className="absolute top-4 right-4 p-1.5 text-ink-400 hover:text-ink-600 dark:hover:text-white rounded-full transition"
            >
              
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-brand-500/20 text-brand-500 rounded-xl flex items-center justify-center mx-auto font-black">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-ink-900 dark:text-white">
                RÚT TIỀN HOA HỒNG VỀ NGÂN HÀNG
              </h3>
              <p className="text-xs text-ink-500">
                Chuyển khoản tự động qua hệ thống VietQR 24/7
              </p>
            </div>

            {withdrawalSuccess ? (
              <div className="bg-brand-500/10 border border-brand-500/30 p-4 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-brand-500 mx-auto" />
                <h4 className="font-extrabold text-brand-600 text-xs">GỬI LỆNH RÚT TIỀN THÀNH CÔNG!</h4>
                <p className="text-xs text-ink-600 dark:text-ink-300">
                  Hệ thống Admin đã tiếp nhận lệnh rút <strong className="text-brand-600">{Number(withdrawalAmount).toLocaleString('vi-VN')}đ</strong>. Tiền sẽ được xử lý trong vòng 1-3 giờ.
                </p>
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawalSuccess(false);
                  }}
                  className="w-full py-2 bg-brand-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-ink-700 dark:text-ink-300 mb-1">
                    Số tiền muốn rút (VNĐ) — Tối thiểu 100.000đ:
                  </label>
                  <input
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl font-bold text-sm text-brand-500 outline-hidden"
                  />
                  <span className="text-[10px] text-ink-400 mt-0.5 block">
                    Khả dụng: <strong className="text-brand-500">{affiliateWallet.toLocaleString('vi-VN')}đ</strong>
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-ink-700 dark:text-ink-300 mb-1">
                    Ngân hàng thụ hưởng:
                  </label>
                  <input
                    type="text"
                    defaultValue="Vietcombank"
                    placeholder="VD: Vietcombank, MBBank, Techcombank..."
                    className="w-full px-3 py-2 bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl font-medium outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink-700 dark:text-ink-300 mb-1">
                    Số tài khoản ngân hàng:
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số tài khoản nhận tiền..."
                    className="w-full px-3 py-2 bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl font-bold font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink-700 dark:text-ink-300 mb-1">
                    Tên chủ tài khoản:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: NGUYEN VAN A"
                    defaultValue={user.name ? user.name.toUpperCase() : ''}
                    className="w-full px-3 py-2 bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl font-bold uppercase outline-hidden"
                  />
                </div>

                <button
                  onClick={() => {
                    const amt = Number(withdrawalAmount);
                    if (amt > affiliateWallet) {
                      alert('Số tiền vượt quá số dư ví hiện tại!');
                      return;
                    }
                    setAffiliateWallet(prev => Math.max(0, prev - amt));
                    setWithdrawalSuccess(true);
                  }}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 text-ink-950 font-black rounded-xl text-xs shadow-xs transition cursor-pointer"
                >
                  XÁC NHẬN RÚT TIỀN
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Up-Tin Payment Modal */}
      {selectedPropertyForUpTin && (
        <UpTinPaymentModal
          property={selectedPropertyForUpTin}
          user={user}
          pricingConfig={pricingConfig}
          onClose={() => setSelectedPropertyForUpTin(null)}
          onSuccessPush={handleUpTinSuccess}
        />
      )}

      {/* KYC Verification Modal */}
      {showKycModal && (
        <KycVerificationModal
          user={userState}
          onClose={() => setShowKycModal(false)}
          onKycSubmitted={(updatedUser) => {
            setUserState(prev => ({ ...prev, ...updatedUser }));
          }}
        />
      )}

      {/* Interaction Proof Chat Modal */}
      {showInteractionChatModal && (
        <InteractionProofChatModal
          user={user}
          onClose={() => setShowInteractionChatModal(false)}
          onGrantPoints={(points, activityName) => {
            setUpTinCredits(prev => prev + points);
          }}
        />
      )}

      {/* Employer Registration Modal */}
      {showEmployerRegModal && (
        <UserEmployerRegistrationModal
          currentUser={userState}
          onClose={() => setShowEmployerRegModal(false)}
          onSuccess={() => {
            onRefreshData();
          }}
        />
      )}

      {/* Technical Service Escrow Modal (Chỉ mở cho User có quyền kinh doanh / thợ) */}
      {showEscrowModal && (
        <TechnicalServiceEscrowModal
          isOpen={showEscrowModal}
          onClose={() => setShowEscrowModal(false)}
          currentUser={userState}
          onOpenAuth={() => {}}
        />
      )}
    </div>
  );
};
