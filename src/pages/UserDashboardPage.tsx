import React, { useState, useEffect } from 'react';
import { Property, User, Language, UpTinPricingConfig, UpTinTransaction } from '../types';
import { PlusCircle, Zap, Crown, Eye, MessageSquare, Edit3, Trash2, ShieldCheck, CheckCircle2, Clock, Sparkles, AlertCircle, ArrowUpRight, UserCheck, Shield, Lock, Users, Share2, DollarSign, Gift, Wallet, Copy, Check, ExternalLink, Award, ArrowRight, RefreshCw, Briefcase, FileText, Building2, Coins } from 'lucide-react';
import { calculateExpiryInfo } from '../lib/expiration';
import { UpTinPaymentModal } from '../components/UpTinPaymentModal';
import { KycVerificationModal } from '../components/KycVerificationModal';
import { UserStorefrontManager } from '../components/UserStorefrontManager';
import { InteractionProofChatModal } from '../components/InteractionProofChatModal';
import { UserCvManagement } from '../components/UserCvManagement';
import { UserEmployerRegistrationModal } from '../components/UserEmployerRegistrationModal';
import { playMessageRingtone } from '../lib/audioRingtone';
import { RECRUITMENT_PACKAGES } from '../data/recruitmentData';

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

  const handlePostProperty = onOpenPostProperty || onPostNewProperty || (() => {});
  const handleSelectProp = onSelectProperty || (() => {});
  const handleDeleteProp = onDeleteProperty || (() => {});

  const [activeTab, setActiveTab] = useState<'my_properties' | 'wallet_tokens' | 'my_cv' | 'recruiter_packages' | 'my_store' | 'transactions' | 'affiliate' | 'profile'>('my_properties');
  const [selectedPropertyForUpTin, setSelectedPropertyForUpTin] = useState<Property | null>(null);
  const [localTransactions, setLocalTransactions] = useState<UpTinTransaction[]>([]);
  const [serverWalletTransactions, setServerWalletTransactions] = useState<any[]>([]);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showEmployerRegModal, setShowEmployerRegModal] = useState(false);
  const [userState, setUserState] = useState<User>(user);
  const [isSyncingBalance, setIsSyncingBalance] = useState(false);

  // Synchronize with parent user prop
  useEffect(() => {
    if (user) {
      setUserState(prev => ({ ...prev, ...user }));
      if (typeof user.upTinCredits === 'number') setUpTinCredits(user.upTinCredits);
      if (typeof user.affiliatePoints === 'number') setAffiliateWallet(user.affiliatePoints);
    }
  }, [user]);

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
          // Update localStorage hb_user
          const merged = { ...user, ...freshData };
          try {
            localStorage.setItem('hb_user', JSON.stringify(merged));
          } catch (e) {}
          if (showToast) {
            alert(`✅ ĐÃ ĐỒNG BỘ SỐ DƯ TỨC THÌ TỪ HỆ THỐNG:\n• Token Cư Dân (Xu Tiêu Dùng): ${(freshData.balance || 0).toLocaleString('vi-VN')} Token\n• Điểm Rút Tiền Affiliate: ${(freshData.affiliatePoints || 0).toLocaleString('vi-VN')} đ\n• Lượt Up Tin: ${freshData.upTinCredits || 0} lượt`);
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
    const interval = setInterval(() => refreshUserBalance(false), 3000); // Live poll every 3s
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
  const [affiliateWallet, setAffiliateWallet] = useState(450000); // VNĐ balance

  const userRefCode = `REF-${user?.name ? user.name.replace(/\s+/g, '').toUpperCase().slice(0, 8) : 'CUDAN24H'}`;
  const userRefLink = `https://chocudan24h.com/?ref=${userRefCode}`;

  const handleCopyRefLink = () => {
    navigator.clipboard.writeText(userRefLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Filter properties belonging to logged in user or uploaded in demo
  const userProperties = (properties || []).filter(p => {
    if (!p) return false;
    const matchId = Boolean(user.id && p.userId === user.id);
    const matchPhone = Boolean(user.phone && (p.sellerPhone === user.phone || p.userPhone === user.phone));
    const matchName = Boolean(user.name && p.sellerName && user.name.length > 2 && p.sellerName.toLowerCase().includes(user.name.toLowerCase()));
    const isAdmin = user.role === 'admin';
    return matchId || matchPhone || matchName || isAdmin;
  });

  const approvedCount = userProperties.filter(p => p.status === 'approved' || p.approved).length;
  const pendingCount = userProperties.length - approvedCount;
  const totalViews = userProperties.reduce((acc, p) => acc + (p.viewsCount || Math.floor(Math.random() * 80) + 12), 0);

  const handleUpTinSuccess = (updatedProp: Property, newTx: UpTinTransaction) => {
    setSelectedPropertyForUpTin(null);
    setLocalTransactions(prev => [newTx, ...prev]);
    onRefreshData();
  };

  const [isRenewingId, setIsRenewingId] = useState<string | null>(null);

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
        alert(data.message || '🎉 Đã gia hạn hiển thị tin thành công thêm 30 ngày!');
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

  const [upTinCredits, setUpTinCredits] = useState(user.upTinCredits || 12);
  const [showInteractionChatModal, setShowInteractionChatModal] = useState<boolean>(false);

  // Per-user storage key so every user can only claim social channels ONCE
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
    } catch (e) {
      // ignore
    }
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
      alert(`⚠️ Mỗi tài khoản cư dân chỉ được dùng 1 LẦN DUY NHẤT cho kênh ${platform.toUpperCase()}! Bạn đã nhận lượt Up Tin từ kênh này rồi.`);
      return;
    }

    window.open(url, '_blank');
    const updatedClaimed = { ...claimedSocial, [platform]: true };
    setClaimedSocial(updatedClaimed);
    try {
      localStorage.setItem(userSocialKey, JSON.stringify(updatedClaimed));
    } catch (e) {
      // ignore
    }

    setUpTinCredits(prev => prev + points);
    playMessageRingtone();
    alert(`🎉 CHÚC MỪNG! Tài khoản [${user.name}] vừa nhận thêm +${points} Lượt Up Tin miễn phí từ kênh ${platform.toUpperCase()}!`);
  };

  const getTierBadge = () => {
    const topup = user.totalTopup || 0;
    if (topup >= 15000000) return { name: 'HẠNG KIM CƯƠNG', color: 'bg-cyan-500 text-slate-950', vipLimit: 'Không giới hạn Tin VIP' };
    if (topup >= 5000000) return { name: 'HẠNG VÀNG', color: 'bg-amber-400 text-slate-950', vipLimit: '15 Tin VIP Silver/Gold' };
    if (topup >= 1000000) return { name: 'HẠNG BẠC', color: 'bg-slate-300 text-slate-950', vipLimit: '5 Tin VIP Silver' };
    return { name: 'HẠNG THƯỜNG', color: 'bg-emerald-600 text-white', vipLimit: 'Tin Thường & 10 Up Tin Tặng' };
  };

  const tierInfo = getTierBadge();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-5">
      {/* Donate Mode Banner Notice */}
      {pricingConfig.paymentEnabled === false && (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-500/40 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs shrink-0">
              🎁
            </span>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                CHẾ ĐỘ UP TIN MIỄN PHÍ (DONATE TÙY TÂM) ĐANG BẬT
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                Admin đã mở đẩy tin BĐS lên Top 1 hoàn toàn Miễn Phí cho mọi thành viên.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-0.5 bg-emerald-600 text-white font-black text-[10px] rounded-full uppercase">
            100% Free
          </span>
        </div>
      )}

      {/* UNIFIED ALL-IN-ONE DASHBOARD CONTAINER */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-emerald-800/60 relative overflow-hidden space-y-5">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* SECTION 1: USER PROFILE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 pb-4 border-b border-emerald-800/40">
          {/* User Info */}
          <div className="flex items-center gap-3.5">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-emerald-400/80 shadow-md object-cover shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {user.role === 'admin' ? '👑 Admin Tổng' : user.role === 'sale' ? '💼 Môi Giới/Sale' : '🏠 Chủ Nhà'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-xs ${tierInfo.color}`}>
                  <Crown className="w-3 h-3 inline mr-0.5" />
                  {tierInfo.name}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-300">
                <span>📱 SĐT: <strong className="text-white">{user.phone || '0868.499.929'}</strong></span>
                <span className="text-slate-600">|</span>
                <span>✉️ Email: <strong className="text-white">{user.email}</strong></span>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-[11px] text-emerald-300 pt-0.5">
                <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30 font-black font-mono">
                  🪙 {(userState.balance || 0).toLocaleString('vi-VN')} Token Cư Dân
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/30 font-black font-mono">
                  💸 {(userState.affiliatePoints || affiliateWallet || 0).toLocaleString('vi-VN')} đ Rút Tiền
                </span>
                <span className="text-slate-600">|</span>
                <span>Lượt Up Tin: <strong className="text-amber-300 font-black">{upTinCredits} lượt</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => refreshUserBalance(true)}
              disabled={isSyncingBalance}
              className="px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              title="Nhấn để cập nhật số dư Token tức thì từ hệ thống"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBalance ? 'animate-spin text-amber-400' : 'text-sky-400'}`} />
              <span>{isSyncingBalance ? 'Đang đồng bộ...' : 'Đồng Bộ Số Dư'}</span>
            </button>
            <button
              onClick={handlePostProperty}
              className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>ĐĂNG TIN MỚI</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-2.5 bg-slate-800/90 hover:bg-slate-800 text-rose-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                title="Đăng xuất hoặc đổi tài khoản"
              >
                <span>Đổi Nick</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 2: LIVE WALLET & QUICK STATS GRID - 5 COLUMNS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Box 1: Token Cư Dân */}
          <div className="bg-gradient-to-br from-amber-950/70 via-slate-900 to-slate-900 p-3.5 rounded-2xl border-2 border-amber-500/60 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-black text-[10px] uppercase tracking-wider">VÍ TOKEN TIÊU DÙNG</span>
              <span className="p-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs">🪙</span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-amber-300 font-mono">
                {(userState.balance || 0).toLocaleString('vi-VN')}
              </div>
              <span className="text-[10px] text-slate-400">Xu tiêu dùng dịch vụ</span>
            </div>
          </div>

          {/* Box 2: Điểm Rút Tiền Affiliate */}
          <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 p-3.5 rounded-2xl border-2 border-emerald-500/60 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-black text-[10px] uppercase tracking-wider">VÍ RÚT TIỀN AFFILIATE</span>
              <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs">💸</span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-emerald-300 font-mono">
                {(userState.affiliatePoints || affiliateWallet || 0).toLocaleString('vi-VN')}
              </div>
              <span className="text-[10px] text-slate-400">VNĐ (Được rút về ATM)</span>
            </div>
          </div>

          {/* Box 3: Lượt Up Tin */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase">LƯỢT UP TIN TOP 1</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-amber-400 font-mono">{upTinCredits}</div>
              <span className="text-[10px] text-slate-400">Lượt đẩy bài ưu tiên</span>
            </div>
          </div>

          {/* Box 4: Tổng Tin Đăng */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase">TỔNG TIN ĐĂNG BĐS</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-white font-mono">{userProperties.length}</div>
              <span className="text-[10px] text-slate-400">({approvedCount} tin đã duyệt)</span>
            </div>
          </div>

          {/* Box 5: Lượt Xem Tích Lũy */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-800/40 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase">LƯỢT XEM TÍCH LŨY</span>
              <Eye className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-black text-white font-mono">{totalViews.toLocaleString('vi-VN')}</div>
              <span className="text-[10px] text-slate-400">Lượt khách ghé xem</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: KYC VERIFICATION BAR INTEGRATED */}
        <div className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wide">
                  ĐỊNH DANH CƯ DÂN & NÚT XANH KYC VINHOMES
                </h3>
                {userState.kycStatus === 'verified' ? (
                  <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full flex items-center gap-1 shadow-xs">
                    ✓ Đã Cấp Nút Xanh KYC
                  </span>
                ) : userState.kycStatus === 'pending_ai' ? (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center gap-1 shadow-xs">
                    ⏳ Đang Chờ Kiểm Duyệt
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-500/90 text-white text-[10px] font-black rounded-full flex items-center gap-1 shadow-xs">
                    ⚠️ Chưa Nhận Nút Xanh
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Cập nhật CCCD hoặc chứng chỉ ngành nghề/môi giới để nhận Huy Hiệu Cư Dân Chính Chủ trên gian hàng & các bài đăng.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowKycModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition shrink-0 uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{userState.kycStatus === 'verified' ? 'CẬP NHẬT ĐỊNH DANH' : 'ĐỊNH DANH & NHẬN NÚT XANH'}</span>
          </button>
        </div>

        {/* SECTION 4: SOCIAL CHANNEL REWARDS BAR INTEGRATED */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                NHẬN UP TIN MIỄN PHÍ
              </span>
              <h3 className="text-xs sm:text-sm font-black text-white">
                Tương Tác Kênh Truyền Thông nhận +5 đến +10 Lượt Up Tin Top 1
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">
              Số dư hiện tại: <strong className="text-emerald-400">{upTinCredits} lượt</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* Zalo */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="font-bold text-xs text-sky-400 block truncate">Zalo Official Account</span>
                <span className="text-[10px] text-slate-400 block">Quan tâm Zalo OA (1 Lần/User)</span>
              </div>
              <button
                onClick={() => handleClaimReward('zalo', 5, 'https://zalo.me/')}
                disabled={claimedSocial.zalo}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  claimedSocial.zalo
                    ? 'bg-slate-700/90 text-slate-400 cursor-not-allowed border border-slate-600'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs cursor-pointer'
                }`}
              >
                {claimedSocial.zalo ? '✓ Đã Nhận (1 Lần/User)' : '+5 Up Tin'}
              </button>
            </div>

            {/* Facebook */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="font-bold text-xs text-blue-400 block truncate">Facebook Chợ Cư Dân 24h</span>
                <span className="text-[10px] text-slate-400 block">Like & Follow Fanpage (1 Lần/User)</span>
              </div>
              <button
                onClick={() => handleClaimReward('facebook', 5, 'https://www.facebook.com/chocudan24h')}
                disabled={claimedSocial.facebook}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  claimedSocial.facebook
                    ? 'bg-slate-700/90 text-slate-400 cursor-not-allowed border border-slate-600'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer'
                }`}
              >
                {claimedSocial.facebook ? '✓ Đã Nhận (1 Lần/User)' : '+5 Up Tin'}
              </button>
            </div>

            {/* YouTube */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="font-bold text-xs text-rose-400 block truncate">YouTube Chợ Cư Dân 24h</span>
                <span className="text-[10px] text-slate-400 block">Đăng ký kênh YouTube (1 Lần/User)</span>
              </div>
              <button
                onClick={() => handleClaimReward('youtube', 5, 'https://www.youtube.com/@chocudan24h')}
                disabled={claimedSocial.youtube}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  claimedSocial.youtube
                    ? 'bg-slate-700/90 text-slate-400 cursor-not-allowed border border-slate-600'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs cursor-pointer'
                }`}
              >
                {claimedSocial.youtube ? '✓ Đã Nhận (1 Lần/User)' : '+5 Up Tin'}
              </button>
            </div>

            {/* TikTok */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="font-bold text-xs text-slate-200 block truncate">TikTok Chợ Cư Dân 24h</span>
                <span className="text-[10px] text-slate-400 block">Follow kênh TikTok (1 Lần/User)</span>
              </div>
              <button
                onClick={() => handleClaimReward('tiktok', 5, 'https://www.tiktok.com/@chocudan24h')}
                disabled={claimedSocial.tiktok}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  claimedSocial.tiktok
                    ? 'bg-slate-700/90 text-slate-400 cursor-not-allowed border border-slate-600'
                    : 'bg-slate-100 text-slate-900 hover:bg-white shadow-xs cursor-pointer'
                }`}
              >
                {claimedSocial.tiktok ? '✓ Đã Nhận (1 Lần/User)' : '+5 Up Tin'}
              </button>
            </div>

            {/* Google Maps */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="font-bold text-xs text-amber-400 block truncate">Google Maps Review</span>
                <span className="text-[10px] text-slate-400 block">Đánh giá 5 sao Google (1 Lần/User)</span>
              </div>
              <button
                onClick={() => handleClaimReward('google', 10, 'https://maps.google.com')}
                disabled={claimedSocial.google}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  claimedSocial.google
                    ? 'bg-slate-700/90 text-slate-400 cursor-not-allowed border border-slate-600'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs cursor-pointer'
                }`}
              >
                {claimedSocial.google ? '✓ Đã Nhận (1 Lần/User)' : '+10 Up Tin'}
              </button>
            </div>

            {/* Telegram */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="font-bold text-xs text-indigo-400 block truncate">Telegram Khách Hàng</span>
                <span className="text-[10px] text-slate-400 block">Tham gia Group BĐS (1 Lần/User)</span>
              </div>
              <button
                onClick={() => handleClaimReward('telegram', 5, 'https://t.me/')}
                disabled={claimedSocial.telegram}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  claimedSocial.telegram
                    ? 'bg-slate-700/90 text-slate-400 cursor-not-allowed border border-slate-600'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer'
                }`}
              >
                {claimedSocial.telegram ? '✓ Đã Nhận (1 Lần/User)' : '+5 Up Tin'}
              </button>
            </div>
          </div>

          {/* EXTRA REWARDS FOR MAIN PAGE INTERACTIONS */}
          <div className="mt-3 pt-3 border-t border-slate-800 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 p-3.5 rounded-xl border border-amber-500/30 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded uppercase tracking-wider">
                  🔥 TƯƠNG TÁC SÔI NỔ TRANG CHÍNH CHỢ CƯ DÂN
                </span>
                <h4 className="text-xs font-black text-white mt-1">
                  Đổi Lượt Up Bài Từ Hoạt Động Like, Share, Bình Luận Tích Cực
                </h4>
                <p className="text-[11px] text-slate-300">
                  Tương tác nhiệt tình trên trang chính Chợ Cư Dân (thả tim bài BĐS, gửi bình luận hữu ích, share link) rồi gửi bằng chứng qua Chat App tới Admin để nhận ngay +5 đến +20 Lượt Up Bài!
                </p>
              </div>

              <button
                onClick={() => setShowInteractionChatModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>💬 GỬI BẰNG CHỨNG TỚI ADMIN CHAT ĐỔI LƯỢT UP</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Segment Control Header */}
      <div className="bg-slate-200/60 dark:bg-slate-900/80 p-1 rounded-2xl flex items-center gap-1 overflow-x-auto text-xs font-bold border border-slate-300/60 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('my_properties')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'my_properties'
              ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Tin Đăng BĐS ({userProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet_tokens')}
          className={`flex-1 min-w-[180px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'wallet_tokens'
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-sm font-extrabold'
              : 'text-amber-600 dark:text-amber-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🪙</span>
          <span>Ví Token & Tiền ({((userState.balance || 0) / 1000).toLocaleString('vi-VN')}k)</span>
          <span className="px-1.5 py-0.2 bg-slate-900 text-amber-300 text-[9px] rounded font-black">Live</span>
        </button>

        <button
          onClick={() => setActiveTab('my_cv')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'my_cv'
              ? 'bg-teal-600 text-white shadow-sm font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Hồ Sơ CV Cư Dân</span>
          <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[9px] rounded font-black">Mới</span>
        </button>

        <button
          onClick={() => setActiveTab('recruiter_packages')}
          className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'recruiter_packages'
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Gói Nhà Tuyển Dụng</span>
          <span className="px-1.5 py-0.2 bg-slate-900 text-amber-400 text-[9px] rounded font-black">VIP</span>
        </button>

        <button
          onClick={() => setActiveTab('my_store')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'my_store'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Gian Hàng & KiotViet</span>
          <span className="px-1 py-0.2 bg-blue-600 text-white text-[9px] rounded font-mono">API</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Lịch Sử Up Tin ({localTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('affiliate')}
          className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'affiliate'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Affiliate & Rút Tiền</span>
          <span className="px-1 py-0.2 bg-slate-900 text-amber-400 text-[9px] rounded font-black">15-20%</span>
        </button>
      </div>

      {/* Tab 1: My Properties List */}
      {activeTab === 'my_properties' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Danh Sách Bài Đăng & Thanh Toán Up Tin Top 1
            </h2>
            <span className="text-xs text-slate-500">
              Mẹo: Nhấp nút <strong className="text-emerald-600">Up Tin Lên Đầu</strong> để bài viết nhảy thẳng lên vị trí đầu tiên.
            </span>
          </div>

          {userProperties.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Bạn chưa có bài đăng bất động sản nào</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Đăng tin ngay để tiếp cận hàng ngàn khách hàng tiềm năng mua & thuê Vinhomes Ocean Park 2, 3 và Hạ Long Xanh.
              </p>
              <button
                onClick={handlePostProperty}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition"
              >
                + Đăng Tin Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {userProperties.map((prop) => {
                const expiry = calculateExpiryInfo(prop, 30);
                const isApproved = prop.status === 'approved' || prop.approved || prop.approvalStatus === 'approved';
                const isRejected = prop.status === 'rejected' || prop.approvalStatus === 'rejected';
                const isPending = !isApproved && !isRejected;

                return (
                <div
                  key={prop.id}
                  className={`bg-white dark:bg-slate-800/90 rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition ${
                    expiry.isExpired 
                      ? 'border-rose-400 dark:border-rose-800/80 bg-rose-50/20' 
                      : expiry.statusBadge === 'expiring_soon'
                      ? 'border-amber-400 dark:border-amber-700/80'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
                  }`}
                >
                  {/* Property Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-24 h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                      onClick={() => handleSelectProp(prop)}
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isApproved && !expiry.isExpired && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                            🟢 Đang hiển thị
                          </span>
                        )}
                        {isApproved && expiry.isExpired && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                            🛑 Đã tự động ẩn (Quá 30 ngày)
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-500/30 animate-pulse">
                            🔴 Bị từ chối
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            🟡 Đang chờ duyệt
                          </span>
                        )}

                        {/* PRIVATE EXPIRY BADGE (Only visible in user owner dashboard & admin) */}
                        {isApproved && !expiry.isExpired && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            expiry.statusBadge === 'expiring_soon'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-400 animate-pulse font-extrabold'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700/80 dark:text-slate-300'
                          }`} title="Chỉ bạn và Quản trị viên nhìn thấy thời gian đếm ngược này (Không hiển thị ra ngoài Public)">
                            <Clock className="w-3 h-3" />
                            <span>Còn {expiry.daysRemaining} ngày hiển thị</span>
                          </span>
                        )}

                        {prop.vipLevel && prop.vipLevel !== 'normal' && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            prop.vipLevel === 'diamond' ? 'badge-vip-diamond' : 'badge-vip-gold'
                          }`}>
                            {prop.vipLevel === 'diamond' ? '💎 VIP Kim Cương' : '🥇 VIP Vàng'}
                          </span>
                        )}

                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {prop.priceDisplay}
                        </span>
                      </div>

                      <h3
                        onClick={() => handleSelectProp(prop)}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 cursor-pointer line-clamp-1"
                      >
                        {prop.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
                        {prop.address} • {prop.area}m² • Ngày đăng: {expiry.postDateFormatted} • Tự động ẩn: {expiry.expiresAtFormatted}
                      </p>

                      {/* Expiration warning banner for expired or expiring posts */}
                      {expiry.isExpired ? (
                        <div className="p-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2">
                          <span className="font-semibold text-[11px]">
                            ⚠️ Tin đã quá hạn 30 ngày và tạm ẩn khỏi trang chủ. Bạn có thể bấm <strong>"Gia hạn hiển thị"</strong> để bài đăng hiển thị lại ngay!
                          </span>
                          <button
                            onClick={() => handleRenewProperty(prop.id)}
                            disabled={isRenewingId === prop.id}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 ${isRenewingId === prop.id ? 'animate-spin' : ''}`} />
                            <span>Gia Hạn Ngay</span>
                          </button>
                        </div>
                      ) : expiry.statusBadge === 'expiring_soon' ? (
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2">
                          <span className="font-semibold text-[11px]">
                            ⏰ Tin sắp tự động ẩn sau <strong>{expiry.daysRemaining} ngày</strong>. Gia hạn thêm 30 ngày để tiếp tục nhận khách hàng.
                          </span>
                          <button
                            onClick={() => handleRenewProperty(prop.id)}
                            disabled={isRenewingId === prop.id}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 ${isRenewingId === prop.id ? 'animate-spin' : ''}`} />
                            <span>Gia Hạn +30 Ngày</span>
                          </button>
                        </div>
                      ) : null}

                      {(prop.status === 'rejected' || prop.approvalStatus === 'rejected' || prop.rejectionReason || prop.adminNote) && (
                        <div className="mt-2 p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 space-y-1">
                          <div className="flex items-center gap-1.5 font-black text-rose-700 dark:text-rose-300">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                            <span>⚠️ THÔNG BÁO TỪ QUẢN TRỊ VIÊN (ADMIN):</span>
                          </div>
                          <p className="text-[11px] font-semibold text-rose-800 dark:text-rose-200">
                            {prop.rejectionReason || prop.adminNote || 'Bài đăng chưa đạt tiêu chuẩn nội dung. Vui lòng kiểm tra và cập nhật lại thông tin.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Up-Tin Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700/80">
                    <button
                      onClick={() => handleRenewProperty(prop.id)}
                      disabled={isRenewingId === prop.id}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 hover:text-emerald-700 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-600 transition flex items-center gap-1"
                      title="Gia hạn thêm 30 ngày hiển thị"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRenewingId === prop.id ? 'animate-spin' : ''}`} />
                      <span>Gia Hạn</span>
                    </button>

                    <button
                      onClick={() => setSelectedPropertyForUpTin(prop)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition transform active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-emerald-200" />
                      ⚡ Up Tin Lên Đầu
                    </button>

                    <button
                      onClick={() => handleSelectProp(prop)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                      title="Xem chi tiết"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteProp(prop.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      title="Xóa bài"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Wallet & Token Management (Ví Token Cư Dân & Điểm Rút Tiền) */}
      {activeTab === 'wallet_tokens' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Wallet Hero Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Token Cư Dân (Xu Tiêu Dùng) */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 text-white p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                  🪙 XU TIÊU DÙNG NỘI BỘ
                </span>
                <span className="text-xs text-amber-300/80 font-bold">Không thể rút</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold">Số Dư Token Cư Dân:</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                    {(userState.balance || 0).toLocaleString('vi-VN')}
                  </span>
                  <span className="text-sm font-black text-amber-300">Token</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-700/60 pt-2.5">
                Dùng để mua gói tin tuyển dụng, mở khóa CV ứng viên, đăng ký gian hàng KiotViet & các dịch vụ tiện ích nội khu.
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => setActiveTab('recruiter_packages')}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Dùng Token Mua Gói Tuyển Dụng</span>
                </button>
              </div>
            </div>

            {/* 2. Điểm Affiliate Rút Tiền Về Ngân Hàng */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 text-white p-6 rounded-3xl border-2 border-emerald-500/40 shadow-xl relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                  💸 TIỀN RÚT VỀ ATM
                </span>
                <span className="text-xs text-emerald-400 font-bold">VietQR 24/7</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold">Điểm Hoa Hồng Affiliate:</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    {(userState.affiliatePoints || affiliateWallet || 0).toLocaleString('vi-VN')}
                  </span>
                  <span className="text-sm font-black text-emerald-300">VNĐ</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-700/60 pt-2.5">
                Hoa hồng nhận từ giới thiệu cư dân (15% F1, 5% F2) hoặc Admin thưởng. Rút trực tiếp về tài khoản ngân hàng của bạn.
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Rút Tiền Về ATM</span>
                </button>
                <button
                  onClick={() => {
                    const currentAff = userState.affiliatePoints || affiliateWallet || 0;
                    if (currentAff < 10000) {
                      alert('Số dư điểm hoa hồng cần tối thiểu 10.000đ để quy đổi Lượt Up Tin!');
                      return;
                    }
                    const newCredits = Math.floor(currentAff / 10000);
                    setUpTinCredits(prev => prev + newCredits);
                    setUserState(prev => ({ ...prev, affiliatePoints: 0 }));
                    setAffiliateWallet(0);
                    alert(`🎉 Đã quy đổi thành công ${currentAff.toLocaleString('vi-VN')}đ sang +${newCredits} Lượt Up-Tin BĐS!`);
                  }}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Đổi 10.000đ = 1 lượt Up Tin"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đổi Up Tin</span>
                </button>
              </div>
            </div>

            {/* 3. Lượt Up Tin BĐS */}
            <div className="bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-900 text-white p-6 rounded-3xl border-2 border-blue-500/40 shadow-xl relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                  ⚡ UP TIN TOP 1
                </span>
                <span className="text-xs text-blue-400 font-bold">Tự Động & Thủ Công</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold">Số Lượt Up Tin Còn Lại:</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black text-blue-400 font-mono tracking-tight">
                    {upTinCredits}
                  </span>
                  <span className="text-sm font-black text-blue-300">Lượt</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-700/60 pt-2.5">
                Mỗi lượt up tin giúp đẩy bài viết của bạn lên đầu trang chủ và danh mục, tiếp cận hàng ngàn khách tìm mua/thuê.
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => setActiveTab('my_properties')}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Xem Tin & Đẩy Bài Ngay</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Refresh & Notification Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Số dư tài khoản được đồng bộ tự động thời gian thực với máy chủ Chợ Cư Dân 24h.
              </p>
            </div>
            <button
              onClick={() => refreshUserBalance(true)}
              disabled={isSyncingBalance}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition shadow flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncingBalance ? 'animate-spin' : ''}`} />
              <span>{isSyncingBalance ? 'Đang Kiểm Tra...' : '🔄 Đồng Bộ Lại Số Dư'}</span>
            </button>
          </div>

          {/* Live Transaction History Table from Server */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  LỊCH SỬ BIẾN ĐỘNG VÍ & BƠM TIỀN TỪ HỆ THỐNG
                </h3>
                <p className="text-xs text-slate-500">
                  Ghi nhận đầy đủ các lần Admin bơm Token, thưởng hoa hồng, nạp VietQR và chi tiêu
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-300/40">
                {serverWalletTransactions.length} Giao Dịch
              </span>
            </div>

            {serverWalletTransactions.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Chưa có lịch sử giao dịch nào được ghi nhận.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Khi Admin bơm Token, bạn rút tiền hoa hồng hoặc nạp tiền VietQR, các giao dịch sẽ tự động xuất hiện chi tiết tại đây.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-[10px] bg-slate-50 dark:bg-slate-900/60">
                      <th className="p-3">Thời Gian</th>
                      <th className="p-3">Loại Giao Dịch</th>
                      <th className="p-3">Chi Tiết & Lý Do</th>
                      <th className="p-3 text-right">Biến Động</th>
                      <th className="p-3 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {serverWalletTransactions.map((tx: any, idx: number) => {
                      const isPumpToken = tx.type === 'admin_pump_tokens';
                      const isAffiliate = tx.type === 'affiliate_commission';
                      const isDeposit = tx.type === 'deposit_vietqr';
                      const isWithdraw = tx.type === 'withdraw_vietqr';
                      const isSpend = tx.type === 'job_posting_fee' || tx.type === 'escrow_hold';

                      return (
                        <tr key={tx.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                          <td className="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                            {tx.createdAt || 'Vừa xong'}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {isPumpToken ? (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded border border-amber-500/30 text-[10px]">
                                🪙 BƠM TOKEN ADMIN
                              </span>
                            ) : isAffiliate ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black rounded border border-emerald-500/30 text-[10px]">
                                🎁 HOA HỒNG AFFILIATE
                              </span>
                            ) : isDeposit ? (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black rounded border border-blue-500/30 text-[10px]">
                                💳 NẠP TIỀN VIETQR
                              </span>
                            ) : isWithdraw ? (
                              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black rounded border border-rose-500/30 text-[10px]">
                                💸 RÚT TIỀN ATM
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-500/10 text-slate-600 dark:text-slate-400 font-black rounded text-[10px]">
                                🛒 CHI TIÊU NỘI BỘ
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-200 font-medium">
                            {tx.description || 'Giao dịch hệ thống'}
                          </td>
                          <td className="p-3 text-right font-black font-mono text-sm whitespace-nowrap">
                            {isSpend || isWithdraw ? (
                              <span className="text-rose-600 dark:text-rose-400">
                                -{(tx.amount || 0).toLocaleString('vi-VN')} {isPumpToken ? 'Token' : 'đ'}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                +{(tx.amount || 0).toLocaleString('vi-VN')} {isPumpToken ? 'Token' : 'đ'}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded">
                              ✓ Thành Công
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: CV Management & Applications */}
      {activeTab === 'my_cv' && (
        <UserCvManagement currentUser={userState} onRefresh={onRefreshData} />
      )}

      {/* Tab: Recruiter Packages & Pricing */}
      {activeTab === 'recruiter_packages' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-teal-950 p-6 rounded-3xl border border-amber-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                DÀNH CHO DOANH NGHIỆP & CHỦ SHOP
              </span>
              <h2 className="text-xl font-black text-amber-300">
                BẢNG GIÁ & ĐĂNG KÝ GÓI NHÀ TUYỂN DỤNG CƯ DÂN
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl">
                Đăng ký tài khoản Nhà Tuyển Dụng để mở khóa liên hệ ứng viên, đăng tin VIP lên đầu danh mục và tiếp cận hàng vạn người tìm việc nội khu Vinhomes.
              </p>
            </div>

            <button
              onClick={() => setShowEmployerRegModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer shrink-0"
            >
              + ĐĂNG KÝ GÓI DOANH NGHIỆP NGAY
            </button>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {RECRUITMENT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 flex flex-col justify-between space-y-4 shadow-sm relative ${
                  pkg.isPopular ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {pkg.isPopular && (
                  <span className="absolute -top-3 right-4 px-3 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-xs uppercase tracking-wider">
                    Gói Phổ Biến Nhất
                  </span>
                )}

                <div className="space-y-3">
                  <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{pkg.name}</div>
                  <div className="space-y-0.5">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {pkg.priceVnd.toLocaleString('vi-VN')} <span className="text-xs font-bold text-slate-400">VNĐ</span>
                    </div>
                    <div className="text-xs font-black text-amber-500 flex items-center gap-1">
                      🪙 {pkg.priceToken.toLocaleString('vi-VN')} Token Cư Dân
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {pkg.description}
                  </p>

                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>{pkg.jobPostsCount}</strong> tin đăng tuyển dụng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Mở khóa <strong>{pkg.cvUnlockCount}</strong> CV ứng viên</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Thời hạn sử dụng: <strong>{pkg.durationDays} ngày</strong></span>
                    </li>
                    {pkg.isVipBadge && (
                      <li className="flex items-center gap-2 text-amber-500 font-bold">
                        <span>👑</span>
                        <span>Cấp Huy hiệu Doanh Nghiệp VIP</span>
                      </li>
                    )}
                    {pkg.isTopPlacement && (
                      <li className="flex items-center gap-2 text-rose-500 font-bold">
                        <span>🔥</span>
                        <span>Đẩy Top 1 Trang Tuyển Dụng</span>
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => setShowEmployerRegModal(true)}
                  className={`w-full py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
                    pkg.isPopular
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 shadow-md'
                      : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800'
                  }`}
                >
                  Đăng Ký & Kích Hoạt Gói
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: User Storefront & KiotViet POS Management */}
      {activeTab === 'my_store' && (
        <UserStorefrontManager user={user} />
      )}

      {/* Tab: Up-Tin Transactions History */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              LỊCH SỬ GIAO DỊCH & NẠP LƯỢT UP TIN
            </h3>
            <span className="text-xs text-slate-500">
              Số dư Up Tin hiện tại: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{upTinCredits} lượt</strong>
            </span>
          </div>

          {localTransactions.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Chưa ghi nhận lịch sử giao dịch nạp Up Tin.</p>
              <p className="text-[11px] text-slate-400">Bấm nút "Tương tác kênh truyền thông" ở trên để nhận lượt Up Tin miễn phí!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-[10px] bg-slate-50 dark:bg-slate-900/60">
                    <th className="p-3">Thời Gian</th>
                    <th className="p-3">Loại Giao Dịch</th>
                    <th className="p-3">Nội Dung</th>
                    <th className="p-3 text-right">Số Lượt</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {localTransactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="p-3 font-mono text-slate-500">{tx.createdAt}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{tx.type}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{tx.description}</td>
                      <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">+{tx.credits}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded">✓ Thành Công</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Affiliate & Referral Revenue Sharing */}

      {activeTab === 'affiliate' && (
        <div className="space-y-6">
          {/* Hero Banner Referral Code */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/80 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> CHƯƠNG TRÌNH KẾT NỐI CƯ DÂN VINHOMES — CHIA SẺ DOANH THU 2 TẦNG
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-amber-400 leading-tight">
                  Giới Thiệu Cư Dân & Môi Giới — Nhận Hoa Hồng 15% - 20% Doanh Thu Nạp
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mỗi khi người được bạn giới thiệu (F1) hoặc cấp dưới (F2) mua gói Up Tin BĐS hoặc Đăng ký Gói Dịch Vụ Cư Dân VIP, bạn sẽ tự động nhận hoa hồng rút về ngân hàng hoặc quy đổi lượt Up Tin miễn phí!
                </p>
              </div>

              {/* Wallet Summary Pill */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right shrink-0 space-y-1 w-full md:w-auto">
                <span className="text-[11px] text-slate-300 font-bold block">SỐ DƯ VÍ HOA HỒNG KHẢ DỤNG</span>
                <span className="text-2xl font-black text-amber-400 block">{affiliateWallet.toLocaleString('vi-VN')} VNĐ</span>
                <div className="flex items-center gap-2 justify-end pt-1">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1"
                  >
                    <Wallet className="w-3.5 h-3.5" /> Rút Tiền VietQR
                  </button>
                  <button
                    onClick={() => {
                      const newCredits = Math.floor(affiliateWallet / 10000);
                      setUpTinCredits(prev => prev + newCredits);
                      setAffiliateWallet(0);
                      alert(`🎉 Đã quy đổi thành công ${affiliateWallet.toLocaleString('vi-VN')}đ sang +${newCredits} Lượt Up-Tin BĐS!`);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" /> Đổi Up Tin
                  </button>
                </div>
              </div>
            </div>

            {/* Referral Link Copy Bar */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 font-mono font-bold text-xs">
                  {userRefCode}
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Link giới thiệu cá nhân của bạn:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 truncate block">{userRefLink}</span>
                </div>
              </div>

              <button
                onClick={handleCopyRefLink}
                className={`px-5 py-2.5 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'ĐÃ SAO CHÉP LINK!' : 'SAO CHÉP LINK GIỚI THIỆU'}</span>
              </button>
            </div>
          </div>

          {/* Core Affiliate Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-slate-500 font-bold block">TỔNG F1 ĐÃ MỜI</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white block flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-500" />
                8 Cư dân
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">Hưởng 15% hoa hồng F1</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-slate-500 font-bold block">MẠNG LƯỚI F2 GIÁN TIẾP</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white block flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                6 Cư dân
              </span>
              <span className="text-[11px] text-blue-600 font-bold">Hưởng 5% hoa hồng F2</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-slate-500 font-bold block">DOANH SỐ F1/F2 TẠO RA</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">
                3.800.000đ
              </span>
              <span className="text-[11px] text-amber-600 font-bold">Từ nạp Up-Tin & Đăng gian hàng</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-slate-500 font-bold block">TỔNG HOA HỒNG TÍCH LŨY</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                570.000đ
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">✓ Đã bao gồm thưởng Up-Tin</span>
            </div>
          </div>

          {/* Referral Network Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                DANH SÁCH CƯ DÂN & ĐỐI TÁC TRONG MẠNG LƯỚI GIỚI THIỆU CỦA BẠN
              </h3>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Tự động cộng tiền khi F1/F2 phát sinh nạp
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-[10px] uppercase tracking-wider bg-slate-50 dark:bg-slate-900/60">
                    <th className="p-3">Cư Dân / Đối Tác</th>
                    <th className="p-3">Cấp Mạng Lưới</th>
                    <th className="p-3">Vai Trò</th>
                    <th className="p-3 text-right">Tổng Doanh Số Nạp</th>
                    <th className="p-3 text-right">Hoa Hồng Nhận Được</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                      Nguyễn Văn Anh (Ocean Park 2)
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 font-extrabold rounded border border-amber-500/30">
                        F1 (Trực tiếp - 15%)
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Chủ Nhà / Sale BĐS</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">1.200.000 VNĐ</td>
                    <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">180.000 VNĐ</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded">✓ Đã Cộng Ví</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                      Trần Thị Mai (Dịch Vụ Thi Công Nội Thất)
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 font-extrabold rounded border border-amber-500/30">
                        F1 (Trực tiếp - 15%)
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Gian Hàng Dịch Vụ Cư Dân VIP</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">1.500.000 VNĐ</td>
                    <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">225.000 VNĐ</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded">✓ Đã Cộng Ví</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                      Lê Hoàng Nam (Ocean Park 3)
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 font-extrabold rounded border border-blue-500/30">
                        F2 (Gián tiếp - 5%)
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Cư Dân Đăng Tin Ban Cung</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">800.000 VNĐ</td>
                    <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">40.000 VNĐ</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded">✓ Đã Cộng Ví</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                      Phạm Quốc Cường (Môi Giới Cổ Loa)
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 font-extrabold rounded border border-amber-500/30">
                        F1 (Trực tiếp - 15%)
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Môi Giới BĐS Sale VIP</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">300.000 VNĐ</td>
                    <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">45.000 VNĐ</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-bold rounded">✓ Đã Cộng Ví</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => {
                setShowWithdrawModal(false);
                setWithdrawalSuccess(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto font-black">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                RÚT TIỀN HOA HỒNG VỀ NGÂN HÀNG
              </h3>
              <p className="text-xs text-slate-500">
                Chuyển khoản tự động qua hệ thống VietQR đến tài khoản chính chủ của bạn
              </p>
            </div>

            {withdrawalSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-emerald-600 text-sm">GỬI YÊU CẦU RÚT TIỀN THÀNH CÔNG!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Hệ thống Admin đã tiếp nhận lệnh rút <strong className="text-emerald-600">{Number(withdrawalAmount).toLocaleString('vi-VN')}đ</strong>. Tiền sẽ được chuyển về tài khoản ngân hàng của bạn trong vòng 1-3 giờ làm việc!
                </p>
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawalSuccess(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  Đóng Cửa Sổ
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số tiền muốn rút (VNĐ) — Tối thiểu 100.000đ:
                  </label>
                  <input
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Số dư ví hiện tại: <strong className="text-emerald-500">{affiliateWallet.toLocaleString('vi-VN')}đ</strong>
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên ngân hàng thụ hưởng:
                  </label>
                  <input
                    type="text"
                    defaultValue="Vietcombank"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số tài khoản ngân hàng:
                  </label>
                  <input
                    type="text"
                    defaultValue={user.phone ? user.phone.replace(/\D/g, '') : '0868499929'}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên chủ tài khoản:
                  </label>
                  <input
                    type="text"
                    defaultValue={user.name ? user.name.toUpperCase() : 'BÙI TRUNG HIẾU'}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold uppercase"
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
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition uppercase tracking-wider"
                >
                  XÁC NHẬN RÚT TIỀN HOÀN TẤT
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

      {/* Employer Registration & Package Purchase Modal */}
      {showEmployerRegModal && (
        <UserEmployerRegistrationModal
          currentUser={userState}
          onClose={() => setShowEmployerRegModal(false)}
          onSuccess={() => {
            onRefreshData();
          }}
        />
      )}

    </div>
  );
};
