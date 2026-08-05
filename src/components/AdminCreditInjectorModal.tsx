import React, { useState } from 'react';
import { User, UserTier } from '../types';
import { 
  X, Wallet, Zap, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, 
  DollarSign, Award, Clock, History, FileText, UserCheck, Plus, RefreshCw 
} from 'lucide-react';

export interface AdminCreditLog {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  type: 'balance' | 'uptin' | 'points' | 'tier';
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
  const [upTinCredits, setUpTinCredits] = useState<number>(user.upTinCredits || 10);
  const [socialPoints, setSocialPoints] = useState<number>(user.socialPoints || 0);
  const [tier, setTier] = useState<UserTier>(user.tier || 'thuong');
  const [reason, setReason] = useState<string>('Thưởng chương trình Khuyến mãi / Khai trương Gian Hàng Cư Dân VIP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick balance additions
  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount);
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
      upTinCredits,
      socialPoints,
      tier,
      totalTopup: (user.totalTopup || 0) + Math.max(0, balance - (user.balance || 0))
    };

    try {
      const response = await fetch(`/api/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balance,
          upTinCredits,
          socialPoints,
          tier,
          totalTopup: updatedUser.totalTopup
        })
      });

      const data = await response.json();
      
      // Store log in localStorage
      const logsSaved = localStorage.getItem('chocudan24h_admin_credit_logs');
      let logsList: AdminCreditLog[] = logsSaved ? JSON.parse(logsSaved) : [];
      
      const newLog: AdminCreditLog = {
        id: `credit-log-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        type: 'balance',
        amountAdded: balance - (user.balance || 0),
        previousValue: user.balance || 0,
        newValue: balance,
        reason: reason || 'Bơm điểm / Ví tiền Admin',
        adminName: 'Admin Tổng',
        createdAt: new Date().toLocaleString('vi-VN')
      };

      logsList.unshift(newLog);
      localStorage.setItem('chocudan24h_admin_credit_logs', JSON.stringify(logsList.slice(0, 50)));

      alert(`🎉 ĐÃ BƠM THÀNH CÔNG CHO TÀI KHOẢN "${user.name}"!\n• Ví tiền: ${balance.toLocaleString('vi-VN')} VNĐ\n• Lượt Up-Tin: ${upTinCredits} lượt\n• Điểm thưởng: ${socialPoints} pts\n• Hạng: ${tier.toUpperCase()}`);
      
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
              💵
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                QUẢN TRỊ VIÊN ADMIN
              </span>
              <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                CÔNG CỤ BƠM TIỀN & ĐIỂM VÍ TÀI KHOẢN
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quick Info Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-amber-500/40 shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-amber-500 text-slate-950 font-black rounded-full flex items-center justify-center text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span>{user.name}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold rounded text-[10px] uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                Email: {user.email} | SĐT: {user.phone || '0868.499.929'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-bold">Hạng Hiện Tại:</span>
            <span className="font-black text-amber-500 uppercase text-xs">
              {user.tier ? user.tier.replace('-', ' ') : 'Thường'}
            </span>
          </div>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
          
          {/* Section 1: Ví Tiền Mặt Nạp Trước (VNĐ) */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                1. SỐ DƯ VÍ TÀI KHOẢN (VNĐ)
              </label>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                Hiện tại: {(user.balance || 0).toLocaleString('vi-VN')} VNĐ
              </span>
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
                VNĐ
              </span>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Cộng nhanh:</span>
              {[50000, 100000, 200000, 500000, 1000000, 2000000, 5000000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addBalance(amt)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition shadow-xs cursor-pointer"
                >
                  +{amt >= 1000000 ? `${amt / 1000000}Tr` : `${amt / 1000}k`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setBalance(0)}
                className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] transition"
              >
                Đặt về 0đ
              </button>
            </div>
          </div>

          {/* Section 2: Lượt Up-Tin Khả Dụng */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                2. LƯỢT UP TIN ĐẨY TOP KHẢ DỤNG
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

          {/* Section 3: Điểm Thưởng Social / Tích Điểm & Hạng VIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Social Points */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" />
                3. ĐIỂM THƯỞNG SOCIAL (PTS)
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
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-[10px]"
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
                4. HẠNG THÀNH VIÊN VIP
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as UserTier)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="thuong">Thành Viên Thường</option>
                <option value="bac">🥈 Hạng Bạc (Silver VIP)</option>
                <option value="vang">🥇 Hạng Vàng (Gold VIP)</option>
                <option value="kim-cuong">💎 Hạng Kim Cương (Diamond VIP)</option>
              </select>
              <p className="text-[10px] text-slate-400">
                Hạng VIP ưu tiên xuất hiện đầu danh sách tìm kiếm gian hàng & tin đăng
              </p>
            </div>

          </div>

          {/* Section 4: Ghi chú lý do Admin */}
          <div className="space-y-2">
            <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-500" />
              GHI CHÚ / LÝ DO BƠM TIỀN (LƯU LỊCH SỬ AUDIT LOG)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Thưởng mở gian hàng Cư Dân, Khuyến mãi nạp đầu..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl transition"
            >
              Đóng / Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-900/40 transition transform active:scale-95 flex items-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>{isSubmitting ? 'Đang lưu...' : 'XÁC NHẬN BƠM VÍ TÀI KHOẢN'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
