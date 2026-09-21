# Checklist triển khai — Khắc phục & Đảm bảo lưu trữ Supabase

Chia 2 phần: **A. Việc tôi (AI Agent) làm** · **B. Việc bạn PHẢI làm** (vì liên quan tài khoản/bí mật/thanh toán — tôi không thể tự làm).
Cuối cùng là **C. Cách kiểm chứng để "đảm bảo"**.

---

## A. VIỆC TÔI LÀM

### A1. Đã xong (bộ thiết kế trong `chocuda-supabase/`)
- [x] Phân tích hiện trạng repo + đối chiếu 15 yêu cầu + 6 điểm bổ sung (`01-phan-tich-va-de-xuat.md`).
- [x] SQL schema đầy đủ (`0001_schema.sql`): enums, bảng, index, trigger `updated_at`, audit log, RPC soft-delete, view public.
- [x] RLS policies cho **22 bảng** (`0002_rls.sql`).
- [x] 8 Storage bucket + policy public/private (`0003_storage.sql`).
- [x] Service layer CRUD typed (`src/lib/supabase/services.ts`) + client tách anon/service_role (`client.ts`).
- [x] Script ETL `app_data_store.json → Supabase` (idempotent, dump phần chưa map).

### A2. Việc tôi làm tiếp — CHỜ BẠN XÁC NHẬN để tôi sửa trực tiếp vào repo
- [ ] Tạo nhánh `feature/supabase-migration` trong repo `chocuda`.
- [ ] Copy `supabase/migrations/*.sql` vào repo thật.
- [ ] Thêm `@supabase/supabase-js` vào `package.json`.
- [ ] Viết lại `src/lib/api.ts` để gọi qua service layer thay cho `fetch('/api/...')` + `localStorage` (giữ tương thích ngược: nếu chưa có env Supabase thì fallback như cũ).
- [ ] Thay `/api/upload` (multer) bằng `media.upload()` (Supabase Storage) + giữ route cũ chuyển tiếp.
- [ ] Giữ `server.ts` cho phần AI (Gemini) & SePay webhook, nhưng các webhook/cron ghi DB thì chuyển sang `createAdminClient()`.
- [ ] Xoá dần `dataPersistence.ts` (localStorage) sau khi Supabase chạy ổn định.
- [ ] Viết test RLS (đăng nhập user A, thử đọc/sửa/xoá dữ liệu user B → phải bị chặn).

---

## B. VIỆC BẠN PHẢI LÀM (không thể thay thế)

### B1. Tạo project Supabase (~3 phút)
1. Vào https://supabase.com → New project → chọn region **Singapore** (gần VN nhất) → đặt mật khẩu DB mạnh.
2. Vào **Project Settings → API**, lấy 3 giá trị:
   - `Project URL`
   - `anon public key` (cho frontend)
   - `service_role key` (**BÍ MẬT — chỉ dùng ở server, không đưa vào Vite**)

### B2. Chạy migration
- Mở **SQL Editor**, dán và Run lần lượt **theo đúng thứ tự**: `0001_schema.sql` → `0002_rls.sql` → `0003_storage.sql`.
- Hoặc dùng CLI: `supabase link --project-ref <ref>` rồi `supabase db push`.

### B3. Cấu hình Auth
- **Authentication → Providers**: bật Email; bật Google/Facebook nếu muốn giữ đăng nhập cũ.
- **URL Configuration → Site URL**: đặt `https://chocudan24h.com` + Redirect URLs (`/auth/callback`).

### B4. Biến môi trường
Đặt trên Render (server) và trong `.env` local:
```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***        # chỉ ở server, KHÔNG có tiền tố VITE_
```
> ❗ Đồng thời **xoá/rotate** các secret đang lộ trong repo: `.env.example` đang chứa Google OAuth Client ID + Facebook App ID; `firebase-applet-config.json` chứa apiKey. Đưa vào `.gitignore`, không commit nữa.

### B5. Di trú dữ liệu cũ
- Tải `app_data_store.json` từ server hiện tại về (nếu file trên Render bị reset thì lấy bản trong git/backup).
- Chạy: `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=*** node scripts/migrate-json-to-supabase.mjs ./app_data_store.json`
- Kiểm tra `unmapped-data.json` để biết entity nào chưa map (không bỏ sót).

### B6. Tạo tài khoản admin đầu tiên
- Đăng ký 1 user qua app → mở SQL Editor chạy:
  ```sql
  update public.profiles set role='admin' where email='admin@chocudan24h.com';
  ```

### B7. Vận hành & an toàn (bật trong Supabase Dashboard)
- [ ] **Database → Backups**: bật PITR (hoặc ít nhất daily backup).
- [ ] Tạo **project dev** riêng để test migration trước khi áp lên prod.
- [ ] Bật **Network Restrictions / SSL enforcement**.
- [ ] Đừng chia sẻ `service_role key`; nếu lỡ commit → **rotate ngay**.

---

## C. CÁCH KIỂM CHỨNG ĐỂ "ĐẢM BẢO"

Chạy đủ 8 test sau, mỗi cái phải PASS mới coi là xong:

| # | Test | Cách kiểm | Kỳ vọng |
|---|---|---|---|
| 1 | User A không đọc được PII của B | Đăng nhập A → `select * from user_sensitive where user_id='<B>'` | 0 dòng |
| 2 | User A không sửa được bài của B | A gọi `update posts set title=... where id='<bài B>'` | 0 dòng / lỗi RLS |
| 3 | Public không thấy bài `pending` | Gọi API danh sách khi chưa login | Không có bài pending |
| 4 | Xoá mềm đúng quyền | A xoá bài B → bị chặn; A xoá bài A → `deleted_at` set, bản ghi vẫn còn trong DB |
| 5 | Audit log ghi lại | Sau thao tác trên, `select * from admin_audit_log` (bằng admin) | Có dòng action tương ứng |
| 6 | Không lộ secret | Tìm `service_role` trong bundle frontend (`dist/`) | Không có |
| 7 | Storage private | Mở URL CCCD khi chưa đăng nhập | 403; chỉ đọc được qua signed URL |
| 8 | Dữ liệu cũ đã sang | So số lượng: `select count(*)` từng bảng vs JSON gốc | Khớp (trừ phần ghi trong `unmapped-data.json`) |

---

## D. THỨ TỰ KHUYẾN NGHỊ
1. Bạn làm **B1 → B4** (tạo project + chạy migration + env).
2. Báo tôi "xong", tôi làm **A2** (sửa code trong repo, tạo PR) + chạy **C1–C7** trên project dev.
3. Bạn duyệt PR → chạy **B5, B6** trên prod → chạy **C8** đối chiếu số lượng.
4. Xong: gỡ dần localStorage + file JSON, bật backup (B7).

> Điểm chặn duy nhất để tôi bắt đầu A2: **bạn xác nhận "đồng ý sửa code vào repo"** và cho tôi quyền push (hoặc tôi soạn PR dạng patch để bạn tự merge).
