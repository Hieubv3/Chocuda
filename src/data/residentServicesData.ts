import { ProjectCategory, IndustryKycRule, SubmittedKycDoc } from '../types';

export interface ResidentServiceCategory {
  id: string;
  name: string;
  iconName: string;
  badge?: string;
  description: string;
  subCategories: string[];
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
  storefrontId?: string;
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
  pushedAt?: string;
  expiresAt?: string;
  durationDays?: number;
  isExpired?: boolean;
}

// Full Matrix of Mandatory & Required Licenses per Industry Category
export const DEFAULT_INDUSTRY_KYC_RULES: IndustryKycRule[] = [
  {
    categoryId: 'thang-may-sua-nha',
    categoryName: 'Thi Công Xây Lắp, Nội Thất & Thang Máy Gia Đình',
    iconName: 'ArrowUpRightSquare',
    requiredDocTypes: [
      'Chứng chỉ An toàn lao động & Kiểm định thử tải thang máy gia đình',
      'Giấy phép Đăng ký Kinh doanh (ĐKKD) Công ty Xây dựng / Nội thất / Thang máy',
      'CCCD / Thẻ căn cước Kỹ sư Thợ trưởng thi công & Bảng vẽ kĩ thuật'
    ],
    isStrictMandatory: true,
    description: 'Yêu cầu kiểm định an toàn kỹ thuật nghiêm ngặt tránh sự cố đứt cáp/kẹt thang máy biệt thự & chất lượng công trình xây lắp.',
    instructions: 'Chủ cơ sở/kỹ sư bắt buộc tải lên Giấy kiểm định thang máy, ĐKKD công ty và Căn cước công dân Kỹ sư trưởng.'
  },
  {
    categoryId: 'dien-may-tinh-cong-nghe',
    categoryName: 'Thiết Bị Điện - Máy Tính & Smarthome',
    iconName: 'Cpu',
    requiredDocTypes: [
      'CCCD / Thẻ Căn cước Thợ kỹ thuật',
      'Bằng cấp / Chứng chỉ đào tạo Nghề Kỹ thuật Điện - CNTT Bách Khoa',
      'Giấy ĐKKD Cửa hàng / Tiệm máy tính (Nếu có)'
    ],
    isStrictMandatory: true,
    description: 'Đảm bảo trình độ chuyên môn, loại bỏ thợ ảo giả danh lừa đảo cư dân.',
    instructions: 'Tải lên CCCD thợ và Bằng cấp/Chứng chỉ đào tạo nghề điện tử, CNTT hoặc chứng nhận đại lý.'
  },
  {
    categoryId: 'van-chuyen-taxi',
    categoryName: 'Taxi Cư Dân & Vận Chuyển 24/7',
    iconName: 'Car',
    requiredDocTypes: [
      'Bằng lái xe hạng B2 / D chính chủ',
      'Giấy Đăng ký xe (Cà vẹt xe) & Tem Đăng kiểm còn hạn',
      'Phù hiệu Xe hợp đồng / Xe chạy ứng dụng',
      'CCCD Tài xế cư dân'
    ],
    isStrictMandatory: true,
    description: 'Bảo vệ an toàn tuyệt đối cho cư dân di chuyển ban đêm hoặc đưa đón con em nội khu.',
    instructions: 'Tải lên Bằng lái xe B2+, Cà vẹt xe chính chủ, Đăng kiểm và CCCD tài xế.'
  },
  {
    categoryId: 'dich-vu-gia-dinh-giat-la',
    categoryName: 'Giặt Là & Dịch Vụ Gia Đình',
    iconName: 'Sparkles',
    requiredDocTypes: [
      'Giấy Đăng ký Kinh doanh Tiệm giặt sấy / Cửa hàng',
      'CCCD Chủ cơ sở / Giúp việc chính',
      'Giấy xác nhận cư trú / Thẻ cư dân Vinhomes'
    ],
    isStrictMandatory: false,
    description: 'Đảm bảo uy tín giặt rèm, dọn dẹp không làm thất lạc hay hư hỏng tài sản cư dân.',
    instructions: 'Tải lên CCCD và Thẻ cư dân hoặc Giấy ĐKKD tiệm giặt.'
  },
  {
    categoryId: 'am-thuc-com-cu-dan',
    categoryName: 'Ẩm Thực & Cơm Cư Dân',
    iconName: 'Utensils',
    requiredDocTypes: [
      'Giấy chứng nhận An Toàn Vệ Sinh Thực Phẩm (ATVSTP)',
      'Giấy Khám sức khỏe định kỳ người trực tiếp chế biến',
      'Giấy ĐKKD Quán ăn / Nhà hàng / Bếp cư dân'
    ],
    isStrictMandatory: true,
    description: 'Phòng ngừa triệt để nguy cơ ngộ độc thực phẩm, minh bạch nguồn gốc nguyên liệu tươi sạch.',
    instructions: 'Bắt buộc tải lên Giấy chứng nhận ATVSTP còn hạn sử dụng và Giấy khám sức khỏe.'
  },
  {
    categoryId: 'spa-lam-dep-suc-khoe',
    categoryName: 'Spa, Làm Đẹp & Y Tế Gia Đình',
    iconName: 'HeartHandshake',
    requiredDocTypes: [
      'Giấy phép Hành nghề Y Dược / Chứng chỉ Khám chữa bệnh (Dành cho Y tế 24/7)',
      'Chứng chỉ đào tạo Nghề Spa / Thẩm mỹ / Gội đầu dưỡng sinh',
      'Giấy ĐKKD Cơ sở Spa / Phòng khám',
      'CCCD Chủ cơ sở'
    ],
    isStrictMandatory: true,
    description: 'Ngăn ngừa biến chứng thẩm mỹ, tiêm truyền trái phép hoặc dịch vụ y tế chui.',
    instructions: 'Y tế tại nhà bắt buộc có Chứng chỉ hành nghề y tế. Spa thẩm mỹ phải có Chứng chỉ đào tạo nghề.'
  },
  {
    categoryId: 'homestay-luu-tru',
    categoryName: 'Homestay & Cho Thuê Du Lịch',
    iconName: 'Hotel',
    requiredDocTypes: [
      'Hợp đồng Sở hữu căn hộ / Ủy quyền khai thác Homestay chính chủ',
      'Giấy cam kết Phòng cháy chữa cháy (PCCC) & An ninh trật tự',
      'CCCD Chủ hộ Homestay'
    ],
    isStrictMandatory: true,
    description: 'Đảm bảo việc kinh doanh lưu trú đúng quy định BQL Vinhomes và an ninh trật tự công an.',
    instructions: 'Tải lên Hợp đồng mua bán/Sổ đỏ căn hộ, ĐKKD hoặc Giấy PCCC.'
  },
  {
    categoryId: 'giao-duc-gia-su',
    categoryName: 'Gia Sư & Rèn Kỹ Năng Trẻ Em',
    iconName: 'GraduationCap',
    requiredDocTypes: [
      'Bằng tốt nghiệp Đại học / Sư phạm / Thẻ sinh viên',
      'Chứng chỉ Ngoại ngữ IELTS / Toeic / Năng khiếu (Piano/Vẽ)',
      'CCCD Gia sư'
    ],
    isStrictMandatory: false,
    description: 'Minh bạch trình độ giảng dạy, giúp phụ huynh an tâm gửi gắm con trẻ.',
    instructions: 'Tải lên Bằng tốt nghiệp Đại học hoặc Thẻ sinh viên + Chứng chỉ IELTS/Năng khiếu.'
  },
  {
    categoryId: 'pet-care',
    categoryName: 'Chăm Sóc Thú Cưng (Pet Care)',
    iconName: 'Dog',
    requiredDocTypes: [
      'Bằng Bác sĩ Thú Y / Chứng chỉ Grooming Cắt tỉa lông',
      'Giấy phép Tiêm phòng & Tiêm vắc-xin dại',
      'CCCD Chủ Pet Shop'
    ],
    isStrictMandatory: false,
    description: 'Đảm bảo sức khỏe cho thú cưng và an toàn lây nhiễm bệnh dịch nội khu.',
    instructions: 'Tải lên Bằng Bác sĩ thú y hoặc Chứng chỉ Grooming chuyên nghiệp.'
  },
  {
    categoryId: 'cho-thanh-ly-hang-tieu-dung',
    categoryName: 'Thời Trang & Chợ Thanh Lý Cư Dân',
    iconName: 'ShoppingBag',
    requiredDocTypes: [
      'CCCD Cư dân Vinhomes chính chủ',
      'Thẻ cư dân / Hợp đồng thuê nhà / Sổ đỏ căn hộ'
    ],
    isStrictMandatory: false,
    description: 'Xác minh cư dân nội khu thật, loại bỏ tài khoản ảo giao dịch lừa đảo.',
    instructions: 'Tải lên Thẻ cư dân Vin hoặc CCCD.'
  }
];

// Major Vin Projects list for filter with display names and badge labels
export const VIN_MAJOR_PROJECTS: { id: ProjectCategory; name: string; tag: string; location: string }[] = [
  { id: 'ocean-park-2', name: 'Vinhomes Ocean Park 2 (The Empire)', tag: 'Đại Dự Án Siêu Hót', location: 'Hưng Yên / Hà Nội' },
  { id: 'ocean-park-3', name: 'Vinhomes Ocean Park 3 (The Crown)', tag: 'Vịnh Biển Bốn Mùa', location: 'Hưng Yên / Hà Nội' },
  { id: 'ocean-park-1', name: 'Vinhomes Ocean Park 1 (Gia Lâm)', tag: 'Quận Trung Tâm 1', location: 'Gia Lâm, Hà Nội' },
  { id: 'smart-city', name: 'Vinhomes Smart City (Tây Mỗ)', tag: 'Đô Thị Thông Minh', location: 'Nam Từ Liêm, Hà Nội' },
  { id: 'grand-park', name: 'Vinhomes Grand Park (TP. Thủ Đức)', tag: 'Đại Đô Thị Miền Nam', location: 'TP. Thủ Đức, TP.HCM' },
  { id: 'ha-long-xanh', name: 'Vinhomes Hạ Long Xanh', tag: 'Khu Đô Thị Kỳ Quan', location: 'Quảng Ninh' },
  { id: 'royal-island', name: 'Vinhomes Royal Island (Vũ Yên)', tag: 'Đảo Thượng Lưu', location: 'Hải Phòng' },
  { id: 'riverside', name: 'Vinhomes Riverside & Harmony', tag: 'Biệt Thự Đẳng Cấp', location: 'Long Biên, Hà Nội' },
  { id: 'golden-avenue', name: 'Vinhomes Golden Avenue', tag: 'Cửa Khẩu Móng Cái', location: 'Móng Cái, Quảng Ninh' },
  { id: 'tan-my-hau-nghia', name: 'Vinhomes Tân Mỹ Hậu Nghĩa', tag: 'Dự Án Mới Tiềm Năng', location: 'Đức Hòa, Long An' },
  { id: 'green-paradise-can-gio', name: 'Vinhomes Green Paradise Cần Giờ', tag: 'Siêu Đô Thị Biển', location: 'Cần Giờ, TP.HCM' },
  { id: 'green-city-hoc-mon', name: 'Vinhomes Green City Hóc Môn', tag: 'Quy Hoạch Mới', location: 'Hóc Môn, TP.HCM' },
  { id: 'lang-van-da-nang', name: 'Vinhomes Làng Vân Đà Nẵng', tag: 'Nghỉ Dưỡng Thượng Lưu', location: 'Đà Nẵng' },
  { id: 'khac', name: 'Vinhomes Times City / Royal City / Khác', tag: 'Nội Thành Hà Nội', location: 'Hà Nội & Toàn Quốc' },
];

// Complete Cây Danh Mục Dịch Vụ Cư Dân Vinhomes
export const RESIDENT_SERVICE_CATEGORIES: ResidentServiceCategory[] = [
  {
    id: 'thang-may-sua-nha',
    name: 'Thi Công Xây Lắp, Nội Thất & Thang Máy Gia Đình',
    iconName: 'ArrowUpRightSquare',
    badge: 'Xây Lắp & Hoàn Thiện',
    description: 'Tư vấn thiết kế & thi công xây dựng cải tạo biệt thự, shophouse, hoàn thiện nội thất trọn gói, lắp đặt & bảo trì thang máy gia đình, homelift kính 24/7.',
    subCategories: [
      '🛗 Lắp Đặt & Bảo Trì Thang Máy Gia Đình & Homelift Kính',
      '🏗️ Thi Công Xây Lắp, Cải Tạo Biệt Thự & Shophouse',
      '🛋️ Thiết Kế & Thi Công Nội Thất Trọn Gói (Gỗ An Cường)',
      '⚡ Sửa Chữa Điện - Nước 24/7 & Khóa Thông Minh',
      '🎨 Sơn Bả, Chống Thấm, Thạch Cao & Cửa Nhôm Kính',
      '🪟 Rèm Cửa Tự Động & Giàn Phơi Thông Minh'
    ]
  },
  {
    id: 'dien-may-tinh-cong-nghe',
    name: 'Thiết Bị Điện - Máy Tính & Smarthome',
    iconName: 'Cpu',
    badge: 'Kỹ thuật tốt',
    description: 'Sửa chữa laptop, máy tính để bàn, Wi-Fi mesh, lắp camera an ninh, smarthome & sửa thiết bị điện lạnh.',
    subCategories: [
      'Sửa Máy tính, Laptop & Wi-Fi',
      'Lắp Camera & Smarthome',
      'Sửa Điều hòa, Tủ lạnh, Bếp từ',
      'Sửa Máy giặt & Robot hút bụi',
      'Sửa TV, Loa & Thiết bị âm thanh'
    ]
  },
  {
    id: 'van-chuyen-taxi',
    name: 'Taxi Cư Dân & Vận Tải 24/7 (Nội Khu & Ngoại Khu)',
    iconName: 'Car',
    badge: '24/7 Nhanh chóng',
    description: 'Bao gồm trọn gói Vận tải Nội khu (Xe điện, Taxi điện, Chuyển đồ nội khu) & Vận tải Ngoại khu (Taxi Sân bay Nội Bài, Xe đi tỉnh, Xe hợp đồng 4-45 chỗ).',
    subCategories: [
      '⚡ Vận Tải Nội Khu (Xe điện Buggy, Taxi điện, Chuyển đồ)',
      '✈️ Vận Tải Ngoại Khu (Taxi Sân Bay Nội Bài, Xe đi tỉnh)',
      '🚐 Xe Hợp Đồng Du Lịch & Đưa Đón VIP (4-45 chỗ)',
      '📦 Chuyển Nhà Trọn Gói & Vận Chuyển Hàng Hóa',
      '🛠️ Cứu Hộ Ô Tô & Xe Máy Nội Khu 24/7'
    ]
  },
  {
    id: 'dich-vu-gia-dinh-giat-la',
    name: 'Giặt Là & Dịch Vụ Gia Đình',
    iconName: 'Sparkles',
    badge: 'Uy tín',
    description: 'Giặt sấy công nghiệp, vệ sinh công nghiệp, dọn dẹp nhà theo giờ, giúp việc cố định & chăm sóc sân vườn.',
    subCategories: [
      'Giặt sấy công nghiệp & Giặt rèm',
      'Vệ sinh công nghiệp & Dọn nhà theo giờ',
      'Giúp việc cố định & Trông trẻ',
      'Chăm sóc cây cảnh & Bể bơi biệt thự',
      'Diệt côn trùng & Khử khuẩn'
    ]
  },
  {
    id: 'am-thuc-com-cu-dan',
    name: 'Ẩm Thực & Cơm Cư Dân',
    iconName: 'Utensils',
    badge: 'Ngon & Sạch',
    description: 'Nhà hàng, cafe, cơm gia đình cư dân nấu, thực phẩm sạch hữu cơ, tiệc BBQ & Đặt cỗ tại nhà.',
    subCategories: [
      'Cơm gia đình & Đồ ăn cư dân nấu',
      'Nhà hàng, Quán ăn & Lẩu nướng',
      'Cafe, Trà sữa & Tiệm bánh',
      'Thực phẩm sạch & Hải sản tươi sống',
      'Đặt cỗ & Tiệc BBQ tại nhà'
    ]
  },
  {
    id: 'spa-lam-dep-suc-khoe',
    name: 'Spa, Làm Đẹp & Y Tế Gia Đình',
    iconName: 'HeartHandshake',
    badge: 'Chăm sóc sức khỏe',
    description: 'Spa dưỡng sinh, gội đầu thảo dược, cắt tóc, làm móng, phòng Gym/Pickleball & Bác sĩ gia đình khám tại nhà.',
    subCategories: [
      'Spa Dưỡng sinh & Gội đầu thảo dược',
      'Cắt tóc, Tạo mẫu tóc (Hair Salon)',
      'Làm móng (Nail/Eyelash) & Phun xăm',
      'Phòng Gym, Yoga & Sân Pickleball',
      'Bác sĩ gia đình & Y tế tại nhà 24/7'
    ]
  },
  {
    id: 'homestay-luu-tru',
    name: 'Homestay & Cho Thuê Du Lịch',
    iconName: 'Hotel',
    badge: 'Nghỉ dưỡng',
    description: 'Cho thuê homestay theo giờ, theo ngày, căn hộ & shophouse du lịch trải nghiệm biển hồ Vin.',
    subCategories: [
      'Homestay theo giờ / Theo ngày',
      'Khách sạn & Căn hộ du lịch',
      'Cho thuê Xe đạp & Xe điện ngắm cảnh',
      'Dịch vụ Chụp ảnh Check-in & Tour'
    ]
  },
  {
    id: 'giao-duc-gia-su',
    name: 'Gia Sư & Rèn Kỹ Năng Trẻ Em',
    iconName: 'GraduationCap',
    badge: 'Ưu tú',
    description: 'Gia sư dạy kèm tại nhà, trung tâm Anh ngữ, lớp nhạc piano/vẽ, rèn đạo đức & kỹ năng sống.',
    subCategories: [
      'Gia sư & Dạy kèm tại nhà',
      'Trung tâm Anh ngữ & Tin học',
      'Lớp Năng khiếu: Piano, Vẽ, Võ',
      'Trải nghiệm thực tế & Rèn kỹ năng'
    ]
  },
  {
    id: 'pet-care',
    name: 'Chăm Sóc Thú Cưng (Pet Care)',
    iconName: 'Dog',
    badge: 'Yêu thương',
    description: 'Bác sĩ thú y, tiêm phòng, tắm tỉa lông pet, khách sạn trông giữ thú cưng khi đi du lịch.',
    subCategories: [
      'Bác sĩ thú y & Tiêm phòng',
      'Spa thú cưng, Tắm & Cắt tỉa lông',
      'Khách sạn & Trông giữ Thú cưng'
    ]
  },
  {
    id: 'cho-thanh-ly-hang-tieu-dung',
    name: 'Thời Trang & Chợ Thanh Lý Cư Dân',
    iconName: 'ShoppingBag',
    badge: 'Giao lưu cư dân',
    description: 'Cửa hàng tiện lợi 24/7, thời trang phụ kiện, đồ mẹ & bé, chợ pass đồ cũ nội thất cư dân.',
    subCategories: [
      'Chợ Thanh lý & Pass đồ cũ cư dân',
      'Cửa hàng tiện lợi & Siêu thị 24/7',
      'Thời trang, Giày dép & Phụ kiện',
      'Đồ dùng Mẹ & Bé'
    ]
  }
];

// Initial Verified Resident Services
export const INITIAL_RESIDENT_SERVICES: ResidentServiceItem[] = [
  {
    id: 'srv-thang-may-01',
    title: 'Thang Máy Gia Đình Vinhomes - Thi Công & Bảo Trì Kính Homelift',
    categoryId: 'thang-may-sua-nha',
    subCategory: '🛗 Lắp Đặt & Bảo Trì Thang Máy Gia Đình & Homelift Kính',
    project: 'ocean-park-2',
    subdivision: 'Phân khu Chà Là & San Hô',
    providerName: 'Kỹ sư Nguyễn Văn Đức (Cư dân Chà Là 6)',
    providerPhone: '0988.345.890',
    providerZalo: 'https://zalo.me/0988345890',
    address: 'Chà Là 6-12, Vinhomes Ocean Park 2',
    priceDisplay: 'Báo giá trực tiếp theo công trình (Khảo sát Miễn Phí)',
    rating: 5.0,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Chuyên tư vấn, thiết kế và thi công lắp đặt thang máy gia đình Kính Homelift, thang máy tải khách cho Shophouse và Biệt thự tại Ocean Park 1, 2, 3 và Smart City. Đội ngũ kỹ sư Cư dân bảo trì 24/7 trong 15 phút!',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-07-15',
    kycStatus: 'verified',
    kycBadgeType: 'blue_verified',
    businessLicenseNo: '0108928372-VIN',
    taxCode: '0108928372',
    kycApprovedAt: '2026-07-16',
    kycApprovedBy: 'Ban Quản Trị Hệ Thống chocudan24h.com',
    submittedDocs: [
      {
        id: 'doc-101',
        docType: 'Chứng chỉ Kiểm định Thử tải Thang máy Gia đình',
        docName: 'KiemDinhThangMay_GlassLift2026.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=800&q=80',
        status: 'approved',
        uploadedAt: '2026-07-15',
        note: 'Đã kiểm tra tem kiểm định an toàn đợt 1/2026 còn hiệu lực.'
      },
      {
        id: 'doc-102',
        docType: 'Giấy phép ĐKKD Công ty Thang máy Thăng Long',
        docName: 'DKKD_ThangMayThangLong.png',
        fileUrl: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
        status: 'approved',
        uploadedAt: '2026-07-15'
      }
    ]
  },
  {
    id: 'srv-dien-nuoc-laptop-02',
    title: 'Sửa Điện Nước, Máy Tính, Laptop & Wi-Fi Mesh 24/7 Bách Khoa',
    categoryId: 'dien-may-tinh-cong-nghe',
    subCategory: 'Sửa Máy tính, Laptop & Wi-Fi',
    project: 'ocean-park-1',
    subdivision: 'Căn hộ S2.12 & Toàn Quận 1',
    providerName: 'Thợ Cư Dân Lê Anh Tuấn (Kỹ sư Bách Khoa)',
    providerPhone: '0972.112.334',
    providerZalo: 'https://zalo.me/0972112334',
    address: 'Tòa S2.12, Vinhomes Ocean Park 1',
    priceDisplay: 'Khảo sát tận nhà từ 50.000đ',
    rating: 4.9,
    reviewCount: 118,
    images: [
      'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Xử lý nhanh sự cố chập điện, rò rỉ nước, sửa máy tính, laptop không lên nguồn, cài Win, thi công Wi-Fi Mesh sóng khỏe toàn biệt thự/căn hộ. Có mặt sau 10 phút gọi.',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-07-20',
    kycStatus: 'verified',
    kycBadgeType: 'blue_verified',
    submittedDocs: [
      {
        id: 'doc-201',
        docType: 'Bằng Tốt Nghiệp Kỹ Sư Điện - CNTT ĐH Bách Khoa Hà Nội',
        docName: 'BangDaiHoc_BachKhoa_LeAnhTuan.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
        status: 'approved',
        uploadedAt: '2026-07-20'
      }
    ]
  },
  {
    id: 'srv-com-cu-dan-05',
    title: 'Bếp Cư Dân - Cơm Cửa Hàng & Đồ Ăn Sạch Hữu Cơ Tận Nhà',
    categoryId: 'am-thuc-com-cu-dan',
    subCategory: 'Cơm gia đình & Đồ ăn cư dân nấu',
    project: 'grand-park',
    subdivision: 'Phân khu Origami & Rainbow',
    providerName: 'Chị Mai Cư Dân Origami (Bếp Mẹ Làm)',
    providerPhone: '0903.666.123',
    providerZalo: 'https://zalo.me/0903666123',
    address: 'S7.02 Vinhomes Grand Park, TP. Thủ Đức',
    priceDisplay: 'Suất cơm từ 45.000đ',
    rating: 4.9,
    reviewCount: 210,
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Bếp ăn cư dân chuẩn vị cơm nhà nấu, thực phẩm tươi sạch mua trong ngày, không mì chính. Đặt cơm trưa công văn, cơm tối gia đình ship tận cửa phòng!',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-07-25',
    kycStatus: 'verified',
    kycBadgeType: 'gold_certified',
    businessLicenseNo: '79A8392112',
    submittedDocs: [
      {
        id: 'doc-501',
        docType: 'Giấy Chứng Nhận Cơ Sở Đủ Điều Kiện An Toàn Vệ Sinh Thực Phẩm',
        docName: 'Giay_ATVSTP_BepChimai.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        status: 'approved',
        uploadedAt: '2026-07-25',
        note: 'Cấp bởi Chi cục An toàn Vệ sinh Thực phẩm TP.HCM.'
      }
    ]
  },
  {
    id: 'srv-pending-medical-09',
    title: 'Phòng Khám Y Tế Gia Đình & Bác Sĩ Cư Dân Khám Tại Nhà 24/7',
    categoryId: 'spa-lam-dep-suc-khoe',
    subCategory: 'Bác sĩ gia đình & Y tế tại nhà 24/7',
    project: 'ocean-park-1',
    subdivision: 'Tòa S1.08 Vinhomes Ocean Park 1',
    providerName: 'Thạc sĩ Bác sĩ Nguyễn Hoàng Lâm (Bệnh viện Vinmec)',
    providerPhone: '0915.223.445',
    providerZalo: 'https://zalo.me/0915223445',
    address: 'P1208, Tòa S1.08 Ocean Park 1',
    priceDisplay: 'Khám tại nhà từ 300.000đ',
    rating: 5.0,
    reviewCount: 19,
    images: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dịch vụ bác sĩ gia đình khám sức khỏe tận nơi, xét nghiệm máu tại nhà, truyền dịch y tế theo chỉ định bác sĩ, chăm sóc vết thương sau phẫu thuật.',
    verified: false,
    legalCommitmentAccepted: true,
    createdAt: '2026-08-01',
    kycStatus: 'pending',
    kycBadgeType: 'none',
    kycAppliedAt: '2026-08-01',
    submittedDocs: [
      {
        id: 'doc-901',
        docType: 'Chứng chỉ Hành nghề Khám Bệnh, Chữa Bệnh Y Tế do Bộ Y Tế Cấp',
        docName: 'ChungChiHanhNghe_BS_NguyenHoangLam.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        status: 'pending',
        uploadedAt: '2026-08-01',
        note: 'Đang chờ Ban Quản Trị đối soát thông tin trên Cổng Thông tin Bộ Y Tế.'
      },
      {
        id: 'doc-902',
        docType: 'CCCD Bác Sĩ Cư Dân Chính Chủ',
        docName: 'CCCD_NguyenHoangLam.png',
        fileUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
        status: 'pending',
        uploadedAt: '2026-08-01'
      }
    ]
  },
  {
    id: 'srv-transport-noi-khu-01',
    title: 'Xe Điện Buggy & Taxi Điện Nội Khu Đưa Đón Trẻ Em & Cư Dân 24/7',
    categoryId: 'van-chuyen-taxi',
    subCategory: '⚡ Vận Tải Nội Khu (Xe điện Buggy, Taxi điện, Chuyển đồ)',
    project: 'ocean-park-1',
    subdivision: 'Phân khu Ngọc Trai & San Hô',
    providerName: 'Đội Xe Điện Cư Dân Nội Khu Vinhomes',
    providerPhone: '0912.668.999',
    providerZalo: 'https://zalo.me/0912668999',
    address: 'Sảnh S2.01 Vinhomes Ocean Park 1',
    priceDisplay: 'Từ 20.000đ/lượt nội khu',
    rating: 5.0,
    reviewCount: 112,
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dịch vụ VẬN TẢI NỘI KHU chuyên nghiệp: Đưa đón con trẻ đi học Vinschool, đưa đón ông bà đi dạo/bể bơi/Vincom, di chuyển giữa các phân khu Ocean Park 1, 2, 3 & Smart City. Xe điện êm ái, an toàn 100%.',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-08-01',
    kycStatus: 'verified',
    kycBadgeType: 'blue_verified'
  },
  {
    id: 'srv-transport-noi-khu-02',
    title: 'Xe Điện Ba Bánh & Tải Nhỏ Chuyển Đồ, Vận Chuyển Nội Thất Nội Khu',
    categoryId: 'van-chuyen-taxi',
    subCategory: '⚡ Vận Tải Nội Khu (Xe điện Buggy, Taxi điện, Chuyển đồ)',
    project: 'smart-city',
    subdivision: 'Sảnh Sapphire & Imperia',
    providerName: 'Đội Vận Chuyển Chợ Cư Dân Smart City',
    providerPhone: '0988.345.890',
    providerZalo: 'https://zalo.me/0988345890',
    address: 'S2.05 Vinhomes Smart City',
    priceDisplay: 'Từ 100.000đ/chuyến chuyển đồ',
    rating: 4.9,
    reviewCount: 78,
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Chuyên chở đồ đạc cồng kềnh, chuyển đồ chuyển nhà giữa các tòa nhà nội khu Vinhomes. Hỗ trợ bốc xếp tận phòng, cẩn thận, không trầy xước thang máy.',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-08-02',
    kycStatus: 'verified',
    kycBadgeType: 'blue_verified'
  },
  {
    id: 'srv-pending-taxi-10',
    title: 'Đội Xe Điện VinFast VF9 Đưa Đón Vip Cư Dân Sân Bay Nội Bài (Vận Tải Ngoại Khu)',
    categoryId: 'van-chuyen-taxi',
    subCategory: '✈️ Vận Tải Ngoại Khu (Taxi Sân Bay Nội Bài, Xe đi tỉnh)',
    project: 'smart-city',
    subdivision: 'Tonkin 1, Vinhomes Smart City',
    providerName: 'Tài xế Đỗ Quốc Khánh (Cư dân Tonkin)',
    providerPhone: '0966.888.999',
    providerZalo: 'https://zalo.me/0966888999',
    address: 'Sảnh Tonkin 1, Vinhomes Smart City',
    priceDisplay: 'Trọn gói Sân bay 350.000đ',
    rating: 4.9,
    reviewCount: 32,
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'VẬN TẢI NGOẠI KHU: Chuyên phục vụ các chuyến đưa đón VIP bằng xe điện 7 chỗ VF9 rộng rãi sang trọng đi Sân bay Nội Bài, đi tỉnh, sân golf. Đặt lịch trước có ngay xe.',
    verified: false,
    legalCommitmentAccepted: true,
    createdAt: '2026-08-01',
    kycStatus: 'pending',
    kycBadgeType: 'none',
    kycAppliedAt: '2026-08-01',
    submittedDocs: [
      {
        id: 'doc-1001',
        docType: 'Giấy Phép Lái Xe Hạng B2 Chính Chủ',
        docName: 'GPLX_B2_DoQuocKhanh.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
        status: 'pending',
        uploadedAt: '2026-08-01'
      },
      {
        id: 'doc-1002',
        docType: 'Giấy Đăng Ký Xe &Tem Đăng Kiểm Xe VF9',
        docName: 'Cavet_DangKiem_VF9.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
        status: 'pending',
        uploadedAt: '2026-08-01'
      }
    ]
  },
  {
    id: 'srv-taxi-03',
    title: 'Taxi Cư Dân Vin 7 Chỗ Tiện Chuyến Hà Nội - Sân Bay Nội Bài & Đi Tỉnh',
    categoryId: 'van-chuyen-taxi',
    subCategory: '✈️ Vận Tải Ngoại Khu (Taxi Sân Bay Nội Bài, Xe đi tỉnh)',
    project: 'smart-city',
    subdivision: 'Phân khu Sapphire & Tonkin',
    providerName: 'Tài xế Cư Dân Trần Minh Quân (Xe VF8 Sang Trọng)',
    providerPhone: '0868.999.234',
    providerZalo: 'https://zalo.me/0868999234',
    address: 'S3.03 Vinhomes Smart City',
    priceDisplay: 'Nội Bài giá trọn gói 250.000đ',
    rating: 5.0,
    reviewCount: 95,
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'VẬN TẢI NGOẠI KHU 24/7: Phục vụ cư dân đưa đón Sân bay Nội Bài, tiện chuyến đi tỉnh Quảng Ninh, Hải Phòng, Nam Định, Ninh Bình, Thanh Hóa. Xe điện VF8 êm ái, lịch sự, đúng giờ.',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-07-18',
    kycStatus: 'verified',
    kycBadgeType: 'blue_verified'
  },
  {
    id: 'srv-giat-la-04',
    title: 'Tiệm Giặt Sấy Công Nghiệp & Giặt Rèm / Sofa Cao Cấp Ocean Park 3',
    categoryId: 'dich-vu-gia-dinh-giat-la',
    subCategory: 'Giặt sấy công nghiệp & Giặt rèm',
    project: 'ocean-park-3',
    subdivision: 'Phân khu Thời Đại 3',
    providerName: 'Cửa Hàng Giặt Sấy Chợ Cư Dân 24/7',
    providerPhone: '0912.888.777',
    providerZalo: 'https://zalo.me/0912888777',
    address: 'Thời Đại 3-45, Vinhomes Ocean Park 3',
    priceDisplay: 'Từ 15.000đ/kg (Giao nhận tận cửa)',
    rating: 4.8,
    reviewCount: 64,
    images: [
      'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Giặt sấy quần áo lấy ngay trong 2 giờ, giặt rèm cửa, đệm cao su, sofa tại nhà. Sử dụng nước giặt hữu cơ lưu hương nhập khẩu, không hư hại vải.',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-07-22',
    kycStatus: 'verified',
    kycBadgeType: 'blue_verified'
  },
  {
    id: 'srv-spa-06',
    title: 'Mamaterra Spa & Gội Đầu Dưỡng Sinh Đông Y Thảo Dược',
    categoryId: 'spa-lam-dep-suc-khoe',
    subCategory: 'Spa Dưỡng sinh & Gội đầu thảo dược',
    project: 'ocean-park-2',
    subdivision: 'Cọ Xanh 12',
    providerName: 'Chủ Spa: Nguyễn Thu Hà (Cư dân Cọ Xanh)',
    providerPhone: '0989.445.667',
    providerZalo: 'https://zalo.me/0989445667',
    address: 'Cọ Xanh 12-88, Vinhomes Ocean Park 2',
    priceDisplay: 'Combo gội dưỡng sinh từ 99.000đ',
    rating: 5.0,
    reviewCount: 88,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dịch vụ gội đầu dưỡng sinh canh thuốc Bắc, massage cổ vai gáy giảm căng thẳng, chăm sóc da mặt chuyên sâu. Giảm 20% cho cư dân đăng ký trước!',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-07-28',
    kycStatus: 'verified',
    kycBadgeType: 'gold_certified'
  },
  {
    id: 'srv-homestay-07',
    title: 'Ocean Luxury Homestay 2PN View Biển Hồ Bốn Mùa Chợ Cư Dân',
    categoryId: 'homestay-luu-tru',
    subCategory: 'Homestay theo giờ / Theo ngày',
    project: 'ocean-park-3',
    subdivision: 'Vịnh Thiên Đường',
    providerName: 'Chủ Căn Hộ: Vũ Hoàng Nam',
    providerPhone: '0987.555.222',
    providerZalo: 'https://zalo.me/0987555222',
    address: 'Phân khu Vịnh Thiên Đường, Vinhomes Ocean Park 3',
    priceDisplay: 'Thuê theo giờ 200k/2h - Theo ngày 650k/đêm',
    rating: 4.9,
    reviewCount: 150,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Homestay thiết kế phong cách Santorini hiện đại, đầy đủ bếp nấu, chiếu phim Netflix 4K, view công viên nước và biển hồ bơi 4 mùa. Tự do check-in 24/7.',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-07-29',
    kycStatus: 'verified',
    kycBadgeType: 'blue_verified'
  },
  {
    id: 'srv-noi-that-08',
    title: 'Thi Công Nội Thất Gỗ An Cường Trọn Gói - Cải Tạo Shophouse & Biệt Thự Vin',
    categoryId: 'thang-may-sua-nha',
    subCategory: '🛋️ Thiết Kế & Thi Công Nội Thất Trọn Gói (Gỗ An Cường)',
    project: 'ha-long-xanh',
    subdivision: 'Toàn dự án Hạ Long Xanh & Quảng Ninh',
    providerName: 'Xưởng Nội Thất Cư Dân Kiến Trúc Việt',
    providerPhone: '0977.555.888',
    providerZalo: 'https://zalo.me/0977555888',
    address: 'Khu Đô Thị Hạ Long Xanh, Quảng Ninh',
    priceDisplay: 'Miễn phí 100% bản vẽ thiết kế 3D',
    rating: 5.0,
    reviewCount: 35,
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Xưởng sản xuất trực tiếp nội thất gỗ An Cường, cải tạo biệt thự, shophouse thương mại, vách thạch cao, sơn bả trọn gói bảo hành 5 năm.',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-07-30',
    kycStatus: 'verified',
    kycBadgeType: 'blue_verified'
  },
  {
    id: 'srv-xay-lap-09',
    title: 'Thi Công Xây Lắp & Cải Tạo Xây Dựng Biệt Thự / Shophouse Vinhomes',
    categoryId: 'thang-may-sua-nha',
    subCategory: '🏗️ Thi Công Xây Lắp, Cải Tạo Biệt Thự & Shophouse',
    project: 'ocean-park-2',
    subdivision: 'Phân khu Sao Biển & San Hô',
    providerName: 'Công Ty CP Xây Dựng & Tổng Thầu VinCons',
    providerPhone: '0938.222.333',
    providerZalo: 'https://zalo.me/0938222333',
    address: 'Sao Biển 1-89, Vinhomes Ocean Park 2',
    priceDisplay: 'Khảo sát & Lập dự toán miễn phí tận nơi',
    rating: 5.0,
    reviewCount: 68,
    images: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Tổng thầu thi công xây lắp trọn gói: Đập phá mở rộng không gian, đổ sàn bê tông, xây tường, trát sơn, thi công chống thấm hố thang máy, hoàn thiện kiến trúc & kết cấu biệt thự, shophouse cam kết bảo hành kết cấu 10 năm.',
    verified: true,
    legalCommitmentAccepted: true,
    createdAt: '2026-08-01',
    kycStatus: 'verified',
    kycBadgeType: 'blue_verified'
  }
];

