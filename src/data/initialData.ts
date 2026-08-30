import { Property, Project, NewsArticle, AdBanner, MarketVideo } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'ocean-park-2',
    name: 'Vinhomes Ocean Park 2 - The Empire',
    location: 'Huyện Văn Giang, Tỉnh Hưng Yên (Nút giao Cổ Linh & Vành đai 3.5)',
    areaSize: '458 ha',
    totalUnits: '12.841 căn thấp tầng & 24 tòa căn hộ cao tầng',
    priceRange: '3.5 tỷ - 45 tỷ VNĐ',
    status: 'Đã hoàn thiện & Bàn giao nhận nhà ngay',
    description: 'Tên thương mại: Vinhomes Ocean Park 2 - The Empire (Tên thường gọi: Vin Ocean Park 2, Ocean City Hưng Yên). Siêu quần thể đô thị biển hàng đầu miền Bắc sở hữu Tổ hợp công viên sóng nhân tạo Royal Wave Park 18 ha & Mega Grand World Hà Nội.',
    image: '',
    masterplanUrl: '',
    subdivisions: ['Chà Là', 'Cọ Xanh', 'San Hô', 'Hải Tăng', 'Sao Biển', 'Đảo Ngọc', 'Chợ Đêm Grand World'],
    amenities: ['Công viên sóng Royal Wave Park 18ha', 'Quảng trường Kinh đô Ánh sáng', 'Bệnh viện Vinmec Health Resort 5 sao', 'Trung tâm thương mại Vincom Mega Mall', 'Hệ thống liên cấp Vinschool', 'Xe buýt VinBus nội khu 24/7']
  },
  {
    id: 'ocean-park-3',
    name: 'Vinhomes Ocean Park 3 - Grand Park',
    location: 'Huyện Văn Giang & Văn Lâm, Tỉnh Hưng Yên',
    areaSize: '294 ha',
    totalUnits: '8.458 căn thấp tầng & các phân khu cao tầng',
    priceRange: '4.2 tỷ - 38 tỷ VNĐ',
    status: 'Đang bàn giao & Hoàn thiện nội thất',
    description: 'Tên thương mại: Vinhomes Ocean Park 3 - Grand Park (Tên thường gọi: Vin Ocean Park 3, Vịnh biển thiên đường Hưng Yên). Mảnh ghép hoàn hảo của Siêu quần thể 1.200ha với Vịnh biển Paradise Bay 12 ha và công viên nước Aqua Bay độc đáo.',
    image: '',
    masterplanUrl: '',
    subdivisions: ['Phố Biển', 'Vịnh Thiên Đường', 'Ánh Dương', 'Thời Đại', 'Vịnh Tây', 'Vịnh Hải Tăng'],
    amenities: ['Vịnh biển Paradise Bay 12ha', 'Hồ bơi bốn mùa Tropical Surf', 'Công viên Aqua Bay với cầu trượt cảm giác mạnh', 'Khu phố thương mại sầm uất Grand World', 'Sân thể thao đa năng & Gym outdoor']
  },
  {
    id: 'ocean-park-1',
    name: 'Vinhomes Ocean Park 1 - Gia Lâm',
    location: 'Huyện Gia Lâm, Thủ đô Hà Nội',
    areaSize: '420 ha',
    totalUnits: '66 tòa chung cư cao tầng & 2.300 căn thấp tầng',
    priceRange: '1.2 tỷ - 32 tỷ VNĐ',
    status: 'Đã hoàn thiện & Cư dân về ở 95%',
    description: 'Tên thương mại: Vinhomes Ocean Park 1 (Tên thường gọi: Vin Ocean Park 1, Thành phố Biển hồ Singapore). Biển hồ nước mặn Crystal Lagoon 6.1ha & Hồ Ngọc Trai 24.5ha trải cát trắng mịn tạo không gian nghỉ dưỡng ngay trong lòng Thủ đô.',
    image: '',
    masterplanUrl: '',
    subdivisions: ['Sapphire 1 & 2', 'Zen Park', 'Masteri Waterfront', 'Ngọc Trai', 'San Hô', 'Hải Tăng', 'Sao Biển'],
    amenities: ['Biển hồ nước mặn Crystal Lagoon 6.1ha', 'Hồ nước ngọt Ngọc Trai 24.5ha', 'Trường Đại học VinUni', 'Vincom Mega Mall Gia Lâm', 'Tuyến xe điện VinBus kết nối Hà Nội']
  },
  {
    id: 'ha-long-xanh',
    name: 'Vinhomes Hạ Long Xanh (Quảng Ninh)',
    location: 'Thị xã Quảng Yên & TP. Hạ Long, Tỉnh Quảng Ninh (Nối cao tốc Hà Nội - Hải Phòng - Hạ Long)',
    areaSize: '4.110 ha',
    totalUnits: 'Khu phức hợp Đô thị, Biệt thự biển, Shophouse & Căn hộ cao cấp',
    priceRange: 'Đang cập nhật đợt 1',
    status: 'Đang triển khai hạ tầng & quy hoạch tổng thể 10 tỷ USD',
    description: 'Tên thương mại chính thức: Vinhomes Hạ Long Xanh (Khu đô thị phức hợp Hạ Long Xanh) - Tên thường gọi: Vin Hạ Long Xanh, Siêu đô thị Hạ Long Xanh. Dự án đại đô thị sinh thái ven biển lớn nhất Quảng Ninh với bến du thuyền 5 sao & sân Golf 36 hố.',
    image: '',
    masterplanUrl: '',
    subdivisions: ['Phân khu Hoàng Tân', 'Phân khu Hà An', 'Phân khu Bến du thuyền Đảo', 'Phân khu Sân Golf 36 hố PGA', 'Phân khu Căn hộ sinh thái cao tầng'],
    amenities: ['Sân Golf 36 hố tiêu chuẩn PGA', 'Bến du thuyền quốc tế 5 sao', 'Công viên giải trí VinWonders Hạ Long Xanh', 'Trung tâm tài chính - thương mại quốc tế Vincom', 'Bệnh viện Vinmec Medical Resort']
  },
  {
    id: 'green-paradise-can-gio',
    name: 'Vinhomes Green Paradise Cần Giờ',
    location: 'Xã Long Hòa & TT. Cần Thạnh, Huyện Cần Giờ, TP. Hồ Chí Minh',
    areaSize: '2.870 ha',
    totalUnits: 'Khu lấn biển sinh thái, Biệt thự biển, Shophouse & Tháp tài chính 108 tầng',
    priceRange: 'Dự kiến công bố đợt 1',
    status: 'Đang san lấp & hoàn thiện hạ tầng kỹ thuật',
    description: 'Tên thương mại chính thức: Vinhomes Green Paradise Cần Giờ (Vinhomes Long Beach Cần Giờ) - Tên thường gọi: Vin Cần Giờ, Đô thị lấn biển Cần Giờ. Siêu đô thị lấn biển duy nhất tại TP.HCM với tổng vốn hơn 10 tỷ USD sở hữu Biển hồ nhân tạo Lagoon 400ha.',
    image: '',
    masterplanUrl: '',
    subdivisions: ['Phân khu A (Sinh thái nghỉ dưỡng)', 'Phân khu B (Thương mại & VinWonders)', 'Phân khu C (Trung tâm Tài chính 108 tầng & Bến du thuyền)', 'Phân khu D (Khu du lịch cao cấp)', 'Phân khu E (Đô thị Biển thông minh)'],
    amenities: ['Biển hồ lấn biển Lagoon 400ha', 'Tháp tài chính biểu tượng 108 tầng', 'Bến du thuyền siêu sang 6 sao', 'Sân Golf 36 hố tiêu chuẩn quốc tế', 'Công viên Safari Cần Giờ', 'TTTM Vincom Mega Mall Cần Giờ']
  },
  {
    id: 'tan-my-hau-nghia',
    name: 'Vinhomes Tân Mỹ - Hậu Nghĩa (Long An)',
    location: 'Thị trấn Hậu Nghĩa, Xã Tân Mỹ & Đức Lập Cầu, Huyện Đức Hòa, Tỉnh Long An',
    areaSize: '197.2 ha',
    totalUnits: '4.500 căn biệt thự, nhà phố shophouse & 5 tòa căn hộ cao tầng',
    priceRange: 'Dự kiến 3.8 tỷ - 18 tỷ VNĐ',
    status: 'Đang giải phóng mặt bằng & thi công hạ tầng',
    description: 'Tên thương mại chính thức: Vinhomes Tân Mỹ - Hậu Nghĩa (Vinhomes Hậu Nghĩa Đức Hòa) - Tên thường gọi: Vin Hậu Nghĩa, Vin Đức Hòa, Vinhomes Long An. Dự án đô thị kiểu mẫu cửa ngõ Tây Bắc TP.HCM kết nối trực tiếp Vành Đai 3, Vành Đai 4.',
    image: '',
    masterplanUrl: '',
    subdivisions: ['Phân khu Biệt thự Sinh thái', 'Phân khu Nhà phố thương mại Shophouse', 'Phân khu Căn hộ cao tầng Hậu Nghĩa', 'Phân khu Công viên trung tâm'],
    amenities: ['Công viên hồ điều hòa trung tâm 15ha', 'Trung tâm thương mại Vincom Plaza Hậu Nghĩa', 'Trường học liên cấp Vinschool', 'Bệnh viện đa khoa Vinmec Hậu Nghĩa', 'Khu thể thao phức hợp & Hồ bơi Olympic']
  },
  {
    id: 'green-city-hoc-mon',
    name: 'Vinhomes Green City Hóc Môn',
    location: 'Xã Tân Thới Nhì, Huyện Hóc Môn, TP. Hồ Chí Minh (Mặt tiền Quốc Lộ 22 & Vành Đai 3)',
    areaSize: '924 ha',
    totalUnits: 'Biệt thự, Shophouse, Nhà phố & Khu Làng Đại học Quốc tế',
    priceRange: 'Đang cập nhật quy hoạch',
    status: 'Đang triển khai quy hoạch phân khu 1/500',
    description: 'Tên thương mại chính thức: Vinhomes Green City Hóc Môn (Khu đô thị Đại học Quốc tế Hóc Môn do Vingroup đầu tư) - Tên thường gọi: Vin Hóc Môn, Đô thị sinh thái Hóc Môn. Siêu dự án phía Tây Bắc TP.HCM sở hữu Làng Đại học VinUni cơ sở 2.',
    image: '',
    masterplanUrl: '',
    subdivisions: ['Phân khu Đô thị Sinh thái', 'Phân khu Làng Đại học Quốc tế', 'Phân khu Trung tâm Tài chính & Công nghệ cao', 'Phân khu Biệt thự & Nhà phố'],
    amenities: ['Công viên trung tâm Hóc Môn 50ha', 'Trường Đại học Quốc tế VinUni cơ sở 2', 'Bệnh viện quốc tế Vinmec Hóc Môn', 'TTTM Vincom Mega Mall', 'Hồ sinh thái cảnh quan & Khu công nghệ cao']
  },
  {
    id: 'lang-van-da-nang',
    name: 'Vinhomes Làng Vân Đà Nẵng',
    location: 'Phường Hòa Hiệp Bắc, Quận Liên Chiểu, TP. Đà Nẵng (Chân đèo Hải Vân)',
    areaSize: '1.000 ha',
    totalUnits: 'Biệt thự biển đồi, Condotel cao cấp & Resort 6 sao Vinpearl',
    priceRange: 'Dự kiến công bố đợt 1',
    status: 'Đang thi công hạ tầng giao thông & bến du thuyền',
    description: 'Tên thương mại chính thức: Vinhomes Làng Vân Đà Nẵng (Khu du lịch sinh thái nghỉ dưỡng Làng Vân) - Tên thường gọi: Vin Làng Vân, Siêu nghỉ dưỡng Làng Vân Đà Nẵng. Kỳ quan nghỉ dưỡng tọa sơn hướng thủy lớn nhất miền Trung gần Cảng nước sâu Liên Chiểu.',
    image: '',
    masterplanUrl: '',
    subdivisions: ['Phân khu Biệt thự biển Đồi Hải Vân', 'Phân khu Căn hộ Condotel cao cấp', 'Phân khu Resort 6 sao Vinpearl Làng Vân', 'Phân khu Tổ hợp Giải trí & Casino'],
    amenities: ['Tổ hợp Khách sạn & Resort 6 sao Vinpearl', 'Bến du thuyền quốc tế Liên Chiểu', 'Sân Golf 18 hố ven biển', 'Tuyến Cáp treo Làng Vân', 'Công viên giải trí VinWonders Làng Vân', 'Casino & Trung tâm hội nghị quốc tế']
  },
  {
    id: 'smart-city',
    name: 'Vinhomes Smart City - Tây Mỗ',
    location: 'Phường Tây Mỗ & Đại Mỗ, Q. Nam Từ Liêm, Hà Nội',
    areaSize: '280 ha',
    totalUnits: '58 tòa chung cư cao tầng & biệt thự thương mại',
    priceRange: '1.5 tỷ - 25 tỷ VNĐ',
    status: 'Đã hoàn thiện & Cư dân đông đúc',
    description: 'Thành phố thông minh quốc tế tích hợp hệ sinh thái AI - IoT vận hành hiện đại hàng đầu Thủ đô, liền kề Đại lộ Thăng Long và tuyến Metro số 5, 6, 7.',
    image: '',
    masterplanUrl: '',
    subdivisions: ['Sapphire Parkville', 'Tonkin', 'Masteri West Heights', 'Imperia Smart City', 'The Canopy'],
    amenities: ['Bộ 3 công viên liên hoàn 16.3ha', 'Vườn Nhật Zen Park lớn nhất Việt Nam', 'TTTM Vincom Mega Mall Smart City', 'Bệnh viện Vinmec']
  }
];

export const INITIAL_ADS: AdBanner[] = [
  {
    id: 'ad-01',
    title: 'Đăng Bán & Cho Thuê BĐS Vinhomes Ocean Park 2,3 Miễn Phí Trên Chợ Cư Dân',
    imageUrl: '',
    linkUrl: '/post-property',
    position: 'header_top',
    active: true,
    clickCount: 1420,
    createdAt: '2026-07-20'
  },
  {
    id: 'ad-02',
    title: 'Gói Vay Vốn Ngân Hàng Ưu Đãi Lãi Suất 0% Trong 24 Tháng Tại Vinhomes',
    imageUrl: '',
    linkUrl: '/mortgage-calculator',
    position: 'home_sidebar',
    active: true,
    clickCount: 890,
    createdAt: '2026-07-22'
  },
  {
    id: 'ad-03',
    title: 'Quỹ Căn Cắt Lỗ Sâu Shophouse Chà Là & San Hô - Xem Bảng Hàng Mới Nhất',
    imageUrl: '',
    linkUrl: '/properties',
    position: 'home_middle',
    active: true,
    clickCount: 2310,
    createdAt: '2026-07-24'
  },
  {
    id: 'ad-04',
    title: '⚡ BẤM XEM NGAY: Quỹ Căn Biệt Thự - Shophouse Đã Có Sổ Đỏ Lâu Dài',
    imageUrl: '',
    linkUrl: '/properties',
    position: 'float_right_pc',
    widthSize: 'medium',
    displayStyle: 'glowing_border',
    badgeText: 'HOT BÁM ĐUỔI',
    active: false,
    clickCount: 520,
    createdAt: '2026-07-25'
  },
  {
    id: 'ad-05',
    title: '🚕 Dịch Vụ Taxi & Chuyển Nhà Cư Dân Vinhomes 24/7',
    imageUrl: '',
    linkUrl: '/resident-services',
    position: 'float_left_pc',
    active: false,
    clickCount: 380,
    createdAt: '2026-07-26'
  }
];

export const INITIAL_VIDEOS: MarketVideo[] = [
  {
    id: 'vid-01',
    title: 'Phân Tích Dòng Tiền & Tiềm Năng Tăng Giá Vinhomes Ocean Park 2, 3 Năm 2026',
    description: 'Chuyên viên Nhà đẹp Vinhomes phân tích chi tiết thực tế các phân khu Chà Là, San Hô, Phố Biển và lộ trình bàn giao, kinh doanh khai thác dòng tiền hiệu quả nhất.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: '',
    project: 'ocean-park-2',
    category: 'nhan-dinh',
    views: 0,
    publishedAt: '2026-07-20',
    featured: true
  },
  {
    id: 'vid-02',
    title: 'Thực Tế Quy Hoạch Siêu Dự Án Vinhomes Hạ Long Xanh 4.110 ha Quảng Ninh',
    description: 'Ghi hình thực địa mặt bằng, tiến độ hạ tầng và hạ tầng giao thông kết nối cửa ngõ Vịnh Hạ Long của Vinhomes Hạ Long Xanh.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: '',
    project: 'ha-long-xanh',
    category: 'thuc-te',
    views: 0,
    publishedAt: '2026-07-22',
    featured: true
  },
  {
    id: 'vid-03',
    title: 'So Sánh Biệt Thự Đảo Vinhomes Royal Island Vũ Yên Hải Phòng & Ocean Park 3',
    description: 'Đánh giá các tiêu chí nghỉ dưỡng, bến du thuyền cá nhân và bài toán đầu tư BĐS dòng tiền cho nhà đầu tư cá nhân.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: '',
    project: 'royal-island',
    category: 'dong-tien',
    views: 0,
    publishedAt: '2026-07-24',
    featured: false
  }
];


export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-101',
    title: 'Bán gấp Shophouse Chà Là Vinhomes Ocean Park 2 - Mặt tiền kinh doanh sầm uất',
    type: 'sale',
    project: 'ocean-park-2',
    category: 'shophouse',
    price: 7.8, // 7.8 Tỷ
    priceDisplay: '7.8 Tỷ',
    area: 70,
    bedrooms: 4,
    bathrooms: 4,
    direction: 'Đông Nam',
    furniture: 'raw',
    legal: 'so-do',
    address: 'Phân khu Chà Là, Vinhomes Ocean Park 2, Hưng Yên',
    description: 'Căn Shophouse Chà Là vị trí cực kỳ đắc địa, ngay gần cổng vào dự án và cụm trường học Vinschool. Mặt tiền 5m, xây dựng 4.5 tầng, diện tích sàn 285m2. Rất thích hợp vừa ở vừa kinh doanh nhà thuốc, cà phê, spa hoặc văn phòng đại diện.',
    images: [],
    featured: true,
    status: 'approved',
    createdAt: '2026-07-20',
    sellerName: 'Chủ nhà Hoàng Minh',
    sellerPhone: '0988.765.432',
    sellerRole: 'owner',
    subdivision: 'Chà Là'
  },
  {
    id: 'prop-102',
    title: 'Biệt thự Song Lập San Hô Ocean Park 2 - View sát Biển hồ nhân tạo Royal Wave Park',
    type: 'sale',
    project: 'ocean-park-2',
    category: 'biet-thu-song-lap',
    price: 18.5, // 18.5 Tỷ
    priceDisplay: '18.5 Tỷ',
    area: 136,
    bedrooms: 5,
    bathrooms: 5,
    direction: 'Nam',
    furniture: 'full',
    legal: 'so-do',
    address: 'Phân khu San Hô, Vinhomes Ocean Park 2',
    description: 'Siêu phẩm Biệt thự Song Lập San Hô hoàn thiện nội thất siêu cao cấp xa xỉ. Đường trước nhà 13m thoáng mát, cách biển hồ Wave Park chỉ 80m. Chủ nhà chuyển công tác nước ngoài cần nhượng lại giá tốt cho người thiện chí.',
    images: [],
    featured: true,
    status: 'approved',
    createdAt: '2026-07-22',
    sellerName: 'Chủ nhà Lê Tuấn',
    sellerPhone: '0903.112.233',
    sellerRole: 'owner',
    subdivision: 'San Hô'
  },
  {
    id: 'prop-103',
    title: 'Cho thuê Căn hộ 2PN2WC Vinhomes Ocean Park 2 - Đầy đủ nội thất cao cấp',
    type: 'rent',
    project: 'ocean-park-2',
    category: '2pn',
    price: 9.5, // 9.5 Triệu/tháng
    priceDisplay: '9.5 Tr/tháng',
    area: 68,
    bedrooms: 2,
    bathrooms: 2,
    direction: 'Đông Bắc',
    floor: 'Tầng 12',
    furniture: 'full',
    legal: 'hop-dong-mua-ban',
    address: 'Tòa Masteri / Căn hộ OCP2, Hưng Yên',
    description: 'Căn hộ 2 phòng ngủ thiết kế hiện đại, đầy đủ thiết bị điện tử, sofa, giường tủ, điều hòa âm trần. Chỉ việc xách vali vào ở. Ban công view trực diện công viên nội khu rợp bóng cây xanh.',
    images: [],
    featured: true,
    status: 'approved',
    createdAt: '2026-07-24',
    sellerName: 'Sale Nguyễn Văn A',
    sellerPhone: '0912.345.678',
    sellerRole: 'sale',
    subdivision: 'Phân khu Cao Tầng'
  },
  {
    id: 'prop-104',
    title: 'Bán Nhà Liền Kề Phố Biển Vinhomes Ocean Park 3 - Nhận nhà ở ngay',
    type: 'sale',
    project: 'ocean-park-3',
    category: 'lien-ke',
    price: 8.2, // 8.2 Tỷ
    priceDisplay: '8.2 Tỷ',
    area: 80,
    bedrooms: 4,
    bathrooms: 4,
    direction: 'Tây Nam',
    furniture: 'basic',
    legal: 'so-do',
    address: 'Phân khu Phố Biển, Vinhomes Ocean Park 3',
    description: 'Căn liền kề Phố Biển OCP3 thiết kế 5 tầng tinh tế, mặt tiền 5m. Đi bộ 3 phút ra Vịnh biển Paradise Bay 12ha. Giá cắt lỗ cực hời so với hợp đồng chủ đầu tư.',
    images: [],
    featured: true,
    status: 'approved',
    createdAt: '2026-07-23',
    sellerName: 'Chủ nhà Phạm Đức',
    sellerPhone: '0974.556.677',
    sellerRole: 'owner',
    subdivision: 'Phố Biển'
  },
  {
    id: 'prop-105',
    title: 'Cho thuê Căn Studio Vinhomes Ocean Park 3 - Nội thất mới 100%, vào ở ngay',
    type: 'rent',
    project: 'ocean-park-3',
    category: 'studio',
    price: 5.5, // 5.5 Tr/tháng
    priceDisplay: '5.5 Tr/tháng',
    area: 32,
    bedrooms: 1,
    bathrooms: 1,
    direction: 'Đông',
    floor: 'Tầng 8',
    furniture: 'full',
    legal: 'hop-dong-mua-ban',
    address: 'Tòa Căn hộ Thời Đại, Vinhomes Ocean Park 3',
    description: 'Căn hộ Studio cực kỳ xinh xắn thích hợp người đi làm hoặc vợ chồng trẻ. Nội thất đồng bộ phong cách Scandinavian ấm cúng. Giá thuê đã bao gồm phí quản lý 1 năm.',
    images: [],
    featured: false,
    status: 'approved',
    createdAt: '2026-07-25',
    sellerName: 'Chủ nhà Trần Thị B',
    sellerPhone: '0977.123.456',
    sellerRole: 'owner',
    subdivision: 'Thời Đại'
  },
  {
    id: 'prop-106',
    title: 'Suất Ngoại Giao Biệt Thự Đảo Đơn Lập Hạ Long Xanh - View Vịnh Biển Tuyệt Đẹp',
    type: 'sale',
    project: 'ha-long-xanh',
    category: 'biet-thu-don-lap',
    price: 32.0, // 32 Tỷ
    priceDisplay: '32 Tỷ',
    area: 350,
    bedrooms: 5,
    bathrooms: 6,
    direction: 'Đông Nam',
    furniture: 'raw',
    legal: 'dang-cho-so',
    address: 'Phân khu Đảo Sinh Thái, Siêu dự án Vinhomes Hạ Long Xanh',
    description: 'Suất biệt thự đơn lập VIP bậc nhất dự án Hạ Long Xanh. Sở hữu 3 mặt giáp biển & bến du thuyền riêng. Tiềm năng tăng giá X2, X3 trong 3 năm tới khi hạ tầng hoàn thiện.',
    images: [],
    featured: true,
    status: 'approved',
    createdAt: '2026-07-25',
    sellerName: 'Chủ đầu tư / Suất ngoại giao',
    sellerPhone: '0936.889.900',
    sellerRole: 'owner',
    subdivision: 'Đảo Sinh Thái'
  },
  {
    id: 'prop-107',
    title: 'Cho thuê Thuê Tầng 1 Shophouse Chà Là Ocean Park 2 - Mặt bằng kinh doanh 80m2',
    type: 'rent',
    project: 'ocean-park-2',
    category: 'thue-tang',
    price: 15.0, // 15 Tr/tháng
    priceDisplay: '15 Tr/tháng',
    area: 80,
    bedrooms: 1,
    bathrooms: 2,
    direction: 'Đông Nam',
    floor: 'Tầng 1 + Lửng',
    furniture: 'basic',
    legal: 'so-do',
    address: 'Phân khu Chà Là, Vinhomes Ocean Park 2',
    description: 'Mặt bằng kinh doanh tầng 1 shophouse thông sàn 80m2, lối đi riêng độc lập. Vị trí góc 2 mặt tiền sầm uất, đỗ xe ô tô thoải mái. Rất thích hợp mở siêu thị mini, tiệm bánh, phòng khám, văn phòng chuyển phát.',
    images: [],
    featured: true,
    status: 'approved',
    createdAt: '2026-07-26',
    sellerName: 'Chủ nhà Đặng Văn Hùng',
    sellerPhone: '0966.332.111',
    sellerRole: 'owner',
    subdivision: 'Chà Là'
  },
  {
    id: 'prop-108',
    title: 'Cho thuê Căn Hộ 1PN+1 Vinhomes Ocean Park 1 - Full đồ decor cực đẹp',
    type: 'rent',
    project: 'ocean-park-1',
    category: '1pn',
    price: 7.0, // 7 Tr/tháng
    priceDisplay: '7 Tr/tháng',
    area: 48,
    bedrooms: 1,
    bathrooms: 1,
    direction: 'Tây Nam',
    floor: 'Tầng 15',
    furniture: 'full',
    legal: 'hop-dong-mua-ban',
    address: 'Tòa S2.18, Vinhomes Ocean Park 1 (Gia Lâm)',
    description: 'Căn hộ 1 phòng ngủ cộng 1 thiết kế đa năng, full đồ xịn sò chỉ việc vào ở. Tòa ngay cạnh biển hồ nước ngọt 24.5ha, miễn phí bể bơi nội khu.',
    images: [],
    featured: false,
    status: 'approved',
    createdAt: '2026-07-27',
    sellerName: 'Chủ nhà Lê Minh C',
    sellerPhone: '0988.777.666',
    sellerRole: 'owner',
    subdivision: 'Sapphire 2'
  }
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-ha-long-xanh',
    title: 'Tổng Quan Vinhomes Hạ Long Xanh Quảng Ninh: Tên Thương Mại, Quy Mô 4.110ha & Tiện Ích Đỉnh Cao',
    summary: 'Bài viết chuẩn SEO giới thiệu chi tiết siêu dự án Vinhomes Hạ Long Xanh tại Quảng Yên & Hạ Long. Phân tích các phân khu, diện tích, bến du thuyền 5 sao và cơ hội đầu tư dòng tiền.',
    content: `
      ## 1. Tên Thương Mại & Tên Thường Gọi
      - **Tên thương mại chính thức:** Vinhomes Hạ Long Xanh (Khu đô thị phức hợp Hạ Long Xanh)
      - **Tên thường gọi:** Vin Hạ Long Xanh, Vinhomes Quảng Ninh, Siêu dự án Hạ Long Xanh.
      - **Chủ đầu tư:** Tập đoàn Vingroup & Công ty Vinhomes.
      - **Vị trí địa lý:** Nằm tại Thị xã Quảng Yên và TP. Hạ Long, Tỉnh Quảng Ninh (ngay nút giao cao tốc Hà Nội - Hải Phòng - Hạ Long).

      ## 2. Quy Mô & Các Phân Khu Chi Tiết
      Siêu dự án sở hữu tổng diện tích quy hoạch lên tới **4.110 ha** với vốn đầu tư ước tính hơn 10 tỷ USD:
      - **Phân khu Hoàng Tân:** Đô thị sinh thái biển nghỉ dưỡng cao cấp kết hợp biệt thự ven biển.
      - **Phân khu Hà An:** Trung tâm tài chính, thương mại dịch vụ sầm uất và khu công nghệ cao.
      - **Phân khu Bến Du Thuyền Đảo:** Biệt thự đảo VIP sở hữu bến đậu du thuyền riêng.
      - **Phân khu Sân Golf 36 hố:** Sân Golf tiêu chuẩn quốc tế PGA hàng đầu miền Bắc.
      - **Phân khu Căn hộ cao tầng:** Tòa tháp chung cư sinh thái view ôm trọn Vịnh Hạ Long.

      ## 3. Hệ Thống Tiện Ích Nội Khu Đẳng Cấp
      - **Sân Golf 36 hố PGA** thu hút các golfer quốc tế.
      - **Bến du thuyền 5 sao** dành riêng cho giới thượng lưu.
      - **Công viên giải trí VinWonders Hạ Long Xanh** quy mô hàng chục hecta.
      - **Trung tâm thương mại Vincom Mega Mall**, Bệnh viện **Vinmec Medical Resort** và Trường học liên cấp **Vinschool**.

      ## 4. Lợi Ích & Tiềm Năng Đầu Tư BĐS
      Vinhomes Hạ Long Xanh nằm tại tam giác kinh tế bứt phá Hà Nội - Hải Phòng - Quảng Ninh. Khi đi vào vận hành, đây sẽ là tâm điểm du lịch sinh thái nghỉ dưỡng quốc tế, mang lại giá trị gia tăng bất động sản đột phá X2, X3 cho nhà đầu tư tiên phong.
    `,
    category: 'vinhomes',
    author: 'Ban Quản Trị Chợ Cư Dân 24H',
    image: '',
    publishedAt: '2026-07-26',
    views: 0,
    source: 'manual',
    status: 'published'
  },
  {
    id: 'news-ocean-park',
    title: 'Phân Biệt Rõ Ràng Siêu Quần Thể Ocean City: Vinhomes Ocean Park 1, 2 và 3',
    summary: 'Phân tích chi tiết quy mô, vị trí, tiện ích điểm nhấn và quy hoạch các phân khu tại Vinhomes Ocean Park 1 (Gia Lâm), Ocean Park 2 (Văn Giang) và Ocean Park 3 (Hưng Yên).',
    content: `
      ## 1. Vinhomes Ocean Park 1 - Gia Lâm (Hà Nội)
      - **Tên thương mại:** Vinhomes Ocean Park 1 (Tên gọi: Vin Ocean Park 1, Thành phố Biển hồ).
      - **Quy mô:** 420 ha.
      - **Phân khu:** Sapphire, Zen Park, Masteri Waterfront, Ngọc Trai, San Hô, Sao Biển, Hải Tăng.
      - **Tiện ích nổi bật:** Biển hồ nước mặn Crystal Lagoon 6.1ha, Hồ Ngọc Trai 24.5ha, Đại học VinUni, Vincom Mega Mall Gia Lâm.

      ## 2. Vinhomes Ocean Park 2 - The Empire (Hưng Yên)
      - **Tên thương mại:** Vinhomes Ocean Park 2 - The Empire (Tên gọi: Vin Ocean Park 2, The Empire).
      - **Quy mô:** 458 ha.
      - **Phân khu:** Chà Là, Cọ Xanh, San Hô, Hải Tăng, Sao Biển, Đảo Ngọc, Chợ Đêm Grand World.
      - **Tiện ích nổi bật:** Tổ hợp công viên sóng Royal Wave Park 18ha lớn nhất thế giới, Kinh đô Ánh sáng, Bệnh viện Vinmec Health Resort 5 sao.

      ## 3. Vinhomes Ocean Park 3 - Grand Park (Hưng Yên)
      - **Tên thương mại:** Vinhomes Ocean Park 3 - Grand Park (Tên gọi: Vin Ocean Park 3).
      - **Quy mô:** 294 ha.
      - **Phân khu:** Phố Biển, Vịnh Thiên Đường, Ánh Dương, Thời Đại, Vịnh Tây, Vịnh Hải Tăng.
      - **Tiện ích nổi bật:** Vịnh biển thiên đường Paradise Bay 12ha, công viên nước Aqua Bay, hồ bơi bốn mùa Tropical Surf.
    `,
    category: 'vinhomes',
    author: 'Ban Quản Trị Chợ Cư Dân 24H',
    image: '',
    publishedAt: '2026-07-26',
    views: 0,
    source: 'manual',
    status: 'published'
  },
  {
    id: 'news-green-paradise-can-gio',
    title: 'Siêu Dự Án Lấn Biển Vinhomes Green Paradise Cần Giờ: Biểu Tượng Mới Của TP.HCM',
    summary: 'Toàn bộ thông tin chính thức về Vinhomes Green Paradise Cần Giờ quy mô 2.870ha, tháp tài chính 108 tầng, lagoon 400ha và phân khu lấn biển triệu đô.',
    content: `
      ## 1. Tên Thương Mại & Vị Trí Lấn Biển
      - **Tên thương mại chính thức:** Vinhomes Green Paradise Cần Giờ (Vinhomes Long Beach Cần Giờ)
      - **Tên thường gọi:** Vin Cần Giờ, Vinhomes Cần Giờ, Đô thị lấn biển Cần Giờ.
      - **Vị trí:** Xã Long Hòa & Thị trấn Cần Thạnh, Huyện Cần Giờ, TP. Hồ Chí Minh.

      ## 2. Quy Mô & Các Phân Khu Mở Bán
      Tổng diện tích **2.870 ha** chia làm 5 phân khu chức năng:
      - **Phân khu A:** Khu du lịch nghỉ dưỡng sinh thái cao cấp.
      - **Phân khu B:** Khu thương mại dịch vụ, công viên chủ đề VinWonders & Safari Cần Giờ.
      - **Phân khu C:** Trung tâm Tài chính thương mại quốc tế với điểm nhấn **Tháp 108 tầng** & Bến du thuyền 6 sao.
      - **Phân khu D:** Khu nghỉ dưỡng sinh thái biệt thự biển xa xỉ.
      - **Phân khu E:** Khu biển hồ và đô thị thông minh hiện đại.

      ## 3. Tiện Ích Độc Bản & Tiềm Năng Tăng Giá
      Sở hữu Biển hồ lấn biển Lagoon rộng đến 400 ha, Sân Golf 36 hố, cầu Cần Giờ nối Nhà Bè. Dự án hưởng lợi tối đa khi Cần Giờ chính thức nâng cấp thành phố sinh thái trực thuộc TP.HCM.
    `,
    category: 'thi-truong',
    author: 'Ban Biên Tập Chợ Cư Dân 24H',
    image: '',
    publishedAt: '2026-07-26',
    views: 0,
    source: 'ai',
    status: 'published'
  },
  {
    id: 'news-tan-my-hau-nghia',
    title: 'Vinhomes Tân Mỹ - Hậu Nghĩa Long An: Tâm Điểm Đô Thị Mới Cửa Ngõ Tây Bắc TP.HCM',
    summary: 'Bài viết chuẩn SEO giới thiệu dự án Vinhomes Hậu Nghĩa Đức Hòa Long An quy mô 197.2ha, công viên hồ 15ha và kết nối Vành Đai 3, Vành Đai 4.',
    content: `
      ## 1. Tên Thương Mại & Tên Thường Gọi
      - **Tên thương mại chính thức:** Vinhomes Tân Mỹ - Hậu Nghĩa (Vinhomes Hậu Nghĩa Đức Hòa)
      - **Tên thường gọi:** Vin Hậu Nghĩa, Vin Đức Hòa, Vinhomes Long An.
      - **Vị trí:** Thị trấn Hậu Nghĩa, Xã Tân Mỹ & Đức Lập Cầu, Huyện Đức Hòa, Tỉnh Long An.

      ## 2. Quy Mô & Các Phân Khu Sản Phẩm
      Dự án có diện tích **197,2 ha** với hơn 4.500 căn biệt thự sinh thái, nhà phố shophouse và 5 tòa căn hộ cao tầng:
      - **Phân khu Biệt thự Sinh thái:** Không gian sống yên bình bên dòng kênh cảnh quan.
      - **Phân khu Shophouse Thương mại:** Mặt tiền các trục đường lớn sầm uất kinh doanh.
      - **Phân khu Căn hộ cao tầng:** Chung cư hiện đại đầy đủ tiện ích.

      ## 3. Tiện Ích & Hạ Tầng Kết Nối
      Công viên hồ điều hòa trung tâm 15ha, TTTM Vincom Plaza, Trường Vinschool, Bệnh viện Vinmec. Nằm kề bên Vành Đai 3, Vành Đai 4 và Cao tốc TP.HCM - Mộc Bài giúp di chuyển về Quận 1 chỉ 35 phút.
    `,
    category: 'thi-truong',
    author: 'Ban Quản Trị Chợ Cư Dân 24H',
    image: '',
    publishedAt: '2026-07-26',
    views: 0,
    source: 'manual',
    status: 'published'
  },
  {
    id: 'news-green-city-hoc-mon',
    title: 'Vinhomes Green City Hóc Môn: Đô Thị Sinh Thái & Làng Đại Học Quốc Tế 924ha',
    summary: 'Khám phá quy hoạch dự án Vinhomes Hóc Môn mặt tiền QL22 & Vành Đai 3, Làng Đại học VinUni 2 và tiềm năng tăng giá BĐS Hóc Môn.',
    content: `
      ## 1. Tên Thương Mại & Vị Trí
      - **Tên thương mại chính thức:** Vinhomes Green City Hóc Môn (Khu đô thị Đại học Quốc tế Hóc Môn)
      - **Tên thường gọi:** Vin Hóc Môn, Vinhomes Hóc Môn, Đô thị sinh thái Hóc Môn.
      - **Vị trí:** Xã Tân Thới Nhì, Huyện Hóc Môn, TP.HCM (Mặt tiền QL22 & Vành Đai 3).

      ## 2. Quy Mô 924ha & Phân Khu Chức Năng
      - **Phân khu Đô thị Sinh thái:** Biệt thự, nhà phố ven sông mát mẻ.
      - **Phân khu Làng Đại học Quốc tế:** Cơ sở 2 Đại học VinUni & tổ hợp nghiên cứu giáo dục.
      - **Phân khu Trung tâm Tài chính & Công nghệ:** Tòa văn phòng, trung tâm sáng tạo start-up.

      ## 3. Lợi Ích & Hạ Tầng Tương Lai
      Kết nối trực tiếp Vành Đai 3, Tuyến Metro số 2 kéo dài. Đóng vai trò là đô thị vệ tinh hiện đại hàng đầu phía Tây Bắc TP.HCM.
    `,
    category: 'thi-truong',
    author: 'Ban Biên Tập Chợ Cư Dân 24H',
    image: '',
    publishedAt: '2026-07-26',
    views: 0,
    source: 'ai',
    status: 'published'
  },
  {
    id: 'news-lang-van-da-nang',
    title: 'Vinhomes Làng Vân Đà Nẵng: Kỳ Quan Nghỉ Dưỡng 1.000ha Dưới Chân Đèo Hải Vân',
    summary: 'Giới thiệu dự án siêu sang Vinhomes Làng Vân Đà Nẵng với bến du thuyền 6 sao Liên Chiểu, Sân Golf 18 hố, Cáp treo Làng Vân và Resort Vinpearl.',
    content: `
      ## 1. Tên Thương Mại & Tọa Độ Độc Bản
      - **Tên thương mại chính thức:** Vinhomes Làng Vân Đà Nẵng (Khu du lịch sinh thái nghỉ dưỡng Làng Vân)
      - **Tên thường gọi:** Vin Làng Vân, Siêu nghỉ dưỡng Làng Vân Đà Nẵng.
      - **Vị trí:** Phường Hòa Hiệp Bắc, Quận Liên Chiểu, TP. Đà Nẵng (dưới chân đèo Hải Vân, hướng vịnh Nam Ô).

      ## 2. Quy Mô 1.000ha & Phân Khu Đột Phá
      - **Phân khu Biệt thự biển Đồi Hải Vân:** Biệt thự sườn đồi view biển panoramic 360 độ.
      - **Phân khu Căn hộ Condotel cao cấp:** Căn hộ khách sạn quản lý theo tiêu chuẩn 5 sao.
      - **Phân khu Resort 6 sao Vinpearl Làng Vân:** Khu nghỉ dưỡng khép kín đẳng cấp quốc tế.
      - **Phân khu Tổ hợp Casino & Giải trí:** Casino, trung tâm hội nghị quốc tế.

      ## 3. Tiện Ích Đỉnh Cao & Liên Kết Cảng Liên Chiểu
      Bến du thuyền quốc tế, Sân Golf 18 hố, Cáp treo Làng Vân, Công viên VinWonders. Liền kề Siêu cảng nước sâu Liên Chiểu giúp BĐS Làng Vân trở thành hàng hiếm thu hút dòng vốn toàn cầu.
    `,
    category: 'vinhomes',
    author: 'Ban Quản Trị Chợ Cư Dân 24H',
    image: '',
    publishedAt: '2026-07-26',
    views: 0,
    source: 'manual',
    status: 'published'
  }
];

export const HIEU_BUI_PROFILE = {
  name: 'Chợ Cư Dân 24h',
  title: 'Nền Tảng Trao Đổi Thông Tin Chuyển Nhượng, Cho Thuê & Kết Nối Cư Dân Vinhomes',
  tagline: 'Kết nối trực tiếp cư dân Vinhomes, trao đổi thông tin chính chủ chuyển nhượng & cho thuê, xóa bỏ rào cản bảo mật sale.',
  phone: '0868.499.929',
  phoneClean: '0868499929',
  phoneRole: 'Hotline Hỗ Trợ Đăng Tin & Vận Hành Nền Tảng',
  zaloUrl: 'https://zalo.me/0868499929',
  facebookUrl: 'https://facebook.com/chocudan24h',
  tiktokUrl: 'https://tiktok.com/@chocudan24h',
  youtubeUrl: 'https://youtube.com/@chocudan24h',
  email: 'hotro.chocudan24h@gmail.com',
  domain: 'chocudan24h.com',
  experienceYears: 'Nhiều năm',
  totalDeals: 'Liên tục cập nhật',
  clientSatisfaction: 'Đánh giá cao',
  bio: `Chào mừng Quý cư dân & Khách hàng đến với nền tảng thông tin chính thức Chợ Cư Dân 24h (chocudan24h.com). 
  Nền tảng là kênh trao đổi thông tin chuyển nhượng, cho thuê và kết nối trực tiếp cư dân Vinhomes toàn quốc — Giúp giao dịch minh bạch, nhanh chóng và bỏ qua mọi rào cản thông tin.
  
  Tất cả số điện thoại liên hệ trên hệ thống (Hotline: 0868.499.929) đóng vai trò hỗ trợ cư dân đăng tin, kiểm duyệt thông tin & vận hành hệ thống kỹ thuật của nền tảng.`,
  achievements: [
    'Hệ thống kết nối trực tiếp cư dân Vinhomes toàn quốc 24/7',
    'Hỗ trợ đăng tin mua bán, cho thuê chính chủ nhanh chóng & minh bạch',
    'Xóa bỏ rào cản thông tin, tối ưu trải nghiệm kết nối cư dân',
    'Hotline 0868.499.929 hỗ trợ kỹ thuật, đăng tin & vận hành chuyên trách'
  ]
};
