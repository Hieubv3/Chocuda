import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Users, FileText, CheckCircle2, Clock, XCircle, 
  Trash2, Edit3, Plus, Search, Filter, Eye, Phone, Mail, 
  DollarSign, Sparkles, ShieldCheck, Download, RefreshCw,
  ExternalLink, Building2, MapPin, Tag, Award, Check, UserCheck, Unlock, Globe, Link2,
  Coins, Send, CheckSquare, Layers, AlertTriangle, Shield
} from 'lucide-react';
import { RecruitmentJob, CandidateProfile, JobApplication, CvUnlockRecord, ProjectCategory, EmployerProfile, EmployerRegistrationRequest, AdminTaskDelegation } from '../types';
import { getJobDetailUrl, getCandidateCvUrl, getEmployerProfileUrl, slugify } from '../lib/slugs';
import { INITIAL_EMPLOYERS } from '../data/recruitmentData';

interface AdminRecruitmentManagerProps {
  onRefresh?: () => void;
}

export const AdminRecruitmentManager: React.FC<AdminRecruitmentManagerProps> = ({ onRefresh }) => {
  const [activeSection, setActiveSection] = useState<'jobs' | 'candidates' | 'employers' | 'applications' | 'unlocks' | 'registrations' | 'tasks' | 'stats'>('jobs');
  
  // Data State
  const [jobs, setJobs] = useState<RecruitmentJob[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [employers, setEmployers] = useState<EmployerProfile[]>(INITIAL_EMPLOYERS);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [unlocks, setUnlocks] = useState<CvUnlockRecord[]>([]);
  const [registrations, setRegistrations] = useState<EmployerRegistrationRequest[]>([]);
  const [tasks, setTasks] = useState<AdminTaskDelegation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Task Modal & Form State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<AdminTaskDelegation | null>(null);
  const [taskFormData, setTaskFormData] = useState<Partial<AdminTaskDelegation>>({
    title: '',
    category: 'recruitment',
    targetTitle: '',
    targetProject: 'ocean-park-2',
    assignedToAdminId: 'admin_tuyendung_01',
    assignedToAdminName: 'Admin Trưởng Ban Tuyển Dụng',
    assignedByAdminId: 'admin_root',
    assignedByAdminName: 'Quản Trị Viên Tổng',
    priority: 'high',
    status: 'pending',
    deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    notes: ''
  });

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

  // Employer Modal State (Add / Edit)
  const [showEmployerModal, setShowEmployerModal] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<EmployerProfile | null>(null);
  const [employerFormData, setEmployerFormData] = useState({
    companyName: '',
    brandName: '',
    logoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    tagline: 'Nhà tuyển dụng uy tín tại Vinhomes',
    industry: 'Bất Động Sản & Môi Giới',
    project: 'ocean-park-2' as ProjectCategory,
    projectName: 'Vinhomes Ocean Park 2',
    address: 'Shophouse San Hô, Vinhomes Ocean Park 2',
    contactName: 'Ban Nhân Sự',
    contactPhone: '0868499929',
    contactZalo: '0868499929',
    contactEmail: 'tuyendung@chocudan24h.com',
    website: '',
    facebookUrl: '',
    introduction: 'Doanh nghiệp uy tín hoạt động lâu năm tại các đại đô thị Vinhomes.',
    scaleSize: '20 - 50 nhân sự',
    verified: true
  });

  // Candidate View / Edit Modal
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<CandidateProfile | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candidateFormData, setCandidateFormData] = useState({
    fullName: '',
    targetJobTitle: '',
    primaryIndustry: 'Bất Động Sản & Môi Giới',
    birthYear: 1995,
    gender: 'male' as 'male' | 'female' | 'other',
    currentProject: 'ocean-park-2' as ProjectCategory,
    projectName: 'Vinhomes Ocean Park 2',
    currentAddress: 'Phân khu Cọ Xanh, Vinhomes Ocean Park 2',
    phone: '',
    zalo: '',
    email: '',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    expectedSalary: '15 - 25 Triệu/tháng',
    yearsOfExp: 2,
    experienceLevel: 'experienced' as any,
    introduction: '',
    skillsText: 'Kỹ năng bán hàng, Tư vấn khách hàng, Giao tiếp tốt',
    isLookingForJob: true
  });

  // Accordion Expand IDs for All Sections
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const [expandedEmployerId, setExpandedEmployerId] = useState<string | null>(null);
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null);
  const [expandedUnlockId, setExpandedUnlockId] = useState<string | null>(null);
  const [expandedRegistrationId, setExpandedRegistrationId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

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

      // 5. Fetch Employers
      const resEmployers = await fetch('/api/recruitment/employers');
      if (resEmployers.ok) {
        const dataEmployers = await resEmployers.json();
        if (Array.isArray(dataEmployers) && dataEmployers.length > 0) {
          setEmployers(dataEmployers);
        }
      }

      // 6. Fetch Employer Registrations
      const resRegs = await fetch('/api/recruitment/employer-registrations');
      if (resRegs.ok) {
        const dataRegs = await resRegs.json();
        setRegistrations(Array.isArray(dataRegs) ? dataRegs : []);
      }

      // 7. Fetch Admin Tasks
      const resTasks = await fetch('/api/admin/tasks');
      if (resTasks.ok) {
        const dataTasks = await resTasks.json();
        setTasks(Array.isArray(dataTasks) ? dataTasks : []);
      }
    } catch (e) {
      console.error('Error fetching recruitment admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Employer Registration Approval & Token Injection
  const handleApproveRegistration = async (reg: EmployerRegistrationRequest) => {
    const defaultTokens = reg.tokenCost || 1000000;
    const inputTokens = prompt(`Nhập số Token Cư Dân (Xu Tiêu Dùng) sẽ tự động BƠM vào ví của Doanh Nghiệp "${reg.companyName}":`, defaultTokens.toString());
    if (inputTokens === null) return;
    const tokensToInject = parseInt(inputTokens, 10) || defaultTokens;

    try {
      const res = await fetch(`/api/recruitment/employer-registrations/${reg.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokensToInject,
          adminName: 'Admin Trưởng Ban Tuyển Dụng'
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || `🎉 Đã duyệt gói tuyển dụng và bơm thành công ${tokensToInject.toLocaleString('vi-VN')} Token vào ví người dùng!`);
        fetchData();
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || 'Lỗi duyệt đăng ký');
      }
    } catch (err: any) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleRejectRegistration = async (regId: string) => {
    const reason = prompt('Nhập lý do từ chối đăng ký (nếu có):', 'Thông tin doanh nghiệp chưa đầy đủ hoặc không hợp lệ');
    if (reason === null) return;

    try {
      const res = await fetch(`/api/recruitment/employer-registrations/${regId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: reason })
      });
      if (res.ok) {
        alert('Đã từ chối yêu cầu đăng ký.');
        fetchData();
      }
    } catch (e) {
      alert('Lỗi khi từ chối');
    }
  };

  // Task Delegation Handlers
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.title || !taskFormData.assignedToAdminName) {
      alert('Vui lòng nhập Tiêu đề nhiệm vụ và Người phụ trách!');
      return;
    }

    try {
      if (editingTask) {
        const res = await fetch(`/api/admin/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskFormData)
        });
        if (res.ok) {
          alert('Cập nhật nhiệm vụ thành công!');
        }
      } else {
        const res = await fetch('/api/admin/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskFormData)
        });
        if (res.ok) {
          alert('Tạo và giao nhiệm vụ mới thành công!');
        }
      }
      setShowTaskModal(false);
      fetchData();
    } catch (e) {
      alert('Lỗi lưu nhiệm vụ');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) return;
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Đã xóa nhiệm vụ');
        fetchData();
      }
    } catch (e) {
      alert('Lỗi khi xóa nhiệm vụ');
    }
  };

  const handleUpdateTaskStatus = async (task: AdminTaskDelegation, newStatus: any) => {
    try {
      await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (e) {
      console.error(e);
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

  // Handle Employer Actions
  const handleOpenAddEmployer = () => {
    setEditingEmployer(null);
    setEmployerFormData({
      companyName: '',
      brandName: '',
      logoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      tagline: 'Nhà tuyển dụng uy tín tại Vinhomes',
      industry: 'Bất Động Sản & Môi Giới',
      project: 'ocean-park-2' as ProjectCategory,
      projectName: 'Vinhomes Ocean Park 2',
      address: 'Shophouse San Hô, Vinhomes Ocean Park 2',
      contactName: 'Ban Nhân Sự',
      contactPhone: '0868499929',
      contactZalo: '0868499929',
      contactEmail: 'tuyendung@chocudan24h.com',
      website: '',
      facebookUrl: '',
      introduction: 'Doanh nghiệp uy tín hoạt động lâu năm tại các đại đô thị Vinhomes.',
      scaleSize: '20 - 50 nhân sự',
      verified: true
    });
    setShowEmployerModal(true);
  };

  const handleOpenEditEmployer = (emp: EmployerProfile) => {
    setEditingEmployer(emp);
    setEmployerFormData({
      companyName: emp.companyName,
      brandName: emp.brandName || emp.companyName,
      logoUrl: emp.logoUrl || '',
      bannerUrl: emp.bannerUrl || '',
      tagline: emp.tagline || '',
      industry: emp.industry || 'Bất Động Sản & Môi Giới',
      project: (typeof emp.project === 'string' ? emp.project : 'ocean-park-2') as ProjectCategory,
      projectName: emp.projectName || 'Vinhomes Ocean Park 2',
      address: emp.address,
      contactName: emp.contactName,
      contactPhone: emp.contactPhone,
      contactZalo: emp.contactZalo || emp.contactPhone,
      contactEmail: emp.contactEmail || '',
      website: emp.website || '',
      facebookUrl: emp.facebookUrl || '',
      introduction: emp.introduction || '',
      scaleSize: emp.scaleSize || '10 - 50 nhân sự',
      verified: Boolean(emp.verified)
    });
    setShowEmployerModal(true);
  };

  const handleSaveEmployer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerFormData.companyName || !employerFormData.contactPhone || !employerFormData.address) {
      alert('Vui lòng nhập Tên Doanh Nghiệp, Số Điện Thoại và Địa Chỉ!');
      return;
    }

    try {
      const payload = {
        ...(editingEmployer ? { id: editingEmployer.id, userId: editingEmployer.userId } : {}),
        ...employerFormData
      };

      const res = await fetch('/api/recruitment/employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingEmployer ? '✓ Đã cập nhật hồ sơ Nhà Tuyển Dụng!' : '🎉 Đã thêm hồ sơ Nhà Tuyển Dụng thành công!');
        setShowEmployerModal(false);
        fetchData();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.error || 'Không thể lưu hồ sơ'));
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối máy chủ!');
    }
  };

  const handleDeleteEmployer = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ nhà tuyển dụng "${name}"?`)) return;
    try {
      const res = await fetch(`/api/recruitment/employers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmployers(prev => prev.filter(e => e.id !== id));
        alert('✓ Đã xóa hồ sơ nhà tuyển dụng!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleEmployerVerified = async (emp: EmployerProfile) => {
    const nextVal = !emp.verified;
    try {
      const res = await fetch('/api/recruitment/employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...emp,
          verified: nextVal
        })
      });
      if (res.ok) {
        setEmployers(prev => prev.map(e => e.id === emp.id ? { ...e, verified: nextVal } : e));
      }
    } catch (e) {
      console.error(e);
    }
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

  // Candidate Actions (Add / Edit / Delete / Toggle)
  const handleOpenAddCandidate = () => {
    setEditingCandidate(null);
    setCandidateFormData({
      fullName: '',
      targetJobTitle: '',
      primaryIndustry: 'Bất Động Sản & Môi Giới',
      birthYear: 1995,
      gender: 'male',
      currentProject: 'ocean-park-2',
      projectName: 'Vinhomes Ocean Park 2',
      currentAddress: 'Phân khu Cọ Xanh, Vinhomes Ocean Park 2',
      phone: '',
      zalo: '',
      email: '',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      expectedSalary: '15 - 25 Triệu/tháng',
      yearsOfExp: 2,
      experienceLevel: 'experienced',
      introduction: 'Ứng viên năng động, nhiệt tình, có trách nhiệm cao trong công việc.',
      skillsText: 'Kỹ năng bán hàng, Tư vấn khách hàng, Giao tiếp tốt',
      isLookingForJob: true
    });
    setShowCandidateModal(true);
  };

  const handleOpenEditCandidate = (cand: CandidateProfile) => {
    setEditingCandidate(cand);
    setCandidateFormData({
      fullName: cand.fullName || '',
      targetJobTitle: cand.targetJobTitle || '',
      primaryIndustry: cand.primaryIndustry || 'Bất Động Sản & Môi Giới',
      birthYear: cand.birthYear || 1995,
      gender: cand.gender || 'male',
      currentProject: cand.currentProject || 'ocean-park-2',
      projectName: cand.projectName || 'Vinhomes Ocean Park 2',
      currentAddress: cand.currentAddress || '',
      phone: cand.phone || '',
      zalo: cand.zalo || cand.phone || '',
      email: cand.email || '',
      avatarUrl: cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      expectedSalary: cand.expectedSalary || 'Thỏa thuận',
      yearsOfExp: cand.yearsOfExp || 1,
      experienceLevel: (cand.experienceLevel as any) || 'experienced',
      introduction: cand.introduction || '',
      skillsText: Array.isArray(cand.skills) ? cand.skills.join(', ') : '',
      isLookingForJob: Boolean(cand.isLookingForJob)
    });
    setShowCandidateModal(true);
  };

  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateFormData.fullName || !candidateFormData.phone || !candidateFormData.targetJobTitle) {
      alert('Vui lòng nhập đầy đủ Tên Ứng Viên, Vị Trí và Số Điện Thoại!');
      return;
    }

    try {
      const skills = candidateFormData.skillsText.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        ...(editingCandidate ? { id: editingCandidate.id, userId: editingCandidate.userId } : {}),
        ...candidateFormData,
        skills
      };

      const res = await fetch('/api/recruitment/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingCandidate ? '✓ Đã cập nhật hồ sơ Ứng viên CV!' : '🎉 Đã thêm hồ sơ Ứng viên CV mới thành công!');
        setShowCandidateModal(false);
        fetchData();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.error || 'Không thể lưu hồ sơ ứng viên'));
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối máy chủ!');
    }
  };

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
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Token Thu Phí Mở Khóa CV</span>
            <div className="text-lg font-black text-amber-400 flex items-center gap-1">
              <span>🪙 {totalUnlockRevenue.toLocaleString('vi-VN')}</span>
              <span className="text-xs font-normal text-slate-400">Token</span>
            </div>
            <span className="text-[10px] text-amber-400 font-semibold block">{unlocks.length} lượt mở khóa hồ sơ</span>
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
          onClick={() => setActiveSection('employers')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'employers'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>3. Danh Bạ Nhà Tuyển Dụng ({employers.length})</span>
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
          <span>4. Danh Sách Ứng Tuyển ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('unlocks')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'unlocks'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>5. Nhật Ký Mở Khóa CV Token ({unlocks.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('registrations')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'registrations'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>6. Duyệt Gói & Bơm Token NTD</span>
          {registrations.filter(r => r.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black animate-pulse">
              {registrations.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('tasks')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'tasks'
              ? 'bg-sky-600 text-white shadow-md font-extrabold'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-sky-400" />
          <span>7. Phân Công Giao Việc Quản Trị ({tasks.length})</span>
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
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-600" />
                <span>Danh Sách Tin Tuyển Dụng ({filteredJobs.length} tin)</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhấp vào từng dòng để mở rộng xem chi tiết nội dung, mô tả, quyền lợi và thanh công cụ Thêm / Sửa / Xóa / Đổi trạng thái.
              </p>
            </div>

            <button
              onClick={handleOpenAddJob}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition transform active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Tin Tuyển Mới</span>
            </button>
          </div>

          {/* Mobile Compact & Expandable Jobs List */}
          <div className="block md:hidden p-3 space-y-2.5">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Không tìm thấy tin tuyển dụng nào phù hợp bộ lọc.
              </div>
            ) : (
              filteredJobs.map(job => {
                const isExpanded = expandedJobId === job.id;
                return (
                  <div
                    key={job.id}
                    className={`border rounded-2xl p-3.5 transition cursor-pointer ${
                      isExpanded 
                        ? 'border-teal-500/80 bg-teal-50/30 dark:bg-slate-800/80 shadow-md ring-1 ring-teal-500/30' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-teal-500/40'
                    }`}
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-slate-900 dark:text-white text-xs leading-snug">
                          {job.title}
                        </div>
                        <div className="text-[11px] text-teal-700 dark:text-teal-400 font-bold mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-teal-600 shrink-0" />
                          <span className="truncate">{job.companyName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                          job.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : job.status === 'closed'
                            ? 'bg-slate-100 text-slate-500 border-slate-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {job.status === 'active' ? '🟢 Tuyển' : job.status === 'closed' ? '⚫ Đóng' : '🟡 Chờ'}
                        </span>
                        <span className={`text-[10px] text-teal-600 font-bold transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Quick summary row */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        💰 {job.salaryDisplay}
                      </span>
                      <div className="flex items-center gap-1">
                        {job.isVip && (
                          <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded text-[9px] font-black">
                            ⭐ VIP
                          </span>
                        )}
                        {job.isUrgent && (
                          <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-black animate-pulse">
                            🔥 GẤP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3 text-xs" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold">Địa Điểm:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              📍 {job.location}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold">Hình Thức & KN:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {job.jobType} • {job.experienceDisplay}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-400 block text-[10px] font-bold">Liên Hệ Tuyển Dụng:</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{job.contactName}</span>
                              <a href={`tel:${job.contactPhone}`} className="font-mono font-bold text-emerald-600 hover:underline">
                                📞 {job.contactPhone}
                              </a>
                            </div>
                          </div>
                        </div>

                        {job.description && (
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mô tả công việc:</span>
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                              {job.description}
                            </p>
                          </div>
                        )}

                        {/* Complete Action Toolbar */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleToggleJobStatus(job)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                                job.status === 'active'
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              {job.status === 'active' ? '⚫ Đóng Tin' : '🟢 Mở Tuyển'}
                            </button>
                            <button
                              onClick={() => handleToggleJobVip(job)}
                              className="px-2.5 py-1.5 bg-amber-100 text-amber-900 rounded-lg text-[10px] font-black border border-amber-300 transition cursor-pointer"
                            >
                              {job.isVip ? 'Tắt VIP' : '⭐ Bật VIP'}
                            </button>
                            <button
                              onClick={() => handleToggleJobUrgent(job)}
                              className="px-2.5 py-1.5 bg-rose-100 text-rose-800 rounded-lg text-[10px] font-black border border-rose-300 transition cursor-pointer"
                            >
                              {job.isUrgent ? 'Tắt Gấp' : '🔥 Bật Gấp'}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <a
                              href={getJobDetailUrl(job)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black flex items-center gap-1 border border-emerald-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Soi Link</span>
                            </a>
                            <button
                              onClick={() => handleOpenEditJob(job)}
                              className="p-1.5 bg-teal-50 text-teal-700 rounded-lg font-bold flex items-center gap-1 border border-teal-300"
                              title="Sửa"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Sửa</span>
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="p-1.5 bg-rose-50 text-rose-600 rounded-lg font-bold flex items-center gap-1 border border-rose-300"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Xóa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View with Clickable Rows and Sub-row Details */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[880px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 w-10 text-center">#</th>
                  <th className="p-3.5 whitespace-nowrap">Tin Tuyển Dụng</th>
                  <th className="p-3.5 whitespace-nowrap">Đơn Vị & Địa Điểm</th>
                  <th className="p-3.5 whitespace-nowrap">Mức Lương & Hình Thức</th>
                  <th className="p-3.5 whitespace-nowrap">Liên Hệ Tuyển Dụng</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Huy Hiệu</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Trạng Thái</th>
                  <th className="p-3.5 text-right whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      Không tìm thấy tin tuyển dụng nào phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, idx) => {
                    const isExpanded = expandedJobId === job.id;
                    return (
                      <React.Fragment key={job.id}>
                        <tr 
                          onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                          className={`hover:bg-teal-50/40 dark:hover:bg-slate-800/60 transition cursor-pointer select-none ${
                            isExpanded ? 'bg-teal-50/60 dark:bg-slate-800/80 font-medium' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center text-slate-400 font-bold text-[11px]">
                            <span className={`inline-block transition-transform duration-200 text-teal-600 ${isExpanded ? 'rotate-90' : ''}`}>
                              ▶
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">
                              {job.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 font-bold rounded-md border border-teal-200/50 text-[10px] whitespace-nowrap">
                                {job.industry}
                              </span>
                              <span className="text-slate-400 text-[11px] whitespace-nowrap">
                                👁️ {job.viewsCount || 0} xem • 📄 {job.applicationsCount || 0} nộp
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
                            <div className="font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {job.salaryDisplay}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium capitalize mt-0.5 whitespace-nowrap">
                              {job.jobType === 'full-time' ? 'Toàn thời gian' : job.jobType === 'part-time' ? 'Bán thời gian' : job.jobType === 'shift' ? 'Theo ca' : 'Freelance'} • {job.experienceDisplay}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {job.contactName}
                            </div>
                            <div className="text-[11px] font-mono text-teal-600 dark:text-teal-400 whitespace-nowrap">
                              📞 {job.contactPhone}
                            </div>
                          </td>

                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
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

                          <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleJobStatus(job)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition cursor-pointer whitespace-nowrap ${
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

                          <td className="p-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={getJobDetailUrl(job)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800"
                                title={`Soi link bài đăng: ${getJobDetailUrl(job)}`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Soi Link</span>
                              </a>
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

                        {/* Detailed Expanded Sub-row for Job */}
                        {isExpanded && (
                          <tr className="bg-teal-50/40 dark:bg-slate-800/70 border-b-2 border-teal-500/30">
                            <td colSpan={8} className="p-4.5">
                              <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-teal-200 dark:border-teal-900/50 shadow-inner">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                  <div className="font-black text-teal-800 dark:text-teal-300 text-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-teal-500" />
                                    <span>CHI TIẾT ĐẦY ĐỦ TIN TUYỂN DỤNG & CÔNG CỤ QUẢN TRỊ</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleOpenAddJob()}
                                      className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ Thêm Tin Mới</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenEditJob(job)}
                                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Chỉnh Sửa Tin Này</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteJob(job.id, job.title)}
                                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Xóa Tin</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  <div className="space-y-1.5">
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block">Thông tin doanh nghiệp:</span>
                                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{job.companyName}</div>
                                    <div className="text-slate-600 dark:text-slate-400">📍 {job.location} ({job.projectName})</div>
                                    <div className="text-slate-600 dark:text-slate-400">🏢 Ngành: {job.industry}</div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block">Chế độ đãi ngộ:</span>
                                    <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{job.salaryDisplay}</div>
                                    <div className="text-slate-600 dark:text-slate-400">🕒 {job.jobType} • {job.experienceDisplay}</div>
                                    <div className="text-slate-600 dark:text-slate-400">📅 Hạn nộp: {job.deadline || 'Liên tục tuyển dụng'}</div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block">Kênh liên hệ trực tiếp:</span>
                                    <div className="font-bold text-slate-800 dark:text-slate-200">👤 {job.contactName}</div>
                                    <div className="font-mono text-emerald-600 font-bold">
                                      📞 <a href={`tel:${job.contactPhone}`} className="hover:underline">{job.contactPhone}</a> (Zalo: {job.contactZalo || job.contactPhone})
                                    </div>
                                    <div className="font-mono text-slate-500">✉️ {job.contactEmail || 'Chưa cập nhật email'}</div>
                                  </div>
                                </div>

                                {job.description && (
                                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mô tả công việc chi tiết:</span>
                                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                      {job.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Kho CV Ứng Viên Cư Dân ({filteredCandidates.length} hồ sơ)</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Admin xem trực tiếp 100% SĐT, Zalo và có thể Thêm CV mới, Sửa hồ sơ, Xóa hồ sơ hoặc Đổi trạng thái tìm việc.
              </p>
            </div>

            <button
              onClick={handleOpenAddCandidate}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition transform active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Hồ Sơ CV Mới</span>
            </button>
          </div>

          {/* Mobile Compact & Expandable Candidates List */}
          <div className="block md:hidden p-3 space-y-2.5">
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có hồ sơ ứng viên nào phù hợp.
              </div>
            ) : (
              filteredCandidates.map(cand => {
                const isExpanded = expandedCandidateId === cand.id;
                return (
                  <div
                    key={cand.id}
                    className={`border rounded-2xl p-3.5 transition cursor-pointer ${
                      isExpanded 
                        ? 'border-emerald-500/80 bg-emerald-50/30 dark:bg-slate-800/80 shadow-md ring-1 ring-emerald-500/30' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500/40'
                    }`}
                    onClick={() => setExpandedCandidateId(isExpanded ? null : cand.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img
                          src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={cand.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 dark:text-white text-xs truncate">
                            {cand.fullName}
                          </div>
                          <div className="text-[11px] text-teal-700 dark:text-teal-400 font-bold truncate">
                            {cand.targetJobTitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                          cand.isLookingForJob
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-300'
                        }`}>
                          {cand.isLookingForJob ? '🟢 Sẵn sàng' : '⚪ Đã có việc'}
                        </span>
                        <span className={`text-[10px] text-emerald-600 font-bold transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Quick summary line */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        💰 {cand.expectedSalary || 'Thỏa thuận'}
                      </span>
                      <a
                        href={`tel:${cand.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="font-mono text-emerald-600 font-bold hover:underline"
                      >
                        📞 {cand.phone}
                      </a>
                    </div>

                    {/* Expanded CV details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3 text-xs" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold">Ngành Nghề:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {cand.primaryIndustry}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold">Kinh Nghiệm:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {cand.yearsOfExp ? `${cand.yearsOfExp} năm` : 'Mới ra trường'} • {cand.experienceLevel}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold">Nơi Cư Trú:</span>
                            <span className="text-slate-800 dark:text-slate-200">
                              {cand.currentAddress || cand.projectName || 'Vinhomes'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold">Zalo & Email:</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200">
                              {cand.zalo || cand.phone} • {cand.email}
                            </span>
                          </div>
                        </div>

                        {cand.introduction && (
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Giới thiệu:</span>
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                              {cand.introduction}
                            </p>
                          </div>
                        )}

                        {cand.skills && cand.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cand.skills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded text-[10px] font-bold border border-teal-200/50">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Complete Action Toolbar */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleToggleCandidateStatus(cand)}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black border border-slate-300"
                          >
                            {cand.isLookingForJob ? 'Đổi: Đã có việc' : '🟢 Đổi: Đang tìm việc'}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <a
                              href={getCandidateCvUrl(cand)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black flex items-center gap-1 border border-emerald-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Soi CV</span>
                            </a>
                            <button
                              onClick={() => handleOpenEditCandidate(cand)}
                              className="p-1.5 bg-teal-50 text-teal-700 rounded-lg font-bold flex items-center gap-1 border border-teal-300"
                              title="Sửa hồ sơ"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Sửa</span>
                            </button>
                            <button
                              onClick={() => setSelectedCandidate(cand)}
                              className="p-1.5 bg-sky-50 text-sky-700 rounded-lg font-bold flex items-center gap-1 border border-sky-300"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Xem</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCandidate(cand.id, cand.fullName)}
                              className="p-1.5 bg-rose-50 text-rose-600 rounded-lg font-bold flex items-center gap-1 border border-rose-300"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Xóa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View with Clickable Rows and Sub-row Details */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[880px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 w-10 text-center">#</th>
                  <th className="p-3.5 whitespace-nowrap">Ứng Viên</th>
                  <th className="p-3.5 whitespace-nowrap">Vị Trí & Ngành Nghề</th>
                  <th className="p-3.5 whitespace-nowrap">Kinh Nghiệm & Lương Kỳ Vọng</th>
                  <th className="p-3.5 whitespace-nowrap">Số Điện Thoại & Zalo (Admin)</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Trạng Thái Tìm Việc</th>
                  <th className="p-3.5 text-right whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Chưa có hồ sơ ứng viên nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((cand, idx) => {
                    const isExpanded = expandedCandidateId === cand.id;
                    return (
                      <React.Fragment key={cand.id}>
                        <tr 
                          onClick={() => setExpandedCandidateId(isExpanded ? null : cand.id)}
                          className={`hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition cursor-pointer select-none ${
                            isExpanded ? 'bg-emerald-50/60 dark:bg-slate-800/80 font-medium' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center text-slate-400 font-bold text-[11px]">
                            <span className={`inline-block transition-transform duration-200 text-emerald-600 ${isExpanded ? 'rotate-90' : ''}`}>
                              ▶
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                alt={cand.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div>
                                <div className="font-black text-slate-900 dark:text-white text-sm whitespace-nowrap">
                                  {cand.fullName}
                                </div>
                                <div className="text-[11px] text-slate-400 whitespace-nowrap">
                                  Sinh năm: {cand.birthYear || 'N/A'} • {cand.currentAddress || cand.projectName || 'Vinhomes'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-extrabold text-teal-700 dark:text-teal-400 text-sm whitespace-nowrap">
                              {cand.targetJobTitle}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                              {cand.primaryIndustry}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {cand.expectedSalary}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                              {cand.yearsOfExp ? `${cand.yearsOfExp} năm KN` : 'Chưa có KN'} • {cand.experienceLevel}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5 whitespace-nowrap">
                              <Phone className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{cand.phone}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5 whitespace-nowrap">
                              Zalo: {cand.zalo || cand.phone} • {cand.email}
                            </div>
                          </td>

                          <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleCandidateStatus(cand)}
                              className={`px-3 py-1 rounded-full text-[10px] font-black border transition cursor-pointer whitespace-nowrap ${
                                cand.isLookingForJob
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300'
                              }`}
                            >
                              {cand.isLookingForJob ? '🟢 Sẵn Sàng Đi Làm' : '⚪ Đã Có Việc'}
                            </button>
                          </td>

                          <td className="p-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={getCandidateCvUrl(cand)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800"
                                title={`Soi link hồ sơ CV: ${getCandidateCvUrl(cand)}`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Soi Link</span>
                              </a>
                              <button
                                onClick={() => handleOpenEditCandidate(cand)}
                                className="p-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 hover:bg-teal-100 rounded-lg transition"
                                title="Chỉnh sửa hồ sơ CV"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedCandidate(cand)}
                                className="p-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 rounded-lg transition"
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

                        {/* Detailed Expanded Sub-row for Candidate */}
                        {isExpanded && (
                          <tr className="bg-emerald-50/40 dark:bg-slate-800/70 border-b-2 border-emerald-500/30">
                            <td colSpan={7} className="p-4.5">
                              <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-inner">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                  <div className="font-black text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                    <span>HỒ SƠ CV CƯ DÂN CHI TIẾT & THAO TÁC QUẢN TRỊ</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleOpenAddCandidate()}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ Thêm CV Mới</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenEditCandidate(cand)}
                                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Chỉnh Sửa CV Này</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCandidate(cand.id, cand.fullName)}
                                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Xóa Hồ Sơ</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  <div className="space-y-1.5">
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block">Thông tin cá nhân:</span>
                                    <div className="font-black text-slate-800 dark:text-slate-200 text-sm">{cand.fullName}</div>
                                    <div className="text-slate-600 dark:text-slate-400">Sinh năm: {cand.birthYear || 'N/A'} • Giới tính: {cand.gender === 'male' ? 'Nam' : 'Nữ'}</div>
                                    <div className="text-slate-600 dark:text-slate-400">📍 Nơi ở: {cand.currentAddress || cand.projectName}</div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block">Chuyên môn & Kỳ vọng:</span>
                                    <div className="font-extrabold text-teal-700 dark:text-teal-400 text-sm">{cand.targetJobTitle}</div>
                                    <div className="text-slate-600 dark:text-slate-400">🏢 Ngành: {cand.primaryIndustry}</div>
                                    <div className="font-black text-emerald-600 dark:text-emerald-400">💰 Kỳ vọng: {cand.expectedSalary}</div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block">Liên hệ trực tiếp (Admin):</span>
                                    <div className="font-mono font-bold text-emerald-600 text-sm">
                                      📞 <a href={`tel:${cand.phone}`} className="hover:underline">{cand.phone}</a>
                                    </div>
                                    <div className="font-mono text-slate-600 dark:text-slate-300">Zalo: {cand.zalo || cand.phone}</div>
                                    <div className="font-mono text-slate-500">✉️ {cand.email || 'Chưa cập nhật email'}</div>
                                  </div>
                                </div>

                                {cand.introduction && (
                                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Giới thiệu bản thân:</span>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                      {cand.introduction}
                                    </p>
                                  </div>
                                )}

                                {cand.skills && cand.skills.length > 0 && (
                                  <div>
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block mb-1.5">Kỹ năng thế mạnh:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {cand.skills.map((skill, idx) => (
                                        <span key={idx} className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold rounded-lg border border-teal-200/50 text-[11px]">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: DANH BẠ HỒ SƠ NHÀ TUYỂN DỤNG & DOANH NGHIỆP */}
      {/* ========================================================================= */}
      {activeSection === 'employers' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Hồ Sơ Doanh Nghiệp & Nhà Tuyển Dụng ({employers.length} đơn vị)</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Các doanh nghiệp, shophouse, chuỗi nhà hàng tuyển dụng có link profile chuyên nghiệp riêng.
              </p>
            </div>

            <button
              onClick={handleOpenAddEmployer}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Nhà Tuyển Dụng Mới</span>
            </button>
          </div>

          {/* Mobile Compact & Expandable Employers List */}
          <div className="block md:hidden p-3 space-y-2.5">
            {employers.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có hồ sơ nhà tuyển dụng nào.
              </div>
            ) : (
              employers.map(emp => {
                const isExpanded = expandedEmployerId === emp.id;
                const empJobsCount = jobs.filter(
                  j => (emp.userId && j.employerUserId === emp.userId) || 
                       j.companyName.toLowerCase() === emp.companyName.toLowerCase()
                ).length;

                return (
                  <div
                    key={emp.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40 transition hover:border-teal-500/40 cursor-pointer"
                    onClick={() => setExpandedEmployerId(isExpanded ? null : emp.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={emp.logoUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&auto=format&fit=crop&q=80'}
                          alt={emp.companyName}
                          className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 dark:text-white text-xs truncate">
                            {emp.companyName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {emp.industry}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                          emp.verified
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-300'
                        }`}>
                          {emp.verified ? '🟢 Đã xác thực' : '⚪ Chưa duyệt'}
                        </span>
                        <span className={`text-[10px] transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Quick summary row */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="font-semibold text-teal-700 dark:text-teal-400 truncate max-w-[160px]">
                        📍 {emp.projectName || emp.project}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        📋 {empJobsCount} tin tuyển
                      </span>
                    </div>

                    {/* Expanded Employer details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Người Phụ Trách:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {emp.contactName}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Hotline / Zalo:</span>
                            <a
                              href={`tel:${emp.contactPhone}`}
                              onClick={e => e.stopPropagation()}
                              className="font-mono text-emerald-600 font-bold hover:underline"
                            >
                              📞 {emp.contactPhone}
                            </a>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block text-[10px]">Địa Chỉ:</span>
                            <span className="text-slate-800 dark:text-slate-200">
                              {emp.address}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleEmployerVerified(emp)}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold"
                          >
                            {emp.verified ? 'Bỏ xác thực' : 'Xác thực KYC'}
                          </button>

                          <div className="flex items-center gap-1">
                            <a
                              href={getEmployerProfileUrl(emp)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-0.5"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Soi Link</span>
                            </a>
                            <button
                              onClick={() => handleOpenEditEmployer(emp)}
                              className="p-1 bg-teal-50 text-teal-600 rounded-lg"
                              title="Sửa"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployer(emp.id, emp.companyName)}
                              className="p-1 bg-rose-50 text-rose-600 rounded-lg"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[880px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 w-10 text-center">#</th>
                  <th className="p-3.5 whitespace-nowrap">Doanh Nghiệp / Logo</th>
                  <th className="p-3.5 whitespace-nowrap">Ngành Nghề & Dự Án</th>
                  <th className="p-3.5 whitespace-nowrap">Liên Hệ / Hotline</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Xác Thực KYC</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Tin Tuyển Dụng</th>
                  <th className="p-3.5 text-right whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Chưa có hồ sơ nhà tuyển dụng nào.
                    </td>
                  </tr>
                ) : (
                  employers.map(emp => {
                    const isExpanded = expandedEmployerId === emp.id;
                    const empJobsCount = jobs.filter(
                      j => (emp.userId && j.employerUserId === emp.userId) || 
                           j.companyName.toLowerCase() === emp.companyName.toLowerCase()
                    ).length;

                    return (
                      <React.Fragment key={emp.id}>
                        <tr 
                          onClick={() => setExpandedEmployerId(isExpanded ? null : emp.id)}
                          className={`hover:bg-teal-50/40 dark:hover:bg-slate-800/60 transition cursor-pointer select-none ${
                            isExpanded ? 'bg-teal-50/60 dark:bg-slate-800/80 font-medium' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center text-slate-400 font-bold text-[11px]">
                            <span className={`inline-block transition-transform duration-200 text-teal-600 ${isExpanded ? 'rotate-90' : ''}`}>
                              ▶
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={emp.logoUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&auto=format&fit=crop&q=80'}
                                alt={emp.companyName}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0"
                              />
                              <div>
                                <div className="font-black text-slate-900 dark:text-white text-sm whitespace-nowrap">
                                  {emp.companyName}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                  <span className="truncate max-w-[200px]">{emp.address}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-extrabold text-teal-700 dark:text-teal-400 whitespace-nowrap">
                              {emp.industry}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                              {emp.projectName || emp.project}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5 whitespace-nowrap">
                              <Phone className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{emp.contactPhone}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                              Phụ trách: {emp.contactName}
                            </div>
                          </td>

                          <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleEmployerVerified(emp)}
                              className={`px-3 py-1 rounded-full text-[10px] font-black border transition cursor-pointer whitespace-nowrap ${
                                emp.verified
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300'
                              }`}
                            >
                              {emp.verified ? '🟢 Đã Xác Thực' : '⚪ Chưa Xác Thực'}
                            </button>
                          </td>

                          <td className="p-3.5 text-center">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black rounded-lg text-xs whitespace-nowrap">
                              {empJobsCount} tin tuyển
                            </span>
                          </td>

                          <td className="p-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={getEmployerProfileUrl(emp)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800"
                                title={`Soi link hồ sơ DN: ${getEmployerProfileUrl(emp)}`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Soi Link</span>
                              </a>
                              <button
                                onClick={() => handleOpenEditEmployer(emp)}
                                className="p-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 hover:bg-teal-100 rounded-lg transition"
                                title="Chỉnh sửa hồ sơ"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployer(emp.id, emp.companyName)}
                                className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-lg transition"
                                title="Xóa hồ sơ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Employer Sub-row */}
                        {isExpanded && (
                          <tr className="bg-teal-50/40 dark:bg-slate-800/70 border-b-2 border-teal-500/30">
                            <td colSpan={7} className="p-4.5">
                              <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-teal-200 dark:border-teal-900/50 shadow-inner">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                  <div className="font-black text-teal-800 dark:text-teal-300 text-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-teal-500" />
                                    <span>HỒ SƠ DOANH NGHIỆP CHI TIẾT & BỘ CÔNG CỤ QUẢN LÝ</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleOpenAddEmployer()}
                                      className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ Thêm Nhà Tuyển Dụng</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenEditEmployer(emp)}
                                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Chỉnh Sửa Đơn Vị Này</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEmployer(emp.id, emp.companyName)}
                                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Xóa Đơn Vị</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  <div className="space-y-1.5">
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block">Tổ chức & Thương hiệu:</span>
                                    <div className="font-black text-slate-800 dark:text-slate-200 text-sm">{emp.companyName}</div>
                                    <div className="text-teal-700 dark:text-teal-400 font-bold">Thương hiệu: {emp.brandName || emp.companyName}</div>
                                    <div className="text-slate-600 dark:text-slate-400">Quy mô: {emp.scaleSize || 'Chưa cập nhật'}</div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block">Địa điểm & Ngành:</span>
                                    <div className="font-bold text-slate-800 dark:text-slate-200">📍 {emp.address}</div>
                                    <div className="text-slate-600 dark:text-slate-400">Khu đô thị: {emp.projectName || emp.project}</div>
                                    <div className="text-slate-600 dark:text-slate-400">Ngành nghề: {emp.industry}</div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block">Người đại diện liên hệ:</span>
                                    <div className="font-bold text-slate-800 dark:text-slate-200">👤 {emp.contactName}</div>
                                    <div className="font-mono text-emerald-600 font-bold">
                                      📞 <a href={`tel:${emp.contactPhone}`} className="hover:underline">{emp.contactPhone}</a>
                                    </div>
                                    <div className="font-mono text-slate-500">✉️ {emp.contactEmail || 'Chưa cập nhật email'}</div>
                                  </div>
                                </div>

                                {emp.introduction && (
                                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Giới thiệu về doanh nghiệp & môi trường:</span>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                      {emp.introduction}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
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
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-4 rounded-2xl border border-sky-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-sky-500 text-slate-950 text-[10px] font-black rounded uppercase">
                  TELEGRAM ALERT 24/7
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Đang trực tuyến & nhận thông báo
                </span>
              </div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                HỒ SƠ CƯ DÂN NỘP ỨNG TUYỂN & DUYỆT TRẠNG THÁI NHANH
              </h3>
              <p className="text-[11px] text-slate-300">
                Khi cư dân nộp đơn từ Website hoặc App di động, hệ thống tự động bắn thông báo tức thì về Telegram Admin. Quản trị viên có thể duyệt nhanh sang 4 trạng thái: 🟢 Nhận Việc, 📅 Phỏng Vấn, 📞 Đã Liên Hệ, 🔴 Từ Chối.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Tổng hồ sơ</div>
              <div className="text-xl font-black text-sky-300 font-mono">
                {applications.length} đơn
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Danh sách ứng viên nộp hồ sơ ({applications.length} lượt nộp)</span>
              </span>
            </div>

            {/* Mobile View: Compact, Touch-friendly & Click-to-Expand */}
            <div className="block md:hidden p-3 space-y-2.5">
              {applications.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có lượt ứng tuyển nào.
                </div>
              ) : (
                applications.map(app => {
                  const isExpanded = expandedApplicationId === app.id;
                  const statusColors = {
                    applied: 'bg-amber-100 text-amber-800 border-amber-300',
                    reviewing: 'bg-sky-100 text-sky-800 border-sky-300',
                    interview_scheduled: 'bg-purple-100 text-purple-800 border-purple-300',
                    accepted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    rejected: 'bg-rose-100 text-rose-800 border-rose-300'
                  };
                  const statusLabels = {
                    applied: '🟡 Đã Nộp',
                    reviewing: '📞 Đã Liên Hệ',
                    interview_scheduled: '📅 Hẹn Phỏng Vấn',
                    accepted: '🟢 Đã Nhận Việc',
                    rejected: '🔴 Từ Chối'
                  };

                  return (
                    <div
                      key={app.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40 transition hover:border-sky-500/40 cursor-pointer"
                      onClick={() => setExpandedApplicationId(isExpanded ? null : app.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 dark:text-white text-xs truncate">
                            {app.candidateName}
                          </div>
                          <div className="text-[11px] text-sky-600 dark:text-sky-400 font-bold truncate">
                            {app.jobTitle}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${statusColors[app.status as keyof typeof statusColors] || 'bg-slate-100 text-slate-600'}`}>
                            {statusLabels[app.status as keyof typeof statusLabels] || app.status}
                          </span>
                          <span className={`text-[10px] transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </div>

                      {/* Quick summary row */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                        <span className="truncate max-w-[170px]">
                          🏢 {app.companyName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {app.createdAt ? app.createdAt.slice(0, 10) : ''}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Hotline Ứng Viên:</span>
                              <a
                                href={`tel:${app.candidatePhone}`}
                                onClick={e => e.stopPropagation()}
                                className="font-mono text-emerald-600 font-bold hover:underline"
                              >
                                📞 {app.candidatePhone}
                              </a>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Email:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                                {app.candidateEmail || 'Chưa cập nhật'}
                              </span>
                            </div>
                            {app.expectedSalary && (
                              <div className="col-span-2">
                                <span className="text-slate-400 block text-[10px]">Lương mong muốn:</span>
                                <span className="font-bold text-emerald-600">
                                  💰 {app.expectedSalary}
                                </span>
                              </div>
                            )}
                          </div>

                          {app.message && (
                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lời nhắn ứng tuyển:</span>
                              <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">
                                "{app.message}"
                              </p>
                            </div>
                          )}

                          {/* Quick Actions & Status Changer */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black"
                              >
                                ✓ Nhận Việc
                              </button>
                              <button
                                onClick={() => handleUpdateApplicationStatus(app.id, 'interview_scheduled')}
                                className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-black"
                              >
                                📅 Hẹn PV
                              </button>
                              <button
                                onClick={() => handleUpdateApplicationStatus(app.id, 'reviewing')}
                                className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-lg text-[10px] font-black"
                              >
                                📞 Đã Liên Hệ
                              </button>
                              <button
                                onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                                className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black"
                              >
                                ✕ Từ Chối
                              </button>
                              <button
                                onClick={() => handleDeleteApplication(app.id)}
                                className="p-1 bg-rose-50 text-rose-600 rounded-lg ml-auto"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[880px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 w-10 text-center">#</th>
                    <th className="p-3.5 whitespace-nowrap">Ứng Viên Nộp Hồ Sơ</th>
                    <th className="p-3.5 whitespace-nowrap">Vị Trí / Tin Tuyển Dụng</th>
                    <th className="p-3.5 whitespace-nowrap">Lời Nhắn / Kinh Nghiệm</th>
                    <th className="p-3.5 whitespace-nowrap">Thời Gian Nộp</th>
                    <th className="p-3.5 text-center whitespace-nowrap">Trạng Thái & Duyệt Nhanh</th>
                    <th className="p-3.5 text-right whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        Chưa có lượt ứng tuyển nào.
                      </td>
                    </tr>
                  ) : (
                    applications.map(app => {
                      const isExpanded = expandedApplicationId === app.id;
                      return (
                        <React.Fragment key={app.id}>
                          <tr 
                            onClick={() => setExpandedApplicationId(isExpanded ? null : app.id)}
                            className={`hover:bg-sky-50/40 dark:hover:bg-slate-800/60 transition cursor-pointer select-none ${
                              isExpanded ? 'bg-sky-50/60 dark:bg-slate-800/80 font-medium' : ''
                            }`}
                          >
                            <td className="p-3.5 text-center text-slate-400 font-bold text-[11px]">
                              <span className={`inline-block transition-transform duration-200 text-sky-600 ${isExpanded ? 'rotate-90' : ''}`}>
                                ▶
                              </span>
                            </td>

                            <td className="p-3.5">
                              <div className="font-black text-slate-900 dark:text-white text-sm whitespace-nowrap">
                                {app.candidateName}
                              </div>
                              <div className="font-mono text-teal-600 dark:text-teal-400 font-bold mt-0.5 whitespace-nowrap">
                                📞 {app.candidatePhone} • {app.candidateEmail || 'Chưa có email'}
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="font-extrabold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                {app.jobTitle}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                                Đơn vị: {app.companyName}
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="text-slate-600 dark:text-slate-300 italic max-w-xs line-clamp-2">
                                "{app.message || 'Xin chào, tôi rất quan tâm đến công việc này và mong muốn ứng tuyển!'}"
                              </div>
                              {app.expectedSalary && (
                                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                  Lương: {app.expectedSalary}
                                </div>
                              )}
                            </td>

                            <td className="p-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                              {app.createdAt}
                            </td>

                            <td className="p-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <div className="space-y-1.5">
                                <select
                                  value={app.status}
                                  onChange={e => handleUpdateApplicationStatus(app.id, e.target.value)}
                                  className={`w-full px-2.5 py-1 rounded-xl text-[10px] font-black border cursor-pointer ${
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
                                  <option value="applied">🟡 Đã Nộp (Mới)</option>
                                  <option value="reviewing">📞 Đã Liên Hệ</option>
                                  <option value="interview_scheduled">📅 Đã Hẹn Phỏng Vấn</option>
                                  <option value="accepted">🟢 Nhận Việc (Thành Công)</option>
                                  <option value="rejected">🔴 Từ Chối</option>
                                </select>

                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                                      app.status === 'accepted' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                    title="Nhận việc"
                                  >
                                    ✓ Nhận
                                  </button>
                                  <button
                                    onClick={() => handleUpdateApplicationStatus(app.id, 'interview_scheduled')}
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                                      app.status === 'interview_scheduled' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                    }`}
                                    title="Hẹn phỏng vấn"
                                  >
                                    📅 PV
                                  </button>
                                  <button
                                    onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                                      app.status === 'rejected' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    }`}
                                    title="Từ chối"
                                  >
                                    ✕ Loại
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleDeleteApplication(app.id)}
                                className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-lg transition"
                                title="Xóa lượt nộp"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Sub-row for Applications */}
                          {isExpanded && (
                            <tr className="bg-sky-50/40 dark:bg-slate-800/70 border-b-2 border-sky-500/30">
                              <td colSpan={7} className="p-4.5">
                                <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-sky-200 dark:border-sky-900/50 shadow-inner">
                                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <div className="font-black text-sky-800 dark:text-sky-300 text-sm flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 text-sky-500" />
                                      <span>CHI TIẾT ĐƠN ỨNG TUYỂN & DUYỆT HỒ SƠ</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={`tel:${app.candidatePhone}`}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>Gọi Ứng Viên: {app.candidatePhone}</span>
                                      </a>
                                      <button
                                        onClick={() => handleDeleteApplication(app.id)}
                                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Xóa Hồ Sơ Này</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div className="space-y-1">
                                      <span className="font-bold text-slate-400 text-[10px] uppercase block">Ứng viên:</span>
                                      <div className="font-black text-slate-800 dark:text-slate-200 text-sm">{app.candidateName}</div>
                                      <div className="font-mono text-emerald-600 font-bold">📞 {app.candidatePhone}</div>
                                      <div className="font-mono text-slate-500">✉️ {app.candidateEmail || 'Chưa cập nhật'}</div>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="font-bold text-slate-400 text-[10px] uppercase block">Công việc ứng tuyển:</span>
                                      <div className="font-black text-sky-700 dark:text-sky-400 text-sm">{app.jobTitle}</div>
                                      <div className="text-slate-600 dark:text-slate-400">Doanh nghiệp: {app.companyName}</div>
                                      {app.expectedSalary && (
                                        <div className="font-bold text-emerald-600">Lương kỳ vọng: {app.expectedSalary}</div>
                                      )}
                                    </div>

                                    <div className="space-y-1">
                                      <span className="font-bold text-slate-400 text-[10px] uppercase block">Trạng thái xử lý:</span>
                                      <div className="font-bold text-slate-800 dark:text-slate-200">
                                        Thời gian gửi: {app.createdAt}
                                      </div>
                                      <div className="text-slate-500">
                                        ID đơn ứng tuyển: <span className="font-mono">{app.id}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {app.message && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Thư ngỏ / Lời nhắn từ ứng viên:</span>
                                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        "{app.message}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: NHẬT KÝ MỞ KHÓA CV & THU PHÍ (UNLOCK LOGS) */}
      {/* ========================================================================= */}
      {activeSection === 'unlocks' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-3">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Unlock className="w-4 h-4 text-amber-500" />
              <span>Giao dịch mở khóa CV ứng viên ({unlocks.length} lượt mở - Tổng thu: {totalUnlockRevenue.toLocaleString('vi-VN')} đ)</span>
            </span>
          </div>

          {/* Mobile View: Compact & Expandable */}
          <div className="block md:hidden p-3 space-y-2.5">
            {unlocks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có giao dịch mở khóa CV nào được ghi nhận.
              </div>
            ) : (
              unlocks.map(log => {
                const isExpanded = expandedUnlockId === log.id;
                return (
                  <div
                    key={log.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40 transition hover:border-amber-500/40 cursor-pointer"
                    onClick={() => setExpandedUnlockId(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 dark:text-white text-xs truncate">
                          {log.recruiterName}
                        </div>
                        <div className="text-[11px] text-teal-600 dark:text-teal-400 font-bold truncate">
                          Mở khóa CV: {log.candidateName}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-full text-[9px] border border-emerald-300">
                          ✓ Thành công
                        </span>
                        <span className={`text-[10px] transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="font-black text-amber-600 dark:text-amber-400">
                        🪙 {log.amountVnd.toLocaleString('vi-VN')} Token
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {log.createdAt ? log.createdAt.slice(0, 10) : ''}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Mã Giao Dịch:</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">{log.id}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Phương thức:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px]">
                              {log.paymentMethod === 'vietqr' ? 'Ví Token VietQR' : 'Ví Token Cư Dân'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Hotline Nhà Tuyển Dụng:</span>
                            <span className="font-mono font-bold text-emerald-600">{log.recruiterPhone || 'Tài khoản cư dân'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Mã Ứng Viên:</span>
                            <span className="font-mono text-slate-600">{log.candidateId}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[880px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 w-10 text-center">#</th>
                  <th className="p-3.5 whitespace-nowrap">Mã Giao Dịch</th>
                  <th className="p-3.5 whitespace-nowrap">Nhà Tuyển Dụng Mua CV</th>
                  <th className="p-3.5 whitespace-nowrap">Ứng Viên Được Mở Khóa</th>
                  <th className="p-3.5 whitespace-nowrap">Số Tiền & Phương Thức</th>
                  <th className="p-3.5 whitespace-nowrap">Thời Gian</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {unlocks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Chưa có giao dịch mở khóa CV nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  unlocks.map(log => {
                    const isExpanded = expandedUnlockId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr 
                          onClick={() => setExpandedUnlockId(isExpanded ? null : log.id)}
                          className={`hover:bg-amber-50/40 dark:hover:bg-slate-800/60 transition cursor-pointer select-none ${
                            isExpanded ? 'bg-amber-50/60 dark:bg-slate-800/80 font-medium' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center text-slate-400 font-bold text-[11px]">
                            <span className={`inline-block transition-transform duration-200 text-amber-600 ${isExpanded ? 'rotate-90' : ''}`}>
                              ▶
                            </span>
                          </td>

                          <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {log.id}
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              {log.recruiterName}
                            </div>
                            <div className="font-mono text-[11px] text-teal-600 whitespace-nowrap">
                              {log.recruiterPhone || 'Tài khoản cư dân'}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                              {log.candidateName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                              ID: {log.candidateId}
                            </div>
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <span>🪙 {log.amountVnd.toLocaleString('vi-VN')}</span>
                              <span className="text-[10px] text-slate-400 font-bold">Token</span>
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                              {log.paymentMethod === 'vietqr' ? 'Ví Token VietQR' : 'Ví Token Cư Dân'}
                            </div>
                          </td>

                          <td className="p-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {log.createdAt}
                          </td>

                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-black rounded-full border border-emerald-300 text-[10px]">
                              ✓ Thành Công
                            </span>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-amber-50/40 dark:bg-slate-800/70 border-b-2 border-amber-500/30">
                            <td colSpan={7} className="p-4.5">
                              <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-inner">
                                <div className="font-black text-amber-800 dark:text-amber-300 text-sm flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-amber-500" />
                                  <span>CHI TIẾT LỊCH SỬ GIAO DỊCH MỞ KHÓA CV</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  <div>
                                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Nhà tuyển dụng:</span>
                                    <div className="font-bold text-slate-800 dark:text-slate-200">{log.recruiterName}</div>
                                    <div className="font-mono text-teal-600 font-bold">📞 {log.recruiterPhone || 'Tài khoản cư dân'}</div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Ứng viên đã mở:</span>
                                    <div className="font-black text-slate-800 dark:text-slate-200">{log.candidateName}</div>
                                    <div className="font-mono text-slate-500">Mã hồ sơ: {log.candidateId}</div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Giao dịch ví:</span>
                                    <div className="font-black text-amber-600">🪙 {log.amountVnd.toLocaleString('vi-VN')} Token</div>
                                    <div className="text-slate-400 font-mono text-[11px]">Thời gian: {log.createdAt}</div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: DUYỆT ĐĂNG KÝ GÓI NHÀ TUYỂN DỤNG & BƠM TOKEN VÀO VÍ */}
      {/* ========================================================================= */}
      {activeSection === 'registrations' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-teal-950 p-5 rounded-2xl border border-amber-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded uppercase">
                HỆ THỐNG GIAO DỊCH B2B
              </span>
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                DUYỆT ĐĂNG KÝ GÓI DOANH NGHIỆP & BƠM TOKEN VÍ TỰ ĐỘNG
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                Kiểm tra thông tin nhà tuyển dụng, xác nhận chuyển khoản ngân hàng và bấm "Duyệt & Bơm Token" để hệ thống tự động cộng Token vào ví người dùng ngay lập tức.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-slate-400 font-bold uppercase">Yêu cầu chờ duyệt</div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {registrations.filter(r => r.status === 'pending').length} đơn
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-3">
            {/* Mobile View: Compact & Expandable */}
            <div className="block md:hidden p-3 space-y-2.5">
              {registrations.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có yêu cầu đăng ký gói tuyển dụng nào.
                </div>
              ) : (
                registrations.map(reg => {
                  const isExpanded = expandedRegistrationId === reg.id;
                  return (
                    <div
                      key={reg.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40 transition hover:border-amber-500/40 cursor-pointer"
                      onClick={() => setExpandedRegistrationId(isExpanded ? null : reg.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 dark:text-white text-xs truncate">
                            {reg.companyName}
                          </div>
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold truncate">
                            {reg.selectedPackageName}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {reg.status === 'approved' ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-full text-[9px]">
                              ✓ Đã Duyệt
                            </span>
                          ) : reg.status === 'rejected' ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-black rounded-full text-[9px]">
                              ✕ Từ Chối
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-black rounded-full text-[9px] animate-pulse">
                              ⏳ Chờ Duyệt
                            </span>
                          )}
                          <span className={`text-[10px] transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          🪙 {(reg.tokenCost || 0).toLocaleString('vi-VN')} Token
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {reg.createdAt ? reg.createdAt.slice(0, 10) : ''}
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Người Liên Hệ:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{reg.contactName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Hotline / Zalo:</span>
                              <a href={`tel:${reg.contactPhone}`} onClick={e => e.stopPropagation()} className="font-mono text-emerald-600 font-bold hover:underline">
                                📞 {reg.contactPhone}
                              </a>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Khu Đô Thị:</span>
                              <span className="text-slate-800 dark:text-slate-200">{reg.project}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Mã Số Thuế:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">{reg.taxCode || 'N/A'}</span>
                            </div>
                          </div>

                          {reg.status === 'pending' && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleApproveRegistration(reg)}
                                className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-1"
                              >
                                <Coins className="w-3.5 h-3.5" />
                                <span>Duyệt & Bơm Token</span>
                              </button>
                              <button
                                onClick={() => handleRejectRegistration(reg.id)}
                                className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold"
                              >
                                Từ Chối
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[880px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                    <th className="p-3.5 w-10 text-center">#</th>
                    <th className="p-3.5 whitespace-nowrap">Doanh Nghiệp / Chủ Shop</th>
                    <th className="p-3.5 whitespace-nowrap">Gói Đăng Ký</th>
                    <th className="p-3.5 whitespace-nowrap">Giá Trị Token</th>
                    <th className="p-3.5 whitespace-nowrap">Khu Đô Thị</th>
                    <th className="p-3.5 whitespace-nowrap">Liên Hệ / Mã Số Thuế</th>
                    <th className="p-3.5 whitespace-nowrap">Thời Gian</th>
                    <th className="p-3.5 text-center whitespace-nowrap">Trạng Thái</th>
                    <th className="p-3.5 text-center whitespace-nowrap">Hành Động Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        Chưa có yêu cầu đăng ký gói tuyển dụng nào.
                      </td>
                    </tr>
                  ) : (
                    registrations.map(reg => {
                      const isExpanded = expandedRegistrationId === reg.id;
                      return (
                        <React.Fragment key={reg.id}>
                          <tr 
                            onClick={() => setExpandedRegistrationId(isExpanded ? null : reg.id)}
                            className={`hover:bg-amber-50/40 dark:hover:bg-slate-800/60 transition cursor-pointer select-none ${
                              isExpanded ? 'bg-amber-50/60 dark:bg-slate-800/80 font-medium' : ''
                            }`}
                          >
                            <td className="p-3.5 text-center text-slate-400 font-bold text-[11px]">
                              <span className={`inline-block transition-transform duration-200 text-amber-600 ${isExpanded ? 'rotate-90' : ''}`}>
                                ▶
                              </span>
                            </td>

                            <td className="p-3.5">
                              <div className="font-black text-slate-900 dark:text-white text-xs whitespace-nowrap">
                                {reg.companyName}
                              </div>
                              {reg.brandName && (
                                <div className="text-[11px] text-teal-600 font-bold whitespace-nowrap">
                                  Thương hiệu: {reg.brandName}
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 whitespace-nowrap">
                                Ngành nghề: {reg.industry}
                              </div>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black rounded-lg border border-amber-300 text-[11px]">
                                {reg.selectedPackageName}
                              </span>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <div className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-sm">
                                <span>🪙 {(reg.tokenCost || 0).toLocaleString('vi-VN')}</span>
                                <span className="text-[10px] text-slate-400 font-bold">Token</span>
                              </div>
                            </td>

                            <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                              {reg.project}
                            </td>

                            <td className="p-3.5">
                              <div className="font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                📞 {reg.contactPhone}
                              </div>
                              <div className="text-[11px] text-slate-500 whitespace-nowrap">
                                {reg.contactName}
                              </div>
                              {reg.taxCode && (
                                <div className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                                  MST: {reg.taxCode}
                                </div>
                              )}
                            </td>

                            <td className="p-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                              {reg.createdAt}
                            </td>

                            <td className="p-3.5 text-center whitespace-nowrap">
                              {reg.status === 'approved' ? (
                                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-black rounded-full border border-emerald-300 text-[10px]">
                                  ✓ Đã Duyệt & Bơm Ví
                                </span>
                              ) : reg.status === 'rejected' ? (
                                <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-black rounded-full border border-rose-300 text-[10px]">
                                  ✕ Từ Chối
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-black rounded-full border border-amber-300 text-[10px] animate-pulse">
                                  ⏳ Chờ Admin Duyệt
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              {reg.status === 'pending' ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleApproveRegistration(reg)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
                                    title="Duyệt và Bơm Token trực tiếp"
                                  >
                                    <Coins className="w-3.5 h-3.5" />
                                    <span>Duyệt & Bơm Token</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectRegistration(reg.id)}
                                    className="p-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                                    title="Từ chối"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-mono">Hoàn tất</span>
                              )}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-amber-50/40 dark:bg-slate-800/70 border-b-2 border-amber-500/30">
                              <td colSpan={9} className="p-4.5">
                                <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-inner">
                                  <div className="font-black text-amber-800 dark:text-amber-300 text-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    <span>CHI TIẾT ĐĂNG KÝ GÓI & THAO TÁC DUYỆT B2B</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div>
                                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Doanh nghiệp:</span>
                                      <div className="font-black text-slate-800 dark:text-slate-200">{reg.companyName}</div>
                                      <div className="text-teal-600 font-bold">Thương hiệu: {reg.brandName || reg.companyName}</div>
                                      <div className="text-slate-500">Ngành: {reg.industry}</div>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Gói tuyển dụng:</span>
                                      <div className="font-black text-amber-600">{reg.selectedPackageName}</div>
                                      <div className="font-bold text-emerald-600">🪙 {(reg.tokenCost || 0).toLocaleString('vi-VN')} Token</div>
                                      <div className="text-slate-500">Dự án: {reg.project}</div>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Liên hệ & Mã số thuế:</span>
                                      <div className="font-bold text-slate-800 dark:text-slate-200">👤 {reg.contactName}</div>
                                      <div className="font-mono font-bold text-emerald-600">📞 {reg.contactPhone}</div>
                                      <div className="font-mono text-slate-400">MST: {reg.taxCode || 'Chưa cung cấp'}</div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: PHÂN CÔNG & GIAO VIỆC QUẢN TRỊ TOÀN DIỆN */}
      {/* ========================================================================= */}
      {activeSection === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-5 rounded-2xl border border-sky-500/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-sky-500 text-slate-950 text-[10px] font-black rounded uppercase">
                ĐIỀU HÀNH HỆ THỐNG ĐA NHÁNH
              </span>
              <h3 className="text-base font-black text-sky-300 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-sky-400" />
                PHÂN CÔNG GIAO VIỆC & QUẢN TRỊ CÁC NHÁNH QUẢN LÝ
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                Giao việc kiểm duyệt tin tuyển dụng, xác thực KYC, thẩm định bất động sản, hỗ trợ cư dân cho các chi nhánh quản lý hoặc admin chuyên trách.
              </p>
            </div>
            
            <button
              onClick={() => {
                setEditingTask(null);
                setTaskFormData({
                  title: '',
                  category: 'recruitment',
                  targetTitle: '',
                  targetProject: 'ocean-park-2',
                  assignedToAdminId: 'admin_tuyendung_01',
                  assignedToAdminName: 'Admin Trưởng Ban Tuyển Dụng',
                  assignedByAdminId: 'admin_root',
                  assignedByAdminName: 'Quản Trị Viên Tổng',
                  priority: 'high',
                  status: 'pending',
                  deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
                  notes: ''
                });
                setShowTaskModal(true);
              }}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition transform active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Tạo & Giao Nhiệm Vụ Mới</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-3">
            {/* Mobile View: Compact & Expandable */}
            <div className="block md:hidden p-3 space-y-2.5">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có nhiệm vụ giao việc nào. Nhấn "+ Tạo & Giao Nhiệm Vụ Mới" để bắt đầu.
                </div>
              ) : (
                tasks.map(task => {
                  const isExpanded = expandedTaskId === task.id;
                  return (
                    <div
                      key={task.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40 transition hover:border-sky-500/40 cursor-pointer"
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-black text-slate-900 dark:text-white text-xs">
                            {task.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[9px] rounded">
                              {task.category === 'recruitment' ? '💼 Tuyển Dụng' : task.category === 'bds_realestate' ? '🏠 Bất Động Sản' : task.category === 'kyc_user' ? '🛡️ Duyệt KYC' : '📦 Dịch Vụ'}
                            </span>
                            {task.priority === 'urgent' ? (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-black rounded text-[9px]">
                                🔥 KHẨN
                              </span>
                            ) : task.priority === 'high' ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-black rounded text-[9px]">
                                ⚡ Cao
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[10px] transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                        <span className="text-sky-600 dark:text-sky-400 font-bold truncate">
                          👤 {task.assignedToAdminName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          Hạn: {task.deadline || 'Không'}
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Đối tượng phụ trách:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{task.targetTitle || 'Toàn phân khu'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Khu vực / Dự án:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">{task.targetProject}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Giao bởi:</span>
                              <span className="text-slate-600 dark:text-slate-400">{task.assignedByAdminName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Trạng thái hiện tại:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {task.status === 'completed' ? '✓ Hoàn thành' : task.status === 'in_progress' ? '⚙️ Đang thực hiện' : '⏳ Chờ xử lý'}
                              </span>
                            </div>
                          </div>

                          {task.notes && (
                            <div className="p-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 italic">
                              📝 {task.notes}
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                            <select
                              value={task.status}
                              onChange={e => handleUpdateTaskStatus(task, e.target.value)}
                              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-[10px] font-bold"
                            >
                              <option value="pending">⏳ Chờ Xử Lý</option>
                              <option value="in_progress">⚙️ Đang Làm</option>
                              <option value="completed">✓ Hoàn Thành</option>
                              <option value="cancelled">✕ Hủy Bỏ</option>
                            </select>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingTask(task);
                                  setTaskFormData(task);
                                  setShowTaskModal(true);
                                }}
                                className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950/50 text-sky-600 rounded-lg text-[10px] font-bold"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-lg text-[10px] font-bold"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[880px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                    <th className="p-3.5 w-10 text-center">#</th>
                    <th className="p-3.5 whitespace-nowrap">Nhiệm Vụ & Phân Loại</th>
                    <th className="p-3.5 whitespace-nowrap">Đối Tượng Phụ Trách</th>
                    <th className="p-3.5 whitespace-nowrap">Người Được Gán</th>
                    <th className="p-3.5 whitespace-nowrap">Mức Độ Ưu Tiên</th>
                    <th className="p-3.5 whitespace-nowrap">Hạn Chót</th>
                    <th className="p-3.5 text-center whitespace-nowrap">Trạng Thái</th>
                    <th className="p-3.5 text-center whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        Chưa có nhiệm vụ giao việc nào. Nhấn "+ Tạo & Giao Nhiệm Vụ Mới" để bắt đầu.
                      </td>
                    </tr>
                  ) : (
                    tasks.map(task => {
                      const isExpanded = expandedTaskId === task.id;
                      return (
                        <React.Fragment key={task.id}>
                          <tr 
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            className={`hover:bg-sky-50/40 dark:hover:bg-slate-800/60 transition cursor-pointer select-none ${
                              isExpanded ? 'bg-sky-50/60 dark:bg-slate-800/80 font-medium' : ''
                            }`}
                          >
                            <td className="p-3.5 text-center text-slate-400 font-bold text-[11px]">
                              <span className={`inline-block transition-transform duration-200 text-sky-600 ${isExpanded ? 'rotate-90' : ''}`}>
                                ▶
                              </span>
                            </td>

                            <td className="p-3.5">
                              <div className="font-black text-slate-900 dark:text-white text-xs whitespace-nowrap">
                                {task.title}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 whitespace-nowrap">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded">
                                  {task.category === 'recruitment' ? '💼 Tuyển Dụng' : task.category === 'bds_realestate' ? '🏠 Bất Động Sản' : task.category === 'kyc_user' ? '🛡️ Duyệt KYC' : '📦 Dịch Vụ Cư Dân'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {task.targetProject}
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                              {task.targetTitle || 'Toàn phân khu'}
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <div className="font-bold text-sky-600 dark:text-sky-400">
                                {task.assignedToAdminName}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Giao bởi: {task.assignedByAdminName}
                              </div>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              {task.priority === 'urgent' ? (
                                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-black rounded text-[10px]">
                                  🔥 KHẨN CẤP
                                </span>
                              ) : task.priority === 'high' ? (
                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-black rounded text-[10px]">
                                  ⚡ Cao
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold rounded text-[10px]">
                                  Bình thường
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {task.deadline || 'Không giới hạn'}
                            </td>

                            <td className="p-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <select
                                value={task.status}
                                onChange={e => handleUpdateTaskStatus(task, e.target.value)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black border cursor-pointer ${
                                  task.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : task.status === 'in_progress'
                                    ? 'bg-sky-50 text-sky-700 border-sky-300'
                                    : 'bg-amber-50 text-amber-700 border-amber-300'
                                }`}
                              >
                                <option value="pending">⏳ Chờ Xử Lý</option>
                                <option value="in_progress">⚙️ Đang Thực Hiện</option>
                                <option value="completed">✓ Hoàn Thành</option>
                                <option value="cancelled">✕ Hủy Bỏ</option>
                              </select>
                            </td>

                            <td className="p-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingTask(task);
                                    setTaskFormData(task);
                                    setShowTaskModal(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  title="Sửa nhiệm vụ"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  title="Xóa nhiệm vụ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-sky-50/40 dark:bg-slate-800/70 border-b-2 border-sky-500/30">
                              <td colSpan={8} className="p-4.5">
                                <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-sky-200 dark:border-sky-900/50 shadow-inner">
                                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <div className="font-black text-sky-800 dark:text-sky-300 text-sm flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 text-sky-500" />
                                      <span>CHI TIẾT PHÂN CÔNG & QUẢN TRỊ NHIỆM VỤ</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setEditingTask(task);
                                          setTaskFormData(task);
                                          setShowTaskModal(true);
                                        }}
                                        className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Chỉnh Sửa</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Xóa Nhiệm Vụ</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div>
                                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Nội dung nhiệm vụ:</span>
                                      <div className="font-black text-slate-800 dark:text-slate-200 text-sm">{task.title}</div>
                                      <div className="text-sky-600 font-bold mt-1">Phân loại: {task.category === 'recruitment' ? 'Tuyển Dụng' : task.category === 'bds_realestate' ? 'Bất Động Sản' : 'Dịch Vụ Cư Dân'}</div>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Phụ trách & Phạm vi:</span>
                                      <div className="font-bold text-slate-800 dark:text-slate-200">👤 {task.assignedToAdminName}</div>
                                      <div className="text-slate-500">Khu vực: {task.targetProject} - {task.targetTitle || 'Tất cả'}</div>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Hạn chót & Tiến độ:</span>
                                      <div className="font-mono text-slate-700 dark:text-slate-300">📅 {task.deadline || 'Không giới hạn'}</div>
                                      <div className="font-bold text-emerald-600">Trạng thái: {task.status === 'completed' ? 'Đã hoàn thành' : task.status === 'in_progress' ? 'Đang thực hiện' : 'Chờ xử lý'}</div>
                                    </div>
                                  </div>

                                  {task.notes && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ghi chú chỉ đạo từ Admin:</span>
                                      <p className="text-slate-600 dark:text-slate-300 italic">{task.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TẠO / SỬA NHIỆM VỤ GIAO VIỆC ADMIN */}
      {/* ========================================================================= */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-sky-600" />
                <span>{editingTask ? 'Chỉnh Sửa Phân Công Nhiệm Vụ' : 'Giao Việc Quản Trị Tuyển Dụng & Phân Nhánh'}</span>
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tiêu Đề Nhiệm Vụ / Công Việc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kiểm duyệt 10 tin tuyển dụng F&B Ocean Park 2"
                  value={taskFormData.title || ''}
                  onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mảng / Nhánh Quản Trị
                  </label>
                  <select
                    value={taskFormData.category || 'recruitment'}
                    onChange={e => setTaskFormData({ ...taskFormData, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="recruitment">💼 Tuyển Dụng Cư Dân</option>
                    <option value="bds_realestate">🏠 Bất Động Sản</option>
                    <option value="resident_market">📦 Sàn Dịch Vụ Cư Dân</option>
                    <option value="kyc_user">🛡️ Duyệt KYC & Hồ Sơ</option>
                    <option value="technical_escrow">🔒 Kỹ Thuật & Escrow</option>
                    <option value="content_seo">📝 Biên Tập & SEO</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Khu Đô Thị / Dự Án
                  </label>
                  <select
                    value={taskFormData.targetProject || 'ocean-park-2'}
                    onChange={e => setTaskFormData({ ...taskFormData, targetProject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="ocean-park-1">Vinhomes Ocean Park 1</option>
                    <option value="ocean-park-2">Vinhomes Ocean Park 2</option>
                    <option value="ocean-park-3">Vinhomes Ocean Park 3</option>
                    <option value="smart-city">Vinhomes Smart City</option>
                    <option value="grand-park">Vinhomes Grand Park</option>
                    <option value="all">Toàn Hệ Thống</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Giao Cho Quản Trị Viên / Nhánh <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={taskFormData.assignedToAdminName || 'Admin Trưởng Ban Tuyển Dụng'}
                    onChange={e => {
                      const name = e.target.value;
                      const id = name.toLowerCase().replace(/\s+/g, '_');
                      setTaskFormData({ ...taskFormData, assignedToAdminName: name, assignedToAdminId: id });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sky-600"
                  >
                    <option value="Admin Trưởng Ban Tuyển Dụng">Admin Trưởng Ban Tuyển Dụng</option>
                    <option value="Nhánh QL Tuyển Dụng Ocean Park 2">Nhánh QL Tuyển Dụng Ocean Park 2</option>
                    <option value="Admin Thẩm Định KYC & Doanh Nghiệp">Admin Thẩm Định KYC & Doanh Nghiệp</option>
                    <option value="Admin Kiểm Duyệt Tin BĐS">Admin Kiểm Duyệt Tin BĐS</option>
                    <option value="Admin CSKH & Giải Quyết Khiếu Nại">Admin CSKH & Giải Quyết Khiếu Nại</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mức Độ Ưu Tiên
                  </label>
                  <select
                    value={taskFormData.priority || 'high'}
                    onChange={e => setTaskFormData({ ...taskFormData, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="urgent">🔥 Khẩn cấp (Xử lý ngay)</option>
                    <option value="high">⚡ Cao</option>
                    <option value="medium">Bình thường</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hạn Chót Xử Lý
                  </label>
                  <input
                    type="date"
                    value={taskFormData.deadline || ''}
                    onChange={e => setTaskFormData({ ...taskFormData, deadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Đối Tượng / Mục Tiêu Cụ Thể
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Phân khu Sao Biển / Job #REC-102"
                    value={taskFormData.targetTitle || ''}
                    onChange={e => setTaskFormData({ ...taskFormData, targetTitle: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Chỉ Dẫn & Ghi Chú Chi Tiết
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhập yêu cầu chi tiết hoặc lưu ý cho nhân sự thực hiện..."
                  value={taskFormData.notes || ''}
                  onChange={e => setTaskFormData({ ...taskFormData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold rounded-xl"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl shadow-lg cursor-pointer"
                >
                  {editingTask ? 'Lưu Thay Đổi' : 'Giao Nhiệm Vụ Ngay'}
                </button>
              </div>
            </form>
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
      {/* MODAL: THÊM / CHỈNH SỬA HỒ SƠ NHÀ TUYỂN DỤNG */}
      {/* ========================================================================= */}
      {showEmployerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <span>{editingEmployer ? 'Chỉnh Sửa Hồ Sơ Nhà Tuyển Dụng' : 'Thêm Nhà Tuyển Dụng Mới'}</span>
              </h3>
              <button
                onClick={() => setShowEmployerModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tên Công Ty / Doanh Nghiệp (*)</label>
                  <input
                    type="text"
                    required
                    value={employerFormData.companyName}
                    onChange={e => setEmployerFormData({ ...employerFormData, companyName: e.target.value })}
                    placeholder="VD: Cty TNHH Bất Động Sản VinHomes Land"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tên Thương Hiệu / Tên Cửa Hàng</label>
                  <input
                    type="text"
                    value={employerFormData.brandName}
                    onChange={e => setEmployerFormData({ ...employerFormData, brandName: e.target.value })}
                    placeholder="VD: VinHomes Land"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Ngành Nghề Hoạt Động</label>
                  <input
                    type="text"
                    value={employerFormData.industry}
                    onChange={e => setEmployerFormData({ ...employerFormData, industry: e.target.value })}
                    placeholder="VD: Bất Động Sản & Môi Giới, F&B..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Quy Mô Nhân Sự</label>
                  <input
                    type="text"
                    value={employerFormData.scaleSize}
                    onChange={e => setEmployerFormData({ ...employerFormData, scaleSize: e.target.value })}
                    placeholder="VD: 20 - 50 nhân sự"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Địa Chỉ Trụ Sở / Căn Hộ / Shophouse (*)</label>
                <input
                  type="text"
                  required
                  value={employerFormData.address}
                  onChange={e => setEmployerFormData({ ...employerFormData, address: e.target.value })}
                  placeholder="VD: Căn San Hô 12-08, Vinhomes Ocean Park 2"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Người Liên Hệ / Phụ Trách</label>
                  <input
                    type="text"
                    value={employerFormData.contactName}
                    onChange={e => setEmployerFormData({ ...employerFormData, contactName: e.target.value })}
                    placeholder="VD: Ban Nhân Sự"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Hotline / Zalo (*)</label>
                  <input
                    type="text"
                    required
                    value={employerFormData.contactPhone}
                    onChange={e => setEmployerFormData({ ...employerFormData, contactPhone: e.target.value })}
                    placeholder="VD: 0868499929"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Email Nhận CV</label>
                  <input
                    type="email"
                    value={employerFormData.contactEmail}
                    onChange={e => setEmployerFormData({ ...employerFormData, contactEmail: e.target.value })}
                    placeholder="tuyendung@domain.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Link Logo Doanh Nghiệp (URL)</label>
                  <input
                    type="text"
                    value={employerFormData.logoUrl}
                    onChange={e => setEmployerFormData({ ...employerFormData, logoUrl: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Link Banner Bìa (URL)</label>
                  <input
                    type="text"
                    value={employerFormData.bannerUrl}
                    onChange={e => setEmployerFormData({ ...employerFormData, bannerUrl: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Giới Thiệu Doanh Nghiệp & Môi Trường Làm Việc</label>
                <textarea
                  rows={3}
                  value={employerFormData.introduction}
                  onChange={e => setEmployerFormData({ ...employerFormData, introduction: e.target.value })}
                  placeholder="Mô tả về doanh nghiệp, môi trường văn hóa..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <input
                  type="checkbox"
                  id="empVerifiedCheck"
                  checked={employerFormData.verified}
                  onChange={e => setEmployerFormData({ ...employerFormData, verified: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="empVerifiedCheck" className="font-black text-emerald-800 dark:text-emerald-300 cursor-pointer">
                  Xác Thực KYC Doanh Nghiệp (Hiển thị huy hiệu tích xanh uy tín)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEmployerModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl shadow-lg"
                >
                  {editingEmployer ? 'Lưu Thay Đổi' : 'Tạo Hồ Sơ Doanh Nghiệp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
