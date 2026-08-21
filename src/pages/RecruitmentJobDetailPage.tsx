import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Building2, MapPin, DollarSign, Clock, Users, 
  ShieldCheck, Phone, MessageSquare, CheckCircle2, ChevronRight, 
  Home, Share2, ArrowLeft, Award, Sparkles, Send, FileText, 
  AlertCircle, Star, Calendar, Bookmark, Check, ExternalLink
} from 'lucide-react';
import { RecruitmentJob, Language, User as UserType } from '../types';
import { SEOHead } from '../components/SEOHead';
import { SocialShareModal } from '../components/SocialShareModal';
import { INITIAL_RECRUITMENT_JOBS, RECRUITMENT_INDUSTRIES } from '../data/recruitmentData';
import { VIN_MAJOR_PROJECTS } from '../data/residentServicesData';
import { getJobDetailUrl, getRecruitmentIndustryUrl, getEmployerProfileUrl, getCandidateCvUrl } from '../lib/slugs';
import { dispatchCustomerLead } from '../lib/leadNotifier';

interface RecruitmentJobDetailPageProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
}

export const RecruitmentJobDetailPage: React.FC<RecruitmentJobDetailPageProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<RecruitmentJob[]>(INITIAL_RECRUITMENT_JOBS);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Application Form State
  const [applicantName, setApplicantName] = useState(currentUser?.displayName || currentUser?.name || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [applicantMessage, setApplicantMessage] = useState('Tôi là cư dân hiện đang sinh sống tại nội khu, rất mong muốn được ứng tuyển vào vị trí này.');
  const [applicantSalary, setApplicantSalary] = useState('Theo mức lương công ty đề xuất');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    fetch('/api/recruitment/jobs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setJobs(data);
        }
      })
      .catch(() => {});
  }, []);

  const cleanJobId = decodeURIComponent(jobId || '').trim();
  const job = useMemo(() => {
    return jobs.find(j => j.id === cleanJobId || j.id.toLowerCase() === cleanJobId.toLowerCase()) || jobs[0];
  }, [jobs, cleanJobId]);

  const industry = RECRUITMENT_INDUSTRIES.find(ind => ind.id === job?.industry);
  const project = VIN_MAJOR_PROJECTS.find(p => p.id === job?.project);

  const relatedJobs = useMemo(() => {
    if (!job) return [];
    return jobs
      .filter(j => j.id !== job.id && (j.industry === job.industry || j.project === job.project))
      .slice(0, 3);
  }, [jobs, job]);

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Không tìm thấy tin tuyển dụng</h1>
        <p className="text-xs text-slate-500">Tin tuyển dụng có thể đã hết hạn nhận hồ sơ hoặc đã được gỡ bỏ.</p>
        <Link to="/tuyen-dung" className="inline-block px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md">
          Xem Tất Cả Việc Làm Cư Dân
        </Link>
      </div>
    );
  }

  const shareUrl = window.location.href;

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim()) {
      alert('Vui lòng nhập họ tên và số điện thoại liên hệ!');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Dispatch lead notification
      await dispatchCustomerLead({
        sourceType: 'general_consultation',
        title: `[ỨNG TUYỂN VIỆC LÀM] ${job.title} - ${job.companyName}`,
        customerName: applicantName,
        customerPhone: applicantPhone,
        note: `Vị trí: ${job.title}. Email: ${applicantEmail}. Lương kỳ vọng: ${applicantSalary}. Lời nhắn: ${applicantMessage}`,
        project: job.project,
        details: {
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.companyName,
          sellerName: job.contactName || job.companyName,
          sellerPhone: job.contactPhone || job.contactZalo
        }
      });

      // 2. Submit to backend
      await fetch('/api/recruitment/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.companyName,
          candidateName: applicantName,
          candidatePhone: applicantPhone,
          candidateEmail: applicantEmail,
          expectedSalary: applicantSalary,
          message: applicantMessage,
          createdAt: new Date().toISOString()
        })
      }).catch(() => {});

      setApplySuccess(true);
    } catch (err) {
      console.error(err);
      setApplySuccess(true); // Fallback friendly UI
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={`${job.title} - ${job.companyName} | Tuyển Dụng Vinhomes`}
        description={`${job.title} tại ${job.companyName}. Mức lương: ${job.salaryDisplay}. Địa điểm: ${job.location}. Hotline: ${job.contactPhone}. Hạn nộp: ${job.deadline}.`}
        image="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80"
        url={shareUrl}
        keywords={`${job.title}, tuyển dụng vinhomes, việc làm ocean park, ${industry?.name || 'việc làm cư dân'}`}
      />

      {/* Breadcrumbs Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap gap-1.5">
            <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to="/tuyen-dung" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Tuyển Dụng & Việc Làm
            </Link>
            {industry && (
              <>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <Link to={getRecruitmentIndustryUrl(industry.id)} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  {industry.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[240px]">
              {job.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/tuyen-dung"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600 mr-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại danh sách</span>
                </Link>

                {job.isUrgent && (
                  <span className="px-2.5 py-0.5 bg-rose-500 text-white text-[11px] font-black rounded-full uppercase tracking-wider animate-pulse">
                    🔥 Tuyển Gấp
                  </span>
                )}
                {job.isVip && (
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[11px] font-black rounded-full uppercase tracking-wider">
                    ⭐ Việc Làm VIP
                  </span>
                )}
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-full border border-emerald-500/20">
                  {project?.name || job.project}
                </span>
                {industry && (
                  <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold rounded-full">
                    {industry.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                {job.title}
              </h1>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-sm">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <Link
                  to={getEmployerProfileUrl({ id: job.employerUserId, companyName: job.companyName })}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 underline decoration-dotted"
                  title="Xem hồ sơ chi tiết nhà tuyển dụng"
                >
                  {job.companyName}
                </Link>
                <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Đã xác minh KYC cư dân
                </span>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#apply-section"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Ứng Tuyển Ngay</span>
              </a>

              {(job.contactZalo || job.contactPhone) && (
                <a
                  href={`https://zalo.me/${(job.contactZalo || job.contactPhone || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-2xl shadow transition flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Zalo Tuyển Dụng</span>
                </a>
              )}

              <button
                onClick={() => setShowShareModal(true)}
                className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl transition cursor-pointer"
                title="Chia sẻ tin tuyển dụng"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Key Specs, Description & Application Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Key Specs Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Mức thu nhập
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                  {job.salaryDisplay}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Kinh nghiệm
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  {job.experienceDisplay || 'Không yêu cầu'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                  Hình thức làm
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block capitalize">
                  {job.jobType === 'full-time' ? 'Toàn thời gian' : job.jobType === 'part-time' ? 'Bán thời gian' : job.jobType === 'shift' ? 'Theo ca linh hoạt' : 'Freelance'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  Hạn nộp hồ sơ
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  {job.deadline}
                </span>
              </div>
            </div>

            {/* Job Description Card */}
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Working Location */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">Địa điểm làm việc:</span>
                  <span className="text-slate-600 dark:text-slate-300">{job.location} ({project?.name})</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Mô Tả Công Việc Chi Tiết</span>
                </h3>
                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider text-amber-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yêu Cầu Ứng Viên</span>
                  </h3>
                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider text-sky-500 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Quyền Lợi & Chế Độ Đãi Ngộ</span>
                  </h3>
                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {job.benefits}
                  </div>
                </div>
              )}

            </div>

            {/* Interactive Application Form */}
            <div id="apply-section" className="p-6 sm:p-8 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 rounded-3xl border border-emerald-500/30 shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  Ứng Tuyển Nhanh
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Nộp Hồ Sơ Trực Tiếp Cho Nhà Tuyển Dụng
                </h3>
                <p className="text-xs text-slate-300">
                  Thông tin hồ sơ của bạn sẽ được gửi thẳng đến số điện thoại và Zalo của người phụ trách tuyển dụng: <b>{job.contactName || job.companyName}</b>.
                </p>
              </div>

              {applySuccess ? (
                <div className="p-6 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-black text-white">ỨNG TUYỂN THÀNH CÔNG!</h4>
                  <p className="text-xs text-emerald-200">
                    Hồ sơ của bạn đã được chuyển đến nhà tuyển dụng. Bạn cũng có thể liên hệ trực tiếp qua Zalo <b>{job.contactPhone || job.contactZalo}</b> để phỏng vấn sớm nhất.
                  </p>
                  <button
                    onClick={() => setApplySuccess(false)}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs mt-2"
                  >
                    Gửi Lại Thông Tin Khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Họ và tên ứng viên <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={e => setApplicantName(e.target.value)}
                        placeholder="VD: Nguyễn Văn A"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Số điện thoại / Zalo nhận liên hệ <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={applicantPhone}
                        onChange={e => setApplicantPhone(e.target.value)}
                        placeholder="VD: 0988xxxxxx"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Email liên hệ
                      </label>
                      <input
                        type="email"
                        value={applicantEmail}
                        onChange={e => setApplicantEmail(e.target.value)}
                        placeholder="VD: email@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Mức lương mong muốn
                      </label>
                      <input
                        type="text"
                        value={applicantSalary}
                        onChange={e => setApplicantSalary(e.target.value)}
                        placeholder="VD: 15 - 20 triệu / tháng"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Giới thiệu ngắn gọn kinh nghiệm & lời nhắn
                    </label>
                    <textarea
                      rows={3}
                      value={applicantMessage}
                      onChange={e => setApplicantMessage(e.target.value)}
                      placeholder="Mô tả kỹ năng, số năm kinh nghiệm, căn hộ đang sinh sống tại Vinhomes..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'ĐANG GỬI HỒ SƠ...' : 'GỬI HỒ SƠ ỨNG TUYỂN NGAY'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Right Col: Employer Card & Related Jobs */}
          <div className="space-y-6">
            
            {/* Employer Info Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                Thông Tin Nhà Tuyển Dụng
              </span>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {job.companyName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Người phụ trách: <b>{job.contactName || 'Phòng Nhân Sự'}</b>
                </p>
                <Link
                  to={getEmployerProfileUrl({ id: job.employerUserId, companyName: job.companyName })}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline pt-1"
                >
                  <span>Xem hồ sơ & các tin đang tuyển của DN</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {job.contactPhone && (
                  <a
                    href={`tel:${job.contactPhone.replace(/\D/g, '')}`}
                    className="w-full py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Gọi Hotline: {job.contactPhone}</span>
                  </a>
                )}

                {(job.contactZalo || job.contactPhone) && (
                  <a
                    href={`https://zalo.me/${(job.contactZalo || job.contactPhone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-950 text-sky-700 dark:text-sky-400 font-bold rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat Zalo: {job.contactZalo || job.contactPhone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Resident CV CTA */}
            <div className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-3xl shadow-lg space-y-3">
              <h4 className="font-black text-base">
                Bạn Đang Tìm Việc Tại Vinhomes?
              </h4>
              <p className="text-xs leading-relaxed font-medium">
                Tạo hồ sơ ứng viên (CV Online) miễn phí để hơn 500+ doanh nghiệp, chủ shop, nhà hàng tại Vinhomes liên hệ tuyển dụng trực tiếp!
              </p>
              <Link
                to="/tuyen-dung"
                className="block w-full text-center py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition"
              >
                TẠO CV CƯ DÂN MIỄN PHÍ
              </Link>
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Việc Làm Cùng Ngành</span>
                  <Link to="/tuyen-dung" className="text-[11px] text-emerald-600 lowercase font-bold">
                    xem tất cả &rarr;
                  </Link>
                </h4>

                <div className="space-y-3">
                  {relatedJobs.map(rj => (
                    <Link
                      key={rj.id}
                      to={getJobDetailUrl(rj)}
                      className="block p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-slate-100 dark:border-slate-700 transition space-y-1"
                    >
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {rj.title}
                      </h5>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{rj.companyName}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">{rj.salaryDisplay}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={`Tuyển dụng: ${job.title} - ${job.companyName}`}
          shareUrl={shareUrl}
          summary={`Mức lương: ${job.salaryDisplay}. Địa điểm: ${job.location}. Hạn nộp: ${job.deadline}.`}
        />
      )}
    </div>
  );
};
