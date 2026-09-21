// =====================================================================
// SERVICE LAYER — CRUD cho AI Agent & app
// File: chocuda-supabase/src/lib/supabase/services.ts
//
// Nguyên tắc:
//  - Mọi hàm chạy bằng client ANON => RLS tự chặn theo auth.uid().
//  - Không tự truyền user_id từ client (RLS bắt buộc user_id = auth.uid()).
//  - Xoá = soft-delete qua RPC soft_delete (kiểm tra quyền ở DB).
//  - Dữ liệu nhạy cảm (user_sensitive, cv_url) KHÔNG trả trong list công khai.
// =====================================================================
import { supabase } from './client';
import type { Post, PostType, RecordStatus, Product, Comment, Profile, MediaRow } from './db-types';

export class ServiceError extends Error {
  constructor(message: string, public code?: string) { super(message); }
}
function unwrap<T>(res: { data: T | null; error: any }): T {
  if (res.error) throw new ServiceError(res.error.message, res.error.code);
  return res.data as T;
}

// ---------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------
export const auth = {
  signUp: (email: string, password: string, meta: Record<string, unknown> = {}) =>
    supabase.auth.signUp({ email, password, options: { data: meta } }),
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signInOAuth: (provider: 'google' | 'facebook') =>
    supabase.auth.signInWithOAuth({ provider }),
  signOut: () => supabase.auth.signOut(),
  me: async (): Promise<Profile | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return unwrap(await supabase.from('profiles').select('*').eq('id', user.id).single());
  },
};

// ---------------------------------------------------------------------
// POSTS  (bài đăng chung: property / product / knowledge / reputation...)
// ---------------------------------------------------------------------
export const posts = {
  list: (opts: {
    type?: PostType; category?: string; status?: RecordStatus;
    userId?: string; limit?: number; offset?: number;
  } = {}) => {
    let q = supabase.from('posts').select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 20) - 1);
    if (opts.type) q = q.eq('post_type', opts.type);
    if (opts.category) q = q.eq('category', opts.category);
    if (opts.status) q = q.eq('status', opts.status);
    if (opts.userId) q = q.eq('user_id', opts.userId);
    return q;
  },

  get: (id: string) =>
    supabase.from('posts').select('*').eq('id', id).is('deleted_at', null).single(),

  getBySlug: (slug: string) =>
    supabase.from('posts').select('*').eq('slug', slug).is('deleted_at', null).single(),

  create: async (input: Partial<Post> & { post_type: PostType; title: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ServiceError('Chưa đăng nhập');
    return unwrap(await supabase.from('posts')
      .insert({ ...input, user_id: user.id, status: input.status ?? 'pending' })
      .select().single());
  },

  update: (id: string, patch: Partial<Post>) =>
    supabase.from('posts').update(patch).eq('id', id).select().single(),

  // Xoá MỀM — kiểm tra quyền ở DB (chủ sở hữu hoặc admin)
  softDelete: (id: string) => supabase.rpc('soft_delete', { p_table: 'posts', p_id: id }),

  hardDelete: (id: string) => supabase.from('posts').delete().eq('id', id), // RLS: chỉ admin
};

// ---------------------------------------------------------------------
// PRODUCTS  (sản phẩm của gian hàng)
// ---------------------------------------------------------------------
export const products = {
  listByStore: (storeId: string, onlyActive = true) => {
    let q = supabase.from('products').select('*').eq('store_id', storeId).is('deleted_at', null);
    if (onlyActive) q = q.eq('is_active', true).eq('status', 'approved');
    return q.order('created_at', { ascending: false });
  },
  get: (id: string) => supabase.from('products').select('*').eq('id', id).single(),
  create: async (input: Partial<Product> & { store_id: string; name: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ServiceError('Chưa đăng nhập');
    return unwrap(await supabase.from('products')
      .insert({ ...input, user_id: user.id }).select().single());
  },
  update: (id: string, patch: Partial<Product>) =>
    supabase.from('products').update(patch).eq('id', id).select().single(),
  softDelete: (id: string) => supabase.rpc('soft_delete', { p_table: 'products', p_id: id }),
};

// ---------------------------------------------------------------------
// KNOWLEDGE (bài chia sẻ kiến thức)
// ---------------------------------------------------------------------
export const knowledge = {
  list: (category?: string, limit = 20) => {
    let q = supabase.from('knowledge_posts').select('*')
      .is('deleted_at', null).eq('status', 'published')
      .order('published_at', { ascending: false }).limit(limit);
    if (category) q = q.eq('category', category);
    return q;
  },
  create: (input: Record<string, unknown>) => supabase.from('knowledge_posts').insert(input).select().single(),
  update: (id: string, patch: Record<string, unknown>) =>
    supabase.from('knowledge_posts').update(patch).eq('id', id).select().single(),
  softDelete: (id: string) => supabase.rpc('soft_delete', { p_table: 'knowledge_posts', p_id: id }),
};

// ---------------------------------------------------------------------
// COMMENTS
// ---------------------------------------------------------------------
export const comments = {
  listFor: (targetType: PostType, targetId: string) =>
    supabase.from('comments').select('*, author:profiles(id,full_name,avatar_url)')
      .eq('target_type', targetType).eq('target_id', targetId)
      .is('deleted_at', null).eq('status', 'approved')
      .order('created_at', { ascending: true }),
  create: async (input: { target_type: PostType; target_id: string; content: string; parent_id?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ServiceError('Chưa đăng nhập');
    return unwrap(await supabase.from('comments').insert({ ...input, user_id: user.id }).select().single());
  },
  update: (id: string, content: string) => supabase.from('comments').update({ content }).eq('id', id).select().single(),
  softDelete: (id: string) => supabase.rpc('soft_delete', { p_table: 'comments', p_id: id }),
};

// ---------------------------------------------------------------------
// MEDIA  (metadata file/ảnh trong Storage)
// ---------------------------------------------------------------------
export const media = {
  /** Upload file + ghi metadata 1 lượt. */
  async upload(file: File, opts: {
    bucket: string; entityType?: string; entityId?: string; isPublic?: boolean;
  }): Promise<MediaRow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ServiceError('Chưa đăng nhập');
    const path = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const up = await supabase.storage.from(opts.bucket).upload(path, file, { upsert: false });
    if (up.error) throw new ServiceError(up.error.message);
    return unwrap(await supabase.from('media').insert({
      user_id: user.id, bucket: opts.bucket, path,
      mime_type: file.type, size_bytes: file.size,
      media_type: file.type.startsWith('image') ? 'image' : 'other',
      entity_type: opts.entityType, entity_id: opts.entityId,
      is_public: opts.isPublic ?? true,
    }).select().single());
  },
  /** Public URL (bucket public). */
  publicUrl: (bucket: string, path: string) =>
    supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,
  /** Signed URL (bucket PRIVATE, hết hạn sau `secs`). */
  signedUrl: async (bucket: string, path: string, secs = 60) => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, secs);
    if (error) throw new ServiceError(error.message);
    return data.signedUrl;
  },
  softDelete: (id: string) => supabase.rpc('soft_delete', { p_table: 'media', p_id: id }),
};

// ---------------------------------------------------------------------
// ADMIN (chỉ chạy được khi role = admin nhờ RLS)
// ---------------------------------------------------------------------
export const adminApi = {
  listUsers: (limit = 50) => supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(limit),
  approvePost: (id: string) => supabase.from('posts')
    .update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id).select().single(),
  rejectPost: (id: string, reason: string) => supabase.from('posts')
    .update({ status: 'rejected', rejected_reason: reason }).eq('id', id).select().single(),
  auditLog: (limit = 100) => supabase.from('admin_audit_log')
    .select('*').order('created_at', { ascending: false }).limit(limit),
  /** KYC: chỉ admin xem được PII */
  kycDetail: (userId: string) => supabase.from('user_sensitive').select('*').eq('user_id', userId).single(),
};

export const db = { auth, posts, products, knowledge, comments, media, admin: adminApi };
export default db;
