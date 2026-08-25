import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Wallet, ArrowDownRight, ArrowUpRight, Lock, CheckCircle2, 
  Clock, AlertCircle, Building, Building2, RefreshCw, Send, DollarSign, 
  Smartphone, Award, CreditCard, ChevronRight, FileText, Check, HelpCircle,
  Wrench, Upload, Eye, X, ChevronDown, Download, CheckCircle
} from 'lucide-react';
import { User, TechnicalServiceOrder, UserWallet, WalletTransaction, UserBankDetails } from '../types';

interface TechnicalServiceEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const TechnicalServiceEscrowModal: React.FC<TechnicalServiceEscrowModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wallet' | 'create_order' | 'bank_linking'>('orders');
  
  // Data states
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [orders, setOrders] = useState<TechnicalServiceOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // New Order Form state
  const [serviceTitle, setServiceTitle] = useState<string>('Lắp Đặt & Bảo Trì Thang Máy Gia Đình Homelift Kính');
  const [agreedPrice, setAgreedPrice] = useState<string>('3500000');
  const [techName, setTechName] = useState<string>('Kỹ Sư Nguyễn Văn Đức (Đội Thợ VinCons)');
  const [techPhone, setTechPhone] = useState<string>('0868.499.929');
  const [customerAddress, setCustomerAddress] = useState<string>('Phân khu San Hô, Vinhomes Ocean Park 2');
  const [warrantyDays, setWarrantyDays] = useState<number>(30);
  const [orderNote, setOrderNote] = useState<string>('Kiểm tra thay cảm biến an toàn thang máy và bảo trì tải định kỳ.');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Deposit state
  const [depositAmount, setDepositAmount] = useState<string>('2000000');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  // Bank details state
  const [bankName, setBankName] = useState<string>('MBBank (Ngân Hàng Quân Đội)');
  const [accountNumber, setAccountNumber] = useState<string>('3028031988');
  const [accountHolder, setAccountHolder] = useState<string>('BUI VAN HIEU');
  const [isSavingBank, setIsSavingBank] = useState<boolean>(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<string>('1000000');
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  const userId = currentUser?.id || 'user-trangnguyen';

  // Fetch Wallet and Orders
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Wallet
      const wRes = await fetch(`/api/wallets/${userId}`);
      if (wRes.ok) {
        const wData = await wRes.json();
        setWallet(wData.wallet);
        setTransactions(wData.transactions || []);
        if (wData.wallet?.bankDetails) {
          setBankName(wData.wallet.bankDetails.bankName || 'MBBank');
          setAccountNumber(wData.wallet.bankDetails.accountNumber || '');
          setAccountHolder(wData.wallet.bankDetails.accountHolder || '');
        }
      }

      // 2. Fetch Technical Orders
      const oRes = await fetch(`/api/tech-orders?userId=${userId}`);
      if (oRes.ok) {
        const oData = await oRes.json();
        setOrders(oData);
      }
    } catch (err) {
      console.error("Error fetching escrow wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  // Handle Deposit submit
  const handleDeposit = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const amt = Number(depositAmount);
    if (!amt || amt < 10000) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập số tiền nạp tối thiểu 10.000đ' });
      return;
    }
    setIsDepositing(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/wallets/${userId}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, referenceCode: `NAP-VQR-${Date.now()}` })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        setWallet(data.wallet);
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Nạp tiền thất bại' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Lỗi kết nối máy chủ nạp tiền VietQR' });
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle Save Bank Details
  const handleSaveBankDetails = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!bankName || !accountNumber || !accountHolder) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin Tên Ngân Hàng, STK và Chủ Tài Khoản' });
      return;
    }
    setIsSavingBank(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/wallets/${userId}/bank-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankName, accountNumber, accountHolder })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Lưu ngân hàng thất bại' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Lỗi máy chủ liên kết ngân hàng' });
    } finally {
      setIsSavingBank(false);
    }
  };

  // Handle Withdraw submit
  const handleWithdraw = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const amt = Number(withdrawAmount);
    if (!amt || amt < 50000) {
      setStatusMessage({ type: 'error', text: 'Số tiền rút tối thiểu là 50.000đ' });
      return;
    }
    setIsWithdrawing(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/wallets/${userId}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        setWallet(data.wallet);
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Rút tiền thất bại' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Lỗi máy chủ rút tiền tự động' });
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Handle Create Technical Escrow Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const priceNum = Number(agreedPrice);
    if (!priceNum || priceNum <= 0) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập giá trị hợp đồng dịch vụ hợp lệ.' });
      return;
    }
    setIsSubmittingOrder(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/tech-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTitle,
          agreedPrice: priceNum,
          customerUserId: userId,
          customerName: currentUser.name || 'Cư Dân Vin',
          customerPhone: currentUser.phone || '0988.123.456',
          customerAddress,
          techName,
          techPhone,
          warrantyDays,
          note: orderNote,
          project: 'ocean-park-2',
          subdivision: 'Phân khu San Hô',
          categoryId: 'thang-may-sua-nha',
          subCategory: '🛗 Lắp Đặt & Bảo Trì Thang Máy Gia Đình Homelift Kính'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        setActiveTab('orders');
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Tạo đơn tạm giữ thất bại' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Lỗi kết nối máy chủ tạo đơn kỹ thuật' });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Handle Order Status Action (Release escrow payout)
  const handleReleaseEscrow = async (orderId: string) => {
    if (!confirm("XÁC NHẬN NGHIỆM THU & GIẢI NGÂN?\n\nBạn có chắc chắn công việc kỹ thuật đã hoàn thành tốt? Hệ thống sẽ tự động chuyển 95% số tiền tạm giữ trực tiếp vào Ví của Thợ.")) {
      return;
    }
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/tech-orders/${orderId}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed_released',
          note: 'Khách hàng đã trực tiếp nghiệm thu và bấm giải ngân tiền vào Ví Thợ thành công.'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Cập nhật thất bại' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Lỗi giải ngân tiền tự động' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Cơ Chế Tiền Tự Động &amp; Ví Tạm Giữ Escrow 24/7
                </h3>
                <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-medium">
                  Bảo Vệ Quyền Lợi 100%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/80 mt-0.5">
                Chợ Cư Dân 24H &mdash; Tự động hóa dòng tiền: Nạp VietQR &rarr; Lock Tiền &rarr; Tự Động Giải Ngân Ví Thợ
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Real-time Flow Banner & Legal Disclaimer */}
        <div className="bg-slate-900 text-slate-100 p-3 sm:p-4 text-xs border-b border-slate-800">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>MÔ HÌNH KẾT NỐI TRỰC TIẾP (0% PHÍ SÀN):</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                <span className="bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/50">1. Đặt lịch / Yêu cầu</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
                <span className="bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/50">2. Kết nối trực tiếp</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
                <span className="bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/50">3. Lưu Nhật Ký Lịch Sử</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">4. Giải ngân 100% (Phí Sàn 0%)</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 text-amber-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>⚖️ Thông báo Pháp lý & Miễn trừ Trách nhiệm:</strong> Sàn chocudan24h.com là nền tảng kết nối thông tin trực tiếp giữa Khách hàng và Đơn vị dịch vụ/Thợ kỹ thuật. Sàn <u>KHÔNG thu % phí giao dịch</u> và <u>KHÔNG chịu trách nhiệm pháp lý</u> đối với chất lượng thi công, hợp đồng cá nhân hay thỏa thuận thanh toán giữa các bên. Đơn đặt hàng trên hệ thống chỉ phục vụ lưu trữ nhật ký lịch sử kết nối.
              </div>
            </div>
          </div>
        </div>

        {/* Alert/Status Banner */}
        {statusMessage && (
          <div className={`p-3 text-sm flex items-center justify-between gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' :
            statusMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border-b border-rose-200' :
            'bg-sky-50 text-sky-800 border-b border-sky-200'
          }`}>
            <div className="flex items-center gap-2 font-medium">
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'orders' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Đơn Dịch Vụ Kỹ Thuật ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'wallet' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Ví Cư Dân &amp; Nạp/Rút VietQR</span>
              </button>

              <button
                onClick={() => setActiveTab('create_order')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'create_order' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Tạo Đơn Tạm Giữ Mới</span>
              </button>

              <button
                onClick={() => setActiveTab('bank_linking')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'bank_linking' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>STK Ngân Hàng Thợ</span>
              </button>
            </div>

            <button 
              onClick={fetchData}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Cập nhật dữ liệu</span>
            </button>
          </div>

          {/* TAB 1: LIST OF TECHNICAL ORDERS WITH AUTOMATED ESCROW */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Danh Sách Đơn Kỹ Thuật Đang Quản Lý Tiền Qua Ví Escrow
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Khách hàng kiểm tra tiến độ, xem ảnh thi công &amp; bấm nút &quot;Nghiệm Thu &amp; Giải Ngân&quot; để chuyển tiền tự động cho thợ.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                  <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">Chưa có đơn dịch vụ kỹ thuật nào.</p>
                  <p className="text-xs text-slate-400 mt-1">Bấm &quot;Tạo Đơn Tạm Giữ Mới&quot; để đặt thợ sửa thang máy, điện nước hoặc thiết bị smarthome.</p>
                  <button 
                    onClick={() => setActiveTab('create_order')}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Tạo Đơn Tạm Giữ Ngay</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-emerald-300 transition-all">
                      <div className="p-4 sm:p-5">
                        
                        {/* Order Top Line */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                              {ord.orderCode}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">{ord.subCategory}</span>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {ord.status === 'completed_released' ? (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ĐÃ GIẢI NGÂN TỰ ĐỘNG VÀO VÍ THỢ
                              </span>
                            ) : ord.status === 'inspection_submitted' ? (
                              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold border border-amber-300 animate-pulse">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                ĐÃ XONG &mdash; CHỜ KHÁCH BẤM NGHIỆM THU
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-800 text-xs px-3 py-1 rounded-full font-bold border border-sky-300">
                                <Lock className="w-3.5 h-3.5 text-sky-600" />
                                ĐÃ TẠM GIỮ 100% TIỀN Ở VÍ ESCROW
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Price Body */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <h5 className="font-bold text-slate-900 text-base sm:text-lg leading-snug">
                              {ord.serviceTitle}
                            </h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Khách hàng: <strong>{ord.customerName}</strong> ({ord.customerPhone})</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Thợ kỹ thuật: <strong>{ord.techName}</strong> ({ord.techPhone})</span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:col-span-2">
                                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>Địa chỉ thi công: {ord.customerAddress}</span>
                              </div>
                            </div>

                            {ord.note && (
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                                <strong>Ghi chú công việc:</strong> {ord.note}
                              </div>
                            )}

                            {/* Images Proof before / after */}
                            {((ord.imagesBefore && ord.imagesBefore.length > 0) || (ord.imagesAfter && ord.imagesAfter.length > 0)) && (
                              <div className="flex items-center gap-3 pt-2">
                                {ord.imagesBefore && ord.imagesBefore[0] && (
                                  <div>
                                    <span className="text-[10px] text-slate-400 block mb-1">Ảnh trước thi công:</span>
                                    <img src={ord.imagesBefore[0]} alt="Before" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                                  </div>
                                )}
                                {ord.imagesAfter && ord.imagesAfter[0] && (
                                  <div>
                                    <span className="text-[10px] text-emerald-600 font-bold block mb-1">Ảnh đã nghiệm thu:</span>
                                    <img src={ord.imagesAfter[0]} alt="After" className="w-16 h-16 rounded-lg object-cover border border-emerald-300" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Escrow Financial Box */}
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-xl border border-emerald-200 flex flex-col justify-between">
                            <div>
                              <div className="text-xs text-slate-500 font-medium mb-1">Giá trị hợp đồng dịch vụ:</div>
                              <div className="text-xl sm:text-2xl font-black text-emerald-700">
                                {ord.agreedPrice.toLocaleString('vi-VN')} <span className="text-xs font-normal">đ</span>
                              </div>

                              <div className="mt-3 pt-3 border-t border-emerald-200/60 space-y-1 text-xs">
                                <div className="flex justify-between text-slate-600">
                                  <span>Phí quản lý hệ thống (5%):</span>
                                  <span className="font-semibold text-slate-700">-{ord.platformFee.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="flex justify-between text-emerald-800 font-bold pt-1">
                                  <span>Thợ thực nhận (95%):</span>
                                  <span>{ord.payoutAmount.toLocaleString('vi-VN')}đ</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 pt-3 border-t border-emerald-200/60">
                              {ord.status !== 'completed_released' ? (
                                <button
                                  onClick={() => handleReleaseEscrow(ord.id)}
                                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>BẤM NGHIỆM THU &amp; GIẢI NGÂN</span>
                                </button>
                              ) : (
                                <div className="text-center p-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                  <Award className="w-4 h-4 text-emerald-600" />
                                  <span>Bảo hành {ord.warrantyDays} ngày (Đến {ord.warrantyExpiresAt})</span>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WALLET & VIETQR DEPOSIT/WITHDRAW */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              
              {/* Wallet Summary Card */}
              <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/30">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-800/60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">Ví Tự Động chocudan24h</span>
                      <h4 className="text-xl font-extrabold text-white">{currentUser?.name || 'Cư Dân Vinhomes'}</h4>
                    </div>
                  </div>

                  <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                    Trạng Thái Tự Động 24/7
                  </span>
                </div>

                {/* Balance Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  
                  {/* Available Balance */}
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <div className="text-xs text-emerald-200/80 font-medium mb-1 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>Số Dư Khả Dụng</span>
                    </div>
                    <div className="text-2xl font-black text-white">
                      {(wallet?.availableBalance || 0).toLocaleString('vi-VN')} <span className="text-xs font-normal text-emerald-200">đ</span>
                    </div>
                    <p className="text-[10px] text-emerald-300/70 mt-1">Dùng thanh toán dịch vụ hoặc rút về NH</p>
                  </div>

                  {/* Escrow Locked Balance */}
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <div className="text-xs text-amber-200/80 font-medium mb-1 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Tiền Đang Tạm Giữ Escrow</span>
                    </div>
                    <div className="text-2xl font-black text-amber-300">
                      {(wallet?.escrowLockedBalance || 0).toLocaleString('vi-VN')} <span className="text-xs font-normal text-amber-200">đ</span>
                    </div>
                    <p className="text-[10px] text-amber-300/70 mt-1">Thuật toán khóa an toàn cho các đơn kỹ thuật</p>
                  </div>

                  {/* Security Deposit for Technician */}
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <div className="text-xs text-sky-200/80 font-medium mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      <span>Cọc Cam Kết Bảo Hành Thợ</span>
                    </div>
                    <div className="text-2xl font-black text-sky-200">
                      {(wallet?.securityDeposit || 0).toLocaleString('vi-VN')} <span className="text-xs font-normal text-sky-200">đ</span>
                    </div>
                    <p className="text-[10px] text-sky-300/70 mt-1">Đảm bảo uy tín cho thợ đăng ký trên app</p>
                  </div>

                </div>
              </div>

              {/* Action Forms: Deposit & Withdraw */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Deposit Form (Nạp Tiền VietQR) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                    <h5 className="font-bold text-slate-900 text-base">Nạp Tiền Ví Cư Dân Qua VietQR</h5>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền muốn nạp (VNĐ):</label>
                    <input 
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Ví dụ: 2000000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* VietQR Quick Code Box */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center space-y-2">
                    <p className="text-xs text-slate-600 font-medium">Mã VietQR Tự Động Nhận Tiền Nạp chocudan24h:</p>
                    <img 
                      src={`https://img.vietqr.io/image/MB-3028031988-compact2.png?amount=${depositAmount}&addInfo=NAP%20VI%20${userId}`}
                      alt="VietQR Deposit"
                      className="w-44 h-44 mx-auto rounded-lg shadow border border-slate-200 object-contain"
                    />
                    <div className="text-[11px] text-slate-500">
                      Ngân hàng: <strong>MBBank</strong> | STK: <strong className="text-emerald-700">3028031988</strong> | Chủ TK: <strong>BUI VAN HIEU</strong>
                    </div>
                  </div>

                  {/* Direct Mobile Banking Launcher */}
                  <a
                    href={`https://dl.vietqr.io/pay?bank=MSB&account=3028031988&amount=${depositAmount || 50000}&memo=${encodeURIComponent(`NAP TIEN VI ${userId}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 transition"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Mở App Ngân Hàng Nạp Tiền Tự Động</span>
                  </a>

                  {/* Real-time Webhook Radar Detection */}
                  <div className="p-2.5 bg-emerald-950/10 rounded-xl border border-dashed border-emerald-500/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800">Tự động cộng số dư khi nhận Webhook</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeposit}
                      disabled={isDepositing}
                      className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-md border border-emerald-300"
                    >
                      {isDepositing ? 'Đang xử lý...' : '⚡ Mô Phỏng Webhook'}
                    </button>
                  </div>
                </div>

                {/* Withdraw Form (Rút Tiền Về Ngân Hàng Cho Thợ) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                      <ArrowUpRight className="w-5 h-5 text-sky-600" />
                      <h5 className="font-bold text-slate-900 text-base">Rút Tiền Về Ngân Hàng Tự Động (Cho Thợ)</h5>
                    </div>

                    {/* Linked Bank Info Display */}
                    <div className="bg-sky-50/80 p-3.5 rounded-xl border border-sky-200 text-xs space-y-1 mb-4">
                      <span className="font-bold text-sky-900 block">Tài khoản Ngân hàng đã liên kết:</span>
                      {wallet?.bankDetails?.accountNumber ? (
                        <div className="text-slate-700 font-medium space-y-0.5">
                          <p>• Ngân hàng: <strong className="text-slate-900">{wallet.bankDetails.bankName}</strong></p>
                          <p>• Số tài khoản: <strong className="text-sky-700">{wallet.bankDetails.accountNumber}</strong></p>
                          <p>• Chủ tài khoản: <strong className="text-slate-900">{wallet.bankDetails.accountHolder}</strong></p>
                        </div>
                      ) : (
                        <p className="text-rose-600 font-semibold">Chưa liên kết tài khoản ngân hàng. Bấm tab &quot;STK Ngân Hàng Thợ&quot; để thêm.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền muốn rút về Ngân hàng (VNĐ):</label>
                      <input 
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Ví dụ: 1000000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isWithdrawing ? 'Đang rút tiền...' : 'Lập Lệnh Rút Tiền Tự Động Về STK'}</span>
                  </button>
                </div>

              </div>

              {/* Wallet Transactions History Table */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Lịch Sử Giao Dịch Dòng Tiền Tự Động ({transactions.length})
                </h5>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="p-2.5 font-bold">Mã GD</th>
                        <th className="p-2.5 font-bold">Loại Giao Dịch</th>
                        <th className="p-2.5 font-bold">Nội Dung</th>
                        <th className="p-2.5 font-bold">Số Tiền</th>
                        <th className="p-2.5 font-bold">Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-600 font-bold">{tx.referenceCode || tx.id}</td>
                          <td className="p-2.5">
                            {tx.type === 'escrow_hold' ? (
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Tạm Giữ Escrow</span>
                            ) : tx.type === 'escrow_release' ? (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Giải Ngân Về Ví</span>
                            ) : tx.type === 'deposit_vietqr' ? (
                              <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">Nạp VietQR</span>
                            ) : (
                              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">Rút Ngân Hàng</span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-800 font-medium">{tx.description}</td>
                          <td className="p-2.5 font-bold text-slate-900">
                            {tx.amount.toLocaleString('vi-VN')}đ
                          </td>
                          <td className="p-2.5 text-slate-400">{tx.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CREATE NEW TECHNICAL ESCROW ORDER */}
          {activeTab === 'create_order' && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  Tạo Đơn Kỹ Thuật Tạm Giữ Escrow Mới
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Thuật toán sẽ tự động TẠM GIỮ 100% số tiền thỏa thuận trong Ví Escrow cho tới khi thợ làm xong và bạn bấm nghiệm thu.
                </p>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên Dịch Vụ Kỹ Thuật:</label>
                  <input 
                    type="text"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giá Trị Thỏa Thuận (VNĐ):</label>
                    <input 
                      type="number"
                      value={agreedPrice}
                      onChange={(e) => setAgreedPrice(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số Ngày Bảo Hành Cam Kết:</label>
                    <input 
                      type="number"
                      value={warrantyDays}
                      onChange={(e) => setWarrantyDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tên Thợ / Đội Kỹ Thuật:</label>
                    <input 
                      type="text"
                      value={techName}
                      onChange={(e) => setTechName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại Thợ:</label>
                    <input 
                      type="text"
                      value={techPhone}
                      onChange={(e) => setTechPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa Chỉ Thi Công Căn Hộ / Biệt Thự:</label>
                  <input 
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi Chú Công Việc Chi Tiết:</label>
                  <textarea 
                    rows={3}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmittingOrder ? 'Đang khóa tiền tạm giữ...' : 'Xác Nhận Khóa Tiền Tạm Giữ VÀO VÍ ESCROW'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: TECHNICIAN BANK LINKING */}
          {activeTab === 'bank_linking' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-sky-600" />
                  Liên Kết Ngân Hàng Nhận Tiền Tự Động Cho Thợ
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Thợ nạp Số tài khoản ngân hàng cá nhân để hệ thống tự động giải ngân thu nhập sau mỗi công việc hoàn thành.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên Ngân Hàng:</label>
                  <input 
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ví dụ: MBBank (Ngân Hàng Quân Đội)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Tài Khoản Ngân Hàng:</label>
                  <input 
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Ví dụ: 3028031988"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-sky-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ Về Tên Chủ Tài Khoản (Viết Hoa Không Dấu):</label>
                  <input 
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Ví dụ: BUI VAN HIEU"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                  />
                </div>

                <button
                  onClick={handleSaveBankDetails}
                  disabled={isSavingBank}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSavingBank ? 'Đang lưu...' : 'Lưu Tài Khoản Ngân Hàng Nhận Tiền'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Hệ thống Bảo Vệ Quyền Lợi Tam Bên Cư Dân &mdash; Chợ Cư Dân 24H</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
