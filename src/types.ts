export type PropertyType = 'sale' | 'rent';

export type ProjectCategory = 
  | 'ocean-park-2' 
  | 'ocean-park-3' 
  | 'ocean-park-1' 
  | 'ha-long-xanh' 
  | 'green-paradise-can-gio'
  | 'tan-my-hau-nghia'
  | 'green-city-hoc-mon'
  | 'lang-van-da-nang'
  | 'smart-city' 
  | 'grand-park' 
  | 'golden-avenue' 
  | 'riverside' 
  | 'royal-island' 
  | 'khac';

export type PropertyCategory = 
  | 'studio' 
  | '1pn' 
  | '2pn' 
  | '3pn' 
  | 'shophouse' 
  | 'biet-thu-don-lap' 
  | 'biet-thu-song-lap' 
  | 'lien-ke'
  | 'thue-tang'
  | 'mat-bang';

export type HeightCategory = 'all' | 'cao-tang' | 'thap-tang' | 'thue-tang';

export const HIGH_RISE_CATEGORIES: PropertyCategory[] = ['studio', '1pn', '2pn', '3pn'];
export const LOW_RISE_CATEGORIES: PropertyCategory[] = ['shophouse', 'biet-thu-don-lap', 'biet-thu-song-lap', 'lien-ke'];
export const FLOOR_RENTAL_CATEGORIES: PropertyCategory[] = ['thue-tang', 'mat-bang'];

export type PropertyDirection = 'Đông' | 'Tây' | 'Nam' | 'Bắc' | 'Đông Nam' | 'Tây Nam' | 'Đông Bắc' | 'Tây Bắc';

export type FurnitureStatus = 'raw' | 'basic' | 'full';

export type LegalStatus = 'so-do' | 'hop-dong-mua-ban' | 'dang-cho-so';

export type VipLevel = 'normal' | 'silver' | 'gold' | 'diamond';

// Dynamic Completion & Furniture Options for Low-rise & High-rise
export const LOW_RISE_COMPLETION_OPTIONS = [
  { value: 'thô', label: 'Bàn giao thô (Xây thô hoàn thiện mặt ngoài)' },
  { value: 'hoàn thiện 1 tầng', label: 'Hoàn thiện 1 tầng (Các tầng trên xây thô)' },
  { value: 'hoàn thiện 2 tầng', label: 'Hoàn thiện 2 tầng' },
  { value: 'hoàn thiện 3 tầng', label: 'Hoàn thiện 3 tầng' },
  { value: 'hoàn thiện 4 tầng', label: 'Hoàn thiện 4 tầng' },
  { value: 'hoàn thiện 5 tầng', label: 'Hoàn thiện 5 tầng (Hoàn thiện toàn nhà / tất cả tầng)' },
  { value: 'khác', label: 'Khác / Tự nhập số tầng hoàn thiện' }
];

export const LOW_RISE_FURNITURE_OPTIONS = [
  { value: 'không đồ', label: 'Không đồ (Nhà trống)' },
  { value: 'đồ cơ bản', label: 'Nội thất cơ bản (Đồ gắn tường, vách ngăn, WC)' },
  { value: 'full đồ', label: 'Full nội thất cao cấp (Đầy đủ đồ, xách vali vào ở)' },
  { value: 'khác', label: 'Khác / Tự nhập chi tiết' }
];

export const HIGH_RISE_COMPLETION_FURNITURE_OPTIONS = [
  { value: 'nguyên bản cđt', label: 'Nguyên bản Chủ đầu tư (Bàn giao thô/cơ bản CĐT)' },
  { value: 'hoàn thiện cơ bản', label: 'Hoàn thiện cơ bản + Đồ gắn tường (Điều hòa, tủ bếp)' },
  { value: 'full đồ', label: 'Full đồ nội thất (Sẵn vali xách vào ở ngay)' },
  { value: 'nội thất cao cấp', label: 'Nội thất cao cấp nhập khẩu' },
  { value: 'không đồ', label: 'Không đồ (Căn hộ trống)' },
  { value: 'khác', label: 'Khác / Tự nhập chi tiết' }
];

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  project: ProjectCategory;
  category: PropertyCategory;
  price: number; // in Millions for rent (e.g. 15 = 15 tr/tháng) or Billions for sale (e.g. 8.5 = 8.5 tỷ)
  priceDisplay: string;
  area: number; // in m2
  bedrooms: number;
  bathrooms: number;
  direction: PropertyDirection;
  floor?: string;
  furniture: FurnitureStatus;
  legal: LegalStatus;
  address: string;
  description: string;
  images: string[];
  featured?: boolean;
  status: 'approved' | 'pending' | 'sold' | 'rejected';
  approved?: boolean;
  createdAt: string;
  sellerName: string;
  sellerPhone: string;
  sellerRole: 'admin' | 'sale' | 'owner';
  subdivision?: string; // Ví dụ: Chà Là, San Hô, Hải Tăng...
  
  // Tình Trạng Hoàn Thiện Tầng & Nội Thất Chi Tiết (Thấp Tầng vs Cao Tầng)
  completionStatus?: string; // e.g. "Hoàn thiện 1 tầng", "Hoàn thiện 3 tầng", "Xây thô", "Nguyên bản CĐT"
  completionDetail?: string; // e.g. "Tầng 1-2 kinh doanh, tầng 3-4 thô", "CĐT bàn giao kèm điều hòa"
  furnitureDetail?: string;  // e.g. "Full đồ gỗ sồi cao cấp", "Không đồ", "Đồ gắn tường"
  
  // Sổ Đỏ Pháp Lý & Che Thông Tin
  soDoImage?: string;
  soDoRedactedImage?: string;
  
  // Duyệt Tin & Trạng Thái Hiển Thị
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  adminNote?: string;
  
  // Up-Tin & VIP Status (Up Thường / Up Kim Cương)
  vipLevel?: VipLevel;
  vipType?: 'up_thuong' | 'vip_kim_cuong';
  vipExpiresAt?: string;
  pushedAt?: string; // ISO string when last pushed up
  pushedCount?: number;
  viewsCount?: number;
  userId?: string;
  expiresAt?: string; // ISO timestamp when post expires / auto-hides
  durationDays?: number; // Duration of active post (default 30 days)
  isExpired?: boolean;
}

export interface ReputationPost {
  id: string;
  partnerName: string;
  partnerCategory: string;
  project: ProjectCategory | string;
  authorName: string;
  authorRoom: string;
  title: string;
  content: string;
  rating: number;
  images: string[];
  youtubeUrl?: string;
  createdAt: string;
  likesCount: number;
  trustBadge?: string;
  zaloContact?: string;
  phoneContact?: string;
  status?: 'approved' | 'pending' | 'rejected';
}

export interface Project {
  id: ProjectCategory;
  name: string;
  title?: string;
  location: string;
  areaSize: string;
  totalUnits: string;
  priceRange: string;
  status: string;
  description: string;
  image: string;
  masterplanUrl: string;
  subdivisions: string[];
  amenities: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'vinhomes' | 'quy-hoach' | 'thi-truong' | 'nhan-dinh' | 'kinh-nghiem';
  author: string;
  image: string;
  publishedAt: string;
  views: number;
  source: 'n8n' | 'manual' | 'ai';
  status: 'published' | 'draft';
}

export interface LeadContact {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  projectInterest: string;
  propertyId?: string;
  propertyTitle?: string;
  sellerName?: string;
  sellerPhone?: string;
  note: string;
  preferredTime?: string;
  type: 'viewing' | 'consultation' | 'deposit';
  status: 'new' | 'contacted' | 'done';
  createdAt: string;
}

export type UserRole = 
  | 'admin'               // Super Admin - Toàn quyền cấu hình & phân bổ
  | 'manager_bds'         // Manager BĐS - Quản lý tin đăng, Sổ đỏ, duyệt VIP
  | 'manager_market'      // Manager Chợ Cư Dân - Quản lý danh mục & hỗ trợ shop
  | 'manager_tech'        // Manager Thợ Kỹ Thuật - Giám sát Escrow & thợ
  | 'manager_content'     // Manager Nội Dung & SEO - Quản lý bài viết, Zalo, Marketing
  | 'manager'             // General Manager
  | 'sale' 
  | 'owner' 
  | 'visitor';

export type SubBranchPermission = 
  | 'bds_realestate'      // Đầu nhánh Bất Động Sản & Dự Án
  | 'resident_market'     // Đầu nhánh Chợ Cư Dân & Gian Hàng
  | 'technical_escrow'    // Đầu nhánh Dịch Vụ Thợ & Tạm Giữ Escrow
  | 'content_marketing'   // Đầu nhánh Bài Viết Nội Dung & SEO Marketing
  | 'user_kyc_finance';   // Đầu nhánh Duyệt KYC & Cấu Hình Tài Chính Nạp Điểm

export type UserTier = 'thuong' | 'bac' | 'vang' | 'kim-cuong';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  departmentPermissions?: SubBranchPermission[]; // Quyền phân tầng đầu nhánh
  subBranchTitle?: string; // Chức danh chuyên trách (Ví dụ: Trưởng Ban BĐS, Trưởng Ban Dịch Vụ Thợ...)
  avatar?: string;
  provider: 'local' | 'google' | 'facebook' | 'zalo';
  balance?: number; // Số dư tài khoản / Xu Tiêu Dùng Token (VNĐ) - Dùng thanh toán dịch vụ/đăng tin/mở khóa CV (KHÔNG THỂ RÚT)
  tokenBalance?: number; // Số dư Token cư dân (1 Token = 1 VNĐ - Non-withdrawable)
  affiliatePoints?: number; // Điểm hoa hồng Affiliate khả dụng (ĐƯỢC PHÉP RÚT VỀ NGÂN HÀNG)
  totalAffiliateEarned?: number; // Tổng hoa hồng Affiliate đã tích lũy
  totalTokensPumped?: number; // Tổng Token được Admin bơm/tặng
  tier?: UserTier; // Hạng nạp tiền (Thường, Bạc, Vàng, Kim Cương)
  totalTopup?: number; // Tổng nạp
  upTinCredits?: number; // Lượt Up tin khả dụng
  socialPoints?: number; // Điểm thưởng Social Follow tích lũy (1 điểm = 1 Lượt Up-Tin)
  socialRewards?: {
    facebookLiked?: boolean;
    youtubeSubscribed?: boolean;
    tiktokFollowed?: boolean;
    zaloFollowed?: boolean;
    googleReviewed?: boolean;
    telegramJoined?: boolean;
  };
  
  emailVerified?: boolean;
  phoneVerified?: boolean;
  
  // Xác thực chính chủ (KYC) & Chứng chỉ Môi giới Sale
  dob?: string; // Ngày tháng năm sinh (YYYY-MM-DD)
  idCardNumber?: string; // Số CCCD / Giấy tờ cá nhân
  idCardFrontUrl?: string; // Ảnh CCCD Mặt Trước
  idCardBackUrl?: string; // Ảnh CCCD Mặt Sau
  brokerLicenseUrl?: string; // Chứng chỉ hành nghề Môi giới BĐS
  kycStatus?: 'unverified' | 'pending_ai' | 'verified' | 'rejected';
  kycNote?: string;
  businessCategories?: string[]; // Ngành nghề bán hàng / dịch vụ kinh doanh (chọn 1 hoặc nhiều)
  registeredAt?: string;
}

export const BUSINESS_CATEGORIES = [
  { id: 'bds-vinhomes', name: 'Bất Động Sản & Cho Thuê Vinhomes', icon: '🏢' },
  { id: 'thang-may-sua-nha', name: 'Thi Công Xây Lắp, Nội Thất & Thang Máy Gia Đình', icon: '🏗️' },
  { id: 'dien-may-tinh-cong-nghe', name: 'Thiết Bị Điện, Máy Tính & Smarthome', icon: '💻' },
  { id: 'van-chuyen-taxi', name: 'Taxi Cư Dân & Vận Chuyển 24/7', icon: '🚗' },
  { id: 'dich-vu-gia-dinh-giat-la', name: 'Giặt Là & Dịch Vụ Gia Đình', icon: '🧺' },
  { id: 'am-thuc-com-cu-dan', name: 'Ẩm Thực, Cơm Cư Dân & Thực Phẩm Sạch', icon: '🍱' },
  { id: 'spa-lam-dep-suc-khoe', name: 'Spa, Làm Đẹp & Y Tế Gia Đình', icon: '💆' },
  { id: 'homestay-luu-tru', name: 'Homestay & Cho Thuê Du Lịch', icon: '🏨' },
  { id: 'giao-duc-gia-su', name: 'Gia Sư & Giáo Dục Trẻ Em', icon: '🎓' },
  { id: 'pet-care', name: 'Chăm Sóc Thú Cưng (Pet Care)', icon: '🐶' },
  { id: 'cho-thanh-ly-hang-tieu-dung', name: 'Thời Trang, Hàng Tiêu Dùng & Pass Đồ Cũ', icon: '🛍️' },
  { id: 'noi-that-kien-truc', name: 'Nội Thất & Thiết Kế Kiến Trúc', icon: '🪑' },
  { id: 'nganh-nghe-khac', name: 'Ngành Nghề / Dịch Vụ Khác', icon: '✨' }
] as const;

// Dynamic Store & Resident Service Packages (Quản Lý Gói Dịch Vụ Gian Hàng & Dịch Vụ Cư Dân)
export interface StorePackage {
  id: string;
  name: string;
  priceDisplay: string;
  priceValue: number;
  unit: string;
  popular?: boolean;
  color: string;
  badge?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'success' | 'warning' | 'purple' | 'outline';
  active: boolean;
  categoryGroup?: 'identity' | 'advertising' | 'pr'; // Phân nhóm: Gói Định Danh / Quảng Cáo / Bài PR
  priorityOrder?: number;
  badgeColor?: string;
}

export interface StorePackageOrder {
  id: string;
  orderCode: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  unit: string;
  userId: string;
  userName: string;
  userPhone: string;
  storeId?: string;
  storeName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  note?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

// Dynamic Store & Resident Service Packages
export type Language = 'vi' | 'en' | 'zh';

// Quảng Cáo & Banner Ad System
export interface AdBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  targetUrl?: string;
  position: string; // 'header_top' | 'float_right_pc' | 'float_left_pc' | 'home_middle' | 'home_sidebar' | 'property_detail' | 'popup_modal'
  widthSize?: 'small' | 'medium' | 'large' | 'compact'; // 'small' (170px), 'medium' (210px), 'large' (260px), 'compact' (140px)
  displayStyle?: 'card_full' | 'image_only' | 'glowing_border' | 'minimal'; // 'card_full', 'image_only', 'glowing_border', 'minimal'
  badgeText?: string;
  active: boolean;
  isActive?: boolean;
  clickCount: number;
  clicks?: number;
  createdAt: string;
}

// Video Nhận Định Thị Trường Nhà đẹp Vinhomes
export interface MarketVideo {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  project: ProjectCategory;
  category: 'nhan-dinh' | 'thuc-te' | 'phap-ly' | 'dong-tien';
  views: number;
  publishedAt: string;
  featured?: boolean;
}

// Configuration for Up-Tin Pricing & Banking
export interface UpTinPricingConfig {
  singlePushPrice: number; // VNĐ per push (e.g. 20,000)
  autoPush5Price: number; // VNĐ for 5-push package (e.g. 80,000)
  vipSilverPriceDay: number; // VNĐ / day (e.g. 50,000)
  vipGoldPriceDay: number; // VNĐ / day (e.g. 100,000)
  vipDiamondPriceDay: number; // VNĐ / day (e.g. 200,000)
  
  // Admin Toggle for Payment vs Donate Mode
  paymentEnabled?: boolean; // Toggle ON/OFF required payments
  donateModeEnabled?: boolean; // When true, payment turns into optional Donate
  donateMessage?: string; // Custom message for Donate mode

  bankName: string; // e.g. Vietcombank / MB Bank
  accountNumber: string; // e.g. 0868499929
  accountHolder: string; // e.g. BÙI TRUNG HIẾU
  bankBranch?: string;
  qrNotePrefix: string; // e.g. "UPTIN"
}

// Payment Transaction for Up-Tin
export interface UpTinTransaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  userName: string;
  userPhone: string;
  packageType: 'single_push' | 'auto_push_5' | 'vip_silver' | 'vip_gold' | 'vip_diamond';
  packageName: string;
  amount: number;
  paymentCode: string; // e.g. UPTIN-HB987
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  note?: string;
}

// Feng Shui Theme configuration for Mệnh Mộc
export interface MenhMocConfig {
  element: 'Mộc';
  primaryColorName: 'Xanh Lục Bảo & Xanh Ngọc';
  slogan: 'Nhà đẹp Vinhomes — Mệnh Mộc Vượng Khí, Bất Động Sản Phát Tài';
  luckyNumbers: [3, 8, 1, 6];
  blessedColors: {
    primaryGreen: '#059669', // Emerald 600
    darkEmerald: '#047857', // Emerald 700
    jadeGreen: '#10b981', // Emerald 500
    deepNavy: '#0f172a', // Thủy sinh Mộc Navy
    accentGold: '#eab308' // Hoàng Kim tài lộc
  };
}

// Zalo Group Community & Free Ads Management
export interface ZaloGroup {
  id: string;
  name: string;
  linkUrl: string;
  qrUrl?: string;
  category: string;
  memberCount: number;
  description: string;
  isActive: boolean;
  isFeatured?: boolean;
  clicksCount?: number;
  createdAt?: string;
}

// Dịch Vụ & Cửa Hàng Cư Dân Vinhomes (Resident Marketplace System)
export interface ResidentServiceCategory {
  id: string;
  name: string;
  iconName: string;
  badge?: string;
  description: string;
  subCategories: string[];
}

export interface SubmittedKycDoc {
  id: string;
  docType: string;
  docName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  note?: string;
}

export interface IndustryKycRule {
  categoryId: string;
  categoryName: string;
  iconName: string;
  requiredDocTypes: string[];
  isStrictMandatory: boolean;
  description: string;
  instructions: string;
}

export interface ResidentServiceItem {
  id: string;
  title: string;
  categoryId: string;
  subCategory: string;
  project: ProjectCategory;
  subdivision?: string;
  providerName: string;
  providerPhone: string;
  providerZalo: string;
  address: string;
  priceDisplay: string;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  verified: boolean;
  legalCommitmentAccepted: boolean;
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected';
  approved?: boolean;
  userId?: string;
  contactName?: string;
  contactPhone?: string;
  // Dynamic Nút Xanh KYC & Industry Verification properties
  kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  kycBadgeType?: 'gold_certified' | 'blue_verified' | 'resident_checked' | 'none';
  submittedDocs?: SubmittedKycDoc[];
  kycAppliedAt?: string;
  kycApprovedAt?: string;
  kycApprovedBy?: string;
  kycNote?: string;
  businessLicenseNo?: string;
  taxCode?: string;
  storefrontId?: string; // Id gian hàng KiotViet tương ứng
  lat?: number;
  lng?: number;
  pushedAt?: string;
  expiresAt?: string; // Ngày hết hạn bài đăng dịch vụ cư dân (30 ngày mặc định)
  durationDays?: number;
  isExpired?: boolean;
}

// Cấu hình Kết Nối KiotViet POS API
export interface KiotVietConfig {
  enabled: boolean;
  storeDomain: string; // ví dụ: "nhathuocvinhomes.kiotviet.vn"
  clientId: string;
  clientSecret: string;
  retailerName: string;
  branchId: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  syncStatus?: 'connected' | 'error' | 'disconnected';
  syncedProductsCount?: number;
}

// Sản phẩm & Dịch vụ trong Gian Hàng Cư Dân
export interface StoreProduct {
  id: string;
  storeId: string;
  kiotVietId?: string; // ID đồng bộ từ KiotViet
  code?: string; // Mã SKU ví dụ: "SP-001"
  name: string;
  category: string;
  price: number; // VNĐ
  originalPrice?: number;
  unit?: string; // e.g. "hộp", "suất", "cái", "giờ"
  stockQuantity: number;
  images: string[];
  description: string;
  isAvailable: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  approved?: boolean;
  rating?: number;
  soldCount?: number;
}

// Gian Hàng Sản Phẩm & Dịch Vụ Cư Dân (Resident Storefront)
export interface UserStorefront {
  id: string;
  userId: string;
  ownerName: string;
  ownerPhone: string;
  ownerZalo?: string;
  storeName: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  category: string; // e.g. "Thực Phẩm & Ăn Uống", "Nội Thất & Gia Dụng", "Bảo Trì & Sửa Chữa"
  project: ProjectCategory;
  subdivision?: string;
  address: string;
  description: string;
  operatingHours?: string;
  verified: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  approved?: boolean;
  kiotVietConfig?: KiotVietConfig;
  rating: number;
  reviewCount: number;
  products: StoreProduct[];
  createdAt: string;
  pushedAt?: string;
  expiresAt?: string;
  durationDays?: number;
  isExpired?: boolean;
  lat?: number;
  lng?: number;
}

// Đơn hàng mua từ Gian Hàng Cư Dân
export interface StoreOrder {
  id: string;
  orderCode: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    unit?: string;
  }[];
  totalAmount: number;
  paymentMethod: 'vietqr' | 'cod';
  paymentStatus: 'unpaid' | 'paid';
  orderStatus: 'new' | 'confirmed' | 'delivering' | 'completed' | 'cancelled';
  createdAt: string;
  kiotVietSyncStatus?: 'synced' | 'pending' | 'failed';
}

// ==========================================
// ENTERPRISE ADMIN CONTROL & CRM TYPES
// ==========================================

export type HierarchicalRole = 'super_admin' | 'branch_lead' | 'dept_head' | 'staff' | 'tech_partner';

export interface BranchScope {
  id: string;
  name: string;
  categorySector: string; // e.g., "Xe Đưa Đón Taxi", "Điện Tử CNTT", "Vệ Sinh Dọn Dẹp", "BĐS Vinhomes"
  projectScope: ProjectCategory | string;
  regionScope: string; // e.g., "Miền Bắc - Hà Nội / Hưng Yên", "Sài Gòn - Quận 9"
  leadUserId: string;
  leadUserName: string;
  memberIds: string[];
  description: string;
}

export interface UserActivityMetrics {
  userId: string;
  userName: string;
  role: UserRole | HierarchicalRole;
  loginCount: number;
  onlineHoursTotal: number;
  tasksCompletedTotal: number;
  leadsHandledTotal: number;
  engagementPoints: number; // Điểm tích cực
  currentRank: number; // Xếp hạng hệ thống
  tierLevel: 'Hạng S' | 'Hạng A' | 'Hạng B' | 'Hạng C';
  lastActiveTime: string;
}

export interface RewardConfig {
  id: string;
  tierName: string;
  minPointsRequired: number;
  rewardTitle: string;
  rewardDescription: string;
  rewardUpTinCredits: number;
  cashBonusVnd: number;
  vipBadge: string;
}

export interface HourlyTask {
  id: string;
  title: string;
  description: string;
  categorySector: string; // Ngành nghề / Mảng dịch vụ
  project: ProjectCategory | string;
  branchId: string;
  assignedByUserId: string;
  assignedByName: string;
  assignedToUserId: string;
  assignedToName: string;
  assignedToPhone: string;
  hourlyDeadlineHours: number; // Ví dụ: 2 giờ
  targetCompletionTime: string; // ISO String
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'overdue' | 'rejected';
  baseKpiPoints: number;
  bonusPenaltyPoints: number;
  finalKpiScore?: number;
  managerRating?: 1 | 2 | 3 | 4 | 5; // 1-5 sao
  managerFeedback?: string;
  proofImages?: string[];
  createdAt: string;
}

export interface CRMContactRecord {
  id: string;
  type: 'customer' | 'partner' | 'member';
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  projectScope?: string;
  branchScopeId?: string;
  sectorTag: string; // e.g. "Chủ Nhà Cho Thuê", "Tài Xế Taxi Cư Dân", "Thợ Điện Lạnh"
  lifetimeValueVnd?: number;
  notes?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  lastContactedAt?: string;
}

export interface ServiceJobDispatch {
  id: string;
  jobCode: string;
  categorySector: 'Xe Đưa Đón / Taxi' | 'Điện Tử - CNTT & PC' | 'Vệ Sinh - Dọn Dẹp' | 'Bảo Trì Điện Lạnh' | 'Cứu Hộ BĐS';
  title: string;
  customerName: string;
  customerPhone: string;
  address: string;
  projectScope: string;
  description: string;
  estimatedPriceVnd: number;
  claimFeeVnd: number; // Phí trả để nhận đơn (Taxi/Thợ nạp phí nhận đơn)
  status: 'open' | 'claimed' | 'in_progress' | 'completed' | 'cancelled';
  claimedByTechId?: string;
  claimedByTechName?: string;
  claimedByTechPhone?: string;
  claimedAt?: string;
  completedAt?: string;
  ratingByCustomer?: number;
  createdAt: string;
}

// ==========================================
// TECHNICAL SERVICES & AUTOMATED ESCROW WALLET
// ==========================================

export type TechOrderStatus = 
  | 'created' 
  | 'escrow_locked' 
  | 'tech_assigned' 
  | 'in_progress' 
  | 'inspection_submitted' 
  | 'completed_released' 
  | 'disputed' 
  | 'refunded' 
  | 'cancelled';

export interface TechnicalServiceOrder {
  id: string;
  orderCode: string;
  serviceId: string;
  serviceTitle: string;
  categoryId: string;
  subCategory: string;
  customerUserId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  project: ProjectCategory;
  subdivision?: string;
  techUserId?: string;
  techName: string;
  techPhone: string;
  agreedPrice: number; // VNĐ
  escrowAmount: number; // VNĐ
  platformFee: number; // VNĐ (% chiết khấu sàn)
  payoutAmount: number; // VNĐ (Tiền thợ thực nhận)
  status: TechOrderStatus;
  warrantyDays: number;
  warrantyExpiresAt?: string;
  note: string;
  imagesBefore?: string[];
  imagesAfter?: string[];
  createdAt: string;
  updatedAt: string;
  autoReleaseAt?: string;
  bankInfoForPayout?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface UserBankDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  qrCodeUrl?: string;
}

export interface UserWallet {
  userId: string;
  availableBalance: number;
  escrowLockedBalance: number;
  securityDeposit: number; // Tiền cọc cam kết bảo hành thợ
  totalEarned: number;
  bankDetails?: UserBankDetails;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit_vietqr' | 'escrow_hold' | 'escrow_release' | 'commission_deduct' | 'payout_withdraw' | 'refund';
  amount: number;
  orderId?: string;
  orderCode?: string;
  description: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  referenceCode?: string;
}

export const isAdminProperty = (property: Property): boolean => {
  if (!property) return false;
  if (property.sellerRole === 'admin' || (property as any).sellerRole === 'super_admin') {
    return true;
  }
  if (property.userId === 'admin' || property.userId === 'u-admin-1' || property.userId === 'superadmin') {
    return true;
  }
  const sellerLower = (property.sellerName || '').toLowerCase();
  if (
    sellerLower.includes('admin') || 
    sellerLower.includes('nhà đẹp vinhomes') || 
    sellerLower.includes('quản trị')
  ) {
    return true;
  }
  return false;
};

// ------------------- RECRUITMENT & RESIDENT CV TYPES -------------------

export interface RecruitmentJob {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  industry: string;
  project: ProjectCategory | string;
  projectName?: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'freelance' | 'shift' | 'internship';
  salaryType: 'range' | 'fixed' | 'hourly' | 'deal' | 'commission';
  salaryDisplay: string;
  minSalary?: number;
  maxSalary?: number;
  experience: 'none' | 'under-1y' | '1-3y' | '3-5y' | 'above-5y';
  experienceDisplay: string;
  description: string;
  requirements: string[];
  benefits: string[];
  contactName: string;
  contactPhone: string;
  contactZalo?: string;
  contactEmail?: string;
  employerUserId?: string;
  status: 'active' | 'closed' | 'pending';
  isVip?: boolean;
  isUrgent?: boolean;
  viewsCount: number;
  applicationsCount: number;
  deadline: string;
  createdAt: string;
}

export interface CandidateWorkExperience {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface CandidateEducation {
  school: string;
  major: string;
  period: string;
  degree?: string;
}

export interface CandidateProfile {
  id: string;
  userId?: string;
  fullName: string;
  avatarUrl?: string;
  birthYear?: number | string;
  gender?: 'nam' | 'nu' | 'khac';
  phone: string;
  email: string;
  zalo?: string;
  currentProject: ProjectCategory | string;
  projectName?: string;
  currentAddress?: string;
  targetJobTitle: string;
  primaryIndustry: string;
  subIndustries?: string[];
  workTypePreference: ('full-time' | 'part-time' | 'freelance' | 'shift' | 'remote')[];
  expectedSalary: string;
  experienceLevel: 'none' | 'under-1y' | '1-3y' | '3-5y' | 'above-5y';
  yearsOfExp?: number;
  introduction: string;
  skills: string[];
  workExperience: CandidateWorkExperience[];
  education: CandidateEducation[];
  certificates?: string[];
  attachedCvUrl?: string;
  isLookingForJob: boolean;
  isImmediate: boolean;
  unlockPriceVnd: number;
  unlockedByUserIds: string[];
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidatePhone: string;
  candidateEmail: string;
  candidateAvatar?: string;
  expectedSalary?: string;
  targetJobTitle?: string;
  message?: string;
  employerUserId?: string;
  status: 'applied' | 'reviewing' | 'interview_scheduled' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface CvUnlockRecord {
  id: string;
  recruiterUserId: string;
  recruiterName: string;
  recruiterPhone: string;
  candidateId: string;
  candidateName: string;
  amountVnd: number;
  paymentMethod: 'vietqr' | 'wallet_balance' | 'free_credit';
  status: 'completed' | 'pending';
  createdAt: string;
}






