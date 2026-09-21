# Phân tích hiện trạng repo `hieubv3/chocuda` & thiết kế lưu trữ Supabase

> Tài liệu này trả lời 2 câu hỏi: (1) Repo hiện tại đang lưu dữ liệu thế nào, danh sách yêu cầu của bạn đã "OK" chưa, thiếu gì? (2) Thiết kế Supabase đầy đủ ra sao (schema → SQL migration → RLS → Storage → API/service layer).

---

## PHẦN A — HIỆN TRẠNG THỰC TẾ CỦA REPO

Repo đã clone và soi trực tiếp: `chocuda` (HEAD `b2e81d1`). Đây là app **"Chợ Cư Dân 24h / chocudan24h.com"** — sàn BĐS + chợ cư dân + dịch vụ + tuyển dụng.

### A.1 Kiến trúc hiện tại
| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Frontend | React 19 + Vite 6 + TypeScript + Tailwind 4 | SPA ~48 pages, ~90 components |
| Backend | **Express 4 (`server.ts` ~8.600 dòng)** | 1 file khổng lồ, chạy `tsx server.ts` |
| Auth | **JWT tự viết** (`jsonwebtoken`) + `bcryptjs` + TOTP 2FA + Google/Facebook/Zalo login | Không dùng Supabase Auth |
| Lưu trữ | **File JSON đơn `app_data_store.json`** (+ `.backup.json`), load vào RAM khi khởi động | `loadDataStore()` / `saveDataStore()` |
| Cache client | **localStorage** nhiều key (`chocudan24h_*`, legacy `hb_*`) qua `src/lib/dataPersistence.ts` | Có cơ chế 2 chiều localStorage ↔ server |
| Upload file | **multer → thư mục `UPLOADS_DIR` local** (`/api/upload`, `/api/upload/base64`) | Không có CDN/object storage |
| Supabase | **KHÔNG CÓ** (grep toàn repo: 0 kết quả dùng thật) | Có `firebase-applet-config.json` (applet cũ, không dùng) |
| Thanh toán | SePay webhook `/api/webhooks/sepay` | |

### A.2 Danh sách entity thực tế (từ `src/types.ts` + `app_data_store.json`)
App đang có **~40 thực thể** dữ liệu, nhóm lại:

- **Người dùng & tài chính:** `User`, `UserWallet`, `UserBankDetails`, `WalletTransaction`, KYC (`idCardNumber`, `idCardFrontUrl/Back`, `businessLicenseUrl`, `brokerLicenseUrl`, `taxCode`).
- **Bài đăng BĐS:** `Property` (status: approved/pending/sold/rejected; vipLevel; soDoImage + soDoRedactedImage; expiresAt).
- **Dự án / phân khu / tiện ích:** `Project`, `ProjectSubdivision`, `AmenityArticle`.
- **Nội dung chia sẻ kiến thức:** `NewsArticle` (category: vinhomes/quy-hoach/thi-truong/nhan-dinh/kinh-nghiem; source: n8n/manual/ai).
- **Đánh giá uy tín:** `ReputationPost`.
- **Chợ cư dân:** `UserStorefront` (gian hàng), `StoreProduct` (sản phẩm), `StoreOrder`, `StorePackage`, `StorePackageOrder`, `KiotVietConfig`.
- **Dịch vụ cư dân:** `ResidentServiceItem`, `ResidentServiceCategory`, `SubmittedKycDoc`, `IndustryKycRule`.
- **Tuyển dụng:** `RecruitmentJob`, `CandidateProfile`, `JobApplication`, `CvUnlockRecord`, `EmployerProfile`, `RecruitmentPackage`, `EmployerRegistrationRequest`.
- **Kỹ thuật/Escrow:** `TechnicalServiceOrder`, `ServiceJobDispatch`.
- **CRM/Admin:** `LeadContact`, `CRMContactRecord`, `AdminTaskDelegation`, `HourlyTask`, `BranchScope`, `UserActivityMetrics`, `RewardConfig`, `MenhMocConfig`, `SocietyConfig`...
- **Quảng cáo/SEO:** `AdBanner`, `MarketVideo`, `ZaloGroup`, homepage category images.
- **CĐT:** `DeveloperUnit`, `F1Agent`, `DeveloperPolicy`, `DeveloperInstallment`, `DeveloperBank`, `DeveloperFloorplan`.
- **Khác:** `UpTinPricingConfig`, `UpTinTransaction`, `taxConfig`, `taxLedger`, `deletedIds` (danh sách id đã xoá để không merge lại).

### A.3 Vấn đề nghiêm trọng của cách lưu hiện tại
1. **Single point of failure:** toàn bộ DB là 1 file JSON ghi đè mỗi lần `saveDataStore()` → deploy lại/Render restart là mất dữ liệu (đã có dấu hiệu: code phải viết `mergeItemLists`, `deletedIds`, backup file để chống mất).
2. **Không có transaction, không quan hệ:** mọi thứ là mảng JSON trong RAM → 2 request ghi đồng thời = race condition / mất bài.
3. **Bảo mật:** `app_data_store.json` **được commit vào repo**, có thể chứa hash bcrypt admin + dữ liệu user. Không có row-level security; phân quyền chỉ nằm ở middleware Express (`requireAdmin`, `requireOwnership`).
4. **Dữ liệu nhạy cảm nằm chung** với dữ liệu công khai (CCCD, giấy phép KD, số tài khoản ngân hàng) trong cùng bản ghi `User` → API nào trả user là lộ hết.
5. **File upload lưu local** → mất khi container reset, không scale.
6. **~40 mảng JSON song song** → mọi endpoint phải tự merge/seed thủ công, rất dễ sai.

---

## PHẦN B — ĐỐI CHIẾU DANH SÁCH YÊU CẦU CỦA BẠN

Chấm theo mức: ✅ đã ổn (và giữ được khi sang Supabase) · ⚠️ đã có nhưng cần làm đúng cách · ❌ đang thiếu / phải bổ sung.

| # | Yêu cầu của bạn | Trạng thái | Nhận xét |
|---|---|---|---|
| 1 | Tất cả bài đăng lưu vào Supabase | ⚠️ | Đang ở JSON. Cần 1 bảng `posts` hợp nhất + các bảng chi tiết. |
| 2 | Bài đăng sản phẩm lưu đầy đủ | ⚠️ | `StoreProduct` → bảng `products` + `stores`. |
| 3 | Nội dung chia sẻ kiến thức lưu đầy đủ | ⚠️ | `NewsArticle` → bảng `knowledge_posts`. |
| 4 | Dữ liệu admin lưu riêng + quyền phù hợp | ❌ | Chưa tách. Cần `admin_audit_log` + role admin/manager + RLS riêng. |
| 5 | Dữ liệu nhạy cảm khách hàng được bảo vệ, không trả cho người không có quyền | ❌ | Đang lộ. Cần **tách bảng `user_sensitive`** + view che + RLS. |
| 6 | Mỗi bản ghi có id, user_id, created_at, updated_at, status | ⚠️ | JSON có `id`/`createdAt` nhưng thiếu `updated_at`, thiếu `user_id` nhất quán. |
| 7 | Quan hệ rõ giữa users, posts, products, comments, media | ❌ | Không có khái niệm `comments`/`media` bảng riêng; `media` chỉ là mảng URL string. |
| 8 | Dùng Supabase Auth | ❌ | Đang JWT tự viết. |
| 9 | Dùng RLS để kiểm soát đọc/ghi/sửa/xoá | ❌ | Chưa có. |
| 10 | Không lưu secret/password ở frontend | ⚠️ | Đã tách env, nhưng `.env.example` **lộ Google/Facebook App ID + OAuth client id**; và service_role key TUYỆT ĐỐI không được đưa vào Vite. |
| 11 | Ảnh/file dùng Supabase Storage, metadata trong DB | ❌ | Đang multer đĩa local. |
| 12 | Tạo migration SQL chạy trực tiếp | ❌ | Chưa có (sẽ tạo). |
| 13 | API/service layer cho AI Agent CRUD | ❌ | Chưa có (sẽ tạo). |
| 14 | Trước khi xoá phải kiểm tra quyền, tránh xoá nhầm | ❌ | Hiện `deletedIds` thủ công. Cần **soft-delete + audit + guard**. |
| 15 | Với dữ liệu nhạy cảm chỉ trả field được phép xem | ❌ | Cần **view/RPC column masking**. |

**Kết luận Phần B:** Danh sách yêu cầu của bạn **đúng hướng và khá đầy đủ cho lớp lưu trữ**, nhưng còn **thiếu 6 điểm quan trọng** cần bổ sung (xem Phần C).

---

## PHẦN C — 6 ĐIỂM CẦN BỔ SUNG (bạn chưa nêu)

1. **Kế hoạch di trú dữ liệu cũ (migration data).** Bạn đang có hàng nghìn bản ghi trong `app_data_store.json` + localStorage của người dùng. Phải có script ETL chuyển JSON → Supabase, chạy 1 lần, idempotent (chống chạy trùng).
2. **Soft-delete + Audit log.** Yêu cầu #14 chỉ nói "kiểm tra quyền & tránh xoá nhầm" → giải pháp đúng là: mọi bảng có `deleted_at`, mọi thao tác ghi vào `audit_log` (ai/xoá gì/lúc nào/giá trị cũ), và xoá cứng chỉ admin được làm.
3. **Mã hoá PII (encryption at rest cho dữ liệu nhạy cảm).** CCCD, số tài khoản ngân hàng, mã số thuế nên để trong cột mã hoá bằng `pgcrypto` hoặc tối thiểu là bảng tách biệt + RLS chặt.
4. **Storage bucket policy & phân loại public/private.** Ảnh tin đăng = public; **CCCD/giấy phép = bucket private** + signed URL có hạn. Bạn chưa nói rõ cái nào public/private.
5. **Generated types + typed client.** `supabase gen types typescript` để AI Agent và frontend dùng type-safe, tránh sai cột.
6. **Backup / PITR / môi trường tách biệt** (dev–staging–prod), RLS phải tắt `service_role` bypass ở client, và rate-limit ở tầng DB/RPC cho endpoint ghi.
   *(Phụ: realtime cho chat/notification, và index cho các cột lọc (`status`, `user_id`, `category`, `created_at`) — bắt buộc để không chậm.)*

---

## PHẦN D — THIẾT KẾ SCHEMA SUPABASE (tóm tắt; SQL đầy đủ ở `supabase/migrations/`)

### D.1 Sơ đồ quan hệ
```
auth.users (Supabase Auth)
   └─1:1─ profiles ──1:1── user_sensitive (PII, RLS chặt)
              │
              ├─1:n─ posts ──1:n── comments ──1:n── comments(reply)
              │        │
              │        ├─1:n─ media (entity_type='post')
              │        └─1:n─ reactions
              │
              ├─1:n─ properties   (bài đăng BĐS, có thể gắn posts.id)
              │        └─1:n─ media (entity_type='property')
              │
              ├─1:n─ stores ──1:n── products ──1:n── product_orders
              │        └─1:n─ media (entity_type='store' / 'product')
              │
              ├─1:n─ knowledge_posts (bài chia sẻ kiến thức) ──1:n── comments
              │
              ├─1:n─ recruitment_jobs ──1:n── job_applications
              ├─1:n─ wallet_transactions / withdrawal_requests
              └─1:n─ notifications / messages

admins  ── (role trong profiles) ──  admin_audit_log (append-only)
lookup: projects_catalog, business_categories
```

### D.2 Bảng hợp nhất `posts` (cho yêu cầu #1)
Một bảng `posts` làm "bài đăng chung" cho mọi loại nội dung người dùng:
`post_type ∈ {property, product, knowledge, reputation, service, job, general}`.
Các bảng chi tiết (`properties`, `products`, `knowledge_posts`) giữ field chuyên biệt và trỏ về `posts.id` (nullable — cho phép cả 2 kiểu).

### D.3 Bảo vệ dữ liệu nhạy cảm (yêu cầu #5, #15)
- `profiles` = **chỉ dữ liệu công khai** (tên, avatar, role, tier, apartment...).
- `user_sensitive` = **CCCD, ảnh CCCD, giấy phép, MST, ngân hàng** → RLS: chỉ chủ sở hữu + admin.
- Public chỉ đọc qua **view `public_profiles`** (đã lọc bớt cột) → "chỉ trả field được phép xem".

### D.4 Kiểm soát xoá (yêu cầu #14)
- Tất cả bảng: `deleted_at timestamptz null` + RLS chặn `SELECT` khi `deleted_at is not null` (trừ admin).
- Trigger ghi `admin_audit_log` cho mọi INSERT/UPDATE/DELETE trên bảng quan trọng.
- RPC `soft_delete_*()` kiểm tra `auth.uid()` là chủ sở hữu hoặc admin trước khi set `deleted_at`.

---

## PHẦN E — BỘ FILE ĐÃ TẠO

Xem thư mục `chocuda-supabase/` (được liệt kê trong mục Deliverables của câu trả lời).

---

## PHẦN F — VỀ `donnemartin/system-design-primer`
Đã clone và đọc (`sdp/`). Đây **không phải** thư viện code mà là **giáo trình ôn phỏng vấn system design** (~450k sao GitHub), gồm:
- `README.md`: case study lớn — thiết kế URL shortener, Pastebin, **Twitter timeline**, **web crawler**, **Mint.com**, **cơ sở dữ liệu có scale**, cache, hàng đợi...
- `solutions/`: lời giải từng bài; `resources/`: bộ flashcards Anki + câu hỏi phỏng vấn; `images/`: sơ đồ.

**Liên hệ trực tiếp với việc của bạn** — 4 bài học áp dụng ngay cho Chợ Cư Dân:
1. **"Design a key-value store / SQL scaling"**: dạy khi nào dùng RDBMS vs NoSQL. App của bạn là **dữ liệu quan hệ rõ ràng (user–post–product–order)** → chọn Postgres (Supabase = Postgres) là đúng, **không** nên NoSQL.
2. **"Scaling a traditional website"**: giải thích tại sao 1 file JSON trong RAM (`app_data_store.json`) là anti-pattern → đúng với vấn đề mất dữ liệu của bạn.
3. **Security / "Don't store secrets in the repository"**: trùng khớp yêu cầu #10 của bạn (và giải thích vì sao `.env.example` đang lộ app id).
4. **Back-of-the-envelope numbers & CAP**: giúp bạn chọn mức độ (Supabase free/Pro, index nào, khi nào cần cache/realtime).

Tóm lại: primer là **tài liệu học nguyên lý**, còn phần D–E là **bản triển khai cụ thể** cho chocuda. Đọc primer mục *"Database" + "Designing a system that scales" + case study "Twitter timeline"* là đủ để hiểu vì sao thiết kế trong Phần D được chọn như vậy.
