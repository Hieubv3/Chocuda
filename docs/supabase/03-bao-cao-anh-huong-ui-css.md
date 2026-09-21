# Báo cáo — Chuyển lưu trữ sang Supabase có ảnh hưởng GIAO DIỆN / CSS không?

**Kết luận ngắn:** CSS **KHÔNG đổi**. Giao diện **giữ nguyên 100%** nếu đi đúng cách (adapter qua lớp `fetch`). Chỉ 4 điểm cần xử lý ở tầng dữ liệu, không đụng tới Tailwind/CSS.

---

## 1. Bằng chứng đã kiểm tra trong repo

| Hạng mục | Kết quả | Ý nghĩa |
|---|---|---|
| `src/index.css` | **111 dòng** | Toàn bộ style là **Tailwind 4 utility** (inline class), không có CSS viết tay phụ thuộc dữ liệu |
| Gọi `fetch(...)` trực tiếp trong component | **226 chỗ** | Đây là rủi ro chính — UI gắn chặt vào `/api/*` |
| Đã có loading state (`isLoading`) | **64 chỗ** | UI đã có sẵn skeleton ở nhiều nơi → đỡ phải viết mới |
| Ảnh upload | `uploadService.ts` → `/uploads/...` hoặc base64 | `<img src>` + Tailwind không đổi; chỉ đổi nguồn URL |
| Auth patch toàn cục | `api.ts` có `installAuthFetchPatch()` patch `window.fetch` | **Điểm vàng**: có thể chuyển `/api/*` sang Supabase ngay trong lớp này, **không sửa 226 chỗ, không đổi UI** |

---

## 2. Phân tích chi tiết: ảnh hưởng ở đâu, KHÔNG ảnh hưởng ở đâu

### ✅ KHÔNG ảnh hưởng
- **CSS/Tailwind/bố cục/màu sắc**: đổi nguồn dữ liệu không đụng tới class.
- **Cấu trúc component**: vẫn là React + cùng state shape → không phải viết lại giao diện.

### ⚠️ Ảnh hưởng GIÁN TIẾP (tầng dữ liệu, có thể thấy trên UI nếu không xử lý)
1. **226 lời gọi `fetch('/api/...')`** — nếu thay backend kiểu "bỏ Express" thì vỡ 226 chỗ.
   → **Giải pháp:** giữ `installAuthFetchPatch()`, bên trong translate `/api/*` → Supabase query. UI vẫn gọi `fetch('/api/properties')` như cũ → **0 thay đổi giao diện**.
2. **Đồng bộ → bất đồng bộ**: localStorage trả ngay; Supabase qua mạng (~50–200ms). Nếu không có loading state, danh sách sẽ "trắng 1 nhịp" rồi mới hiện (layout shift).
   → Đã có sẵn 64 chỗ `isLoading`; bổ sung skeleton cho các list còn thiếu.
3. **URL ảnh đổi**: `/uploads/xxx.jpg` hoặc base64 → URL Supabase Storage (`https://<ref>.supabase.co/storage/v1/object/public/...`).
   → `uploadService.ts` đã có sẵn `isAbsoluteUrl()` → chỉ cần thêm nhánh nhận URL tuyệt đối; `<img>` và Tailwind không đổi.
   → Ảnh base64 cũ trong localStorage phải **di trú lên Storage**, nếu không localStorage đầy (5–10MB) làm mất ảnh (vấn đề code đã tự ghi chú).
4. **Xoá mềm**: bài đã xoá (`deleted_at != null`) phải được lọc khi đọc, nếu không bài "đã xoá" vẫn hiện trên UI.
   → Thêm filter `is('deleted_at', null)` trong service layer (đã có trong `services.ts`).

---

## 3. Quyết định kỹ thuật để GIAO DIỆN KHÔNG ĐỔI

Chọn **phương án "Drop-in adapter"**:
- Giữ nguyên mọi endpoint `/api/*` mà UI đang gọi.
- Trong `installAuthFetchPatch()` (đã có sẵn), khi thấy URL bắt đầu `/api/` → chuyển sang gọi Supabase service layer → trả về Response có **cùng shape JSON** như cũ (`{ success, data }` hoặc mảng).
- Kết quả: **0 file component bị sửa, 0 dòng CSS bị sửa**.

**Khi nào mới cần sửa UI?** Chỉ khi muốn dùng thêm tính năng mới (realtime chat/notification, phân trang server-side). Còn bản thân việc chuyển lưu trữ là **trong suốt với giao diện**.

---

## 4. Danh sách việc cần làm (không đụng CSS)
1. Thêm adapter `/api/*` → Supabase vào `api.ts` (giữ shape JSON cũ).
2. Thêm skeleton/loading cho các list chưa có `isLoading`.
3. Sửa `uploadService.ts` nhận URL tuyệt đối Supabase (thêm nhánh `isAbsoluteUrl`).
4. Di trú ảnh base64/localStorage → Storage (một lần).
5. Filter `deleted_at is null` ở mọi truy vấn đọc.

> Nếu bạn muốn, tôi có thể viết luôn **file `supabaseFetchAdapter.ts`** (chèn vào `api.ts`) để chứng minh giao diện không đổi — sửa xong chỉ cần chạy `npm run dev` là thấy giao diện y hệt, chỉ khác dữ liệu giờ nằm ở Supabase.
