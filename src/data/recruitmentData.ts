import { ProjectCategory } from '../types';

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

export const RECRUITMENT_INDUSTRIES = [
  { id: 'all', name: 'Tất cả ngành nghề', icon: 'Briefcase', count: 48 },
  { id: 'bat-dong-san', name: 'Bất Động Sản & Cho Thuê', icon: 'Building2', count: 18, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200' },
  { id: 'fb-am-thuc', name: 'F&B - Quán Ăn, Cafe & Pha Chế', icon: 'Utensils', count: 14, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200' },
  { id: 'giup-viec-gia-dinh', name: 'Giúp Việc, Chăm Bé & Nấu Ăn', icon: 'HeartHandshake', count: 12, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 border-pink-200' },
  { id: 'ky-thuat-xay-dung', name: 'Kỹ Thuật, Điện Nước & Điều Hòa', icon: 'Wrench', count: 9, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200' },
  { id: 'ban-hang-cskh', name: 'Bán Hàng, Thu Ngân & CSKH', icon: 'ShoppingBag', count: 11, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' },
  { id: 'marketing-it-design', name: 'Marketing, Thiết Kế & IT Media', icon: 'Sparkles', count: 8, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200' },
  { id: 'gia-su-giao-duc', name: 'Gia Sư, Dạy Kèm & Tiếng Anh', icon: 'GraduationCap', count: 7, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200' },
  { id: 'tai-xe-giao-hang', name: 'Tài Xế Buggy, Ô Tô & Shipper', icon: 'Car', count: 6, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200' },
  { id: 'spa-lam-dep', name: 'Spa, Nail, Cắt Tóc & Chăm Sóc Da', icon: 'Sparkles', count: 5, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200' },
  { id: 'bao-ve-an-ninh', name: 'Bảo Vệ, An Ninh & Quản Lý Tòa', icon: 'ShieldCheck', count: 4, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-300' },
  { id: 'hanh-chinh-ke-toan', name: 'Hành Chính, Kế Toán & Thu Ngân', icon: 'FileText', count: 5, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200' },
  { id: 'khac', name: 'Ngành Nghề Khác', icon: 'Grid', count: 3, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200' },
];

export const VIN_MAJOR_PROJECTS = [
  { id: 'ocean-park-1', name: 'Vinhomes Ocean Park 1 (Gia Lâm)' },
  { id: 'ocean-park-2', name: 'Vinhomes Ocean Park 2 (The Empire)' },
  { id: 'ocean-park-3', name: 'Vinhomes Ocean Park 3 (The Crown)' },
  { id: 'smart-city', name: 'Vinhomes Smart City (Tây Mỗ)' },
  { id: 'grand-park', name: 'Vinhomes Grand Park (TP. Thủ Đức)' }
];

export const INITIAL_RECRUITMENT_JOBS: RecruitmentJob[] = [
  {
    id: 'job-1',
    title: 'Tuyển 5 Chuyên Viên Môi Giới BĐS Vinhomes Ocean Park 1, 2, 3 (Hoa Hồng Tới 70% + Lương Cứng)',
    companyName: 'Công Ty BĐS Nhà Đẹp Vinhomes',
    industry: 'bat-dong-san',
    project: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2',
    location: 'Shophouse Chà Là 15-08, Vinhomes Ocean Park 2, Hưng Yên',
    jobType: 'full-time',
    salaryType: 'range',
    salaryDisplay: '15 - 50 Triệu / tháng (Lương cứng + Thưởng hoa hồng nóng)',
    minSalary: 15000000,
    maxSalary: 50000000,
    experience: 'under-1y',
    experienceDisplay: 'Chấp nhận chưa có kinh nghiệm, được đào tạo 1:1',
    description: 'Do nhu cầu mở rộng quy mô kinh doanh tại phân khu Ocean Park 2 & 3, công ty cần tuyển dụng 5 bạn Chuyên viên tư vấn Bất động sản nhiệt huyết, đam mê kiếm tiền.',
    requirements: [
      'Có laptop cá nhân, phương tiện đi lại',
      'Nhanh nhẹn, trung thực, giao tiếp tốt, đam mê bất động sản',
      'Cư dân sinh sống tại Vinhomes Ocean Park 1, 2, 3 hoặc khu vực Gia Lâm, Văn Giang là lợi thế lớn',
      'Có tinh thần học hỏi, cầu tiến và chịu được áp lực doanh số'
    ],
    benefits: [
      'Lương cứng 6.000.000đ - 10.000.000đ/tháng + Hoa hồng 60% - 70% doanh thu môi giới',
      'Được cấp nguồn Data khách nét cư dân có sẵn của công ty',
      'Hỗ trợ 100% ngân sách chạy Marketing, đăng tin VIP và làm video TikTok/Reels',
      'Môi trường làm việc trẻ trung, năng động tại Shophouse VIP mặt đường lớn',
      'Du lịch định kỳ 2 lần/năm, thưởng quý và thưởng Tết vượt KPI'
    ],
    contactName: 'Mr. Bùi Hiếu (Giám Đốc Kinh Doanh)',
    contactPhone: '0988112233',
    contactZalo: '0988112233',
    contactEmail: 'tuyendung@chocudan24h.com',
    status: 'active',
    isVip: true,
    isUrgent: true,
    viewsCount: 642,
    applicationsCount: 14,
    deadline: '2026-09-30',
    createdAt: '2026-08-10T08:00:00.000Z'
  },
  {
    id: 'job-2',
    title: 'Tuyển 2 Nhân Viên Pha Chế (Barista) & 3 Phục Vụ Quán Cafe Cư Dân S2.05',
    companyName: 'Tiệm Trà & Cafe Gió Biển S2.05',
    industry: 'fb-am-thuc',
    project: 'ocean-park-1',
    projectName: 'Vinhomes Ocean Park 1',
    location: 'Shophouse Khối Đế Tòa S2.05, Vinhomes Ocean Park 1, Gia Lâm, Hà Nội',
    jobType: 'shift',
    salaryType: 'hourly',
    salaryDisplay: '28.000đ - 35.000đ / giờ + Thưởng doanh thu ca',
    minSalary: 28000,
    maxSalary: 35000,
    experience: 'none',
    experienceDisplay: 'Không yêu cầu kinh nghiệm, được training pha chế',
    description: 'Quán Cafe cư dân thân thiện cần tuyển đồng đội Barista và Phục vụ ca sáng (06:30 - 12:30), ca chiều (12:30 - 18:30) hoặc ca tối (18:30 - 23:00).',
    requirements: [
      'Ưu tiên bạn sinh viên hoặc cư dân sống tại các tòa S1, S2 Ocean Park 1',
      'Chăm chỉ, nhanh nhẹn, vui vẻ, có trách nhiệm với ca làm',
      'Có khả năng xoay ca linh hoạt theo lịch học'
    ],
    benefits: [
      'Lương tính theo giờ + Phụ cấp ăn ca 30k/ca + Thưởng doanh thu',
      'Uống nước miễn phí tại quán trong giờ làm',
      'Được đào tạo tay nghề pha chế máy Espresso, trà sữa, sinh tố chuẩn bài'
    ],
    contactName: 'Chị Mai Lan',
    contactPhone: '0912345678',
    contactZalo: '0912345678',
    contactEmail: 'tiemtralangio@gmail.com',
    status: 'active',
    isVip: false,
    isUrgent: true,
    viewsCount: 420,
    applicationsCount: 9,
    deadline: '2026-09-15',
    createdAt: '2026-08-12T09:30:00.000Z'
  },
  {
    id: 'job-3',
    title: 'Cần Tìm Cô Giúp Việc Theo Giờ / Nấu Cơm Gia Đình Căn Hộ 3PN Tòa Tonkin 1',
    companyName: 'Gia Đình Chị Hằng (Cư Dân Tonkin 1)',
    industry: 'giup-viec-gia-dinh',
    project: 'smart-city',
    projectName: 'Vinhomes Smart City',
    location: 'Căn hộ TK1-1808, Phân khu The Tonkin, Vinhomes Smart City, Nam Từ Liêm, Hà Nội',
    jobType: 'part-time',
    salaryType: 'hourly',
    salaryDisplay: '70.000đ - 90.000đ / giờ (Làm 3-4 tiếng/ngày, nghỉ Chủ Nhật)',
    minSalary: 70000,
    maxSalary: 90000,
    experience: '1-3y',
    experienceDisplay: 'Cần có kinh nghiệm dọn dẹp chung cư cao cấp và nấu ăn ngon',
    description: 'Gia đình gồm 2 vợ chồng và 1 bé 6 tuổi cần cô giúp việc dọn dẹp nhà cửa, giặt ủi đồ và nấu bữa tối từ 16h30 đến 19h30 các ngày thứ 2 đến thứ 7.',
    requirements: [
      'Thật thà, sạch sẽ, ngăn nắp, có CCCD rõ ràng và giấy tờ tùy thân hợp lệ',
      'Nấu ăn ngon khẩu vị miền Bắc, biết bảo quản đồ gia dụng hiện đại (máy rửa bát, bếp từ, robot hút bụi)',
      'Ưu tiên cô bác đang sống gần khu vực Smart City hoặc Tây Mỗ'
    ],
    benefits: [
      'Mức lương trả đúng hạn theo tuần hoặc theo tháng (từ 5 - 7 triệu/tháng)',
      'Gia đình văn minh, tôn trọng người làm, thưởng lễ tết chu đáo',
      'Có ăn tối cùng gia đình nếu cô có nhu cầu'
    ],
    contactName: 'Chị Thu Hằng',
    contactPhone: '0978665544',
    contactZalo: '0978665544',
    status: 'active',
    isVip: false,
    isUrgent: false,
    viewsCount: 310,
    applicationsCount: 5,
    deadline: '2026-09-20',
    createdAt: '2026-08-14T10:15:00.000Z'
  },
  {
    id: 'job-4',
    title: 'Tuyển 2 Thợ Kỹ Thuật Điện Nước & Bảo Dưỡng Điều Hòa Nội Khu Lương 12-18 Triệu',
    companyName: 'Trung Tâm Cơ Điện & Kỹ Thuật Cư Dân 24H',
    industry: 'ky-thuat-xay-dung',
    project: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2',
    location: 'Văn phòng Kỹ Thuật San Hô 12, Vinhomes Ocean Park 2',
    jobType: 'full-time',
    salaryType: 'range',
    salaryDisplay: '12 - 18 Triệu / tháng + Phụ cấp xăng xe & đơn hàng',
    minSalary: 12000000,
    maxSalary: 18000000,
    experience: '1-3y',
    experienceDisplay: 'Kinh nghiệm từ 1 năm trong nghề điện nước dân dụng',
    description: 'Chuyên bảo trì, xử lý sự cố điện chập, rò rỉ nước, vệ sinh nạp gas điều hòa cho cư dân các biệt thự và chung cư trong đại đô thị.',
    requirements: [
      'Biết đọc sơ đồ điện nước cơ bản, có đồ nghề chuyên dụng cơ bản',
      'Trung thực, có mặt nhanh chóng khi có lệnh điều phối sự cố',
      'Có thái độ nhã nhặn, lịch sự khi vào nhà cư dân làm việc'
    ],
    benefits: [
      'Lương cứng 10.000.000đ + % hoa hồng trực tiếp trên từng đơn hàng hoàn thành',
      'Cấp đồng phục, bảo hộ lao động và đóng bảo hiểm đầy đủ sau thử việc',
      'Môi trường làm việc ổn định, lượng khách hàng cư dân dồi dào quanh năm'
    ],
    contactName: 'Anh Tuấn Kỹ Thuật',
    contactPhone: '0968112233',
    contactZalo: '0968112233',
    status: 'active',
    isVip: true,
    isUrgent: true,
    viewsCount: 512,
    applicationsCount: 7,
    deadline: '2026-10-05',
    createdAt: '2026-08-11T14:20:00.000Z'
  },
  {
    id: 'job-5',
    title: 'Tuyển Nhân Viên Bán Hàng & Thu Ngân Siêu Thị Mini VinMart+ S1.02',
    companyName: 'Siêu Thị Thực Phẩm Sạch & Tiện Lợi Cư Dân',
    industry: 'ban-hang-cskh',
    project: 'ocean-park-1',
    projectName: 'Vinhomes Ocean Park 1',
    location: 'Tầng 1 S1.02 Vinhomes Ocean Park 1, Gia Lâm',
    jobType: 'full-time',
    salaryType: 'range',
    salaryDisplay: '7.5 - 9.5 Triệu / tháng',
    minSalary: 7500000,
    maxSalary: 9500000,
    experience: 'none',
    experienceDisplay: 'Không yêu cầu kinh nghiệm, hướng dẫn dùng máy POS',
    description: 'Kiểm kê hàng hóa, trưng bày quầy kệ gọn gàng, thanh toán tiền cho khách hàng cư dân qua máy POS và quét mã VietQR.',
    requirements: [
      'Độ tuổi 18 - 35, tính cách cẩn thận, trung thực, hòa nhã',
      'Có thể làm theo ca 8 tiếng (Ca sáng: 6h-14h, Ca chiều: 14h-22h)'
    ],
    benefits: [
      'Lương cứng + Thưởng doanh số siêu thị hàng tháng',
      'Môi trường làm việc mát mẻ, điều hòa 24/7',
      'Ưu tiên giảm giá khi mua hàng thực phẩm tại cửa hàng'
    ],
    contactName: 'Quản lý Thu Trang',
    contactPhone: '0945998877',
    contactZalo: '0945998877',
    status: 'active',
    isVip: false,
    isUrgent: false,
    viewsCount: 290,
    applicationsCount: 11,
    deadline: '2026-09-25',
    createdAt: '2026-08-13T11:00:00.000Z'
  },
  {
    id: 'job-6',
    title: 'Tuyển Gia Sư Tiếng Anh Dạy Kèm 2 Bé Lớp 3 & Lớp 5 Khu Biệt Thự Ngọc Trai',
    companyName: 'Gia Đình Anh Long (Khu Ngọc Trai)',
    industry: 'gia-su-giao-duc',
    project: 'ocean-park-1',
    projectName: 'Vinhomes Ocean Park 1',
    location: 'Biệt thự NT-06, Khu Ngọc Trai, Vinhomes Ocean Park 1',
    jobType: 'part-time',
    salaryType: 'hourly',
    salaryDisplay: '250.000đ - 350.000đ / buổi (90 phút)',
    minSalary: 250000,
    maxSalary: 350000,
    experience: '1-3y',
    experienceDisplay: 'Yêu cầu phát âm chuẩn, có chứng chỉ IELTS ≥ 7.0 hoặc tốt nghiệp ĐH Ngoại Ngữ',
    description: 'Dạy giao tiếp, ngữ pháp và hỗ trợ các bé làm bài tập trường Vinschool. Mỗi tuần 3 buổi vào các tối thứ 2, 4, 6.',
    requirements: [
      'Sinh viên năm cuối hoặc giáo viên có kinh nghiệm dạy học sinh tiểu học Vinschool',
      'Phương pháp dạy vui tươi, kiên nhẫn, truyền cảm hứng học tập'
    ],
    benefits: [
      'Thu nhập ổn định 3 - 4.5 triệu/tháng chỉ với 3 buổi/tuần',
      'Thưởng thêm nếu các bé đạt điểm thi cao trên lớp'
    ],
    contactName: 'Anh Hoàng Long',
    contactPhone: '0933221100',
    contactZalo: '0933221100',
    status: 'active',
    isVip: false,
    isUrgent: true,
    viewsCount: 380,
    applicationsCount: 8,
    deadline: '2026-09-18',
    createdAt: '2026-08-14T15:40:00.000Z'
  }
];

export const INITIAL_CANDIDATE_PROFILES: CandidateProfile[] = [
  {
    id: 'bui-van-hieu',
    userId: 'u-cand-bui-van-hieu',
    fullName: 'Bùi Văn Hiếu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    birthYear: 1998,
    gender: 'nam',
    phone: '0868.499.929',
    email: 'kinhdoanh1.fpt@gmail.com',
    zalo: '0868.499.929',
    currentProject: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2',
    currentAddress: 'Phân khu San Hô, Vinhomes Ocean Park 2',
    targetJobTitle: 'Nhân viên kinh doanh BĐS / Quản lý cửa hàng',
    primaryIndustry: 'bat-dong-san',
    subIndustries: ['fb-am-thuc', 'dich-vu-cu-dan'],
    workTypePreference: ['full-time', 'part-time'],
    expectedSalary: '12 - 18 Triệu/tháng',
    experienceLevel: '1-3y',
    yearsOfExp: 2,
    introduction: 'Cư dân sinh sống tại nội khu đô thị, năng động, nhiệt tình, có kinh nghiệm giao tiếp và phục vụ khách hàng chu đáo.',
    skills: ['Giao tiếp đàm phán', 'Hiểu rõ nội khu Vinhomes', 'Tin học văn phòng', 'Chăm sóc khách hàng'],
    workExperience: [
      {
        company: 'Đại lý BĐS Đất Vàng Vinhomes',
        role: 'Chuyên viên tư vấn căn hộ',
        period: '01/2023 - Hiện tại',
        description: 'Tư vấn mua bán, chuyển nhượng và cho thuê căn hộ, shophouse Ocean Park 1, 2, 3.'
      }
    ],
    education: [
      {
        school: 'Đại học Kinh Tế Quốc Dân',
        major: 'Quản trị kinh doanh',
        period: '2016 - 2020',
        degree: 'Cử nhân'
      }
    ],
    certificates: ['Chứng chỉ Môi giới BĐS', 'Chứng chỉ Tin học MOS'],
    isLookingForJob: true,
    isImmediate: true,
    unlockPriceVnd: 20000,
    unlockedByUserIds: ['admin', 'u-cand-bui-van-hieu'],
    viewsCount: 350,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'cand-1',
    userId: 'u-cand-101',
    fullName: 'Nguyễn Văn Minh',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    birthYear: 1996,
    gender: 'nam',
    phone: '0987654321',
    email: 'minh.nguyen96@gmail.com',
    zalo: '0987654321',
    currentProject: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2',
    currentAddress: 'Căn C15-12, Phân Khu Chà Là, Vinhomes Ocean Park 2',
    targetJobTitle: 'Trưởng Nhóm / Chuyên Viên Cao Cấp BĐS Vinhomes',
    primaryIndustry: 'bat-dong-san',
    subIndustries: ['ban-hang-cskh', 'marketing-it-design'],
    workTypePreference: ['full-time', 'freelance'],
    expectedSalary: '20 - 35 Triệu / tháng',
    experienceLevel: '3-5y',
    yearsOfExp: 4,
    introduction: 'Tôi có hơn 4 năm kinh nghiệm làm môi giới BĐS thực chiến tại khu vực phía Đông Hà Nội, am hiểu sâu sắc quy hoạch và mặt bằng Ocean Park 1, 2, 3. Đã từng dẫn dắt nhóm kinh doanh đạt doanh số 150 tỷ giao dịch năm 2025.',
    skills: [
      'Tư vấn & Chốt deal BĐS triệu USD',
      'Đàm phán chuyển nhượng & Hợp đồng mua bán',
      'Chạy quảng cáo Facebook Ads / Google Ads',
      'Sáng tạo Video Review nhà thực tế TikTok/Youtube',
      'Quản lý đội ngũ telesale & chăm sóc khách hàng VIP'
    ],
    workExperience: [
      {
        company: 'Sàn Bất Động Sản CenLand Chi Nhánh Đông Hà Nội',
        role: 'Trưởng Nhóm Kinh Doanh',
        period: '2023 - 2025',
        description: 'Quản lý team 8 nhân viên, trực tiếp phân phối quỹ căn chuyển nhượng thấp tầng Ocean Park 2 và chung cư Masteri Waterfront.'
      },
      {
        company: 'Công ty Cổ phần Địa Ốc Đất Xanh Miền Bắc',
        role: 'Chuyên Viên Tư Vấn BĐS',
        period: '2021 - 2023',
        description: 'Tư vấn bán hàng các dự án căn hộ cao cấp Vinhomes Smart City và Grand Park.'
      }
    ],
    education: [
      {
        school: 'Đại Học Kinh Tế Quốc Dân (NEU)',
        major: 'Bất Động Sản & Kinh Tế Tài Nguyên',
        period: '2014 - 2018',
        degree: 'Cử nhân loại Giỏi'
      }
    ],
    certificates: [
      'Chứng chỉ hành nghề Môi giới Bất động sản do Sở Xây Dựng cấp',
      'Chứng chỉ Digital Marketing Google & Meta Certified'
    ],
    isLookingForJob: true,
    isImmediate: true,
    unlockPriceVnd: 50000,
    unlockedByUserIds: ['admin', 'u-employer-1'],
    viewsCount: 185,
    createdAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z'
  },
  {
    id: 'cand-2',
    userId: 'u-cand-102',
    fullName: 'Trần Thị Thu Hà',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    birthYear: 1999,
    gender: 'nu',
    phone: '0912888999',
    email: 'thuha.tran99@gmail.com',
    zalo: '0912888999',
    currentProject: 'ocean-park-1',
    projectName: 'Vinhomes Ocean Park 1',
    currentAddress: 'Tòa S2.16 - Căn hộ 2210, Vinhomes Ocean Park 1',
    targetJobTitle: 'Quản Lý Cửa Hàng / Trưởng Ca F&B / Barista Chuyên Nghiệp',
    primaryIndustry: 'fb-am-thuc',
    subIndustries: ['ban-hang-cskh'],
    workTypePreference: ['full-time', 'shift'],
    expectedSalary: '10 - 15 Triệu / tháng',
    experienceLevel: '1-3y',
    yearsOfExp: 3,
    introduction: 'Có 3 năm kinh nghiệm làm Trưởng ca tại chuỗi Highlands Coffee và Phúc Long. Có tay nghề pha chế máy Espresso, Latte Art, kiểm soát nguyên vật liệu và quản lý nhân sự ca làm việc.',
    skills: [
      'Pha chế Barista & Latte Art chuyên sâu',
      'Quản lý quầy bar, kiểm kê cost nguyên vật liệu',
      'Sử dụng thành thạo phần mềm CukCuk, iPOS, KiotViet',
      'Kỹ năng giải quyết khiếu nại khách hàng khéo léo',
      'Tiếng Anh giao tiếp tốt (IELTS 6.5)'
    ],
    workExperience: [
      {
        company: 'Highlands Coffee Ocean Park 1',
        role: 'Trưởng Ca Vận Hành (Shift Leader)',
        period: '2023 - 2025',
        description: 'Điều phối ca 6 nhân viên, đảm bảo tiêu chuẩn an toàn vệ sinh thực phẩm và nâng cao trải nghiệm khách hàng.'
      }
    ],
    education: [
      {
        school: 'Cao Đẳng Du Lịch Hà Nội',
        major: 'Quản Trị Nhà Hàng & Dịch Vụ Ăn Uống',
        period: '2017 - 2020',
        degree: 'Bằng Khá'
      }
    ],
    certificates: ['SCA Specialty Coffee Barista Skills Intermediate'],
    isLookingForJob: true,
    isImmediate: true,
    unlockPriceVnd: 50000,
    unlockedByUserIds: [],
    viewsCount: 142,
    createdAt: '2026-08-08T14:30:00.000Z',
    updatedAt: '2026-08-14T11:20:00.000Z'
  },
  {
    id: 'cand-3',
    userId: 'u-cand-103',
    fullName: 'Lê Văn Hùng',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    birthYear: 1990,
    gender: 'nam',
    phone: '0977334455',
    email: 'kythuat.hungvan@gmail.com',
    zalo: '0977334455',
    currentProject: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2',
    currentAddress: 'Khu San Hô 15, Ocean Park 2',
    targetJobTitle: 'Thợ Kỹ Thuật Trưởng / Giám Sát Cơ Điện Lạnh & Thang Máy',
    primaryIndustry: 'ky-thuat-xay-dung',
    subIndustries: ['ky-thuat-xay-dung'],
    workTypePreference: ['full-time', 'freelance'],
    expectedSalary: '15 - 22 Triệu / tháng',
    experienceLevel: 'above-5y',
    yearsOfExp: 8,
    introduction: 'Thợ điện nước lành nghề với 8 năm kinh nghiệm chuyên thi công, sửa chữa hệ thống điện 3 pha, điều hòa âm trần VRV/Multi, máy bơm nước tăng áp và thang máy gia đình biệt thự.',
    skills: [
      'Sửa chữa điện chập, cân tải tủ điện 3 pha',
      'Lắp đặt & Bảo dưỡng điều hòa Multi, VRV Daikin/Panasonic',
      'Hệ thống cấp thoát nước, máy lọc nước trung tâm',
      'Đọc bản vẽ kỹ thuật CAD và thi công hoàn thiện thấp tầng',
      'Có đầy đủ máy đo điện, máy hàn nhiệt, máy hút chân không chuyên nghiệp'
    ],
    workExperience: [
      {
        company: 'Công ty Cơ Điện Vinhomes Services',
        role: 'Kỹ Sư Vận Hành Tòa Nhà',
        period: '2019 - 2024',
        description: 'Bảo trì hệ thống cơ điện M&E phân khu căn hộ cao tầng và shophouse dịch vụ.'
      }
    ],
    education: [
      {
        school: 'Đại Học Công Nghiệp Hà Nội',
        major: 'Kỹ Thuật Điện - Điện Tử Dân Dụng',
        period: '2008 - 2012',
        degree: 'Kỹ Sư'
      }
    ],
    certificates: ['Chứng chỉ An toàn điện bậc 4/5', 'Chứng chỉ thợ hàn áp lực'],
    isLookingForJob: true,
    isImmediate: true,
    unlockPriceVnd: 50000,
    unlockedByUserIds: [],
    viewsCount: 220,
    createdAt: '2026-08-09T08:00:00.000Z',
    updatedAt: '2026-08-15T16:00:00.000Z'
  },
  {
    id: 'cand-4',
    userId: 'u-cand-104',
    fullName: 'Bác Nguyễn Thị Lành',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    birthYear: 1974,
    gender: 'nu',
    phone: '0965112244',
    email: 'baclanh.giupviec@gmail.com',
    zalo: '0965112244',
    currentProject: 'smart-city',
    projectName: 'Vinhomes Smart City',
    currentAddress: 'Tòa S4.01, Vinhomes Smart City, Tây Mỗ',
    targetJobTitle: 'Giúp Việc Gia Đình Theo Giờ / Chăm Bé / Nấu Cơm Cư Dân',
    primaryIndustry: 'giup-viec-gia-dinh',
    subIndustries: ['giup-viec-gia-dinh'],
    workTypePreference: ['part-time', 'shift'],
    expectedSalary: '80.000đ - 100.000đ / giờ (Hoặc 6 - 8 Triệu/tháng)',
    experienceLevel: 'above-5y',
    yearsOfExp: 7,
    introduction: 'Bác Lành 52 tuổi, tính tình hiền lành, sạch sẽ, thật thà và có trách nhiệm cao. Đã có 7 năm kinh nghiệm giúp việc gia đình, chăm sóc em bé từ 6 tháng tuổi và nấu các món ăn gia đình ngon miệng, hợp vệ sinh.',
    skills: [
      'Dọn dẹp nhà cửa ngăn nắp, biết ủi quần áo sơ mi thẳng thớm',
      'Nấu ăn chuẩn vị Bắc, biết nấu cháo dinh dưỡng cho trẻ nhỏ',
      'Chăm sóc trẻ em chu đáo, kiên nhẫn bón ăn và chơi cùng bé',
      'Biết sử dụng máy giặt sấy, robot hút bụi, máy rửa chén',
      'Có giấy tờ tùy thân CCCD gắn chip gốc, lý lịch trong sạch'
    ],
    workExperience: [
      {
        company: 'Giúp việc gia đình cư dân tòa S1.03 Smart City',
        role: 'Giúp Việc Theo Giờ & Đón Bé Đi Học Về',
        period: '2022 - 2025',
        description: 'Dọn dẹp căn hộ 2PN+, nấu bữa tối và đón bé học trường Vinschool về tắm rửa cho bé.'
      }
    ],
    education: [
      {
        school: 'Phổ Thông Trung Học Nam Định',
        major: 'Tốt nghiệp THPT',
        period: '1989 - 1992'
      }
    ],
    isLookingForJob: true,
    isImmediate: true,
    unlockPriceVnd: 50000,
    unlockedByUserIds: [],
    viewsCount: 310,
    createdAt: '2026-08-11T13:00:00.000Z',
    updatedAt: '2026-08-16T08:00:00.000Z'
  },
  {
    id: 'cand-5',
    userId: 'u-cand-105',
    fullName: 'Hoàng Minh Châu',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    birthYear: 2002,
    gender: 'nu',
    phone: '0934567123',
    email: 'chau.hoangielts@gmail.com',
    zalo: '0934567123',
    currentProject: 'ocean-park-1',
    projectName: 'Vinhomes Ocean Park 1',
    currentAddress: 'Tòa Masteri Waterfront M2, Ocean Park 1',
    targetJobTitle: 'Gia Sư Tiếng Anh / Giáo Viên Dạy Kèm Tiểu Học & THCS',
    primaryIndustry: 'gia-su-giao-duc',
    subIndustries: ['marketing-it-design'],
    workTypePreference: ['part-time', 'freelance'],
    expectedSalary: '250.000đ - 400.000đ / buổi',
    experienceLevel: '1-3y',
    yearsOfExp: 2,
    introduction: 'Sinh viên năm cuối ĐH Hà Nội (HANU), đạt IELTS 8.0 overall (Speaking 8.5, Listening 8.5). Có 2 năm kinh nghiệm dạy kèm tiếng Anh giao tiếp và luyện thi chứng chỉ Cambridge Flyers/KET/PET cho các bạn nhỏ cư dân.',
    skills: [
      'IELTS 8.0 (Chứng chỉ còn hạn đến 2027)',
      'Phát âm chuẩn Anh - Mỹ, phương pháp giảng dạy TPR sinh động',
      'Kiên nhẫn, gần gũi và tạo động lực học tập cho trẻ',
      'Hỗ trợ giáo trình Vinschool, Cambridge Primary Global English'
    ],
    workExperience: [
      {
        company: 'Trung Tâm Anh Ngữ Vinschool Satellite',
        role: 'Trợ Giảng & Gia Sư Riêng Cư Dân',
        period: '2023 - Nay',
        description: 'Dạy kèm cho hơn 15 học sinh cư dân Ocean Park 1 đạt kết quả thi học kỳ điểm 9-10.'
      }
    ],
    education: [
      {
        school: 'Trường Đại Học Hà Nội (HANU)',
        major: 'Ngôn Ngữ Anh - Chuyên ngành Sư Phạm',
        period: '2021 - 2025',
        degree: 'Sinh viên Giỏi'
      }
    ],
    certificates: ['IELTS 8.0 Academic Certificate', 'TESOL Teaching Certificate 120 Hours'],
    isLookingForJob: true,
    isImmediate: true,
    unlockPriceVnd: 50000,
    unlockedByUserIds: [],
    viewsCount: 168,
    createdAt: '2026-08-12T10:00:00.000Z',
    updatedAt: '2026-08-15T18:00:00.000Z'
  },
  {
    id: 'cand-6',
    userId: 'u-cand-106',
    fullName: 'Đỗ Văn Thành',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    birthYear: 1994,
    gender: 'nam',
    phone: '0904556677',
    email: 'thanhdo.driver@gmail.com',
    zalo: '0904556677',
    currentProject: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2',
    currentAddress: 'Phân Khu Đảo Dừa 08, Ocean Park 2',
    targetJobTitle: 'Tài Xế Riêng Cho Sếp / Lái Xe Buggy & Đưa Đón Học Sinh Vinschool',
    primaryIndustry: 'tai-xe-giao-hang',
    subIndustries: ['bao-ve-an-ninh'],
    workTypePreference: ['full-time', 'shift'],
    expectedSalary: '12 - 16 Triệu / tháng',
    experienceLevel: '3-5y',
    yearsOfExp: 6,
    introduction: 'Có bằng lái xe hạng D, kinh nghiệm 6 năm lái xe cho lãnh đạo tập đoàn và đưa đón học sinh. Lái xe điềm đạm, giữ xe sạch sẽ, tuyệt đối không uống rượu bia trong giờ làm.',
    skills: [
      'Bằng lái xe B2, C, D còn hạn dài',
      'Thông thạo mọi cung đường Hà Nội - Hải Phòng - Hưng Yên - Quảng Ninh',
      'Biết kiểm tra bảo dưỡng dầu máy, lốp, phanh xe định kỳ',
      'Đúng giờ, giữ kín thông tin cá nhân của gia chủ'
    ],
    workExperience: [
      {
        company: 'Công ty Cổ phần Vận Tải Cư Dân Xanh',
        role: 'Tài Xế Xe Đưa Đón Học Sinh Vinschool OCP1 & OCP2',
        period: '2022 - 2025',
        description: 'Đảm bảo an toàn 100% trên mọi chuyến đi cho các em học sinh cư dân.'
      }
    ],
    education: [
      {
        school: 'Trường Trung Cấp Nghề Giao Thông Vận Tải',
        major: 'Lái Xe Ô Tô Chuyên Nghiệp Hạng D',
        period: '2016 - 2017'
      }
    ],
    certificates: ['Bằng Lái Hạng D', 'Giấy khám sức khỏe lái xe định kỳ loại 1'],
    isLookingForJob: true,
    isImmediate: true,
    unlockPriceVnd: 50000,
    unlockedByUserIds: [],
    viewsCount: 195,
    createdAt: '2026-08-13T09:00:00.000Z',
    updatedAt: '2026-08-16T07:30:00.000Z'
  }
];

export interface EmployerProfile {
  id: string;
  userId?: string;
  companyName: string;
  brandName?: string;
  logoUrl?: string;
  bannerUrl?: string;
  tagline?: string;
  industry: string;
  project: ProjectCategory | string;
  projectName?: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactZalo?: string;
  contactEmail?: string;
  website?: string;
  facebookUrl?: string;
  introduction: string;
  scaleSize?: string;
  verified?: boolean;
  activeJobsCount?: number;
  totalViews?: number;
  createdAt?: string;
}

export const INITIAL_EMPLOYERS: EmployerProfile[] = [
  {
    id: 'emp-01',
    userId: 'u-emp-01',
    companyName: 'Công Ty BĐS Nhà Đẹp Vinhomes',
    brandName: 'Nhà Đẹp Vinhomes Real Estate',
    logoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Đơn Vị Phân Phối & Cho Thuê BĐS Thấp Tầng Hàng Đầu Tại Ocean Park 1, 2, 3',
    industry: 'Bất Động Sản & Môi Giới',
    project: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2',
    address: 'Shophouse Chà Là 15-08 & San Hô 06-12, Vinhomes Ocean Park 2, Hưng Yên',
    contactName: 'Mr. Hiếu Bùi - Giám Đốc Kinh Doanh',
    contactPhone: '0988112233',
    contactZalo: '0988112233',
    contactEmail: 'tuyendung.nhadepvinhomes@gmail.com',
    website: 'https://chocudan24h.com',
    facebookUrl: 'https://facebook.com/nhadepvinhomes',
    introduction: 'Công ty BĐS Nhà Đẹp Vinhomes với hơn 5 năm kinh nghiệm chuyên sâu tại các đại đô thị Vinhomes Ocean Park 1, 2, 3 và Vinhomes Smart City. Chúng tôi quản lý giỏ hàng hơn 1.000 căn biệt thự, liền kề, shophouse và quỹ căn chuyển nhượng độc quyền. Môi trường làm việc năng động, đào tạo 1:1, hoa hồng hấp dẫn chi trả ngay trong tuần.',
    scaleSize: '20 - 50 nhân sự',
    verified: true,
    activeJobsCount: 2,
    totalViews: 3450,
    createdAt: '2026-06-01'
  },
  {
    id: 'emp-02',
    userId: 'u-emp-02',
    companyName: 'Hệ Thống Trà Sữa & Quán Cà Phê The Ocean Chill Cafe',
    brandName: 'The Ocean Chill Cafe & Bakery',
    logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Không Gian Cà Phê View Biển Tạo Sóng Đẹp Nhất Ocean Park 2',
    industry: 'F&B - Nhà Hàng & Cafe',
    project: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2',
    address: 'Căn Cọ Xanh 04-26 (Đối diện Công viên Sóng Wave Park), Ocean Park 2',
    contactName: 'Chị Lan Quản Lý',
    contactPhone: '0988665544',
    contactZalo: '0988665544',
    contactEmail: 'theoceanchill@gmail.com',
    introduction: 'The Ocean Chill là chuỗi quán cafe kết hợp bánh ngọt phong cách Địa Trung Hải, phục vụ cư dân và du khách tại Ocean City. Chúng tôi cam kết môi trường làm việc trẻ trung, linh hoạt thời gian theo ca cho học sinh sinh viên cư dân.',
    scaleSize: '10 - 20 nhân sự',
    verified: true,
    activeJobsCount: 2,
    totalViews: 1890,
    createdAt: '2026-06-15'
  },
  {
    id: 'emp-03',
    userId: 'u-emp-03',
    companyName: 'Trung Tâm Dịch Vụ Kỹ Thuật Điện Nước Vinhomes FixPro',
    brandName: 'FixPro Resident Services',
    logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Dịch Vụ Kỹ Thuật, Điện Lạnh & Bảo Dưỡng Nội Thất 24/7 Cho Cư Dân',
    industry: 'Kỹ Thuật & Xây Dựng',
    project: 'ocean-park-3',
    projectName: 'Vinhomes Ocean Park 3',
    address: 'Phân khu Phố Biển 08-15, Ocean Park 3',
    contactName: 'Kỹ sư Tuấn',
    contactPhone: '0912334455',
    contactZalo: '0912334455',
    contactEmail: 'hotro.fixpro@gmail.com',
    introduction: 'Đội ngũ kỹ thuật lành nghề chuyên sửa chữa điều hòa, điện nước, thông tắc và bảo dưỡng nhà thông minh cho hơn 3.000 căn hộ tại Ocean Park 1, 2, 3.',
    scaleSize: '15 - 30 nhân sự',
    verified: true,
    activeJobsCount: 1,
    totalViews: 1220,
    createdAt: '2026-07-01'
  }
];

export interface RecruitmentPackage {
  id: string;
  name: string;
  slug: string;
  priceToken: number;
  priceVnd: number;
  originalPriceToken?: number;
  jobPostLimit: number;
  jobPostsCount: number;
  cvUnlockLimit: number;
  cvUnlockCount: number;
  vipDaysDuration: number;
  durationDays: number;
  isPopular?: boolean;
  badge?: string;
  isVipBadge?: boolean;
  isTopPlacement?: boolean;
  description: string;
  features: string[];
}

export const RECRUITMENT_PACKAGES: RecruitmentPackage[] = [
  {
    id: 'pack-starter',
    name: 'Gói Tuyển Dụng Khởi Nghiệp',
    slug: 'khoi-nghiep',
    priceToken: 50000,
    priceVnd: 500000,
    originalPriceToken: 70000,
    jobPostLimit: 3,
    jobPostsCount: 3,
    cvUnlockLimit: 5,
    cvUnlockCount: 5,
    vipDaysDuration: 15,
    durationDays: 30,
    isPopular: false,
    description: 'Phù hợp cho cá nhân kinh doanh, shop nhỏ hoặc gia đình cần tìm người phụ việc, gia sư, thu ngân.',
    features: [
      'Đăng tối đa 03 tin tuyển dụng (Hiển thị 30 ngày)',
      'Tặng 05 lượt mở khóa CV ứng viên trực tuyến',
      'Được gán nhãn Tin Cư Dân Xác Thực',
      'Tự động gửi thông báo đến ứng viên nội khu'
    ]
  },
  {
    id: 'pack-pro-shop',
    name: 'Gói Shophouse & Cửa Hàng VIP',
    slug: 'shop-vip',
    priceToken: 150000,
    priceVnd: 1200000,
    originalPriceToken: 200000,
    jobPostLimit: 10,
    jobPostsCount: 10,
    cvUnlockLimit: 20,
    cvUnlockCount: 20,
    vipDaysDuration: 30,
    durationDays: 60,
    isPopular: true,
    isVipBadge: true,
    badge: '🔥 ĐƯỢC CHỌN NHIỀU NHẤT',
    description: 'Dành cho các nhà hàng F&B, quán cafe, shop thời trang và văn phòng công ty cần tuyển dụng đều đặn.',
    features: [
      'Đăng tối đa 10 tin tuyển dụng',
      'Tặng 20 lượt mở khóa hồ sơ CV chi tiết',
      'Ghim TOP 1 tin tuyển dụng VIP Kim Cương',
      'Huy hiệu Doanh Nghiệp Uy Tín có tick xanh KYC',
      'Đẩy Top tin tự động 1 lần/ngày'
    ]
  },
  {
    id: 'pack-enterprise',
    name: 'Gói Doanh Nghiệp Toàn Diện',
    slug: 'doanh-nghiep-vip',
    priceToken: 300000,
    priceVnd: 2500000,
    originalPriceToken: 450000,
    jobPostLimit: 30,
    jobPostsCount: 30,
    cvUnlockLimit: 60,
    cvUnlockCount: 60,
    vipDaysDuration: 60,
    durationDays: 90,
    isPopular: false,
    isVipBadge: true,
    isTopPlacement: true,
    badge: '⭐ DOANH NGHIỆP LỚN',
    description: 'Giải pháp tuyển dụng quy mô lớn cho chuỗi kinh doanh, sàn giao dịch BĐS, trung tâm dịch vụ kỹ thuật.',
    features: [
      'Đăng tối đa 30 tin tuyển dụng đa phân khu',
      'Tặng 60 lượt mở khóa CV không giới hạn',
      'Banner thương hiệu nhà tuyển dụng trên trang Tuyển Dụng',
      'Được ưu tiên xuất hiện trong bản tin Zalo Tuyển Dụng Tuần',
      'Hỗ trợ lọc & gợi ý ứng viên phù hợp qua Zalo Hotline riêng'
    ]
  },
  {
    id: 'pack-speed-vip',
    name: 'Gói Tuyển Dụng Thần Tốc VIP 24/7',
    slug: 'tuyen-dung-than-toc',
    priceToken: 500000,
    priceVnd: 6000000,
    originalPriceToken: 750000,
    jobPostLimit: 100,
    jobPostsCount: 100,
    cvUnlockLimit: 150,
    cvUnlockCount: 150,
    vipDaysDuration: 90,
    durationDays: 365,
    isPopular: false,
    isVipBadge: true,
    isTopPlacement: true,
    badge: '🚀 TUYỂN GẤP SIÊU TỐC',
    description: 'Dịch vụ tuyển dụng cam kết hỗ trợ tối đa, phân bổ trực tiếp cho Admin ban tuyển dụng phụ trách.',
    features: [
      'Không giới hạn số lượng tin tuyển dụng đăng tải',
      'Tặng 150 lượt mở khóa CV ứng viên chất lượng cao',
      'Ghim trang chủ toàn hệ thống Cổng Việc Làm Cư Dân',
      'Có chuyên viên Admin ban Tuyển dụng riêng hỗ trợ kết nối ứng viên',
      'Bảo hành tuyển dụng: Hỗ trợ bù lượt ứng viên trong 90 ngày'
    ]
  }
];

export const INITIAL_EMPLOYER_REGISTRATIONS = [
  {
    id: 'reg-emp-101',
    userId: 'user-02',
    companyName: 'Nhà Hàng Lẩu Hải Sản San Hô Quán',
    brandName: 'San Hô Quán Ocean Park 2',
    industry: 'F&B - Nhà Hàng & Cafe',
    taxCode: '0109887766',
    project: 'ocean-park-2',
    address: 'San Hô 06-88, Vinhomes Ocean Park 2',
    contactName: 'Anh Long (Chủ quán)',
    contactPhone: '0988.112.233',
    contactZalo: '0988.112.233',
    contactEmail: 'sanhoquan.ocp2@gmail.com',
    selectedPackageId: 'pack-pro-shop',
    selectedPackageName: 'Gói Shophouse & Cửa Hàng VIP',
    tokenCost: 150000,
    status: 'pending' as const,
    assignedAdminId: 'admin-branch-ocp2',
    assignedAdminName: 'Quản lý Chi nhánh Ocean Park 2',
    adminNote: 'Đã gọi xác nhận giấy phép kinh doanh Shophouse, chờ duyệt cấp Token',
    createdAt: new Date(Date.now() - 3600000 * 3).toLocaleString('vi-VN')
  },
  {
    id: 'reg-emp-102',
    userId: 'u-emp-01',
    companyName: 'Công Ty BĐS Nhà Đẹp Vinhomes',
    brandName: 'Nhà Đẹp Vinhomes Real Estate',
    industry: 'Bất Động Sản & Môi Giới',
    taxCode: '0108991234',
    project: 'ocean-park-2',
    address: 'Shophouse Chà Là 15-08, Vinhomes Ocean Park 2',
    contactName: 'Mr. Hiếu Bùi',
    contactPhone: '0988112233',
    contactZalo: '0988112233',
    contactEmail: 'tuyendung.nhadepvinhomes@gmail.com',
    selectedPackageId: 'pack-enterprise',
    selectedPackageName: 'Gói Doanh Nghiệp Toàn Diện',
    tokenCost: 300000,
    status: 'approved' as const,
    assignedAdminId: 'admin-master',
    assignedAdminName: 'Admin Trưởng Ban Quản Trị',
    adminNote: 'Đã phê duyệt và kích hoạt gói 300.000 Token',
    createdAt: new Date(Date.now() - 86400000 * 2).toLocaleString('vi-VN'),
    approvedAt: new Date(Date.now() - 86400000 * 2 + 1800000).toLocaleString('vi-VN')
  }
];

export const INITIAL_TASK_DELEGATIONS = [
  {
    id: 'task-101',
    title: 'Xác minh hồ sơ đăng ký & duyệt gói Tuyển Dụng San Hô Quán',
    category: 'recruitment' as const,
    targetId: 'reg-emp-101',
    targetTitle: 'Đăng ký Nhà tuyển dụng: Nhà Hàng Lẩu Hải Sản San Hô Quán',
    targetProject: 'ocean-park-2',
    assignedToAdminId: 'admin-branch-ocp2',
    assignedToAdminName: 'Admin Chi Nhánh Ocean Park 2',
    assignedByAdminId: 'admin-master',
    assignedByAdminName: 'Admin Trưởng Ban Tổng',
    priority: 'high' as const,
    status: 'in_progress' as const,
    deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: 'Liên hệ chủ quán SĐT 0988.112.233 để hướng dẫn nạp Token và mở khóa tính năng tuyển dụng.',
    createdAt: new Date(Date.now() - 3600000 * 2).toLocaleString('vi-VN'),
    updatedAt: new Date(Date.now() - 1800000).toLocaleString('vi-VN')
  },
  {
    id: 'task-102',
    title: 'Hỗ trợ kết nối ứng viên Trưởng ca Thu ngân cho The Ocean Chill Cafe',
    category: 'recruitment' as const,
    targetId: 'job-1',
    targetTitle: 'Quản Lý & Trưởng Ca Chuỗi Cà Phê The Ocean Chill',
    targetProject: 'ocean-park-2',
    assignedToAdminId: 'admin-branch-ocp2',
    assignedToAdminName: 'Admin Chi Nhánh Ocean Park 2',
    assignedByAdminId: 'admin-master',
    assignedByAdminName: 'Admin Trưởng Ban Tổng',
    priority: 'medium' as const,
    status: 'in_progress' as const,
    deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    notes: 'Gợi ý 3 ứng viên sinh sống tại phân khu Cọ Xanh & Sao Biển có kinh nghiệm F&B.',
    createdAt: new Date(Date.now() - 86400000).toLocaleString('vi-VN'),
    updatedAt: new Date(Date.now() - 86400000).toLocaleString('vi-VN')
  },
  {
    id: 'task-103',
    title: 'Thẩm định hồ sơ Sổ đỏ Biệt thự Chà Là chuyển nhượng',
    category: 'bds_realestate' as const,
    targetId: 'prop-1',
    targetTitle: 'Shophouse Chà Là CL-08 Phố Đi Bộ Sầm Uất',
    targetProject: 'ocean-park-2',
    assignedToAdminId: 'admin-branch-bds',
    assignedToAdminName: 'Trưởng Ban Quản Lý BĐS',
    assignedByAdminId: 'admin-master',
    assignedByAdminName: 'Admin Trưởng Ban Tổng',
    priority: 'urgent' as const,
    status: 'completed' as const,
    deadline: new Date(Date.now() - 3600000).toISOString().split('T')[0],
    notes: 'Đã đối soát thông tin với Ban Quản Lý Vinhomes, tin đăng hợp lệ.',
    createdAt: new Date(Date.now() - 86400000 * 2).toLocaleString('vi-VN'),
    updatedAt: new Date(Date.now() - 86400000).toLocaleString('vi-VN')
  },
  {
    id: 'task-104',
    title: 'Kiểm tra chất lượng gian hàng Nông Sản Sạch Cư Dân S2.05 Smart City',
    category: 'resident_market' as const,
    targetId: 'store-smart-01',
    targetTitle: 'Gian hàng Thực Phẩm Sạch S2.05 Smart City',
    targetProject: 'smart-city',
    assignedToAdminId: 'admin-branch-smartcity',
    assignedToAdminName: 'Admin Phụ Trách Smart City',
    assignedByAdminId: 'admin-master',
    assignedByAdminName: 'Admin Trưởng Ban Tổng',
    priority: 'medium' as const,
    status: 'in_progress' as const,
    deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    notes: 'Đã hỗ trợ chủ shop kết nối đồng bộ KiotViet POS.',
    createdAt: new Date(Date.now() - 86400000).toLocaleString('vi-VN'),
    updatedAt: new Date(Date.now() - 3600000).toLocaleString('vi-VN')
  }
];
