import React, { useState } from 'react';
import { User, UserTier } from '../types';
import { 
  X, Wallet, Zap, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, 
  DollarSign, Award, Clock, History, FileText, UserCheck, Plus, RefreshCw,
  Coins, ArrowDownToLine, Lock, AlertCircle
} from 'lucide-react';

export interface AdminCreditLog {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  type: 'balance' | 'uptin' | 'points' | 'tier' | 'tokens' | 'affiliate';
  amountAdded: number | string;
  previousValue: number | string;
  newValue: number | string;
  reason: string;
  adminName: string;
  createdAt: string;
}

interface AdminCreditInjectorModalProps {
  user: User;
  onClose: () => void;
  onSuccessUpdate: (updatedUser: User) => void;
}

export const AdminCreditInjectorModal: React.FC<AdminCreditInjectorModalProps> = ({
  user,
  onClose,
  onSuccessUpdate
}) => {
  const [balance, setBalance] = useState<number>(user.balance || 0);
  const [affiliatePoints, setAffiliatePoints] = useState<number>(user.affiliatePoints || 0);
  const [upTinCredits, setUpTinCredits] = useState<number>(user.upTinCredits || 10);
  const [socialPoints, setSocialPoints] = useState<number>(user.socialPoints || 0);
  const [tier, setTier] = useState<UserTier>(user.tier || 'thuong');
  const [reason, setReason] = useState<string>('Trợ giá đăng tin tuyển dụng & Gian hàng Cư Dân');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick balance / token additions
  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  // Quick affiliate points additions
  const addAffiliatePoints = (amount: number) => {
    setAffiliatePoints(prev => prev + amount);
  };

  // Quick uptin additions
  const addUpTin = (count: number) => {
    setUpTinCredits(prev => prev + count);
  };

  // Quick points additions
  const addPoints = (pts: number) => {
    setSocialPoints(prev => prev + pts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedUser: User = {
      ...user,
      balance,
      tokenBalance: balance,
      affiliatePoints,
      upTinCredits,
      socialPoints,
      tier,
      totalTopup: (user.totalTopup || 0) + Math.max(0, balance - (user.balance || 0))
    };

    try {
      // 1. Update general user profile
      const response = await fetch(`/api/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          balance,
          tokenBalance: balance,
          affiliatePoints,
          upTinCredits,
          socialPoints,
          tier,
          totalTopup: updatedUser.totalTopup
        })
      });

      // 2. If tokens or affiliate points were added, record in ledger via pump-tokens
      const tokenDiff = balance - (user.balance || 0);
      const affDiff = affiliatePoints - (user.affiliatePoints || 0);
      if (tokenDiff > 0 || affDiff > 0) {
        await fetch('/api/admin/pump-tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            phone: user.phone,
            userName: user.name,
            tokenAmount: Math.max(0, tokenDiff),
            affiliatePointsAmount: Math.max(0, affDiff),
            reason: reason || 'Admin bơm điểm/token hỗ trợ cư dân',
            adminName: 'Quản Trị Viên Tổng'
          })
        });
      }

      // Store log in localStorage
      const logsSaved = localStorage.getItem('chocudan24h_admin_credit_logs');
      let logsList: AdminCreditLog[] = logsSaved ? JSON.parse(logsSaved) : [];
      
      const newLog: AdminCreditLog = {
        id: `credit-log-${Date.now()}`,
        userId: user?.id || 'guest',
        userName: user?.name || user?.email || 'Thành viên',
        userPhone: user?.phone,
        type: 'tokens',
        amountAdded: balance - (user?.balance || 0),
        previousValue: user?.balance || 0,
        newValue: balance,
        reason: reason || 'Bơm Token Cư Dân / Điểm Admin',
        adminName: 'Admin Tổng',
        createdAt: new Date().toLocaleString('vi-VN')
      };

      logsList.unshift(newLog);
      localStorage.setItem('chocudan24h_admin_credit_logs', JSON.stringify(logsList.slice(0, 50)));

      // Sync active logged-in user in localStorage if matching ID or email or phone
      const hbUserRaw = localStorage.getItem('hb_user');
      if (hbUserRaw) {
        try {
          const hbUser = JSON.parse(hbUserRaw);
          if (hbUser && (hbUser.id === user.id || hbUser.email === user.email || hbUser.phone === user.phone)) {
            const synced = { ...hbUser, ...updatedUser };
            localStorage.setItem('hb_user', JSON.stringify(synced));
          }
        } catch (e) {}
      }

      const storedUserRaw = localStorage.getItem('chocudan24h_current_user');
      if (storedUserRaw) {
        try {
          const storedUser = JSON.parse(storedUserRaw);
          if (storedUser && (storedUser.id === user.id || storedUser.email === user.email || storedUser.phone === user.phone)) {
            const synced = { ...storedUser, ...updatedUser };
            localStorage.setItem('chocudan24h_current_user', JSON.stringify(synced));
          }
        } catch (e) {}
      }

      // Dispatch global event for instantaneous reactive UI update
      window.dispatchEvent(new CustomEvent('user-token-updated', { detail: updatedUser }));
      window.dispatchEvent(new Event('storage'));

      alert(`🎉 ĐÃ CẬP NHẬT & BƠM THÀNH CÔNG CHO TÀI KHOẢN "${user?.name || 'Cư Dân'}"!\n• Token Cư Dân (Xu Tiêu Dùng - Không Thể Rút): ${balance.toLocaleString('vi-VN')} Token\n• Điểm Hoa Hồng Affiliate (Được Rút Về Ngân Hàng): ${affiliatePoints.toLocaleString('vi-VN')} pts\n• Lượt Up-Tin: ${upTinCredits} lượt\n• Hạng Thành Viên: ${tier.toUpperCase()}`);
      
      onSuccessUpdate(updatedUser);
      onClose();
    } catch (err) {
      alert('⚠️ Không thể kết nối máy chủ. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 relative flex items-center justify-between border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shrink-0">
              🪙
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                QUẢN TRỊ VIÊN ADMIN
              </span>
              <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                CÔNG CỤ BƠM TOKEN TIÊU DÙNG & ĐIỂM HOA HỒNG AFFILIATE
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quick Info Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img loading="lazy" src={user.avatar} alt={user?.name || 'User'} className="w-10 h-10 rounded-full object-cover border border-amber-500/40 shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-amber-500 text-slate-950 font-black rounded-full flex items-center justify-center text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span>{user?.name || user?.email || 'Thành viên'}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold rounded text-[10px] uppercase">
                  {user?.role || 'user'}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                {user.email} • SĐT: {user.phone || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Số dư Token Cư Dân:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
              {(user.balance || 0).toLocaleString('vi-VN')} Token
            </span>
          </div>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
          
          {/* Section 1: Token Cư Dân (Xu Tiêu Dùng / Non-withdrawable) */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                1. TOKEN CƯ DÂN (XU TIÊU DÙNG / 1 TOKEN = 1 VNĐ)
              </label>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                Hiện tại: {(user.balance || 0).toLocaleString('vi-VN')} Token
              </span>
            </div>

            {/* Crucial Explanatory Box */}
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-300/80 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-700 dark:text-amber-400">QUY ĐỊNH TOKEN TIÊU DÙNG:</strong> Token được dùng để <strong>đăng tin tuyển dụng (20k - 50k)</strong>, <strong>mở khóa hồ sơ CV (50k)</strong>, đăng tin BĐS và mua gói dịch vụ. <strong>Token đã nạp hoặc do Admin bơm KHÔNG THỂ RÚT RA TIỀN MẶT</strong>.
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                step={10000}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-base rounded-xl border border-emerald-300 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                TOKEN
              </span>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Bơm nhanh:</span>
              {[20000, 50000, 100000, 200000, 500000, 1000000, 2000000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addBalance(amt)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition shadow-xs cursor-pointer"
                >
                  +{amt >= 1000000 ? `${amt / 1000000}Tr` : `${amt / 1000}k`} Token
                </button>
              ))}
              <button
                type="button"
                onClick={() => setBalance(0)}
                className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] transition cursor-pointer"
              >
                Đặt về 0
              </button>
            </div>
          </div>

          {/* Section 2: Điểm Hoa Hồng Affiliate (Withdrawable to Bank) */}
          <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-sm text-teal-900 dark:text-teal-300 flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-teal-600" />
                2. ĐIỂM HOA HỒNG AFFILIATE (ĐƯỢC RÚT VỀ TÀI KHOẢN NGÂN HÀNG)
              </label>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold">
                Hiện tại: {(user.affiliatePoints || 0).toLocaleString('vi-VN')} pts
              </span>
            </div>

            <div className="p-2.5 bg-teal-100/50 dark:bg-teal-900/40 rounded-xl border border-teal-300/80 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-700 dark:text-teal-300">ĐẶC QUYỀN HOA HỒNG:</strong> Điểm hoa hồng Affiliate là loại tiền <strong>DUY NHẤT ĐƯỢC PHÉP RÚT VỀ TÀI KHOẢN NGÂN HÀNG</strong> qua lệnh VietQR Payout.
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                value={affiliatePoints}
                onChange={(e) => setAffiliatePoints(Number(e.target.value))}
                step={10000}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-sm rounded-xl border border-teal-300 dark:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                Điểm (VNĐ)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Cộng nhanh:</span>
              {[50000, 100000, 200000, 500000, 1000000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addAffiliatePoints(amt)}
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[10px] transition shadow-xs cursor-pointer"
                >
                  +{amt / 1000}k Điểm
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Lượt Up-Tin Khả Dụng */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                3. LƯỢT UP TIN ĐẨY TOP KHẢ DỤNG
              </label>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                Hiện tại: {user.upTinCredits || 10} lượt
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                value={upTinCredits}
                onChange={(e) => setUpTinCredits(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-sm rounded-xl border border-amber-300 dark:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                Lượt
              </span>
            </div>

            {/* Quick UpTin Additions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Tặng thêm:</span>
              {[5, 10, 20, 50, 100, 200].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => addUpTin(cnt)}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[10px] transition shadow-xs cursor-pointer"
                >
                  +{cnt} lượt
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Điểm Thưởng Social / Tích Điểm & Hạng VIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Social Points */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" />
                4. ĐIỂM THƯỞNG SOCIAL (PTS)
              </label>
              <input
                type="number"
                value={socialPoints}
                onChange={(e) => setSocialPoints(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {[10, 50, 100].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => addPoints(p)}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-[10px] cursor-pointer"
                  >
                    +{p} pts
                  </button>
                ))}
              </div>
            </div>

            {/* Tier VIP */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                5. HẠNG THÀNH VIÊN VIP
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as UserTier)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="thuong">Cư Dân Thường (Mặc định)</option>
                <option value="bac">🥈 Hạng Bạc (Silver)</option>
                <option value="vang">🥇 Hạng Vàng (Gold)</option>
                <option value="kim-cuong">💎 Hạng Kim Cương (Diamond)</option>
              </select>
            </div>
          </div>

          {/* Section 5: Reason */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Lý do bơm Token / Cấp Điểm (Hiển thị trong lịch sử sao kê):
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do tặng hoặc trợ cấp..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition cursor-pointer"
            >
              Đóng Lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ĐANG XỬ LÝ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>XÁC NHẬN BƠM TOKEN & LƯỢT UP</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
