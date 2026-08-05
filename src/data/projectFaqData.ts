export interface ProjectFaqItem {
  id: string;
  projectId: string; // e.g. 'ocean-park-1', 'ocean-park-2', 'ocean-park-3', 'ha-long-xanh', 'green-paradise-can-gio', 'tan-my-hau-nghia', 'green-city-hoc-mon', 'lang-van-da-nang', 'all'
  category: 'investor' | 'resident' | 'tenant' | 'legal_planning';
  question: string;
  answer: string;
  keywords: string[];
  updatedAt: string;
}

export const PROJECT_FAQ_DATA: ProjectFaqItem[] = [
  // --- 1. VINHOMES HẠ LONG XANH (QUẢNG NINH) ---
  {
    id: 'faq-hlx-01',
    projectId: 'ha-long-xanh',
    category: 'investor',
    question: 'Tên thương mại và quy mô chính thức của dự án Vinhomes Hạ Long Xanh là gì? Vị trí đắc địa ra sao?',
    answer: 'Tên thương mại chính thức: Vinhomes Hạ Long Xanh (Khu đô thị phức hợp Hạ Long Xanh; Tên thường gọi: Vin Hạ Long Xanh, Siêu đô thị Hạ Long Xanh). Dự án có quy mô cực khủng 4.110 ha với tổng vốn đầu tư hơn 10 tỷ USD, nằm tại vị trí chiến lược thuộc Thị xã Quảng Yên và TP. Hạ Long, Tỉnh Quảng Ninh. Nằm ngay cửa ngõ kết nối cao tốc Hà Nội - Hải Phòng - Hạ Long và tuyến đường ven biển quốc gia.',
    keywords: ['vinhomes hạ long xanh', 'vin hạ long xanh', 'đô thị hạ long xanh', 'đầu tư mua nhà', 'bất động sản quảng ninh'],
    updatedAt: '2026-07-26'
  },
  {
    id: 'faq-hlx-02',
    projectId: 'ha-long-xanh',
    category: 'investor',
    question: 'Vinhomes Hạ Long Xanh gồm những phân khu nào và tiện ích nội khu đẳng cấp ra sao?',
    answer: 'Dự án chia làm 5 phân khu chính: 1. Phân khu Hoàng Tân (đô thị du lịch sinh thái); 2. Phân khu Hà An (trung tâm tài chính & thương mại); 3. Phân khu Bến du thuyền Đảo; 4. Phân khu Sân Golf 36 hố tiêu chuẩn PGA; 5. Phân khu Căn hộ cao tầng sinh thái. Tiện ích nổi bật gồm: Công viên giải trí VinWonders Hạ Long Xanh, Sân Golf 36 hố, Bến du thuyền 5 sao, TTTM Vincom, Bệnh viện Vinmec Resort và Vinschool.',
    keywords: ['phân khu hạ long xanh', 'sân golf 36 hố', 'bến du thuyền hạ long xanh', 'vinwonders hạ long xanh'],
    updatedAt: '2026-07-26'
  },

  // --- 2. VINHOMES GREEN PARADISE CẦN GIỜ (TP.HCM) ---
  {
    id: 'faq-cg-01',
    projectId: 'green-paradise-can-gio',
    category: 'investor',
    question: 'Tên thương mại, tên thường gọi và vị trí lấn biển của Vinhomes Green Paradise Cần Giờ là gì?',
    answer: 'Tên thương mại chính thức: Vinhomes Green Paradise Cần Giờ (Vinhomes Long Beach Cần Giờ; Tên thường gọi: Vin Cần Giờ, Vinhomes Cần Giờ, Đô thị lấn biển Cần Giờ). Vị trí tọa lạc tại Xã Long Hòa và Thị trấn Cần Thạnh, Huyện Cần Giờ, TP. Hồ Chí Minh. Đây là siêu dự án lấn biển quy mô 2.870 ha với tổng vốn đầu tư hơn 10 tỷ USD, tạo đòn bẩy đưa Cần Giờ trở thành Thành phố biển đô thị loại 1.',
    keywords: ['vinhomes green paradise cần giờ', 'vin cần giờ', 'vinhomes cần giờ', 'đô thị lấn biển cần giờ', 'đầu tư mua nhà tphcm'],
    updatedAt: '2026-07-26'
  },
  {
    id: 'faq-cg-02',
    projectId: 'green-paradise-can-gio',
    category: 'legal_planning',
    question: 'Tiện ích biểu tượng và quy hoạch các phân khu chính tại Vinhomes Green Paradise Cần Giờ?',
    answer: 'Dự án gồm 5 phân khu A, B, C, D, E. Tiện ích độc bản nổi bật nhất là Tháp Tài Chính Biểu Tượng 108 Tầng (cao nhất Việt Nam tương lai), Biển hồ lấn biển Lagoon 400ha, Bến du thuyền siêu sang 6 sao, Công viên Safari Cần Giờ, Sân Golf 36 hố và tổ hợp thương mại Vincom Mega Mall.',
    keywords: ['tháp 108 tầng cần giờ', 'lagoon 400ha', 'bãi biển lấn biển cần giờ', 'quy hoạch cần giờ 2026'],
    updatedAt: '2026-07-26'
  },

  // --- 3. VINHOMES TÂN MỸ - HẬU NGHĨA (ĐỨC HÒA, LONG AN) ---
  {
    id: 'faq-la-01',
    projectId: 'tan-my-hau-nghia',
    category: 'investor',
    question: 'Tên thương mại, quy mô và lợi thế đầu tư dự án Vinhomes Tân Mỹ - Hậu Nghĩa Long An?',
    answer: 'Tên thương mại chính thức: Vinhomes Tân Mỹ - Hậu Nghĩa (Vinhomes Hậu Nghĩa Đức Hòa; Tên thường gọi: Vin Hậu Nghĩa, Vin Đức Hòa, Vinhomes Long An). Dự án có quy mô 197,2 ha tại Thị trấn Hậu Nghĩa & Xã Tân Mỹ, Huyện Đức Hòa, Long An. Vị trí tiếp giáp Tây Bắc TP.HCM, đón đầu sóng hạ tầng đường Vành Đai 3, Vành Đai 4 và tuyến Cao tốc TP.HCM - Mộc Bài.',
    keywords: ['vinhomes tân mỹ hậu nghĩa', 'vin hậu nghĩa', 'vin đức hòa', 'vinhomes long an', 'pháp lý mua nhà đức hòa'],
    updatedAt: '2026-07-26'
  },
  {
    id: 'faq-la-02',
    projectId: 'tan-my-hau-nghia',
    category: 'resident',
    question: 'Các phân khu diện tích và tiện ích sinh thái tại Vinhomes Hậu Nghĩa có gì đặc sắc?',
    answer: 'Dự án được chia thành các phân khu: Phân khu Biệt thự Sinh thái, Phân khu Shophouse Thương mại, Phân khu Căn hộ Cao tầng Hậu Nghĩa và Công viên Trung tâm. Tiện ích nổi bật có Công viên hồ điều hòa 15 ha, Vincom Plaza Hậu Nghĩa, Trường liên cấp Vinschool, Bệnh viện Vinmec, Trung tâm thể thao Olympic.',
    keywords: ['phân khu hậu nghĩa', 'diện tích biệt thự hậu nghĩa', 'vincom plaza hậu nghĩa', 'vinschool long an'],
    updatedAt: '2026-07-26'
  },

  // --- 4. VINHOMES GREEN CITY HÓC MÔN (TP.HCM) ---
  {
    id: 'faq-hm-01',
    projectId: 'green-city-hoc-mon',
    category: 'investor',
    question: 'Tên thương mại và quy hoạch siêu dự án Vinhomes Green City Hóc Môn như thế nào?',
    answer: 'Tên thương mại chính thức: Vinhomes Green City Hóc Môn (Khu đô thị Đại học Quốc tế Hóc Môn; Tên thường gọi: Vin Hóc Môn, Vinhomes Hóc Môn). Dự án có quy mô 924 ha nằm tại Xã Tân Thới Nhì, Huyện Hóc Môn, TP.HCM, nằm ngay mặt tiền Quốc Lộ 22 và tuyến đường Vành Đai 3. Đây là tâm điểm đô thị tri thức & công nghệ phía Tây Bắc TP.HCM.',
    keywords: ['vinhomes green city hóc môn', 'vin hóc môn', 'vinhomes hóc môn', 'đô thị đại học hóc môn', 'đầu tư hóc môn 2026'],
    updatedAt: '2026-07-26'
  },
  {
    id: 'faq-hm-02',
    projectId: 'green-city-hoc-mon',
    category: 'resident',
    question: 'Trường Đại học VinUni cơ sở 2 và hệ thống tiện ích tại Vinhomes Hóc Môn gồm những gì?',
    answer: 'Vinhomes Green City Hóc Môn sở hữu Làng Đại học Quốc tế với điểm nhấn là Đại học VinUni cơ sở 2, Bệnh viện đa khoa quốc tế Vinmec Hóc Môn, Công viên trung tâm 50ha, Trung tâm thương mại Vincom Mega Mall Hóc Môn và các khu nhà phố biệt thự sinh thái.',
    keywords: ['vinuni hóc môn', 'vinhomes hóc môn vành đai 3', 'tiện ích vinhomes hóc môn', 'làng đại học hóc môn'],
    updatedAt: '2026-07-26'
  },

  // --- 5. VINHOMES LÀNG VÂN ĐÀ NẴNG ---
  {
    id: 'faq-lv-01',
    projectId: 'lang-van-da-nang',
    category: 'investor',
    question: 'Tên thương mại, vị trí độc bản và tiềm năng của Vinhomes Làng Vân Đà Nẵng?',
    answer: 'Tên thương mại chính thức: Vinhomes Làng Vân Đà Nẵng (Khu du lịch sinh thái nghỉ dưỡng Làng Vân; Tên thường gọi: Vin Làng Vân, Siêu nghỉ dưỡng Làng Vân). Dự án quy mô 1.000 ha nằm tại chân đèo Hải Vân, Phường Hòa Hiệp Bắc, Quận Liên Chiểu, TP. Đà Nẵng. Vị trí biệt lập lưng tựa núi Hải Vân, mặt hướng Vịnh Nam Ô tuyệt đẹp, nằm sát Cảng nước sâu Liên Chiểu.',
    keywords: ['vinhomes làng vân đà nẵng', 'vin làng vân', 'vinhomes làng vân', 'bất động sản nghỉ dưỡng đà nẵng'],
    updatedAt: '2026-07-26'
  },
  {
    id: 'faq-lv-02',
    projectId: 'lang-van-da-nang',
    category: 'legal_planning',
    question: 'Các phân khu biệt thự biển và tiện ích giải trí đỉnh cao tại Vinhomes Làng Vân?',
    answer: 'Dự án bao gồm: Phân khu Biệt thự biển Đồi Hải Vân, Phân khu Condotel cao cấp, Phân khu Resort 6 sao Vinpearl Làng Vân và Tổ hợp Casino. Hệ tiện ích tiêu chuẩn 6 sao gồm Bến du thuyền quốc tế Liên Chiểu, Sân Golf 18 hố ven biển, Cáp treo Làng Vân, Công viên VinWonders và Trung tâm hội nghị quốc tế.',
    keywords: ['biệt thự làng vân', 'sân golf làng vân', 'cáp treo làng vân', 'bến du thuyền đà nẵng'],
    updatedAt: '2026-07-26'
  },

  // --- 6. VINHOMES OCEAN PARK 1, 2, 3 (SIÊU QUẦN THỂ OCEAN CITY) ---
  {
    id: 'faq-inv-01',
    projectId: 'ocean-park-2',
    category: 'investor',
    question: 'Sự khác biệt giữa Vinhomes Ocean Park 1, Ocean Park 2 và Ocean Park 3 là gì?',
    answer: 'Cả 3 đại đô thị hợp thành Siêu quần thể Ocean City 1.200 ha. Ocean Park 1 (420ha - Gia Lâm, Hà Nội) là Thành phố Biển hồ đã bàn giao 95% với Biển hồ Crystal Lagoon 6.1ha. Ocean Park 2 - The Empire (458ha - Văn Giang, Hưng Yên) nổi bật với Công viên sóng Royal Wave Park 18ha & Mega Grand World. Ocean Park 3 - Grand Park (294ha - Hưng Yên) điểm nhấn là Vịnh biển thiên đường Paradise Bay 12ha.',
    keywords: ['vinhomes ocean park 1 2 3', 'ocean city hưng yên gia lâm', 'biển hồ nước mặn', 'royal wave park'],
    updatedAt: '2026-07-26'
  },
  {
    id: 'faq-inv-02',
    projectId: 'ocean-park-2',
    category: 'investor',
    question: 'Tiềm năng tăng giá và tỷ suất lợi nhuận cho thuê tại Vinhomes Ocean Park 2 & 3 như thế nào?',
    answer: 'Vinhomes Ocean Park 2 & 3 sở hữu vị trí chiến lược ngay nút giao Cổ Linh & trục Vành Đai 3.5, Vành Đai 4. Tỷ suất lợi nhuận cho thuê shophouse kinh doanh thương mại hiện đạt 5.5% - 7%/năm nhờ lượng cư dân về ở đông đúc và tổ hợp Grand World. Khi cầu Trần Hưng Đạo và tuyến Vành Đai 4 hoàn thành, bất động sản tại đây được dự báo có dư địa tăng giá từ 25% - 40%.',
    keywords: ['vinhomes ocean park 2', 'đầu tư mua nhà', 'tăng giá bđs', 'lợi nhuận cho thuê', 'vành đai 4'],
    updatedAt: '2026-07-26'
  },

  // --- PHÁP LÝ & CƯ DÂN CHUNG ---
  {
    id: 'faq-leg-01',
    projectId: 'all',
    category: 'legal_planning',
    question: 'Hình thức sở hữu pháp lý của nhà phố, biệt thự và căn hộ Vinhomes là gì? Bao lâu có Sổ đỏ?',
    answer: 'Hầu hết các sản phẩm thấp tầng (Biệt thự, Liền kề, Shophouse) và căn hộ chung cư cao cấp Vinhomes có hình thức sở hữu Sổ đỏ lâu dài (Sổ hồng chính chủ). Sau khi nhận bàn giao nhà và hoàn thiện nghĩa vụ tài chính, chủ nhà sẽ được hỗ trợ làm thủ tục cấp Giấy chứng nhận quyền sử dụng đất trong vòng 3 đến 6 tháng.',
    keywords: ['pháp lý vinhomes', 'sổ đỏ lâu dài', 'hợp đồng mua bán hđmb', 'thủ tục cấp sổ hồng'],
    updatedAt: '2026-07-26'
  },
  {
    id: 'faq-res-01',
    projectId: 'all',
    category: 'resident',
    question: 'Chi phí quản lý, điện nước, gửi xe và sinh hoạt hằng tháng của cư dân Vinhomes là bao nhiêu?',
    answer: 'Phí dịch vụ quản lý Vinhomes dao động từ 8.000đ - 16.000đ/m2/tháng (tùy phân khu chung cư hoặc thấp tầng). Phí gửi xe ô tô khoảng 1.250.000đ/tháng, xe máy 45.000đ/tháng. Cư dân được miễn phí hoặc ưu đãi dịch vụ bể bơi, nướng BBQ, công viên công cộng, sân thể thao pickleball/tennis.',
    keywords: ['phí quản lý vinhomes', 'chi phí sinh hoạt cư dân', 'phí gửi xe vinhomes', 'tiện ích cư dân'],
    updatedAt: '2026-07-26'
  }
];
