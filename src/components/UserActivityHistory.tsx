import React, { useState, useEffect } from 'react';
import { History, PlusCircle, Edit3, Trash2, RotateCcw, RefreshCw, Clock } from 'lucide-react';
import type { ActivityLogEntry } from '../types.ts';

export const UserActivityHistory: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('chocudan24h_token');
      const res = await fetch('/api/me/history', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.items || []);
      }
    } catch (err) {
      console.error('Lỗi tải lịch sử của tôi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHistory();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <PlusCircle className="w-3 h-3" /> Đăng mới
          </span>
        );
      case 'update':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30">
            <Edit3 className="w-3 h-3" /> Cập nhật
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
            <Trash2 className="w-3 h-3" /> Đã xóa
          </span>
        );
      case 'restore':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
            <RotateCcw className="w-3 h-3" /> Khôi phục
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            Lịch sử Đăng tin & Thao tác của bạn
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi toàn bộ các lần bạn đăng tin mới, chỉnh sửa thông tin, hoặc xóa tin trên sàn.
          </p>
        </div>
        <button
          onClick={fetchMyHistory}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
          Đang tải nhật ký...
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <History className="w-10 h-10 mx-auto stroke-1 text-slate-400 dark:text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Chưa có thao tác nào</p>
          <p className="text-xs text-slate-500 mt-1">Các hoạt động đăng tin và xóa tin của bạn sẽ được lưu tại đây.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Hành động</th>
                  <th className="py-3 px-4">Nội dung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.at).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{log.summary}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Mã: {log.entityId}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
