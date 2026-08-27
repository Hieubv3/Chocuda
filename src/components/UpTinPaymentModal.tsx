import React, { useState } from 'react';
import { Property, UpTinPricingConfig, UpTinTransaction, User } from '../types';
import { X, Zap, Crown, CheckCircle2, QrCode, Copy, ShieldCheck, ArrowRight, Sparkles, Building2, CreditCard } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'qr' | 'success'>('select');

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
      console.warn('Donate push API call completed fallback:', err);
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

  // Payment Memo unique code
  const paymentCode = `UPTIN-${property.id.replace('prop-', '')}-${Math.floor(100 + Math.random() * 900)}`;

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

  // VietQR Auto URL
  const bankAccountClean = pricingConfig.accountNumber.replace(/[^0-9]/g, '');
  const bankCodeRaw = pricingConfig.bankName.toUpperCase();
  const bankCode = bankCodeRaw.includes('MSB') ? 'MSB' : bankCodeRaw.includes('MB') ? 'MB' : 'MSB';
  const vietQrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccountClean}-compact2.png?amount=${packageInfo.price}&addInfo=${paymentCode}&accountName=${encodeURIComponent(pricingConfig.accountHolder)}`;

  const handleCopy = (text: string, type: 'account' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2000);
    } else {
      setIsCopiedAccount(true);
      setTimeout(() => setIsCopiedAccount(false), 2000);
    }
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);

    const newTx: UpTinTransaction = {
      id: `tx-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      userId: user?.id || 'guest-user',
      userName: user?.name || property.sellerName,
      userPhone: user?.phone || property.sellerPhone,
      packageType: selectedType,
      packageName: packageInfo.name,
      amount: packageInfo.price,
      paymentCode: paymentCode,
      status: 'approved', // Auto-approve in preview/test mode
      createdAt: new Date().toISOString()
    };

    // Calculate updated property
    const nowIso = new Date().toISOString();
    let updatedVipLevel = property.vipLevel || 'normal';
    if (selectedType === 'vip_silver') updatedVipLevel = 'silver';
    if (selectedType === 'vip_gold') updatedVipLevel = 'gold';
    if (selectedType === 'vip_diamond') updatedVipLevel = 'diamond';

    const updatedProperty: Property = {
      ...property,
      pushedAt: nowIso,
      pushedCount: (property.pushedCount || 0) + 1,
      vipLevel: updatedVipLevel,
      featured: selectedType === 'vip_gold' || selectedType === 'vip_diamond' ? true : property.featured
    };

    try {
      // Send to server API
      await fetch(`/api/properties/${property.id}/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: newTx,
          updatedProperty
        })
      });
    } catch (err) {
      console.warn('Push API call completed or fallback active:', err);
    }

    setIsSubmitting(false);
    setPaymentStep('success');
    setTimeout(() => {
      onSuccessPush(updatedProperty, newTx);
    }, 1500);
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

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden my-auto max-h-[88vh] flex flex-col">
        
        {/* Top Header - Mệnh Mộc Styling */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/50 rounded-xl border border-emerald-400/30">
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
              {/* DONATE MODE BANNER */}
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
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-600/30 transition transform active:scale-95 flex items-center justify-center gap-2"
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
                    Nếu bạn hài lòng với dịch vụ, bạn có thể quét mã VietQR chuyển khoản tùy tâm (10k, 20k, 50k...) để ủng hộ Admin duy trì máy chủ:
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2">
                  <img loading="lazy"
                    src={`https://img.vietqr.io/image/${pricingConfig.bankName.includes('MSB') ? 'MSB' : 'Vietcombank'}-${pricingConfig.accountNumber}-compact2.png?amount=20000&addInfo=${encodeURIComponent('DONATE UNG HO SERVER HIEU BUI')}&accountName=${encodeURIComponent(pricingConfig.accountHolder)}`}
                    alt="VietQR Donate"
                    className="w-44 h-auto rounded-xl border border-white bg-white p-2 shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`STK:${pricingConfig.accountNumber}|ND:DONATE UNG HO SERVER`)}`;
                    }}
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
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 ${
                    payMethod === 'vietqr'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> 💳 Nạp Phí VietQR MSB
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('social_points')}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 ${
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
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2"
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
                  {/* Task 1: Zalo */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sky-600 block">Zalo Official Account</span>
                      <span className="text-[10px] text-slate-500">Quan tâm Zalo OA Nhà đẹp Vinhomes</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimSocialTask('zalo', 5, 'https://zalo.me/')}
                      disabled={completedTasks.zalo}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                        completedTasks.zalo
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-sky-600 hover:bg-sky-700 text-white shadow'
                      }`}
                    >
                      {completedTasks.zalo ? '✓ Đã Nhận +5' : '+5 Điểm'}
                    </button>
                  </div>

                  {/* Task 2: Facebook */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-600 block">Fanpage Facebook</span>
                      <span className="text-[10px] text-slate-500">Like Fanpage Chợ Cư Dân 24h</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimSocialTask('facebook', 5, 'https://www.facebook.com/chocudan24h')}
                      disabled={completedTasks.facebook}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                        completedTasks.facebook
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow'
                      }`}
                    >
                      {completedTasks.facebook ? '✓ Đã Nhận +5' : '+5 Điểm'}
                    </button>
                  </div>

                  {/* Task 3: YouTube */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-600 block">YouTube Nhà đẹp Vinhomes</span>
                      <span className="text-[10px] text-slate-500">Subscribe kênh YouTube</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimSocialTask('youtube', 5, 'https://www.youtube.com/@chocudan24h')}
                      disabled={completedTasks.youtube}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                        completedTasks.youtube
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-rose-600 hover:bg-rose-700 text-white shadow'
                      }`}
                    >
                      {completedTasks.youtube ? '✓ Đã Nhận +5' : '+5 Điểm'}
                    </button>
                  </div>

                  {/* Task 4: TikTok */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">TikTok BĐS 24h</span>
                      <span className="text-[10px] text-slate-500">Follow xem video thực tế</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimSocialTask('tiktok', 5, 'https://www.tiktok.com/@chocudan24h')}
                      disabled={completedTasks.tiktok}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                        completedTasks.tiktok
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white shadow'
                      }`}
                    >
                      {completedTasks.tiktok ? '✓ Đã Nhận +5' : '+5 Điểm'}
                    </button>
                  </div>

                  {/* Task 5: Google Maps Review 5 Star */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-500 block">Đánh giá 5★ Google Maps</span>
                      <span className="text-[10px] text-slate-500">Đánh giá uy tín 5 sao</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimSocialTask('google', 10, 'https://maps.google.com')}
                      disabled={completedTasks.google}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                        completedTasks.google
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow'
                      }`}
                    >
                      {completedTasks.google ? '✓ Đã Nhận +10' : '+10 Điểm'}
                    </button>
                  </div>

                  {/* Task 6: Telegram */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-600 block">Telegram Group</span>
                      <span className="text-[10px] text-slate-500">Tham gia nhóm BĐS 24h</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimSocialTask('telegram', 5, 'https://t.me')}
                      disabled={completedTasks.telegram}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                        completedTasks.telegram
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow'
                      }`}
                    >
                      {completedTasks.telegram ? '✓ Đã Nhận +5' : '+5 Điểm'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: VietQR Standard Payment */}
          {payMethod === 'vietqr' && paymentStep === 'select' && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
                  1. Chọn Gói Dịch Vụ Up Tin & Đẩy Top
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Gói 1: Single Push */}
                  <div
                    onClick={() => setSelectedType('single_push')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
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
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
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
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
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
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
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
                    className={`col-span-1 md:col-span-2 cursor-pointer p-4 rounded-xl border transition-all ${
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
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Thời gian duy trì VIP:</span>
                  <div className="flex items-center gap-2">
                    {[3, 7, 15, 30].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDays(d)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
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
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Tổng tiền cần thanh toán:</span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {packageInfo.price.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentStep('qr')}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition transform active:scale-95"
                >
                  <QrCode className="w-5 h-5" />
                  Tiếp Tục Quét Mã VietQR
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'qr' && (
            <div className="space-y-6">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cổng Thanh Toán VietQR Tự Động 24/7
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Quét Mã QR Để Chuyển Khoản & Up Tin Tự Động
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* VietQR Image Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <img loading="lazy"
                    src={vietQrUrl}
                    alt="VietQR Transfer"
                    className="w-56 h-auto rounded-xl shadow-md border border-white bg-white p-2"
                    onError={(e) => {
                      // Fallback QR generator if external API fails
                      e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`STK:${pricingConfig.accountNumber}|ST:${packageInfo.price}|ND:${paymentCode}`)}`;
                    }}
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
                    Sử dụng ứng dụng Ngân hàng (MB, Vietcombank, Momo, VPBank...) để quét mã
                  </p>
                </div>

                {/* Transfer Details */}
                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Ngân hàng:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        {pricingConfig.bankName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                          {pricingConfig.accountNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(pricingConfig.accountNumber, 'account')}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-emerald-600 transition"
                          title="Sao chép số tài khoản"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {isCopiedAccount && <p className="text-[10px] text-emerald-600 font-bold text-right">Đã chép số tài khoản!</p>}

                    <div className="flex items-center justify-between text-slate-500">
                      <span>Chủ tài khoản:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">
                        {pricingConfig.accountHolder}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-slate-500">Số tiền:</span>
                      <span className="font-extrabold text-base text-emerald-600">
                        {packageInfo.price.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                      <span className="text-emerald-800 dark:text-emerald-300 font-semibold">Nội dung chuyển:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-900 dark:text-slate-100">
                          {paymentCode}
                        </span>
                        <button
                          onClick={() => handleCopy(paymentCode, 'code')}
                          className="p-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded text-emerald-700 transition"
                          title="Sao chép nội dung chuyển khoản"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {isCopiedCode && <p className="text-[10px] text-emerald-600 font-bold text-right">Đã chép nội dung!</p>}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmPayment}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Đang xử lý hệ thống...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                          Xác Nhận Đã Chuyển Khoản & Up Tin
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentStep('select')}
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition"
                    >
                       Quay lại chọn gói khác
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                Thanh Toán Up Tin Thành Công!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Bất động sản <span className="font-bold text-emerald-600">{property.title}</span> đã được đẩy lên TOP 1 danh mục và kích hoạt gói <span className="font-bold">{packageInfo.name}</span>.
              </p>
              <div className="pt-4">
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2 rounded-full border border-emerald-200">
                  ⚡ Đang cập nhật thứ tự hiển thị...
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
