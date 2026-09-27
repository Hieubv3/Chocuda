import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Clock, Building2, Wrench, RefreshCw, AlertCircle } from 'lucide-react';
import type { TrashItem } from '../types.ts';

interface UserTrashManagerProps {
  onRefreshParent?: () => void;
}

export const UserTrashManager: React.FC<UserTrashManagerProps> = ({ onRefreshParent }) => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchMyTrash = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('chocudan24h_token');
      const res = await fetch('/api/me/trash', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setTrashItems(data.items || []);
      }
    } catch (err) {
      console.error('Lỗi tải thùng rác của tôi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTrash();
  }, []);

  const handleRestore = async (item: TrashItem) => {
    if (!confirm(`Khôi phục bài đăng "${item.entityLabel}"?`)) return;
    setRestoringId(item.id);
    try {
      const token = localStorage.getItem('chocudan24h_token');
      const res = await fetch(`/api/me/trash/${item.id}/restore`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        // Xóa khỏi danh sách tombstone client nếu có
        try {
          const clientDeleted = JSON.parse(localStorage.getItem('chocudan24h_deleted_ids') || '[]');
          const updated = clientDeleted.filter((id: string) => id !== item.entityId);
          localStorage.setItem('chocudan24h_deleted_ids', JSON.stringify(updated));
        } catch (e) {}

        alert(data.message || 'Khôi phục tin thành công!');
        fetchMyTrash();
        if (onRefreshParent) onRefreshParent();
      } else {
        alert(data.error || 'Khôi phục thất bại.');
      }
    } catch (e) {
      alert('Không thể kết nối máy chủ.');
    } finally {
      setRestoringId(null);
    }
  };

  const calculateDaysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            Lịch sử Xóa Tin & Thùng Rác của bạn
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Các tin đăng BĐS và dịch vụ bạn đã xóa được lưu tạm trong 30 ngày. Bạn có thể khôi phục lại bất kỳ lúc nào trong thời gian này.
          </p>
        </div>
        <button
          onClick={fetchMyTrash}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
          Đang kiểm tra thùng rác...
        </div>
      ) : trashItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <Trash2 className="w-10 h-10 mx-auto stroke-1 text-slate-400 dark:text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Thùng rác trống</p>
          <p className="text-xs text-slate-500 mt-1">Bạn chưa có bài đăng nào bị xóa gần đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trashItems.map((item) => {
            const daysLeft = calculateDaysLeft(item.expiresAt);
            return (
              <div 
                key={item.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start gap-3">
                    {item.entityImage ? (
                      <img
                        src={item.entityImage}
                        alt={item.entityLabel}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700/60"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700/60">
                        {item.entityType === 'property' ? (
                          <Building2 className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <Wrench className="w-6 h-6 text-amber-500" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.entityType === 'property' ? 'Bất động sản' : 'Dịch vụ'}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Còn {daysLeft} ngày
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{item.entityLabel}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Đã xóa: {new Date(item.deletedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 italic">
                    Sau 30 ngày sẽ tự xóa vĩnh viễn
                  </span>
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={restoringId === item.id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Khôi phục lại
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
