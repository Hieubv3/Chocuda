// =====================================================================
// ETL: di trú dữ liệu cũ (app_data_store.json + initial data) -> Supabase
// File: chocuda-supabase/scripts/migrate-json-to-supabase.mjs
//
// CHẠY Ở SERVER (Node), dùng SERVICE_ROLE_KEY (bypass RLS để ghi hàng loạt).
// Chạy:  node scripts/migrate-json-to-supabase.mjs ./app_data_store.json
//
// Đặc điểm:
//  - IDEMPOTENT: dùng upsert theo `id` cũ (đã map sang uuid ổn định qua md5).
//  - KHÔNG mất dữ liệu: bảng nào không map được sẽ được dump ra <table>.unmapped.json.
//  - Đăng ký trước toàn bộ user với Supabase Auth (email-only) rồi mới map FK.
// =====================================================================
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// Map id cũ (chuỗi) -> uuid ổn định, để chạy lại không tạo trùng.
const toUuid = (s) => {
  const h = crypto.createHash('md5').update(String(s ?? '')).digest('hex');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20,32)}`;
};

const src = JSON.parse(fs.readFileSync(process.argv[2] || './app_data_store.json', 'utf-8'));
const unmapped = {};
const stats = {};

async function chunkUpsert(table, rows, onConflict = 'id') {
  let ok = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error } = await sb.from(table).upsert(batch, { onConflict });
    if (error) { console.error(`[${table}] lỗi batch ${i}:`, error.message); }
    else ok += batch.length;
  }
  stats[table] = ok;
}

async function main() {
  // 1) USERS -> auth + profiles + user_sensitive
  const users = src.users ?? [];
  const profileRows = [], sensitiveRows = [];
  for (const u of users) {
    const id = u.id?.startsWith('user-') ? toUuid(u.id) : toUuid(u.id ?? u.email);
    // Tạo auth user (nếu chưa có). email tạm nếu thiếu.
    const email = u.email || `${id}@migrated.local`;
    try {
      await sb.auth.admin.createUser({ id, email, email_confirm: true, password: crypto.randomUUID() });
    } catch { /* đã tồn tại -> bỏ qua */ }

    profileRows.push({
      id, full_name: u.name ?? null, display_name: u.name ?? null,
      phone: u.phone ?? null, email, role: u.role ?? 'visitor',
      tier: u.tier ?? 'thuong', avatar_url: u.avatar ?? null, apartment: u.apartment ?? null,
      provider: u.provider ?? 'local', account_type: u.accountType ?? 'individual_resident',
      company_name: u.companyName ?? null, kyc_status: u.kycStatus === 'verified' ? 'verified' : 'unverified',
      balance: u.balance ?? 0, token_balance: u.tokenBalance ?? 0,
      affiliate_points: u.affiliatePoints ?? 0, up_tin_credits: u.upTinCredits ?? 0,
      business_categories: u.businessCategories ?? [],
      created_at: u.registeredAt ?? new Date().toISOString(),
    });
    // PII tách riêng
    if (u.idCardNumber || u.idCardFrontUrl || u.taxCode || u.businessLicenseUrl) {
      sensitiveRows.push({
        user_id: id, dob: u.dob ?? null, id_card_number: u.idCardNumber ?? null,
        id_card_front_url: u.idCardFrontUrl ?? null, id_card_back_url: u.idCardBackUrl ?? null,
        business_license_url: u.businessLicenseUrl ?? null, broker_license_url: u.brokerLicenseUrl ?? null,
        tax_code: u.taxCode ?? null, specialized_certificates: u.specializedCertificates ?? [],
      });
    }
  }
  await chunkUpsert('profiles', profileRows);
  await chunkUpsert('user_sensitive', sensitiveRows, 'user_id');

  // 2) PROPERTIES -> posts + properties
  const props = src.properties ?? [];
  const postRows = [], propRows = [];
  for (const p of props) {
    const pid = toUuid(p.id);
    const uid = toUuid(p.userId ?? p.sellerPhone ?? 'anon');
    postRows.push({
      id: pid, user_id: uid, post_type: 'property', title: p.title ?? '(không tiêu đề)',
      summary: p.priceDisplay ?? null, body: p.description ?? null, category: p.category ?? null,
      cover_image_url: p.images?.[0] ?? null, status: mapStatus(p.status),
      views_count: p.viewsCount ?? 0, published_at: p.createdAt ?? null,
      expires_at: p.expiresAt ?? null, metadata: { vipLevel: p.vipLevel, project: p.project, soDo: !!p.soDoImage },
      created_at: p.createdAt ?? new Date().toISOString(),
    });
    propRows.push({
      id: toUuid(`prop-${p.id}`), post_id: pid, user_id: uid, title: p.title ?? '',
      type: p.type ?? 'sale', project: p.project ?? null, category: p.category ?? null,
      price: num(p.price), price_display: p.priceDisplay ?? null, area: num(p.area),
      bedrooms: p.bedrooms ?? 0, bathrooms: p.bathrooms ?? 0, direction: p.direction ?? null,
      floor: p.floor ?? null, furniture: p.furniture ?? null, legal: p.legal ?? null,
      address: p.address ?? null, description: p.description ?? null,
      completion_status: p.completionStatus ?? null, subdivision: p.subdivision ?? null,
      seller_name: p.sellerName ?? null, seller_phone: p.sellerPhone ?? null, seller_role: p.sellerRole ?? null,
      status: mapStatus(p.status), vip_level: p.vipLevel ?? 'normal', vip_expires_at: p.vipExpiresAt ?? null,
      views_count: p.viewsCount ?? 0, duration_days: p.durationDays ?? 30,
      so_do_image: p.soDoImage ?? null, so_do_redacted_image: p.soDoRedactedImage ?? null,
      images: p.images ?? [], created_at: p.createdAt ?? new Date().toISOString(),
    });
  }
  await chunkUpsert('posts', postRows);
  await chunkUpsert('properties', propRows);

  // 3) NEWS -> knowledge_posts
  const kp = (src.news ?? []).map((n) => ({
    id: toUuid(`news-${n.id}`), user_id: null, title: n.title ?? '', summary: n.summary ?? null,
    content: n.content ?? null, category: n.category ?? null, source: n.source ?? 'manual',
    cover_image_url: n.image ?? null, author_name: n.author ?? null, views_count: n.views ?? 0,
    status: n.status === 'published' ? 'published' : 'draft',
    published_at: n.publishedAt ?? new Date().toISOString(),
  }));
  await chunkUpsert('knowledge_posts', kp);

  // 4) STORES + PRODUCTS
  const stores = [], productsRows = [];
  for (const s of src.stores ?? []) {
    const sid = toUuid(`store-${s.id}`);
    stores.push({
      id: sid, owner_id: toUuid(s.userId ?? s.ownerId ?? 'anon'), name: s.name ?? s.storeName ?? 'Gian hàng',
      description: s.description ?? null, logo_url: s.logo ?? null, banner_url: s.banner ?? null,
      phone: s.phone ?? null, address: s.address ?? null, business_category: s.businessCategory ?? null,
      status: mapStatus(s.status), created_at: s.createdAt ?? new Date().toISOString(),
    });
    for (const pr of s.products ?? []) {
      productsRows.push({
        id: toUuid(`product-${s.id}-${pr.id}`), store_id: sid, user_id: toUuid(s.userId ?? 'anon'),
        name: pr.name ?? '', description: pr.description ?? null, price: num(pr.price),
        price_display: pr.priceDisplay ?? null, unit: pr.unit ?? null, stock: pr.stock ?? 0,
        category: pr.category ?? null, images: pr.images ?? [], is_active: pr.isActive ?? true,
        status: mapStatus(pr.status ?? 'approved'), created_at: pr.createdAt ?? new Date().toISOString(),
      });
    }
  }
  await chunkUpsert('stores', stores);
  await chunkUpsert('products', productsRows);

  // 5) Các bảng còn lại: ghi vào unmapped để bạn quyết định (KHÔNG bỏ sót dữ liệu)
  const handled = new Set(['users','properties','news','stores','deletedIds']);
  for (const [k, v] of Object.entries(src)) {
    if (!handled.has(k) && Array.isArray(v) && v.length) unmapped[k] = v;
  }
  fs.writeFileSync('unmapped-data.json', JSON.stringify(unmapped, null, 2));
  fs.writeFileSync('migration-stats.json', JSON.stringify(stats, null, 2));

  console.log('=== Migration xong ===');
  console.table(stats);
  console.log('Bảng chưa map (đã dump ra unmapped-data.json):', Object.keys(unmapped));
}

function mapStatus(s) {
  switch (s) {
    case 'approved': case 'published': return 'approved';
    case 'rejected': return 'rejected';
    case 'draft': return 'draft';
    case 'sold': case 'archived': return 'archived';
    default: return 'pending';
  }
}
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

main().catch((e) => { console.error(e); process.exit(1); });
