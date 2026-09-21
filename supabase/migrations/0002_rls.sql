-- =====================================================================
-- CHOCUDA — RLS policies
-- File: 0002_rls.sql
-- Chạy SAU 0001_schema.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- HELPER FUNCTIONS (security definer để tránh đệ quy RLS)
-- ---------------------------------------------------------------------
create or replace function public.current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin','manager','manager_bds','manager_market','manager_tech','manager_content')
                   from public.profiles where id = auth.uid()), false);
$$;

-- =====================================================================
-- BẬT RLS TẤT CẢ BẢNG
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','user_sensitive','projects_catalog','business_categories',
    'posts','properties','knowledge_posts','stores','products','product_orders',
    'comments','reactions','media','recruitment_jobs','candidate_profiles',
    'job_applications','leads','wallet_transactions','withdrawal_requests',
    'notifications','messages','admin_audit_log'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end $$;

-- =====================================================================
-- 1. PROFILES
-- =====================================================================
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (
    deleted_at is null
    and ( status = 'active' or id = auth.uid() or public.is_staff() )
  );

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert
  with check ( id = auth.uid() );

drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin on public.profiles for update
  using ( id = auth.uid() or public.is_admin() )
  with check ( id = auth.uid() or public.is_admin() );

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles for delete
  using ( public.is_admin() );

-- =====================================================================
-- 2. USER_SENSITIVE  — chỉ chủ sở hữu + admin
-- =====================================================================
drop policy if exists us_select on public.user_sensitive;
create policy us_select on public.user_sensitive for select
  using ( user_id = auth.uid() or public.is_admin() );

drop policy if exists us_insert on public.user_sensitive;
create policy us_insert on public.user_sensitive for insert
  with check ( user_id = auth.uid() or public.is_admin() );

drop policy if exists us_update on public.user_sensitive;
create policy us_update on public.user_sensitive for update
  using ( user_id = auth.uid() or public.is_admin() )
  with check ( user_id = auth.uid() or public.is_admin() );

drop policy if exists us_delete on public.user_sensitive;
create policy us_delete on public.user_sensitive for delete
  using ( public.is_admin() );

-- =====================================================================
-- 3. LOOKUPS (public read, admin write)
-- =====================================================================
drop policy if exists projcat_read on public.projects_catalog;
create policy projcat_read on public.projects_catalog for select using (true);
drop policy if exists projcat_write on public.projects_catalog;
create policy projcat_write on public.projects_catalog for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists bcat_read on public.business_categories;
create policy bcat_read on public.business_categories for select using (true);
drop policy if exists bcat_write on public.business_categories;
create policy bcat_write on public.business_categories for all
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- 4. POSTS
-- =====================================================================
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts for select
  using (
    deleted_at is null and (
      public.is_staff()
      or user_id = auth.uid()
      or (status = 'approved' and visibility = 'public')
      or (status = 'approved' and visibility = 'members' and auth.uid() is not null)
    )
  );

drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert
  with check ( auth.uid() is not null and user_id = auth.uid() );

drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update
  using ( user_id = auth.uid() or public.is_staff() )
  with check ( user_id = auth.uid() or public.is_staff() );

drop policy if exists posts_delete on public.posts;
create policy posts_delete on public.posts for delete
  using ( public.is_admin() );   -- xoá cứng chỉ admin; user dùng soft_delete RPC

-- =====================================================================
-- 5. PROPERTIES
-- =====================================================================
drop policy if exists props_read on public.properties;
create policy props_read on public.properties for select
  using (
    deleted_at is null and (
      public.is_staff()
      or user_id = auth.uid()
      or status = 'approved'
    )
  );
drop policy if exists props_insert on public.properties;
create policy props_insert on public.properties for insert
  with check ( auth.uid() is not null and user_id = auth.uid() );
drop policy if exists props_update on public.properties;
create policy props_update on public.properties for update
  using ( user_id = auth.uid() or public.is_staff() )
  with check ( user_id = auth.uid() or public.is_staff() );
drop policy if exists props_delete on public.properties;
create policy props_delete on public.properties for delete
  using ( public.is_admin() );

-- =====================================================================
-- 6. KNOWLEDGE POSTS
-- =====================================================================
drop policy if exists kp_read on public.knowledge_posts;
create policy kp_read on public.knowledge_posts for select
  using ( deleted_at is null and (status = 'published' or public.is_staff() or user_id = auth.uid()) );
drop policy if exists kp_insert on public.knowledge_posts;
create policy kp_insert on public.knowledge_posts for insert
  with check ( public.is_staff() or (auth.uid() is not null and (user_id = auth.uid() or source = 'n8n')) );
drop policy if exists kp_update on public.knowledge_posts;
create policy kp_update on public.knowledge_posts for update
  using ( user_id = auth.uid() or public.is_staff() )
  with check ( user_id = auth.uid() or public.is_staff() );
drop policy if exists kp_delete on public.knowledge_posts;
create policy kp_delete on public.knowledge_posts for delete using ( public.is_staff() );

-- =====================================================================
-- 7. STORES / PRODUCTS / ORDERS
-- =====================================================================
drop policy if exists stores_read on public.stores;
create policy stores_read on public.stores for select
  using ( deleted_at is null and (status = 'approved' or owner_id = auth.uid() or public.is_staff()) );
drop policy if exists stores_write on public.stores;
create policy stores_write on public.stores for all
  using ( owner_id = auth.uid() or public.is_staff() )
  with check ( owner_id = auth.uid() or public.is_staff() );

drop policy if exists products_read on public.products;
create policy products_read on public.products for select
  using ( deleted_at is null and (is_active and status = 'approved' or user_id = auth.uid() or public.is_staff()) );
drop policy if exists products_write on public.products;
create policy products_write on public.products for all
  using ( user_id = auth.uid() or public.is_staff() )
  with check ( user_id = auth.uid() or public.is_staff() );

drop policy if exists orders_read on public.product_orders;
create policy orders_read on public.product_orders for select
  using ( buyer_id = auth.uid() or public.is_staff()
          or store_id in (select id from public.stores where owner_id = auth.uid()) );
drop policy if exists orders_write on public.product_orders;
create policy orders_write on public.product_orders for all
  using ( buyer_id = auth.uid() or public.is_staff()
          or store_id in (select id from public.stores where owner_id = auth.uid()) )
  with check ( buyer_id = auth.uid() or public.is_staff()
          or store_id in (select id from public.stores where owner_id = auth.uid()) );

-- =====================================================================
-- 8. COMMENTS / REACTIONS
-- =====================================================================
drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments for select
  using ( deleted_at is null and (status = 'approved' or user_id = auth.uid() or public.is_staff()) );
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert
  with check ( auth.uid() is not null and user_id = auth.uid() );
drop policy if exists comments_update on public.comments;
create policy comments_update on public.comments for update
  using ( user_id = auth.uid() or public.is_staff() )
  with check ( user_id = auth.uid() or public.is_staff() );
drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments for delete
  using ( user_id = auth.uid() or public.is_staff() );

drop policy if exists reactions_all on public.reactions;
create policy reactions_all on public.reactions for all
  using ( user_id = auth.uid() or public.is_staff() )
  with check ( user_id = auth.uid() );

-- =====================================================================
-- 9. MEDIA
-- =====================================================================
drop policy if exists media_read on public.media;
create policy media_read on public.media for select
  using ( deleted_at is null and (is_public or user_id = auth.uid() or public.is_staff()) );
drop policy if exists media_write on public.media;
create policy media_write on public.media for all
  using ( user_id = auth.uid() or public.is_staff() )
  with check ( user_id = auth.uid() or public.is_staff() );

-- =====================================================================
-- 10. RECRUITMENT
-- =====================================================================
drop policy if exists jobs_read on public.recruitment_jobs;
create policy jobs_read on public.recruitment_jobs for select
  using ( deleted_at is null and (status = 'approved' or user_id = auth.uid() or public.is_staff()) );
drop policy if exists jobs_write on public.recruitment_jobs;
create policy jobs_write on public.recruitment_jobs for all
  using ( user_id = auth.uid() or public.is_staff() )
  with check ( user_id = auth.uid() or public.is_staff() );

-- candidate: bản thân + admin + employer đã unlock
drop policy if exists cand_read on public.candidate_profiles;
create policy cand_read on public.candidate_profiles for select
  using (
    deleted_at is null and (
      user_id = auth.uid() or public.is_staff()
      or (status = 'approved' and is_seeking)   -- chỉ hiện profile công khai KHÔNG kèm cv_url (dùng view)
    )
  );
drop policy if exists cand_write on public.candidate_profiles;
create policy cand_write on public.candidate_profiles for all
  using ( user_id = auth.uid() or public.is_staff() )
  with check ( user_id = auth.uid() or public.is_staff() );

drop policy if exists apps_read on public.job_applications;
create policy apps_read on public.job_applications for select
  using (
    public.is_staff()
    or employer_id = auth.uid()
    or candidate_id in (select id from public.candidate_profiles where user_id = auth.uid())
  );
drop policy if exists apps_write on public.job_applications;
create policy apps_write on public.job_applications for all
  using ( public.is_staff() or employer_id = auth.uid()
          or candidate_id in (select id from public.candidate_profiles where user_id = auth.uid()) )
  with check ( public.is_staff() or employer_id = auth.uid()
          or candidate_id in (select id from public.candidate_profiles where user_id = auth.uid()) );

-- =====================================================================
-- 11. LEADS (nhạy cảm — chỉ người tạo, sale phụ trách, admin)
-- =====================================================================
drop policy if exists leads_read on public.leads;
create policy leads_read on public.leads for select
  using ( public.is_staff() or user_id = auth.uid() or assigned_to = auth.uid() );
drop policy if exists leads_insert on public.leads;
create policy leads_insert on public.leads for insert
  with check ( true );         -- form liên hệ công khai vẫn gửi được (ẩn danh), nhưng KHÔNG đọc lại
drop policy if exists leads_update on public.leads;
create policy leads_update on public.leads for update
  using ( public.is_staff() or assigned_to = auth.uid() )
  with check ( public.is_staff() or assigned_to = auth.uid() );
drop policy if exists leads_delete on public.leads;
create policy leads_delete on public.leads for delete using ( public.is_admin() );

-- =====================================================================
-- 12. WALLET / WITHDRAWALS
-- =====================================================================
drop policy if exists wallet_read on public.wallet_transactions;
create policy wallet_read on public.wallet_transactions for select
  using ( user_id = auth.uid() or public.is_admin() );
drop policy if exists wallet_insert on public.wallet_transactions;
create policy wallet_insert on public.wallet_transactions for insert
  with check ( public.is_admin() );   -- giao dịch ví chỉ tạo qua server/RPC tin cậy

drop policy if exists wd_read on public.withdrawal_requests;
create policy wd_read on public.withdrawal_requests for select
  using ( user_id = auth.uid() or public.is_admin() );
drop policy if exists wd_insert on public.withdrawal_requests;
create policy wd_insert on public.withdrawal_requests for insert
  with check ( user_id = auth.uid() );
drop policy if exists wd_update on public.withdrawal_requests;
create policy wd_update on public.withdrawal_requests for update
  using ( public.is_admin() ) with check ( public.is_admin() );

-- =====================================================================
-- 13. NOTIFICATIONS / MESSAGES
-- =====================================================================
drop policy if exists notif_read on public.notifications;
create policy notif_read on public.notifications for select using ( user_id = auth.uid() );
drop policy if exists notif_update on public.notifications;
create policy notif_update on public.notifications for update
  using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );
drop policy if exists notif_insert on public.notifications;
create policy notif_insert on public.notifications for insert with check ( public.is_staff() );

drop policy if exists msg_read on public.messages;
create policy msg_read on public.messages for select
  using ( sender_id = auth.uid() or receiver_id = auth.uid() );
drop policy if exists msg_insert on public.messages;
create policy msg_insert on public.messages for insert
  with check ( sender_id = auth.uid() );
drop policy if exists msg_update on public.messages;
create policy msg_update on public.messages for update
  using ( receiver_id = auth.uid() or sender_id = auth.uid() )
  with check ( receiver_id = auth.uid() or sender_id = auth.uid() );

-- =====================================================================
-- 14. ADMIN AUDIT LOG — chỉ admin đọc; KHÔNG cho update/delete (append-only)
-- =====================================================================
drop policy if exists audit_read on public.admin_audit_log;
create policy audit_read on public.admin_audit_log for select using ( public.is_admin() );
drop policy if exists audit_insert on public.admin_audit_log;
create policy audit_insert on public.admin_audit_log for insert with check ( true );  -- do trigger definer ghi
-- (không tạo policy update/delete => bị chặn hoàn toàn)

-- =====================================================================
-- 15. HẠN CHẾ QUYỀN Ở TẦNG BẢNG (defense in depth)
-- =====================================================================
revoke all on public.user_sensitive from anon;
revoke all on public.admin_audit_log from anon;
revoke all on public.leads from anon;

grant usage on schema public to anon, authenticated;
grant select on public.public_profiles, public.public_candidates to anon, authenticated;
grant execute on function public.soft_delete(text, uuid) to authenticated;

-- =====================================================================
-- HẾT 0002_rls.sql
-- =====================================================================
