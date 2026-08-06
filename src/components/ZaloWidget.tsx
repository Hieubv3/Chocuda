import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, X, CheckCircle2, QrCode, Users, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { ZaloGroup } from '../types';
import { DEFAULT_ZALO_GROUPS } from './AdminZaloGroupCenter';
import { recordZaloInteraction } from '../lib/visitorStats';

export const ZaloWidget: React.FC = () => {
  const [hubOpen, setHubOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [groups, setGroups] = useState<ZaloGroup[]>(() => {
    try {
      const saved = localStorage.getItem('chocudan24h_zalo_groups');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ZALO_GROUPS;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chocudan24h_zalo_groups');
      if (saved) setGroups(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, [hubOpen]);

  const activeGroups = groups.filter(g => g.isActive !== false);
  const displayGroups = activeGroups.filter(g => selectedCategory === 'all' || g.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'BĐS & Căn Hộ', label: '🏢 BĐS & Căn Hộ' },
    { id: 'Nhà Hàng & Ẩm Thực', label: '🍽️ Nhà Hàng & Ẩm Thực' },
    { id: 'Cafe & Trà Sữa', label: '☕ Cafe & Trà Sữa' },
    { id: 'Quảng Cáo & Dịch Vụ', label: '🛠️ Quảng Cáo & Dịch Vụ' },
    { id: 'Taxi & Xe Tiện Chuyến', label: '🚖 Taxi & Xe Tiện Chuyến' },
  ];

  const handleOpenHub = () => {
    recordZaloInteraction();
    setHubOpen(true);
  };

  const handleGroupClick = (group: ZaloGroup) => {
    recordZaloInteraction();
    const updated = groups.map(g => g.id === group.id ? { ...g, clicksCount: (g.clicksCount || 0) + 1 } : g);
    setGroups(updated);
    localStorage.setItem('chocudan24h_zalo_groups', JSON.stringify(updated));
  };

  return (
    <>
      {/* Ultra-Compact Single Floating Zalo Widget Trigger */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={handleOpenHub}
          className="relative group p-2.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full flex items-center gap-2 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-blue-300/40"
          title="Zalo Cư Dân & Chat Trực Tiếp"
        >
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>

          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-black text-[10px] text-white shrink-0">
            Z
          </div>

          <div className="hidden sm:flex flex-col items-start text-left leading-tight">
            <span className="font-black text-xs tracking-tight text-white">NHÓM ZALO CƯ DÂN</span>
            <span className="text-[10px] text-emerald-300 font-bold">& Chat 24/7</span>
          </div>

          <span className="sm:hidden font-extrabold text-xs">ZALO</span>
        </button>
      </div>

      {/* Unified Zalo Community & Chat Hub Modal */}
      {hubOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl relative text-white space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center font-black text-xl border border-blue-500/30 shrink-0">
                  Z
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    ZALO COMMUNITY & HOTLINE CHỢ CƯ DÂN 24H
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    HỆ THỐNG KẾT NỐI ZALO CƯ DÂN VINHOMES
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setHubOpen(false)}
                className="text-slate-400 hover:text-white font-bold p-1 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Quick Actions Bar (Chat Zalo Admin + Call Hotline + View QR) */}
            <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/80">
              <a
                href="https://zalo.me/0868499929"
                target="_blank"
                rel="noreferrer"
                className="py-2 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold text-[11px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center transition shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>Chat Admin</span>
              </a>

              <a
                href="tel:0868499929"
                className="py-2 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-[11px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center transition shadow-md"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>0868.499.929</span>
              </a>

              <button
                onClick={() => setShowQr(!showQr)}
                className="py-2 px-2 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded-xl font-bold text-[11px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center transition"
              >
                <QrCode className="w-4 h-4" />
                <span>{showQr ? 'Ẩn Mã QR' : 'Mã QR Zalo'}</span>
              </button>
            </div>

            {/* QR Code Collapsible View */}
            {showQr && (
              <div className="p-4 bg-slate-800/90 rounded-2xl border border-amber-500/30 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://zalo.me/0868499929"
                  alt="QR Zalo Admin"
                  className="w-36 h-36 mx-auto rounded-xl shadow-lg border border-white/20"
                />
                <p className="text-xs text-amber-300 font-bold">Quét QR bằng app Zalo để nhắn tin trao đổi trực tiếp với BQT Chợ Cư Dân 24H</p>
              </div>
            )}

            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              💬 Đăng quảng cáo mua bán căn hộ, dịch vụ sửa chữa, đồ ăn thức uống, taxi tiện chuyến <b className="text-amber-400">MIỄN PHÍ 100%</b>:
            </p>

            {/* Category Filter Chips - Scrollable on Mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 3-Column Grid Group List with QR codes & small Tham gia button */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {displayGroups.length === 0 ? (
                <div className="col-span-3 py-6 text-center text-xs text-slate-400">
                  Chưa có nhóm nào thuộc danh mục này.
                </div>
              ) : (
                displayGroups.map((group) => {
                  const qrSrc = group.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(group.linkUrl)}`;
                  return (
                    <div
                      key={group.id}
                      className="p-2 sm:p-3 bg-slate-800/80 rounded-2xl border border-slate-700/70 hover:border-blue-500/60 transition flex flex-col items-center justify-between text-center group shadow-md hover:bg-slate-800"
                    >
                      {/* Header Category & Title */}
                      <div className="w-full space-y-1 mb-1">
                        <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 font-bold text-[8px] sm:text-[10px] rounded-md border border-blue-500/30 inline-block max-w-full truncate">
                          {group.category}
                        </span>
                        <h4 className="text-[10px] sm:text-xs font-extrabold text-white group-hover:text-blue-400 transition line-clamp-2 leading-tight min-h-[1.8rem] sm:min-h-[2.2rem]">
                          {group.name}
                        </h4>
                      </div>

                      {/* QR Code */}
                      <div className="p-1 bg-white rounded-xl shadow-xs my-1 group-hover:scale-105 transition-transform shrink-0">
                        <img
                          src={qrSrc}
                          alt={group.name}
                          className="w-16 h-16 sm:w-24 sm:h-24 object-contain rounded-lg"
                          loading="lazy"
                        />
                      </div>

                      {/* Member count */}
                      <span className="text-[8px] sm:text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-0.5 mt-0.5">
                        <Users className="w-2.5 h-2.5" />
                        ~{group.memberCount ? group.memberCount.toLocaleString('vi-VN') : 500}
                      </span>

                      {/* Small 'Tham gia' button right below QR */}
                      <a
                        href={group.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleGroupClick(group)}
                        className="mt-1.5 w-full py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[9px] sm:text-xs rounded-xl flex items-center justify-center gap-1 transition shadow-sm active:scale-95"
                      >
                        <span>Tham gia</span>
                        <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </a>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 text-center text-[11px] text-slate-400">
              Ban quản trị hỗ trợ 24/7 qua Zalo/Hotline: <a href="tel:0868499929" className="text-amber-400 font-bold hover:underline">0868.499.929</a>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

