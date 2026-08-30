import React, { useState, useEffect } from 'react';
import { User, CandidateProfile, JobApplication } from '../types';
import { RECRUITMENT_INDUSTRIES } from '../data/recruitmentData';
import { 
  Briefcase, UserCheck, FileText, Plus, Edit, Trash2, CheckCircle2, 
  Clock, Shield, Award, MapPin, DollarSign, Phone, Mail, Sparkles, 
  Eye, ToggleLeft, ToggleRight, AlertCircle, RefreshCw, Send, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const VIN_MAJOR_PROJECTS = [
  { id: 'ocean-park-1', name: 'Vinhomes Ocean Park 1 (Gia Lâm)' },
  { id: 'ocean-park-2', name: 'Vinhomes Ocean Park 2 (The Empire)' },
  { id: 'ocean-park-3', name: 'Vinhomes Ocean Park 3 (The Crown)' },
  { id: 'smart-city', name: 'Vinhomes Smart City (Tây Mỗ)' },
  { id: 'grand-park', name: 'Vinhomes Grand Park (TP. Thủ Đức)' }
];

interface UserCvManagementProps {
  currentUser: User;
  onRefresh?: () => void;
}

export const UserCvManagement: React.FC<UserCvManagementProps> = ({
  currentUser,
  onRefresh
}) => {
  const [cvProfile, setCvProfile] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for creating/editing CV
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({
    fullName: currentUser.name || currentUser.displayName || '',
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    zalo: currentUser.phone || '',
    avatarUrl: currentUser.avatar || '',
    birthYear: 1998,
    gender: 'nam',
    currentProject: 'ocean-park-2',
    projectName: 'Vinhomes Ocean Park 2',
    currentAddress: 'Phân khu San Hô, Vinhomes Ocean Park 2',
    targetJobTitle: 'Nhân viên kinh doanh BĐS / Quản lý cửa hàng',
    primaryIndustry: 'bds-moi-gioi',
    subIndustries: ['fb-fnb', 'dich-vu-cu-dan'],
    workTypePreference: ['full-time', 'part-time'],
    expectedSalary: '12 - 18 Triệu/tháng',
    experienceLevel: '1-3y',
    yearsOfExp: 2,
    introduction: 'Cư dân sinh sống tại nội khu đô thị, năng động, nhiệt tình, có kinh nghiệm giao tiếp và phục vụ khách hàng chu đáo.',
    skills: ['Giao tiếp đàm phán', 'Hiểu rõ nội khu Vinhomes', 'Tin học văn phòng', 'Chăm sóc khách hàng'],
    workExperience: [
      {
        id: 'exp-1',
        companyName: 'Đại lý BĐS Đất Vàng Vinhomes',
        position: 'Chuyên viên tư vấn căn hộ',
        startDate: '01/2023',
        endDate: 'Hiện tại',
        description: 'Tư vấn mua bán, chuyển nhượng và cho thuê căn hộ, shophouse Ocean Park 1, 2, 3.'
      }
    ],
    education: [
      {
        id: 'edu-1',
        schoolName: 'Đại học Kinh Tế Quốc Dân',
        major: 'Quản trị kinh doanh',
        graduationYear: 2020
      }
    ],
    certificates: ['Chứng chỉ Môi giới BĐS', 'Chứng chỉ Tin học MOS'],
    attachedCvUrl: '',
    isLookingForJob: true,
    isImmediate: true,
    unlockPriceVnd: 20000
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch User CV Profile
      const resCv = await fetch(`/api/recruitment/my-cv?userId=${currentUser.id}`);
      if (resCv.ok) {
        const dataCv = await resCv.json();
        setCvProfile(dataCv);
        setFormData(dataCv);
      } else {
        // Search by phone if not found by user id
        const resAll = await fetch(`/api/recruitment/candidates?userId=${currentUser.id}&isAdmin=true`);
        if (resAll.ok) {
          const list = await resAll.json();
          if (Array.isArray(list) && list.length > 0) {
            setCvProfile(list[0]);
            setFormData(list[0]);
          }
        }
      }

      // 2. Fetch Job Applications submitted by this user
      const resApps = await fetch(`/api/recruitment/applications?candidatePhone=${currentUser.phone || ''}`);
      if (resApps.ok) {
        const dataApps = await resApps.json();
        setApplications(Array.isArray(dataApps) ? dataApps : []);
      }
    } catch (e) {
      console.error('Error fetching CV info:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const handleToggleSeeking = async () => {
    if (!cvProfile) return;
    try {
      const res = await fetch(`/api/recruitment/candidates/${cvProfile.id}/toggle-seeking`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setCvProfile(prev => prev ? { ...prev, isLookingForJob: data.isLookingForJob } : null);
        alert(data.message || 'Đã cập nhật trạng thái tìm việc!');
      }
    } catch (e) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleDeleteCv = async () => {
    if (!cvProfile) return;
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ CV này? Nhà tuyển dụng sẽ không thể tìm thấy bạn nữa.')) return;
    
    try {
      const res = await fetch(`/api/recruitment/candidates/${cvProfile.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Đã xóa hồ sơ CV thành công!');
        setCvProfile(null);
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      alert('Lỗi khi xóa hồ sơ');
    }
  };

  const handleSaveCv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.targetJobTitle || !formData.primaryIndustry) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại, Vị trí ứng tuyển và Ngành nghề chính!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        id: cvProfile?.id,
        userId: currentUser.id
      };

      const res = await fetch('/api/recruitment/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (res.ok) {
        alert(resData.message || '🎉 Lưu hồ sơ CV trực tuyến thành công!');
        setCvProfile(resData.candidate);
        setShowEditModal(false);
        if (onRefresh) onRefresh();
      } else {
        alert(resData.error || 'Có lỗi xảy ra khi lưu hồ sơ');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 p-5 sm:p-6 rounded-3xl border border-teal-500/30 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-teal-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                HỒ SƠ CV CƯ DÂN 24H
              </span>
              {cvProfile?.isLookingForJob ? (
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Đang Tìm Việc & Mở Liên Hệ
                </span>
              ) : cvProfile ? (
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-full">
                  Tạm Dừng Tìm Việc
                </span>
              ) : null}
            </div>
            <h2 className="text-xl font-black text-teal-300">
              QUẢN LÝ HỒ SƠ CV & CƠ HỘI VIỆC LÀM NỘI KHU
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Hồ sơ CV của bạn được bảo mật thông tin liên hệ. Chỉ các Nhà tuyển dụng nội khu đã xác thực mới có thể xem số điện thoại và mời phỏng vấn.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {cvProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Chỉnh Sửa CV</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setFormData({
                    fullName: currentUser.name || currentUser.displayName || '',
                    phone: currentUser.phone || '',
                    email: currentUser.email || '',
                    zalo: currentUser.phone || '',
                    targetJobTitle: '',
                    primaryIndustry: 'bds-moi-gioi',
                    expectedSalary: 'Thỏa thuận',
                    experienceLevel: '1-3y',
                    yearsOfExp: 1,
                    introduction: '',
                    skills: ['Nhiệt tình', 'Chăm chỉ', 'Giao tiếp tốt'],
                    isLookingForJob: true,
                    isImmediate: true,
                    currentProject: 'ocean-park-2',
                    projectName: 'Vinhomes Ocean Park 2'
                  });
                  setShowEditModal(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tạo Hồ Sơ CV Mới</span>
              </button>
            )}

            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* CV Profile Overview Card */}
      {cvProfile ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <img loading="lazy"
                src={cvProfile.avatarUrl || currentUser.avatar || ''}
                alt={cvProfile.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500/40 shadow-sm"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {cvProfile.fullName}
                  </h3>
                  <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-[10px] font-black rounded-md">
                    {cvProfile.birthYear} ({new Date().getFullYear() - cvProfile.birthYear} tuổi)
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md">
                    {cvProfile.gender === 'nam' ? 'Nam' : cvProfile.gender === 'nu' ? 'Nữ' : 'Khác'}
                  </span>
                </div>
                <div className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  {cvProfile.targetJobTitle}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-500" />
                    {cvProfile.projectName || 'Vinhomes Ocean Park'}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                    {cvProfile.expectedSalary}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    {cvProfile.yearsOfExp > 0 ? `${cvProfile.yearsOfExp} năm kinh nghiệm` : 'Mới tốt nghiệp / Chưa có kinh nghiệm'}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
              <button
                onClick={handleToggleSeeking}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  cvProfile.isLookingForJob
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {cvProfile.isLookingForJob ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                <span>{cvProfile.isLookingForJob ? 'Đang Tìm Việc (Bật)' : 'Tạm Dừng Tìm Việc'}</span>
              </button>

              <Link
                to={`/ung-vien/${cvProfile.id}`}
                target="_blank"
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Trang Công Khai</span>
              </Link>

              <button
                onClick={handleDeleteCv}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                title="Xóa hồ sơ CV"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Column 1: Contact & Intro */}
            <div className="space-y-4">
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-teal-600 dark:text-teal-400">
                Thông Tin Liên Hệ (Bảo Mật)
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Số Điện Thoại:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{cvProfile.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Zalo:</span>
                  <span className="font-bold text-teal-600">{cvProfile.zalo || cvProfile.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[160px]">{cvProfile.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Địa chỉ hiện tại:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-right">{cvProfile.currentAddress || 'Nội khu Vinhomes'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-teal-600 dark:text-teal-400 mb-2">
                  Giới Thiệu Bản Thân
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                  {cvProfile.introduction || 'Chưa cập nhật phần giới thiệu.'}
                </p>
              </div>
            </div>

            {/* Column 2: Skills & Work Experience */}
            <div className="space-y-4 md:col-span-2">
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-teal-600 dark:text-teal-400">
                Kỹ Năng & Kinh Nghiệm Làm Việc
              </h4>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5">
                {(cvProfile.skills || []).map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold rounded-lg border border-teal-200 dark:border-teal-800/60">
                    ✓ {skill}
                  </span>
                ))}
              </div>

              {/* Work Experience */}
              <div className="space-y-2.5">
                <span className="text-slate-500 font-bold block text-[11px]">Lịch Sử Công Tác:</span>
                {(cvProfile.workExperience && cvProfile.workExperience.length > 0) ? (
                  cvProfile.workExperience.map((exp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 dark:text-white text-xs">{exp.position}</span>
                        <span className="text-[10px] text-teal-600 font-bold">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <div className="text-teal-600 dark:text-teal-400 font-semibold">{exp.companyName}</div>
                      {exp.description && <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">{exp.description}</p>}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                    Chưa có kinh nghiệm làm việc nào được ghi nhận.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-950/60 text-teal-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
            📄
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Bạn chưa tạo Hồ Sơ CV Trực Tuyến
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Hãy tạo hồ sơ ứng viên ngay hôm nay để được các nhà hàng, cửa hàng, siêu thị, đại lý BĐS nội khu Vinhomes chủ động liên hệ tuyển dụng!
          </p>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition cursor-pointer"
          >
            + TẠO HỒ SƠ CV CƯ DÂN NGAY (MIỄN PHÍ)
          </button>
        </div>
      )}

      {/* Applications List Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-600" />
            <span>Lịch Sử Ứng Tuyển & Mời Phỏng Vấn ({applications.length})</span>
          </h3>
          <Link to="/tuyen-dung" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
            <span>Tìm việc làm mới</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {applications.map((app) => (
              <div key={app.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    {app.jobTitle}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                    <span className="text-teal-600 font-bold">{app.companyName}</span>
                    <span>•</span>
                    <span className="text-slate-400">{app.createdAt}</span>
                  </div>
                  {app.message && (
                    <p className="text-[11px] text-slate-500 italic">Lời nhắn: "{app.message}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    app.status === 'interviewing'
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      : app.status === 'accepted'
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                      : app.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                      : 'bg-sky-500/20 text-sky-500 border border-sky-500/30'
                  }`}>
                    {app.status === 'interviewing' ? '🎉 Mời Phỏng Vấn' : app.status === 'accepted' ? '✓ Đã Trúng Tuyển' : app.status === 'rejected' ? 'Chưa Phù Hợp' : '⏳ Đã Gửi Hồ Sơ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs italic">
            Bạn chưa nộp hồ sơ ứng tuyển vào vị trí nào gần đây.
          </div>
        )}
      </div>

      {/* Modal Edit / Create CV */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
            <div className="bg-gradient-to-r from-teal-950 to-slate-900 p-5 text-white flex items-center justify-between border-b border-teal-500/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500 text-slate-950 rounded-xl font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {cvProfile ? 'CHỈNH SỬA HỒ SƠ CV CƯ DÂN' : 'TẠO HỒ SƠ CV CƯ DÂN TRỰC TUYẾN'}
                  </h3>
                  <p className="text-xs text-slate-300">Nhập đầy đủ thông tin để thu hút các nhà tuyển dụng hàng đầu nội khu</p>
                </div>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCv} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Họ và Tên *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="VD: Nguyễn Văn Nam"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vị Trí Ứng Tuyển Mong Muốn *</label>
                  <input
                    type="text"
                    required
                    value={formData.targetJobTitle || ''}
                    onChange={e => setFormData({ ...formData, targetJobTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="VD: Quản lý Cửa Hàng, NV Bán Hàng, Barista..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số Điện Thoại Liên Hệ *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="VD: 0988123456"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Zalo Liên Hệ</label>
                  <input
                    type="text"
                    value={formData.zalo || ''}
                    onChange={e => setFormData({ ...formData, zalo: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="Số Zalo hoặc link Zalo"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="name@email.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Năm Sinh & Giới Tính</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.birthYear || 1998}
                      onChange={e => setFormData({ ...formData, birthYear: parseInt(e.target.value, 10) || 1998 })}
                      className="w-1/2 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                    <select
                      value={formData.gender || 'nam'}
                      onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-1/2 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    >
                      <option value="nam">Nam</option>
                      <option value="nu">Nữ</option>
                      <option value="khac">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Khu Đô Thị Hiện Tại *</label>
                  <select
                    value={formData.currentProject || 'ocean-park-2'}
                    onChange={e => {
                      const proj = VIN_MAJOR_PROJECTS.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        currentProject: e.target.value,
                        projectName: proj?.name || 'Vinhomes Ocean Park'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {VIN_MAJOR_PROJECTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mức Lương Kỳ Vọng</label>
                  <input
                    type="text"
                    value={formData.expectedSalary || ''}
                    onChange={e => setFormData({ ...formData, expectedSalary: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="VD: 10 - 15 Triệu/tháng hoặc Thỏa thuận"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ngành Nghề Chính *</label>
                  <select
                    value={formData.primaryIndustry || 'bds-moi-gioi'}
                    onChange={e => setFormData({ ...formData, primaryIndustry: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {RECRUITMENT_INDUSTRIES.map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số Năm Kinh Nghiệm</label>
                  <input
                    type="number"
                    value={formData.yearsOfExp || 0}
                    onChange={e => setFormData({ ...formData, yearsOfExp: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="0 nếu chưa có kinh nghiệm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Giới Thiệu Bản Thân & Điểm Mạnh</label>
                <textarea
                  rows={3}
                  value={formData.introduction || ''}
                  onChange={e => setFormData({ ...formData, introduction: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  placeholder="Mô tả ngắn gọn về năng lực, tinh thần trách nhiệm và mong muốn gắn bó làm việc tại nội khu đô thị..."
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl shadow-lg transition cursor-pointer"
                >
                  {isSubmitting ? 'Đang Lưu...' : '✓ LƯU HỒ SƠ CV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
