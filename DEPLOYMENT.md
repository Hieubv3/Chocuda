# Hướng Dẫn Cấu Hình Tên Miền chocudan24h.com & Render

Dự án **Chợ Cư Dân 24H** đã được chuẩn bị đầy đủ file cấu hình (`render.yaml`, `Dockerfile`, `server.ts`, `.env.example`) sẵn sàng triển khai trên **Render.com**.

---

## 1. Môi trường & Tên miền (Domains)

- **Tên miền chính (Production):** `https://chocudan24h.com` (hoặc `https://www.chocudan24h.com`)
- **Tên miền thử nghiệm (Test/Staging):** `https://chocudan24h.onrender.com`

---

## 2. Các bước triển khai lên Render

1. **Đẩy mã nguồn lên GitHub / GitLab**
   - Đảm bảo toàn bộ mã nguồn của dự án đã được commit và push lên repository của bạn.

2. **Tạo Web Service trên Render**
   - Đăng nhập [Render Dashboard](https://dashboard.render.com).
   - Chọn **New +** -> **Web Service** (hoặc **Blueprints** để chọn file `render.yaml`).
   - Kết nối repository GitHub của dự án.
   - Các thông số chính:
     - **Name:** `chocudan24h`
     - **Environment:** `Node`
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm run start`

3. **Thêm các Biến Môi Trường (Environment Variables)**
   Trên Dashboard Render -> tab **Environment**:
   - `NODE_ENV`: `production`
   - `APP_URL`: `https://chocudan24h.com`
   - `GEMINI_API_KEY`: *(Nhập API Key Google AI nếu sử dụng trợ lý AI)*
   - `VITE_GOOGLE_CLIENT_ID`: `676805214069-67li6kv4ppmc1jmff5u29lcns84idk6a.apps.googleusercontent.com`
   - `VITE_FACEBOOK_APP_ID`: *(ID ứng dụng Facebook của bạn)*
   - `FACEBOOK_APP_SECRET`: *(Secret ứng dụng Facebook của bạn)*

---

## 3. Cấu hình Custom Domain `chocudan24h.com` trên Render

1. Vào Web Service `chocudan24h` trên Render -> chọn **Settings** -> mục **Custom Domains**.
2. Nhấp **Add Custom Domain** và nhập:
   - `chocudan24h.com`
   - `www.chocudan24h.com`
3. Trong trình quản lý DNS tên miền của bạn (Nhà cung cấp tên miền như MatBao, PAVietnam, Cloudflare, GoDaddy,...), thêm bản ghi:
   - **ANAME / A record** cho `chocudan24h.com` trỏ đến địa chỉ IP do Render cung cấp (ví dụ: `216.24.57.1`).
   - **CNAME record** cho `www.chocudan24h.com` trỏ đến `chocudan24h.onrender.com`.
4. Render sẽ tự động cấp chứng chỉ SSL HTTPS miễn phí cho `chocudan24h.com`.

---

## 4. Kiểm tra hoạt động

- **Test Domain:** `https://chocudan24h.onrender.com` sẽ dùng để kiểm tra tính năng nhanh, staging trước khi công bố.
- **Main Domain:** `https://chocudan24h.com` là địa chỉ chính thức gửi khách hàng và cư dân truy cập.

---

## 5. Các URL gửi duyệt Facebook App Review (Meta Developers)

Khi đăng ký ứng dụng trên Meta for Developers (Facebook Developers Dashboard), bạn copy các đường dẫn chính thức sau để điền vào hệ thống:

- **Privacy Policy URL (URL Chính Sách Bảo Mật):**
  - `https://chocudan24h.com/privacy`
  - (Hoặc `https://chocudan24h.com/chinh-sach-bao-mat`)

- **User Data Deletion Callback / Instructions (Hướng dẫn xóa dữ liệu người dùng):**
  - `https://chocudan24h.com/privacy#deletion`
  - Hoặc endpoint callback tự động: `https://chocudan24h.com/api/auth/facebook/data-deletion`

- **Terms of Service URL (Điều khoản dịch vụ):**
  - `https://chocudan24h.com/privacy`

