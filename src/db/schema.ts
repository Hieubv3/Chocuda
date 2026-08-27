import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('user'),
  avatar: text('avatar'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug'),
  project: text('project').notNull(),
  subdivision: text('subdivision'),
  type: text('type').notNull(),
  listingType: text('listing_type').notNull(), // 'sale' | 'rent'
  price: text('price').notNull(),
  priceUnit: text('price_unit').default('tỷ'),
  area: text('area').notNull(),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  direction: text('direction'),
  location: text('location'),
  description: text('description'),
  images: jsonb('images'),
  authorPhone: text('author_phone'),
  authorName: text('author_name'),
  authorAvatar: text('author_avatar'),
  authorZalo: text('author_zalo'),
  authorId: text('author_id'),
  status: text('status').default('approved'), // 'pending' | 'approved' | 'rejected'
  vipTier: text('vip_tier').default('free'),
  featured: boolean('featured').default(false),
  views: integer('views').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const residentServices = pgTable('resident_services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  phone: text('phone').notNull(),
  zalo: text('zalo'),
  avatar: text('avatar'),
  experience: text('experience'),
  rating: text('rating'),
  reviewCount: integer('review_count').default(0),
  pricing: text('pricing'),
  location: text('location'),
  kycVerified: boolean('kyc_verified').default(true),
  status: text('status').default('active'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const stores = pgTable('stores', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  phone: text('phone').notNull(),
  zalo: text('zalo'),
  avatar: text('avatar'),
  coverImage: text('cover_image'),
  address: text('address'),
  rating: text('rating'),
  verified: boolean('verified').default(true),
  vipLevel: text('vip_level').default('basic'),
  status: text('status').default('approved'),
  description: text('description'),
  ownerId: text('owner_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const adBanners = pgTable('ad_banners', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  imageUrl: text('image_url').notNull(),
  targetUrl: text('target_url'),
  position: text('position').notNull(), // 'home_hero' | 'sidebar' | 'footer'
  status: text('status').default('active'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  clicks: integer('clicks').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const newsArticles = pgTable('news_articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug'),
  summary: text('summary'),
  content: text('content'),
  imageUrl: text('image_url'),
  author: text('author'),
  category: text('category').default('Thi Trường'),
  status: text('status').default('published'),
  views: integer('views').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Whole-store snapshot table: keeps the FULL app state (all stores) as JSONB.
// This is the safety net that survives Render redeploys — the server writes
// its entire state here on every save, and loads from here on startup.
export const appState = pgTable('app_state', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
