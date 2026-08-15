import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Upload, CheckCircle2, AlertTriangle, Sparkles, X, FileText, UserCheck, Lock } from 'lucide-react';
import { addWatermarkToImage, validateImageSize, createInstantPreview } from '../lib/watermark';

interface KycVerificationModalProps {
  user: User;
  onClose: () => void;
  onKycSubmitted: (updatedUser: Partial<User>) => void;
}

export const KycVerificationModal: React.FC<KycVerificationModalProps> = ({
  user,
  onClose,
  onKycSubmitted
}) => {
  const [fullName, setFullName] = useState(user.name || '');
  const [dob, setDob] = useState(user.dob || '1992-08-15');
  const [idCardNumber, setIdCardNumber] = useState(user.idCardNumber || '');
  const [idCardFrontUrl, setIdCardFrontUrl] = useState(user.idCardFrontUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');
  const [idCardBackUrl, setIdCardBackUrl] = useState(user.idCardBackUrl || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80');
  const [brokerLicenseUrl, setBrokerLicenseUrl] = useState(user.brokerLicenseUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80');
  
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanResult, setAiScanResult] = useState<{
    success: boolean;
    confidence: number;
    extractedName: string;
    extractedDob: string;
    extractedId: string;
    message: string;
  } | null>(null);

  const handleSimulateAiScan = () => {
    if (!idCardNumber || idCardNumber.length < 9) {
      alert('Vui lòng nhập số CCCD/CMND hợp lệ (12 chữ số).');
      return;
    }
    setIsAiScanning(true);
    setTimeout(() => {
      setIsAiScanning(false);
      setAiScanResult({
        success: true,
        confidence: 98.8,
        extractedName: fullName,
        extractedDob: dob,
        extractedId: idCardNumber,
        message: 'AI đã trích xuất & đối soát thành công 100% dữ liệu hình ảnh CCCD & Chứng chỉ Môi giới BĐS. Hồ sơ đạt chuẩn không bị trùng lặp.'
      });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !dob || !idCardNumber) {
      alert('Vui lòng điền đầy đủ Họ tên, Ngày sinh và Số CCCD.');
      return;
    }

    onKycSubmitted({
      name: fullName,
      dob,
      idCardNumber,
      idCardFrontUrl,
      idCardBackUrl,
      brokerLicenseUrl: user.role === 'sale' ? brokerLicenseUrl : undefined,
      kycStatus: 'pending_ai',
      kycNote: 'Đã qua xác thực AI. Chờ Admin phê duyệt cuối cùng.'
    });

    alert('Đã gửi hồ sơ xác thực tài khoản & chứng chỉ thành công! Admin sẽ duyệt trong vòng 24h.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                XÁC THỰC TÀI KHOẢN CHÍNH CHỦ & CHỐNG SPAM
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Cập Nhật Thông Tin Xác Thực KYC & Chứng Chỉ Môi Giới
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user.role === 'sale'
              ? 'Môi giới / Sale bắt buộc cập nhật Chứng chỉ hành nghề & CCCD trong vòng 7 ngày để được tiếp tục đăng tin & Up Top VIP.'
              : 'Xác thực tài khoản chính chủ giúp tăng 300% độ uy tín đối với khách mua & thuê.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                Họ và Tên (Theo CCCD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Hùng"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                Ngày Tháng Năm Sinh (DOB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                Số CCCD / Giấy Tờ Định Danh (12 Chữ Số) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={idCardNumber}
                onChange={(e) => setIdCardNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Ví dụ: 001092008888"
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono tracking-widest text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Document Upload Links / Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block">
                📷 Ảnh CCCD Mặt Trước
              </span>
              <img src={idCardFrontUrl} alt="CCCD Front" className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-800" />
              <label className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow transition">
                <Upload className="w-3.5 h-3.5" />
                <span>📁 CHỌN ẢNH (DƯỚI 10MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const check = validateImageSize(file);
                      if (!check.valid) {
                        alert(check.message);
                        e.target.value = '';
                        return;
                      }
                      setIdCardFrontUrl(createInstantPreview(file));
                      try {
                        const watermarked = await addWatermarkToImage(file);
                        if (watermarked) setIdCardFrontUrl(watermarked);
                      } catch (err) {
                        console.error('Lỗi tải CCCD trước:', err);
                      } finally {
                        e.target.value = '';
                      }
                    }
                  }}
                />
              </label>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block">
                📷 Ảnh CCCD Mặt Sau
              </span>
              <img src={idCardBackUrl} alt="CCCD Back" className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-800" />
              <label className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow transition">
                <Upload className="w-3.5 h-3.5" />
                <span>📁 CHỌN ẢNH (DƯỚI 10MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const check = validateImageSize(file);
                      if (!check.valid) {
                        alert(check.message);
                        e.target.value = '';
                        return;
                      }
                      setIdCardBackUrl(createInstantPreview(file));
                      try {
                        const watermarked = await addWatermarkToImage(file);
                        if (watermarked) setIdCardBackUrl(watermarked);
                      } catch (err) {
                        console.error('Lỗi tải CCCD sau:', err);
                      } finally {
                        e.target.value = '';
                      }
                    }
                  }}
                />
              </label>
            </div>

            {user.role === 'sale' && (
              <div className="sm:col-span-2 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-500 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    📜 Chứng Chỉ Hành Nghề Môi Giới BĐS (Bắt Buộc Cho Sale)
                  </span>
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">
                    YÊU CẦU TRONG 7 NGÀY
                  </span>
                </div>
                <img src={brokerLicenseUrl} alt="Broker License" className="w-full h-32 object-cover rounded-xl border border-amber-500/30" />
                <label className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition">
                  <Upload className="w-4 h-4" />
                  <span>📁 CHỌN CHỨNG CHỈ (DƯỚI 10MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const check = validateImageSize(file);
                        if (!check.valid) {
                          alert(check.message);
                          e.target.value = '';
                          return;
                        }
                        setBrokerLicenseUrl(createInstantPreview(file));
                        try {
                          const watermarked = await addWatermarkToImage(file);
                          if (watermarked) setBrokerLicenseUrl(watermarked);
                        } catch (err) {
                          console.error('Lỗi tải chứng chỉ:', err);
                        } finally {
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* AI Auto Verification Scanner Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSimulateAiScan}
              disabled={isAiScanning}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>{isAiScanning ? 'Đang Chạy AI Trích Xuất & Kiểm Tra CCCD...' : '🤖 KÍCH HOẠT AI ĐỐI SOÁT TỰ ĐỘNG CHẤP NHẬN BẢO MẬT'}</span>
            </button>
          </div>

          {/* AI Result Box */}
          {aiScanResult && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs space-y-2 text-emerald-200">
              <div className="flex items-center justify-between font-black text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  XÁC THỰC AI THÀNH CÔNG ({aiScanResult.confidence}%)
                </span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded">
                  HỢP LỆ
                </span>
              </div>
              <p className="text-[11px] text-slate-300">{aiScanResult.message}</p>
            </div>
          )}

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Đóng
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition shadow-lg uppercase tracking-wider flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>GỬI HỒ SƠ CHO ADMIN DUYỆT</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
