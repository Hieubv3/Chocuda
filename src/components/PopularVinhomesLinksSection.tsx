import React from 'react';
import { Building2, Home, KeyRound, MapPin, Sparkles, ChevronRight, ShoppingBag, Users } from 'lucide-react';
import { ProjectCategory } from '../types';

interface PopularVinhomesLinksSectionProps {
  setCurrentTab: (tab: string) => void;
  onSelectProject?: (proj: ProjectCategory) => void;
}

export const PopularVinhomesLinksSection: React.FC<PopularVinhomesLinksSectionProps> = ({
  setCurrentTab,
  onSelectProject
}) => {
  const handleLinkClick = (tab: string, project?: ProjectCategory) => {
    if (project && onSelectProject) {
      onSelectProject(project);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-slate-950 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header Title */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              KẾT NỐI CHỦ ĐỀ & NHÓM CƯ DÂN VINHOMES 24/7
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Liên kết nhanh đến các cộng đồng cư dân, chợ cư dân, dịch vụ nội khu và quỹ nhà chính chủ
            </p>
          </div>
        </div>

        {/* 3 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          
          {/* Column 1: Danh mục chủ đề & dịch vụ cư dân */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 text-amber-400 border-b border-slate-800 pb-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>Chủ đề & Dịch vụ cư dân</span>
            </h3>
            <ul className="space-y-2 text-slate-400">
              {[
                { label: '🍲 Quán ăn & Thực phẩm F&B Cư Dân', tab: 'services' },
                { label: '🛒 Chợ Cư Dân - Hải Sản & Đồ Tươi Sạch', tab: 'services' },
                { label: '🛠️ Thi công nội thất & Sửa chữa điện nước', tab: 'services' },
                { label: '🛗 Lắp đặt & Bảo trì thang máy HomeLift', tab: 'services' },
                { label: '🚗 Vận tải nội khu & Xe điện 24/7', tab: 'services' },
                { label: '💇 Spa, Hair & Làm đẹp cư dân', tab: 'services' },
                { label: '🐶 Chăm sóc thú cưng & Dịch vụ grooming', tab: 'services' },
                { label: '🎓 Gia sư & Lớp học năng khiếu nội khu', tab: 'services' },
                { label: '✍️ Đăng bài sản phẩm / Dịch vụ cư dân', tab: 'post-property' }
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(item.tab)}
                    className="hover:text-amber-400 transition flex items-center gap-1.5 group text-left cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Nhóm & Group cư dân Vinhomes trọng điểm */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 text-emerald-400 border-b border-slate-800 pb-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Cộng đồng & Group cư dân</span>
            </h3>
            <ul className="space-y-2 text-slate-400">
              {[
                { label: '🌊 Group Cư Dân Ocean Park 2 (The Empire)', tab: 'projects', project: 'ocean-park-2' },
                { label: '🌴 Group Cư Dân Ocean Park 3 (Grand Park)', tab: 'projects', project: 'ocean-park-3' },
                { label: '🏙️ Group Cư Dân Ocean Park 1 (Gia Lâm)', tab: 'projects', project: 'ocean-park-1' },
                { label: '🏢 Group Cư Dân Vinhomes Smart City (Hà Nội)', tab: 'projects', project: 'smart-city' },
                { label: '🌳 Group Cư Dân Vinhomes Grand Park (TP.HCM)', tab: 'projects', project: 'grand-park' },
                { label: '👑 Group Cư Dân Vinhomes Royal Island (Vũ Yên)', tab: 'projects', project: 'royal-island' },
                { label: '🏖️ Group Cư Dân Vinhomes Hạ Long Xanh', tab: 'projects', project: 'ha-long-xanh' },
                { label: '📜 Quy hoạch & Pháp lý sổ đỏ cư dân', tab: 'news' }
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(item.tab, item.project as ProjectCategory)}
                    className="hover:text-emerald-400 transition flex items-center gap-1.5 group text-left cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: BĐS Cư Dân Mua Bán & Cho Thuê */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 text-sky-400 border-b border-slate-800 pb-2">
              <KeyRound className="w-4 h-4 text-sky-500" />
              <span>BĐS Cư dân chuyển nhượng & Thuê</span>
            </h3>
            <ul className="space-y-2 text-slate-400">
              {[
                { label: '🔑 Cho thuê căn hộ chung cư chính chủ', tab: 'rent', project: 'smart-city' },
                { label: '🏘️ Cho thuê biệt thự & shophouse kinh doanh', tab: 'rent', project: 'ocean-park-2' },
                { label: '🏪 Mua bán shophouse chân đế 24/7', tab: 'sale', project: 'ocean-park-3' },
                { label: '🏡 Mua bán biệt thự & liền kề Vinhomes', tab: 'sale', project: 'ocean-park-1' },
                { label: '📄 Quỹ căn cắt lỗ cư dân gửi bán', tab: 'sale' },
                { label: '📊 Bảng giá & Phí quản lý dịch vụ', tab: 'news' },
                { label: '💰 Bảng tính lãi suất vay ngân hàng', tab: 'mortgage' },
                { label: '✍️ Đăng tin bán / Cho thuê nhà đất', tab: 'post-property' }
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(item.tab, item.project as ProjectCategory)}
                    className="hover:text-sky-400 transition flex items-center gap-1.5 group text-left cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-sky-400 transition" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
};

