# Hướng dẫn cho agent AutoClaw dùng bộ giao diện mới

File này để bất kỳ agent AutoClaw nào làm việc trên repo này dùng lại được toàn bộ bộ giao diện mới mà không cần hỏi lại.

## 1. Bộ giao diện nằm ở đâu

| File | Vai trò |
|---|---|
| `src/styles/chocudan-theme.css` | Toàn bộ token, 6 bảng màu, sáng/tối, lớp component. **Đây là nguồn duy nhất** |
| `src/styles/admin-mobile.css` | Tối ưu riêng cho quản trị dưới 1024px |
| `src/index.css` | Đã import hai file trên, sau Tailwind |
| `design/theme/chocudan-theme.css` | Bản tham chiếu đọc nhanh |

Không tạo file màu mới. Không hardcode mã màu trong component.

## 2. Nguyên tắc bắt buộc

- **Chỉ một màu nhấn** là emerald. Không thêm màu nhấn thứ hai.
- **Không dùng emoji** làm biểu tượng. Dùng icon từ `lucide-react`.
- **Không đổi giao diện PC của khu quản trị.** Mọi tinh chỉnh quản trị chỉ đặt trong media query dưới 1024px và nằm trong khối `.cd24-admin`.
- Đổi màu thì đổi ở token, không đổi rải rác trong component.

## 3. Cách dùng màu bằng tiện ích Tailwind

Khối `@theme` trong file theme đã sinh sẵn các tiện ích. Dùng trực tiếp:

- Thương hiệu: `bg-brand-50` … `bg-brand-950`, `text-brand-*`, `border-brand-*`, `fill-brand-500`
- Trung tính: `bg-ink-50` … `bg-ink-950`, `text-ink-*`, `border-ink-*`
- Bảng xám cũ (`slate`, `gray`) vẫn chạy nhưng **ưu tiên dùng `ink-*`** cho đồng bộ
- Chế độ tối: dùng tiền tố `dark:` như bình thường, ví dụ `bg-white dark:bg-ink-900`

Quy ước nền và chữ đang dùng trong dự án:

- Nền trang: `bg-ink-50 dark:bg-ink-950`
- Thẻ: `bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800`
- Chữ chính: `text-ink-900 dark:text-white`
- Chữ phụ: `text-ink-500 dark:text-ink-400`
- Viền: `border-ink-200 dark:border-ink-700`

## 4. Lớp component dùng sẵn

Đặt trong `@layer components`, gọi bằng tên class:

- Nút: `btn`, `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-job`, `btn-sm`, `btn-block`
- Nhãn nhỏ: `badge`, `badge-sale`, `badge-job`, `badge-pick`, `badge-soft`
- Chip lọc: `chip` (trạng thái chọn dùng `chip is-active` hoặc `aria-pressed="true"`)
- Ô nhập: `cd-input`
- Thẻ: `card24`
- Giá và số: `price24`, `cd-mono`, `cd-tnum`
- Phụ trợ: `spec24`, `note24`, `rating24`
- Bọc nền theo theme cho cả vùng: `cd24-root`

Ví dụ:

```jsx
<button className="btn btn-primary">Mở gian hàng</button>
<span className="badge badge-sale">Chuyển nhượng</span>
<div className="card24 p-4">
  <span className="price24">8,5 tỷ<small>Thương lượng</small></span>
</div>
```

## 5. Sáu bảng màu và sáng tối

Đặt trên thẻ `html`:

- `data-skin`: `emerald` (mặc định), `coral`, `ocean`, `honey`, `rose`, `teal`
- Sáng tối: thêm hoặc bỏ class `dark` trên `html` (dự án đang dùng class này)

Đổi `data-skin` là toàn bộ nút, nhãn, viền, nền nhạt đổi theo, không cần sửa component.

## 6. Đa ngôn ngữ

- Từ điển: `src/lib/i18n.ts`, ba ngôn ngữ `vi` / `en` / `zh`
- Lấy bản dịch: `const t = getTranslation(language)`
- Chuỗi giao diện mới nằm trong nhánh `t.ui.*`
- Component nhận `language` qua prop; nếu là modal độc lập thì nhận prop tuỳ chọn `language`
- **Không dịch dữ liệu người dùng nhập** (tin đăng, tên dự án, bài viết). Chỉ dịch chữ giao diện.

## 7. Việc cần tránh

- Không tạo bảng màu riêng, không dùng gradient tím xanh, không dùng emoji.
- Không đổi `main` sang cách đặt màu khác.
- Không chạy `npm run build` nhiều lần liên tiếp: script `scripts/autoclaw-fix.cjs` không lặp lại an toàn, sẽ chèn trùng dòng. Nếu lỡ, khôi phục file bằng `git checkout -- <file>` rồi build lại một lần.
- Khi thêm trang mới, dùng lại lớp component ở mục 4, không viết lại từ đầu.
