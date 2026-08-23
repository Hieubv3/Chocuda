import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, FileText, Search, Filter, 
  Sparkles, Check, X, Eye, Phone, Building2, MapPin, ExternalLink, 
  Clock, ShieldAlert, Award, FileCheck, Layers, Settings, ChevronRight, 
  UserCheck, RefreshCw, Info, Edit3, Plus, Trash2
} from 'lucide-react';
import { ResidentServiceItem, IndustryKycRule, SubmittedKycDoc, ProjectCategory } from '../types';
import { DEFAULT_INDUSTRY_KYC_RULES, VIN_MAJOR_PROJECTS } from '../data/residentServicesData';

interface AdminKycManagerProps {
  services: ResidentServiceItem[];
  onUpdateServiceKyc: (serviceId: string, updates: Partial<ResidentServiceItem>) => void;
  onRefreshData?: () => void;
}

export const AdminKycManager: React.FC<AdminKycManagerProps> = ({
  services,
  onUpdateServiceKyc,
  onRefreshData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'industry_rules'>('requests');
  
  // KYC Requests Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Item for Document Review Modal
  const [selectedService, setSelectedService] = useState<ResidentServiceItem | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [selectedBadgeType, setSelectedBadgeType] = useState<'blue_verified' | 'gold_certified'>('blue_verified');

  // Industry Rules State
  const [kycRules, setKycRules] = useState<IndustryKycRule[]>(DEFAULT_INDUSTRY_KYC_RULES);
  const [editingRule, setEditingRule] = useState<IndustryKycRule | null>(null);
  const [newDocTypeInput, setNewDocTypeInput] = useState('');

  // Filtered Services List
  const filteredServices = services.filter(srv => {
    // Status match
    if (statusFilter === 'pending' && srv.kycStatus !== 'pending') return false;
    if (statusFilter === 'verified' && srv.kycStatus !== 'verified') return false;
    if (statusFilter === 'rejected' && srv.kycStatus !== 'rejected') return false;
    
    // Category match
    if (categoryFilter !== 'all' && srv.categoryId !== categoryFilter) return false;

    // Project match
    if (projectFilter !== 'all' && srv.project !== projectFilter) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = srv.title.toLowerCase().includes(q);
      const matchProvider = srv.providerName.toLowerCase().includes(q);
      const matchPhone = srv.providerPhone.includes(q);
      if (!matchTitle && !matchProvider && !matchPhone) return false;
    }

    return true;
  });

  // KPI Counter
  const totalCount = services.length;
  const pendingCount = services.filter(s => s.kycStatus === 'pending').length;
  const verifiedCount = services.filter(s => s.kycStatus === 'verified').length;
  const rejectedCount = services.filter(s => s.kycStatus === 'rejected').length;

  const handleApproveKyc = (service: ResidentServiceItem) => {
    onUpdateServiceKyc(service.id, {
      verified: true,
      kycStatus: 'verified',
      kycBadgeType: selectedBadgeType,
      kycApprovedAt: new Date().toISOString().split('T')[0],
      kycApprovedBy: 'Ban Quản Trị Hệ Thống',
      kycNote: adminNoteInput || 'Đã kiểm tra đầy đủ chứng chỉ ngành nghề & căn cước chính chủ.'
    });
    alert(`✅ Đã cấp Nút Xanh Định Danh KYC cho "${service.providerName}" thành công!`);
    setSelectedService(null);
    setAdminNoteInput('');
  };

  const handleRejectKyc = (service: ResidentServiceItem) => {
    if (!adminNoteInput.trim()) {
      alert('⚠️ Vui lòng nhập lý do từ chối hoặc yêu cầu bổ sung giấy phép!');
      return;
    }
    onUpdateServiceKyc(service.id, {
      verified: false,
      kycStatus: 'rejected',
      kycBadgeType: 'none',
      kycNote: adminNoteInput
    });
    alert(`❌ Đã từ chối cấp Nút Xanh cho "${service.providerName}". Lý do: ${adminNoteInput}`);
    setSelectedService(null);
    setAdminNoteInput('');
  };

  const handleRevokeKyc = (service: ResidentServiceItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn THU HỒI Nút Xanh Định Danh của "${service.providerName}"?`)) return;
    onUpdateServiceKyc(service.id, {
      verified: false,
      kycStatus: 'unverified',
      kycBadgeType: 'none',
      kycNote: 'Thu hồi Nút Xanh do báo cáo hoặc giấy phép hết hạn.'
    });
    alert(`🚫 Đã thu hồi Nút Xanh KYC của "${service.providerName}".`);
    setSelectedService(null);
  };

  // Handle Editing Industry Rules
  const handleSaveRule = () => {
    if (!editingRule) return;
    setKycRules(prev => prev.map(r => r.categoryId === editingRule.categoryId ? editingRule : r));
    alert(`✅ Đã cập nhật quy định giấy phép cho ngành "${editingRule.categoryName}"!`);
    setEditingRule(null);
  };

  const handleAddDocTypeToRule = () => {
    if (!editingRule || !newDocTypeInput.trim()) return;
    setEditingRule({
      ...editingRule,
      requiredDocTypes: [...editingRule.requiredDocTypes, newDocTypeInput.trim()]
    });
    setNewDocTypeInput('');
  };

  const handleRemoveDocTypeFromRule = (index: number) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      requiredDocTypes: editingRule.requiredDocTypes.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header & Sub-tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300/40 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>HỆ THỐNG ĐỊNH DANH NÚT XANH NÂNG CAO</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Quản Lý Nút Xanh KYC & Giấy Phép Ngành Nghề
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kiểm duyệt chứng chỉ thang máy, bằng lái B2, chứng nhận ATVSTP, bằng cấp y tế, điện nước & hợp đồng cư dân.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeSubTab === 'requests'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Duyệt Hồ Sơ KYC ({pendingCount})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('industry_rules')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeSubTab === 'industry_rules'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cấu Hình Ngành Nghề ({kycRules.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => { setActiveSubTab('requests'); setStatusFilter('pending'); }}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'pending' && activeSubTab === 'requests'
              ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Chờ Duyệt Hồ Sơ</span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black mt-2 text-amber-700 dark:text-amber-300">{pendingCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Cần đối soát chứng chỉ</p>
        </div>

        <div 
          onClick={() => { setActiveSubTab('requests'); setStatusFilter('verified'); }}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'verified' && activeSubTab === 'requests'
              ? 'bg-emerald-500/10 border-emerald-500/60 ring-2 ring-emerald-500/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Đã Cấp Nút Xanh</span>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black mt-2 text-emerald-700 dark:text-emerald-300">{verifiedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Đã xác minh chính chủ</p>
        </div>

        <div 
          onClick={() => { setActiveSubTab('requests'); setStatusFilter('rejected'); }}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'rejected' && activeSubTab === 'requests'
              ? 'bg-rose-500/10 border-rose-500/60 ring-2 ring-rose-500/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">Từ Chối / Bổ Sung</span>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black mt-2 text-rose-700 dark:text-rose-300">{rejectedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Giấy phép không hợp lệ</p>
        </div>

        <div 
          onClick={() => { setActiveSubTab('requests'); setStatusFilter('all'); }}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'all' && activeSubTab === 'requests'
              ? 'bg-slate-500/10 border-slate-500/60 ring-2 ring-slate-500/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Gian Hàng</span>
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black mt-2">{totalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Dịch vụ cư dân toàn Vin</p>
        </div>
      </div>

      {/* SUB-TAB 1: APPROVAL CENTER */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          {/* Search & Filter Controls */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm thợ, SĐT, tên gian hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="pending">🟡 Chờ Duyệt KYC ({pendingCount})</option>
                <option value="verified">🟢 Đã Cấp Nút Xanh ({verifiedCount})</option>
                <option value="rejected">🔴 Từ Chối / Bổ Sung ({rejectedCount})</option>
                <option value="all">⚪ Tất Cả ({totalCount})</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="all">Tất cả ngành nghề</option>
                {kycRules.map(rule => (
                  <option key={rule.categoryId} value={rule.categoryId}>{rule.categoryName}</option>
                ))}
              </select>

              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="all">Tất cả Đại Dự Án Vin</option>
                {VIN_MAJOR_PROJECTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List of KYC Applications */}
          {filteredServices.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-700 dark:text-slate-300">
                Không tìm thấy hồ sơ định danh phù hợp
              </h3>
              <p className="text-xs text-slate-500">
                Hãy thử thay đổi bộ lọc trạng thái hoặc ngành nghề dịch vụ ở phía trên.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredServices.map((service) => {
                const categoryRule = kycRules.find(r => r.categoryId === service.categoryId);
                return (
                  <div 
                    key={service.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        {service.kycStatus === 'pending' && (
                          <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-black">
                            <Clock className="w-3.5 h-3.5" />
                            <span>CHỜ DUYỆT GIẤY PHÉP</span>
                          </span>
                        )}
                        {service.kycStatus === 'verified' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-black">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ĐÃ CẤP NÚT XANH KYC</span>
                          </span>
                        )}
                        {service.kycStatus === 'rejected' && (
                          <span className="inline-flex items-center gap-1 bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-black">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>TỪ CHỐI / CẦN BỔ SUNG</span>
                          </span>
                        )}

                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          Ngành: {categoryRule?.categoryName || service.categoryId}
                        </span>

                        {service.businessLicenseNo && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            ĐKKD: <b>{service.businessLicenseNo}</b>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-slate-900 dark:text-white hover:text-emerald-600 transition">
                        {service.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          👤 {service.providerName}
                        </span>
                        <span>📞 {service.providerPhone}</span>
                        <span>📍 {service.address} ({service.project})</span>
                      </div>

                      {/* Submitted Documents Indicator */}
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Giấy tờ nộp:</span>
                        {service.submittedDocs && service.submittedDocs.length > 0 ? (
                          service.submittedDocs.map((doc) => (
                            <span 
                              key={doc.id}
                              className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg text-[11px] font-medium"
                            >
                              <FileText className="w-3 h-3 text-emerald-500" />
                              <span>{doc.docType}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-amber-600 font-semibold italic">
                            Chưa gửi file đính kèm (Nộp trực tiếp qua Zalo/CCCD)
                          </span>
                        )}
                      </div>

                      {service.kycNote && (
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                          <b>Ghi chú Admin:</b> {service.kycNote}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col items-center gap-2 shrink-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 pt-3 lg:pt-0">
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setAdminNoteInput(service.kycNote || '');
                        }}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 w-full"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Xem & Duyệt Hồ Sơ</span>
                      </button>

                      {service.kycStatus === 'verified' && (
                        <button
                          onClick={() => handleRevokeKyc(service)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950 text-rose-600 font-bold text-[11px] rounded-lg transition text-center w-full"
                        >
                          Thu Hồi Nút Xanh
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

      {/* SUB-TAB 2: INDUSTRY LICENSING RULES CONFIGURATOR */}
      {activeSubTab === 'industry_rules' && (
        <div className="space-y-6">
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-200 space-y-1">
            <h4 className="font-black text-emerald-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>BẢNG DANH MỤC GIẤY PHÉP BẮT BUỘC THEO TỪNG NGÀNH NGHỀ</span>
            </h4>
            <p>
              Cấu hình các loại giấy chứng nhận, bằng cấp, chứng chỉ hành nghề bắt buộc nhà cung cấp phải nộp khi muốn nhận <b>Nút Xanh KYC Cư Dân</b>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kycRules.map((rule) => (
              <div 
                key={rule.categoryId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{rule.categoryName}</span>
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      rule.isStrictMandatory 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {rule.isStrictMandatory ? 'Bắt Bắt Buộc Giấy Phép' : 'Khuyến Khích'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {rule.description}
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                      Giấy phép & Chứng chỉ bắt buộc:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {rule.requiredDocTypes.map((doc, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-lg transition flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa Quy Định Ngành</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCUMENT INSPECTION & APPROVAL MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>ĐỐI SOÁT HỒ SƠ ĐỊNH DANH NÚT XANH</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {selectedService.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Nhà cung cấp: <b className="text-emerald-600">{selectedService.providerName}</b> | SĐT: {selectedService.providerPhone}
              </p>
            </div>

            {/* Submitter Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400">Đại dự án Vin:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedService.project}</p>
              </div>
              <div>
                <span className="text-slate-400">Địa chỉ kinh doanh:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedService.address}</p>
              </div>
              <div>
                <span className="text-slate-400">Số ĐKKD / Mã số thuế:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedService.businessLicenseNo || 'Nộp bản scan đính kèm'}</p>
              </div>
              <div>
                <span className="text-slate-400">Trạng thái hiện tại:</span>
                <p className="font-extrabold uppercase text-amber-600">{selectedService.kycStatus || 'pending'}</p>
              </div>
            </div>

            {/* List of Attached Documents */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center justify-between">
                <span>Giấy phép & Chứng chỉ đã tải lên ({selectedService.submittedDocs?.length || 0})</span>
                <span className="text-emerald-600 font-bold">Chính Chủ Cư Dân Vin</span>
              </h4>

              {selectedService.submittedDocs && selectedService.submittedDocs.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {selectedService.submittedDocs.map((doc) => (
                    <div 
                      key={doc.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {doc.docType}
                          </h5>
                          <p className="text-[11px] text-slate-400">
                            Tệp: {doc.docName} • Nộp ngày: {doc.uploadedAt}
                          </p>
                        </div>
                      </div>

                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem File Scanned</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
                  ⚠️ Gian hàng này chưa tải file scan qua form. Đối soát trực tiếp qua Zalo / CCCD của nhà cung cấp.
                </div>
              )}
            </div>

            {/* Select Badge Type */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">
                Chọn Loại Huy Hiệu Nút Xanh Cấp Cho Gian Hàng:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBadgeType('blue_verified')}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    selectedBadgeType === 'blue_verified'
                      ? 'bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 font-extrabold ring-2 ring-blue-500/40'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>NÚT XANH ĐỊNH DANH (Blue Badge)</span>
                  </div>
                  <p className="text-[11px] font-normal text-slate-500 mt-1">Dành cho gian hàng & thợ cư dân đã nộp đầy đủ CCCD & Giấy phép.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBadgeType('gold_certified')}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    selectedBadgeType === 'gold_certified'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-extrabold ring-2 ring-amber-500/40'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>HUY HIỆU VÀNG UY TÍN (Gold Partner)</span>
                  </div>
                  <p className="text-[11px] font-normal text-slate-500 mt-1">Dành cho đối tác chính thức Vinmec, Vinschool, VinFast, Shophouse lớn.</p>
                </button>
              </div>
            </div>

            {/* Admin Note Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">
                Ghi Chú Admin / Lý Do Cấp Hoặc Từ Chối Bổ Sung:
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Đã kiểm tra bản scan ATVSTP hợp lệ, thông tin chính chủ..."
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleRejectKyc(selectedService)}
                className="px-5 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Từ Chối / Bổ Sung</span>
              </button>

              <button
                type="button"
                onClick={() => handleApproveKyc(selectedService)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>DUYỆT CẤP NÚT XANH KYC</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INDUSTRY RULE MODAL */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setEditingRule(null)}
              className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Cấu Hình Quy Định Ngành: {editingRule.categoryName}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Yêu cầu bắt buộc giấy phép?</label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="inline-flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      checked={editingRule.isStrictMandatory}
                      onChange={() => setEditingRule({ ...editingRule, isStrictMandatory: true })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Bắt buộc 100% (Ví dụ: Thang máy, ATVSTP, Bằng B2)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Mô tả quy định ngành:</label>
                <textarea
                  rows={2}
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Danh sách Giấy phép / Bằng cấp bắt buộc:</label>
                <div className="space-y-1.5 mt-1">
                  {editingRule.requiredDocTypes.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span>{doc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocTypeFromRule(idx)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Thêm chứng chỉ mới..."
                    value={newDocTypeInput}
                    onChange={(e) => setNewDocTypeInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocTypeToRule}
                    className="px-3 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs shrink-0"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-5 py-2 bg-emerald-600 text-white font-black text-xs rounded-xl"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
