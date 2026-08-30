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
  // URL chứa title slug + id để SEO đánh giá cao
  const titleSlug = property.title ? slugify(property.title) : '';
  if (titleSlug) {
    return `/${projSlug}/${encodeURIComponent(titleSlug)}-${cleanId}`;
  }
  return `/${projSlug}/${cleanId}`;
}

/**
 * Tách id thật từ slug dạng "{titleSlug}-{id}".
 * Nếu slug không chứa id (chỉ là id thuần), trả về nguyên slug.
 * Hỗ trợ các dạng id:
 *  - Có prefix + số: prop-101, job-1, cand-2, news-101
 *  - Có prefix + chữ (news): news-ha-long-xanh
 *  - Số thuần: 101
 */
const ID_PREFIXES = ['news', 'prop', 'job', 'cand', 'cv', 'store', 'prod', 'svc', 'emp', 'group'];

export function extractIdFromSlug(slug: string): string {
  if (!slug) return '';
  const decoded = decodeURIComponent(slug).trim();
  if (!decoded) return '';

  // 1. Nếu slug là id thuần (không có title slug), trả về nguyên
  //    (id thuần thường bắt đầu bằng prefix đã biết hoặc là số)
  if (ID_PREFIXES.some(p => decoded === p || decoded.startsWith(`${p}-`)) && !decoded.includes('--')) {
    // Kiểm tra: nếu toàn bộ slug là một id hợp lệ (prefix + phần còn lại không có dấu gạch thừa)
    const prefix = ID_PREFIXES.find(p => decoded.startsWith(`${p}-`));
    if (prefix) {
      const rest = decoded.slice(prefix.length + 1);
      // Nếu phần còn lại không chứa dấu gạch, đây là id thuần
      if (!rest.includes('-')) {
        return decoded;
      }
    }
  }

  // 2. Tìm id ở cuối slug dạng "{titleSlug}-{id}"
  //    Ưu tiên tìm id có prefix đã biết (news-, prop-, job-, cand-...)
  const parts = decoded.split('-');
  // 2a. Duyệt từ cuối, tìm candidate bắt đầu bằng prefix id đã biết
  for (let i = parts.length - 1; i >= 0; i--) {
    const candidate = parts.slice(i).join('-');
    if (ID_PREFIXES.some(p => candidate.startsWith(`${p}-`))) {
      return candidate;
    }
  }
  // 2b. Không tìm thấy prefix — xét id dạng số thuần ở cuối
  const lastPart = parts[parts.length - 1];
  if (/^\d+$/.test(lastPart)) {
    return lastPart;
  }
  return decoded;
}

export function getNewsDetailUrl(article: { id: string; category?: string; title?: string }): string {
  const catSlug = article.category ? slugify(article.category) : 'tin-tuc-chung';
  const titleSlug = article.title ? slugify(article.title) : article.id;
  // URL chứa title slug + id để SEO đánh giá cao (từ khóa trong URL, vẫn duy nhất nhờ id)
  return `/tin-tuc/${catSlug}/${encodeURIComponent(titleSlug)}-${encodeURIComponent(article.id)}`;
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

export function getJobDetailUrl(job?: { id?: string; title?: string } | string | null): string {
  if (!job) return '/tuyen-dung';
  const jId = typeof job === 'string' ? job : (job.id || 'job-detail');
  const jTitle = typeof job === 'object' && job.title ? slugify(job.title) : '';
  // URL chứa title slug để SEO đánh giá cao
  if (jTitle) {
    return `/tuyen-dung/viec-lam/${encodeURIComponent(jId)}/${encodeURIComponent(jTitle)}`;
  }
  return `/tuyen-dung/viec-lam/${encodeURIComponent(jId)}`;
}

export function getCandidateCvUrl(candidate?: { id?: string; fullName?: string } | string | null): string {
  if (!candidate) return '/tuyen-dung';
  const cId = typeof candidate === 'string' ? candidate : (candidate.id || 'ung-vien');
  const cName = typeof candidate === 'object' && candidate.fullName ? slugify(candidate.fullName) : '';
  // URL chứa tên slug để SEO đánh giá cao
  if (cName) {
    return `/tuyen-dung/ung-vien/${encodeURIComponent(cId)}/${encodeURIComponent(cName)}`;
  }
  return `/tuyen-dung/ung-vien/${encodeURIComponent(cId)}`;
}

export function getRecruitmentIndustryUrl(industryId?: string | null): string {
  if (!industryId) return '/tuyen-dung';
  return `/tuyen-dung/nganh/${encodeURIComponent(industryId)}`;
}

export function getEmployerProfileUrl(employer?: { id?: string; employerUserId?: string; companyName?: string } | string | null): string {
  if (!employer) return '/tuyen-dung';
  if (typeof employer === 'string') {
    return `/tuyen-dung/nha-tuyen-dung/${encodeURIComponent(employer)}/doanh-nghiep`;
  }
  const empId = employer.employerUserId || employer.id || (employer.companyName ? slugify(employer.companyName) : 'nha-tuyen-dung');
  const compSlug = employer.companyName ? slugify(employer.companyName) : 'doanh-nghiep';
  return `/tuyen-dung/nha-tuyen-dung/${encodeURIComponent(empId)}/${encodeURIComponent(compSlug)}`;
}

export function getCommunityDetailUrl(groupSlug: string): string {
  return `/cong-dong/${encodeURIComponent(groupSlug)}`;
}
