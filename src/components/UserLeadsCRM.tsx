import React, { useState, useEffect } from 'react';
import { 
  Users, Phone, MessageSquare, Calendar, Plus, Search, Filter, 
  CheckCircle2, Clock, AlertTriangle, ChevronRight, UserPlus, 
  DollarSign, FileText, Send, Trash2, Edit3, ShieldAlert, 
  PhoneCall, ExternalLink, HelpCircle, Check, X
} from 'lucide-react';
import { User, LeadContact, LeadCareLog } from '../types';

interface UserLeadsCRMProps {
  currentUser: User;
  onRefreshParent?: () => void;
}

export const UserLeadsCRM: React.FC<UserLeadsCRMProps> = ({ currentUser, onRefreshParent }) => {
  const [leads, setLeads] = useState<LeadContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  
  // Modals & Details
  const [selectedLead, setSelectedLead] = useState<LeadContact | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showIncidentModal, setShowIncidentModal] = useState<boolean>(false);
  
  // Add Lead Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    projectInterest: '',
    propertyTitle: '',
    note: '',
    preferredTime: 'Giờ hành chính',
    dealValueVnd: '',
    nextAppointment: '',
    source: 'manual' as any
  });

  // Care Log Form State
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogType, setNewLogType] = useState<'call' | 'zalo' | 'meet' | 'note'>('call');
  const [incidentNote, setIncidentNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch leads for current user
  const fetchUserLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentUser?.id) params.set('userId', currentUser.id);
      if (currentUser?.phone) params.set('sellerPhone', currentUser.phone);
      if (currentUser?.email) params.set('email', currentUser.email);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLeads(data);
          try {
            localStorage.setItem(`user_crm_leads_${currentUser.id}`, JSON.stringify(data));
          } catch (e) {}
        }
      } else {
        // Fallback local storage
        const saved = localStorage.getItem(`user_crm_leads_${currentUser.id}`);
        if (saved) setLeads(JSON.parse(saved));
      }
    } catch (e) {
      const saved = localStorage.getItem(`user_crm_leads_${currentUser.id}`);
      if (saved) setLeads(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLeads();
  }, [currentUser?.id, currentUser?.phone]);

  // Handle Add New Lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại khách hàng.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        userId: currentUser.id,
        sellerName: currentUser.name || 'Người dùng',
        sellerPhone: currentUser.phone || '',
        dealValueVnd: formData.dealValueVnd ? Number(formData.dealValueVnd) : undefined,
        type: 'consultation',
        status: 'new'
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setLeads(prev => [data.lead, ...prev]);
        setShowAddModal(false);
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          projectInterest: '',
          propertyTitle: '',
          note: '',
          preferredTime: 'Giờ hành chính',
          dealValueVnd: '',
          nextAppointment: '',
          source: 'manual'
        });
        alert('🎉 Đã thêm khách hàng mới thành công!');
        if (onRefreshParent) onRefreshParent();
      } else {
        alert('Không thể thêm khách hàng. Vui lòng thử lại.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async (leadId: string, newStatus: any) => {
    try {
      const target = leads.find(l => l.id === leadId);
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          newCareLog: {
            note: `Đổi trạng thái sang: ${getStatusLabel(newStatus)}`,
            authorName: currentUser.name || 'Tôi',
            authorId: currentUser.id,
            actionType: 'status_change'
          }
        })
      });

      if (res.ok) {
        setLeads(prev => prev.map(l => {
          if (l.id === leadId) {
            return {
              ...l,
              status: newStatus,
              updatedAt: new Date().toISOString()
            };
          }
          return l;
        }));
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (e) {}
  };

  // Handle Add Care Log
  const handleAddCareLog = async (leadId: string) => {
    if (!newLogNote.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/care-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: newLogNote,
          authorName: currentUser.name || 'Người chăm sóc',
          authorId: currentUser.id,
          actionType: newLogType
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLeads(prev => prev.map(l => l.id === leadId ? data.lead : l));
        setSelectedLead(data.lead);
        setNewLogNote('');
      }
    } catch (e) {
      alert('Lỗi thêm nhật ký.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Report Incident for Admin Intervention
  const handleReportIncident = async () => {
    if (!selectedLead || !incidentNote.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hasIncident: true,
          incidentDescription: incidentNote,
          status: 'issue',
          newCareLog: {
            note: `🚨 Báo cáo sự cố cần Admin can thiệp: ${incidentNote}`,
            authorName: currentUser.name || 'Chủ gian hàng / Môi giới',
            authorId: currentUser.id,
            actionType: 'status_change'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, hasIncident: true, incidentDescription: incidentNote, status: 'issue' } : l));
        setSelectedLead(prev => prev ? { ...prev, hasIncident: true, incidentDescription: incidentNote, status: 'issue' } : null);
        setShowIncidentModal(false);
        setIncidentNote('');
        alert('✅ Đã gửi yêu cầu hỗ trợ sự cố tới Ban Quản Trị Admin!');
      }
    } catch (e) {
      alert('Lỗi gửi báo cáo sự cố.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Lead
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này khỏi danh bạ chăm sóc?')) return;
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        if (selectedLead?.id === leadId) setSelectedLead(null);
      }
    } catch (e) {}
  };

  // Status helper
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Mới tiếp nhận';
      case 'contacted': return 'Đã liên hệ';
      case 'consulting': return 'Đang tư vấn';
      case 'appointment': return 'Đã hẹn gặp / xem nhà';
      case 'done': return 'Đã chốt cọc / Thành công';
      case 'issue': return 'Cần Admin hỗ trợ';
      case 'cancelled': return 'Hủy / Không nhu cầu';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'contacted': return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'consulting': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'appointment': return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'done': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'issue': return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'cancelled': return 'bg-slate-500/15 text-slate-500 border-slate-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.fullName?.toLowerCase().includes(q);
      const matchPhone = l.phone?.includes(q);
      const matchTitle = (l.propertyTitle || l.projectInterest || l.serviceTitle || l.storeName || '').toLowerCase().includes(q);
      const matchNote = l.note?.toLowerCase().includes(q);
      return matchName || matchPhone || matchTitle || matchNote;
    }
    return true;
  });

  // Metrics
  const totalLeads = leads.length;
  const inProgressLeads = leads.filter(l => ['new', 'contacted', 'consulting', 'appointment'].includes(l.status)).length;
  const closedLeads = leads.filter(l => l.status === 'done').length;
  const incidentLeads = leads.filter(l => l.hasIncident || l.status === 'issue').length;

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold mb-1">
            <span>Tổng Khách Hàng</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">{totalLeads}</p>
          <span className="text-[10px] text-slate-400">Leads của riêng bạn</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold mb-1">
            <span>Đang Chăm Sóc</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400">{inProgressLeads}</p>
          <span className="text-[10px] text-amber-500 font-medium">Cần gọi & hẹn lịch</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold mb-1">
            <span>Chốt Thành Công</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{closedLeads}</p>
          <span className="text-[10px] text-emerald-500 font-medium">Đã chốt cọc / xong việc</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold mb-1">
            <span>Sự Cố / Nhờ Admin</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400">{incidentLeads}</p>
          <span className="text-[10px] text-rose-500 font-medium">Admin đang theo dõi</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên khách, SĐT, căn hộ, ghi chú..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-2 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">⚡ Tất cả trạng thái</option>
            <option value="new">🆕 Mới tiếp nhận</option>
            <option value="contacted">📞 Đã liên hệ</option>
            <option value="consulting">💬 Đang tư vấn</option>
            <option value="appointment">📅 Đã hẹn xem / khảo sát</option>
            <option value="done">✅ Đã chốt cọc / Thành công</option>
            <option value="issue">🚨 Cần Admin hỗ trợ</option>
            <option value="cancelled">⛔ Đã hủy</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="py-2 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">🌐 Nguồn khách hàng</option>
            <option value="bds">🏠 Tin Đăng BĐS</option>
            <option value="resident_market">🛒 Chợ Cư Dân</option>
            <option value="technician">🔧 Dịch Vụ Thợ</option>
            <option value="manual">✍️ Thêm thủ công</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Thêm Khách Hàng Mới</span>
        </button>
      </div>

      {/* Leads List / Table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <p>Đang tải danh sách khách hàng của bạn...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">Chưa có khách hàng nào trong danh sách</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto">
            Khi khách hàng để lại thông tin trên tin đăng BĐS, gian hàng hoặc dịch vụ của bạn, khách sẽ tự động xuất hiện ở đây để bạn chăm sóc. Bạn cũng có thể bấm "+ Thêm Khách Hàng Mới" để lưu danh bạ.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm Khách Hàng Đầu Tiên</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* List Column */}
          <div className={`space-y-2.5 ${selectedLead ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
            {filteredLeads.map(lead => {
              const isSelected = selectedLead?.id === lead.id;
              const formattedPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 ${
                    isSelected 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {lead.fullName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                        {lead.hasIncident && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-500 border border-rose-500/40 text-[9px] font-black flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Có sự cố
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{lead.phone}</span>
                        {lead.projectInterest && (
                          <span className="truncate max-w-[200px] text-emerald-600 dark:text-emerald-400 font-medium">
                            • {lead.projectInterest}
                          </span>
                        )}
                      </div>

                      {lead.note && (
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-1 italic bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-lg">
                          "{lead.note}"
                        </p>
                      )}
                    </div>

                    {/* Quick Call & Zalo shortcuts */}
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      {formattedPhone && (
                        <>
                          <a
                            href={`tel:${formattedPhone}`}
                            className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center transition shadow-2xs"
                            title="Gọi điện ngay"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://zalo.me/${formattedPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center transition shadow-2xs"
                            title="Nhắn Zalo"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Tiếp nhận: {new Date(lead.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span className="text-slate-500 font-medium">
                      {(lead.careLogs?.length || 0)} lượt chăm sóc
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details & Care Activity Panel */}
          {selectedLead && (
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-md space-y-4">
              {/* Header Details */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-slate-900 dark:text-white">{selectedLead.fullName}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getStatusColor(selectedLead.status)}`}>
                      {getStatusLabel(selectedLead.status)}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-xs font-bold">{selectedLead.phone}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowIncidentModal(true)}
                    className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    title="Báo sự cố nhờ Admin can thiệp"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Báo Sự Cố</span>
                  </button>

                  <button
                    onClick={() => handleDeleteLead(selectedLead.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    title="Xóa khách hàng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Gọi Điện Cho Khách</span>
                </a>
                <a
                  href={`https://zalo.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Nhắn Tin Zalo</span>
                </a>
              </div>

              {/* Status Selector */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-2">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 block text-[11px]">
                  Cập Nhật Tiến Độ Chăm Sóc:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'contacted', label: '📞 Đã liên hệ' },
                    { id: 'consulting', label: '💬 Đang tư vấn' },
                    { id: 'appointment', label: '📅 Hẹn xem/làm' },
                    { id: 'done', label: '✅ Đã chốt' },
                    { id: 'issue', label: '🚨 Cần hỗ trợ' },
                    { id: 'cancelled', label: '⛔ Tạm dừng' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => handleUpdateStatus(selectedLead.id, st.id)}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[10px] transition cursor-pointer border ${
                        selectedLead.status === st.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Info Breakdown */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-slate-400">Quan tâm / Nhu cầu:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-right">
                    {selectedLead.propertyTitle || selectedLead.projectInterest || selectedLead.serviceTitle || 'Bất động sản / Chợ Cư Dân'}
                  </span>
                </div>
                {selectedLead.preferredTime && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời gian gọi phù hợp:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{selectedLead.preferredTime}</span>
                  </div>
                )}
                {selectedLead.note && (
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400 block mb-0.5">Yêu cầu ban đầu của khách:</span>
                    <p className="text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                      {selectedLead.note}
                    </p>
                  </div>
                )}
                {selectedLead.adminInterventionNote && (
                  <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-700 dark:text-blue-300">
                    <span className="font-extrabold block text-[10px]">👑 Phản Hồi Từ Admin / Ban Quản Trị:</span>
                    <p className="text-[11px] mt-0.5">{selectedLead.adminInterventionNote}</p>
                  </div>
                )}
              </div>

              {/* Add Care Log Form */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ghi Nhật Ký Chăm Sóc Khách Hàng:</span>
                </span>
                
                <div className="flex gap-1.5">
                  {[
                    { id: 'call', label: '📞 Cuộc gọi' },
                    { id: 'zalo', label: '💬 Zalo' },
                    { id: 'meet', label: '🤝 Gặp mặt' },
                    { id: 'note', label: '📝 Ghi chú' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewLogType(t.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                        newLogType === t.id
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLogNote}
                    onChange={e => setNewLogNote(e.target.value)}
                    placeholder="Ví dụ: Khách hẹn 14h chiều mai qua xem thực tế căn 2PN..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCareLog(selectedLead.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAddCareLog(selectedLead.id)}
                    disabled={submitting || !newLogNote.trim()}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Lưu</span>
                  </button>
                </div>
              </div>

              {/* Care History Timeline */}
              <div className="space-y-2">
                <span className="font-extrabold text-slate-500 dark:text-slate-400 text-[11px] block">
                  Lịch Sử Chăm Sóc ({(selectedLead.careLogs?.length || 0)}):
                </span>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedLead.careLogs && selectedLead.careLogs.length > 0 ? (
                    selectedLead.careLogs.map((log, idx) => (
                      <div key={log.id || idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-600 dark:text-slate-300">{log.authorName || 'Người chăm sóc'}</span>
                          <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 text-xs font-medium">{log.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic text-[11px]">Chưa có nhật ký chăm sóc nào.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Thêm Khách Hàng Mới Vào Danh Bạ</h3>
                  <p className="text-[10px] text-slate-500">Chỉ riêng tài khoản của bạn xem và quản lý</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Họ tên khách hàng *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ví dụ: Anh Hoàng Nam"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0912.xxx.xxx"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nhu cầu / Dự án / Món hàng</label>
                  <input
                    type="text"
                    value={formData.projectInterest}
                    onChange={e => setFormData({ ...formData, projectInterest: e.target.value })}
                    placeholder="Ví dụ: Căn 2PN OCP2 Chà Là / Đặt thợ sửa điện"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nguồn khách hàng</label>
                  <select
                    value={formData.source}
                    onChange={e => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="manual">✍️ Người quen / Bạn bè giới thiệu</option>
                    <option value="bds">🏠 Khách hỏi tin BĐS</option>
                    <option value="resident_market">🛒 Khách mua hàng Chợ Cư Dân</option>
                    <option value="technician">🔧 Khách đặt lịch Thợ sửa chữa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ghi chú yêu cầu cụ thể</label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Khách cần thuê gấp trước ngày 1, tài chính 10-12 triệu, ưu tiên tầng trung view thoáng..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Đang lưu...' : 'Lưu Khách Hàng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Incident Modal */}
      {showIncidentModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-500/40 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Báo Cáo Sự Cố Cho Admin Can Thiệp</h3>
                  <p className="text-[10px] text-slate-500">Khách: {selectedLead.fullName} ({selectedLead.phone})</p>
                </div>
              </div>
              <button onClick={() => setShowIncidentModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-600 dark:text-slate-300 text-xs">
                Khi bạn gặp khiếu nại, tranh chấp đặt cọc, thắc mắc thủ tục pháp lý dự án hoặc cần Ban Quản Trị can thiệp hỗ trợ, hãy nhập chi tiết bên dưới.
              </p>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mô tả sự cố / Vấn đề cần Admin hỗ trợ *</label>
                <textarea
                  rows={3}
                  required
                  value={incidentNote}
                  onChange={e => setIncidentNote(e.target.value)}
                  placeholder="Mô tả cụ thể sự việc để Admin xử lý nhanh chóng..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-rose-300 dark:border-rose-800/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleReportIncident}
                  disabled={submitting || !incidentNote.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Tới Admin'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
