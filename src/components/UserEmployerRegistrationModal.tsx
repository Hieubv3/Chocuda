import React, { useState } from 'react';
import { User, RecruitmentPackage } from '../types';
import { RECRUITMENT_PACKAGES, VIN_MAJOR_PROJECTS, RECRUITMENT_INDUSTRIES } from '../data/recruitmentData';
import { 
  Building2, CheckCircle2, ShieldCheck, Sparkles, X, 
  Send, Phone, MapPin, DollarSign, Award, ChevronRight, Zap
} from 'lucide-react';

interface UserEmployerRegistrationModalProps {
  currentUser: User;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UserEmployerRegistrationModal: React.FC<UserEmployerRegistrationModalProps> = ({
  currentUser,
  onClose,
  onSuccess
}) => {
  const [selectedPackageId, setSelectedPackageId] = useState<string>(RECRUITMENT_PACKAGES[1]?.id || RECRUITMENT_PACKAGES[0]?.id || 'pack-pro-shop');
  const [companyName, setCompanyName] = useState(currentUser.storeName || currentUser.name || '');
  const [brandName, setBrandName] = useState(currentUser.storeName || currentUser.name || '');
  const [industry, setIndustry] = useState('Bất Động Sản & Môi Giới');
  const [taxCode, setTaxCode] = useState('');
  const [project, setProject] = useState('ocean-park-2');
  const [address, setAddress] = useState(currentUser.address || 'Vinhomes Ocean Park 2');
  const [contactName, setContactName] = useState(currentUser.name || currentUser.displayName || '');
  const [contactPhone, setContactPhone] = useState(currentUser.phone || '');
  const [contactZalo, setContactZalo] = useState(currentUser.phone || '');
  const [contactEmail, setContactEmail] = useState(currentUser.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const selectedPkg = RECRUITMENT_PACKAGES.find(p => p.id === selectedPackageId) || RECRUITMENT_PACKAGES[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPhone.trim() || !contactName.trim()) {
      alert('Vui lòng nhập đầy đủ Tên Công Ty/Cửa Hàng, Họ Tên Người Đại Diện và Số Điện Thoại!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/recruitment/employer-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          companyName,
          brandName,
          industry,
          taxCode,
          project,
          address,
          contactName,
          contactPhone,
          contactZalo,
          contactEmail,
          selectedPackageId: selectedPkg.id
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSubmittedSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi gửi đăng ký.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white p-6 relative flex items-center justify-between border-b border-teal-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shrink-0">
              🏢
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                DÀNH CHO DOANH NGHIỆP & CHỦ SHOP NỘI KHU
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                ĐĂNG KÝ HỒ SƠ & MUA GÓI NHÀ TUYỂN DỤNG
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Đăng Ký Gói Tuyển Dụng Thành Công!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Yêu cầu đăng ký gói <strong className="text-teal-600">{selectedPkg.name}</strong> của <strong>{companyName}</strong> đã được chuyển tới Ban Quản Trị Tuyển Dụng.
              Admin sẽ liên hệ và kích hoạt gói Token vào tài khoản của bạn ngay!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl text-xs hover:bg-teal-500 transition cursor-pointer"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
            
            {/* Step 1: Choose Package */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-[10px] font-black">1</span>
                  <span>Chọn Gói Tuyển Dụng Phù Hợp</span>
                </label>
                <span className="text-[11px] text-slate-500">Thanh toán quy đổi bằng <strong>Token Cư Dân</strong></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {RECRUITMENT_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-3.5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-md ring-2 ring-teal-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300'
                      }`}
                    >
                      {pkg.isPopular && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full shadow-xs uppercase">
                          Hot Nhất
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="font-black text-slate-900 dark:text-white text-xs">{pkg.name}</div>
                        <div className="text-sm font-black text-teal-600 dark:text-teal-400">
                          {pkg.priceVnd.toLocaleString('vi-VN')} đ
                          <span className="text-[10px] font-normal text-slate-400 block mt-0.5">
                            🪙 {pkg.priceToken.toLocaleString('vi-VN')} Token
                          </span>
                        </div>

                        <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700/60 pt-2">
                          <li className="flex items-center gap-1 font-semibold">
                            ✓ {pkg.jobPostsCount} tin tuyển dụng
                          </li>
                          <li className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ Mở khóa {pkg.cvUnlockCount} CV ứng viên
                          </li>
                          {pkg.isVipBadge && (
                            <li className="flex items-center gap-1 text-amber-500 font-bold">
                              ✓ Huy hiệu Doanh Nghiệp VIP
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-teal-600' : 'text-slate-400'}`}>
                          {isSelected ? '● Đang Chọn' : 'Chọn Gói'}
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-400'}`}>
                          {isSelected && <span className="text-[9px]">✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Company & Representative Information */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-[10px] font-black">2</span>
                <span>Thông Tin Doanh Nghiệp / Cửa Hàng & Người Đại Diện</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Doanh Nghiệp / Shop *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="VD: Nhà Hàng Sen Vàng / BĐS Vinhomes Land"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thương Hiệu / Tên Gọi Khác</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="VD: Sen Vàng OCP2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ngành Nghề Tuyển Dụng</label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {RECRUITMENT_INDUSTRIES.map(ind => (
                      <option key={ind.id} value={ind.name}>{ind.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Khu Đô Thị Trực Thuộc *</label>
                  <select
                    value={project}
                    onChange={e => setProject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {VIN_MAJOR_PROJECTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Số Thuế / Giấy Phép KD (nếu có)</label>
                  <input
                    type="text"
                    value={taxCode}
                    onChange={e => setTaxCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="VD: 0108998899"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Địa Chỉ Kinh Doanh Tại Nội Khu *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="VD: Shophouse Sao Biển 12-08, OCP2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Người Đại Diện Tuyển Dụng *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="VD: Nguyễn Thị Lan (HR Manager)"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số Điện Thoại Nhận Ứng Viên *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="VD: 0988123456"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Zalo Tuyển Dụng</label>
                  <input
                    type="text"
                    value={contactZalo}
                    onChange={e => setContactZalo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="Số Zalo nhận tin nhắn ứng viên"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Nhận CV</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="tuyendung@domain.com"
                  />
                </div>
              </div>
            </div>

            {/* Summary & Submit */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-slate-500 text-[11px]">Gói đã chọn:</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedPkg.name} ({selectedPkg.priceVnd.toLocaleString('vi-VN')} đ ~ {selectedPkg.priceToken.toLocaleString('vi-VN')} Token)
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  ✓ Quyền lợi: {selectedPkg.jobPostsCount} tin đăng VIP + Mở khóa {selectedPkg.cvUnlockCount} CV ứng viên
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang Gửi...' : 'GỬI ĐĂNG KÝ GÓI VỚI ADMIN'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
