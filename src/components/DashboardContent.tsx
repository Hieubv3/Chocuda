import React from 'react';
import { CategoryItem, WidgetItem, WidgetGroup } from '../types';

interface DashboardContentProps {
  categories: CategoryItem[];
  widgetGroups: WidgetGroup[];
  onSelectCategory: (cat: CategoryItem) => void;
  onSelectWidgetItem: (item: WidgetItem) => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  categories,
  widgetGroups,
  onSelectCategory,
  onSelectWidgetItem,
}) => {
  return (
    <div className="dashboard-container w-full max-w-[1200px] mx-auto">
      <div className="dashboard flex flex-col lg:flex-row gap-5 w-full bg-[#131b31] p-3 sm:p-5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5">
        {/* Main Content Area: chỉ hiện khi có categories (tránh trùng 4 mục với hero trang chủ) */}
        {categories.length > 0 && (
        <div className="main-content flex-1 flex flex-col gap-5 min-w-0">
          {/* Hero Banner */}
          <div
            className="hero-banner relative rounded-[10px] overflow-hidden flex-1 min-h-[150px] sm:min-h-[170px] flex flex-col justify-center px-5 sm:px-8 py-6 bg-cover bg-center shadow-inner"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80')`,
            }}
          >
            <div
              className="absolute inset-0 z-[1]"
              style={{
                background: 'linear-gradient(to right, rgba(19, 27, 49, 0.90) 35%, rgba(19, 27, 49, 0.45) 100%)',
              }}
            />
            <div className="relative z-[2] max-w-xl">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded border border-orange-500/30 mb-2">
                Cộng đồng cư dân Vinhomes
              </span>
              <h1 className="m-0 mb-1.5 text-lg sm:text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                KẾT NỐI CƯ DÂN VINHOMES
              </h1>
              <p className="m-0 text-xs sm:text-sm text-slate-300 max-w-[90%] leading-relaxed drop-shadow-sm">
                Nền tảng trực tiếp dành cho cư dân trao đổi thông tin mua bán, cho thuê BĐS...
              </p>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="categories grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className="category-card relative rounded-lg overflow-hidden bg-[#1a2342] aspect-[16/10] border border-white/5 hover:border-white/20 transition-all duration-200 cursor-pointer group shadow-sm hover:-translate-y-1"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-300"
                />
                <div className="category-title absolute bottom-0 left-0 w-full bg-[#0f1528]/85 backdrop-blur-[4px] py-2 px-1 text-center text-xs sm:text-[13px] font-semibold text-white border-t border-white/10 box-border group-hover:bg-[#0f1528]/95 transition-colors">
                  {cat.title}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Sidebar with 4 colorful widgets */}
        <div className={`sidebar flex flex-col gap-3.5 shrink-0 ${categories.length > 0 ? 'w-full lg:w-[340px]' : 'w-full sm:grid sm:grid-cols-2 lg:grid-cols-4'}`}>
          {widgetGroups.map((group) => {
            const headerColorClass = {
              orange: 'bg-[#f97316] text-white',
              purple: 'bg-[#a855f7] text-white',
              teal: 'bg-[#14b8a6] text-white',
              blue: 'bg-[#0ea5e9] text-white',
            }[group.color];

            return (
              <div
                key={group.id}
                className="widget bg-[#0f1528] rounded-lg overflow-hidden border border-white/5 shadow-sm"
              >
                <div
                  className={`widget-header flex justify-between items-center px-3.5 py-1.5 font-bold text-[11px] uppercase tracking-wider ${headerColorClass}`}
                >
                  <span>{group.title}</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                    {group.count}
                  </span>
                </div>

                <ul className="widget-list list-none m-0 p-0">
                  {group.items.length > 0 ? (
                    group.items.map((item, idx) => (
                      <li
                        key={item.id || idx}
                        onClick={() => onSelectWidgetItem(item)}
                        className="flex justify-between items-center py-2.5 px-3.5 text-xs text-slate-200 border-b border-white/5 last:border-b-0 cursor-pointer hover:bg-white/[0.03] transition-colors gap-2"
                      >
                        <span className="item-title whitespace-nowrap overflow-hidden text-ellipsis max-w-[240px] text-slate-200 hover:text-white">
                          {item.title}
                        </span>
                        <span className="item-date text-[#94a3b8] text-[11px] shrink-0">
                          {item.date}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="py-2.5 px-3.5 text-xs border-b-0">
                      <span className="item-title empty-text text-[#94a3b8] italic text-xs">
                        {group.emptyText || 'Chưa có dữ liệu'}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
