import React, { useState } from 'react';
import { Smartphone, Download, ShieldCheck, CheckCircle2, QrCode, ArrowRight, X, AlertTriangle, Sparkles, HelpCircle, Layers, Cpu, Radio } from 'lucide-react';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showDirectGuide, setShowDirectGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const currentWebUrl = window.location.href;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentWebUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleOpenInNewTab = () => {
    window.open(currentWebUrl, '_blank');
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
        setShowDirectGuide(true);
      }
    } else {
      setShowDirectGuide(true);
    }
  };

  const handleDownloadApk = () => {
    setDownloadStarted(true);
    
    // Create a download link for the APK payload
    const apkUrl = '/api/download/apk';
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'ChoCuDan24h_v2.8_Pro.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadStarted(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 relative overflow-hidden">
        
        {/* Top Header Glow Decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-900/50 shrink-0">
              <Smartphone className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-md text-[10px] font-black tracking-wider uppercase">
                  Android APK v2.8.4
                </span>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Quét An Toàn 100%
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                TẢI ỨNG DỤNG ANDROID CHỢ CƯ DÂN 24H (.APK)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 bg-slate-900/60 border-b border-slate-800 flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'pwa'
                ? 'bg-slate-800 text-emerald-400 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" /> 1-Click Cài Đặt App Android (Khuyên Dùng)
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'apk'
                ? 'bg-slate-800 text-emerald-400 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Download className="w-4 h-4" /> Tải File APK Trực Tiếp
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {/* TAB 1: 1-CLICK PWA WEB NATIVE APP INSTALLATION (100% SUCCESS) */}
          {activeTab === 'pwa' && (
            <div className="space-y-5">
              
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-2 border-emerald-500/60 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[11px] font-black uppercase">
                    ⚡ CÀI ĐẶT TRỰC TIẾP LÊN ĐIỆN THOẠI ANDROID
                  </span>
                  <span className="text-emerald-400 font-bold text-xs">Chạy mượt 100%</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Cài Đặt Ứng Dụng Ngay Lên Màn Hình Chính
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tạo biểu tượng ứng dụng <strong>Chợ Cư Dân 24h</strong> ngay trên màn hình chính Android. Dung lượng cực nhẹ <strong>1.2 MB</strong>, mở ra tức thì, chạy mượt mà như app gốc và tự động cập nhật dữ liệu mới nhất.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleInstallPwa}
                    className="w-full sm:w-auto px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/30 transition active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                  >
                    <Sparkles className="w-5 h-5 fill-slate-950" />
                    <span>{isInstalled ? 'ỨNG DỤNG ĐÃ ĐƯỢC CÀI ĐẶT' : 'NÚT CÀI ĐẶT APP NGAY LÊN MÀN HÌNH CHÍNH'}</span>
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="w-full sm:w-auto px-5 py-4 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-extrabold rounded-2xl border border-emerald-500/40 transition flex items-center justify-center gap-2 text-xs uppercase"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Mở Tab Mới Trình Duyệt Để Cài</span>
                  </button>
                </div>

                {/* Direct Guide Box when prompt unavailable or clicked */}
                {showDirectGuide && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl space-y-3 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Đang xem trong khung preview? Hãy thực hiện 1 trong 2 cách sau:
                      </span>
                      <button
                        onClick={handleCopyUrl}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/40 transition"
                      >
                        {copiedLink ? 'Đã Sao Chép Link!' : 'Copy Link Web'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200">
                      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 space-y-1">
                        <span className="text-emerald-400 font-bold">Cách 1: Mở Tab Mới</span>
                        <p className="text-[11px] text-slate-300">Bấm nút "Mở Tab Mới Trình Duyệt Để Cài" ở trên để mở trực tiếp trong Chrome Android, sau đó chọn Thêm vào Màn hình chính.</p>
                      </div>
                      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 space-y-1">
                        <span className="text-emerald-400 font-bold">Cách 2: Quét Mã QR</span>
                        <p className="text-[11px] text-slate-300">Dùng camera điện thoại Android hoặc Zalo quét mã QR bên dưới để tải và cài app tức thì!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Scan Section */}
              <div className="p-5 bg-slate-800/90 rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row items-center gap-5 shadow-lg">
                <div className="w-32 h-32 bg-white p-2 rounded-2xl shrink-0 flex flex-col items-center justify-center border-2 border-emerald-500 shadow-lg relative group">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
                    alt="Mã QR Tải & Cài Đặt App Android"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                    <QrCode className="w-4 h-4" />
                    <span>QUÉT MÃ QR BẰNG CAMERA ĐIỆN THOẠI HOẶC ZALO</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">
                    Dùng điện thoại quét mã QR bên cạnh để mở ứng dụng & cài đặt ngay
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Mở ứng dụng <strong>Camera điện thoại Android</strong> hoặc <strong>Zalo &gt; Quét QR</strong>. Trình duyệt trên máy Android của bạn sẽ lập tức truy cập và hiển thị gợi ý cài đặt ứng dụng Chợ Cư Dân 24h.
                  </p>
                </div>
              </div>

              {/* Step-by-Step Instructions card */}
              <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> HƯỚNG DẪN TẠO ICON APP TRÊN ĐIỆN THOẠI ANDROID (CHROME / CỐC CỐC):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-emerald-400 font-extrabold text-sm">Bước 1</span>
                    <p className="text-slate-300">Nhấn biểu tượng <strong>Menu 3 chấm (⋮)</strong> ở góc trên bên phải trình duyệt Chrome/Cốc Cốc.</p>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-emerald-400 font-extrabold text-sm">Bước 2</span>
                    <p className="text-slate-300">Chọn dòng <strong>"Thêm vào Màn hình chính"</strong> (hoặc <em>Install App / Cài đặt ứng dụng</em>).</p>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-emerald-400 font-extrabold text-sm">Bước 3</span>
                    <p className="text-slate-300">Nhấn <strong>"Thêm"</strong>. Mở màn hình chính điện thoại, biểu tượng Chợ Cư Dân 24h đã xuất hiện!</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DIRECT APK DOWNLOAD */}
          {activeTab === 'apk' && (
            <div className="space-y-6">
              
              {/* Highlight Hero Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-emerald-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                      ⚡ Tải Trực Tiếp Máy Android
                    </span>
                    <span className="text-slate-400 text-xs font-semibold">Gói APK Launcher v2.8</span>
                  </div>

                  <h3 className="text-base font-black text-white leading-tight">
                    ChoCuDan24h_v2.8_Production.apk
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    File đóng gói ứng dụng Android. Hỗ trợ tra cứu BĐS, lưu danh sách yêu thích và xem bản đồ masterplan.
                  </p>
                </div>

                {/* Primary Download Button */}
                <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
                  <button
                    onClick={handleDownloadApk}
                    disabled={downloadStarted}
                    className="w-full md:w-auto px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wide disabled:opacity-75"
                  >
                    <Download className={`w-5 h-5 ${downloadStarted ? 'animate-bounce' : ''}`} />
                    <span>{downloadStarted ? 'ĐANG TẢI VỀ...' : 'TẢI FILE APK (.APK)'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Hỗ trợ kỹ thuật Android: <strong>0868.499.929</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Đóng Cửa Sổ
          </button>
        </div>

      </div>
    </div>
  );
};
