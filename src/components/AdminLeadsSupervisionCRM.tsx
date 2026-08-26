import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Phone, MessageSquare, Search, Filter, 
  AlertTriangle, CheckCircle2, Clock, ShieldAlert, Edit3, 
  Trash2, Send, PhoneCall, RefreshCw, UserCheck, Check, X,
  Building2, Store, Wrench, Sparkles, ChevronRight
} from 'lucide-react';
import { LeadContact, User } from '../types';

interface AdminLeadsSupervisionCRMProps {
  contacts: LeadContact[];
  onRefreshData?: () => void;
}

export const AdminLeadsSupervisionCRM: React.FC<AdminLeadsSupervisionCRMProps> = ({ 
  contacts: initialContacts, 
  onRefreshData 
}) => {
  const [leads, setLeads] = useState<LeadContact[]>(initialContacts || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [incidentOnlyFilter, setIncidentOnlyFilter] = useState(false);
  
  // Selected Lead & Admin Actions
  const [selectedLead, setSelectedLead] = useState<LeadContact | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAllLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads?isAdmin=true');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLeads(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialContacts && initialContacts.length > 0) {
      setLeads(initialContacts);
    } else {
      fetchAllLeads();
    }
  }, [initialContacts]);

  // Handle Update Lead by Admin
  const handleAdminUpdate = async (
    leadId: string, 
    updates: Partial<LeadContact> & { 
      newCareLog?: { note: string; authorName?: string; authorId?: string; actionType?: 'call' | 'zalo' | 'meet' | 'note' | 'status_change' } 
    }
  ) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const data = await res.json();
        setLeads(prev => prev.map(l => l.id === leadId ? data.lead : l));
        if (selectedLead?.id === leadId) setSelectedLead(data.lead);
        alert('✅ Đã cập nhật chỉ đạo xử lý của Ban Quản Trị!');
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      alert('Lỗi cập nhật dữ liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Save Admin Note
  const handleSaveAdminIntervention = async () => {
    if (!selectedLead || !adminNote.trim()) return;
    await handleAdminUpdate(selectedLead.id, {
      adminInterventionNote: adminNote,
      newCareLog: {
        note: `👑 Admin can thiệp / chỉ đạo: ${adminNote}`,
        authorName: 'Ban Quản Trị Hệ Thống',
        actionType: 'note'
      }
    });
    setAdminNote('');
  };

  // Handle Resolve Incident
  const handleResolveIncident = async (leadId: string) => {
    await handleAdminUpdate(leadId, {
      hasIncident: false,
      status: 'consulting',
      newCareLog: {
        note: '👑 Admin đã xử lý & gỡ bỏ trạng thái sự cố.',
        authorName: 'Ban Quản Trị',
        actionType: 'status_change'
      }
    });
  };

  // Handle Delete Lead
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Admin: Bạn có chắc chắn muốn xóa lead này vĩnh viễn?')) return;
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        if (selectedLead?.id === leadId) setSelectedLead(null);
      }
    } catch (e) {}
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    if (incidentOnlyFilter && !l.hasIncident && l.status !== 'issue') return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.fullName?.toLowerCase().includes(q);
      const matchPhone = l.phone?.includes(q);
      const matchSeller = l.sellerName?.toLowerCase().includes(q) || l.sellerPhone?.includes(q);
      const matchProject = (l.projectInterest || l.propertyTitle || '').toLowerCase().includes(q);
      const matchNote = l.note?.toLowerCase().includes(q) || l.incidentDescription?.toLowerCase().includes(q);
      return matchName || matchPhone || matchSeller || matchProject || matchNote;
    }
    return true;
  });

  const totalIncidents = leads.filter(l => l.hasIncident || l.status === 'issue').length;
  const totalClosed = leads.filter(l => l.status === 'done').length;

  return (
    <div className="space-y-4 text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/70 to-slate-900 border border-blue-500/40 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400 text-blue-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> GIÁM SÁT CRM TỔNG HỢP & XỬ LÝ SỰ CỐ
            </span>
            {totalIncidents > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {totalIncidents} SỰ CỐ CẦN XỬ LÝ
              </span>
            )}
          </div>
          <h2 className="text-lg font-black tracking-tight">Hệ Thống Theo Dõi Khách Hàng & Hỗ Trợ Cư Dân / Môi Giới</h2>
          <p className="text-slate-300 text-xs max-w-2xl">
            Tất cả khách hàng để lại thông tin trên tin đăng, gian hàng chợ hoặc dịch vụ thợ đều được thống kê tại đây. Admin có quyền theo dõi, can thiệp giải quyết sự cố, hỗ trợ tư vấn pháp lý và xử lý khiếu nại.
          </p>
        </div>

        <button
          onClick={fetchAllLeads}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm Mới Dữ Liệu</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-white">
          <span className="text-slate-400 font-bold block mb-1">Toàn Bộ Khách Hàng</span>
          <p className="text-xl font-black text-blue-400">{leads.length}</p>
          <span className="text-[10px] text-slate-400">Trên toàn hệ thống</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-white">
          <span className="text-slate-400 font-bold block mb-1">Sự Cố & Khiếu Nại</span>
          <p className="text-xl font-black text-rose-400">{totalIncidents}</p>
          <span className="text-[10px] text-rose-400/80 font-medium">Cần Admin can thiệp</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-white">
          <span className="text-slate-400 font-bold block mb-1">Giao Dịch Thành Công</span>
          <p className="text-xl font-black text-emerald-400">{totalClosed}</p>
          <span className="text-[10px] text-emerald-400/80 font-medium">Đã chốt cọc / hoàn thành</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-white">
          <span className="text-slate-400 font-bold block mb-1">Đang Tư Vấn & Hẹn</span>
          <p className="text-xl font-black text-amber-400">
            {leads.filter(l => ['new', 'contacted', 'consulting', 'appointment'].includes(l.status)).length}
          </p>
          <span className="text-[10px] text-amber-400/80 font-medium">Đang trong luồng xử lý</span>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-white">
        <div className="flex-1 w-full flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên khách, SĐT, chủ tin, căn hộ..."
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Incident Filter Button */}
          <button
            onClick={() => setIncidentOnlyFilter(!incidentOnlyFilter)}
            className={`py-2 px-3 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer border ${
              incidentOnlyFilter
                ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-rose-500/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Chỉ Xem Sự Cố ({totalIncidents})</span>
          </button>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="issue">🚨 Cần Admin hỗ trợ</option>
            <option value="new">🆕 Mới tiếp nhận</option>
            <option value="consulting">💬 Đang tư vấn</option>
            <option value="appointment">📅 Hẹn gặp / xem nhà</option>
            <option value="done">✅ Đã hoàn tất</option>
            <option value="cancelled">⛔ Hủy</option>
          </select>
        </div>
      </div>

      {/* Leads Table & Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Table/List */}
        <div className={`space-y-2 ${selectedLead ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          {filteredLeads.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>Không tìm thấy khách hàng nào phù hợp bộ lọc.</p>
            </div>
          ) : (
            filteredLeads.map(lead => {
              const isSelected = selectedLead?.id === lead.id;
              const formattedPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-slate-900/90 text-white ${
                    lead.hasIncident || lead.status === 'issue'
                      ? 'border-rose-500/80 ring-2 ring-rose-500/20 bg-rose-950/20'
                      : isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-white truncate">
                          {lead.fullName}
                        </span>
                        <span className="font-mono text-xs text-blue-400 font-bold">
                          {lead.phone}
                        </span>
                        {lead.hasIncident && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> SỰ CỐ
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {lead.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <span>Chủ tin/Phụ trách:</span>
                        <span className="text-amber-300 font-bold">{lead.sellerName || 'Chưa gán'}</span>
                        {lead.sellerPhone && <span className="font-mono text-slate-400">({lead.sellerPhone})</span>}
                      </div>

                      <p className="text-slate-300 text-xs truncate">
                        Quan tâm: <span className="text-emerald-400 font-medium">{lead.propertyTitle || lead.projectInterest || 'Chợ Cư Dân'}</span>
                      </p>

                      {lead.incidentDescription && (
                        <p className="text-rose-300 text-[11px] bg-rose-950/60 border border-rose-800/80 p-2 rounded-xl mt-1">
                          🚨 <strong className="text-rose-200">Sự cố:</strong> {lead.incidentDescription}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      {formattedPhone && (
                        <>
                          <a
                            href={`tel:${formattedPhone}`}
                            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center justify-center transition"
                            title="Gọi khách"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://zalo.me/${formattedPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 flex items-center justify-center transition"
                            title="Zalo khách"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Lead Admin Console */}
        {selectedLead && (
          <div className="lg:col-span-6 bg-slate-900 border border-blue-500/40 rounded-3xl p-4 shadow-2xl space-y-4 text-white">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-black text-base text-white">{selectedLead.fullName}</h3>
                <p className="font-mono text-xs text-blue-400 font-bold">{selectedLead.phone} {selectedLead.email ? `• ${selectedLead.email}` : ''}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDeleteLead(selectedLead.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Xóa Lead"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Contact & Status Bar */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Gọi Trực Tiếp Khách</span>
              </a>

              {selectedLead.sellerPhone && (
                <a
                  href={`tel:${selectedLead.sellerPhone.replace(/[^0-9]/g, '')}`}
                  className="py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Gọi Cho Chủ Tin / Thợ</span>
                </a>
              )}
            </div>

            {/* Incident Resolution Action */}
            {selectedLead.hasIncident && (
              <div className="bg-rose-950/70 border border-rose-500/80 p-3 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-rose-300 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> SỰ CỐ ĐANG KHIẾU NẠI:
                  </span>
                  <button
                    onClick={() => handleResolveIncident(selectedLead.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg shadow-sm cursor-pointer"
                  >
                    ✓ Đánh Dấu Đã Giải Quyết
                  </button>
                </div>
                <p className="text-slate-200 text-xs bg-slate-950 p-2.5 rounded-xl border border-rose-900">
                  {selectedLead.incidentDescription || 'Yêu cầu hỗ trợ chưa có mô tả'}
                </p>
              </div>
            )}

            {/* Admin Intervention Input */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-extrabold text-blue-400 flex items-center gap-1 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> Ghi Chú Quản Trị / Chỉ Đạo Xử Lý Của Admin:
              </span>
              <textarea
                rows={2}
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Nhập hướng dẫn xử lý hoặc phản hồi để gửi cho người phụ trách..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveAdminIntervention}
                  disabled={submitting || !adminNote.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Lưu Chỉ Đạo Admin</span>
                </button>
              </div>
            </div>

            {/* Care Logs Timeline */}
            <div className="space-y-2">
              <span className="font-extrabold text-slate-400 text-xs block">
                Lịch Sử Chăm Sóc & Hoạt Động ({(selectedLead.careLogs?.length || 0)}):
              </span>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {selectedLead.careLogs && selectedLead.careLogs.length > 0 ? (
                  selectedLead.careLogs.map((log, idx) => (
                    <div key={log.id || idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-amber-300">{log.authorName || 'Hệ Thống'}</span>
                        <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                      </div>
                      <p className="text-slate-200 text-xs font-medium">{log.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-xs">Chưa có nhật ký ghi chép nào.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
