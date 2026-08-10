import React, { useState, useMemo, useEffect } from 'react';
import { Property, PropertyType, ProjectCategory, PropertyCategory, HeightCategory, Language, HIGH_RISE_CATEGORIES, LOW_RISE_CATEGORIES, FLOOR_RENTAL_CATEGORIES, isAdminProperty } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilter } from '../components/PropertyFilter';
import { LayoutGrid, List, SearchX, Grid2x2, ShieldCheck } from 'lucide-react';
import { getTranslation } from '../lib/i18n';

interface PropertiesPageProps {
  properties: Property[];
  language: Language;
  initialType?: PropertyType | 'all';
  initialProject?: ProjectCategory | 'all';
  initialHeightCategory?: HeightCategory;
  initialCategory?: PropertyCategory | 'all';
  onSelectProperty: (property: Property) => void;
  savedIds: string[];
  onToggleSave: (property: Property) => void;
  compareIds: string[];
  onToggleCompare: (property: Property) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  properties,
  language,
  initialType = 'all',
  initialProject = 'all',
  initialHeightCategory = 'all',
  initialCategory = 'all',
  onSelectProperty,
  savedIds,
  onToggleSave,
  compareIds,
  onToggleCompare
}) => {
  const t = getTranslation(language);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PropertyType | 'all'>(initialType);
  const [selectedProject, setSelectedProject] = useState<ProjectCategory | 'all'>(initialProject);
  const [selectedHeightCategory, setSelectedHeightCategory] = useState<HeightCategory>(initialHeightCategory);
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory | 'all'>(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [furniture, setFurniture] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid-3col' | 'grid-2col' | 'grid' | 'list'>(() => {
    return (localStorage.getItem('hb_properties_view_mode') as any) || 'list';
  });

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  useEffect(() => {
    setSelectedHeightCategory(initialHeightCategory);
  }, [initialHeightCategory]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedProject('all');
    setSelectedHeightCategory('all');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setFurniture('');
    setSortBy('newest');
  };

  // Filter & Sorting Logic
  const filteredProperties = useMemo(() => {
    let list = [...properties];

    if (selectedType !== 'all') {
      list = list.filter(p => p.type === selectedType);
    }
    if (selectedProject !== 'all') {
      list = list.filter(p => p.project === selectedProject);
      // Quy định: Các căn bán/cho thuê trong mục dự án chỉ hiển thị căn của Admin và Admin tổng đăng
      list = list.filter(p => isAdminProperty(p));
    }

    // Height Category Filtering (Cao tầng, Thấp tầng, Thuê tầng)
    if (selectedHeightCategory === 'cao-tang') {
      list = list.filter(p => HIGH_RISE_CATEGORIES.includes(p.category));
    } else if (selectedHeightCategory === 'thap-tang') {
      list = list.filter(p => LOW_RISE_CATEGORIES.includes(p.category));
    } else if (selectedHeightCategory === 'thue-tang') {
      list = list.filter(p => FLOOR_RENTAL_CATEGORIES.includes(p.category) || p.category === 'shophouse');
    }

    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (furniture) {
      if (furniture === 'full') {
        list = list.filter(p => p.furniture === 'full' || (p.completionStatus && p.completionStatus.toLowerCase().includes('full')) || (p.furnitureDetail && p.furnitureDetail.toLowerCase().includes('full')));
      } else if (furniture === 'basic') {
        list = list.filter(p => p.furniture === 'basic' || (p.completionStatus && p.completionStatus.toLowerCase().includes('cơ bản')));
      } else if (furniture === 'raw') {
        list = list.filter(p => p.furniture === 'raw' || (p.completionStatus && (p.completionStatus.toLowerCase().includes('thô') || p.completionStatus.toLowerCase().includes('nguyên bản'))));
      } else {
        const target = furniture.toLowerCase();
        list = list.filter(p =>
          p.furniture === target ||
          (p.completionStatus && p.completionStatus.toLowerCase().includes(target)) ||
          (p.furnitureDetail && p.furnitureDetail.toLowerCase().includes(target)) ||
          (p.completionDetail && p.completionDetail.toLowerCase().includes(target))
        );
      }
    }
    if (bedrooms) {
      list = list.filter(p => p.bedrooms >= Number(bedrooms));
    }
    if (minPrice) {
      list = list.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      list = list.filter(p => p.price <= Number(maxPrice));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.subdivision && p.subdivision.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'area-desc') {
      list.sort((a, b) => b.area - a.area);
    } else {
      // newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [properties, selectedType, selectedProject, selectedHeightCategory, selectedCategory, furniture, bedrooms, minPrice, maxPrice, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-3">
      
      {/* Header Title & View Toggle */}
      <div className="flex flex-row items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Quỹ Căn Mua Bán & Cho Thuê
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              {filteredProperties.length} căn
            </span>
          </h1>
        </div>

        {/* Grid / List View Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg shrink-0 gap-0.5 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setViewMode('grid-3col');
              localStorage.setItem('hb_properties_view_mode', 'grid-3col');
            }}
            className={`px-2 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
              viewMode === 'grid-3col' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Hiển thị Lưới 3 Cột"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3 Cột</span>
          </button>
          <button
            onClick={() => {
              setViewMode('grid-2col');
              localStorage.setItem('hb_properties_view_mode', 'grid-2col');
            }}
            className={`px-2 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
              viewMode === 'grid-2col' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Hiển thị 2 cột ô vuông"
          >
            <Grid2x2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2 Cột</span>
          </button>
          <button
            onClick={() => {
              setViewMode('grid');
              localStorage.setItem('hb_properties_view_mode', 'grid');
            }}
            className={`px-2 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
              viewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Hiển thị 1 cột thẻ lớn"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1 Cột</span>
          </button>
          <button
            onClick={() => {
              setViewMode('list');
              localStorage.setItem('hb_properties_view_mode', 'list');
            }}
            className={`px-2 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Hiển thị dạng danh sách hàng ngang"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Danh sách</span>
          </button>
        </div>
      </div>

      {/* Project Filter Admin Only Notice */}
      {selectedProject !== 'all' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-purple-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              Đang xem Quỹ căn dự án: Hệ thống chỉ hiển thị thông tin căn bán và cho thuê của Admin & Admin Tổng đăng. (Tin từ các đối tác khác tự động bị ẩn tại mục dự án).
            </span>
          </div>
          <button
            onClick={() => setSelectedProject('all')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-[11px] shrink-0 transition shadow cursor-pointer"
          >
            Xem Tất Cả Dự Án
          </button>
        </div>
      )}

      {/* Filter Component */}
      <PropertyFilter
        language={language}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedHeightCategory={selectedHeightCategory}
        setSelectedHeightCategory={setSelectedHeightCategory}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        bedrooms={bedrooms}
        setBedrooms={setBedrooms}
        furniture={furniture}
        setFurniture={setFurniture}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReset={handleResetFilters}
      />

      {/* Property Cards Results */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <SearchX className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Không tìm thấy bất động sản phù hợp</h3>
          <p className="text-xs text-slate-500">Vui lòng thử điều chỉnh lại bộ lọc giá, số phòng ngủ hoặc từ khóa tìm kiếm.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Xóa Toàn Bộ Bộ Lọc
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid-3col'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6'
            : viewMode === 'grid-2col'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5'
            : viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
            : 'space-y-4'
        }>
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              language={language}
              onSelect={onSelectProperty}
              isSaved={savedIds.includes(property.id)}
              onToggleSave={onToggleSave}
              isCompared={compareIds.includes(property.id)}
              onToggleCompare={onToggleCompare}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

    </div>
  );
};
