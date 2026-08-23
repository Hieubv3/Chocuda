import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, MessageSquare, ExternalLink, ShieldCheck, Home, 
  ChevronRight, Sparkles, CheckCircle2, Share2, ArrowRight
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { recordZaloInteraction } from '../lib/visitorStats';

interface CommunityGroup {
  id: string;
  slug: string;
  name: string;
  project: string;
  memberCount: string;
  description: string;
  zaloLink: string;
  facebookLink?: string;
  badge: string;
  category: 'bds' | 'fnb' | 'resident' | 'carpool';
}

const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: 'grp-ocp2-main',
    slug: 'zalo-cu-dan-ocean-park-2',
    name: 'Hội Cư Dân Vinhomes Ocean Park 2 - The Empire (Chính Thức)',
    project: 'Vinhomes Ocean Park 2',
    memberCount: '1,000+ thành viên',
    description: 'Nhóm Zalo trao đổi thông tin sinh hoạt, an ninh, tiện ích, tìm đồ thất lạc và thông báo ban quản lý.',
    zaloLink: 'https://zalo.me/g/ocp2cudan',
    facebookLink: 'https://facebook.com/groups/cudanocp2',
    badge: 'GROUP CHÍNH THỨC',
    category: 'resident'
  },
  {
    id: 'grp-ocp2-market',
    slug: 'cho-cu-dan-ocean-park-2',
    name: 'Chợ Cư Dân & Giao Thương Ẩm Thực OCP2',
    project: 'Vinhomes Ocean Park 2',
    memberCount: '980+ thành viên',
    description: 'Chợ mua bán nội khu: thực phẩm tươi sống, ăn vặt đêm, hoa quả sạch, dịch vụ gia đình giao tận cửa.',
    zaloLink: 'https://zalo.me/g/chocudanocp2',
    badge: 'MUA BÁN 24/7',
    category: 'fnb'
  },
  {
    id: 'grp-ocp3-main',
    slug: 'zalo-cu-dan-ocean-park-3',
    name: 'Cộng Đồng Cư Dân Vinhomes Ocean Park 3 - The Crown',
    project: 'Vinhomes Ocean Park 3',
    memberCount: '850+ thành viên',
    description: 'Diễn đàn cư dân OCP3 chia sẻ kinh nghiệm hoàn thiện nội thất, nhận nhà, tiện ích Vịnh Tây & Phố Biển.',
    zaloLink: 'https://zalo.me/g/ocp3cudan',
    badge: 'SÔI ĐỘNG',
    category: 'resident'
  },
  {
    id: 'grp-bds-chuyen-nhuong',
    slug: 'chuyen-nhuong-bds-vinhomes',
    name: 'Hội Chuyển Nhượng & Cho Thuê BĐS Vinhomes 1, 2, 3',
    project: 'Toàn Hệ Thống Vinhomes',
    memberCount: '1,000+ nhà đầu tư',
    description: 'Kết nối chủ nhà cần bán cắt lỗ, sang nhượng shophouse và khách mua trực tiếp không qua trung gian.',
    zaloLink: 'https://zalo.me/g/chuyennhuongvinhomes',
    badge: 'ĐẦU TƯ BĐS',
    category: 'bds'
  },
  {
    id: 'grp-carpool',
    slug: 'xe-tien-chuyen-ocp-ha-noi',
    name: 'Xe Đi Chung & Ghép Chuyến Ocean Park - Hà Nội',
    project: 'Vinhomes Ocean Park',
    memberCount: '620+ thành viên',
    description: 'Đi chung xe ô tô hàng ngày từ Ocean Park 1, 2, 3 vào trung tâm Hà Nội giá rẻ, tiện lợi, văn minh.',
    zaloLink: 'https://zalo.me/g/xedichungocp',
    badge: 'TIỆN ÍCH',
    category: 'carpool'
  }
];

export const CommunityGroupsPage: React.FC = () => {
  const { groupSlug } = useParams<{ groupSlug?: string }>();

  const selectedGroup = groupSlug 
    ? COMMUNITY_GROUPS.find(g => g.slug === groupSlug || g.id === groupSlug)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={selectedGroup ? `${selectedGroup.name} | Cộng Đồng Cư Dân` : 'Cộng Đồng & Group Zalo Cư Dân Vinhomes 24H'}
        description="Tổng hợp các group Zalo, Facebook cộng đồng cư dân Vinhomes Ocean Park 1, 2, 3, Chợ cư dân, mua bán shophouse và hội xe tiện chuyến."
        url={window.location.href}
      />

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap gap-1.5">
            <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to="/cong-dong" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Group Cư Dân & Cộng Đồng
            </Link>
            {selectedGroup && (
              <>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="text-slate-900 dark:text-white font-bold truncate">
                  {selectedGroup.name}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase">
            <Users className="w-4 h-4" />
            <span>MẠNG LƯỚI GROUP CƯ DÂN CHÍNH THỨC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
            Kết Nối Cộng Đồng Cư Dân Vinhomes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Tham gia các nhóm Zalo & Facebook theo từng phân khu, dự án để cập nhật thông tin nội khu, giao thương buôn bán và nhận hỗ trợ 24/7.
          </p>
        </div>

        {/* Group Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMMUNITY_GROUPS.map(group => {
            const isHighlight = selectedGroup?.id === group.id;

            return (
              <div
                key={group.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition shadow-lg space-y-5 flex flex-col justify-between ${
                  isHighlight 
                    ? 'border-blue-500 ring-2 ring-blue-400 shadow-blue-500/10' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase">
                      {group.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      👥 {group.memberCount}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                    {group.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {group.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={group.zaloLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => recordZaloInteraction()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>THAM GIA NHÓM ZALO</span>
                  </a>

                  {group.facebookLink && (
                    <a
                      href={group.facebookLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem Group Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Community Guidelines Box */}
        <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>NỘI QUY HOẠT ĐỘNG CỘNG ĐỒNG CƯ DÂN</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Tôn trọng các thành viên trong khu đô thị, văn minh, lịch sự trong giao tiếp.</li>
            <li>Không spam quảng cáo sai chuyên mục, không đăng tin bài lừa đảo hoặc thông tin chưa kiểm chứng.</li>
            <li>Ban quản trị hỗ trợ xác thực thông tin tài khoản chính chủ và hỗ trợ kết nối 24/7.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
