# ĐỀ XUẤT: TÀI KHOẢN DOANH NGHIỆP & GÓI DỊCH VỤ DOANH NGHIỆP
**Nền tảng:** Chợ Cư Dân 24h (chocudan24h.com) · **Ngày:** 22/09/2026 · **Trạng thái:** ĐỀ XUẤT — chưa build

---

## 1. Mục tiêu & phạm vi

Mở loại **tài khoản doanh nghiệp (DN)** dùng chung cho nhiều ngành, không chỉ BĐS:
- DN bất động sản (sàn, môi giới, chủ đầu tư, phân phối dự án)
- DN dịch vụ / F&B / bán lẻ nội khu (gian hàng, thợ, đối tác cư dân)
- DN ngành nghề khác có nhu cầu quảng bá tới cư dân Vinhomes

Mỗi DN có **đặc quyền riêng và chính sách riêng** theo ngành + theo gói đã đăng ký.

Phạm vi tài liệu: kiến trúc dữ liệu, gói & quyền lợi, luồng đăng ký – phê duyệt, màn hình, API, ràng buộc pháp lý, roadmap. **Không bao gồm** việc build (chờ duyệt).

---

## 2. Hiện trạng hệ thống (khảo sát trên nhánh `main`)

### 2.1. Đã có
| Thành phần | Chi tiết | Nơi trong code |
|---|---|---|
| Phân loại tài khoản | `User.accountType`: `individual_resident` / **`business_enterprise`** / `technician` / `consumer`; có `companyName`, `taxCode` | `src/types.ts` |
| Vai trò quản trị | `UserRole`: admin, manager_bds, manager_market… | `src/types.ts` |
| Gói gian hàng cư dân | `StorePackage` (nhóm identity/advertising/PR) + `StorePackageOrder` (đơn mua, admin duyệt) | `src/types.ts`, `src/components/ServicePricingModal.tsx`, `server.ts` (`/api/store-packages`, `/api/package-orders`) |
| Gói nhà tuyển dụng | `RecruitmentPackage` (priceToken, jobPostLimit, cvUnlockLimit, vipDays) + `EmployerRegistrationRequest` (MST, ngành, người đại diện, gói chọn) + API duyệt/từ chối | `src/types.ts`, `src/components/UserEmployerRegistrationModal.tsx`, `server.ts` (`/api/recruitment/employer-registrations…`) |
| Ví & Token | Ví token, bơm token, quy định tiêu token | `src/components/UserWalletSection.tsx`, `AdminCreditInjectorModal.tsx` |
| Admin | tab `package_orders_mgmt`, `recruitment_mgmt`, `developer_units`, `enterprise_core`, `pricing`, `users`, `analytics`, `seo` | `src/pages/AdminDashboardPage.tsx` |
| Giá nội bộ đang niêm yết | 0đ (cư dân) · 680.000đ (Chủ shop xác thực 24H) · 1.880.000đ (Đại tức kim cương VIP) · 890.000đ (Top banner) · 2.680.000đ (Slider hero) · 1.280.000đ (Bài PR) | `ServicePricingModal.tsx` |

### 2.2. Chưa có
1. Luồng **đăng ký tài khoản doanh nghiệp** dùng chung (chọn loại hình DN, hồ sơ pháp lý, KYC DN, chọn gói, chấp nhận chính sách).
2. **Gói doanh nghiệp nhiều tầng** + chính sách riêng theo ngành.
3. **Module admin quản trị DN**: hồ sơ, thẩm định, gói & gia hạn, hoá đơn, thành viên, audit log, KPI.
4. Cơ chế **quota & ưu tiên hiển thị** theo hạng gói DN.
5. Field `accountType='business_enterprise'` hiện **không được dùng ở đâu** trong UI/logic.

---

## 3. Benchmark thị trường (tra ngày 22/09/2026)

| Nền tảng | Nhóm gói DN | Giá tham chiếu | Quyền lợi chính | Nguồn |
|---|---|---|---|---|
| **Batdongsan.com.vn** | “Gói Hội viên” (1/3/6 tháng) | Tiết kiệm **20–30%** chi phí đăng tin (không công bố bảng giá công khai) | Duyệt tin nhanh, hẹn giờ đăng, báo cáo hiệu quả, đẩy tin | vnexpress.net, cafef.vn, dantri.com.vn (30/5/2024); trogiup.batdongsan.com.vn |
| **Chợ Tốt / Nhatot (BĐS)** | Bán theo **hạng tin**, không theo gói tháng | Hạng Tăng Cường **46.500–53.200đ/15 ngày**; Hạng Nâng Cao **131.900–138.600đ/15 ngày** | Ưu tiên hiển thị theo hạng | trogiup.chotot.com |
| **TopCV (tuyển dụng)** | Gói theo tháng + tin lẻ | Tin lẻ **từ ~350.000đ/tin (15 ngày)**; gói Pro **5–10 triệu/tháng**; Premium **15–40 triệu/tháng**; các gói TOP ECO PLUS **4.400.000đ**, TOP MAX **7.500.000đ**, TOP MAX PLUS **9.650.000đ** | Đăng tin, đẩy tin lên đầu danh sách, mở kho CV, quản lý ứng viên | lighthuman.vn (14/5/2026); tuyendung.topcv.vn |
| **Website đăng tin BĐS nhỏ** | Tài khoản theo năm | Tài khoản “TKC” **15.000.000đ** (đăng mọi loại tin thường → VIP) | Đăng mọi hạng tin trong năm | bachkhoanhadat.com.vn |
| **Báo giá PR/booking** | Theo bài/vị trí | Bài PR **5,5–18 triệu/bài** (dữ liệu cũ 2020) | Nội dung thương hiệu | vietquangcao.org *(dữ liệu cũ, chỉ tham khảo)* |

**Nhận xét rút ra:**
- Thị trường BĐS VN đi theo **2 mô hình song song**: (a) bán hạng tin theo lượt (rẻ, dễ mua, hợp môi giới nhỏ) và (b) **gói hội viên/thuê bao** cho DN (giảm giá 20–30%, mở tính năng nâng cao).
- Nền tảng tuyển dụng bán **thuê bao tháng** rõ ràng theo tầng (Pro/Premium 5–40 triệu/tháng) — cao hơn hẳn mức giá nội bộ hiện tại của Chợ Cư Dân 24h.
- Chưa có nền tảng nào công bố công khai bảng giá “gói doanh nghiệp” dạng file chuẩn → **không thể khẳng định số liệu tuyệt đối**; các con số trên là mức quan sát được từ trang trợ giúp/bài viết.

---

## 4. Kiến trúc đề xuất

### 4.1. Mô hình dữ liệu (multi-tenant nhẹ)
| Entity | Trường chính |
|---|---|
| `BusinessAccount` | id, ownerUserId, name, brandName, type (`real_estate` / `resident_service` / `fnb` / `other`), taxCode, businessLicenseNo, licenseFileUrl, address, project, legalRepName, legalRepPhone, industryCodes[], status (`draft`/`pending`/`verified`/`rejected`/`suspended`), verifiedAt, tierCode, tierExpiresAt |
| `BusinessMember` | id, businessId, userId, role (`owner`/`manager`/`editor`/`viewer`), quotaOverride?, status, invitedAt |
| `BusinessDocument` | id, businessId, docType (MST/GPKD/CCCD người đại diện/hợp đồng), fileUrl, status, reviewedBy, note |
| `BusinessPackage` | id, code, name, industryScope[], priceMonthly, priceYearly, quotaListings, quotaJobs, featuredSlots, bannerSlots, usersMax, features[], active |
| `BusinessSubscription` | id, businessId, packageId, periodStart, periodEnd, status, paymentStatus, invoiceId, autoRenew |
| `BusinessInvoice` | id, businessId, subscriptionId, amount, vatRate, invoiceNo, eInvoiceRef, issuedAt, buyerTaxCode |
| `BusinessAuditLog` | id, businessId, actorId, action, at, meta |

Quan hệ: mọi tin BĐS / gian hàng / tin tuyển dụng gắn thêm `businessId` (nullable) để tính quota và ưu tiên hiển thị.

### 4.2. Phân khúc & chính sách riêng theo ngành
| Nhóm DN | Chính sách đặc thù đề xuất |
|---|---|
| **DN bất động sản** | Bắt buộc MST + GPKD + chứng chỉ hành nghề môi giới của nhân sự đăng tin (theo Luật KDBĐS 2023); giới hạn số tin/dự án; ưu tiên hiển thị theo dự án |
| **DN dịch vụ cư dân / F&B / bán lẻ** | Cần GPKD + ảnh mặt bằng shophouse; được gắn huy hiệu Đã xác thực; quota hiển thị trong mục “Chợ cư dân & gian hàng” |
| **DN ngành khác** | Xác thực pháp lý + kiểm duyệt nội dung theo ngành; hạn chế ngành nhạy cảm (tài chính, y tế, giáo dục phải có giấy phép) |
| **Chủ đầu tư / phân phối dự án** | Gói Enterprise, hợp đồng riêng, banner/slider, có thể cấp feed dữ liệu (API) |

---

## 5. Gói doanh nghiệp đề xuất

### 5.1. Bảng quyền lợi
| | **DN Khởi tạo** | **DN Xác thực** | **DN Pro** | **DN Enterprise** |
|---|---|---|---|---|
| Giá đề xuất | **0đ** | **690.000đ/tháng**<br>(6.900.000đ/năm) | **1.980.000đ/tháng**<br>(19.800.000đ/năm) | **Từ 4.900.000đ/tháng**<br>(hoặc 45–90 triệu/năm theo hợp đồng) |
| Số người dùng | 1 | 3 | 10 | Không giới hạn (theo thoả thuận) |
| Quota đăng tin BĐS | 3 tin/tháng | 15 tin/tháng | 60 tin/tháng | Theo hợp đồng (mặc định 200+) |
| Quota tin tuyển dụng | 1 tin/tháng | 5 tin/tháng | 20 tin/tháng | Theo hợp đồng |
| Ưu tiên hiển thị | Thường | Mức 1 (đẩy nhẹ) | Mức 2 + luân phiên đầu danh mục | Mức cao nhất + ghim theo dự án |
| Banner / Slider | – | – | 1 slot banner luân phiên | Banner + slider + bài PR định kỳ |
| Huy hiệu | “DN mới” | **“Đã xác thực”** | “DN Pro” | “Đối tác chiến lược” |
| Báo cáo | – | Cơ bản (lượt xem) | Đầy đủ (view/lead/chuyển đổi) | Dashboard riêng + xuất dữ liệu/API |
| Hỗ trợ | Zalo chung | Zalo + email | Zalo ưu tiên + hotline | CSKH riêng, hợp đồng, SLA |
| Hoá đơn | – | Hoá đơn điện tử | Hoá đơn điện tử | Hoá đơn + hợp đồng theo năm |
| Thêm người dùng | – | 100.000đ/user/tháng | 80.000đ/user/tháng | Theo thoả thuận |

**Căn cứ định giá:** neo theo giá nội bộ đang niêm yết (680.000đ → 1.880.000đ → 2.680.000đ), đối chiếu benchmark (Chợ Tốt 46.500–138.600đ/tin; TopCV gói Pro 5–10 triệu/tháng). Mức đề xuất **thấp hơn TopCV** vì tệp khách hàng nhỏ hơn và gắn cộng đồng cư dân.

### 5.2. Quy tắc quota & hết hạn
- Quota reset theo tháng dương lịch; tin vượt quota tự rơi về hiển thị thường hoặc bị chặn (tuỳ cấu hình admin).
- Hết hạn gói: hạ về “DN Xác thực” hoặc “Khởi tạo” tuỳ chính sách; tin ưu tiên tụt hạng sau 3 ngày ân hạn; thông báo trước 7/3/1 ngày.

---

## 6. Luồng đăng ký & phê duyệt

1. **Đăng nhập/đăng ký** (AuthModal hiện có) → chọn “Tài khoản doanh nghiệp”.
2. **Chọn loại hình DN** (BĐS / dịch vụ – F&B / ngành khác) → hệ thống hiển thị danh sách hồ sơ bắt buộc tương ứng.
3. **Khai hồ sơ DN**: tên DN, thương hiệu, MST, số GPKD (+ file), địa chỉ, khu/dự án, người đại diện pháp luật, đầu mối liên hệ, ngành nghề.
4. **Upload pháp lý**: GPKD, CCCD/hộ chiếu người đại diện, (BĐS) chứng chỉ môi giới của nhân sự đăng tin, ảnh mặt bằng (dịch vụ/F&B).
5. **Chọn gói** → xem bảng quyền lợi → xác nhận điều khoản dành cho DN + chính sách ngành.
6. **Thanh toán/đăng ký**: chuyển khoản + xác nhận, hoặc trả bằng Token; sinh `BusinessSubscription` trạng thái `pending_payment`.
7. **Thẩm định (admin)**: hàng đợi duyệt → duyệt/từ chối có lý do → cập nhật `BusinessAccount.status`.
8. **Kích hoạt**: cấp huy hiệu, quota, ưu tiên hiển thị; gửi hoá đơn điện tử; thông báo Zalo/email.
9. **Gia hạn**: nhắc trước 7 ngày; admin có thể gia hạn thủ công (nâng/hạ tầng).

---

## 7. Màn hình cần bổ sung

**Người dùng (DN):**
- Đăng ký DN (wizard 4 bước: loại hình → hồ sơ → pháp lý → gói & xác nhận)
- Dashboard DN: quota còn lại, hiệu suất tin, thành viên, gói & ngày hết hạn, hoá đơn
- Quản lý thành viên (mời, phân vai trò, gỡ)
- Trang DN công khai (huy hiệu, gian hàng/tin của DN, thông tin pháp lý hiển thị theo quy định)

**Quản trị:**
- Tab **“Quản lý doanh nghiệp”**: danh sách + lọc theo ngành/trạng thái/gói
- Hàng đợi thẩm định hồ sơ DN (xem file, ghi chú, duyệt/từ chối)
- Cấu hình gói DN (giá, quota, số người dùng, quyền lợi) — CRUD như `StorePackage` hiện có
- Quản lý subscription & hoá đơn (gia hạn, huỷ, hoàn tiền, xuất hoá đơn)
- Audit log theo DN + KPI (số DN, doanh thu gói, tỉ lệ duyệt, vi phạm)

---

## 8. API đề xuất

```
POST   /api/business/register                 # tạo hồ sơ DN (draft)
PUT    /api/business/:id/profile              # cập nhật hồ sơ
POST   /api/business/:id/documents            # upload pháp lý
POST   /api/business/:id/submit               # gửi thẩm định
GET    /api/business/:id                      # chi tiết (chủ DN / admin)
GET    /api/admin/businesses                  # danh sách + lọc
POST   /api/admin/businesses/:id/approve|reject
GET    /api/business-packages                 # bảng gói công khai
POST   /api/admin/business-packages           # CRUD gói (admin)
POST   /api/business/:id/subscribe            # chọn/gia hạn gói
GET    /api/business/:id/invoices             # hoá đơn
POST   /api/business/:id/members              # thêm thành viên
```
Mở rộng: `User.accountType`, thêm `businessId` vào tin BĐS / gian hàng / tin tuyển dụng; tái dùng hạ tầng Token + duyệt đơn gói sẵn có.

---

## 9. Tuân thủ pháp lý (checklist trước khi mở tính năng)

| # | Yêu cầu | Căn cứ | Mức |
|---|---|---|---|
| 1 | Thông báo/đăng ký nền tảng với Bộ Công Thương; công bố thông tin người bán | NĐ 52/2013/NĐ-CP, NĐ 85/2021/NĐ-CP | **Bắt buộc** |
| 2 | Kiểm tra, xác minh thông tin người bán trước khi cho đăng bán/đăng tin | NĐ 52/2013 (sửa đổi 85/2021) | **Bắt buộc** |
| 3 | Lưu trữ hồ sơ người bán & nội dung đăng tải theo thời hạn luật định | NĐ 52/2013, NĐ 85/2021 | **Bắt buộc** |
| 4 | Bảo vệ dữ liệu cá nhân: chính sách, cơ chế đồng ý, lưu trữ – bảo mật (áp dụng cho cả người đại diện DN) | **Luật BVDLCN 91/2025/QH15** (hiệu lực 01/01/2026), NĐ 356/2025/NĐ-CP | **Bắt buộc** |
| 5 | Hoá đơn điện tử khi bán gói cho DN; hợp đồng dịch vụ; thuế GTGT | **NĐ 254/2026/NĐ-CP**, TT 91/2026/TT-BTC (hiệu lực 01/7/2026), Luật Quản lý thuế 108/2025/QH15 | **Bắt buộc** |
| 6 | Bên đăng tin BĐS: phải là DN có chức năng kinh doanh BĐS; môi giới phải có chứng chỉ | Luật Kinh doanh BĐS 29/2023/QH15 | **Bắt buộc với bên đăng tin** |
| 7 | Tư cách pháp lý khi nền tảng có tính năng “sàn giao dịch BĐS” | Luật KDBĐS 29/2023/QH15 | ⚠️ **Cần luật sư xác nhận** |
| 8 | Hợp đồng + điều khoản hoàn/huỷ gói, chính sách xử lý vi phạm | Thông lệ + Luật BVQLNTD | **Nên có** |

> Các mốc hiệu lực đã đối chiếu chéo ngày 22/09/2026 (chinhphu.vn, thuvienphapluat.vn, luatvietnam.vn cho Luật 91/2025; kpmg.com, edicomgroup.com, thomsonreuters cho NĐ 254/2026). Số điều khoản chi tiết và mốc của Luật KDBĐS 2023 **cần luật sư/kế toán xác nhận** trước khi công bố chính sách.

---

## 10. Roadmap đề xuất

| Giai đoạn | Nội dung | Điều kiện xong |
|---|---|---|
| **G1** | Mô hình dữ liệu DN + hồ sơ + upload pháp lý + wizard đăng ký | DN gửi được hồ sơ, admin xem được |
| **G2** | Tab admin “Quản lý doanh nghiệp” + duyệt/từ chối + huy hiệu | DN được kích hoạt, tin gắn `businessId` |
| **G3** | Gói DN + quota + ưu tiên hiển thị + gia hạn & nhắc hạn | Bảng gói chạy thật, quota chặn đúng |
| **G4** | Thành viên & phân quyền + audit log + báo cáo DN | DN nhiều user dùng chung tài khoản |
| **G5** | Hoá đơn điện tử + hợp đồng + API/feed cho Enterprise | Bán gói hợp pháp, có hoá đơn |

---

## 11. Rủi ro & điểm cần bạn quyết

1. **Giá gói**: mức đề xuất ở mục 5.1 — bạn muốn giữ, tăng, hay tách riêng giá cho DN BĐS (cao hơn) và DN ngành khác?
2. **Mô hình thu**: thuê bao tháng/năm, hay song song bán hạng tin theo lượt như Chợ Tốt?
3. **Thanh toán**: chuyển khoản + admin duyệt (đơn giản, hợp hiện trạng) hay tích hợp cổng thanh toán/hoá đơn điện tử ngay từ G1?
4. **Xác thực ngành BĐS**: có bắt buộc chứng chỉ môi giới cho từng nhân sự đăng tin không? (ảnh hưởng lớn tới luồng hồ sơ)
5. **Phạm vi multi-user**: cho phép nhiều DN cùng một người dùng quản lý (agency) hay 1 user – 1 DN?
6. **Rủi ro vận hành**: đội ngũ thẩm định hồ sơ DN phải đủ để duyệt trong 24–48h, nếu không sẽ phát sinh khiếu nại.

---

## 12. Nguồn tham khảo (tra 22/09/2026)

- Batdongsan.com.vn — Gói Hội viên: trogiup.batdongsan.com.vn; vnexpress.net; cafef.vn; dantri.com.vn (30/5/2024)
- Chợ Tốt BĐS — quy định phí đăng tin: trogiup.chotot.com
- TopCV — bảng giá nhà tuyển dụng: tuyendung.topcv.vn; lighthuman.vn (14/5/2026)
- Website đăng tin BĐS — tài khoản theo năm: bachkhoanhadat.com.vn
- Luật BVDLCN 91/2025/QH15: chinhphu.vn, thuvienphapluat.vn, luatvietnam.vn
- NĐ 254/2026/NĐ-CP + TT 91/2026/TT-BTC: kpmg.com, edicomgroup.com, thomsonreuters.com

*Lưu ý: nội dung pháp lý trong tài liệu này là tham khảo, không phải tư vấn pháp lý chính thức.*
