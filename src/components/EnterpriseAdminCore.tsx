import React, { useState } from 'react';
import { 
  ShieldCheck, Users, Trophy, Clock, Target, Award, CheckCircle2, 
  AlertTriangle, Filter, Search, Plus, Play, Check, Star, DollarSign, 
  Car, Wrench, Sparkles, Building2, UserCheck, Layers, ChevronRight, Zap, RefreshCw, Lock
} from 'lucide-react';
import { 
  User, BranchScope, UserActivityMetrics, RewardConfig, 
  HourlyTask, CRMContactRecord, ServiceJobDispatch 
} from '../types';

interface EnterpriseAdminCoreProps {
  currentUser: User | null;
  users: User[];
  onUpdateUserCredits?: (userId: string, amount: number) => void;
}

// Sample Initial Mock Data for Enterprise Features
const INITIAL_BRANCHES: BranchScope[] = [
  {
    id: 'br-1',
    name: 'Nhánh Taxi & Xe Đưa Đón Vinhomes OCP2',
    categorySector: 'Xe Đưa Đón / Taxi',
    projectScope: 'ocean-park-2',
    regionScope: 'Hưng Yên - Gia Lâm',
    leadUserId: 'u-lead-1',
    leadUserName: 'Nguyễn Văn Tài (Trưởng Nhánh Xe)',
    memberIds: ['u-1', 'u-2'],
    description: 'Quản lý đội ngũ 45 tài xế xe điện & xe đưa đón cư dân Ocean Park 2 & 3'
  },
  {
    id: 'br-2',
    name: 'Nhánh Điện Tử - CNTT & Smarthome',
    categorySector: 'Điện Tử - CNTT & PC',
    projectScope: 'ocean-park-1',
    regionScope: 'Hà Nội - Gia Lâm',
    leadUserId: 'u-lead-2',
    leadUserName: 'Trần Minh Đức (Kỹ Thuật Trưởng)',
    memberIds: ['u-3'],
    description: 'Đội ngũ kỹ thuật viên sửa chữa máy tính, mạng Wifi & camera gia đình'
  },
  {
    id: 'br-3',
    name: 'Nhánh Dịch Vụ Vệ Sinh & Dọn Dẹp',
    categorySector: 'Vệ Sinh - Dọn Dẹp',
    projectScope: 'smart-city',
    regionScope: 'Nam Từ Liêm - Hà Nội',
    leadUserId: 'u-lead-3',
    leadUserName: 'Lê Thị Mai (Quản Lý Vệ Sinh)',
    memberIds: ['u-4'],
    description: 'Cung cấp nhân sự dọn dẹp theo giờ và giặt là cao cấp cho cư dân Smart City'
  }
];

const INITIAL_METRICS: UserActivityMetrics[] = [
  {
    userId: 'u-lead-1',
    userName: 'Nguyễn Văn Tài',
    role: 'branch_lead',
    loginCount: 142,
    onlineHoursTotal: 186.5,
    tasksCompletedTotal: 48,
    leadsHandledTotal: 120,
    engagementPoints: 2450,
    currentRank: 1,
    tierLevel: 'Hạng S',
    lastActiveTime: 'Vừa xong'
  },
  {
    userId: 'u-lead-2',
    userName: 'Trần Minh Đức',
    role: 'branch_lead',
    loginCount: 98,
    onlineHoursTotal: 142.0,
    tasksCompletedTotal: 36,
    leadsHandledTotal: 85,
    engagementPoints: 1890,
    currentRank: 2,
    tierLevel: 'Hạng A',
    lastActiveTime: '10 phút trước'
  },
  {
    userId: 'u-tech-1',
    userName: 'Phạm Hoàng Nam (Thợ Điện Lạnh)',
    role: 'tech_partner',
    loginCount: 84,
    onlineHoursTotal: 110.5,
    tasksCompletedTotal: 29,
    leadsHandledTotal: 42,
    engagementPoints: 1420,
    currentRank: 3,
    tierLevel: 'Hạng A',
    lastActiveTime: '15 phút trước'
  },
  {
    userId: 'u-driver-2',
    userName: 'Vũ Quốc Khánh (Tài Xế Taxi)',
    role: 'tech_partner',
    loginCount: 65,
    onlineHoursTotal: 92.0,
    tasksCompletedTotal: 22,
    leadsHandledTotal: 30,
    engagementPoints: 1150,
    currentRank: 4,
    tierLevel: 'Hạng B',
    lastActiveTime: '1 giờ trước'
  }
];

const INITIAL_REWARDS: RewardConfig[] = [
  {
    id: 'rw-1',
    tierName: 'Hạng S (Hội Viên Tích Cực)',
    minPointsRequired: 2000,
    rewardTitle: 'Thưởng 100 Lượt Up-Tin + 500k VNĐ + Huy Hiệu Kim Cương',
    rewardDescription: 'Dành cho Top 5 user có thời gian online và hoàn thành công việc cao nhất tháng',
    rewardUpTinCredits: 100,
    cashBonusVnd: 500000,
    vipBadge: '💎 Kim Cương'
  },
  {
    tierName: 'Hạng A (Hoạt Động Tố Chất)',
    id: 'rw-2',
    minPointsRequired: 1200,
    rewardTitle: 'Thưởng 50 Lượt Up-Tin + Huy Hiệu Vàng',
    rewardDescription: 'Tự động mở khóa khi tích lũy trên 1,200 điểm hoạt động KPI',
    rewardUpTinCredits: 50,
    cashBonusVnd: 200000,
    vipBadge: '🥇 Vàng'
  },
  {
    tierName: 'Hạng B (Thành Viên Tích Cực)',
    id: 'rw-3',
    minPointsRequired: 600,
    rewardTitle: 'Thưởng 20 Lượt Up-Tin',
    rewardDescription: 'Tặng lượt đẩy tin ưu tiên trên Chợ Cư Dân 24h',
    rewardUpTinCredits: 20,
    cashBonusVnd: 0,
    vipBadge: '🥈 Bạc'
  }
];

const INITIAL_HOURLY_TASKS: HourlyTask[] = [
  {
    id: 'task-101',
    title: 'Xử lý sự cố Wifi căn hộ S2.01 OCP2',
    description: 'Khách hàng báo mất tín hiệu router Wifi tầng 15. Cần kiểm tra dây cáp quang & cấu hình lại Mesh.',
    categorySector: 'Điện Tử - CNTT & PC',
    project: 'ocean-park-2',
    branchId: 'br-2',
    assignedByUserId: 'u-admin-1',
    assignedByName: 'Bùi Trung Hiếu (Super Admin)',
    assignedToUserId: 'u-lead-2',
    assignedToName: 'Trần Minh Đức (Kỹ Thuật)',
    assignedToPhone: '0988123456',
    hourlyDeadlineHours: 2,
    targetCompletionTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: 'in_progress',
    baseKpiPoints: 100,
    bonusPenaltyPoints: 0,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    id: 'task-102',
    title: 'Đón đoàn 4 khách VIP từ Sân bay Nội Bài về OCP1',
    description: 'Chuyến bay VN218 hạ cánh lúc 14:30. Tài xế đón tại Cột 12 ga Quốc Nội.',
    categorySector: 'Xe Đưa Đón / Taxi',
    project: 'ocean-park-1',
    branchId: 'br-1',
    assignedByUserId: 'u-lead-1',
    assignedByName: 'Nguyễn Văn Tài',
    assignedToUserId: 'u-driver-2',
    assignedToName: 'Vũ Quốc Khánh (Tài Xế)',
    assignedToPhone: '0977888999',
    hourlyDeadlineHours: 3,
    targetCompletionTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'completed',
    baseKpiPoints: 120,
    bonusPenaltyPoints: 15,
    finalKpiScore: 135,
    managerRating: 5,
    managerFeedback: 'Hoàn thành sớm 15 phút, khách đánh giá xe sạch sẽ, nhiệt tình!',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

const INITIAL_CRM_CONTACTS: CRMContactRecord[] = [
  {
    id: 'crm-1',
    type: 'partner',
    fullName: 'Hoàng Văn Bách (Gara Ô tô & Taxi Cư Dân)',
    phone: '0912345678',
    email: 'hoangbach.taxi@gmail.com',
    address: 'Chà Là 15-08, Vinhomes Ocean Park 2',
    projectScope: 'ocean-park-2',
    sectorTag: 'Tài Xế / Đội Xe Đưa Đón',
    lifetimeValueVnd: 15000000,
    notes: 'Đã nạp 2,000,000đ quỹ nhận Job taxi.',
    createdAt: '2026-07-15'
  },
  {
    id: 'crm-2',
    type: 'partner',
    fullName: 'Lê Thanh Tùng (Thợ Sửa Điện Lạnh & Gia Dụng)',
    phone: '0934567890',
    email: 'tung.dienlanh@gmail.com',
    address: 'S3.02-1205, Smart City',
    projectScope: 'smart-city',
    sectorTag: 'Thợ Điện Lạnh / Bảo Trì',
    lifetimeValueVnd: 8500000,
    notes: 'Chuyên bảo trì điều hòa âm trần Casper / Daikin.',
    createdAt: '2026-07-20'
  },
  {
    id: 'crm-3',
    type: 'customer',
    fullName: 'Chị Nguyễn Phương Anh (Chủ căn Shophouse San Hô)',
    phone: '0987111222',
    address: 'San Hô 06-12, Vinhomes Ocean Park 2',
    projectScope: 'ocean-park-2',
    sectorTag: 'Khách Hàng Cần Dịch Vụ',
    lifetimeValueVnd: 45000000,
    notes: 'Thường xuyên đặt dịch vụ giặt là và xe đưa đón VIP đi sân bay.',
    createdAt: '2026-08-01'
  }
];

const INITIAL_JOB_DISPATCHES: ServiceJobDispatch[] = [
  {
    id: 'job-501',
    jobCode: 'JOB-TAXI-084',
    categorySector: 'Xe Đưa Đón / Taxi',
    title: 'Đặt xe 7 chỗ đưa gia đình đi Aeon Mall Long Biên',
    customerName: 'Chị Thu Hà',
    customerPhone: '0904***123 (Sẽ hiện khi nhận đơn)',
    address: 'Căn Hải Tăng 02-15, OCP2',
    projectScope: 'ocean-park-2',
    description: 'Đưa 5 người lớn + 2 trẻ em, cần xe sạch sẽ, có ghế trẻ em. Đi lúc 17:30 chiều nay.',
    estimatedPriceVnd: 250000,
    claimFeeVnd: 20000, // Tài xế trả 20,000đ để nhận Job này
    status: 'open',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'job-502',
    jobCode: 'JOB-TECH-092',
    categorySector: 'Điện Tử - CNTT & PC',
    title: 'Sửa máy tính để bàn không lên nguồn & cài Win 11',
    customerName: 'Anh Quốc Tuấn',
    customerPhone: '0912***888 (Sẽ hiện khi nhận đơn)',
    address: 'Tòa S1.08 tầng 12, OCP1',
    projectScope: 'ocean-park-1',
    description: 'Máy PC gaming bật quạt quay nhưng không lên hình. Cần thợ kiểm tra trực tiếp tại nhà.',
    estimatedPriceVnd: 350000,
    claimFeeVnd: 30000, // Thợ nạp phí 30k nhận đơn
    status: 'open',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'job-503',
    jobCode: 'JOB-CLEAN-014',
    categorySector: 'Vệ Sinh - Dọn Dẹp',
    title: 'Dọn dẹp tổng thể căn hộ 2PN2WC sau khi khách trả phòng',
    customerName: 'Anh Hoàng Nam',
    customerPhone: '0988***999',
    address: 'Tòa Masteri M3, Smart City',
    projectScope: 'smart-city',
    description: 'Cần 2 người làm trong 3 tiếng. Lau kính, dọn bếp, thay ga trải giường.',
    estimatedPriceVnd: 450000,
    claimFeeVnd: 35000,
    status: 'claimed',
    claimedByTechId: 'u-cleaner-1',
    claimedByTechName: 'Cô Phạm Thị Hoa (Đội Vệ Sinh)',
    claimedByTechPhone: '0977112233',
    claimedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  }
];

export const EnterpriseAdminCore: React.FC<EnterpriseAdminCoreProps> = ({
  currentUser,
  users,
  onUpdateUserCredits
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'engagement' | 'rbac' | 'hourly_tasks' | 'job_dispatch' | 'crm'>('engagement');

  // State Stores
  const [branches, setBranches] = useState<BranchScope[]>(INITIAL_BRANCHES);
  const [metrics, setMetrics] = useState<UserActivityMetrics[]>(INITIAL_METRICS);
  const [rewards, setRewards] = useState<RewardConfig[]>(INITIAL_REWARDS);
  const [hourlyTasks, setHourlyTasks] = useState<HourlyTask[]>(INITIAL_HOURLY_TASKS);
  const [crmContacts, setCrmContacts] = useState<CRMContactRecord[]>(INITIAL_CRM_CONTACTS);
  const [jobDispatches, setJobDispatches] = useState<ServiceJobDispatch[]>(INITIAL_JOB_DISPATCHES);

  // Form Modals
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewBranchModal, setShowNewBranchModal] = useState(false);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showNewCrmModal, setShowNewCrmModal] = useState(false);

  // New Hourly Task Form
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    categorySector: 'Điện Tử - CNTT & PC',
    project: 'ocean-park-2',
    branchId: 'br-1',
    assignedToUserId: users[0]?.id || 'u-1',
    hourlyDeadlineHours: 2,
    baseKpiPoints: 100
  });

  // New Branch Form
  const [newBranchForm, setNewBranchForm] = useState({
    name: '',
    categorySector: 'Xe Đưa Đón / Taxi',
    projectScope: 'ocean-park-2',
    regionScope: 'Gia Lâm - Hà Nội',
    leadUserName: '',
    description: ''
  });

  // New Service Job Form
  const [newJobForm, setNewJobForm] = useState({
    categorySector: 'Xe Đưa Đón / Taxi' as const,
    title: '',
    customerName: '',
    customerPhone: '',
    address: '',
    projectScope: 'ocean-park-2',
    description: '',
    estimatedPriceVnd: 200000,
    claimFeeVnd: 20000
  });

  // Handle Task Creation
  const handleCreateHourlyTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUser = users.find(u => u.id === newTaskForm.assignedToUserId);
    const targetTime = new Date(Date.now() + newTaskForm.hourlyDeadlineHours * 3600 * 1000).toISOString();

    const createdTask: HourlyTask = {
      id: `task-${Date.now()}`,
      title: newTaskForm.title,
      description: newTaskForm.description,
      categorySector: newTaskForm.categorySector,
      project: newTaskForm.project,
      branchId: newTaskForm.branchId,
      assignedByUserId: currentUser?.id || 'admin',
      assignedByName: currentUser?.name || 'Super Admin',
      assignedToUserId: newTaskForm.assignedToUserId,
      assignedToName: assignedUser?.name || 'Cán Bộ Nhánh',
      assignedToPhone: assignedUser?.phone || '0988000999',
      hourlyDeadlineHours: Number(newTaskForm.hourlyDeadlineHours),
      targetCompletionTime: targetTime,
      status: 'assigned',
      baseKpiPoints: Number(newTaskForm.baseKpiPoints),
      bonusPenaltyPoints: 0,
      createdAt: new Date().toISOString()
    };

    setHourlyTasks([createdTask, ...hourlyTasks]);
    setShowNewTaskModal(false);
    alert(`✅ Đã giao việc thành công cho ${createdTask.assignedToName}!\nThời hạn hoàn thành: ${createdTask.hourlyDeadlineHours} giờ.`);
  };

  // Handle Driver/Tech Job Claiming (Trả phí nhận Job)
  const handleClaimJob = (job: ServiceJobDispatch) => {
    if (job.status !== 'open') return;

    const techName = currentUser?.name || 'Tài xế / Thợ Cư Dân';
    const techPhone = currentUser?.phone || '0988333444';

    const updatedJobs = jobDispatches.map(j => {
      if (j.id === job.id) {
        return {
          ...j,
          status: 'claimed' as const,
          claimedByTechId: currentUser?.id || 'tech-current',
          claimedByTechName: techName,
          claimedByTechPhone: techPhone,
          claimedAt: new Date().toISOString()
        };
      }
      return j;
    });

    setJobDispatches(updatedJobs);

    // Auto deduct points / update credits if applicable
    if (onUpdateUserCredits && currentUser) {
      onUpdateUserCredits(currentUser.id, -Math.round(job.claimFeeVnd / 1000));
    }

    alert(`🎉 ĐÃ NHẬN JOB THÀNH CÔNG!\nHệ thống đã khấu trừ phí matching ${job.claimFeeVnd.toLocaleString('vi-VN')}đ.\n\nThông tin liên hệ Khách Hàng:\n👤 ${job.customerName}\n📞 ${job.customerPhone.replace('***', '888')}\n📍 ${job.address}`);
  };

  return (
    <div className="space-y-6">
      {/* ENTERPRISE CORE HEADER & SUB-TABS */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white rounded-3xl border border-purple-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-black text-[10px] rounded-full uppercase tracking-wider border border-amber-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> HE THONG QUAN TRI NANG CAO
              </span>
              <span className="text-xs text-purple-300 font-extrabold">
                Super Admin CRM & Operational Control
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              QUẢN TRỊ ĐA CẤP, ĐO LƯỜNG TƯƠNG TÁC & THƯỞNG KPI THEO GIỜ
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Hệ thống theo dõi tự động hiệu suất user, phân quyền phân nhánh theo dự án / ngành nghề (Taxi, Điện tử CNTT, Vệ sinh), giao việc đếm giờ KPI và mô hình nhận job trả phí.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Việc Đếm Giờ KPI</span>
            </button>
          </div>
        </div>

        {/* Enterprise Sub Tabs Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-purple-500/20">
          <button
            onClick={() => setActiveSubTab('engagement')}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeSubTab === 'engagement'
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg ring-2 ring-purple-400/40'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-purple-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>2.1 Tương Tác & Thưởng</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rbac')}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeSubTab === 'rbac'
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg ring-2 ring-purple-400/40'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-purple-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-300" />
            <span>2.2 Phân Quyền Đa Cấp</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hourly_tasks')}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeSubTab === 'hourly_tasks'
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg ring-2 ring-purple-400/40'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-purple-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-300" />
            <span>2.3 Giao Việc KPI Theo Giờ</span>
          </button>

          <button
            onClick={() => setActiveSubTab('job_dispatch')}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeSubTab === 'job_dispatch'
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg ring-2 ring-purple-400/40'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-purple-400 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4 text-yellow-300" />
            <span>Nhận Job Trả Phí (Taxi/Thợ)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('crm')}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeSubTab === 'crm'
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg ring-2 ring-purple-400/40'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-purple-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-pink-300" />
            <span>2.4 CRM Khách & Đối Tác</span>
          </button>
        </div>
      </div>

      {/* ==================== SUB TAB 2.1: ENGAGEMENT & REWARD ==================== */}
      {activeSubTab === 'engagement' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tổng Điểm Tương Tác</span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Trophy className="w-6 h-6 text-amber-400" /> 6,910 Điểm
              </div>
              <p className="text-[11px] text-slate-500">Tự động ghi nhận từ hành vi User</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Thời Gian Online Đã Đo Lường</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-6 h-6 text-emerald-500" /> 531.0 Giờ
              </div>
              <p className="text-[11px] text-slate-500">Ghi nhận thời gian thực trên App</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Task KPI Đã Xử Lý</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Target className="w-6 h-6 text-blue-500" /> 135 Task
              </div>
              <p className="text-[11px] text-slate-500">Tỉ lệ đúng hạn 94.2%</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">User Đạt Bậc Thưởng Tháng</span>
              <div className="text-2xl font-black text-amber-500 flex items-center gap-1.5">
                <Award className="w-6 h-6 text-amber-400" /> 12 Thành Viên
              </div>
              <p className="text-[11px] text-slate-500">Đã nhận thưởng lượt Up-Tin & Quỹ</p>
            </div>
          </div>

          {/* Active User Ranking Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  BẢNG XẾP HẠNG TÍCH CỰC & ĐIỂM HOẠT ĐỘNG
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hệ thống tự động tính điểm từ lượt đăng nhập, thời gian online, số đơn xử lý và tốc độ hoàn thành công việc.
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs rounded-xl border border-amber-500/30">
                Xếp hạng Tháng 8/2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 rounded-l-xl">Thứ Hạng</th>
                    <th className="p-3">Thành Viên / Cán Bộ</th>
                    <th className="p-3">Chức Danh / Nhánh</th>
                    <th className="p-3 text-center">Đăng Nhập</th>
                    <th className="p-3 text-center">Giờ Online</th>
                    <th className="p-3 text-center">Task Đã Xử Lý</th>
                    <th className="p-3 text-center">Điểm Tích Cực</th>
                    <th className="p-3 text-center">Danh Hiệu</th>
                    <th className="p-3 text-right rounded-r-xl">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {metrics.map((m) => (
                    <tr key={m.userId} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                      <td className="p-3 font-black">
                        {m.currentRank === 1 && <span className="px-2 py-1 bg-amber-400 text-slate-950 font-black rounded-lg">#1 🥇</span>}
                        {m.currentRank === 2 && <span className="px-2 py-1 bg-slate-300 text-slate-900 font-black rounded-lg">#2 🥈</span>}
                        {m.currentRank === 3 && <span className="px-2 py-1 bg-amber-700 text-white font-black rounded-lg">#3 🥉</span>}
                        {m.currentRank > 3 && <span className="text-slate-500 font-bold">#{m.currentRank}</span>}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{m.userName}</div>
                        <div className="text-[10px] text-slate-400">{m.lastActiveTime}</div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 rounded-md font-bold text-[10px]">
                          {m.role === 'branch_lead' ? 'Trưởng Nhánh' : 'Đối Tác Kỹ Thuật'}
                        </span>
                      </td>

                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {m.loginCount} lần
                      </td>

                      <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {m.onlineHoursTotal}h
                      </td>

                      <td className="p-3 text-center font-bold text-blue-600 dark:text-blue-400">
                        {m.tasksCompletedTotal} đơn
                      </td>

                      <td className="p-3 text-center font-black text-amber-500 text-sm">
                        {m.engagementPoints.toLocaleString('vi-VN')} đ
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-[10px] shadow-sm">
                          {m.tierLevel}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => alert(`🎉 Đã cộng thưởng 50 Lượt Up-tin cho thành viên ${m.userName}!`)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Cộng Thưởng
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Configured Reward Tier Levels */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              CẤU HÌNH THƯỞNG BẬC THANG KPI THEO HOẠT ĐỘNG
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rewards.map((rw) => (
                <div key={rw.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-purple-600 dark:text-purple-300">{rw.tierName}</span>
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md">
                      Mốc ≥ {rw.minPointsRequired} điểm
                    </span>
                  </div>

                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {rw.rewardTitle}
                  </p>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {rw.rewardDescription}
                  </p>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>Thưởng lượt: +{rw.rewardUpTinCredits} Up-Tin</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Tiền thưởng: {rw.cashBonusVnd.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB TAB 2.2: HIERARCHICAL RBAC & BRANCHES ==================== */}
      {activeSubTab === 'rbac' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                PHÂN QUYỀN PHÂN NHÁNH ĐA CẤP (HIERARCHICAL RBAC)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Super Admin quản lý và phân quyền cho các Trưởng Nhánh phụ trách theo Dự án, Khu vực và Ngành nghề.
              </p>
            </div>

            <button
              onClick={() => setShowNewBranchModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Nhánh Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((br) => (
              <div key={br.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-extrabold text-[10px] rounded-full border border-purple-500/30">
                    🏷️ {br.categorySector}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">ID: {br.id}</span>
                </div>

                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  {br.name}
                </h4>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {br.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-500">Trưởng Nhánh phụ trách:</span>
                    <span className="font-black text-amber-600 dark:text-amber-400">{br.leadUserName}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-500">Dự án & Phạm vi:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-300">{br.projectScope} ({br.regionScope})</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-500">Thành viên nhánh:</span>
                    <span className="font-bold text-emerald-600">{br.memberIds.length + 1} Cán bộ / Thợ</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => alert(`🔍 Xem phạm vi quản lý của nhánh: ${br.name}`)}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-[11px] transition cursor-pointer"
                  >
                    Xem Giám Sát Nhánh
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SUB TAB 2.3: HOURLY TASK & KPI TRACKING ==================== */}
      {activeSubTab === 'hourly_tasks' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                GIAO VIỆC & ĐÁNH GIÁ HIỆU SUẤT KPI THEO GIỜ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thiết lập deadline theo giờ, theo dõi chính xác thời điểm nhận việc, xử lý và so sánh thực tế để chấm điểm KPI.
              </p>
            </div>

            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Việc Đếm Giờ Mới</span>
            </button>
          </div>

          <div className="space-y-4">
            {hourlyTasks.map((t) => (
              <div key={t.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-300 font-extrabold text-[10px] rounded-full">
                      📂 {t.categorySector}
                    </span>
                    <span className="font-black text-xs text-slate-400">ID: {t.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {t.status === 'in_progress' && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-300 font-black text-xs rounded-xl flex items-center gap-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> Đang đếm giờ ({t.hourlyDeadlineHours}h deadline)
                      </span>
                    )}

                    {t.status === 'completed' && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-black text-xs rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Đã hoàn thành đúng hạn
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    {t.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Người Giao:</span>
                    <span className="font-bold">{t.assignedByName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Cán Bộ / Thợ Nhận Việc:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-300">{t.assignedToName} ({t.assignedToPhone})</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Hạn Chốt (Deadline):</span>
                    <span className="font-black text-rose-500">{new Date(t.targetCompletionTime).toLocaleTimeString('vi-VN')} ({t.hourlyDeadlineHours} Giờ)</span>
                  </div>
                </div>

                {t.managerFeedback && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black">⭐ Đánh giá Quản lý KPI: {t.managerRating}/5 Sao</span>
                      <span className="font-black text-amber-500">Điểm KPI Cuối: +{t.finalKpiScore} Điểm</span>
                    </div>
                    <p className="text-[11px]">{t.managerFeedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SUB TAB: JOB DISPATCH (TAXI / THỢ TRẢ PHÍ NHẬN JOB) ==================== */}
      {activeSubTab === 'job_dispatch' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 bg-gradient-to-r from-amber-900/30 via-slate-900 to-yellow-900/30 border border-amber-500/30 rounded-3xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <Car className="w-5 h-5 text-amber-300" />
              MÔ HÌNH NHẬN JOB TRẢ PHÍ DISPATCH (TAXI, THỢ SỬA ĐIỆN TỬ, VỆ SINH)
            </div>
            <p className="text-slate-300 leading-relaxed">
              Cư dân đặt nhu cầu dịch vụ trên ứng dụng. Đội ngũ Tài xế xe đưa đón/Taxi cư dân và Thợ kỹ thuật (Điện tử, Dọn dẹp) nạp quỹ nhận job và trả phí nạp điểm (Matching Fee) để nhận thông tin liên hệ trực tiếp từ khách hàng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobDispatches.map((j) => (
              <div key={j.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 font-black text-[10px] rounded-full border border-yellow-500/30">
                      🚕 {j.categorySector}
                    </span>

                    <span className="font-black text-xs text-slate-400">{j.jobCode}</span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-2">
                    {j.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {j.description}
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-xs space-y-1 font-semibold">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Khách Hàng:</span>
                      <span className="font-bold">{j.customerName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Địa Chỉ:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{j.address}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400">Giá Ước Tính:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">{j.estimatedPriceVnd.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Phí Matching Đơn:</span>
                    <span className="font-black text-amber-500 text-xs">{j.claimFeeVnd.toLocaleString('vi-VN')}đ</span>
                  </div>

                  {j.status === 'open' ? (
                    <button
                      onClick={() => handleClaimJob(j)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Trả Phí Nhận Job</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl">
                      Đã có người nhận
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SUB TAB 2.4: CRM CONTACTS ==================== */}
      {activeSubTab === 'crm' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-500" />
                CRM PHÂN LOẠI KHÁCH HÀNG, ĐỐI TÁC & THÀNH VIÊN
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lưu trữ tập trung thông tin, phân quyền truy cập theo từng dự án và nhánh quản lý.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 rounded-l-xl">Phân Loại CRM</th>
                    <th className="p-3">Họ Tên / Đơn Vị</th>
                    <th className="p-3">Số Điện Thoại</th>
                    <th className="p-3">Ngành Nghề / Thẻ</th>
                    <th className="p-3">Dự Án PHỤ TRÁCH</th>
                    <th className="p-3 text-right">Giá Trị Tích Lũy</th>
                    <th className="p-3 rounded-r-xl">Ghi Chú CRM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {crmContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                      <td className="p-3 font-bold">
                        {c.type === 'partner' && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md">Đối Tác</span>}
                        {c.type === 'customer' && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">Khách Hàng</span>}
                      </td>

                      <td className="p-3 font-black text-slate-900 dark:text-white">
                        {c.fullName}
                      </td>

                      <td className="p-3 font-bold text-slate-600 dark:text-slate-300">
                        {c.phone}
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 rounded-md font-bold text-[10px]">
                          {c.sectorTag}
                        </span>
                      </td>

                      <td className="p-3 font-bold text-slate-500">
                        {c.projectScope}
                      </td>

                      <td className="p-3 text-right font-black text-emerald-600">
                        {(c.lifetimeValueVnd || 0).toLocaleString('vi-VN')}đ
                      </td>

                      <td className="p-3 text-slate-500 text-[11px]">
                        {c.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NEW HOURLY TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                GIAO VIỆC & THIẾT LẬP DEADLINE THEO GIỜ
              </h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHourlyTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Công Việc / Task (*)</label>
                <input
                  type="text"
                  required
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="Ví dụ: Kiểm tra lại mạng Wifi căn hộ S1.05"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mô Tả Yêu Cầu (*)</label>
                <textarea
                  rows={2}
                  required
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  placeholder="Mô tả chi tiết nội dung công việc..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ngành Nghề / Mảng (*)</label>
                  <select
                    value={newTaskForm.categorySector}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, categorySector: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="Xe Đưa Đón / Taxi">Xe Đưa Đón / Taxi</option>
                    <option value="Điện Tử - CNTT & PC">Điện Tử - CNTT & PC</option>
                    <option value="Vệ Sinh - Dọn Dẹp">Vệ Sinh - Dọn Dẹp</option>
                    <option value="BĐS Vinhomes">BĐS Vinhomes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thời Hạn Giờ (Deadline) (*)</label>
                  <select
                    value={newTaskForm.hourlyDeadlineHours}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, hourlyDeadlineHours: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-rose-500"
                  >
                    <option value={1}>1 Giờ (Gấp)</option>
                    <option value={2}>2 Giờ (Tiêu chuẩn)</option>
                    <option value={4}>4 Giờ (Nửa ngày)</option>
                    <option value={8}>8 Giờ (Trong ngày)</option>
                    <option value={24}>24 Giờ (1 Ngày)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cán Bộ / Thợ Nhận Việc (*)</label>
                <select
                  value={newTaskForm.assignedToUserId}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedToUserId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.phone || u.email})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md"
                >
                  Xác Nhận Giao Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
