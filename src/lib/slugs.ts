export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .trim()
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
}

export const PROJECT_SLUG_MAP: Record<string, string> = {
  'ocean-park-2': 'vinhomes-ocean-park-2',
  'ocean-park-3': 'vinhomes-ocean-park-3',
  'ocean-park-1': 'vinhomes-ocean-park-1',
  'ha-long-xanh': 'vinhomes-ha-long-xanh',
  'smart-city': 'vinhomes-smart-city',
  'grand-park': 'vinhomes-grand-park',
  'golden-crown': 'golden-crown-hai-phong',
  'royal-island': 'vinhomes-royal-island'
};

export const REVERSE_PROJECT_SLUG_MAP: Record<string, string> = {
  'vinhomes-ocean-park-2': 'ocean-park-2',
  'vinhomes-ocean-park-3': 'ocean-park-3',
  'vinhomes-ocean-park-1': 'ocean-park-1',
  'vinhomes-ha-long-xanh': 'ha-long-xanh',
  'vinhomes-smart-city': 'smart-city',
  'vinhomes-grand-park': 'grand-park',
  'golden-crown-hai-phong': 'golden-crown',
  'vinhomes-royal-island': 'royal-island',
  'ocean-park-2': 'ocean-park-2',
  'ocean-park-3': 'ocean-park-3',
  'ocean-park-1': 'ocean-park-1',
  'ha-long-xanh': 'ha-long-xanh',
  'smart-city': 'smart-city',
  'grand-park': 'grand-park'
};

export function getProjectSlug(projectId: string): string {
  return PROJECT_SLUG_MAP[projectId] || slugify(projectId) || 'vinhomes-ocean-park-2';
}

export function getProjectIdFromSlug(slug: string): string {
  return REVERSE_PROJECT_SLUG_MAP[slug] || slug;
}

export function getPropertyDetailUrl(property: { id: string; project?: string; title?: string }): string {
  const projSlug = property.project ? getProjectSlug(property.project) : 'bat-dong-san';
  const cleanId = encodeURIComponent(property.id);
  return `/${projSlug}/${cleanId}`;
}

export function getNewsDetailUrl(article: { id: string; category?: string; title?: string }): string {
  const catSlug = article.category ? slugify(article.category) : 'tin-tuc-chung';
  const titleSlug = article.title ? slugify(article.title) : article.id;
  return `/tin-tuc/${catSlug}/${encodeURIComponent(article.id)}`;
}

export function getSubdivisionUrl(projectId: string, subdivisionNameOrId: string): string {
  const projSlug = getProjectSlug(projectId);
  const subSlug = slugify(subdivisionNameOrId.replace(/^phân khu\s*/i, ''));
  return `/du-an/${projSlug}/phan-khu/${subSlug}`;
}

export function getAmenityUrl(projectId: string, amenityNameOrId: string): string {
  const projSlug = getProjectSlug(projectId);
  const amenitySlug = slugify(amenityNameOrId);
  return `/du-an/${projSlug}/tien-ich/${amenitySlug}`;
}

export function getServiceDetailUrl(service: { id: string; categoryId?: string; title?: string }): string {
  const slug = service.id;
  return `/dich-vu-cu-dan/${encodeURIComponent(slug)}`;
}

export function getServiceCategoryUrl(categoryId: string, subCategoryId?: string): string {
  if (subCategoryId && subCategoryId !== 'all') {
    return `/dich-vu-cu-dan/danh-muc/${encodeURIComponent(categoryId)}/${encodeURIComponent(subCategoryId)}`;
  }
  return `/dich-vu-cu-dan/danh-muc/${encodeURIComponent(categoryId)}`;
}

export function getStoreDetailUrl(store: { slug?: string; id: string }): string {
  return `/gian-hang/${encodeURIComponent(store.slug || store.id)}`;
}

export function getProductDetailUrl(
  product: { id: string; name?: string; storeId?: string },
  storeSlug?: string
): string {
  const pSlug = product.name ? slugify(product.name) : product.id;
  if (storeSlug) {
    return `/gian-hang/${encodeURIComponent(storeSlug)}/san-pham/${encodeURIComponent(product.id)}/${encodeURIComponent(pSlug)}`;
  }
  return `/san-pham/${encodeURIComponent(product.id)}/${encodeURIComponent(pSlug)}`;
}

export function getJobDetailUrl(job: { id: string; title?: string }): string {
  return `/tuyen-dung/viec-lam/${encodeURIComponent(job.id)}`;
}

export function getCandidateCvUrl(candidate: { id: string; fullName?: string }): string {
  return `/tuyen-dung/ung-vien/${encodeURIComponent(candidate.id)}`;
}

export function getRecruitmentIndustryUrl(industryId: string): string {
  return `/tuyen-dung/nganh/${encodeURIComponent(industryId)}`;
}

export function getCommunityDetailUrl(groupSlug: string): string {
  return `/cong-dong/${encodeURIComponent(groupSlug)}`;
}
