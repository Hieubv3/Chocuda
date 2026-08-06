import React from 'react';
import { Search, RotateCcw, SlidersHorizontal, Building2, Home, Store, Sparkles, Layers } from 'lucide-react';
import { PropertyType, ProjectCategory, PropertyCategory, HeightCategory, Language } from '../types';
import { getTranslation } from '../lib/i18n';

interface PropertyFilterProps {
  language: Language;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedType: PropertyType | 'all';
  setSelectedType: (val: PropertyType | 'all') => void;
  selectedProject: ProjectCategory | 'all';
  setSelectedProject: (val: ProjectCategory | 'all') => void;
  selectedCategory: PropertyCategory | 'all';
  setSelectedCategory: (val: PropertyCategory | 'all') => void;
  selectedHeightCategory?: HeightCategory;
  setSelectedHeightCategory?: (val: HeightCategory) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  bedrooms: string;
  setBedrooms: (val: string) => void;
  furniture: string;
  setFurniture: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  onReset: () => void;
}

export const PropertyFilter: React.FC<PropertyFilterProps> = ({
  language,
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedProject,
  setSelectedProject,
  selectedCategory,
  setSelectedCategory,
  selectedHeightCategory = 'all',
  setSelectedHeightCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  bedrooms,
  setBedrooms,
  furniture,
  setFurniture,
  sortBy,
  setSortBy,
  onReset
}) => {
  const t = getTranslation(language);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  const handleFloatingQuickSelect = (type: PropertyType | 'all', height: HeightCategory) => {
    setSelectedType(type);
    if (setSelectedHeightCategory) {
      setSelectedHeightCategory(height);
    }
    setSelectedCategory('all');
  };

  // Count active filters
  const activeCount = React.useMemo(() => {
    let count = 0;
    if (selectedProject !== 'all') count++;
    if (selectedHeightCategory !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (bedrooms) count++;
    if (furniture) count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [selectedProject, selectedHeightCategory, selectedCategory, minPrice, maxPrice, bedrooms, furniture, sortBy]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-2.5 sm:p-3 shadow-xs border border-slate-200 dark:border-slate-700 space-y-2">
      
      {/* Top Main Controls Bar: Type Switcher + Search + Filter Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        
        {/* Type Switcher Pills */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg shrink-0 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-2.5 py-1.5 rounded-md font-bold transition whitespace-nowrap ${
              selectedType === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất Cả
          </button>
          <button
            onClick={() => setSelectedType('sale')}
            className={`px-2.5 py-1.5 rounded-md font-bold transition whitespace-nowrap ${
              selectedType === 'sale'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mua Bán
          </button>
          <button
            onClick={() => setSelectedType('rent')}
            className={`px-2.5 py-1.5 rounded-md font-bold transition whitespace-nowrap ${
              selectedType === 'rent'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cho Thuê
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm vị trí, phân khu, từ khóa (VD: Chà Là, 2PN...)"
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Actions: Toggle Filter Dropdowns & Reset */}
        <div className="flex items-center gap-1.5 shrink-0 justify-end">
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center shrink-0 transition border ${
              advancedOpen || activeCount > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
            <span>Bộ lọc</span>
            {activeCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] rounded-full font-black">
                {activeCount}
              </span>
            )}
          </button>

          {(searchQuery || activeCount > 0 || selectedType !== 'all') && (
            <button
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
              title={t.filters.reset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* COMPACT CATEGORY QUICK PILLS (Horizontal Scrollable Strip) */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px] border-t border-slate-100 dark:border-slate-700/60 pt-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Nhanh:
        </span>

        <button
          onClick={() => handleFloatingQuickSelect('all', 'all')}
          className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
            selectedType === 'all' && selectedHeightCategory === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-3 h-3 text-emerald-500" />
          <span>Tất Cả</span>
        </button>

        <button
          onClick={() => handleFloatingQuickSelect('sale', 'cao-tang')}
          className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
            selectedType === 'sale' && selectedHeightCategory === 'cao-tang'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-3 h-3 text-sky-500" />
          <span>Bán Căn Hộ</span>
        </button>

        <button
          onClick={() => handleFloatingQuickSelect('sale', 'thap-tang')}
          className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
            selectedType === 'sale' && selectedHeightCategory === 'thap-tang'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Home className="w-3 h-3 text-amber-500" />
          <span>Bán Thấp Tầng</span>
        </button>

        <button
          onClick={() => handleFloatingQuickSelect('rent', 'cao-tang')}
          className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
            selectedType === 'rent' && selectedHeightCategory === 'cao-tang'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-3 h-3 text-teal-500" />
          <span>Thuê Căn Hộ</span>
        </button>

        <button
          onClick={() => handleFloatingQuickSelect('rent', 'thap-tang')}
          className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
            selectedType === 'rent' && (selectedHeightCategory === 'thap-tang' || selectedHeightCategory === 'thue-tang')
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Store className="w-3 h-3 text-purple-500" />
          <span>Thuê Thấp Tầng</span>
        </button>
      </div>

      {/* COLLAPSIBLE DETAILED FILTERS PANEL */}
      {advancedOpen && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs animate-in fade-in duration-150">
          
          {/* Project Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Dự án</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value as any)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.filters.allProjects}</option>
              <option value="ocean-park-2">Vinhomes Ocean Park 2</option>
              <option value="ocean-park-3">Vinhomes Ocean Park 3</option>
              <option value="ocean-park-1">Vinhomes Ocean Park 1</option>
              <option value="smart-city">Vinhomes Smart City</option>
              <option value="grand-park">Vinhomes Grand Park</option>
              <option value="ha-long-xanh">Vinhomes Hạ Long Xanh</option>
              <option value="royal-island">Vinhomes Royal Island</option>
              <option value="riverside">Vinhomes Riverside & Harmony</option>
              <option value="golden-avenue">Vinhomes Golden Avenue</option>
              <option value="tan-my-hau-nghia">Vinhomes Tân Mỹ Hậu Nghĩa</option>
              <option value="green-paradise-can-gio">Vinhomes Green Paradise Cần Giờ</option>
              <option value="green-city-hoc-mon">Vinhomes Green City Hóc Môn</option>
              <option value="lang-van-da-nang">Vinhomes Làng Vân Đà Nẵng</option>
              <option value="khac">Dự án khác</option>
            </select>
          </div>

          {/* Height / Product Group Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Phân loại tầng</label>
            <select
              value={selectedHeightCategory}
              onChange={(e) => setSelectedHeightCategory && setSelectedHeightCategory(e.target.value as HeightCategory)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Tất cả Cao & Thấp tầng</option>
              <option value="cao-tang">🏢 Cao Tầng (Căn hộ / Studio)</option>
              <option value="thap-tang">🏡 Thấp Tầng (Liền kề / Villa)</option>
              <option value="thue-tang">🏬 Thuê Tầng / Mặt bằng</option>
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Loại căn chi tiết</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.filters.allCategories}</option>
              
              <optgroup label="🏢 CAO TẦNG">
                <option value="studio">Căn Hộ Studio</option>
                <option value="1pn">Căn Hộ 1PN</option>
                <option value="2pn">Căn Hộ 2PN</option>
                <option value="3pn">Căn Hộ 3PN+</option>
              </optgroup>

              <optgroup label="🏡 THẤP TẦNG">
                <option value="shophouse">Shophouse</option>
                <option value="lien-ke">Nhà Liền Kề</option>
                <option value="biet-thu-song-lap">Biệt Thự Song Lập</option>
                <option value="biet-thu-don-lap">Biệt Thự Đơn Lập</option>
              </optgroup>

              <optgroup label="🏬 THUÊ TẦNG">
                <option value="thue-tang">Thuê Tầng Shophouse</option>
                <option value="mat-bang">Mặt Bằng Kinh Doanh</option>
              </optgroup>
            </select>
          </div>

          {/* Sort Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">{t.filters.sortBy}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="newest">{t.filters.newest}</option>
              <option value="price-asc">{t.filters.priceLowToHigh}</option>
              <option value="price-desc">{t.filters.priceHighToLow}</option>
              <option value="area-desc">{t.filters.areaHighToLow}</option>
            </select>
          </div>

          {/* Secondary filter fields */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Số phòng ngủ</label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
            >
              <option value="">Tất cả phòng</option>
              <option value="1">Từ 1 PN</option>
              <option value="2">Từ 2 PN</option>
              <option value="3">Từ 3 PN</option>
              <option value="4">Từ 4+ PN</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Giá tối thiểu</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Tỷ / Tr"
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Giá tối đa</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Tỷ / Tr"
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Nội thất</label>
            <select
              value={furniture}
              onChange={(e) => setFurniture(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
            >
              <option value="">Tất cả nội thất</option>
              <option value="full">Đầy đủ nội thất</option>
              <option value="basic">Nội thất cơ bản</option>
              <option value="raw">Bàn giao thô</option>
            </select>
          </div>

        </div>
      )}

    </div>
  );
};
