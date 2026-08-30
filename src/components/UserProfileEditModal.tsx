import React, { useState } from 'react';
import { 
  X, User, Phone, Mail, MapPin, Building2, CreditCard, 
  Check, ShieldCheck, Sparkles, Image as ImageIcon, Camera, Upload
} from 'lucide-react';
import { User as UserType } from '../types';
import { createInstantPreview, validateImageSize } from '../lib/watermark';
import { uploadFiles } from '../lib/uploadService';

interface UserProfileEditModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: UserType) => void;
}

export const UserProfileEditModal: React.FC<UserProfileEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [zalo, setZalo] = useState(user.zalo || user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [apartmentAddress, setApartmentAddress] = useState(user.apartmentAddress || (user as any).apartment || '');
  const [projectArea, setProjectArea] = useState((user as any).projectArea || 'Vinhomes Ocean Park 2');
  const [bio, setBio] = useState(user.bio || (user as any).introduction || '');
  const [role, setRole] = useState(user.role || 'visitor');
  
  // Bank Account Information for Affiliate & Token Payouts
  const [bankName, setBankName] = useState(user.bankName || 'MB Bank (Quân Đội)');
  const [bankAccountNumber, setBankAccountNumber] = useState(user.bankAccountNumber || '');
  const [bankAccountName, setBankAccountName] = useState(user.bankAccountName || user.name || '');

  // Business & Verification Profile (MST, ĐKKD, Chứng chỉ Môi giới / Dược / Xây dựng...)
  const [accountType, setAccountType] = useState<string>(user.accountType || (user.role === 'partner' ? 'business_enterprise' : user.role === 'sale' ? 'business_enterprise' : 'individual_resident'));
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [taxCode, setTaxCode] = useState(user.taxCode || '');
  const [businessType, setBusinessType] = useState(user.businessType || 'real_estate_agency');
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState(user.businessLicenseUrl || '');
  const [brokerLicenseUrl, setBrokerLicenseUrl] = useState(user.brokerLicenseUrl || '');
  
  // Custom Specialized Certificates list
  const [specializedCertificates, setSpecializedCertificates] = useState<Array<{ id: string; certName: string; certNumber?: string; issuedBy?: string; issuedDate?: string; certImageUrl: string }>>(
    user.specializedCertificates || []
  );
  const [newCertName, setNewCertName] = useState('');
  const [newCertNumber, setNewCertNumber] = useState('');
  const [newCertImage, setNewCertImage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const PRESET_AVATARS: string[] = [];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageSize(file);
    if (!validation.valid) {
      alert(validation.message || 'Kích thước ảnh vượt quá giới hạn 10MB.');
      return;
    }
    try {
      const preview = await createInstantPreview(file);
      setAvatar(preview);
      // Upload file lên server -> URL public (thay vì base64)
      const urls = await uploadFiles([file]);
      if (urls[0]) setAvatar(urls[0]);
    } catch (err) {
      console.error('Avatar preview error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập họ và tên.');
      return;
    }
    if (!phone.trim()) {
      alert('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }

    setIsSubmitting(true);

    const updatedUser: UserType = {
      ...user,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      zalo: (zalo || phone).trim(),
      avatar: avatar.trim(),
      apartmentAddress: apartmentAddress.trim(),
      bio: bio.trim(),
      role: role,
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      bankAccountName: bankAccountName.trim().toUpperCase(),
      // Business & Enterprise Verification Profile
      accountType: accountType as any,
      companyName: companyName.trim(),
      taxCode: taxCode.trim(),
      businessType: businessType as any,
      businessLicenseUrl: businessLicenseUrl.trim(),
      brokerLicenseUrl: brokerLicenseUrl.trim(),
      specializedCertificates: specializedCertificates,
      // Keep extra fields
      ...{
        projectArea,
        apartment: apartmentAddress.trim(),
        introduction: bio.trim()
      }
    };

    try {
      // 1. Save to local storage
      localStorage.setItem('hb_user', JSON.stringify(updatedUser));
      localStorage.setItem('chocudan24h_user', JSON.stringify(updatedUser));
      localStorage.setItem('chocudan24h_resident_user', JSON.stringify(updatedUser));

      // 2. Push to API endpoint if available
      try {
        await fetch(`/api/auth/users/${user.id || 'me'}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser)
        });
      } catch (err) {
        console.warn('API sync warn:', err);
      }

      // 3. Dispatch global custom event for realtime reactive state updates
      window.dispatchEvent(new CustomEvent('user-token-updated', { detail: updatedUser }));
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updatedUser }));

      // 4. Callback to parent
      onSave(updatedUser);

      setSuccessMessage('🎉 Đã cập nhật thông tin cá nhân thành công!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 900);
    } catch (error) {
      console.error('Error saving user profile:', error);
      alert('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Cập Nhật Thông Tin Cá Nhân & Tài Khoản
              </h3>
              <p className="text-xs text-slate-500">
                Thông tin được đồng bộ tự động vào bài đăng BĐS, dịch vụ và ví hoa hồng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          
          {/* Avatar Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block">
              Ảnh Đại Diện (Avatar)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img loading="lazy"
                src={avatar}
                alt="Avatar preview"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
              />
              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tải Ảnh Mới Lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-500">Hoặc chọn avatar mẫu bên dưới</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {PRESET_AVATARS.map((presetUrl, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatar(presetUrl)}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                        avatar === presetUrl ? 'border-emerald-500 ring-2 ring-emerald-400/40 scale-105' : 'border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img loading="lazy" src={presetUrl} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Personal Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              1. Thông Tin Cơ Bản
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Số điện thoại liên hệ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Số Zalo (để khách liên hệ trực tiếp)
                </label>
                <input
                  type="tel"
                  value={zalo}
                  onChange={e => setZalo(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Email tài khoản
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ví dụ: cudan@vinhomes.vn"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Resident Address / Project Area */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              2. Khu Vực & Căn Hộ Cư Dân
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Khu đô thị / Dự án chính
                </label>
                <select
                  value={projectArea}
                  onChange={e => setProjectArea(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="Vinhomes Ocean Park 1">Vinhomes Ocean Park 1 (Gia Lâm)</option>
                  <option value="Vinhomes Ocean Park 2">Vinhomes Ocean Park 2 (Hưng Yên)</option>
                  <option value="Vinhomes Ocean Park 3">Vinhomes Ocean Park 3 (The Crown)</option>
                  <option value="Vinhomes Smart City">Vinhomes Smart City (Tây Mỗ)</option>
                  <option value="Vinhomes Grand Park">Vinhomes Grand Park (TP. Thủ Đức)</option>
                  <option value="Vinhomes Hạ Long Xanh">Vinhomes Hạ Long Xanh (Quảng Ninh)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Căn hộ / Phân khu cụ thể
                </label>
                <input
                  type="text"
                  value={apartmentAddress}
                  onChange={e => setApartmentAddress(e.target.value)}
                  placeholder="Ví dụ: Tòa S2.08 Căn 12A05 hoặc Chà Là 15-28"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Giới thiệu ngắn (Bio / Dịch vụ sở trường)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Ví dụ: Chủ nhà chính chủ cho thuê căn hộ Ocean Park 2 hoặc Chuyên kỹ thuật điện lạnh cư dân 24/7..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Doanh Nghiệp & Giấy Phép Kinh Doanh / Chứng Chỉ Ngành Nghề */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-blue-500/30 dark:border-blue-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                3. Hồ Sơ Doanh Nghiệp, Giấy Phép & Chứng Chỉ Bắt Buộc
              </h4>
              <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-300 font-bold rounded-full border border-blue-500/30">
                Xác Thực B2B & Pháp Lý
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Loại Hình Tài Khoản
                </label>
                <select
                  value={accountType}
                  onChange={e => setAccountType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="individual_resident">🏠 Cư Dân Cá Nhân (Chủ Hộ / Người Ở)</option>
                  <option value="business_enterprise">🏢 Doanh Nghiệp / Sàn BĐS / Công Ty</option>
                  <option value="technician">🛠️ Thợ Kỹ Thuật / Đội Cơ Động</option>
                  <option value="consumer">👤 Khách Hàng Tiêu Dùng (Chỉ Xem / Đặt Lịch)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Lĩnh Vực / Ngành Nghề Đăng Ký
                </label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="real_estate_agency">🏢 Sàn Giao Dịch & Môi Giới BĐS</option>
                  <option value="interior_construction">🏗️ Công Ty Xây Dựng & Thiết Kế Nội Thất</option>
                  <option value="recruitment">💼 Công Ty / Chuỗi Tuyển Dụng Lao Động</option>
                  <option value="pharmacy_health">💊 Nhà Thuốc, Dược Phẩm & Y Tế Gia Đình</option>
                  <option value="food_beverage">🍱 Ẩm Thực, F&B & Thực Phẩm Sạch</option>
                  <option value="general_services">⚡ Kỹ Thuật, Sửa Chữa & Vận Chuyển 24/7</option>
                  <option value="other">✨ Lĩnh Vực / Ngành Nghề Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Tên Công Ty / Doanh Nghiệp / Hộ Kinh Doanh
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Ví dụ: Công Ty Cổ Phần BĐS Tân Thời Đại / Nhà Thuốc An Tâm"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Mã Số Thuế (MST) / Số ĐKKD
                </label>
                <input
                  type="text"
                  value={taxCode}
                  onChange={e => setTaxCode(e.target.value)}
                  placeholder="Ví dụ: 0108999888"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            {/* Business License & Broker / Industry Certificate Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              {/* Giấy phép ĐKKD */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                    📄 Giấy Phép Kinh Doanh (ĐKKD):
                  </span>
                  <label className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg cursor-pointer inline-flex items-center gap-1 transition">
                    <Upload className="w-3 h-3" />
                    <span>Tải Lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const preview = await createInstantPreview(file);
                          setBusinessLicenseUrl(preview);
                          // Upload lên server -> URL public
                          const urls = await uploadFiles([file]);
                          if (urls[0]) setBusinessLicenseUrl(urls[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {businessLicenseUrl ? (
                  <div className="relative rounded-lg overflow-hidden h-20 bg-slate-900 border border-slate-300 dark:border-slate-700">
                    <img loading="lazy" src={businessLicenseUrl} alt="Giấy phép ĐKKD" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setBusinessLicenseUrl('')}
                      className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded text-[10px] flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Chưa tải ảnh giấy phép ĐKKD</p>
                )}
              </div>

              {/* Chứng chỉ hành nghề / Giấy phép chuyên ngành */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                    📜 Chứng Chỉ Nghề / Giấy Phép Con:
                  </span>
                  <label className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg cursor-pointer inline-flex items-center gap-1 transition">
                    <Upload className="w-3 h-3" />
                    <span>Tải Lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const preview = await createInstantPreview(file);
                          setBrokerLicenseUrl(preview);
                          // Upload lên server -> URL public
                          const urls = await uploadFiles([file]);
                          if (urls[0]) setBrokerLicenseUrl(urls[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {brokerLicenseUrl ? (
                  <div className="relative rounded-lg overflow-hidden h-20 bg-slate-900 border border-slate-300 dark:border-slate-700">
                    <img loading="lazy" src={brokerLicenseUrl} alt="Chứng chỉ nghề" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setBrokerLicenseUrl('')}
                      className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded text-[10px] flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Chứng chỉ Môi giới BĐS, Dược, ATTP...</p>
                )}
              </div>
            </div>

            {/* Add Custom Specialized Certificate */}
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-blue-900 dark:text-blue-300 text-[11px]">
                  + Bổ Sung Chứng Chỉ / Giấy Phép Khác (Tùy Chọn):
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Tên chứng chỉ (VD: Giấy phép Dược / PCCC)"
                  value={newCertName}
                  onChange={e => setNewCertName(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Số hiệu / Ngày cấp"
                  value={newCertNumber}
                  onChange={e => setNewCertNumber(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
                <div className="flex items-center gap-1.5">
                  <label className="flex-1 px-2 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-lg cursor-pointer text-center truncate">
                    <span>{newCertImage ? '✓ Đã chọn ảnh' : '📷 Chọn ảnh'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const preview = await createInstantPreview(file);
                          setNewCertImage(preview);
                          // Upload lên server -> URL public
                          const urls = await uploadFiles([file]);
                          if (urls[0]) setNewCertImage(urls[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCertName.trim()) {
                        alert('Vui lòng nhập tên chứng chỉ.');
                        return;
                      }
                      if (!newCertImage) {
                        alert('Vui lòng chọn ảnh chụp chứng chỉ.');
                        return;
                      }
                      setSpecializedCertificates(prev => [
                        ...prev,
                        {
                          id: `cert-${Date.now()}`,
                          certName: newCertName.trim(),
                          certNumber: newCertNumber.trim(),
                          certImageUrl: newCertImage
                        }
                      ]);
                      setNewCertName('');
                      setNewCertNumber('');
                      setNewCertImage('');
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-lg shadow-xs cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Added Certs preview list */}
              {specializedCertificates.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {specializedCertificates.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-800 rounded-lg text-[11px]">
                      <img loading="lazy" src={cert.certImageUrl} alt={cert.certName} className="w-8 h-8 object-cover rounded" />
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">{cert.certName}</span>
                        {cert.certNumber && <span className="text-[10px] text-slate-400 font-mono">{cert.certNumber}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSpecializedCertificates(prev => prev.filter(c => c.id !== cert.id))}
                        className="text-rose-500 hover:text-rose-700 font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Bank Account for Affiliate & Token Payouts */}
          <div className="bg-amber-500/5 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 space-y-3">
            <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              4. Tài Khoản Ngân Hàng Nhận Tiền Rút Hoa Hồng VietQR
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Tên Ngân Hàng
                </label>
                <select
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 outline-hidden"
                >
                  <option value="MB Bank (Quân Đội)">MB Bank (Quân Đội)</option>
                  <option value="Techcombank">Techcombank</option>
                  <option value="Vietcombank">Vietcombank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="VietinBank">VietinBank</option>
                  <option value="VPBank">VPBank</option>
                  <option value="ACB">ACB (Á Châu)</option>
                  <option value="TPBank">TPBank</option>
                  <option value="Sacombank">Sacombank</option>
                  <option value="VIB">VIB</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Số Tài Khoản (STK)
                </label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={e => setBankAccountNumber(e.target.value)}
                  placeholder="Ví dụ: 0988889999"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Tên Chủ Tài Khoản (Không dấu)
                </label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={e => setBankAccountName(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: NGUYEN VAN AN"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold uppercase focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>LƯU THAY ĐỔI NGAY</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
