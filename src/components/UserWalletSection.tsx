import React, { useState } from 'react';
import { User, UpTinPricingConfig } from '../types';
import { 
  Zap, Crown, Wallet, ArrowUpRight, Copy, Check, Clock, RefreshCw, 
  Sparkles, CheckCircle2, ShieldCheck, DollarSign
} from 'lucide-react';

interface UserWalletSectionProps {
  userState: User;
  affiliateWallet: number;
  upTinCredits: number;
  serverWalletTransactions: any[];
  onOpenWithdrawModal: () => void;
  onRefreshBalance: (showToast?: boolean) => void;
  isSyncingBalance: boolean;
  onQuickExchangeAffiliate: (credits: number) => void;
}

export const UserWalletSection: React.FC<UserWalletSectionProps> = ({
  userState,
  affiliateWallet,
  upTinCredits,
  serverWalletTransactions,
  onOpenWithdrawModal,
  onRefreshBalance,
  isSyncingBalance,
  onQuickExchangeAffiliate
}) => {
  const [topupTab, setTopupTab] = useState<'qr' | 'crypto'>('qr');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [customAmount, setCustomAmount] = useState(100000);

  const transferMemo = `TOKEN ${userState.phone || userState.email?.split('@')[0] || userState.id?.slice(0, 8) || 'CUDAN'}`;

  const copyToClipboard = (text: string, type: 'acc' | 'memo') => {
    navigator.clipboard.writeText(text);
    if (type === 'acc') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 3 Wallets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Token Cư Dân */}
        <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-amber-500/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
              🪙 TOKEN CƯ DÂN (XU TIÊU DÙNG)
            </span>
            <span className="text-xs text-amber-400 font-bold">1 Token = 1 VNĐ</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {(userState.balance || 0).toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-amber-300">Token</span>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            Dùng để mua gói Đẩy Tin Lên Top 1, đăng ký gói Tuyển dụng VIP và mở khóa dịch vụ.
          </p>
          <div className="pt-1 flex gap-2">
            <button
              onClick={() => onRefreshBalance(true)}
              disabled={isSyncingBalance}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBalance ? 'animate-spin' : ''}`} />
              <span>{isSyncingBalance ? 'Đang nạp...' : 'Đồng Bộ / Nạp Tự Động'}</span>
            </button>
          </div>
        </div>

        {/* 2. Tiền Rút ATM Affiliate */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
              💸 TIỀN RÚT VỀ ATM
            </span>
            <span className="text-xs text-emerald-400 font-bold">VietQR 24/7</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {(userState.affiliatePoints || affiliateWallet || 0).toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-emerald-300">VNĐ</span>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            Hoa hồng nhận từ giới thiệu cư dân (15% F1, 5% F2). Rút trực tiếp về tài khoản ngân hàng.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onOpenWithdrawModal}
              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
            >
              Rút Tiền Về ATM
            </button>
            <button
              onClick={() => {
                const currentAff = userState.affiliatePoints || affiliateWallet || 0;
                if (currentAff < 10000) {
                  alert('Cần tối thiểu 10.000đ để quy đổi Lượt Đẩy Tin!');
                  return;
                }
                const newCredits = Math.floor(currentAff / 10000);
                onQuickExchangeAffiliate(newCredits);
              }}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
              title="Đổi 10.000đ = 1 lượt Đẩy Tin"
            >
              Đổi Lượt Đẩy Tin
            </button>
          </div>
        </div>

        {/* 3. Lượt Đẩy Tin Top 1 */}
        <div className="bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-blue-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase bg-blue-500 text-slate-950 px-2 py-0.5 rounded">
              ⚡ ĐẨY TIN TOP 1
            </span>
            <span className="text-xs text-blue-400 font-bold">Đẩy bài đầu trang</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
              {upTinCredits}
            </span>
            <span className="text-xs font-bold text-blue-300">Lượt</span>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            Giúp bài viết BĐS xuất hiện ngay đầu trang chủ và danh mục tìm kiếm.
          </p>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ưu tiên số 1 khi người mua tìm kiếm</span>
          </div>
        </div>
      </div>

      {/* VietQR Quick Topup Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-500" />
              NẠP TOKEN TỰ ĐỘNG QUA VIETQR (1 TOKEN = 1 VNĐ)
            </h3>
            <p className="text-xs text-slate-500">
              Quét mã QR bằng App Ngân hàng bất kỳ, Token sẽ tự động cộng vào ví trong 10-30 giây.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {[50000, 100000, 200000, 500000].map((amt) => (
              <button
                key={amt}
                onClick={() => setCustomAmount(amt)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  customAmount === amt
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {(amt / 1000).toLocaleString('vi-VN')}k
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <img
              src={`https://img.vietqr.io/image/MB-0988888888-compact2.png?amount=${customAmount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=CHO%20CU%20DAN%2024H`}
              alt="Mã VietQR nạp Token"
              className="w-48 h-48 object-contain rounded-lg bg-white p-2 border border-slate-200 shadow-xs"
            />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-2">
              Quét mã để nạp: <strong className="text-amber-500">{customAmount.toLocaleString('vi-VN')} VNĐ</strong>
            </span>
          </div>

          {/* Transfer Info */}
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Ngân Hàng:</span>
                <strong className="text-slate-900 dark:text-white">MB Bank (Ngân hàng Quân Đội)</strong>
              </div>
              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 rounded font-bold text-[10px]">VietQR 24/7</span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Số Tài Khoản:</span>
                <strong className="text-slate-900 dark:text-white font-mono text-sm">0988888888</strong>
              </div>
              <button
                onClick={() => copyToClipboard('0988888888', 'acc')}
                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-500 hover:text-slate-950 font-bold text-[11px] rounded-lg transition flex items-center gap-1"
              >
                {copiedAccount ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAccount ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-bold">Nội Dung Chuyển Khoản (Bắt Buộc):</span>
                <strong className="text-amber-950 dark:text-amber-300 font-mono text-xs">{transferMemo}</strong>
              </div>
              <button
                onClick={() => copyToClipboard(transferMemo, 'memo')}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                {copiedMemo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMemo ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400">
              * Hệ thống khớp nội dung chuyển khoản tự động và cộng Token sau khi giao dịch thành công.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            LỊCH SỬ GIAO DỊCH VÍ & BIẾN ĐỘNG SỐ DƯ
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {serverWalletTransactions.length} Giao Dịch
          </span>
        </div>

        {serverWalletTransactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 space-y-1">
            <p>Chưa có giao dịch biến động ví nào.</p>
            <p className="text-[11px] text-slate-400">Các lần nạp tiền VietQR, nạp Token hoặc rút tiền hoa hồng sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] bg-slate-50 dark:bg-slate-800/40">
                  <th className="p-2.5">Thời Gian</th>
                  <th className="p-2.5">Loại</th>
                  <th className="p-2.5">Nội Dung</th>
                  <th className="p-2.5 text-right">Số Tiền</th>
                  <th className="p-2.5 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {serverWalletTransactions.map((tx: any, idx: number) => (
                  <tr key={tx.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">{tx.createdAt || 'Vừa xong'}</td>
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{tx.type}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">{tx.description}</td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      {(tx.amount || 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded">
                        ✓ Thành công
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
