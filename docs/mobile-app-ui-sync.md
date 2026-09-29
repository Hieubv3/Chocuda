# Đồng bộ giao diện App Mobile — Kế hoạch & Tiến độ (nhánh `web-clone`)

Mục tiêu: đồng bộ **100% giao diện app mobile mới** (Chợ Cư Dân 24h) vào toàn bộ website, **giữ nguyên dữ liệu & logic cũ**. Desktop không thay đổi. Phần nào chưa hoàn thiện sẽ được làm lại theo phong cách mới.

## Phạm vi kỹ thuật
- Skin chính: `src/styles/mobile-app.css` (chỉ áp dụng mobile < 768px) + cụm component `MobileAppHeader` / `MobileAppHome` + các class `mapp-*`.
- **Không sửa**: routes, API, dữ liệu, logic nghiệp vụ.
- Nền tảng làm việc: nhánh `web-clone` (preview/deploy từ nhánh này).

## Đã hoàn thành
- **GD1–GD5** (đợt trước): khung app + trang chủ + header app + bottom nav, danh sách BĐS, bộ lọc, phân trang, footer, modal chi tiết BĐS, tài khoản, đăng nhập, trang đăng tin, modal thanh toán/chat; bảng màu tươi sáng mới (`#22C55E` / `#FFE9A8` / `#F8FAF5`).
- **GD6**: 25 khối gradient tối (navy/ink/tím) → tông xanh app — áp cho Tuyển dụng, Tin tức, Dự án, các trang chi tiết, modal, banner...
- **GD7**: accent tím / xanh dương còn sót → tông xanh app (nút, chip, badge, header chọn).
- **GD8**: drawer mobile (navy) → tông xanh app đậm.
- **Ngành hàng**: bổ sung "Quán Ăn, Cafe & Đồ Uống" + "Tạp Hóa & Siêu Thị Mini" vào form Đăng ký gian hàng, Đăng ký đối tác và form tạo gian hàng trong admin.

## Còn lại (checklist)
- [ ] Rà các nền tối dạng đặc (`bg-ink-900/800`, hex navy lẻ) ở các màn hình còn lại (đăng tin, tài khoản, tìm kiếm, các modal phụ...)
- [ ] Rà bo góc, thẻ, độ tương phản chữ theo từng nhóm trang
- [ ] Kiểm tra tổng thể mobile: Trang chủ, BĐS, Dự án, Dịch vụ cư dân, Chợ cư dân, Tuyển dụng, Tin tức, Cộng đồng, Tài khoản, Ví, Chat nội bộ, Đăng tin, các modal
- [ ] Đảm bảo desktop không bị ảnh hưởng (media query cách ly)
- [ ] Chạy build cuối + soát tự động trước khi merge vào `main`
