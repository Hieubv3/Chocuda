# Bản vá lỗi — chocudan24h.com

Ngày: 2026-09-19 (cập nhật 2026-09-21)

## 3. `src/components/IndustryQuickNav.tsx` (MỚI)

### Fix 6 — 4 NHÓM NGÀNH hiển thị ở MỌI TRANG
- Trước: 4 nhóm ngành (Mua Bán BĐS / Cho Thuê BĐS / Dịch Vụ Cư Dân / Việc Làm Nội Khu) chỉ có ở **Trang chủ**; các trang khác không có.
- Sau: tạo component dùng chung `IndustryQuickNav` và gắn **toàn cục** trong `App.tsx` → **mọi trang** (trừ trang chủ, vốn đã có 4 thẻ lớn) đều có thanh 4 menu ngành.
- Hiển thị trên **cả mobile & desktop** (2 cột mobile / 4 cột desktop), có trạng thái active + hỗ trợ dark mode.

### Sửa trong `src/App.tsx`
- Thêm `import { IndustryQuickNav }` và render ngay dưới `<Header />` khi `location.pathname !== '/'`.

---

## 1. `server.ts`

### Fix 1 — Dữ liệu lưu vào thư mục BỀN VỮNG (lỗi "xóa không triệt để")
- Trước: `app_data_store.json` nằm trong thư mục app (`process.cwd()`), **ngoài** ổ đĩa bền `/app/uploads` (Render) → mất sạch mỗi lần deploy/restart → dữ liệu (bài đăng, dự án, quỹ căn...) **bị khôi phục về bản gốc**.
- Sau: lưu vào `UPLOADS_DIR` (`/app/uploads/...`) — chính là ổ đĩa đã khai báo trong `render.yaml`. Có thể override bằng biến môi trường `DATA_DIR`.
- Tự động **di trú** dữ liệu cũ từ `app_data_store.json` ở thư mục app sang thư mục bền vững (nếu có).

### Fix 2 — Dọn "bia mộ xóa" (`deletedIds`)
- Nếu một bài bị xóa rồi được **tạo/khôi phục lại cùng `id`**, trước đây nó sẽ **tự biến mất** sau khi restart (do `deletedIds` không bao giờ được dọn).
- Nay: khi load, id nào **đang tồn tại lại** trong dữ liệu đã lưu sẽ được bỏ khỏi danh sách đã xóa.

### Fix 3 — Bổ sung các API mà giao diện đang gọi nhưng backend thiếu
| Endpoint | Trước | Sau |
|---|---|---|
| `GET/POST /api/system/pricing-config` | ❌ 404 | ✅ Lưu/đọc cấu hình giá "up tin" (POST cần admin) |
| `GET /api/user-storefronts` | ❌ trả HTML | ✅ Trả danh sách gian hàng cư dân |
| `GET/POST /api/workspace/config` | ❌ 404 | ✅ Lưu cấu hình Google Workspace (bền vững) |
| `POST /api/workspace/sync-all` | ❌ 404 | ✅ Endpoint đồng bộ |
| `POST /api/recruitment/apply` | ❌ 404 | ✅ Thêm alias → dùng chung handler với `/api/recruitment/applications` |

### Fix 4 — Lưu cấu hình Workspace vào data store
- Thêm `workspaceConfig` vào `saveDataStore()` và `loadDataStore()`.

---

## 2. `src/App.tsx`

### Fix 5 — Xóa "thật" (chỉ xóa giao diện khi server xác nhận)
- Trước: xóa trên UI + localStorage **trước**, gọi API sau và **không kiểm tra kết quả** → server lỗi thì UI vẫn báo đã xóa, refresh là "sống lại".
- Sau: gọi API trước, **chỉ xóa trên UI khi server trả về OK**; nếu lỗi thì hiện thông báo và giữ nguyên.
- Áp dụng cho: xóa **bài đăng BĐS**, **bài viết (tin tức)**, **dự án**.

---

## Kiểm tra
- Cú pháp: `esbuild` compile `server.ts` + `src/App.tsx` → OK.

## Việc nên làm tiếp (khuyến nghị)
1. **Chuyển sang database thật** (PostgreSQL/Supabase) — Render free không bảo đảm bền vững 100%.
2. Gắn `authenticateToken, requireAdmin` cho các route `DELETE` đang mở (properties/projects/news/ads/resident-services/stores...). *Lưu ý: cần rà lại luồng người dùng tự xóa bài của mình để không chặn nhầm.*
3. Khi xóa bài → xóa kèm ảnh trong `/uploads` và đơn hàng liên quan.
4. Bỏ lộ token `VITE_TELEGRAM_BOT_TOKEN` ở phía client (chuyển sang backend).
