import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, XCircle, Clock, 
  Search, RefreshCw, Send, Sparkles, ShieldCheck, Copy, Check, QrCode, 
  AlertCircle, DollarSign, Filter, Building2, User, Phone, CheckCheck
} from 'lucide-react';
import { User as UserType } from '../types';
import { AdminBankWebhookCenter } from './AdminBankWebhookCenter';

interface AdminFinanceHubProps {
  users: UserType[];
  onRefreshUsers?: () => void;
}

export const AdminFinanceHub: React.FC<AdminFinanceHubProps> = ({ users, onRefreshUsers }) => {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'pump_balance' | 'auto_deposits' | 'sepay_config'>('withdrawals');
  const [summaryData, setSummaryData] = useState<{
    totalDeposit: number;
    totalPayout: number;
    pendingWithdrawalsCount: number;
    pendingWithdrawals: any[];
    recentTransactions: any[];
  }>({
    totalDeposit: 0,
    totalPayout: 0,
    pendingWithdrawalsCount: 0,
    pendingWithdrawals: [],
    recentTransactions: []
  });

  const [loading, setLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [selectedUserForPump, setSelectedUserForPump] = useState<UserType | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [pumpAmount, setPumpAmount] = useState<number>(100000);
  const [pumpActionType, setPumpActionType] = useState<'credit' | 'debit'>('credit');
  const [pumpFundType, setPumpFundType] = useState<'balance' | 'upTinCredits' | 'affiliatePoints'>('balance');
  const [pumpReason, setPumpReason] = useState('Thưởng chương trình cư dân mới 2026');
  const [isSubmittingPump, setIsSubmittingPump] = useState(false);

  // Reject / Approve Modal States
  const [selectedWithdrawalForAction, setSelectedWithdrawalForAction] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('Thông tin tài khoản ngân hàng không chính xác');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [copiedBankInfo, setCopiedBankInfo] = useState<string | null>(null);

  const fetchFinanceSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/finance/summary');
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
      }
    } catch (err) {
      console.warn('Error loading finance summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceSummary();
    const interval = setInterval(fetchFinanceSummary, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveWithdrawal = async (txId: string) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/admin/finance/withdrawals/${txId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: 'Admin Tổng' })
      });
      if (res.ok) {
        setActionSuccessMsg('🎉 Đã xác nhận chuyển tiền thành công cho người dùng!');
        setTimeout(() => setActionSuccessMsg(''), 4000);
        setSelectedWithdrawalForAction(null);
        fetchFinanceSummary();
      }
    } catch (err) {
      console.warn('Error approving withdrawal:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectWithdrawal = async (txId: string) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/admin/finance/withdrawals/${txId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason, adminName: 'Admin Tổng' })
      });
      if (res.ok) {
        setActionSuccessMsg('Đã từ chối và hoàn tiền về ví người dùng thành công!');
        setTimeout(() => setActionSuccessMsg(''), 4000);
        setSelectedWithdrawalForAction(null);
        fetchFinanceSummary();
      }
    } catch (err) {
      console.warn('Error rejecting withdrawal:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleExecutePump = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPump) return;
    setIsSubmittingPump(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUserForPump.id}/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: pumpAmount,
          actionType: pumpActionType,
          fundType: pumpFundType,
          reason: pumpReason,
          adminName: 'Admin Ban Quản Trị'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActionSuccessMsg(data.message || 'Thao tác thành công!');
        setTimeout(() => setActionSuccessMsg(''), 5000);
        if (onRefreshUsers) onRefreshUsers();
        fetchFinanceSummary();
      }
    } catch (err) {
      console.warn('Error adjusting user balance:', err);
    } finally {
      setIsSubmittingPump(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!userSearchTerm.trim()) return true;
    const term = userSearchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.phone && u.phone.includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.companyName && u.companyName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 rounded-3xl border-2 border-teal-500/40 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
              TRUNG TÂM TÀI CHÍNH & SEPAY 2026
            </span>
            {summaryData.pendingWithdrawalsCount > 0 && (
              <span className="px-2.5 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-full animate-bounce">
                {summaryData.pendingWithdrawalsCount} Lệnh Rút Chờ Duyệt
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-teal-400 mt-1.5 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-teal-400" />
            <span>QUẢN TRỊ NẠP TỰ ĐỘNG, BƠM TIỀN & DUYỆT RÚT TIỀN</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Tự động khớp lệnh Webhook SePay VietQR, phân luồng nạp ví cho User/Shop, xử lý lệnh rút tiền 1 chạm & bơm tiền thưởng.
          </p>
        </div>

        <button
          onClick={fetchFinanceSummary}
          disabled={loading}
          className="px-4 py-2.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm Mới Dữ Liệu</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 font-bold text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tổng Nạp Tự Động (SePay)</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {(summaryData.totalDeposit || 0).toLocaleString('vi-VN')} <span className="text-xs">VNĐ</span>
          </div>
          <span className="text-[11px] text-slate-400">Tự động cộng vào ví User trong 1s</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Lệnh Rút Tiền Chờ Duyệt</span>
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {summaryData.pendingWithdrawalsCount} <span className="text-xs">Yêu cầu</span>
          </div>
          <span className="text-[11px] text-slate-400">Shop, Thợ kỹ thuật & CTV Affiliate</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tổng Đã Chi Trả (Payout)</span>
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-2">
            {(summaryData.totalPayout || 0).toLocaleString('vi-VN')} <span className="text-xs">VNĐ</span>
          </div>
          <span className="text-[11px] text-slate-400">Đã đối soát & chuyển khoản thành công</span>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'withdrawals'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Duyệt Lệnh Rút Tiền ({summaryData.pendingWithdrawalsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('pump_balance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'pump_balance'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Bơm Tiền / Điều Chỉnh Số Dư User</span>
        </button>

        <button
          onClick={() => setActiveTab('auto_deposits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'auto_deposits'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>Lịch Sử Nạp SePay & Giao Dịch</span>
        </button>

        <button
          onClick={() => setActiveTab('sepay_config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'sepay_config'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Cổng SePay & Cấu Hình Ngân Hàng</span>
        </button>
      </div>

      {/* TAB 1: DUYỆT RÚT TIỀN (WITHDRAWAL QUEUE) */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Hàng Đợi Yêu Cầu Rút Tiền Từ Cư Dân, Thợ & Chủ Shop</span>
            </h3>
          </div>

          {summaryData.pendingWithdrawals.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Không có yêu cầu rút tiền nào đang chờ</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tất cả các yêu cầu rút tiền của cư dân, thợ kỹ thuật và đối tác đều đã được xử lý và thanh toán đầy đủ.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summaryData.pendingWithdrawals.map(tx => {
                const targetUser = users.find(u => u.id === tx.userId);
                // Parse bank details from description if available
                return (
                  <div key={tx.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-rose-500/30 shadow-md space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-[10px] rounded-full uppercase">
                          Chờ Chuyển Khoản
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1.5">
                          {targetUser?.name || 'Người dùng'} ({targetUser?.phone || tx.userId})
                        </h4>
                        <span className="text-[11px] text-slate-400 block">{tx.createdAt}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Số tiền yêu cầu rút</span>
                        <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                          {Number(tx.amount).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 font-bold">Nội dung chi trả:</div>
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{tx.description}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleApproveWithdrawal(tx.id)}
                        disabled={isProcessingAction}
                        className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>Xác Nhận Đã Chuyển Tiền</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedWithdrawalForAction(tx);
                        }}
                        disabled={isProcessingAction}
                        className="py-2.5 px-3 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Từ Chối</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Reject */}
          {selectedWithdrawalForAction && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Từ Chối Yêu Cầu Rút Tiền #{selectedWithdrawalForAction.id}
                </h4>
                <p className="text-xs text-slate-500">
                  Số tiền <strong>{Number(selectedWithdrawalForAction.amount).toLocaleString('vi-VN')}đ</strong> sẽ được hoàn trả lại ngay lập tức vào ví của người dùng.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lý do từ chối (gửi thông báo cho khách):
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedWithdrawalForAction(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleRejectWithdrawal(selectedWithdrawalForAction.id)}
                    disabled={isProcessingAction}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                  >
                    Xác Nhận Từ Chối & Hoàn Tiền
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BƠM TIỀN & ĐIỀU CHỈNH SỐ DƯ USER */}
      {activeTab === 'pump_balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: User Selector */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">1. Chọn Người Dùng Cần Bơm / Trừ Tiền</span>
              <span className="text-[11px] text-slate-400">{filteredUsers.length} tài khoản</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT, email..."
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {filteredUsers.slice(0, 30).map(u => {
                const isSelected = selectedUserForPump?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserForPump(u)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{u.name}</span>
                        {u.role === 'admin' && (
                          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-bold rounded">Admin</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{u.phone || u.email || u.id}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-500">
                        {(u.balance || 0).toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[10px] text-slate-400 block">Số dư ví</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Pump Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>2. Thiết Lập Giao Dịch Bơm / Điều Chỉnh Số Dư</span>
              </h3>

              {!selectedUserForPump ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <User className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p>Vui lòng chọn một người dùng từ danh sách bên trái để bắt đầu bơm tiền.</p>
                </div>
              ) : (
                <form onSubmit={handleExecutePump} className="space-y-4 text-xs">
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Người nhận:</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{selectedUserForPump.name}</strong>
                      <span className="text-[11px] text-slate-500 block">SĐT/Email: {selectedUserForPump.phone || selectedUserForPump.email}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Số dư hiện tại:</span>
                      <strong className="text-amber-600 dark:text-amber-400 text-sm">
                        {(selectedUserForPump.balance || 0).toLocaleString('vi-VN')} VNĐ
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thao tác:</label>
                      <select
                        value={pumpActionType}
                        onChange={e => setPumpActionType(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      >
                        <option value="credit">➕ Cộng tiền (Bơm / Tặng thưởng)</option>
                        <option value="debit">➖ Trừ tiền (Thu hồi / Điều chỉnh)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Loại quỹ:</label>
                      <select
                        value={pumpFundType}
                        onChange={e => setPumpFundType(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      >
                        <option value="balance">🪙 Ví Tiêu Dùng / Token (VNĐ)</option>
                        <option value="upTinCredits">⚡ Lượt Đẩy Tin BĐS (Up-tin)</option>
                        <option value="affiliatePoints">🎁 Điểm Hoa Hồng Affiliate</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số tiền (VNĐ):</label>
                    <input
                      type="number"
                      step="10000"
                      min="1000"
                      value={pumpAmount}
                      onChange={e => setPumpAmount(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-base"
                    />
                    {/* Quick amount presets */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[50000, 100000, 200000, 500000, 1000000, 2000000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPumpAmount(val)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold"
                        >
                          +{val.toLocaleString('vi-VN')}đ
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lý do điều chỉnh (gửi vào thông báo User):</label>
                    <input
                      type="text"
                      value={pumpReason}
                      onChange={e => setPumpReason(e.target.value)}
                      placeholder="Ví dụ: Tặng quà tri ân cư dân, khuyến mãi nạp đầu..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPump}
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmittingPump ? 'Đang xử lý...' : `Xác Nhận ${pumpActionType === 'credit' ? 'Bơm' : 'Trừ'} ${pumpAmount.toLocaleString('vi-VN')} VNĐ`}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTO DEPOSITS & TRANSACTIONS LOG */}
      {activeTab === 'auto_deposits' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Lịch Sử Biến Động Số Dư & Nạp VietQR Gần Đây</span>
            <span className="text-xs text-slate-400">{summaryData.recentTransactions.length} giao dịch</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black">
                <tr>
                  <th className="p-3">Thời gian</th>
                  <th className="p-3">Người dùng</th>
                  <th className="p-3">Loại giao dịch</th>
                  <th className="p-3">Mô tả chi tiết</th>
                  <th className="p-3">Số tiền</th>
                  <th className="p-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summaryData.recentTransactions.map(tx => {
                  const isDeposit = tx.type === 'deposit_vietqr';
                  const isPayout = tx.type === 'payout_withdraw';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 text-slate-400 whitespace-nowrap">{tx.createdAt}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {tx.userName || tx.userPhone || tx.userId}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isDeposit ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          isPayout ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {isDeposit ? 'Nạp VietQR' : isPayout ? 'Rút Tiền' : 'Ký Quỹ / Khác'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{tx.description}</td>
                      <td className="p-3 font-black whitespace-nowrap">
                        <span className={isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                          {isDeposit ? '+' : '-'}{Number(tx.amount).toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' :
                          tx.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {tx.status === 'success' ? 'Hoàn Thành' : tx.status === 'pending' ? 'Chờ Duyệt' : 'Thất Bại'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SEPAY CONFIG & INTEGRATION */}
      {activeTab === 'sepay_config' && (
        <AdminBankWebhookCenter />
      )}
    </div>
  );
};
