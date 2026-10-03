import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  RefreshCw, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Flame, 
  User, 
  Calendar,
  Building2,
  Wrench,
  FileText
} from 'lucide-react';
import type { ActivityLogEntry, TrashEntityType, ActivityAction } from '../types.ts';

export const AdminActivityLogManager: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<ActivityAction | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TrashEntityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('chocudan24h_token');
      const res = await fetch(`/api/admin/history?action=${actionFilter}&entityType=${typeFilter}&q=${encodeURIComponent(searchQuery)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.items || []);
      }
    } catch (err) {
      console.error('Lỗi tải lịch sử:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadge = (action: ActivityAction) => {
    switch (action) {
      case 'create':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <PlusCircle className="w-3 h-3" /> Đăng mới
          </span>
        );
      case 'update':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Edit3 className="w-3 h-3" /> Cập nhật
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Trash2 className="w-3 h-3" /> Đưa vào thùng rác
          </span>
        );
      case 'restore':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <RotateCcw className="w-3 h-3" /> Khôi phục
          </span>
        );
      case 'purge':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/40">
            <Flame className="w-3 h-3" /> Xóa vĩnh viễn
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-amber-500" />
            Lịch sử Thao tác & Đăng / Xóa Tin
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Ghi nhật ký chi tiết các hành động đăng tin, cập nhật, chuyển thùng rác và khôi phục từ quản trị viên và người dùng.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Lọc hành động */}
        <div className="md:col-span-8 flex flex-wrap gap-1.5 bg-slate-900/80 p-1.5 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActionFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              actionFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Tất cả ({logs.length})
          </button>
          <button
            onClick={() => setActionFilter('create')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              actionFilter === 'create'
                ? 'bg-emerald-500 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Đăng mới
          </button>
          <button
            onClick={() => setActionFilter('delete')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              actionFilter === 'delete'
                ? 'bg-rose-500 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Đã xóa (Vào rác)
          </button>
          <button
            onClick={() => setActionFilter('restore')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              actionFilter === 'restore'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
          </button>
          <button
            onClick={() => setActionFilter('purge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              actionFilter === 'purge'
                ? 'bg-red-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Xóa vĩnh viễn
          </button>
        </div>

        {/* Ô tìm kiếm */}
        <div className="md:col-span-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo nội dung, người thực hiện..."
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
            Đang tải nhật ký thao tác...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <History className="w-12 h-12 mx-auto stroke-1 text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300">Chưa có nhật ký ghi nhận</p>
            <p className="text-xs text-slate-500 mt-1">Các thao tác đăng tin, xóa tin, khôi phục sẽ tự động hiển thị ở đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Hành động</th>
                  <th className="py-3 px-4">Nội dung / Đối tượng</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.at).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-200">{log.summary}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>Mã: {log.entityId}</span>
                        <span>•</span>
                        <span>Loại: {log.entityType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-300 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {log.actor?.name || 'Hệ thống'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {log.actor?.email || (log.actor?.role === 'admin' ? 'Quản trị viên' : 'Người dùng')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
