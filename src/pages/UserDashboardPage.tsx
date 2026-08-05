import React, { useState } from 'react';
import { Property, User, Language, UpTinPricingConfig, UpTinTransaction } from '../types';
import { PlusCircle, Zap, Crown, Eye, MessageSquare, Edit3, Trash2, ShieldCheck, CheckCircle2, Clock, Sparkles, AlertCircle, ArrowUpRight, UserCheck, Shield, Lock, Users, Share2, DollarSign, Gift, Wallet, Copy, Check, ExternalLink, Award, ArrowRight } from 'lucide-react';
import { UpTinPaymentModal } from '../components/UpTinPaymentModal';
import { KycVerificationModal } from '../components/KycVerificationModal';
import { UserStorefrontManager } from '../components/UserStorefrontManager';

interface UserDashboardPageProps {

  user: User;
  properties: Property[];
  language: Language;
  pricingConfig: UpTinPricingConfig;
  onPostNewProperty: () => void;
  onSelectProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  onRefreshData: () => void;
  onLogout?: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  user,
  properties,
  language,
  pricingConfig,
  onPostNewProperty,
  onSelectProperty,
  onDeleteProperty,
  onRefreshData,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'my_properties' | 'my_store' | 'transactions' | 'affiliate' | 'profile'>('my_properties');
  const [selectedPropertyForUpTin, setSelectedPropertyForUpTin] = useState<Property | null>(null);
  const [localTransactions, setLocalTransactions] = useState<UpTinTransaction[]>([]);
  const [showKycModal, setShowKycModal] = useState(false);
  const [userState, setUserState] = useState<User>(user);

  // Affiliate & Referral State
  const [copiedLink, setCopiedLink] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('300000');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [affiliateWallet, setAffiliateWallet] = useState(450000); // VNĐ balance

  const userRefCode = `REF-${user.name ? user.name.replace(/\s+/g, '').toUpperCase().slice(0, 8) : 'CUDAN24H'}`;
  const userRefLink = `https://chocudan24h.com/?ref=${userRefCode}`;

  const handleCopyRefLink = () => {
    navigator.clipboard.writeText(userRefLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Filter properties belonging to logged in user or uploaded in demo
  const userProperties = properties.filter(p => 
    p.userId === user.id || 
    p.sellerName.toLowerCase().includes(user.name.toLowerCase()) || 
    p.sellerRole === user.role ||
    user.role === 'admin'
  );

  const approvedCount = userProperties.filter(p => p.status === 'approved' || p.approved).length;
  const pendingCount = userProperties.length - approvedCount;
  const totalViews = userProperties.reduce((acc, p) => acc + (p.viewsCount || Math.floor(Math.random() * 80) + 12), 0);

  const handleUpTinSuccess = (updatedProp: Property, newTx: UpTinTransaction) => {
    setSelectedPropertyForUpTin(null);
    setLocalTransactions(prev => [newTx, ...prev]);
    onRefreshData();
  };

  const [upTinCredits, setUpTinCredits] = useState(user.upTinCredits || 12);
  const [claimedSocial, setClaimedSocial] = useState<{
    facebook?: boolean;
    youtube?: boolean;
    tiktok?: boolean;
    zalo?: boolean;
    google?: boolean;
    telegram?: boolean;
  }>({
    facebook: false,
    youtube: false,
    tiktok: false,
    zalo: false,
    google: false,
    telegram: false
  });

  const handleClaimReward = (platform: 'facebook' | 'youtube' | 'tiktok' | 'zalo' | 'google' | 'telegram', points: number, url: string) => {
    window.open(url, '_blank');
    if (!claimedSocial[platform]) {
      setClaimedSocial(prev => ({ ...prev, [platform]: true }));
      setUpTinCredits(prev => prev + points);
      alert(`🎉 CHÚC MỪNG! Bạn vừa nhận thêm +${points} Lượt Up Tin miễn phí nhờ tương tác kênh ${platform.toUpperCase()} của Nhà đẹp Vinhomes!`);
    } else {
      alert(`Bạn đã nhận phần thưởng lượt Up Tin từ kênh ${platform.toUpperCase()} rồi!`);
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Donate Mode Banner Notice */}
      {pricingConfig.paymentEnabled === false && (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border-2 border-amber-500/40 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-slate-950 font-black rounded-xl text-sm shrink-0">
              🎁
            </div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white">
                CHẾ ĐỘ UP TIN MIỄN PHÍ (DONATE TÙY TÂM) ĐANG BẬT!
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                Admin đã tắt thu phí bắt buộc. Mọi thành viên có thể đẩy tin BĐS lên Top 1 hoàn toàn Miễn Phí.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 bg-emerald-600 text-white font-extrabold text-[10px] rounded-full uppercase">
            100% Free
          </span>
        </div>
      )}

      {/* Profile Header & Summary */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-emerald-400 shadow-md object-cover"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {user.role === 'admin' ? '👑 Admin Tổng' : user.role === 'sale' ? '💼 Môi Giới/Sale' : '🏠 Chủ Nhà'}
                </span>
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-black shadow ${tierInfo.color}`}>
                  <Crown className="w-3 h-3 inline mr-1" />
                  {tierInfo.name}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                SĐT: {user.phone || '0868.499.929'} | Email: {user.email}
              </p>
              <p className="text-xs text-emerald-300 font-semibold mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quền lợi hạng: {tierInfo.vipLimit} | Số dư Up Tin: <strong className="text-amber-300 font-black text-sm ml-1">{upTinCredits} lượt</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onPostNewProperty}
              className="flex-1 sm:flex-initial px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <PlusCircle className="w-5 h-5" /> ĐĂNG TIN MỚI (CÓ AI VIẾT BÀI TỪ ẢNH)
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-3 bg-slate-900/80 hover:bg-slate-900 text-rose-400 hover:text-rose-300 border border-emerald-700/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title="Đăng xuất hoặc đổi tài khoản"
              >
                <span>Đổi Tài Khoản</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-emerald-700/60 text-xs">
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/40">
            <span className="text-emerald-300 block mb-1">Tổng Tin Đăng:</span>
            <span className="text-xl font-black text-white">{userProperties.length} căn</span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/40">
            <span className="text-emerald-300 block mb-1">Đã Duyệt Đang Hiển Thị:</span>
            <span className="text-xl font-black text-emerald-300">{approvedCount} căn</span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/40">
            <span className="text-emerald-300 block mb-1">Lượt Up Tin Còn Lại:</span>
            <span className="text-xl font-black text-amber-300">{upTinCredits} lượt</span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/40">
            <span className="text-emerald-300 block mb-1">Lượt Xem Tích Lũy:</span>
            <span className="text-xl font-black text-white">{totalViews.toLocaleString('vi-VN')} lượt</span>
          </div>
        </div>
      </div>

      {/* KYC / NÚT XANH ĐỊNH DANH CƯ DÂN VINHOMES */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 text-white rounded-3xl p-5 border-2 border-emerald-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-wider">
                ĐỊNH DANH CƯ DÂN & NÚT XANH KYC VINHOMES
              </h3>
              {userState.kycStatus === 'verified' ? (
                <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full flex items-center gap-1 shadow-sm">
                  ✓ Đã Cấp Nút Xanh KYC
                </span>
              ) : userState.kycStatus === 'pending_ai' ? (
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center gap-1 shadow-sm">
                  ⏳ Đang Chờ Kiểm Duyệt
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center gap-1 shadow-sm">
                  ⚠️ Chưa Nhận Nút Xanh
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Định danh cư dân & Nút Xanh KYC là một. Cập nhật CCCD, chứng chỉ ngành nghề/môi giới để được duyệt Huy Hiệu Cư Dân Chính Chủ trên gian hàng & các bài đăng.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowKycModal(true)}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition shrink-0 uppercase tracking-wider flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{userState.kycStatus === 'verified' ? 'CẬP NHẬT ĐỊNH DANH / NÚT XANH' : 'ĐỊNH DANH & NHẬN NÚT XANH'}</span>
        </button>
      </div>

      {/* Social Reward Section (+5 to +10 Up Tin Free) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-emerald-500/10 border-2 border-amber-500/30 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ĐỒNG HÀNH & KẾT NỐI KÊNH TRUYỀN THÔNG VIP (+5 ĐẾN +10 LƯỢT UP TIN)
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
              TĂNG TƯƠNG TÁC THÔNG TIN & NHẬN LƯỢT ĐẨY TIN BẤT ĐỘNG SẢN TOP 1
            </h3>
          </div>
          <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400 shrink-0">
            Số dư lượt Up Tin: <span className="text-base text-emerald-600 dark:text-emerald-400 font-black">{upTinCredits} lượt</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs text-sky-600 block">Zalo Official Account</span>
              <span className="text-[11px] text-slate-500">Quan tâm Zalo OA</span>
            </div>
            <button
              onClick={() => handleClaimReward('zalo', 5, 'https://zalo.me/')}
              disabled={claimedSocial.zalo}
              className={`px-3 py-2 rounded-xl text-xs font-black transition ${
                claimedSocial.zalo
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 text-white shadow'
              }`}
            >
              {claimedSocial.zalo ? '✓ Đã Tặng +5' : '+5 Up Tin'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400 block">Facebook Chợ Cư Dân 24h</span>
              <span className="text-[11px] text-slate-500">Like & Follow Fanpage</span>
            </div>
            <button
              onClick={() => handleClaimReward('facebook', 5, 'https://www.facebook.com/chocudan24h')}
              disabled={claimedSocial.facebook}
              className={`px-3 py-2 rounded-xl text-xs font-black transition ${
                claimedSocial.facebook
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
              }`}
            >
              {claimedSocial.facebook ? '✓ Đã Tặng +5' : '+5 Up Tin'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs text-rose-600 dark:text-rose-400 block">YouTube Chợ Cư Dân 24h</span>
              <span className="text-[11px] text-slate-500">Đăng ký kênh YouTube</span>
            </div>
            <button
              onClick={() => handleClaimReward('youtube', 5, 'https://www.youtube.com/@chocudan24h')}
              disabled={claimedSocial.youtube}
              className={`px-3 py-2 rounded-xl text-xs font-black transition ${
                claimedSocial.youtube
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow'
              }`}
            >
              {claimedSocial.youtube ? '✓ Đã Tặng +5' : '+5 Up Tin'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 block">TikTok Chợ Cư Dân 24h</span>
              <span className="text-[11px] text-slate-500">Follow kênh TikTok</span>
            </div>
            <button
              onClick={() => handleClaimReward('tiktok', 5, 'https://www.tiktok.com/@chocudan24h')}
              disabled={claimedSocial.tiktok}
              className={`px-3 py-2 rounded-xl text-xs font-black transition ${
                claimedSocial.tiktok
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white shadow'
              }`}
            >
              {claimedSocial.tiktok ? '✓ Đã Tặng +5' : '+5 Up Tin'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs text-amber-500 block">Google Maps Review</span>
              <span className="text-[11px] text-slate-500">Đánh giá 5 sao Google</span>
            </div>
            <button
              onClick={() => handleClaimReward('google', 10, 'https://maps.google.com')}
              disabled={claimedSocial.google}
              className={`px-3 py-2 rounded-xl text-xs font-black transition ${
                claimedSocial.google
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow'
              }`}
            >
              {claimedSocial.google ? '✓ Đã Tặng +10' : '+10 Up Tin'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs text-indigo-600 block">Telegram Khách Hàng</span>
              <span className="text-[11px] text-slate-500">Tham gia Group BĐS</span>
            </div>
            <button
              onClick={() => handleClaimReward('telegram', 5, 'https://t.me')}
              disabled={claimedSocial.telegram}
              className={`px-3 py-2 rounded-xl text-xs font-black transition ${
                claimedSocial.telegram
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow'
              }`}
            >
              {claimedSocial.telegram ? '✓ Đã Tặng +5' : '+5 Up Tin'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 sm:space-x-6 text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('my_properties')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'my_properties'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Zap className="w-4 h-4" /> Tin Đăng BĐS ({userProperties.length})
        </button>

        <button
          onClick={() => setActiveTab('my_store')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition shrink-0 font-bold ${
            activeTab === 'my_store'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-500" />
          <span>Gian Hàng & KiotViet</span>
          <span className="px-1.5 py-0.5 bg-blue-600 text-white font-bold rounded-md text-[9px]">API</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition shrink-0 ${
            activeTab === 'transactions'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" /> Lịch Sử Up Tin ({localTransactions.length})
        </button>

        <button
          onClick={() => setActiveTab('affiliate')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition shrink-0 font-bold ${
            activeTab === 'affiliate'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Share2 className="w-4 h-4 text-amber-500" />
          <span>Affiliate & Hoa Hồng</span>
          <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-md text-[9px]">15-20%</span>
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
                onClick={onPostNewProperty}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition"
              >
                + Đăng Tin Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {userProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:border-emerald-500/50 transition"
                >
                  {/* Property Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-24 h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                      onClick={() => onSelectProperty(prop)}
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          prop.status === 'approved' || prop.approved
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                        }`}>
                          {prop.status === 'approved' || prop.approved ? '✓ Đã Duyệt' : '⏳ Chờ Duyệt'}
                        </span>

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
                        onClick={() => onSelectProperty(prop)}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 cursor-pointer line-clamp-1"
                      >
                        {prop.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
                        {prop.address} • {prop.area}m² • Ngày đăng: {prop.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Up-Tin Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700/80">
                    <button
                      onClick={() => setSelectedPropertyForUpTin(prop)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition transform active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-emerald-200" />
                      ⚡ Up Tin Lên Đầu
                    </button>

                    <button
                      onClick={() => onSelectProperty(prop)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                      title="Xem chi tiết"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteProperty(prop.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      title="Xóa bài"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: User Storefront & KiotViet POS Management */}
      {activeTab === 'my_store' && (
        <UserStorefrontManager user={user} />
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

    </div>
  );
};
