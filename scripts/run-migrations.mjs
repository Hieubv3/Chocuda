// =====================================================================
// Chạy 3 file migration lên Supabase TRỰC TIẾP (không cần SQL Editor tay)
// File: chocuda-supabase/scripts/run-migrations.mjs
//
// Cài đặt:  cd scripts && npm i pg   (hoặc: npm i pg -g)
// Chạy:     node run-migrations.mjs "postgresql://postgres.<ref>:<db-password>@aws-0-<region>.pooler.supabase.com:6543/postgres"
//
// LƯU Ý BẢO MẬT:
//  - Chuỗi kết nối CHỨA mật khẩu DB. Dùng pooler (port 6543), không phải 5432.
//  - Không dán chuỗi này vào nơi công khai; không cần service_role key ở đây.
//  - Idempotent: các bảng dùng `if not exists`, policy dùng `drop policy if exists`
//    nên chạy lại nhiều lần vẫn an toàn.
// =====================================================================
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONN = process.argv[2] || process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!CONN) {
  console.error('Thiếu chuỗi kết nối. Cách dùng:\n  node run-migrations.mjs "postgresql://...pooler.supabase.com:6543/postgres"');
  process.exit(1);
}

const FILES = [
  join(__dirname, '..', 'supabase', 'migrations', '0001_schema.sql'),
  join(__dirname, '..', 'supabase', 'migrations', '0002_rls.sql'),
  join(__dirname, '..', 'supabase', 'migrations', '0003_storage.sql'),
];

// ---------- Tách SQL thành từng câu (hiểu dollar-quote $$ và $tag$) ----------
function splitStatements(sql) {
  const stmts = [];
  let cur = '';
  let i = 0;
  let state = 'normal'; // normal | sq | dq | dollar | line | block
  let dollarTag = '';

  while (i < sql.length) {
    const c = sql[i];
    const n = sql[i + 1];

    if (state === 'line') {
      cur += c;
      if (c === '\n') state = 'normal';
      i++; continue;
    }
    if (state === 'block') {
      cur += c;
      if (c === '*' && n === '/') { cur += n; i += 2; state = 'normal'; continue; }
      i++; continue;
    }
    if (state === 'sq') {
      cur += c;
      if (c === "'" && n === "'") { cur += n; i += 2; continue; }  // escape ''
      if (c === "'") state = 'normal';
      i++; continue;
    }
    if (state === 'dq') {
      cur += c;
      if (c === '"' && n === '"') { cur += n; i += 2; continue; }  // escape ""
      if (c === '"') state = 'normal';
      i++; continue;
    }
    if (state === 'dollar') {
      cur += c;
      if (sql.startsWith(dollarTag, i)) { cur += dollarTag; i += dollarTag.length; state = 'normal'; continue; }
      i++; continue;
    }

    // normal
    if (c === '-' && n === '-') { cur += '--'; i += 2; state = 'line'; continue; }
    if (c === '/' && n === '*') { cur += '/*'; i += 2; state = 'block'; continue; }
    if (c === "'") { cur += c; i++; state = 'sq'; continue; }
    if (c === '"') { cur += c; i++; state = 'dq'; continue; }
    if (c === '$') {
      const m = sql.slice(i).match(/^(\$[A-Za-z0-9_]*\$)/);
      if (m) { dollarTag = m[1]; cur += m[1]; i += m[1].length; state = 'dollar'; continue; }
    }
    if (c === ';') {
      const s = cur.trim();
      if (s) stmts.push(s);
      cur = '';
      i++; continue;
    }
    cur += c;
    i++;
  }
  const tail = cur.trim();
  if (tail) stmts.push(tail);
  return stmts;
}

// ---------- Chạy ----------
const client = new pg.Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log('✅ Đã kết nối Supabase Postgres.\n');

  for (const file of FILES) {
    const name = file.split(/[\\/]/).pop();
    const sql = readFileSync(file, 'utf-8');
    const stmts = splitStatements(sql);
    console.log(`▶ ${name}  (${stmts.length} câu lệnh)`);
    for (let k = 0; k < stmts.length; k++) {
      try {
        await client.query(stmts[k]);
      } catch (e) {
        console.error(`  ✖ Câu ${k + 1}/${stmts.length} lỗi: ${e.message}`);
        console.error('  ── câu lệnh: ' + stmts[k].slice(0, 160).replace(/\s+/g, ' ') + '...');
        process.exitCode = 1;
        await client.end();
        return;
      }
    }
    console.log(`  ✔ ${name} hoàn tất.\n`);
  }

  console.log('🎉 Xong cả 3 file migration. Kiểm tra: Database → Tables (phải thấy profiles, posts, properties, ...).');
  await client.end();
}

main().catch(async (e) => {
  console.error('Lỗi kết nối:', e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
