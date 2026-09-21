-- =====================================================================
-- CHOCUDA (Chợ Cư Dân 24h) — Supabase schema migration
-- File: 0001_schema.sql
-- Chạy trực tiếp trên Supabase: SQL Editor > dán > Run
-- (hoặc: supabase db push)
-- =====================================================================

create extension if not exists pgcrypto;      -- gen_random_uuid(), crypt(), digest()
create extension if not exists citext;        -- email không phân biệt hoa thường

-- ---------------------------------------------------------------------
-- 0. ENUMS
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum (
    'admin','manager','manager_bds','manager_market','manager_tech','manager_content',
    'sale','owner','partner','visitor'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_type as enum ('property','product','knowledge','reputation','service','job','general');
exception when duplicate_object then null; end $$;

do $$ begin
  create type record_status as enum ('draft','pending','approved','rejected','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visibility_scope as enum ('public','members','private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type kyc_status as enum ('unverified','pending','verified','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type media_type as enum ('image','video','document','audio','other');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 1. HELPER: trigger cập nhật updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- 2. PROFILES  (1:1 auth.users) — CHỈ dữ liệu công khai
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text,
  display_name   text,
  phone          text,
  email          citext,
  role           user_role not null default 'visitor',
  tier           text default 'thuong',
  avatar_url     text,
  apartment      text,
  provider       text default 'local',           -- local|google|facebook|zalo
  department_permissions text[] default '{}',
  sub_branch_title text,
  account_type   text default 'individual_resident',
  company_name   text,
  business_categories text[] default '{}',
  balance            bigint not null default 0 check (balance >= 0),
  token_balance      bigint not null default 0 check (token_balance >= 0),
  affiliate_points   bigint not null default 0,
  up_tin_credits     integer not null default 0,
  social_points      integer not null default 0,
  total_topup        bigint not null default 0,
  total_affiliate_earned bigint not null default 0,
  kyc_status     kyc_status not null default 'unverified',
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  status         text not null default 'active',  -- active|suspended|banned
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_kyc  on public.profiles(kyc_status);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. USER_SENSITIVE  (PII) — tách riêng, RLS cực chặt
--    KHÔNG BAO GIỜ select bảng này từ client ngoài chủ sở hữu/admin
-- ---------------------------------------------------------------------
create table if not exists public.user_sensitive (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  dob                 date,
  id_card_number      text,
  id_card_front_url   text,
  id_card_back_url    text,
  business_license_url text,
  broker_license_url  text,
  tax_code            text,
  specialized_certificates jsonb default '[]'::jsonb,
  bank_account_number text,
  bank_account_name   text,
  bank_name           text,
  kyc_note            text,
  kyc_reviewed_by     uuid references public.profiles(id),
  kyc_reviewed_at     timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
drop trigger if exists trg_user_sensitive_updated on public.user_sensitive;
create trigger trg_user_sensitive_updated before update on public.user_sensitive
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. LOOKUPS
-- ---------------------------------------------------------------------
create table if not exists public.projects_catalog (
  id          text primary key,               -- vd 'ocean-park-2'
  name        text not null,
  location    text,
  area_size   text,
  total_units text,
  price_range text,
  status      text,
  description text,
  image_url   text,
  masterplan_url text,
  youtube_url text,
  legal_info  text,
  parent_id   text references public.projects_catalog(id),
  current_status text,
  subdivisions jsonb default '[]'::jsonb,
  amenities    jsonb default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_projects_updated on public.projects_catalog;
create trigger trg_projects_updated before update on public.projects_catalog
  for each row execute function public.set_updated_at();

create table if not exists public.business_categories (
  id    text primary key,
  name  text not null,
  icon  text,
  sort_order integer default 0
);

-- ---------------------------------------------------------------------
-- 5. POSTS  (hợp nhất mọi "bài đăng" — yêu cầu #1)
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  post_type     post_type not null,
  title         text not null,
  slug          text unique,
  summary       text,
  body          text,
  category      text,
  tags          text[] default '{}',
  cover_image_url text,
  status        record_status not null default 'pending',
  visibility    visibility_scope not null default 'public',
  is_featured   boolean not null default false,
  is_pinned     boolean not null default false,
  views_count   integer not null default 0,
  likes_count   integer not null default 0,
  comments_count integer not null default 0,
  published_at  timestamptz,
  expires_at    timestamptz,
  rejected_reason text,
  approved_by   uuid references public.profiles(id),
  approved_at   timestamptz,
  metadata      jsonb not null default '{}'::jsonb,  -- field đặc thù theo post_type
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_posts_user       on public.posts(user_id);
create index if not exists idx_posts_type_status on public.posts(post_type, status) where deleted_at is null;
create index if not exists idx_posts_category   on public.posts(category);
create index if not exists idx_posts_created    on public.posts(created_at desc);
create index if not exists idx_posts_published  on public.posts(published_at desc) where deleted_at is null;
create index if not exists idx_posts_search     on public.posts using gin (to_tsvector('simple', coalesce(title,'')||' '||coalesce(body,'')));

drop trigger if exists trg_posts_updated on public.posts;
create trigger trg_posts_updated before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 6. PROPERTIES  (bài đăng BĐS — yêu cầu #2)
-- ---------------------------------------------------------------------
create table if not exists public.properties (
  id             uuid primary key default gen_random_uuid(),
  post_id        uuid references public.posts(id) on delete set null,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  title          text not null,
  type           text not null,              -- sale|rent
  project        text,                        -- FK mềm -> projects_catalog.id
  category       text,
  price          numeric,
  price_display  text,
  area           numeric,
  bedrooms       integer default 0,
  bathrooms      integer default 0,
  direction      text,
  floor          text,
  furniture      text,
  legal          text,
  address        text,
  description    text,
  completion_status text,
  completion_detail text,
  furniture_detail  text,
  subdivision    text,
  seller_name    text,
  seller_phone   text,
  seller_role    text,
  status         record_status not null default 'pending',
  approval_status text,
  rejection_reason text,
  admin_note     text,
  vip_level      text default 'normal',
  vip_type       text,
  vip_expires_at timestamptz,
  pushed_at      timestamptz,
  pushed_count   integer default 0,
  views_count    integer default 0,
  duration_days  integer default 30,
  expires_at     timestamptz,
  so_do_image          text,
  so_do_redacted_image text,
  images         text[] default '{}',
  metadata       jsonb not null default '{}'::jsonb,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_props_user   on public.properties(user_id);
create index if not exists idx_props_status on public.properties(status) where deleted_at is null;
create index if not exists idx_props_type   on public.properties(type);
create index if not exists idx_props_project on public.properties(project);
drop trigger if exists trg_props_updated on public.properties;
create trigger trg_props_updated before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 7. KNOWLEDGE POSTS  (chia sẻ kiến thức — yêu cầu #3)
-- ---------------------------------------------------------------------
create table if not exists public.knowledge_posts (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid references public.posts(id) on delete set null,
  user_id      uuid references public.profiles(id) on delete set null,
  title        text not null,
  summary      text,
  content      text,
  category     text,            -- vinhomes|quy-hoach|thi-truong|nhan-dinh|kinh-nghiem
  source       text default 'manual',  -- n8n|manual|ai
  cover_image_url text,
  author_name  text,
  views_count  integer default 0,
  status       record_status not null default 'published',
  published_at timestamptz default now(),
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_kp_cat    on public.knowledge_posts(category);
create index if not exists idx_kp_status on public.knowledge_posts(status) where deleted_at is null;
drop trigger if exists trg_kp_updated on public.knowledge_posts;
create trigger trg_kp_updated before update on public.knowledge_posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 8. STORES & PRODUCTS  (chợ cư dân — yêu cầu #2)
-- ---------------------------------------------------------------------
create table if not exists public.stores (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  slug         text unique,
  description  text,
  logo_url     text,
  banner_url   text,
  phone        text,
  address      text,
  business_category text,
  package_id   uuid,
  is_verified  boolean default false,
  rating       numeric(2,1) default 0,
  status       record_status not null default 'pending',
  metadata     jsonb not null default '{}'::jsonb,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_stores_owner on public.stores(owner_id);
create index if not exists idx_stores_status on public.stores(status) where deleted_at is null;
drop trigger if exists trg_stores_updated on public.stores;
create trigger trg_stores_updated before update on public.stores
  for each row execute function public.set_updated_at();

create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null references public.stores(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  slug         text,
  sku          text,
  description  text,
  price        numeric,
  price_display text,
  unit         text,
  stock        integer default 0,
  category     text,
  images       text[] default '{}',
  is_active    boolean default true,
  status       record_status not null default 'pending',
  views_count  integer default 0,
  metadata     jsonb not null default '{}'::jsonb,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_products_store  on public.products(store_id);
create index if not exists idx_products_user   on public.products(user_id);
create index if not exists idx_products_status on public.products(status) where deleted_at is null;
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

create table if not exists public.product_orders (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid references public.stores(id) on delete set null,
  buyer_id     uuid references public.profiles(id) on delete set null,
  order_code   text unique,
  items        jsonb not null default '[]'::jsonb,
  total_amount numeric not null default 0,
  status       text not null default 'pending',   -- pending|confirmed|shipping|done|cancelled
  note         text,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_orders_updated on public.product_orders;
create trigger trg_orders_updated before update on public.product_orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 9. COMMENTS + REACTIONS  (quan hệ posts/comments — yêu cầu #7)
-- ---------------------------------------------------------------------
create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  target_type  post_type not null,          -- post|property|product|knowledge|...
  target_id    uuid not null,
  parent_id    uuid references public.comments(id) on delete cascade,
  content      text not null,
  likes_count  integer default 0,
  status       record_status not null default 'approved',
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_comments_target on public.comments(target_type, target_id) where deleted_at is null;
create index if not exists idx_comments_user   on public.comments(user_id);
create index if not exists idx_comments_parent on public.comments(parent_id);
drop trigger if exists trg_comments_updated on public.comments;
create trigger trg_comments_updated before update on public.comments
  for each row execute function public.set_updated_at();

create table if not exists public.reactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  target_type  post_type not null,
  target_id    uuid not null,
  reaction     text not null default 'like',
  created_at   timestamptz not null default now(),
  unique (user_id, target_type, target_id, reaction)
);

-- ---------------------------------------------------------------------
-- 10. MEDIA  (metadata file/ảnh — yêu cầu #11)
-- ---------------------------------------------------------------------
create table if not exists public.media (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  bucket       text not null,                -- post-media | store-products | avatars | kyc-documents ...
  path         text not null,                -- đường dẫn trong bucket
  media_type   media_type not null default 'image',
  mime_type    text,
  size_bytes   bigint,
  width        integer,
  height       integer,
  entity_type  text,                          -- post|property|product|store|news|kyc
  entity_id    uuid,
  is_public    boolean not null default true,
  sort_order   integer default 0,
  metadata     jsonb not null default '{}'::jsonb,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (bucket, path)
);
create index if not exists idx_media_entity on public.media(entity_type, entity_id) where deleted_at is null;
create index if not exists idx_media_user   on public.media(user_id);
drop trigger if exists trg_media_updated on public.media;
create trigger trg_media_updated before update on public.media
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 11. RECRUITMENT (giữ đủ để không mất dữ liệu)
-- ---------------------------------------------------------------------
create table if not exists public.recruitment_jobs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete set null,
  title        text not null,
  company      text,
  description  text,
  salary_range text,
  location     text,
  job_type     text,
  requirements text,
  benefits     text,
  images       text[] default '{}',
  status       record_status not null default 'pending',
  views_count  integer default 0,
  expires_at   timestamptz,
  metadata     jsonb not null default '{}'::jsonb,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_jobs_updated on public.recruitment_jobs;
create trigger trg_jobs_updated before update on public.recruitment_jobs
  for each row execute function public.set_updated_at();

create table if not exists public.candidate_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete set null,
  full_name     text,
  title         text,
  summary       text,
  experience    jsonb default '[]'::jsonb,
  education     jsonb default '[]'::jsonb,
  skills        text[] default '{}',
  expected_salary text,
  is_seeking    boolean default true,
  cv_url        text,                          -- object path trong storage (PRIVATE)
  cv_visibility text default 'protected',      -- protected|public -> protected = phải unlock
  unlock_price  numeric default 0,
  status        record_status not null default 'pending',
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_cand_updated on public.candidate_profiles;
create trigger trg_cand_updated before update on public.candidate_profiles
  for each row execute function public.set_updated_at();

create table if not exists public.job_applications (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid references public.recruitment_jobs(id) on delete cascade,
  candidate_id uuid references public.candidate_profiles(id) on delete cascade,
  employer_id  uuid references public.profiles(id) on delete set null,
  cover_letter text,
  status       text not null default 'submitted',
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_app_updated on public.job_applications;
create trigger trg_app_updated before update on public.job_applications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 12. LEADS / CRM  (dữ liệu nhạy cảm khách hàng — yêu cầu #5)
-- ---------------------------------------------------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete set null,  -- người tạo/sở hữu lead
  assigned_to   uuid references public.profiles(id),                     -- sale phụ trách
  full_name     text not null,
  phone         text not null,
  email         citext,
  note          text,
  property_id   uuid,
  property_title text,
  interest      text,
  type          text default 'consultation',
  status        text not null default 'new',
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_leads_assigned on public.leads(assigned_to);
create index if not exists idx_leads_owner    on public.leads(user_id);
drop trigger if exists trg_leads_updated on public.leads;
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 13. WALLET
-- ---------------------------------------------------------------------
create table if not exists public.wallet_transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         text not null,              -- deposit|withdraw|pay|reward|refund
  amount       bigint not null,
  balance_after bigint,
  description  text,
  ref_id       text,
  status       text not null default 'done',
  created_at   timestamptz not null default now()
);
create index if not exists idx_wallet_user on public.wallet_transactions(user_id, created_at desc);

create table if not exists public.withdrawal_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  amount       bigint not null,
  bank_info    jsonb,
  status       text not null default 'pending',
  reviewed_by  uuid references public.profiles(id),
  reviewed_at  timestamptz,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_wd_updated on public.withdrawal_requests;
create trigger trg_wd_updated before update on public.withdrawal_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 14. NOTIFICATIONS / MESSAGES
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text,
  body         text,
  type         text default 'info',
  link         text,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists idx_notif_user on public.notifications(user_id, is_read, created_at desc);

create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  content      text,
  attachments  jsonb default '[]'::jsonb,
  is_read      boolean not null default false,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists idx_msg_pair on public.messages(sender_id, receiver_id, created_at desc);

-- ---------------------------------------------------------------------
-- 15. ADMIN AUDIT LOG  (dữ liệu admin riêng — yêu cầu #4, #14) — APPEND ONLY
-- ---------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id           bigserial primary key,
  actor_id     uuid references public.profiles(id) on delete set null,
  actor_role   user_role,
  action       text not null,           -- insert|update|soft_delete|hard_delete|approve|reject|login|config
  table_name   text not null,
  record_id    text,
  old_data     jsonb,
  new_data     jsonb,
  ip_address   text,
  user_agent   text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_audit_table  on public.admin_audit_log(table_name, record_id);
create index if not exists idx_audit_actor  on public.admin_audit_log(actor_id, created_at desc);

-- Trigger audit chung: gọi từ các bảng quan trọng
create or replace function public.fn_audit_row()
returns trigger language plpgsql security definer as $$
declare v_role user_role;
begin
  select role into v_role from public.profiles where id = auth.uid();
  insert into public.admin_audit_log(actor_id, actor_role, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(), v_role,
    lower(tg_op),
    tg_table_name,
    coalesce((case when tg_op='DELETE' then old.id else new.id end)::text, null),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );
  return case when tg_op='DELETE' then old else new end;
end $$;

do $$
declare t text;
begin
  foreach t in array array['posts','properties','products','stores','knowledge_posts','profiles','user_sensitive']
  loop
    execute format('drop trigger if exists trg_audit_%1$s on public.%1$I', t);
    execute format('create trigger trg_audit_%1$s after insert or update or delete on public.%1$I
                    for each row execute function public.fn_audit_row()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 16. TỰ ĐỘNG TẠO PROFILE KHI CÓ USER MỚI (Supabase Auth hook)
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, phone, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_app_meta_data->>'provider','local')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 17. RPC: xoá mềm an toàn (yêu cầu #14)
-- ---------------------------------------------------------------------
create or replace function public.soft_delete(p_table text, p_id uuid)
returns void language plpgsql security definer as $$
declare v_role user_role; v_owner uuid; v_sql text;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role is null then raise exception 'Chưa đăng nhập'; end if;

  -- xác định chủ sở hữu (các bảng dùng cột user_id hoặc owner_id)
  v_sql := format('select coalesce(user_id, owner_id) from public.%I where id = $1', p_table);
  begin
    execute v_sql into v_owner using p_id;
  exception when undefined_column then
    v_owner := null;
  end;

  if not (v_role = 'admin' or v_owner = auth.uid()) then
    raise exception 'Không có quyền xoá bản ghi này';
  end if;

  execute format('update public.%I set deleted_at = now() where id = $1 and deleted_at is null', p_table)
    using p_id;
end $$;

-- ---------------------------------------------------------------------
-- 18. VIEW công khai chỉ trả field được phép (yêu cầu #15)
-- ---------------------------------------------------------------------
create or replace view public.public_profiles
with (security_invoker = true) as
select id, full_name, display_name, avatar_url, role, tier, apartment,
       account_type, company_name, business_categories, kyc_status, created_at
from public.profiles
where deleted_at is null and status = 'active';

create or replace view public.public_candidates
with (security_invoker = true) as
select id, user_id, full_name, title, summary, skills, expected_salary, is_seeking,
       status, created_at
from public.candidate_profiles
where deleted_at is null and status = 'approved';
-- LƯU Ý: cv_url KHÔNG có trong view công khai → phải unlock mới lấy được.

-- =====================================================================
-- HẾT 0001_schema.sql
-- =====================================================================
