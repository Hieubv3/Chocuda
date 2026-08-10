import React from 'react';
import { Building2, Home, KeyRound, MapPin, Sparkles, ChevronRight } from 'lucide-react';
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
    <section className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header Title */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              DANH MỤC BẤT ĐỘNG SẢN VINHOMES & DỰ ÁN LỚN NỔI BẬT
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Tra cứu nhanh theo loại hình, tỉnh thành và dự án chuyển nhượng - cho thuê chính chủ 24/7
            </p>
          </div>
        </div>

        {/* 3 Columns Layout (Matching Screenshot 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          
          {/* Column 1: Loại hình bất động sản mua bán phổ biến */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 text-amber-400 border-b border-slate-800 pb-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>Loại hình BĐS mua bán phổ biến</span>
            </h3>
            <ul className="space-y-2 text-slate-400">
              {[
                { label: 'Mua bán nhà ngõ, hẻm chính chủ', tab: 'sale' },
                { label: 'Mua bán đất thổ cư & đất nền sổ đỏ', tab: 'sale' },
                { label: 'Mua bán nhà mặt phố, mặt tiền kinh doanh', tab: 'sale' },
                { label: 'Mua bán nhà phố liền kề Vinhomes', tab: 'sale', project: 'ocean-park-2' },
                { label: 'Mua bán biệt thự đơn lập & song lập Vinhomes', tab: 'sale', project: 'ocean-park-1' },
                { label: 'Mua bán căn hộ chung cư cao cấp Vinhomes', tab: 'sale', project: 'smart-city' },
                { label: 'Mua bán shophouse thương mại dịch vụ 24/7', tab: 'sale', project: 'ocean-park-3' },
                { label: 'Mua bán căn hộ Studio & 1PN, 2PN, 3PN+', tab: 'sale' },
                { label: 'Mua bán tập thể, cư xá & căn hộ mini', tab: 'sale' },
                { label: 'Mua bán bất động sản công nghiệp & kho xưởng', tab: 'sale' }
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(item.tab, item.project as ProjectCategory)}
                    className="hover:text-amber-400 transition flex items-center gap-1.5 group text-left cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Bất động sản mua bán phổ biến theo tỉnh thành & dự án */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 text-emerald-400 border-b border-slate-800 pb-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>BĐS mua bán phổ biến theo dự án & tỉnh</span>
            </h3>
            <ul className="space-y-2 text-slate-400">
              {[
                { label: 'Mua bán BĐS TP.HCM (Vinhomes Grand Park)', tab: 'sale', project: 'grand-park' },
                { label: 'Mua bán BĐS Hà Nội (Vinhomes Smart City)', tab: 'sale', project: 'smart-city' },
                { label: 'Mua bán BĐS Hà Nội (Vinhomes Ocean Park 1)', tab: 'sale', project: 'ocean-park-1' },
                { label: 'Mua bán BĐS Hưng Yên (Ocean Park 2 - The Empire)', tab: 'sale', project: 'ocean-park-2' },
                { label: 'Mua bán BĐS Hưng Yên (Ocean Park 3 - The Crown)', tab: 'sale', project: 'ocean-park-3' },
                { label: 'Mua bán BĐS Hải Phòng (Vinhomes Royal Island)', tab: 'sale', project: 'royal-island' },
                { label: 'Mua bán BĐS Quảng Ninh (Vinhomes Hạ Long Xanh)', tab: 'sale', project: 'ha-long-xanh' },
                { label: 'Mua bán BĐS Quảng Ninh (Vinhomes Golden Avenue)', tab: 'sale', project: 'golden-avenue' },
                { label: 'Mua bán BĐS Long An (Vinhomes Tân Mỹ Hậu Nghĩa)', tab: 'sale', project: 'tan-my-hau-nghia' },
                { label: 'Mua bán BĐS Đà Nẵng (Vinhomes Làng Vân)', tab: 'sale', project: 'lang-van-da-nang' }
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

          {/* Column 3: Bất động sản cho thuê phổ biến */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 text-sky-400 border-b border-slate-800 pb-2">
              <KeyRound className="w-4 h-4 text-sky-500" />
              <span>Bất động sản cho thuê phổ biến</span>
            </h3>
            <ul className="space-y-2 text-slate-400">
              {[
                { label: 'Thuê căn hộ Vinhomes Smart City (Hà Nội)', tab: 'rent', project: 'smart-city' },
                { label: 'Thuê chung cư Vinhomes Ocean Park 1 (Gia Lâm)', tab: 'rent', project: 'ocean-park-1' },
                { label: 'Thuê biệt thự & shophouse Ocean Park 2, 3', tab: 'rent', project: 'ocean-park-2' },
                { label: 'Thuê căn hộ Vinhomes Grand Park (TP.HCM)', tab: 'rent', project: 'grand-park' },
                { label: 'Thuê biệt thự Vinhomes Riverside & Harmony', tab: 'rent', project: 'riverside' },
                { label: 'Thuê căn hộ full đồ nội thất ở ngay', tab: 'rent' },
                { label: 'Thuê mặt bằng shophouse chân đế kinh doanh', tab: 'rent' },
                { label: 'Thuê nguyên căn biệt thự làm văn phòng', tab: 'rent' },
                { label: 'Thuê bất động sản Đà Nẵng & Hải Phòng', tab: 'rent' },
                { label: 'Thuê bất động sản Bình Dương & Quảng Ninh', tab: 'rent' }
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
