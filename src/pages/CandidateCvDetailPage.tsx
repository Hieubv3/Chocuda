import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, GraduationCap, MapPin, DollarSign, Clock, 
  ShieldCheck, Phone, MessageSquare, CheckCircle2, ChevronRight, 
  Home, Share2, ArrowLeft, Award, Sparkles, Send, FileText, 
  Calendar, Star, Lock, Unlock, Mail, Check
} from 'lucide-react';
import { CandidateProfile, Language, User as UserType } from '../types';
import { SEOHead } from '../components/SEOHead';
import { SocialShareModal } from '../components/SocialShareModal';
import { INITIAL_CANDIDATE_PROFILES, RECRUITMENT_INDUSTRIES } from '../data/recruitmentData';
import { VIN_MAJOR_PROJECTS } from '../data/residentServicesData';
import { getCandidateCvUrl, getRecruitmentIndustryUrl } from '../lib/slugs';
import { dispatchCustomerLead } from '../lib/leadNotifier';

interface CandidateCvDetailPageProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
}

export const CandidateCvDetailPage: React.FC<CandidateCvDetailPageProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<CandidateProfile[]>(INITIAL_CANDIDATE_PROFILES);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Employer Message / Interview Invitation form state
  const [employerName, setEmployerName] = useState(currentUser?.displayName || currentUser?.name || '');
  const [employerPhone, setEmployerPhone] = useState(currentUser?.phone || '');
  const [employerCompany, setEmployerCompany] = useState('');
  const [jobTitleOffered, setJobTitleOffered] = useState('');
  const [inviteMessage, setInviteMessage] = useState('Chào bạn, công ty chúng tôi có vị trí công việc rất phù hợp với năng lực của bạn tại Vinhomes. Mời bạn trao đổi thêm thông tin.');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    const requesterParam = currentUser?.id ? `?requesterUserId=${encodeURIComponent(currentUser.id)}&isAdmin=${currentUser.role === 'admin'}` : '';
    fetch(`/api/recruitment/candidates${requesterParam}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCandidates(data);
        }
      })
      .catch(() => {});
  }, [currentUser?.id, currentUser?.role]);

  const cleanId = decodeURIComponent(candidateId || '').trim();
  const candidate = useMemo(() => {
    return candidates.find(c => c.id === cleanId || c.id.toLowerCase() === cleanId.toLowerCase()) || candidates[0];
  }, [candidates, cleanId]);

  const isUnlocked = useMemo(() => {
    if (!candidate) return false;
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.id && candidate.userId && currentUser.id === candidate.userId) return true;
    if (candidate.isUnlocked) return true;
    if (currentUser?.id && Array.isArray(candidate.unlockedByUserIds) && candidate.unlockedByUserIds.includes(currentUser.id)) return true;
    return false;
  }, [candidate, currentUser]);

  const maskedPhone = useMemo(() => {
    if (!candidate?.phone) return '098***321';
    if (candidate.phone.length >= 7) {
      return `${candidate.phone.substring(0, 3)}***${candidate.phone.substring(candidate.phone.length - 3)}`;
    }
    return '098***321';
  }, [candidate]);

  const maskedEmail = useMemo(() => {
    if (!candidate?.email) return 'cv***@chocudan24h.com';
    if (candidate.email.includes('@')) {
      const [u, d] = candidate.email.split('@');
      return `${u.substring(0, 2)}***@${d}`;
    }
    return 'cv***@chocudan24h.com';
  }, [candidate]);

  const handleUnlockCandidate = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn dùng 20.000 Token để mở khóa hồ sơ ứng viên "${candidate.fullName}"?`)) {
      return;
    }

    setIsUnlocking(true);
    try {
      const res = await fetch(`/api/recruitment/candidates/${candidate.id}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recruiterUserId: currentUser.id,
          recruiterName: currentUser.name || currentUser.email,
          recruiterPhone: currentUser.phone || '',
          amountVnd: candidate.unlockPriceVnd || 50000,
          paymentMethod: 'token_balance'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCandidates(prev => prev.map(c => c.id === candidate.id ? { 
          ...c, 
          isUnlocked: true,
          phone: data.candidate.phone,
          email: data.candidate.email,
          zalo: data.candidate.zalo,
          currentAddress: data.candidate.currentAddress,
          attachedCvUrl: data.candidate.attachedCvUrl
        } : c));
        alert(`🎉 ${data.message}`);
      } else {
        alert(`⚠️ ${data.error || 'Không thể mở khóa hồ sơ!'}`);
      }
    } catch (err) {
      alert('⚠️ Lỗi kết nối máy chủ khi mở khóa hồ sơ!');
    } finally {
      setIsUnlocking(false);
    }
  };

  const industry = RECRUITMENT_INDUSTRIES.find(ind => ind.id === candidate?.desiredIndustry);
  const project = VIN_MAJOR_PROJECTS.find(p => p.id === candidate?.desiredProject);

  const relatedCandidates = useMemo(() => {
    if (!candidate) return [];
    return candidates
      .filter(c => c.id !== candidate.id && (c.desiredIndustry === candidate.desiredIndustry || c.desiredProject === candidate.desiredProject))
      .slice(0, 3);
  }, [candidates, candidate]);

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Không tìm thấy hồ sơ ứng viên</h1>
        <p className="text-xs text-slate-500">Hồ sơ ứng viên có thể đã ẩn hoặc tìm được việc làm phù hợp.</p>
        <Link to="/tuyen-dung" className="inline-block px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md">
          Xem Danh Sách Ứng Viên Khác
        </Link>
      </div>
    );
  }

  const shareUrl = window.location.href;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerName.trim() || !employerPhone.trim()) {
      alert('Vui lòng nhập tên công ty / người tuyển dụng và số điện thoại liên hệ!');
      return;
    }

    setIsSendingInvite(true);
    try {
      await dispatchCustomerLead({
        sourceType: 'general_consultation',
        title: `[MỜI PHỎNG VẤN ỨNG VIÊN] ${candidate.fullName} - Vị trí: ${jobTitleOffered || candidate.desiredPosition}`,
        customerName: employerName,
        customerPhone: employerPhone,
        note: `Công ty: ${employerCompany}. Vị trí mời: ${jobTitleOffered}. Lời nhắn: ${inviteMessage}`,
        project: candidate.desiredProject,
        details: {
          candidateName: candidate.fullName,
          candidatePhone: candidate.phone || candidate.zalo || '',
          employerCompany,
          jobTitleOffered
        }
      });

      setInviteSuccess(true);
    } catch (err) {
      console.error(err);
      setInviteSuccess(true);
    } finally {
      setIsSendingInvite(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <SEOHead
        title={`CV: ${candidate.fullName} - ${candidate.desiredPosition} | Ứng Viên Vinhomes`}
        description={`Hồ sơ ứng viên ${candidate.fullName}. Vị trí mong muốn: ${candidate.desiredPosition}. Kinh nghiệm: ${candidate.experienceDisplay}. Khu vực: ${project?.name || candidate.desiredProject}. Mức lương: ${candidate.expectedSalaryDisplay}.`}
        image={candidate.avatar || ''}
        url={shareUrl}
        keywords={`${candidate.fullName}, CV ${candidate.desiredPosition}, ứng viên vinhomes, tìm việc làm ocean park`}
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
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Hồ sơ ứng viên</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[240px]">
              {candidate.fullName}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Candidate Identity */}
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-md shrink-0 bg-slate-100 dark:bg-slate-800">
                <img loading="lazy"
                  src={candidate.avatar || ''}
                  alt={candidate.fullName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-black text-center py-0.5 uppercase">
                  Cư Dân
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Đã xác minh KYC Cư Dân
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold rounded-full">
                    {project?.name || candidate.desiredProject}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {candidate.fullName}
                </h1>

                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>Vị trí mong muốn: {candidate.desiredPosition}</span>
                </p>

                {candidate.residentRoom && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Căn hộ: {candidate.residentRoom}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Connect Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#invite-section"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Mời Phỏng Vấn Ngay</span>
              </a>

              {(candidate.zalo || candidate.phone) && (
                <a
                  href={`https://zalo.me/${(candidate.zalo || candidate.phone || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-2xl shadow transition flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Zalo Trực Tiếp</span>
                </a>
              )}

              <button
                onClick={() => setShowShareModal(true)}
                className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl transition cursor-pointer"
                title="Chia sẻ hồ sơ"
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
          
          {/* Left 2 Cols: CV Bio, Skills, Experience & Education */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Highlights Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Mức lương kỳ vọng
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                  {candidate.expectedSalaryDisplay || 'Thỏa thuận'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Kinh nghiệm
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  {candidate.experienceDisplay || 'Có kinh nghiệm'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                  Ngành nghề
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  {industry?.name || 'Đa ngành'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Địa điểm mong muốn
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block truncate">
                  {project?.name || candidate.desiredProject}
                </span>
              </div>
            </div>

            {/* Bio & Intro Summary */}
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Giới Thiệu Bản Thân & Mục Tiêu Nghề Nghiệp</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {candidate.bio || 'Ứng viên năng động, trách nhiệm, hiện đang sinh sống tại đại đô thị Vinhomes, mong muốn tìm kiếm công việc gắn bó lâu dài gần nơi ở.'}
              </p>
            </div>

            {/* Skills & Certificates */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider text-amber-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Kỹ Năng Chuyên Môn & Thế Mạnh</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experiences */}
            {candidate.workExperience && candidate.workExperience.length > 0 && (
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider text-sky-500 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Lịch Sử Kinh Nghiệm Làm Việc</span>
                </h3>

                <div className="space-y-4">
                  {candidate.workExperience.map((exp, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {exp.position}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            {exp.company}
                          </p>
                        </div>
                        <span className="text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-lg">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {candidate.education && candidate.education.length > 0 && (
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider text-purple-500 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Học Vấn & Bằng Cấp</span>
                </h3>

                <div className="space-y-3">
                  {candidate.education.map((edu, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-start justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{edu.major}</h4>
                        <p className="text-slate-500 dark:text-slate-400">{edu.school}</p>
                      </div>
                      <span className="text-slate-500 font-bold">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Invitation Form */}
            <div id="invite-section" className="p-6 sm:p-8 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 rounded-3xl border border-emerald-500/30 shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  Dành Cho Nhà Tuyển Dụng
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Gửi Lời Mời Phỏng Vấn Đến {candidate.fullName}
                </h3>
                <p className="text-xs text-slate-300">
                  Thông điệp tuyển dụng của bạn sẽ được gửi thẳng đến số điện thoại và Zalo của ứng viên để hẹn lịch phỏng vấn nhanh nhất.
                </p>
              </div>

              {inviteSuccess ? (
                <div className="p-6 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-black text-white">ĐÃ GỬI LỜI MỜI THÀNH CÔNG!</h4>
                  <p className="text-xs text-emerald-200">
                    Ứng viên đã nhận được thông báo. Bạn cũng có thể liên hệ trực tiếp qua Zalo / Số điện thoại <b>{candidate.phone || candidate.zalo || 'của ứng viên'}</b>.
                  </p>
                  <button
                    onClick={() => setInviteSuccess(false)}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs mt-2"
                  >
                    Gửi Lại Lời Mời Khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Tên nhà tuyển dụng / Người đại diện <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={employerName}
                        onChange={e => setEmployerName(e.target.value)}
                        placeholder="VD: Anh Minh - Giám Đốc"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Số điện thoại / Zalo tuyển dụng <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={employerPhone}
                        onChange={e => setEmployerPhone(e.target.value)}
                        placeholder="VD: 0988xxxxxx"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Tên công ty / Cửa hàng / Đơn vị
                      </label>
                      <input
                        type="text"
                        value={employerCompany}
                        onChange={e => setEmployerCompany(e.target.value)}
                        placeholder="VD: Công ty BĐS Vinhomes / Shop Hoa S2.05"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Vị trí công việc đang tuyển
                      </label>
                      <input
                        type="text"
                        value={jobTitleOffered}
                        onChange={e => setJobTitleOffered(e.target.value)}
                        placeholder="VD: Chuyên viên kinh doanh / Nhân viên thu ngân"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Nội dung thư mời phỏng vấn & chế độ đãi ngộ
                    </label>
                    <textarea
                      rows={3}
                      value={inviteMessage}
                      onChange={e => setInviteMessage(e.target.value)}
                      placeholder="Mô tả mức thu nhập, thời gian phỏng vấn, địa chỉ làm việc..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingInvite}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSendingInvite ? 'ĐANG GỬI THƯ MỜI...' : 'GỬI LỜI MỜI PHỎNG VẤN TRỰC TIẾP'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Right Col: Candidate Contact & Related Candidates */}
          <div className="space-y-6">
            
            {/* Direct Contact Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                  isUnlocked ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {isUnlocked ? 'Thông Tin Đã Mở Khóa' : 'Thông Tin Liên Hệ (Bảo Mật)'}
                </span>
                {isUnlocked ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Unlock className="w-3.5 h-3.5" />
                    Đã mở khóa
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <Lock className="w-3.5 h-3.5" />
                    Chỉ Nhà Tuyển Dụng
                  </span>
                )}
              </div>

              {isUnlocked ? (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Số điện thoại liên hệ:</div>
                    <div className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono tracking-wider">
                      {candidate.phone}
                    </div>
                    {candidate.email && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                        Email: <span className="font-bold">{candidate.email}</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={`tel:${candidate.phone}`}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Gọi Điện: {candidate.phone}</span>
                  </a>

                  <a
                    href={`https://zalo.me/${candidate.zalo || candidate.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat Zalo Tuyển Dụng</span>
                  </a>

                  {candidate.attachedCvUrl && (
                    <a
                      href={candidate.attachedCvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow transition text-[11px]"
                    >
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Xem / Tải File CV Đính Kèm</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono">
                      <span>SĐT:</span>
                      <span className="font-bold">{maskedPhone}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono">
                      <span>Email:</span>
                      <span className="font-bold">{maskedEmail}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono">
                      <span>Zalo:</span>
                      <span className="font-bold">🔒 Đã ẩn số</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    ⚠️ Để bảo mật thông tin cá nhân của cư dân, chỉ tài khoản <b>Nhà Tuyển Dụng</b> đã đăng ký hoặc sử dụng <b>Token Cư Dân</b> mới có quyền mở khóa xem đầy đủ số điện thoại và liên hệ trực tiếp.
                  </p>

                  <button
                    onClick={handleUnlockCandidate}
                    disabled={isUnlocking}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>{isUnlocking ? 'Đang Xử Lý Mở Khóa...' : 'MỞ KHÓA CV (20.000 TOKEN)'}</span>
                  </button>

                  {!currentUser && (
                    <button
                      onClick={onOpenAuth}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[11px] transition text-center"
                    >
                      Đăng Nhập / Đăng Ký Nhà Tuyển Dụng
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Post Job CTA */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl space-y-3">
              <h4 className="font-black text-base">
                Doanh Nghiệp Cần Đăng Tin Tuyển Dụng?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Đăng tin tuyển dụng hoàn toàn miễn phí tiếp cận ngay hàng ngàn cư dân tài năng tại Vinhomes Ocean Park 1, 2, 3 và các đại đô thị.
              </p>
              <Link
                to="/tuyen-dung"
                className="block w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition"
              >
                ĐĂNG TIN TUYỂN DỤNG MIỄN PHÍ
              </Link>
            </div>

            {/* Related Candidates */}
            {relatedCandidates.length > 0 && (
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Ứng Viên Cùng Khu Vực</span>
                  <Link to="/tuyen-dung" className="text-[11px] text-emerald-600 lowercase font-bold">
                    xem tất cả &rarr;
                  </Link>
                </h4>

                <div className="space-y-3">
                  {relatedCandidates.map(rc => (
                    <Link
                      key={rc.id}
                      to={getCandidateCvUrl(rc)}
                      className="block p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-slate-100 dark:border-slate-700 transition space-y-1"
                    >
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {rc.fullName}
                      </h5>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[140px]">{rc.desiredPosition}</span>
                        <span className="text-slate-500">{rc.experienceDisplay || 'Kinh nghiệm'}</span>
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
          title={`Hồ sơ ứng viên: ${candidate.fullName} - ${candidate.desiredPosition}`}
          shareUrl={shareUrl}
          summary={`Vị trí: ${candidate.desiredPosition}. Mức lương kỳ vọng: ${candidate.expectedSalaryDisplay}. Khu vực: ${project?.name || candidate.desiredProject}.`}
        />
      )}
    </div>
  );
};
