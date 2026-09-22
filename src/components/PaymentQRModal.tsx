import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Copy, ShieldCheck, CheckCircle2, Building2, Loader2, Sparkles } from 'lucide-react';

interface PaymentQRModalProps {
  open: boolean;
  onClose: () => void;
  // Payment details
  title: string;          // e.g. "Nạp Ví Chợ Cư Dân 24h"
  description?: string;   // short description of what is being paid for
  amount: number;         // amount in VND
  type: 'wallet_deposit' | 'package' | 'up_tin' | 'service' | 'other';
  metadata?: Record<string, any>;
  userId?: string;
  userName?: string;
  userPhone?: string;
  // Called when the payment is confirmed (order approved)
  onSuccess?: (order: any) => void;
}

/**
 * Generic VietQR payment modal with SePay auto-verification.
 * Creates a pending payment order server-side, shows the VietQR code + transfer
 * details, and polls the order status until SePay confirms the transfer.
 * Works for ALL payment types (wallet deposit, package, up-tin, service...).
 */
export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  open,
  onClose,
  title,
  description,
  amount,
  type,
  metadata = {},
  userId = 'guest-user',
  userName = '',
  userPhone = '',
  onSuccess
}) => {
  const [order, setOrder] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [paymentCode, setPaymentCode] = useState<string>('');
  const [bank, setBank] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedAccount, setIsCopiedAccount] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const pollTimer = useRef<any>(null);

  // Create the payment order when the modal opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const createOrder = async () => {
      setIsCreating(true);
      setError('');
      setSuccess(false);
      setOrder(null);
      try {
        const res = await fetch('/api/payment/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            amount,
            userId,
            userName,
            userPhone,
            metadata
          })
        });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error || 'Không thể tạo đơn thanh toán.');
          return;
        }
        if (!cancelled) {
          setOrder(data.order);
          setQrUrl(data.qrUrl);
          setPaymentCode(data.order.paymentCode);
          setBank(data.bank);
        }
      } catch (err) {
        console.error('Error creating payment order:', err);
        if (!cancelled) setError('Không thể kết nối đến máy chủ để tạo đơn thanh toán.');
      } finally {
        if (!cancelled) setIsCreating(false);
      }
    };

    createOrder();
    return () => {
      cancelled = true;
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [open, type, amount, userId, userName, userPhone, JSON.stringify(metadata)]);

  const handleCopy = (text: string, kind: 'account' | 'code') => {
    navigator.clipboard.writeText(text);
    if (kind === 'code') {
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2000);
    } else {
      setIsCopiedAccount(true);
      setTimeout(() => setIsCopiedAccount(false), 2000);
    }
  };

  const startPolling = () => {
    if (!order) return;
    setIsPolling(true);
    setError('');

    const poll = async () => {
      try {
        const res = await fetch(`/api/payment/orders/${order.id}`);
        const data = await res.json();
        if (res.ok && data.order) {
          if (data.order.status === 'approved') {
            if (pollTimer.current) clearInterval(pollTimer.current);
            setIsPolling(false);
            setSuccess(true);
            if (onSuccess) onSuccess(data.order);
            return;
          }
          if (data.order.status === 'rejected') {
            if (pollTimer.current) clearInterval(pollTimer.current);
            setIsPolling(false);
            setError('Đơn thanh toán đã bị từ chối. Vui lòng liên hệ hỗ trợ.');
            return;
          }
        }
      } catch (err) {
        console.warn('Poll error (will retry):', err);
      }
    };

    poll();
    pollTimer.current = setInterval(poll, 4000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <button
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] p-2.5 bg-ink-900/90 hover:bg-ink-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
        title="Đóng cửa sổ"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="relative w-full max-w-2xl bg-white dark:bg-ink-900 rounded-2xl shadow-2xl border border-brand-500/20 overflow-hidden my-auto max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-800 via-brand-700 to-teal-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-600/50 rounded-xl border border-brand-400/30">
              <QrCode className="w-6 h-6 text-brand-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              {description && (
                <p className="text-xs text-brand-100 line-clamp-1 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brand-200 hover:text-white hover:bg-brand-700/50 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isCreating && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-ink-700 dark:text-ink-300">Đang tạo mã QR thanh toán...</p>
            </div>
          )}

          {error && !isCreating && (
            <div className="py-8 text-center space-y-4">
              <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-ink-200 dark:bg-ink-800 text-ink-700 dark:text-ink-300 font-bold rounded-xl"
              >
                Đóng
              </button>
            </div>
          )}

          {!isCreating && !error && success && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-ink-900 dark:text-ink-100">
                Thanh Toán Thành Công!
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-400 max-w-md mx-auto">
                Giao dịch <span className="font-bold text-brand-600">{amount.toLocaleString('vi-VN')} VNĐ</span> đã được xác nhận tự động.
              </p>
              <div className="pt-4">
                <span className="text-xs text-brand-600 font-bold bg-brand-50 dark:bg-brand-950/60 px-4 py-2 rounded-full border border-brand-200">
                   Đã cập nhật tài khoản của bạn
                </span>
              </div>
            </div>
          )}

          {!isCreating && !error && !success && order && (
            <div className="space-y-6">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-100 dark:bg-brand-900/50 text-brand-800 dark:text-brand-300 text-xs font-bold rounded-full mb-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600" /> Cổng Thanh Toán VietQR Tự Động 24/7
                </span>
                <h4 className="text-base font-bold text-ink-900 dark:text-ink-100">
                  Quét Mã QR Để Chuyển Khoản & Xác Nhận Tự Động
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* VietQR Image */}
                <div className="flex flex-col items-center justify-center p-4 bg-ink-50 dark:bg-ink-800/60 rounded-2xl border border-ink-200 dark:border-ink-700">
                  <img
                    loading="lazy"
                    src={qrUrl}
                    alt="VietQR Transfer"
                    className="w-56 h-auto rounded-xl shadow-md border border-white bg-white p-2"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`STK:${bank?.accountNumber || ''}|ST:${amount}|ND:${paymentCode}`)}`;
                    }}
                  />
                  <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-2 text-center">
                    Sử dụng ứng dụng Ngân hàng (MB, Vietcombank, Momo, VPBank...) để quét mã
                  </p>
                </div>

                {/* Transfer Details */}
                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-ink-800 rounded-xl border border-ink-200 dark:border-ink-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-ink-500">
                      <span>Ngân hàng:</span>
                      <span className="font-bold text-ink-900 dark:text-ink-100 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-brand-600" />
                        {bank?.bankName || ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-ink-500">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-brand-700 dark:text-brand-400">
                          {bank?.accountNumber || ''}
                        </span>
                        <button
                          onClick={() => handleCopy(bank?.accountNumber || '', 'account')}
                          className="p-1 hover:bg-ink-100 dark:hover:bg-ink-700 rounded text-ink-500 hover:text-brand-600 transition"
                          title="Sao chép số tài khoản"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {isCopiedAccount && <p className="text-[10px] text-brand-600 font-bold text-right">Đã chép số tài khoản!</p>}

                    <div className="flex items-center justify-between text-ink-500">
                      <span>Chủ tài khoản:</span>
                      <span className="font-bold text-ink-900 dark:text-ink-100 uppercase">
                        {bank?.accountHolder || ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-ink-100 dark:border-ink-700/60">
                      <span className="text-ink-500">Số tiền:</span>
                      <span className="font-extrabold text-base text-brand-600">
                        {amount.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 bg-brand-50 dark:bg-brand-950/40 p-2 rounded-lg border border-brand-200 dark:border-brand-900/40">
                      <span className="text-brand-800 dark:text-brand-300 font-semibold">Nội dung chuyển:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-ink-900 dark:text-ink-100">
                          {paymentCode}
                        </span>
                        <button
                          onClick={() => handleCopy(paymentCode, 'code')}
                          className="p-1 hover:bg-brand-200 dark:hover:bg-brand-800 rounded text-brand-700 transition"
                          title="Sao chép nội dung chuyển khoản"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {isCopiedCode && <p className="text-[10px] text-brand-600 font-bold text-right">Đã chép nội dung!</p>}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    {isPolling ? (
                      <div className="w-full py-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-300 dark:border-brand-800 text-brand-800 dark:text-brand-300 font-bold text-sm rounded-xl flex items-center justify-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        Đang chờ hệ thống xác nhận thanh toán...
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startPolling}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle2 className="w-5 h-5 text-brand-200" />
                        Tôi Đã Chuyển Khoản — Chờ Xác Nhận Tự Động
                      </button>
                    )}

                    {error && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold text-center">
                        {error}
                      </p>
                    )}

                    <p className="text-[11px] text-ink-500 dark:text-ink-400 text-center leading-relaxed">
                      Sau khi bạn chuyển khoản, hệ thống <strong>tự động xác nhận</strong> qua SePay trong vòng 15-30 giây. Vui lòng giữ nguyên nội dung chuyển khoản <span className="font-mono font-bold text-brand-600">{paymentCode}</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
