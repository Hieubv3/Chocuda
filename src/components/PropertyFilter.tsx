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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
      
      {/* FLOATING SUB-MENU BAR - MENU PHỤ NỔI LỌC CĂN */}
      <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-black uppercase text-slate-200 tracking-wide">
            MENU NỔI PHÂN LOẠI CĂN:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => handleFloatingQuickSelect('all', 'all')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1 ${
              selectedType === 'all' && selectedHeightCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tất Cả Quỹ Căn</span>
          </button>

          <button
            onClick={() => handleFloatingQuickSelect('sale', 'cao-tang')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1 ${
              selectedType === 'sale' && selectedHeightCategory === 'cao-tang'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Bán Cao Tầng (Căn Hộ)</span>
          </button>

          <button
            onClick={() => handleFloatingQuickSelect('sale', 'thap-tang')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1 ${
              selectedType === 'sale' && selectedHeightCategory === 'thap-tang'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Bán Thấp Tầng (Shophouse / Villa)</span>
          </button>

          <button
            onClick={() => handleFloatingQuickSelect('rent', 'cao-tang')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1 ${
              selectedType === 'rent' && selectedHeightCategory === 'cao-tang'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Cho Thuê Cao Tầng</span>
          </button>

          <button
            onClick={() => handleFloatingQuickSelect('rent', 'thap-tang')}
            className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1 ${
              selectedType === 'rent' && (selectedHeightCategory === 'thap-tang' || selectedHeightCategory === 'thue-tang')
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-purple-400" />
            <span>Cho Thuê Thấp Tầng / Thuê Tầng</span>
          </button>
        </div>
      </div>

      {/* Search Input & Segment Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        
        {/* Sale / Rent Segment Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl shrink-0 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
              selectedType === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Tất Cả
          </button>
          <button
            onClick={() => setSelectedType('sale')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
              selectedType === 'sale'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Mua Bán
          </button>
          <button
            onClick={() => setSelectedType('rent')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
              selectedType === 'rent'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Cho Thuê
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo phân khu, vị trí, từ khóa (Ví dụ: Chà Là, San Hô, 2PN, Thuê tầng...)"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Toggle Advanced Filters Button */}
        <button
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition"
        >
          <SlidersHorizontal className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
          {advancedOpen ? 'Thu gọn bộ lọc' : 'Bộ lọc nâng cao'}
        </button>

        {/* Reset Filter Button */}
        <button
          onClick={onReset}
          className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition"
          title={t.filters.reset}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Selectors Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        
        {/* Project Selector */}
        <div>
          <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Dự án BĐS</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value as any)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t.filters.allProjects}</option>
            <option value="ocean-park-2">Vinhomes Ocean Park 2 (The Empire)</option>
            <option value="ocean-park-3">Vinhomes Ocean Park 3 (Grand Park)</option>
            <option value="ocean-park-1">Vinhomes Ocean Park 1 (Gia Lâm)</option>
            <option value="ha-long-xanh">Vinhomes Hạ Long Xanh (Quảng Ninh)</option>
            <option value="smart-city">Vinhomes Smart City (Tây Mỗ)</option>
            <option value="royal-island">Vinhomes Royal Island (Vũ Yên - Hải Phòng)</option>
            <option value="grand-park">Vinhomes Grand Park (TP. Thủ Đức)</option>
            <option value="khac">Dự án khác</option>
          </select>
        </div>

        {/* Height / Product Group Selector */}
        <div>
          <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Phân loại Cao / Thấp Tầng</label>
          <select
            value={selectedHeightCategory}
            onChange={(e) => setSelectedHeightCategory && setSelectedHeightCategory(e.target.value as HeightCategory)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tất cả Cao & Thấp tầng</option>
            <option value="cao-tang">🏢 Cao Tầng (Căn hộ chung cư / Studio)</option>
            <option value="thap-tang">🏡 Thấp Tầng (Shophouse / Liền Kề / Biệt Thự)</option>
            <option value="thue-tang">🏬 Thuê Tầng / Mặt Bằng Kinh Doanh</option>
          </select>
        </div>

        {/* Category Selector with Optgroups */}
        <div>
          <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Loại chi tiết bất động sản</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t.filters.allCategories}</option>
            
            <optgroup label="🏢 CAO TẦNG (CĂN HỘ CHUNG CƯ)">
              <option value="studio">Căn Hộ Studio</option>
              <option value="1pn">Căn Hộ 1PN</option>
              <option value="2pn">Căn Hộ 2PN</option>
              <option value="3pn">Căn Hộ 3PN+</option>
            </optgroup>

            <optgroup label="🏡 THẤP TẦNG (BIỆT THỰ & SHOPHOUSE)">
              <option value="shophouse">Shophouse Thương Mại</option>
              <option value="lien-ke">Nhà Liền Kề</option>
              <option value="biet-thu-song-lap">Biệt Thự Song Lập</option>
              <option value="biet-thu-don-lap">Biệt Thự Đơn Lập</option>
            </optgroup>

            <optgroup label="🏬 THUÊ TẦNG / MẶT BẰNG">
              <option value="thue-tang">Thuê Tầng / Mặt Bằng Shophouse</option>
              <option value="mat-bang">Mặt Bằng Kinh Doanh Sầm Uất</option>
            </optgroup>
          </select>
        </div>

        {/* Sort Selector */}
        <div>
          <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">{t.filters.sortBy}</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="newest">{t.filters.newest}</option>
            <option value="price-asc">{t.filters.priceLowToHigh}</option>
            <option value="price-desc">{t.filters.priceHighToLow}</option>
            <option value="area-desc">{t.filters.areaHighToLow}</option>
          </select>
        </div>

      </div>

      {/* Advanced Collapsible Filter Options */}
      {advancedOpen && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Số phòng ngủ</label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="">Tất cả số phòng</option>
              <option value="1">Từ 1 phòng ngủ</option>
              <option value="2">Từ 2 phòng ngủ</option>
              <option value="3">Từ 3 phòng ngủ</option>
              <option value="4">Từ 4+ phòng ngủ</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Giá tối thiểu (Tỷ / Tr)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="VD: 3.5"
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Trạng thái nội thất</label>
            <select
              value={furniture}
              onChange={(e) => setFurniture(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
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
