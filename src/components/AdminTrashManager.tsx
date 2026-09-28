import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Wrench, 
  FileText, 
  Store, 
  Briefcase, 
  User, 
  ExternalLink 
} from 'lucide-react';
import type { TrashItem, TrashEntityType } from '../types.ts';

export const AdminTrashManager: React.FC = () => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<TrashEntityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('chocudan24h_token');
      const res = await fetch(`/api/admin/trash?entityType=${filterType}&q=${encodeURIComponent(searchQuery)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setTrashItems(data.items || []);
        if (data.countsByType) setCounts(data.countsByType);
      }
    } catch (err) {
      console.error('Lỗi tải thùng rác:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrash();
  };

  // Khôi phục item
  const handleRestore = async (item: TrashItem) => {
    if (!confirm(`Khôi phục lại "${item.entityLabel}" về danh sách hiển thị?`)) return;
    setActionLoading(item.id);
    try {
      const token = localStorage.getItem('chocudan24h_token');
      const res = await fetch(`/api/admin/trash/${item.id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Khôi phục thành công!');
        fetchTrash();
      } else {
        alert(data.error || 'Khôi phục thất bại.');
      }
    } catch (e) {
      alert('Không thể kết nối máy chủ.');
    } finally {
      setActionLoading(null);
    }
  };

  // Xóa vĩnh viễn (Purge)
  const handlePurge = async (item: TrashItem) => {
    if (!confirm(`CẢNH BÁO: Xóa vĩnh viễn "${item.entityLabel}"? Hành động này KHÔNG THỂ hoàn tác!`)) return;
    setActionLoading(item.id);
    try {
      const token = localStorage.getItem('chocudan24h_token');
      const res = await fetch(`/api/admin/trash/${item.id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Đã xóa vĩnh viễn!');
        fetchTrash();
      } else {
        alert(data.error || 'Xóa thất bại.');
      }
    } catch (e) {
      alert('Không thể kết nối máy chủ.');
    } finally {
      setActionLoading(null);
    }
  };

  // Làm trống toàn bộ thùng rác
  const handleEmptyTrash = async () => {
    if (!confirm('CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn DỌN SẠCH toàn bộ thùng rác? Tất cả bài đã xóa sẽ biến mất vĩnh viễn!')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('chocudan24h_token');
      const res = await fetch('/api/admin/trash/empty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ entityType: filterType })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchTrash();
      }
    } catch (e) {
      alert('Không thể dọn sạch thùng rác.');
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (type: TrashEntityType) => {
    switch (type) {
      case 'property': return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'resident_service': return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'news': return <FileText className="w-4 h-4 text-sky-400" />;
      case 'project': return <Building2 className="w-4 h-4 text-purple-400" />;
      case 'store': return <Store className="w-4 h-4 text-pink-400" />;
      case 'recruitment_job': return <Briefcase className="w-4 h-4 text-indigo-400" />;
      case 'candidate_profile': return <User className="w-4 h-4 text-cyan-400" />;
      case 'user': return <User className="w-4 h-4 text-blue-400" />;
      case 'business': return <Building2 className="w-4 h-4 text-emerald-400" />;
      default: return <Trash2 className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEntityTypeName = (type: TrashEntityType) => {
    switch (type) {
      case 'property': return 'Bất động sản';
      case 'resident_service': return 'Dịch vụ cư dân';
      case 'news': return 'Tin tức / PR';
      case 'project': return 'Dự án BĐS';
      case 'store': return 'Gian hàng';
      case 'recruitment_job': return 'Việc làm';
      case 'candidate_profile': return 'Hồ sơ ứng viên';
      case 'user': return 'Tài khoản';
      case 'business': return 'Doanh nghiệp';
      default: return 'Khác';
    }
  };

  const calculateDaysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tổng quan */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-rose-500" />
            Thùng rác Hệ thống
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Nơi lưu trữ an toàn các bài đăng, dịch vụ và dữ liệu đã xóa. Dữ liệu được bảo lưu 30 ngày trước khi tự động dọn sạch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTrash}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Làm mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          {trashItems.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              Dọn sạch thùng rác
            </button>
          )}
        </div>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Phân loại */}
        <div className="md:col-span-8 flex flex-wrap gap-1.5 bg-slate-900/80 p-1.5 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterType === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Tất cả ({counts.total || trashItems.length})
          </button>
          <button
            onClick={() => setFilterType('property')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterType === 'property'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> BĐS ({counts.property || 0})
          </button>
          <button
            onClick={() => setFilterType('resident_service')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterType === 'resident_service'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Dịch vụ ({counts.resident_service || 0})
          </button>
          <button
            onClick={() => setFilterType('news')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterType === 'news'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Tin tức ({counts.news || 0})
          </button>
          <button
            onClick={() => setFilterType('project')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterType === 'project'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Dự án ({counts.project || 0})
          </button>
          <button
            onClick={() => setFilterType('store')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterType === 'store'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Gian hàng ({counts.store || 0})
          </button>
          <button
            onClick={() => setFilterType('user')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterType === 'user'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Tài khoản ({counts.user || 0})
          </button>
          <button
            onClick={() => setFilterType('business')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterType === 'business'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Doanh nghiệp ({counts.business || 0})
          </button>
        </div>

        {/* Ô tìm kiếm */}
        <div className="md:col-span-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, ID, người xóa..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </form>
        </div>
      </div>

      {/* Danh sách bảng */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            Đang tải dữ liệu thùng rác...
          </div>
        ) : trashItems.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Trash2 className="w-12 h-12 mx-auto stroke-1 text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300">Thùng rác trống</p>
            <p className="text-xs text-slate-500 mt-1">Không có bài viết hoặc dữ liệu nào bị xóa gần đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Mục đã xóa</th>
                  <th className="py-3 px-4">Phân loại</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4">Thời gian xóa</th>
                  <th className="py-3 px-4">Hạn bảo lưu</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {trashItems.map((item) => {
                  const daysLeft = calculateDaysLeft(item.expiresAt);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.entityImage ? (
                            <img
                              src={item.entityImage}
                              alt={item.entityLabel}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700/50"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/50">
                              {getEntityIcon(item.entityType)}
                            </div>
                          )}
                          <div className="min-w-0 max-w-md">
                            <p className="font-semibold text-slate-200 truncate">{item.entityLabel}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {item.entityId}</p>
                            {item.reason && (
                              <p className="text-[10px] text-amber-400/90 italic truncate mt-0.5">Lý do: {item.reason}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/40">
                          {getEntityIcon(item.entityType)}
                          {getEntityTypeName(item.entityType)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-medium">{item.deletedBy?.name || 'Hệ thống'}</div>
                        <div className="text-[10px] text-slate-500">{item.deletedBy?.email || item.deletedBy?.role}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(item.deletedAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          daysLeft <= 3 ? 'text-rose-400 font-bold' : 'text-slate-300'
                        }`}>
                          <Clock className="w-3 h-3" />
                          Còn {daysLeft} ngày
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRestore(item)}
                            disabled={actionLoading === item.id}
                            className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            title="Khôi phục lại bài đăng"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Khôi phục
                          </button>
                          <button
                            onClick={() => handlePurge(item)}
                            disabled={actionLoading === item.id}
                            className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg transition"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
