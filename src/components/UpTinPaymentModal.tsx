import React, { useState, useEffect, useRef } from 'react';
import { Property, UpTinPricingConfig, UpTinTransaction, User } from '../types';
import { 
  X, Zap, Crown, CheckCircle2, QrCode, Copy, ShieldCheck, ArrowRight, 
  Sparkles, Building2, CreditCard, ExternalLink, Smartphone, RefreshCw,
  Radio, Check, AlertCircle, Loader2, ArrowUpRight
} from 'lucide-react';

interface UpTinPaymentModalProps {
  property: Property;
  user: User | null;
  pricingConfig: UpTinPricingConfig;
  onClose: () => void;
  onSuccessPush: (updatedProperty: Property, transaction: UpTinTransaction) => void;
}

export const UpTinPaymentModal: React.FC<UpTinPaymentModalProps> = ({
  property,
  user,
  pricingConfig,
  onClose,
  onSuccessPush
}) => {
  const [payMethod, setPayMethod] = useState<'vietqr' | 'social_points'>('vietqr');
  const [userPoints, setUserPoints] = useState<number>(user?.socialPoints || user?.upTinCredits || 12);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    facebook: false,
    youtube: false,
    tiktok: false,
    zalo: false,
    google: false,
    telegram: false
  });

  const [selectedType, setSelectedType] = useState<'single_push' | 'auto_push_5' | 'vip_silver' | 'vip_gold' | 'vip_diamond'>('single_push');
  const [days, setDays] = useState<number>(3); // For VIP packages
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedAccount, setIsCopiedAccount] = useState(false);
  const [isCopiedAmount, setIsCopiedAmount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'qr' | 'success'>('select');
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);

  // Unique payment code for this session
  const [paymentCode, setPaymentCode] = useState<string>(() => {
    const rawPropId = (property.id || '').replace('prop-', '').replace(/[^a-zA-Z0-9]/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `UPTIN-${rawPropId.slice(0, 5).toUpperCase() || 'HB'}-${randomSuffix}`;
  });

  const [confirmedTransaction, setConfirmedTransaction] = useState<UpTinTransaction | null>(null);
  const [confirmedProperty, setConfirmedProperty] = useState<Property | null>(null);
  const pollingRef = useRef<any>(null);

  // Direct Free Push in Donate Mode
  const handleFreeDonatePush = async () => {
    setIsSubmitting(true);

    const newTx: UpTinTransaction = {
      id: `tx-free-donate-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      userId: user?.id || 'guest-user',
      userName: user?.name || property.sellerName,
      userPhone: user?.phone || property.sellerPhone,
      packageType: 'single_push',
      packageName: 'Up Tin Miễn Phí (Chế Độ Donate Tùy Tâm)',
      amount: 0,
      paymentCode: `DONATE-FREE-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'approved',
      createdAt: new Date().toISOString()
    };

    const updatedProperty: Property = {
      ...property,
      pushedAt: new Date().toISOString(),
      pushedCount: (property.pushedCount || 0) + 1
    };

    try {
      await fetch(`/api/properties/${property.id}/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: newTx,
          updatedProperty
        })
      });
    } catch (err) {
      console.warn('Donate push API call fallback:', err);
    }

    setIsSubmitting(false);
    setPaymentStep('success');
    setTimeout(() => {
      onSuccessPush(updatedProperty, newTx);
    }, 1500);
  };

  const handleClaimSocialTask = (taskId: string, reward: number, url: string) => {
    window.open(url, '_blank');
    if (!completedTasks[taskId]) {
      setCompletedTasks(prev => ({ ...prev, [taskId]: true }));
      setUserPoints(prev => prev + reward);
      alert(`🎉 CHÚC MỪNG! Bạn vừa nhận +${reward} Điểm Thưởng Up-Tin nhờ Theo Dõi / Tương Tác Kênh Social BĐS!`);
    } else {
      alert(`Bạn đã nhận phần thưởng từ kênh này rồi!`);
    }
  };

  const handleRedeemPointPush = async () => {
    if (userPoints < 1) {
      alert('⚠️ Bạn chưa đủ điểm thưởng Social! Vui lòng thực hiện các nhiệm vụ Theo dõi kênh bên dưới để nhận +5 điểm ngay!');
      return;
    }

    setIsSubmitting(true);

    const newTx: UpTinTransaction = {
      id: `tx-points-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      userId: user?.id || 'guest-user',
      userName: user?.name || property.sellerName,
      userPhone: user?.phone || property.sellerPhone,
      packageType: 'single_push',
      packageName: '1 Lượt Up Tin (Đổi Điểm Social)',
      amount: 0,
      paymentCode: `POINT-REDEEM-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'approved',
      createdAt: new Date().toISOString()
    };

    const updatedProperty: Property = {
      ...property,
      pushedAt: new Date().toISOString(),
      pushedCount: (property.pushedCount || 0) + 1
    };

    try {
      await fetch(`/api/properties/${property.id}/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: newTx,
          updatedProperty
        })
      });
    } catch (err) {
      console.warn('Push API call completed fallback:', err);
    }

    setUserPoints(prev => prev - 1);
    setIsSubmitting(false);
    setPaymentStep('success');
    setTimeout(() => {
      onSuccessPush(updatedProperty, newTx);
    }, 1500);
  };

  // Calculate amount based on selection
  const getPackageInfo = () => {
    switch (selectedType) {
      case 'single_push':
        return {
          name: '1 Lượt Up Tin Lên Đầu Ngay',
          price: pricingConfig.singlePushPrice,
          desc: 'Đẩy bài viết lên Top 1 trang danh sách ngay lập tức, thu hút lượt xem vượt trội.',
          badge: '⚡ UP TIN TOP 1',
          color: 'from-emerald-500 to-teal-600'
        };
      case 'auto_push_5':
        return {
          name: 'Gói Auto-Push 5 Lượt/Ngày',
          price: pricingConfig.autoPush5Price,
          desc: 'Tự động đẩy tin lên đầu 5 lần mỗi ngày vào các khung giờ vàng (8h, 11h, 14h, 18h, 21h).',
          badge: '🔄 AUTO PUSH 5X',
          color: 'from-teal-600 to-emerald-700'
        };
      case 'vip_silver':
        return {
          name: `VIP Bạc (${days} Ngày Nổi Bật)`,
          price: pricingConfig.vipSilverPriceDay * days,
          desc: 'Gắn huy hiệu VIP Bạc, ưu tiên hiển thị trước các tin thường.',
          badge: '🥈 VIP BẠC',
          color: 'from-slate-600 to-slate-800'
        };
      case 'vip_gold':
        return {
          name: `VIP Vàng (${days} Ngày Nổi Bật)`,
          price: pricingConfig.vipGoldPriceDay * days,
          desc: 'Gắn huy hiệu VIP Vàng + Viền Lục Bảo Mệnh Mộc, hiển thị ưu tiên cao trên Trang chủ & Danh mục.',
          badge: '🥇 VIP VÀNG',
          color: 'from-amber-500 to-yellow-600'
        };
      case 'vip_diamond':
        return {
          name: `VIP Kim Cương (${days} Ngày Đỉnh Cao)`,
          price: pricingConfig.vipDiamondPriceDay * days,
          desc: 'Vị trí Top 1 ghim cố định, gắn nhãn Kim Cương sang trọng, tiếp cận 100% khách hàng tiềm năng.',
          badge: '💎 VIP KIM CƯƠNG',
          color: 'from-purple-600 via-pink-600 to-blue-600'
        };
    }
  };

  const packageInfo = getPackageInfo();

  // Bank & VietQR configuration
  const bankAccountClean = (pricingConfig.accountNumber || '3028031988').replace(/[^0-9]/g, '');
  const bankCodeRaw = (pricingConfig.bankName || 'MSB').toUpperCase();
  const bankCode = bankCodeRaw.includes('MSB') ? 'MSB' : bankCodeRaw.includes('MB') ? 'MB' : 'MSB';
  const vietQrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccountClean}-compact2.png?amount=${packageInfo.price}&addInfo=${paymentCode}&accountName=${encodeURIComponent(pricingConfig.accountHolder || 'BUI VAN HIEU')}`;

  // Start Payment Intent and Webhook Polling when moving to QR step
  const handleProceedToQr = async () => {
    setPaymentStep('qr');

    try {
      // Register payment intent on server
      await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          userId: user?.id || 'guest-user',
          userName: user?.name || property.sellerName,
          userPhone: user?.phone || property.sellerPhone,
          packageType: selectedType,
          packageName: packageInfo.name,
          amount: packageInfo.price,
          paymentCode,
          days
        })
      });
    } catch (err) {
      console.warn('Create intent warning:', err);
    }
  };

  // Automated Webhook & Intermediary Gateway Polling Listener
  useEffect(() => {
    if (paymentStep !== 'qr') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status/${paymentCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'approved' || data.status === 'paid') {
            // Payment detected and approved automatically!
            if (pollingRef.current) clearInterval(pollingRef.current);
            
            const finalTx: UpTinTransaction = data.transaction || {
              id: `tx-${Date.now()}`,
              propertyId: property.id,
              propertyTitle: property.title,
              userId: user?.id || 'guest-user',
              userName: user?.name || property.sellerName,
              userPhone: user?.phone || property.sellerPhone,
              packageType: selectedType,
              packageName: packageInfo.name,
              amount: packageInfo.price,
              paymentCode,
              status: 'pending', // Will be approved by webhook/admin
              createdAt: new Date().toISOString()
            };

            const nowIso = new Date().toISOString();
            let updatedVipLevel = property.vipLevel || 'normal';
            if (selectedType === 'vip_silver') updatedVipLevel = 'silver';
            if (selectedType === 'vip_gold') updatedVipLevel = 'gold';
            if (selectedType === 'vip_diamond') updatedVipLevel = 'diamond';

            const finalProp: Property = data.property || {
              ...property,
              pushedAt: nowIso,
              pushedCount: (property.pushedCount || 0) + 1,
              vipLevel: updatedVipLevel,
              featured: selectedType === 'vip_gold' || selectedType === 'vip_diamond' ? true : property.featured
            };

            setConfirmedTransaction(finalTx);
            setConfirmedProperty(finalProp);
            setPaymentStep('success');

            setTimeout(() => {
              onSuccessPush(finalProp, finalTx);
            }, 2500);
          }
        }
      } catch (e) {
        // Silent polling fail
      }
    };

    // Initial check
    checkPaymentStatus();
    // Poll every 2 seconds
    pollingRef.current = setInterval(checkPaymentStatus, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentStep, paymentCode, property, selectedType, packageInfo, days, user, onSuccessPush]);

  // Open Banking App Handler (Universal Link & Deep Links)
  const handleOpenBankingApp = () => {
    // Attempt standard VietQR universal link / mobile banking scheme
    const deeplinkUrl = `https://dl.vietqr.io/pay?bank=${bankCode}&account=${bankAccountClean}&amount=${packageInfo.price}&memo=${encodeURIComponent(paymentCode)}`;
    window.open(deeplinkUrl, '_blank');
  };

  // Test Webhook Simulation Trigger
  const handleSimulateWebhook = async () => {
    setIsSimulatingWebhook(true);
    try {
      const res = await fetch('/api/payments/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentCode,
          amount: packageInfo.price
        })
      });
      const data = await res.json();
      if (data.success) {
        // Polling will detect in the next tick or update immediately
      }
    } catch (e) {
      console.error('Simulate webhook error:', e);
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  const handleCopy = (text: string, type: 'account' | 'code' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2000);
    } else if (type === 'amount') {
      setIsCopiedAmount(true);
      setTimeout(() => setIsCopiedAmount(false), 2000);
    } else {
      setIsCopiedAccount(true);
      setTimeout(() => setIsCopiedAccount(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      {/* Screen Safety Fixed Close Button */}
      <button
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
        title="Đóng cửa sổ"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Top Header - Mệnh Mộc Styling */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/50 rounded-2xl border border-emerald-400/30 shadow-inner">
              <Zap className="w-6 h-6 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                Thanh Toán Up Tin & Nâng Cấp VIP
                <span className="text-xs bg-emerald-500/40 text-emerald-200 px-2.5 py-0.5 rounded-full font-normal border border-emerald-400/30">
                  Mệnh Mộc Vượng Khí
                </span>
              </h3>
              <p className="text-xs text-emerald-100 line-clamp-1 mt-0.5">
                Bất động sản: <span className="font-semibold text-white">{property.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/50 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* DONATE MODE / PAYMENT OFF SCREEN */}
          {pricingConfig.paymentEnabled === false ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-teal-500/20 border-2 border-amber-500/50 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    🎁 CHẾ ĐỘ DONATE TÙY TÂM — PHỤC VỤ MIỄN PHÍ
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    100% MIỄN PHÍ UP TIN
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Hệ Thống Đang Mở Đăng Tin & Up-Tin Lên Top 1 Hoàn Toàn Miễn Phí!
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pricingConfig.donateMessage || 'Hệ thống BĐS 24h đang phục vụ cộng đồng hoàn toàn miễn phí. Bạn có thể nhấn nút đẩy tin lên TOP 1 ngay lập tức mà không cần nạp tiền.'}
                </p>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFreeDonatePush}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-600/30 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
                  {isSubmitting ? 'Đang thực thi Up Tin lên Top 1...' : '⚡ THỰC THI UP TIN LÊN TOP 1 NGAY (MIỄN PHÍ 100%)'}
                </button>
              </div>

              {/* OPTIONAL DONATE VIETQR CODE */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="text-center">
                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    ỦNG HỘ / DONATE TÙY TÂM DUY TRÌ SERVER (KHÔNG BẮT BUỘC)
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Nếu bạn hài lòng với dịch vụ, bạn có thể quét mã VietQR chuyển khoản tùy tâm để ủng hộ Admin duy trì máy chủ:
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2">
                  <img
                    src={`https://img.vietqr.io/image/${pricingConfig.bankName.includes('MSB') ? 'MSB' : 'Vietcombank'}-${pricingConfig.accountNumber}-compact2.png?amount=20000&addInfo=${encodeURIComponent('DONATE UNG HO SERVER HIEU BUI')}&accountName=${encodeURIComponent(pricingConfig.accountHolder)}`}
                    alt="VietQR Donate"
                    className="w-44 h-auto rounded-xl border border-white bg-white p-2 shadow-md"
                  />

                  <div className="space-y-2 text-xs">
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">NGÂN HÀNG:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{pricingConfig.bankName}</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-2">SỐ TÀI KHOẢN:</span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm block">{pricingConfig.accountNumber}</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-2">CHỦ TÀI KHOẢN:</span>
                      <span className="font-bold uppercase text-slate-800 dark:text-slate-200">{pricingConfig.accountHolder}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Payment Method Switcher */}
              <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setPayMethod('vietqr')}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    payMethod === 'vietqr'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> 💳 Chuyển Khoản Ngân Hàng VietQR
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('social_points')}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    payMethod === 'social_points'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-amber-600 dark:text-amber-400 hover:text-amber-500 bg-amber-500/10'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> 🎁 Up-Tin Bằng Điểm Social ({userPoints} Điểm)
                </button>
              </div>
            </>
          )}

          {/* MODE 1: Social Reward Points Mode */}
          {payMethod === 'social_points' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-emerald-500/15 border-2 border-amber-500/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      CHẾ ĐỘ UP-TIN BẰNG ĐIỂM THƯỞNG
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                      Đổi 1 Điểm Thưởng = 1 Lượt Up-Tin BĐS Lên Top 1
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block font-bold">Số điểm khả dụng:</span>
                    <span className="text-2xl font-black text-amber-500">{userPoints} Điểm</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Nhấn nút bên dưới để dùng <strong>1 Điểm Thưởng</strong> đẩy bất động sản <span className="font-bold text-amber-600">{property.title}</span> nhảy thẳng lên vị trí đầu tiên trang danh sách hoàn toàn miễn phí.
                </p>

                <button
                  type="button"
                  disabled={isSubmitting || userPoints < 1}
                  onClick={handleRedeemPointPush}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  {isSubmitting
                    ? 'Đang đổi điểm & Up tin...'
                    : userPoints >= 1
                    ? '⚡ ĐỔI 1 ĐIỂM BẤT ĐẦU UP TIN TOP 1 NGAY'
                    : '⚠️ BẠN CHƯA ĐỦ ĐIỂM - HÃY THEO DÕI KÊNH BÊN DƯỚI'}
                </button>
              </div>

              {/* Tasks to earn MORE points */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    NHIỆM VỤ THEO DÕI KÊNH ĐỂ TÍCH LŨY THÊM ĐIỂM (+5 ĐIỂM / KÊNH):
                  </h4>
                  <span className="text-[11px] text-emerald-600 font-bold">1 Điểm = 1 Lượt Up Tin</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sky-600 block">Zalo Official Account</span>
                      <span className="text-[10px] text-slate-500">Quan tâm Zalo OA Nhà đẹp Vinhomes</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimSocialTask('zalo', 5, 'https://zalo.me/')}
                      disabled={completedTasks.zalo}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                        completedTasks.zalo
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-sky-600 hover:bg-sky-700 text-white shadow'
                      }`}
                    >
                      {completedTasks.zalo ? '✓ Đã Nhận +5' : '+5 Điểm'}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-600 block">Fanpage Facebook</span>
                      <span className="text-[10px] text-slate-500">Like Fanpage Chợ Cư Dân 24h</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimSocialTask('facebook', 5, 'https://www.facebook.com/chocudan24h')}
                      disabled={completedTasks.facebook}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                        completedTasks.facebook
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                      }`}
                    >
                      {completedTasks.facebook ? '✓ Đã Nhận +5' : '+5 Điểm'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: VietQR Automated Payment */}
          {payMethod === 'vietqr' && paymentStep === 'select' && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
                  1. Chọn Gói Dịch Vụ Up Tin & Đẩy Top Bất Động Sản
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Gói 1: Single Push */}
                  <div
                    onClick={() => setSelectedType('single_push')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      selectedType === 'single_push'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> 1 Lượt Up Tin
                      </span>
                      <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                        {pricingConfig.singlePushPrice.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Up Tin Lên Đầu Ngay</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Đẩy tin lên Top 1 danh mục ngay lập tức.</p>
                  </div>

                  {/* Gói 2: Auto Push 5 */}
                  <div
                    onClick={() => setSelectedType('auto_push_5')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      selectedType === 'auto_push_5'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center gap-1">
                        🔄 Gói 5 Lượt
                      </span>
                      <span className="text-base font-extrabold text-teal-700 dark:text-teal-400">
                        {pricingConfig.autoPush5Price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Auto-Push 5 Lượt/Ngày</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tự động đẩy tin 5 khung giờ vàng trong ngày.</p>
                  </div>

                  {/* Gói 3: VIP Bạc */}
                  <div
                    onClick={() => setSelectedType('vip_silver')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      selectedType === 'vip_silver'
                        ? 'border-slate-500 bg-slate-50 dark:bg-slate-800/40 ring-2 ring-slate-400/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        🥈 VIP BẠC
                      </span>
                      <span className="text-base font-extrabold text-slate-700 dark:text-slate-300">
                        {(pricingConfig.vipSilverPriceDay * days).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tin Nổi Bật VIP Bạc</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nổi bật x3 so với tin thường.</p>
                  </div>

                  {/* Gói 4: VIP Vàng */}
                  <div
                    onClick={() => setSelectedType('vip_gold')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      selectedType === 'vip_gold'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        🥇 VIP VÀNG
                      </span>
                      <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                        {(pricingConfig.vipGoldPriceDay * days).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tin VIP Vàng Nổi Bật</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Khung viền Lục Bảo + Nhãn VIP Vàng nổi bật.</p>
                  </div>

                  {/* Gói 5: VIP Kim Cương */}
                  <div
                    onClick={() => setSelectedType('vip_diamond')}
                    className={`col-span-1 md:col-span-2 cursor-pointer p-4 rounded-2xl border transition-all ${
                      selectedType === 'vip_diamond'
                        ? 'border-purple-500 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-950/40 dark:to-blue-950/40 ring-2 ring-purple-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full badge-vip-diamond flex items-center gap-1">
                        <Crown className="w-3 h-3" /> 💎 VIP KIM CƯƠNG ĐỈNH CAO
                      </span>
                      <span className="text-lg font-black text-purple-700 dark:text-purple-300">
                        {(pricingConfig.vipDiamondPriceDay * days).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Ghim vị trí Top 1 ưu tiên tuyệt đối, hiển thị trên cả Trang chủ và Banner nổi bật.
                    </p>
                  </div>
                </div>
              </div>

              {/* Day Selector for VIP packages */}
              {['vip_silver', 'vip_gold', 'vip_diamond'].includes(selectedType) && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Thời gian duy trì VIP:</span>
                  <div className="flex items-center gap-2">
                    {[3, 7, 15, 30].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDays(d)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                          days === d
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        {d} Ngày
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium block">Tổng phí dịch vụ:</span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {packageInfo.price.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleProceedToQr}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
                >
                  <QrCode className="w-5 h-5" />
                  Tiếp Tục Chuyển Khoản VietQR
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Real Automated VietQR & Webhook Intermediary Detection */}
          {paymentStep === 'qr' && (
            <div className="space-y-6">
              
              {/* Header Badge */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-300 dark:border-emerald-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>CỔNG THANH TOÁN TỰ ĐỘNG INTERMEDIARY WEBHOOK (MSB / SEPAY / CASSO)</span>
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Mở App Ngân Hàng Hoặc Quét Mã Để Tự Động Kích Hoạt
                </h4>
              </div>

              {/* Main Grid: QR & Bank Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* VietQR Image Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="relative p-2 bg-white rounded-2xl shadow-md border border-slate-200">
                    <img
                      src={vietQrUrl}
                      alt="VietQR Transfer"
                      className="w-52 h-auto rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`STK:${pricingConfig.accountNumber}|ST:${packageInfo.price}|ND:${paymentCode}`)}`;
                      }}
                    />
                  </div>

                  {/* Primary Direct Banking Action */}
                  <button
                    type="button"
                    onClick={handleOpenBankingApp}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 animate-bounce" />
                    <span>Mở App Ngân Hàng Chuyển Khoản</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                    Hỗ trợ quét mã qua <strong>MB, Techcombank, VCB, MSB, VPBank, Momo, ZaloPay...</strong>
                  </p>
                </div>

                {/* Transfer Details with 1-Tap Copy */}
                <div className="space-y-3">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                    
                    {/* Bank */}
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Ngân hàng:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        {pricingConfig.bankName || 'MSB (Ngân hàng Hàng Hải)'}
                      </span>
                    </div>

                    {/* Account Number */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                          {pricingConfig.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(pricingConfig.accountNumber, 'account')}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                          title="Sao chép số tài khoản"
                        >
                          {isCopiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {isCopiedAccount && <p className="text-[10px] text-emerald-600 font-bold text-right">✓ Đã sao chép số tài khoản!</p>}

                    {/* Account Holder */}
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Chủ tài khoản:</span>
                      <span className="font-black text-slate-900 dark:text-slate-100 uppercase">
                        {pricingConfig.accountHolder}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-slate-500">Số tiền:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-emerald-600 dark:text-emerald-400">
                          {packageInfo.price.toLocaleString('vi-VN')} VNĐ
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(String(packageInfo.price), 'amount')}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                          title="Sao chép số tiền"
                        >
                          {isCopiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {isCopiedAmount && <p className="text-[10px] text-emerald-600 font-bold text-right">✓ Đã sao chép số tiền!</p>}

                    {/* Transfer Content */}
                    <div className="pt-2 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">Nội dung chuyển khoản (Bắt buộc):</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(paymentCode, 'code')}
                          className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold hover:bg-emerald-500 transition flex items-center gap-1 cursor-pointer"
                          title="Sao chép nội dung chuyển khoản"
                        >
                          {isCopiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopiedCode ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                      <div className="font-mono font-black text-base text-emerald-700 dark:text-emerald-300 tracking-wider bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-300 dark:border-emerald-700 text-center">
                        {paymentCode}
                      </div>
                    </div>
                  </div>

                  {/* REAL-TIME RADAR STATUS MONITOR (No manual button) */}
                  <div className="p-3.5 bg-emerald-950/10 dark:bg-emerald-950/30 rounded-2xl border-2 border-dashed border-emerald-500/50 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                        Đang lắng nghe biến động số dư từ Ngân hàng...
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      ⚡ Ngay khi bạn chuyển khoản thành công trên app ngân hàng, nền tảng trung gian sẽ gửi Webhook khớp lệnh và <strong>tự động chuyển trạng thái bài đăng lên Top 1 ngay lập tức</strong> mà không cần thao tác thêm.
                    </p>
                  </div>

                  {/* Secondary Actions & Back Button */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPaymentStep('select')}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition cursor-pointer"
                    >
                      ← Đổi gói khác
                    </button>

                    {/* Developer / Test Simulation Webhook Trigger */}
                    <button
                      type="button"
                      disabled={isSimulatingWebhook}
                      onClick={handleSimulateWebhook}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer bg-emerald-100/70 dark:bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700"
                      title="Mô phỏng Webhook ngân hàng bắn tín hiệu thành công"
                    >
                      {isSimulatingWebhook ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      <span>Mô Phỏng Webhook Khớp Lệnh</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Automated Success Screen */}
          {paymentStep === 'success' && (
            <div className="py-8 text-center space-y-4 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300">
                  ✓ GIAO DỊCH ĐÃ XÁC NHẬN TỰ ĐỘNG QUA WEBHOOK
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 pt-2">
                  Thanh Toán & Nâng Cấp Thành Công!
                </h3>
              </div>

              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 max-w-md mx-auto text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mã giao dịch:</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">{paymentCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Gói dịch vụ:</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-300">{packageInfo.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Số tiền đã nhận:</span>
                  <span className="font-black text-slate-900 dark:text-white">{packageInfo.price.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-slate-500">Trạng thái BĐS:</span>
                  <span className="font-black text-emerald-600 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-emerald-500" />
                    Đã đẩy lên TOP 1 Danh Mục
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bất động sản <strong className="text-emerald-600">{property.title}</strong> đang được hiển thị ưu tiên cao nhất trên toàn hệ thống.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirmedProperty && confirmedTransaction) {
                      onSuccessPush(confirmedProperty, confirmedTransaction);
                    } else {
                      onClose();
                    }
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
                >
                  Hoàn Tất & Xem Bài Đăng
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
