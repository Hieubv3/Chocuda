import React, { useEffect, useMemo, useState } from 'react';
import { X, MapPin, Building2, Phone, MessageCircle, Layers } from 'lucide-react';
import {
  DeveloperUnit,
  DeveloperUnitStatus,
  DeveloperUnitTier,
  DeveloperUnitSource,
  DEVELOPER_UNIT_STATUS_LABELS,
  F1Agent
} from '../types';

interface DeveloperUnitsListProps {
  projectId: string;
  projectName: string;
  subdivisionId?: string;
}

const SUB_NAMES: Record<string, string> = {
  'op2-cha-la': 'Chà Là',
  'op2-co-xanh': 'Cỏ Xanh',
  'op2-hai-tang': 'Hải Tăng',
  'op2-san-ho': 'San Hô',
  'op1-san-ho': 'San Hô',
  'op1-ngoc-trai': 'Ngọc Trai'
};

// Map 5 trạng thái thật về 3 nhóm màu của mockup đã duyệt
const STATUS_GROUP: Record<DeveloperUnitStatus, 'avail' | 'hold' | 'sold'> = {
  conhang: 'avail',
  thuhoi: 'avail',
  dabooking: 'hold',
  dacoc: 'hold',
  daban: 'sold'
};

const GROUP_LABEL: Record<'avail' | 'hold' | 'sold', string> = {
  avail: 'Còn hàng',
  hold: 'Giữ chỗ',
  sold: 'Đã bán'
};

export const DeveloperUnitsList: React.FC<DeveloperUnitsListProps> = ({ projectId, projectName, subdivisionId }) => {
  const [units, setUnits] = useState<DeveloperUnit[]>([]);
  const [agents, setAgents] = useState<F1Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const [tier, setTier] = useState<DeveloperUnitTier>('thap');
  const [subId, setSubId] = useState<string>('');
  const [srcFilter, setSrcFilter] = useState<'all' | DeveloperUnitSource>('all');
  const [statusGroupFilter, setStatusGroupFilter] = useState<'all' | 'avail' | 'hold' | 'sold'>('all');
  const [selected, setSelected] = useState<DeveloperUnit | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/developer-units').then(r => r.json()),
      fetch('/api/developer-f1-agents').then(r => r.json())
    ])
      .then(([unitsRes, agentsRes]) => {
        if (cancelled) return;
        const u: DeveloperUnit[] = Array.isArray(unitsRes) ? unitsRes : unitsRes.units || [];
        const a: F1Agent[] = Array.isArray(agentsRes) ? agentsRes : agentsRes.agents || [];
        setUnits(u.filter(x => x.projectId === projectId && (!subdivisionId || x.subdivisionId === subdivisionId)));
        setAgents(a);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [projectId, subdivisionId]);

  const projectUnits = units;

  // Các phân khu của dự án theo tầng hiện tại
  const tierSubs = useMemo(() => {
    const subs = projectUnits.filter(u => u.tier === tier).map(u => u.subdivisionId);
    return Array.from(new Set(subs));
  }, [projectUnits, tier]);

  // Reset phân khu khi đổi tầng
  useEffect(() => {
    if (tierSubs.length > 0) {
      if (!tierSubs.includes(subId)) setSubId(tierSubs[0]);
    } else {
      setSubId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, tierSubs.join('|')]);

  const currentUnits = useMemo(() => {
    return projectUnits
      .filter(u => u.subdivisionId === subId && u.tier === tier && (srcFilter === 'all' || u.source === srcFilter) && (statusGroupFilter === 'all' || STATUS_GROUP[u.status] === statusGroupFilter))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [projectUnits, subId, tier, srcFilter, statusGroupFilter]);

  const subAllUnits = useMemo(() => projectUnits.filter(u => u.subdivisionId === subId && u.tier === tier), [projectUnits, subId, tier]);

  const agentName = (u: DeveloperUnit) => {
    if (u.source !== 'f1' || !u.agentId) return '';
    const a = agents.find(x => x.id === u.agentId);
    return a ? a.name : '';
  };

  const pricePerM2 = (u: DeveloperUnit) => {
    if (!u.area) return '';
    return Math.round((u.price * 1000) / u.area) + ' tr/m²';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center shadow-md animate-pulse">
          <div className="w-8 h-8 mx-auto rounded-full bg-emerald-200 dark:bg-emerald-900" />
          <p className="text-xs font-bold text-slate-400 mt-3">Đang tải quỹ căn chủ đầu tư…</p>
        </div>
      </div>
    );
  }

  // Không có căn nào cho dự án này → không hiển thị section
  if (projectUnits.length === 0) return null;

  const updatedDate = projectUnits.length > 0
    ? new Date(Math.max(...projectUnits.map(u => new Date(u.updatedAt).getTime()))).toLocaleDateString('vi-VN')
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      {/* Section head */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-500" />
          <span>Quỹ Căn Chủ Đầu Tư</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Danh sách căn hộ / nhà phố còn mở bán từ Chủ đầu tư &amp; Đại lý F1 —{' '}
          <b style={{ color: '#047857' }}>xanh lá = CĐT</b>,{' '}
          <b style={{ color: '#1d4ed8' }}>xanh dương = Đại lý F1</b> · Phân biệt{' '}
          <b>cao tầng / thấp tầng</b>
        </p>
      </div>

      {/* quy-can-card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md overflow-hidden">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-800 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between flex-wrap gap-2">
          <div className="font-black text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            🏢 Quỹ căn CĐT &amp; Đại lý F1 — {projectName}
          </div>
          <div className="text-[11px] text-emerald-200 font-bold">
            Cập nhật: {updatedDate || 'hôm nay'} · Giá CĐT + F1
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {/* Controls */}
          <div className="flex items-center gap-2.5 flex-wrap mb-4">
            {/* Tier toggle */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => setTier('thap')}
                className={`px-3.5 py-1.5 rounded-lg text-[11.5px] font-extrabold transition cursor-pointer ${
                  tier === 'thap'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                🏘️ Thấp tầng
              </button>
              <button
                onClick={() => setTier('cao')}
                className={`px-3.5 py-1.5 rounded-lg text-[11.5px] font-extrabold transition cursor-pointer ${
                  tier === 'cao'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                🏢 Cao tầng
              </button>
            </div>

            {/* Sub select */}
            <select
              value={subId}
              onChange={e => setSubId(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 cursor-pointer min-w-[190px]"
            >
              {tierSubs.map(s => (
                <option key={s} value={s}>
                  Phân khu {SUB_NAMES[s] || s}
                </option>
              ))}
            </select>

            {/* Source filter */}
            <div className="flex gap-1.5 flex-wrap">
              {([
                { key: 'all', label: 'Tất cả' },
                { key: 'cdt', label: 'CĐT' },
                { key: 'f1', label: 'Đại lý F1' }
              ] as const).map(f => (
                <button
                  key={f.key}
                  onClick={() => setSrcFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-extrabold transition cursor-pointer ${
                    srcFilter === f.key
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Stats chips — click để lọc nhanh theo trạng thái */}
            <div className="flex gap-1.5 flex-wrap ml-auto">
              {([
                { key: 'all', label: `Tổng: ${subAllUnits.length}` },
                { key: 'avail', label: `Còn hàng: ${subAllUnits.filter(u => STATUS_GROUP[u.status] === 'avail').length}` },
                { key: 'hold', label: `Giữ chỗ: ${subAllUnits.filter(u => STATUS_GROUP[u.status] === 'hold').length}` },
                { key: 'sold', label: `Đã bán: ${subAllUnits.filter(u => STATUS_GROUP[u.status] === 'sold').length}` }
              ] as const).map(c => (
                <button
                  key={c.key}
                  onClick={() => setStatusGroupFilter(c.key)}
                  title={c.key === 'all' ? 'Hiện tất cả căn' : `Chỉ hiện căn ${c.label.split(':')[0]}`}
                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                    statusGroupFilter === c.key
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : c.key === 'avail'
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:border-emerald-500'
                        : c.key === 'hold'
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:border-amber-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                F1: {subAllUnits.filter(u => u.source === 'f1').length}
              </span>
            </div>
          </div>

          {/* DANH SÁCH — full width, không mặt bằng */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide flex justify-between items-center">
              <span>📋 Danh sách quỹ căn — Phân khu {SUB_NAMES[subId] || subId}</span>
              <span className="text-emerald-600 dark:text-emerald-400">{currentUnits.length} căn</span>
            </div>
            <div className="overflow-x-auto">
              {currentUnits.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-400">Không có căn phù hợp</p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                      <th className="px-3.5 py-2.5 font-black">Mã căn</th>
                      <th className="px-3.5 py-2.5 font-black">Loại hình</th>
                      <th className="px-3.5 py-2.5 font-black">Diện tích</th>
                      <th className="px-3.5 py-2.5 font-black">Tầng</th>
                      <th className="px-3.5 py-2.5 font-black">Nguồn</th>
                      <th className="px-3.5 py-2.5 font-black">Trạng thái</th>
                      <th className="px-3.5 py-2.5 font-black text-right">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUnits.map(u => {
                      const g = STATUS_GROUP[u.status];
                      const isF1 = u.source === 'f1';
                      const sold = g === 'sold';
                      return (
                        <tr
                          key={u.id}
                          onClick={() => setSelected(u)}
                          className={`cursor-pointer border-b border-slate-100 dark:border-slate-800 transition hover:bg-emerald-50 dark:hover:bg-emerald-950/40 ${
                            selected?.id === u.id ? 'bg-amber-50 dark:bg-amber-950/40' : ''
                          } ${sold ? 'opacity-60' : ''}`}
                        >
                          <td className="px-3.5 py-2.5">
                            <span className={`font-black font-mono flex items-center gap-1.5 ${sold ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {u.code}
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isF1 ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'}`}>
                                {isF1 ? 'F1' : 'CĐT'}
                              </span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${u.tier === 'cao' ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300' : 'bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300'}`}>
                                {u.tier === 'cao' ? 'Cao' : 'Thấp'}
                              </span>
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 font-bold text-slate-600 dark:text-slate-300">{u.type || '—'}</td>
                          <td className="px-3.5 py-2.5 font-bold text-slate-600 dark:text-slate-300">{u.area ? u.area + ' m²' : '—'}</td>
                          <td className="px-3.5 py-2.5 font-bold text-slate-600 dark:text-slate-300">{u.floor || '—'}</td>
                          <td className="px-3.5 py-2.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isF1 ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'}`}>
                              {isF1 ? (agentName(u) || 'Đại lý F1') : 'Chủ đầu tư'}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              g === 'avail'
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                : g === 'hold'
                                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {GROUP_LABEL[g]}
                            </span>
                          </td>
                          <td className={`px-3.5 py-2.5 text-right font-black whitespace-nowrap ${sold ? 'line-through text-slate-400' : 'text-amber-700 dark:text-amber-400'}`}>
                            {u.priceDisplay}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-3.5 flex-wrap px-1 pt-4 pb-1 text-[10.5px] text-slate-500 dark:text-slate-400 font-bold items-center border-t border-slate-100 dark:border-slate-800 mt-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
              CĐT · Còn hàng
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
              Giữ chỗ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#94a3b8' }} />
              Đã bán
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }} />
              F1 · Còn hàng
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#8b5cf6' }} />
              F1 · Giữ chỗ
            </span>
            <span className="ml-auto text-slate-400 dark:text-slate-500">
              💡 Bấm vào căn để xem chi tiết
            </span>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white px-5 py-4 flex items-start justify-between gap-3">
              <div>
                <div className="font-black font-mono text-2xl">{selected.code}</div>
                <div className="text-[11px] text-emerald-300 font-bold mt-0.5">
                  Phân khu {SUB_NAMES[selected.subdivisionId] || selected.subdivisionId} — {projectName}
                  {selected.source === 'f1'
                    ? ` · 🤝 ${agentName(selected) || 'Đại lý F1'}`
                    : ' · 🏢 Chủ đầu tư'}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-2xl text-amber-600 dark:text-amber-400">
                  {selected.priceDisplay}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {pricePerM2(selected)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Diện tích', value: selected.area ? selected.area + ' m²' : '—' },
                  { label: 'Loại hình', value: selected.type || '—' },
                  { label: 'Tầng', value: selected.floor || '—' },
                  { label: 'Nguồn', value: selected.source === 'f1' ? 'Đại lý F1' : 'Chủ đầu tư' },
                  { label: 'Loại tầng', value: selected.tier === 'cao' ? 'Cao tầng' : 'Thấp tầng' },
                  {
                    label: 'Trạng thái',
                    value: DEVELOPER_UNIT_STATUS_LABELS[selected.status]
                  }
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                      {item.label}
                    </div>
                    <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2.5 mt-4">
                <a
                  href={`tel:0868499929`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition"
                >
                  <Phone className="w-3.5 h-3.5" /> Gọi tư vấn
                </a>
                <a
                  href={`https://zalo.me/0868499929`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Zalo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};