import React, { useState } from 'react';
import { Phone, Mail, Award, CheckCircle2, ShieldCheck, MapPin, Calendar, Star, MessageCircle } from 'lucide-react';
import logoImg from '../assets/images/chocudan24h_custom_logo_1785384117746.jpg';
import { HIEU_BUI_PROFILE } from '../data/initialData';
import { Language } from '../types';
import { RealestateVideoChannelSection } from '../components/RealestateVideoChannelSection';

export const HieuBuiProfilePage: React.FC<{ language: Language }> = () => {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        phone,
        note,
        projectInterest: 'Tư vấn trực tiếp 1:1 Chuyên Viên Vinhomes',
        type: 'consultation'
      })
    })
      .then(() => setSubmitted(true))
      .catch(() => setSubmitted(true));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Profile Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-4 text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-52 h-52 rounded-3xl bg-white p-3 border-4 border-amber-500/50 shadow-2xl mx-auto flex items-center justify-center overflow-hidden">
                <img
                  src={logoImg}
                  alt="Logo Chợ Cư Dân 24H Vinhomes"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-black text-amber-400">{HIEU_BUI_PROFILE.name}</h1>
              <p className="text-xs font-bold text-slate-300 mt-1">{HIEU_BUI_PROFILE.title}</p>
              <p className="text-xs text-amber-300/80 font-bold mt-0.5">{HIEU_BUI_PROFILE.domain}</p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-5">
            <div>
              <span className="text-xs font-black uppercase text-amber-400 tracking-widest">
                TẬN TÂM - MINH BẠCH - CHUYÊN NGHIỆP
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                HỒ SƠ CÁ NHÂN & CÂU CHUYỆN THƯƠNG HIỆU
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {HIEU_BUI_PROFILE.bio}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                <span className="text-base font-black text-amber-400">Chuyên Sâu</span>
                <span className="text-[11px] text-slate-400 block font-semibold">Kinh nghiệm BĐS</span>
              </div>
              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                <span className="text-base font-black text-amber-400">Chính Chủ</span>
                <span className="text-[11px] text-slate-400 block font-semibold">Căn nhà chuyển nhượng</span>
              </div>
              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                <span className="text-base font-black text-amber-400">Tận Tâm</span>
                <span className="text-[11px] text-slate-400 block font-semibold">Hài lòng từ khách hàng</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Achievements & Milestones */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-amber-500">
          THÀNH TÍCH & DANH HIỆU NỔI BẬT
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HIEU_BUI_PROFILE.achievements.map((ach, idx) => (
            <div key={idx} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start space-x-3">
              <Award className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ach}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cam kết hỗ trợ trọn gói thủ tục pháp lý, thẩm định giá & ký kết HĐMB an toàn tuyệt đối.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Personal Video Channel Section */}
      <RealestateVideoChannelSection />

      {/* Direct Booking Form */}
      <div className="p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Calendar className="w-8 h-8 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-black text-amber-400">ĐẶT LỊCH TƯ VẤN TRỰC TIẾP 1:1 VỚI NHÀ ĐẸP VINHOMES</h2>
          <p className="text-xs text-slate-400">
            Dành cho khách hàng cần tư vấn chiến lược dòng tiền, mua cắt lỗ hoặc tìm căn ưng ý tại Vinhomes Ocean Park 2, 3 & Hạ Long Xanh.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-2xl text-center font-bold text-xs">
            Cảm ơn quý khách! Chuyên viên Nhà đẹp Vinhomes đã nhận thông tin và sẽ gọi điện tư vấn trong vòng 15 phút.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Họ và tên (*)</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Số điện thoại / Zalo (*)</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0868.xxx.xxx"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Nhu cầu cụ thể</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Cần tìm Shophouse Chà Là tài chính 8 tỷ, hướng Đông Nam..."
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
            >
              Gửi Yêu Cầu Đặt Lịch
            </button>
          </form>
        )}
      </div>

    </div>
  );
};
