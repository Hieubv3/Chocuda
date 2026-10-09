import React, { useEffect, useState } from 'react';
import {
  FileText, ShoppingBag, Mail, UserPlus, Users, Building2, Store,
  Newspaper, RefreshCw, ArrowRight, Inbox, CheckCircle2, TrendingUp,
} from 'lucide-react';

interface OverviewData {
  pendingProperties: number;
  totalProperties: number;
  newOrders: number;
  totalOrders: number;
  newEmails: number;
  newLeads: number;
  totalLeads: number;
  totalUsers: number;
  stores: number;
  reputationPosts: number;
}

interface KpiCard {
  label: string;
  value: number;
  icon: React.ElementType;
  tab: string;
  sub?: string;
  hint: string;
  highlight?: boolean;
}

export default function AdminOverview({ onNavigate }: { onNavigate: (tab: string, subFilter?: string) => void }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (json.ok) setData(json);
      else throw new Error(json.error || 'Lỗi dữ liệu');
      setError('');
    } catch (e: any) {
      setError(e.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cards: KpiCard[] = [
    { label: 'Tin chờ duyệt', value: data?.pendingProperties ?? 0, icon: FileText, tab: 'properties', sub: 'pending', hint: 'BĐS đang chờ duyệt' },
    { label: 'Đơn hàng mới', value: data?.newOrders ?? 0, icon: ShoppingBag, tab: 'orders_mgmt', hint: 'Chưa xác nhận' },
    { label: 'Email mới 24h', value: data?.newEmails ?? 0, icon: Mail, tab: 'email', hint: 'Resend inbox', highlight: true },
    { label: 'Khách hẹn xem nhà', value: data?.newLeads ?? 0, icon: UserPlus, tab: 'leads', hint: 'Lead mới' },
    { label: 'Thành viên', value: data?.totalUsers ?? 0, icon: Users, tab: 'users', hint: 'Tổng tài khoản' },
  ];

  const quickActions = [
    { label: 'Trung Tâm Email', icon: Mail, tab: 'email', desc: 'Gửi & nhận email' },
    { label: '+ Tin Mới', icon: FileText, tab: 'news', desc: 'Đăng tin BĐS' },
    { label: 'Duyệt Tin', icon: CheckCircle2, tab: 'properties', sub: 'pending', desc: 'Duyệt BĐS chờ' },
    { label: 'Đơn Hàng', icon: ShoppingBag, tab: 'orders_mgmt', desc: 'Quản lý đơn' },
    { label: 'Thành Viên', icon: Users, tab: 'users', desc: 'Tài khoản & khách' },
    { label: 'Gian Hàng', icon: Store, tab: 'stores_mgmt', desc: 'Cửa hàng cư dân' },
  ];

  const stats = [
    { label: 'Tổng BĐS', value: data?.totalProperties ?? 0, icon: Building2 },
    { label: 'Gian hàng', value: data?.stores ?? 0, icon: Store },
    { label: 'Bảng tin cộng đồng', value: data?.reputationPosts ?? 0, icon: Newspaper },
    { label: 'Tổng đơn hàng', value: data?.totalOrders ?? 0, icon: ShoppingBag },
    { label: 'Tổng lead', value: data?.totalLeads ?? 0, icon: UserPlus },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-[#102A43]">Tổng Quan</h2>
          <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">
            {loading ? 'Đang tải số liệu…' : error ? 'Không tải được số liệu' : 'Số liệu nhanh toàn hệ thống'}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#102A43] text-white text-xs font-bold hover:bg-[#163A5F] transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error} — bấm "Làm mới" để thử lại.
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onNavigate(c.tab, c.sub)}
            className={`text-left rounded-2xl p-4 border transition hover:shadow-md ${
              c.highlight
                ? 'bg-[#102A43] border-[#163A5F] text-white'
                : 'bg-white border-slate-200 hover:border-[#C66A32]/50'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              c.highlight ? 'bg-[#C66A32]/20 text-[#F5C9A8]' : 'bg-[#C66A32]/10 text-[#C66A32]'
            }`}>
              <c.icon className="w-4.5 h-4.5" />
            </div>
            <div className={`text-2xl font-extrabold leading-none ${c.highlight ? 'text-white' : 'text-[#102A43]'}`}>
              {loading ? '…' : c.value}
            </div>
            <div className={`text-[11px] font-bold mt-1.5 ${c.highlight ? 'text-[#F5C9A8]' : 'text-slate-700'}`}>{c.label}</div>
            <div className={`text-[10px] mt-0.5 ${c.highlight ? 'text-slate-400' : 'text-slate-400'}`}>{c.hint}</div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#C66A32]" />
          <h3 className="text-sm font-extrabold text-[#102A43]">Truy cập nhanh</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => onNavigate(a.tab, a.sub)}
              className="group flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#102A43] hover:border-[#163A5F] p-3 text-left transition"
            >
              <a.icon className="w-4 h-4 text-[#C66A32] group-hover:text-[#F5C9A8]" />
              <span className="text-xs font-bold text-[#102A43] group-hover:text-white">{a.label}</span>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-300">{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#163A5F]/10 text-[#163A5F] flex items-center justify-center shrink-0">
              <s.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-extrabold text-[#102A43] leading-none">{loading ? '…' : s.value}</div>
              <div className="text-[10px] text-slate-500 font-semibold truncate mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Inbox teaser */}
      {!loading && !error && (data?.newEmails ?? 0) > 0 && (
        <button
          onClick={() => onNavigate('email')}
          className="mt-6 w-full flex items-center justify-between rounded-2xl bg-[#C66A32]/10 border border-[#C66A32]/30 px-4 py-3.5 hover:bg-[#C66A32]/15 transition"
        >
          <span className="flex items-center gap-2.5 text-sm font-bold text-[#102A43]">
            <Inbox className="w-4 h-4 text-[#C66A32]" />
            Có {data?.newEmails} email mới trong hộp thư Resend (24h qua)
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-[#C66A32]">
            Mở Trung Tâm Email <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}