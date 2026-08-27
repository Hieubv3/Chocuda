import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Briefcase, Search, Filter, MapPin, DollarSign, Clock, Users, Building2, 
  ShieldCheck, Phone, MessageSquare, PlusCircle, Sparkles, CheckCircle2, 
  Lock, Unlock, Eye, FileText, ChevronRight, User, Award, GraduationCap, 
  HeartHandshake, AlertCircle, X, Download, Share2, ArrowRight, Check,
  QrCode, Wallet, Smartphone, ExternalLink, RefreshCw, Send, Star, Trash2
} from 'lucide-react';
import { 
  ProjectCategory, 
  User as UserType, 
  RecruitmentJob, 
  CandidateProfile, 
  JobApplication, 
  CvUnlockRecord,
  CandidateWorkExperience,
  CandidateEducation
} from '../types';
import { 
  RECRUITMENT_INDUSTRIES, 
  INITIAL_RECRUITMENT_JOBS, 
  INITIAL_CANDIDATE_PROFILES 
} from '../data/recruitmentData';
import { VIN_MAJOR_PROJECTS } from '../data/residentServicesData';
import { getJobDetailUrl, getCandidateCvUrl, getRecruitmentIndustryUrl, getEmployerProfileUrl } from '../lib/slugs';

interface RecruitmentCenterPageProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  initialTab?: 'jobs' | 'candidates' | 'my_cv' | 'my_recruitment';
  initialProject?: ProjectCategory | 'all';
}

export const RecruitmentCenterPage: React.FC<RecruitmentCenterPageProps> = ({
  currentUser,
  onOpenAuth,
  initialTab = 'jobs',
  initialProject = 'all'
}) => {
  const navigate = useNavigate();
  const { industryId, projectSlug, tabName } = useParams<{ industryId?: string; projectSlug?: string; tabName?: string }>();

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'my_cv' | 'my_recruitment'>(
    tabName === 'ung-vien' || tabName === 'candidates' ? 'candidates' :
    tabName === 'my-cv' ? 'my_cv' :
    tabName === 'tuyen-dung-cua-toi' ? 'my_recruitment' : initialTab
  );
  const [selectedIndustry, setSelectedIndustry] = useState<string>(industryId || 'all');
  const [selectedProject, setSelectedProject] = useState<ProjectCategory | 'all'>(
    (projectSlug as ProjectCategory) || initialProject
  );
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (industryId) setSelectedIndustry(industryId);
  }, [industryId]);

  useEffect(() => {
    if (projectSlug) setSelectedProject(projectSlug as ProjectCategory);
  }, [projectSlug]);

  // Data States
  const [jobs, setJobs] = useState<RecruitmentJob[]>(INITIAL_RECRUITMENT_JOBS);
  const [candidates, setCandidates] = useState<CandidateProfile[]>(INITIAL_CANDIDATE_PROFILES);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [myUnlockedCvs, setMyUnlockedCvs] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals & Active Selections
  const [selectedJobModal, setSelectedJobModal] = useState<RecruitmentJob | null>(null);
  const [selectedCandidateModal, setSelectedCandidateModal] = useState<CandidateProfile | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState<boolean>(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState<boolean>(false);
  const [candidateToUnlock, setCandidateToUnlock] = useState<CandidateProfile | null>(null);

  // Job Application Form State
  const [applyCandidateName, setApplyCandidateName] = useState<string>(currentUser?.displayName || currentUser?.name || '');
  const [applyCandidatePhone, setApplyCandidatePhone] = useState<string>(currentUser?.phone || '');
  const [applyCandidateEmail, setApplyCandidateEmail] = useState<string>(currentUser?.email || '');
  const [applyMessage, setApplyMessage] = useState<string>('Tôi là cư dân hiện đang sinh sống tại nội khu, rất mong muốn được ứng tuyển vào vị trí này.');
  const [applyExpectedSalary, setApplyExpectedSalary] = useState<string>('Theo mức lương công ty đề xuất');
  const [isSubmittingApply, setIsSubmittingApply] = useState<boolean>(false);

  // Post Job Form State
  const [postJobForm, setPostJobForm] = useState({
    title: '',
    companyName: '',
    industry: 'bat-dong-san',
    project: selectedProject === 'all' ? 'ocean-park-2' : selectedProject,
    location: '',
    jobType: 'full-time' as 'full-time' | 'part-time' | 'shift' | 'freelance',
    salaryType: 'range' as 'range' | 'fixed' | 'hourly' | 'deal',
    salaryDisplay: '12 - 25 Triệu / tháng',
    minSalary: 12000000,
    maxSalary: 25000000,
    experience: 'none' as 'none' | 'under-1y' | '1-3y' | '3-5y',
    experienceDisplay: 'Không yêu cầu kinh nghiệm, được đào tạo',
    description: '',
    requirements: '',
    benefits: '',
    contactName: currentUser?.displayName || currentUser?.name || '',
    contactPhone: currentUser?.phone || '',
    contactZalo: currentUser?.phone || '',
    contactEmail: currentUser?.email || '',
    isVip: false,
    isUrgent: true,
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });
  const [isSubmittingPostJob, setIsSubmittingPostJob] = useState<boolean>(false);

  // Candidate CV Builder State
  const [myCv, setMyCv] = useState<CandidateProfile>({
    id: `cv-${currentUser?.id || 'guest'}`,
    userId: currentUser?.id,
    fullName: currentUser?.displayName || currentUser?.name || '',
    avatarUrl: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    birthYear: 1998,
    gender: 'nam',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    zalo: currentUser?.phone || '',
    currentProject: selectedProject === 'all' ? 'ocean-park-2' : selectedProject,
    projectName: 'Vinhomes Ocean Park 2',
    currentAddress: 'Phân khu Chà Là, Vinhomes Ocean Park 2',
    targetJobTitle: 'Chuyên Viên Kinh Doanh BĐS / Quản Lý Dịch Vụ Cư Dân',
    primaryIndustry: 'bat-dong-san',
    subIndustries: ['ban-hang-cskh', 'marketing-it-design'],
    workTypePreference: ['full-time', 'freelance'],
    expectedSalary: '15 - 25 Triệu / tháng',
    experienceLevel: '1-3y',
    yearsOfExp: 2,
    introduction: 'Là cư dân sinh sống tại khu đô thị, tôi có tinh thần trách nhiệm cao, tác phong nhanh nhẹn và mong muốn tìm kiếm công việc ổn định, gắn bó lâu dài ngay trong khu vực hoặc lân cận.',
    skills: ['Giao tiếp & Tư vấn khách hàng', 'Đàm phán thương lượng', 'Tin học văn phòng & Báo cáo', 'Tiếng Anh giao tiếp'],
    workExperience: [
      {
        company: 'Văn Phòng BĐS Cư Dân Ocean Park',
        role: 'Chuyên Viên Tư Vấn Căn Hộ',
        period: '2024 - 2026',
        description: 'Tư vấn quỹ căn cho thuê và chuyển nhượng, hỗ trợ khách làm thủ tục bàn giao.'
      }
    ],
    education: [
      {
        school: 'Đại Học Kinh Tế Quốc Dân',
        major: 'Quản Trị Kinh Doanh',
        period: '2016 - 2020',
        degree: 'Cử Nhân'
      }
    ],
    certificates: ['Chứng chỉ Môi Giới BĐS', 'Chứng chỉ Ngoại Ngữ B1'],
    isLookingForJob: true,
    isImmediate: true,
    unlockPriceVnd: 50000,
    unlockedByUserIds: [],
    viewsCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [newExp, setNewExp] = useState<CandidateWorkExperience>({ company: '', role: '', period: '', description: '' });
  const [newEdu, setNewEdu] = useState<CandidateEducation>({ school: '', major: '', period: '', degree: '' });
  const [newSkillTag, setNewSkillTag] = useState<string>('');
  const [isSavingCv, setIsSavingCv] = useState<boolean>(false);
  const [cvSaveToast, setCvSaveToast] = useState<string | null>(null);

  // Unlock Payment State
  const [unlockPaymentMethod, setUnlockPaymentMethod] = useState<'vietqr' | 'wallet_balance'>('vietqr');
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

  // Fetch Jobs & Candidates from Server API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const requesterId = currentUser?.id || 'guest';
      const isAdmin = currentUser?.role === 'admin' ? 'true' : 'false';

      // 1. Fetch Jobs
      const jobsRes = await fetch(`/api/recruitment/jobs?industry=${selectedIndustry}&project=${selectedProject}&jobType=${selectedJobType}&q=${encodeURIComponent(searchQuery)}`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (Array.isArray(jobsData)) setJobs(jobsData);
      }

      // 2. Fetch Candidates
      const candRes = await fetch(`/api/recruitment/candidates?industry=${selectedIndustry}&project=${selectedProject}&q=${encodeURIComponent(searchQuery)}&requesterUserId=${requesterId}&isAdmin=${isAdmin}`);
      if (candRes.ok) {
        const candData = await candRes.json();
        if (Array.isArray(candData)) setCandidates(candData);
      }

      // 3. If User logged in, fetch My CV & My Applications
      if (currentUser?.id) {
        const myCvRes = await fetch(`/api/recruitment/candidates?userId=${currentUser.id}`);
        if (myCvRes.ok) {
          const myCvData = await myCvRes.json();
          if (Array.isArray(myCvData) && myCvData.length > 0) {
            setMyCv(myCvData[0]);
          }
        }

        const appRes = await fetch(`/api/recruitment/applications?employerUserId=${currentUser.id}`);
        if (appRes.ok) {
          const appData = await appRes.json();
          if (Array.isArray(appData)) setApplications(appData);
        }
      }
    } catch (err) {
      console.warn('Recruitment API fetch error, using local fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedIndustry, selectedProject, selectedJobType, searchQuery, currentUser]);

  // Filtered lists for UI counters
  const totalActiveJobs = useMemo(() => jobs.filter(j => j.status === 'active' || !j.status).length, [jobs]);
  const totalActiveCandidates = useMemo(() => candidates.filter(c => c.isLookingForJob !== false).length, [candidates]);

  // Handle Apply for Job
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobModal) return;

    if (!applyCandidateName || !applyCandidatePhone) {
      alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại để nộp hồ sơ!');
      return;
    }

    setIsSubmittingApply(true);
    try {
      const res = await fetch('/api/recruitment/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJobModal.id,
          candidateId: myCv?.id || `cand-${Date.now()}`,
          candidateName: applyCandidateName,
          candidatePhone: applyCandidatePhone,
          candidateEmail: applyCandidateEmail,
          candidateAvatar: myCv?.avatarUrl || '',
          expectedSalary: applyExpectedSalary,
          targetJobTitle: myCv?.targetJobTitle || selectedJobModal.title,
          message: applyMessage
        })
      });

      const resData = await res.json();
      if (res.ok) {
        alert(resData.message || '🎉 Nộp hồ sơ ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.');
        setIsApplyModalOpen(false);
        fetchData();
      } else {
        alert(resData.error || 'Có lỗi xảy ra khi nộp hồ sơ.');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmittingApply(false);
    }
  };

  // Handle Post Job Submit
  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postJobForm.title || !postJobForm.companyName || !postJobForm.contactPhone || !postJobForm.contactName) {
      alert('Vui lòng điền đầy đủ Tiêu đề, Tên công ty, Người liên hệ và Số điện thoại!');
      return;
    }

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const isAdmin = currentUser.role === 'admin' || currentUser.id === 'user-admin';
    const requiredTokens = postJobForm.isVip ? 50000 : (postJobForm.isUrgent ? 35000 : 20000);
    const availableTokens = (currentUser.tokenBalance ?? currentUser.balance ?? 0);

    if (!isAdmin && availableTokens < requiredTokens) {
      alert(`⚠️ Số dư Token Cư Dân không đủ để đăng tin!\n\n• Chi phí gói đăng: ${requiredTokens.toLocaleString('vi-VN')} Token\n• Số dư hiện có: ${availableTokens.toLocaleString('vi-VN')} Token\n\nVui lòng nạp thêm Token hoặc liên hệ Admin qua Hotline/Zalo 0868.499.929 để được cấp Token!`);
      return;
    }

    setIsSubmittingPostJob(true);
    try {
      const res = await fetch('/api/recruitment/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postJobForm,
          employerUserId: currentUser.id,
          requirements: postJobForm.requirements.split('\n').filter(r => r.trim()),
          benefits: postJobForm.benefits.split('\n').filter(b => b.trim())
        })
      });

      const resData = await res.json();
      if (res.ok) {
        alert(resData.message || '🎉 Đăng tin tuyển dụng thành công!');
        setIsPostJobModalOpen(false);
        setActiveTab('my_recruitment');
        fetchData();
      } else {
        alert(resData.error || 'Có lỗi xảy ra khi đăng tin tuyển dụng.');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setIsSubmittingPostJob(false);
    }
  };

  // Handle Delete My Job
  const handleDeleteMyJob = async (jobId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tin tuyển dụng "${title}"?`)) return;
    try {
      const res = await fetch(`/api/recruitment/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Đã xóa tin tuyển dụng thành công!');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Toggle Job Active Status
  const handleToggleMyJobStatus = async (job: RecruitmentJob) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const res = await fetch(`/api/recruitment/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        alert(`Đã cập nhật trạng thái tin thành: ${nextStatus === 'active' ? 'Đang tuyển' : 'Tạm dừng tuyển'}`);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Save CV Profile
  const handleSaveCvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myCv.fullName || !myCv.phone || !myCv.targetJobTitle) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Vị trí ứng tuyển mong muốn!');
      return;
    }

    setIsSavingCv(true);
    try {
      const res = await fetch('/api/recruitment/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...myCv,
          userId: currentUser?.id || myCv.userId || `u-guest-${Date.now()}`
        })
      });

      const resData = await res.json();
      if (res.ok) {
        setCvSaveToast('🎉 Đã lưu hồ sơ CV trực tuyến thành công! Nhà tuyển dụng có thể tìm thấy bạn trong Kho CV Cư Dân.');
        setTimeout(() => setCvSaveToast(null), 5000);
        fetchData();
      } else {
        alert(resData.error || 'Có lỗi xảy ra khi lưu hồ sơ.');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setIsSavingCv(false);
    }
  };

  // Handle Unlock Candidate CV
  const handleUnlockCandidate = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!candidateToUnlock) return;

    setIsUnlocking(true);
    try {
      const res = await fetch(`/api/recruitment/candidates/${candidateToUnlock.id}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recruiterUserId: currentUser.id,
          recruiterName: currentUser.displayName || currentUser.name || 'Nhà Tuyển Dụng',
          recruiterPhone: currentUser.phone || '',
          paymentMethod: unlockPaymentMethod,
          amountVnd: candidateToUnlock.unlockPriceVnd || 50000
        })
      });

      const resData = await res.json();
      if (res.ok) {
        alert(resData.message || '🎉 Mở khóa thông tin ứng viên thành công!');
        setIsUnlockModalOpen(false);
        // Update candidate in modal and list
        if (resData.candidate) {
          setSelectedCandidateModal(resData.candidate);
        }
        fetchData();
      } else {
        alert(resData.error || 'Có lỗi khi mở khóa hồ sơ.');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Add work experience item to CV
  const handleAddExperience = () => {
    if (!newExp.company || !newExp.role) {
      alert('Vui lòng nhập Tên công ty/Cửa hàng và Vị trí!');
      return;
    }
    setMyCv(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { ...newExp }]
    }));
    setNewExp({ company: '', role: '', period: '', description: '' });
  };

  // Add education item to CV
  const handleAddEducation = () => {
    if (!newEdu.school || !newEdu.major) {
      alert('Vui lòng nhập Tên trường và Chuyên ngành!');
      return;
    }
    setMyCv(prev => ({
      ...prev,
      education: [...prev.education, { ...newEdu }]
    }));
    setNewEdu({ school: '', major: '', period: '', degree: '' });
  };

  // Add skill tag to CV
  const handleAddSkillTag = () => {
    if (!newSkillTag.trim()) return;
    if (!myCv.skills.includes(newSkillTag.trim())) {
      setMyCv(prev => ({
        ...prev,
        skills: [...prev.skills, newSkillTag.trim()]
      }));
    }
    setNewSkillTag('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white border-b border-emerald-700/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>NỀN TẢNG TUYỂN DỤNG & VIỆC LÀM CƯ DÂN 24H</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 shrink-0" />
                <span>Tuyển Dụng & Tìm Việc Làm Nội Khu</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Kết nối trực tiếp Nhà tuyển dụng và Ứng viên là Cư dân sinh sống tại các Đại đô thị. Đăng tin tuyển dụng nhanh, tạo CV chuyên nghiệp & mở khóa liên hệ an toàn.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => {
                  if (!currentUser) onOpenAuth();
                  else setActiveTab('my_cv');
                }}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Tạo CV Của Tôi</span>
              </button>

              <button
                onClick={() => {
                  if (!currentUser) onOpenAuth();
                  else setIsPostJobModalOpen(true);
                }}
                className="px-3.5 py-2 sm:px-5 sm:py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Đăng Tin Tuyển Dụng</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-6 pt-4 border-t border-emerald-700/40 text-xs">
            <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
                {totalActiveJobs}
              </div>
              <div>
                <div className="font-bold text-white">Tin Tuyển Dụng</div>
                <div className="text-[10px] text-slate-400">Đang tuyển dụng</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-black">
                {totalActiveCandidates}
              </div>
              <div>
                <div className="font-bold text-white">Hồ Sơ CV Cư Dân</div>
                <div className="text-[10px] text-slate-400">Sẵn sàng nhận việc</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-black">
                100%
              </div>
              <div>
                <div className="font-bold text-white">Cư Dân Thật</div>
                <div className="text-[10px] text-slate-400">Xác thực căn hộ & tòa nhà</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-black">
                50K
              </div>
              <div>
                <div className="font-bold text-white">Mở Khóa CV</div>
                <div className="text-[10px] text-slate-400">Xem Full SĐT & Zalo</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="sticky top-[56px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-2">
            <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'jobs'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Việc Làm Cư Dân ({jobs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('candidates')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'candidates'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Kho CV Ứng Viên ({candidates.length})</span>
              </button>

              <button
                onClick={() => {
                  if (!currentUser) onOpenAuth();
                  else setActiveTab('my_cv');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'my_cv'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Tạo & Quản Lý CV</span>
              </button>

              <button
                onClick={() => {
                  if (!currentUser) onOpenAuth();
                  else setActiveTab('my_recruitment');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'my_recruitment'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Quản Lý Tuyển Dụng</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else setIsPostJobModalOpen(true);
              }}
              className="hidden sm:flex px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black items-center gap-1 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Đăng Tin Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Search & Project Filter Bar (Shared for Jobs & Candidates) */}
        {(activeTab === 'jobs' || activeTab === 'candidates') && (
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3">
              
              {/* Keyword Search */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'jobs' ? "Tìm kiếm việc làm, vị trí, công ty..." : "Tìm ứng viên theo vị trí, kỹ năng, họ tên..."}
                  className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Project / Khu Đô Thị Dropdown */}
              <div className="md:col-span-4 relative">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value as any)}
                  aria-label="Chọn khu đô thị hoặc dự án tuyển dụng"
                  className="w-full pl-9.5 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden appearance-none cursor-pointer"
                >
                  <option value="all">📍 Toàn bộ các Khu Đô Thị & Dự Án</option>
                  {VIN_MAJOR_PROJECTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Job Type or Experience Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  aria-label="Chọn hình thức làm việc"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
                >
                  <option value="all">🕒 Mọi hình thức làm việc</option>
                  <option value="full-time">Toàn thời gian (Full-time)</option>
                  <option value="part-time">Bán thời gian (Part-time)</option>
                  <option value="shift">Làm theo ca (Ca sáng/chiều/tối)</option>
                  <option value="freelance">Freelance / Nhận việc tự do</option>
                </select>
              </div>

            </div>

            {/* Industry Filter Pills */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                <Filter className="w-3 h-3 text-emerald-500" />
                <span>Lọc theo ngành nghề:</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {RECRUITMENT_INDUSTRIES.map(ind => {
                  const isSelected = selectedIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      onClick={() => setSelectedIndustry(ind.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      <span>{ind.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: VIỆC LÀM CƯ DÂN (JOBS LIST) */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Danh Sách Việc Làm Đang Tuyển Dụng</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {jobs.length} tin
                </span>
              </h2>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Chưa có tin tuyển dụng nào phù hợp với bộ lọc hiện tại.</p>
                <button
                  onClick={() => { setSelectedIndustry('all'); setSelectedProject('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      
                      {/* Job Header Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {job.isVip && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                              <Star className="w-2.5 h-2.5 fill-slate-950" />
                              VIP
                            </span>
                          )}
                          {job.isUrgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              ⚡ Tuyển Gấp
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {job.jobType === 'full-time' ? 'Toàn thời gian' : job.jobType === 'part-time' ? 'Bán thời gian' : job.jobType === 'shift' ? 'Làm theo ca' : 'Freelance'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                          {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>

                      {/* Title & Company */}
                      <div>
                        <h3 
                          onClick={() => navigate(getJobDetailUrl(job))}
                          className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition cursor-pointer line-clamp-2 leading-snug"
                        >
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{job.companyName}</span>
                        </div>
                      </div>

                      {/* Salary & Location Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-1.5 font-black text-emerald-600 dark:text-emerald-400">
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{job.salaryDisplay}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{job.projectName || job.location}</span>
                        </div>
                      </div>

                      {/* Brief description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400">
                        <span>{job.viewsCount || 0} xem</span> • <span className="font-bold text-emerald-600 dark:text-emerald-400">{job.applicationsCount || 0} ứng tuyển</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(getJobDetailUrl(job))}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Chi Tiết
                        </button>
                        <button
                          onClick={() => navigate(getJobDetailUrl(job))}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Ứng Tuyển</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KHO HỒ SƠ ỨNG VIÊN (CANDIDATE CVs FOR EMPLOYERS) */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Kho Hồ Sơ CV Ứng Viên Cư Dân</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {candidates.length} ứng viên
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Nhà tuyển dụng có thể lọc hồ sơ theo chuyên môn và mở khóa để xem đầy đủ Số điện thoại, Zalo, Email.</p>
              </div>
            </div>

            {candidates.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Chưa có hồ sơ ứng viên nào phù hợp.</p>
                <button
                  onClick={() => { setSelectedIndustry('all'); setSelectedProject('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidates.map(cand => {
                  const isUnlocked = (cand as any).isUnlocked;
                  return (
                    <div
                      key={cand.id}
                      className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition shadow-xs flex flex-col justify-between relative group"
                    >
                      <div className="space-y-3">
                        
                        {/* Top Candidate Avatar & Status */}
                        <div className="flex items-start gap-3">
                          <img loading="lazy"
                            src={cand.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                            alt={cand.fullName}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 
                                onClick={() => navigate(getCandidateCvUrl(cand))}
                                className="font-black text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 transition cursor-pointer truncate"
                              >
                                {cand.fullName}
                              </h3>
                              {cand.isImmediate && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  Sẵn sàng đi làm
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                              {cand.targetJobTitle}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{cand.projectName || cand.currentAddress}</span>
                            </p>
                          </div>
                        </div>

                        {/* Experience & Salary Pills */}
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Kinh nghiệm:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {cand.experienceLevel === 'above-5y' ? 'Trên 5 năm' : cand.experienceLevel === '3-5y' ? '3 - 5 năm' : cand.experienceLevel === '1-3y' ? '1 - 3 năm' : 'Dưới 1 năm'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Lương kỳ vọng:</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400 truncate block">
                              {cand.expectedSalary}
                            </span>
                          </div>
                        </div>

                        {/* Introduction Bio */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {cand.introduction}
                        </p>

                        {/* Skill Tags */}
                        {cand.skills && cand.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cand.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-medium">
                                #{skill}
                              </span>
                            ))}
                            {cand.skills.length > 3 && (
                              <span className="px-1.5 py-0.5 text-[10px] text-slate-400">+{cand.skills.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Contact Box (Unlocked vs Masked) */}
                        <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                          isUnlocked 
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                            : 'bg-slate-100/80 dark:bg-slate-800/80 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1">
                              {isUnlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
                              {isUnlocked ? 'Thông tin liên hệ đã mở:' : 'Thông tin liên hệ (Bị khóa):'}
                            </span>
                            {isUnlocked ? (
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded">ĐÃ MỞ KHÓA</span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">50.000đ / CV</span>
                            )}
                          </div>

                          <div className="font-mono text-xs font-bold">
                            SĐT: {cand.phone}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => navigate(getCandidateCvUrl(cand))}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Xem CV Đầy Đủ
                        </button>

                        {isUnlocked ? (
                          <a
                            href={`tel:${cand.phone}`}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-xs"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Gọi Ngay</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setCandidateToUnlock(cand);
                              setIsUnlockModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Mở Khóa CV</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TẠO & QUẢN LÝ CV CỦA TÔI (CANDIDATE CV BUILDER) */}
        {activeTab === 'my_cv' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* CV Header Bar */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Hồ Sơ CV Trực Tuyến Chuẩn Cư Dân</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điền đầy đủ thông tin để Nhà tuyển dụng nội khu có thể chủ động tìm thấy và mời bạn phỏng vấn.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={myCv.isLookingForJob}
                    onChange={(e) => setMyCv(prev => ({ ...prev, isLookingForJob: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Bật tìm việc</span>
                </label>

                <button
                  onClick={handleSaveCvSubmit}
                  disabled={isSavingCv}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingCv ? 'Đang Lưu...' : 'Lưu Hồ Sơ CV'}</span>
                </button>
              </div>
            </div>

            {cvSaveToast && (
              <div className="p-4 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{cvSaveToast}</span>
              </div>
            )}

            {/* CV Form */}
            <form onSubmit={handleSaveCvSubmit} className="space-y-6">
              
              {/* Section 1: Basic Information */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>1. THÔNG TIN CÁ NHÂN & CĂN HỘ CƯ TRÚ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Họ và Tên *</label>
                    <input
                      type="text"
                      value={myCv.fullName}
                      onChange={(e) => setMyCv(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Số Điện Thoại / Zalo *</label>
                    <input
                      type="tel"
                      value={myCv.phone}
                      onChange={(e) => setMyCv(prev => ({ ...prev, phone: e.target.value, zalo: e.target.value }))}
                      placeholder="0988xxxxxx"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={myCv.email}
                      onChange={(e) => setMyCv(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Năm Sinh</label>
                    <input
                      type="number"
                      value={myCv.birthYear}
                      onChange={(e) => setMyCv(prev => ({ ...prev, birthYear: Number(e.target.value) }))}
                      placeholder="1998"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Khu Đô Thị / Dự Án</label>
                    <select
                      value={myCv.currentProject}
                      onChange={(e) => setMyCv(prev => ({ ...prev, currentProject: e.target.value as any, projectName: e.target.options[e.target.selectedIndex].text }))}
                      aria-label="Chọn khu đô thị cư trú"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    >
                      {VIN_MAJOR_PROJECTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tòa Nhà / Căn Hộ Cụ Thể</label>
                    <input
                      type="text"
                      value={myCv.currentAddress}
                      onChange={(e) => setMyCv(prev => ({ ...prev, currentAddress: e.target.value }))}
                      placeholder="Ví dụ: Tòa S2.12 Căn 1806 hoặc Căn Chà Là 15-08"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Target Position & Industry */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>2. VỊ TRÍ ỨNG TUYỂN & NGÀNH NGHỀ MONG MUỐN</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Vị Trí / Chức Danh Ứng Tuyển *</label>
                    <input
                      type="text"
                      value={myCv.targetJobTitle}
                      onChange={(e) => setMyCv(prev => ({ ...prev, targetJobTitle: e.target.value }))}
                      placeholder="Ví dụ: Chuyên Viên Môi Giới BĐS / Barista / Giúp Việc Theo Giờ"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ngành Nghề Chính *</label>
                    <select
                      value={myCv.primaryIndustry}
                      onChange={(e) => setMyCv(prev => ({ ...prev, primaryIndustry: e.target.value }))}
                      aria-label="Chọn ngành nghề chính của CV"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    >
                      {RECRUITMENT_INDUSTRIES.filter(i => i.id !== 'all').map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mức Lương Kỳ Vọng</label>
                    <input
                      type="text"
                      value={myCv.expectedSalary}
                      onChange={(e) => setMyCv(prev => ({ ...prev, expectedSalary: e.target.value }))}
                      placeholder="Ví dụ: 12 - 20 Triệu/tháng hoặc 50.000đ/giờ"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kinh Nghiệm Làm Việc</label>
                    <select
                      value={myCv.experienceLevel}
                      onChange={(e) => setMyCv(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                      aria-label="Chọn cấp độ kinh nghiệm làm việc"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    >
                      <option value="none">Chưa có kinh nghiệm</option>
                      <option value="under-1y">Dưới 1 năm kinh nghiệm</option>
                      <option value="1-3y">1 - 3 năm kinh nghiệm</option>
                      <option value="3-5y">3 - 5 năm kinh nghiệm</option>
                      <option value="above-5y">Trên 5 năm kinh nghiệm chuyên sâu</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Giới Thiệu Bản Thân & Mục Tiêu Nghề Nghiệp</label>
                  <textarea
                    rows={3}
                    value={myCv.introduction}
                    onChange={(e) => setMyCv(prev => ({ ...prev, introduction: e.target.value }))}
                    placeholder="Mô tả ngắn gọn về tính cách, thế mạnh, kinh nghiệm nổi bật và lý do muốn làm việc..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Section 3: Skills Tags */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>3. KỸ NĂNG & THẾ MẠNH NỔI BẬT</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkillTag}
                    onChange={(e) => setNewSkillTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkillTag(); } }}
                    placeholder="Nhập kỹ năng (VD: Bán hàng BĐS, Pha chế, Tiếng Anh) rồi nhấn Thêm"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkillTag}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Thêm Kỹ Năng
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {myCv.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => setMyCv(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))}
                        className="text-emerald-500 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 4: Work Experience List */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>4. LỊCH SỬ KINH NGHIỆM LÀM VIỆC</span>
                  </div>
                  <span className="text-xs text-slate-400 font-normal">{myCv.workExperience.length} mục</span>
                </div>

                {/* Existing Exp list */}
                {myCv.workExperience.map((exp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 relative space-y-1">
                    <button
                      type="button"
                      onClick={() => setMyCv(prev => ({ ...prev, workExperience: prev.workExperience.filter((_, i) => i !== idx) }))}
                      className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{exp.role} - <span className="text-emerald-600">{exp.company}</span></div>
                    <div className="text-[11px] text-slate-400">{exp.period}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{exp.description}</p>
                  </div>
                ))}

                {/* Add new Exp sub-form */}
                <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">+ Thêm kinh nghiệm làm việc:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newExp.company}
                      onChange={(e) => setNewExp(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Tên công ty / Cửa hàng"
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={newExp.role}
                      onChange={(e) => setNewExp(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Chức danh / Vị trí"
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={newExp.period}
                      onChange={(e) => setNewExp(prev => ({ ...prev, period: e.target.value }))}
                      placeholder="Thời gian (VD: 2023 - 2025)"
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={newExp.description}
                    onChange={(e) => setNewExp(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả công việc đã làm và thành tích đạt được..."
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    + Thêm Vào CV
                  </button>
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingCv}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-black shadow-lg flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>{isSavingCv ? 'Đang Lưu...' : 'Hoàn Tất & Lưu Hồ Sơ CV'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 4: QUẢN LÝ TUYỂN DỤNG CỦA TÔI (EMPLOYER MANAGEMENT) */}
        {activeTab === 'my_recruitment' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>Bảng Điều Khiển Nhà Tuyển Dụng</span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    🪙 {(currentUser?.tokenBalance ?? currentUser?.balance ?? 0).toLocaleString('vi-VN')} Token Cư Dân
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý các tin tuyển dụng bạn đã đăng, theo dõi ứng viên nộp hồ sơ và mở khóa CV.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPostJobModalOpen(true)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Đăng Tin Tuyển Dụng Mới</span>
                </button>
              </div>
            </div>

            {/* Sub-section: My Posted Jobs List */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Tin Tuyển Dụng Đã Đăng Của Bạn ({jobs.filter(j => j.employerUserId === currentUser?.id).length})</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Tự do bật/tắt hoặc chỉnh sửa tin đăng</span>
              </div>

              {jobs.filter(j => j.employerUserId === currentUser?.id).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2 opacity-50" />
                  Bạn chưa đăng tin tuyển dụng nào. Nhấn <strong>"+ Đăng Tin Tuyển Dụng Mới"</strong> để tiếp cận hàng nghìn cư dân ngay!
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.filter(j => j.employerUserId === currentUser?.id).map(job => (
                    <div key={job.id} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            job.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {job.status === 'active' ? '● Đang Tuyển' : '○ Tạm Dừng'}
                          </span>
                          {job.isVip && <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">VIP Diamond</span>}
                          {job.isUrgent && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">⚡ Tuyển Gấp</span>}
                          <span className="text-xs text-slate-400">{job.projectName}</span>
                        </div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">{job.title}</h4>
                        <div className="text-xs text-emerald-600 font-bold mt-0.5">
                          {job.companyName} • Lương: {job.salaryDisplay} • {job.viewsCount || 0} lượt xem • {job.applicationsCount || 0} ứng tuyển
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleMyJobStatus(job)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            job.status === 'active' ? 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {job.status === 'active' ? 'Tạm Dừng' : 'Bật Tuyển Lại'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMyJob(job.id, job.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                          title="Xóa tin tuyển dụng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-section: Applications received */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span>Hồ Sơ Ứng Tuyển Nhận Được ({applications.length})</span>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Chưa có ứng viên nào nộp hồ sơ vào tin tuyển dụng của bạn.
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => (
                    <div key={app.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{app.candidateName} - <span className="text-emerald-600">{app.candidatePhone}</span></div>
                        <div className="text-[11px] text-slate-500">Ứng tuyển vị trí: <span className="font-semibold text-slate-700 dark:text-slate-300">{app.jobTitle}</span></div>
                        {app.message && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">"{app.message}"</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${app.candidatePhone}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Gọi Điện</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* MODAL: POST RECRUITMENT JOB */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Đăng Tin Tuyển Dụng Mới</h3>
                  <p className="text-[11px] text-slate-400">Tiếp cận hàng vạn cư dân sinh sống trong khu đô thị</p>
                </div>
              </div>
              <button onClick={() => setIsPostJobModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Package Selector Cards with Token Pricing */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 dark:text-white">Chọn Gói Đăng Tin Tuyển Dụng:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Standard */}
                <button
                  type="button"
                  onClick={() => setPostJobForm(prev => ({ ...prev, isVip: false, isUrgent: false }))}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    !postJobForm.isVip && !postJobForm.isUrgent
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  <div className="font-black text-xs text-slate-900 dark:text-white">GÓI TIÊU CHUẨN</div>
                  <div className="text-emerald-600 font-extrabold text-sm mt-0.5">20.000 Token</div>
                  <div className="text-[10px] text-slate-400 mt-1">Hiển thị 30 ngày trên cổng việc làm</div>
                </button>

                {/* Urgent */}
                <button
                  type="button"
                  onClick={() => setPostJobForm(prev => ({ ...prev, isVip: false, isUrgent: true }))}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    !postJobForm.isVip && postJobForm.isUrgent
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  <div className="font-black text-xs text-rose-600">⚡ TUYỂN GẤP</div>
                  <div className="text-rose-600 font-extrabold text-sm mt-0.5">35.000 Token</div>
                  <div className="text-[10px] text-slate-400 mt-1">Gắn nhãn Tuyển Gấp màu đỏ nổi bật</div>
                </button>

                {/* VIP */}
                <button
                  type="button"
                  onClick={() => setPostJobForm(prev => ({ ...prev, isVip: true, isUrgent: false }))}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    postJobForm.isVip
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  <div className="font-black text-xs text-amber-600">💎 VIP DIAMOND</div>
                  <div className="text-amber-600 font-extrabold text-sm mt-0.5">50.000 Token</div>
                  <div className="text-[10px] text-slate-400 mt-1">Ghim Top 1 vị trí kim cương</div>
                </button>
              </div>

              {/* Token balance summary */}
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  Số dư Token Cư Dân của bạn: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{(currentUser?.tokenBalance ?? currentUser?.balance ?? 0).toLocaleString('vi-VN')} Token</strong>
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentUser?.role === 'admin' ? '🛡️ Admin: Miễn phí' : '(1 Token = 1 VNĐ)'}
                </span>
              </div>
            </div>

            <form onSubmit={handlePostJobSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tiêu Đề Tin Tuyển Dụng *</label>
                <input
                  type="text"
                  value={postJobForm.title}
                  onChange={(e) => setPostJobForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ví dụ: Tuyển 3 Nhân viên Pha chế & Phục vụ Quán Cafe S2.05 (Lương 30k/h)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Công Ty / Cửa Hàng / Chủ Nhà *</label>
                  <input
                    type="text"
                    value={postJobForm.companyName}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Ví dụ: Tiệm Trà & Cafe Gió Biển S2.05"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ngành Nghề Tuyển Dụng *</label>
                  <select
                    value={postJobForm.industry}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, industry: e.target.value }))}
                    aria-label="Chọn ngành nghề tuyển dụng"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    {RECRUITMENT_INDUSTRIES.filter(i => i.id !== 'all').map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Khu Đô Thị / Dự Án *</label>
                  <select
                    value={postJobForm.project}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, project: e.target.value as any, projectName: e.target.options[e.target.selectedIndex].text }))}
                    aria-label="Chọn khu đô thị dự án làm việc"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    {VIN_MAJOR_PROJECTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Địa Chỉ Chi Tiết Nơi Làm Việc</label>
                  <input
                    type="text"
                    value={postJobForm.location}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ví dụ: Shophouse Khối Đế S2.05 hoặc San Hô 12"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mức Lương Hiển Thị *</label>
                  <input
                    type="text"
                    value={postJobForm.salaryDisplay}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, salaryDisplay: e.target.value }))}
                    placeholder="Ví dụ: 12 - 25 Triệu / tháng hoặc 35.000đ/giờ"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hình Thức Làm Việc</label>
                  <select
                    value={postJobForm.jobType}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, jobType: e.target.value as any }))}
                    aria-label="Chọn hình thức làm việc của tin tuyển dụng"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    <option value="full-time">Toàn thời gian (Full-time)</option>
                    <option value="part-time">Bán thời gian (Part-time)</option>
                    <option value="shift">Làm việc theo ca</option>
                    <option value="freelance">Freelance / Hợp đồng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mô Tả Công Việc</label>
                <textarea
                  rows={3}
                  value={postJobForm.description}
                  onChange={(e) => setPostJobForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả các nhiệm vụ và trách nhiệm chính của vị trí này..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Yêu Cầu (Mỗi dòng 1 ý)</label>
                  <textarea
                    rows={2}
                    value={postJobForm.requirements}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder="Chăm chỉ, thật thà&#10;Có phương tiện đi lại"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quyền Lợi & Đãi Ngộ (Mỗi dòng 1 ý)</label>
                  <textarea
                    rows={2}
                    value={postJobForm.benefits}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, benefits: e.target.value }))}
                    placeholder="Thưởng nóng theo doanh số&#10;Phụ cấp ăn ca và gửi xe"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Người Liên Hệ *</label>
                  <input
                    type="text"
                    value={postJobForm.contactName}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Ví dụ: Anh Hiếu / Chị Lan"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Số Điện Thoại / Zalo *</label>
                  <input
                    type="tel"
                    value={postJobForm.contactPhone}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, contactPhone: e.target.value, contactZalo: e.target.value }))}
                    placeholder="Nhập SĐT / Zalo của bạn (VD: 0912.xxx.xxx)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPostJob}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingPostJob ? 'Đang Đăng Tin...' : 'Đăng Tin Tuyển Dụng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: JOB DETAIL */}
      {selectedJobModal && !isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  {selectedJobModal.isVip && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">VIP</span>
                  )}
                  {selectedJobModal.isUrgent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">⚡ Tuyển Gấp</span>
                  )}
                  <span className="text-xs text-slate-400">{selectedJobModal.projectName}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {selectedJobModal.title}
                </h3>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {selectedJobModal.companyName}
                </div>
              </div>
              <button onClick={() => setSelectedJobModal(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key info boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Mức lương:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{selectedJobModal.salaryDisplay}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Hình thức:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedJobModal.jobType === 'full-time' ? 'Toàn thời gian' : 'Bán thời gian / Ca'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Kinh nghiệm:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedJobModal.experienceDisplay}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 text-xs">
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Mô Tả Công Việc</h4>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{selectedJobModal.description}</p>
            </div>

            {/* Requirements */}
            {selectedJobModal.requirements && selectedJobModal.requirements.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Yêu Cầu Ứng Viên</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                  {selectedJobModal.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {selectedJobModal.benefits && selectedJobModal.benefits.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Quyền Lợi & Đãi Ngộ</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                  {selectedJobModal.benefits.map((ben, i) => (
                    <li key={i}>{ben}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact Box */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-emerald-900 dark:text-emerald-200">Liên hệ trực tiếp: {selectedJobModal.contactName}</div>
                <div className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">{selectedJobModal.contactPhone}</div>
              </div>
              <a
                href={`tel:${selectedJobModal.contactPhone}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1 shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Gọi Ngay</span>
              </a>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedJobModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Nộp Hồ Sơ Ứng Tuyển</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY FOR JOB */}
      {isApplyModalOpen && selectedJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Nộp Hồ Sơ Ứng Tuyển</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-xs">{selectedJobModal.title}</p>
                </div>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Họ và Tên của bạn *</label>
                <input
                  type="text"
                  value={applyCandidateName}
                  onChange={(e) => setApplyCandidateName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số Điện Thoại Nhận Cuộc Gọi Phỏng Vấn *</label>
                <input
                  type="tel"
                  value={applyCandidatePhone}
                  onChange={(e) => setApplyCandidatePhone(e.target.value)}
                  placeholder="0988xxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mức Lương Mong Muốn</label>
                <input
                  type="text"
                  value={applyExpectedSalary}
                  onChange={(e) => setApplyExpectedSalary(e.target.value)}
                  placeholder="Ví dụ: 15 Triệu/tháng hoặc Thỏa thuận"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lời Nhắn Gửi Nhà Tuyển Dụng</label>
                <textarea
                  rows={3}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Giới thiệu nhanh về bản thân hoặc kinh nghiệm liên quan..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApply}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black shadow-md flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingApply ? 'Đang gửi...' : 'Gửi Hồ Sơ Ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UNLOCK CANDIDATE CV (PAYMENT MODAL) */}
      {isUnlockModalOpen && candidateToUnlock && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <Unlock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Mở Khóa Hồ Sơ Ứng Viên</h3>
                  <p className="text-[11px] text-slate-400">Xem đầy đủ SĐT, Zalo & Liên hệ trực tiếp</p>
                </div>
              </div>
              <button onClick={() => setIsUnlockModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Summary */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <img loading="lazy"
                src={candidateToUnlock.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt={candidateToUnlock.fullName}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <div className="font-black text-sm text-slate-900 dark:text-white truncate">{candidateToUnlock.fullName}</div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">{candidateToUnlock.targetJobTitle}</div>
                <div className="text-[11px] text-slate-400 truncate">{candidateToUnlock.projectName}</div>
              </div>
            </div>

            {/* Fee & VietQR */}
            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-center space-y-2">
              <div className="text-xs text-amber-900 dark:text-amber-300 font-medium">Phí mở khóa xem trọn vẹn CV:</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {(candidateToUnlock.unlockPriceVnd || 50000).toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-slate-500">Mở khóa 1 lần xem vĩnh viễn trong danh sách của bạn</div>
            </div>

            {/* QR Scan Code Preview */}
            <div className="text-center space-y-2">
              <div className="inline-block p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <img loading="lazy"
                  src={`https://img.vietqr.io/image/MSB-3028031988-compact2.png?amount=${candidateToUnlock.unlockPriceVnd || 50000}&addInfo=${encodeURIComponent(`MOKHOA CV ${candidateToUnlock.id}`)}&accountName=BUI%20VAN%20HIEU`}
                  alt="VietQR Mở Khóa CV"
                  className="w-40 h-40 mx-auto object-contain"
                />
              </div>
              <div className="text-[11px] text-slate-400">Quét mã VietQR bằng bất kỳ App Ngân Hàng hoặc nhấn Xác Nhận bên dưới</div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleUnlockCandidate}
                disabled={isUnlocking}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isUnlocking ? 'Đang Mở Khóa...' : 'Xác Nhận Đã Chuyển Khoản & Mở Khóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CANDIDATE PROFILE DETAIL */}
      {selectedCandidateModal && !isUnlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-3">
                <img loading="lazy"
                  src={selectedCandidateModal.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={selectedCandidateModal.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border"
                />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {selectedCandidateModal.fullName}
                  </h3>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedCandidateModal.targetJobTitle}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedCandidateModal.projectName} • {selectedCandidateModal.currentAddress}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCandidateModal(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Lương kỳ vọng:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{selectedCandidateModal.expectedSalary}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Kinh nghiệm:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedCandidateModal.experienceLevel === 'above-5y' ? 'Trên 5 năm' : selectedCandidateModal.experienceLevel === '3-5y' ? '3 - 5 năm' : '1 - 3 năm'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Trạng thái:</span>
                <span className="font-bold text-emerald-600">Sẵn sàng nhận việc</span>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Giới Thiệu Bản Thân</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedCandidateModal.introduction}</p>
            </div>

            {/* Skills */}
            {selectedCandidateModal.skills && selectedCandidateModal.skills.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Kỹ Năng & Thế Mạnh</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidateModal.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work History */}
            {selectedCandidateModal.workExperience && selectedCandidateModal.workExperience.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Kinh Nghiệm Làm Việc</h4>
                <div className="space-y-2">
                  {selectedCandidateModal.workExperience.map((exp, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                      <div className="font-bold text-slate-900 dark:text-white">{exp.role} - <span className="text-emerald-600">{exp.company}</span></div>
                      <div className="text-[10px] text-slate-400">{exp.period}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information (Unlocked vs Locked) */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              (selectedCandidateModal as any).isUnlocked 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                : 'bg-slate-100 dark:bg-slate-800 border-dashed border-slate-300 dark:border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  {(selectedCandidateModal as any).isUnlocked ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-500" />}
                  {(selectedCandidateModal as any).isUnlocked ? 'Thông tin liên hệ đã mở khóa:' : 'Thông tin liên hệ (Bị che để bảo mật):'}
                </span>
                {!(selectedCandidateModal as any).isUnlocked && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">50.000đ / Lượt</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                <div>Số Điện Thoại: <strong>{selectedCandidateModal.phone}</strong></div>
                <div>Email: <strong>{selectedCandidateModal.email}</strong></div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedCandidateModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Đóng
              </button>

              {(selectedCandidateModal as any).isUnlocked ? (
                <a
                  href={`tel:${selectedCandidateModal.phone}`}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1"
                >
                  <Phone className="w-4 h-4" />
                  <span>Gọi Điện Cho Ứng Viên</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    setCandidateToUnlock(selectedCandidateModal);
                    setIsUnlockModalOpen(true);
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Mở Khóa CV (50.000đ)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
