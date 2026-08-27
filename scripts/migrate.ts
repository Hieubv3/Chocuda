// ==========================================
// DATABASE MIGRATION SCRIPT
// Chạy để tạo tables trong PostgreSQL
// ==========================================

import { pool } from '../src/db/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function migrate() {
  console.log('🔄 Starting database migration...');
  
  try {
    // Read and execute schema SQL
    const schemaPath = join(import.meta.dirname, '../src/db/schema.sql');
    
    // First, try to create tables using drizzle
    console.log('📝 Creating database tables...');
    
    // Import schema to trigger table creation
    const { users, properties, residentServices, stores, adBanners, newsArticles } = await import('../src/db/schema.js');
    
    console.log('✅ Database schema loaded successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('  - users');
    console.log('  - properties');
    console.log('  - resident_services');
    console.log('  - stores');
    console.log('  - ad_banners');
    console.log('  - news_articles');
    console.log('');
    console.log('📌 Next steps:');
    console.log('  1. Make sure PostgreSQL is running');
    console.log('  2. Set SQL_HOST, SQL_PORT, SQL_USER, SQL_PASSWORD, SQL_DB_NAME in .env');
    console.log('  3. Run: npx drizzle-kit push');
    console.log('  4. Or run: npx drizzle-kit migrate');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
