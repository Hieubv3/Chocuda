-- =====================================================================
-- CHOCUDA — Supabase Storage buckets & policies
-- File: 0003_storage.sql
-- Chạy SAU 0001 + 0002
-- =====================================================================

-- ---------------------------------------------------------------------
-- BUCKETS
--  - public: ảnh tin đăng, sản phẩm, avatar, ảnh bài viết
--  - private: CCCD, giấy phép KD, CV ứng viên, sổ đỏ (chỉ signed URL)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',        'avatars',        true,  5242880,  array['image/png','image/jpeg','image/webp']),
  ('post-media',     'post-media',     true,  10485760, array['image/png','image/jpeg','image/webp','video/mp4']),
  ('property-media', 'property-media', true,  10485760, array['image/png','image/jpeg','image/webp','video/mp4']),
  ('store-media',    'store-media',    true,  10485760, array['image/png','image/jpeg','image/webp','video/mp4']),
  ('news-media',     'news-media',     true,  10485760, array['image/png','image/jpeg','image/webp']),
  ('kyc-documents',  'kyc-documents',  false, 10485760, array['image/png','image/jpeg','image/webp','application/pdf']),
  ('cv-documents',   'cv-documents',   false, 10485760, array['application/pdf','image/png','image/jpeg']),
  ('land-documents', 'land-documents', false, 10485760, array['image/png','image/jpeg','application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------
-- Quy ước đường dẫn: <bucket>/<auth.uid()>/<filename>
--  => storage.foldername(name)[1] = uid của chủ sở hữu
-- ---------------------------------------------------------------------

-- ============ PUBLIC BUCKETS: ai cũng đọc, chỉ chủ upload/sửa/xoá ============
do $$
declare b text;
begin
  foreach b in array array['avatars','post-media','property-media','store-media','news-media']
  loop
    execute format($f$
      drop policy if exists "%1$s_public_read" on storage.objects;
      create policy "%1$s_public_read" on storage.objects for select
        using ( bucket_id = %1$L );
    $f$, b);

    execute format($f$
      drop policy if exists "%1$s_owner_insert" on storage.objects;
      create policy "%1$s_owner_insert" on storage.objects for insert to authenticated
        with check ( bucket_id = %1$L and (storage.foldername(name))[1] = auth.uid()::text );
    $f$, b);

    execute format($f$
      drop policy if exists "%1$s_owner_update" on storage.objects;
      create policy "%1$s_owner_update" on storage.objects for update to authenticated
        using ( bucket_id = %1$L and (storage.foldername(name))[1] = auth.uid()::text );
    $f$, b);

    execute format($f$
      drop policy if exists "%1$s_owner_delete" on storage.objects;
      create policy "%1$s_owner_delete" on storage.objects for delete to authenticated
        using ( bucket_id = %1$L and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()) );
    $f$, b);
  end loop;
end $$;

-- ============ PRIVATE BUCKET: kyc-documents ============
-- Chỉ chủ sở hữu (theo path uid) và admin được đọc/ghi.
drop policy if exists "kyc_owner_read" on storage.objects;
create policy "kyc_owner_read" on storage.objects for select to authenticated
  using ( bucket_id = 'kyc-documents' and ( (storage.foldername(name))[1] = auth.uid()::text or public.is_admin() ) );

drop policy if exists "kyc_owner_insert" on storage.objects;
create policy "kyc_owner_insert" on storage.objects for insert to authenticated
  with check ( bucket_id = 'kyc-documents' and (storage.foldername(name))[1] = auth.uid()::text );

drop policy if exists "kyc_owner_update" on storage.objects;
create policy "kyc_owner_update" on storage.objects for update to authenticated
  using ( bucket_id = 'kyc-documents' and (storage.foldername(name))[1] = auth.uid()::text );

drop policy if exists "kyc_admin_delete" on storage.objects;
create policy "kyc_admin_delete" on storage.objects for delete to authenticated
  using ( bucket_id = 'kyc-documents' and public.is_admin() );

-- ============ PRIVATE BUCKET: cv-documents ============
-- Ứng viên upload CV; nhà tuyển dụng chỉ tải được SAU KHI unlock (kiểm tra ở app/service bằng RPC).
drop policy if exists "cv_owner_read" on storage.objects;
create policy "cv_owner_read" on storage.objects for select to authenticated
  using ( bucket_id = 'cv-documents' and ( (storage.foldername(name))[1] = auth.uid()::text or public.is_admin() ) );

drop policy if exists "cv_owner_insert" on storage.objects;
create policy "cv_owner_insert" on storage.objects for insert to authenticated
  with check ( bucket_id = 'cv-documents' and (storage.foldername(name))[1] = auth.uid()::text );

-- ============ PRIVATE BUCKET: land-documents (sổ đỏ) ============
drop policy if exists "land_owner_read" on storage.objects;
create policy "land_owner_read" on storage.objects for select to authenticated
  using ( bucket_id = 'land-documents' and ( (storage.foldername(name))[1] = auth.uid()::text or public.is_staff() ) );

drop policy if exists "land_owner_insert" on storage.objects;
create policy "land_owner_insert" on storage.objects for insert to authenticated
  with check ( bucket_id = 'land-documents' and (storage.foldername(name))[1] = auth.uid()::text );

-- =====================================================================
-- LƯU Ý BẢO MẬT:
--  1. Với bucket private, client KHÔNG dùng getPublicUrl mà dùng
--     createSignedUrl(path, 60) — link hết hạn sau 60s.
--  2. Sau khi upload, gọi hàm ghi metadata vào bảng public.media
--     (user_id, bucket, path, entity_type, entity_id, is_public).
--  3. service_role key chỉ được dùng ở server (Express/Edge Function),
--     TUYỆT ĐỐI không đưa vào biến VITE_* của frontend.
-- =====================================================================
