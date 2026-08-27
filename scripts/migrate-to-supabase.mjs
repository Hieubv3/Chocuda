// ==========================================
// MIGRATION SCRIPT: app_data_store.json → Supabase/Postgres
// Chạy: node scripts/migrate-to-supabase.mjs
// Yêu cầu: biến môi trường DATABASE_URL (hoặc SQL_HOST/USER/PASSWORD/DB_NAME)
// ==========================================
import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const pool = connectionString
  ? new Pool({ connectionString, max: 1 })
  : new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : 5432,
      max: 1,
    });

async function main() {
  const dataPath = join(process.cwd(), 'app_data_store.json');
  const raw = readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);

  console.log('Đọc dữ liệu từ app_data_store.json:');
  console.log(`  - users: ${data.users?.length || 0}`);
  console.log(`  - properties: ${data.properties?.length || 0}`);
  console.log(`  - news: ${data.news?.length || 0}`);
  console.log(`  - projects: ${data.projects?.length || 0}`);
  console.log(`  - residentServices: ${data.residentServices?.length || 0}`);
  console.log(`  - stores: ${data.stores?.length || 0}`);
  console.log(`  - ads: ${data.ads?.length || 0}`);

  // 1. Tạo bảng app_state nếu chưa có
  console.log('\n1. Tạo bảng app_state...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id text PRIMARY KEY,
      data jsonb NOT NULL,
      updated_at timestamp DEFAULT now()
    );
  `);
  console.log('   ✅ Bảng app_state sẵn sàng');

  // 2. Upsert toàn bộ state
  console.log('2. Ghi toàn bộ dữ liệu vào app_state...');
  await pool.query(
    `INSERT INTO app_state (id, data, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    ['main', JSON.stringify(data)]
  );
  console.log('   ✅ Đã ghi toàn bộ dữ liệu vào Supabase');

  // 3. Tạo các bảng quan hệ (nếu chưa có) cho tin tức/properties
  console.log('3. Tạo các bảng quan hệ...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS news_articles (
      id text PRIMARY KEY,
      title text NOT NULL,
      slug text,
      content text,
      image_url text,
      author text,
      category text DEFAULT 'Thi Trường',
      status text DEFAULT 'published',
      views integer DEFAULT 0,
      created_at timestamp DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS properties (
      id text PRIMARY KEY,
      title text NOT NULL,
      slug text,
      project text NOT NULL,
      subdivision text,
      type text NOT NULL,
      listing_type text NOT NULL,
      price text NOT NULL,
      price_unit text DEFAULT 'tỷ',
      area text NOT NULL,
      bedrooms integer,
      bathrooms integer,
      direction text,
      location text,
      description text,
      images jsonb DEFAULT '[]',
      author_phone text,
      author_name text,
      author_avatar text,
      author_zalo text,
      author_id text,
      status text DEFAULT 'approved',
      vip_tier text DEFAULT 'free',
      created_at timestamp DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS projects (
      id text PRIMARY KEY,
      name text,
      slug text,
      description text,
      image_url text,
      status text DEFAULT 'active',
      created_at timestamp DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS resident_services (
      id text PRIMARY KEY,
      title text,
      category text,
      description text,
      image_url text,
      status text DEFAULT 'active',
      created_at timestamp DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS stores (
      id text PRIMARY KEY,
      name text,
      owner_name text,
      description text,
      image_url text,
      status text DEFAULT 'active',
      created_at timestamp DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS ad_banners (
      id text PRIMARY KEY,
      title text,
      image_url text,
      target_url text,
      position text DEFAULT 'home_hero',
      status text DEFAULT 'active',
      start_date text,
      end_date text,
      clicks integer DEFAULT 0
    );
  `);
  console.log('   ✅ Các bảng quan hệ sẵn sàng');

  // 4. Sync dữ liệu quan hệ (news, properties, projects...)
  console.log('4. Sync dữ liệu quan hệ...');
  for (const n of data.news || []) {
    await pool.query(
      `INSERT INTO news_articles (id, title, slug, content, image_url, author, category, status, views, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
       ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, image_url=EXCLUDED.image_url, status=EXCLUDED.status`,
      [n.id, n.title || '', n.slug || n.id, n.content || '', n.imageUrl || n.image || '', n.author || '', n.category || 'Thi Trường', n.status || 'published', n.views || 0]
    );
  }
  console.log(`   ✅ News: ${data.news?.length || 0} bài`);

  for (const p of data.properties || []) {
    await pool.query(
      `INSERT INTO properties (id, title, slug, project, subdivision, type, listing_type, price, price_unit, area, bedrooms, bathrooms, direction, location, description, images, author_phone, author_name, author_avatar, author_zalo, author_id, status, vip_tier, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23, now())
       ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, status=EXCLUDED.status`,
      [p.id, p.title || '', p.slug || p.id, p.project || 'ocean-park-1', p.subdivision || '', p.type || 'can-ho', p.listingType || 'sale', p.price || '0', p.priceUnit || 'tỷ', p.area ? String(p.area) : '0', p.bedrooms ? Number(p.bedrooms) : null, p.bathrooms ? Number(p.bathrooms) : null, p.direction || '', p.location || '', p.description || '', JSON.stringify(p.images || []), p.authorPhone || '', p.authorName || '', p.authorAvatar || '', p.authorZalo || '', p.authorId || '', p.status || 'approved', p.vipTier || 'free']
    );
  }
  console.log(`   ✅ Properties: ${data.properties?.length || 0} tin`);

  console.log('\n🎉 MIGRATION HOÀN TẤT! Dữ liệu đã nằm trong Supabase.');
  console.log('   Server sẽ tự động đọc từ Supabase khi khởi động (nếu DATABASE_URL được cấu hình).');
  await pool.end();
}

main().catch(err => {
  console.error('❌ Migration thất bại:', err.message);
  process.exit(1);
});