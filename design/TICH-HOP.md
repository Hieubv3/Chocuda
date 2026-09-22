# Tích hợp giao diện mới vào Chợ Cư Dân 24h

Tài liệu này hướng dẫn gắn bộ giao diện mới vào dự án React hiện có, **chỉ áp cho giao diện web công khai**. Khu quản trị giữ nguyên phong cách cũ cho tới khi có bước chuyển riêng.

## 1. Nhánh này thêm gì

| Đường dẫn | Nội dung |
|---|---|
| `design/theme/chocudan-theme.css` | Bộ token và lớp component dùng được ngay với Tailwind v4 |
| `design/preview/*.html` | Bản xem trước để đối chiếu: các trang người dùng, các trang quản trị, luồng chọn khu vực |
| `design/TICH-HOP.md` | Tài liệu này |

Nhánh này **không sửa** mã đang chạy, không đổi route, không đổi nghiệp vụ. Toàn bộ là file mới, an toàn để duyệt trước khi merge.

## 2. Nguyên tắc

1. Chỉ áp cho giao diện công khai, **không đụng** `AdminDashboardPage`, `AdminLoginPage`, `EnterpriseAdminCore` và các `Admin*` khác.
2. Không đổi tên route, không đổi cấu trúc dữ liệu, không đổi luồng nghiệp vụ.
3. Đổi dần từng component, mỗi lần một khối, để dễ kiểm tra và dễ quay lui.
4. Mọi thứ đi qua token, không hardcode màu trong component.

## 3. Các bước tích hợp

### Bước 1. Thêm file theme và import

Chép `design/theme/chocudan-theme.css` vào `src/styles/chocudan-theme.css`.

Trong `src/index.css`, import **sau** dòng import Tailwind:

```css
@import "tailwindcss";
@import "./styles/chocudan-theme.css";
```

File theme định nghĩa một khối `@theme` nên Tailwind v4 sẽ tự sinh tiện ích: `bg-brand-600`, `text-brand-700`, `border-line`, `font-display`, `font-body`, `rounded-md` theo token mới.

### Bước 2. Đặt thuộc tính trên thẻ html

Bộ theme đọc hai thuộc tính:

- `data-skin`: `emerald` (mặc định), `coral`, `ocean`, `honey`, `rose`, `teal`
- `data-theme`: `light` hoặc `dark` (cũng hỗ trợ class `dark`)

Gợi ý: đặt trong `index.html` mặc định `data-skin="emerald"` và `data-theme="light"`, rồi lưu lựa chọn của người dùng vào localStorage, cập nhật ở gốc ứng dụng trong `main.tsx`.

### Bước 3. Áp cho từng khu vực

Nên làm theo thứ tự để thấy kết quả sớm:

1. `Header.tsx` và `Footer.tsx`: dùng `btn`, `btn-primary`, `btn-secondary`, `chip`, `badge`.
2. `PropertyCard.tsx`, `PropertyFilter.tsx`: dùng `card24`, `price24`, `spec24`, `badge-*`.
3. `HomePage.tsx`: bố cục lại theo thứ tự ưu tiên (dịch vụ cư dân và việc làm trước, BĐS là kênh phụ trợ).
4. Các trang danh sách và chi tiết: bọc nội dung trong `.cd24-root` để nhận nền và màu chữ mới.

Ví dụ nút:

```jsx
<button className="btn btn-primary">Mở gian hàng</button>
<span className="badge badge-sale">Chuyển nhượng</span>
<div className="card24"><span className="price24">8,5 tỷ<small>Thương lượng</small></span></div>
```

### Bước 4. Bật đổi bảng màu và sáng/tối

Dùng sáu bảng màu trong token. Chỉ cần đổi `data-skin` trên thẻ html là toàn bộ nút, nhãn, viền, nền nhạt cập nhật đồng bộ. Nút sáng/tối chỉ cần đổi `data-theme`.

### Bước 5. Phông chữ

Bộ chữ: tiêu đề `Plus Jakarta Sans`, nội dung `Be Vietnam Pro`, số và giá `JetBrains Mono`. Cả ba đều có bộ ký tự tiếng Việt. Nên tự host bằng `@font-face` để không phụ thuộc mạng ngoài.

## 4. Danh sách trang đã thiết kế (để đối chiếu khi làm)

**Người dùng:** chào mừng, chọn khu đô thị, chọn phân khu, chọn nhu cầu, xác nhận; trang chủ; dịch vụ cư dân (danh sách, chi tiết); việc làm (danh sách, chi tiết); hồ sơ ứng viên; nhà tuyển dụng; chợ cư dân và chi tiết sản phẩm; gian hàng (danh sách, chi tiết); BĐS mua bán, cho thuê, chi tiết; dự án và tiện ích; tin tức và bài viết; cộng đồng và nhóm; đăng tin; tính lãi vay; tài khoản và ví; đăng nhập và KYC; giới thiệu; chuyên gia; chính sách bảo mật; điều khoản; sơ đồ website; trang 404. Kèm bộ 12 màn hình di động.

**Quản trị:** đăng nhập; tổng quan; menu 8 nhóm; duyệt tin và chi tiết duyệt; duyệt KYC và nút xanh; yêu cầu đặt lịch xem nhà; thành viên và khách; dự án và bảng hàng CĐT; quảng cáo banner; công cụ và bot; marketing và lead; trung tâm SEO; quản lý tuyển dụng; nhóm Zalo; tài chính và thuế; thẻ và gói dịch vụ; phân quyền và cài đặt; nhật ký hoạt động; lịch sử đơn dịch vụ (chỉ ghi lại).

## 5. Cách kiểm tra sau khi áp

- Mở một trang công khai ở ba khổ: 375px, 768px, 1280px, kiểm tra không tràn ngang.
- Kiểm tra `:focus-visible` trên nút, ô nhập, liên kết.
- Kiểm tra tương phản chữ trên nút chính và nhãn trạng thái.
- Bật chế độ tối và thử hai bảng màu khác nhau.
- Mở vài trang quản trị để chắc chắn phong cách cũ không bị ảnh hưởng.

## 6. Thứ tự merge đề xuất

1. Merge nhánh này (chỉ thêm file theme và preview, chưa áp vào component).
2. Một nhánh riêng để áp cho Header, Footer và trang chủ.
3. Một nhánh riêng cho các trang danh sách và chi tiết.
4. Sau khi web công khai ổn định mới bàn tới việc chuyển khu quản trị.

Làm theo thứ tự này thì mỗi bước đều nhỏ, dễ kiểm tra và dễ quay lui.
