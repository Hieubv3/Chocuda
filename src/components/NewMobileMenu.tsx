import React, { useState } from 'react';
import { Menu, X, Home, Building2, ShoppingBag, Users, Briefcase, Phone, MapPin, Search } from 'lucide-react';

interface MobileMenuProps {
  onClose?: () => void;
}

export const NewMobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuCategories = [
    {
      id: 1,
      label: 'Mua Bán BĐS',
      icon: Building2,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-500',
    },
    {
      id: 2,
      label: 'Cho Thuê BĐS',
      icon: MapPin,
      color: 'from-cyan-500 to-cyan-600',
      textColor: 'text-cyan-500',
    },
    {
      id: 3,
      label: 'Dịch Vụ Cư Dân',
      icon: ShoppingBag,
      color: 'from-teal-500 to-teal-600',
      textColor: 'text-teal-500',
    },
    {
      id: 4,
      label: 'Chợ Đồ Cũ',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-500',
    },
    {
      id: 5,
      label: 'Ẩm Thực & Tận Cận',
      icon: Briefcase,
      color: 'from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-500',
    },
    {
      id: 6,
      label: 'Việc Làm & Gia Sư',
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-500',
    },
    {
      id: 7,
      label: 'Tín Tức BQL',
      icon: Search,
      color: 'from-pink-500 to-pink-600',
      textColor: 'text-pink-500',
    },
    {
      id: 8,
      label: 'Cẩm Nang Cư Dân',
      icon: Phone,
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-500',
    },
    {
      id: 9,
      label: 'Hotline 1900 BQL',
      icon: Phone,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-500',
      badge: '24/7',
    },
  ];

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-30 md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Slide-out Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu Panel */}
      <div
        className={`fixed left-0 top-0 h-screen w-80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 z-40 transform transition-transform duration-300 ease-out md:hidden overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black">
              CHỢ
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Chợ Cư Dân</h2>
              <p className="text-xs text-emerald-400">Chọn danh mục</p>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {menuCategories.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  // Handle navigation
                  setIsOpen(false);
                }}
                className="relative group flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-800 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105"
              >
                {/* Badge */}
                {item.badge && (
                  <div className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                    {item.badge}
                  </div>
                )}

                {/* Icon Container */}
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Label */}
                <p className="text-xs font-semibold text-center text-white group-hover:text-orange-300 transition">
                  {item.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 border-t border-white/10 space-y-2 text-xs text-slate-400">
          <p>📱 Tải app: Chợ Cư Dân 24h</p>
          <p>🔐 Đã xác thực: Cư dân chính chủ</p>
          <p>💚 Nền tảng tin cậy của 500K+ cư dân</p>
        </div>
      </div>
    </>
  );
};
