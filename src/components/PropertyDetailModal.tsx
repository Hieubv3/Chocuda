import React, { useState } from 'react';
import { X, MapPin, Bed, Bath, Compass, ShieldCheck, Phone, MessageCircle, Calendar, Share2, Calculator, CheckCircle2 } from 'lucide-react';
import { Property, Language } from '../types';
import { getTranslation } from '../lib/i18n';
import { SocialShareModal } from './SocialShareModal';
import { recordZaloInteraction } from '../lib/visitorStats';

interface PropertyDetailModalProps {
  property: Property;
  language: Language;
  onClose: () => void;
  onOpenMortgageWithPrice: (price: number) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  language,
  onClose,
  onOpenMortgageWithPrice
}) => {
  const t = getTranslation(language);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Lead form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('Cuối tuần');
  const [note, setNote] = useState('');

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        phone,
        propertyId: property.id,
        propertyTitle: property.title,
        projectInterest: property.project,
        sellerName: property.sellerName,
        sellerPhone: property.sellerPhone,
        preferredTime,
        note,
        type: 'viewing'
      })
    })
      .then(res => res.json())
      .then(() => {
        setFormSubmitted(true);
      })
      .catch(() => {
        setFormSubmitted(true);
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full flex items-center justify-center transition shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Header Section */}
        <div className="relative bg-slate-950">
          <div className="aspect-[16/9] w-full max-h-[420px] overflow-hidden">
            <img
              src={property.images[selectedImgIndex] || property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails Bar */}
          {property.images.length > 1 && (
            <div className="flex space-x-2 p-3 bg-slate-950/90 overflow-x-auto border-t border-slate-800">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                    selectedImgIndex === idx ? 'border-amber-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Header Specs & Price Box */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${
                  property.type === 'sale' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                }`}>
                  {property.type === 'sale' ? 'MUA BÁN' : 'CHO THUÊ'}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                  Dự án: {property.project.toUpperCase()}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                {property.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-amber-500 shrink-0" />
                {property.address}
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 p-4 rounded-2xl shadow-lg shrink-0 w-full md:w-auto text-center md:text-right">
              <span className="text-xs font-bold block opacity-80 uppercase tracking-wide">Mức Giá Niêm Yết</span>
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{property.priceDisplay}</span>
              <p className="text-[11px] font-semibold mt-1">~ {(property.price / (property.area || 1)).toFixed(2)} tỷ / m²</p>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Diện Tích</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{property.area} m²</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Phòng Ngủ</span>
              <span className="text-base font-black text-slate-900 dark:text-white flex items-center">
                <Bed className="w-4 h-4 mr-1 text-amber-500" />
                {property.bedrooms} Phòng
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Hướng Nhà</span>
              <span className="text-base font-black text-slate-900 dark:text-white flex items-center">
                <Compass className="w-4 h-4 mr-1 text-amber-500" />
                {property.direction}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Pháp Lý</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1" />
                {t.legal[property.legal] || property.legal}
              </span>
            </div>
          </div>

          {/* Full Description & Amenities */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider text-amber-500">
              MÔ TẢ CHI TIẾT
            </h3>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              {property.description}
            </div>
          </div>

          {/* Location Map Preview Simulation */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider text-amber-500">
              VỊ TRÍ & TIỆN ÍCH XUNG QUANH
            </h3>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-48 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-center p-4">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
                alt="Bản đồ vị trí"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="relative z-10 bg-slate-900/90 text-white p-4 rounded-xl max-w-md shadow-xl border border-slate-700">
                <MapPin className="w-6 h-6 text-amber-500 mx-auto mb-1 animate-bounce" />
                <p className="text-xs font-bold">{property.address}</p>
                <p className="text-[11px] text-slate-300 mt-1">Kết nối nhanh: Royal Wave Park (300m) • Vincom Mega Mall (500m) • Bệnh viện Vinmec (800m)</p>
              </div>
            </div>
          </div>

          {/* Loan Estimator Trigger Bar */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center">
                <Calculator className="w-4 h-4 mr-1 text-amber-600" />
                Tính dự toán vay ngân hàng cho căn nhà này
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Chỉ cần trả trước 30% (tương đương ~{(property.price * 0.3).toFixed(2)} tỷ), hỗ trợ lãi suất 0%.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenMortgageWithPrice(property.price);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow transition shrink-0"
            >
              Mở Công Cụ Tính Lãi Vay
            </button>
          </div>

          {/* Seller Direct Contact Box */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl border border-amber-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
              <div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg inline-block mb-1 ${
                  property.sellerRole === 'owner' ? 'bg-emerald-500 text-slate-950' :
                  property.sellerRole === 'sale' ? 'bg-blue-500 text-white' :
                  'bg-amber-500 text-slate-950'
                }`}>
                  {property.sellerRole === 'owner' ? '🏡 CHỦ NHÀ CHÍNH CHỦ' : property.sellerRole === 'sale' ? '👨‍💼 MÔI GIỚI CHUYÊN VIÊN' : '👑 BAN QUẢN TRỊ SÀN'}
                </span>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{property.sellerName || 'Chủ tin đăng'}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Số điện thoại / Zalo trực tiếp: <b className="text-amber-400 font-mono text-sm">{property.sellerPhone || '0868.499.929'}</b>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <a
                  href={`tel:${(property.sellerPhone || '0868499929').replace(/\D/g, '')}`}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>Gọi Điện</span>
                </a>

                <a
                  href={`https://zalo.me/${(property.sellerPhone || '0868499929').replace(/\D/g, '')}?text=Tôi%20quan%20tâm%20căn%20bạn%20đăng%3A%20${encodeURIComponent(property.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={recordZaloInteraction}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat Zalo</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Chia Sẻ Group FB & Zalo</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              💡 <b>Minh bạch thông tin:</b> Khách xem tin liên hệ trực tiếp với <b>{property.sellerName}</b> ({property.sellerPhone || '0868.499.929'}) để thương lượng giá chuẩn, xem sổ đỏ và nhận tư vấn chính chủ. *(Lưu ý: Số hotline 0868.499.929 hỗ trợ cư dân đăng tin & quản trị hệ thống).*
            </p>
          </div>

          {/* Disclaimer Note */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-2 text-[11px] text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Lưu ý miễn trừ trách nhiệm:</strong> Thông tin, giá niêm yết và thông số căn nhà được tổng hợp từ chủ sở hữu. Quý khách vui lòng kiểm tra trực tiếp sổ đỏ/hợp đồng và tình trạng thực tế trước khi đặt cọc.
            </p>
          </div>

          {/* Schedule Viewing / Contact Form */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 border border-slate-800 shadow-xl">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-extrabold text-amber-400">ĐẶT LỊCH XEM NHÀ — GỬI YÊU CẦU CHO NGƯỜI ĐĂNG TIN</h3>
                <p className="text-xs text-slate-300">
                  📩 Yêu cầu của bạn được gửi trực tiếp tới: <b className="text-amber-300">{property.sellerName} ({property.sellerPhone || '0868.499.929'})</b> & Hệ thống Quản trị.
                </p>
              </div>
            </div>

            {formSubmitted ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 rounded-2xl space-y-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase text-white">Đặt Lịch Xem Căn Bất Động Sản Thành Công!</p>
                    <p className="text-[11px] text-emerald-200">
                      Thông tin đã được chuyển trực tiếp tới Người Đăng Tin: <b>{property.sellerName} ({property.sellerPhone || '0868.499.929'})</b>.
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-300 pt-2 border-t border-emerald-500/30">
                  Người đăng tin sẽ chủ động liên hệ lại qua Zalo/SĐT <b>{phone}</b> trong thời gian sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Họ và tên (*)</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Số điện thoại Zalo (*)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0868.xxx.xxx"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Thời gian muốn xem nhà</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Hôm nay">Hôm nay</option>
                    <option value="Ngày mai">Ngày mai</option>
                    <option value="Cuối tuần này">Cuối tuần này</option>
                    <option value="Giờ hành chính">Giờ hành chính</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ghi chú thêm</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Yêu cầu về nội thất, pháp lý..."
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wide transition shadow-lg"
                  >
                    Gửi Đặt Lịch Xem Căn Này
                  </button>

                  <a
                    href={`https://zalo.me/${(property.sellerPhone || '0868499929').replace(/\D/g, '')}?text=Tôi%20muốn%20xem%20thực%20tế%20căn%20bạn%20đăng%3A%20${encodeURIComponent(property.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={recordZaloInteraction}
                    className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center transition"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Nhắn Zalo Cho {property.sellerName || 'Người Đăng'}
                  </a>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      {showShareModal && (
        <SocialShareModal
          title={property.title}
          url={window.location.href}
          summary={property.description}
          price={property.price ? `${property.price} tỷ` : undefined}
          location={property.projectName}
          phone={property.sellerPhone}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
