import React, { useEffect, useState } from 'react';
import { ShieldCheck, Phone } from 'lucide-react';

interface BoardMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  note?: string;
}

/**
 * Mục "BAN QUẢN TRỊ CHỢ CƯ DÂN" — hiển thị trên trang "Về chúng tôi".
 * Dữ liệu lấy từ /api/board-members (admin thêm/sửa/xóa trong mục Cài đặt site).
 */
export const BoardMembersSection: React.FC = () => {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/board-members')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d)) setMembers(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || members.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-ink-900 dark:text-white uppercase tracking-wider text-brand-500">
          BAN QUẢN TRỊ CHỢ CƯ DÂN
        </h2>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
          Đội ngũ điều hành &amp; hỗ trợ cư dân Vinhomes toàn hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <div
            key={m.id}
            className="p-5 bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 shadow-sm flex items-start gap-4"
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-brand-500/40 bg-ink-100 dark:bg-ink-700 flex items-center justify-center">
              {m.avatar ? (
                <img loading="lazy" src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black text-brand-500">
                  {(m.name || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-ink-900 dark:text-white text-sm truncate">{m.name}</h4>
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              </div>
              <p className="text-[11px] font-bold text-brand-600 dark:text-brand-400 mt-0.5">{m.role}</p>
              {m.phone && (
                <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {m.phone}
                </p>
              )}
              {m.note && (
                <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-1 line-clamp-2">{m.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardMembersSection;
