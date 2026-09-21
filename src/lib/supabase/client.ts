// =====================================================================
// Supabase client — AN TOÀN
// File: chocuda-supabase/src/lib/supabase/client.ts
// - browser: chỉ dùng ANON KEY (publishable) — an toàn với RLS
// - server : dùng SERVICE_ROLE KEY (bí mật) — KHÔNG bao giờ import vào code
//            chạy trên browser
// =====================================================================
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!URL || !ANON) {
  throw new Error('Thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY trong .env');
}

/** Client cho frontend — mọi thao tác đều bị RLS kiểm soát theo auth.uid(). */
export const supabase: SupabaseClient = createClient(URL, ANON, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

/**
 * Client quyền cao — CHỈ dùng ở server (Node/Edge), ví dụ:
 *   - webhook SePay
 *   - cron đồng bộ KiotViet
 *   - ETL migration
 * Không truyền vào bất kỳ module nào bundle cho browser.
 */
export function createAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Thiếu SUPABASE_SERVICE_ROLE_KEY (chỉ dùng ở server)');
  return createClient(URL, serviceKey, { auth: { persistSession: false } });
}
