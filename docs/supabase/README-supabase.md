# chocuda-supabase — Bộ thiết kế lưu trữ Supabase cho `hieubv3/chocuda`

Chứa toàn bộ phần phân tích + SQL migration + RLS + Storage + service layer CRUD cho AI Agent.

## Cấu trúc
```
chocuda-supabase/
├─ 01-phan-tich-va-de-xuat.md              # Phân tích hiện trạng + đối chiếu 15 yêu cầu + 6 điểm cần bổ sung
├─ supabase/migrations/
│   ├─ 0001_schema.sql                     # Enums, bảng, index, trigger updated_at + audit, RPC, view
│   ├─ 0002_rls.sql                         # Bật RLS + policy cho mọi bảng
│   └─ 0003_storage.sql                     # 8 bucket + policy public/private
├─ src/lib/supabase/
│   ├─ client.ts                            # anon client (FE) + admin client (server)
│   ├─ db-types.ts                          # Type TS (khuyến nghị sinh bằng supabase gen types)
│   └─ services.ts                          # CRUD: posts / products / knowledge / comments / media / admin
└─ scripts/migrate-json-to-supabase.mjs     # ETL app_data_store.json -> Supabase (idempotent)
```

## Cách chạy
1. **Tạo project Supabase** → lấy `Project URL`, `anon key`, `service_role key`.
2. **Chạy migration** (theo thứ tự) trong SQL Editor, hoặc dùng CLI:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
3. **Biến môi trường** (frontend `.env`):
   ```
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=***
   ```
   Server-only (KHÔNG đưa vào Vite):
   ```
   SUPABASE_SERVICE_ROLE_KEY=<servi…key>
   ```
4. **Di trú dữ liệu cũ**:
   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=*** node scripts/migrate-json-to-supabase.mjs ./app_data_store.json
   ```
5. **Sinh type chuẩn**:
   ```bash
   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/db-types.ts
   ```

## Ma trận đối chiếu 15 yêu cầu
| # | Yêu cầu | Xử lý ở đâu |
|---|---|---|
| 1 | Mọi bài đăng vào Supabase | `posts` (0001 §5) |
| 2 | Bài đăng sản phẩm đầy đủ | `stores` + `products` (§8) |
| 3 | Chia sẻ kiến thức đầy đủ | `knowledge_posts` (§7) |
| 4 | Dữ liệu admin riêng | `admin_audit_log` + role + RLS (§15, 0002 §14) |
| 5 | Bảo vệ dữ liệu nhạy cảm | `user_sensitive` tách bảng + RLS (0001 §3, 0002 §2) |
| 6 | id/user_id/created_at/updated_at/status | mọi bảng + trigger `set_updated_at` |
| 7 | Quan hệ users↔posts↔products↔comments↔media | FK trong 0001 §5–10 |
| 8 | Supabase Auth | `handle_new_user` trigger (§16) + client.ts |
| 9 | RLS đọc/ghi/sửa/xoá | 0002 toàn bộ |
| 10 | Không lộ secret ở FE | client.ts (anon vs service_role tách biệt) |
| 11 | Storage + metadata DB | 0003 + bảng `media` |
| 12 | Migration SQL chạy trực tiếp | 0001–0003 |
| 13 | API/service layer cho AI Agent | services.ts |
| 14 | Kiểm quyền & tránh xoá nhầm | soft-delete `deleted_at` + RPC `soft_delete` + audit log |
| 15 | Chỉ trả field được phép | view `public_profiles`, `public_candidates` (không có cv_url) |

## 6 điểm BỔ SUNG so với danh sách ban đầu của bạn
1. Kế hoạch di trú dữ liệu JSON/localStorage → Supabase (script ETL).
2. Soft-delete (`deleted_at`) + audit log append-only + xoá cứng chỉ admin.
3. Mã hoá PII (pgcrypto) / tách bảng cho CCCD, MST, ngân hàng.
4. Phân loại bucket public vs private + signed URL cho dữ liệu nhạy cảm.
5. Generated types + typed client.
6. Backup/PITR, tách môi trường dev–staging–prod, không để `service_role` ở client, index + rate-limit cho endpoint ghi.
