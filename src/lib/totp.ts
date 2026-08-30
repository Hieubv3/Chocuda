import crypto from "crypto";

/**
 * TOTP (Time-based One-Time Password) — RFC 6238 / HOTP RFC 4226.
 * Cài đặt thuần bằng Node `crypto`, không phụ thuộc thư viện ngoài.
 *
 * Tương thích Google Authenticator, Microsoft Authenticator, Authy...
 * (SHA1, 6 chữ số, chu kỳ 30 giây — cấu hình mặc định mà mọi app OTP đều hỗ trợ).
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const DEFAULT_DIGITS = 6;
const DEFAULT_PERIOD = 30; // giây
const DEFAULT_WINDOW = 1; // cho phép lệch ±1 bước (±30s) để bù trừ lệch giờ

/** Sinh secret ngẫu nhiên (20 bytes = 160 bit, chuẩn khuyến nghị) và encode base32. */
export function generateTotpSecret(byteLength = 20): string {
  return base32Encode(crypto.randomBytes(byteLength));
}

/** Encode buffer -> chuỗi base32 (không padding '='), dùng cho secret. */
export function base32Encode(buffer: Buffer): string {
  let bits = "";
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }
  let output = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    output += BASE32_ALPHABET[parseInt(bits.substring(i, i + 5), 2)];
  }
  const remainder = bits.length % 5;
  if (remainder > 0) {
    const lastChunk = bits.substring(bits.length - remainder).padEnd(5, "0");
    output += BASE32_ALPHABET[parseInt(lastChunk, 2)];
  }
  return output;
}

/** Decode chuỗi base32 -> Buffer. */
export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const char of clean) {
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/** Sinh mã HOTP cho 1 counter cụ thể (dùng nội bộ bởi generateTotpToken/verify). */
function generateHotp(secretBase32: string, counter: number, digits = DEFAULT_DIGITS): string {
  const key = base32Decode(secretBase32);

  const counterBuffer = Buffer.alloc(8);
  // Ghi counter dạng 64-bit big-endian (chuẩn RFC 4226).
  counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuffer.writeUInt32BE(counter % 0x100000000, 4);

  const hmac = crypto.createHmac("sha1", key).update(counterBuffer).digest();

  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binCode % 10 ** digits).toString().padStart(digits, "0");
  return otp;
}

/** Sinh mã TOTP hiện tại (chủ yếu dùng để test/debug). */
export function generateTotpToken(
  secretBase32: string,
  options: { digits?: number; period?: number; timestamp?: number } = {}
): string {
  const { digits = DEFAULT_DIGITS, period = DEFAULT_PERIOD, timestamp = Date.now() } = options;
  const counter = Math.floor(timestamp / 1000 / period);
  return generateHotp(secretBase32, counter, digits);
}

/**
 * Xác thực mã TOTP người dùng nhập, cho phép lệch ±window bước thời gian
 * để bù trừ lệch giờ nhẹ giữa điện thoại và server.
 */
export function verifyTotpToken(
  secretBase32: string,
  token: string,
  options: { digits?: number; period?: number; window?: number; timestamp?: number } = {}
): boolean {
  if (!token || !/^\d{6,8}$/.test(String(token).trim())) return false;
  const cleanToken = String(token).trim();

  const { digits = DEFAULT_DIGITS, period = DEFAULT_PERIOD, window = DEFAULT_WINDOW, timestamp = Date.now() } = options;
  const currentCounter = Math.floor(timestamp / 1000 / period);

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const candidate = generateHotp(secretBase32, currentCounter + errorWindow, digits);
    if (timingSafeEqualStrings(candidate, cleanToken)) {
      return true;
    }
  }
  return false;
}

/** So sánh 2 chuỗi cùng độ dài theo kiểu constant-time để tránh timing attack. */
function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Sinh URI otpauth:// để tạo QR code (dùng với app Authenticator). */
export function buildOtpAuthUri(params: {
  secret: string;
  accountName: string; // thường là email
  issuer: string; // tên hệ thống, vd "ChoCuDan24h"
  digits?: number;
  period?: number;
}): string {
  const { secret, accountName, issuer, digits = DEFAULT_DIGITS, period = DEFAULT_PERIOD } = params;
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const query = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(digits),
    period: String(period),
  });
  return `otpauth://totp/${label}?${query.toString()}`;
}

/** Sinh N mã backup dùng-1-lần (dạng "xxxx-xxxx") để phòng khi mất điện thoại. */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(5).toString("hex"); // 10 ký tự hex
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5, 10)}`.toUpperCase());
  }
  return codes;
}

/** Hash 1 backup code bằng SHA-256 (nhanh, đủ dùng vì code đã có entropy cao & dùng 1 lần). */
export function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}