import { AREA_STORAGE_KEY } from '../components/AreaSelectModal';

/** Gắn thành phố cho từng dự án Vinhomes (admin có thể chỉnh lại sau) */
export const PROJECT_AREA: Record<string, string> = {
  'ocean-park': 'ha-noi',
  'ocean-park-1': 'ha-noi',
  'ocean-park-2': 'ha-noi',
  'ocean-park-3': 'ha-noi',
  'smart-city': 'ha-noi',
  'riverside': 'ha-noi',
  'golden-avenue': 'quang-ninh',
  'royal-island': 'hai-phong',
  'ha-long-xanh': 'quang-ninh',
  'grand-park': 'tp-hcm',
  'green-city-hoc-mon': 'tp-hcm',
  'green-paradise-can-gio': 'tp-hcm',
  'tan-my-hau-nghia': 'long-an',
  'lang-van-da-nang': 'da-nang',
};

export function getStoredAreaKey(): string | null {
  try {
    const raw = localStorage.getItem(AREA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.key || null;
  } catch {
    return null;
  }
}

/**
 * Đẩy các item thuộc khu vực người dùng lên trước (không ẩn item nơi khác).
 */
export function prioritizeByArea<T>(
  items: T[],
  areaKey: string | null,
  getProject: (item: T) => string | undefined
): T[] {
  if (!areaKey || areaKey === 'khac' || !Array.isArray(items)) return items;
  const match: T[] = [];
  const rest: T[] = [];
  for (const it of items) {
    const proj = getProject(it);
    if (proj && PROJECT_AREA[proj] === areaKey) match.push(it);
    else rest.push(it);
  }
  return [...match, ...rest];
}
