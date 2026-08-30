export interface SubdivisionSEOInfo {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  style: string;
  scaleArea: string;
  totalUnits: string;
  productTypes: string[];
  avgUnitSizes: {
    lienKe?: string;
    shophouse?: string;
    songLap?: string;
    donLap?: string;
  };
  highRiseCondosInfo: string; // Detailed info for high rise apartments, or empty/noted if no condos
  priceRange: string;
  description: string;
  highlights: string[];
  images: string[];
}

export interface AmenitySEOInfo {
  id: string;
  name: string;
  projectId?: string;
  scale: string;
  category: string;
  status: string;
  summary: string;
  contentSEO: string;
  highlights: string[];
  image: string;
  videoUrl?: string;
}

export const SUBDIVISION_SEO_DATA: Record<string, SubdivisionSEOInfo> = {
  'Chà Là': {
    id: 'cha-la',
    projectId: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2 - The Empire',
    name: 'Phân khu Chà Là',
    style: 'Kiến trúc Đông Dương (Indochine) quý phái & sang trọng',
    scaleArea: '26.5 ha',
    totalUnits: '1.801 căn thấp tầng & cụm cao tầng quy hoạch',
    productTypes: ['Nhà liền kề', 'Shophouse thương mại', 'Biệt thự Song lập', 'Biệt thự Đơn lập', 'Căn hộ cao tầng Masterise/Landmark'],
    avgUnitSizes: {
      lienKe: '48m² - 120m² (Trung bình phổ biến 63m², 70m², 80m²)',
      shophouse: '70m² - 120m² (Mặt tiền rộng 5m - 8m đường 13m & 20m)',
      songLap: '120m² - 180m² (Mặt tiền 8m - 10m, xây 4 tầng + 1 tum)',
      donLap: '190m² - 280m² (Vị trí góc công viên & đường lớn)'
    },
    highRiseCondosInfo: 'Cụm chung cư cao tầng Chà Là quy hoạch 9-12 tòa tháp căn hộ phong cách Masterise Lumiere / Sol Forest cao 26-30 tầng. Diện tích căn hộ từ 28m² (Studio), 43m² - 48m² (1PN+1), 58m² - 75m² (2PN) đến 85m² - 110m² (3PN & Penthouse).',
    priceRange: 'Liền kề từ 5.8 tỷ - 9.5 tỷ | Shophouse từ 8.5 tỷ - 15 tỷ | Biệt thự từ 12 tỷ - 28 tỷ',
    description: 'Phân khu Chà Là là phân khu được hoàn thiện và bàn giao sớm nhất tại Siêu đại đô thị Vinhomes Ocean Park 2. Tọa lạc ngay cổng vào phía Nam dự án, tiếp giáp đại lộ Ngọc Trai 51m và bệnh viện Vinmec Health Resort 5 sao.',
    highlights: [
      'Sở hữu 3 công viên nội khu rợp bóng cây xanh: Công viên Lễ Hội, Công viên Âm Nhạc và Công viên Nghệ Thuật.',
      'Sát cạnh Bệnh viện Vinmec Health Resort 5 sao với 18 căn biệt thự Tổng thống.',
      'Mật độ cư dân về ở đông đúc nhất, tỷ lệ lấp đầy kinh doanh shophouse lên đến 80%.',
      'Đường nội khu rộng từ 13m đến 20m, giao thông ô tô dừng đỗ thuận tiện.'
    ],
    images: [],
  },

  'San Hô': {
    id: 'san-ho',
    projectId: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2 - The Empire',
    name: 'Phân khu San Hô',
    style: 'Kiến trúc Châu Âu hiện đại phóng khoáng',
    scaleArea: '39 ha',
    totalUnits: '2.168 căn thấp tầng & cụm cao tầng ven hồ',
    productTypes: ['Nhà liền kề', 'Shophouse thương mại', 'Biệt thự Song lập', 'Biệt thự Đơn lập', 'Khu căn hộ cao tầng view biển'],
    avgUnitSizes: {
      lienKe: '48m² - 112m² (Trung bình 63m², 70m², 80m²)',
      shophouse: '80m² - 160m² (Mặt tiền 6m - 10m Đại lộ Đại Dương 43m)',
      songLap: '120m² - 200m² (Xây 4 tầng, móng riêng tường riêng)',
      donLap: '200m² - 450m² (View trực diện Công viên Sóng 18ha)'
    },
    highRiseCondosInfo: 'Phân khu San Hô quy hoạch cụm tháp chung cư cao tầng phong cách Resort ven hồ sóng Royal Wave Park. Chiều cao 27-30 tầng với thiết kế kính tràn Panorama. Các loại diện tích: Studio 30m², 1PN 45m², 2PN 68m² - 75m², 3PN 88m² - 105m².',
    priceRange: 'Liền kề từ 6.2 tỷ - 11 tỷ | Shophouse từ 10 tỷ - 22 tỷ | Biệt thự đơn lập góc từ 25 tỷ - 55 tỷ',
    description: 'Phân khu San Hô nằm tại trái tim vị trí vàng của Vinhomes Ocean Park 2, trực diện Công viên biển tạo sóng nhân tạo Royal Wave Park 18ha và Công viên cát trắng Sandy Park.',
    highlights: [
      'Trực diện công viên biển tạo sóng nhân tạo Royal Wave Park lớn nhất thế giới 18ha.',
      'Sở hữu tuyến phố thương mại sầm uất kế bên Quảng trường Kinh đô Ánh sáng.',
      'Hệ thống trường học Vinschool liên cấp nằm ngay trong lòng phân khu.',
      'Kế sát trục giao thông chính Đại lộ Đại Dương 43m kết nối thẳng cao tốc Hà Nội - Hải Phòng.'
    ],
    images: [],
  },

  'Cọ Xanh': {
    id: 'co-xanh',
    projectId: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2 - The Empire',
    name: 'Phân khu Cọ Xanh',
    style: 'Kiến trúc Florida Mỹ tươi mát & năng động',
    scaleArea: '37 ha',
    totalUnits: '2.326 căn thấp tầng',
    productTypes: ['Nhà liền kề', 'Shophouse', 'Biệt thự Song lập', 'Biệt thự Đơn lập'],
    avgUnitSizes: {
      lienKe: '48m² - 110m² (Phổ biến 63m², 75m², 80m²)',
      shophouse: '75m² - 140m² (Mặt đường gom cao tốc & Vành đai 3.5)',
      songLap: '110m² - 180m²',
      donLap: '180m² - 300m²'
    },
    highRiseCondosInfo: 'Khu vực Cọ Xanh định hướng quy hoạch không gian xanh và thấp tầng sinh thái. Các cụm cao tầng lân cận kết nối qua tuyến đường gom Vành đai 3.5.',
    priceRange: 'Liền kề từ 5.5 tỷ - 9.2 tỷ | Shophouse từ 8 tỷ - 16 tỷ | Biệt thự từ 13 tỷ - 30 tỷ',
    description: 'Cọ Xanh là phân khu mở mang phong cách nhiệt đới Florida Mỹ với 2 công viên lớn là Silk Park và Green Oasis. Phân khu có kết nối giao thông siêu tốc ra đường Vành Đai 3.5 và đường gom cao tốc.',
    highlights: [
      'Sở hữu 2 công viên công cộng lớn Green Oasis & Silk Park dài hơn 2.6km ven sông.',
      'Sân thể thao đa năng, hồ bơi Resort, công viên BBQ ngoài trời.',
      'Mức giá cạnh tranh bậc nhất toàn đại đô thị Ocean Park 2.'
    ],
    images: [],
  },

  'Sao Biển': {
    id: 'sao-bien',
    projectId: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2 - The Empire',
    name: 'Phân khu Sao Biển',
    style: 'Kiến trúc Pháp cổ điển xa hoa & lộng lẫy',
    scaleArea: '35 ha',
    totalUnits: '2.402 căn Shophouse & Thấp tầng kinh doanh',
    productTypes: ['100% Căn Shophouse Thương Mại', 'Biệt thự Đơn lập góc', 'Biệt thự Song lập'],
    avgUnitSizes: {
      lienKe: '48m² - 90m² (Shophouse 100% kinh doanh 5 tầng)',
      shophouse: '70m² - 150m² (Mặt tiền phố đi bộ & Mega Grand World)',
      songLap: '120m² - 170m²',
      donLap: '190m² - 320m²'
    },
    highRiseCondosInfo: 'Phân khu Sao Biển kết nối trực tiếp cụm chung cư cao tầng trung tâm và đại thương xá Mega Grand World Hà Nội. Căn hộ cao tầng kế bên dự kiến từ 30m² đến 95m².',
    priceRange: 'Shophouse từ 7.5 tỷ - 18 tỷ | Biệt thự từ 16 tỷ - 40 tỷ',
    description: 'Phân khu Sao Biển là phân khu kinh doanh sầm uất bậc nhất dự án với 100% các căn là Shophouse. Nằm giữa hai công viên lớn là Kinh đô Ánh sáng và Quảng trường Mega Grand World.',
    highlights: [
      '100% các căn đều là Shophouse quy hoạch kinh doanh buôn bán 24/7.',
      'Sát cạnh Trung tâm thương mại Vincom Mega Mall và Quảng trường Kinh đô Ánh sáng.',
      'Sở hữu 2 công viên chủ đề Empress Park & Khu phố ẩm thực đêm.'
    ],
    images: [],
  },

  'Đảo Ngọc': {
    id: 'dao-ngoc',
    projectId: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2 - The Empire',
    name: 'Phân khu Đảo Ngọc',
    style: 'Kiến trúc Monaco xa xỉ chuẩn thượng lưu',
    scaleArea: '21.5 ha',
    totalUnits: '223 căn Biệt thự Đảo biệt lập siêu cao cấp',
    productTypes: ['Biệt thự Song lập Đảo', 'Biệt thự Đơn lập Đảo', 'Dinh thự Đảo đặc quyền'],
    avgUnitSizes: {
      songLap: '160m² - 240m² (Mặt tiền 9m - 12m, view sông nhân tạo)',
      donLap: '300m² - 600m² (Sở hữu mặt nước ven sông riêng, bể bơi riêng)'
    },
    highRiseCondosInfo: 'Phân khu Đảo Ngọc là khu biệt thự ĐẢO KHÉP KÍN VIP NHẤT, tuyệt đối KHÔNG CÓ chung cư cao tầng hay shophouse kinh doanh nhằm đảm bảo an ninh 4 lớp khép kín và sự riêng tư tuyệt đối cho giới siêu giàu.',
    priceRange: 'Biệt thự song lập từ 25 tỷ - 42 tỷ | Dinh thự đơn lập từ 60 tỷ - 180 tỷ',
    description: 'Phân khu Đảo Ngọc được ví như đảo thiên đường Monaco thu nhỏ. 100% các căn biệt thự đều nằm trên các nhánh đảo bao quanh bởi sông nhân tạo mặt nước trong xanh, kiểm soát an ninh 24/7.',
    highlights: [
      'Phân khu đóng khép kín duy nhất tại Vinhomes Ocean Park 2.',
      '100% biệt thự ven sông mặt nước riêng, chốt an ninh bảo vệ 4 lớp.',
      'Cộng đồng cư dân tinh hoa là các tập đoàn chủ doanh nghiệp & tỷ phú.'
    ],
    images: [],
  },

  'Phố Biển': {
    id: 'pho-bien',
    projectId: 'ocean-park-3',
    projectName: 'Vinhomes Ocean Park 3 - Grand Park',
    name: 'Phân khu Phố Biển',
    style: 'Kiến trúc Hiện đại sang trọng & sầm uất',
    scaleArea: '19.3 ha',
    totalUnits: '1.135 căn thấp tầng & cụm cao tầng vịnh biển',
    productTypes: ['Nhà liền kề', 'Shophouse thương mại', 'Biệt thự Song lập', 'Căn hộ cao tầng vịnh biển'],
    avgUnitSizes: {
      lienKe: '56m² - 100m² (Trung bình 64m², 70m², 85m²)',
      shophouse: '80m² - 140m² (Mặt tiền đường Phố Biển 20m & 30m)',
      songLap: '120m² - 160m²'
    },
    highRiseCondosInfo: 'Phân khu Phố Biển tiếp giáp cụm 10 tòa tháp căn hộ chung cư cao tầng hiện đại view trực diện Vịnh biển Thiên đường Paradise Bay 12ha. Căn hộ thiết kế kính kịch trần Panorama, diện tích 30m² - 92m² (Studio, 1PN, 2PN, 3PN).',
    priceRange: 'Liền kề từ 6.8 tỷ - 11.5 tỷ | Shophouse từ 11 tỷ - 24 tỷ | Căn hộ từ 1.8 tỷ - 4.5 tỷ',
    description: 'Phân khu Phố Biển có vị trí giao thương chiến lược ngay cổng vào Vinhomes Ocean Park 3, nằm kế sát khu phố thương mại Mega Grand World Hà Nội và Vịnh biển Paradise Bay.',
    highlights: [
      '100% các dãy nhà đều có thể khai thác kinh doanh hoặc cho thuê homestay.',
      'Sát cạnh khu VinWonders Hà Nội Wave Park & Water Park.',
      'Tiếp giáp đường trục chính 30m thông thẳng ra cao tốc Hà Nội - Hải Phòng.'
    ],
    images: [],
  },

  'Vịnh Thiên Đường': {
    id: 'vinh-thien-duong',
    projectId: 'ocean-park-3',
    projectName: 'Vinhomes Ocean Park 3 - Grand Park',
    name: 'Phân khu Vịnh Thiên Đường',
    style: 'Kiến trúc Địa Trung Hải quý phái',
    scaleArea: '21.2 ha',
    totalUnits: '1.008 căn biệt thự & nhà phố',
    productTypes: ['Nhà liền kề', 'Shophouse', 'Biệt thự Song lập', 'Biệt thự Đơn lập', 'Tháp căn hộ cao tầng Vịnh biển'],
    avgUnitSizes: {
      lienKe: '54m² - 120m² (Trung bình 60m², 75m², 90m²)',
      shophouse: '80m² - 160m² (Mặt tiền Vịnh biển)',
      songLap: '150m² - 220m²',
      donLap: '220m² - 350m²'
    },
    highRiseCondosInfo: 'Phân khu Vịnh Thiên Đường quy hoạch cụm tháp căn hộ cao tầng cao 28-32 tầng view ôm trọn biển hồ bốn mùa Tropical Surf và Paradise Bay. Căn hộ cao cấp bàn giao tiêu chuẩn Smart Home.',
    priceRange: 'Liền kề từ 7.2 tỷ - 13 tỷ | Shophouse từ 12 tỷ - 28 tỷ | Biệt thự từ 20 tỷ - 50 tỷ',
    description: 'Vịnh Thiên Đường được coi là trái tim nghỉ dưỡng đắt giá nhất Vinhomes Ocean Park 3. Phân khu ôm trọn trọn vẹn Vịnh biển 4 mùa Paradise Bay 12ha với hồ bơi trong nhà & ngoài trời.',
    highlights: [
      'Ôm trọn Vịnh biển 4 mùa Paradise Bay 12ha độc nhất vô nhị tại Việt Nam.',
      'Sở hữu Hồ bơi bốn mùa trong nhà kính khổng lồ Tropical Surf.',
      'Công viên nước Aqua Bay với các đường trượt cảm giác mạnh VinWonders.'
    ],
    images: [],
  },

  'Ánh Dương': {
    id: 'anh-duong',
    projectId: 'ocean-park-3',
    projectName: 'Vinhomes Ocean Park 3 - Grand Park',
    name: 'Phân khu Ánh Dương',
    style: 'Kiến trúc Modernist hiện đại trẻ trung',
    scaleArea: '16.5 ha',
    totalUnits: '1.210 căn nhà phố & liền kề',
    productTypes: ['Nhà liền kề', 'Shophouse', 'Biệt thự Song lập'],
    avgUnitSizes: {
      lienKe: '54m² - 100m² (Trung bình 60m², 70m², 80m²)',
      shophouse: '75m² - 130m²',
      songLap: '120m² - 180m²'
    },
    highRiseCondosInfo: 'Phân khu Ánh Dương được quy hoạch kết nối chuỗi căn hộ cao tầng sinh thái và công viên nghệ thuật. Chi tiết số tòa cao tầng đang được cập nhật kế hoạch triển khai.',
    priceRange: 'Liền kề từ 6.5 tỷ - 10.5 tỷ | Shophouse từ 10 tỷ - 20 tỷ',
    description: 'Ánh Dương là phân khu năng động bậc nhất với điểm nhấn là Quảng trường Ánh Dương và công viên nghệ thuật Art Wave Park.',
    highlights: [
      'Công viên nghệ thuật Art Wave Park với hồ bơi phong cách Resort.',
      'Tuyến phố đi bộ mua sắm ẩm thực nhộn nhịp.',
      'Mặt tiền đại lộ Ánh Dương 30m rộng rãi kết nối 2 đô thị OCP2 & OCP3.'
    ],
    images: [],
  },

  'Thời Đại': {
    id: 'thoi-dai',
    projectId: 'ocean-park-3',
    projectName: 'Vinhomes Ocean Park 3 - Grand Park',
    name: 'Phân khu Thời Đại',
    style: 'Kiến trúc Đông Dương chạm khắc tinh xảo',
    scaleArea: '16.8 ha',
    totalUnits: '1.253 căn thấp tầng & 10 tòa cao tầng',
    productTypes: ['Nhà liền kề', 'Shophouse', 'Biệt thự Song lập', '10 Tòa chung cư cao tầng'],
    avgUnitSizes: {
      lienKe: '60m² - 120m² (Trung bình 60m², 75m², 80m²)',
      shophouse: '80m² - 150m²',
      songLap: '136m² - 180m²'
    },
    highRiseCondosInfo: 'Phân khu Thời Đại sở hữu 10 tòa tháp căn hộ chung cư cao tầng ngay cạnh đường Vành đai 3.5. Căn hộ cao từ 25 - 30 tầng, đầy đủ loại hình Studio (28-32m²), 1PN+1 (45-52m²), 2PN (65-78m²), 3PN (85-105m²).',
    priceRange: 'Liền kề từ 6.9 tỷ - 11 tỷ | Shophouse từ 11.5 tỷ - 22 tỷ | Căn hộ chung cư từ 1.7 tỷ - 4.2 tỷ',
    description: 'Thời Đại là phân khu nằm ngay cửa ngõ dự án Vinhomes Ocean Park 3, kế cận đường Vành Đai 3.5 và tòa tháp văn phòng thương mại 30 tầng.',
    highlights: [
      'Nằm kế bên Tòa tháp văn phòng Vinfast 30 tầng & TTTM Vincom.',
      '10 tòa tháp chung cư cao tầng mang lại lượng khách hàng tiêu dùng cực lớn.',
      '3 công viên nội khu: Công viên Bãi Biển, Công viên Nhiệt Đới và Công viên Thần Thoại.'
    ],
    images: [],
  },

  'Phân khu Hoàng Tân': {
    id: 'hoang-tan',
    projectId: 'ha-long-xanh',
    projectName: 'Vinhomes Hạ Long Xanh (Quảng Ninh)',
    name: 'Phân khu Hoàng Tân',
    style: 'Kiến trúc Biệt thự Đảo & Resort ven biển 6 sao',
    scaleArea: '1.500 ha',
    totalUnits: 'Biệt thự biển, Sân Golf 36 hố PGA, Shophouse & Khách sạn nghỉ dưỡng',
    productTypes: ['Biệt thự biển đồi', 'Biệt thự ven Sân Golf', 'Shophouse du lịch', 'Resort 6 sao Vinpearl'],
    avgUnitSizes: {
      lienKe: '90m² - 150m² (Khu shophouse du lịch thương mại)',
      shophouse: '120m² - 200m² (Mặt tiền đại lộ ven biển Hạ Long)',
      songLap: '200m² - 350m² (View trực diện Sân Golf 36 hố)',
      donLap: '350m² - 1.000m² (Dinh thự biển riêng biệt có bến du thuyền)'
    },
    highRiseCondosInfo: 'Phân khu chung cư cao tầng: Chưa mở bán đợt này / Đang cập nhật quy hoạch phân khu căn hộ sinh thái cao tầng từ Chủ đầu tư Vingroup.',
    priceRange: 'Dự kiến công bố đợt 1 từ Chủ đầu tư Vingroup',
    description: 'Phân khu Hoàng Tân là trái tim du lịch nghỉ dưỡng cao cấp nhất Siêu dự án 10 tỷ USD Vinhomes Hạ Long Xanh, tọa lạc tại đảo Hoàng Tân với sân Golf 36 hố tiêu chuẩn PGA quốc tế.',
    highlights: [
      'Sân Golf 36 hố tiêu chuẩn PGA ven biển lớn nhất Quảng Ninh.',
      'Bến du thuyền quốc tế 5 sao kết nối Vịnh Hạ Long & Vịnh Bái Tử Long.',
      'Hệ thống công viên giải trí VinWonders Hạ Long Xanh.'
    ],
    images: [],
  },

  'Phân khu Hà An': {
    id: 'ha-an',
    projectId: 'ha-long-xanh',
    projectName: 'Vinhomes Hạ Long Xanh (Quảng Ninh)',
    name: 'Phân khu Hà An',
    style: 'Kiến trúc Đô thị Thông minh & Trung tâm Tài chính Quốc tế',
    scaleArea: '1.800 ha',
    totalUnits: 'Biệt thự sinh thái, Shophouse tài chính & Đô thị hiện đại',
    productTypes: ['Shophouse tài chính', 'Liền kề sinh thái', 'Biệt thự đơn lập song lập', 'Tháp trung tâm tài chính'],
    avgUnitSizes: {
      lienKe: '85m² - 130m²',
      shophouse: '100m² - 180m²',
      songLap: '180m² - 280m²',
      donLap: '250m² - 500m²'
    },
    highRiseCondosInfo: 'Phân khu chung cư cao tầng: Chưa mở bán đợt này / Đang cập nhật quy hoạch vị trí các tòa tháp cao tầng từ Chủ đầu tư.',
    priceRange: 'Dự kiến công bố đợt 1',
    description: 'Phân khu Hà An đóng vai trò là trung tâm hành chính, tài chính thương mại và nhà ở sinh thái chính của Siêu đô thị Vinhomes Hạ Long Xanh, nằm sát nút giao Cao tốc Hà Nội - Hải Phòng - Hạ Long.',
    highlights: [
      'Sở hữu Tháp tài chính thương mại biểu tượng và TTTM Vincom.',
      'Bệnh viện Vinmec Medical Resort & Hệ thống trường học Vinschool.',
      'Kết nối giao thông siêu tốc tới Hải Phòng (15 phút) và Hà Nội (60 phút).'
    ],
    images: [],
  },

  'Sapphire Parkville': {
    id: 'sapphire-parkville',
    projectId: 'smart-city',
    projectName: 'Vinhomes Smart City - Tây Mỗ',
    name: 'Phân khu Sapphire Parkville',
    style: 'Kiến trúc Đô thị Thông minh Hiện đại',
    scaleArea: '12.5 ha',
    totalUnits: '3 tòa tháp cao 35-38 tầng (S4.01, S4.02, S4.03)',
    productTypes: ['Căn hộ Studio', 'Căn hộ 1PN+1', 'Căn hộ 2PN (1WC/2WC)', 'Căn hộ 3PN góc'],
    avgUnitSizes: {
      lienKe: '28m² - 32m² (Studio)',
      shophouse: '43m² - 48m² (1PN+1)',
      songLap: '54m² - 65m² (2PN)',
      donLap: '75m² - 98m² (3PN)'
    },
    highRiseCondosInfo: '3 tòa tháp bàn giao tiêu chuẩn Vinhomes Sapphire nâng cấp, sở hữu tầm nhìn Panorama trực diện Công viên Trung tâm Central Park 10.2ha và Hồ cảnh quan 4.8ha.',
    priceRange: '1.6 tỷ - 5.2 tỷ VNĐ',
    description: 'Sapphire Parkville (S4) được coi là tâm điểm đắt giá nhất phân khu Sapphire nhờ sở hữu vị trí ngay giao lộ vàng Đại lộ Thăng Long & tuyến Metro số 5, 6, 7.',
    highlights: [
      'Trực diện Công viên trung tâm Central Park 10.2ha.',
      'Sở hữu bể bơi ngoài trời phong cách Resort rộng 1.000m².',
      'Hệ thống an ninh AI nhận diện khuôn mặt FaceID 24/7.'
    ],
    images: [],
  },

  'Tonkin': {
    id: 'tonkin',
    projectId: 'smart-city',
    projectName: 'Vinhomes Smart City - Tây Mỗ',
    name: 'Phân khu The Tonkin',
    style: 'Kiến trúc Indochine Đông Dương sang trọng quý phái',
    scaleArea: '8.2 ha',
    totalUnits: '2 tòa tháp TK1 & TK2 cao 38 tầng',
    productTypes: ['Căn hộ Studio VIP', 'Căn hộ 1PN+1', 'Căn hộ 2PN Indochine', 'Căn hộ 3PN Đẳng cấp'],
    avgUnitSizes: {
      lienKe: '28m² - 34m² (Studio)',
      shophouse: '45m² - 52m² (1PN+1)',
      songLap: '62m² - 74m² (2PN)',
      donLap: '82m² - 100m² (3PN)'
    },
    highRiseCondosInfo: 'Phân khu cao cấp bàn giao tiêu chuẩn Vinhomes Ruby với hành lang 1.8m có điều hòa, sảnh đón lễ tân sang trọng, thiết bị vệ sinh Kohler/Grohe cao cấp.',
    priceRange: '2.4 tỷ - 7.5 tỷ VNĐ',
    description: 'The Tonkin mang phong cách Đông Dương lộng lẫy quyến rũ, kết hợp nét hoài cổ Á Đông và sự tinh tế Châu Âu giữa lòng đại đô thị thông minh Smart City.',
    highlights: [
      'Tiêu chuẩn Ruby bàn giao full nội thất cao cấp.',
      'Bể bơi Phoenix Pool thiết kế hình giọt nước phong cách Indochine.',
      'Cạnh nhà đỗ xe thông minh 10 tầng và trường học Vinschool.'
    ],
    images: [],
  }
};

export const AMENITY_SEO_DATA: Record<string, AmenitySEOInfo> = {
  'royal-wave-park': {
    id: 'royal-wave-park',
    name: 'Công viên sóng Royal Wave Park 18ha',
    projectId: 'ocean-park-2',
    scale: '18 ha (Tổ hợp công viên biển tạo sóng nhân tạo lớn nhất thế giới)',
    category: 'Công viên giải trí & Biển hồ nhân tạo',
    status: 'Đã hoàn thiện & Đang vận hành đón hàng triệu lượt khách',
    summary: 'Kỳ quan công viên biển tạo sóng nhân tạo quy mô 18ha kỷ lục thế giới với 6 hồ tạo sóng ngọn sóng cao đến 3m, hồ nước mặn Laguna 9.3ha và công viên cát trắng Sandy Park 1ha.',
    contentSEO: `
Tổ hợp Công viên biển tạo sóng nhân tạo Royal Wave Park quy mô 18 ha tại Vinhomes Ocean Park 2 đã chính thức được Tổ chức Kỷ lục Thế giới WorldKings trao bằng chứng nhận là "Tổ hợp công viên biển tạo sóng nhân tạo quy mô lớn nhất thế giới".

### Các Hạng Mục Nổi Bật Tại Royal Wave Park:
1. **6 Hồ Tạo Sóng Nhân Tạo Kỷ Lục:** Tổng diện tích hơn 5.4 ha với công nghệ tạo sóng tiên tiến bậc nhất thế giới từ Tây Ban Nha, tạo ra những ngọn sóng biển chân thực cao tới 2.8m - 3m.
2. **Hồ Nước Mặn Nhân Tạo Laguna 9.3 ha:** Hồ nước mặn nhân tạo trong lành có độ mặn chuẩn sinh học, bao quanh bởi dải cát trắng mịn.
3. **Công Viên Cát Trắng Sandy Park 1 ha:** Hàng nghìn tấn cát trắng tự nhiên được tuyển chọn tỉ mỉ và vận chuyển trực tiếp từ biển Nha Trang.
4. **Núi Nhân Tạo Hoàng Gia (Royal Mountain) Cao 30m:** Điểm nhấn kiến trúc biểu tượng hùng vĩ ngay giữa lòng đại đô thị.
5. **2 Sân Sân Trận Chiến Nước (Water Battle Park) & Công Viên Cây Xanh:** Phục vụ các sự kiện âm nhạc, Lễ hội biển, Teambuilding doanh nghiệp 10.000 người.
    `,
    highlights: [
      'Kỷ lục thế giới WorldKings chứng nhận năm 2022',
      'Sóng biển chân thực cao tới 3m thích hợp lướt sóng',
      'Cát trắng mịn nhập trực tiếp từ Vịnh Nha Trang',
      'Miễn phí vé vào cửa cho cư dân Vinhomes Ocean Park 2'
    ],
    image: ''
  },

  'paradise-bay': {
    id: 'paradise-bay',
    name: 'Vịnh biển thiên đường Paradise Bay 12ha',
    projectId: 'ocean-park-3',
    scale: '12 ha (Hồ bơi 4 mùa Tropical Surf & Biển hồ mặn)',
    category: 'Tổ hợp nghỉ dưỡng Vịnh biển 4 mùa',
    status: 'Đã hoàn thiện & Đang mở cửa đón khách du lịch 24/7',
    summary: 'Kỳ quan biển hồ 4 mùa độc bản tại Hà Nội, tích hợp hồ bơi bốn mùa trong nhà Tropical Surf kính mái vòm khổng lồ, công viên nước VinWonders Aqua Bay và vịnh trượt sóng.',
    contentSEO: `
Vịnh biển thiên đường Paradise Bay quy mô 12 ha tại Vinhomes Ocean Park 3 là siêu tiện ích độc bản cho phép cư dân "tắm biển 365 ngày/năm" kể cả giữa mùa đông miền Bắc.

### Các Phân Khu Chức Năng Đỉnh Cao:
- **Hồ Bơi 4 Mùa Tropical Surf Trong Nhà:** Thiết kế mái kính trong suốt khổng lồ, điều hòa nhiệt độ nước chuẩn 30-32°C quanh năm.
- **Biển Hồ Nước Mặn Ngoài Trời Tropical Lagoon 2.8ha:** Làn nước xanh ngọc bích phẳng lặng kết hợp bờ cát trắng dừa xanh.
- **Công Viên Nước Aqua Bay (VinWonders):** 6 đường trượt cảm giác mạnh đa tốc độ thiết kế bởi VinWonders.
- **Hồ Bơi Tiêu Chuẩn Olympic 1.000m²:** Dành riêng cho cư dân rèn luyện thể thao bơi lội chuyên nghiệp.
    `,
    highlights: [
      'Tắm biển 4 mùa 365 ngày quanh năm',
      'Công viên nước VinWonders Aqua Bay cảm giác mạnh',
      'Hồ bơi tiêu chuẩn Olympic 10 làn bơi'
    ],
    image: ''
  },

  'mega-grand-world': {
    id: 'mega-grand-world',
    name: 'Siêu thương cảng Mega Grand World Hà Nội',
    projectId: 'ocean-park-3',
    scale: '18.7 ha (Trục kênh Venice dài 830m & Phố K-Town)',
    category: 'Trung tâm Mua sắm, Ẩm thực & Giải trí 24/7',
    status: 'Đã khai trương & Thu hút hơn 100.000 lượt khách/cuối tuần',
    summary: 'Thương xá mua sắm giải trí ẩm thực lớn nhất miền Bắc với phân khu The Venice (Ý) lãng mạn thuyền Gondola và The K-Town (Hàn Quốc) nhộn nhịp chuẩn phong cách Gangnam.',
    contentSEO: `
Mega Grand World Hà Nội là điểm đến du lịch giải trí quy mô quốc tế kết hợp 2 văn hóa kiến trúc Đông - Tây đặc sắc.

### Trải Nghiệm Mua Sắm & Giải Trí Khớp Nối:
1. **Dòng Kênh Venice Dài 830m:** Cư dân & du khách trải nghiệm đi thuyền Gondola cổ kính thưởng thức show diễn thực cảnh "The Grand Voyage" quy mô triệu USD.
2. **Khu Phố Hàn Quốc The K-Town:** Hơn 300 cửa hàng thời trang K-Fashion, ẩm thực K-Food, Spa làm đẹp phong cách chuẩn Seoul/Hongdae.
3. **Cầu Đông Tây Biểu Tượng:** Cầu bộ hành bắc qua đường Vành Đai 3.5 nối liền Ocean Park 2 & Ocean Park 3 rực rỡ đèn LED đêm.
    `,
    highlights: [
      'Show diễn thực cảnh The Grand Voyage trên sông',
      'Đi thuyền Gondola Venice Ý lãng mạn',
      'Tuyến xe VinBus chạy thẳng từ trung tâm Hà Nội miễn phí'
    ],
    image: ''
  },

  'san-golf-36-ho': {
    id: 'san-golf-36-ho',
    name: 'Sân Golf 36 hố tiêu chuẩn PGA Quốc tế',
    projectId: 'ha-long-xanh',
    scale: '230 ha (Sân Golf 36 hố tiêu chuẩn PGA)',
    category: 'Thể thao thượng lưu & Du lịch Golf',
    status: 'Đang giải phóng mặt bằng & Đang thi công tạo dáng sân',
    summary: 'Sân Golf ven biển 36 hố tiêu chuẩn PGA quốc tế đẹp nhất Quảng Ninh do huyền thoại thiết kế sân golf thế giới đảm nhiệm, sẵn sàng phục vụ các giải đấu PGA Tour.',
    contentSEO: `
Sân Golf 36 hố PGA tại Siêu đại đô thị Vinhomes Hạ Long Xanh là công trình thể thao đỉnh cao ven Vịnh Hạ Long.

### Thông Số Kỹ Thuật Sân Golf:
- **Quy Mô:** 36 hố chia làm 2 sân 18 hố (Sân Ocean Course & Sân Mountain Course).
- **Cỏ Sân Golf:** Sử dụng cỏ Platinum TE Paspalum cao cấp chịu mặn tốt, tạo độ lăn bóng mượt mà tuyệt đối.
- **Nhà Câu Lạc Bộ Clubhouse 6 Sao:** Tích hợp Nhà hàng Fine Dining, Phòng Cigar VIP, ProShop đồ golf thương hiệu thế giới và Locker khoáng nóng Onsen.
    `,
    highlights: [
      'Tiêu chuẩn thi đấu giải PGA Tour quốc tế',
      'View Vịnh Hạ Long & Vịnh Bái Tử Long 360 độ',
      'Nhà câu lạc bộ Clubhouse 6 sao xa xỉ'
    ],
    image: ''
  },

  'thap-108-tang': {
    id: 'thap-108-tang',
    name: 'Tháp Trung tâm Tài chính Biểu tượng 108 tầng',
    projectId: 'green-paradise-can-gio',
    scale: 'Chiều cao thuộc Top 10 thế giới (108 tầng)',
    category: 'Tháp tài chính, Khách sạn 6 sao & Đài quan sát',
    status: 'Đang hoàn thiện quy hoạch chi tiết 1/500',
    summary: 'Ngọn tháp biểu tượng kiến trúc thế giới 108 tầng tại đô thị lấn biển Cần Giờ, tích hợp Trung tâm Tài chính Quốc tế, Khách sạn 6 sao Ritz-Carlton/Four Seasons và Đài quan sát toàn cảnh biển Nam Bộ.',
    contentSEO: `
Tháp 108 tầng Vinhomes Green Paradise Cần Giờ là tòa nhà biểu tượng vươn tầm thế giới của TP. Hồ Chí Minh.

### Các Tầng Chức Năng Chính:
- **Tầng 1 - 20:** Trung tâm thương mại xa xỉ hội tụ các nhà mốt Hermes, Chanel, Gucci, Rolex.
- **Tầng 21 - 70:** Sàn văn phòng hạng A+ dành cho các Ngân hàng quốc tế & Quỹ đầu tư toàn cầu.
- **Tầng 71 - 100:** Khách sạn 6 sao siêu sang sở hữu Bể bơi vô cực cao nhất Đông Nam Á.
- **Tầng 101 - 108:** Đài quan sát 360 độ Panorama ngắm nhìn toàn bộ Biển Cần Giờ & Vịnh Gành Rái.
    `,
    highlights: [
      'Top 10 tòa tháp cao nhất thế giới',
      'Trục tài chính kết nối dòng vốn đầu tư quốc tế',
      'Bể bơi vô cực & Đài quan sát kính trên không'
    ],
    image: ''
  },

  'zen-park-smart-city': {
    id: 'zen-park-smart-city',
    name: 'Vườn Nhật Zen Park 102.000m²',
    projectId: 'smart-city',
    scale: '10.2 ha (Công viên văn hóa Nhật Bản quy mô kỷ lục Đông Nam Á)',
    category: 'Công viên văn hóa & Cảnh quan sinh thái',
    status: 'Đã hoàn thiện & Mở cửa tự do cho cư dân Smart City',
    summary: 'Công viên văn hóa Nhật Bản Zen Park lớn nhất Việt Nam với hàng trăm cây Tùng La Hán giá trị triệu USD, hồ cá Koi 1.300m³, cầu gỗ đỏ thắm và công viên đèn lồng Chouchin.',
    contentSEO: `
Vườn Nhật Zen Park tại Vinhomes Smart City Tây Mỗ mang đến không gian thư thái chuẩn thiền Nhật Bản ngay phía Tây Hà Nội.

### Hạng Mục Độc Đáo Tại Zen Park:
- **130 Cây Tùng La Hán Cổ Thụ:** Nhập khẩu trực tiếp từ Nhật Bản có giá trị hàng triệu USD.
- **Hồ Cá Koi Tự Nhiên 1.300m³:** Nơi cư ngụ của hàng ngàn chú cá Koi Nhật Bản nhiều màu sắc.
- **Tháp Đèn Lồng Noshi & Công Viên Đèn Lồng 5.000 Chiếc:** Rực rỡ lung linh khi đêm xuống.
- **Nhà Hàng Ẩm Thực Nhật Bản & Sân Tập Golf Trong Nhà:** Phục vụ đời sống văn hóa thượng lưu.
    `,
    highlights: [
      'Vườn Nhật Zen Park quy mô lớn nhất Việt Nam',
      '130 cây Tùng La Hán quý hiếm & Hồ cá Koi',
      'Miễn phí vé tham quan cho toàn bộ cư dân Smart City'
    ],
    image: ''
  },

  'kinh-do-anh-sang': {
    id: 'kinh-do-anh-sang',
    name: 'Quảng trường Kinh đô Ánh sáng (Kingdom of Avenue)',
    projectId: 'ocean-park-2',
    scale: '3.2 ha (Tháp Nữ Thần Ánh Sáng cao 50m)',
    category: 'Quảng trường lễ hội & Phố đi bộ Paris',
    status: 'Đã hoàn thiện & Vận hành các show diễn ánh sáng đêm',
    summary: 'Trục đại lộ mua sắm phố đi bộ đậm chất Pháp cổ điển lãng mạn dài hơn 1km với điểm nhấn Tháp Nữ Thần Ánh Sáng cao 50m rực rỡ.',
    contentSEO: `
Quảng trường Kinh đô Ánh sáng Kingdom of Avenue rộng 3.2 ha tái hiện trọn vẹn vẻ đẹp lộng lẫy xa hoa của thủ đô Paris nước Pháp ngay tại Vinhomes Ocean Park 2.

### Điểm Nhấn Không Thể Bỏ Qua:
- **Tháp Nữ Thần Ánh Sáng Cao 50m:** Ngọn tháp biểu tượng rực rỡ chiếu sáng toàn bộ đại đô thị về đêm với công nghệ đèn LED nghệ thuật 3D.
- **Tuyến Phố Đi Bộ Phố Champs-Élysées:** Dãy shophouse kiến trúc Pháp cổ kính hội tụ hàng trăm thương hiệu ẩm thực, cafe, thời trang cao cấp.
- **Chuỗi Lễ Hội Âm Nhạc & Ánh Sáng 365 Ngày:** Nơi diễn ra các Đại hội âm nhạc Countdown, Lễ hội bia, Lễ hội ẩm thực đường phố thu hút hàng vạn du khách mỗi tuần.
    `,
    highlights: [
      'Tháp Nữ thần Ánh sáng cao 50m hoành tráng',
      'Tuyến phố đi bộ phong cách Paris dài hơn 1km',
      'Trục căn Shophouse giá trị kinh doanh thương mại đỉnh cao'
    ],
    image: ''
  },

  'vinmec-health-resort': {
    id: 'vinmec-health-resort',
    name: 'Bệnh viện Vinmec Health Resort 5 sao',
    projectId: 'ocean-park-2',
    scale: 'Biệt thự Y tế Dưỡng lão 5 sao đầu tiên tại Việt Nam',
    category: 'Y tế & Chăm sóc sức khỏe cao cấp',
    status: 'Đang đi vào hoàn thiện & Sắp vận hành năm 2026',
    summary: 'Mô hình Bệnh viện Dưỡng lão & Bệnh viện Nghỉ dưỡng 5 sao tiêu chuẩn quốc tế đầu tiên tại Việt Nam sở hữu 18 căn biệt thự Tổng thống (Presidential Villa).',
    contentSEO: `
Bệnh viện Đa khoa Quốc tế Vinmec Health Resort tại Vinhomes Ocean Park 2 nâng tầm tiêu chuẩn chăm sóc sức khỏe thượng lưu lên mức Y tế Nghỉ dưỡng 5 sao.

### Đặc Quyền Y Tế Đẳng Cấp:
1. **18 Căn Biệt Thự Tổng Thống (Presidential Villa):** Mỗi căn biệt thự có sân vườn riêng, hồ bơi riêng, phòng điều trị hiện đại và đội ngũ Y bác sĩ, điều dưỡng viên trực chiến 24/7.
2. **Trung Tâm Chăm Sóc Sức Khỏe Dưỡng Lão Chuẩn Nhật Bản:** Dành cho người cao tuổi với các liệu trình trị liệu phục hồi chức năng, dinh dưỡng chuyên sâu và spa khoáng nóng.
3. **Sân Đáp Trực Thăng Cấp Cứu Y Tế Khẩn Cấp:** Đảm bảo thời gian vàng di chuyển cấp cứu hàng không quốc tế.
    `,
    highlights: [
      '18 căn biệt thự nghỉ dưỡng y tế Tổng thống riêng biệt',
      'Đội ngũ Y bác sĩ chuyên gia đầu ngành trong & ngoài nước',
      'Dịch vụ Y tế tại nhà 24/7 cho cư dân đại đô thị'
    ],
    image: ''
  },

  'vincom-mega-mall': {
    id: 'vincom-mega-mall',
    name: 'Trung tâm thương mại Vincom Mega Mall',
    projectId: 'ocean-park-2',
    scale: 'Hàng chục ngàn m² sàn thương mại',
    category: 'Mua sắm, Giải trí & Ẩm thực',
    status: 'Đã hoàn thiện & Đang kinh doanh nhộn nhịp',
    summary: 'Thiên đường mua sắm sầm uất quy tụ hàng trăm thương hiệu thời trang, mỹ phẩm, ẩm thực nổi tiếng trong và ngoài nước cùng rạp chiếu phim CGV IMAX hiện đại.',
    contentSEO: `
Vincom Mega Mall Ocean Park là đại siêu thị - trung tâm thương mại nổi tiếng với thiết kế kiến trúc xanh uốn lượn hiện đại.

### Các Trải Nghiệm Đỉnh Cao:
- **Đại Siêu Thị WinMart 3.000m²:** Cung cấp thực phẩm tươi sống, hàng tiêu dùng cao cấp cho toàn bộ cư dân Ocean City.
- **Tổ Hợp Rạp Chiếu Phim CGV IMAX 4D:** Âm thanh vòm đỉnh cao, ghế đôi cao cấp.
- **Khu Vui Chơi Trẻ Em TiniWorld & Wolfoo City:** Không gian sáng tạo giáo trí lành mạnh cho trẻ nhỏ.
- **Chuỗi Nhà Hàng Ẩm Thực Á - Âu:** Haidilao Hotpot, Starbucks, Pizza 4P's, King BBQ, Highland Coffee...
    `,
    highlights: [
      'Hơn 300 thương hiệu thời trang & ẩm thực quốc tế',
      'Đại siêu thị WinMart & Rạp chiếu phim CGV IMAX',
      'Bãi đỗ xe thông minh công suất 3.000 xe ô tô'
    ],
    image: ''
  },

  'vinschool-system': {
    id: 'vinschool-system',
    name: 'Hệ thống liên cấp Vinschool',
    projectId: 'ocean-park-2',
    scale: 'Trường học liên cấp từ Mầm non đến THPT',
    category: 'Giáo dục chuẩn quốc tế',
    status: 'Đã khai giảng & Đang giảng dạy chuỗi trường liên cấp',
    summary: 'Hệ thống giáo dục liên cấp chất lượng cao đạt chuẩn kiểm định quốc tế CIS (Council of International Schools) sở hữu cơ sở vật chất 5 sao.',
    contentSEO: `
Trường Liên cấp Vinschool tại các đại đô thị Vinhomes được xây dựng theo tiêu chuẩn quốc tế với định hướng đào tạo công dân toàn cầu.

### Cơ Sở Vật Chất & Chương Trình Học:
- **Chương Trình Giảng Dạy Cambridge:** Tích hợp tiếng Anh chuẩn quốc tế giúp học sinh tự tin săn học bổng du học toàn cầu.
- **Hệ Thống Phòng Học Thông Minh:** Phòng thí nghiệm STEM, Phòng VR/AR, Thư viện hàng ngàn đầu sách, Phòng Studio Âm nhạc.
- **Khu Thể Thao Phức Hợp:** Sân bóng đá cỏ nhân tạo, Hồ bơi bốn mùa trong nhà, Nhà thi đấu đa năng sàn gỗ.
    `,
    highlights: [
      'Trường học đạt chuẩn kiểm định quốc tế CIS',
      'Chương trình học Cambridge song ngữ chất lượng cao',
      'Hệ thống đưa đón học sinh VinBus an toàn tuyệt đối'
    ],
    image: ''
  },

  'vinbus-system': {
    id: 'vinbus-system',
    name: 'Xe buýt VinBus nội khu 24/7',
    projectId: 'ocean-park-2',
    scale: 'Tuyến buýt điện thông minh bao phủ 100% đô thị',
    category: 'Giao thông xanh & Kết nối cư dân',
    status: 'Đang vận hành miễn phí cho cư dân 24/7',
    summary: 'Hệ thống xe buýt điện thông minh VinBus không tiếng ồn, không khí thải, kết nối di chuyển nội khu hoàn toàn miễn phí và liên kết thẳng trung tâm Hà Nội.',
    contentSEO: `
VinBus là phương tiện giao thông xanh tiên phong tại Việt Nam, mang lại sự tiện lợi văn minh tối đa cho cư dân Vinhomes Ocean Park.

### Lợi Ích & Tuyến Đường VinBus:
1. **Tần Suất Chạy 5 - 10 Phút/Chuyến:** Hoạt động liên tục 24/7 kết nối cư dân từ nhà đến Vinschool, Vincom, Vinmec, Royal Wave Park, Paradise Bay và Mega Grand World.
2. **Miễn Phí Nội Khu Cho Cư Dân:** Chỉ cần quét thẻ cư dân hoặc ứng dụng Vin3S.
3. **Kết Nối Trung Tâm Hà Nội:** Các tuyến OCP01, OCP02, E01, E02, E03 di chuyển thẳng tới Mỹ Đình, Cầu Giấy, Hoàn Kiếm, Times City, Vinhomes Smart City.
    `,
    highlights: [
      '100% Xe buýt điện êm ái, wifi miễn phí, cổng sạc USB',
      'Chạy liên tục 24/7 kết nối miễn phí tất cả phân khu',
      'Tra cứu lộ trình thời gian thực qua App VinBus'
    ],
    image: ''
  },

  'vinuni': {
    id: 'vinuni',
    name: 'Trường Đại học VinUni',
    projectId: 'ocean-park-1',
    scale: '23 ha (Khuôn viên Đại học Tinh hoa tiêu chuẩn Quốc tế QS 5 sao)',
    category: 'Đại học Tinh hoa & Nghiên cứu Đỉnh cao',
    status: 'Đang vận hành đào tạo cử nhân & thạc sĩ quốc tế',
    summary: 'Trường Đại học tinh hoa tư thục phi lợi nhuận đầu tiên tại Việt Nam hợp tác chiến lược cùng 2 Đại học Ivy League danh giá: Cornell University và University of Pennsylvania.',
    contentSEO: `
Trường Đại học VinUni (VinUniversity) tọa lạc tại cửa ngõ đại đô thị Vinhomes Ocean Park 1 (Gia Lâm, Hà Nội), được Tập đoàn Vingroup đầu tư xây dựng với tổng mức đầu tư 6.500 tỷ VNĐ.

### Kiến Trúc Gothique Độc Bản & Cơ Sở Vật Chất 5 Sao:
1. **Tòa Tháp Biểu Tượng Cánh Chim Cao 108m:** Biểu trưng cho khát vọng vươn tầm tri thức quốc tế của thế hệ trẻ Việt Nam.
2. **Khu Thư Viện Kỹ Thuật Số Rộng 4.000m²:** Tích hợp không gian học tập 24/7, phòng VR thực tế ảo và liên kết kho dữ liệu học thuật toàn cầu.
3. **Khu Thể Thao Phức Hợp Chuẩn Olympic:** Hồ bơi tiêu chuẩn Olympic 50m trong nhà, sân bóng đá cỏ nhân tạo đạt chuẩn FIFA, khu tập Gym đa năng.
4. **Ký Túc Xá Sinh Viên Chuẩn Căn Hộ Nghỉ Dưỡng:** Đầy đủ tiện nghi phòng ăn, khu giặt là, phòng sinh hoạt cộng đồng và an ninh 24/7.
    `,
    highlights: [
      'Đại học đạt chuẩn kiểm định QS 5 sao trẻ nhất thế giới',
      'Hợp tác đào tạo cùng Đại học Cornell & Penn (Ivy League)',
      'Học bổng tài năng lên tới 100% học phí và sinh hoạt phí',
      'Đội ngũ giáo sư, tiến sĩ danh tiếng hàng đầu thế giới trực tiếp giảng dạy'
    ],
    image: ''
  },

  'crystal-lagoon': {
    id: 'crystal-lagoon',
    name: 'Biển hồ nước mặn Crystal Lagoon 6.1ha',
    projectId: 'ocean-park-1',
    scale: '6.1 ha (Biển hồ nước mặn nhân tạo giữa lòng Hà Nội)',
    category: 'Cảnh quan biển hồ & Vui chơi giải trí',
    status: 'Đã hoàn thiện & Đang mở cửa phục vụ cư dân',
    summary: 'Kỳ quan biển hồ nước mặn nhân tạo trong xanh rộng 6.1ha với bờ cát trắng mịn tự nhiên dài hàng km, mang đại dương về ngay trước hiên nhà cư dân Thủ đô.',
    contentSEO: `
Biển hồ nước mặn Crystal Lagoon 6.1 ha tại Vinhomes Ocean Park 1 do công ty công nghệ biển hồ hàng đầu thế giới Crystal Lagoons (Mỹ) trực tiếp triển khai công nghệ xử lý nước tiên tiến.

### Trải Nghiệm Biển Hồ Độc Đáo:
- **Làn Nước Xanh Ngọc Bích Chuẩn Độ Mặn Tự Nhiên:** Lọc liên tục và xử lý bằng công nghệ thân thiện với môi trường.
- **Bờ Cát Trắng Tự Nhiên Rộng Tới 35m:** Cát mịn vận chuyển từ biển Nha Trang tạo không gian dạo bộ, tắm nắng và tiệc nướng BBQ ngoài trời.
- **Hoạt Động Thể Thao Dưới Nước:** Chèo thuyền Kayak, lướt ván đứng SUP, tắm biển giữa lòng Hà Nội.
    `,
    highlights: [
      'Công nghệ xử lý nước biển độc quyền của Crystal Lagoons (Mỹ)',
      'Bờ cát trắng tự nhiên Nha Trang rộng 35m rợp bóng dừa',
      'Đặc quyền tắm biển & chèo thuyền Kayak cho cư dân'
    ],
    image: ''
  },

  'ho-ngoc-trai': {
    id: 'ho-ngoc-trai',
    name: 'Hồ nước ngọt Ngọc Trai 24.5ha',
    projectId: 'ocean-park-1',
    scale: '24.5 ha (Lớn gấp đôi Hồ Gươm)',
    category: 'Hồ cảnh quan & Điều hòa sinh thái',
    status: 'Đã hoàn thiện & Cư dân tập thể dục mỗi ngày',
    summary: 'Lá phổi xanh điều hòa không khí khổng lồ rộng 24.5ha với bờ cát trắng mịn và hàng chục tấn cá tự nhiên, bao quanh bởi đường chạy bộ rợp bóng cây xanh.',
    contentSEO: `
Hồ nước ngọt trung tâm Ngọc Trai quy mô 24.5 ha tại Vinhomes Ocean Park 1 là điểm nhấn sinh thái đắt giá nâng tầm chất lượng sống của toàn bộ cư dân.

### Điểm Nhấn Sinh Thái & Cảnh Quan:
- **Quy Mô Rộng Gấp 2 Lần Hồ Gươm:** Điều hòa vi khí hậu giúp toàn đô thị luôn mát mẻ hơn nội thành từ 2 - 3 độ C.
- **Đường Chạy Bộ & Đạp Xe Ven Hồ Dài 8.5km:** Trang bị hệ thống máy tập gym ngoài trời, chòi nghỉ ngơi và khu vực câu cá thư giãn.
- **Hệ Sinh Thái Thủy Sinh Phong Phú:** Thả hàng chục tấn cá chép, cá mè, cá trắm tự nhiên sinh trưởng.
    `,
    highlights: [
      'Lá phổi xanh quy mô 24.5ha điều hòa vi khí hậu mát mẻ',
      'Đường chạy bộ ven hồ 8.5km ngắm hoàng hôn tuyệt đẹp',
      'Hơn 50 điểm nướng BBQ ngoài trời ven hồ cát trắng'
    ],
    image: ''
  }
};
