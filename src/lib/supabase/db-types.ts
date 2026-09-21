// =====================================================================
// Typed DB schema (rút gọn) — khuyến nghị sinh tự động bằng:
//   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/db-types.ts
// File: chocuda-supabase/src/lib/supabase/db-types.ts
// =====================================================================

export type UserRole =
  | 'admin' | 'manager' | 'manager_bds' | 'manager_market' | 'manager_tech'
  | 'manager_content' | 'sale' | 'owner' | 'partner' | 'visitor';

export type PostType = 'property' | 'product' | 'knowledge' | 'reputation' | 'service' | 'job' | 'general';
export type RecordStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
export type VisibilityScope = 'public' | 'members' | 'private';
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  tier: string | null;
  avatar_url: string | null;
  apartment: string | null;
  provider: string | null;
  account_type: string | null;
  company_name: string | null;
  kyc_status: KycStatus;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Post {
  id: string;
  user_id: string;
  post_type: PostType;
  title: string;
  slug: string | null;
  summary: string | null;
  body: string | null;
  category: string | null;
  tags: string[] | null;
  cover_image_url: string | null;
  status: RecordStatus;
  visibility: VisibilityScope;
  is_featured: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  published_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Product {
  id: string;
  store_id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_display: string | null;
  unit: string | null;
  stock: number | null;
  category: string | null;
  images: string[] | null;
  is_active: boolean;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Comment {
  id: string;
  user_id: string;
  target_type: PostType;
  target_id: string;
  parent_id: string | null;
  content: string;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MediaRow {
  id: string;
  user_id: string;
  bucket: string;
  path: string;
  media_type: 'image' | 'video' | 'document' | 'audio' | 'other';
  mime_type: string | null;
  size_bytes: number | null;
  entity_type: string | null;
  entity_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
