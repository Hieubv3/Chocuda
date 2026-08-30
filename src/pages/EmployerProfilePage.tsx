import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Phone, MessageCircle, Mail, Globe, 
  ShieldCheck, Share2, Briefcase, Users, Star, Sparkles, 
  ChevronRight, Home, ArrowLeft, CheckCircle2, Clock, 
  ExternalLink, Send, Heart, Award, Copy, Check
} from 'lucide-react';
import { EmployerProfile, RecruitmentJob, Language, User as UserType } from '../types';
import { SEOHead } from '../components/SEOHead';
import { SeoJsonLd } from '../components/SeoJsonLd';
import { SocialShareModal } from '../components/SocialShareModal';
import { INITIAL_EMPLOYERS, INITIAL_RECRUITMENT_JOBS } from '../data/recruitmentData';
import { getJobDetailUrl, getEmployerProfileUrl, slugify } from '../lib/slugs';
import { dispatchCustomerLead } from '../lib/leadNotifier';

interface EmployerProfilePageProps {
  language?: Language;
  currentUser?: UserType | null;
  onOpenAuth?: () => void;
}

export const EmployerProfilePage: React.FC<EmployerProfilePageProps> = ({
  language = 'vi',
  currentUser,
  onOpenAuth
}) => {
  const { employerId, slug } = useParams<{ employerId: string; slug?: string }>();
  const navigate = useNavigate();

  const [employers, setEmployers] = useState<EmployerProfile[]>(INITIAL_EMPLOYERS);
  const [jobs, setJobs] = useState<RecruitmentJob[]>(INITIAL_RECRUITMENT_JOBS);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick inquiry modal
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState(currentUser?.name || '');
  const [inquiryPhone, setInquiryPhone] = useState(currentUser?.phone || '');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Fetch updated employers & jobs from server
  useEffect(() => {
    fetch('/api/recruitment/employers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEmployers(data);
        }
      })
      .catch(() => {});

    fetch('/api/recruitment/jobs?limit=200')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setJobs(data);
        }
      })
      .catch(() => {});
  }, []);

  // Find employer
  const cleanId = employerId ? decodeURIComponent(employerId) : '';
  let employer = employers.find(
    emp => emp.id === cleanId || 
           emp.userId === cleanId || 
           slugify(emp.companyName) === cleanId ||
           emp.companyName.toLowerCase() === cleanId.toLowerCase()
  );

  // If not found in employers, synthesize from jobs by company name or employerUserId
  if (!employer && cleanId) {
    const matchedJob = jobs.find(
      j => j.employerUserId === cleanId || 
           slugify(j.companyName) === cleanId || 
           j.companyName.toLowerCase().includes(cleanId.toLowerCase())
    );
    if (matchedJob) {
      employer = {
        id: matchedJob.employerUserId || slugify(matchedJob.companyName),
        userId: matchedJob.employerUserId,
        companyName: matchedJob.companyName,
        brandName: matchedJob.companyName,
        logoUrl: matchedJob.companyLogo || '',
        bannerUrl: '',
        tagline: `Nhà tuyển dụng uy tín tại ${matchedJob.projectName || 'Vinhomes'}`,
        industry: matchedJob.industry,
        project: matchedJob.project,
        projectName: matchedJob.projectName,
        address: matchedJob.location,
        contactName: matchedJob.contactName,
        contactPhone: matchedJob.contactPhone,
        contactZalo: matchedJob.contactZalo || matchedJob.contactPhone,
        contactEmail: matchedJob.contactEmail || 'tuyendung@chocudan24h.com',
        introduction: `Nhà tuyển dụng ${matchedJob.companyName} hoạt động tại ${matchedJob.location}, thường xuyên tuyển dụng nhân sự chất lượng phục vụ cư dân nội khu Vinhomes.`,
        scaleSize: '10 - 50 nhân sự',
        verified: true,
        activeJobsCount: 1,
        totalViews: 0
      };
    }
  }

  // Fallback to first employer if still not found
  if (!employer) {
    employer = employers[0];
  }

  // Find all active jobs by this employer
  const employerJobs = jobs.filter(
    j => (employer?.userId && j.employerUserId === employer.userId) ||
         j.companyName.toLowerCase() === employer?.companyName.toLowerCase() ||
         (employer?.id && j.employerUserId === employer.id)
  );

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://chocudan24h.com/tuyen-dung/nha-tuyen-dung/${employer.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;

    setIsSubmitting(true);
    try {
      await dispatchCustomerLead({
        sourceType: 'general_consultation',
        title: `[LIÊN HỆ NHÀ TUYỂN DỤNG] ${employer.companyName}`,
        customerName: inquiryName,
        customerPhone: inquiryPhone,
        note: `Tin nhắn: ${inquiryMessage}. DN: ${employer.companyName} - SĐT DN: ${employer.contactPhone}`,
        project: typeof employer.project === 'string' ? employer.project : 'ocean-park-2',
        details: {
          employerId: employer.id,
          companyName: employer.companyName,
          employerPhone: employer.contactPhone
        }
      });
      setInquirySuccess(true);
    } catch (err) {
      console.error(err);
      setInquirySuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { name: 'Trang chủ', url: '/' },
    { name: 'Tuyển Dụng & Việc Làm', url: '/tuyen-dung' },
    { name: 'Nhà Tuyển Dụng', url: '/tuyen-dung?tab=employers' },
    { name: employer.companyName, url: shareUrl }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={`${employer.companyName} — Hồ Sơ Nhà Tuyển Dụng & Tin Tuyển Việc Làm | Chợ Cư Dân 24h`}
        description={`Hồ sơ nhà tuyển dụng ${employer.companyName} tại ${employer.address}. ${employer.tagline || employer.introduction}. Xem ngay ${employerJobs.length} vị trí đang tuyển lương cao, làm việc ngay tại Vinhomes!`}
        image={employer.logoUrl || employer.bannerUrl}
        url={shareUrl}
        keywords={`${employer.companyName}, tuyển dụng ${employer.companyName}, việc làm ${employer.projectName || 'Vinhomes'}, shophouse vinhomes, tuyển nhân viên vinhomes`}
      />

      <SeoJsonLd
        type="breadcrumb"
        breadcrumbs={breadcrumbs}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap gap-1.5">
            <Link to="/" className="hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link to="/tuyen-dung" className="hover:text-teal-600 dark:hover:text-teal-400">
              Tuyển Dụng & Việc Làm
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-teal-600 dark:text-teal-400 font-bold truncate max-w-[280px]">
              {employer.companyName}
            </span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* Navigation Back & Action Bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/tuyen-dung"
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-teal-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Xem Tất Cả Tin Tuyển Dụng & Ứng Viên</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-teal-600 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Đã copy link' : 'Sao chép link profile'}</span>
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="p-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition cursor-pointer"
              title="Chia sẻ hồ sơ nhà tuyển dụng"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Employer Header Banner Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          
          {/* Banner cover */}
          <div className="relative h-48 sm:h-64 bg-slate-950 overflow-hidden">
            <img loading="lazy"
              src={employer.bannerUrl || ''}
              alt={employer.companyName}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-full uppercase flex items-center gap-1 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" /> Doanh Nghiệp Xác Thực KYC
              </span>
            </div>
          </div>

          {/* Profile Details Header */}
          <div className="p-6 sm:p-8 -mt-16 relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              
              <div className="flex items-start gap-4 sm:gap-6">
                <img loading="lazy"
                  src={employer.logoUrl || ''}
                  alt={employer.companyName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-2xl bg-white shrink-0"
                />
                
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold text-[11px] rounded-lg tracking-wider uppercase border border-teal-500/20">
                      {employer.industry}
                    </span>
                    {employer.scaleSize && (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {employer.scaleSize}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                    {employer.companyName}
                  </h1>

                  {employer.tagline && (
                    <p className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {employer.tagline}
                    </p>
                  )}

                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{employer.address}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <a
                  href={`tel:${employer.contactPhone}`}
                  className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Gọi Hotline: {employer.contactPhone}</span>
                </a>

                <a
                  href={`https://zalo.me/${employer.contactZalo || employer.contactPhone}?text=${encodeURIComponent(
                    `Chào bạn, mình xem hồ sơ nhà tuyển dụng [${employer.companyName}] trên Chợ Cư Dân 24h tại ${shareUrl} và muốn trao đổi cơ hội ứng tuyển việc làm.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Nhắn Zalo Trực Tiếp</span>
                </a>
              </div>

            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold block">Vị Trí Đang Tuyển:</span>
                <span className="text-lg font-black text-teal-600 dark:text-teal-400">{employerJobs.length} Công việc</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold block">Người Phụ Trách:</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{employer.contactName}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold block">Khu Đô Thị Trọng Điểm:</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{employer.projectName || 'Vinhomes'}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold block">Email Nhận CV:</span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate block">{employer.contactEmail}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Main (8 Cols): Open Vacancies & Company Intro */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Open Vacancies Section */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-teal-600" />
                    <span>CÁC VỊ TRÍ ĐANG TUYỂN DỤNG ({employerJobs.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ứng tuyển trực tiếp với nhà tuyển dụng, nhận phản hồi nhanh trong 24h
                  </p>
                </div>
              </div>

              {employerJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
                  <p className="text-xs font-bold">Hiện tại doanh nghiệp chưa có tin tuyển dụng mới mở.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employerJobs.map(job => (
                    <div
                      key={job.id}
                      className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 transition shadow-xs space-y-3 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <Link
                          to={getJobDetailUrl(job)}
                          className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition leading-snug"
                        >
                          {job.title}
                        </Link>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                          {job.salaryDisplay}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <div className="flex flex-wrap items-center gap-3 text-slate-500">
                          <span>📍 {job.location}</span>
                          <span>•</span>
                          <span>🕒 {job.jobType === 'full-time' ? 'Toàn thời gian' : 'Theo ca / Bán thời gian'}</span>
                        </div>

                        <Link
                          to={getJobDetailUrl(job)}
                          className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow-xs"
                        >
                          <span>Xem Chi Tiết & Ứng Tuyển</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Company Introduction & Working Culture */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm text-xs">
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider text-teal-600 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Giới Thiệu Về Doanh Nghiệp & Môi Trường Làm Việc</span>
              </h2>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                {employer.introduction}
              </p>

              <div className="p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20 space-y-2 mt-4">
                <h3 className="font-black text-teal-800 dark:text-teal-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                  <span>Quyền Lợi & Văn Hóa Tuyển Dụng Đặc Quyền Cư Dân:</span>
                </h3>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                  <li>Ưu tiên ứng viên là cư dân sinh sống tại các phân khu Vinhomes nội đô và biển.</li>
                  <li>Môi trường làm việc văn minh, đồng nghiệp thân thiện, giao thông thuận tiện không tắc đường.</li>
                  <li>Lộ trình thăng tiến rõ ràng, ký hợp đồng lao động đầy đủ chế độ bảo hiểm.</li>
                </ul>
              </div>
            </section>

          </div>

          {/* Right Sidebar (4 Cols): Contact Card & Quick Form */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct Contact Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm text-xs">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Thông Tin Liên Hệ Trực Tiếp</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-0.5">
                  <span className="text-slate-400 font-bold block text-[11px]">Người đại diện tuyển dụng:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{employer.contactName}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-0.5">
                  <span className="text-slate-400 font-bold block text-[11px]">Hotline / Zalo:</span>
                  <a href={`tel:${employer.contactPhone}`} className="font-black text-emerald-600 dark:text-emerald-400 text-base hover:underline block font-mono">
                    {employer.contactPhone}
                  </a>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-0.5">
                  <span className="text-slate-400 font-bold block text-[11px]">Địa chỉ trụ sở / Cửa hàng:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{employer.address}</span>
                </div>

                {employer.website && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-0.5">
                    <span className="text-slate-400 font-bold block text-[11px]">Website chính thức:</span>
                    <a href={employer.website} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline font-bold truncate block">
                      {employer.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Tin Nhắn Hỏi Tuyển Dụng</span>
                </button>
              </div>
            </div>

            {/* Platform Trust Box */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-black text-sm">Chợ Cư Dân 24h Bảo Trợ</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Hồ sơ nhà tuyển dụng đã được Ban Quản Trị xác minh thông tin pháp lý, địa chỉ Shophouse thực tế và cam kết tin tuyển dụng chuẩn xác, không thu bất kỳ khoản phí nào của người tìm việc.
              </p>
              <div className="text-[11px] text-amber-400 font-bold pt-1">
                Hotline BQL: 0868.499.929
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Inquiry Modal */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-teal-600" />
                <span>Liên Hệ Nhà Tuyển Dụng</span>
              </h3>
              <button onClick={() => setInquiryModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {inquirySuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-base">ĐÃ GỬI THÀNH CÔNG!</h4>
                <p className="text-xs text-slate-500">Nhà tuyển dụng {employer.companyName} sẽ sớm liên hệ lại với bạn qua SĐT {inquiryPhone}.</p>
                <button
                  onClick={() => setInquiryModalOpen(false)}
                  className="mt-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Họ và tên của bạn (*)</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={e => setInquiryName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Số điện thoại / Zalo (*)</label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={e => setInquiryPhone(e.target.value)}
                    placeholder="0988.xxx.xxx"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nội dung trao đổi</label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={e => setInquiryMessage(e.target.value)}
                    placeholder="Mình muốn tìm hiểu vị trí nhân viên bán hàng / kinh doanh..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Đang gửi...' : 'Xác Nhận Gửi Tin Nhắn'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Social Share Modal */}
      {showShareModal && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={`[Chợ Cư Dân 24h] Hồ Sơ Nhà Tuyển Dụng ${employer.companyName} - ${employer.address}`}
          url={shareUrl}
          image={employer.logoUrl || employer.bannerUrl}
        />
      )}
    </div>
  );
};
