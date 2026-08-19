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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Doanh Nghiệp / Logo</th>
                  <th className="p-3.5">Ngành Nghề & Dự Án</th>
                  <th className="p-3.5">Liên Hệ / Hotline</th>
                  <th className="p-3.5 text-center">Xác Thực KYC</th>
                  <th className="p-3.5 text-center">Tin Tuyển Dụng</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Chưa có hồ sơ nhà tuyển dụng nào.
                    </td>
                  </tr>
                ) : (
                  employers.map(emp => {
                    const empJobsCount = jobs.filter(
                      j => (emp.userId && j.employerUserId === emp.userId) || 
                           j.companyName.toLowerCase() === emp.companyName.toLowerCase()
                    ).length;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={emp.logoUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&auto=format&fit=crop&q=80'}
                              alt={emp.companyName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white"
                            />
                            <div>
                              <div className="font-black text-slate-900 dark:text-white text-sm">
                                {emp.companyName}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                <span className="truncate max-w-[200px]">{emp.address}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-extrabold text-teal-700 dark:text-teal-400">
                            {emp.industry}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {emp.projectName || emp.project}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{emp.contactPhone}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Phụ trách: {emp.contactName}
                          </div>
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleEmployerVerified(emp)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black border transition cursor-pointer ${
                              emp.verified
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300'
                            }`}
                          >
                            {emp.verified ? '🟢 Đã Xác Thực' : '⚪ Chưa Xác Thực'}
                          </button>
                        </td>

                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black rounded-lg text-xs">
                            {empJobsCount} tin tuyển
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
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

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Ứng Viên Nộp Hồ Sơ</th>
                    <th className="p-3.5">Vị Trí / Tin Tuyển Dụng</th>
                    <th className="p-3.5">Lời Nhắn / Kinh Nghiệm</th>
                    <th className="p-3.5">Thời Gian Nộp</th>
                    <th className="p-3.5 text-center">Trạng Thái & Duyệt Nhanh</th>
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

                            {/* 3 Nút Duyệt Nhanh Chuẩn Theo Yêu Cầu */}
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
                        <div className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <span>🪙 {log.amountVnd.toLocaleString('vi-VN')}</span>
                          <span className="text-[10px] text-slate-400 font-bold">Token</span>
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                          {log.paymentMethod === 'vietqr' ? 'Ví Token VietQR' : 'Ví Token Cư Dân'}
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

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Doanh Nghiệp / Chủ Shop</th>
                  <th className="p-3.5">Gói Đăng Ký</th>
                  <th className="p-3.5">Giá Trị Token</th>
                  <th className="p-3.5">Khu Đô Thị</th>
                  <th className="p-3.5">Liên Hệ / Mã Số Thuế</th>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5 text-center">Trạng Thái</th>
                  <th className="p-3.5 text-center">Hành Động Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      Chưa có yêu cầu đăng ký gói tuyển dụng nào.
                    </td>
                  </tr>
                ) : (
                  registrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-black text-slate-900 dark:text-white text-xs">
                          {reg.companyName}
                        </div>
                        {reg.brandName && (
                          <div className="text-[11px] text-teal-600 font-bold">
                            Thương hiệu: {reg.brandName}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Ngành nghề: {reg.industry}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black rounded-lg border border-amber-300 text-[11px]">
                          {reg.selectedPackageName}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-sm">
                          <span>🪙 {(reg.tokenCost || 0).toLocaleString('vi-VN')}</span>
                          <span className="text-[10px] text-slate-400 font-bold">Token</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                        {reg.project}
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          📞 {reg.contactPhone}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {reg.contactName}
                        </div>
                        {reg.taxCode && (
                          <div className="text-[10px] font-mono text-slate-400">
                            MST: {reg.taxCode}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {reg.createdAt}
                      </td>

                      <td className="p-3.5 text-center">
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

                      <td className="p-3.5 text-center">
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
                  ))
                )}
              </tbody>
            </table>
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

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Nhiệm Vụ & Phân Loại</th>
                  <th className="p-3.5">Đối Tượng Phụ Trách</th>
                  <th className="p-3.5">Người Được Gán</th>
                  <th className="p-3.5">Mức Độ Ưu Tiên</th>
                  <th className="p-3.5">Hạn Chót</th>
                  <th className="p-3.5 text-center">Trạng Thái</th>
                  <th className="p-3.5 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Chưa có nhiệm vụ giao việc nào. Nhấn "+ Tạo & Giao Nhiệm Vụ Mới" để bắt đầu.
                    </td>
                  </tr>
                ) : (
                  tasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-black text-slate-900 dark:text-white text-xs">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded">
                            {task.category === 'recruitment' ? '💼 Tuyển Dụng' : task.category === 'bds_realestate' ? '🏠 Bất Động Sản' : task.category === 'kyc_user' ? '🛡️ Duyệt KYC' : '📦 Dịch Vụ Cư Dân'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {task.targetProject}
                          </span>
                        </div>
                        {task.notes && (
                          <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                            Ghi chú: {task.notes}
                          </p>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {task.targetTitle || 'Toàn phân khu'}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-sky-600 dark:text-sky-400">
                          {task.assignedToAdminName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Giao bởi: {task.assignedByAdminName}
                        </div>
                      </td>

                      <td className="p-3.5">
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

                      <td className="p-3.5 font-mono text-[11px] text-slate-500">
                        {task.deadline || 'Không giới hạn'}
                      </td>

                      <td className="p-3.5 text-center">
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

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setTaskFormData(task);
                              setShowTaskModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Sửa nhiệm vụ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Xóa nhiệm vụ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
