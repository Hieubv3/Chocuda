// =====================================================================
// SUPABASE FETCH ADAPTER (drop-in, dual-run) — PHƯƠNG ÁN TỐI ƯU
// File: chocuda-supabase/src/lib/supabase/supabaseFetchAdapter.ts
//
// MỤC TIÊU: chuyển dữ liệu sang Supabase mà KHÔNG sửa 226 chỗ fetch() và
// KHÔNG đụng tới CSS/giao diện.
//
// CƠ CHẾ:
//   - Chèn vào window.fetch (app ĐÃ có installAuthFetchPatch ở api.ts).
//   - Với endpoint ĐÃ map => gọi Supabase, trả Response CÙNG shape JSON cũ
//     (mảng trực tiếp, đúng như server.ts đang res.json(...)).
//   - Với endpoint CHƯA map => passthrough về Express (fallback) => không vỡ.
//   - Bật/tắt bằng env VITE_SUPABASE_ADAPTER=on để A/B test an toàn.
//
// CÁCH DÙNG (trong main.tsx, SAU installAuthFetchPatch):
//   import { installSupabaseAdapter } from './lib/supabase/supabaseFetchAdapter';
//   installSupabaseAdapter(supabase);
// =====================================================================
import type { SupabaseClient } from '@supabase/supabase-js';

type JsonObject = Record<string, unknown>;

// ---------- Map cột snake_case (Supabase) <-> camelCase (app) ----------
const PROP_FIELDS: Array<[string, string]> = [
  ['id', 'id'], ['user_id', 'userId'], ['post_id', 'postId'],
  ['title', 'title'], ['type', 'type'], ['project', 'project'],
  ['category', 'category'], ['price', 'price'], ['price_display', 'priceDisplay'],
  ['area', 'area'], ['bedrooms', 'bedrooms'], ['bathrooms', 'bathrooms'],
  ['direction', 'direction'], ['floor', 'floor'], ['furniture', 'furniture'],
  ['legal', 'legal'], ['address', 'address'], ['description', 'description'],
  ['completion_status', 'completionStatus'], ['completion_detail', 'completionDetail'],
  ['furniture_detail', 'furnitureDetail'], ['subdivision', 'subdivision'],
  ['seller_name', 'sellerName'], ['seller_phone', 'sellerPhone'], ['seller_role', 'sellerRole'],
  ['status', 'status'], ['approval_status', 'approvalStatus'], ['rejection_reason', 'rejectionReason'],
  ['admin_note', 'adminNote'], ['vip_level', 'vipLevel'], ['vip_type', 'vipType'],
  ['vip_expires_at', 'vipExpiresAt'], ['pushed_at', 'pushedAt'], ['pushed_count', 'pushedCount'],
  ['views_count', 'viewsCount'], ['duration_days', 'durationDays'], ['expires_at', 'expiresAt'],
  ['so_do_image', 'soDoImage'], ['so_do_redacted_image', 'soDoRedactedImage'],
  ['images', 'images'], ['created_at', 'createdAt'], ['updated_at', 'updatedAt'],
  ['deleted_at', 'deletedAt'],
];

function toCamel(row: JsonObject, fields: Array<[string, string]>): JsonObject {
  const out: JsonObject = {};
  for (const [snake, camel] of fields) {
    if (row[snake] !== undefined) out[camel] = row[snake];
  }
  return out;
}
function toSnake(row: JsonObject, fields: Array<[string, string]>): JsonObject {
  const out: JsonObject = {};
  for (const [snake, camel] of fields) {
    if (row[camel] !== undefined) out[snake] = row[camel];
  }
  return out;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------- Xây bộ xử lý cho từng endpoint ----------
type Handler = (url: URL, init: RequestInit | undefined) => Promise<Response | null>;
// Trả null nghĩa là "không xử lý được -> passthrough"

export function buildHandlers(sb: SupabaseClient): Record<string, Handler> {
  return {
    // GET /api/properties?type=&project=&status=&search=...
    'GET:/api/properties': async (url) => {
      let q = sb.from('properties').select('*').is('deleted_at', null)
        .eq('status', 'approved').order('created_at', { ascending: false }).limit(500);
      const type = url.searchParams.get('type');
      const project = url.searchParams.get('project');
      const category = url.searchParams.get('category');
      const status = url.searchParams.get('status');
      if (type) q = q.eq('type', type);
      if (project) q = q.eq('project', project);
      if (category) q = q.eq('category', category);
      if (status && status !== 'all') q = q.eq('status', status);

      // search: Supabase không có full-text đơn giản qua eq -> lấy rồi lọc client
      const search = url.searchParams.get('search');
      const { data, error } = await q;
      if (error) return jsonResponse({ error: error.message }, 500);
      let rows = (data ?? []).map((r) => toCamel(r as JsonObject, PROP_FIELDS));
      if (search) {
        const kw = search.toLowerCase();
        rows = rows.filter((r) =>
          String(r.title ?? '').toLowerCase().includes(kw) ||
          String(r.address ?? '').toLowerCase().includes(kw) ||
          String(r.description ?? '').toLowerCase().includes(kw));
      }
      return jsonResponse(rows);
    },

    // GET /api/properties/:id
    'GET:/api/properties/:id': async (url) => {
      const id = url.pathname.split('/').pop();
      const { data, error } = await sb.from('properties').select('*')
        .eq('id', id).is('deleted_at', null).maybeSingle();
      if (error) return jsonResponse({ error: error.message }, 500);
      if (!data) return jsonResponse({ error: 'Không tìm thấy bất động sản.' }, 404);
      return jsonResponse(toCamel(data as JsonObject, PROP_FIELDS));
    },

    // POST /api/properties  (tạo bài đăng BĐS)
    'POST:/api/properties': async (_url, init) => {
      const body = JSON.parse(String(init?.body ?? '{}'));
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return jsonResponse({ error: 'Chưa đăng nhập' }, 401);
      const row = { ...toSnake(body, PROP_FIELDS), user_id: user.id, status: 'pending' };
      const { data, error } = await sb.from('properties').insert(row).select().single();
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse(toCamel(data as JsonObject, PROP_FIELDS), 201);
    },

    // PUT /api/properties/:id
    'PUT:/api/properties/:id': async (url, init) => {
      const id = url.pathname.split('/').pop();
      const body = JSON.parse(String(init?.body ?? '{}'));
      const { data, error } = await sb.from('properties')
        .update(toSnake(body, PROP_FIELDS)).eq('id', id).select().single();
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse(toCamel(data as JsonObject, PROP_FIELDS));
    },

    // GET /api/news -> bài chia sẻ kiến thức (đã publish)
    'GET:/api/news': async () => {
      const { data, error } = await sb.from('knowledge_posts').select('*')
        .is('deleted_at', null).eq('status', 'published')
        .order('published_at', { ascending: false }).limit(200);
      if (error) return jsonResponse({ error: error.message }, 500);
      const rows = (data ?? []).map((n: any) => ({
        id: n.id, title: n.title, summary: n.summary, content: n.content,
        category: n.category, author: n.author_name, image: n.cover_image_url,
        publishedAt: n.published_at, views: n.views_count ?? 0,
        source: n.source, status: n.status,
      }));
      return jsonResponse(rows);
    },

    // GET /api/stores
    'GET:/api/stores': async () => {
      const { data, error } = await sb.from('stores').select('*')
        .is('deleted_at', null).eq('status', 'approved').limit(200);
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse(data ?? []);
    },
  };
}

// ---------- Hàm cài đặt chính ----------
export function installSupabaseAdapter(sb: SupabaseClient): void {
  if (typeof window === 'undefined' || (window as any).__supabase_adapter_installed) return;
  (window as any).__supabase_adapter_installed = true;

  const enabled = (import.meta.env.VITE_SUPABASE_ADAPTER ?? 'off') === 'on';
  const handlers = buildHandlers(sb);
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let url: URL;
    try { url = new URL(urlStr, window.location.origin); }
    catch { return originalFetch(input, init); }

    // Chỉ can thiệp request nội bộ /api/* khi adapter bật
    if (!enabled || !url.pathname.startsWith('/api/')) {
      return originalFetch(input, init);
    }

    const method = (init?.method ?? 'GET').toUpperCase();

    // So khớp route: ưu tiên :id
    const withId = url.pathname.replace(/\/[^/]+$/, '/:id');
    const keyExact = `${method}:${url.pathname}`;
    const keyWithId = `${method}:${withId}`;
    const handler = handlers[keyExact] ?? handlers[keyWithId];

    if (!handler) return originalFetch(input, init);   // endpoint chưa map -> fallback Express

    try {
      const res = await handler(url, init);
      return res ?? originalFetch(input, init);
    } catch (e: any) {
      console.warn('[SupabaseAdapter] lỗi, fallback Express:', e?.message);
      return originalFetch(input, init);               // lỗi -> tự động về Express
    }
  };

  if (enabled) console.info('[SupabaseAdapter] BẬT — endpoint đã map dùng Supabase, còn lại dùng Express.');
}
