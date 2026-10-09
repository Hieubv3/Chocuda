// scripts/resend-check.mjs
// Kiểm tra trạng thái domain Resend, kích hoạt verify và gửi test email.
//
// Cách dùng (chạy trong thư mục chocudan24h):
//   node scripts/resend-check.mjs                          -> chỉ xem trạng thái
//   node scripts/resend-check.mjs --verify                 -> gọi Resend verify domain
//   node scripts/resend-check.mjs --send ban@email.com     -> gửi email test tới địa chỉ
//
// Yêu cầu: biến RESEND_API_KEY và EMAIL_FROM trong file .env

import 'dotenv/config';
import { Resend } from 'resend';

const DOMAIN_ID = process.env.RESEND_DOMAIN_ID || '8f414a63-dfba-4f62-8bbf-77bf4d1502e5';

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('Thiếu RESEND_API_KEY trong .env');
  process.exit(1);
}

const resend = new Resend(apiKey);

const args = process.argv.slice(2);

// 1) Trạng thái domain + từng bản ghi DNS
const { data: domain, error: getErr } = await resend.domains.get(DOMAIN_ID);
if (getErr) {
  console.error('Không lấy được domain:', getErr);
  process.exit(1);
}
console.log(`\n== Domain: ${domain.name} ==`);
console.log(`Trạng thái tổng: ${domain.status}`);
console.log('Bản ghi DNS:');
for (const r of domain.records || []) {
  console.log(`  [${(r.status || '?').padEnd(9)}] ${r.record.padEnd(5)} ${r.type.padEnd(5)} ${r.name}`);
}

// 2) Kích hoạt verify
if (args.includes('--verify')) {
  const { error } = await resend.domains.verify(DOMAIN_ID);
  console.log(error ? `\nVerify lỗi: ${JSON.stringify(error)}` : '\nĐã gửi yêu cầu verify tới Resend.');
}

// 3) Gửi test email
const sendIdx = args.indexOf('--send');
if (sendIdx !== -1) {
  const to = args[sendIdx + 1];
  if (!to) {
    console.error('Thiếu địa chỉ sau --send');
    process.exit(1);
  }
  const from = process.env.EMAIL_FROM || 'Chợ Cư Dân 24h <no-reply@chocudan24h.com>';
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: 'Chợ Cư Dân 24h — Test email thương hiệu riêng',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color:#0f172a;">✅ Email thương hiệu riêng đã hoạt động!</h2>
        <p style="color:#334155;">Email này được gửi từ <strong>${from}</strong> qua Resend, tới <strong>${to}</strong>.</p>
        <p style="color:#94a3b8; font-size:12px;">chocudan24h.com</p>
      </div>`,
  });
  if (error) {
    console.error('\nGửi test thất bại:', JSON.stringify(error));
    process.exit(1);
  }
  console.log(`\nĐã gửi test tới ${to}. Resend id = ${data?.id}`);
}
