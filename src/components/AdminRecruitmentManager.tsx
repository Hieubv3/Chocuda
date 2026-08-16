import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Users, FileText, CheckCircle2, Clock, XCircle, 
  Trash2, Edit3, Plus, Search, Filter, Eye, Phone, Mail, 
  DollarSign, Sparkles, ShieldCheck, Download, RefreshCw,
  ExternalLink, Building2, MapPin, Tag, Award, Check, UserCheck, Unlock
} from 'lucide-react';
import { RecruitmentJob, CandidateProfile, JobApplication, CvUnlockRecord, ProjectCategory } from '../types';

interface AdminRecruitmentManagerProps {
  onRefresh?: () => void;
}

export const AdminRecruitmentManager: React.FC<AdminRecruitmentManagerProps> = ({ onRefresh }) => {
  const [activeSection, setActiveSection] = useState<'jobs' | 'candidates' | 'applications' | 'unlocks' | 'stats'>('jobs');
  
  // Data State
  const [jobs, setJobs] = useState<RecruitmentJob[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [unlocks, setUnlocks] = useState<CvUnlockRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  // Job Modal State (Add / Edit)
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<RecruitmentJob | null>(null);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    companyName: '',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
    industry: 'F&B - Nhà Hàng & Cafe',
    project: 'ocean-park-2' as ProjectCategory,
    projectName: 'Vinhomes Ocean Park 2',
    location: 'Phân khu Sao Biển, Vinhomes Ocean Park 2',
    jobType: 'full-time' as any,
    salaryType: 'range' as any,
    salaryDisplay: '10 - 15 Triệu/tháng',
    minSalary: 10000000,
    maxSalary: 15000000,
    experience: '1-3y' as any,
    experienceDisplay: '1 - 3 năm kinh nghiệm',
    description: '',
    requirements: ['Chăm chỉ, nhanh nhẹn, có trách nhiệm trong công việc', 'Giao tiếp tốt, ưu tiên cư dân sinh sống tại khu đô thị'],
    benefits: ['Thu nhập cạnh tranh + thưởng doanh số', 'Đầy đủ chế độ bảo hiểm, nghỉ phép', 'Môi trường làm việc thân thiện nội khu'],
    contactName: 'Ban Tuyển Dụng',
    contactPhone: '0868499929',
    contactZalo: '0868499929',
    contactEmail: 'tuyendung@chocudan24h.com',
    status: 'active' as 'active' | 'closed' | 'pending',
    isVip: true,
    isUrgent: false,
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  // Candidate View / Edit Modal
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<CandidateProfile | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  // Load All Recruitment Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Jobs (Admin sees all)
      const resJobs = await fetch('/api/recruitment/jobs?limit=200');
      if (resJobs.ok) {
        const dataJobs = await resJobs.json();
        setJobs(dataJobs);
      }

      // 2. Fetch Candidates (Admin mode: isAdmin=true to see unmasked info)
      const resCandidates = await fetch('/api/recruitment/candidates?isAdmin=true');
      if (resCandidates.ok) {
        const dataCandidates = await resCandidates.json();
        setCandidates(dataCandidates);
      }

      // 3. Fetch Applications
      const resApps = await fetch('/api/recruitment/applications');
      if (resApps.ok) {
        const dataApps = await resApps.json();
        setApplications(dataApps);
      }

      // 4. Fetch CV Unlock logs
      const resUnlocks = await fetch('/api/recruitment/unlock-logs');
      if (resUnlocks.ok) {
        const dataUnlocks = await resUnlocks.json();
        setUnlocks(dataUnlocks);
      }
    } catch (e) {
      console.error('Error fetching recruitment admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Job Actions
  const handleOpenAddJob = () => {
    setEditingJob(null);
    setJobFormData({
      title: '',
      companyName: '',
      companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
      industry: 'F&B - Nhà Hàng & Cafe',
      project: 'ocean-park-2',
      projectName: 'Vinhomes Ocean Park 2',
      location: 'Vinhomes Ocean Park 2, Văn Giang, Hưng Yên',
      jobType: 'full-time',
      salaryType: 'range',
      salaryDisplay: '10 - 15 Triệu/tháng',
      minSalary: 10000000,
      maxSalary: 15000000,
      experience: '1-3y',
      experienceDisplay: '1 - 3 năm kinh nghiệm',
      description: 'Tuyển dụng nhân sự phục vụ chuỗi dịch vụ cư dân nội khu đô thị.',
      requirements: ['Chăm chỉ, nhanh nhẹn, có trách nhiệm trong công việc', 'Ưu tiên cư dân sinh sống tại khu đô thị'],
      benefits: ['Thu nhập cạnh tranh + Thưởng chuyên cần', 'Được đào tạo bài bản, môi trường thân thiện'],
      contactName: 'Ban Quản Lý Tuyển Dụng',
      contactPhone: '0868499929',
      contactZalo: '0868499929',
      contactEmail: 'tuyendung@chocudan24h.com',
      status: 'active',
      isVip: true,
      isUrgent: false,
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    });
    setShowJobModal(true);
  };

  const handleOpenEditJob = (job: RecruitmentJob) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title,
      companyName: job.companyName,
      companyLogo: job.companyLogo || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
      industry: job.industry,
      project: job.project as any,
      projectName: job.projectName || 'Vinhomes Ocean Park',
      location: job.location,
      jobType: job.jobType,
      salaryType: job.salaryType,
      salaryDisplay: job.salaryDisplay,
      minSalary: job.minSalary || 0,
      maxSalary: job.maxSalary || 0,
      experience: job.experience,
      experienceDisplay: job.experienceDisplay,
      description: job.description,
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      contactName: job.contactName,
      contactPhone: job.contactPhone,
      contactZalo: job.contactZalo || job.contactPhone,
      contactEmail: job.contactEmail || '',
      status: job.status,
      isVip: Boolean(job.isVip),
      isUrgent: Boolean(job.isUrgent),
      deadline: job.deadline ? job.deadline.split('T')[0] : ''
    });
    setShowJobModal(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobFormData.title || !jobFormData.companyName || !jobFormData.contactPhone) {
      alert('Vui lòng nhập đầy đủ Tiêu đề, Tên Đơn vị tuyển dụng và Số điện thoại liên hệ!');
      return;
    }

    try {
      if (editingJob) {
        // Update Job
        const res = await fetch(`/api/recruitment/jobs/${editingJob.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobFormData)
        });
        if (!res.ok) throw new Error('Lỗi khi cập nhật tin');
        alert('Cập nhật tin tuyển dụng thành công!');
      } else {
        // Create Job
        const res = await fetch('/api/recruitment/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...jobFormData,
            employerUserId: 'admin'
          })
        });
        if (!res.ok) throw new Error('Lỗi khi thêm tin tuyển dụng mới');
        alert('Đăng tin tuyển dụng mới thành công!');
      }
      setShowJobModal(false);
      fetchData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi xử lý tin tuyển dụng');
    }
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tin tuyển dụng: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Đã xóa tin tuyển dụng thành công!');
        fetchData();
      }
    } catch (e) {
      console.error('Error deleting job:', e);
    }
  };

  const handleToggleJobStatus = async (job: RecruitmentJob) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await fetch(`/api/recruitment/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleJobVip = async (job: RecruitmentJob) => {
    try {
      await fetch(`/api/recruitment/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVip: !job.isVip })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleJobUrgent = async (job: RecruitmentJob) => {
    try {
      await fetch(`/api/recruitment/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUrgent: !job.isUrgent })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Candidate Actions
  const handleDeleteCandidate = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa hồ sơ ứng viên "${name}" khỏi hệ thống?`)) return;
    try {
      const res = await fetch(`/api/recruitment/candidates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Đã xóa hồ sơ ứng viên thành công!');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCandidateStatus = async (cand: CandidateProfile) => {
    try {
      await fetch('/api/recruitment/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cand.id,
          isLookingForJob: !cand.isLookingForJob
        })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Application Actions
  const handleUpdateApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/recruitment/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        alert(`Đã cập nhật trạng thái hồ sơ ứng tuyển: ${newStatus}`);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm('Bạn có chắc muốn xóa lượt ứng tuyển này?')) return;
    try {
      await fetch(`/api/recruitment/applications/${appId}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered lists
  const filteredJobs = jobs.filter(j => {
    const matchQ = !searchQuery || 
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.contactPhone.includes(searchQuery);
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    const matchInd = industryFilter === 'all' || j.industry === industryFilter;
    const matchProj = projectFilter === 'all' || j.project === projectFilter;
    return matchQ && matchStatus && matchInd && matchProj;
  });

  const filteredCandidates = candidates.filter(c => {
    const matchQ = !searchQuery || 
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetJobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    const matchInd = industryFilter === 'all' || c.primaryIndustry === industryFilter;
    const matchProj = projectFilter === 'all' || c.currentProject === projectFilter;
    return matchQ && matchInd && matchProj;
  });

  // Calculate Metrics
  const totalUnlockRevenue = unlocks.reduce((sum, u) => sum + (u.amountVnd || 0), 0);
  const activeJobsCount = jobs.filter(j => j.status === 'active').length;
  const vipJobsCount = jobs.filter(j => j.isVip).length;
  const readyCandidatesCount = candidates.filter(c => c.isLookingForJob).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 p-6 rounded-3xl border border-teal-500/30 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-teal-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                ADMINISTRATION 24H
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                ● LIVE SYNC ACTIVE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-teal-300 tracking-tight flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-teal-400" />
              <span>QUẢN TRỊ VIỆC LÀM & TUYỂN DỤNG CƯ DÂN TOÀN DIỆN</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl">
              Kiểm duyệt tin tuyển dụng nội khu, quản lý kho CV ứng viên, theo dõi nộp hồ sơ và doanh thu mở khóa số điện thoại ứng viên (50.000đ/CV).
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleOpenAddJob}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-900/40 transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Đăng Tin Tuyển Dụng Mới</span>
            </button>

            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-4 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tin Đang Tuyển Dụng</span>
            <div className="text-lg font-black text-teal-400 flex items-center gap-1.5">
              <span>{activeJobsCount} / {jobs.length}</span>
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-ping"></span>
            </div>
            <span className="text-[10px] text-slate-400 block">{vipJobsCount} Tin VIP / Gấp</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Hồ Sơ CV Ứng Viên</span>
            <div className="text-lg font-black text-emerald-400">
              {candidates.length} CV
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block">✓ {readyCandidatesCount} Sẵn sàng đi làm</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Hồ Sơ Ứng Tuyển</span>
            <div className="text-lg font-black text-sky-400">
              {applications.length} Đơn
            </div>
            <span className="text-[10px] text-sky-400 font-semibold block">✓ Nộp trực tuyến</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Doanh Thu Mở Khóa CV</span>
            <div className="text-lg font-black text-amber-400">
              {totalUnlockRevenue.toLocaleString('vi-VN')} đ
            </div>
            <span className="text-[10px] text-amber-400 font-semibold block">{unlocks.length} lượt mở VietQR</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSection('jobs')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'jobs'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>1. Quản Lý Tin Tuyển Dụng ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('candidates')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'candidates'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Kho Hồ Sơ CV Cư Dân ({candidates.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('applications')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'applications'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Danh Sách Ứng Tuyển ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('unlocks')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'unlocks'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>4. Nhật Ký Mở Khóa CV & Thu Phí ({unlocks.length})</span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, công ty, tên ứng viên, số điện thoại..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeSection === 'jobs' && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang tuyển (Active)</option>
              <option value="closed">Đã đóng (Closed)</option>
              <option value="pending">Chờ duyệt (Pending)</option>
            </select>
          )}

          <select
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200"
          >
            <option value="all">Mọi ngành nghề</option>
            <option value="Bất Động Sản & Môi Giới">BĐS & Môi Giới</option>
            <option value="F&B - Nhà Hàng & Cafe">F&B - Nhà Hàng & Cafe</option>
            <option value="Giúp Việc & Tạp Vụ">Giúp Việc & Tạp Vụ</option>
            <option value="Kỹ Thuật - Điện Nước - Cơ Điện">Kỹ Thuật & Điện Nước</option>
            <option value="Bán Hàng - Thu Ngân - CSKH">Bán Hàng & CSKH</option>
            <option value="Marketing - Media - IT">Marketing & IT</option>
            <option value="Gia Sư & Giáo Dục">Gia Sư & Dạy Kèm</option>
            <option value="Tài Xế - Giao Hàng">Tài Xế & Giao Hàng</option>
          </select>

          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200"
          >
            <option value="all">Mọi khu đô thị</option>
            <option value="ocean-park-1">Vinhomes Ocean Park 1</option>
            <option value="ocean-park-2">Vinhomes Ocean Park 2</option>
            <option value="ocean-park-3">Vinhomes Ocean Park 3</option>
            <option value="smart-city">Vinhomes Smart City</option>
            <option value="grand-park">Vinhomes Grand Park</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: QUẢN LÝ TIN TUYỂN DỤNG */}
      {/* ========================================================================= */}
      {activeSection === 'jobs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-teal-600" />
              <span>Danh sách tin tuyển dụng ({filteredJobs.length} tin)</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Bấm vào các nút trạng thái để bật/tắt hoặc chỉnh sửa</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Tin Tuyển Dụng</th>
                  <th className="p-3.5">Đơn Vị & Địa Điểm</th>
                  <th className="p-3.5">Mức Lương & Hình Thức</th>
                  <th className="p-3.5">Liên Hệ</th>
                  <th className="p-3.5 text-center">Huy Hiệu</th>
                  <th className="p-3.5 text-center">Trạng Thái</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Không tìm thấy tin tuyển dụng nào phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">
                          {job.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 font-bold rounded-md border border-teal-200/50 text-[10px]">
                            {job.industry}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            👁️ {job.viewsCount || 0} lượt xem • 📄 {job.applicationsCount || 0} ứng tuyển
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {job.companyName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{job.location}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {job.salaryDisplay}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium capitalize mt-0.5">
                          {job.jobType === 'full-time' ? 'Toàn thời gian' : job.jobType === 'part-time' ? 'Bán thời gian' : job.jobType === 'shift' ? 'Theo ca' : 'Freelance'} • {job.experienceDisplay}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {job.contactName}
                        </div>
                        <div className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                          📞 {job.contactPhone}
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleToggleJobVip(job)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border transition cursor-pointer ${
                              job.isVip 
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                            }`}
                            title="Bấm để bật/tắt VIP"
                          >
                            VIP
                          </button>
                          <button
                            onClick={() => handleToggleJobUrgent(job)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border transition cursor-pointer ${
                              job.isUrgent 
                                ? 'bg-rose-600 text-white border-rose-500 shadow-xs animate-pulse' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                            }`}
                            title="Bấm để bật/tắt Tuyển Gấp"
                          >
                            GẤP
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleJobStatus(job)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition cursor-pointer ${
                            job.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                              : job.status === 'closed'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {job.status === 'active' ? '🟢 Đang Tuyển' : job.status === 'closed' ? '⚫ Đã Đóng' : '🟡 Chờ Duyệt'}
                        </button>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditJob(job)}
                            className="p-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 hover:bg-teal-100 rounded-lg transition"
                            title="Chỉnh sửa tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id, job.title)}
                            className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-lg transition"
                            title="Xóa tin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: KHO HỒ SƠ CV CƯ DÂN */}
      {/* ========================================================================= */}
      {activeSection === 'candidates' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Kho CV Ứng Viên Cư Dân ({filteredCandidates.length} hồ sơ - Đầy đủ Số ĐT/Zalo chế độ Quản Trị)</span>
            </span>
            <span className="text-xs text-emerald-600 font-bold">✓ Quyền Quản Trị: Xem 100% số liên hệ không bị mã hóa</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Ứng Viên</th>
                  <th className="p-3.5">Vị Trí & Ngành Nghề</th>
                  <th className="p-3.5">Kinh Nghiệm & Lương Kỳ Vọng</th>
                  <th className="p-3.5">Số Điện Thoại & Zalo (Admin)</th>
                  <th className="p-3.5 text-center">Trạng Thái Tìm Việc</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Chưa có hồ sơ ứng viên nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map(cand => (
                    <tr key={cand.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={cand.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-black text-slate-900 dark:text-white text-sm">
                              {cand.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Sinh năm: {cand.birthYear || 'N/A'} • {cand.currentAddress || cand.projectName || 'Vinhomes'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-teal-700 dark:text-teal-400 text-sm">
                          {cand.targetJobTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {cand.primaryIndustry}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-black text-emerald-600 dark:text-emerald-400">
                          {cand.expectedSalary}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {cand.yearsOfExp ? `${cand.yearsOfExp} năm KN` : 'Chưa có KN'} • {cand.experienceLevel}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{cand.phone}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Zalo: {cand.zalo || cand.phone} • {cand.email}
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleCandidateStatus(cand)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black border transition cursor-pointer ${
                            cand.isLookingForJob
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300'
                          }`}
                        >
                          {cand.isLookingForJob ? '🟢 Sẵn Sàng Đi Làm' : '⚪ Đã Có Việc'}
                        </button>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="p-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 hover:bg-teal-100 rounded-lg transition"
                            title="Xem chi tiết CV"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(cand.id, cand.fullName)}
                            className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-lg transition"
                            title="Xóa hồ sơ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: DANH SÁCH ỨNG TUYỂN (APPLICATIONS) */}
      {/* ========================================================================= */}
      {activeSection === 'applications' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Hồ sơ nộp ứng tuyển ({applications.length} lượt nộp)</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Ứng Viên Nộp Hồ Sơ</th>
                  <th className="p-3.5">Vị Trí / Tin Tuyển Dụng</th>
                  <th className="p-3.5">Lời Nhắn / Kỳ Vọng</th>
                  <th className="p-3.5">Thời Gian Nộp</th>
                  <th className="p-3.5 text-center">Trạng Thái Hồ Sơ</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Chưa có lượt ứng tuyển nào.
                    </td>
                  </tr>
                ) : (
                  applications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-black text-slate-900 dark:text-white text-sm">
                          {app.candidateName}
                        </div>
                        <div className="font-mono text-teal-600 dark:text-teal-400 font-bold mt-0.5">
                          📞 {app.candidatePhone} • {app.candidateEmail || 'Chưa cập nhật email'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">
                          {app.jobTitle}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Đơn vị: {app.companyName}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-600 dark:text-slate-300 italic max-w-xs line-clamp-2">
                          "{app.message || 'Xin chào, tôi rất quan tâm đến công việc này và mong muốn ứng tuyển!'}"
                        </div>
                        {app.expectedSalary && (
                          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                            Lương mong muốn: {app.expectedSalary}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {app.createdAt}
                      </td>

                      <td className="p-3.5 text-center">
                        <select
                          value={app.status}
                          onChange={e => handleUpdateApplicationStatus(app.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black border cursor-pointer ${
                            app.status === 'applied'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : app.status === 'reviewing'
                              ? 'bg-sky-50 text-sky-700 border-sky-300'
                              : app.status === 'interview_scheduled'
                              ? 'bg-purple-50 text-purple-700 border-purple-300'
                              : app.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          <option value="applied">🟡 Đã Nộp</option>
                          <option value="reviewing">🔍 Đang Xem Xét</option>
                          <option value="interview_scheduled">📅 Đã Hẹn Phỏng Vấn</option>
                          <option value="accepted">🟢 Đã Nhận Việc</option>
                          <option value="rejected">🔴 Từ Chối</option>
                        </select>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-lg transition"
                          title="Xóa lượt nộp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: NHẬT KÝ MỞ KHÓA CV & THU PHÍ (UNLOCK LOGS) */}
      {/* ========================================================================= */}
      {activeSection === 'unlocks' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Unlock className="w-4 h-4 text-amber-500" />
              <span>Giao dịch mở khóa CV ứng viên ({unlocks.length} lượt mở - Tổng thu: {totalUnlockRevenue.toLocaleString('vi-VN')} đ)</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Mã Giao Dịch</th>
                  <th className="p-3.5">Nhà Tuyển Dụng Mua CV</th>
                  <th className="p-3.5">Ứng Viên Được Mở Khóa</th>
                  <th className="p-3.5">Số Tiền & Phương Thức</th>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {unlocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Chưa có giao dịch mở khóa CV nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  unlocks.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {log.id}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {log.recruiterName}
                        </div>
                        <div className="font-mono text-[11px] text-teal-600">
                          {log.recruiterPhone || 'Tài khoản cư dân'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {log.candidateName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {log.candidateId}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-black text-amber-600 dark:text-amber-400">
                          {log.amountVnd.toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                          {log.paymentMethod === 'vietqr' ? 'VietQR Tự Động' : 'Ví Cư Dân'}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {log.createdAt}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-black rounded-full border border-emerald-300 text-[10px]">
                          ✓ Thành Công
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: THÊM / SỬA TIN TUYỂN DỤNG */}
      {/* ========================================================================= */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-600" />
                <span>{editingJob ? 'Chỉnh Sửa Tin Tuyển Dụng' : 'Đăng Tin Tuyển Dụng Mới'}</span>
              </h3>
              <button
                onClick={() => setShowJobModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tiêu Đề Công Việc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Tuyển Nhân Viên Pha Chế Cafe Phân Khu Kinh Đô"
                    value={jobFormData.title}
                    onChange={e => setJobFormData({ ...jobFormData, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tên Đơn Vị / Công Ty / Cửa Hàng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Highland Coffee Ocean Park 2"
                    value={jobFormData.companyName}
                    onChange={e => setJobFormData({ ...jobFormData, companyName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Ngành Nghề Tuyển Dụng <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={jobFormData.industry}
                    onChange={e => setJobFormData({ ...jobFormData, industry: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Bất Động Sản & Môi Giới">Bất Động Sản & Môi Giới</option>
                    <option value="F&B - Nhà Hàng & Cafe">F&B - Nhà Hàng & Cafe</option>
                    <option value="Giúp Việc & Tạp Vụ">Giúp Việc & Tạp Vụ</option>
                    <option value="Kỹ Thuật - Điện Nước - Cơ Điện">Kỹ Thuật - Điện Nước - Cơ Điện</option>
                    <option value="Bán Hàng - Thu Ngân - CSKH">Bán Hàng - Thu Ngân - CSKH</option>
                    <option value="Marketing - Media - IT">Marketing - Media - IT</option>
                    <option value="Gia Sư & Giáo Dục">Gia Sư & Giáo Dục</option>
                    <option value="Tài Xế - Giao Hàng">Tài Xế - Giao Hàng</option>
                    <option value="Bảo Vệ & An Ninh">Bảo Vệ & An Ninh</option>
                    <option value="Lễ Tân & Hành Chính">Lễ Tân & Hành Chính</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Khu Đô Thị / Dự Án
                  </label>
                  <select
                    value={jobFormData.project}
                    onChange={e => setJobFormData({ ...jobFormData, project: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="ocean-park-1">Vinhomes Ocean Park 1</option>
                    <option value="ocean-park-2">Vinhomes Ocean Park 2</option>
                    <option value="ocean-park-3">Vinhomes Ocean Park 3</option>
                    <option value="smart-city">Vinhomes Smart City</option>
                    <option value="grand-park">Vinhomes Grand Park</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Địa Điểm Làm Việc Cụ Thể
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Shophouse Sao Biển 08, Ocean Park 2"
                    value={jobFormData.location}
                    onChange={e => setJobFormData({ ...jobFormData, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hình Thức Làm Việc
                  </label>
                  <select
                    value={jobFormData.jobType}
                    onChange={e => setJobFormData({ ...jobFormData, jobType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="full-time">Toàn thời gian (Full-time)</option>
                    <option value="part-time">Bán thời gian (Part-time)</option>
                    <option value="shift">Làm theo ca (Shift)</option>
                    <option value="freelance">Linh hoạt (Freelance)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mức Lương Hiển Thị
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 10 - 15 Triệu/tháng hoặc Thỏa thuận"
                    value={jobFormData.salaryDisplay}
                    onChange={e => setJobFormData({ ...jobFormData, salaryDisplay: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Người Liên Hệ Tuyển Dụng
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Chị Lan (Quản lý)"
                    value={jobFormData.contactName}
                    onChange={e => setJobFormData({ ...jobFormData, contactName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Số Điện Thoại & Zalo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 0868499929"
                    value={jobFormData.contactPhone}
                    onChange={e => setJobFormData({ ...jobFormData, contactPhone: e.target.value, contactZalo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mô Tả Chi Tiết Công Việc
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả công việc hàng ngày, thời gian làm việc..."
                    value={jobFormData.description}
                    onChange={e => setJobFormData({ ...jobFormData, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobFormData.isVip}
                      onChange={e => setJobFormData({ ...jobFormData, isVip: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded-sm"
                    />
                    <span className="font-bold text-slate-800 dark:text-white">⭐ Đánh dấu Tin VIP (Nổi bật đầu trang)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobFormData.isUrgent}
                      onChange={e => setJobFormData({ ...jobFormData, isUrgent: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded-sm"
                    />
                    <span className="font-bold text-rose-600">🔥 Đánh dấu Tuyển Gấp</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold rounded-xl"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl shadow-lg"
                >
                  {editingJob ? 'Lưu Thay Đổi' : 'Đăng Tin Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: XEM CHI TIẾT CV ỨNG VIÊN (ADMIN FULL VIEW) */}
      {/* ========================================================================= */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCandidate.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={selectedCandidate.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-teal-500"
                />
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    {selectedCandidate.fullName}
                  </h3>
                  <div className="text-xs text-teal-600 dark:text-teal-400 font-bold">
                    {selectedCandidate.targetJobTitle} • {selectedCandidate.primaryIndustry}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <span className="font-black text-emerald-800 dark:text-emerald-300 block mb-1">
                  📞 THÔNG TIN LIÊN HỆ ĐẦY ĐỦ (QUYỀN QUẢN TRỊ ADMIN):
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-800 dark:text-slate-200 font-mono">
                  <div><strong>Số Điện Thoại:</strong> {selectedCandidate.phone}</div>
                  <div><strong>Zalo:</strong> {selectedCandidate.zalo || selectedCandidate.phone}</div>
                  <div><strong>Email:</strong> {selectedCandidate.email}</div>
                  <div><strong>Căn Hộ / Phân Khu:</strong> {selectedCandidate.currentAddress || selectedCandidate.projectName}</div>
                </div>
              </div>

              <div>
                <strong className="text-slate-800 dark:text-slate-200 block mb-1">Giới Thiệu Bản Thân:</strong>
                <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                  {selectedCandidate.introduction || 'Ứng viên chưa cập nhật phần giới thiệu.'}
                </p>
              </div>

              {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 block mb-1">Kỹ Năng Thế Mạnh:</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 font-bold rounded-lg border border-teal-200/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCandidate.workExperience && selectedCandidate.workExperience.length > 0 && (
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 block mb-1">Lịch Sử Kinh Nghiệm:</strong>
                  <div className="space-y-2">
                    {selectedCandidate.workExperience.map((exp, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{exp.role} @ {exp.company}</div>
                        <div className="text-[11px] text-slate-400">{exp.period}</div>
                        <div className="text-slate-600 dark:text-slate-300 mt-1">{exp.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
