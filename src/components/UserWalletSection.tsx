import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  Zap, Crown, Wallet, ArrowUpRight, Copy, Check, Clock, RefreshCw, 
  Sparkles, CheckCircle2, ShieldCheck, DollarSign, ArrowDownRight, QrCode
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
  onOpenEscrowModal?: () => void;
}

export const UserWalletSection: React.FC<UserWalletSectionProps> = ({
  userState,
  affiliateWallet,
  upTinCredits,
  serverWalletTransactions,
  onOpenWithdrawModal,
  onRefreshBalance,
  isSyncingBalance,
  onQuickExchangeAffiliate,
  onOpenEscrowModal
}) => {
  const [topupTab, setTopupTab] = useState<'qr' | 'crypto'>('qr');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState(100000);
  
  // Dynamic Bank & Intent State
  const [depositIntent, setDepositIntent] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [bankConfig, setBankConfig] = useState<any>({
    bankName: 'MSB (Ngân hàng Hàng Hải Việt Nam)',
    accountNumber: '3028031988',
    accountHolder: 'BUI VAN HIEU'
  });
  const [isGeneratingIntent, setIsGeneratingIntent] = useState(false);
  const [showSuccessCelebration, setShowSuccessCelebration] = useState<{ amount: number } | null>(null);
  const [lastKnownBalance, setLastKnownBalance] = useState<number>(userState.balance || 0);

  // Generate unique deposit intent whenever amount changes or on mount
  const generateDepositIntent = async (amt: number) => {
    setIsGeneratingIntent(true);
    try {
      const res = await fetch(`/api/wallets/${userState.id || 'me'}/create-deposit-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt })
      });
      if (res.ok) {
        const data = await res.json();
        setDepositIntent(data.intent);
        setQrCodeUrl(data.qrCodeUrl);
        if (data.bankConfig) setBankConfig(data.bankConfig);
      }
    } catch (err) {
      console.warn('Error generating deposit intent:', err);
    } finally {
      setIsGeneratingIntent(false);
    }
  };

  useEffect(() => {
    generateDepositIntent(customAmount);
  }, [userState.id]);

  // Live polling for auto-deposit confirmation
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const codeQuery = depositIntent?.code ? `&code=${encodeURIComponent(depositIntent.code)}` : '';
        const res = await fetch(`/api/wallets/${userState.id || 'me'}/check-deposit-status?${codeQuery}`);
        if (res.ok) {
          const data = await res.json();
          if (data.balance > lastKnownBalance) {
            const diff = data.balance - lastKnownBalance;
            setShowSuccessCelebration({ amount: diff });
            setLastKnownBalance(data.balance);
            onRefreshBalance(false);
          }
        }
      } catch (err) {
        // quiet poll
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [depositIntent, lastKnownBalance, userState.id]);

  const copyToClipboard = (text: string, type: 'acc' | 'memo' | 'amt') => {
    navigator.clipboard.writeText(text);
    if (type === 'acc') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else if (type === 'memo') {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const transferMemo = depositIntent?.code || `NAP ${userState.phone?.replace(/\D/g, '') || userState.id?.slice(0, 8) || 'CUDAN'}`;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Celebration Popup */}
      {showSuccessCelebration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl p-6 border-2 border-emerald-500 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                Khớp Lệnh SePay Thành Công
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">
                NẠP TIỀN TỰ ĐỘNG THÀNH CÔNG!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tài khoản của bạn vừa được cộng:
              </p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 my-2">
                +{showSuccessCelebration.amount.toLocaleString('vi-VN')} VNĐ
              </div>
            </div>
            <button
              onClick={() => setShowSuccessCelebration(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Hoàn Tất & Tiếp Tục
            </button>
          </div>
        </div>
      )}

      {/* Wallets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Token Balance */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-4 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" /> Số Dư Ví Tiêu Dùng
            </span>
            <button 
              onClick={() => onRefreshBalance(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              title="Đồng bộ số dư thực tế"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBalance ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {(userState.balance || 0).toLocaleString('vi-VN')} <span className="text-xs font-bold text-amber-500">VNĐ</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Dùng thanh toán Up-tin, mua gói gian hàng, mở khóa CV.</p>
        </div>

        {/* Affiliate Points */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 p-4 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Hoa Hồng CTV (Được Rút)
            </span>
            <button
              onClick={onOpenWithdrawModal}
              className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <ArrowUpRight className="w-3 h-3" /> Rút Tiền
            </button>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {(affiliateWallet || 0).toLocaleString('vi-VN')} <span className="text-xs font-bold text-emerald-500">VNĐ</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Tích lũy từ giới thiệu khách đăng tin và mua sắm.</p>
        </div>

        {/* Up-Tin Credits */}
        <div className="bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/30 p-4 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Lượt Up-Tin BĐS
            </span>
            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold text-[10px] rounded-full">
              Khả Dụng
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {upTinCredits} <span className="text-xs font-bold text-teal-500">lượt</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Đưa tin lên Top 1 trang chủ ngay lập tức.</p>
        </div>
      </div>

      {/* Topup Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cổng Nạp Tiền Tự Động VietQR SePay 24/7</h3>
              <p className="text-[11px] text-slate-400">Khớp lệnh tự động & cộng tiền vào ví trong 1 giây sau khi chuyển khoản</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-black text-[10px] rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Trực Tuyến 24/7
          </span>
        </div>

        {/* Quick Amount Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Chọn hoặc nhập số tiền muốn nạp:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[50000, 100000, 200000, 500000, 1000000, 2000000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setCustomAmount(val);
                  generateDepositIntent(val);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  customAmount === val
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                }`}
              >
                {val >= 1000000 ? `${val / 1000000} Triệu` : `${val / 1000}k`}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">Số tiền tùy chọn:</span>
            <input
              type="number"
              step="10000"
              min="10000"
              value={customAmount}
              onChange={e => {
                const v = Number(e.target.value);
                setCustomAmount(v);
                generateDepositIntent(v);
              }}
              className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-amber-600 dark:text-amber-400 focus:outline-hidden w-40"
            />
            <span className="text-xs font-bold text-slate-400">VNĐ</span>
          </div>
        </div>

        {/* QR Code & Banking Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
          {/* QR Code Box */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="VietQR nạp tiền"
                className="w-52 h-52 object-contain rounded-xl bg-white p-2 border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-52 h-52 bg-white rounded-xl flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            )}
            <div className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              Quét mã để nạp: <span className="text-amber-500 font-black">{customAmount.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">Mở mọi ứng dụng ngân hàng để quét</span>
          </div>

          {/* Transfer Info */}
          <div className="md:col-span-7 space-y-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Ngân Hàng Nhận Tiền:</span>
                <strong className="text-slate-900 dark:text-white">{bankConfig.bankName || 'MSB (Ngân hàng Hàng Hải)'}</strong>
              </div>
              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 rounded font-bold text-[10px]">
                VietQR 24/7
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Số Tài Khoản:</span>
                <strong className="text-amber-600 dark:text-amber-400 font-mono font-black text-sm">
                  {bankConfig.accountNumber || '3028031988'}
                </strong>
              </div>
              <button
                onClick={() => copyToClipboard(bankConfig.accountNumber || '3028031988', 'acc')}
                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
              >
                {copiedAccount ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAccount ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Chủ Tài Khoản:</span>
                <strong className="text-slate-900 dark:text-white uppercase">{bankConfig.accountHolder || 'BUI VAN HIEU'}</strong>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                  MÃ NẠP TIỀN / NỘI DUNG CHUYỂN KHOẢN:
                </span>
                <strong className="text-amber-600 dark:text-amber-400 font-mono font-black text-sm">
                  {transferMemo}
                </strong>
              </div>
              <button
                onClick={() => copyToClipboard(transferMemo, 'memo')}
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-black text-[11px] transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                {copiedMemo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMemo ? 'Đã chép mã' : 'Sao chép mã'}</span>
              </button>
            </div>

            <div className="p-2.5 bg-slate-100 dark:bg-slate-800/40 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Hệ thống tự động kiểm tra và cộng tiền trong 1 giây sau khi bạn chuyển khoản thành công.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
            Lịch Sử Giao Dịch Ví Gần Đây
          </h4>
          <button
            onClick={() => onRefreshBalance(true)}
            className="text-[11px] text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Làm mới</span>
          </button>
        </div>

        {serverWalletTransactions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Chưa có giao dịch nạp / rút tiền nào phát sinh.
          </div>
        ) : (
          <div className="space-y-2">
            {serverWalletTransactions.slice(0, 10).map((tx: any) => {
              const isDeposit = tx.type === 'deposit_vietqr';
              const isPayout = tx.type === 'payout_withdraw';
              return (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isDeposit ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950' :
                      isPayout ? 'bg-sky-100 text-sky-600 dark:bg-sky-950' :
                      'bg-amber-100 text-amber-600 dark:bg-amber-950'
                    }`}>
                      {isDeposit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{tx.description}</div>
                      <span className="text-[10px] text-slate-400">{tx.createdAt}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-black ${isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {isDeposit ? '+' : '-'}{Number(tx.amount).toLocaleString('vi-VN')} đ
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500">
                      {tx.status === 'success' ? 'Hoàn Thành' : tx.status === 'pending' ? 'Đang Xử Lý' : 'Thất Bại'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
