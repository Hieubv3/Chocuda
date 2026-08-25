import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Copy, Check, ShieldCheck, Zap, RefreshCw, Send, 
  ExternalLink, AlertCircle, CheckCircle2, Terminal, ArrowRight, 
  Building2, Hash, DollarSign, Clock, HelpCircle, Eye, Trash2, Smartphone
} from 'lucide-react';

interface BankWebhookLog {
  id: string;
  receivedAt: string;
  gateway: string;
  transferType: string;
  amount: number;
  content: string;
  accountNumber?: string;
  referenceCode?: string;
  matchedStatus: 'matched' | 'no_match' | 'ignored';
  matchedType?: 'bds_uptin' | 'store_package' | 'store_order' | 'tech_escrow';
  matchedTitle?: string;
  rawPayload: any;
}

interface AdminBankWebhookCenterProps {
  onRefreshData?: () => void;
}

export const AdminBankWebhookCenter: React.FC<AdminBankWebhookCenterProps> = ({ onRefreshData }) => {
  const officialDomainWebhook = 'https://chocudan24h.com/api/webhook/sepay';
  const currentOriginWebhook = `${window.location.origin}/api/webhook/sepay`;
  
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(false);

  // Bank & SePay Configuration State
  const [bankName, setBankName] = useState('MSB (Ngân hàng Hàng Hải Việt Nam)');
  const [accountNumber, setAccountNumber] = useState('3028031988');
  const [accountHolder, setAccountHolder] = useState('BUI VAN HIEU');
  const [sepayApiKey, setSepayApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Webhook Logs State
  const [logs, setLogs] = useState<BankWebhookLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState<BankWebhookLog | null>(null);

  // Test Simulator State
  const [testCode, setTestCode] = useState('UPTIN 84920 VIP');
  const [testAmount, setTestAmount] = useState('50000');
  const [testBank, setTestBank] = useState('MSB');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load config & logs on mount
  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/pricing/config');
      if (res.ok) {
        const data = await res.json();
        if (data.bankName) setBankName(data.bankName);
        if (data.accountNumber) setAccountNumber(data.accountNumber);
        if (data.accountHolder) setAccountHolder(data.accountHolder);
        if (data.sepayApiKey) setSepayApiKey(data.sepayApiKey);
        if (data.webhookSecret) setWebhookSecret(data.webhookSecret);
        if (data.autoApprove !== undefined) setAutoApprove(data.autoApprove);
      }
    } catch (e) {
      console.warn('Could not load bank config:', e);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/webhook/logs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setLogs(data);
      }
    } catch (e) {
      console.warn('Could not load webhook logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setSaveSuccessMsg('');
    try {
      const res = await fetch('/api/pricing/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName,
          accountNumber,
          accountHolder,
          sepayApiKey,
          webhookSecret,
          autoApprove
        })
      });
      if (res.ok) {
        setSaveSuccessMsg('✓ Đã lưu cấu hình Ngân Hàng & SePay thành công!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      alert('Không thể lưu cấu hình. Vui lòng kiểm tra lại!');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!testCode.trim()) {
      alert('Vui lòng nhập mã thanh toán hoặc nội dung giao dịch chuyển khoản.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const payload = {
        id: Date.now(),
        gateway: testBank,
        transactionDate: new Date().toISOString(),
        accountNumber: accountNumber || '3028031988',
        code: testCode,
        content: testCode,
        description: testCode,
        transferType: 'in',
        transferAmount: Number(testAmount) || 50000,
        accumulated: 5000000,
        referenceCode: `SIM-${Date.now()}`
      };

      const res = await fetch('/api/webhook/sepay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Mô phỏng thành công! Hệ thống đã khớp lệnh và kích hoạt dịch vụ.'
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || data.error || 'Webhook đã nhận nhưng không tìm thấy đơn hàng trùng mã.'
        });
      }
      fetchLogs();
      if (onRefreshData) onRefreshData();
    } catch (e) {
      setTestResult({
        success: false,
        message: 'Lỗi khi gửi webhook mô phỏng.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử Webhook SePay đã ghi nhận?')) return;
    try {
      await fetch('/api/webhook/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (e) {}
  };

  const copyToClipboard = (text: string, type: 'domain' | 'origin' | 'format') => {
    navigator.clipboard.writeText(text);
    if (type === 'domain') {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } else if (type === 'origin') {
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    } else {
      setCopiedFormat(true);
      setTimeout(() => setCopiedFormat(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white">
      {/* Top Banner Status Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none pr-6">
          <Zap className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
            <span>CỔNG THANH TOÁN TỰ ĐỘNG SEPAY & VIETQR 24/7</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Webhook Tự Động Nhận Biến Động Số Dư Ngân Hàng
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Hệ thống tự động lắng nghe Webhook từ <strong>SePay / MB / MSB / Vietcombank</strong>, phân tích nội dung chuyển khoản và tự động nâng cấp VIP, Đẩy Tin BĐS, Kích hoạt Gói Gian Hàng & Ký quỹ Thợ trong vòng <strong>1 giây</strong>.
          </p>
        </div>
      </div>

      {/* 1. Main Webhook URLs Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-lg space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              🔗
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider">
                ĐỊA CHỈ WEBHOOK DÁN VÀO SEPAY
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sao chép địa chỉ này và dán vào mục <strong>Tích Hợp Webhooks</strong> trên bảng điều khiển SePay (my.sepay.vn)
              </p>
            </div>
          </div>
          <a
            href="https://my.sepay.vn"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <span>Mở SePay</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Official Domain Webhook URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span>🌐 1. Webhook Tên Miền Chính Thức (Khuyên Dùng):</span>
              <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Chính thức
              </span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm px-4 py-3 rounded-2xl border border-emerald-500/30 overflow-x-auto select-all shadow-inner">
              {officialDomainWebhook}
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(officialDomainWebhook, 'domain')}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
            >
              {copiedDomain ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedDomain ? 'ĐÃ CHÉP' : 'SAO CHÉP'}</span>
            </button>
          </div>
        </div>

        {/* Current Origin Fallback Webhook */}
        <div className="space-y-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span>⚡ 2. Webhook Máy Chủ Preview / Dev (Dùng khi đang test thử nghiệm):</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-[11px] sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto select-all">
              {currentOriginWebhook}
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(currentOriginWebhook, 'origin')}
              className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedOrigin ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOrigin ? 'Đã Chép' : 'Chép'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Step-by-Step SePay Setup Guide */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-500" /> HƯỚNG DẪN 3 BƯỚC DÁN VÀO SEPAY (`my.sepay.vn`)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Đăng Nhập & Tạo Webhook</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Truy cập <strong>my.sepay.vn</strong> ➔ Vào menu <strong>Tích Hợp Webhooks</strong> ➔ Bấm <strong>Tạo Webhook Mới</strong>.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Điền Thông Số Webhook</h4>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 font-mono">
              <div>• URL: <span className="text-emerald-600 dark:text-emerald-400 font-bold">chocudan24h.com/api/webhook/sepay</span></div>
              <div>• Method: <span className="text-amber-600 font-bold">POST</span></div>
              <div>• Data Type: <span className="text-blue-600 font-bold">JSON</span></div>
              <div>• Sự kiện: <strong>Tiền vào (Giao dịch nhận tiền)</strong></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Lưu & Bấm Test Webhook</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Nhấn <strong>Lưu lại</strong>, sau đó nhấn nút <strong>"Gửi Thử Nghiệm"</strong> trên SePay. Khi hiện mã <code className="text-emerald-600 font-bold">200 OK</code> là hoàn tất 100%!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Bank Account & VietQR Settings Form */}
        <form onSubmit={handleSaveConfig} className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                TÀI KHOẢN NGÂN HÀNG TẠO MÃ VIETQR
              </h3>
            </div>
            {saveSuccessMsg && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                {saveSuccessMsg}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Tên Ngân Hàng
              </label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="VD: MSB (Ngân hàng Hàng Hải Việt Nam) hoặc MBBank, Vietcombank..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Số Tài Khoản (STK)
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="VD: 3028031988"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Tên Chủ Tài Khoản (IN HOA)
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={e => setAccountHolder(e.target.value.toUpperCase())}
                  placeholder="VD: BUI VAN HIEU"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  SePay API Token (Tùy chọn)
                </label>
                <input
                  type="password"
                  value={sepayApiKey}
                  onChange={e => setSepayApiKey(e.target.value)}
                  placeholder="Để trống nếu không dùng xác thực"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={e => setAutoApprove(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    ⚡ Tự động duyệt ngay khi tiền vào
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSavingConfig}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSavingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>LƯU CẤU HÌNH NGÂN HÀNG & SEPAY</span>
            </button>
          </div>
        </form>

        {/* 4. Test Webhook Simulator */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                MÔ PHỎNG & BẮN THỬ WEBHOOK SEPAY
              </h3>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md">
              Test Simulator
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Dùng công cụ này để kiểm tra xem hệ thống có tự động bắt mã đơn hàng và nâng cấp tài khoản ngay lập tức mà không cần chuyển khoản thật.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Nội dung chuyển khoản mô phỏng (Chứa mã thanh toán)
              </label>
              <input
                type="text"
                value={testCode}
                onChange={e => setTestCode(e.target.value)}
                placeholder="VD: UPTIN 84920 VIP hoặc ORD-1029..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Số tiền chuyển (VNĐ)
                </label>
                <input
                  type="number"
                  value={testAmount}
                  onChange={e => setTestAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Ngân hàng gửi
                </label>
                <select
                  value={testBank}
                  onChange={e => setTestBank(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="MSB">MSB</option>
                  <option value="MBBank">MBBank</option>
                  <option value="Vietcombank">Vietcombank</option>
                  <option value="Techcombank">Techcombank</option>
                  <option value="VPBank">VPBank</option>
                  <option value="ACB">ACB</option>
                </select>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-2xl text-xs font-bold flex items-start gap-2 ${
                testResult.success 
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />}
                <div>{testResult.message}</div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSimulateWebhook}
              disabled={isTesting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>BẮN THỬ WEBHOOK SEPAY NGAY</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Live Bank Webhook Logs */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>NHẬT KÝ BIẾN ĐỘNG SỐ DƯ TỪ SEPAY (LIVE WEBHOOK LOGS)</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Ghi nhận tất cả các giao dịch SePay đã bắn về máy chủ theo thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchLogs}
              disabled={isLoadingLogs}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              <span>Làm mới ({logs.length})</span>
            </button>

            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Log</span>
              </button>
            )}
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mx-auto text-xl">
              📥
            </div>
            <p className="font-bold">Chưa có giao dịch webhook nào được gửi đến.</p>
            <p className="text-[11px] text-slate-500">
              Bạn có thể bấm <strong>"Bắn Thử Webhook SePay Ngay"</strong> ở khung bên trên để test thử nghiệm.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold text-[11px]">
                  <th className="pb-2 px-3">Thời Gian</th>
                  <th className="pb-2 px-3">Ngân Hàng</th>
                  <th className="pb-2 px-3">Số Tiền</th>
                  <th className="pb-2 px-3">Nội Dung Chuyển Khoản</th>
                  <th className="pb-2 px-3">Mã GD / Khớp Lệnh</th>
                  <th className="pb-2 px-3 text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.receivedAt).toLocaleTimeString('vi-VN')} {new Date(log.receivedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-3 font-bold whitespace-nowrap">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[10px] text-slate-800 dark:text-slate-200">
                        {log.gateway || 'Bank'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      +{log.amount?.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] max-w-xs truncate text-slate-800 dark:text-slate-200" title={log.content}>
                      {log.content}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {log.matchedStatus === 'matched' ? (
                        <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ĐÃ KHỚP ({log.matchedType || 'Đơn'})
                        </span>
                      ) : (
                        <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Chưa khớp mã
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                      >
                        JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raw Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 text-white shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="font-black text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> CHI TIẾT GÓI TIN WEBHOOK SEPAY (RAW JSON)
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] bg-slate-950 p-4 rounded-2xl border border-slate-800 text-emerald-300 select-all">
              <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
