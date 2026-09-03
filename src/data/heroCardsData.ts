// ============================================================
// HERO CARDS CONFIG - 4 thẻ danh mục trang chủ (Mua Bán / Cho Thuê / Dịch Vụ / Việc Làm)
// Admin có thể thay ảnh đại diện từng thẻ (upload hoặc dán URL) - lưu localStorage
// ============================================================

export interface HeroCardConfig {
  id: 'sale' | 'rent' | 'services' | 'recruitment';
  title: string;
  image: string;
  active: boolean;
}

export const HERO_CARDS_STORAGE_KEY = 'chocudan24h_hero_cards';

export const DEFAULT_HERO_CARDS: HeroCardConfig[] = [
  { id: 'sale', title: 'Mua Bán BĐS', image: '/images/demo/project-tower.jpg', active: true },
  { id: 'rent', title: 'Cho Thuê BĐS', image: '/images/demo/project-apartment.jpg', active: true },
  { id: 'services', title: 'Dịch Vụ Cư Dân', image: '/images/demo/ad-service.jpg', active: true },
  { id: 'recruitment', title: 'Tuyển Dụng Việc Làm', image: '/images/demo/hero-city-2.jpg', active: true }
];

export function loadHeroCards(): HeroCardConfig[] {
  try {
    const saved = localStorage.getItem(HERO_CARDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 4) {
        return parsed.map((c: Partial<HeroCardConfig>) => ({
          id: c.id as HeroCardConfig['id'],
          title: c.title || '',
          image: c.image || '',
          active: c.active !== false
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to load hero cards:', e);
  }
  return DEFAULT_HERO_CARDS;
}

export function saveHeroCards(cards: HeroCardConfig[]): void {
  try {
    localStorage.setItem(HERO_CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.warn('Failed to save hero cards:', e);
  }
}